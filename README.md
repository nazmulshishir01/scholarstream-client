# 🎓 ScholarStream - Scholarship Management Platform

A comprehensive full-stack MERN application designed to connect students with scholarship opportunities worldwide. Universities and organizations can post scholarships while students can search, browse, and apply for them seamlessly.


## 🌐 Live Demo

**Live Site:** [https://scholarstream-project.web.app](https://scholarstream-project.web.app)

**Server API:** [https://scholarstream-server-mu.vercel.app](https://scholarstream-server-mu.vercel.app)

## 🔐 Admin Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@scholarstream.com | Admin@123 |

## ✨ Features

### 🎯 Core Features

- **User Authentication**: Secure email/password and Google social login with Firebase
- **Role-Based Access Control**: Three distinct user roles (Student, Moderator, Admin)
- **Scholarship Management**: Browse, search, filter, and apply for scholarships
- **Payment Integration**: Secure Stripe payment gateway for application fees
- **Responsive Design**: Fully responsive across all devices (mobile, tablet, desktop)

### 👨‍🎓 Student Features

- Browse and search scholarships by name, university, or degree
- Filter scholarships by category, country, and degree type
- Sort scholarships by application fees or post date
- Apply for scholarships with secure payment
- Track application status (Pending → Processing → Completed)
- Add reviews for completed applications
- Manage personal profile and applications

### 👨‍💼 Moderator Features

- Review all submitted applications
- Provide feedback on applications
- Update application status
- Approve or reject applications
- Moderate inappropriate reviews

### 👨‍💻 Admin Features

- Full dashboard with analytics and charts
- Add, edit, and delete scholarships
- Manage all users and their roles
- View platform statistics (total users, fees collected, etc.)
- Promote/demote users (Student ↔ Moderator ↔ Admin)

### 🔍 Advanced Features

- Server-side search, filter, sort, and pagination
- JWT token authentication with secure API routes
- Real-time application status updates
- Payment history tracking
- Animated UI with Framer Motion

## 🛠 Tech Stack

### Frontend
- **React 18** - UI Library
- **React Router DOM** - Client-side routing
- **Tailwind CSS v4.1** - Utility-first CSS framework
- **DaisyUI v5** - Tailwind CSS component library
- **Vite** - Build tool and development server

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens

### Services
- **Firebase** - Authentication & Hosting
- **Stripe** - Payment processing
- **Vercel** - Server deployment
- **MongoDB Atlas** - Cloud database

## 📦 NPM Packages Used

### Client-Side Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3.1 | Core React library |
| `react-dom` | ^18.3.1 | React DOM rendering |
| `react-router-dom` | ^7.1.1 | Client-side routing |
| `axios` | ^1.7.9 | HTTP client for API calls |
| `@tanstack/react-query` | ^5.64.1 | Server state management |
| `firebase` | ^11.1.0 | Authentication services |
| `@stripe/react-stripe-js` | ^3.1.1 | Stripe React components |
| `@stripe/stripe-js` | ^5.5.0 | Stripe.js library |
| `framer-motion` | ^11.15.0 | Animation library |
| `recharts` | ^2.15.0 | Charts and graphs |
| `sweetalert2` | ^11.15.3 | Beautiful alerts |
| `react-icons` | ^5.4.0 | Icon library |
| `react-helmet-async` | ^2.0.5 | Document head management |
| `react-hook-form` | ^7.54.2 | Form handling |
| `swiper` | ^11.2.1 | Touch slider |


