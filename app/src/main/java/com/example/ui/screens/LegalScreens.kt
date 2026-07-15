package com.example.ui.screens

import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.database.CalendarEvent
import com.example.data.database.CaseFile
import com.example.data.database.ChatMessage
import com.example.data.database.LegalDocument
import com.example.data.repository.CaseAnalysisResult
import com.example.data.repository.DocumentAnalysisResult
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import com.example.ui.theme.*
import com.example.ui.viewmodel.LegalViewModel
import com.example.ui.viewmodel.UiState
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.geometry.CornerRadius

// --- Localized String Extension ---
@Composable
fun getStr(key: String, viewModel: LegalViewModel): String {
    val profile by viewModel.userProfile.collectAsStateWithLifecycle()
    val lang = profile?.language ?: "TR"
    return Localization.get(key, lang)
}

@Composable
fun getLang(viewModel: LegalViewModel): String {
    val profile by viewModel.userProfile.collectAsStateWithLifecycle()
    return profile?.language ?: "TR"
}

// --- Main Layout ---
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LegalAppMain(viewModel: LegalViewModel) {
    val profile by viewModel.userProfile.collectAsStateWithLifecycle()
    val caseFilesList by viewModel.caseFiles.collectAsStateWithLifecycle()
    val selectedCaseId by viewModel.selectedCaseFileId.collectAsStateWithLifecycle()
    val currentCase by viewModel.currentCaseFile.collectAsStateWithLifecycle()
    val eventsList by viewModel.calendarEvents.collectAsStateWithLifecycle()

    var activeTab by remember { mutableStateOf("ofis") } // ofis, search, petition, academy, voice, camera, settings, admin

    val context = LocalContext.current
    val isPremium = profile?.isPremium ?: false
    val activeLang = profile?.language ?: "TR"

    Scaffold(
        topBar = {
            if (activeTab != "admin" && activeTab != "payment") {
                TopAppBar(
                    title = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Balance,
                                contentDescription = "App Logo",
                                tint = GoldDark,
                                modifier = Modifier.size(28.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                text = getStr("app_title", viewModel),
                                fontWeight = FontWeight.Bold,
                                color = GoldLight,
                                letterSpacing = 1.5.sp
                            )
                            if (isPremium) {
                                Spacer(modifier = Modifier.width(8.dp))
                                Surface(
                                    color = AmberAccent,
                                    shape = RoundedCornerShape(4.dp),
                                    modifier = Modifier.padding(top = 2.dp)
                                ) {
                                    Text(
                                        text = "PREMIUM",
                                        color = Color.Black,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Black,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                        }
                    },
                    actions = {
                        IconButton(onClick = { activeTab = "settings" }) {
                            Icon(Icons.Default.Settings, contentDescription = "Settings", tint = GoldDark)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = MidnightObsidian)
                )
            }
        },
        bottomBar = {
            if (activeTab != "admin" && activeTab != "payment") {
                NavigationBar(
                    containerColor = MidnightObsidian,
                    tonalElevation = 8.dp
                ) {
                    val menuItems = listOf(
                        Triple("ofis", Icons.Default.Folder, "active_tab_ofis"),
                        Triple("simulator", Icons.Default.AutoAwesome, "active_tab_simulator"),
                        Triple("search", Icons.Default.Search, "active_tab_search"),
                        Triple("petition", Icons.Default.Description, "active_tab_petition"),
                        Triple("academy", Icons.Default.School, "active_tab_academy"),
                        Triple("voice", Icons.Default.KeyboardVoice, "active_tab_voice")
                    )

                    menuItems.forEach { (tabId, icon, labelKey) ->
                        val isSelected = activeTab == tabId
                        NavigationBarItem(
                            selected = isSelected,
                            onClick = { activeTab = tabId },
                            icon = { Icon(icon, contentDescription = getStr(labelKey, viewModel)) },
                            label = { Text(getStr(labelKey, viewModel), fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = MidnightObsidian,
                                selectedTextColor = GoldDark,
                                indicatorColor = GoldDark,
                                unselectedIconColor = SoftGrey,
                                unselectedTextColor = SoftGrey
                            )
                        )
                    }
                }
            }
        },
        containerColor = MidnightObsidian
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(if (activeTab == "admin" || activeTab == "payment") PaddingValues(0.dp) else innerPadding)
        ) {
            when (activeTab) {
                "ofis" -> {
                    if (selectedCaseId == null) {
                        OfficeDashboardScreen(viewModel) { activeTab = "settings" }
                    } else {
                        CaseWorkspaceScreen(viewModel)
                    }
                }
                "simulator" -> StandaloneSimulatorScreen(viewModel)
                "search" -> LegalSearchScreen(viewModel)
                "petition" -> PetitionStudioScreen(viewModel)
                "academy" -> AcademyScreen(viewModel)
                "voice" -> VoiceLawyerScreen(viewModel)
                "camera" -> CameraOCRScreen(viewModel)
                "settings" -> SettingsScreen(
                    viewModel = viewModel,
                    onEnterAdmin = { activeTab = "admin" },
                    onGoToPayment = { activeTab = "payment" }
                )
                "admin" -> AdminPanelScreen(viewModel, onExit = { activeTab = "settings" })
                "payment" -> CustomerPaymentScreen(viewModel, onBack = { activeTab = "settings" })
            }
        }
    }
}

// --- Tab 1: Office Dashboard (Home) ---
@Composable
fun OfficeDashboardScreen(viewModel: LegalViewModel, onGoToSettings: () -> Unit) {
    val caseFilesList by viewModel.caseFiles.collectAsStateWithLifecycle()
    val eventsList by viewModel.calendarEvents.collectAsStateWithLifecycle()
    val profile by viewModel.userProfile.collectAsStateWithLifecycle()
    var showCreateDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Welcome Header Banner
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .padding(20.dp)
                        .drawBehind {
                            drawCircle(
                                color = GoldDark.copy(alpha = 0.05f),
                                radius = 250f,
                                center = Offset(size.width - 50f, 50f)
                            )
                        }
                ) {
                    Text(
                        text = "${getStr("welcome", viewModel)}, ${profile?.userName ?: ""}",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = GoldLight
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = getStr("tagline", viewModel),
                        fontSize = 12.sp,
                        color = SoftGrey,
                        lineHeight = 18.sp
                    )
                }
            }
        }

        // AI Brain Visualizer (Immersive AI Hub UI element)
        item {
            val infiniteTransition = rememberInfiniteTransition(label = "brain_pulse")
            val pulseScale by infiniteTransition.animateFloat(
                initialValue = 0.94f,
                targetValue = 1.06f,
                animationSpec = infiniteRepeatable(
                    animation = tween(1500, easing = FastOutSlowInEasing),
                    repeatMode = RepeatMode.Reverse
                ),
                label = "brain_scale"
            )
            val glowAlpha by infiniteTransition.animateFloat(
                initialValue = 0.12f,
                targetValue = 0.35f,
                animationSpec = infiniteRepeatable(
                    animation = tween(1500, easing = LinearEasing),
                    repeatMode = RepeatMode.Reverse
                ),
                label = "brain_glow"
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                shape = RoundedCornerShape(24.dp),
                border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.2f))
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(160.dp)
                        .background(
                            Brush.linearGradient(
                                colors = listOf(CharcoalNavy, MidnightObsidian)
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(130.dp)
                            .drawBehind {
                                drawCircle(
                                    color = GoldDark.copy(alpha = glowAlpha),
                                    radius = size.width / 2f
                                )
                            }
                    )

                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(70.dp)
                                .clip(CircleShape)
                                .background(GoldDark.copy(alpha = 0.15f))
                                .border(1.dp, GoldDark.copy(alpha = 0.4f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Psychology,
                                contentDescription = "AI Brain Visualizer",
                                tint = GoldDark,
                                modifier = Modifier
                                    .size(42.dp)
                                    .graphicsLayer(
                                        scaleX = pulseScale,
                                        scaleY = pulseScale
                                    )
                            )
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = if (getLang(viewModel) == "EN") 
                                "AI OS Core active. Connected to court records, evaluating risks..."
                            else if (getLang(viewModel) == "DE")
                                "KI OS-Core aktiv. Verbunden mit Gerichtsakten, Risiken werden bewertet..."
                            else
                                "Hukuki yapay zeka sistemi aktif. Davalarınız ve belgeleriniz analiz ediliyor...",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = GoldLight,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(horizontal = 12.dp)
                        )
                    }
                }
            }
        }

        // Quick Stats row
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // File Count Card
                Card(
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Dosya Sayısı", fontSize = 11.sp, color = SoftGrey)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("${caseFilesList.size} / 10", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = GoldDark)
                    }
                }
                // Deadlines Count Card
                val activeDeadlines = eventsList.filter { !it.isCompleted }.size
                Card(
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Aktif Fristler", fontSize = 11.sp, color = SoftGrey)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("$activeDeadlines", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = AmberAccent)
                    }
                }
                // Academy Score Card
                Card(
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Akademi Puanı", fontSize = 11.sp, color = SoftGrey)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("${profile?.academyScore ?: 0}", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                    }
                }
            }
        }

        // Active Insight (Floating Notification from Immersive Design Theme)
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = GoldDark.copy(alpha = 0.08f)),
                border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.25f)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .background(GoldDark.copy(alpha = 0.15f), RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Lightbulb,
                            contentDescription = "AI Tip",
                            tint = GoldDark,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = if (getLang(viewModel) == "EN") "AI RECOMMENDATION" 
                                   else if (getLang(viewModel) == "DE") "KI EMPFEHLUNG" 
                                   else "AI ÖNERİSİ",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black,
                            color = GoldDark,
                            letterSpacing = 1.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = if (getLang(viewModel) == "EN") 
                                "\"Missing client signature on Page 4 of the contract file can void the non-compete clause. Verify document status.\""
                            else if (getLang(viewModel) == "DE")
                                "\"Fehlende Unterschrift auf Seite 4 kann das Wettbewerbsverbot ungültig machen. Dokumentenstatus prüfen.\""
                            else
                                "\"İş sözleşmesi eksik; feshin geçerliliği için imza kontrolü ve arabuluculuk son tutanağı gereklidir.\"",
                            fontSize = 11.sp,
                            color = GoldLight,
                            lineHeight = 16.sp
                        )
                    }
                }
            }
        }

        // Active Files List Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = getStr("active_files", viewModel),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = GoldLight
                )
                Button(
                    onClick = { showCreateDialog = true },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                    shape = RoundedCornerShape(8.dp),
                    enabled = caseFilesList.size < 10,
                    modifier = Modifier.testTag("create_case_button")
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, tint = MidnightObsidian)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(getStr("create_file", viewModel), color = MidnightObsidian, fontSize = 12.sp)
                }
            }
        }

        if (caseFilesList.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.FolderOpen,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = SoftGrey.copy(alpha = 0.5f)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("Henüz bir hukuki dosya açmadınız.", color = SoftGrey, fontSize = 13.sp)
                    }
                }
            }
        } else {
            items(caseFilesList) { caseFile ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { viewModel.selectCaseFile(caseFile.id) }
                        .testTag("case_card_${caseFile.id}"),
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                    border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.2f))
                ) {
                    Row(
                        modifier = Modifier
                            .padding(16.dp)
                            .fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = caseFile.title,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = GoldLight,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                StatusBadge(caseFile.status, viewModel)
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "${getStr("client_name", viewModel)}: ${caseFile.clientName}",
                                fontSize = 12.sp,
                                color = SoftGrey
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = caseFile.description,
                                fontSize = 11.sp,
                                color = SoftGrey.copy(alpha = 0.8f),
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                        IconButton(onClick = { viewModel.deleteCaseFile(caseFile) }) {
                            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Red.copy(alpha = 0.6f))
                        }
                    }
                }
            }
        }
    }

    if (showCreateDialog) {
        var title by remember { mutableStateOf("") }
        var clientName by remember { mutableStateOf("") }
        var description by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showCreateDialog = false },
            title = { Text(getStr("create_file", viewModel), color = GoldLight) },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text(getStr("file_title", viewModel)) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = GoldDark,
                            unfocusedBorderColor = SlateGrey,
                            focusedLabelColor = GoldDark
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("case_title_input")
                    )
                    OutlinedTextField(
                        value = clientName,
                        onValueChange = { clientName = it },
                        label = { Text(getStr("client_name", viewModel)) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = GoldDark,
                            unfocusedBorderColor = SlateGrey,
                            focusedLabelColor = GoldDark
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("case_client_input")
                    )
                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        label = { Text(getStr("case_description", viewModel)) },
                        placeholder = { Text(getStr("description_hint", viewModel), fontSize = 12.sp) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = GoldDark,
                            unfocusedBorderColor = SlateGrey,
                            focusedLabelColor = GoldDark
                        ),
                        modifier = Modifier.fillMaxWidth().height(120.dp).testTag("case_desc_input")
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (title.isNotEmpty() && clientName.isNotEmpty()) {
                            viewModel.createCaseFile(title, clientName, description)
                            showCreateDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldDark)
                ) {
                    Text(getStr("save", viewModel), color = MidnightObsidian)
                }
            },
            dismissButton = {
                TextButton(onClick = { showCreateDialog = false }) {
                    Text(getStr("cancel", viewModel), color = SoftGrey)
                }
            },
            containerColor = CharcoalNavy
        )
    }
}

@Composable
fun StatusBadge(status: String, viewModel: LegalViewModel) {
    val (color, textKey) = when (status) {
        "ACTIVE" -> Pair(Color(0xFF4CAF50), "status_active")
        "CLOSED" -> Pair(Color(0xFFE57373), "status_closed")
        else -> Pair(Color(0xFFFFB74D), "status_pending")
    }

    Surface(
        color = color.copy(alpha = 0.15f),
        border = BorderStroke(1.dp, color.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(4.dp)
    ) {
        Text(
            text = getStr(textKey, viewModel),
            color = color,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
        )
    }
}

// --- Selected Case Workspace ---
@Composable
fun CaseWorkspaceScreen(viewModel: LegalViewModel) {
    val currentCase by viewModel.currentCaseFile.collectAsStateWithLifecycle()
    var activeSubTab by remember { mutableStateOf("brain") } // brain, simulator, docs, calendar

    val file = currentCase ?: return

    Column(modifier = Modifier.fillMaxSize()) {
        // Back Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(MidnightObsidian)
                .padding(horizontal = 8.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { viewModel.selectCaseFile(null) }) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = GoldDark)
            }
            Spacer(modifier = Modifier.width(4.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(file.title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                Text("${getStr("client_name", viewModel)}: ${file.clientName}", fontSize = 11.sp, color = SoftGrey)
            }
            StatusBadge(file.status, viewModel)
        }

        // Sub Tabs
        TabRow(
            selectedTabIndex = when (activeSubTab) {
                "brain" -> 0
                "simulator" -> 1
                "docs" -> 2
                "calendar" -> 3
                else -> 0
            },
            containerColor = MidnightObsidian,
            contentColor = GoldDark,
            indicator = { tabPositions ->
                val index = when (activeSubTab) {
                    "brain" -> 0
                    "simulator" -> 1
                    "docs" -> 2
                    "calendar" -> 3
                    else -> 0
                }
                TabRowDefaults.SecondaryIndicator(
                    Modifier.tabIndicatorOffset(tabPositions[index]),
                    color = GoldDark
                )
            }
        ) {
            Tab(
                selected = activeSubTab == "brain",
                onClick = { activeSubTab = "brain" },
                text = { Text(getStr("tab_chat", viewModel), fontSize = 11.sp, fontWeight = FontWeight.Bold) }
            )
            Tab(
                selected = activeSubTab == "simulator",
                onClick = { activeSubTab = "simulator" },
                text = { Text(getStr("tab_simulator", viewModel), fontSize = 11.sp, fontWeight = FontWeight.Bold) }
            )
            Tab(
                selected = activeSubTab == "docs",
                onClick = { activeSubTab = "docs" },
                text = { Text(getStr("tab_documents", viewModel), fontSize = 11.sp, fontWeight = FontWeight.Bold) }
            )
            Tab(
                selected = activeSubTab == "calendar",
                onClick = { activeSubTab = "calendar" },
                text = { Text(getStr("tab_calendar", viewModel), fontSize = 11.sp, fontWeight = FontWeight.Bold) }
            )
        }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .weight(1f)
                .background(MidnightObsidian)
        ) {
            when (activeSubTab) {
                "brain" -> CaseBrainTab(viewModel)
                "simulator" -> CaseSimulatorTab(viewModel)
                "docs" -> CaseDocumentsTab(viewModel)
                "calendar" -> CaseCalendarNotesTab(viewModel)
            }
        }
    }
}

// --- Tab 1-A: Case Brain Chat ---
@Composable
fun CaseBrainTab(viewModel: LegalViewModel) {
    val chatMessages by viewModel.currentChatMessages.collectAsStateWithLifecycle()
    val documents by viewModel.currentDocuments.collectAsStateWithLifecycle()
    var inputMessage by remember { mutableStateOf("") }
    val listState = rememberScrollState()
    val coroutineScope = rememberCoroutineScope()

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        // "AI Gaps Analysis" persistent top layout helper
        val unreadableDocs = documents.filter { it.isUnreadable }
        val missingDocsList = documents.filter { !it.missingRequiredDocs.isNullOrEmpty() }.mapNotNull { it.missingRequiredDocs }

        if (unreadableDocs.isNotEmpty() || missingDocsList.isNotEmpty()) {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color.Red.copy(alpha = 0.05f)),
                border = BorderStroke(1.dp, Color.Red.copy(alpha = 0.2f)),
                modifier = Modifier.padding(bottom = 12.dp)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(getStr("missing_points_title", viewModel), fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.Red)
                    Spacer(modifier = Modifier.height(4.dp))
                    if (unreadableDocs.isNotEmpty()) {
                        Text("• Yüklenen belgelerde okunamayan kısımlar var (Fotoğrafları tekrar çekmeyi deneyin).", fontSize = 11.sp, color = IvoryWhite)
                    }
                    missingDocsList.forEach { missing ->
                        Text("• Eksik Belgeler: $missing", fontSize = 11.sp, color = IvoryWhite)
                    }
                }
            }
        }

        // Messages Box
        Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
            if (chatMessages.isEmpty()) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.SmartToy,
                        contentDescription = null,
                        modifier = Modifier.size(48.dp),
                        tint = GoldDark
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Davanız hakkında istediğiniz her şeyi sorun.",
                        color = SoftGrey,
                        fontSize = 12.sp,
                        textAlign = TextAlign.Center
                    )
                }
            } else {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(listState),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    chatMessages.forEach { chat ->
                        val isUser = chat.sender == "USER"
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
                        ) {
                            Surface(
                                color = if (isUser) GoldDark else CharcoalNavy,
                                shape = RoundedCornerShape(
                                    topStart = 12.dp,
                                    topEnd = 12.dp,
                                    bottomStart = if (isUser) 12.dp else 0.dp,
                                    bottomEnd = if (isUser) 0.dp else 12.dp
                                ),
                                modifier = Modifier.widthIn(max = 280.dp)
                            ) {
                                Text(
                                    text = chat.message,
                                    color = if (isUser) MidnightObsidian else IvoryWhite,
                                    fontSize = 13.sp,
                                    modifier = Modifier.padding(12.dp)
                                )
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Input row
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = inputMessage,
                onValueChange = { inputMessage = it },
                placeholder = { Text("Asistana sor...", fontSize = 13.sp) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = GoldDark,
                    unfocusedBorderColor = SlateGrey
                ),
                modifier = Modifier.weight(1f).testTag("chat_input_text")
            )
            IconButton(
                onClick = {
                    if (inputMessage.isNotEmpty()) {
                        viewModel.sendChatMessage(inputMessage)
                        inputMessage = ""
                        coroutineScope.launch {
                            delay(100)
                            listState.animateScrollTo(listState.maxValue)
                        }
                    }
                },
                modifier = Modifier
                    .background(GoldDark, CircleShape)
                    .size(48.dp)
                    .testTag("send_chat_button")
            ) {
                Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send", tint = MidnightObsidian)
            }
        }
    }
}

// --- Tab 1-B: Smart Case Simulator (Akıllı Dava Simülatörü) ---
data class TimelineEventItem(
    val date: String,
    val title: String,
    val description: String,
    val type: String = "Genel", // Sözleşme, İhtilaf, Ödeme, Bildirim, Fesih, Genel
    val id: String = java.util.UUID.randomUUID().toString()
)

data class EvidenceItem(
    val name: String,
    val type: String, // Resmi Belge, Sözleşme, WhatsApp, E-posta, Fotoğraf, Video, Ses, Tanık, Banka, Fatura
    val description: String,
    val relatedClaim: String,
    val supportingPoints: String,
    val gapsPoints: String,
    val id: String = java.util.UUID.randomUUID().toString()
)

data class CaseReminderItem(
    val title: String,
    val dueDate: String,
    val category: String, // Evrak, Duruşma, Genel
    val isCompleted: Boolean = false,
    val id: String = java.util.UUID.randomUUID().toString()
)

// --- Parsing Helpers for Simulator ---
fun parseTimelineString(text: String): List<TimelineEventItem> {
    val list = mutableListOf<TimelineEventItem>()
    val lines = text.split("\n")
    for (line in lines) {
        val cleaned = line.trim().removePrefix("•").trim()
        if (cleaned.isEmpty()) continue
        
        val dateRegex = Regex("""\b(\d{1,2}\.\d{1,2}\.\d{4}|\d{4}-\d{2}-\d{2})\b""")
        val match = dateRegex.find(cleaned)
        if (match != null) {
            val dateStr = match.value
            var remaining = cleaned.replace(dateStr, "").trim()
            remaining = remaining.removePrefix(":").removePrefix("-").trim()
            
            val parts = remaining.split(Regex("[:\\-]"), 2)
            val title = parts.getOrNull(0)?.trim() ?: "Olay"
            val desc = parts.getOrNull(1)?.trim() ?: remaining
            
            val type = when {
                title.lowercase().contains("sözleşme") || desc.lowercase().contains("sözleşme") -> "Sözleşme"
                title.lowercase().contains("fesih") || desc.lowercase().contains("fesih") || desc.lowercase().contains("kovul") -> "Fesih"
                title.lowercase().contains("ihtar") || desc.lowercase().contains("bildirim") -> "Bildirim"
                title.lowercase().contains("ödeme") || title.lowercase().contains("maaş") || desc.lowercase().contains("banka") -> "Ödeme"
                else -> "Genel"
            }
            list.add(TimelineEventItem(dateStr, title, desc, type))
        } else {
            val title = if (cleaned.length > 25) cleaned.substring(0, 25) + "..." else cleaned
            list.add(TimelineEventItem("Belirsiz", title, cleaned, "Genel"))
        }
    }
    return list.ifEmpty {
        listOf(
            TimelineEventItem("Belirsiz", "Kronoloji Başlangıcı", text, "Genel")
        )
    }
}

fun parseEvidenceString(text: String): List<EvidenceItem> {
    val list = mutableListOf<EvidenceItem>()
    val lines = text.split("\n")
    for (line in lines) {
        val cleaned = line.trim().removePrefix("•").trim()
        if (cleaned.isEmpty()) continue
        if (cleaned.contains(":") || cleaned.contains("-")) {
            val parts = cleaned.split(Regex("[:\\-]"), 2)
            val name = parts[0].trim()
            val desc = parts[1].trim()
            val type = when {
                name.lowercase().contains("sözleşme") -> "Sözleşme"
                name.lowercase().contains("whatsapp") -> "WhatsApp"
                name.lowercase().contains("banka") || name.lowercase().contains("dekont") || name.lowercase().contains("ekstre") -> "Banka"
                name.lowercase().contains("fatura") -> "Fatura"
                name.lowercase().contains("tanık") -> "Tanık"
                name.lowercase().contains("fotoğraf") || name.lowercase().contains("resim") -> "Fotoğraf"
                else -> "Resmi Belge"
            }
            list.add(EvidenceItem(
                name = name,
                type = type,
                description = desc,
                relatedClaim = "Uyuşmazlık Hak Talebi",
                supportingPoints = "İddia edilen hususların doğrulanması",
                gapsPoints = "Karşı tarafın itiraz olasılığı mevcuttur"
            ))
        }
    }
    return list.ifEmpty {
        listOf(
            EvidenceItem("Belge", "Resmi Belge", text, "Uyuşmazlık Hak Talebi", "İddia edilen hususların doğrulanması", "Karşı tarafın itiraz olasılığı mevcuttur")
        )
    }
}

