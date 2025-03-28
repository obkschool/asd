// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  onValue,
  push,
  update,
  remove,
  onDisconnect,
  serverTimestamp,
} from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBgR-ATXe5M9R3KlJ5eLtMo40C4Nqh8uJE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "xo-game-online.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://xo-game-online-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "xo-game-online",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "xo-game-online.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "752151796733",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:752151796733:web:78d37924ae00b1cc6861b5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const playerNameInput = document.getElementById('player-name');
const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');
const roomIdInput = document.getElementById('room-id-input');
const roomIdDisplay = document.getElementById('room-id-display');
const copyRoomIdBtn = document.getElementById('copy-room-id');
const playerXName = document.getElementById('player-x-name');
const playerOName = document.getElementById('player-o-name');
const playerX = document.getElementById('player-x');
const playerO = document.getElementById('player-o');
const statusMessage = document.getElementById('status-message');
const gameBoard = document.getElementById('game-board');
const cells = document.querySelectorAll('.cell');
const resetBtn = document.getElementById('reset-btn');
const leaveBtn = document.getElementById('leave-btn');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendMessageBtn = document.getElementById('send-message-btn');
const onlineUsersList = document.getElementById('online-users-list');
const errorMessage = document.getElementById('error-message');

// Game state
let playerId = localStorage.getItem('playerId') || generateId();
let playerName = localStorage.getItem('playerName') || '';
let currentRoom = null;
let gameState = {
  board: Array(9).fill(null),
  currentTurn: 'X',
  status: 'waiting', // waiting, playing, finished
  winner: null,
};

// Initialize
init();

// Setup event listeners
function setupEventListeners() {
  createRoomBtn.addEventListener('click', createRoom);
  joinRoomBtn.addEventListener('click', joinRoom);
  copyRoomIdBtn.addEventListener('click', copyRoomId);
  resetBtn.addEventListener('click', resetGame);
  leaveBtn.addEventListener('click', leaveRoom);
  sendMessageBtn.addEventListener('click', sendMessage);
  
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      const index = parseInt(cell.getAttribute('data-index'));
      makeMove(index);
    });
  });
}

// Initialize the app
function init() {
  // Save playerId to localStorage
  localStorage.setItem('playerId', playerId);
  
  // Restore player name if available
  if (playerName) {
    playerNameInput.value = playerName;
  }
  
  // Setup event listeners
  setupEventListeners();
}

// Generate a random ID
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// Create a new game room
function createRoom() {
  const name = playerNameInput.value.trim();
  if (!name) {
    showError('Please enter your name');
    return;
  }
  
  // Save player name
  playerName = name;
  localStorage.setItem('playerName', playerName);
  
  // Generate a room ID
  const roomId = generateId();
  
  // Create the room in Firebase
  const roomRef = ref(database, `rooms/${roomId}`);
  
  // Set the initial room data
  set(roomRef, {
    id: roomId,
    createdAt: serverTimestamp(),
    players: {
      X: {
        id: playerId,
        name: playerName,
        online: true,
        lastActive: serverTimestamp(),
      }
    },
    game: {
      board: ["", "", "", "", "", "", "", "", ""],
      currentTurn: "X",
      status: "waiting",
      winner: null,
    }
  })
    .then(() => {
      // Join the room
      joinRoomWithId(roomId);
    })
    .catch(error => {
      showError(`Error creating room: ${error.message}`);
    });
}

// Join a room
function joinRoom() {
  const name = playerNameInput.value.trim();
  if (!name) {
    showError('Please enter your name');
    return;
  }
  
  const roomId = roomIdInput.value.trim();
  if (!roomId) {
    showError('Please enter a room ID');
    return;
  }
  
  // Save player name
  playerName = name;
  localStorage.setItem('playerName', playerName);
  
  // Join the room
  joinRoomWithId(roomId);
}

// Join a room with the specified ID
function joinRoomWithId(roomId) {
  // Reference to the room
  const roomRef = ref(database, `rooms/${roomId}`);
  
  // Get the room data
  onValue(roomRef, (snapshot) => {
    const room = snapshot.val();
    
    // If this is the initial check
    if (!currentRoom) {
      if (!room) {
        showError('Room not found');
        return;
      }
      
      // Check if the room is full (both X and O players are present)
      if (room.players.X && room.players.O && room.players.X.id !== playerId && room.players.O.id !== playerId) {
        showError('Room is full');
        return;
      }
      
      // Determine player role (X or O)
      let playerRole;
      if (room.players.X && room.players.X.id === playerId) {
        playerRole = 'X';
      } else if (room.players.O && room.players.O.id === playerId) {
        playerRole = 'O';
      } else if (!room.players.O) {
        playerRole = 'O';
      } else {
        playerRole = 'spectator';
      }
      
      // If the player is X or O, update their info
      if (playerRole === 'X' || playerRole === 'O') {
        const playerUpdate = {};
        playerUpdate[`rooms/${roomId}/players/${playerRole}`] = {
          id: playerId,
          name: playerName,
          online: true,
          lastActive: serverTimestamp(),
        };
        
        // Add the player to the room
        update(ref(database), playerUpdate);
        
        // If both players are now in the room, update the game status
        if (room.players.X && (playerRole === 'O' || room.players.O)) {
          update(ref(database, `rooms/${roomId}/game`), {
            status: 'playing'
          });
          
          // Add a system message that the game has started
          addSystemMessage(roomId, `${playerName} has joined the game`);
        }
      }
      
      // Set the current room and transition to the game screen
      currentRoom = roomId;
      welcomeScreen.classList.add('hidden');
      gameScreen.classList.remove('hidden');
      roomIdDisplay.textContent = roomId;
      
      // Setup presence
      setupPresence(roomId, playerRole);
      
      // Subscribe to chat messages
      subscribeToChatMessages(roomId);
      
      // Subscribe to online users
      subscribeToOnlineUsers(roomId);
    }
    
    // Update game state
    if (room && room.game) {
      updateGameState(room.game);
      updatePlayerInfo(room.players);
    }
  });
}

