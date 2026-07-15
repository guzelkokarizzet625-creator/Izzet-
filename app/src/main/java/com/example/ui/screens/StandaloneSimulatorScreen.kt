package com.example.ui.screens

import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
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
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.database.CaseFile
import com.example.ui.theme.*
import com.example.ui.viewmodel.LegalViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun StandaloneSimulatorScreen(viewModel: LegalViewModel) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val caseFilesList by viewModel.caseFiles.collectAsStateWithLifecycle()
    val profile by viewModel.userProfile.collectAsStateWithLifecycle()
    val currentLang = profile?.language ?: "TR"

    // App language strings helper
    fun getString(key: String): String {
        return com.example.ui.theme.Localization.get(key, currentLang)
    }

    // Dropdown Case Selection State
    var selectedCase by remember { mutableStateOf<CaseFile?>(null) }
    var caseDropdownExpanded by remember { mutableStateOf(false) }

    // Manual Input Fields
    var caseTitle by remember { mutableStateOf("") }
    var caseDesc by remember { mutableStateOf("") }

    // Update fields when selectedCase changes
    LaunchedEffect(selectedCase) {
        if (selectedCase != null) {
            caseTitle = selectedCase!!.title
            caseDesc = selectedCase!!.description
        } else {
            caseTitle = ""
            caseDesc = ""
        }
    }

    // Simulation Config Parameters
    var courtType by remember { mutableStateOf("İş Mahkemesi") }
    var judgeProfile by remember { mutableStateOf("Formalist & Katı") }
    var opponentStrategy by remember { mutableStateOf("Süre Alıcı / Zamana Yayıcı") }
    var evidencePower by remember { mutableStateOf("Orta") } // Zayıf, Orta, Güçlü, Kusursuz
    var witnessReliability by remember { mutableStateOf("Güvenilir") } // Yok, Zayıf, Güvenilir, Çok Güçlü

    // Parameter Dropdown States
    var courtExpanded by remember { mutableStateOf(false) }
    var judgeExpanded by remember { mutableStateOf(false) }
    var opponentExpanded by remember { mutableStateOf(false) }

    // Lists for Dropdowns
    val courtTypes = listOf(
        "İş Mahkemesi", "Asliye Hukuk Mahkemesi", "Sulh Hukuk Mahkemesi",
        "Asliye Ticaret Mahkemesi", "Tüketici Mahkemesi", "Aile Mahkemesi", "Ağır Ceza Mahkemesi"
    )
    val judgeProfiles = listOf(
        "Formalist & Katı", "Hakkaniyet Odaklı", "Hızlı / Kararcı", "Değişken & Öngörülemez"
    )
    val opponentStrategies = listOf(
        "Usul İtirazcı & Saldırgan", "Analitik & Mevzuatçı", "Süre Alıcı / Zamana Yayıcı", "Uzlaşmacı & Esnek"
    )

    // Simulation State & Results
    var isSimulating by remember { mutableStateOf(false) }
    var hasSimulated by remember { mutableStateOf(false) }

    // Calculated Probabilities State
    var winChance by remember { mutableStateOf(0f) }
    var settlementChance by remember { mutableStateOf(0f) }
    var lossChance by remember { mutableStateOf(0f) }

    // Detailed simulation results
    var simulatedRisks by remember { mutableStateOf(emptyList<String>()) }
    var simulatedTactics by remember { mutableStateOf(emptyList<String>()) }
    var simulatedSWOT by remember { mutableStateOf(emptyList<Pair<String, String>>()) }

    // Interactive Courtroom Practice state
    var courtroomStep by remember { mutableStateOf(0) } // 0: Not started, 1: Judge challenges user, 2: User answered, showing result
    var courtroomJudgeText by remember { mutableStateOf("") }
    var courtroomOpponentText by remember { mutableStateOf("") }
    var courtroomUserChoice by remember { mutableStateOf(-1) }
    var courtroomOutcomeText by remember { mutableStateOf("") }
    var courtroomJudgeMood by remember { mutableStateOf("Ciddi") } // Ciddi, Kızgın, Memnun

    // Interactive Scenario Response State (What-If questions)
    var activeWhatIfIndex by remember { mutableStateOf(-1) }
    val whatIfQuestions = listOf(
        Triple(
            "Karşı taraf zamanaşımı def'i ileri sürerse ne yapılmalı?",
            listOf("Süreleri kaçırdığımızı kabul edip sulh teklif et", "Zamanaşımını kesen sebepleri (ihtar, kısmi ödeme vb.) dosyaya sun", "Sözlü olarak itiraz et, yazılı beyan verme"),
            listOf(-10f, 15f, -5f) // effect on winChance
        ),
        Triple(
            "Kritik tanık duruşmaya gelmezse ne yapılmalı?",
            listOf("Tanıktan vazgeçtiğimizi beyan et", "Tanığın zorla getirilmesini talep et ve adresini güncelle", "Duruşmanın ertelenmesini iste, gerekçe sunma"),
            listOf(-15f, 10f, -5f)
        ),
        Triple(
            "Hakim bilirkişi raporuna itirazımızı reddederse ne yapılmalı?",
            listOf("Hukuk dairesine (İstinaf) delil tespiti için sakınca şerhi düş", "Karara itiraz etme, hakimi reddetmeyi talep et", "Yeni bir ek rapor alınması için yazılı somut itirazlar hazırla"),
            listOf(5f, -20f, 12f)
        )
    )
    var answeredWhatIfs by remember { mutableStateOf(mutableMapOf<Int, Int>()) } // index to chosenOption

    // Action to run simulation
    fun startSimulation() {
        if (caseTitle.trim().isEmpty() || caseDesc.trim().isEmpty()) {
            Toast.makeText(context, "Lütfen dava başlığı ve uyuşmazlık detaylarını girin.", Toast.LENGTH_SHORT).show()
            return
        }

        coroutineScope.launch {
            isSimulating = true
            courtroomStep = 0 // reset courtroom practice
            answeredWhatIfs.clear()

            // Simulate AI computation latency
            delay(2200)

            // Dynamic calculation logic based on selected parameters
            var baseWin = 50f
            var baseSettle = 25f
            var baseLoss = 25f

            // Adjust by Evidence
            when (evidencePower) {
                "Zayıf" -> { baseWin -= 20f; baseLoss += 20f }
                "Orta" -> { baseWin += 0f }
                "Güçlü" -> { baseWin += 20f; baseLoss -= 15f; baseSettle -= 5f }
                "Kusursuz" -> { baseWin += 35f; baseLoss -= 25f; baseSettle -= 10f }
            }

            // Adjust by Witness
            when (witnessReliability) {
                "Yok" -> { baseWin -= 10f; baseLoss += 10f }
                "Zayıf" -> { baseWin -= 5f; baseLoss += 5f }
                "Güvenilir" -> { baseWin += 10f; baseLoss -= 5f; baseSettle -= 5f }
                "Çok Güçlü" -> { baseWin += 18f; baseLoss -= 12f; baseSettle -= 6f }
            }

            // Adjust by Judge Attitude
            when (judgeProfile) {
                "Formalist & Katı" -> {
                    // Punishes weak evidence heavily
                    if (evidencePower == "Zayıf") baseWin -= 10f
                    baseSettle -= 10f
                    baseLoss += 10f
                }
                "Hakkaniyet Odaklı" -> {
                    baseSettle += 15f
                    baseWin += 5f
                    baseLoss -= 20f
                }
                "Hızlı / Kararcı" -> {
                    baseWin += 5f
                    baseLoss += 5f
                    baseSettle -= 10f
                }
                "Değişken & Öngörülemez" -> {
                    baseWin += ((-10..10).random()).toFloat()
                }
            }

            // Adjust by Opponent Strategy
            when (opponentStrategy) {
                "Usul İtirazcı & Saldırgan" -> {
                    baseWin -= 5f
                    baseLoss += 5f
                }
                "Analitik & Mevzuatçı" -> {
                    baseWin -= 8f
                    baseLoss += 8f
                }
                "Süre Alıcı / Zamana Yayıcı" -> {
                    baseSettle += 10f
                    baseWin -= 2f
                }
                "Uzlaşmacı & Esnek" -> {
                    baseSettle += 25f
                    baseWin -= 10f
                    baseLoss -= 15f
                }
            }

            // Normalize to total 100%
            baseWin = baseWin.coerceIn(5f, 95f)
            baseSettle = baseSettle.coerceIn(5f, 90f)
            baseLoss = (100f - baseWin - baseSettle).coerceIn(5f, 90f)

            winChance = baseWin
            settlementChance = baseSettle
            lossChance = 100f - winChance - settlementChance

            // Generate contextual risks based on parameters & title
            simulatedRisks = if (caseTitle.contains("Kira") || caseTitle.contains("Tahliye") || courtType.contains("Sulh Hukuk")) {
                listOf(
                    "Tahliye taahhütnamesinin imza tarihinin kira sözleşmesinden sonra atıldığının ispatlanması zorunluluğu riski.",
                    "Noter ihtarlarının kiracıya ulaşma tebliğ şerhlerindeki gecikmeler nedeniyle sürelerin kaçması tehlikesi.",
                    "Hakkaniyet indirimi uyarınca mahkemenin kira bedelini beklenen rayicin altında belirleme ihtimali."
                )
            } else if (caseTitle.contains("İş") || caseTitle.contains("Kıdem") || courtType.contains("İş Mahkemesi")) {
                listOf(
                    "Fazla mesai saatlerinin sadece WhatsApp mesajlarıyla tam ispatlanamaması, hakimin %30-40 oranında hakkaniyet indirimi yapma riski.",
                    "Karşı tarafın 'fazla mesai ücrete dahildir' maddesine sığınarak usuli itirazlarda bulunması ve süreci uzatması.",
                    "Arabuluculuk son tutanağının dava şartı olarak dosyaya aslı yerine fotokopi eklenmesi sebebiyle usulden ret riski."
                )
            } else {
                listOf(
                    "Sözleşmedeki belirsiz hükümlerin hakimin yorum takdirine kalması ve aleyhte yorumlanması riski.",
                    "Tanık ifadelerinin çapraz sorgu sırasında karşı taraf vekilinin usuli müdahaleleriyle çelişkiye düşürülmesi.",
                    "Delil listesinin sunulması için verilen kesin sürelerin geçirilmesi durumunda hak kaybı yaşanması."
                )
            }

            // Generate simulated Tactics
            simulatedTactics = if (courtType == "İş Mahkemesi") {
                listOf(
                    "SGK dökümleri ve banka hesap hareketleri derhal sunulmalı, fazla mesai iddiası net tarihlerle sınırlandırılmalıdır.",
                    "Karşı tarafın takas-mahsup iddialarına karşı önceden ihtirazı kayıt dilekçesi hazırlanmalıdır.",
                    "Tanıkların işyerindeki çalışma dönemleri ile davacının çalışma dönemlerinin çakıştığını gösteren belgeler dosyaya eklenmelidir."
                )
            } else if (courtType == "Sulh Hukuk Mahkemesi") {
                listOf(
                    "Kira ödeme dekontlarındaki açıklamaların 'Kira Bedeli' olarak yazıldığından emin olunmalı, eksik ödemeler için faiz talep edilmelidir.",
                    "İhtarname tebliğ mazbatalarının asılları noterden istenmeli ve kesin sürelerin başlangıcı netleştirilmelidir.",
                    "Eski kiracının tahliye taahhüdünü bizzat imzaladığına dair imza sirküleri karşılaştırılmalıdır."
                )
            } else {
                listOf(
                    "Dayanak sözleşmenin her sayfasındaki imzaların aidiyeti konusunda ön inceleme duruşmasından önce beyanda bulunulmalıdır.",
                    "Uyuşmazlığın sulh yoluyla çözümü için karşı tarafa resmi ve yazılı bir teklif mektubu gönderilerek iyi niyet belgelenmelidir.",
                    "Olay kronolojisi tablo halinde duruşma gününden önce hakime sunulmalı, karmaşık uyuşmazlık sadeleştirilmelidir."
                )
            }

            // SWOT points
            simulatedSWOT = listOf(
                "GÜÇLÜ YÖN (Strengths)" to "Yazılı delillerinizin varlığı ve noter ihtarlarının usulüne uygun şekilde gönderilmiş olması yasal zemini güçlendiriyor.",
                "ZAYIF YÖN (Weaknesses)" to "Tanık beyanlarının öznel olması ve bazı kritik olay tarihlerinde net belgelerin (örn: imza, dekont) bulunmaması.",
                "FIRSAT (Opportunities)" to "Hakimin hakkaniyet ve adalet eğiliminin yüksek olması, arabuluculuk aşamasında uzlaşma payını artırıyor.",
                "TEHDİT (Threats)" to "Karşı tarafın zamanaşımı ve usul itirazlarını süre uzatmak için son derece agresif kullanma stratejisi."
            )

            // Setup courtroom interactive roleplay question based on Judge attitude
            courtroomJudgeText = when (judgeProfile) {
                "Formalist & Katı" -> "Davacı vekili, iddia ettiğiniz alacak kalemlerinin tam olarak hangi yazılı belgelere dayandığını netleştirin. Dosyadaki fotokopi WhatsApp yazışmaları kesin delil niteliği taşımaz. Ne diyorsunuz?"
                "Hakkaniyet Odaklı" -> "Evlatlarım, uyuşmazlığı uzatmak her iki tarafa da zarar verir. Davalının sunduğu uzlaşma teklifini kabul edip dosyayı sulh yoluyla kapatmaya sıcak bakıyor musunuz? Yoksa iddialarınızda ısrarcı mısınız?"
                "Hızlı / Kararcı" -> "Taraflar, dosyadaki delil listesi yeterlidir. Yeni tanık dinletme talebinizi reddediyorum, mevcut delillerle karar vereceğim. Son sözlerinizi alayım, karar aşamasına geçiyorum."
                else -> "Davacı vekili, karşı tarafın ileri sürdüğü zamanaşımı def'ine karşı somut cevabınız nedir? 2 dakika içinde hukuki dayanağınızı sunun."
            }
            courtroomOpponentText = when (opponentStrategy) {
                "Usul İtirazcı & Saldırgan" -> "Sayın Hakim, davacının iddiaları tamamen mesnetsizdir! Usule ve sürelere aykırı yapılan tüm taleplerin esasa girilmeden reddini talep ediyoruz!"
                "Analitik & Mevzuatçı" -> "Yargıtay Hukuk Genel Kurulu'nun yerleşik kararları uyarınca, yazılı delil başlangıcı olmaksızın tanık dinletilmesi usule açıkça aykırıdır."
                "Süre Alıcı / Zamana Yayıcı" -> "Müvekkil şirketin defterlerinin incelenmesi için dosyanın bilirkişiye gönderilmesini ve bize 30 gün ek süre verilmesini talep ediyoruz."
                else -> "Müvekkilimiz sulh tekliflerine açıktır, ancak davacı tarafın fahiş taleplerini kabul etmemiz mümkün değildir."
            }
            courtroomStep = 1 // ready to show
            courtroomUserChoice = -1

            isSimulating = false
            hasSimulated = true
            Toast.makeText(context, "Profesyonel Dava Simülasyonu Tamamlandı!", Toast.LENGTH_SHORT).show()
        }
    }

    // Interactive Courtroom practice submit
    fun answerJudge(choiceIndex: Int) {
        courtroomUserChoice = choiceIndex
        courtroomStep = 2

        val (outcome, judgeReaction, winChangeDelta) = when (judgeProfile) {
            "Formalist & Katı" -> {
                when (choiceIndex) {
                    0 -> Triple("Hakim usule uygunluğunuzu takdir etti ancak kesin yazılı delil istedi.", "Memnun", 5f)
                    1 -> Triple("Hakim sert bir tonla uyardı: 'Burası pazar yeri değil, hukuki argüman sunun!'", "Kızgın", -10f)
                    else -> Triple("Hakim talebinizi usulden reddetti: 'Süreler kesindir, yerine getirilmeyen talep düşer.'", "Ciddi", -5f)
                }
            }
            "Hakkaniyet Odaklı" -> {
                when (choiceIndex) {
                    0 -> Triple("Hakim sulh çabanızı destekledi: 'En kötü sulh en iyi davadan iyidir, taraflara 2 hafta süre veriyorum.'", "Memnun", 15f)
                    1 -> Triple("Hakim iç çekerek: 'Karar vermemi istiyorsunuz ama elinizde net delil yok. Davayı uzatıyorsunuz.'", "Ciddi", -2f)
                    else -> Triple("Hakim sinirlendi: 'Kendi aranızda konuşup anlaşın, mahkemeyi gereksiz meşgul etmeyin.'", "Kızgın", -8f)
                }
            }
            "Hızlı / Kararcı" -> {
                when (choiceIndex) {
                    0 -> Triple("Hakim hızınızı beğendi: 'Gereksiz beyanlardan kaçındığınız için teşekkürler, talebi kabul ettim.'", "Memnun", 10f)
                    1 -> Triple("Hakim sözünüzü kesti: 'Yazılı beyan verin, duruşmayı uzatmayın, karar yazdırıyorum!'", "Kızgın", -5f)
                    else -> Triple("Hakim talebi dosya olgunlaştığından reddetti.", "Ciddi", -2f)
                }
            }
            else -> {
                when (choiceIndex) {
                    0 -> Triple("Sıradışı bir kararla hakim talebinizi kabul etti ve bilirkişiye ek süre verdi.", "Memnun", 8f)
                    1 -> Triple("Hakim itirazınızı zapta geçirdi ancak incelemeyi sonraya bıraktı.", "Ciddi", 0f)
                    else -> Triple("Hakim 'Hukuki dayanağınız yetersiz' diyerek talebinizi oyaladı.", "Kızgın", -6f)
                }
            }
        }

        courtroomOutcomeText = outcome
        courtroomJudgeMood = judgeReaction
        winChance = (winChance + winChangeDelta).coerceIn(5f, 95f)
        lossChance = (100f - winChance - settlementChance).coerceIn(5f, 90f)
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MidnightObsidian)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Immersive Header
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.3f))
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .clip(CircleShape)
                                .background(GoldDark.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.QueryStats, contentDescription = null, tint = GoldDark, modifier = Modifier.size(24.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("PRO DAVA SİMÜLATÖRÜ", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                            Text("Yapay Zeka Mahkeme ve Risk Simülasyon Sistemi", fontSize = 11.sp, color = SoftGrey)
                        }
                    }
                }
            }
        }

        // Selection / Input Panel
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, SlateGrey.copy(alpha = 0.4f))
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("1. Dava Verisi ve Kaynağı Seçimi", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldDark)

                    // Case Dropdown Selector
                    Box(modifier = Modifier.fillMaxWidth()) {
                        OutlinedButton(
                            onClick = { caseDropdownExpanded = true },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = IvoryWhite),
                            border = BorderStroke(1.dp, SlateGrey),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = selectedCase?.let { "📂 Dosya: ${it.title}" } ?: "📄 Yeni Simülasyon (Manuel Giriş)",
                                    fontSize = 12.sp,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                            }
                        }

                        DropdownMenu(
                            expanded = caseDropdownExpanded,
                            onDismissRequest = { caseDropdownExpanded = false },
                            modifier = Modifier
                                .fillMaxWidth(0.9f)
                                .background(CharcoalNavy)
                                .border(1.dp, SlateGrey)
                        ) {
                            DropdownMenuItem(
                                text = { Text("Yeni Simülasyon (Manuel Giriş)", color = GoldLight, fontSize = 12.sp) },
                                onClick = {
                                    selectedCase = null
                                    caseDropdownExpanded = false
                                }
                            )
                            caseFilesList.forEach { case ->
                                DropdownMenuItem(
                                    text = { Text("Dosya: ${case.title} (${case.clientName})", color = IvoryWhite, fontSize = 12.sp) },
                                    onClick = {
                                        selectedCase = case
                                        caseDropdownExpanded = false
                                    }
                                )
                            }
                        }
                    }

                    // Input fields for title/desc
                    OutlinedTextField(
                        value = caseTitle,
                        onValueChange = { if (selectedCase == null) caseTitle = it },
                        label = { Text("Dava / İhtilaf Başlığı", fontSize = 11.sp) },
                        placeholder = { Text("Örn: Haksız İş Sözleşmesi Feshi Tazminat Talebi", fontSize = 11.sp, color = SoftGrey) },
                        modifier = Modifier.fillMaxWidth().testTag("sim_title_input"),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = IvoryWhite,
                            unfocusedTextColor = IvoryWhite,
                            focusedBorderColor = GoldDark,
                            unfocusedBorderColor = SlateGrey,
                            focusedLabelColor = GoldDark,
                            unfocusedLabelColor = SoftGrey
                        ),
                        readOnly = selectedCase != null,
                        maxLines = 1,
                        textStyle = LocalTextStyle.current.copy(fontSize = 12.sp)
                    )

                    OutlinedTextField(
                        value = caseDesc,
                        onValueChange = { if (selectedCase == null) caseDesc = it },
                        label = { Text("Uyuşmazlık Detayları & Olay Özeti", fontSize = 11.sp) },
                        placeholder = { Text("Haklarınızı, iddialarınızı, eldeki yazılı belgeleri ve uyuşmazlığın gelişimini buraya yazın...", fontSize = 11.sp, color = SoftGrey) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(90.dp)
                            .testTag("sim_desc_input"),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = IvoryWhite,
                            unfocusedTextColor = IvoryWhite,
                            focusedBorderColor = GoldDark,
                            unfocusedBorderColor = SlateGrey,
                            focusedLabelColor = GoldDark,
                            unfocusedLabelColor = SoftGrey
                        ),
                        readOnly = selectedCase != null,
                        textStyle = LocalTextStyle.current.copy(fontSize = 11.sp)
                    )
                }
            }
        }

        // Court / Simulator Parameters Panel
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, SlateGrey.copy(alpha = 0.4f))
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("2. Mahkeme ve Süreç Parametreleri", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldDark)

                    // Row of Dropdowns: Court & Judge
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        // Court Type Dropdown
                        Box(modifier = Modifier.weight(1f)) {
                            OutlinedButton(
                                onClick = { courtExpanded = true },
                                modifier = Modifier.fillMaxWidth(),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = IvoryWhite),
                                border = BorderStroke(1.dp, SlateGrey),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(courtType, fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    Icon(Icons.Default.ArrowDropDown, contentDescription = null, modifier = Modifier.size(16.dp))
                                }
                            }
                            DropdownMenu(
                                expanded = courtExpanded,
                                onDismissRequest = { courtExpanded = false },
                                modifier = Modifier.background(CharcoalNavy).border(1.dp, SlateGrey)
                            ) {
                                courtTypes.forEach { type ->
                                    DropdownMenuItem(
                                        text = { Text(type, color = IvoryWhite, fontSize = 11.sp) },
                                        onClick = {
                                            courtType = type
                                            courtExpanded = false
                                        }
                                    )
                                }
                            }
                        }

                        // Judge Profile Dropdown
                        Box(modifier = Modifier.weight(1f)) {
                            OutlinedButton(
                                onClick = { judgeExpanded = true },
                                modifier = Modifier.fillMaxWidth(),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = IvoryWhite),
                                border = BorderStroke(1.dp, SlateGrey),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(judgeProfile, fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    Icon(Icons.Default.ArrowDropDown, contentDescription = null, modifier = Modifier.size(16.dp))
                                }
                            }
                            DropdownMenu(
                                expanded = judgeExpanded,
                                onDismissRequest = { judgeExpanded = false },
                                modifier = Modifier.background(CharcoalNavy).border(1.dp, SlateGrey)
                            ) {
                                judgeProfiles.forEach { profileItem ->
                                    DropdownMenuItem(
                                        text = { Text(profileItem, color = IvoryWhite, fontSize = 11.sp) },
                                        onClick = {
                                            judgeProfile = profileItem
                                            judgeExpanded = false
                                        }
                                    )
                                }
                            }
                        }
                    }

                    // Opponent Strategy Row
                    Box(modifier = Modifier.fillMaxWidth()) {
                        OutlinedButton(
                            onClick = { opponentExpanded = true },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = IvoryWhite),
                            border = BorderStroke(1.dp, SlateGrey),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Karşı Taraf Vekili: $opponentStrategy", fontSize = 11.sp)
                                Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                            }
                        }
                        DropdownMenu(
                            expanded = opponentExpanded,
                            onDismissRequest = { opponentExpanded = false },
                            modifier = Modifier.fillMaxWidth(0.85f).background(CharcoalNavy).border(1.dp, SlateGrey)
                        ) {
                            opponentStrategies.forEach { strategy ->
                                DropdownMenuItem(
                                    text = { Text(strategy, color = IvoryWhite, fontSize = 11.sp) },
                                    onClick = {
                                        opponentStrategy = strategy
                                        opponentExpanded = false
                                    }
                                )
                            }
                        }
                    }

                    // Evidence Power Segmented Buttons
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text("Yazılı Delillerin Gücü", fontSize = 11.sp, color = SoftGrey, fontWeight = FontWeight.Bold)
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            listOf("Zayıf", "Orta", "Güçlü", "Kusursuz").forEach { level ->
                                val isSelected = evidencePower == level
                                Card(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clickable { evidencePower = level },
                                    colors = CardDefaults.cardColors(
                                        containerColor = if (isSelected) GoldDark else SlateGrey.copy(alpha = 0.5f)
                                    ),
                                    shape = RoundedCornerShape(8.dp),
                                    border = BorderStroke(1.dp, if (isSelected) GoldLight else Color.Transparent)
                                ) {
                                    Box(modifier = Modifier.padding(vertical = 8.dp), contentAlignment = Alignment.Center) {
                                        Text(
                                            text = level,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isSelected) MidnightObsidian else IvoryWhite,
                                            textAlign = TextAlign.Center,
                                            modifier = Modifier.fillMaxWidth()
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Witness Reliability Segmented Buttons
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text("Tanık Beyanlarının Gücü", fontSize = 11.sp, color = SoftGrey, fontWeight = FontWeight.Bold)
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            listOf("Yok", "Zayıf", "Güvenilir", "Çok Güçlü").forEach { level ->
                                val isSelected = witnessReliability == level
                                Card(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clickable { witnessReliability = level },
                                    colors = CardDefaults.cardColors(
                                        containerColor = if (isSelected) GoldDark else SlateGrey.copy(alpha = 0.5f)
                                    ),
                                    shape = RoundedCornerShape(8.dp),
                                    border = BorderStroke(1.dp, if (isSelected) GoldLight else Color.Transparent)
                                ) {
                                    Box(modifier = Modifier.padding(vertical = 8.dp), contentAlignment = Alignment.Center) {
                                        Text(
                                            text = level,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isSelected) MidnightObsidian else IvoryWhite,
                                            textAlign = TextAlign.Center,
                                            modifier = Modifier.fillMaxWidth()
                                        )
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    // Launch Simulation Button
                    Button(
                        onClick = { startSimulation() },
                        enabled = !isSimulating,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("start_simulation_main_btn"),
                        colors = ButtonDefaults.buttonColors(containerColor = GoldDark, disabledContainerColor = SlateGrey),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        if (isSimulating) {
                            CircularProgressIndicator(color = MidnightObsidian, modifier = Modifier.size(22.dp), strokeWidth = 2.dp)
                            Spacer(modifier = Modifier.width(10.dp))
                            Text("Yapay Zeka Karar Matrisi Hesaplanıyor...", color = MidnightObsidian, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        } else {
                            Icon(Icons.Default.PlayArrow, contentDescription = null, tint = MidnightObsidian)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("PROFESYONEL SİMÜLASYONU BAŞLAT", color = MidnightObsidian, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Animated results section
        if (hasSimulated && !isSimulating) {
            // PROBABILITY METERS (Immersive Dashboard elements)
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.4f))
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "3. Simülasyon Sonuçları & Olasılık Dağılımı",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = GoldLight,
                            modifier = Modifier.align(Alignment.Start)
                        )
                        Spacer(modifier = Modifier.height(16.dp))

                        // Custom gauge meter drawing in canvas
                        Box(
                            modifier = Modifier
                                .size(180.dp)
                                .padding(8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Canvas(modifier = Modifier.fillMaxSize()) {
                                val strokeWidthValue = 14.dp.toPx()
                                val sizeValue = size.minDimension - strokeWidthValue

                                // Arc background
                                drawArc(
                                    color = SlateGrey,
                                    startAngle = 140f,
                                    sweepAngle = 260f,
                                    useCenter = false,
                                    topLeft = Offset(strokeWidthValue / 2, strokeWidthValue / 2),
                                    size = Size(sizeValue, sizeValue),
                                    style = Stroke(width = strokeWidthValue, cap = StrokeCap.Round)
                                )

                                // Green win arc segment
                                val winSweep = (winChance / 100f) * 260f
                                drawArc(
                                    color = SuccessGreen,
                                    startAngle = 140f,
                                    sweepAngle = winSweep,
                                    useCenter = false,
                                    topLeft = Offset(strokeWidthValue / 2, strokeWidthValue / 2),
                                    size = Size(sizeValue, sizeValue),
                                    style = Stroke(width = strokeWidthValue, cap = StrokeCap.Round)
                                )

                                // Amber settlement segment
                                val settleSweep = (settlementChance / 100f) * 260f
                                drawArc(
                                    color = WarningOrange,
                                    startAngle = 140f + winSweep,
                                    sweepAngle = settleSweep,
                                    useCenter = false,
                                    topLeft = Offset(strokeWidthValue / 2, strokeWidthValue / 2),
                                    size = Size(sizeValue, sizeValue),
                                    style = Stroke(width = strokeWidthValue, cap = StrokeCap.Round)
                                )

                                // Red loss segment
                                val lossSweep = (lossChance / 100f) * 260f
                                drawArc(
                                    color = ErrorRed,
                                    startAngle = 140f + winSweep + settleSweep,
                                    sweepAngle = lossSweep,
                                    useCenter = false,
                                    topLeft = Offset(strokeWidthValue / 2, strokeWidthValue / 2),
                                    size = Size(sizeValue, sizeValue),
                                    style = Stroke(width = strokeWidthValue, cap = StrokeCap.Round)
                                )
                            }

                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = "%${winChance.toInt()}",
                                    fontSize = 28.sp,
                                    fontWeight = FontWeight.Black,
                                    color = SuccessGreen
                                )
                                Text(
                                    text = "Kazanma Şansı",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = GoldLight
                                )
                            }
                        }

                        // Legendary indicators Row
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("%${winChance.toInt()}", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = SuccessGreen)
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(SuccessGreen))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Kabul (Kazanma)", fontSize = 10.sp, color = SoftGrey)
                                }
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("%${settlementChance.toInt()}", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = WarningOrange)
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(WarningOrange))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Uzlaşma / Sulh", fontSize = 10.sp, color = SoftGrey)
                                }
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("%${lossChance.toInt()}", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = ErrorRed)
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(ErrorRed))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Ret (Kaybetme)", fontSize = 10.sp, color = SoftGrey)
                                }
                            }
                        }
                    }
                }
            }

            // SWOT ANALİZİ
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, SlateGrey.copy(alpha = 0.4f))
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("4. Stratejik Hukuki SWOT Analizi", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldDark)

                        simulatedSWOT.forEach { (type, text) ->
                            val color = when {
                                type.contains("GÜÇLÜ") -> SuccessGreen
                                type.contains("ZAYIF") -> WarningOrange
                                type.contains("FIRSAT") -> AmberAccent
                                else -> ErrorRed
                            }
                            Column(modifier = Modifier.fillMaxWidth()) {
                                Text(type, fontSize = 10.sp, fontWeight = FontWeight.Black, color = color, letterSpacing = 1.sp)
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(text, fontSize = 11.sp, color = IvoryWhite, lineHeight = 16.sp)
                                Spacer(modifier = Modifier.height(8.dp))
                                HorizontalDivider(color = SlateGrey.copy(alpha = 0.3f))
                            }
                        }
                    }
                }
            }

            // CHRONOLOGICAL COURT RISKS (Interactive timeline)
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, SlateGrey.copy(alpha = 0.4f))
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("5. Yargılama Süreci Aşama & Riskleri", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldDark)

                        val stages = listOf(
                            Triple("Aşama 1: Dava Dilekçesi & Dilekçeler Düellosu", "Karşı tarafın zamanaşımı ve yetki itirazlarının hukuki geçerlilik riski.", "Mevcut Risk Oranı: %15"),
                            Triple("Aşama 2: Ön İnceleme Duruşması", "Delillerin sunulması için verilecek kesin 2 haftalık sürede belge eksikliklerinin tamamlanamama riski.", "Mevcut Risk Oranı: %25"),
                            Triple("Aşama 3: Tahkikat & Bilirkişi İncelemesi", "Bilirkişinin banka dökümlerini yetersiz bulması ve fahiş hesap indirimi uygulama riski.", "Mevcut Risk Oranı: %40"),
                            Triple("Aşama 4: Karar Duruşması", "Hakimin 'kanaat' veya 'hakkaniyet indirimi' takdirini aleyhinize %30'dan fazla kullanma riski.", "Mevcut Risk Oranı: %20")
                        )

                        stages.forEachIndexed { idx, (stageName, riskDesc, riskRatio) ->
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Box(
                                        modifier = Modifier
                                            .size(24.dp)
                                            .clip(CircleShape)
                                            .background(GoldDark.copy(alpha = 0.2f))
                                            .border(1.dp, GoldDark, CircleShape),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text("${idx + 1}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                    }
                                    if (idx < stages.size - 1) {
                                        Box(
                                            modifier = Modifier
                                                .width(1.dp)
                                                .height(55.dp)
                                                .background(SlateGrey)
                                        )
                                    }
                                }
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(stageName, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                    Text(riskDesc, fontSize = 10.sp, color = SoftGrey, lineHeight = 14.sp)
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(riskRatio, fontSize = 10.sp, color = ErrorRed, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }

            // INTERACTIVE TACTICAL REMEDIES (Actions to click)
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, SlateGrey.copy(alpha = 0.4f))
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("6. İnteraktif Taktik Çözümler & Yol Haritası", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldDark)
                        Text("Yapay zekanın bu simülasyon parametrelerine göre ürettiği kazanmayı artıracak proaktif çözümler:", fontSize = 11.sp, color = SoftGrey)

                        simulatedTactics.forEachIndexed { index, tactic ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(SlateGrey.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                                    .padding(10.dp),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(Icons.Default.Verified, contentDescription = null, tint = SuccessGreen, modifier = Modifier.size(16.dp))
                                Column {
                                    Text("Taktik Öneri ${index + 1}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(tactic, fontSize = 11.sp, color = IvoryWhite, lineHeight = 15.sp)
                                }
                            }
                        }
                    }
                }
            }

            // WHAT-IF SCENARIOS (Interactive recalculator)
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, SlateGrey.copy(alpha = 0.4f))
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("7. İnteraktif 'Ya Şöyle Olursa?' (What-If) Senaryoları", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldDark)
                        Text("Hukuk yargılamalarında beklenmedik kriz anlarını simüle edin ve cevabınıza göre kazanma olasılığınızın değişimini görün:", fontSize = 11.sp, color = SoftGrey)

                        whatIfQuestions.forEachIndexed { idx, (question, options, weight) ->
                            val chosen = answeredWhatIfs[idx]

                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .border(1.dp, SlateGrey, RoundedCornerShape(8.dp))
                                    .padding(12.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text("Soru ${idx + 1}: $question", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = GoldLight)

                                options.forEachIndexed { optIdx, optText ->
                                    val isChosen = chosen == optIdx
                                    val bg = if (isChosen) {
                                        if (weight[optIdx] > 0) SuccessGreen.copy(alpha = 0.15f) else ErrorRed.copy(alpha = 0.15f)
                                    } else {
                                        Color.Transparent
                                    }
                                    val borderCol = if (isChosen) {
                                        if (weight[optIdx] > 0) SuccessGreen else ErrorRed
                                    } else {
                                        SlateGrey
                                    }

                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(bg, RoundedCornerShape(6.dp))
                                            .border(1.dp, borderCol, RoundedCornerShape(6.dp))
                                            .clickable {
                                                if (chosen == null) {
                                                    val newAnswers = answeredWhatIfs.toMutableMap()
                                                    newAnswers[idx] = optIdx
                                                    answeredWhatIfs = newAnswers

                                                    // Apply impact dynamically
                                                    val delta = weight[optIdx]
                                                    winChance = (winChance + delta).coerceIn(5f, 95f)
                                                    lossChance = (100f - winChance - settlementChance).coerceIn(5f, 90f)

                                                    Toast.makeText(context, "Kazanma Olasılığı ${if (delta > 0) "Arttı!" else "Düştü!"}", Toast.LENGTH_SHORT).show()
                                                }
                                            }
                                            .padding(8.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        RadioButton(
                                            selected = isChosen,
                                            onClick = null,
                                            colors = RadioButtonDefaults.colors(selectedColor = GoldDark, unselectedColor = SoftGrey)
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(optText, fontSize = 11.sp, color = IvoryWhite, modifier = Modifier.weight(1f))

                                        if (isChosen) {
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text(
                                                text = if (weight[optIdx] > 0) "+%${weight[optIdx].toInt()}" else "%${weight[optIdx].toInt()}",
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = if (weight[optIdx] > 0) SuccessGreen else ErrorRed
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // COURTROOM ROLEPLAY ARENA (Interactive dynamic simulator)
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                    shape = RoundedCornerShape(16.dp),
                    border = BorderStroke(1.dp, GoldDark.copy(alpha = 0.3f))
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("8. İnteraktif Duruşma Simülasyon Arenası", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = GoldDark)
                            Surface(
                                color = when (courtroomJudgeMood) {
                                    "Memnun" -> SuccessGreen.copy(alpha = 0.15f)
                                    "Kızgın" -> ErrorRed.copy(alpha = 0.15f)
                                    else -> SlateGrey
                                },
                                shape = RoundedCornerShape(4.dp)
                            ) {
                                Text(
                                    text = "Hakim Modu: $courtroomJudgeMood",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = when (courtroomJudgeMood) {
                                        "Memnun" -> SuccessGreen
                                        "Kızgın" -> ErrorRed
                                        else -> GoldLight
                                    },
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }

                        Text("Seçtiğiniz hakim ve rakip vekil karakterleri dosya özelinde canlandırılıyor. Hakime en uygun hukuki yanıtı verin:", fontSize = 11.sp, color = SoftGrey)

                        // Courtroom chat box
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(MidnightObsidian, RoundedCornerShape(8.dp))
                                .border(1.dp, SlateGrey, RoundedCornerShape(8.dp))
                                .padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            // Opponent Objection
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(24.dp)
                                        .clip(CircleShape)
                                        .background(ErrorRed.copy(alpha = 0.15f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text("R", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = ErrorRed)
                                }
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Rakip Vekil (İtiraz):", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = ErrorRed)
                                    Text("\"$courtroomOpponentText\"", fontSize = 11.sp, color = IvoryWhite, lineHeight = 14.sp)
                                }
                            }

                            // Judge Command
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(24.dp)
                                        .clip(CircleShape)
                                        .background(GoldDark.copy(alpha = 0.15f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text("H", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = GoldDark)
                                }
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Hakim (Soruyor):", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = GoldDark)
                                    Text("\"$courtroomJudgeText\"", fontSize = 11.sp, color = IvoryWhite, lineHeight = 14.sp)
                                }
                            }

                            // Court decision output
                            if (courtroomStep == 2) {
                                AnimatedVisibility(
                                    visible = true,
                                    enter = fadeIn() + expandVertically()
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(SlateGrey.copy(alpha = 0.4f), RoundedCornerShape(6.dp))
                                            .padding(10.dp),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Icon(
                                            imageVector = if (courtroomJudgeMood == "Memnun") Icons.Default.CheckCircle else Icons.Default.Info,
                                            contentDescription = null,
                                            tint = if (courtroomJudgeMood == "Memnun") SuccessGreen else WarningOrange,
                                            modifier = Modifier.size(18.dp)
                                        )
                                        Column {
                                            Text("Hakimin Kararı & Geri Bildirim:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                            Spacer(modifier = Modifier.height(2.dp))
                                            Text(courtroomOutcomeText, fontSize = 11.sp, color = IvoryWhite, lineHeight = 15.sp)
                                        }
                                    }
                                }
                            }
                        }

                        // Response Options
                        if (courtroomStep == 1) {
                            val rpOptions = listOf(
                                "Mevzuat ve Yargıtay ilamları doğrultusunda iddialarımızın usul ve yasaya uygunluğunu belirterek süre talep ediyorum.",
                                "Karşı tarafın itirazlarının tamamen esastan uzaklaştırmaya yönelik usuli geciktirme taktiği olduğunu belirtmek isterim.",
                                "Sayın Hakim, hakkaniyet ve somut olayın özellikleri göz önüne alınarak uyuşmazlığın bilirkişiye gönderilmesini talep ederiz."
                            )

                            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                rpOptions.forEachIndexed { index, option ->
                                    Button(
                                        onClick = { answerJudge(index) },
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = ButtonDefaults.buttonColors(containerColor = SlateGrey),
                                        shape = RoundedCornerShape(8.dp),
                                        contentPadding = PaddingValues(10.dp)
                                    ) {
                                        Text(option, fontSize = 10.sp, color = IvoryWhite, textAlign = TextAlign.Start, lineHeight = 13.sp)
                                    }
                                }
                            }
                        } else if (courtroomStep == 2) {
                            Button(
                                onClick = {
                                    courtroomStep = 1
                                    courtroomUserChoice = -1
                                    courtroomJudgeMood = "Ciddi"
                                },
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.buttonColors(containerColor = GoldDark)
                            ) {
                                Text("Duruşmayı Yeniden Canlandır", color = MidnightObsidian, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            // Export PDF Simulation button
            item {
                Button(
                    onClick = {
                        Toast.makeText(context, "Profesyonel Dava Simülasyon Raporu PDF/Word olarak simüle edilip indirildi!", Toast.LENGTH_LONG).show()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .testTag("download_sim_report_btn"),
                    colors = ButtonDefaults.buttonColors(containerColor = WarningOrange),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Download, contentDescription = null, tint = MidnightObsidian)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Profesyonel Simülasyon Raporunu İndir (Simüle)", color = MidnightObsidian, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