fun parseQuestionsString(text: String): Map<String, String> {
    val map = mutableMapOf<String, String>()
    val lines = text.split("\n")
    for (line in lines) {
        val cleaned = line.trim().removePrefix("•").trim()
        if (cleaned.isEmpty()) continue
        val question = cleaned.replace(Regex("""^\d+[\.\)]\s*"""), "").trim()
        if (question.length > 10) {
            map[question] = "Cevaplanmadı (Yapay Zeka Sorusudur - Yanıtlamak İçin Tıklayın)"
        }
    }
    return map.ifEmpty {
        mapOf(
            "Uyuşmazlığa dair elinizde yeterli yazılı kanıt var mı?" to "Belirsiz",
            "Karşı tarafın sunduğu savunmalara dair ek delilleriniz mevcut mu?" to "Belirsiz"
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CaseSimulatorTab(viewModel: LegalViewModel) {
    val currentCase by viewModel.currentCaseFile.collectAsStateWithLifecycle()
    val analysisState by viewModel.caseAnalysisState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    val coroutineScope = rememberCoroutineScope()

    val file = currentCase ?: return

    // Simulator Inner Sub-Tabs
    var activeTabSub by remember { mutableStateOf("timeline") } // "timeline", "parties", "evidence", "gaps_swot", "sources", "petition", "reminders", "security"

    // 1. Interactive Timeline State (pre-populated, editable)
    var timelineList by remember {
        mutableStateOf(emptyList<TimelineEventItem>())
    }

    // 2. Interactive Evidence List
    var evidenceList by remember {
        mutableStateOf(emptyList<EvidenceItem>())
    }

    // 3. Interactive Checklist State
    var checklistState by remember {
        mutableStateOf(emptyList<Pair<String, Boolean>>())
    }

    // 4. Interactive AI Questions State (Answering panel)
    var aiQuestionsAnswers by remember {
        mutableStateOf(emptyMap<String, String>())
    }

    // 5. Interactive Reminders State
    var remindersList by remember {
        mutableStateOf(emptyList<CaseReminderItem>())
    }

    // Dialog state controllers
    var showAddEventDialog by remember { mutableStateOf(false) }
    var showAddEvidenceDialog by remember { mutableStateOf(false) }
    var showAddReminderDialog by remember { mutableStateOf(false) }

    // Dialog Input states
    var newEventDate by remember { mutableStateOf("") }
    var newEventTitle by remember { mutableStateOf("") }
    var newEventDesc by remember { mutableStateOf("") }
    var newEventType by remember { mutableStateOf("Genel") }

    var newEvidenceName by remember { mutableStateOf("") }
    var newEvidenceType by remember { mutableStateOf("Sözleşme") }
    var newEvidenceDesc by remember { mutableStateOf("") }
    var newEvidenceClaim by remember { mutableStateOf("") }
    var newEvidenceSupport by remember { mutableStateOf("") }
    var newEvidenceGaps by remember { mutableStateOf("") }

    var newReminderTitle by remember { mutableStateOf("") }
    var newReminderDate by remember { mutableStateOf("") }
    var newReminderCategory by remember { mutableStateOf("Evrak") }

    // 6. Security and Consent State
    var kvkkConsentGiven by remember { mutableStateOf(true) }
    var sharingPermissionAllowed by remember { mutableStateOf(false) }
    var showConsentDialog by remember { mutableStateOf(false) }

    // Load case-specific default data or persisted simulation results on file change
    LaunchedEffect(file.id) {
        if (!file.timelineJson.isNullOrEmpty()) {
            timelineList = parseTimelineString(file.timelineJson)
        } else {
            timelineList = if (file.title.contains("Kira") || file.title.contains("Tahliye")) {
                listOf(
                    TimelineEventItem("15.08.2024", "Kira Sözleşmesinin İmzalanması", "1 yıllık kira sözleşmesinin akdedilmesi.", "Sözleşme"),
                    TimelineEventItem("05.04.2026", "Kira Ödenmemesi", "Nisan 2026 dönemine ait kira bedelinin yatırılmaması.", "Ödeme"),
                    TimelineEventItem("15.04.2026", "1. Haklı İhtarname", "Ödenmeyen nisan kirası için noterden ihtarname tebliğ edilmesi.", "Bildirim"),
                    TimelineEventItem("05.05.2026", "Mayıs Kirasının Ödenmemesi", "Mayıs dönemi kira bedelinin de ödenmemesi.", "Ödeme"),
                    TimelineEventItem("12.05.2026", "2. Haklı İhtarname", "İkinci gecikme üzerine noterden ikinci ihtarnamenin gönderilmesi.", "Bildirim")
                )
            } else if (file.title.contains("İş") || file.title.contains("Kıdem") || file.title.contains("Tazminat")) {
                listOf(
                    TimelineEventItem("10.01.2026", "İş Sözleşmesinin İmzalanması", "Haftalık 45 saat çalışma esasıyla işe başlama.", "Sözleşme"),
                    TimelineEventItem("15.03.2026", "Fazla Mesai Başlangıcı", "İş yoğunluğu sebebiyle günlük 3 saat ek mesai talimatı verilmesi.", "İhtilaf"),
                    TimelineEventItem("01.06.2026", "Maaşın Eksik Ödenmesi", "Mayıs ayı maaşının ve fazla mesai ücretlerinin bankaya yatırılmaması.", "Ödeme"),
                    TimelineEventItem("20.06.2026", "İhtarname Keşide Edilmesi", "Ödenmeyen ücretlerin ödenmesi için noter kanalıyla ihtar çekilmesi.", "Bildirim"),
                    TimelineEventItem("30.06.2026", "İş Sözleşmesinin Feshi", "İhtarname tebliği sonrası işveren tarafından haksız fesih bildirimi.", "Fesih")
                )
            } else {
                listOf(
                    TimelineEventItem("13.06.2026", "Uyuşmazlığın Ortaya Çıkışı", file.description.take(150), "İhtilaf"),
                    TimelineEventItem("13.07.2026", "Asistan Değerlendirmesi", "Uyuşmazlık analiz edilerek dava simülasyonu başlatıldı.", "Genel")
                )
            }
        }

        if (!file.claimsEvidenceJson.isNullOrEmpty()) {
            evidenceList = parseEvidenceString(file.claimsEvidenceJson)
        } else {
            evidenceList = if (file.title.contains("Kira") || file.title.contains("Tahliye")) {
                listOf(
                    EvidenceItem("Yazılı Kira Sözleşmesi", "Sözleşme", "Beşiktaş'taki konuta ait yazılı kira sözleşmesi ve tahliye taahhütnamesi.", "Sözleşme ilişkisinin tespiti", "Kira miktarı ve ödeme günü esası", "Tapu kaydı ile mülkiyet doğrulanmalı"),
                    EvidenceItem("Noter İhtarnameleri", "Resmi Belge", "Nisan ve Mayıs aylarında kiracıya gönderilen tebliğ şerhli ihtarnameler.", "İki haklı ihtar ile tahliye hakkı", "Kiracının temerrüdü", "İhtarnamelerin tebliğ süreleri kontrol edilmeli"),
                    EvidenceItem("Banka Hesap Hareketleri", "Banka", "Kira bedellerinin son 3 aydır yatmadığını kanıtlayan banka ekstresi.", "Ödememe durumunun ispatı", "Kira borç miktarı", "Maaş hesabı yerine kira hesabının dökümü olmalı")
                )
            } else if (file.title.contains("İş") || file.title.contains("Kıdem") || file.title.contains("Tazminat")) {
                listOf(
                    EvidenceItem("Yazılı İş Sözleşmesi", "Sözleşme", "Giriş tarihi ve ücret koşullarını içeren ıslak imzalı sözleşme.", "İş ilişkisinin tespiti", "Ücret miktarı ve çalışma saatleri esası", "Ek görev protokolü bulunmuyor"),
                    EvidenceItem("WhatsApp Mesajları", "WhatsApp", "Yöneticinin mesaiye kalınması yönündeki yazılı talimat mesajları.", "Fazla çalışma iddiası", "Çalışma saatleri ve emir-talimat ilişkisi", "Kesin tarih bilgisi mesaj üstünde eksik"),
                    EvidenceItem("Banka Maaş Dekontları", "Banka", "Maaşın düzenli olarak eksik yatırıldığını gösteren banka dökümü.", "Eksik maaş iddiası", "Net maaş miktarı", "Fazla çalışma ödemesi dekontlarda görünmüyor")
                )
            } else {
                listOf(
                    EvidenceItem("Dayanak Sözleşme", "Sözleşme", "Uyuşmazlık konusuna temel oluşturan yazılı/sözlü mutabakat belgesi.", "Hukuki ilişki tespiti", "Hak ve borçların kapsamı", "Eksik imza veya tebligat şerhi kontrol edilmeli"),
                    EvidenceItem("Yazışma Kayıtları", "WhatsApp", "Uyuşmazlığı ve talepleri içeren e-posta veya mesaj dökümleri.", "Tebligat ve bildirim tespiti", "Tarafların karşılıklı irade beyanları", "Resmi noter ihtarnamesi yerine geçmez")
                )
            }
        }

        if (!file.missingInfoJson.isNullOrEmpty()) {
            aiQuestionsAnswers = parseQuestionsString(file.missingInfoJson)
        } else {
            aiQuestionsAnswers = if (file.title.contains("Kira") || file.title.contains("Tahliye")) {
                mapOf(
                    "Kira sözleşmesinde tahliye taahhütnamesinin imza tarihi kira sözleşmesi tarihiyle aynı gün mü?" to "Hayır, sözleşmeden 1 ay sonra imzalandı (Geçerli)",
                    "Kiracıya gönderilen ihtarnameler usulüne uygun tebliğ edildi mi?" to "Evet, tebligat mazbataları mevcut",
                    "Ödenmeyen toplam kira borcu ne kadardır?" to "90.000 TL (Son 3 ay toplamı)"
                )
            } else if (file.title.contains("İş") || file.title.contains("Kıdem") || file.title.contains("Tazminat")) {
                mapOf(
                    "Fazla mesai yapıldığına dair işyerine giriş-çıkış kart kayıtları mevcut mu?" to "Kısmen (Kamera kayıtları var)",
                    "İşten çıkış belgesi (SGK işten ayrılış bildirgesi) elinize ulaştı mı?" to "Hayır, henüz tebliğ edilmedi",
                    "Arabuluculuk görüşmelerine katılım sağlandı mı?" to "Evet, anlaşmazlıkla sonuçlandı"
                )
            } else {
                mapOf(
                    "Uyuşmazlığa dair elinizde yazılı ve imzalı bir sözleşme mevcut mu?" to "Evet, ıslak imzalı nüsha mevcut",
                    "Karşı tarafa noter kanalıyla bir ihtar çekildi mi?" to "Hayır, sadece sözlü bildirildi",
                    "Uyuşmazlığı ispatlayacak tanıklarınız var mı?" to "Belirsiz, henüz liste yapılmadı"
                )
            }
        }

        checklistState = if (file.title.contains("Kira") || file.title.contains("Tahliye")) {
            listOf(
                "Kira Sözleşmesi (Yazılı)" to true,
                "Tahliye Taahhütnamesi" to false,
                "1. İhtarname ve Tebliğ Şerhi" to true,
                "2. İhtarname ve Tebliğ Şerhi" to true,
                "Tapu Kaydı / Sahiplik Belgesi" to true,
                "Banka Hesap Dökümleri" to false
            )
        } else if (file.title.contains("İş") || file.title.contains("Kıdem") || file.title.contains("Tazminat")) {
            listOf(
                "İş Sözleşmesi (Yazılı)" to true,
                "Maaş Bordroları" to true,
                "Noter İhtarnamesi" to false,
                "Banka Hesap Ekstresi" to false,
                "Tanık Listesi" to false,
                "SGK İşe Giriş Bildirgesi" to true,
                "İşten Ayrılış Bildirgesi" to false
            )
        } else {
            listOf(
                "Yazılı Anlaşma / Sözleşme" to true,
                "Tebligat / İhtarname Belgeleri" to false,
                "Ödeme Belgeleri / Dekontlar" to false,
                "Tanık Beyanları ve Listesi" to false,
                "Yazışma Dökümleri (WhatsApp/E-posta)" to true
            )
        }

        remindersList = if (file.title.contains("Kira") || file.title.contains("Tahliye")) {
            listOf(
                CaseReminderItem("Tebligat mazbatalarının asıllarını noterden teslim al", "15.07.2026", "Evrak"),
                CaseReminderItem("Tahliye davası harçlarını hesapla ve yatır", "22.07.2026", "Finans"),
                CaseReminderItem("Arabuluculuk bürosuna kira uyuşmazlığı başvurusunu tamamla", "17.07.2026", "Evrak")
            )
        } else if (file.title.contains("İş") || file.title.contains("Kıdem") || file.title.contains("Tazminat")) {
            listOf(
                CaseReminderItem("Noterden ihtarname tebliğ şerhini talep et", "15.07.2026", "Evrak"),
                CaseReminderItem("Duruşma öncesi tanıklarla ön görüşme yap", "20.07.2026", "Duruşma"),
                CaseReminderItem("SGK hizmet dökümünü PDF olarak indir", "18.07.2026", "Evrak")
            )
        } else {
            listOf(
                CaseReminderItem("Uyuşmazlık konusuna dair tüm belgeleri derle", "15.07.2026", "Evrak"),
                CaseReminderItem("Karşı tarafla sulh ihtimallerini değerlendir", "20.07.2026", "Genel"),
                CaseReminderItem("Asistan ile dava dilekçesi taslağı oluştur", "18.07.2026", "Evrak")
            )
        }
    }

    // Update active UI states dynamically when simulation is run successfully
    LaunchedEffect(analysisState) {
        if (analysisState is UiState.Success) {
            val res = (analysisState as UiState.Success<CaseAnalysisResult>).data
            if (!res.timeline.isNullOrEmpty()) {
                timelineList = parseTimelineString(res.timeline)
            }
            if (!res.claims.isNullOrEmpty()) {
                evidenceList = parseEvidenceString(res.claims)
            }
            if (!res.missing.isNullOrEmpty()) {
                aiQuestionsAnswers = parseQuestionsString(res.missing)
            }
            Toast.makeText(context, "AI Simülasyon Analizi Başarıyla Uygulandı!", Toast.LENGTH_SHORT).show()
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        // Run AI Simulation Banner at the top
        Card(
            colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.3f))
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = "AI Simulation",
                            tint = GoldDark,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Akıllı Dava Simülatörü",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = GoldLight
                        )
                    }
                    if (analysisState is UiState.Loading) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), color = GoldDark, strokeWidth = 2.dp)
                    } else {
                        Button(
                            onClick = { viewModel.runCaseSimulation() },
                            colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.testTag("run_simulation_btn")
                        ) {
                            Text("Simüle Et", color = MidnightObsidian, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Davanızın tüm uyuşmazlık noktalarını, delillerini, zaman çizelgesini ve yasal risklerini simüle ederek hazırlık düzeyinizi artırın.",
                    fontSize = 11.sp,
                    color = SoftGrey,
                    lineHeight = 15.sp
                )
            }
        }

        // Sub-Navigation Row for 11 Features
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            val subTabs = listOf(
                "timeline" to "📅 Zaman Çizelgesi",
                "parties" to "👥 Taraf & Delil",
                "gaps_swot" to "⚡ Analiz & SWOT",
                "sources" to "⚖️ Hukuk & Kontrol",
                "petition" to "📝 Dilekçe Hazırlık",
                "reminders" to "📂 Dosya & Görev",
                "security" to "🔒 Güvenlik & KVKK"
            )

            subTabs.forEach { (key, label) ->
                val isSelected = activeTabSub == key
                Card(
                    modifier = Modifier.clickable { activeTabSub = key },
                    colors = CardDefaults.cardColors(
                        containerColor = if (isSelected) GoldDark else CharcoalNavy.copy(alpha = 0.5f)
                    ),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, if (isSelected) GoldLight else SlateGrey.copy(alpha = 0.2f))
                ) {
                    Text(
                        text = label,
                        color = if (isSelected) MidnightObsidian else IvoryWhite,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Tab Content Display
        Box(
            modifier = Modifier
                .fillMaxSize()
                .weight(1f)
                .padding(horizontal = 16.dp)
        ) {
            when (activeTabSub) {
                "timeline" -> {
                    // 1. Olay Zaman Çizelgesi Content
                    Column(modifier = Modifier.fillMaxSize()) {
                        // Warnings banner for chronology gaps and contradictions
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color.Red.copy(alpha = 0.05f)),
                            border = BorderStroke(1.dp, Color.Red.copy(alpha = 0.2f)),
                            modifier = Modifier.padding(bottom = 12.dp)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text("⚠️ Çelişki & Eksik Tarih Denetimi", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.Red)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("• Çelişki Tespiti: İşten çıkış tarihi (30.06.2026) ile sözleşme imza tarihi (10.01.2026) arasında zaman uyuşmazlığı tespit edilmedi. Kronoloji tutarlıdır.", fontSize = 11.sp, color = IvoryWhite)
                                Text("• Eksik Tarih Kontrolü: 1 uyuşmazlık olayında kesin tarih belirtilmemiş. Fazla Mesai Başlangıcı tahmini tarihlere dayanmaktadır.", fontSize = 11.sp, color = IvoryWhite)
                            }
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Dava Zaman Akışı", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                            Button(
                                onClick = { showAddEventDialog = true },
                                colors = ButtonDefaults.buttonColors(containerColor = SlateGrey),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Add, contentDescription = null, tint = GoldLight, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Yeni Olay", color = GoldLight, fontSize = 11.sp)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Render timeline items
                        LazyColumn(
                            verticalArrangement = Arrangement.spacedBy(0.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            items(timelineList) { event ->
                                Row(modifier = Modifier.fillMaxWidth()) {
                                    // Visual Timeline column (line & circle)
                                    Column(
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        modifier = Modifier.width(32.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(16.dp)
                                                .background(
                                                    when (event.type) {
                                                        "Sözleşme" -> Color.Green
                                                        "İhtilaf" -> Color.Red
                                                        "Bildirim" -> Color.Cyan
                                                        "Fesih" -> GoldDark
                                                        else -> SlateGrey
                                                    },
                                                    CircleShape
                                                )
                                        )
                                        Box(
                                            modifier = Modifier
                                                .width(2.dp)
                                                .height(50.dp)
                                                .background(SlateGrey.copy(alpha = 0.5f))
                                        )
                                    }

                                    // Content card
                                    Card(
                                        colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                                        modifier = Modifier
                                            .weight(1f)
                                            .padding(bottom = 12.dp)
                                    ) {
                                        Column(modifier = Modifier.padding(10.dp)) {
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.SpaceBetween
                                            ) {
                                                Text(event.title, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                                Text(event.date, fontSize = 10.sp, color = AmberAccent, fontWeight = FontWeight.Bold)
                                            }
                                            Spacer(modifier = Modifier.height(4.dp))
                                            Text(event.description, fontSize = 11.sp, color = IvoryWhite)
                                            Spacer(modifier = Modifier.height(6.dp))
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.SpaceBetween,
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Card(
                                                    colors = CardDefaults.cardColors(containerColor = MidnightObsidian),
                                                    shape = RoundedCornerShape(4.dp)
                                                ) {
                                                    Text(
                                                        text = event.type,
                                                        fontSize = 9.sp,
                                                        color = SoftGrey,
                                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                                    )
                                                }
                                                IconButton(
                                                    onClick = {
                                                        timelineList = timelineList.filter { it.id != event.id }
                                                    },
                                                    modifier = Modifier.size(18.dp)
                                                ) {
                                                    Icon(Icons.Default.Delete, contentDescription = "Sil", tint = Color.Red.copy(alpha = 0.6f), modifier = Modifier.size(14.dp))
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                "parties" -> {
                    // 2. Taraf Analizi & 3. Delil Analizi
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        // Taraf Analizi Section
                        item {
                            Text("Taraf İddia ve Savunma Analizi", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                        }

                        item {
                            Card(
                                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                                border = BorderStroke(1.dp, SlateGrey.copy(alpha = 0.3f))
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Text("🟢 DAVACI İDDİALARI (Siz)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.Green)
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text("• Haklı bir neden olmaksızın iş akdinin feshedildiği (Kıdem/İhbar tazminatı hakkı).\n• Fazla mesai alacaklarının (haftalık 15 saat) ödenmediği iddiası.\n• Mayıs ayı net maaşının eksik ödenmiş olması.", fontSize = 11.sp, color = IvoryWhite, lineHeight = 16.sp)
                                    
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Divider(color = SlateGrey.copy(alpha = 0.3f))
                                    Spacer(modifier = Modifier.height(12.dp))

                                    Text("🔴 DAVALI SAVUNMALARI (Karşı Taraf)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.Red)
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text("• İşçinin performans düşüklüğü ve uyarılara rağmen işe devamsızlık gösterdiği iddiası.\n• Fazla mesailerin yapıldığına dair onaylı imza föyü veya talimat kaydının bulunmadığı savunması.\n• Maaşın eksiksiz ve tam ödendiği iddiası.", fontSize = 11.sp, color = IvoryWhite, lineHeight = 16.sp)
                                }
                            }
                        }

                        item {
                            Card(
                                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                                border = BorderStroke(1.dp, SlateGrey.copy(alpha = 0.3f))
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Text("⚖️ Uyuşmazlık Noktaları & İspat Yükü", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        "1. Feshin Haklı Gerekçesi:\n• Kanun gereği feshin haklı gerekçesini ispat yükü işverendedir (İşK m.18).\n\n2. Fazla Çalışma Alacakları:\n• Fazla mesai yapıldığını ispat yükümlülüğü davacıdadır (Yargıtay İçtihatları). Giriş kartları, e-postalar ve tanık beyanları hayati önem taşır.",
                                        fontSize = 11.sp,
                                        color = IvoryWhite,
                                        lineHeight = 16.sp
                                    )
                                }
                            }
                        }

                        // Delil Analizi Sınıflandırma Section
                        item {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(top = 10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Delil Sınıflandırma ve Analizi", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                Button(
                                    onClick = { showAddEvidenceDialog = true },
                                    colors = ButtonDefaults.buttonColors(containerColor = SlateGrey),
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.Add, contentDescription = null, tint = GoldLight, modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Delil Ekle", color = GoldLight, fontSize = 11.sp)
                                    }
                                }
                            }
                        }

                        items(evidenceList) { ev ->
                            Card(
                                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(
                                                imageVector = when (ev.type) {
                                                    "Sözleşme" -> Icons.Default.Description
                                                    "Banka" -> Icons.Default.TrendingUp
                                                    "WhatsApp" -> Icons.Default.KeyboardVoice
                                                    else -> Icons.Default.Article
                                                },
                                                contentDescription = null,
                                                tint = GoldDark,
                                                modifier = Modifier.size(16.dp)
                                            )
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text(ev.name, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                        }
                                        Card(
                                            colors = CardDefaults.cardColors(containerColor = MidnightObsidian),
                                            shape = RoundedCornerShape(4.dp)
                                        ) {
                                            Text(
                                                text = ev.type,
                                                fontSize = 9.sp,
                                                color = AmberAccent,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text("Açıklama: ${ev.description}", fontSize = 11.sp, color = IvoryWhite)
                                    Text("İlişkili İddia: ${ev.relatedClaim}", fontSize = 11.sp, color = SoftGrey)
                                    Text("Desteklediği Hususlar: ${ev.supportingPoints}", fontSize = 11.sp, color = Color.Green.copy(alpha = 0.8f))
                                    Text("Eksik/Zayıf Noktalar: ${ev.gapsPoints}", fontSize = 11.sp, color = Color.Red.copy(alpha = 0.8f))
                                    
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                                        IconButton(
                                            onClick = { evidenceList = evidenceList.filter { it.id != ev.id } },
                                            modifier = Modifier.size(24.dp)
                                        ) {
                                            Icon(Icons.Default.Delete, contentDescription = "Sil", tint = Color.Red.copy(alpha = 0.6f), modifier = Modifier.size(14.dp))
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                "gaps_swot" -> {
                    // 4. Eksik Bilgi Kontrolü & 5. SWOT Tablosu
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        // AI Eksik Bilgi Soruları
                        item {
                            Text("AI Eksik Bilgi Kontrolü", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                            Text("AI uyuşmazlığı güçlendirmek için şu soruların cevaplanmasını öneriyor:", fontSize = 11.sp, color = SoftGrey)
                        }

                        items(aiQuestionsAnswers.keys.toList()) { q ->
                            val currentAns = aiQuestionsAnswers[q] ?: ""
                            Card(
                                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Text(q, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = GoldLight)
                                    Spacer(modifier = Modifier.height(8.dp))
                                    
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        listOf("Evet", "Hayır", "Belirsiz").forEach { opt ->
                                            val isSel = currentAns.startsWith(opt)
                                            Card(
                                                modifier = Modifier
                                                    .weight(1f)
                                                    .clickable {
                                                        aiQuestionsAnswers = aiQuestionsAnswers.toMutableMap().apply {
                                                            put(q, "$opt (Kullanıcı tarafından güncellendi)")
                                                        }
                                                    },
                                                colors = CardDefaults.cardColors(
                                                    containerColor = if (isSel) GoldDark else MidnightObsidian
                                                )
                                            ) {
                                                Box(modifier = Modifier.fillMaxWidth().padding(6.dp), contentAlignment = Alignment.Center) {
                                                    Text(opt, fontSize = 10.sp, color = if (isSel) MidnightObsidian else IvoryWhite, fontWeight = FontWeight.Bold)
                                                }
                                            }
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text("Mevcut Cevap: $currentAns", fontSize = 10.sp, color = AmberAccent, fontStyle = FontStyle.Italic)
                                }
                            }
                        }

                        // SWOT Analizi Tablosu
                        item {
                            Text("Güçlü & Zayıf SWOT Analizi", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                        }

                        item {
                            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                                    // Strengths
                                    Card(
                                        modifier = Modifier.weight(1f),
                                        colors = CardDefaults.cardColors(containerColor = Color.Green.copy(alpha = 0.05f)),
                                        border = BorderStroke(1.dp, Color.Green.copy(alpha = 0.2f))
                                    ) {
                                        Column(modifier = Modifier.padding(10.dp)) {
                                            Text("💪 GÜÇLÜ YÖNLER", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Green)
                                            Spacer(modifier = Modifier.height(4.dp))
                                            Text("• Islak imzalı sözleşme var.\n• Maaşın eksik yattığı banka kayıtlarında kanıtlı.\n• WhatsApp mesai emirleri.", fontSize = 10.sp, color = IvoryWhite, lineHeight = 14.sp)
                                        }
                                    }
                                    // Areas to support
                                    Card(
                                        modifier = Modifier.weight(1f),
                                        colors = CardDefaults.cardColors(containerColor = Color.Blue.copy(alpha = 0.05f)),
                                        border = BorderStroke(1.dp, Color.Blue.copy(alpha = 0.2f))
                                    ) {
                                        Column(modifier = Modifier.padding(10.dp)) {
                                            Text("🔧 DESTEKLENMELİ", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Blue)
                                            Spacer(modifier = Modifier.height(4.dp))
                                            Text("• Mesai saatlerinin şahit tanıklıklarıyla güçlendirilmesi gerekir.\n• SGK döküm kontrolü.", fontSize = 10.sp, color = IvoryWhite, lineHeight = 14.sp)
                                        }
                                    }
                                }

                                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                                    // Uncertainties
                                    Card(
                                        modifier = Modifier.weight(1f),
                                        colors = CardDefaults.cardColors(containerColor = Color.Yellow.copy(alpha = 0.05f)),
                                        border = BorderStroke(1.dp, Color.Yellow.copy(alpha = 0.2f))
                                    ) {
                                        Column(modifier = Modifier.padding(10.dp)) {
                                            Text("🔍 BELİRSİZLİKLER", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Yellow)
                                            Spacer(modifier = Modifier.height(4.dp))
                                            Text("• İş sözleşmesinin fesih bildiriminin noter kanalıyla tebliğ edilme tarihi.", fontSize = 10.sp, color = IvoryWhite, lineHeight = 14.sp)
                                        }
                                    }
                                    // Risks
                                    Card(
                                        modifier = Modifier.weight(1f),
                                        colors = CardDefaults.cardColors(containerColor = Color.Red.copy(alpha = 0.05f)),
                                        border = BorderStroke(1.dp, Color.Red.copy(alpha = 0.2f))
                                    ) {
                                        Column(modifier = Modifier.padding(10.dp)) {
                                            Text("🚨 RISK HUSUSLARI", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Red)
                                            Spacer(modifier = Modifier.height(4.dp))
                                            Text("• Karşı tarafın haksız yere devamsızlık tutanağı uydurarak haklı fesih savunması yapması riski.", fontSize = 10.sp, color = IvoryWhite, lineHeight = 14.sp)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                "sources" -> {
                    // 6. İlgili Hukuk Kaynakları & 7. Belge Kontrol Listesi
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        // Belge Kontrol Listesi & Completeness percentage
                        item {
                            Text("Belge Tamamlama ve Hazırlık Kontrolü", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                        }

                        item {
                            val presentCount = checklistState.count { it.second }
                            val totalCount = checklistState.size
                            val completenessPercent = if (totalCount > 0) (presentCount * 100 / totalCount) else 0

                            Card(
                                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                                border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.3f))
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text("Dosya Tamlık Oranı", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                        Text("%$completenessPercent", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = AmberAccent)
                                    }
                                    Spacer(modifier = Modifier.height(6.dp))
                                    LinearProgressIndicator(
                                        progress = { presentCount.toFloat() / totalCount.toFloat() },
                                        color = GoldDark,
                                        trackColor = MidnightObsidian,
                                        modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp))
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text("$totalCount belgeden $presentCount tanesi dosyaya eklendi.", fontSize = 10.sp, color = SoftGrey)
                                }
                            }
                        }

                        items(checklistState.size) { idx ->
                            val item = checklistState[idx]
                            Card(
                                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable {
                                            checklistState = checklistState.toMutableList().apply {
                                                set(idx, item.first to !item.second)
                                            }
                                        }
                                        .padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Checkbox(
                                        checked = item.second,
                                        onCheckedChange = { checked ->
                                            checklistState = checklistState.toMutableList().apply {
                                                set(idx, item.first to checked)
                                            }
                                        },
                                        colors = CheckboxDefaults.colors(
                                            checkedColor = GoldDark,
                                            uncheckedColor = SoftGrey
                                        )
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = item.first,
                                        fontSize = 12.sp,
                                        color = if (item.second) IvoryWhite else SoftGrey,
                                        fontWeight = if (item.second) FontWeight.Bold else FontWeight.Normal
                                    )
                                }
                            }
                        }

                        // İlgili Mevzuat Kaynakları
                        item {
                            Text("İlgili Mevzuat ve Emsal Kararlar", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                        }

                        item {
                            Card(
                                colors = CardDefaults.cardColors(containerColor = CharcoalNavy)
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Text("⚖️ 4857 Sayılı İş Kanunu - Madde 17", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = AmberAccent)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text("İş sözleşmelerinin feshinden önce durumun diğer tarafa bildirilmesi gerekir. İhbar sürelerine uymayan taraf ihbar tazminatı ödemekle yükümlüdür.", fontSize = 11.sp, color = IvoryWhite)
                                    
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Text("⚖️ 4857 Sayılı İş Kanunu - Madde 41", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = AmberAccent)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text("Ülkenin genel yararları yahut işin niteliği veya üretimin artırılması gibi nedenlerle fazla çalışma yapılabilir. Fazla çalışma, kanunda yazılı koşullar çerçevesinde, haftalık kırk beş saati aşan çalışmalardır.", fontSize = 11.sp, color = IvoryWhite)

                                    Spacer(modifier = Modifier.height(10.dp))
                                    Text("📝 Emsal Yargıtay Hukuk Genel Kurulu (2021/9-105)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = AmberAccent)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text("WhatsApp yazışmaları, taraflar arasındaki borç/hak ilişkilerini gösteren ve yazılı delil başlangıcı sayılması gereken yasal takdiri delillerdendir.", fontSize = 11.sp, color = IvoryWhite)
                                }
                            }
                        }
                    }
                }

                "petition" -> {
                    // 8. Dilekçe Hazırlık Yardımcısı
                    val compiledTimelineStr = timelineList.joinToString("\n") { "• ${it.date}: ${it.title} - ${it.description}" }
                    val compiledEvidenceStr = evidenceList.joinToString("\n") { "• ${it.name} (${it.type}): ${it.description}" }

                    val draftPetitionTemplate = """
                        NÖBETÇİ İŞ MAHKEMESİ HAKİMLİĞİ'NE
                        
                        DAVACI      : ${file.clientName}
                        VEKİLİ      : Av. Kerem Soylu (AL Hukuk AI OS)
                        DAVALI      : Karşı İşveren Ltd. Şti.
                        KONU        : Haksız fesihten kaynaklanan Kıdem Tazminatı, İhbar Tazminatı ile ödenmeyen Fazla Çalışma Ücreti alacaklarının tahsili talebidir.
                        
                        AÇIKLAMALAR :
                        1- Müvekkil davalı işyerinde işçi olarak çalışmıştır. Müvekkilin uyuşmazlığa dair olay zaman çizelgesi aşağıdadır:
                        $compiledTimelineStr
                        
                        2- Müvekkilin iş akdi haklı bir neden gösterilmeksizin tek taraflı olarak feshedilmiş olup tazminatları ödenmemiştir.
                        
                        3- Davalı bünyesinde yoğun fazla çalışma yapılmasına rağmen mesai ücretleri ödenmemiştir. Bu hususu destekleyen delillerimiz aşağıda sunulmuştur.
                        
                        DELİLLER        :
                        $compiledEvidenceStr
                        Arabuluculuk son tutanağı, banka kayıtları ve tanık beyanları.
                        
                        NETİCE-İ TALEP  : Davamızın kabulü ile alacakların yasal faiziyle tahsilini saygılarımızla vekaleten talep ederiz.
                        
                        Davacı Vekili
                        Av. Kerem Soylu
                    """.trimIndent()

                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        item {
                            Text("Dilekçe Hazırlık Yardımcısı", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                            Text("Simülatördeki olay ve delil verilerinden otomatik derlenen taslak metin:", fontSize = 11.sp, color = SoftGrey)
                        }

                        item {
                            Card(
                                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                                border = BorderStroke(1.dp, SlateGrey.copy(alpha = 0.3f))
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text("Dilekçe Şablon Taslağı", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = AmberAccent)
                                        IconButton(
                                            onClick = {
                                                clipboardManager.setText(AnnotatedString(draftPetitionTemplate))
                                                Toast.makeText(context, "Dilekçe taslağı panoya kopyalandı!", Toast.LENGTH_SHORT).show()
                                            }
                                        ) {
                                            Icon(Icons.Default.ContentCopy, contentDescription = "Kopyala", tint = GoldDark)
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = draftPetitionTemplate,
                                        fontSize = 11.sp,
                                        color = IvoryWhite,
                                        fontFamily = FontFamily.Monospace,
                                        lineHeight = 15.sp,
                                        modifier = Modifier
                                            .background(MidnightObsidian, RoundedCornerShape(6.dp))
                                            .padding(10.dp)
                                            .fillMaxWidth()
                                    )
                                }
                            }
                        }

                        item {
                            Button(
                                onClick = {
                                    Toast.makeText(context, "Dilekçe Taslağı PDF Raporu Hazırlandı ve İndiriliyor...", Toast.LENGTH_LONG).show()
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(Icons.Default.Download, contentDescription = null, tint = MidnightObsidian)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Dosyayı PDF Olarak Dışa Aktar", color = MidnightObsidian, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }

                "reminders" -> {
                    // 9. Dosya Yönetimi & 10. Hatırlatıcılar
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        // Dosya Klasörleme Bölümü
                        item {
                            Text("AI Dosya Sınıflandırma Klasörleri", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                        }

                        item {
                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                val folders = listOf(
                                    "📁 Resmi Evraklar (Sözleşme, İhtar, SGK Belgesi)" to "2 dosya mevcut",
                                    "📁 Mesajlaşma & Kanıtlar (WhatsApp, E-posta)" to "1 dosya mevcut",
                                    "📁 Mali Kayıtlar (Bordro, Dekont, Fatura)" to "1 dosya mevcut",
                                    "📁 Ses & Görsel Deliller (Kayıtlar, Fotoğraflar)" to "Eksik / Boş klasör"
                                )

                                folders.forEach { (name, desc) ->
                                    Card(
                                        colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                                        modifier = Modifier.fillMaxWidth().clickable {
                                            Toast.makeText(context, "$name klasörü açılıyor...", Toast.LENGTH_SHORT).show()
                                        }
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(12.dp).fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Column {
                                                Text(name, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = IvoryWhite)
                                                Text(desc, fontSize = 10.sp, color = SoftGrey)
                                            }
                                            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = GoldLight)
                                        }
                                    }
                                }
                            }
                        }

                        // Yapılacaklar / Hatırlatıcılar Listesi
                        item {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(top = 10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Belge Tamamlama & Duruşma Görevleri", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                Button(
                                    onClick = { showAddReminderDialog = true },
                                    colors = ButtonDefaults.buttonColors(containerColor = SlateGrey),
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.Add, contentDescription = null, tint = GoldLight, modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Görev Ekle", color = GoldLight, fontSize = 11.sp)
                                    }
                                }
                            }
                        }

                        items(remindersList) { rem ->
                            Card(
                                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp).fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Checkbox(
                                        checked = rem.isCompleted,
                                        onCheckedChange = { chk ->
                                            remindersList = remindersList.map {
                                                if (it.id == rem.id) it.copy(isCompleted = chk) else it
                                            }
                                        },
                                        colors = CheckboxDefaults.colors(checkedColor = GoldDark)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = rem.title,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (rem.isCompleted) SoftGrey else IvoryWhite,
                                            style = TextStyle(
                                                textDecoration = if (rem.isCompleted) androidx.compose.ui.text.style.TextDecoration.LineThrough else null
                                            )
                                        )
                                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                            Text("Süre: ${rem.dueDate}", fontSize = 9.sp, color = AmberAccent)
                                            Text("Kategori: ${rem.category}", fontSize = 9.sp, color = SoftGrey)
                                        }
                                    }
                                    IconButton(
                                        onClick = {
                                            remindersList = remindersList.filter { it.id != rem.id }
                                        },
                                        modifier = Modifier.size(24.dp)
                                    ) {
                                        Icon(Icons.Default.Delete, contentDescription = "Sil", tint = Color.Red.copy(alpha = 0.6f), modifier = Modifier.size(14.dp))
                                    }
                                }
                            }
                        }
                    }
                }

                "security" -> {
                    // 11. Güvenlik & KVKK Açık Rıza
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        item {
                            Text("Güvenlik ve KVKK Veri Denetimi", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                        }

                        // Encryption Status Banner
                        item {
                            Card(
                                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                                border = BorderStroke(1.dp, Color.Green.copy(alpha = 0.3f))
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.Lock, contentDescription = null, tint = Color.Green, modifier = Modifier.size(18.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("AES-256 Bit Yerel Şifreleme Aktif", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.Green)
                                    }
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text("Tüm dava verileriniz, belgeleriniz ve zaman çizelgeleriniz cihazınızda şifreli veritabanında (app_database.db) saklanır. Sunucuya sadece anonim analiz verileri iletilir.", fontSize = 11.sp, color = IvoryWhite, lineHeight = 15.sp)
                                }
                            }
                        }

                        // KVKK Açık Rıza Beyanı Checkbox
                        item {
                            Card(
                                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                                border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.2f))
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Text("KVKK Açık Rıza Beyanı", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text("Dava detaylarımı ve yüklediğim belgeleri yapay zeka analizi ve simülasyon amacıyla işlemeyi, KVKK standartlarına uygun olarak açık rızamla kabul ediyorum.", fontSize = 11.sp, color = IvoryWhite, lineHeight = 15.sp)
                                    Spacer(modifier = Modifier.height(10.dp))
                                    
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Switch(
                                            checked = kvkkConsentGiven,
                                            onCheckedChange = { kvkkConsentGiven = it },
                                            colors = SwitchDefaults.colors(checkedThumbColor = GoldDark)
                                        )
                                        Spacer(modifier = Modifier.width(10.dp))
                                        Text(if (kvkkConsentGiven) "Açık Rıza Verildi" else "Açık Rıza Verilmedi", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (kvkkConsentGiven) Color.Green else Color.Red)
                                    }
                                }
                            }
                        }

                        // File Sharing controls
                        item {
                            Card(
                                colors = CardDefaults.cardColors(containerColor = CharcoalNavy)
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Text("Dosya Paylaşım Kontrolleri", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text("Davanızın simülasyon özetini ve belgelerini barolarla veya avukatınızla güvenli bir şekilde paylaşabilirsiniz.", fontSize = 11.sp, color = IvoryWhite, lineHeight = 15.sp)
                                    Spacer(modifier = Modifier.height(10.dp))

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text("Dış Paylaşıma İzin Ver", fontSize = 11.sp, color = IvoryWhite)
                                        Switch(
                                            checked = sharingPermissionAllowed,
                                            onCheckedChange = { sharingPermissionAllowed = it },
                                            colors = SwitchDefaults.colors(checkedThumbColor = GoldDark)
                                        )
                                    }
                                    if (sharingPermissionAllowed) {
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Button(
                                            onClick = {
                                                Toast.makeText(context, "Güvenli Paylaşım Bağlantısı Üretildi: https://al-hukuk.ai/share/case_${file.id}", Toast.LENGTH_LONG).show()
                                            },
                                            colors = ButtonDefaults.buttonColors(containerColor = SlateGrey),
                                            modifier = Modifier.fillMaxWidth()
                                        ) {
                                            Icon(Icons.Default.Share, contentDescription = null, tint = GoldLight)
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text("Güvenli Paylaşım Linki Al", color = GoldLight, fontSize = 11.sp)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Dialogs implementation
    if (showAddEventDialog) {
        AlertDialog(
            onDismissRequest = { showAddEventDialog = false },
            title = { Text("Yeni Olay Ekle", color = GoldLight) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = newEventDate,
                        onValueChange = { newEventDate = it },
                        label = { Text("Tarih (örn: 12.02.2026)") },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark)
                    )
                    OutlinedTextField(
                        value = newEventTitle,
                        onValueChange = { newEventTitle = it },
                        label = { Text("Olay Başlığı") },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark)
                    )
                    OutlinedTextField(
                        value = newEventDesc,
                        onValueChange = { newEventDesc = it },
                        label = { Text("Açıklama") },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark)
                    )
                    
                    // Type selector
                    Text("Olay Tipi", fontSize = 11.sp, color = SoftGrey)
                    Row(modifier = Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("Sözleşme", "İhtilaf", "Ödeme", "Bildirim", "Fesih", "Genel").forEach { ty ->
                            val isS = newEventType == ty
                            Card(
                                modifier = Modifier.clickable { newEventType = ty },
                                colors = CardDefaults.cardColors(containerColor = if (isS) GoldDark else CharcoalNavy)
                            ) {
                                Text(ty, fontSize = 10.sp, color = if (isS) MidnightObsidian else IvoryWhite, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newEventDate.isNotEmpty() && newEventTitle.isNotEmpty()) {
                            timelineList = timelineList + TimelineEventItem(newEventDate, newEventTitle, newEventDesc, newEventType)
                            newEventDate = ""
                            newEventTitle = ""
                            newEventDesc = ""
                            showAddEventDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldDark)
                ) {
                    Text("Ekle", color = MidnightObsidian)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddEventDialog = false }) {
                    Text("İptal", color = SoftGrey)
                }
            },
            containerColor = CharcoalNavy
        )
    }

    if (showAddEvidenceDialog) {
        AlertDialog(
            onDismissRequest = { showAddEvidenceDialog = false },
            title = { Text("Yeni Delil Kaydı", color = GoldLight) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.verticalScroll(rememberScrollState())) {
                    OutlinedTextField(
                        value = newEvidenceName,
                        onValueChange = { newEvidenceName = it },
                        label = { Text("Delil Adı") },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark)
                    )
                    OutlinedTextField(
                        value = newEvidenceDesc,
                        onValueChange = { newEvidenceDesc = it },
                        label = { Text("Tanımı / İçeriği") },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark)
                    )
                    OutlinedTextField(
                        value = newEvidenceClaim,
                        onValueChange = { newEvidenceClaim = it },
                        label = { Text("İlişkili Olduğu İddia") },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark)
                    )
                    OutlinedTextField(
                        value = newEvidenceSupport,
                        onValueChange = { newEvidenceSupport = it },
                        label = { Text("Desteklediği Hususlar") },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark)
                    )
                    OutlinedTextField(
                        value = newEvidenceGaps,
                        onValueChange = { newEvidenceGaps = it },
                        label = { Text("Eksik / Şüpheli Noktalar") },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark)
                    )

                    Text("Delil Kategorisi", fontSize = 11.sp, color = SoftGrey)
                    Row(modifier = Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("Sözleşme", "Resmi Belge", "WhatsApp", "E-posta", "Fotoğraf", "Tanık", "Banka", "Fatura").forEach { ty ->
                            val isS = newEvidenceType == ty
                            Card(
                                modifier = Modifier.clickable { newEvidenceType = ty },
                                colors = CardDefaults.cardColors(containerColor = if (isS) GoldDark else CharcoalNavy)
                            ) {
                                Text(ty, fontSize = 10.sp, color = if (isS) MidnightObsidian else IvoryWhite, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newEvidenceName.isNotEmpty()) {
                            evidenceList = evidenceList + EvidenceItem(newEvidenceName, newEvidenceType, newEvidenceDesc, newEvidenceClaim, newEvidenceSupport, newEvidenceGaps)
                            newEvidenceName = ""
                            newEvidenceDesc = ""
                            newEvidenceClaim = ""
                            newEvidenceSupport = ""
                            newEvidenceGaps = ""
                            showAddEvidenceDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldDark)
                ) {
                    Text("Ekle", color = MidnightObsidian)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddEvidenceDialog = false }) {
                    Text("İptal", color = SoftGrey)
                }
            },
            containerColor = CharcoalNavy
        )
    }

    if (showAddReminderDialog) {
        AlertDialog(
            onDismissRequest = { showAddReminderDialog = false },
            title = { Text("Görev & Hatırlatıcı Ekle", color = GoldLight) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = newReminderTitle,
                        onValueChange = { newReminderTitle = it },
                        label = { Text("Görev Başlığı") },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark)
                    )
                    OutlinedTextField(
                        value = newReminderDate,
                        onValueChange = { newReminderDate = it },
                        label = { Text("Vade Tarihi (örn: 20.07.2026)") },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark)
                    )

                    Text("Kategori", fontSize = 11.sp, color = SoftGrey)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("Evrak", "Duruşma", "Genel").forEach { cat ->
                            val isS = newReminderCategory == cat
                            Card(
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { newReminderCategory = cat },
                                colors = CardDefaults.cardColors(containerColor = if (isS) GoldDark else CharcoalNavy)
                            ) {
                                Box(modifier = Modifier.fillMaxWidth().padding(6.dp), contentAlignment = Alignment.Center) {
                                    Text(cat, fontSize = 10.sp, color = if (isS) MidnightObsidian else IvoryWhite, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newReminderTitle.isNotEmpty()) {
                            remindersList = remindersList + CaseReminderItem(newReminderTitle, newReminderDate, newReminderCategory)
                            newReminderTitle = ""
                            newReminderDate = ""
                            showAddReminderDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldDark)
                ) {
                    Text("Ekle", color = MidnightObsidian)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddReminderDialog = false }) {
                    Text("İptal", color = SoftGrey)
                }
            },
            containerColor = CharcoalNavy
        )
    }
}

@Composable
fun SimulatorResultBlock(title: String, content: String) {
    if (content.isEmpty()) return
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
        border = BorderStroke(1.dp, SlateGrey.copy(alpha = 0.5f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(title, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = content,
                fontSize = 12.sp,
                color = IvoryWhite,
                lineHeight = 18.sp
            )
        }
    }
}

// --- Tab 1-C: Document Center ---
@Composable
fun CaseDocumentsTab(viewModel: LegalViewModel) {
    val documents by viewModel.currentDocuments.collectAsStateWithLifecycle()
    val docState by viewModel.docAnalysisState.collectAsStateWithLifecycle()

    var showUploadDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "📂 " + getStr("tab_documents", viewModel),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = GoldLight
                )
                Button(
                    onClick = { showUploadDialog = true },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.testTag("upload_doc_btn")
                ) {
                    Icon(Icons.Default.CloudUpload, contentDescription = null, tint = MidnightObsidian)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(getStr("docs_upload", viewModel), color = MidnightObsidian, fontSize = 11.sp)
                }
            }
        }

        if (docState is UiState.Loading) {
            item {
                Box(modifier = Modifier.fillMaxWidth().padding(20.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = GoldDark)
                }
            }
        }

        if (documents.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Bu dosya için henüz hiç belge yüklenmedi.", color = SoftGrey, fontSize = 13.sp)
                }
            }
        } else {
            items(documents) { doc ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                    border = BorderStroke(1.dp, if (doc.isUnreadable) Color.Red.copy(alpha = 0.5f) else SlateGrey.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = when (doc.type) {
                                        "PHOTO" -> Icons.Default.Photo
                                        "AUDIO" -> Icons.Default.Mic
                                        "VIDEO" -> Icons.Default.Videocam
                                        else -> Icons.Default.Article
                                    },
                                    contentDescription = null,
                                    tint = GoldDark
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(doc.name, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                    Text("${doc.type} • ${doc.uploadDate}", fontSize = 11.sp, color = SoftGrey)
                                }
                            }
                            IconButton(onClick = { viewModel.removeDocument(doc) }) {
                                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Red.copy(alpha = 0.6f))
                            }
                        }

                        if (doc.isUnreadable) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Surface(
                                color = Color.Red.copy(alpha = 0.1f),
                                border = BorderStroke(1.dp, Color.Red.copy(alpha = 0.3f)),
                                shape = RoundedCornerShape(4.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = getStr("docs_unreadable", viewModel),
                                    color = Color.Red,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(8.dp)
                                )
                            }
                        }

                        if (!doc.summary.isNullOrEmpty()) {
                            Spacer(modifier = Modifier.height(12.dp))
                            HorizontalDivider(color = SlateGrey.copy(alpha = 0.3f))
                            Spacer(modifier = Modifier.height(12.dp))

                            Text(getStr("docs_summary", viewModel), fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldDark)
                            Text(doc.summary, fontSize = 12.sp, color = IvoryWhite, modifier = Modifier.padding(top = 4.dp))

                            if (!doc.missingRequiredDocs.isNullOrEmpty()) {
                                Spacer(modifier = Modifier.height(8.dp))
                                Text("⚠️ " + getStr("simulator_missing", viewModel), fontSize = 11.sp, fontWeight = FontWeight.Bold, color = AmberAccent)
                                Text(doc.missingRequiredDocs, fontSize = 11.sp, color = AmberAccent)
                            }
                        }
                    }
                }
            }
        }
    }

    if (showUploadDialog) {
        var docName by remember { mutableStateOf("") }
        var docType by remember { mutableStateOf("PDF") }
        var docContent by remember { mutableStateOf("") }

        val docTypesList = listOf("PDF", "PHOTO", "WORD", "AUDIO", "VIDEO")

        AlertDialog(
            onDismissRequest = { showUploadDialog = false },
            title = { Text(getStr("docs_upload", viewModel), color = GoldLight) },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        value = docName,
                        onValueChange = { docName = it },
                        label = { Text(getStr("docs_name", viewModel)) },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Doc Type Radio Buttons Group
                    Text(getStr("docs_type", viewModel), fontSize = 12.sp, color = SoftGrey)
                    Row(
                        modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        docTypesList.forEach { type ->
                            FilterChip(
                                selected = docType == type,
                                onClick = { docType = type },
                                label = { Text(type, fontSize = 11.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = GoldDark,
                                    selectedLabelColor = MidnightObsidian
                                )
                            )
                        }
                    }

                    OutlinedTextField(
                        value = docContent,
                        onValueChange = { docContent = it },
                        label = { Text(getStr("docs_content", viewModel)) },
                        placeholder = { Text("Belgenin ana metnini veya özetini girin...") },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                        modifier = Modifier.fillMaxWidth().height(100.dp)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (docName.isNotEmpty() && docContent.isNotEmpty()) {
                            viewModel.addDocument(docName, docType, docContent)
                            showUploadDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldDark)
                ) {
                    Text(getStr("save", viewModel), color = MidnightObsidian)
                }
            },
            dismissButton = {
                TextButton(onClick = { showUploadDialog = false }) {
                    Text(getStr("cancel", viewModel), color = SoftGrey)
                }
            },
            containerColor = CharcoalNavy
        )
    }
}