// Update the game state based on Firebase data
function updateGameState(game) {
  gameState = game;
  
  // Update the board
  for (let i = 0; i < 9; i++) {
    const cell = cells[i];
    const value = game.board[i];
    
    cell.textContent = value;
    cell.classList.remove('filled', 'x', 'o');
    
    if (value) {
      cell.classList.add('filled', value.toLowerCase());
    }
  }
  
  // Update player turns
  playerX.classList.toggle('active', game.currentTurn === 'X');
  playerO.classList.toggle('active', game.currentTurn === 'O');
  
  // Update status message
  if (game.status === 'waiting') {
    statusMessage.textContent = 'Waiting for opponent...';
    resetBtn.classList.add('hidden');
  } else if (game.status === 'playing') {
    statusMessage.textContent = `${game.currentTurn}'s turn`;
    resetBtn.classList.add('hidden');
  } else if (game.status === 'finished') {
    if (game.winner === 'draw') {
      statusMessage.textContent = 'Game ended in a draw!';
    } else {
      statusMessage.textContent = `Player ${game.winner} wins!`;
    }
    resetBtn.classList.remove('hidden');
  }
}

// Update player information
function updatePlayerInfo(players) {
  if (players.X) {
    playerXName.textContent = players.X.name + (players.X.online ? '' : ' (offline)');
  } else {
    playerXName.textContent = 'Waiting...';
  }
  
  if (players.O) {
    playerOName.textContent = players.O.name + (players.O.online ? '' : ' (offline)');
  } else {
    playerOName.textContent = 'Waiting...';
  }
}

// Make a move
function makeMove(index) {
  if (!currentRoom) return;
  
  // Get the player role
  const roomRef = ref(database, `rooms/${currentRoom}`);
  
  onValue(roomRef, (snapshot) => {
    // Unsubscribe immediately to prevent multiple executions
    roomRef.off();
    
    const room = snapshot.val();
    if (!room) return;
    
    // Determine player role
    let playerRole;
    if (room.players.X && room.players.X.id === playerId) {
      playerRole = 'X';
    } else if (room.players.O && room.players.O.id === playerId) {
      playerRole = 'O';
    } else {
      return; // Spectator cannot make moves
    }
    
    // Check if it's this player's turn
    if (room.game.currentTurn !== playerRole) {
      return;
    }
    
    // Check if the cell is empty
    if (room.game.board[index] !== "") {
      return;
    }
    
    // Check if the game is still playing
    if (room.game.status !== 'playing') {
      return;
    }
    
    // Make the move
    const newBoard = [...room.game.board];
    newBoard[index] = playerRole;
    
    // Check for a winner
    const winner = checkWinner(newBoard);
    const isDraw = !winner && newBoard.every(cell => cell !== "");
    
    // Update the game state
    const nextTurn = playerRole === 'X' ? 'O' : 'X';
    const gameUpdate = {
      board: newBoard,
      currentTurn: nextTurn,
    };
    
    if (winner || isDraw) {
      gameUpdate.status = 'finished';
      gameUpdate.winner = winner || 'draw';
    }
    
    update(ref(database, `rooms/${currentRoom}/game`), gameUpdate);
  }, {
    onlyOnce: true
  });
}

// Check if there's a winner
function checkWinner(board) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];
  
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  
  return null;
}

// Reset the game
function resetGame() {
  if (!currentRoom) return;
  
  // Only allow resetting if the game is finished
  if (gameState.status !== 'finished') return;
  
  // Reset the game
  update(ref(database, `rooms/${currentRoom}/game`), {
    board: ["", "", "", "", "", "", "", "", ""],
    currentTurn: "X",
    status: "playing",
    winner: null,
  });
  
  // Add a system message
  addSystemMessage(currentRoom, "Game has been reset");
}

