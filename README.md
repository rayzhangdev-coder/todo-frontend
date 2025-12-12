# FRONT END - Task Management Application

## Project Status

| Item | Status |
| :--- | :--- |
| **LIVE DEMO** | https://todo-frontend-eight-cyan.vercel.app/ |
| **API Source** | https://github.com/rayzhangdev-coder/todo-backend |

---

## 1. Overview

A state-managed To-Do List application built with React.js. Connects to backend API.

## 2. Features

* Full CRUD (Create, Read, Update, Delete) functionality.
* Responsive UI for mobile and desktop devices.
* Pessimistic UI updates for reliable state management.

## 3. Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Client** | React.js, HTML, CSS (Vite setup) |
| **Deployment** | Vercel (CI/CD via GitHub) |

---

## 4. Setup and Run Locally

1. Ensure the [[Backend API]](https://github.com/rayzhangdev-coder/todo-backend) is running locally or deployed.
2. `npm install`
3. `npm run dev`

---

### 5. Deploying the Frontend on Vercel

1. **Create a New Project on Vercel:**

   * Visit: [https://vercel.com/dashboard](https://vercel.com/dashboard)
   * Click **“Add New…” → “Project”**
   * Import your GitHub repository
   * Select the **frontend** folder as the project root if needed

2. **Configure Build Settings:**
   Vercel usually detects Vite automatically.
   If not, set:

   **Build Command:**

   ```
   npm run build
   ```

   **Output Directory:**

   ```
   dist
   ```

3. **Add Environment Variables:**
   In the Vercel dashboard → *Settings → Environment Variables*, add:

   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

   Use this in your React code as:

   ```js
   import.meta.env.VITE_API_URL
   ```

4. **Deploy:**
   Click **“Deploy”**, and Vercel will build and publish your frontend.

5. **Live URL:**
   Your app will be available at a URL like:

   ```
   https://your-frontend-project.vercel.app
   ```