// --- Tab 1-D: Calendar Notes Workspace ---
@Composable
fun CaseCalendarNotesTab(viewModel: LegalViewModel) {
    val currentCase by viewModel.currentCaseFile.collectAsStateWithLifecycle()
    val eventsList by viewModel.calendarEvents.collectAsStateWithLifecycle()
    var showAddEventDialog by remember { mutableStateOf(false) }

    val file = currentCase ?: return

    var notesText by remember(file.id) { mutableStateOf(file.notes) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Notes Section
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        getStr("notes_title", viewModel),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = GoldLight
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = notesText,
                        onValueChange = {
                            notesText = it
                            viewModel.updateCaseNotes(it)
                        },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = GoldDark,
                            unfocusedBorderColor = SlateGrey
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(140.dp)
                    )
                }
            }
        }

        // Calendar Section Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "📅 " + getStr("active_tab_ofis", viewModel) + " Takvimi",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = GoldLight
                )
                Button(
                    onClick = { showAddEventDialog = true },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.AddAlert, contentDescription = null, tint = MidnightObsidian)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(getStr("calendar_add", viewModel), color = MidnightObsidian, fontSize = 11.sp)
                }
            }
        }

        // Filter events for this case
        val caseEvents = eventsList.filter { it.caseFileId == file.id }

        if (caseEvents.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 20.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Bu dosya için planlanmış duruşma veya süre uyarısı bulunmuyor.", color = SoftGrey, fontSize = 12.sp)
                }
            }
        } else {
            items(caseEvents) { event ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                    border = BorderStroke(1.dp, SlateGrey.copy(alpha = 0.5f))
                ) {
                    Row(
                        modifier = Modifier
                            .padding(16.dp)
                            .fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            Checkbox(
                                checked = event.isCompleted,
                                onCheckedChange = { viewModel.toggleEventCompleted(event) },
                                colors = CheckboxDefaults.colors(checkedColor = GoldDark)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = event.title,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (event.isCompleted) SoftGrey else GoldLight,
                                        style = if (event.isCompleted) LocalTextStyle.current.copy(textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough) else LocalTextStyle.current
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Surface(
                                        color = when (event.type) {
                                            "HEARING" -> Color(0xFFE57373).copy(alpha = 0.15f)
                                            "DEADLINE" -> Color(0xFFFFB74D).copy(alpha = 0.15f)
                                            else -> Color(0xFF4CAF50).copy(alpha = 0.15f)
                                        },
                                        shape = RoundedCornerShape(4.dp)
                                    ) {
                                        Text(
                                            text = event.type,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = when (event.type) {
                                                "HEARING" -> Color(0xFFE57373)
                                                "DEADLINE" -> Color(0xFFFFB74D)
                                                else -> Color(0xFF4CAF50)
                                            },
                                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(2.dp))
                                Text("Tarih: ${event.date}", fontSize = 11.sp, color = AmberAccent)
                                if (event.description.isNotEmpty()) {
                                    Text(event.description, fontSize = 11.sp, color = SoftGrey, maxLines = 1)
                                }
                            }
                        }
                        IconButton(onClick = { viewModel.deleteEvent(event) }) {
                            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Red.copy(alpha = 0.6f))
                        }
                    }
                }
            }
        }
    }

    if (showAddEventDialog) {
        var title by remember { mutableStateOf("") }
        var type by remember { mutableStateOf("HEARING") }
        var date by remember { mutableStateOf("2026-07-20") }
        var description by remember { mutableStateOf("") }

        val typesList = listOf("HEARING", "DEADLINE", "NOTIFICATION", "OTHER")

        AlertDialog(
            onDismissRequest = { showAddEventDialog = false },
            title = { Text(getStr("calendar_add", viewModel), color = GoldLight) },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text(getStr("calendar_title", viewModel)) },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Text(getStr("calendar_type", viewModel), fontSize = 12.sp, color = SoftGrey)
                    Row(
                        modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        typesList.forEach { item ->
                            FilterChip(
                                selected = type == item,
                                onClick = { type = item },
                                label = { Text(item, fontSize = 11.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = GoldDark,
                                    selectedLabelColor = MidnightObsidian
                                )
                            )
                        }
                    }

                    OutlinedTextField(
                        value = date,
                        onValueChange = { date = it },
                        label = { Text(getStr("calendar_date", viewModel)) },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        label = { Text(getStr("calendar_desc", viewModel)) },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (title.isNotEmpty()) {
                            viewModel.addCalendarEvent(title, type, date, description)
                            showAddEventDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldDark)
                ) {
                    Text(getStr("save", viewModel), color = MidnightObsidian)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddEventDialog = false }) {
                    Text(getStr("cancel", viewModel), color = SoftGrey)
                }
            },
            containerColor = CharcoalNavy
        )
    }
}

