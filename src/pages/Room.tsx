
import React from 'react';
import { useParams } from 'react-router-dom';

const Room = () => {
  const { roomId } = useParams();
  
  return (
    <div>
      <h1>Room {roomId}</h1>
      {/* Room content will be implemented later */}
    </div>
  );
};

export default Room;
