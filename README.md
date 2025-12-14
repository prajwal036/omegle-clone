# Omgle Clone - Chat with Strangers

A real-time chat application that connects users with random strangers from around the world, built with Next.js 15, Socket.io, Express.js, and MongoDB.

## Features

- 🚀 **No Authentication Required** - Start chatting instantly
- 🌍 **Global Connections** - Connect with strangers worldwide
- 💬 **Real-time Messaging** - Powered by Socket.io
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Scalable Architecture** - Industry-standard code structure

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io for WebSocket connections

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd omgle-clone
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/omgle-clone
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
PORT=3001
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Run the development server:
```bash
npm run dev
```

This will start both the Next.js frontend (port 3000) and Express backend (port 3001).

### Development Scripts

- `npm run dev` - Start both frontend and backend concurrently
- `npm run dev:client` - Start only Next.js frontend
- `npm run dev:server` - Start only Express backend
- `npm run build` - Build for production
- `npm start` - Start production server

## How It Works

1. **User Connection**: When a user opens the app, they connect to the Socket.io server
2. **Start Chat**: Clicking "Start Chat" puts the user in a waiting queue
3. **Matching**: The system matches waiting users using a FIFO (First In, First Out) algorithm
4. **Chatting**: Once matched, users can exchange messages in real-time
5. **Disconnect**: Users can disconnect at any time, which notifies their partner

## Architecture

### Backend

- **Express Server**: Handles HTTP requests and Socket.io connections
- **Matching Service**: Manages user matching logic and session state
- **MongoDB Models**: Stores user sessions and chat history
- **Socket Handlers**: Manages real-time communication events

### Frontend

- **Next.js 15**: React framework with App Router
- **Socket.io Client**: Real-time WebSocket connection
- **Custom Hooks**: `useSocket` hook for managing socket state
- **shadcn/ui**: Pre-built, accessible UI components

## Scalability Considerations

- **Database Indexing**: Optimized MongoDB indexes for fast queries
- **Session Management**: TTL indexes for automatic cleanup
- **Error Handling**: Comprehensive error handling and reconnection logic
- **Code Structure**: Modular architecture for easy scaling
- **Connection Pooling**: Efficient database connection management

## Future Enhancements

- Message history persistence
- Typing indicators
- User interests/topics matching
- Video/voice chat support
- Rate limiting and moderation
- Multi-language support

## License

MIT