// --- Tab 2: Legal Research Engine (Türkiye Hukuk Motoru) & AI Chat Assistant ---
@Composable
fun LegalSearchScreen(viewModel: LegalViewModel) {
    var searchSubTab by remember { mutableStateOf("chat") } // "chat" or "search"
    
    Column(modifier = Modifier.fillMaxSize()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp)
                .background(MidnightObsidian, RoundedCornerShape(12.dp))
                .border(1.dp, GoldDark.copy(alpha = 0.2f), RoundedCornerShape(12.dp))
                .padding(4.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (searchSubTab == "chat") GoldDark else Color.Transparent)
                    .clickable { searchSubTab = "chat" }
                    .padding(vertical = 10.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Chat,
                        contentDescription = null,
                        tint = if (searchSubTab == "chat") MidnightObsidian else GoldLight,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "AI Hukuk Danışmanı",
                        color = if (searchSubTab == "chat") MidnightObsidian else GoldLight,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (searchSubTab == "search") GoldDark else Color.Transparent)
                    .clickable { searchSubTab = "search" }
                    .padding(vertical = 10.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = null,
                        tint = if (searchSubTab == "search") MidnightObsidian else GoldLight,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Yasal Arama Motoru",
                        color = if (searchSubTab == "search") MidnightObsidian else GoldLight,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
        
        HorizontalDivider(color = GoldDark.copy(alpha = 0.15f), thickness = 1.dp)
        
        Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
            if (searchSubTab == "chat") {
                LegalAssistantChatScreen(viewModel)
            } else {
                OriginalLegalSearchScreen(viewModel)
            }
        }
    }
}

@Composable
fun OriginalLegalSearchScreen(viewModel: LegalViewModel) {
    var searchQuery by remember { mutableStateOf("") }
    val searchState by viewModel.searchState.collectAsStateWithLifecycle()
    val searchSessions by viewModel.searchSessions.collectAsStateWithLifecycle()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        item {
            Column {
                Text(
                    text = "📚 " + getStr("run_search", viewModel),
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = GoldLight
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Kanunlar, yönetmelikler, tebliğler ve yüksek mahkeme karar özetleri tek bir arama kutusunda.",
                    fontSize = 12.sp,
                    color = SoftGrey
                )
            }
        }

        // Search Bar
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text(getStr("search_placeholder", viewModel), fontSize = 12.sp) },
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                    modifier = Modifier.weight(1f).testTag("law_search_input")
                )
                Button(
                    onClick = { if (searchQuery.isNotEmpty()) viewModel.searchLegalMevzuat(searchQuery) },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.height(56.dp).testTag("law_search_button")
                ) {
                    Icon(Icons.Default.Search, contentDescription = null, tint = MidnightObsidian)
                }
            }
        }

        // Search UI State Render
        when (searchState) {
            is UiState.Loading -> {
                item {
                    Box(modifier = Modifier.fillMaxWidth().padding(40.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = GoldDark)
                    }
                }
            }
            is UiState.Error -> {
                item {
                    Text((searchState as UiState.Error).message, color = Color.Red, fontSize = 12.sp)
                }
            }
            is UiState.Success -> {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                        border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.3f))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("Arama Sonucu", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = (searchState as UiState.Success<String>).data,
                                fontSize = 13.sp,
                                color = IvoryWhite,
                                lineHeight = 19.sp
                            )
                        }
                    }
                }
            }
            else -> {
                item {
                    // Empty state suggestions
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 20.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text("Sık Yapılan Hukuki Aramalar:", fontSize = 12.sp, color = GoldLight)
                        listOf(
                            "İş Kanunu fazla mesai ve kıdem hesabı",
                            "Kira sözleşmesinde tahliye şartları",
                            "Tüketici hakem heyeti başvuru limiti",
                            "Boşanma davasında mal paylaşımı zamanaşımı"
                        ).forEach { suggestion ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        searchQuery = suggestion
                                        viewModel.searchLegalMevzuat(suggestion)
                                    },
                                colors = CardDefaults.cardColors(containerColor = CharcoalNavy.copy(alpha = 0.5f))
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(Icons.Default.TrendingUp, contentDescription = null, tint = SoftGrey, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(suggestion, fontSize = 12.sp, color = SoftGrey)
                                }
                            }
                        }
                    }
                }
            }
        }

        // Search History Section (Local Storage Based)
        if (searchSessions.isNotEmpty()) {
            item {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "📜 Önceki Aramalar",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = GoldLight
                )
            }

            items(searchSessions) { session ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy.copy(alpha = 0.8f)),
                    border = BorderStroke(0.5.dp, GoldDark.copy(alpha = 0.2f))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            modifier = Modifier
                                .weight(1f)
                                .clickable {
                                    searchQuery = session.query
                                    viewModel.restoreSearchSession(session)
                                },
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Search,
                                contentDescription = null,
                                tint = GoldDark,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = session.query,
                                    fontSize = 12.sp,
                                    color = IvoryWhite,
                                    fontWeight = FontWeight.Medium,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    text = java.text.SimpleDateFormat("dd.MM.yyyy HH:mm", java.util.Locale.getDefault()).format(java.util.Date(session.timestamp)),
                                    fontSize = 10.sp,
                                    color = SoftGrey
                                )
                            }
                        }
                        IconButton(
                            onClick = { viewModel.deleteQuerySession(session) },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Delete,
                                contentDescription = "Sil",
                                tint = Color.Red.copy(alpha = 0.8f),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

// --- Tab 3: AI Petition Studio (Dilekçe Stüdyosu) ---
@Composable
fun PetitionStudioScreen(viewModel: LegalViewModel) {
    val petitionState by viewModel.petitionState.collectAsStateWithLifecycle()
    val petitionSessions by viewModel.petitionSessions.collectAsStateWithLifecycle()
    val clipboardManager = LocalClipboardManager.current
    val context = LocalContext.current

    var court by remember { mutableStateOf("") }
    var plaintiff by remember { mutableStateOf("") }
    var defendant by remember { mutableStateOf("") }
    var subject by remember { mutableStateOf("") }
    var facts by remember { mutableStateOf("") }

    var showExportSuccessDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Column {
                Text(
                    text = "📄 " + getStr("tab_petition", viewModel),
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = GoldLight
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Yapay zeka ile davanıza özel, mahkeme formatına tam uygun dilekçeler hazırlayın.",
                    fontSize = 12.sp,
                    color = SoftGrey
                )
            }
        }

        if (petitionState is UiState.Success) {
            item {
                val textData = (petitionState as UiState.Success<String>).data
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                    border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Oluşturulan Dilekçe Taslağı", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                IconButton(onClick = {
                                    clipboardManager.setText(AnnotatedString(textData))
                                    Toast.makeText(context, "Dilekçe kopyalandı!", Toast.LENGTH_SHORT).show()
                                }) {
                                    Icon(Icons.Default.ContentCopy, contentDescription = "Copy", tint = GoldDark)
                                }
                                IconButton(onClick = { showExportSuccessDialog = true }) {
                                    Icon(Icons.Default.Download, contentDescription = "Export", tint = AmberAccent)
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = textData,
                            fontSize = 11.sp,
                            color = IvoryWhite,
                            fontFamily = FontFamily.Monospace,
                            lineHeight = 16.sp
                        )
                    }
                }
            }
            item {
                Button(
                    onClick = { viewModel.draftLegalPetition(emptyMap()) /* triggers reset/idle */ },
                    colors = ButtonDefaults.buttonColors(containerColor = SlateGrey),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Yeni Dilekçe Yaz", color = IvoryWhite)
                }
            }
        } else {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(getStr("petition_form_title", viewModel), fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)

                        OutlinedTextField(
                            value = court,
                            onValueChange = { court = it },
                            label = { Text(getStr("petition_court", viewModel)) },
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                            modifier = Modifier.fillMaxWidth().testTag("petition_court_input")
                        )

                        OutlinedTextField(
                            value = plaintiff,
                            onValueChange = { plaintiff = it },
                            label = { Text(getStr("petition_plaintiff", viewModel)) },
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                            modifier = Modifier.fillMaxWidth().testTag("petition_plaintiff_input")
                        )

                        OutlinedTextField(
                            value = defendant,
                            onValueChange = { defendant = it },
                            label = { Text(getStr("petition_defendant", viewModel)) },
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                            modifier = Modifier.fillMaxWidth().testTag("petition_defendant_input")
                        )

                        OutlinedTextField(
                            value = subject,
                            onValueChange = { subject = it },
                            label = { Text(getStr("petition_subject", viewModel)) },
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                            modifier = Modifier.fillMaxWidth().testTag("petition_subject_input")
                        )

                        OutlinedTextField(
                            value = facts,
                            onValueChange = { facts = it },
                            label = { Text(getStr("petition_facts", viewModel)) },
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                            modifier = Modifier.fillMaxWidth().height(100.dp).testTag("petition_facts_input")
                        )

                        if (petitionState is UiState.Loading) {
                            Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator(color = GoldDark)
                            }
                        } else {
                            Button(
                                onClick = {
                                    if (court.isNotEmpty() && plaintiff.isNotEmpty()) {
                                        val answers = mapOf(
                                            "MAHKEME" to court,
                                            "DAVACI" to plaintiff,
                                            "DAVALI" to defendant,
                                            "KONU" to subject,
                                            "ACIKLAMA" to facts
                                        )
                                        viewModel.draftLegalPetition(answers)
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                                modifier = Modifier.fillMaxWidth().testTag("petition_generate_btn")
                            ) {
                                Text(getStr("petition_generate", viewModel), color = MidnightObsidian, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }

        // Saved Petitions History Section (Local Storage Based)
        if (petitionSessions.isNotEmpty()) {
            item {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "📜 Önceki Dilekçe Taslakları",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = GoldLight
                )
            }

            items(petitionSessions) { session ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy.copy(alpha = 0.8f)),
                    border = BorderStroke(0.5.dp, GoldDark.copy(alpha = 0.2f))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            modifier = Modifier
                                .weight(1f)
                                .clickable {
                                    viewModel.restorePetitionSession(session)
                                },
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Description,
                                contentDescription = null,
                                tint = GoldDark,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = session.query,
                                    fontSize = 12.sp,
                                    color = IvoryWhite,
                                    fontWeight = FontWeight.Medium,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    text = java.text.SimpleDateFormat("dd.MM.yyyy HH:mm", java.util.Locale.getDefault()).format(java.util.Date(session.timestamp)),
                                    fontSize = 10.sp,
                                    color = SoftGrey
                                )
                            }
                        }
                        IconButton(
                            onClick = { viewModel.deleteQuerySession(session) },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Delete,
                                contentDescription = "Sil",
                                tint = Color.Red.copy(alpha = 0.8f),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
        }
    }

    if (showExportSuccessDialog) {
        AlertDialog(
            onDismissRequest = { showExportSuccessDialog = false },
            title = { Text("📥 " + getStr("petition_export", viewModel), color = GoldLight) },
            text = {
                Text(
                    text = "Dilekçe belgeniz Word (.docx) ve PDF (.pdf) formatlarında simüle edilerek cihazınıza kaydedilmiştir.\n\n" +
                           "Dosya yolu: /sdcard/AL_Hukuk_Dilekce_${System.currentTimeMillis() / 1000}.pdf",
                    fontSize = 13.sp,
                    color = IvoryWhite
                )
            },
            confirmButton = {
                Button(
                    onClick = { showExportSuccessDialog = false },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldDark)
                ) {
                    Text("Tamam", color = MidnightObsidian)
                }
            },
            containerColor = CharcoalNavy
        )
    }
}

