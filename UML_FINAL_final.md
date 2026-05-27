# UML DESIGN DOCUMENTATION: UNISKILL

## 1. USE CASE DIAGRAM

### 1.1 Description
The Use Case Diagram describes the functional requirements of the system from the perspective of the users (Actors).

### 1.2 Actors
1.  **Learner:** Browses skills, manages wallet, books sessions, rates mentors.
2.  **Mentor:** Lists skills, sets rates, manages bookings, earns credits.
3.  **System:** Verifies identity, handles automated transactions, sends notifications.

### 1.3 Use Case List
*   **UC-1: User Registration:** Authentication via OTP.
*   **UC-2: Manage Profile:** Update skills and personal data.
*   **UC-3: Browse Marketplace:** Search and filter mentors.
*   **UC-4: Book Session:** Initiate a booking request and escrow payment.
*   **UC-5: Real-time Chat:** Messaging between student and mentor.
*   **UC-6: Complete Session:** Finalize session and release credits.
*   **UC-7: Rate/Review:** Provide feedback on the learning experience.

---

## 2. CLASS DIAGRAM

### 2.1 Entity Descriptions
This diagram represents the static structure of the database and backend models.

*   **Profile Class:**
    *   *Attributes:* id, name, email, credits, isMentor, rating.
    *   *Methods:* updateCredits(), verifyIdentity().
*   **Session Class:**
    *   *Attributes:* id, studentId, mentorId, price, status, scheduledAt.
    *   *Methods:* updateStatus(), calculateDuration().
*   **Skill Class:**
    *   *Attributes:* id, name, category, description.
*   **Transaction Class:**
    *   *Attributes:* id, userId, amount, type (credit/debit).
*   **Message Class:**
    *   *Attributes:* id, senderId, receiverId, content, timestamp.

### 2.2 Relationships
*   **Profile to Session:** 1-to-Many (One profile can have many sessions as a learner or mentor).
*   **Profile to Transaction:** 1-to-Many.
*   **Session to Review:** 1-to-1.
*   **Profile to Skill:** Many-to-Many (Resolved via `UserSkill` junction class).

---

## 3. SEQUENCE DIAGRAMS

### 3.1 Session Booking Sequence
1.  **Learner** clicks "Book" on Frontend.
2.  **Frontend** calls `POST /api/sessions`.
3.  **Backend** queries Learner's `credits` from Database.
4.  **Database** returns credit balance.
5.  **Backend** verifies balance >= price.
6.  **Backend** starts Database Transaction:
    *   Deduct credits from Learner.
    *   Create Session (status: pending).
    *   Create Transaction record (type: escrow).
7.  **Backend** sends "New Booking" notification to **Mentor**.
8.  **Backend** returns success to **Learner**.

---

## 4. ACTIVITY DIAGRAM

### 4.1 Mentor Onboarding Flow
1.  [Start]
2.  User signs up and verifies OTP.
3.  User navigates to "Become a Mentor".
4.  User enters expertise and sets hourly rate.
5.  User uploads ID Card image.
6.  [Decision] Does Admin verify?
    *   If NO: Notify user to re-upload -> (Back to Step 5).
    *   If YES: Update `isVerified = true`.
7.  Mentor profile becomes visible in Marketplace.
8.  [End]

---

## 5. ENTITY RELATIONSHIP DIAGRAM (ERD)

### 5.1 Tables and Keys
*   **Profiles Table:** Primary Key (id). Foreign Key (linked to Auth.Users).
*   **Sessions Table:** PK (id). FK (mentor_id -> profiles.id), FK (student_id -> profiles.id).
*   **UserSkills Table:** PK (id). FK (user_id -> profiles.id), FK (skill_id -> skills.id).
*   **Reviews Table:** PK (id). FK (session_id -> sessions.id).

---

## 6. STATE MACHINE DIAGRAM (SESSION STATUS)

1.  **Initial State:** `NULL`
2.  **Transition 1:** Booking Requested -> `PENDING`
3.  **Transition 2:** Mentor Accepts -> `SCHEDULED`
4.  **Transition 3:** Session Time Reached -> `ONGOING`
5.  **Transition 4:** User clicks "Complete" -> `COMPLETED`
6.  **Transition 5:** Mentor or Learner clicks "Cancel" -> `CANCELLED`

---

## 7. CONCLUSION
The UML design ensures that the UniSkill platform is built on a logical foundation that accounts for all user interactions and data dependencies.
