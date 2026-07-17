package com.example.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.data.database.CalendarEvent
import com.example.data.database.CaseFile
import com.example.data.database.ChatMessage
import com.example.data.database.LegalDocument
import com.example.data.database.UserProfile
import com.example.data.database.QuerySession
import com.example.data.database.PaymentReceipt
import com.example.data.repository.CaseAnalysisResult
import com.example.data.repository.DocumentAnalysisResult
import com.example.data.repository.LegalRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

sealed interface UiState<out T> {
    object Idle : UiState<Nothing>
    object Loading : UiState<Nothing>
    data class Success<out T>(val data: T) : UiState<T>
    data class Error(val message: String) : UiState<Nothing>
}

class LegalViewModel(private val repository: LegalRepository) : ViewModel() {

    // --- State Observables ---

    val caseFiles: StateFlow<List<CaseFile>> = repository.allCaseFiles
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _selectedCaseFileId = MutableStateFlow<Int?>(null)
    val selectedCaseFileId: StateFlow<Int?> = _selectedCaseFileId.asStateFlow()

    val currentCaseFile: StateFlow<CaseFile?> = _selectedCaseFileId
        .flatMapLatest { id ->
            if (id == null) flowOf(null)
            else repository.getCaseFileById(id)
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val currentDocuments: StateFlow<List<LegalDocument>> = _selectedCaseFileId
        .flatMapLatest { id ->
            if (id == null) flowOf(emptyList())
            else repository.getDocumentsByCaseFile(id)
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val currentChatMessages: StateFlow<List<ChatMessage>> = _selectedCaseFileId
        .flatMapLatest { id ->
            if (id == null) flowOf(emptyList())
            else repository.getChatMessagesByCaseFile(id)
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val calendarEvents: StateFlow<List<CalendarEvent>> = repository.allCalendarEvents
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val userProfile: StateFlow<UserProfile?> = repository.userProfile
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val paymentReceipts: StateFlow<List<PaymentReceipt>> = repository.allReceipts
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // --- Screen UI States ---

    private val _caseAnalysisState = MutableStateFlow<UiState<CaseAnalysisResult>>(UiState.Idle)
    val caseAnalysisState: StateFlow<UiState<CaseAnalysisResult>> = _caseAnalysisState.asStateFlow()

    private val _docAnalysisState = MutableStateFlow<UiState<DocumentAnalysisResult>>(UiState.Idle)
    val docAnalysisState: StateFlow<UiState<DocumentAnalysisResult>> = _docAnalysisState.asStateFlow()

    private val _searchState = MutableStateFlow<UiState<String>>(UiState.Idle)
    val searchState: StateFlow<UiState<String>> = _searchState.asStateFlow()

    private val _petitionState = MutableStateFlow<UiState<String>>(UiState.Idle)
    val petitionState: StateFlow<UiState<String>> = _petitionState.asStateFlow()

    private val _teacherState = MutableStateFlow<UiState<String>>(UiState.Idle)
    val teacherState: StateFlow<UiState<String>> = _teacherState.asStateFlow()

    private val _voiceState = MutableStateFlow<Boolean>(false) // Is listening/speaking
    val voiceState: StateFlow<Boolean> = _voiceState.asStateFlow()

    private val _voiceText = MutableStateFlow<String>("")
    val voiceText: StateFlow<String> = _voiceText.asStateFlow()

    private val _voiceResponse = MutableStateFlow<String>("")
    val voiceResponse: StateFlow<String> = _voiceResponse.asStateFlow()

    // --- Saved Query Sessions Flows ---
    val searchSessions: StateFlow<List<QuerySession>> = repository.getSessionsByType("SEARCH")
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val petitionSessions: StateFlow<List<QuerySession>> = repository.getSessionsByType("PETITION")
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun restoreSearchSession(session: QuerySession) {
        _searchState.value = UiState.Success(session.response)
    }

    fun restorePetitionSession(session: QuerySession) {
        _petitionState.value = UiState.Success(session.response)
    }

    fun deleteQuerySession(session: QuerySession) {
        viewModelScope.launch {
            repository.deleteQuerySession(session)
        }
    }

    // --- Yapay Zeka Hukuk Danışmanı (ChatGPT Chat Engine) ---
    val chatSessions: StateFlow<List<QuerySession>> = repository.getSessionsByType("CHAT_ASSISTANT")
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _selectedChatSessionId = MutableStateFlow<Int?>(null)
    val selectedChatSessionId: StateFlow<Int?> = _selectedChatSessionId.asStateFlow()

    private val _activeChatMessages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val activeChatMessages: StateFlow<List<ChatMessage>> = _activeChatMessages.asStateFlow()

    private val _chatIsTyping = MutableStateFlow(false)
    val chatIsTyping: StateFlow<Boolean> = _chatIsTyping.asStateFlow()

    data class ChatSessionMeta(
        val title: String,
        val folder: String = "Genel",
        val isPinned: Boolean = false
    )

    fun parseSessionMeta(queryStr: String): ChatSessionMeta {
        return try {
            if (queryStr.contains("###META###")) {
                val parts = queryStr.split("###META###")
                ChatSessionMeta(
                    title = parts.getOrNull(0) ?: "Yeni Sohbet",
                    folder = parts.getOrNull(1) ?: "Genel",
                    isPinned = parts.getOrNull(2)?.toBoolean() ?: false
                )
            } else {
                ChatSessionMeta(title = queryStr)
            }
        } catch (e: Exception) {
            ChatSessionMeta(title = queryStr)
        }
    }

    fun formatSessionMeta(meta: ChatSessionMeta): String {
        return "${meta.title}###META###${meta.folder}###META###${meta.isPinned}"
    }

    fun serializeChatMessages(messages: List<ChatMessage>): String {
        return messages.joinToString("###MSG_SEP###") { msg ->
            "${msg.sender}###SENDER_SEP###${msg.message}###SENDER_SEP###${msg.timestamp}"
        }
    }

    fun deserializeChatMessages(serialized: String): List<ChatMessage> {
        if (serialized.isEmpty()) return emptyList()
        return try {
            serialized.split("###MSG_SEP###").mapNotNull { part ->
                val tokens = part.split("###SENDER_SEP###")
                if (tokens.size >= 2) {
                    val sender = tokens[0]
                    val message = tokens[1]
                    val timestamp = tokens.getOrNull(2)?.toLongOrNull() ?: System.currentTimeMillis()
                    ChatMessage(caseFileId = 0, sender = sender, message = message, timestamp = timestamp)
                } else null
            }
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun startNewChat(title: String, folder: String = "Genel") {
        viewModelScope.launch {
            val meta = ChatSessionMeta(title = title, folder = folder, isPinned = false)
            val initialMsgs = listOf(
                ChatMessage(
                    caseFileId = 0,
                    sender = "AI",
                    message = "Merhaba! Ben AL Hukuk AI, yapay zekâ destekli hukuk danışmanınızım.\n\n" +
                            "Size yardımcı olabilmem için lütfen uyuşmazlığınızın hangi hukuk dalı ile ilgili olduğunu seçin:\n" +
                            "• İş Hukuku\n• Kira Hukuku\n• Aile Hukuku\n• Ceza Hukuku\n• Tüketici Hukuku\n" +
                            "• Borçlar Hukuku\n• Ticaret Hukuku\n• KVKK ve diğer mevzuatlar...\n\n" +
                            "Olayınızı anlatın, yasal haklarınızı ve emsal kararları birlikte inceleyelim."
                )
            )
            val newSession = QuerySession(
                type = "CHAT_ASSISTANT",
                query = formatSessionMeta(meta),
                response = serializeChatMessages(initialMsgs)
            )
            val id = repository.insertQuerySession(newSession)
            _selectedChatSessionId.value = id.toInt()
            _activeChatMessages.value = initialMsgs
        }
    }

    fun selectChatSession(id: Int?) {
        _selectedChatSessionId.value = id
        if (id == null) {
            _activeChatMessages.value = emptyList()
            return
        }
        viewModelScope.launch {
            val session = chatSessions.value.find { it.id == id }
            if (session != null) {
                _activeChatMessages.value = deserializeChatMessages(session.response)
            }
        }
    }

    fun renameChatSession(id: Int, newTitle: String) {
        viewModelScope.launch {
            val session = chatSessions.value.find { it.id == id } ?: return@launch
            val oldMeta = parseSessionMeta(session.query)
            val newMeta = oldMeta.copy(title = newTitle)
            repository.insertQuerySession(session.copy(query = formatSessionMeta(newMeta)))
        }
    }

    fun togglePinSession(id: Int) {
        viewModelScope.launch {
            val session = chatSessions.value.find { it.id == id } ?: return@launch
            val oldMeta = parseSessionMeta(session.query)
            val newMeta = oldMeta.copy(isPinned = !oldMeta.isPinned)
            repository.insertQuerySession(session.copy(query = formatSessionMeta(newMeta)))
        }
    }

    fun updateSessionFolder(id: Int, folderName: String) {
        viewModelScope.launch {
            val session = chatSessions.value.find { it.id == id } ?: return@launch
            val oldMeta = parseSessionMeta(session.query)
            val newMeta = oldMeta.copy(folder = folderName)
            repository.insertQuerySession(session.copy(query = formatSessionMeta(newMeta)))
        }
    }

    fun deleteChatSession(id: Int) {
        viewModelScope.launch {
            val session = chatSessions.value.find { it.id == id } ?: return@launch
            repository.deleteQuerySession(session)
            if (_selectedChatSessionId.value == id) {
                _selectedChatSessionId.value = null
                _activeChatMessages.value = emptyList()
            }
        }
    }

    fun editChatMessage(index: Int, newText: String) {
        val sessionId = _selectedChatSessionId.value ?: return
        viewModelScope.launch {
            val currentMsgs = _activeChatMessages.value.toMutableList()
            if (index in currentMsgs.indices) {
                currentMsgs[index] = currentMsgs[index].copy(message = newText)
                _activeChatMessages.value = currentMsgs
                
                // Save updated list
                val session = chatSessions.value.find { it.id == sessionId } ?: return@launch
                repository.insertQuerySession(session.copy(response = serializeChatMessages(currentMsgs)))
                
                // If user edited their message, regenerate AI response
                if (currentMsgs[index].sender == "USER" && index + 1 < currentMsgs.size) {
                    regenerateChatResponse(index)
                }
            }
        }
    }

    fun regenerateChatResponse(userMsgIndex: Int) {
        val sessionId = _selectedChatSessionId.value ?: return
        val currentLang = userProfile.value?.language ?: "TR"
        viewModelScope.launch {
            val currentMsgs = _activeChatMessages.value.toMutableList()
            if (userMsgIndex in currentMsgs.indices && currentMsgs[userMsgIndex].sender == "USER") {
                _chatIsTyping.value = true
                
                // Chop everything after the user message
                val messagesToKeep = currentMsgs.take(userMsgIndex + 1).toMutableList()
                _activeChatMessages.value = messagesToKeep
                
                val userMsg = messagesToKeep[userMsgIndex].message
                val history = messagesToKeep.take(userMsgIndex).map { 
                    com.example.data.database.ChatMessage(caseFileId = 0, sender = it.sender, message = it.message, timestamp = it.timestamp)
                }
                
                val aiResponse = repository.askAssistant(userMsg, history, currentLang)
                val finalResponse = ensureLawDisclaimer(aiResponse)
                
                messagesToKeep.add(ChatMessage(caseFileId = 0, sender = "AI", message = finalResponse))
                _activeChatMessages.value = messagesToKeep
                _chatIsTyping.value = false
                
                val session = chatSessions.value.find { it.id == sessionId } ?: return@launch
                // Auto title generation if it's the first query
                val meta = parseSessionMeta(session.query)
                val updatedMeta = if (meta.title == "Yeni Sohbet" || meta.title.startsWith("Sohbet #")) {
                    meta.copy(title = if (userMsg.length > 25) userMsg.take(25) + "..." else userMsg)
                } else meta
                
                repository.insertQuerySession(
                    session.copy(
                        query = formatSessionMeta(updatedMeta),
                        response = serializeChatMessages(messagesToKeep)
                    )
                )
            }
        }
    }

    private fun ensureLawDisclaimer(text: String): String {
        val disclaimer = "\n\n⚠️ *Bu değerlendirme bilgilendirme amaçlıdır, hukuki danışmanlık yerine geçmez.*"
        return if (text.contains("bilgilendirme amaçlıdır") || text.contains("avukatın yerini tutmaz")) {
            text
        } else {
            text + disclaimer
        }
    }

    fun sendChatAssistantMessage(text: String) {
        val sessionId = _selectedChatSessionId.value ?: return
        val currentLang = userProfile.value?.language ?: "TR"
        viewModelScope.launch {
            val currentMsgs = _activeChatMessages.value.toMutableList()
            
            // Add user message
            val userMsg = ChatMessage(caseFileId = 0, sender = "USER", message = text)
            currentMsgs.add(userMsg)
            _activeChatMessages.value = currentMsgs
            _chatIsTyping.value = true
            
            // Save immediately to persist user text
            val session = chatSessions.value.find { it.id == sessionId } ?: return@launch
            repository.insertQuerySession(session.copy(response = serializeChatMessages(currentMsgs)))

            val history = currentMsgs.dropLast(1).map { 
                com.example.data.database.ChatMessage(caseFileId = 0, sender = it.sender, message = it.message, timestamp = it.timestamp)
            }

            // Ask Gemini with extremely detailed legal assistant context
            val legalAssistancePrompt = """
                Kullanıcı sorusu: $text
                
                Bu soruyu Türkiye Cumhuriyeti Mevzuatına uygun olarak derinlemesine incele.
                Soruyla doğrudan veya dolaylı ilgili olan şu kanunları göz önünde bulundur:
                Anayasa, Türk Medeni Kanunu (TMK), Türk Borçlar Kanunu (TBK), Türk Ceza Kanunu (TCK), İcra ve İflas Kanunu (İİK), Hukuk Muhakemeleri Kanunu (HMK), Ceza Muhakemesi Kanunu (CMK), İdari Yargılama Usulü Kanunu (İYUK), Türk Ticaret Kanunu (TTK), Kişisel Verilerin Korunması Kanunu (KVKK), İş Kanunu, Tüketici Kanunu, Kira Hukuku, Vergi Mevzuatı, Sigorta Mevzuatı, Aile Hukuku, Miras Hukuku, Trafik Hukuku.
                
                Cevabını şu alt başlıklarla yapılandır:
                1. **🔍 HUKUKİ NİTELENDİRME VE MEVZUAT**: Sorunun hangi hukuk dalına girdiğini, ilgili kanun adını ve madde numaralarını sade bir dille açıklayarak yaz.
                2. **⚖️ EMSAL MAHKEME KARARLARI**: Bu uyuşmazlıkla ilgili yüksek mahkemelerin (Yargıtay, Danıştay, Anayasa Mahkemesi veya AİHM) verebileceği kararların özetlerini ve emsal içtihat yaklaşımlarını ekle.
                3. **🛡️ ALTERNATİF ÇÖZÜM YOLLARI VE RİSKLER**: Arabuluculuk, sulh, ihtarnameler, dava süreçleri, hak düşürücü süreler ve zamanaşımı gibi karşılaşılabilecek riskler ve alternatif çözüm yollarını karşılaştır.
                4. **📋 EKSİK BELGELER VE DELİLLER**: Hak iddiasını ispatlamak için hangi belgelere, delillere (dekont, WhatsApp yazışması, tanık, sözleşme, noter bildirimi vb.) ihtiyaç duyulduğunu ve davanın kanıt gücünü artıracak detayları listele.
                5. **📅 SÜREÇ ADIMLARI**: Başvurudan karara kadar tahmini yargılama aşamalarını ve atılması gereken adımları özetle.
                
                Cevabını son derece profesyonel, yapıcı, güven veren bir tonda yaz.
                En sonda MUTLAKA şu uyarıyı göster: "Bu değerlendirme bilgilendirme amaçlıdır, hukuki danışmanlık yerine geçmez."
            """.trimIndent()

            val rawResponse = repository.askAssistant(legalAssistancePrompt, history, currentLang)
            val finalResponse = ensureLawDisclaimer(rawResponse)
            
            currentMsgs.add(ChatMessage(caseFileId = 0, sender = "AI", message = finalResponse))
            _activeChatMessages.value = currentMsgs
            _chatIsTyping.value = false
            
            // Auto-rename chat title if it is "Yeni Sohbet"
            val meta = parseSessionMeta(session.query)
            val updatedMeta = if (meta.title == "Yeni Sohbet" || meta.title.startsWith("Sohbet #")) {
                meta.copy(title = if (text.length > 25) text.take(25) + "..." else text)
            } else meta
            
            repository.insertQuerySession(
                session.copy(
                    query = formatSessionMeta(updatedMeta),
                    response = serializeChatMessages(currentMsgs)
                )
            )
        }
    }

    init {
        // Initialize user profile
        viewModelScope.launch {
            repository.userProfile.first() ?: run {
                repository.initializeDefaultProfile()
            }
            
            // Check if there are no cases
            // We intentionally do not populate mock case data anymore for a clean production state.
        }
    }

    fun createCaseFile(title: String, clientName: String, description: String) {
        viewModelScope.launch {
            val count = caseFiles.value.size
            if (count >= 10) {
                // Limit to 10 case files as requested by user
                return@launch
            }
            val newId = repository.insertCaseFile(
                CaseFile(
                    title = title,
                    clientName = clientName,
                    description = description
                )
            )
            _selectedCaseFileId.value = newId.toInt()
        }
    }

    fun selectCaseFile(id: Int?) {
        _selectedCaseFileId.value = id
    }

    fun updateCaseNotes(notes: String) {
        val current = currentCaseFile.value ?: return
        viewModelScope.launch {
            repository.updateCaseFile(current.copy(notes = notes))
        }
    }

    fun updateCaseFileStatus(status: String) {
        val current = currentCaseFile.value ?: return
        viewModelScope.launch {
            repository.updateCaseFile(current.copy(status = status))
        }
    }

    fun deleteCaseFile(caseFile: CaseFile) {
        viewModelScope.launch {
            repository.deleteCaseFile(caseFile)
            if (_selectedCaseFileId.value == caseFile.id) {
                _selectedCaseFileId.value = null
            }
        }
    }

    // --- Document Actions ---

    fun addDocument(name: String, type: String, content: String) {
        val caseFileId = _selectedCaseFileId.value ?: return
        val currentLang = userProfile.value?.language ?: "TR"
        viewModelScope.launch {
            _docAnalysisState.value = UiState.Loading
            
            // Insert document first
            val newDocId = repository.insertDocument(
                LegalDocument(
                    caseFileId = caseFileId,
                    name = name,
                    type = type,
                    uploadDate = "13.07.2026",
                    content = content
                )
            )

            // Analyze via Gemini
            val result = repository.analyzeDocument(name, type, content, currentLang)
            
            // Update document with analysis summary
            val unreadable = result.unreadable.lowercase().contains("yes") || 
                             result.unreadable.lowercase().contains("evet") || 
                             result.unreadable.lowercase().contains("tespit") && !result.unreadable.lowercase().contains("bulunmuyor")

            repository.insertDocument(
                LegalDocument(
                    id = newDocId.toInt(),
                    caseFileId = caseFileId,
                    name = name,
                    type = type,
                    uploadDate = "13.07.2026",
                    summary = result.summary,
                    content = content,
                    isUnreadable = unreadable,
                    missingRequiredDocs = result.missingDocs
                )
            )

            _docAnalysisState.value = UiState.Success(result)
        }
    }

    fun removeDocument(document: LegalDocument) {
        viewModelScope.launch {
            repository.deleteDocument(document)
        }
    }

    // --- Chat Actions ---

    fun sendChatMessage(text: String) {
        val caseFileId = _selectedCaseFileId.value ?: return
        val currentLang = userProfile.value?.language ?: "TR"
        viewModelScope.launch {
            // Save User message
            val userMsg = ChatMessage(caseFileId = caseFileId, sender = "USER", message = text)
            repository.insertChatMessage(userMsg)

            // Save Temporary Assistant loading message or trigger API
            val history = repository.getChatMessagesByCaseFile(caseFileId).first()
            val responseText = repository.askAssistant(text, history, currentLang)

            val aiMsg = ChatMessage(caseFileId = caseFileId, sender = "AI", message = responseText)
            repository.insertChatMessage(aiMsg)
        }
    }

    fun clearChat() {
        val caseFileId = _selectedCaseFileId.value ?: return
        viewModelScope.launch {
            repository.deleteChatByCaseFile(caseFileId)
        }
    }

    // --- Case Simulator Action ---

    fun runCaseSimulation() {
        val current = currentCaseFile.value ?: return
        val currentLang = userProfile.value?.language ?: "TR"
        viewModelScope.launch {
            _caseAnalysisState.value = UiState.Loading
            try {
                val result = repository.analyzeCase(current.title, current.description, currentLang)
                
                // Persist the simulation analysis results into the CaseFile
                repository.updateCaseFile(
                    current.copy(
                        timelineJson = result.timeline,
                        claimsEvidenceJson = result.claims,
                        missingInfoJson = result.missing,
                        scenariosJson = result.scenarios,
                        strengthsWeaknessesJson = result.strengths
                    )
                )
                
                _caseAnalysisState.value = UiState.Success(result)
            } catch (e: Exception) {
                _caseAnalysisState.value = UiState.Error(e.localizedMessage ?: "Analysis failed")
            }
        }
    }

    // --- Calendar Actions ---

    fun addCalendarEvent(title: String, type: String, date: String, description: String) {
        val caseFileId = _selectedCaseFileId.value ?: 0
        viewModelScope.launch {
            repository.insertEvent(
                CalendarEvent(
                    caseFileId = caseFileId,
                    title = title,
                    type = type,
                    date = date,
                    description = description
                )
            )
        }
    }

    fun toggleEventCompleted(event: CalendarEvent) {
        viewModelScope.launch {
            repository.updateEvent(event.copy(isCompleted = !event.isCompleted))
        }
    }

    fun deleteEvent(event: CalendarEvent) {
        viewModelScope.launch {
            repository.deleteEvent(event)
        }
    }

    // --- Legal Research Actions ---

    fun searchLegalMevzuat(query: String) {
        val currentLang = userProfile.value?.language ?: "TR"
        viewModelScope.launch {
            _searchState.value = UiState.Loading
            try {
                val result = repository.searchLaws(query, currentLang)
                _searchState.value = UiState.Success(result)
                // Persist query session
                repository.insertQuerySession(
                    QuerySession(
                        type = "SEARCH",
                        query = query,
                        response = result
                    )
                )
            } catch (e: Exception) {
                _searchState.value = UiState.Error(e.localizedMessage ?: "Search failed")
            }
        }
    }

    // --- Petition Drafting Actions ---

    fun draftLegalPetition(answers: Map<String, String>) {
        if (answers.isEmpty()) {
            _petitionState.value = UiState.Idle
            return
        }
        val currentLang = userProfile.value?.language ?: "TR"
        viewModelScope.launch {
            _petitionState.value = UiState.Loading
            try {
                val result = repository.draftPetition(answers, currentLang)
                _petitionState.value = UiState.Success(result)
                // Persist petition session
                val summary = answers["court"]?.let { court ->
                    val pl = answers["plaintiff"] ?: ""
                    val df = answers["defendant"] ?: ""
                    val sub = answers["subject"] ?: ""
                    "$court - $pl vs $df ($sub)"
                } ?: answers["subject"] ?: "Dilekçe Taslağı"
                
                repository.insertQuerySession(
                    QuerySession(
                        type = "PETITION",
                        query = summary,
                        response = result
                    )
                )
            } catch (e: Exception) {
                _petitionState.value = UiState.Error(e.localizedMessage ?: "Petition drafting failed")
            }
        }
    }

    // --- Voice Assistant Actions ---

    fun startVoiceAssistant() {
        _voiceState.value = true
        _voiceText.value = ""
        _voiceResponse.value = ""
    }

    fun stopVoiceAssistant() {
        _voiceState.value = false
    }

    fun submitVoiceQuery(text: String) {
        _voiceText.value = text
        val currentLang = userProfile.value?.language ?: "TR"
        viewModelScope.launch {
            _voiceResponse.value = "..."
            // Send to assistant
            val currentChat = currentCaseFile.value?.let { 
                repository.getChatMessagesByCaseFile(it.id).first() 
            } ?: emptyList()
            
            val response = repository.askAssistant(text, currentChat, currentLang)
            _voiceResponse.value = response
        }
    }

    // --- User Profile / Settings Actions ---

    fun updateLanguage(lang: String) {
        viewModelScope.launch {
            val current = userProfile.value ?: UserProfile()
            repository.updateUserProfile(current.copy(language = lang))
        }
    }

    fun setUserName(name: String) {
        viewModelScope.launch {
            val current = userProfile.value ?: UserProfile()
            repository.updateUserProfile(current.copy(userName = name))
        }
    }

    fun triggerPremiumUpgrade() {
        viewModelScope.launch {
            val current = userProfile.value ?: UserProfile()
            repository.updateUserProfile(current.copy(isPremium = true))
        }
    }

    fun updateAcademyScore(score: Int) {
        viewModelScope.launch {
            val current = userProfile.value ?: UserProfile()
            repository.updateUserProfile(current.copy(academyScore = score))
        }
    }

    fun askLawTeacher(question: String, subject: String) {
        if (question.isBlank()) return
        val currentLang = userProfile.value?.language ?: "TR"
        viewModelScope.launch {
            _teacherState.value = UiState.Loading
            try {
                val response = repository.askLawTeacher(question, subject, currentLang)
                _teacherState.value = UiState.Success(response)
            } catch (e: Exception) {
                _teacherState.value = UiState.Error(e.localizedMessage ?: "Hata oluştu.")
            }
        }
    }

    fun clearTeacherState() {
        _teacherState.value = UiState.Idle
    }

    // --- Payment Management & Admin Settings Configuration ---

    fun submitPaymentReceipt(senderName: String, email: String, iban: String, amount: String, date: String, receiptFileName: String) {
        viewModelScope.launch {
            val receipt = PaymentReceipt(
                senderName = senderName,
                email = email,
                iban = iban,
                amount = amount,
                date = date,
                receiptFileName = receiptFileName,
                status = "PENDING"
            )
            repository.insertReceipt(receipt)
        }
    }

    fun approvePaymentReceipt(receipt: PaymentReceipt) {
        viewModelScope.launch {
            repository.updateReceipt(receipt.copy(status = "APPROVED"))
            // Also upgrade matching user to Premium
            val current = userProfile.value ?: UserProfile()
            if (receipt.email.trim().lowercase() == current.email.trim().lowercase()) {
                repository.updateUserProfile(current.copy(isPremium = true))
            }
        }
    }

    fun rejectPaymentReceipt(receipt: PaymentReceipt) {
        viewModelScope.launch {
            repository.updateReceipt(receipt.copy(status = "REJECTED"))
        }
    }

    fun updateSystemConfig(iban: String, monthlyPrice: String, annualPrice: String) {
        viewModelScope.launch {
            val current = userProfile.value ?: UserProfile()
            repository.updateUserProfile(
                current.copy(
                    systemIban = iban,
                    premiumPriceMonthly = monthlyPrice,
                    premiumPriceAnnual = annualPrice
                )
            )
        }
    }

    fun toggleAdminRole() {
        viewModelScope.launch {
            val current = userProfile.value ?: UserProfile()
            repository.updateUserProfile(current.copy(isAdmin = !current.isAdmin))
        }
    }

    fun togglePremiumRole() {
        viewModelScope.launch {
            val current = userProfile.value ?: UserProfile()
            repository.updateUserProfile(current.copy(isPremium = !current.isPremium))
        }
    }
}

// --- Factory ---

class LegalViewModelFactory(private val repository: LegalRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(LegalViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return LegalViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