// --- Tab 4: Law Academy (Hukuk Akademisi) ---
@Composable
fun AcademyScreen(viewModel: LegalViewModel) {
    val profile by viewModel.userProfile.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current

    // Navigation sub-tabs inside Academy
    var activeSubTab by remember { mutableStateOf("lessons") } // "lessons", "ai_teacher", "quizzes", "resources", "exam_prep"

    // Quizzes State
    var quizActive by remember { mutableStateOf(false) }
    var currentQuestionIdx by remember { mutableStateOf(0) }
    var score by remember { mutableStateOf(0) }
    var selectedOption by remember { mutableStateOf<Int?>(null) }
    var quizCompleted by remember { mutableStateOf(false) }
    var hasAnsweredCurrentQuestion by remember { mutableStateOf(false) }

    // Selected Subject for Lessons
    var selectedSubject by remember { mutableStateOf("Anayasa Hukuku") }
    var selectedLevel by remember { mutableStateOf("Başlangıç") }

    // AI Teacher State
    var teacherQuestion by remember { mutableStateOf("") }
    var selectedTeacherSubject by remember { mutableStateOf("Anayasa Hukuku") }
    val teacherResponseState by viewModel.teacherState.collectAsStateWithLifecycle()

    // Search term for Glossary
    var glossarySearch by remember { mutableStateOf("") }
    var resourceSubTab by remember { mutableStateOf("glossary") } // "glossary", "laws", "cases"

    // Subjects and levels for lessons
    val subjects = listOf("Anayasa Hukuku", "Ceza Hukuku", "Borçlar Hukuku", "İş Hukuku")
    val levels = listOf("Başlangıç", "Orta", "İleri")

    // Lesson content data mapping
    val lessonsData = mapOf(
        "Anayasa Hukuku" to mapOf(
            "Başlangıç" to """
                1. Devlet ve Anayasa Teorisi
                Anayasa, bir devletin yönetim biçimini, organlarının (yasama, yürütme, yargı) görev ve yetkilerini, vatandaşların temel hak ve ödevlerini belirleyen en üstün hukuk normudur.
                
                2. Anayasanın Üstünlüğü İlkesi
                • Anayasa Madde 11: "Anayasa hükümleri, yasama, yürütme ve yargı organlarını, idare makamlarını ve diğer kuruluş ve kişileri bağlayan temel hukuk kurallarıdır. Kanunlar Anayasaya aykırı olamaz."
                • Bu ilke gereği, tüm mevzuat hiyerarşisi (kanunlar, yönetmelikler vb.) anayasaya uygun olmak zorundadır.
                
                3. Türkiye Cumhuriyeti'nin Temel Nitelikleri
                • Madde 1: Türkiye Devleti bir Cumhuriyettir.
                • Madde 2: Türkiye Cumhuriyeti, toplumun huzuru, millî dayanışma ve adalet anlayışı içinde, insan haklarına saygılı, Atatürk milliyetçiliğine bağlı, başlangıçta belirtilen temel ilkelere dayanan, demokratik, lâik ve sosyal bir hukuk Devletidir.
            """.trimIndent(),
            "Orta" to """
                1. Temel Hak ve Özgürlüklerin Sınırlandırılması
                • Anayasa Madde 13: Temel hak ve hürriyetler, özlerine dokunulmaksızın yalnızca Anayasanın ilgili maddelerinde belirtilen özel sebeplere bağlı olarak ve ancak kanunla sınırlanabilir.
                • Bu sınırlamalar, Anayasanın sözüne ve ruhuna, demokratik toplum düzeninin ve lâik Cumhuriyetin gereklerine ve ölçülülük ilkesine aykırı olamaz.
                
                2. Yasama Dokunulmazlığı ve Sorumsuzluğu
                • Milletvekili Sorumsuzluğu: Meclis çalışmalarındaki oy, söz ve düşüncelerinden dolayı cezai olarak sorumlu tutulamazlar (mutlaktır).
                • Milletvekili Dokunulmazlığı: Seçimden önce veya sonra bir suç işlediği ileri sürülen bir milletvekili, Meclisin kararı olmadıkça tutulamaz, sorguya çekilemez, tutuklanamaz ve yargılanamaz (nispidir).
            """.trimIndent(),
            "İleri" to """
                1. Anayasa Mahkemesi ve Denetim Yolları
                Anayasa Mahkemesi (AYM), kanunların, cumhurbaşkanlığı kararnamelerinin ve TBMM İçtüzüğünün anayasaya şekil ve esas bakımlarından uygunluğunu denetler.
                
                2. Soyut Norm Denetimi (İptal Davası)
                • Cumhurbaşkanı, iktidar partisi grubu, ana muhalefet partisi grubu veya TBMM üye tamsayısının en az beşte biri (120 milletvekili) tarafından kanunun Resmî Gazete'de yayımlanmasından itibaren 60 gün içinde doğrudan açılan davadır.
                
                3. Somut Norm Denetimi (Def'i/İtiraz Yolu)
                • Görülmekte olan bir davada, mahkemenin uygulayacağı kanun hükmünün anayasaya aykırı olduğu kanaatine varması veya taraflardan birinin bu iddiayı ciddi bulması halinde AYM'ye başvurmasıdır. AYM'nin 5 ay içinde karar vermesi gerekir.
                
                4. Bireysel Başvuru
                • Anayasa ile güvence altına alınmış temel hak ve özgürlüklerinden, Avrupa İnsan Hakları Sözleşmesi kapsamındaki herhangi birinin kamu gücü tarafından ihlal edildiğini iddia eden herkes, iç hukuk yollarını tüketmek şartıyla (30 gün içinde) AYM'ye başvurabilir.
            """.trimIndent()
        ),
        "Ceza Hukuku" to mapOf(
            "Başlangıç" to """
                1. Ceza Hukukunun Temel İlkeleri
                • Kanunilik İlkesi (Suçta ve Cezada Kanunilik): Kanunun açıkça suç saymadığı bir fiil için kimseye ceza verilemez ve güvenlik tedbiri uygulanamaz. Kanunda yazılı cezalardan başka bir ceza uygulanamaz.
                • Kıyas Yasağı: Ceza hukukunda kıyas yapılması kesinlikle yasaktır. Kanun hükümleri genişletici yorumlanarak kanunda olmayan yeni suçlar türetilemez.
                
                2. Suçun Unsurları
                • Tipiklik (Kanuni Unsur): İşlenen fiilin kanundaki suç tanımına birebir uymasıdır.
                • Maddi Unsur: Fiil (hareket), netice ve illiyet bağı (hareket ile netice arasındaki sebep-sonuç ilişkisi).
                • Manevi Unsur: Kast (bilerek ve isteyerek işleme) veya Taksir (dikkat ve özen yükümlülüğüne aykırılık nedeniyle neticeyi öngörememe).
                • Hukuka Aykırılık: Fiilin hukuk düzeniyle çelişmesi.
            """.trimIndent(),
            "Orta" to """
                1. Teşebbüs (Suça Girişim)
                • Kişi, işlemeyi kastettiği bir suçu elverişli hareketlerle doğrudan doğruya icraya başlayıp da elinde olmayan nedenlerle tamamlayamazsa teşebbüsten sorumlu tutulur ve cezası hafifletilir.
                
                2. İştirak (Suç Ortaklığı)
                • Bir suçun birden fazla kişi tarafından işbirliği içerisinde işlenmesidir.
                • Müşterek Fail: Suçun icra hareketlerini birlikte gerçekleştirenler.
                • Azmettiren: Suç işleme kararı olmayan birinde bu kararı uyandıran kişi.
                • Yardım Eden: Suçun işlenmesini kolaylaştıran, araç sağlayan veya yol gösteren kişi.
                
                3. İçtima (Suçların Birleşmesi)
                • Fikri İçtima: Tek bir fiille birden fazla farklı suçun oluşmasına sebebiyet verilmesi halinde, en ağır cezayı gerektiren suçtan cezalandırılır.
                • Zincirleme Suç: Bir suç işleme kararının icrası kapsamında, değişik zamanlarda aynı kişiye karşı aynı suçun birden fazla işlenmesi durumunda tek bir ceza verilir ancak ceza artırılır.
            """.trimIndent(),
            "İleri" to """
                1. Kusurluluğu Etkileyen Haller
                • Haksız Tahrik (TCK m.29): Kişinin haksız bir fiilin kendisinde meydana getirdiği hiddet veya şiddetli elemin etkisi altında suç işlemesi halinde, cezasında belirli oranlarda indirim yapılır.
                • Meşru Savunma (TCK m.25): Gerek kendisine gerek başkasına ait bir hakka yönelmiş, gerçekleşen, gerçekleşmesi veya tekrarı muhakkak olan haksız bir saldırıyı o anki duruma göre saldırıyla orantılı biçimde defetmek amacıyla işlenen fiiller cezalandırılmaz.
                
                2. Yaş Küçüklüğü ve Akıl Hastalığı
                • 12 yaşını doldurmamış çocukların cezai sorumluluğu yoktur.
                • Akıl hastalarının ceza ehliyeti bulunmaz, ancak kendilerine yüksek güvenlikli sağlık kurumlarında koruma ve tedavi amaçlı güvenlik tedbirleri uygulanır.
            """.trimIndent()
        ),
        "Borçlar Hukuku" to mapOf(
            "Başlangıç" to """
                1. Borç İlişkisi ve Unsurları
                Borç ilişkisi, alacaklı ile borçlu arasında kurulan ve borçluyu alacaklıya karşı belirli bir edimde bulunmakla yükümlü kılan hukuki bağdır.
                • Alacaklı: Edimi talep etme yetkisine sahip olan taraf.
                • Borçlu: Edimi yerine getirmekle yükümlü olan taraf.
                • Edim: Borcun konusunu oluşturan, borçlunun yerine getirmek zorunda olduğu verme, yapma veya yapmama şeklindeki davranış.
                
                2. Borcun Kaynakları
                • Hukuki İşlemler (Sözleşmeler): İki tarafın karşılıklı ve birbirine uygun irade beyanıyla kurulan ilişkiler.
                • Haksız Fiiller: Bir kimsenin hukuka aykırı, kusurlu bir fiille başkasına zarar vermesidir (tazminat yükümlülüğü doğurur).
                • Sebepsiz Zenginleşme: Haklı bir sebep olmaksızın, bir başkasının malvarlığından veya emeğinden zenginleşmedir.
            """.trimIndent(),
            "Orta" to """
                1. İrade Bozuklukları (Sözleşmenin Geçersizliği)
                Sözleşme kurulurken taraflardan birinin iradesi sakatlanmışsa, sözleşme askıda geçersizdir ve 1 yıl içinde iptal edilebilir.
                • Yanılma (Hata): Sözleşme şartlarında veya karşı tarafta esaslı bir hataya düşülmesi.
                • Aldatma (Hile): Karşı tarafın kasıtlı olarak gerçeğe aykırı beyanlarla yanıltılması.
                • Korkutma (İkrah): Kişinin veya yakınlarının can, mal veya namusuna yönelik ağır ve yakın bir tehlike ile tehdit edilerek sözleşmeye zorlanması.
                
                2. Gabin (Aşırı Yararlanma)
                • Sözleşmedeki edimler arasında açık bir oransızlık bulunması ve bu durumun taraflardan birinin darlığından, düşüncesizliğinden veya deneyimsizliğinden faydalanılarak gerçekleştirilmesidir.
            """.trimIndent(),
            "İleri" to """
                1. Borçlunun Temerrüdü ve Sonuçları
                Muaccel (ödenme günü gelmiş) bir borcun borçlu tarafından zamanında ifa edilmemesidir. Alacaklının ihtarı veya belirli vade gününün geçmesiyle borçlu temerrüde düşer.
                
                2. Temerrüdün Genel Sonuçları
                • Gecikme Tazminatı: Geç ifadan dolayı alacaklının uğradığı zararın tazmini.
                • Temerrüt Faizi: Para borçlarında kanuni veya kararlaştırılan faiz oranının uygulanması.
                • Beklenmedik Halden Sorumluluk: Temerrüde düşen borçlu, borcun zamanında ifa edilmemesinden dolayı beklenmedik hallerde oluşacak zararlardan da sorumlu olur.
                
                3. Karşılıklı Sözleşmelerde Ek Haklar
                Alacaklı borçluya uygun bir ek süre (meyil) vererek şu seçimlik haklardan birini kullanabilir:
                1. Aynen ifa ve gecikme tazminatı talep etme.
                2. İfadan vazgeçerek müspet zararının tazminini isteme.
                3. Sözleşmeden dönerek menfi zararının tazminini isteme (taraflar aldıklarını iade eder).
            """.trimIndent()
        ),
        "İş Hukuku" to mapOf(
            "Başlangıç" to """
                1. İş Hukukunun Konusu ve Temel Kavramlar
                İş hukuku, işçi ile işveren arasındaki bağımlılık ilişkisini ve iş sözleşmesinden kaynaklanan hak ve yükümlülükleri düzenleyen hukuk dalıdır.
                • İşçi: Bir iş sözleşmesine dayanarak çalışan gerçek kişi.
                • İşveren: İşçi çalıştıran gerçek veya tüzel kişi yahut tüzel kişiliği olmayan kurum ve kuruluşlar.
                • İşyeri: İşverenin işçi çalıştırdığı ve üretimin yapıldığı yer.
                
                2. İş Sözleşmesi Türleri
                • Belirli Süreli İş Sözleşmesi: İşin tamamlanması veya belirli bir olgunun gerçekleşmesi gibi objektif şartlara bağlı olarak süresi önceden belirlenen sözleşmelerdir.
                • Belirsiz Süreli İş Sözleşmesi: Süresi önceden belirlenmemiş olan, iş hukukunda asıl kabul edilen sözleşmelerdir. Kıdem tazminatı hakkı bu sözleşmelerde geçerlidir.
            """.trimIndent(),
            "Orta" to """
                1. Süreli Fesih ve İhbar Süreleri
                Belirsiz süreli iş sözleşmelerinin feshinden önce durumun diğer tarafa yazılı olarak bildirilmesi gerekir.
                • İşçi Kıdemine Göre İhbar Süreleri:
                  • 6 aydan az sürmüş işçi için: 2 hafta
                  • 6 aydan 1.5 yıla kadar sürmüş işçi için: 4 hafta
                  • 1.5 yıldan 3 yıla kadar sürmüş işçi için: 6 hafta
                  • 3 yıldan fazla sürmüş işçi için: 8 hafta
                • İhbar sürelerine uymayan taraf, karşı tarafa bu sürenin ücreti tutarında ihbar tazminatı ödemek zorundadır.
                
                2. Haklı Nedenle Derhal Fesih
                İşverenin veya işçinin ihbar süresini beklemeksizin sözleşmeyi derhal sonlandırmasıdır (İş Kanunu Madde 24 ve 25). Ahlak ve iyiniyet kurallarına aykırılık halinde (örn: hakaret, taciz, hırsızlık, devamsızlık) derhal fesih hakkı kullanılır.
            """.trimIndent(),
            "İleri" to """
                1. İşe İade Davası Usulü
                İş güvencesi kapsamında olan işçinin, iş sözleşmesinin işveren tarafından geçersiz bir sebeple feshedilmesi halinde açabileceği davadır.
                
                2. İşe İade Davası Şartları
                • İşyerinde en az 30 işçi çalışıyor olması,
                • İşçinin en az 6 aylık kıdemi bulunması,
                • İş sözleşmesinin belirsiz süreli olması.
                
                3. Süreç ve Hak Düşürücü Süreler
                • Fesih bildiriminin tebliğinden itibaren 1 ay içinde arabulucuya başvurulmalıdır.
                • Arabuluculukta anlaşma sağlanamazsa, son tutanağın düzenlendiği tarihten itibaren 2 hafta içinde iş mahkemesinde dava açılmalıdır. Bu süreler kesin hak düşürücüdür.
                
                4. Sonuçlar
                İşe iade davasını kazanan işçi işe başlatılırsa boşta geçen süre için en çok 4 aya kadar ücret ödenir. Başlatılmazsa ayrıca en az 4, en çok 8 aylık ücreti tutarında iş güvencesi tazminatına hükmedilir.
            """.trimIndent()
        )
    )

    // Educational Video Lectures data
    val videoLectures = listOf(
        VideoLecture("Ceza Hukukunda Meşru Müdafaa Unsurları", "15 dk", "Ceza Hukuku Genel Hükümler", "T.C. TCK m. 25 kapsamında haksız saldırı, orantılılık ve savunma zorunluluğunun pratik yargı kararlarıyla analizi."),
        VideoLecture("İşe İade Davalarında Hak Düşürücü Süreler", "18 dk", "İş Hukuku Uygulamaları", "İş güvencesi şartları, arabuluculuk başvuru süreleri ve mahkeme süreçlerinin şematik incelemesi."),
        VideoLecture("Sözleşmelerde Cezai Şart ve Geçersizlik Halleri", "22 dk", "Borçlar Hukuku Özel Hükümler", "Aşırı cezai şartların hakim tarafından indirilmesi, gabin ve muvazaa iddialarının ispat yöntemleri."),
        VideoLecture("Anayasa Mahkemesine Bireysel Başvuru Rehberi", "25 dk", "Usul Hukuku & AYM Pratiği", "30 günlük hak düşürücü süre, kabul edilebilirlik kriterleri ve örnek dilekçe yazımı.")
    )

    // Court Precedents data
    val courtPrecedents = listOf(
        CourtPrecedent(
            title = "Anayasa Mahkemesi - Bireysel Başvuru (Başvuru No: 2018/1234)",
            summary = "Çalışma saatleri ve fazla çalışma ispatında adil yargılanma hakkının ihlal edildiğine dair karar. AYM, sadece imzasız bordrolardaki tahakkuklara dayanarak davanın reddedilmesini mülkiyet ve adil yargılanma haklarına aykırı bulmuştur."
        ),
        CourtPrecedent(
            title = "Yargıtay Hukuk Genel Kurulu (E. 2021/9-105, K. 2022/11)",
            summary = "E-posta yazışmaları ve WhatsApp mesajlarının, İş Kanunu kapsamında yazılı delil başlangıcı sayılması gerektiğine dair içtihat. WhatsApp yazışmalarının doğrulandığı sürece hakim tarafından takdiri delil olarak değerlendirilmesi hükme bağlanmıştır."
        ),
        CourtPrecedent(
            title = "Yargıtay 13. Hukuk Dairesi (E. 2019/302, K. 2020/124)",
            summary = "Muvazaalı sözleşmelerde üçüncü kişilerin muvazaa iddiasını her türlü delille kanıtlayabileceğine dair temel ilke. Muvazaa iddialarında yazılı delil şartı aranmaksızın tanık ve karine delillerine başvurulabilir."
        )
    )

    // Glossary data
    val glossaryTerms = listOf(
        GlossaryTerm("Asli Fail", "Suçun kanuni tanımındaki fiili bizzat gerçekleştiren veya müşterek faillikle suçu işleyen kişi."),
        GlossaryTerm("Mütemerrit", "Borcunu vadesinde yerine getirmeyen, temerrüde düşen borçlu veya alacaklı."),
        GlossaryTerm("Def'i", "Davalının, borcun varlığını kabul etmekle birlikte, özel bir sebeple borcu ifadan kaçınma hakkını ileri sürmesi (örn: zamanaşımı def'i)."),
        GlossaryTerm("Müruruzaman", "Zamanaşımı; bir hakkın talep edilebilirliğinin kanunen öngörülen sürenin geçmesiyle sona ermesi."),
        GlossaryTerm("İlliyet Bağı", "Nedensellik ilişkisi; hukuka aykırı fiil ile meydana gelen zarar arasındaki zorunlu sebep-sonuç bağı."),
        GlossaryTerm("Gabin", "Aşırı yararlanma; sözleşmede tarafların edimleri arasında darlık veya deneyimsizlikten kaynaklanan fahiş oransızlık."),
        GlossaryTerm("Muvazaa", "Tarafların üçüncü kişileri aldatmak amacıyla gerçek iradelerine uymayan, görünürde bir sözleşme yapmaları."),
        GlossaryTerm("İştirak", "Birden fazla kişinin bir suçu işlemek üzere irade birliği içerisinde birlikte hareket etmesi."),
        GlossaryTerm("Bilirkişi", "Çözümü uzmanlık gerektiren teknik konularda mahkemece bilgisine başvurulan uzman kişi."),
        GlossaryTerm("İhtarname", "Bir kimseye bir yükümlülüğü yerine getirmesi veya bir hak talebi için noter aracılığıyla gönderilen resmi bildirim.")
    )

    // Petition templates data
    val petitionTemplates = listOf(
        PetitionTemplate(
            title = "Kıdem ve İhbar Tazminatı Talepli Dava Dilekçesi",
            content = """
                NÖBETÇİ İŞ MAHKEMESİ HAKİMLİĞİ'NE
                
                DAVACI      : [Adınız Soyadınız] - T.C.: [T.C. Kimlik No]
                VEKİLİ      : Av. Kerem Soylu (AL Hukuk AI OS)
                DAVALI      : [Şirket Ünvanı / İşveren Adı]
                KONU        : Kıdem tazminatı, İhbar tazminatı ve Fazla Çalışma ücreti alacaklarının tahsili talebidir.
                
                AÇIKLAMALAR :
                1- Müvekkil davalı işyerinde [Giriş Tarihi] - [Çıkış Tarihi] tarihleri arasında kesintisiz olarak çalışmıştır.
                2- Müvekkilin iş sözleşmesi, hiçbir haklı gerekçe gösterilmeksizin ve bildirim sürelerine uyulmaksızın işveren tarafından haksız olarak feshedilmiştir.
                3- Müvekkile hak ettiği kıdem ve ihbar tazminatı ile fazla çalışma alacakları bugüne kadar ödenmemiştir.
                
                DELİLLER        : İşyeri şahsi sicil dosyası, arabuluculuk son tutanağı, banka kayıtları, tanık beyanları ve bilirkişi incelemesi.
                NETİCE-İ TALEP  : Davanın kabulü ile hak edilen kıdem tazminatı, ihbar tazminatı ve diğer işçilik alacaklarının yasal faiziyle tahsiline karar verilmesini talep ederiz.
                
                Davacı Vekili
                Av. Kerem Soylu
            """.trimIndent()
        ),
        PetitionTemplate(
            title = "Kira Alacağı İçin Temerrüt İhtarnamesi",
            content = """
                İHTARNAME
                
                KEŞİDECİ    : [Adınız Soyadınız] - T.C.: [T.C. Kimlik No]
                MUHATAP     : [Kiracının Adı Soyadı] - [Adresi]
                KONU        : Ödenmemiş kira bedellerinin ödenmesi ve temerrüt ihtarıdır.
                
                AÇIKLAMALAR :
                1- Aramızda akdedilen [Sözleşme Tarihi] başlangıç tarihli kira sözleşmesi uyarınca [Kiralanan Adres] adresinde kiracı olarak bulunmaktasınız.
                2- Sözleşme gereği ödemeniz gereken [Ödenmeyen Aylar] aylarına ait toplam [Toplam Tutar] TL kira bedelini vadesinde ödemediniz.
                3- İşbu ihtarnamenin tebliğinden itibaren 30 (Otuz) gün içinde söz konusu birikmiş kira borcunu banka hesabıma yatırmanızı, aksi takdirde borçlar kanunu hükümleri uyarınca kira akdinin feshedilerek hakkınızda tahliye davası açılacağını ihtar ederim.
                
                Keşideci
                [Adınız Soyadınız]
            """.trimIndent()
        ),
        PetitionTemplate(
            title = "İlamsız İcra Takibine İtiraz Dilekçesi",
            content = """
                İCRA DAİRESİ MÜDÜRLÜĞÜ'NE
                
                DOSYA NO    : 2026 / [Esas No] Esas
                İTİRAZ EDEN : [Adınız Soyadınız] - T.C.: [T.C. Kimlik No]
                ALACAKLI    : [Alacaklı Kişi veya Şirket Adı]
                KONU        : Ödeme emrine, borca ve takibe karşı itirazlarımızın sunulmasıdır.
                
                AÇIKLAMALAR :
                1- Yukarıda esas numarası belirtilen dosya ile tarafıma ilamsız icra takibi başlatılmış ve ödeme emri gönderilmiştir.
                2- Alacaklı görünen tarafa herhangi bir borcum bulunmamaktadır. Bu nedenle takibe, ödeme emrine, borca, faize ve tüm ferilerine açıkça itiraz ediyorum.
                3- İtirazımın kabulü ile icra takibinin durdurulmasına karar verilmesini saygıyla talep ederim.
                
                İtiraz Eden Borçlu
                [Adınız Soyadınız]
            """.trimIndent()
        )
    )

    // Quiz Questions Data inside Academy Screen (10 items total)
    val questions = listOf(
        QuizQuestion(
            question = "İş sözleşmelerinde fazla çalışma alacaklarında zamanaşımı süresi kaç yıldır?",
            options = listOf("2 yıl", "5 yıl", "10 yıl", "Zamanaşımına tabi değildir"),
            correctIdx = 1,
            explanation = "İş sözleşmesinden doğan işçi alacaklarında zamanaşımı süresi 5 yıldır."
        ),
        QuizQuestion(
            question = "Anayasa Mahkemesi'ne bireysel başvuru süresi, kanun yollarının tüketildiği tarihten itibaren kaç gündür?",
            options = listOf("15 gün", "30 gün", "60 gün", "1 yıl"),
            correctIdx = 1,
            explanation = "Anayasa Mahkemesi'ne bireysel başvuru süresi 30 gündür."
        ),
        QuizQuestion(
            question = "Hukuk Muhakemeleri Kanununa göre, istinaf dilekçesi verilme süresi tebliğden itibaren ne kadardır?",
            options = listOf("7 gün", "2 hafta", "1 ay", "30 gün"),
            correctIdx = 1,
            explanation = "İstinaf kanun yoluna başvuru süresi HMK uyarınca iki haftadır."
        ),
        QuizQuestion(
            question = "Konut ve çatılı işyeri kiralarında kiracı, sözleşme süresinin bitiminden en az kaç gün önce bildirimde bulunmazsa sözleşme 1 yıl uzar?",
            options = listOf("15 gün", "30 gün", "3 gün", "45 gün"),
            correctIdx = 0,
            explanation = "Kiracı, kira süresinin bitiminden en az 15 gün önce yazılı bildirimde bulunmalıdır."
        ),
        QuizQuestion(
            question = "Borçlar Kanununa göre sözleşmelerden doğan alacaklarda genel zamanaşımı süresi kaç yıldır?",
            options = listOf("3 yıl", "5 yıl", "10 yıl", "20 yıl"),
            correctIdx = 2,
            explanation = "Kanunda aksine bir hüküm olmadıkça, her alacak 10 yıllık zamanaşına tabidir."
        ),
        QuizQuestion(
            question = "Ceza Hukukunda 12 yaşını doldurmamış çocukların cezai ehliyeti nasıldır?",
            options = listOf("Tam sorumludurlar", "Cezaları yarı oranında indirilir", "Cezai sorumlulukları yoktur", "Sadece adli para cezası verilir"),
            correctIdx = 2,
            explanation = "TCK uyarınca 12 yaşını doldurmamış çocukların cezai sorumluluğu yoktur; haklarında güvenlik tedbirleri uygulanabilir."
        ),
        QuizQuestion(
            question = "Hakimlik ve Savcılık sınavında 'Kamu Hukuku' alanında hangisi yer almaz?",
            options = listOf("Anayasa Hukuku", "İdare Hukuku", "Ceza Hukuku Genel", "Ticaret Hukuku"),
            correctIdx = 3,
            explanation = "Ticaret Hukuku Özel Hukuk dalı kapsamındadır."
        ),
        QuizQuestion(
            question = "Borçlar Kanununa göre, hile (aldatma) nedeniyle sözleşmenin iptali süresi ne kadardır?",
            options = listOf("Hilenin öğrenildiği tarihten itibaren 1 yıl", "Sözleşme tarihinden itibaren 5 yıl", "Öğrenildiğinden itibaren 3 ay", "10 yıl"),
            correctIdx = 0,
            explanation = "Aldatma (hile) nedeniyle sözleşmeyi iptal hakkı, aldatmanın öğrenildiği andan başlayarak 1 yıldır."
        ),
        QuizQuestion(
            question = "Türkiye Cumhuriyeti Anayasasına göre milletvekili seçilme yaşı kaçtır?",
            options = listOf("18", "21", "25", "30"),
            correctIdx = 0,
            explanation = "Anayasa m.76 uyarınca 18 yaşını dolduran her Türk milletvekili seçilebilir."
        ),
        QuizQuestion(
            question = "İş sözleşmelerinde iş güvencesinden yararlanmak için işyerinde en az kaç işçi çalışıyor olmalıdır?",
            options = listOf("5 işçi", "10 işçi", "30 işçi", "50 işçi"),
            correctIdx = 2,
            explanation = "İş Kanunu m.18 uyarınca iş güvencesinden yararlanmak için en az 30 işçi çalışıyor olmalıdır."
        )
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // --- 1. Header & Academy Intro ---
        item {
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "🎓 Hukuk Akademisi",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = GoldLight
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Yapay zeka ve akademik müfredat destekli eğitim platformu.",
                            fontSize = 11.sp,
                            color = SoftGrey
                        )
                    }
                    // Mini Score Badge
                    Card(
                        colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(1.dp, GoldDark)
                    ) {
                        Text(
                            text = "Skor: ${profile?.academyScore ?: 0} XP",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = GoldLight,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }
        }

        // --- 2. Inner Navigation Tabs ---
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val subTabs = listOf(
                    "lessons" to "Dersler & Videolar",
                    "ai_teacher" to "AI Hukuk Öğretmeni",
                    "quizzes" to "Testler & Quiz",
                    "resources" to "Mevzuat & Terimler",
                    "exam_prep" to "Sınav Hazırlık"
                )

                subTabs.forEach { (key, label) ->
                    val isSelected = activeSubTab == key
                    Card(
                        modifier = Modifier
                            .clickable {
                                activeSubTab = key
                                if (key != "quizzes") {
                                    // Reset quiz
                                    quizActive = false
                                    quizCompleted = false
                                }
                            }
                            .testTag("subtab_$key"),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isSelected) GoldDark else CharcoalNavy.copy(alpha = 0.5f)
                        ),
                        shape = RoundedCornerShape(20.dp),
                        border = BorderStroke(1.dp, if (isSelected) GoldLight else SlateGrey.copy(alpha = 0.3f))
                    ) {
                        Text(
                            text = label,
                            color = if (isSelected) MidnightObsidian else IvoryWhite,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                        )
                    }
                }
            }
        }

        // --- 3. Content Rendering based on Sub-Tab ---
        when (activeSubTab) {
            "lessons" -> {
                // Subject and Level Pickers
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(CharcoalNavy, RoundedCornerShape(12.dp))
                            .padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text("Ders Seçimi", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                        
                        // Subject Selector Row
                        Row(
                            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            subjects.forEach { subj ->
                                val isSubjSelected = selectedSubject == subj
                                Card(
                                    modifier = Modifier.clickable { selectedSubject = subj },
                                    colors = CardDefaults.cardColors(
                                        containerColor = if (isSubjSelected) SlateGrey else MidnightObsidian
                                    ),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text(
                                        subj,
                                        fontSize = 11.sp,
                                        color = if (isSubjSelected) GoldLight else IvoryWhite,
                                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                                    )
                                }
                            }
                        }

                        // Level Selector Row
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            levels.forEach { lvl ->
                                val isLvlSelected = selectedLevel == lvl
                                Card(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clickable { selectedLevel = lvl },
                                    colors = CardDefaults.cardColors(
                                        containerColor = if (isLvlSelected) GoldDark else MidnightObsidian
                                    ),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Box(
                                        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            lvl,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isLvlSelected) MidnightObsidian else IvoryWhite
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // Lesson Text Card
                item {
                    val lessonContent = lessonsData[selectedSubject]?.get(selectedLevel) ?: "Ders içeriği yüklenemedi."
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "$selectedSubject • $selectedLevel Seviye",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = AmberAccent
                                )
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = MidnightObsidian),
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = "Okuma",
                                        fontSize = 10.sp,
                                        color = GoldLight,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                            
                            // Render parsed lesson text nicely
                            Text(
                                text = lessonContent,
                                fontSize = 13.sp,
                                color = IvoryWhite,
                                lineHeight = 18.sp
                            )
                        }
                    }
                }

                // Video Lectures Sub-section Header
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp)
                    ) {
                        Text(
                            text = "🎥 Video Eğitim Kütüphanesi",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = GoldLight
                        )
                        Text(
                            text = "Yüksek verimli sınav ve pratik ders video kayıtları.",
                            fontSize = 11.sp,
                            color = SoftGrey
                        )
                    }
                }

                // Render list of educational videos
                items(videoLectures.size) { index ->
                    val vid = videoLectures[index]
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.PlayArrow,
                                        contentDescription = "Oynat",
                                        tint = GoldDark,
                                        modifier = Modifier.size(24.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = vid.title,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = GoldLight
                                    )
                                }
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = MidnightObsidian),
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = vid.duration,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = AmberAccent,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Kategori: " + vid.category,
                                fontSize = 11.sp,
                                color = SoftGrey,
                                fontWeight = FontWeight.SemiBold
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = vid.description,
                                fontSize = 12.sp,
                                color = IvoryWhite,
                                lineHeight = 16.sp
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Button(
                                onClick = {
                                    Toast.makeText(context, "Eğitim videosu başlatılıyor...", Toast.LENGTH_SHORT).show()
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = SlateGrey),
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Videoyu İzle", color = GoldLight, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }

            "ai_teacher" -> {
                // AI Hukuk Öğretmeni Chat Interface
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                        shape = RoundedCornerShape(12.dp),
                        border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.5f))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Psychology,
                                    contentDescription = "AI",
                                    tint = GoldLight,
                                    modifier = Modifier.size(24.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Yapay Zeka Hukuk Öğretmeni",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = GoldLight
                                )
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Türk Hukuku akademik konuları hakkında dilediğin kavramsal, yasal veya pratik soruyu sor.",
                                fontSize = 12.sp,
                                color = SoftGrey,
                                lineHeight = 16.sp
                            )
                            Spacer(modifier = Modifier.height(12.dp))

                            // Subject select for tutoring question
                            Text("Ders Seçimi:", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = IvoryWhite)
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                subjects.forEach { subj ->
                                    val isSelected = selectedTeacherSubject == subj
                                    Card(
                                        modifier = Modifier.clickable { selectedTeacherSubject = subj },
                                        colors = CardDefaults.cardColors(
                                            containerColor = if (isSelected) GoldDark else MidnightObsidian
                                        ),
                                        shape = RoundedCornerShape(6.dp)
                                    ) {
                                        Text(
                                            subj,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isSelected) MidnightObsidian else IvoryWhite,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // Question Input Card
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = CharcoalNavy)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            OutlinedTextField(
                                value = teacherQuestion,
                                onValueChange = { teacherQuestion = it },
                                label = { Text("Sorunuz (örn: Haksız tahrik nedir ve şartları nelerdir?)", color = SoftGrey, fontSize = 12.sp) },
                                modifier = Modifier.fillMaxWidth().testTag("teacher_question_input"),
                                textStyle = TextStyle(color = IvoryWhite, fontSize = 13.sp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = GoldDark,
                                    unfocusedBorderColor = SlateGrey
                                )
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Button(
                                onClick = {
                                    viewModel.askLawTeacher(teacherQuestion, selectedTeacherSubject)
                                },
                                enabled = teacherQuestion.isNotBlank() && teacherResponseState !is UiState.Loading,
                                colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                                modifier = Modifier.fillMaxWidth().testTag("ask_teacher_btn")
                            ) {
                                if (teacherResponseState is UiState.Loading) {
                                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = MidnightObsidian)
                                } else {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.AutoMirrored.Filled.Send, contentDescription = null, modifier = Modifier.size(16.dp), tint = MidnightObsidian)
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("Öğretmene Sor", color = MidnightObsidian)
                                    }
                                }
                            }
                            if (teacherResponseState is UiState.Success || teacherResponseState is UiState.Error) {
                                Spacer(modifier = Modifier.height(8.dp))
                                TextButton(
                                    onClick = {
                                        viewModel.clearTeacherState()
                                        teacherQuestion = ""
                                    },
                                    modifier = Modifier.align(Alignment.CenterHorizontally)
                                ) {
                                    Text("Temizle", color = GoldLight, fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }

                // AI Response
                item {
                    when (val state = teacherResponseState) {
                        is UiState.Loading -> {
                            Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    CircularProgressIndicator(color = GoldDark)
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Text("Yapay Zeka Hukuk Öğretmeniniz akademileri araştırıyor...", color = SoftGrey, fontSize = 12.sp)
                                }
                            }
                        }
                        is UiState.Error -> {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(containerColor = Color(0x33FF0000))
                            ) {
                                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Warning, contentDescription = null, tint = Color.Red)
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Text(state.message, color = IvoryWhite, fontSize = 13.sp)
                                }
                            }
                        }
                        is UiState.Success -> {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                                border = BorderStroke(1.dp, GoldLight)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text("📚 Öğretmenin Yanıtı", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                        IconButton(onClick = {
                                            clipboardManager.setText(AnnotatedString(state.data))
                                            Toast.makeText(context, "Yanıt kopyalandı!", Toast.LENGTH_SHORT).show()
                                        }) {
                                            Icon(Icons.Default.ContentCopy, contentDescription = "Kopyala", tint = GoldLight)
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = state.data,
                                        fontSize = 13.sp,
                                        color = IvoryWhite,
                                        lineHeight = 18.sp
                                    )
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Card(
                                        colors = CardDefaults.cardColors(containerColor = MidnightObsidian),
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Text(
                                            text = "⚠️ Bu yanıt eğitim ve bilgilendirme amaçlıdır. Hukuki danışmanlık yerine geçmez.",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = AmberAccent,
                                            modifier = Modifier.padding(12.dp)
                                        )
                                    }
                                }
                            }
                        }
                        else -> {
                            // Idle state instruction card
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(containerColor = CharcoalNavy.copy(alpha = 0.5f))
                            ) {
                                Box(modifier = Modifier.fillMaxWidth().padding(24.dp), contentAlignment = Alignment.Center) {
                                    Text("Öğretmene henüz soru sorulmadı. Yukarıya sorunuzu girerek başlayabilirsiniz.", color = SoftGrey, fontSize = 12.sp, textAlign = TextAlign.Center)
                                }
                            }
                        }
                    }
                }
            }

            "quizzes" -> {
                if (!quizActive && !quizCompleted) {
                    item {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(Icons.Default.School, contentDescription = null, modifier = Modifier.size(56.dp), tint = GoldDark)
                                Spacer(modifier = Modifier.height(8.dp))
                                Text("Akademi Başarı Puanı", fontSize = 14.sp, color = SoftGrey)
                                Text("${profile?.academyScore ?: 0} XP", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text(
                                    text = "10 soruluk Hukuk Karma Quizini tamamlayarak puanını artır, seviye atla ve akademik başarı sertifikanı kazan!",
                                    fontSize = 12.sp,
                                    color = IvoryWhite,
                                    textAlign = TextAlign.Center,
                                    lineHeight = 16.sp
                                )
                                Spacer(modifier = Modifier.height(16.dp))
                                Button(
                                    onClick = {
                                        quizActive = true
                                        currentQuestionIdx = 0
                                        score = 0
                                        selectedOption = null
                                        quizCompleted = false
                                        hasAnsweredCurrentQuestion = false
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                                    modifier = Modifier.fillMaxWidth().testTag("start_quiz_btn")
                                ) {
                                    Text("Sınavı Başlat (10 Soru)", color = MidnightObsidian, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }

                    if ((profile?.academyScore ?: 0) >= 80) {
                        item {
                            // Certificate display
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                                border = BorderStroke(2.dp, GoldDark)
                            ) {
                                Column(
                                    modifier = Modifier
                                        .padding(24.dp)
                                        .fillMaxWidth(),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text(
                                        text = "🎓 AKADEMİK BAŞARI SERTİFİKASI",
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = AmberAccent,
                                        textAlign = TextAlign.Center
                                    )
                                    Spacer(modifier = Modifier.height(16.dp))
                                    Text(
                                        text = profile?.userName?.uppercase() ?: "KULLANICI",
                                        fontSize = 24.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = GoldLight,
                                        fontFamily = FontFamily.Serif,
                                        textAlign = TextAlign.Center
                                    )
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Text(
                                        text = "AL Hukuk AI Hukuk Akademisi bünyesinde sunulan tüm hukuk derslerini ve interaktif karma quizleri başarıyla tamamlayarak üstün performans göstermiş ve bu sertifikayı almaya hak kazanmıştır.",
                                        fontSize = 12.sp,
                                        color = IvoryWhite,
                                        textAlign = TextAlign.Center,
                                        lineHeight = 18.sp
                                    )
                                    Spacer(modifier = Modifier.height(24.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text("Sertifika No: AC-2026-9921", fontSize = 10.sp, color = SoftGrey)
                                        Text("Akademi Kurulu Onaylıdır", fontSize = 10.sp, color = SoftGrey)
                                    }
                                }
                            }
                        }
                    }
                } else if (quizActive) {
                    val q = questions[currentQuestionIdx]
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = CharcoalNavy)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Soru ${currentQuestionIdx + 1} / ${questions.size}", fontSize = 12.sp, color = SoftGrey)
                                    Text("Doğru: $score puan", fontSize = 12.sp, color = GoldLight)
                                }
                                Spacer(modifier = Modifier.height(12.dp))
                                Text(q.question, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = GoldLight, lineHeight = 20.sp)
                                Spacer(modifier = Modifier.height(16.dp))

                                q.options.forEachIndexed { idx, opt ->
                                    val isSelected = selectedOption == idx
                                    val isCorrect = idx == q.correctIdx
                                    
                                    val cardColor = when {
                                        isSelected && hasAnsweredCurrentQuestion && isCorrect -> Color(0xAA4CAF50) // Green
                                        isSelected && hasAnsweredCurrentQuestion && !isCorrect -> Color(0xAAF44336) // Red
                                        hasAnsweredCurrentQuestion && isCorrect -> Color(0xAA4CAF50).copy(alpha = 0.5f) // Show correct
                                        isSelected -> GoldDark
                                        else -> SlateGrey.copy(alpha = 0.2f)
                                    }

                                    Card(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 4.dp)
                                            .clickable(enabled = !hasAnsweredCurrentQuestion) {
                                                selectedOption = idx
                                            }
                                            .testTag("quiz_option_$idx"),
                                        colors = CardDefaults.cardColors(containerColor = cardColor)
                                    ) {
                                        Text(
                                            text = opt,
                                            color = if (isSelected && !hasAnsweredCurrentQuestion) MidnightObsidian else IvoryWhite,
                                            fontSize = 13.sp,
                                            modifier = Modifier.padding(14.dp)
                                        )
                                    }
                                }

                                if (hasAnsweredCurrentQuestion) {
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Card(
                                        colors = CardDefaults.cardColors(containerColor = MidnightObsidian),
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Column(modifier = Modifier.padding(12.dp)) {
                                            val wasCorrect = selectedOption == q.correctIdx
                                            Text(
                                                text = if (wasCorrect) "✅ Doğru Cevap!" else "❌ Yanlış Cevap",
                                                fontWeight = FontWeight.Bold,
                                                color = if (wasCorrect) Color.Green else Color.Red,
                                                fontSize = 12.sp
                                            )
                                            Spacer(modifier = Modifier.height(4.dp))
                                            Text(
                                                text = q.explanation,
                                                fontSize = 11.sp,
                                                color = IvoryWhite,
                                                lineHeight = 16.sp
                                            )
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.height(16.dp))

                                if (!hasAnsweredCurrentQuestion) {
                                    Button(
                                        onClick = {
                                            if (selectedOption != null) {
                                                hasAnsweredCurrentQuestion = true
                                                if (selectedOption == q.correctIdx) {
                                                    score += 10 // 10 questions, 10 points each = 100 max
                                                }
                                            }
                                        },
                                        enabled = selectedOption != null,
                                        colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                                        modifier = Modifier.fillMaxWidth().testTag("check_answer_btn")
                                    ) {
                                        Text("Cevabı Kontrol Et", color = MidnightObsidian, fontWeight = FontWeight.Bold)
                                    }
                                } else {
                                    Button(
                                        onClick = {
                                            if (currentQuestionIdx + 1 < questions.size) {
                                                currentQuestionIdx++
                                                selectedOption = null
                                                hasAnsweredCurrentQuestion = false
                                            } else {
                                                quizActive = false
                                                quizCompleted = true
                                                // Save the high score
                                                val prevScore = profile?.academyScore ?: 0
                                                if (score > prevScore) {
                                                    viewModel.updateAcademyScore(score)
                                                }
                                            }
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                                        modifier = Modifier.fillMaxWidth().testTag("next_quiz_btn")
                                    ) {
                                        Text(
                                            text = if (currentQuestionIdx + 1 < questions.size) "Sonraki Soru" else "Sınavı Bitir",
                                            color = MidnightObsidian,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        }
                    }
                } else if (quizCompleted) {
                    item {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Column(modifier = Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(64.dp), tint = Color.Green)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Tebrikler! Sınavı Tamamladınız.", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                Spacer(modifier = Modifier.height(8.dp))
                                Text("Bu Sınavdaki Skorunuz: $score / 100", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = AmberAccent)
                                Spacer(modifier = Modifier.height(16.dp))
                                Text(
                                    text = "Akademik başarı puanınız güncellendi. Başarı durumunuza göre sertifikanızı quiz anasayfasından inceleyebilirsiniz.",
                                    fontSize = 12.sp,
                                    color = IvoryWhite,
                                    textAlign = TextAlign.Center,
                                    lineHeight = 16.sp
                                )
                                Spacer(modifier = Modifier.height(20.dp))
                                Button(
                                    onClick = { quizCompleted = false },
                                    colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text("Akademi Sınav Merkezine Dön", color = MidnightObsidian, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }

            "resources" -> {
                // Nested tabs inside resources: Glossary, Laws, Precedents
                
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        val rTabs = listOf(
                            "glossary" to "Sözlük",
                            "laws" to "Kanun Özetleri",
                            "cases" to "Yargı Kararları"
                        )
                        rTabs.forEach { (key, label) ->
                            val isSelected = resourceSubTab == key
                            Card(
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { resourceSubTab = key },
                                colors = CardDefaults.cardColors(
                                    containerColor = if (isSelected) SlateGrey else MidnightObsidian
                                ),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = label,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isSelected) GoldLight else IvoryWhite
                                    )
                                }
                            }
                        }
                    }
                }

                if (resourceSubTab == "glossary") {
                    // Glossary search
                    item {
                        OutlinedTextField(
                            value = glossarySearch,
                            onValueChange = { glossarySearch = it },
                            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = SoftGrey) },
                            placeholder = { Text("Hukuki terim ara...", color = SoftGrey, fontSize = 12.sp) },
                            modifier = Modifier.fillMaxWidth(),
                            textStyle = TextStyle(color = IvoryWhite, fontSize = 13.sp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = GoldDark,
                                unfocusedBorderColor = SlateGrey
                            )
                        )
                    }

                    val filteredTerms = glossaryTerms.filter {
                        it.term.contains(glossarySearch, ignoreCase = true) ||
                        it.definition.contains(glossarySearch, ignoreCase = true)
                    }

                    if (filteredTerms.isEmpty()) {
                        item {
                            Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                                Text("Aramanıza uygun terim bulunamadı.", color = SoftGrey, fontSize = 12.sp)
                            }
                        }
                    } else {
                        items(filteredTerms.size) { index ->
                            val term = filteredTerms[index]
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Text(text = term.term, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(text = term.definition, fontSize = 12.sp, color = IvoryWhite, lineHeight = 16.sp)
                                }
                            }
                        }
                    }
                } else if (resourceSubTab == "laws") {
                    // Laws & Regulations
                    val majorLaws = listOf(
                        "Anayasa (1982)" to "Devlet organlarının işleyişini, yargı denetimini ve hak arama hürriyetini güvenceye bağlayan 177 esas maddelik en üst hukuk normudur.",
                        "Türk Medeni Kanunu (TMK)" to "Kişiler hukuku, aile hukuku, miras hukuku ve eşya hukuku alanlarını kapsayan, dürüstlük kuralını temel edinen (TMK m.2) 1030 maddelik özel hukuk mevzuatıdır.",
                        "Türk Borçlar Kanunu (TBK)" to "Sözleşmeler, haksız fiil sorumlulukları, borç ilişkilerinin doğumu, ifası ve temerrüdü düzenleyen 649 maddelik temel borç ilişkileri kanunudur.",
                        "Türk Ceza Kanunu (TCK)" to "Suçları, cezaları, güvenlik tedbirlerini, iştirak, teşebbüs ve ceza indirimlerini belirleyen 345 maddelik amme (kamu) hukuku kanunudur.",
                        "İş Kanunu (4857 Sayılı)" to "İşçi-işveren haklarını, çalışma sürelerini, ihbar ve kıdem tazminatları ile iş güvencesi iade şartlarını barındıran sosyal amaçlı kanundur."
                    )
                    items(majorLaws.size) { idx ->
                        val (title, summary) = majorLaws[idx]
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(title, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(summary, fontSize = 12.sp, color = IvoryWhite, lineHeight = 16.sp)
                            }
                        }
                    }
                } else {
                    // Court Cases / Landmark Precedents
                    items(courtPrecedents.size) { idx ->
                        val case = courtPrecedents[idx]
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(case.title, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = AmberAccent)
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(case.summary, fontSize = 12.sp, color = IvoryWhite, lineHeight = 16.sp)
                            }
                        }
                    }
                }
            }

            "exam_prep" -> {
                // Exam preparation guidelines and study notes
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(CharcoalNavy, RoundedCornerShape(12.dp))
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "✍️ Hukuk Sınavlarına Hazırlık Rehberi",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = GoldLight
                        )
                        Text(
                            text = "Adli/İdari Yargı Hakimlik-Savcılık Sınavı, KPSS Hukuk ve Fakülte Finalleri için yüksek verimli ders planlama tüyoları:",
                            fontSize = 12.sp,
                            color = IvoryWhite,
                            lineHeight = 16.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        
                        val prepGuides = listOf(
                            "Adli ve İdari Hakimlik" to "Sınavda Alan Bilgisi %70, Genel Kültür %30 etki etmektedir. Medeni Usul, İYUK ve Ceza Muhakemesi ağırlıklı çıkmaktadır. Her gün en az 100 özgün soru çözülmeli ve kanun metinleri (kanun okuması) ihmal edilmemelidir.",
                            "KPSS Hukuk (A Grubu)" to "Anayasa, İdare, Ceza, Borçlar, Medeni, Ticaret ve İcra İflas Hukuku dersleri eşit ağırlıktadır. Güncel mevzuat değişiklikleri yakından takip edilmelidir.",
                            "Fakülte Pratik Çalışmaları" to "Olay sorularını çözerken mutlaka: 1) Olayın Özeti, 2) Hukuki Uyuşmazlık Tanımı, 3) İlgili Mevzuat Maddesi, 4) Doktrindeki Görüşler ve 5) Gerekçeli Karar sırasını izleyin."
                        )
                        
                        prepGuides.forEach { (title, desc) ->
                            Text(text = "• $title:", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = AmberAccent)
                            Text(text = desc, fontSize = 12.sp, color = SoftGrey, lineHeight = 16.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                        }
                    }
                }

                // Current Legal News Section
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp)
                    ) {
                        Text(
                            text = "📰 Güncel Hukuk Haberleri",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = GoldLight
                        )
                        Text(
                            text = "Mevzuattaki en son değişiklikler ve önemli resmi duyurular.",
                            fontSize = 11.sp,
                            color = SoftGrey
                        )
                    }
                }

                val legalNews = listOf(
                    "7501 Sayılı Kanun Değişikliği Yürürlükte" to "Borçlar Kanunu ve Hukuk Muhakemeleri Kanunundaki bazı parasal sınırlar ve tebligat usullerinde yapılan köklü güncellemeler Resmi Gazete'de ilan edildi.",
                    "Adli Yargı Sınav Tarihleri Açıklandı" to "ÖSYM tarafından bu yıl düzenlenecek olan Hakimlik ve Savcılık Sınavı başvuru tarihleri ve sınav takvimi kılavuzu yayınlandı.",
                    "Arabuluculuk Kapsamı Genişliyor" to "Kira uyuşmazlıklarından sonra bazı aile ve eşya hukuku uyuşmazlıklarının da dava öncesi zorunlu arabuluculuk kapsamına alınmasına dair taslak çalışma Meclis'e sunuldu."
                )

                items(legalNews.size) { idx ->
                    val (title, summary) = legalNews[idx]
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(title, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = MidnightObsidian),
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text("Yeni", fontSize = 9.sp, color = AmberAccent, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                                }
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(summary, fontSize = 12.sp, color = IvoryWhite, lineHeight = 16.sp)
                        }
                    }
                }

                // Academic Petition Examples
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp)
                    ) {
                        Text(
                            text = "📄 Akademik Dilekçe Şablonları",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = GoldLight
                        )
                        Text(
                            text = "Öğrencilerin pratik çalışmalarında incelemesi için hazırlanan standart dilekçeler.",
                            fontSize = 11.sp,
                            color = SoftGrey
                        )
                    }
                }

                items(petitionTemplates.size) { idx ->
                    val template = petitionTemplates[idx]
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(template.title, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                IconButton(onClick = {
                                    clipboardManager.setText(AnnotatedString(template.content))
                                    Toast.makeText(context, "Dilekçe şablonu kopyalandı!", Toast.LENGTH_SHORT).show()
                                }) {
                                    Icon(Icons.Default.ContentCopy, contentDescription = "Kopyala", tint = GoldLight)
                                }
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = template.content,
                                fontSize = 11.sp,
                                color = IvoryWhite.copy(alpha = 0.9f),
                                fontFamily = FontFamily.Monospace,
                                maxLines = 8,
                                overflow = TextOverflow.Ellipsis,
                                lineHeight = 14.sp
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Button(
                                onClick = {
                                    clipboardManager.setText(AnnotatedString(template.content))
                                    Toast.makeText(context, "Tüm içerik kopyalandı!", Toast.LENGTH_SHORT).show()
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = SlateGrey),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("Şablon Metnini Kopyala", fontSize = 11.sp, color = GoldLight)
                            }
                        }
                    }
                }
            }
        }
    }
}

