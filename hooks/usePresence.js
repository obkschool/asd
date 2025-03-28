import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '../convex/_generated/react';

// Custom hook for handling presence
const usePresence = (userId, roomId, initialData = {}, heartbeatPeriod = 5000) => {
  const [myPresence, setMyPresence] = useState(initialData);
  
  // Convex queries and mutations
  const updatePresence = useMutation('presence:updatePresence');
  const heartbeat = useMutation('presence:heartbeat');
  const presenceData = useQuery('presence:getPresence', roomId ? { room: roomId } : 'skip') || [];
  
  // Filter out our own presence data
  const othersPresence = presenceData.filter(p => p.user !== userId);
  
  // Update local state and send to server
  const updateMyPresence = (data) => {
    setMyPresence(prev => ({ ...prev, ...data }));
    if (userId && roomId) {
      updatePresence({ room: roomId, user: userId, data: { ...myPresence, ...data } });
    }
  };
  
  // Send heartbeat
  useEffect(() => {
    if (!userId || !roomId) return;
    
    // Initial presence update
    updatePresence({ room: roomId, user: userId, data: myPresence });
    
    // Set up heartbeat interval
    const intervalId = setInterval(() => {
      heartbeat({ room: roomId, user: userId });
    }, heartbeatPeriod);
    
    return () => clearInterval(intervalId);
  }, [userId, roomId, heartbeat, updatePresence, myPresence, heartbeatPeriod]);
  
  return [myPresence, othersPresence, updateMyPresence];
};

export default usePresence; 