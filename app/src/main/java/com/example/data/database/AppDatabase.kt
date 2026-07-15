package com.example.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        CaseFile::class,
        LegalDocument::class,
        ChatMessage::class,
        CalendarEvent::class,
        UserProfile::class,
        QuerySession::class,
        PaymentReceipt::class
    ],
    version = 4,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun caseFileDao(): CaseFileDao
    abstract fun legalDocumentDao(): LegalDocumentDao
    abstract fun chatMessageDao(): ChatMessageDao
    abstract fun calendarEventDao(): CalendarEventDao
    abstract fun userProfileDao(): UserProfileDao
    abstract fun querySessionDao(): QuerySessionDao
    abstract fun paymentReceiptDao(): PaymentReceiptDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "al_hukuk_ai_database"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