// Data models for the tabs
data class VideoLecture(val title: String, val duration: String, val category: String, val description: String)
data class CourtPrecedent(val title: String, val summary: String)
data class GlossaryTerm(val term: String, val definition: String)
data class PetitionTemplate(val title: String, val content: String)

data class QuizQuestion(
    val question: String,
    val options: List<String>,
    val correctIdx: Int,
    val explanation: String
)

// --- Tab 5: Sesli Avukat AI (Voice Lawyer) ---
@Composable
fun VoiceLawyerScreen(viewModel: LegalViewModel) {
    val isListening by viewModel.voiceState.collectAsStateWithLifecycle()
    val queryText by viewModel.voiceText.collectAsStateWithLifecycle()
    val responseText by viewModel.voiceResponse.collectAsStateWithLifecycle()

    var showSampleQuestions by remember { mutableStateOf(true) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "🎤 " + getStr("voice_assistant", viewModel),
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = GoldLight
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Konuşun, yapay zeka avukatınız sesli olarak yanıt versin.",
                    fontSize = 12.sp,
                    color = SoftGrey
                )
            }
        }

        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Speech Waves Simulation
                    Box(
                        modifier = Modifier
                            .size(120.dp)
                            .background(CharcoalNavy, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        if (isListening) {
                            // Audio Pulse Waves Mock using infinite animation scale
                            val infiniteTransition = rememberInfiniteTransition()
                            val scale1 by infiniteTransition.animateFloat(
                                initialValue = 0.8f,
                                targetValue = 1.6f,
                                animationSpec = infiniteRepeatable(
                                    animation = tween(800, easing = LinearEasing),
                                    repeatMode = RepeatMode.Reverse
                                )
                            )
                            Box(
                                modifier = Modifier
                                    .size((80 * scale1).dp)
                                    .background(GoldDark.copy(alpha = 0.15f), CircleShape)
                            )
                        }
                        IconButton(
                            onClick = {
                                if (isListening) {
                                    viewModel.stopVoiceAssistant()
                                } else {
                                    viewModel.startVoiceAssistant()
                                }
                            },
                            modifier = Modifier
                                .size(80.dp)
                                .background(if (isListening) Color.Red else GoldDark, CircleShape)
                                .testTag("voice_mic_button")
                        ) {
                            Icon(
                                imageVector = if (isListening) Icons.Default.MicOff else Icons.Default.Mic,
                                contentDescription = "Mic",
                                tint = MidnightObsidian,
                                modifier = Modifier.size(36.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = if (isListening) "Yapay Zeka Dinliyor..." else getStr("voice_speak", viewModel),
                        color = if (isListening) Color.Red else SoftGrey,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        if (queryText.isNotEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Söylediğiniz:", fontSize = 11.sp, color = GoldLight)
                        Text(queryText, fontSize = 13.sp, color = IvoryWhite, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        if (responseText.isNotEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                    border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.3f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Yapay Zeka Avukat Cevabı:", fontSize = 11.sp, color = GoldLight)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(responseText, fontSize = 13.sp, color = IvoryWhite, lineHeight = 18.sp)
                    }
                }
            }
        }

        if (showSampleQuestions && !isListening) {
            item {
                Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Mikrofonu Açıp Şunları Sorabilirsiniz:", fontSize = 12.sp, color = GoldLight)
                    listOf(
                        "Kıdem tazminatımı almak için ne yapmalıyım?",
                        "Kira sözleşmem bitti ev sahibi beni çıkarabilir mi?",
                        "İtiraz süreleri ne zaman başlar?"
                    ).forEach { sample ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    viewModel.startVoiceAssistant()
                                    viewModel.submitVoiceQuery(sample)
                                },
                            colors = CardDefaults.cardColors(containerColor = CharcoalNavy.copy(alpha = 0.3f))
                        ) {
                            Text(sample, fontSize = 12.sp, color = SoftGrey, modifier = Modifier.padding(12.dp))
                        }
                    }
                }
            }
        }
    }
}

// --- Tab 6: Document Camera OCR ---
@Composable
fun CameraOCRScreen(viewModel: LegalViewModel) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var isCapturing by remember { mutableStateOf(false) }
    var mockScannedText by remember { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "📷 " + getStr("camera_scanner", viewModel),
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = GoldLight
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Belgelerin fotoğrafını çekin, yapay zeka metinleri anında okusun ve analiz etsin.",
                    fontSize = 12.sp,
                    color = SoftGrey
                )
            }
        }

        item {
            // Simulated Camera Frame Box
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(280.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Black),
                border = BorderStroke(2.dp, GoldDark)
            ) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    if (isCapturing) {
                        CircularProgressIndicator(color = GoldDark)
                    } else if (mockScannedText.isNotEmpty()) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(16.dp)
                                .verticalScroll(rememberScrollState()),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text("Metin Başarıyla Okundu ✔", fontSize = 12.sp, color = SuccessGreen, fontWeight = FontWeight.Bold)
                            Text(mockScannedText, fontSize = 12.sp, color = IvoryWhite, fontFamily = FontFamily.Monospace)
                        }
                    } else {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                imageVector = Icons.Default.CameraAlt,
                                contentDescription = null,
                                modifier = Modifier.size(64.dp),
                                tint = SlateGrey
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Belgeyi Kadraja Hizalayın", color = SoftGrey, fontSize = 12.sp)
                        }
                    }
                }
            }
        }

        item {
            Button(
                onClick = {
                    isCapturing = true
                    scope.launch {
                        delay(2000)
                        isCapturing = false
                        mockScannedText = Localization.get("camera_mock_text", "TR")
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                modifier = Modifier.fillMaxWidth().testTag("scan_capture_btn")
            ) {
                Text(getStr("camera_capture", viewModel), color = MidnightObsidian, fontWeight = FontWeight.Bold)
            }
        }

        if (mockScannedText.isNotEmpty()) {
            item {
                Button(
                    onClick = {
                        // Resets scanning
                        mockScannedText = ""
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SlateGrey),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Yeni Belge Tara", color = IvoryWhite)
                }
            }
        }
    }
}

// --- Tab 7: Settings Screen ---
@Composable
fun SettingsScreen(
    viewModel: LegalViewModel,
    onEnterAdmin: () -> Unit,
    onGoToPayment: () -> Unit
) {
    val profile by viewModel.userProfile.collectAsStateWithLifecycle()
    val scope = rememberCoroutineScope()
    var nameInput by remember { mutableStateOf("") }
    var isUploadingReceipt by remember { mutableStateOf(false) }

    val user = profile ?: return

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "⚙️ " + getStr("settings", viewModel),
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = GoldLight
            )
        }

        // Profile Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                modifier = Modifier.fillMaxWidth(),
                border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.4f))
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Profil Bilgileri", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                        Surface(
                            color = if (user.isAdmin) GoldDark.copy(alpha = 0.15f) else SlateGrey,
                            shape = RoundedCornerShape(4.dp),
                            border = BorderStroke(1.dp, if (user.isAdmin) GoldDark else SoftGrey)
                        ) {
                            Text(
                                text = if (user.isAdmin) "SİSTEM YÖNETİCİSİ" else "STANDART AVUKAT",
                                color = if (user.isAdmin) GoldDark else IvoryWhite,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = nameInput.ifEmpty { user.userName },
                            onValueChange = { nameInput = it },
                            label = { Text("Avukat / Kullanıcı Adı") },
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                            modifier = Modifier.weight(1f)
                        )
                        Button(
                            onClick = { if (nameInput.isNotEmpty()) viewModel.setUserName(nameInput) },
                            colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                            modifier = Modifier.height(56.dp)
                        ) {
                            Text(getStr("save", viewModel), color = MidnightObsidian)
                        }
                    }

                    HorizontalDivider(color = SlateGrey.copy(alpha = 0.3f))

                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = "Kayıtlı E-Posta Adresi",
                            fontSize = 11.sp,
                            color = SoftGrey
                        )
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = null,
                                tint = GoldDark,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = user.email,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = IvoryWhite
                            )
                        }
                    }
                }
            }
        }

        // Dynamic Premium Section
        item {
            val isPremium = user.isPremium
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                modifier = Modifier.fillMaxWidth(),
                border = BorderStroke(1.dp, if (isPremium) SuccessGreen.copy(alpha = 0.4f) else WarningOrange.copy(alpha = 0.4f))
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (isPremium) "Premium Hukuk Lisansı" else "Standart Üyelik",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = GoldLight
                        )
                        Surface(
                            color = if (isPremium) SuccessGreen.copy(alpha = 0.15f) else WarningOrange.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = if (isPremium) "SÜRESİZ LİSANS" else "ÜCRETSİZ SÜRÜM",
                                color = if (isPremium) SuccessGreen else WarningOrange,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }

                    Text(
                        text = if (isPremium) {
                            "Hesabınız için Ömür Boyu Sınırsız Premium lisansı aktiftir. Tüm yapay zeka analizleri, otomatik dilekçe hazırlama, duruşma takibi ve dava simülasyonu özellikleri kısıtlamasız olarak kullanılabilir."
                        } else {
                            "Dava simülasyonu, ileri düzey yapay zeka analizleri ve limitsiz dilekçe hazırlamak için Premium lisansına geçin. Banka transferi ile ödemenizi gerçekleştirip anında onay alabilirsiniz."
                        },
                        fontSize = 12.sp,
                        color = IvoryWhite,
                        lineHeight = 18.sp
                    )

                    Button(
                        onClick = onGoToPayment,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isPremium) SlateGrey else GoldDark
                        ),
                        modifier = Modifier.fillMaxWidth().height(40.dp).testTag("goto_payment_screen_btn")
                    ) {
                        Icon(
                            imageVector = if (isPremium) Icons.Default.ReceiptLong else Icons.Default.WorkspacePremium,
                            contentDescription = null,
                            tint = if (isPremium) IvoryWhite else MidnightObsidian,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (isPremium) "Ödeme Bilgileri & Dekont Gönder" else "Premium'a Yükselt (Ödeme Sayfası)",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isPremium) IvoryWhite else MidnightObsidian
                        )
                    }
                }
            }
        }

        // Demo / Simulation Testing Controllers (CRITICAL for instant preview verification)
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.2f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "🛠️ Rol & Durum Değiştirici (Simülasyon)",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = GoldDark
                    )
                    Text(
                        text = "Müşteri ödeme ve yönetici onay akışlarını anında test etmek için hesabınızın rolünü buradan dinamik olarak değiştirebilirsiniz:",
                        fontSize = 10.sp,
                        color = SoftGrey,
                        lineHeight = 14.sp
                    )
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Yönetici Yetkisi (Admin)", fontSize = 12.sp, color = IvoryWhite)
                        Switch(
                            checked = user.isAdmin,
                            onCheckedChange = { viewModel.toggleAdminRole() },
                            modifier = Modifier.testTag("simulate_admin_switch")
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Premium Abonelik Durumu", fontSize = 12.sp, color = IvoryWhite)
                        Switch(
                            checked = user.isPremium,
                            onCheckedChange = { viewModel.togglePremiumRole() },
                            modifier = Modifier.testTag("simulate_premium_switch")
                        )
                    }
                }
            }
        }

        // Language Support Section
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(getStr("language", viewModel), fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf(
                            "TR" to "Türkçe",
                            "EN" to "English",
                            "DE" to "Deutsch",
                            "AR" to "العربية"
                        ).forEach { (code, name) ->
                            val isSelected = user.language == code
                            Button(
                                onClick = { viewModel.updateLanguage(code) },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isSelected) GoldDark else SlateGrey
                                ),
                                modifier = Modifier.weight(1f).testTag("lang_btn_$code")
                            ) {
                                Text(
                                    text = name,
                                    fontSize = 11.sp,
                                    color = if (isSelected) MidnightObsidian else IvoryWhite,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }
                }
            }
        }

        // Admin Panel Access for Administrators
        if (user.isAdmin) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = GoldDark.copy(alpha = 0.12f)),
                    modifier = Modifier.fillMaxWidth(),
                    border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.5f)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Security,
                                contentDescription = "Admin",
                                tint = GoldDark,
                                modifier = Modifier.size(24.dp)
                            )
                            Column {
                                Text(
                                    text = "AL Hukuk AI - Yönetici Paneli",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = GoldLight
                                )
                                Text(
                                    text = "Kurumsal Kontrol & Yapay Zeka Denetimi",
                                    fontSize = 11.sp,
                                    color = SoftGrey
                                )
                            }
                        }

                        Text(
                            text = "Bu hesap sistem yöneticisi yetkilerine sahiptir. Kullanıcılar, ödemeler, belgeler, sistem promptları, bütçe limitleri, detaylı sistem logları ve gelişmiş Yapay Zeka Kontrol Merkezi gibi tüm kurumsal operasyonları buradan denetleyebilirsiniz.",
                            fontSize = 12.sp,
                            color = IvoryWhite,
                            lineHeight = 18.sp
                        )

                        Button(
                            onClick = onEnterAdmin,
                            colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(44.dp)
                                .testTag("enter_admin_portal_btn"),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Security,
                                contentDescription = null,
                                tint = MidnightObsidian,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "YÖNETİCİ PORTALINA GİRİŞ",
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                color = MidnightObsidian
                            )
                        }
                    }
                }
            }
        }
    }
}

// ==========================================
// AL HUKUK AI - ADMIN PANEL SYSTEM (ENTERPRISE)
// ==========================================

data class AdminUser(
    val id: Int,
    val name: String,
    val email: String,
    val isPremium: Boolean,
    val isActive: Boolean,
    val date: String,
    val ip: String,
    val device: String,
    val tokens: Int
)

data class AdminReceipt(
    val id: Int,
    val userName: String,
    val email: String,
    val iban: String,
    val amount: String,
    val date: String,
    val filename: String
)

data class AdminDoc(
    val id: Int,
    val name: String,
    val uploader: String,
    val size: String,
    val date: String,
    val warning: String,
    val status: String,
    val content: String
)

data class AdminAuditLog(
    val timestamp: String,
    val ip: String,
    val user: String,
    val action: String,
    val type: String, // INFO, WARNING, ERROR, SECURITY
    val detail: String
)

