# SOFTWARE REQUIREMENTS SPECIFICATION (SRS): UNISKILL

## 1. INTRODUCTION

### 1.1 Purpose
The purpose of this document is to provide a detailed description of the UniSkill platform. It will illustrate the purpose and complete declaration of the development of the system. It will also explain the system constraints, interface, and interactions with other external applications.

### 1.2 Scope
UniSkill is a web-based skill exchange platform. It allows university students to register, verify their identities, list their skills, and book learning sessions with peers. The platform manages a virtual wallet for credit-based transactions, real-time messaging, and session lifecycle tracking.

### 1.3 Definitions, Acronyms, and Abbreviations
*   **SRS:** Software Requirements Specification.
*   **RLS:** Row Level Security (Supabase security feature).
*   **OTP:** One-Time Password.
*   **ORM:** Object-Relational Mapping (Prisma).
*   **P2P:** Peer-to-Peer.

---

## 2. OVERALL DESCRIPTION

### 2.1 Product Perspective
UniSkill is a standalone system that interfaces with Supabase for authentication and database management. It uses a modern client-server architecture where the frontend (Next.js) and backend (Node.js) communicate over HTTPS.

### 2.2 User Classes and Characteristics
*   **Learner:** Students looking for help with specific skills.
*   **Mentor:** Students providing expertise in specific areas.
*   **Admin:** Responsible for platform maintenance and conflict resolution.

### 2.3 Operating Environment
*   **Client side:** Any modern browser (Chrome, Firefox, Safari).
*   **Server side:** Node.js v18.0 or higher.
*   **Database:** PostgreSQL 15.0 or higher.

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 Authentication Module
*   **FR-1:** System shall allow users to sign up using their university email.
*   **FR-2:** System shall send a 6-digit OTP for email verification.
*   **FR-3:** System shall support secure login using JWT tokens.
*   **FR-4:** System shall allow password reset via email link.

### 3.2 Profile Management Module
*   **FR-5:** Users shall be able to create and edit a profile including name, bio, and college.
*   **FR-6:** Users shall be able to upload a profile picture and ID card for verification.
*   **FR-7:** Mentors shall be able to list skills with proficiency levels.
*   **FR-8:** Mentors shall be able to set their hourly rate in UniCredits.

### 3.3 Marketplace & Booking Module
*   **FR-9:** Learners shall be able to search for skills using keywords and filters.
*   **FR-10:** Learners shall be able to request a session by selecting a time slot.
*   **FR-11:** Mentors shall receive notifications for new booking requests.
*   **FR-12:** Mentors shall be able to Accept or Decline a session request.

### 3.4 Wallet & Transaction Module
*   **FR-13:** Every user shall have a virtual wallet with a credit balance.
*   **FR-14:** Credits shall be deducted from the Learner's wallet upon booking (Escrow).
*   **FR-15:** Credits shall be transferred to the Mentor's wallet upon session completion.
*   **FR-16:** System shall maintain a history of all credit transactions.

### 3.5 Messaging Module
*   **FR-17:** System shall provide a real-time chat interface for Mentors and Learners.
*   **FR-18:** System shall indicate the read/unread status of messages.

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Security
*   **NFR-1:** All database access must be protected by Row Level Security (RLS).
*   **NFR-2:** Sensitive data like passwords must be encrypted using industry-standard algorithms.

### 4.2 Performance
*   **NFR-3:** The system should load the main marketplace feed in less than 2 seconds.
*   **NFR-4:** Real-time messages should be delivered with a latency of less than 200ms.

### 4.3 Scalability
*   **NFR-5:** The backend architecture should support up to 1000 concurrent users.

### 4.4 Availability
*   **NFR-6:** The system should aim for 99.9% uptime during the academic semester.

---

## 5. EXTERNAL INTERFACE REQUIREMENTS

### 5.1 User Interfaces
*   The UI shall be responsive, adjusting to mobile, tablet, and desktop screens.
*   The design shall follow modern accessibility standards (WCAG).

### 5.2 Software Interfaces
*   **Supabase Client:** For authentication and real-time database subscription.
*   **Prisma Client:** For server-side database operations.
*   **Nodemailer/Resend:** For sending OTP and transaction emails.

---

## 6. DATA DICTIONARY (CORE TABLES)

| Table | Column | Type | Description |
| :--- | :--- | :--- | :--- |
| **profiles** | id | UUID | Primary key, linked to Auth user |
| **profiles** | credits | Integer | Current wallet balance |
| **sessions** | status | String | pending, scheduled, completed, cancelled |
| **skills** | category | String | Programming, Arts, Academics, etc. |
| **transactions**| amount | Integer | Number of credits moved |

---

## 7. CONCLUSION
This SRS document outlines the complete roadmap for the UniSkill platform. Adherence to these requirements ensures a robust, user-friendly, and secure environment for student skill exchange.
