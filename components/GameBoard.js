import React from 'react';

const GameBoard = ({ board, onCellClick, currentPlayer, isMyTurn }) => {
  return (
    <div className="game-board">
      {board.map((cell, index) => (
        <div
          key={index}
          className={`cell ${cell ? 'filled ' + cell.toLowerCase() : ''}`}
          onClick={() => isMyTurn && !cell ? onCellClick(index) : null}
        >
          {cell}
        </div>
      ))}
    </div>
  );
};

export default GameBoard; 