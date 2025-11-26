import db from './database.js';

let io;

export const initializeSocket = (socketServer) => {
    io = socketServer;

    io.on('connection', (socket) => {
        console.log('🔌 User connected:', socket.id);

        // Customer joins chat
        socket.on('customer:join', ({ conversationId, customerName }) => {
            socket.join(`conversation_${conversationId}`);
            socket.conversationId = conversationId;
            console.log(`Customer ${customerName} joined conversation ${conversationId}`);
        });

        // Agent joins dashboard
        socket.on('agent:join', ({ agentId, agentName }) => {
            socket.join('agents');
            socket.agentId = agentId;
            socket.agentName = agentName;
            console.log(`Agent ${agentName} joined dashboard`);

            // Notify all agents of new agent online
            io.to('agents').emit('agent:online', { agentId, agentName });
        });

        // Agent opens specific conversation
        socket.on('conversation:open', ({ conversationId }) => {
            socket.join(`conversation_${conversationId}`);
            console.log(`Agent ${socket.agentName} opened conversation ${conversationId}`);
        });

        // Send message
        socket.on('message:send', async ({ conversationId, senderId, senderType, message }) => {
            try {
                const timestamp = new Date().toISOString();

                // Save to database
                db.run(
                    `INSERT INTO messages (conversationId, senderId, senderType, message, timestamp) VALUES (?, ?, ?, ?, ?)`,
                    [conversationId, senderId, senderType, message, timestamp],
                    function (err) {
                        if (err) {
                            console.error('Error saving message:', err);
                            return;
                        }

                        const messageData = {
                            id: this.lastID,
                            conversationId,
                            senderId,
                            senderType,
                            message,
                            timestamp,
                            isRead: 0
                        };

                        // Update conversation last message time
                        db.run(
                            `UPDATE conversations SET lastMessageAt = ? WHERE id = ?`,
                            [timestamp, conversationId]
                        );

                        // Broadcast to conversation room
                        io.to(`conversation_${conversationId}`).emit('message:new', messageData);

                        // If customer message, notify all agents
                        if (senderType === 'customer') {
                            io.to('agents').emit('message:notification', {
                                conversationId,
                                message: messageData
                            });
                        }
                    }
                );
            } catch (error) {
                console.error('Error in message:send:', error);
            }
        });

        // Typing indicators
        socket.on('typing:start', ({ conversationId, userType, userName }) => {
            socket.to(`conversation_${conversationId}`).emit('typing:indicator', {
                userType,
                userName,
                isTyping: true
            });
        });

        socket.on('typing:stop', ({ conversationId, userType }) => {
            socket.to(`conversation_${conversationId}`).emit('typing:indicator', {
                userType,
                isTyping: false
            });
        });

        // Assign conversation to agent
        socket.on('conversation:assign', async ({ conversationId, agentId, agentName }) => {
            try {
                db.run(
                    `UPDATE conversations SET agentId = ? WHERE id = ?`,
                    [agentId, conversationId],
                    (err) => {
                        if (!err) {
                            io.to('agents').emit('conversation:assigned', {
                                conversationId,
                                agentId,
                                agentName
                            });
                        }
                    }
                );
            } catch (error) {
                console.error('Error assigning conversation:', error);
            }
        });

        // Mark messages as read
        socket.on('messages:markRead', ({ conversationId }) => {
            db.run(
                `UPDATE messages SET isRead = 1 WHERE conversationId = ? AND senderType = 'customer'`,
                [conversationId]
            );
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log('🔌 User disconnected:', socket.id);
            if (socket.agentId) {
                io.to('agents').emit('agent:offline', {
                    agentId: socket.agentId,
                    agentName: socket.agentName
                });
            }
        });
    });
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};
