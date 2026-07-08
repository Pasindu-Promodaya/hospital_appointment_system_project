# Hospital Appointment System

Module Code: **SWST 32043 - Software Architecture and Concepts**

---

## Group Members
| Name | Student ID |
|---|---|
| Samarawickrama S.L.D.H.S | CT/2021/037 |
| Ihsaan M.S | CT/2021/011 |
| Nehinnage N.D.M.D | CT/2021/042 |
| Promodaya W.D.P | CT/2021/064 |
| Kirojan S | CT/2021/086 |

---

## System Description
The Hospital Appointment Management System is a web-based platform that streamlines clinical scheduling and patient record management. It provides a public doctor directory so visitors can browse specialists by department or availability, a Patient Portal for maintaining Electronic Health Records (EHR), and role-specific dashboards for medical staff and administrators to manage staff rosters, appointment schedules, and day-to-day operations.

---

## Technology Used
- **Frontend:** React, Vite, JavaScript, Tailwind CSS, React Router DOM, Axios
- **Backend:** Java, Spring Boot, Spring Data JPA, Spring Security
- **Database:** MySQL
- **Authentication:** JWT-based stateless authentication with local storage session handling
- **Notifications:** JavaMail Sender (SMTP email) and Twilio API (WhatsApp messaging)
- **Build & Development Tools:** Maven, npm, Git, GitHub, Postman, Browser Developer Tools

---

## Installation / Setup

### Prerequisites
Before setting up the project, make sure the following are installed on your machine:
- Java Development Kit (JDK 21 or higher)
- Node.js (v18 or higher) and npm
- MySQL Server
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/himalsamarawickrama/hospital-appointment-system.git
cd hospital-appointment-system
```

### 2. Database Setup
Open MySQL Workbench or your MySQL command-line client and create the database:
```sql
CREATE DATABASE hospital_appointment_system;
```

Then open `backend/src/main/resources/application.properties` and update the credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hospital_appointment_system
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
```

### 3. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
./mvnw clean install
```

### 4. Frontend Setup
Open a second terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

---

## How to Run

### Start the Backend
From the `backend` directory:
```bash
./mvnw spring-boot:run
```
The backend server will start at `http://localhost:8080`.

### Start the Frontend
From the `frontend` directory:
```bash
npm run dev
```
The frontend will be available at `http://localhost:5173` (or `http://localhost:3000`, depending on your Vite configuration). Open this URL in your browser to access the application.

---

## Main Features & Responsibility Matrix

| Feature | Description | Member Responsible |
|---|---|---|
| Authentication & Role-Based Access Control | JWT authentication, protected routes, role-based dashboard access | CT/2021/037 |
| Patient Profile & EHR Management | Patient profile forms and CRUD operations for health records | CT/2021/086 |
| Doctor Discovery & Directory | Searchable/filterable doctor directory by specialty and availability | CT/2021/037 |
| Appointment Booking & Scheduling | Calendar-based slot booking and scheduling engine | CT/2021/011 |
| Admin Workspace & Staff Management | Doctor provisioning and staff roster management | CT/2021/042 |
| Notification System | SMTP email and Twilio WhatsApp notification pipelines | CT/2021/064 |

---

## GitHub Contribution Summary
All development work, code reviews, and refactoring efforts are tracked through commit history on the project's GitHub repository. Each member's contributions can be viewed under the repository's **Insights → Contributors** tab.
