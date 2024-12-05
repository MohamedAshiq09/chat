import { Server } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HttpServer } from 'http'; // Import HTTP Server type
import { Socket } from 'net'; // Import Socket type

type ExtendedSocket = Socket & {
  server: HttpServer & {
    io?: Server;
  };
};

type OTSMessage = {
  id: string;
  message: string;
  sender: string;
};

const otsMessages: Record<string, OTSMessage> = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const extendedSocket = res.socket as ExtendedSocket;

  // Check if Socket.IO is already initialized
  if (!extendedSocket.server.io) {
    // Pass the HTTP server instance to Socket.IO
    const io = new Server(extendedSocket.server);
    extendedSocket.server.io = io;

    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Sender sends an OTS message
      socket.on('send_ots', ({ id, message, sender }: OTSMessage) => {
        otsMessages[id] = { id, message, sender };
        socket.broadcast.emit('ots_received', { id, sender });
      });

      // Receiver retrieves an OTS message
      socket.on('get_ots', (id: string, callback: (response: { success: boolean; message?: string; error?: string }) => void) => {
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

    console.log('Socket.IO initialized');
  } else {
    console.log('Socket.IO already initialized');
  }

  res.end(); // End the response
}
