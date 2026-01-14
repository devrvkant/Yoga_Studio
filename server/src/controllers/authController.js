import passport from 'passport';
import User from '../models/User.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        console.log('Register Request Body:', req.body); // DEBUG LOG
        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user
        // First registered user is admin? For now, no. Manual update needed or specific implementation.
        const user = await User.create({
            name,
            email,
            password
        });

        // Log user in directly after registration? Or require login?
        // Let's log them in.
        req.login(user, (err) => {
            if (err) {
                return next(err)
            }
            return res.status(201).json({
                success: true,
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        })

    } catch (err) {
        console.error('Register Controller Error:', err); // DEBUG LOG
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ success: false, message: info.message });
        }
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.status(200).json({
                success: true,
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        });
    })(req, res, next);
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
export const logout = (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.session.destroy((err) => {
            if (err) {
                console.log('Error destroying session', err);
                return res.status(500).json({ success: false, message: 'Could not log out' });
            }
            res.clearCookie('connect.sid'); // Default cookie name
            return res.status(200).json({ success: true, message: 'Logged out successfully' });
        });
    });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    // Available because of passport deserialization
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users?page=1&limit=20
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        // Get pagination params from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 11;
        const skip = (page - 1) * limit;

        // Exclude admin users
        const query = { role: { $ne: 'admin' } };

        // Get total count for pagination metadata
        const totalUsers = await User.countDocuments(query);

        // Fetch paginated users
        const users = await User.find(query)
            .populate('enrolledClasses', 'title')
            .populate('enrolledCourses', 'title')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Most recent first

        res.status(200).json({
            success: true,
            count: users.length,
            total: totalUsers,
            page,
            pages: Math.ceil(totalUsers / limit),
            data: users
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
