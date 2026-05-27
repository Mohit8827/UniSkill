# PROJECT SYNOPSIS: UNISKILL

## 1. PROJECT TITLE
**UniSkill: A Decentralized Peer-to-Peer Academic and Extracurricular Skill Exchange Marketplace**

---

## 2. ABSTRACT
UniSkill is a comprehensive digital ecosystem designed for university campuses to facilitate the exchange of skills among students. Utilizing a credit-based economy, the platform allows students to act as both mentors and learners. It addresses the lack of structured peer-to-peer learning opportunities by providing a verified, secure, and real-time marketplace. Built with a modern tech stack (Next.js, Node.js, Prisma, and Supabase), UniSkill ensures high performance, security via Row Level Security (RLS), and a seamless user experience.

---

## 3. INTRODUCTION
In a university setting, students possess a wide array of talents, from academic mastery in STEM subjects to creative skills like digital art and music. However, finding a peer to learn from often relies on informal, inefficient social networks. UniSkill formalizes this exchange, creating a "Skill Marketplace" where time and expertise are the primary currencies. This project aims to foster a culture of collaborative learning while providing student mentors with a platform to build a verified tutoring portfolio.

---

## 4. PROBLEM STATEMENT
Current educational environments face several challenges:
1. **Hyper-Individualism:** Students often struggle in isolation due to the high cost of professional tutoring.
2. **Underutilized Talent:** Skilled students have no centralized platform to offer their expertise within their campus.
3. **Trust Deficit:** Informal tutoring arrangements lack verification and accountability for attendance or quality.
4. **Economic Barriers:** Traditional tutoring requires cash transactions, which can be awkward or inaccessible for many students.

---

## 5. PROPOSED SYSTEM
UniSkill proposes a technology-driven solution to these problems:
*   **Verified Profiles:** Integration with university email domains and ID verification.
*   **Credit Economy:** A virtual wallet system using "UniCredits" to facilitate frictionless exchange.
*   **Discovery Engine:** A categorization and filtering system for finding the right mentor.
*   **Lifecycle Management:** End-to-end booking flow from initial request to final feedback.
*   **Real-time Communication:** Built-in chat for coordination without sharing private contact details.

---

## 6. OBJECTIVES
1. **Design and Development:** Create a responsive web application using Next.js 14 and Node.js.
2. **Secure Identity:** Implement OTP-based authentication and Supabase-backed security.
3. **Transaction Integrity:** Develop an ACID-compliant wallet system for managing virtual credits.
4. **Collaborative Tools:** Integrate real-time messaging using WebSockets (Socket.io).
5. **Quality Assurance:** Implement a rating and review system to maintain academic standards.

---

## 7. SYSTEM ARCHITECTURE (OVERVIEW)
*   **Frontend:** React-based Next.js framework for Server-Side Rendering (SSR) and SEO optimization.
*   **Backend:** Express.js RESTful API architecture handling business logic and socket connections.
*   **Database:** PostgreSQL managed by Supabase for relational data storage.
*   **ORM:** Prisma for type-safe database interactions and schema migrations.
*   **Security:** JWT (JSON Web Tokens) for session management and RLS for data isolation.

---

## 8. HARDWARE & SOFTWARE REQUIREMENTS

### 8.1 Software Requirements
*   **Operating System:** Windows 10/11, macOS, or Linux.
*   **Language/Framework:** Node.js (v18+), TypeScript, Next.js 14.
*   **Database:** PostgreSQL (via Supabase).
*   **Version Control:** Git & GitHub.

### 8.2 Hardware Requirements
*   **Processor:** Intel Core i5 or equivalent.
*   **RAM:** 8 GB Minimum.
*   **Storage:** 500 MB for project source code.

---

## 9. CONCLUSION
UniSkill represents a significant step toward a more collaborative and efficient campus learning environment. By leveraging modern web technologies and a credit-based economy, it empowers students to take control of their learning journey and share their expertise with the community.
