# 🎓 ScholarStream — Scholarship Management Platform (Full-Stack MERN)

A comprehensive full-stack MERN application designed to connect students with scholarship opportunities worldwide. Universities and organizations can post scholarships while students can search, browse, and apply seamlessly.

🌐 **Live Site:** https://scholarstream-project.web.app  
🔌 **Server API:** https://scholarstream-server-mu.vercel.app  

---

## 🔐 Admin Credentials (Demo)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@scholarstream.com | Admin@123 |

---

## 📌 Project Overview
**ScholarStream** simplifies scholarship discovery and application management with a role-based system. Students can explore scholarships using advanced search/filtering and apply with secure Stripe payments. Moderators manage application reviews and feedback, while admins control the platform with analytics, scholarship CRUD, and user-role management.

---

## 🖼️ Screenshots
> Add 2–3 clean screenshots for a more professional README.

**How to add screenshots**
1. Create a folder named `screenshots/` in the repo root  
2. Put screenshots there (example names: `home.png`, `dashboard.png`, `scholarship-details.png`)  
3. Update the image links below

![ScholarStream Preview](./screenshots/home.png)

<!-- Optional -->
<!-- ![Scholarship Details](./screenshots/scholarship-details.png) -->
<!-- ![Admin Dashboard](./screenshots/dashboard.png) -->

---

## ✨ Features

### 🎯 Core Features
- ✅ **User Authentication** — Email/Password + Google Login using Firebase
- ✅ **Role-Based Access Control** — Student / Moderator / Admin roles
- ✅ **Scholarship Management** — Browse, search, filter, apply
- ✅ **Payment Integration** — Stripe payment for application fees
- ✅ **Responsive UI** — Works across mobile, tablet, and desktop

### 👨‍🎓 Student Features
- Browse & search scholarships (name, university, degree)
- Filter by category, country, degree type
- Sort by application fee or post date
- Apply with Stripe payment
- Track application status (Pending → Processing → Completed)
- Add reviews for completed applications
- Manage personal profile and applications

### 👨‍💼 Moderator Features
- Review all submitted applications
- Provide feedback on applications
- Update application status
- Approve / reject applications
- Moderate inappropriate reviews

### 👨‍💻 Admin Features
- Full dashboard with analytics and charts
- Add / edit / delete scholarships (CRUD)
- Manage all users and roles
- View platform statistics (users, fees collected, etc.)
- Promote / demote users (Student ↔ Moderator ↔ Admin)

### 🔍 Advanced Features
- Server-side search, filter, sort, and pagination
- JWT authentication with protected API routes
- Real-time application status updates
- Payment history tracking
- Animated UI with Framer Motion

---

## 🛠 Tech Stack

### Frontend
- **React 18**
- **React Router DOM**
- **Tailwind CSS**
- **DaisyUI**
- **Vite**

### Backend
- **Node.js**
- **Express.js**
- **MongoDB**
- **JWT**

### Services & Deployment
- **Firebase** (Auth + Hosting)
- **Stripe** (Payments)
- **Vercel** (Server deployment)
- **MongoDB Atlas** (Database)

---

## 📦 NPM Packages Used (Client)
> Your full list is in `package.json`. Key dependencies:

- `react`, `react-dom`
- `react-router-dom`
- `axios`
- `@tanstack/react-query`
- `firebase`
- `@stripe/react-stripe-js`, `@stripe/stripe-js`
- `framer-motion`
- `recharts`
- `sweetalert2`
- `react-icons`
- `react-helmet-async`
- `react-hook-form`
- `swiper`

---

## 🚀 Run Locally (Step-by-Step)

### ✅ Prerequisites
- Node.js (LTS recommended)
- npm
- MongoDB Atlas (or Local MongoDB)
- Firebase Project (Auth)
- Stripe keys (for payment)

---

## ▶️ Client Setup (Frontend)

### 1) Clone the client repo
```bash
git clone https://github.com/nazmulshishir01/scholarstream-client.git
cd scholarstream-client
