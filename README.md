# Couple's Meal Planner 🍽️

A full-stack application designed specifically for two people to plan meals together, manage a shared fridge, and schedule their dinners in real-time!

## Tech Stack
- **Backend**: Java 21, Spring Boot 3.3, Spring Security, JWT, H2 Database (for local dev)
- **Frontend**: Angular 19, ngx-translate (i18n), Server-Sent Events (SSE) for real-time updates

---

## 🚀 How to Run Locally

Because the backend is configured to use an **in-memory H2 database** for local development, you do not need to install PostgreSQL or use Docker. Everything works right out of the box!

### 1. Start the Backend (Spring Boot)

Open a terminal in the `backend` folder and run the Gradle wrapper:

**Windows (PowerShell or CMD):**
```bash
cd backend
.\gradlew.bat bootRun
```

**Mac/Linux:**
```bash
cd backend
./gradlew bootRun
```

The backend API will start at **http://localhost:8080**.
*(Note: Because the database is in-memory, your data will reset if you completely stop and restart the backend server. This is ideal for local testing!)*

### 2. Start the Frontend (Angular)

Open a **new** terminal window, navigate to the `frontend` folder, and start the development server:

```bash
cd frontend
npm install   # (Only needed the very first time)
npm start
```

The frontend will start at **http://localhost:4200**.

---

## 🧪 Testing the App Flow

1. Open [http://localhost:4200](http://localhost:4200) in your browser.
2. Click **Start a Couple** (Register) to create your first account.
3. Once registered, you will be shown an **Invite Code** (e.g., `A8F4K9P2`).
4. Open an **Incognito Window** (or a different browser) and go to [http://localhost:4200](http://localhost:4200).
5. Click **Join with Invite Code** and use the code generated from step 3 to create the partner account.
6. Now that both users are paired, try adding a menu item or a fridge ingredient in one window—you will see a real-time toast notification instantly appear in the other window!

---

## 🌍 Language Toggle
Click the **中文 / English** button in the top right corner of the navigation bar to instantly swap the entire application interface between English and Simplified Chinese!
