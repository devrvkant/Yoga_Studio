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

    const user = await User.findById(req.user.id)
        .populate('enrolledClasses', 'title image instructor video duration level isPaid description')
        .populate('enrolledCourses', 'title image instructor price duration sessions isPaid description level learnPoints');

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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 11;
        const skip = (page - 1) * limit;
        const { status } = req.query;

        let users, totalUsers;

        if (status === 'premium' || status === 'active') {
            // Use aggregation for premium/active filters to check isPaid before pagination
            const pipeline = [
                // Match: Exclude admin users
                { $match: { role: { $ne: 'admin' } } },

                // Lookup enrolledClasses
                {
                    $lookup: {
                        from: 'classes',
                        localField: 'enrolledClasses',
                        foreignField: '_id',
                        as: 'classDetails'
                    }
                },

                // Lookup enrolledCourses
                {
                    $lookup: {
                        from: 'courses',
                        localField: 'enrolledCourses',
                        foreignField: '_id',
                        as: 'courseDetails'
                    }
                },

                // Add fields to determine if user has paid enrollments
                {
                    $addFields: {
                        hasPaidClass: {
                            $in: [true, '$classDetails.isPaid']
                        },
                        hasPaidCourse: {
                            $in: [true, '$courseDetails.isPaid']
                        },
                        hasPaid: {
                            $or: [
                                { $in: [true, '$classDetails.isPaid'] },
                                { $in: [true, '$courseDetails.isPaid'] }
                            ]
                        },
                        hasEnrollments: {
                            $or: [
                                { $gt: [{ $size: '$enrolledClasses' }, 0] },
                                { $gt: [{ $size: '$enrolledCourses' }, 0] }
                            ]
                        }
                    }
                },

                // Filter based on status
                {
                    $match: status === 'premium'
                        ? { hasPaid: true }
                        : { hasEnrollments: true, hasPaid: false }
                }
            ];

            // Get total count
            const countPipeline = [...pipeline, { $count: 'total' }];
            const countResult = await User.aggregate(countPipeline);
            totalUsers = countResult[0]?.total || 0;

            // Get paginated results
            const resultPipeline = [
                ...pipeline,
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                // Populate with limited fields
                {
                    $project: {
                        name: 1,
                        email: 1,
                        role: 1,
                        createdAt: 1,
                        enrolledClasses: 1,
                        enrolledCourses: 1,
                        classDetails: { _id: 1, title: 1, isPaid: 1 },
                        courseDetails: { _id: 1, title: 1, isPaid: 1 }
                    }
                }
            ];

            const aggregatedUsers = await User.aggregate(resultPipeline);

            // Populate the references properly for the response
            users = await User.populate(aggregatedUsers, [
                { path: 'enrolledClasses', select: 'title isPaid' },
                { path: 'enrolledCourses', select: 'title isPaid' }
            ]);

        } else if (status === 'registered') {
            // Users with NO enrollments - simple query
            const query = {
                role: { $ne: 'admin' },
                enrolledClasses: { $size: 0 },
                enrolledCourses: { $size: 0 }
            };

            totalUsers = await User.countDocuments(query);
            users = await User.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

        } else {
            // All users (no filter)
            const query = { role: { $ne: 'admin' } };
            totalUsers = await User.countDocuments(query);
            users = await User.find(query)
                .populate('enrolledClasses', 'title isPaid')
                .populate('enrolledCourses', 'title isPaid')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });
        }

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
