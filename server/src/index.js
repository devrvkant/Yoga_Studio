import express from 'express';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';
import passportConfig from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import classRoutes from './routes/classRoutes.js';
import courseRoutes from './routes/courseRoutes.js'

// Load env vars
dotenv.config({ path: '../server/.env' }); // Adjusted path if running from root, or just .env if inside server

// Passport config
passportConfig(passport);

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Security headers
app.use(helmet());

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // Trust first proxy (required for secure cookies behind Nginx/Vercel/Heroku)
}

// CORS
app.use(cors({
    origin: 'http://localhost:5173', // Vite client default port
    credentials: true // Important for cookies/sessions
}));

// Sessions
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'secret',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            httpOnly: true, // Secure cookie, cannot be accessed by JS
            secure: process.env.NODE_ENV === 'production', // true in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // 'none' for cross-site (if needed) or 'lax'
        }
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the Yoga Studio API...');
});
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/courses', courseRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Connect to database
    connectDB();
});
