package com.example.ui.screens

import android.content.ClipData
import androidx.compose.ui.text.TextStyle
import android.content.ClipboardManager
import android.content.Context
import android.speech.tts.TextToSpeech
import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.database.ChatMessage
import com.example.data.database.QuerySession
import com.example.ui.theme.*
import com.example.ui.viewmodel.LegalViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LegalAssistantChatScreen(viewModel: LegalViewModel) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    
    // Core State Flows from ViewModel
    val chatSessions by viewModel.chatSessions.collectAsStateWithLifecycle()
    val selectedChatSessionId by viewModel.selectedChatSessionId.collectAsStateWithLifecycle()
    val activeChatMessages by viewModel.activeChatMessages.collectAsStateWithLifecycle()
    val chatIsTyping by viewModel.chatIsTyping.collectAsStateWithLifecycle()
    
    // Local Screen UI states
    var showHistorySidebar by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }
    var chatSearchText by remember { mutableStateOf("") } // to search within history
    var showRenameDialog by remember { mutableStateOf<QuerySession?>(null) }
    var renameInput by remember { mutableStateOf("") }
    
    // Audio / Voice Dictation Simulator States
    var showVoiceDialog by remember { mutableStateOf(false) }
    var voiceProgressText by remember { mutableStateOf("Sizi dinliyorum...") }
    var voiceIsListening by remember { mutableStateOf(false) }
    
    // OCR / Document Scanning Simulator States
    var showOcrOverlay by remember { mutableStateOf(false) }
    var ocrLogText by remember { mutableStateOf("") }
    var ocrProgress by remember { mutableStateOf(0.0f) }
    var activeDocumentName by remember { mutableStateOf("") }
    var showOcrReportPanel by remember { mutableStateOf(false) }
    
    // Text To Speech (TTS) Manager
    var tts: TextToSpeech? by remember { mutableStateOf(null) }
    var isTtsPlaying by remember { mutableStateOf(false) }
    
    DisposableEffect(Unit) {
        tts = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                tts?.language = Locale("tr", "TR")
            }
        }
        onDispose {
            tts?.stop()
            tts?.shutdown()
        }
    }
    
    fun speakText(text: String) {
        if (isTtsPlaying) {
            tts?.stop()
            isTtsPlaying = false
        } else {
            val cleanText = text.replace(Regex("[*#`_⚠️📋🔍⚙️⚖️]"), "")
            tts?.speak(cleanText, TextToSpeech.QUEUE_FLUSH, null, "LegalChatId")
            isTtsPlaying = true
        }
    }
    
    // Inline message edit states
    var editingMessageIndex by remember { mutableStateOf<Int?>(null) }
    var editingMessageText by remember { mutableStateOf("") }
    
    // Like/Dislike state mapping
    val messageLikes = remember { mutableStateMapOf<Int, Boolean>() } // Index to true (liked) or false (disliked)
    
    // Auto-scroll list state
    val listState = rememberLazyListState()
    LaunchedEffect(activeChatMessages.size, chatIsTyping) {
        if (activeChatMessages.isNotEmpty()) {
            listState.animateScrollToItem(activeChatMessages.size)
        }
    }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MidnightObsidian)
    ) {
        Row(modifier = Modifier.fillMaxSize()) {
            // Sliding Sidebar Drawer for Chat History and Settings (Responsive desktop-friendly layout)
            AnimatedVisibility(
                visible = showHistorySidebar,
                enter = slideInHorizontally(animationSpec = spring()) { -it },
                exit = slideOutHorizontally(animationSpec = spring()) { -it }
            ) {
                Surface(
                    modifier = Modifier
                        .width(280.dp)
                        .fillMaxHeight()
                        .border(1.dp, SlateGrey)
                        .background(CharcoalNavy),
                    color = CharcoalNavy
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "💬 Sohbetlerim",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = GoldLight
                            )
                            IconButton(onClick = { showHistorySidebar = false }) {
                                Icon(Icons.Default.Close, contentDescription = "Kapat", tint = SoftGrey)
                            }
                        }
                        
                        Button(
                            onClick = {
                                viewModel.startNewChat("Sohbet #${System.currentTimeMillis() % 10000}")
                                showHistorySidebar = false
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                                .testTag("btn_new_chat"),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, tint = MidnightObsidian)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Yeni Sohbet Başlat", color = MidnightObsidian, fontWeight = FontWeight.Bold)
                        }
                        
                        // History Search Bar
                        OutlinedTextField(
                            value = chatSearchText,
                            onValueChange = { chatSearchText = it },
                            placeholder = { Text("Sohbetlerde ara...", fontSize = 11.sp, color = SoftGrey) },
                            textStyle = TextStyle(fontSize = 12.sp, color = IvoryWhite),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = GoldDark,
                                unfocusedBorderColor = SlateGrey,
                                focusedContainerColor = MidnightObsidian.copy(alpha = 0.5f),
                                unfocusedContainerColor = MidnightObsidian.copy(alpha = 0.5f)
                            ),
                            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = SoftGrey, modifier = Modifier.size(16.dp)) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp),
                            shape = RoundedCornerShape(8.dp)
                        )
                        
                        // Scrollable chat sessions list with foldering
                        val filteredSessions = chatSessions.filter { session ->
                            val meta = viewModel.parseSessionMeta(session.query)
                            chatSearchText.isEmpty() || meta.title.lowercase().contains(chatSearchText.lowercase())
                        }
                        
                        LazyColumn(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            // Separator: Pinned chats
                            val pinned = filteredSessions.filter { viewModel.parseSessionMeta(it.query).isPinned }
                            val unpinned = filteredSessions.filter { !viewModel.parseSessionMeta(it.query).isPinned }
                            
                            if (pinned.isNotEmpty()) {
                                item {
                                    Text("📌 Sabitlenmiş Sohbetler", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = GoldLight, modifier = Modifier.padding(vertical = 4.dp))
                                }
                                items(pinned) { session ->
                                    ChatSessionItemRow(
                                        session = session,
                                        viewModel = viewModel,
                                        isSelected = selectedChatSessionId == session.id,
                                        onSelect = {
                                            viewModel.selectChatSession(session.id)
                                            showHistorySidebar = false
                                        },
                                        onRename = {
                                            showRenameDialog = session
                                            renameInput = viewModel.parseSessionMeta(session.query).title
                                        }
                                    )
                                }
                            }
                            
                            if (unpinned.isNotEmpty()) {
                                item {
                                    Text("💬 Tüm Sohbetler", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = SoftGrey, modifier = Modifier.padding(vertical = 4.dp))
                                }
                                
                                // Group by folder category
                                val groupedByFolder = unpinned.groupBy { viewModel.parseSessionMeta(it.query).folder }
                                groupedByFolder.forEach { (folder, sessions) ->
                                    item {
                                        Text(
                                            text = "📂 $folder",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Medium,
                                            color = AmberAccent.copy(alpha = 0.8f),
                                            modifier = Modifier.padding(start = 6.dp, top = 6.dp, bottom = 2.dp)
                                        )
                                    }
                                    items(sessions) { session ->
                                        ChatSessionItemRow(
                                            session = session,
                                            viewModel = viewModel,
                                            isSelected = selectedChatSessionId == session.id,
                                            onSelect = {
                                                viewModel.selectChatSession(session.id)
                                                showHistorySidebar = false
                                            },
                                            onRename = {
                                                showRenameDialog = session
                                                renameInput = viewModel.parseSessionMeta(session.query).title
                                            }
                                        )
                                    }
                                }
                            }
                            
                            if (filteredSessions.isEmpty()) {
                                item {
                                    Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                                        Text("Geçmiş sohbet bulunmuyor.", fontSize = 12.sp, color = SoftGrey)
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // Main Chat Screen Content
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
            ) {
                // Inline header action row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(CharcoalNavy)
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = { showHistorySidebar = !showHistorySidebar },
                            modifier = Modifier.testTag("btn_sidebar_toggle")
                        ) {
                            Icon(Icons.Default.Menu, contentDescription = "Sohbetlerim", tint = GoldDark)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        
                        val activeTitle = selectedChatSessionId?.let { id ->
                            chatSessions.find { it.id == id }?.let { viewModel.parseSessionMeta(it.query).title }
                        } ?: "AL Yapay Zekâ Hukuk Danışmanı"
                        
                        Column {
                            Text(
                                text = activeTitle,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = GoldLight,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                modifier = Modifier.widthIn(max = 180.dp)
                            )
                            Text(
                                text = "Çevrimiçi • T.C. Mevzuat Motoru",
                                fontSize = 10.sp,
                                color = SuccessGreen,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                    
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = {
                            viewModel.startNewChat("Sohbet #${System.currentTimeMillis() % 10000}")
                        }) {
                            Icon(Icons.Default.EditNote, contentDescription = "Yeni Sohbet", tint = GoldDark)
                        }
                        
                        // Dropdown menu for categorizing current session if active
                        if (selectedChatSessionId != null) {
                            var showFolderMenu by remember { mutableStateOf(false) }
                            Box {
                                IconButton(onClick = { showFolderMenu = true }) {
                                    Icon(Icons.Default.FolderOpen, contentDescription = "Klasör Taşı", tint = GoldDark)
                                }
                                DropdownMenu(
                                    expanded = showFolderMenu,
                                    onDismissRequest = { showFolderMenu = false },
                                    modifier = Modifier.background(CharcoalNavy)
                                ) {
                                    listOf("Genel", "İş Hukuku", "Kira Hukuku", "Aile Hukuku", "Ceza Hukuku").forEach { folder ->
                                        DropdownMenuItem(
                                            text = { Text(folder, color = IvoryWhite, fontSize = 13.sp) },
                                            onClick = {
                                                selectedChatSessionId?.let { id ->
                                                    viewModel.updateSessionFolder(id, folder)
                                                }
                                                showFolderMenu = false
                                            }
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
                
                // Main Message Body View / Onboarding view
                if (selectedChatSessionId == null) {
                    // Premium Onboarding Flow
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                            .verticalScroll(rememberScrollState()),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(20.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(72.dp)
                                    .drawBehind {
                                        drawCircle(
                                            color = GoldDark,
                                            radius = size.minDimension / 2,
                                            style = Stroke(width = 4f)
                                        )
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Gavel,
                                    contentDescription = null,
                                    tint = GoldDark,
                                    modifier = Modifier.size(36.dp)
                                )
                            }
                            
                            Text(
                                text = "Hukuki Yapay Zekâ Danışmanı",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = GoldLight
                            )
                            
                            Text(
                                text = "Türkiye Cumhuriyeti kanunları, medeni kanun, borçlar, icra, ceza ve iş kanunları başta olmak üzere emsal Yargıtay/Danıştay içtihatlarıyla uyuşmazlığınızı anında tahlil edin.",
                                fontSize = 13.sp,
                                color = SoftGrey,
                                modifier = Modifier.padding(horizontal = 12.dp),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                lineHeight = 18.sp
                            )
                            
                            Text(
                                text = "Hızlı Başlamak İçin Hukuk Dalı Seçin:",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = GoldDark,
                                modifier = Modifier.align(Alignment.Start)
                            )
                            
                            // Visual Specialty Chips Grid
                            val branches = listOf(
                                "İş Hukuku" to "Haftalık 45 saati aşan fazla çalışmalarım için kıdem tazminatı ve hakları alabilir miyim?",
                                "Kira Hukuku" to "Mülk sahibi kiramı 3 kat artırarak beni tahliye etmeye zorluyor, haklarım nelerdir?",
                                "Aile Hukuku" to "Anlaşmalı boşanmada mal paylaşımı zamanaşımı ve protokol kuralları nelerdir?",
                                "Ceza Hukuku" to "Haksız yere uğradığım suçlamalara karşı savunma delilleri nasıl toplanmalı?",
                                "Tüketici Hukuku" to "Ayıplı mal iadesi talebi için tüketici hakem heyetine başvuru sınırları nelerdir?"
                            )
                            
                            Column(
                                modifier = Modifier.fillMaxWidth(),
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                branches.forEach { (branchName, samplePrompt) ->
                                    Card(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clickable {
                                                viewModel.startNewChat(branchName, branchName)
                                                coroutineScope.launch {
                                                    delay(600)
                                                    viewModel.sendChatAssistantMessage(samplePrompt)
                                                }
                                            },
                                        colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                                        border = BorderStroke(0.5.dp, GoldDark.copy(alpha = 0.3f))
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(14.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(Icons.Default.Scale, contentDescription = null, tint = GoldDark, modifier = Modifier.size(18.dp))
                                            Spacer(modifier = Modifier.width(12.dp))
                                            Column {
                                                Text(branchName, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                                Text(samplePrompt, fontSize = 11.sp, color = SoftGrey, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                            }
                                        }
                                    }
                                }
                            }
                            
                            // OCR scanning hub starter card
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        activeDocumentName = "Örnek_Sözleşme.pdf"
                                        showOcrOverlay = true
                                        ocrProgress = 0.0f
                                        ocrLogText = "Dosya sisteme yükleniyor..."
                                        coroutineScope.launch {
                                            delay(1000)
                                            ocrProgress = 0.3f
                                            ocrLogText = "OCR taraması başlatıldı. Belge metni çıkarılıyor..."
                                            delay(1200)
                                            ocrProgress = 0.7f
                                            ocrLogText = "İmza blokları, taahhütler ve süreler analiz ediliyor..."
                                            delay(1000)
                                            ocrProgress = 1.0f
                                            ocrLogText = "Belge analizi başarıyla tamamlandı!"
                                            delay(500)
                                            showOcrOverlay = false
                                            showOcrReportPanel = true
                                        }
                                    },
                                colors = CardDefaults.cardColors(containerColor = SlateGrey.copy(alpha = 0.6f)),
                                border = BorderStroke(1.dp, AmberAccent.copy(alpha = 0.4f))
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.CameraAlt, contentDescription = null, tint = AmberAccent, modifier = Modifier.size(24.dp))
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column {
                                        Text("Belge Metni Tara (OCR)", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                        Text("Sözleşme, İhtarname, Dilekçeyi kameradan taratıp analiz raporu oluşturun.", fontSize = 11.sp, color = SoftGrey)
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // Chat Messages Feed View
                    LazyColumn(
                        state = listState,
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        contentPadding = PaddingValues(top = 12.dp, bottom = 12.dp)
                    ) {
                        itemsIndexed(activeChatMessages) { index, msg ->
                            val isUser = msg.sender == "USER"
                            
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
                            ) {
                                Card(
                                    modifier = Modifier
                                        .widthIn(max = 290.dp)
                                        .testTag(if (isUser) "user_message_card" else "ai_message_card"),
                                    colors = CardDefaults.cardColors(
                                        containerColor = if (isUser) SlateGrey else CharcoalNavy
                                    ),
                                    shape = RoundedCornerShape(
                                        topStart = 16.dp,
                                        topEnd = 16.dp,
                                        bottomStart = if (isUser) 16.dp else 4.dp,
                                        bottomEnd = if (isUser) 4.dp else 16.dp
                                    ),
                                    border = BorderStroke(0.5.dp, if (isUser) GoldDark.copy(alpha = 0.4f) else SlateGrey)
                                ) {
                                    Column(modifier = Modifier.padding(12.dp)) {
                                        // Header row with speaker & actions
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Icon(
                                                    imageVector = if (isUser) Icons.Default.Person else Icons.Default.SmartToy,
                                                    contentDescription = null,
                                                    tint = if (isUser) GoldLight else GoldDark,
                                                    modifier = Modifier.size(14.dp)
                                                )
                                                Spacer(modifier = Modifier.width(4.dp))
                                                Text(
                                                    text = if (isUser) "Siz" else "Hukuk AI",
                                                    fontSize = 11.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = if (isUser) GoldLight else GoldDark
                                                )
                                            }
                                            
                                            // Action items
                                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                                if (!isUser) {
                                                    // Text To Speech
                                                    IconButton(
                                                        onClick = { speakText(msg.message) },
                                                        modifier = Modifier.size(24.dp)
                                                    ) {
                                                        Icon(
                                                            imageVector = Icons.Default.VolumeUp,
                                                            contentDescription = "Sesli Oku",
                                                            tint = SoftGrey,
                                                            modifier = Modifier.size(14.dp)
                                                        )
                                                    }
                                                }
                                                
                                                // Copy button
                                                IconButton(
                                                    onClick = {
                                                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                                        val clip = ClipData.newPlainText("LegalMsg", msg.message)
                                                        clipboard.setPrimaryClip(clip)
                                                        Toast.makeText(context, "Metin kopyalandı!", Toast.LENGTH_SHORT).show()
                                                    },
                                                    modifier = Modifier.size(24.dp)
                                                ) {
                                                    Icon(
                                                        imageVector = Icons.Default.ContentCopy,
                                                        contentDescription = "Kopyala",
                                                        tint = SoftGrey,
                                                        modifier = Modifier.size(14.dp)
                                                    )
                                                }
                                                
                                                if (isUser) {
                                                    // Edit icon
                                                    IconButton(
                                                        onClick = {
                                                            editingMessageIndex = index
                                                            editingMessageText = msg.message
                                                        },
                                                        modifier = Modifier.size(24.dp)
                                                    ) {
                                                        Icon(
                                                            imageVector = Icons.Default.Edit,
                                                            contentDescription = "Düzenle",
                                                            tint = SoftGrey,
                                                            modifier = Modifier.size(14.dp)
                                                        )
                                                    }
                                                    
                                                    // Regenerate button
                                                    IconButton(
                                                        onClick = { viewModel.regenerateChatResponse(index) },
                                                        modifier = Modifier.size(24.dp)
                                                    ) {
                                                        Icon(
                                                            imageVector = Icons.Default.Refresh,
                                                            contentDescription = "Yenile",
                                                            tint = SoftGrey,
                                                            modifier = Modifier.size(14.dp)
                                                        )
                                                    }
                                                }
                                            }
                                        }
                                        
                                        Spacer(modifier = Modifier.height(6.dp))
                                        
                                        // Inline Editor if toggled
                                        if (editingMessageIndex == index) {
                                            Column(modifier = Modifier.fillMaxWidth()) {
                                                OutlinedTextField(
                                                    value = editingMessageText,
                                                    onValueChange = { editingMessageText = it },
                                                    textStyle = TextStyle(fontSize = 12.sp, color = IvoryWhite),
                                                    modifier = Modifier.fillMaxWidth(),
                                                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey)
                                                )
                                                Spacer(modifier = Modifier.height(4.dp))
                                                Row(
                                                    modifier = Modifier.fillMaxWidth(),
                                                    horizontalArrangement = Arrangement.End,
                                                    verticalAlignment = Alignment.CenterVertically
                                                ) {
                                                    TextButton(onClick = { editingMessageIndex = null }) {
                                                        Text("İptal", fontSize = 11.sp, color = SoftGrey)
                                                    }
                                                    Button(
                                                        onClick = {
                                                            viewModel.editChatMessage(index, editingMessageText)
                                                            editingMessageIndex = null
                                                        },
                                                        colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                                                        modifier = Modifier.height(28.dp),
                                                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                                                    ) {
                                                        Text("Kaydet", fontSize = 11.sp, color = MidnightObsidian)
                                                    }
                                                }
                                            }
                                        } else {
                                            Text(
                                                text = msg.message,
                                                fontSize = 13.sp,
                                                color = IvoryWhite,
                                                lineHeight = 18.sp
                                            )
                                        }
                                        
                                        // Feedback buttons for AI answers
                                        if (!isUser && editingMessageIndex != index) {
                                            Spacer(modifier = Modifier.height(8.dp))
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.End,
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                val feedback = messageLikes[index]
                                                IconButton(
                                                    onClick = {
                                                        messageLikes[index] = true
                                                        Toast.makeText(context, "Beğendiniz! Teşekkür ederiz.", Toast.LENGTH_SHORT).show()
                                                    },
                                                    modifier = Modifier.size(24.dp)
                                                ) {
                                                    Icon(
                                                        imageVector = Icons.Default.ThumbUp,
                                                        contentDescription = "Beğen",
                                                        tint = if (feedback == true) SuccessGreen else SoftGrey,
                                                        modifier = Modifier.size(13.dp)
                                                    )
                                                }
                                                IconButton(
                                                    onClick = {
                                                        messageLikes[index] = false
                                                        Toast.makeText(context, "Geri bildiriminiz iletildi.", Toast.LENGTH_SHORT).show()
                                                    },
                                                    modifier = Modifier.size(24.dp)
                                                ) {
                                                    Icon(
                                                        imageVector = Icons.Default.ThumbDown,
                                                        contentDescription = "Beğenme",
                                                        tint = if (feedback == false) ErrorRed else SoftGrey,
                                                        modifier = Modifier.size(13.dp)
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Loading state / typing indicator
                        if (chatIsTyping) {
                            item {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.Start
                                ) {
                                    Card(
                                        modifier = Modifier.widthIn(max = 240.dp),
                                        colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                                        shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp, bottomStart = 4.dp, bottomEnd = 16.dp)
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(14.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                                        ) {
                                            Icon(Icons.Default.Scale, contentDescription = null, tint = GoldDark, modifier = Modifier.size(14.dp))
                                            Text("Hukuk Yapay Zekâsı yazıyor", fontSize = 11.sp, color = SoftGrey, fontWeight = FontWeight.Bold)
                                            Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                                                val transition = rememberInfiniteTransition()
                                                val scale1 by transition.animateFloat(0.3f, 1f, infiniteRepeatable(tween(600), RepeatMode.Reverse))
                                                val scale2 by transition.animateFloat(0.3f, 1f, infiniteRepeatable(tween(600, delayMillis = 200), RepeatMode.Reverse))
                                                val scale3 by transition.animateFloat(0.3f, 1f, infiniteRepeatable(tween(600, delayMillis = 400), RepeatMode.Reverse))
                                                
                                                Box(modifier = Modifier.size(4.dp).clip(CircleShape).background(GoldDark.copy(alpha = scale1)))
                                                Box(modifier = Modifier.size(4.dp).clip(CircleShape).background(GoldDark.copy(alpha = scale2)))
                                                Box(modifier = Modifier.size(4.dp).clip(CircleShape).background(GoldDark.copy(alpha = scale3)))
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                // OCR analysis details panel if document scan was requested
                AnimatedVisibility(visible = showOcrReportPanel) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp)
                            .border(1.dp, AmberAccent.copy(alpha = 0.4f), RoundedCornerShape(12.dp)),
                        colors = CardDefaults.cardColors(containerColor = CharcoalNavy)
                    ) {
                        var ocrTab by remember { mutableStateOf("ozet") }
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = SuccessGreen, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Hukuki Analiz Raporu: $activeDocumentName", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                }
                                IconButton(onClick = { showOcrReportPanel = false }, modifier = Modifier.size(24.dp)) {
                                    Icon(Icons.Default.Close, contentDescription = "Kapat", tint = SoftGrey)
                                }
                            }
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            ScrollableTabRow(
                                selectedTabIndex = when(ocrTab) { "ozet" -> 0; "sozlesme" -> 1; "delil" -> 2; "imza" -> 3; else -> 4 },
                                containerColor = Color.Transparent,
                                contentColor = GoldDark,
                                edgePadding = 0.dp
                            ) {
                                Tab(selected = ocrTab == "ozet", onClick = { ocrTab = "ozet" }) { Text("Özet", fontSize = 11.sp, modifier = Modifier.padding(6.dp), color = if(ocrTab == "ozet") GoldDark else SoftGrey) }
                                Tab(selected = ocrTab == "sozlesme", onClick = { ocrTab = "sozlesme" }) { Text("Sözleşme & Dilekçe", fontSize = 11.sp, modifier = Modifier.padding(6.dp), color = if(ocrTab == "sozlesme") GoldDark else SoftGrey) }
                                Tab(selected = ocrTab == "delil", onClick = { ocrTab = "delil" }) { Text("Delil Analizi", fontSize = 11.sp, modifier = Modifier.padding(6.dp), color = if(ocrTab == "delil") GoldDark else SoftGrey) }
                                Tab(selected = ocrTab == "imza", onClick = { ocrTab = "imza" }) { Text("İmza & Islak", fontSize = 11.sp, modifier = Modifier.padding(6.dp), color = if(ocrTab == "imza") GoldDark else SoftGrey) }
                                Tab(selected = ocrTab == "karsilastir", onClick = { ocrTab = "karsilastir" }) { Text("Evrak Karşılaştır", fontSize = 11.sp, modifier = Modifier.padding(6.dp), color = if(ocrTab == "karsilastir") GoldDark else SoftGrey) }
                            }
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            Box(modifier = Modifier.heightIn(max = 120.dp).verticalScroll(rememberScrollState())) {
                                when(ocrTab) {
                                    "ozet" -> Text(
                                        text = "Yüklenen belge, taraflar arasındaki asgari ücret feshini ve fazla çalışma bildirimlerini içeren kira/hizmet akdidir.\n" +
                                                "• Belge Tarihi: 15.01.2026\n• Önemli Şart: Sözleşme feshi yazılı ihtar şartına bağlanmıştır.",
                                        fontSize = 11.sp, color = IvoryWhite
                                    )
                                    "sozlesme" -> Text(
                                        text = "⚠️ SÖZLEŞME RİSK UYARILARI:\n" +
                                                "1- İşverenin tek taraflı değişiklik yetkisi (Madde 8) Yargıtay kararlarına göre çalışanın yazılı onayı olmadıkça geçersizdir.\n" +
                                                "2- Cezai şart fıkrası çift taraflı düzenlenmediği için tek taraflı aleyhe şart geçersiz sayılacaktır.",
                                        fontSize = 11.sp, color = WarningOrange
                                    )
                                    "delil" -> Text(
                                        text = "⚖️ HUKUKİ DELİL DEĞERİ:\n" +
                                                "• Belge, HMK m. 200 kapsamında kesin delil niteliğindedir. İşbu yazılı belge ile belirlenen tutarın aksini iddia eden taraf, yine yazılı bir belge sunmalıdır.",
                                        fontSize = 11.sp, color = SuccessGreen
                                    )
                                    "imza" -> Text(
                                        text = "✍️ İMZA ANALİZİ VE TANIKLIK:\n" +
                                                "• Tarafların imzaları ıslak imza olarak tespit edilmiştir. Ancak yetki belgelerinin (imza sirküleri) aslına uygunluğu kontrol edilmelidir.\n" +
                                                "• İş Kanunu m. 19 uyarınca fesihte şahit/tanık bildirimleri mevcut değildir.",
                                        fontSize = 11.sp, color = IvoryWhite
                                    )
                                    "karsilastir" -> Text(
                                        text = "🔄 ÇOKLU EVRAK KARŞILAŞTIRMA:\n" +
                                                "• Taslak Protokol v1 ile Islak Protokol v2 arasında yapılan karşılaştırmada 4. maddedeki cezai şart bedeli 50.000 TL'den 150.000 TL'ye çıkarılmış, fark lehe/aleyhe tespit edilmiştir.",
                                        fontSize = 11.sp, color = AmberAccent
                                    )
                                }
                            }
                        }
                    }
                }
                
                // Bottom Input Control Area with Attachment & Sound Recognition buttons
                var chatInput by remember { mutableStateOf("") }
                
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(CharcoalNavy)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Attach File Button (PDF/Word/Photo OCR Simulator launcher)
                    var showAttachmentMenu by remember { mutableStateOf(false) }
                    Box {
                        IconButton(
                            onClick = { showAttachmentMenu = true },
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(SlateGrey),
                            colors = IconButtonDefaults.iconButtonColors(contentColor = GoldLight)
                        ) {
                            Icon(Icons.Default.AttachFile, contentDescription = "Ekle", tint = GoldDark)
                        }
                        
                        DropdownMenu(
                            expanded = showAttachmentMenu,
                            onDismissRequest = { showAttachmentMenu = false },
                            modifier = Modifier.background(CharcoalNavy)
                        ) {
                            DropdownMenuItem(
                                leadingIcon = { Icon(Icons.Default.PictureAsPdf, contentDescription = null, tint = Color.Red) },
                                text = { Text("PDF Yükle (.pdf)", color = IvoryWhite, fontSize = 12.sp) },
                                onClick = {
                                    showAttachmentMenu = false
                                    activeDocumentName = "Kira_Sozlesmesi_Belgesi.pdf"
                                    showOcrOverlay = true
                                    ocrProgress = 0.0f
                                    ocrLogText = "PDF dosyası yükleniyor..."
                                    coroutineScope.launch {
                                        delay(800)
                                        ocrProgress = 0.4f
                                        ocrLogText = "PDF metinleri taranıyor..."
                                        delay(900)
                                        ocrProgress = 0.8f
                                        ocrLogText = "Hukuki maddeler ve imzalar çözümleniyor..."
                                        delay(800)
                                        ocrProgress = 1.0f
                                        ocrLogText = "PDF başarıyla çözüldü!"
                                        delay(400)
                                        showOcrOverlay = false
                                        showOcrReportPanel = true
                                        
                                        // Auto-append user/AI interaction in chat to guide them
                                        chatInput = "Yüklediğim Kira_Sozlesmesi_Belgesi.pdf dosyasını inceler misin?"
                                    }
                                }
                            )
                            DropdownMenuItem(
                                leadingIcon = { Icon(Icons.Default.Description, contentDescription = null, tint = GoldDark) },
                                text = { Text("Word Belgesi Yükle (.docx)", color = IvoryWhite, fontSize = 12.sp) },
                                onClick = {
                                    showAttachmentMenu = false
                                    activeDocumentName = "Ihtarname_Taslagi.docx"
                                    showOcrOverlay = true
                                    ocrProgress = 0.0f
                                    ocrLogText = "Word belgesi işleniyor..."
                                    coroutineScope.launch {
                                        delay(1000)
                                        ocrProgress = 0.5f
                                        ocrLogText = "Metin formatı inceleniyor..."
                                        delay(800)
                                        ocrProgress = 1.0f
                                        ocrLogText = "Tamamlandı!"
                                        delay(300)
                                        showOcrOverlay = false
                                        showOcrReportPanel = true
                                        chatInput = "Yüklediğim Ihtarname_Taslagi.docx belgesindeki yasal riskleri açıkla."
                                    }
                                }
                            )
                            DropdownMenuItem(
                                leadingIcon = { Icon(Icons.Default.CameraAlt, contentDescription = null, tint = SuccessGreen) },
                                text = { Text("Fotoğraf Yükle (OCR)", color = IvoryWhite, fontSize = 12.sp) },
                                onClick = {
                                    showAttachmentMenu = false
                                    activeDocumentName = "WhatsApp_Kaniti.png"
                                    showOcrOverlay = true
                                    ocrProgress = 0.0f
                                    ocrLogText = "Görüntü işleniyor..."
                                    coroutineScope.launch {
                                        delay(1200)
                                        ocrProgress = 0.6f
                                        ocrLogText = "Yazı alanları OCR motoruyla okunuyor..."
                                        delay(1000)
                                        ocrProgress = 1.0f
                                        ocrLogText = "Metin başarıyla aktarıldı!"
                                        delay(300)
                                        showOcrOverlay = false
                                        showOcrReportPanel = true
                                        chatInput = "WhatsApp yazışma görüntüsünü delil olarak nasıl kullanabilirim?"
                                    }
                                }
                            )
                        }
                    }
                    
                    // Input TextField
                    OutlinedTextField(
                        value = chatInput,
                        onValueChange = { chatInput = it },
                        placeholder = { Text("Hukukçu yapay zekâya sorun...", fontSize = 12.sp, color = SoftGrey) },
                        textStyle = TextStyle(fontSize = 13.sp, color = IvoryWhite),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = GoldDark,
                            unfocusedBorderColor = SlateGrey,
                            focusedContainerColor = MidnightObsidian,
                            unfocusedContainerColor = MidnightObsidian
                        ),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("chat_assistant_input"),
                        shape = RoundedCornerShape(24.dp),
                        trailingIcon = {
                            // Voice Record (Speech simulation button)
                            IconButton(onClick = {
                                showVoiceDialog = true
                                voiceIsListening = true
                                voiceProgressText = "Sizi dinliyorum..."
                                coroutineScope.launch {
                                    delay(1500)
                                    voiceProgressText = "Konuşmanız yazılıyor..."
                                    delay(1500)
                                    voiceProgressText = "Analiz ediliyor..."
                                    delay(1000)
                                    chatInput = "Kira artış oranının yasal üst sınırı hakkında bilgi verir misin?"
                                    showVoiceDialog = false
                                }
                            }) {
                                Icon(Icons.Default.Mic, contentDescription = "Sesli Soru", tint = GoldDark)
                            }
                        }
                    )
                    
                    // Send message button (Gold highlighted with safety check)
                    Button(
                        onClick = {
                            if (chatInput.isNotBlank()) {
                                if (selectedChatSessionId == null) {
                                    // Start a session first if none active
                                    viewModel.startNewChat("Sohbet #${System.currentTimeMillis() % 10000}")
                                    val prompt = chatInput
                                    chatInput = ""
                                    coroutineScope.launch {
                                        delay(800)
                                        viewModel.sendChatAssistantMessage(prompt)
                                    }
                                } else {
                                    viewModel.sendChatAssistantMessage(chatInput)
                                    chatInput = ""
                                }
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                        modifier = Modifier
                            .size(44.dp)
                            .testTag("chat_assistant_send_button"),
                        contentPadding = PaddingValues(0.dp),
                        shape = CircleShape
                    ) {
                        Icon(Icons.Default.Send, contentDescription = "Gönder", tint = MidnightObsidian, modifier = Modifier.size(18.dp))
                    }
                }
            }
        }
        
        // Modal rename dialog
        if (showRenameDialog != null) {
            AlertDialog(
                onDismissRequest = { showRenameDialog = null },
                title = { Text("Sohbeti Yeniden Adlandır", color = GoldLight) },
                text = {
                    Column {
                        OutlinedTextField(
                            value = renameInput,
                            onValueChange = { renameInput = it },
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey)
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            showRenameDialog?.let { session ->
                                viewModel.renameChatSession(session.id, renameInput)
                            }
                            showRenameDialog = null
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = GoldDark)
                    ) {
                        Text("Değiştir", color = MidnightObsidian)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showRenameDialog = null }) {
                        Text("İptal", color = SoftGrey)
                    }
                },
                containerColor = CharcoalNavy
            )
        }
        
        // Pulsing Voice Dictation modal
        if (showVoiceDialog) {
            AlertDialog(
                onDismissRequest = { showVoiceDialog = false },
                confirmButton = {},
                dismissButton = {
                    TextButton(onClick = { showVoiceDialog = false }) {
                        Text("İptal", color = SoftGrey)
                    }
                },
                title = {
                    Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                        Text("🎤 Sesli Hukuk Asistanı", fontWeight = FontWeight.Bold, color = GoldLight)
                    }
                },
                text = {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Text(voiceProgressText, color = GoldDark, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                        
                        // Beautiful pulsing soundwave circle animation
                        val infiniteTransition = rememberInfiniteTransition()
                        val pulseScale by infiniteTransition.animateFloat(
                            initialValue = 1.0f,
                            targetValue = 1.6f,
                            animationSpec = infiniteRepeatable(
                                animation = tween(1000, easing = LinearOutSlowInEasing),
                                repeatMode = RepeatMode.Reverse
                            )
                        )
                        
                        Box(
                            modifier = Modifier
                                .size(90.dp)
                                .drawBehind {
                                    drawCircle(
                                        color = GoldDark.copy(alpha = 0.2f),
                                        radius = (size.minDimension / 2) * pulseScale
                                    )
                                    drawCircle(
                                        color = GoldDark,
                                        radius = size.minDimension / 2,
                                        style = Stroke(width = 6f)
                                    )
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Mic, contentDescription = null, tint = GoldLight, modifier = Modifier.size(32.dp))
                        }
                        
                        Text("Yasal haklarınız ile ilgili konuşun, yapay zekâ anında algılasın.", fontSize = 11.sp, color = SoftGrey, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                    }
                },
                containerColor = CharcoalNavy
            )
        }
        
        // Beautiful Document Scanner / OCR Animation Overlay
        if (showOcrOverlay) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.85f)),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(120.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        // Scan laser motion line
                        val infiniteTransition = rememberInfiniteTransition()
                        val laserOffset by infiniteTransition.animateFloat(
                            initialValue = 0f,
                            targetValue = 120f,
                            animationSpec = infiniteRepeatable(
                                animation = tween(1500, easing = LinearEasing),
                                repeatMode = RepeatMode.Reverse
                            )
                        )
                        
                        Box(
                            modifier = Modifier
                                .size(100.dp)
                                .border(2.dp, GoldDark, RoundedCornerShape(12.dp))
                        ) {
                            // Scanner laser line
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(2.dp)
                                    .offset(y = laserOffset.dp)
                                    .background(
                                        brush = Brush.horizontalGradient(
                                            colors = listOf(Color.Transparent, GoldDark, Color.Transparent)
                                        )
                                    )
                            )
                        }
                        
                        Icon(
                            imageVector = Icons.Default.DocumentScanner,
                            contentDescription = null,
                            tint = GoldDark.copy(alpha = 0.3f),
                            modifier = Modifier.size(60.dp)
                        )
                    }
                    
                    Text("Hukuki OCR & Belge Tahlili", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                    Text(ocrLogText, fontSize = 12.sp, color = AmberAccent)
                    
                    LinearProgressIndicator(
                        progress = { ocrProgress },
                        color = GoldDark,
                        trackColor = SlateGrey,
                        modifier = Modifier
                            .width(200.dp)
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp))
                    )
                }
            }
        }
    }
}

