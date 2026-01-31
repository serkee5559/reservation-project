import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const PRODUCTION_URL = 'https://reservation-project.fly.dev';

    useEffect(() => {
        // Automatically determine backend URL based on current origin
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const backendUrl = isLocalhost ? 'http://localhost:4000' : PRODUCTION_URL;

        console.log('Connecting to Socket.io at:', backendUrl);
        const newSocket = io(backendUrl, {
            withCredentials: true,
        });
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
