# FRONT END - Drag and Drop Todo List (Fractional Indexing)

## Project Status

| Item | Status |
| --- | --- |
| **LIVE DEMO** | [https://todo-frontend-eight-cyan.vercel.app/](https://todo-frontend-eight-cyan.vercel.app/) |
| **Backend API Source** | [https://github.com/rayzhangdev-coder/todo-backend](https://github.com/rayzhangdev-coder/todo-backend) |

---

## 1. Overview

A high-performance React.js application for drag and drop task ordering using fractional indexing and optimistic UI with rollback, allowing users to reorder tasks with instant synchronization and efficiency.  
Note: for demo purposes, this app uses user sessions to manage todo items for each user. You can implement your own login system if you wish.

## 2. Features

* **Drag-and-Drop Reordering:** Real-time task positioning powered by fractional indexing logic.
* **Session Persistence:** Generates and maintains a unique session UUID passed via Authorization headers.
* **Pessimistic State Management:** Ensures the UI stays in sync with the MongoDB database state.
* **Responsive Design:** Fully optimized for mobile, tablet, and desktop viewports.
* **Error Handling:** Built-in alerts for synchronization conflicts (409 errors) and network issues.

## 3. Tech Stack

| Category | Technologies |
| --- | --- |
| **Framework** | React.js (Vite) |
| **State/Logic** | React Hooks, Context API |
| **Styling** | CSS3 (Modern Flexbox/Grid) |
| **Deployment** | Vercel (CI/CD via GitHub) |

---

## 4. Setup and Run Locally

1. **Clone the Repository:**
```bash
git clone https://github.com/rayzhangdev-coder/todo-frontend.git
cd todo-frontend

```


2. **Install Dependencies:**
```bash
npm install

```


3. **Configure Environment Variables:**
Create a `.env.local` file in the root directory:
```env
VITE_API_URL=http://localhost:3001

```


4. **Run the Development Server:**
```bash
npm run dev

```



---

## 5. Deploying the Frontend on Vercel

1. **Create a New Project on Vercel:**
* Visit: [https://vercel.com/dashboard](https://vercel.com/dashboard)
* Click **"Add New..." → "Project"**
* Import your GitHub repository: `todo-frontend`


2. **Configure Build Settings:**
Vite projects typically use the following defaults:
**Build Command:**
```bash
npm run build

```


**Output Directory:**
```text
dist

```


3. **Add Environment Variables:**
In the Vercel dashboard → **Settings → Environment Variables**, add:
| Key | Value |
| --- | --- |
| **VITE_API_URL** | [https://your-backend-url.onrender.com](https://your-backend-url.onrender.com) |


4. **Deploy:**
Click **"Deploy"**. Vercel will provide a live production URL upon completion.
5. **CORS Configuration Note:**
Ensure that your frontend deployment URL is added to the allowed origins in your backend's `cors` middleware to prevent cross-origin request blocks.