// Leave the room
function leaveRoom() {
  if (!currentRoom) return;
  
  // Remove the player from the room
  const roomRef = ref(database, `rooms/${currentRoom}`);
  
  onValue(roomRef, (snapshot) => {
    // Unsubscribe immediately to prevent multiple executions
    roomRef.off();
    
    const room = snapshot.val();
    if (!room) return;
    
    // Determine player role
    let playerRole;
    if (room.players.X && room.players.X.id === playerId) {
      playerRole = 'X';
    } else if (room.players.O && room.players.O.id === playerId) {
      playerRole = 'O';
    } else {
      return; // Not a player in this room
    }
    
    // Add a system message
    addSystemMessage(currentRoom, `${playerName} has left the game`);
    
    // If the player is the last one, delete the room
    if (
      (playerRole === 'X' && !room.players.O) ||
      (playerRole === 'O' && !room.players.X)
    ) {
      remove(roomRef);
    } else {
      // Otherwise, just remove the player
      remove(ref(database, `rooms/${currentRoom}/players/${playerRole}`));
      
      // Reset the game
      update(ref(database, `rooms/${currentRoom}/game`), {
        board: ["", "", "", "", "", "", "", "", ""],
        currentTurn: "X",
        status: "waiting",
        winner: null,
      });
    }
    
    // Clear current room and go back to welcome screen
    currentRoom = null;
    gameScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
  }, {
    onlyOnce: true
  });
}

// Copy room ID to clipboard
function copyRoomId() {
  if (!currentRoom) return;
  
  navigator.clipboard.writeText(currentRoom)
    .then(() => {
      copyRoomIdBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyRoomIdBtn.textContent = 'Copy';
      }, 2000);
    })
    .catch(err => {
      console.error('Could not copy text: ', err);
    });
}

// Send a chat message
function sendMessage() {
  if (!currentRoom) return;
  
  const message = chatInput.value.trim();
  if (!message) return;
  
  // Create a new message
  const chatRef = ref(database, `rooms/${currentRoom}/chat`);
  push(chatRef, {
    sender: playerId,
    senderName: playerName,
    text: message,
    timestamp: serverTimestamp(),
  });
  
  // Clear the input
  chatInput.value = '';
}

// Subscribe to chat messages
function subscribeToChatMessages(roomId) {
  const chatRef = ref(database, `rooms/${roomId}/chat`);
  
  onValue(chatRef, (snapshot) => {
    // Clear the chat messages
    chatMessages.innerHTML = '';
    
    const messages = snapshot.val();
    if (!messages) return;
    
    // Sort messages by timestamp (convert firebase timestamp to milliseconds)
    const sortedMessages = Object.values(messages)
      .filter(msg => msg.timestamp)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    // Add messages to the chat
    sortedMessages.forEach(message => {
      if (message.system) {
        // System message
        const div = document.createElement('div');
        div.classList.add('system-message');
        div.textContent = message.text;
        chatMessages.appendChild(div);
      } else {
        // User message
        const div = document.createElement('div');
        div.classList.add('message', message.sender === playerId ? 'sent' : 'received');
        
        const sender = document.createElement('div');
        sender.classList.add('sender');
        sender.textContent = message.sender === playerId ? 'You' : message.senderName;
        
        const text = document.createElement('div');
        text.textContent = message.text;
        
        const time = document.createElement('div');
        time.classList.add('time');
        // Format the timestamp
        const date = new Date(message.timestamp);
        time.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        div.appendChild(sender);
        div.appendChild(text);
        div.appendChild(time);
        
        chatMessages.appendChild(div);
      }
    });
    
    // Scroll to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

// Add a system message to the chat
function addSystemMessage(roomId, text) {
  const chatRef = ref(database, `rooms/${roomId}/chat`);
  push(chatRef, {
    system: true,
    text,
    timestamp: serverTimestamp(),
  });
}

// Subscribe to online users
function subscribeToOnlineUsers(roomId) {
  const playersRef = ref(database, `rooms/${roomId}/players`);
  
  onValue(playersRef, (snapshot) => {
    // Clear the online users list
    onlineUsersList.innerHTML = '';
    
    const players = snapshot.val();
    if (!players) return;
    
    // Add each player to the list
    Object.values(players).forEach(player => {
      if (player.online) {
        const li = document.createElement('li');
        li.textContent = player.name;
        onlineUsersList.appendChild(li);
      }
    });
  });
}

// Setup presence for the player
function setupPresence(roomId, playerRole) {
  if (!playerRole || playerRole === 'spectator') return;
  
  const playerRef = ref(database, `rooms/${roomId}/players/${playerRole}`);
  
  // Set the player as online
  update(playerRef, {
    online: true,
    lastActive: serverTimestamp(),
  });
  
  // Set up onDisconnect to mark the player as offline
  onDisconnect(playerRef).update({
    online: false,
    lastActive: serverTimestamp(),
  });
}

// Show an error message
function showError(message) {
  errorMessage.textContent = message;
  setTimeout(() => {
    errorMessage.textContent = '';
  }, 3000);
} 