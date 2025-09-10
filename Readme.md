# 🚀 Collaborative Kanban Board

A real-time collaborative Kanban platform built with React, Node.js, WebSockets, and PostgreSQL.

## ✨ Features

- 📋 **Board Management**: Create and manage Kanban boards
- 🔄 **Real-time Collaboration**: Live updates across multiple users
- 👥 **Presence Tracking**: See who's online on each board
- 🎯 **Drag & Drop**: Intuitive card movement between columns
- 🔔 **Notifications**: In-app and email notifications
- 📊 **Audit Logging**: Complete activity history
- 📱 **Responsive Design**: Works on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Socket.io Client
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: PostgreSQL (Supabase)
- **Caching**: Redis (Upstash)
- **Email**: SendGrid
- **Deployment**: Docker, Render.com

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase)
- Redis instance (Upstash)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/parth354/kanban.git
cd kanban
```

2. Install dependencies:
```bash
# Backend
cd backend && npm install

# Frontend  
cd ../frontend && npm install
```
3. Setup environment variables

4. Start development servers:
```bash
# Backend (from backend folder)
npm run dev

# Frontend (from frontend folder)  
npm start
```
## 📁 Project Structure
```bash 
collaborative-kanban/
├── backend/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── models/             # Sequelize models  
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── websocket/          # WebSocket handlers
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── public/             # Static files
│   └── src/
│       ├── components/     # React components
│       ├── context/        # React context
│       ├── hooks/          # Custom hooks
│       ├── pages/          # Page components
│       └── services/       # API services
├── Dockerfile              # Multi-stage Docker build
└── README.md
```