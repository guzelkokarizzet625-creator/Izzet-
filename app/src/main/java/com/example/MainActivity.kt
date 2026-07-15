package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.ViewModelProvider
import com.example.data.database.AppDatabase
import com.example.data.repository.LegalRepository
import com.example.ui.screens.LegalAppMain
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.LegalViewModel
import com.example.ui.viewmodel.LegalViewModelFactory

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val database = AppDatabase.getDatabase(applicationContext)
        val repository = LegalRepository(
            caseFileDao = database.caseFileDao(),
            legalDocumentDao = database.legalDocumentDao(),
            chatMessageDao = database.chatMessageDao(),
            calendarEventDao = database.calendarEventDao(),
            userProfileDao = database.userProfileDao(),
            querySessionDao = database.querySessionDao(),
            paymentReceiptDao = database.paymentReceiptDao()
        )
        val factory = LegalViewModelFactory(repository)
        val viewModel = ViewModelProvider(this, factory)[LegalViewModel::class.java]

        setContent {
            MyApplicationTheme {
                Surface(
                    modifier = Modifier.fillMaxSize()
                ) {
                    LegalAppMain(viewModel)
                }
            }
        }
    }
}
