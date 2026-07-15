package com.example.data.database

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface CaseFileDao {
    @Query("SELECT * FROM case_files ORDER BY createdAt DESC")
    fun getAllCaseFiles(): Flow<List<CaseFile>>

    @Query("SELECT * FROM case_files WHERE id = :id")
    fun getCaseFileById(id: Int): Flow<CaseFile?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCaseFile(caseFile: CaseFile): Long

    @Update
    suspend fun updateCaseFile(caseFile: CaseFile)

    @Delete
    suspend fun deleteCaseFile(caseFile: CaseFile)

    @Query("SELECT COUNT(*) FROM case_files")
    suspend fun getCaseFileCount(): Int
}

@Dao
interface LegalDocumentDao {
    @Query("SELECT * FROM documents WHERE caseFileId = :caseFileId ORDER BY id DESC")
    fun getDocumentsByCaseFile(caseFileId: Int): Flow<List<LegalDocument>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDocument(document: LegalDocument): Long

    @Update
    suspend fun updateDocument(document: LegalDocument)

    @Delete
    suspend fun deleteDocument(document: LegalDocument)
}

@Dao
interface ChatMessageDao {
    @Query("SELECT * FROM chat_messages WHERE caseFileId = :caseFileId ORDER BY timestamp ASC")
    fun getChatMessagesByCaseFile(caseFileId: Int): Flow<List<ChatMessage>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertChatMessage(message: ChatMessage)

    @Query("DELETE FROM chat_messages WHERE caseFileId = :caseFileId")
    suspend fun deleteChatByCaseFile(caseFileId: Int)
}

@Dao
interface CalendarEventDao {
    @Query("SELECT * FROM calendar_events ORDER BY date ASC")
    fun getAllEvents(): Flow<List<CalendarEvent>>

    @Query("SELECT * FROM calendar_events WHERE caseFileId = :caseFileId ORDER BY date ASC")
    fun getEventsByCaseFile(caseFileId: Int): Flow<List<CalendarEvent>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvent(event: CalendarEvent): Long

    @Update
    suspend fun updateEvent(event: CalendarEvent)

    @Delete
    suspend fun deleteEvent(event: CalendarEvent)
}

@Dao
interface UserProfileDao {
    @Query("SELECT * FROM user_profile WHERE id = 1")
    fun getUserProfile(): Flow<UserProfile?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUserProfile(profile: UserProfile)
}

@Dao
interface QuerySessionDao {
    @Query("SELECT * FROM query_sessions ORDER BY timestamp DESC")
    fun getAllSessions(): Flow<List<QuerySession>>

    @Query("SELECT * FROM query_sessions WHERE type = :type ORDER BY timestamp DESC")
    fun getSessionsByType(type: String): Flow<List<QuerySession>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSession(session: QuerySession): Long

    @Delete
    suspend fun deleteSession(session: QuerySession)

    @Query("DELETE FROM query_sessions WHERE id = :id")
    suspend fun deleteSessionById(id: Int)

    @Query("DELETE FROM query_sessions")
    suspend fun deleteAllSessions()
}

@Dao
interface PaymentReceiptDao {
    @Query("SELECT * FROM payment_receipts ORDER BY id DESC")
    fun getAllReceipts(): Flow<List<PaymentReceipt>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReceipt(receipt: PaymentReceipt): Long

    @Update
    suspend fun updateReceipt(receipt: PaymentReceipt)

    @Delete
    suspend fun deleteReceipt(receipt: PaymentReceipt)
}
