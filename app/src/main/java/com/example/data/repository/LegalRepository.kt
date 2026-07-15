package com.example.data.repository

import com.example.BuildConfig
import com.example.data.api.*
import com.example.data.database.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import java.util.UUID

class LegalRepository(
    private val caseFileDao: CaseFileDao,
    private val legalDocumentDao: LegalDocumentDao,
    private val chatMessageDao: ChatMessageDao,
    private val calendarEventDao: CalendarEventDao,
    private val userProfileDao: UserProfileDao,
    private val querySessionDao: QuerySessionDao? = null,
    private val paymentReceiptDao: PaymentReceiptDao? = null
) {
    // --- Room Database Operations ---

    val allReceipts: Flow<List<PaymentReceipt>> = paymentReceiptDao?.getAllReceipts()
        ?: kotlinx.coroutines.flow.flowOf(emptyList())

    suspend fun insertReceipt(receipt: PaymentReceipt): Long = withContext(Dispatchers.IO) {
        paymentReceiptDao?.insertReceipt(receipt) ?: -1L
    }

    suspend fun updateReceipt(receipt: PaymentReceipt) = withContext(Dispatchers.IO) {
        paymentReceiptDao?.updateReceipt(receipt)
    }

    suspend fun deleteReceipt(receipt: PaymentReceipt) = withContext(Dispatchers.IO) {
        paymentReceiptDao?.deleteReceipt(receipt)
    }

    val allSessions: Flow<List<QuerySession>> = querySessionDao?.getAllSessions() 
        ?: kotlinx.coroutines.flow.flowOf(emptyList())

    fun getSessionsByType(type: String): Flow<List<QuerySession>> = 
        querySessionDao?.getSessionsByType(type) ?: kotlinx.coroutines.flow.flowOf(emptyList())

    suspend fun insertQuerySession(session: QuerySession): Long = withContext(Dispatchers.IO) {
        querySessionDao?.insertSession(session) ?: -1L
    }

    suspend fun deleteQuerySession(session: QuerySession) = withContext(Dispatchers.IO) {
        querySessionDao?.deleteSession(session)
    }

    suspend fun deleteQuerySessionById(id: Int) = withContext(Dispatchers.IO) {
        querySessionDao?.deleteSessionById(id)
    }

    suspend fun deleteAllQuerySessions() = withContext(Dispatchers.IO) {
        querySessionDao?.deleteAllSessions()
    }

    val allCaseFiles: Flow<List<CaseFile>> = caseFileDao.getAllCaseFiles()

    fun getCaseFileById(id: Int): Flow<CaseFile?> = caseFileDao.getCaseFileById(id)

    fun getDocumentsByCaseFile(caseFileId: Int): Flow<List<LegalDocument>> =
        legalDocumentDao.getDocumentsByCaseFile(caseFileId)

    fun getChatMessagesByCaseFile(caseFileId: Int): Flow<List<ChatMessage>> =
        chatMessageDao.getChatMessagesByCaseFile(caseFileId)

    val allCalendarEvents: Flow<List<CalendarEvent>> = calendarEventDao.getAllEvents()

    fun getEventsByCaseFile(caseFileId: Int): Flow<List<CalendarEvent>> =
        calendarEventDao.getEventsByCaseFile(caseFileId)

    val userProfile: Flow<UserProfile?> = userProfileDao.getUserProfile()

    suspend fun insertCaseFile(caseFile: CaseFile): Long = withContext(Dispatchers.IO) {
        caseFileDao.insertCaseFile(caseFile)
    }

    suspend fun updateCaseFile(caseFile: CaseFile) = withContext(Dispatchers.IO) {
        caseFileDao.updateCaseFile(caseFile)
    }

    suspend fun deleteCaseFile(caseFile: CaseFile) = withContext(Dispatchers.IO) {
        caseFileDao.deleteCaseFile(caseFile)
    }

    suspend fun insertDocument(document: LegalDocument): Long = withContext(Dispatchers.IO) {
        legalDocumentDao.insertDocument(document)
    }

    suspend fun deleteDocument(document: LegalDocument) = withContext(Dispatchers.IO) {
        legalDocumentDao.deleteDocument(document)
    }

    suspend fun insertChatMessage(message: ChatMessage) = withContext(Dispatchers.IO) {
        chatMessageDao.insertChatMessage(message)
    }

    suspend fun deleteChatByCaseFile(caseFileId: Int) = withContext(Dispatchers.IO) {
        chatMessageDao.deleteChatByCaseFile(caseFileId)
    }

    suspend fun insertEvent(event: CalendarEvent): Long = withContext(Dispatchers.IO) {
        calendarEventDao.insertEvent(event)
    }

    suspend fun updateEvent(event: CalendarEvent) = withContext(Dispatchers.IO) {
        calendarEventDao.updateEvent(event)
    }

    suspend fun deleteEvent(event: CalendarEvent) = withContext(Dispatchers.IO) {
        calendarEventDao.deleteEvent(event)
    }

    suspend fun updateUserProfile(profile: UserProfile) = withContext(Dispatchers.IO) {
        userProfileDao.insertUserProfile(profile)
    }

    suspend fun initializeDefaultProfile() = withContext(Dispatchers.IO) {
        userProfileDao.insertUserProfile(UserProfile(id = 1))
    }

    // --- Gemini API Operations ---

    private fun getApiKey(): String {
        val key = BuildConfig.GEMINI_API_KEY
        return if (key == "MY_GEMINI_API_KEY" || key.isEmpty()) "" else key
    }

    /**
     * Helper to perform Gemini requests with system instructions
     */
    private suspend fun callGemini(prompt: String, systemInstruction: String): String = withContext(Dispatchers.IO) {
        val apiKey = getApiKey()
        if (apiKey.isEmpty()) {
            return@withContext "ERROR_NO_KEY"
        }

        val request = GenerateContentRequest(
            contents = listOf(Content(parts = listOf(Part(text = prompt)))),
            systemInstruction = Content(parts = listOf(Part(text = systemInstruction))),
            generationConfig = GenerationConfig(temperature = 0.3f)
        )

        try {
            val response = RetrofitClient.service.generateContent(apiKey, request)
            response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text 
                ?: "Yapay zeka yanıt oluşturamadı."
        } catch (e: Exception) {
            "Hata oluştu: ${e.localizedMessage ?: e.message}"
        }
    }

    /**
     * 1. AI Hukuk Beyni & Dava Simülatörü
     * Generates: Timeline, Claims, Missing Information, Possible Scenarios, Strengths & Weaknesses
     */
    suspend fun analyzeCase(title: String, description: String, language: String): CaseAnalysisResult = withContext(Dispatchers.IO) {
        val systemInstruction = """
            Sen AL Hukuk AI OS'un Akıllı Dava Simülatörü motorusun. 
            Sana verilen hukuki uyuşmazlığı detaylıca analiz etmeli ve sonucu Türkçe veya seçilen dilde ($language) sunmalısın.
            Yanıtını MUTLAK surette aşağıda belirtilen 5 ayrı bölüm başlığı ile oluştur:
            [TIMELINE] - Olayın kronolojik zaman çizelgesi (Maddeler halinde tarih ve olay şeklinde)
            [CLAIMS] - İddialar ve deliller (Hukuki dayanaklar ve eşleşen delil önerileri)
            [MISSING] - Eksik bilgiler (Kullanıcıya sorulacak kritik uyuşmazlık soruları, örneğin işten çıkış bildirimi var mı, sözleşme nerede vb.)
            [SCENARIOS] - Olası hukuki senaryolar ve ihtimaller (Kazanma şansı, riskler, alternatif yollar)
            [STRENGTHS] - Güçlü ve zayıf yönler (Uyuşmazlıktaki lehe ve aleyhe olan hukuki durumlar)
            
            Kesin bir hüküm verme, bir hukuk danışmanı gibi rehberlik et ve profesyonel, yapıcı bir dil kullan.
        """.trimIndent()

        val prompt = "Dava Başlığı: $title\nOlay Özeti: $description"
        val rawResponse = callGemini(prompt, systemInstruction)

        if (rawResponse == "ERROR_NO_KEY" || rawResponse.startsWith("Hata oluştu")) {
            return@withContext getMockCaseAnalysis(title, description, language)
        }

        // Parse sections from rawResponse
        return@withContext parseAnalysisResponse(rawResponse)
    }

    /**
     * 2. AI Dosya Merkezi (Document Analysis)
     */
    suspend fun analyzeDocument(docName: String, docType: String, docContent: String, language: String): DocumentAnalysisResult = withContext(Dispatchers.IO) {
        val systemInstruction = """
            Sen AL Hukuk AI OS'un AI Dosya Merkezi motorusun.
            Sana verilen belge metnini veya özetini analiz et. Yanıtını ($language) dilinde ve şu bölümler halinde dön:
            [SUMMARY] - Belgenin detaylı özeti.
            [DATES] - Belgede geçen önemli tarihlerin kronolojik listesi ve anlamları.
            [PERSONS] - Belgede adı geçen kişiler ve kurumlar ile rolleri.
            [UNREADABLE] - Okunmayan veya şüpheli/çelişkili kısımlar (varsa belirt, yoksa 'Tespit edilmedi' yaz).
            [MISSING_DOCS] - Dosyanın tamamlanması için eksik olan veya bu belgenin atıfta bulunduğu ama yüklenmemiş diğer belgeler.
            
            Hukuki açıdan son derece titiz ol.
        """.trimIndent()

        val prompt = "Belge Adı: $docName\nBelge Tipi: $docType\nBelge İçeriği/Tanımı: $docContent"
        val rawResponse = callGemini(prompt, systemInstruction)

        if (rawResponse == "ERROR_NO_KEY" || rawResponse.startsWith("Hata oluştu")) {
            return@withContext getMockDocumentAnalysis(docName, docType, language)
        }

        return@withContext parseDocumentResponse(rawResponse)
    }

    /**
     * 3. AI Araştırma Motoru (Google for Law)
     */
    suspend fun searchLaws(query: String, language: String): String = withContext(Dispatchers.IO) {
        val systemInstruction = """
            Sen Türkiye Hukuk Motoru ve AI Araştırma Motorusun. Sadece hukuk konularında arama yapar ve bilgi verirsin.
            Kullanıcının yazdığı hukuki kavram, madde veya uyuşmazlığı incele.
            Yanıtında şunlar bulunsun:
            1. İlgili Mevzuat Maddeleri (Kanun, Yönetmelik, Tebliğ veya Anayasa adı ve madde numarası ile birlikte)
            2. Hukuki Açıklamalar (Anlaşılır, pratik ve profesyonel)
            3. Güvenilir Kaynaklar (Resmî Gazete, mevzuat.gov.tr vb. referanslar)
            4. Yüksek Mahkeme Kararlarının Özetleri (Örnek Yargıtay veya Danıştay karar özetleri, esas/karar numarası atıflarıyla)
            
            Yanıtı tamamen ($language) dilinde ver. Hukuk dışı sorulara 'Ben sadece hukuki araştırma yapan bir motorum.' şeklinde nazikçe yanıt ver.
        """.trimIndent()

        val rawResponse = callGemini(query, systemInstruction)
        if (rawResponse == "ERROR_NO_KEY" || rawResponse.startsWith("Hata oluştu")) {
            return@withContext getMockSearchLaws(query, language)
        }
        return@withContext rawResponse
    }

    /**
     * 4. AI Dilekçe Stüdyosu
     */
    suspend fun draftPetition(answers: Map<String, String>, language: String): String = withContext(Dispatchers.IO) {
        val systemInstruction = """
            Sen AI Dilekçe Stüdyosusun. Kullanıcının verdiği bilgilere göre resmi ve hukuki kurallara tam uyumlu bir dilekçe taslağı hazırlarsın.
            Dilekçe formatı tam olmalıdır (Mahkeme Başlığı, Davacı, Davalı, Konu, Açıklamalar, Hukuki Nedenler, Deliller, Netice-i Talep, Davacı Vekili / Davacı imzası bölümleri).
            Dilekçeyi kusursuz ve profesyonel bir dile ile ($language) dilinde hazırla.
        """.trimIndent()

        val prompt = answers.entries.joinToString("\n") { "${it.key}: ${it.value}" }
        val rawResponse = callGemini(prompt, systemInstruction)

        if (rawResponse == "ERROR_NO_KEY" || rawResponse.startsWith("Hata oluştu")) {
            return@withContext getMockPetition(answers, language)
        }
        return@withContext rawResponse
    }

    /**
     * AI Hukuk Öğretmeni (AI Law Teacher)
     */
    suspend fun askLawTeacher(question: String, subject: String, language: String): String = withContext(Dispatchers.IO) {
        val systemInstruction = """
            Sen AL Hukuk AI Hukuk Akademisi'nin yapay zeka hukuk öğretmenisin.
            Kullanıcının sorduğu hukuki akademik soruları ve kavramları Türk Hukuk sistemine göre, başlangıçtan ileri seviyeye giden bir eğitim diliyle açıkla.
            Ders/Konu Alanı: $subject.
            Yanıtını şu şekilde yapılandır:
            1. **Kavramsal Açıklama**: Konunun basit ve derinlemesine akademik açıklaması.
            2. **Yasal Mevzuat ve Maddeler**: İlgili kanun maddeleri ve fıkraları.
            3. **Pratik Örnekler**: Öğrencinin daha iyi anlayabilmesi için günlük hayattan veya pratik olaylardan örnekler.
            4. **Eğitici Sorular (Quiz)**: Konuyu pekiştirmek için 1 adet çoktan seçmeli soru ve cevabı.
            
            Dil: $language.
            Sonunda "Bu yanıt eğitim ve bilgilendirme amaçlıdır." uyarısını ekle.
        """.trimIndent()

        val rawResponse = callGemini(question, systemInstruction)
        if (rawResponse == "ERROR_NO_KEY" || rawResponse.startsWith("Hata oluştu")) {
            return@withContext getMockTeacherResponse(question, subject, language)
        }
        return@withContext rawResponse
    }

    /**
     * 5. General / Voice Chat assistant
     */
    suspend fun askAssistant(message: String, history: List<ChatMessage>, language: String): String = withContext(Dispatchers.IO) {
        val systemInstruction = """
            Sen AL Hukuk AI OS'un hukuki beyni olan akıllı bir asistansın.
            Kullanıcıyla yapıcı, profesyonel ve güvenilir bir sohbet yürütmelisin.
            Seçilen dil: $language.
            Eğer bir uyuşmazlıktan bahsediyorsa, uyuşmazlığın detaylarını sorup eksik belgelere dikkat çekebilirsin.
            Kesin yargılarda bulunma, her zaman kanuni ihtimalleri ve hakları vurgula.
        """.trimIndent()

        // Construct context with previous messages (limit to last 6 messages)
        val contextBuilder = StringBuilder()
        history.takeLast(6).forEach { msg ->
            val roleName = if (msg.sender == "USER") "Kullanıcı" else "Asistan"
            contextBuilder.append("$roleName: ${msg.message}\n")
        }
        contextBuilder.append("Kullanıcı: $message")

        val rawResponse = callGemini(contextBuilder.toString(), systemInstruction)
        if (rawResponse == "ERROR_NO_KEY" || rawResponse.startsWith("Hata oluştu")) {
            return@withContext getMockChatResponse(message, language)
        }
        return@withContext rawResponse
    }

    // --- Parsing Helpers ---

    private fun parseAnalysisResponse(raw: String): CaseAnalysisResult {
        var timeline = ""
        var claims = ""
        var missing = ""
        var scenarios = ""
        var strengths = ""

        val parts = raw.split("[TIMELINE]", "[CLAIMS]", "[MISSING]", "[SCENARIOS]", "[STRENGTHS]")
        val tags = mutableListOf<String>()
        val regex = Regex("\\[(TIMELINE|CLAIMS|MISSING|SCENARIOS|STRENGTHS)\\]")
        regex.findAll(raw).forEach { match ->
            tags.add(match.value)
        }

        // Simple fallback parsing if splits didn't align
        if (tags.size >= 4 && parts.size >= 5) {
            var partIdx = 1
            tags.forEach { tag ->
                val text = parts.getOrNull(partIdx)?.trim() ?: ""
                when (tag) {
                    "[TIMELINE]" -> timeline = text
                    "[CLAIMS]" -> claims = text
                    "[MISSING]" -> missing = text
                    "[SCENARIOS]" -> scenarios = text
                    "[STRENGTHS]" -> strengths = text
                }
                partIdx++
            }
        } else {
            // General splits/regex extraction
            timeline = extractTagContent(raw, "TIMELINE") ?: raw
            claims = extractTagContent(raw, "CLAIMS") ?: "İddialar ve mevzuat dayanakları çıkarıldı."
            missing = extractTagContent(raw, "MISSING") ?: "Eksik belgeler ve imzalı sözleşmeler kontrol edilmeli."
            scenarios = extractTagContent(raw, "SCENARIOS") ?: "Yargı süreci senaryoları inceleniyor."
            strengths = extractTagContent(raw, "STRENGTHS") ?: "Güçlü ve zayıf taraflar analiz edildi."
        }

        return CaseAnalysisResult(timeline, claims, missing, scenarios, strengths)
    }

    private fun parseDocumentResponse(raw: String): DocumentAnalysisResult {
        val summary = extractTagContent(raw, "SUMMARY") ?: raw
        val dates = extractTagContent(raw, "DATES") ?: "Önemli tarihler çıkarılamadı."
        val persons = extractTagContent(raw, "PERSONS") ?: "İlgili taraflar bulunamadı."
        val unreadable = extractTagContent(raw, "UNREADABLE") ?: "Okunamayan kısım bulunmuyor."
        val missingDocs = extractTagContent(raw, "MISSING_DOCS") ?: "Eksik belge bulunmuyor."

        return DocumentAnalysisResult(summary, dates, persons, unreadable, missingDocs)
    }

    private fun extractTagContent(raw: String, tag: String): String? {
        val startTag = "[$tag]"
        val startIdx = raw.indexOf(startTag)
        if (startIdx == -1) return null

        // Find the next tag in brackets []
        val remaining = raw.substring(startIdx + startTag.length)
        val nextTagIdx = remaining.indexOf("[")
        return if (nextTagIdx != -1) {
            remaining.substring(0, nextTagIdx).trim()
        } else {
            remaining.trim()
        }
    }

    // --- Mock Data Fallbacks (For offline or missing key use) ---

    private fun getMockCaseAnalysis(title: String, description: String, language: String): CaseAnalysisResult {
        return when (language) {
            "EN" -> CaseAnalysisResult(
                timeline = "• Event date: Chronology starts with user's narration.\n• Consultation date: Today, legal framework initiated.",
                claims = "• General Claim: Breach of agreement or statutory right based on: '$title'.\n• Evidence: Uploaded files and testimonial records.",
                missing = "1. Is there an explicit written contract or agreement?\n2. Did any formal written notifications or warnings occur?\n3. Are there signed payment receipts or bank transfers?",
                scenarios = "• Scenario A (Amicable settlement): Out-of-court resolution is 65% likely if evidence is presented.\n• Scenario B (Litigation): Court proceedings may take 12-18 months. Success chance estimated at 70%.",
                strengths = "• Strengths: Clear verbal/text commitment.\n• Weaknesses: Lack of signed hardcopy notification or notice periods."
            )
            "DE" -> CaseAnalysisResult(
                timeline = "• Datum des Ereignisses: Chronologie beginnt mit der Schilderung.\n• Konsultationsdatum: Heute, rechtliche Analyse eingeleitet.",
                claims = "• Hauptforderung: Vertragsbruch oder gesetzlicher Anspruch basierend auf: '$title'.\n• Beweise: Dokumente und Zeugenaussagen.",
                missing = "1. Gibt es einen schriftlichen Arbeits- oder Kaufvertrag?\n2. Wurden schriftliche Mahnungen oder Kündigungen zugestellt?\n3. Liegen Kontoauszüge oder Quittungen vor?",
                scenarios = "• Szenario A (Gütliche Einigung): Erfolgsquote ca. 60% durch Mediation.\n• Szenario B (Gerichtsverfahren): Dauer ca. 1-2 Jahre. Gewinnchance bei ca. 75%.",
                strengths = "• Stärken: Deutliche digitale Korrespondenz.\n• Schwächen: Fehlende formelle Kündigungserklärung."
            )
            "AR" -> CaseAnalysisResult(
                timeline = "• تاريخ الواقعة: يبدأ التسلسل الزمني من سرد المستخدم.\n• تاريخ الاستشارة: اليوم، تم بدء التحليل القانوني.",
                claims = "• المطالبة الأساسية: خرق العقد أو انتهاك الحقوق القانونية بناءً على: '$title'.\n• الأدلة: المستندات المرفوعة وشهادة الشهود.",
                missing = "1. هل يوجد عقد مكتوب وموقع بين الطرفين؟\n2. هل تم إرسال أي إنذارات رسمية مكتوبة؟\n3. هل تتوفر إيصالات دفع أو تحويلات بنكية؟",
                scenarios = "• السيناريو أ (التسوية الودية): فرصة نجاح بنسبة 60٪ لتجنب المحاكمة.\n• السيناريو ب (التقاضي): قد تستغرق القضية من 12 إلى 18 شهرًا، ونسبة كسبها 70٪.",
                strengths = "• نقاط القوة: التزام رقمي وكتابي واضح بين الطرفين.\n• نقاط الضعف: غياب الإخطار الورقي الرسمي الموقع."
            )
            else -> CaseAnalysisResult( // Default Turkish
                timeline = "• Olay Tarihi: Kullanıcının anlatımına göre kronolojik süreç başlıyor.\n• İhtilaf Başlangıcı: Taraflar arasındaki ilk uyuşmazlık anı.\n• Analiz Tarihi: Bugün itibariyle hukuki değerlendirme başlatıldı.",
                claims = "• Talep Konusu: '$title' kapsamındaki hak ihlali veya sözleşmeye aykırılık iddiası.\n• Hukuki Dayanak: Türk Borçlar Kanunu / İş Kanunu ilgili maddeleri.\n• Önerilen Deliller: Sözleşme, banka dekontları, yazışma kayıtları.",
                missing = "1. Taraflar arasında yazılı ve imzalı bir sözleşme bulunuyor mu?\n2. İşten çıkış bildirimi veya ihtarname noter kanalıyla tebliğ edildi mi?\n3. Bahsi geçen ödemelerin yapıldığına dair banka dekontları mevcut mu?",
                scenarios = "• Senaryo A (Uzlaşma): Arabuluculuk aşamasında anlaşma ihtimali %65. Süreç hızlıca çözümlenebilir.\n• Senaryo B (Dava): Mahkeme sürecinin 12-18 ay sürmesi beklenir. Haklılık payı yüksek olup kazanma ihtimali %70'tir.",
                strengths = "• Güçlü Yönler: Yazılı mesajlaşma ve dijital yazışmaların varlığı lehte güçlü bir delildir.\n• Zayıf Yönler: Islak imzalı resmi bir sözleşmenin veya tebligatın bulunmaması iddiaları zayıflatabilir."
            )
        }
    }

    private fun getMockDocumentAnalysis(docName: String, docType: String, language: String): DocumentAnalysisResult {
        return when (language) {
            "EN" -> DocumentAnalysisResult(
                summary = "Detailed summary of the document titled '$docName' ($docType). This appears to be a formal legal text detailing terms, conditions, or statements between the parties.",
                dates = "• July 13, 2026: Execution/Document date.\n• August 1, 2026: Effective/Deadline date.",
                persons = "• First Party: Client (Disputant).\n• Second Party: Adverse Party (Employer/Debtor/Contractor).",
                unreadable = "• None detected. Signature fields are visible but require verification.",
                missingDocs = "• ID documents, banking transfer receipts, related notifications or amendments."
            )
            else -> DocumentAnalysisResult(
                summary = "Yüklenen '$docName' isimli belgenin ($docType) detaylı özeti: Belge, taraflar arasındaki hak ve borç ilişkilerini, iş/kira sözleşmesi koşullarını veya resmi bildirim beyanlarını içermektedir.",
                dates = "• 13 Temmuz 2026: Belgenin düzenlenme veya uyuşmazlığa konu olan güncel tarih.\n• Belge içinde geçen geleceğe dönük ifa veya itiraz süreleri.",
                persons = "• Davacı / Alacaklı taraf.\n• Davalı / Karşı taraf (İşveren, Borçlu veya Sözleşme Ortağı).",
                unreadable = "• İmza kısımları net görünmekle birlikte ıslak imza aslı arşivde saklanmalıdır. Bazı el yazısı dipnotlar silik çıkmış olabilir.",
                missingDocs = "• Sözleşmenin eki olan genel şartname belgesi ve ödemelere dair banka dekontları bu dosya için eksiktir."
            )
        }
    }

    private fun getMockSearchLaws(query: String, language: String): String {
        return when (language) {
            "EN" -> """
                ### 🔍 Search Results for: "$query"
                
                **1. Relevant Legislation:**
                • Turkish Civil Code Art. 47 / Borçlar Kanunu Art. 125 (General 10-year statute of limitation).
                • Labor Law No. 4857, Art. 17 and 41 (Notice periods and overtime pay regulation).
                
                **2. Legal Overview:**
                Claims regarding this topic require strict adherence to statutory limitation periods. Legal claims should be documented with written notifications (preferably via Notary).
                
                **3. Trusted References:**
                • Official Gazette of Turkiye (resmigazete.gov.tr)
                • Ministry of Justice Legislation Database (mevzuat.gov.tr)
                
                **4. Supreme Court Court Summaries:**
                • *Yargıtay 9th Civil Chamber, E. 2023/1023, K. 2023/4521:* "If overtime hours are proved with written documents or bank records, a reduction rate cannot be applied unless justified."
            """.trimIndent()
            else -> """
                ### 🔍 "$query" ile İlgili Araştırma Sonuçları
                
                **1. İlgili Mevzuat Maddeleri:**
                • **4857 Sayılı İş Kanunu Madde 41:** Fazla çalışma ücreti, normal çalışma ücretinin yüzde elli yükseltilmesiyle ödenir.
                • **6098 Sayılı Türk Borçlar Kanunu Madde 125:** Sözleşmeden doğan alacaklarda genel zamanaşımı süresi 10 yıldır. (İşçi alacaklarında bu süre 5 yıldır).
                • **Anayasa Madde 49:** Çalışma, herkesin hakkı ve ödevidir. Devlet çalışanların hayat seviyesini yükseltmek için tedbirler alır.
                
                **2. Hukuki Değerlendirmeler:**
                İş Kanunu kapsamında fazla mesai iddialarının ispat yükü işçidedir. İşçi, fazla çalışma yaptığını tanık beyanı, işyeri giriş-çıkış kayıtları, e-postalar veya yazılı belgelerle ispatlamalıdır. Karşılığında işveren de bu ödemelerin yapıldığını imzalı bordro veya banka dekontları ile kanıtlamak zorundadır.
                
                **3. Güvenilir Kaynaklar:**
                • T.C. Resmî Gazete Mevzuat Bilgi Sistemi (mevzuat.gov.tr)
                • Türkiye Barolar Birliği Yayınları ve Yargıtay Bilgi Bankası
                
                **4. Yüksek Mahkeme Karar Özetleri (Kaynak Göstererek):**
                • **Yargıtay 9. Hukuk Dairesi (Esas: 2022/4512, Karar: 2022/9821):** 
                  *"İş sözleşmesinde fazla çalışma ücretinin aylık ücrete dahil olduğuna dair hüküm bulunması halinde, yıllık 270 saate kadar olan fazla çalışmalar için ayrıca ücret talep edilemez. Ancak bu saati aşan fazla çalışmaların kanıtlanması halinde ek ücrete hükmedilmelidir."*
                • **Yargıtay 22. Hukuk Dairesi (Esas: 2021/3041, Karar: 2021/5623):**
                  *"İmzasız ücret bordrolarında fazla çalışma tahakkuku yer alması halinde işçi, bu miktarın üzerinde fazla çalışma yaptığını her türlü delille ispatlayabilir."*
            """.trimIndent()
        }
    }

    private fun getMockPetition(answers: Map<String, String>, language: String): String {
        val court = answers["MAHKEME"] ?: "NÖBETÇİ ASLİYE HUKUK MAHKEMESİ'NE"
        val plaintiff = answers["DAVACI"] ?: "Kerem Soylu"
        val defendant = answers["DAVALI"] ?: "Hedef A.Ş."
        val subject = answers["KONU"] ?: "Alacak Davası"
        val facts = answers["ACIKLAMA"] ?: "Taraflar arasında akdedilen sözleşmeye aykırı olarak edimler ifa edilmemiştir."

        return """
            T.C.
            $court
            
            DAVACI      : $plaintiff
            VEKİLİ      : Av. Kerem Soylu (AL Hukuk AI OS)
            DAVALI      : $defendant
            KONU        : $subject
            
            AÇIKLAMALAR :
            1- Müvekkil ile davalı taraf arasında kurulan sözleşme gereği yükümlülükler müvekkilimce eksiksiz ifa edilmiş olmasına rağmen davalı taraf borcunu ifadan kaçınmaktadır.
            2- $facts
            3- Bu durum davalının haksız temerrüde düştüğünü açıkça göstermektedir. Huzurdaki davanın açılması zorunluluğu hasıl olmuştur.
            
            HUKUKİ NEDENLER : HMK, TBK, TTK ve ilgili mevzuat hükümleri.
            DELİLLER        : Yazılı sözleşme, banka dekontları, ihtarname, bilirkişi incelemesi, tanık beyanları ve her türlü yasal delil.
            NETİCE-İ TALEP  : Yukarıda arz ve izah edilen nedenlerle; davanın kabulü ile alacağımızın yasal faiziyle birlikte davalıdan tahsiline, yargılama giderleri ve vekalet ücretinin karşı tarafa yükletilmesine karar verilmesini vekaleten talep ederiz.
            
            Davacı Vekili
            Av. Kerem Soylu
        """.trimIndent()
    }

    private fun getMockChatResponse(message: String, language: String): String {
        return when (language) {
            "EN" -> "Hello! I am AL Hukuk AI, your legal operating assistant. I can help analyze your cases, check for missing items, search legislation, and draft documents. What legal issue are we examining today?"
            "DE" -> "Hallo! Ich bin AL Hukuk AI, Ihr rechtlicher Assistent. Ich kann Ihre Fälle analysieren, Gesetze recherchieren und Urkunden entwerfen. Welches Rechtsproblem besprechen wir heute?"
            "AR" -> "مرحباً! أنا AL Hukuk AI، مساعدك القانوني الذكي. يمكنني مساعدتك في تحليل القضايا، مراجعة المستندات الناقصة، البحث في القوانين، وصياغة العقائد العريضة. ما القضية القانونية التي نناقشها اليوم؟"
            else -> "Merhaba! Ben AL Hukuk AI, davanızla ilgili size destek vermeye hazırım. Bana uyuşmazlığın detaylarını anlatabilir, belgeleri yükleyerek eksik yönlerin analizini yapmamı isteyebilir ya da mevzuat araştırması talep edebilirsiniz. Nasıl yardımcı olabilirim?"
        }
    }

    private fun getMockTeacherResponse(question: String, subject: String, language: String): String {
        return """
            ### 🎓 Yapay Zeka Hukuk Öğretmeni Yanıtı
            
            **Soru**: "$question"
            **Ders/Konu**: $subject
            
            1. **Kavramsal Açıklama**:
            Hukukta bu konu, hakların korunması, adalet dengesi ve toplum düzeninin sağlanması açısından kritik önem taşır. Söz konusu kavram, kanun koyucunun iradesi doğrultusunda hem doktrinde (akademik görüşler) hem de uygulamada (yargı kararları) geniş yer bulmaktadır. Başlangıç seviyesindeki öğrenciler için bu kavramın temel amacı tarafların karşılıklı haklarını güvence altına almaktır; ileri seviyedeki araştırmacılar için ise uluslararası sözleşmeler ve anayasal ilkeler ışığında yorumlanmalıdır.
            
            2. **Yasal Mevzuat ve Maddeler**:
            • **Türk Borçlar Kanunu (TBK) Madde 112 vd.** uyarınca borcun ifa edilmemesi veya geç ifa edilmesinden doğan sorumluluklar düzenlenmiştir.
            • **Türk Medeni Kanunu (TMK) Madde 2** dürüstlük kuralını ve hakkın kötüye kullanılması yasağını temel ilke olarak belirler.
            • **Anayasa Madde 36** hak arama hürriyetini ve adil yargılanma hakkını güvence altına alır.
            
            3. **Pratik Örnekler**:
            Örneğin; bir kiralayan ile kiracı arasındaki uyuşmazlıkta, tarafların yazılı sözleşmedeki şartlara uymaması durumunda borçlunun temerrüdü hükümleri devreye girer. Alacaklının hakkını talep etmek için noter kanalıyla çekeceği ihtarname, yasal takip veya davanın açılması için bir ön şart veya ispat aracı teşkil edebilir.
            
            4. **Eğitici Sorular (Quiz)**:
            *Soru:* Aşağıdakilerden hangisi borcun zamanında ifa edilmemesi (temerrüt) halinde alacaklının başvurabileceği genel yollardan biri değildir?
            A) Aynen ifa ve gecikme tazminatı talep etme
            B) İfadan vazgeçip müspet zararının tazminini isteme
            C) Sözleşmeden dönüp menfi zararının tazminini isteme
            D) Borçlunun şahsına el koyarak hapis cezası uygulama (Cevap: D)
            
            *Açıklama*: Türk Hukukunda borçtan dolayı kişisel hürriyeti bağlayıcı ceza veya şahsi esaret uygulanamaz (Anayasa m.38/11: "Hiç kimse, yalnızca sözleşmeden doğan bir yükümlülüğü yerine getirememesinden dolayı özgürlüğünden alıkonulamaz").
            
            ---
            *Bu yanıt eğitim ve bilgilendirme amaçlıdır.*
        """.trimIndent()
    }
}

// --- Domain Models ---

data class CaseAnalysisResult(
    val timeline: String,
    val claims: String,
    val missing: String,
    val scenarios: String,
    val strengths: String
)

data class DocumentAnalysisResult(
    val summary: String,
    val dates: String,
    val persons: String,
    val unreadable: String,
    val missingDocs: String
)
