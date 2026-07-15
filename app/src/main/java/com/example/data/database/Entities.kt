package com.example.data.database

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "case_files")
data class CaseFile(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val clientName: String,
    val description: String = "",
    val notes: String = "",
    val status: String = "ACTIVE", // ACTIVE, CLOSED, ARCHIVED
    val timelineJson: String? = null,
    val claimsEvidenceJson: String? = null,
    val missingInfoJson: String? = null,
    val scenariosJson: String? = null,
    val strengthsWeaknessesJson: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "documents")
data class LegalDocument(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val caseFileId: Int,
    val name: String,
    val type: String, // PDF, PHOTO, WORD, AUDIO, VIDEO
    val uploadDate: String,
    val summary: String? = null,
    val content: String? = null,
    val isUnreadable: Boolean = false,
    val missingRequiredDocs: String? = null
)

@Entity(tableName = "chat_messages")
data class ChatMessage(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val caseFileId: Int,
    val sender: String, // USER, AI
    val message: String,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "calendar_events")
data class CalendarEvent(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val caseFileId: Int,
    val title: String,
    val type: String, // HEARING (Duruşma), DEADLINE (İtiraz Süresi), NOTIFICATION (Tebligat), OTHER
    val date: String, // YYYY-MM-DD
    val description: String = "",
    val isCompleted: Boolean = false
)

@Entity(tableName = "user_profile")
data class UserProfile(
    @PrimaryKey val id: Int = 1,
    val userName: String = "Av. Kerem Soylu",
    val language: String = "TR", // TR, EN, DE, AR
    val isPremium: Boolean = true,
    val academyScore: Int = 0,
    val email: String = "guzelkokarizzet625@gmail.com",
    val isAdmin: Boolean = true,
    val systemIban: String = "TR96 0006 2000 0001 2345 6789 01",
    val premiumPriceMonthly: String = "₺450.00",
    val premiumPriceAnnual: String = "₺3600.00"
)

@Entity(tableName = "payment_receipts")
data class PaymentReceipt(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val senderName: String,
    val email: String,
    val iban: String,
    val amount: String,
    val date: String,
    val receiptFileName: String,
    val status: String = "PENDING" // PENDING, APPROVED, REJECTED
)

@Entity(tableName = "query_sessions")
data class QuerySession(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val type: String, // "SEARCH" or "PETITION"
    val query: String, // search term, or summary/info for petition
    val response: String, // search result or generated petition text
    val timestamp: Long = System.currentTimeMillis()
)
