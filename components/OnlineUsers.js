import React, { useState, useEffect } from 'react';
import usePresence from '../hooks/usePresence';

const OnlineUsers = ({ roomId, userId }) => {
  const [_, othersPresence, updateMyPresence] = usePresence(userId, roomId, { online: true });
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // Update online users every second
  useEffect(() => {
    const interval = setInterval(() => {
      // Filter users who were active in the last 10 seconds
      const online = othersPresence.filter(
        (presence) => Date.now() - presence.updated < 10000
      );
      
      setOnlineUsers(online);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [othersPresence]);
  
  if (onlineUsers.length === 0) {
    return null;
  }
  
  return (
    <div className="online-users">
      <h3>Players Online: {onlineUsers.length + 1}</h3> {/* +1 for current user */}
      <div className="user-list">
        {onlineUsers.map((user) => (
          <div key={user.user} className="user-item">
            {user.data.name || 'Anonymous'}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineUsers; 