package com.example.ui.screens

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.database.PaymentReceipt
import com.example.ui.theme.*
import com.example.ui.viewmodel.LegalViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomerPaymentScreen(
    viewModel: LegalViewModel,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    
    val profile by viewModel.userProfile.collectAsStateWithLifecycle()
    val receipts by viewModel.paymentReceipts.collectAsStateWithLifecycle()
    
    val user = profile ?: return
    
    // Default settings values from profile
    val systemIban = user.systemIban.ifEmpty { "TR96 0006 2000 0001 2345 6789 01" }
    val monthlyPrice = user.premiumPriceMonthly.ifEmpty { "₺450.00" }
    val annualPrice = user.premiumPriceAnnual.ifEmpty { "₺3600.00" }

    var selectedPlan by remember { mutableStateOf("monthly") } // monthly or annual
    
    // Form fields
    var senderName by remember { mutableStateOf(user.userName) }
    var senderEmail by remember { mutableStateOf(user.email) }
    var senderIban by remember { mutableStateOf("") }
    var paymentAmount by remember { mutableStateOf(if (selectedPlan == "monthly") monthlyPrice else annualPrice) }
    var receiptFileName by remember { mutableStateOf("") }
    
    var showMockFilePicker by remember { mutableStateOf(false) }
    
    val mockReceiptFiles = listOf(
        "Ziraat_Dekont_Transfer_9012.pdf",
        "Garanti_BBVA_Odeme_Belgesi.pdf",
        "Is_Bankasi_Havale_Makbuzu.pdf",
        "Yapi_Kredi_Premium_Dekontu.pdf",
        "QNB_Finansbank_Transfer_Detayi.pdf"
    )

    // Sync payment amount when plan changes
    LaunchedEffect(selectedPlan) {
        paymentAmount = if (selectedPlan == "monthly") monthlyPrice else annualPrice
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Premium & Ödeme Merkezi",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = GoldLight
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack, modifier = Modifier.testTag("payment_back_btn")) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Geri Dön",
                            tint = GoldLight
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = CharcoalNavy,
                    titleContentColor = GoldLight
                ),
                actions = {
                    // Quick Switch Account Mode (for demo/testing capability)
                    IconButton(
                        onClick = {
                            viewModel.togglePremiumRole()
                            Toast.makeText(context, "Premium Durumu Değiştirildi", Toast.LENGTH_SHORT).show()
                        }
                    ) {
                        Icon(
                            imageVector = if (user.isPremium) Icons.Default.WorkspacePremium else Icons.Default.StarOutline,
                            contentDescription = "Abonelik Simülasyonu",
                            tint = if (user.isPremium) WarningOrange else SoftGrey
                        )
                    }
                }
            )
        },
        containerColor = MidnightObsidian
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header Info & Status
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                    border = BorderStroke(1.dp, if (user.isPremium) SuccessGreen.copy(alpha = 0.5f) else GoldDark.copy(alpha = 0.3f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.WorkspacePremium,
                                contentDescription = "Membership",
                                tint = if (user.isPremium) WarningOrange else GoldDark,
                                modifier = Modifier.size(28.dp)
                            )
                            Column {
                                Text(
                                    text = if (user.isPremium) "Premium Üyeliğiniz Aktif!" else "AL Hukuk AI Premium'a Yükseltin",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = GoldLight
                                )
                                Text(
                                    text = if (user.isPremium) "Sınırsız yasal analiz ve asistanlık modüllerinin keyfini çıkarın." else "Yapay zeka ile dava simülasyonu ve sınırsız dilekçe hazırlayın.",
                                    fontSize = 11.sp,
                                    color = SoftGrey
                                )
                            }
                        }
                    }
                }
            }

            if (!user.isPremium) {
                // Step 1: Select Plan
                item {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text = "1. Abonelik Paketi Seçin",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = GoldLight
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // Monthly Card
                            Card(
                                colors = CardDefaults.cardColors(
                                    containerColor = if (selectedPlan == "monthly") CharcoalNavy else CharcoalNavy.copy(alpha = 0.6f)
                                ),
                                border = BorderStroke(
                                    1.dp,
                                    if (selectedPlan == "monthly") GoldDark else SlateGrey
                                ),
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { selectedPlan = "monthly" }
                                    .testTag("plan_monthly_card")
                            ) {
                                Column(
                                    modifier = Modifier.padding(16.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Text("Aylık Profesyonel", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                    Text(monthlyPrice, fontSize = 18.sp, fontWeight = FontWeight.Black, color = GoldDark)
                                    Text("Her ay faturalandırılır", fontSize = 10.sp, color = SoftGrey)
                                }
                            }

                            // Annual Card
                            Card(
                                colors = CardDefaults.cardColors(
                                    containerColor = if (selectedPlan == "annual") CharcoalNavy else CharcoalNavy.copy(alpha = 0.6f)
                                ),
                                border = BorderStroke(
                                    1.dp,
                                    if (selectedPlan == "annual") GoldDark else SlateGrey
                                ),
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { selectedPlan = "annual" }
                                    .testTag("plan_annual_card")
                            ) {
                                Column(
                                    modifier = Modifier.padding(16.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Text("Yıllık Profesyonel", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                    Text(annualPrice, fontSize = 18.sp, fontWeight = FontWeight.Black, color = SuccessGreen)
                                    Text("Tek ödemeyle 12 Ay", fontSize = 10.sp, color = SoftGrey)
                                }
                            }
                        }
                    }
                }

                // Step 2: Show IBAN Information
                item {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text = "2. Banka Transferi (EFT/Havale) Yapın",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = GoldLight
                        )
                        Card(
                            colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                            border = BorderStroke(1.dp, SlateGrey),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(
                                    text = "Resmi Hukuki Alıcı Hesap Bilgileri:",
                                    fontSize = 11.sp,
                                    color = SoftGrey
                                )
                                Text(
                                    text = "AL HUKUK AI LTD. ŞTİ.",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = GoldLight
                                )
                                
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(SlateGrey.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                                        .padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text("IBAN Numarası", fontSize = 9.sp, color = SoftGrey)
                                        Text(
                                            text = systemIban,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = GoldDark,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                    }
                                    IconButton(
                                        onClick = {
                                            clipboardManager.setText(AnnotatedString(systemIban))
                                            Toast.makeText(context, "IBAN Kopyalandı!", Toast.LENGTH_SHORT).show()
                                        },
                                        modifier = Modifier.testTag("copy_iban_btn")
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.ContentCopy,
                                            contentDescription = "Kopyala",
                                            tint = GoldLight,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                }

                                Text(
                                    text = "* Lütfen transfer açıklamasına e-posta adresinizi (${user.email}) yazmayı unutmayınız. Transfer sonrası ödeme bildirim formunu doldurun.",
                                    fontSize = 10.sp,
                                    color = WarningOrange,
                                    lineHeight = 14.sp
                                )
                            }
                        }
                    }
                }

                // Step 3: Fill payment notification form
                item {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text = "3. Ödeme Bildirim Formu",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = GoldLight
                        )
                        Card(
                            colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                            border = BorderStroke(1.dp, SlateGrey),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                OutlinedTextField(
                                    value = senderName,
                                    onValueChange = { senderName = it },
                                    label = { Text("Gönderen Adı Soyadı") },
                                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                                    modifier = Modifier.fillMaxWidth().testTag("sender_name_input")
                                )

                                OutlinedTextField(
                                    value = senderEmail,
                                    onValueChange = { senderEmail = it },
                                    label = { Text("Kayıtlı E-Posta Adresi") },
                                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                                    modifier = Modifier.fillMaxWidth().testTag("sender_email_input")
                                )

                                OutlinedTextField(
                                    value = senderIban,
                                    onValueChange = { senderIban = it },
                                    label = { Text("Ödemenin Yapıldığı Sizin IBAN'ınız") },
                                    placeholder = { Text("TR00 ...") },
                                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                                    modifier = Modifier.fillMaxWidth().testTag("sender_iban_input")
                                )

                                OutlinedTextField(
                                    value = paymentAmount,
                                    onValueChange = { paymentAmount = it },
                                    label = { Text("Ödenen Tutar") },
                                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GoldDark, unfocusedBorderColor = SlateGrey),
                                    modifier = Modifier.fillMaxWidth().testTag("sender_amount_input")
                                )

                                // Mock File Upload simulation
                                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Text("Ödeme Dekontu Ekle (.pdf, .png)", fontSize = 11.sp, color = SoftGrey)
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(SlateGrey.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                                            .border(1.dp, SlateGrey, RoundedCornerShape(8.dp))
                                            .clickable { showMockFilePicker = !showMockFilePicker }
                                            .padding(12.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.UploadFile,
                                            contentDescription = "Upload",
                                            tint = GoldDark
                                        )
                                        Text(
                                            text = receiptFileName.ifEmpty { "Dekont dosyası seçmek için dokunun..." },
                                            color = if (receiptFileName.isEmpty()) SoftGrey else GoldLight,
                                            fontSize = 13.sp,
                                            modifier = Modifier.weight(1f)
                                        )
                                    }
                                    
                                    if (showMockFilePicker) {
                                        Surface(
                                            color = SlateGrey,
                                            shape = RoundedCornerShape(8.dp),
                                            border = BorderStroke(1.dp, GoldDark),
                                            modifier = Modifier.fillMaxWidth().padding(top = 4.dp)
                                        ) {
                                            Column {
                                                mockReceiptFiles.forEach { filename ->
                                                    Text(
                                                        text = filename,
                                                        fontSize = 12.sp,
                                                        color = IvoryWhite,
                                                        modifier = Modifier
                                                            .fillMaxWidth()
                                                            .clickable {
                                                                receiptFileName = filename
                                                                showMockFilePicker = false
                                                            }
                                                            .padding(12.dp)
                                                    )
                                                    HorizontalDivider(color = MidnightObsidian)
                                                }
                                            }
                                        }
                                    }
                                }

                                Button(
                                    onClick = {
                                        if (senderName.isBlank() || senderEmail.isBlank() || senderIban.isBlank() || receiptFileName.isBlank()) {
                                            Toast.makeText(context, "Lütfen tüm form alanlarını ve dekont dosyasını doldurunuz!", Toast.LENGTH_LONG).show()
                                        } else {
                                            viewModel.submitPaymentReceipt(
                                                senderName = senderName,
                                                email = senderEmail,
                                                iban = senderIban,
                                                amount = paymentAmount,
                                                date = "14.07.2026",
                                                receiptFileName = receiptFileName
                                            )
                                            Toast.makeText(context, "Ödeme bildiriminiz başarıyla yöneticilere iletildi!", Toast.LENGTH_LONG).show()
                                            // Reset fields
                                            senderIban = ""
                                            receiptFileName = ""
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = GoldDark),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(48.dp)
                                        .testTag("submit_receipt_btn")
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Send,
                                        contentDescription = null,
                                        tint = MidnightObsidian,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("ÖDEME BİLDİRİMİNİ GÖNDER", fontWeight = FontWeight.Bold, color = MidnightObsidian)
                                }
                            }
                        }
                    }
                }
            }

            // Payment History / Submissions
            item {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "Ödeme Bildirim Geçmişiniz",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = GoldLight
                    )
                    
                    if (receipts.isEmpty()) {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(24.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Icon(Icons.Default.ReceiptLong, contentDescription = null, tint = SoftGrey, modifier = Modifier.size(36.dp))
                                    Text(
                                        text = "Henüz kayıtlı bir ödeme bildirimi bulunmuyor.",
                                        fontSize = 11.sp,
                                        color = SoftGrey,
                                        textAlign = TextAlign.Center
                                    )
                                }
                            }
                        }
                    } else {
                        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            receipts.forEach { receipt ->
                                Card(
                                    colors = CardDefaults.cardColors(containerColor = CharcoalNavy),
                                    border = BorderStroke(1.dp, SlateGrey),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(receipt.receiptFileName, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                                            
                                            // Status badge
                                            val badgeColor = when (receipt.status) {
                                                "APPROVED" -> SuccessGreen
                                                "REJECTED" -> ErrorRed
                                                else -> WarningOrange
                                            }
                                            val badgeText = when (receipt.status) {
                                                "APPROVED" -> "ONAYLANDI"
                                                "REJECTED" -> "REDDEDİLDİ"
                                                else -> "ONAY BEKLİYOR"
                                            }
                                            
                                            Surface(
                                                color = badgeColor.copy(alpha = 0.15f),
                                                shape = RoundedCornerShape(4.dp),
                                                border = BorderStroke(1.dp, badgeColor)
                                            ) {
                                                Text(
                                                    text = badgeText,
                                                    color = badgeColor,
                                                    fontSize = 9.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                                                )
                                            }
                                        }

                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Column {
                                                Text("Miktar: ${receipt.amount}", fontSize = 11.sp, color = IvoryWhite)
                                                Text("Hesap: ${receipt.iban}", fontSize = 10.sp, color = SoftGrey)
                                            }
                                            Text(receipt.date, fontSize = 10.sp, color = SoftGrey)
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
}
