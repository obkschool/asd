import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '../convex/_generated/react';
import { v4 as uuidv4 } from 'uuid';
import Loading from '../components/Loading';

export default function Home() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [playerId, setPlayerId] = useState('');
  
  const createRoom = useMutation('game:createRoom');
  const joinRoom = useMutation('game:joinRoom');
  const waitingRooms = useQuery('game:listWaitingRooms') || [];
  
  // Generate or retrieve player ID
  useEffect(() => {
    const storedId = localStorage.getItem('xo_player_id');
    const storedName = localStorage.getItem('xo_player_name');
    
    if (storedId) {
      setPlayerId(storedId);
    } else {
      const newId = uuidv4();
      localStorage.setItem('xo_player_id', newId);
      setPlayerId(newId);
    }
    
    if (storedName) {
      setPlayerName(storedName);
    }
  }, []);
  
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    if (!playerName) {
      setError('Please enter your name');
      return;
    }
    
    try {
      localStorage.setItem('xo_player_name', playerName);
      const { roomId, roomCode } = await createRoom({ hostId: playerId, hostName: playerName });
      router.push(`/game/${roomId}`);
    } catch (err) {
      setError(err.message || 'Failed to create room');
    }
  };
  
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    if (!playerName) {
      setError('Please enter your name');
      return;
    }
    
    if (!roomCode) {
      setError('Please enter a room code');
      return;
    }
    
    try {
      localStorage.setItem('xo_player_name', playerName);
      const { roomId } = await joinRoom({ 
        roomCode: roomCode.toUpperCase(), 
        guestId: playerId, 
        guestName: playerName 
      });
      router.push(`/game/${roomId}`);
    } catch (err) {
      setError(err.message || 'Failed to join room');
    }
  };
  
  const handleJoinExistingRoom = async (roomCode) => {
    if (!playerName) {
      setError('Please enter your name before joining a room');
      return;
    }
    
    try {
      localStorage.setItem('xo_player_name', playerName);
      const { roomId } = await joinRoom({ 
        roomCode, 
        guestId: playerId, 
        guestName: playerName 
      });
      router.push(`/game/${roomId}`);
    } catch (err) {
      setError(err.message || 'Failed to join room');
    }
  };
  
  if (!playerId) {
    return <Loading />;
  }
  
  return (
    <div className="container">
      <div className="card">
        <h1>XO Game</h1>
        <h2>Online Tic-Tac-Toe</h2>
        
        {error && <p className="error-message">{error}</p>}
        
        <div>
          <input
            type="text"
            placeholder="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={handleCreateRoom}>Create Game</button>
          
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Room Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              style={{ margin: 0 }}
            />
            <button 
              onClick={handleJoinRoom}
              style={{ position: 'absolute', right: 0, top: 0 }}
            >
              Join
            </button>
          </div>
        </div>
        
        {waitingRooms.length > 0 && (
          <>
            <h3>Available Rooms</h3>
            <ul className="room-list">
              {waitingRooms.map((room) => (
                <li key={room._id} className="room-item">
                  <div>
                    <strong>{room.roomCode}</strong> - {room.hostName}
                  </div>
                  <button onClick={() => handleJoinExistingRoom(room.roomCode)}>
                    Join
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
} 