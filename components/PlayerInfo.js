import React from 'react';

const PlayerInfo = ({ room, currentPlayer, playerId }) => {
  if (!room) return null;

  const { hostId, hostName, guestId, guestName, currentTurn } = room;
  
  const isHost = playerId === hostId;
  const playerSymbol = isHost ? 'X' : 'O';
  
  return (
    <div className="player-info">
      <div className={`player ${currentTurn === 'X' ? 'active' : ''}`}>
        <div>Player X</div>
        <div>{hostName || 'Waiting...'}</div>
        {isHost && <div>(You)</div>}
      </div>
      
      <div className={`player ${currentTurn === 'O' ? 'active' : ''}`}>
        <div>Player O</div>
        <div>{guestName || 'Waiting...'}</div>
        {!isHost && guestId === playerId && <div>(You)</div>}
      </div>
    </div>
  );
};

export default PlayerInfo; 