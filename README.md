# XO Game with Chat

An online multiplayer Tic-Tac-Toe game with real-time chat functionality.

## Features

- Create and join game rooms with unique room IDs
- Real-time gameplay with automatic turn handling
- Live chat with other players in the room
- See who's online in your game room
- Responsive design that works on mobile and desktop

## Play Now

You can play the game online at: [https://xo-game-online.vercel.app](https://xo-game-online.vercel.app)

## How to Play

1. Enter your name on the home screen
2. Either:
   - Create a new game room by clicking "Create New Room"
   - Join an existing game by entering a room ID and clicking "Join Room"
3. Share your room code with a friend so they can join
4. Players take turns placing X's and O's on the board
5. Chat with your opponent using the chat panel
6. The first player to get three in a row wins!

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Firebase Realtime Database
- **Build Tool**: Vite
- **Deployment**: Vercel

## Local Development

### Prerequisites

- Node.js 14+ and npm/yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd xo-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the game.

## Firebase Setup

This project uses Firebase Realtime Database. If you want to set up your own Firebase instance:

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable the Realtime Database
3. Copy the `.env.example` file to a new file named `.env`
4. Update the values in your `.env` file with your Firebase project's configuration

The project uses environment variables to keep your Firebase keys secure. Make sure not to commit your actual `.env` file to the repository.

## Deployment

This project is configured for easy deployment to Vercel. Simply connect your GitHub repository to Vercel and it will automatically deploy when you push changes.

## License

MIT 