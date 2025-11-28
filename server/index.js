import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import './database.js'; // Database connection initializes on import
import { initializeSocket } from './socket.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chat.js';
import branchProductsRoutes from './routes/branchProducts.js';
import deliverySlotsRoutes from './routes/deliverySlots.js';
import branchesRoutes from './routes/branches.js';

// dotenv is loaded in database.js with the correct path
// No need to load it again here

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH", "DELETE"]
    }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Socket.io
initializeSocket(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/branch-products', branchProductsRoutes);
app.use('/api/delivery-slots', deliverySlotsRoutes);
app.use('/api/branches', branchesRoutes);

app.get('/', (req, res) => {
    res.send('Lumina Fresh Market API is running');
});

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Socket.io is ready for connections`);
});
