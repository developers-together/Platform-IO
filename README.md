# Platform-IO

**Version**: V1  
**Team**: DevSync  
**Project Leader**: Adham Haitham Eid - adhamhaithameid@gmail.com

**Hackathon**: Salam Hackathon (13 – 20 Ramadan 1446) / (13 - 20 March 2025)

---

## Overview
**Platform-IO** is an AI-powered, collaborative development platform created for the *Salam Hackathon* during Ramadan. Our main goals were:
- To provide an interactive UI that can help teams build and manage projects quickly.
- To integrate AI-powered features for coding assistance, file management, and more.
- To ensure professional and responsive design with minimal overhead.

We built this project in **6 days** as a prototype (V1), showcasing the potential of AI-driven development tools.

---

## Features
1. **AI Suggested Actions**: Uses the Gemini API for suggestions like code improvements, file/folder creation, and real-time editing help.
2. **Chatbot & Image Analyzer**: Chat with the AI or analyze images for content, metadata, or suggestions.
3. **Search Assistant**: Quickly search for files, code snippets, or documentation across the project.
4. **Shared File System**: Utilizes FTP technology for collaborative file creation, editing, and management. Allows multiple team members to work together seamlessly.
5. **Responsive & Professional UI**: Built with React, ensuring a smooth user experience across devices.
6. **Manual API Integration**: All APIs (Gemini AI, FTP, etc.) are connected manually to optimize performance and control.

---

## Tech Stack
- **Front-End**: React, CSS
- **Back-End**: Laravel (PHP)
- **AI Integration**: Gemini AI (for suggestions, chatbot, and image analysis)
- **Database**: SQLite
- **Other**: Python scripts for additional AI tasks, FTP for shared file management

---

## Architecture
Front-End (React) -- API Calls --> Laravel/PHP -- Gemini AI --> FTP (Shared File System) Database: SQLite

- **Front-End**: Communicates with the Laravel back-end via RESTful APIs.
- **Back-End**: Handles authentication, routes, AI requests to Gemini, and manages the SQLite database.
- **Shared File System**: FTP-based approach to collaborate on files.

---

## Installation and Setup

> **Note**: Since this project is a prototype, the installation steps may be simplified. Adjust for your own environment as needed.

1. **Clone the repository**:

2. ```bash
   git clone https://github.com/DevSync/Platform-IO.git
   ```
   Front-End Setup (react/javascript)
   ```bash
   cd Platform-IO/frontend
   npm install --force
   npm run dev
    ```

Back-End Setup (Laravel/PHP):

```bash
cd Platform-IO/backend
composer install
php artisan migrate
pip install google-generativeai
```

Update .env with your DB credentials SQLite and Gemini AI keys

Run the server:

```bash
php artisan serve
```
or set up a virtual host for a more production-like environment.

Python Scripts (if applicable):

Ensure Python is installed (3.7+).
Install any required libraries (e.g., pip install some-library).
Configure environment variables to connect to Gemini AI if needed.
Usage
Local Access:
```bash
React dev server: http://localhost:5173 (by default).
Laravel server: http://localhost:8000 (by default).
```
## AI Features:

The AI chatbot, suggested actions, and image analyzer are available in the AI Tools panel (or wherever you integrated it in the UI).
Make sure you have valid Gemini AI credentials in your .env file.
Shared File System:

Accessible in the “Files” section of the UI.
Create, edit, and manage files/folders. The changes are synced over FTP.
Demo Videos
We created two demo videos on YouTube:

[* #### Demo Only – Showcasing the platform features.]: #

* #### Demo with the Team – [A discussion with the project’s team, exploring the platform.](https://youtu.be/IKgpYHlJJus?si=KFjWIok0v-xxh2sQ)

Disclaimer: This project is an early prototype (V1) built within 6 days for the Salam Hackathon. While functional, it may require additional optimization, security reviews, and code clean-up for production use.
