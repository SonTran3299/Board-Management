# Board Management App

Use Reactjs in combination with Firebase Realtime Database and Expressjs to create a to-do management website.

## Deployment & Architecture

This project is built using a decoupled client-server architecture and is deployed on optimized cloud platforms:

* **Front-end:** Deployed on **Vercel** — [Live Demo Link](https://board-management-ten.vercel.app)
  * *Why Vercel?* Provides lightning-fast content delivery (CDN), global edge network, and seamless CI/CD integration directly from GitHub.
* **Back-end:** Deployed on **Render** — [Server Base URL](https://board-management.onrender.com)
  * *Why Render?* Offers robust cloud hosting for Node.js/Express environments with native support for environment variables and easy log management.

> **Demo Testing Account:**
> - **Email:** `admin@gmail.com`
> - **Password:** `123456`

<details>
<summary><b>⚠️ Is the app loading slowly or showing a login error? Click here!</b></summary>

### Why is it slow initially?
This project utilizes **Render's Free Plan** for backend server deployment. If there is no inbound traffic for 15-30 minutes, the server goes into "spin down" (sleep) mode.

* **Symptom:** On your very first action (e.g., clicking Sign In), the system may respond very slowly, hang for 30s - 1m, or return an initial error.
* **Solution:** Please **wait about 1 - 2 minutes** for the server to wake up, then retry or refresh (F5) the page. Subsequent requests will be instant!
* **Quick Tip:** Trigger the server to wake up beforehand by clicking: [Render Server URL](https://board-management.onrender.com).

</details>

## Key Features
- **Full CRUD Operations:** Create, read, update, and delete boards, columns (cards), and tasks.
- **Drag and Drop (DnD):** Smoothly drag and drop cards and tasks to manage workflows dynamically.
- **Task Assignments:** Easily assign or remove team members to/from specific tasks.
- **GitHub Integration:** Fetch and display relevant information directly from GitHub Repositories.

---
## Techstack:
- **Frontend:** ReactJS, React Bootstrap (UI Framework)
- **Backend:** ExpressJS (Node.js)
- **Database:** Firebase Realtime Database
  
### Screenshots
- Dashboard ![Dashboard](https://github.com/SonTran3299/Board-Management/blob/main/screenshots/dashboard.jpg)

- Fetch relevant information from GitHub Repository 
![Repo](https://github.com/SonTran3299/Board-Management/blob/main/screenshots/repo.jpg)

- Task Information 
![Task](https://github.com/SonTran3299/Board-Management/blob/main/screenshots/task.jpg)

## Installation

Clone the Repository
```sh
git clone: https://github.com/SonTran3299/Board-Management.git
cd Board-Management
```

Navigate to the client folder:
```sh
cd client
```

Initialize a new frontend web project.

```bash
npm create vite@latest
```

Install Frontend dependencies:
```sh
npm install
```
Start the Development Server
```sh
npm run dev
```
Navigate to the server folder:
```sh
cd server
```
Install Expressjs dependencies:
```sh
npm install
```
Running a server with Nodemon:
```sh
npm run dev
```
The backend server will run at http://localhost:5000 (via Nodemon).

(Note: Remember to configure your own .env variables for Firebase and GitHub OAuth credentials to make local functionalities work properly).