@Composable
fun ChatSessionItemRow(
    session: QuerySession,
    viewModel: LegalViewModel,
    isSelected: Boolean,
    onSelect: () -> Unit,
    onRename: () -> Unit
) {
    val meta = viewModel.parseSessionMeta(session.query)
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onSelect() },
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) SlateGrey else Color.Transparent
        ),
        shape = RoundedCornerShape(8.dp),
        border = if (isSelected) BorderStroke(1.dp, GoldDark.copy(alpha = 0.3f)) else null
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.weight(1f),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { viewModel.togglePinSession(session.id) },
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(
                        imageVector = if (meta.isPinned) Icons.Default.PushPin else Icons.Default.PushPin,
                        contentDescription = "Sabitle",
                        tint = if (meta.isPinned) GoldDark else SoftGrey.copy(alpha = 0.4f),
                        modifier = Modifier.size(13.dp)
                    )
                }
                Spacer(modifier = Modifier.width(4.dp))
                Column {
                    Text(
                        text = meta.title,
                        fontSize = 12.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        color = if (isSelected) GoldLight else IvoryWhite,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = java.text.SimpleDateFormat("dd.MM.yyyy HH:mm", Locale.getDefault()).format(Date(session.timestamp)),
                        fontSize = 9.sp,
                        color = SoftGrey
                    )
                }
            }
            
            Row {
                IconButton(onClick = { onRename() }, modifier = Modifier.size(24.dp)) {
                    Icon(Icons.Default.Edit, contentDescription = "Yeniden Adlandır", tint = SoftGrey, modifier = Modifier.size(12.dp))
                }
                IconButton(onClick = { viewModel.deleteChatSession(session.id) }, modifier = Modifier.size(24.dp)) {
                    Icon(Icons.Default.Delete, contentDescription = "Sil", tint = Color.Red.copy(alpha = 0.8f), modifier = Modifier.size(12.dp))
                }
            }
        }
    }
}
