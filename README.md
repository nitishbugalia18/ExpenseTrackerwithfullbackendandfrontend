# 💰 Expense Tracker — Full-Stack MERN App

A full-stack personal finance tracker built with the MERN stack (MongoDB, Express, React, Node.js), featuring JWT authentication, real-time dashboards, and Excel export. Deployed as a live website, a REST API, and a native Android app from the same codebase.

## 🔗 Live Links

- **Live Web App:** [expense-trackerwithfullbackendandfr.vercel.app](https://expense-trackerwithfullbackendandfr.vercel.app/)
- **Backend API:** Deployed on Render
- **Android App:** [Download APK](../../releases/latest) (see Releases section)

## ✨ Features

- 🔐 JWT-based authentication (signup/login) with secure password hashing
- 📊 Interactive dashboard with income/expense gauges and category breakdown (pie chart)
- 💵 Full CRUD for income and expense transactions
- 📅 Time-frame filtering (daily, weekly, monthly, yearly)
- 📈 Excel export of transaction history
- 👤 User profile management with password change
- 📱 Packaged as a native Android app using Capacitor
- 🎨 Responsive, modern UI built with Tailwind CSS

## 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Recharts, Framer Motion, Axios, React Router
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, ExcelJS
**Mobile:** Capacitor (Android)
**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

## 📂 Project Structure

```
ExpenseTracker/
├── backend/          # Express REST API
│   ├── models/        # Mongoose schemas (User, Income, Expense)
│   ├── routes/         # Auth, income, expense, dashboard routes
│   ├── middleware/   # JWT auth middleware
│   └── server.js
├── frontend/         # React + Vite app
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/         # Dashboard, Income, Expense, Profile
│   │   └── assets/        # Styles and icons
│   └── android/         # Capacitor Android project
```

## 🚀 Running Locally

### Backend
```bash
cd backend
npm install
# create a .env file with MONGO_URI, JWT_SECRET, PORT, FRONTEND_URL
npm start
```

### Frontend
```bash
cd frontend
npm install
# create a .env file with VITE_API_BASE=http://localhost:4000/api
npm run dev
```

## 📱 Android App

This project uses [Capacitor](https://capacitorjs.com/) to package the same React codebase into a native Android app. The pre-built debug APK is available in the [Releases](../../releases/latest) section.

## 👤 Author

**Nitish Bugalia**
ECE Student | Full-Stack & Embedded Systems Developer
[GitHub](https://github.com/nitishbugalia18) · [Portfolio](https://nitishbugalia18.github.io)