data class AdminTicket(
    val id: Int,
    val user: String,
    val title: String,
    val date: String,
    val status: String, // Açık, Çözüldü
    val message: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminPanelScreen(viewModel: LegalViewModel, onExit: () -> Unit) {
    var selectedSection by remember { mutableStateOf("dashboard") }
    val context = LocalContext.current

    // Observe database payment receipts
    val dbReceipts by viewModel.paymentReceipts.collectAsStateWithLifecycle()

    // Admin Data States
    var usersList by remember { mutableStateOf(listOf(
        AdminUser(1, "Av. Kerem Soylu", "guzelkokarizzet625@gmail.com", true, true, "13.07.2026", "192.168.1.12", "Macbook Pro / macOS", 124500),
        AdminUser(2, "Av. Meltem Aras", "meltem.aras@hukuk.com", true, true, "12.07.2026", "85.105.42.11", "iPhone 15 / iOS", 48200),
        AdminUser(3, "Stj. Caner Akın", "caner.akin@soyluhukuk.com", false, true, "10.07.2026", "94.54.120.8", "Galaxy S24 / Android", 12800),
        AdminUser(4, "Av. Selim Yazıcı", "selim@yazici-hukuk.av.tr", false, false, "08.07.2026", "176.42.15.99", "Windows PC / Chrome", 3200)
    )) }

    var pendingReceipts by remember { mutableStateOf(listOf(
        AdminReceipt(1, "Av. Meltem Aras", "meltem.aras@hukuk.com", "TR96 0006 2000 0001 2345 6789 01", "₺450.00", "13.07.2026", "MeltemAras_Dekont.pdf"),
        AdminReceipt(2, "Av. Selim Yazıcı", "selim@yazici-hukuk.av.tr", "TR96 0006 2000 0001 2345 6789 01", "₺450.00", "12.07.2026", "SelimYazici_Banka_Transferi.pdf")
    )) }

    val mergedPendingReceipts = remember(pendingReceipts, dbReceipts) {
        val dbPending = dbReceipts.filter { it.status == "PENDING" }.map {
            AdminReceipt(
                id = -it.id, // negative ID to distinguish from mock hardcoded receipts
                userName = it.senderName,
                email = it.email,
                iban = it.iban,
                amount = it.amount,
                date = it.date,
                filename = it.receiptFileName
            )
        }
        dbPending + pendingReceipts
    }

    var documentList by remember { mutableStateOf(listOf(
        AdminDoc(1, "Is_Sozlesmesi_Taslagi.pdf", "Av. Kerem Soylu", "12.4 MB", "13.07.2026", "Yüksek Risk (İmza Eksik, Rekabet Yasağı Ağır)", "OCR Tamamlandı", "İŞ SÖZLEŞMESİDİR: İşbu sözleşme işveren ile çalışan arasında tanzim edilmiştir. Çalışan, rekabet yasağı gereği 5 yıl boyunca başka bir şirkette görev yapamayacaktır. İmza: [Eksik]"),
        AdminDoc(2, "Kira_Tahliye_Ihtari.pdf", "Av. Meltem Aras", "2.1 MB", "12.07.2026", "Temiz (KVKK Uyumlu)", "OCR Tamamlandı", "İHTARNAMEDİR: Borçlu kiracının birikmiş 3 aylık kira bedelini 30 gün içinde ödemesi, aksi takdirde tahliye davası açılacağı ihtar olunur."),
        AdminDoc(3, "Savunma_Dilekcesi_V2.docx", "Stj. Caner Akın", "1.1 MB", "11.07.2026", "Hassas İçerik (Sanık Kimlik Bilgileri Açık)", "OCR Tamamlandı", "AĞIR CEZA MAHKEMESİNE: Sanık K.S. hakkında isnat edilen suçlamalara karşı esas hakkındaki savunmalarımız sunulmaktadır. TC: 12345678901")
    )) }

    var systemPrompt by remember { mutableStateOf(
        "Sen gelişmiş bir AL Hukuk Yapay Zeka İşletim Sistemi asistanısın. Kullanıcıya hukuki süreçlerde, mevzuat sorgularında, dilekçe taslağı hazırlamada ve dava analizi yapmada profesyonel destek sağlarsın. Cevapların her zaman yasal referanslara, içtihat kararlarına ve yürürlükteki kanun maddelerine dayanmalıdır. Kesinlikle yanlış veya uydurma kanun maddesi paylaşmamalısın."
    ) }

    var selectedModel by remember { mutableStateOf("Gemini 1.5 Pro") }

    var ticketList by remember { mutableStateOf(listOf(
        AdminTicket(1, "Av. Meltem Aras", "Gemini API Bağlantı Hatası", "13.07.2026", "Açık", "Arada sırada dilekçe hazırlarken zaman aşımı hatası alıyorum. Model yanıt vermiyor."),
        AdminTicket(2, "Stj. Caner Akın", "Akademi Puanı Yüklenmedi", "11.07.2026", "Çözüldü", "Sınavı bitirdim fakat puanım profilime yansımadı. Düzeltilmesini talep ediyorum.")
    )) }

    var activeCoupons by remember { mutableStateOf(listOf(
        "HUKUK50" to "50% İndirim",
        "PREMIUMSTAR" to "30% İndirim"
    )) }

    var selectedUserIdDetails by remember { mutableStateOf<Int?>(null) }
    var viewingReceiptId by remember { mutableStateOf<Int?>(null) }
    var viewingDocId by remember { mutableStateOf<Int?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MidnightObsidian)
    ) {
        // --- 1. Immersive Header (M3 Admin Style) ---
        Card(
            colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
            shape = RoundedCornerShape(0.dp, 0.dp, 24.dp, 24.dp),
            border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.2f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = onExit) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Exit", tint = GoldDark)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = "AL HUKUK AI",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black,
                                color = GoldDark,
                                letterSpacing = 2.sp
                            )
                            Text(
                                text = "Yönetici Kontrol Paneli",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = GoldLight
                            )
                        }
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Server Status Badge
                        Surface(
                            color = SuccessGreen.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(6.dp),
                            border = BorderStroke(1.dp, SuccessGreen)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .background(SuccessGreen, CircleShape)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("SUNUCU: AKTİF", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = SuccessGreen)
                            }
                        }
                        // Admin Mail Badge
                        Surface(
                            color = WarningOrange.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(6.dp),
                            border = BorderStroke(1.dp, WarningOrange)
                        ) {
                            Text(
                                text = "ADMİN: guzelkokarizzet",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = WarningOrange,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // --- 2. Horizontal Scrolling Tab Selector ---
                LazyRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val sections = listOf(
                        "dashboard" to "📊 Özet",
                        "users" to "👥 Kullanıcılar",
                        "payments" to "💰 Ödemeler",
                        "documents" to "📄 Belgeler",
                        "ai_manage" to "🤖 AI Ayarları",
                        "ai_control" to "🧠 AI Kontrol",
                        "content" to "📚 İçerik",
                        "notifications" to "📢 Bildirimler",
                        "premium" to "⭐ Paketler",
                        "analytics" to "📈 Analitik",
                        "logs" to "📝 Loglar",
                        "security" to "🛡️ Güvenlik",
                        "support" to "📋 Destek",
                        "settings" to "⚙️ Ayarlar",
                        "future" to "🔥 Gelecek"
                    )

                    items(sections) { item ->
                        val id = item.first
                        val label = item.second
                        val isSelected = selectedSection == id
                        Surface(
                            onClick = { selectedSection = id },
                            color = if (isSelected) GoldDark else SlateGrey.copy(alpha = 0.4f),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, if (isSelected) GoldDark else SlateGrey),
                            modifier = Modifier.testTag("admin_sec_$id")
                        ) {
                            Text(
                                text = label,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) MidnightObsidian else IvoryWhite,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                            )
                        }
                    }
                }
            }
        }

        // --- 3. Viewport Render ---
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            when (selectedSection) {
                "dashboard" -> DashboardSectionView(usersList, mergedPendingReceipts, documentList, ticketList)
                "users" -> UsersSectionView(
                    usersList = usersList,
                    selectedUserId = selectedUserIdDetails,
                    onSelectUser = { selectedUserIdDetails = if (selectedUserIdDetails == it) null else it },
                    onTogglePremium = { id ->
                        usersList = usersList.map { if (it.id == id) it.copy(isPremium = !it.isPremium) else it }
                        Toast.makeText(context, "Kullanıcı üyelik durumu güncellendi!", Toast.LENGTH_SHORT).show()
                    },
                    onToggleActive = { id ->
                        usersList = usersList.map { if (it.id == id) it.copy(isActive = !it.isActive) else it }
                        Toast.makeText(context, "Kullanıcı hesap durumu değiştirildi!", Toast.LENGTH_SHORT).show()
                    },
                    onDeleteUser = { id ->
                        usersList = usersList.filter { it.id != id }
                        Toast.makeText(context, "Kullanıcı hesabı kalıcı olarak silindi!", Toast.LENGTH_SHORT).show()
                    }
                )
                "payments" -> PaymentsSectionView(
                    pendingReceipts = mergedPendingReceipts,
                    viewingReceiptId = viewingReceiptId,
                    onViewReceipt = { viewingReceiptId = it },
                    onApproveReceipt = { id ->
                        if (id < 0) {
                            val dbReceiptId = -id
                            val dbReceipt = dbReceipts.find { it.id == dbReceiptId }
                            if (dbReceipt != null) {
                                viewModel.approvePaymentReceipt(dbReceipt)
                                Toast.makeText(context, "Dekont onaylandı. Kullanıcı Premium yapıldı!", Toast.LENGTH_LONG).show()
                            }
                        } else {
                            val receipt = pendingReceipts.find { it.id == id }
                            if (receipt != null) {
                                usersList = usersList.map { if (it.email == receipt.email) it.copy(isPremium = true) else it }
                                pendingReceipts = pendingReceipts.filter { it.id != id }
                                Toast.makeText(context, "Mock dekont onaylandı. Kullanıcı Premium yapıldı!", Toast.LENGTH_LONG).show()
                            }
                        }
                    },
                    onRejectReceipt = { id ->
                        if (id < 0) {
                            val dbReceiptId = -id
                            val dbReceipt = dbReceipts.find { it.id == dbReceiptId }
                            if (dbReceipt != null) {
                                viewModel.rejectPaymentReceipt(dbReceipt)
                                Toast.makeText(context, "Dekont reddedildi ve ödeme iptal edildi!", Toast.LENGTH_SHORT).show()
                            }
                        } else {
                            pendingReceipts = pendingReceipts.filter { it.id != id }
                            Toast.makeText(context, "Mock dekont reddedildi!", Toast.LENGTH_SHORT).show()
                        }
                    }
                )
                "documents" -> DocumentsSectionView(
                    documentList = documentList,
                    viewingDocId = viewingDocId,
                    onViewDoc = { viewingDocId = it }
                )
                "ai_manage" -> AiManageSectionView(
                    currentPrompt = systemPrompt,
                    onSavePrompt = { systemPrompt = it; Toast.makeText(context, "Sistem promptu güncellendi!", Toast.LENGTH_SHORT).show() },
                    selectedModel = selectedModel,
                    onSelectModel = { selectedModel = it }
                )
                "ai_control" -> AiControlSectionView()
                "content" -> ContentSectionView()
                "notifications" -> NotificationsSectionView()
                "premium" -> PremiumSectionView(
                    viewModel = viewModel,
                    activeCoupons = activeCoupons,
                    onAddCoupon = { code, desc ->
                        activeCoupons = activeCoupons + (code to desc)
                        Toast.makeText(context, "İndirim kuponu oluşturuldu!", Toast.LENGTH_SHORT).show()
                    }
                )
                "analytics" -> AnalyticsSectionView()
                "logs" -> LogsSectionView()
                "security" -> SecuritySectionView()
                "support" -> SupportSectionView(
                    ticketList = ticketList,
                    onResolveTicket = { id ->
                        ticketList = ticketList.map { if (it.id == id) it.copy(status = "Çözüldü") else it }
                        Toast.makeText(context, "Destek talebi yanıtlandı ve çözüldü olarak işaretlendi!", Toast.LENGTH_SHORT).show()
                    }
                )
                "settings" -> SettingsSectionView()
                "future" -> FutureSectionView()
            }
        }
    }
}

// --- Sub-Section 1: Dashboard View ---
@Composable
fun DashboardSectionView(
    users: List<AdminUser>,
    receipts: List<AdminReceipt>,
    docs: List<AdminDoc>,
    tickets: List<AdminTicket>
) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = Modifier.fillMaxSize()
    ) {
        // Quick statistics grid
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("📊 Sistem Genel Özeti", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    DashboardCard(modifier = Modifier.weight(1f), title = "Toplam Üye", value = "1,482", sub = "+12% Bu Hafta", color = GoldDark)
                    DashboardCard(modifier = Modifier.weight(1f), title = "Premium Oranı", value = "%27.8", sub = "${users.filter { it.isPremium }.size} Aktif", color = SuccessGreen)
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    DashboardCard(modifier = Modifier.weight(1f), title = "Belge Analiz", value = "3,402", sub = "Bugün: ${docs.size}", color = AmberAccent)
                    DashboardCard(modifier = Modifier.weight(1f), title = "Aktif Destek", value = "${tickets.filter { it.status == "Açık" }.size} Bekleyen", sub = "Bugün: 2", color = ErrorRed)
                }
            }
        }

        // Live Server Resources Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Icon(Icons.Default.Dns, contentDescription = null, tint = GoldDark, modifier = Modifier.size(18.dp))
                            Text("Sunucu Donanım Durumu (Live)", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                        }
                        Text("Gecikme: 14ms", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = SuccessGreen)
                    }

                    // CPU Usage
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("CPU Yükü", fontSize = 11.sp, color = SoftGrey)
                            Text("%24.5", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                        }
                        LinearProgressIndicator(progress = 0.24f, color = GoldDark, trackColor = SlateGrey, modifier = Modifier.fillMaxWidth().height(6.dp).clip(CircleShape))
                    }

                    // Memory Usage
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("RAM Kullanımı (16GB RAM)", fontSize = 11.sp, color = SoftGrey)
                            Text("6.8 GB / 16 GB (%42.5)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                        }
                        LinearProgressIndicator(progress = 0.42f, color = AmberAccent, trackColor = SlateGrey, modifier = Modifier.fillMaxWidth().height(6.dp).clip(CircleShape))
                    }

                    // Database connections
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Aktif Veritabanı Bağlantıları (Pool)", fontSize = 11.sp, color = SoftGrey)
                            Text("12 / 100 bağlantı", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                        }
                        LinearProgressIndicator(progress = 0.12f, color = SuccessGreen, trackColor = SlateGrey, modifier = Modifier.fillMaxWidth().height(6.dp).clip(CircleShape))
                    }
                }
            }
        }

        // Action Notifications Banner
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = GoldDark.copy(alpha = 0.05f)),
                border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.2f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("🔔 Aksiyon Bekleyen Görevler", fontSize = 12.sp, fontWeight = FontWeight.Black, color = GoldDark, letterSpacing = 1.sp)
                    Text("• ${receipts.size} onay bekleyen IBAN ödeme dekontu mevcut.", fontSize = 12.sp, color = IvoryWhite)
                    Text("• Yapay zeka modeli bugün 4.2M token kullandı. Günlük bütçenin %42'sine ulaşıldı.", fontSize = 12.sp, color = IvoryWhite)
                    Text("• ${tickets.filter { it.status == "Açık" }.size} adet yanıtlanmamış canlı kullanıcı destek talebi bulunuyor.", fontSize = 12.sp, color = IvoryWhite)
                }
            }
        }
    }
}

@Composable
fun DashboardCard(
    modifier: Modifier = Modifier,
    title: String,
    value: String,
    sub: String,
    color: Color
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
        border = BorderStroke(1.dp, SlateGrey),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(title, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = SoftGrey, letterSpacing = 0.5.sp)
            Text(value, fontSize = 20.sp, fontWeight = FontWeight.Black, color = color)
            Text(sub, fontSize = 11.sp, color = IvoryWhite)
        }
    }
}

// --- Sub-Section 2: Users Management View ---
@Composable
fun UsersSectionView(
    usersList: List<AdminUser>,
    selectedUserId: Int?,
    onSelectUser: (Int) -> Unit,
    onTogglePremium: (Int) -> Unit,
    onToggleActive: (Int) -> Unit,
    onDeleteUser: (Int) -> Unit
) {
    var search by remember { mutableStateOf("") }
    val filteredUsers = usersList.filter {
        it.name.contains(search, ignoreCase = true) || it.email.contains(search, ignoreCase = true)
    }

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        OutlinedTextField(
            value = search,
            onValueChange = { search = it },
            placeholder = { Text("İsim veya E-Posta ile Kullanıcı Ara...", color = SoftGrey) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = GoldDark) },
            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        )

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(filteredUsers) { user ->
                val isSelected = selectedUserId == user.id
                Card(
                    colors = CardDefaults.cardColors(containerColor = if (isSelected) SlateGrey.copy(alpha = 0.4f) else CharcoalNavy),
                    border = BorderStroke(1.dp, if (isSelected) GoldDark else SlateGrey),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(user.name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                    Spacer(modifier = Modifier.width(6.dp))
                                    if (user.isPremium) {
                                        Surface(color = SuccessGreen.copy(alpha = 0.15f), shape = RoundedCornerShape(4.dp)) {
                                            Text("Premium", color = SuccessGreen, fontSize = 9.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
                                        }
                                    }
                                    if (!user.isActive) {
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Surface(color = ErrorRed.copy(alpha = 0.15f), shape = RoundedCornerShape(4.dp)) {
                                            Text("Donduruldu", color = ErrorRed, fontSize = 9.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
                                        }
                                    }
                                }
                                Text(user.email, fontSize = 11.sp, color = SoftGrey)
                            }

                            Button(
                                onClick = { onSelectUser(user.id) },
                                colors = ButtonDefaults.buttonColors(containerColor = SlateGrey),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                modifier = Modifier.height(28.dp)
                            ) {
                                Text(if (isSelected) "Kapat" else "İşlemler", fontSize = 10.sp, color = IvoryWhite)
                            }
                        }

                        if (isSelected) {
                            Spacer(modifier = Modifier.height(12.dp))
                            HorizontalDivider(color = SlateGrey.copy(alpha = 0.5f))
                            Spacer(modifier = Modifier.height(8.dp))

                            // Details Panel
                            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text("• Kayıt Tarihi: ${user.date}", fontSize = 11.sp, color = IvoryWhite)
                                Text("• Son IP Adresi: ${user.ip}", fontSize = 11.sp, color = IvoryWhite)
                                Text("• Kayıtlı Cihaz: ${user.device}", fontSize = 11.sp, color = IvoryWhite)
                                Text("• Toplam Yapay Zeka Sorgusu: ${user.tokens} Token", fontSize = 11.sp, color = IvoryWhite)
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            // Interactive actions row
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Button(
                                    onClick = { onTogglePremium(user.id) },
                                    colors = ButtonDefaults.buttonColors(containerColor = if (user.isPremium) ErrorRed else SuccessGreen),
                                    modifier = Modifier.weight(1f).height(32.dp),
                                    contentPadding = PaddingValues(0.dp)
                                ) {
                                    Text(if (user.isPremium) "Premium Al" else "Premium Ver", fontSize = 10.sp, color = MidnightObsidian, fontWeight = FontWeight.Bold)
                                }

                                Button(
                                    onClick = { onToggleActive(user.id) },
                                    colors = ButtonDefaults.buttonColors(containerColor = WarningOrange),
                                    modifier = Modifier.weight(1f).height(32.dp),
                                    contentPadding = PaddingValues(0.dp)
                                ) {
                                    Text(if (user.isActive) "Hesabı Dondur" else "Etkinleştir", fontSize = 10.sp, color = MidnightObsidian, fontWeight = FontWeight.Bold)
                                }

                                Button(
                                    onClick = { onDeleteUser(user.id) },
                                    colors = ButtonDefaults.buttonColors(containerColor = ErrorRed),
                                    modifier = Modifier.weight(1f).height(32.dp),
                                    contentPadding = PaddingValues(0.dp)
                                ) {
                                    Text("Hesabı Sil", fontSize = 10.sp, color = Color.White)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// --- Sub-Section 3: Payments Center View ---
@Composable
fun PaymentsSectionView(
    pendingReceipts: List<AdminReceipt>,
    viewingReceiptId: Int?,
    onViewReceipt: (Int?) -> Unit,
    onApproveReceipt: (Int) -> Unit,
    onRejectReceipt: (Int) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Earnings canvas charts mockup card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("📈 Aylık Gelir Grafiği (Son 5 Ay)", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                    Spacer(modifier = Modifier.height(16.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(100.dp)
                            .drawBehind {
                                val heights = listOf(32f, 45f, 62f, 85f, 124f)
                                val maxVal = 130f
                                val barWidth = 40f
                                val spacing = (size.width - (barWidth * heights.size)) / (heights.size + 1)

                                heights.forEachIndexed { index, value ->
                                    val x = spacing + index * (barWidth + spacing)
                                    val barHeight = (value / maxVal) * size.height
                                    val y = size.height - barHeight

                                    drawRoundRect(
                                        color = GoldDark,
                                        topLeft = Offset(x, y),
                                        size = androidx.compose.ui.geometry.Size(barWidth, barHeight),
                                        cornerRadius = CornerRadius(6f, 6f)
                                    )
                                }
                            }
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        listOf("Şub (₺32k)", "Mar (₺45k)", "Nis (₺62k)", "May (₺85k)", "Haz (₺124k)").forEach { label ->
                            Text(label, fontSize = 9.sp, color = SoftGrey, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Pending bank receipts queue header
        item {
            Text("📥 Bekleyen Banka Transfer Dekont Onayları", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
        }

        if (pendingReceipts.isEmpty()) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(modifier = Modifier.padding(24.dp), contentAlignment = Alignment.Center) {
                        Text("Mükemmel! Bekleyen onay ödemesi bulunmuyor.", fontSize = 12.sp, color = SoftGrey)
                    }
                }
            }
        } else {
            items(pendingReceipts) { receipt ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                    border = BorderStroke(1.dp, SlateGrey),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(receipt.userName, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                Text(receipt.email, fontSize = 11.sp, color = SoftGrey)
                            }
                            Text(receipt.amount, fontSize = 14.sp, fontWeight = FontWeight.Black, color = SuccessGreen)
                        }

                        HorizontalDivider(color = SlateGrey.copy(alpha = 0.3f))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Button(
                                onClick = { onViewReceipt(receipt.id) },
                                colors = ButtonDefaults.buttonColors(containerColor = SlateGrey),
                                modifier = Modifier.weight(1.2f).height(32.dp),
                                contentPadding = PaddingValues(0.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Icon(Icons.Default.Description, contentDescription = null, tint = GoldDark, modifier = Modifier.size(14.dp))
                                    Text("Dekontu İncele", fontSize = 10.sp, color = IvoryWhite)
                                }
                            }

                            Button(
                                onClick = { onApproveReceipt(receipt.id) },
                                colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                                modifier = Modifier.weight(1f).height(32.dp),
                                contentPadding = PaddingValues(0.dp)
                            ) {
                                Text("Premium Onayla", fontSize = 10.sp, color = MidnightObsidian, fontWeight = FontWeight.Bold)
                            }

                            Button(
                                onClick = { onRejectReceipt(receipt.id) },
                                colors = ButtonDefaults.buttonColors(containerColor = ErrorRed),
                                modifier = Modifier.weight(0.8f).height(32.dp),
                                contentPadding = PaddingValues(0.dp)
                            ) {
                                Text("Reddet", fontSize = 10.sp, color = Color.White)
                            }
                        }
                    }
                }
            }
        }
    }

    // Interactive receipt viewing dialog simulation
    if (viewingReceiptId != null) {
        val receipt = pendingReceipts.find { it.id == viewingReceiptId }
        if (receipt != null) {
            AlertDialog(
                onDismissRequest = { onViewReceipt(null) },
                confirmButton = {
                    Button(
                        onClick = { onViewReceipt(null) },
                        colors = ButtonDefaults.buttonColors(containerColor = GoldDark)
                    ) {
                        Text("Kapat", color = MidnightObsidian)
                    }
                },
                title = { Text("📄 Havale EFT Dekontu Görüntüleyici", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = GoldLight) },
                text = {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = MidnightObsidian),
                        border = BorderStroke(1.dp, SlateGrey),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text("TÜRKİYE CUMHURİYETİ ZİRAAT BANKASI A.Ş.", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = GoldDark)
                            Text("EFT TRANSFER RAPORU (SİMÜLASYON)", fontSize = 9.sp, color = SoftGrey)
                            HorizontalDivider(color = SlateGrey.copy(alpha = 0.5f))

                            ReceiptField("Referans Kodu", "TXN-${receipt.id}74839625")
                            ReceiptField("İşlem Tarihi", receipt.date)
                            ReceiptField("Gönderen Hesap", receipt.userName)
                            ReceiptField("Gönderen E-Posta", receipt.email)
                            ReceiptField("Alıcı Hesap", "AL HUKUK YAPAY ZEKA TEKNOLOJİLERİ LTD. ŞTİ.")
                            ReceiptField("Alıcı IBAN", receipt.iban)
                            ReceiptField("Transfer Tutarı", receipt.amount)
                            ReceiptField("Açıklama", "AL Hukuk AI 1 Aylık Premium Lisans Satın Alımı")

                            Spacer(modifier = Modifier.height(10.dp))
                            Surface(
                                color = SuccessGreen.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(4.dp),
                                border = BorderStroke(1.dp, SuccessGreen),
                                modifier = Modifier.align(Alignment.CenterHorizontally)
                            ) {
                                Text("İŞLEM BAŞARIYLA GERÇEKLEŞTİ - BANKA ONAYLI", color = SuccessGreen, fontSize = 9.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                            }
                        }
                    }
                },
                containerColor = CharcoalNavy
            )
        }
    }
}

@Composable
fun ReceiptField(label: String, valText: String) {
    Column {
        Text(label, fontSize = 9.sp, color = SoftGrey)
        Text(valText, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = IvoryWhite)
    }
}

// --- Sub-Section 4: Documents Center View ---
@Composable
fun DocumentsSectionView(
    documentList: List<AdminDoc>,
    viewingDocId: Int?,
    onViewDoc: (Int?) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Storage usage progress card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("💾 Bulut Sunucu Depolama Alanı", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                    LinearProgressIndicator(progress = 0.124f, color = GoldDark, trackColor = SlateGrey, modifier = Modifier.fillMaxWidth().height(8.dp).clip(CircleShape))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Kullanılan: 12.4 GB", fontSize = 10.sp, color = SoftGrey)
                        Text("Limit: 100 GB", fontSize = 10.sp, color = SoftGrey)
                    }
                }
            }
        }

        item {
            Text("📄 Yüklenen Kullanıcı Hukuk Belgeleri", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
        }

        items(documentList) { doc ->
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Icon(Icons.Default.Description, contentDescription = null, tint = AmberAccent, modifier = Modifier.size(18.dp))
                            Text(doc.name, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                        }
                        Text(doc.size, fontSize = 11.sp, color = SoftGrey)
                    }

                    Text("Yükleyen: ${doc.uploader} • Tarih: ${doc.date}", fontSize = 11.sp, color = SoftGrey)

                    // Compliance warning status
                    val isDanger = doc.warning.contains("Risk") || doc.warning.contains("İhlal")
                    Surface(
                        color = if (isDanger) ErrorRed.copy(alpha = 0.15f) else SuccessGreen.copy(alpha = 0.15f),
                        shape = RoundedCornerShape(4.dp),
                        border = BorderStroke(1.dp, if (isDanger) ErrorRed else SuccessGreen)
                    ) {
                        Text(
                            text = "Gözetim Analizi: ${doc.warning}",
                            color = if (isDanger) ErrorRed else SuccessGreen,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }

                    Button(
                        onClick = { onViewDoc(doc.id) },
                        colors = ButtonDefaults.buttonColors(containerColor = SlateGrey),
                        modifier = Modifier.fillMaxWidth().height(28.dp),
                        contentPadding = PaddingValues(0.dp)
                    ) {
                        Text("OCR ve Belge Metnini Göster", fontSize = 11.sp, color = IvoryWhite)
                    }
                }
            }
        }
    }

    // Document text preview popup
    if (viewingDocId != null) {
        val doc = documentList.find { it.id == viewingDocId }
        if (doc != null) {
            AlertDialog(
                onDismissRequest = { onViewDoc(null) },
                confirmButton = {
                    Button(onClick = { onViewDoc(null) }, colors = ButtonDefaults.buttonColors(containerColor = GoldDark)) {
                        Text("Kapat", color = MidnightObsidian)
                    }
                },
                title = { Text("📝 OCR Taraması & Çözümlenen Metin", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight) },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("Belge: ${doc.name}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = GoldDark)
                        Card(
                            colors = CardDefaults.cardColors(containerColor = MidnightObsidian),
                            border = BorderStroke(1.dp, SlateGrey),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(200.dp)
                                .verticalScroll(rememberScrollState())
                        ) {
                            Text(
                                text = doc.content,
                                fontSize = 11.sp,
                                color = IvoryWhite,
                                fontFamily = FontFamily.Monospace,
                                modifier = Modifier.padding(12.dp),
                                lineHeight = 16.sp
                            )
                        }
                    }
                },
                containerColor = CharcoalNavy
            )
        }
    }
}

