import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '../../convex/_generated/react';
import GameBoard from '../../components/GameBoard';
import PlayerInfo from '../../components/PlayerInfo';
import Loading from '../../components/Loading';
import OnlineUsers from '../../components/OnlineUsers';
import usePresence from '../../hooks/usePresence';

export default function GameRoom() {
  const router = useRouter();
  const { id: roomId } = router.query;
  const [playerId, setPlayerId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  
  // Convex mutations
  const makeMove = useMutation('game:makeMove');
  const resetGame = useMutation('game:resetGame');
  const leaveRoom = useMutation('game:leaveRoom');
  
  // Fetch room data
  const room = useQuery('game:getRoom', roomId ? { roomId } : 'skip') || null;

  // Set up presence
  const [_, __, updatePresence] = usePresence(
    playerId, 
    roomId, 
    { online: true, name: playerName }
  );
  
  // Get player ID from local storage
  useEffect(() => {
    const storedId = localStorage.getItem('xo_player_id');
    const storedName = localStorage.getItem('xo_player_name');
    
    if (storedId) {
      setPlayerId(storedId);
    } else {
      // If no ID is found, redirect to home page
      router.push('/');
    }
    
    if (storedName) {
      setPlayerName(storedName);
      // Update presence with name when it becomes available
      if (playerId && roomId) {
        updatePresence({ name: storedName });
      }
    }
  }, [router, playerId, roomId, updatePresence]);
  
  // Handle cell click
  const handleCellClick = async (position) => {
    if (!playerId || !roomId) return;
    
    try {
      await makeMove({ roomId, playerId, position });
    } catch (err) {
      setError(err.message || 'Failed to make move');
    }
  };
  
  // Handle game reset
  const handleResetGame = async () => {
    if (!playerId || !roomId) return;
    
    try {
      await resetGame({ roomId, playerId });
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to reset game');
    }
  };
  
  // Handle leaving the room
  const handleLeaveRoom = async () => {
    if (!playerId || !roomId) return;
    
    try {
      await leaveRoom({ roomId, playerId });
      router.push('/');
    } catch (err) {
      setError(err.message || 'Failed to leave room');
    }
  };
  
  // Copy room code to clipboard
  const copyRoomCode = () => {
    if (room?.roomCode) {
      navigator.clipboard.writeText(room.roomCode);
      alert('Room code copied to clipboard!');
    }
  };
  
  // Loading state
  if (!roomId || !playerId || !room) {
    return <Loading />;
  }
  
  // Check if player is in this game
  const isHost = playerId === room.hostId;
  const isGuest = playerId === room.guestId;
  const isInGame = isHost || isGuest;
  
  if (!isInGame) {
    return (
      <div className="container">
        <div className="card">
          <h2>You are not part of this game</h2>
          <button onClick={() => router.push('/')}>Go Back Home</button>
        </div>
      </div>
    );
  }
  
  // Determine if it's this player's turn
  const playerMark = isHost ? 'X' : 'O';
  const isMyTurn = room.currentTurn === playerMark && room.status === 'playing';
  
  // Determine status message
  let statusMessage = '';
  if (room.status === 'waiting') {
    statusMessage = 'Waiting for opponent to join...';
  } else if (room.status === 'playing') {
    statusMessage = isMyTurn ? 'Your turn' : 'Opponent\'s turn';
  } else if (room.status === 'finished') {
    if (room.winner === 'draw') {
      statusMessage = 'Game ended in a draw!';
    } else if (room.winner === playerMark) {
      statusMessage = 'You won!';
    } else {
      statusMessage = 'You lost!';
    }
  }
  
  return (
    <div className="container">
      <div className="card">
        <h1>XO Game</h1>
        
        {/* Room code section */}
        <div className="room-code" onClick={copyRoomCode} style={{ cursor: 'pointer' }}>
          Room Code: {room.roomCode}
          <span role="img" aria-label="copy" style={{ marginLeft: '5px' }}>📋</span>
        </div>
        
        {/* Display error if any */}
        {error && <p className="error-message">{error}</p>}
        
        {/* Status message */}
        <p className="status-message">{statusMessage}</p>
        
        {/* Player info */}
        <PlayerInfo room={room} playerId={playerId} />
        
        {/* Game board */}
        <GameBoard
          board={room.board}
          onCellClick={handleCellClick}
          currentPlayer={room.currentTurn}
          isMyTurn={isMyTurn}
        />
        
        {/* Online users */}
        <OnlineUsers roomId={roomId} userId={playerId} />
        
        {/* Action buttons */}
        <div className="action-buttons">
          {room.status === 'finished' && (
            <button onClick={handleResetGame}>Play Again</button>
          )}
          
          <button
            onClick={handleLeaveRoom}
            style={{ backgroundColor: '#e74c3c' }}
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
} 