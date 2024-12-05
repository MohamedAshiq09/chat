import { Server } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

type OTSMessage = {
  id: string;
  message: string;
  sender: string;
};

const otsMessages: Record<string, OTSMessage> = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Sender sends an OTS message
      socket.on('send_ots', ({ id, message, sender }: OTSMessage) => {
        otsMessages[id] = { id, message, sender };
        socket.broadcast.emit('ots_received', { id, sender });
      });

      // Receiver retrieves an OTS message
      socket.on('get_ots', (id, callback) => {
        if (otsMessages[id]) {
          const message = otsMessages[id].message;
          delete otsMessages[id]; // Self-destruct the message
          callback({ success: true, message });
        } else {
          callback({ success: false, error: 'Message not found or already read.' });
        }
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }
  res.end();
}