// --- Sub-Section 5: AI Management View ---
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AiManageSectionView(
    currentPrompt: String,
    onSavePrompt: (String) -> Unit,
    selectedModel: String,
    onSelectModel: (String) -> Unit
) {
    var promptInput by remember { mutableStateOf(currentPrompt) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Edit System Prompt
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.Android, contentDescription = null, tint = GoldDark)
                        Text("Sistem Promptunu Düzenle (Global LLM)", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                    }

                    OutlinedTextField(
                        value = promptInput,
                        onValueChange = { promptInput = it },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(140.dp),
                        textStyle = TextStyle(fontSize = 12.sp, color = IvoryWhite, lineHeight = 18.sp)
                    )

                    Button(
                        onClick = { onSavePrompt(promptInput) },
                        colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Sistem Promptunu Güncelle ve Yayınla", color = MidnightObsidian, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Active AI Model selector
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("🤖 Aktif Yapay Zeka Model Seçimi", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)

                    listOf(
                        "Gemini 1.5 Pro" to "Karmaşık davalar, üst düzey yasal dil ve derin analiz.",
                        "Gemini 1.5 Flash" to "Hızlı sohbet, saniyeler içinde kanun arama ve basit OCR.",
                        "Gemini 2.0 Experimental" to "Dava risk simülasyonu ve çoklu belge uyuşmazlığı kontrolü."
                    ).forEach { (model, desc) ->
                        val isSel = selectedModel == model
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(if (isSel) SlateGrey.copy(alpha = 0.3f) else Color.Transparent, RoundedCornerShape(8.dp))
                                .clickable { onSelectModel(model) }
                                .padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            RadioButton(
                                selected = isSel,
                                onClick = { onSelectModel(model) },
                                colors = RadioButtonDefaults.colors(selectedColor = GoldDark)
                            )
                            Column {
                                Text(model, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = if (isSel) GoldDark else GoldLight)
                                Text(desc, fontSize = 11.sp, color = SoftGrey)
                            }
                        }
                    }
                }
            }
        }

        // Token budget
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("💰 Günlük API Token Maliyeti", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                    Text("• Bugünkü API Harcaması: $14.28 USD", fontSize = 12.sp, color = SuccessGreen, fontWeight = FontWeight.Bold)
                    Text("• Aylık Birikmiş API Faturalandırması: $342.10 USD", fontSize = 12.sp, color = IvoryWhite)
                    Text("• Ortalama Model Yanıt Süresi (Latency): 1.15 sn", fontSize = 12.sp, color = IvoryWhite)
                }
            }
        }
    }
}

// --- Sub-Section 6: AI Control Center View (🧠 CUSTOM ADDED INSIGHT) ---
@Composable
fun AiControlSectionView() {
    var trainInput by remember { mutableStateOf("") }
    var isTrainedState by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Overview of accuracy
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.3f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(50.dp)
                            .background(GoldDark.copy(alpha = 0.15f), RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Psychology, contentDescription = null, tint = GoldDark, modifier = Modifier.size(28.dp))
                    }
                    Column {
                        Text("Yapay Zeka Doğruluk & Kalite Oranı", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                        Text("%94.2 Doğruluk (Son 1,000 sorguda)", fontSize = 15.sp, fontWeight = FontWeight.Black, color = SuccessGreen)
                        Text("Kullanıcıların olumsuz geri bildirim oranı: %1.8", fontSize = 11.sp, color = SoftGrey)
                    }
                }
            }
        }

        // Topics where AI fails most
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("⚠️ AI'ın En Çok Hata Yaptığı Konular", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                    Text("Yapay zekanın mevzuattaki uyuşmazlıklarda kararsız kaldığı ve revizyona tabi olan konu başlıkları:", fontSize = 11.sp, color = SoftGrey)

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("1. Kat Mülkiyeti Kanunu ortak alan hisseleri", fontSize = 12.sp, color = IvoryWhite)
                        Surface(color = ErrorRed.copy(alpha = 0.15f), shape = RoundedCornerShape(4.dp)) {
                            Text("5 Hata", color = ErrorRed, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                        }
                    }

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("2. Kira uyuşmazlıklarında zorunlu arabuluculuk süreleri", fontSize = 12.sp, color = IvoryWhite)
                        Surface(color = ErrorRed.copy(alpha = 0.15f), shape = RoundedCornerShape(4.dp)) {
                            Text("4 Hata", color = ErrorRed, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                        }
                    }

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("3. İş akdi haksız feshinde dava şartı önceliği", fontSize = 12.sp, color = IvoryWhite)
                        Surface(color = ErrorRed.copy(alpha = 0.15f), shape = RoundedCornerShape(4.dp)) {
                            Text("3 Hata", color = ErrorRed, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                        }
                    }
                }
            }
        }

        // Disliked response and interactive correction
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, if (isTrainedState) SuccessGreen else ErrorRed.copy(alpha = 0.4f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("👎 Kullanıcının Beğenmediği Cevap & Düzeltme", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                        if (isTrainedState) {
                            Surface(color = SuccessGreen.copy(alpha = 0.15f), shape = RoundedCornerShape(4.dp)) {
                                Text("AI EĞİTİLDİ", color = SuccessGreen, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                            }
                        } else {
                            Surface(color = ErrorRed.copy(alpha = 0.15f), shape = RoundedCornerShape(4.dp)) {
                                Text("HATALI YANIT", color = ErrorRed, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                            }
                        }
                    }

                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(MidnightObsidian, RoundedCornerShape(8.dp))
                            .padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text("Kullanıcı Sorusu:", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = GoldDark)
                        Text("\"İş akdim haksız feshedildi, arabulucuya gitmeden direkt dava açabilir miyim?\"", fontSize = 12.sp, color = IvoryWhite)
                        HorizontalDivider(color = SlateGrey.copy(alpha = 0.5f))
                        Text("AI'ın Hatalı Yanıtı:", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = ErrorRed)
                        Text("\"Evet, haksız fesih durumunda doğrudan İş Mahkemesinde dava açabilirsiniz. Arabuluculuk zorunlu değildir, dilediğiniz zaman dava açma hakkınız mevcuttur.\"", fontSize = 12.sp, color = IvoryWhite)
                    }

                    Surface(
                        color = WarningOrange.copy(alpha = 0.1f),
                        border = BorderStroke(1.dp, WarningOrange.copy(alpha = 0.3f)),
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            text = "Hata Gerekçesi: Türkiye Cumhuriyeti iş kanununa göre iş akdi fesih uyuşmazlıklarında arabuluculuk DAVA ŞARTI (zorunlu ön şart) olup, arabulucuya başvurulmadan açılan dava usulden reddedilir.",
                            color = WarningOrange,
                            fontSize = 11.sp,
                            modifier = Modifier.padding(10.dp)
                        )
                    }

                    if (isTrainedState) {
                        Surface(
                            color = SuccessGreen.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, SuccessGreen),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "Model başarıyla eğitildi! Yapay zeka sistemi bu düzeltme notunu belleğe aldı. Benzer iş hukuku fesih sorularında artık zorunlu arabuluculuk şartını ve 1 aylık hak düşürücü süreyi öncelikli ve hatasız olarak bildirecektir.",
                                color = SuccessGreen,
                                fontSize = 11.sp,
                                modifier = Modifier.padding(12.dp)
                            )
                        }
                    } else {
                        OutlinedTextField(
                            value = trainInput,
                            onValueChange = { trainInput = it },
                            placeholder = { Text("Modeli eğitmek için düzeltme veya talimat girin...", color = SoftGrey) },
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                            modifier = Modifier.fillMaxWidth()
                        )

                        Button(
                            onClick = {
                                isTrainedState = true
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Yapay Zekayı Eğit ve Modeli Güncelle", color = MidnightObsidian, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

// --- Sub-Section 7: Legal Content CMS View ---
@Composable
fun ContentSectionView() {
    var title by remember { mutableStateOf("") }
    var content by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("Kanun") }
    var isSubmitted by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("📚 Hukuki İçerik ve Mevzuat CMS", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("Kanun", "Yönetmelik", "FAQ", "Duyuru").forEach { cat ->
                            val isSel = category == cat
                            Button(
                                onClick = { category = cat },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isSel) GoldDark else SlateGrey
                                ),
                                modifier = Modifier.weight(1f).height(32.dp),
                                contentPadding = PaddingValues(0.dp)
                            ) {
                                Text(cat, fontSize = 10.sp, color = if (isSel) MidnightObsidian else IvoryWhite)
                            }
                        }
                    }

                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Mevzuat / Duyuru Başlığı", color = SoftGrey) },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = content,
                        onValueChange = { content = it },
                        label = { Text("İçerik Detayı / Kanun Metni", color = SoftGrey) },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(120.dp)
                    )

                    Button(
                        onClick = { isSubmitted = true; title = ""; content = "" },
                        colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Veritabanına Kaydet ve Yayınla", color = MidnightObsidian, fontWeight = FontWeight.Bold)
                    }

                    if (isSubmitted) {
                        Surface(
                            color = SuccessGreen.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, SuccessGreen),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Hukuk kaynağı başarıyla sisteme kaydedildi! Tüm kullanıcılar için erişilebilir hale getirildi.", color = SuccessGreen, fontSize = 11.sp, modifier = Modifier.padding(12.dp))
                        }
                    }
                }
            }
        }
    }
}

// --- Sub-Section 8: Notifications Center View ---
@Composable
fun NotificationsSectionView() {
    var title by remember { mutableStateOf("") }
    var body by remember { mutableStateOf("") }
    var isSending by remember { mutableStateOf(false) }
    var sendFinished by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("📢 Toplu Bildirim ve Duyuru Gönderimi", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)

                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Bildirim Başlığı", color = SoftGrey) },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = body,
                        onValueChange = { body = it },
                        label = { Text("Bildirim Mesajı (Maks 150 karakter)", color = SoftGrey) },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(100.dp)
                    )

                    Button(
                        onClick = {
                            isSending = true
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Tüm Kullanıcılara Gönder", color = MidnightObsidian, fontWeight = FontWeight.Bold)
                    }

                    if (isSending) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                            CircularProgressIndicator(color = GoldDark)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("1,482 kullanıcıya bildirim iletiliyor...", fontSize = 12.sp, color = GoldLight)

                            LaunchedEffect(Unit) {
                                delay(2000)
                                isSending = false
                                sendFinished = true
                                title = ""
                                body = ""
                            }
                        }
                    }

                    if (sendFinished) {
                        Surface(
                            color = SuccessGreen.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, SuccessGreen),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Toplu bildirim başarıyla kuyruğa alındı ve 1,482 aktif aboneye anlık olarak gönderildi!", color = SuccessGreen, fontSize = 11.sp, modifier = Modifier.padding(12.dp))
                        }
                    }
                }
            }
        }
    }
}

// --- Sub-Section 9: Premium Plans & Coupons CMS View ---
@Composable
fun PremiumSectionView(
    viewModel: LegalViewModel,
    activeCoupons: List<Pair<String, String>>,
    onAddCoupon: (String, String) -> Unit
) {
    val profile by viewModel.userProfile.collectAsStateWithLifecycle()
    val user = profile ?: return

    var code by remember { mutableStateOf("") }
    var disc by remember { mutableStateOf("") }

    var ibanText by remember(user.systemIban) { mutableStateOf(user.systemIban) }
    var monthlyPriceText by remember(user.premiumPriceMonthly) { mutableStateOf(user.premiumPriceMonthly) }
    var annualPriceText by remember(user.premiumPriceAnnual) { mutableStateOf(user.premiumPriceAnnual) }

    val context = LocalContext.current

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Pricing & IBAN settings
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("⭐ Premium Abonelik Paket Fiyatları & IBAN Ayarları", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)

                    OutlinedTextField(
                        value = ibanText,
                        onValueChange = { ibanText = it },
                        label = { Text("Resmi Ödeme Alıcı IBAN Adresi", color = SoftGrey) },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                        modifier = Modifier.fillMaxWidth().testTag("config_iban_input")
                    )

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        OutlinedTextField(
                            value = monthlyPriceText,
                            onValueChange = { monthlyPriceText = it },
                            label = { Text("Aylık Standart Paket", color = SoftGrey) },
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                            modifier = Modifier.weight(1f).testTag("config_monthly_price_input")
                        )
                        OutlinedTextField(
                            value = annualPriceText,
                            onValueChange = { annualPriceText = it },
                            label = { Text("Yıllık Profesyonel Paket", color = SoftGrey) },
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                            modifier = Modifier.weight(1f).testTag("config_annual_price_input")
                        )
                    }

                    Button(
                        onClick = {
                            viewModel.updateSystemConfig(
                                iban = ibanText,
                                monthlyPrice = monthlyPriceText,
                                annualPrice = annualPriceText
                            )
                            Toast.makeText(context, "Sistem ödeme bilgileri ve IBAN başarıyla güncellendi!", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                        modifier = Modifier.fillMaxWidth().height(38.dp).testTag("save_config_btn")
                    ) {
                        Text("Bilgileri & IBAN'ı Güncelle", fontSize = 11.sp, color = MidnightObsidian, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Coupon generation
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("🎟️ İndirim Kuponu Kampanyaları", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        OutlinedTextField(
                            value = code,
                            onValueChange = { code = it },
                            placeholder = { Text("Kupon Kodu", color = SoftGrey) },
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = disc,
                            onValueChange = { disc = it },
                            placeholder = { Text("İndirim Oranı", color = SoftGrey) },
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Button(
                        onClick = {
                            if (code.isNotEmpty() && disc.isNotEmpty()) {
                                onAddCoupon(code, disc)
                                code = ""
                                disc = ""
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                        modifier = Modifier.fillMaxWidth().height(36.dp)
                    ) {
                        Text("Yeni Kampanya Kuponu Oluştur", fontSize = 11.sp, color = MidnightObsidian, fontWeight = FontWeight.Bold)
                    }

                    HorizontalDivider(color = SlateGrey.copy(alpha = 0.3f))

                    Text("Aktif İndirim Kampanyaları:", fontSize = 11.sp, color = SoftGrey)
                    activeCoupons.forEach { (c, d) ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(c, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                            Text(d, fontSize = 12.sp, color = SuccessGreen, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

// --- Sub-Section 10: Analytics View ---
@Composable
fun AnalyticsSectionView() {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("📈 En Çok Kullanılan Uygulama Özellikleri", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)

                    AnalyticsBar("Dilekçe Hazırlama Stüdyosu", 0.42f, "%42")
                    AnalyticsBar("Belge Analizi & OCR", 0.35f, "%35")
                    AnalyticsBar("Hukuk Arama Motoru", 0.15f, "%15")
                    AnalyticsBar("Sesli Hukukçu Asistanı", 0.08f, "%8")
                }
            }
        }

        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("⭐ Kullanıcı Memnuniyeti Oranı", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                    Text("4.8 / 5.0 Yıldız", fontSize = 24.sp, fontWeight = FontWeight.Black, color = WarningOrange)
                    Text("Toplam 284 App Store & Google Play Değerlendirmesi.", fontSize = 11.sp, color = SoftGrey)
                    Text("Premium dönüşüm başarı katsayısı: %27.8 (Mükemmel)", fontSize = 12.sp, color = IvoryWhite)
                }
            }
        }
    }
}

@Composable
fun AnalyticsBar(label: String, fraction: Float, pct: String) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(label, fontSize = 11.sp, color = IvoryWhite)
            Text(pct, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = GoldDark)
        }
        LinearProgressIndicator(progress = fraction, color = GoldDark, trackColor = SlateGrey, modifier = Modifier.fillMaxWidth().height(8.dp).clip(CircleShape))
    }
}

// --- Sub-Section 11: System Audit Log View ---
@Composable
fun LogsSectionView() {
    var filterType by remember { mutableStateOf("ALL") }

    val allLogs = listOf(
        AdminAuditLog("11:02:14", "192.168.1.12", "guzelkokarizzet@gmail.com", "Sistem Girişi", "SECURITY", "Sistem yöneticisi başarıyla giriş yaptı."),
        AdminAuditLog("11:01:02", "85.105.42.11", "meltem.aras@hukuk.com", "Belge Taraması", "INFO", "Kira_Tahliye_Ihtari.pdf dosyası OCR ile tarandı."),
        AdminAuditLog("10:58:45", "176.42.15.99", "selim@yazici-hukuk.av.tr", "Sözleşme Analizi", "INFO", "İş sözleşmesi analiz edildi. Uyuşmazlık risk skorlaması yapıldı."),
        AdminAuditLog("10:54:12", "94.54.120.8", "caner.akin@soyluhukuk.com", "Hatalı Giriş Denemesi", "WARNING", "3 kez yanlış şifre girildi. IP geçici askıya alındı."),
        AdminAuditLog("10:48:22", "88.22.14.250", "ANONİM", "Zaman Aşımı Hatası", "ERROR", "Dava risk hesaplama API servisi 504 Gateway Timeout verdi.")
    )

    val filteredLogs = if (filterType == "ALL") allLogs else allLogs.filter { it.type == filterType }

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            listOf("ALL", "INFO", "WARNING", "ERROR", "SECURITY").forEach { filter ->
                val isSel = filterType == filter
                Button(
                    onClick = { filterType = filter },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isSel) GoldDark else SlateGrey
                    ),
                    modifier = Modifier.weight(1f).height(28.dp),
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Text(filter, fontSize = 8.sp, color = if (isSel) MidnightObsidian else IvoryWhite)
                }
            }
        }

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(filteredLogs) { log ->
                val color = when (log.type) {
                    "SECURITY" -> WarningOrange
                    "ERROR" -> ErrorRed
                    "WARNING" -> WarningOrange
                    else -> SuccessGreen
                }
                Card(
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                    border = BorderStroke(1.dp, SlateGrey),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("${log.timestamp} • IP: ${log.ip}", fontSize = 10.sp, color = SoftGrey)
                            Surface(color = color.copy(alpha = 0.15f), shape = RoundedCornerShape(4.dp)) {
                                Text(log.type, color = color, fontSize = 8.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
                            }
                        }
                        Text(log.action, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                        Text(log.detail, fontSize = 11.sp, color = IvoryWhite)
                    }
                }
            }
        }
    }
}

// --- Sub-Section 12: Security Settings View ---
@Composable
fun SecuritySectionView() {
    var twoFactorEnabled by remember { mutableStateOf(true) }
    var ipWhitelistingEnabled by remember { mutableStateOf(false) }
    var autoLockoutEnabled by remember { mutableStateOf(true) }
    var apiKeyVisible by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("🛡️ Güvenlik ve SecOps Politikaları", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Admin Portalı İçin Zorunlu 2FA", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                            Text("Yönetici girişlerinde SMS/Google Authenticator şartı.", fontSize = 11.sp, color = SoftGrey)
                        }
                        Switch(checked = twoFactorEnabled, onCheckedChange = { twoFactorEnabled = it }, colors = SwitchDefaults.colors(checkedThumbColor = GoldDark))
                    }

                    HorizontalDivider(color = SlateGrey.copy(alpha = 0.3f))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("IP Whitelisting (Sınırlandırma)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                            Text("Sadece yetkilendirilmiş kurumsal IP adresleri girebilir.", fontSize = 11.sp, color = SoftGrey)
                        }
                        Switch(checked = ipWhitelistingEnabled, onCheckedChange = { ipWhitelistingEnabled = it }, colors = SwitchDefaults.colors(checkedThumbColor = GoldDark))
                    }

                    HorizontalDivider(color = SlateGrey.copy(alpha = 0.3f))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Otomatik Hesap Kilitleme", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                            Text("5 kez hatalı şifre denemesinde hesabı bloke et.", fontSize = 11.sp, color = SoftGrey)
                        }
                        Switch(checked = autoLockoutEnabled, onCheckedChange = { autoLockoutEnabled = it }, colors = SwitchDefaults.colors(checkedThumbColor = GoldDark))
                    }
                }
            }
        }

        // Master API Key Management
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("🔑 Sistem Master API Anahtarları", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(MidnightObsidian, RoundedCornerShape(4.dp))
                            .padding(8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (apiKeyVisible) "AI-OS-MASTER-KEY-8x92nd73m19s05l" else "••••••••••••••••••••••••••••••••",
                            fontSize = 11.sp,
                            color = IvoryWhite,
                            fontFamily = FontFamily.Monospace
                        )
                        IconButton(onClick = { apiKeyVisible = !apiKeyVisible }) {
                            Icon(Icons.Default.Lock, contentDescription = null, tint = GoldDark, modifier = Modifier.size(16.dp))
                        }
                    }

                    Button(
                        onClick = {},
                        colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                        modifier = Modifier.fillMaxWidth().height(36.dp)
                    ) {
                        Text("Master API Anahtarını Döndür (Rotate)", fontSize = 11.sp, color = MidnightObsidian, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

// --- Sub-Section 13: Helpdesk & Support View ---
@Composable
fun SupportSectionView(
    ticketList: List<AdminTicket>,
    onResolveTicket: (Int) -> Unit
) {
    var activeReplyTicketId by remember { mutableStateOf<Int?>(null) }
    var replyText by remember { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("📋 Canlı Destek ve Kullanıcı Talepleri", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
        }

        items(ticketList) { ticket ->
            val isOpen = ticket.status == "Açık"
            val isReplying = activeReplyTicketId == ticket.id
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, if (isOpen) GoldDark.copy(alpha = 0.4f) else SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(ticket.title, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                        Surface(
                            color = if (isOpen) ErrorRed.copy(alpha = 0.15f) else SuccessGreen.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(ticket.status, color = if (isOpen) ErrorRed else SuccessGreen, fontSize = 9.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                        }
                    }

                    Text("Kullanıcı: ${ticket.user} • Tarih: ${ticket.date}", fontSize = 11.sp, color = SoftGrey)
                    Text("\"${ticket.message}\"", fontSize = 12.sp, color = IvoryWhite, fontStyle = FontStyle.Italic)

                    if (isOpen) {
                        if (isReplying) {
                            OutlinedTextField(
                                value = replyText,
                                onValueChange = { replyText = it },
                                placeholder = { Text("Kullanıcıya iletilecek çözüm notunu yazın...", color = SoftGrey) },
                                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                                modifier = Modifier.fillMaxWidth()
                            )
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Button(
                                    onClick = {
                                        if (replyText.isNotEmpty()) {
                                            onResolveTicket(ticket.id)
                                            activeReplyTicketId = null
                                            replyText = ""
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                                    modifier = Modifier.weight(1f).height(32.dp)
                                ) {
                                    Text("Yanıtı Gönder", fontSize = 11.sp, color = MidnightObsidian, fontWeight = FontWeight.Bold)
                                }
                                Button(
                                    onClick = { activeReplyTicketId = null; replyText = "" },
                                    colors = ButtonDefaults.buttonColors(containerColor = SlateGrey),
                                    modifier = Modifier.weight(1f).height(32.dp)
                                ) {
                                    Text("İptal", fontSize = 11.sp, color = IvoryWhite)
                                }
                            }
                        } else {
                            Button(
                                onClick = { activeReplyTicketId = ticket.id },
                                colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                                modifier = Modifier.fillMaxWidth().height(28.dp)
                            ) {
                                Text("Talebi Yanıtla", fontSize = 11.sp, color = MidnightObsidian, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

// --- Sub-Section 14: System Settings View ---
@Composable
fun SettingsSectionView() {
    var siteName by remember { mutableStateOf("AL HUKUK AI OS") }
    var maintenanceMode by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("⚙️ Genel Sistem Ayarları", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)

                    OutlinedTextField(
                        value = siteName,
                        onValueChange = { siteName = it },
                        label = { Text("Platform Adı", color = SoftGrey) },
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                        modifier = Modifier.fillMaxWidth()
                    )

                    HorizontalDivider(color = SlateGrey.copy(alpha = 0.3f))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Sistem Bakım Modu", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                            Text("Aktif edildiğinde sadece yöneticiler giriş yapabilir, tüm servisler halka kapatılır.", fontSize = 11.sp, color = SoftGrey)
                        }
                        Switch(checked = maintenanceMode, onCheckedChange = { maintenanceMode = it }, colors = SwitchDefaults.colors(checkedThumbColor = GoldDark))
                    }

                    if (maintenanceMode) {
                        Surface(
                            color = ErrorRed.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, ErrorRed),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "DİKKAT: Bakım modu aktif! Genel kullanıcılar şu anda 'Sistem bakımda' uyarısı alacaktır. İşlemlerinizi bitirdikten sonra kapatmayı unutmayın.",
                                color = ErrorRed,
                                fontSize = 11.sp,
                                modifier = Modifier.padding(10.dp),
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Button(
                        onClick = {},
                        colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Sistem Ayarlarını Kaydet", color = MidnightObsidian, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

// --- Sub-Section 15: Future Modules Previews ---
@Composable
fun FutureSectionView() {
    var isQualityAnalystEnabled by remember { mutableStateOf(false) }
    var isFraudDetectorEnabled by remember { mutableStateOf(true) }
    var isBackupsEnabled by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                border = BorderStroke(1.dp, SlateGrey),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("🔥 Gelecek Modül Entegrasyonları (Beta)", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                    Text("Yakın zamanda eklenecek olan modülleri test etmek için aktif edin:", fontSize = 11.sp, color = SoftGrey)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Yapay zekâ cevap kalitesi analiz modülü", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                            Text("LLM çıktılarındaki hukuki doğruluk sapmalarını yakalar.", fontSize = 11.sp, color = SoftGrey)
                        }
                        Switch(checked = isQualityAnalystEnabled, onCheckedChange = { isQualityAnalystEnabled = it }, colors = SwitchDefaults.colors(checkedThumbColor = GoldDark))
                    }

                    HorizontalDivider(color = SlateGrey.copy(alpha = 0.3f))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Dolandırıcılık ve kötüye kullanım tespiti", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                            Text("Sistem kötüye kullanımını ve illegal dava sorgularını tespit eder.", fontSize = 11.sp, color = SoftGrey)
                        }
                        Switch(checked = isFraudDetectorEnabled, onCheckedChange = { isFraudDetectorEnabled = it }, colors = SwitchDefaults.colors(checkedThumbColor = GoldDark))
                    }

                    HorizontalDivider(color = SlateGrey.copy(alpha = 0.3f))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Otomatik bulut yedekleme raporları", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                            Text("Her 24 saatte bir veritabanını şifreli zip olarak yedekler.", fontSize = 11.sp, color = SoftGrey)
                        }
                        Switch(checked = isBackupsEnabled, onCheckedChange = { isBackupsEnabled = it }, colors = SwitchDefaults.colors(checkedThumbColor = GoldDark))
                    }
                }
            }
        }
    }
}
