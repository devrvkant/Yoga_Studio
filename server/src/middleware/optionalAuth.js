/**
 * Optional Authentication Middleware
 * 
 * Use this for routes that are public but need to check if user is logged in
 * to provide conditional access (e.g., hiding paid content videos for non-enrolled users).
 * 
 * Unlike 'protect' middleware, this does NOT block unauthenticated requests.
 * It simply attaches req.user if available, or continues with req.user as undefined.
 */
export const optionalAuth = (req, res, next) => {
    // passport.js sets req.isAuthenticated() and req.user when session exists
    if (req.isAuthenticated && req.isAuthenticated()) {
        // User is logged in, req.user is already set by passport
        return next();
    }
    // Not logged in - continue without user (req.user will be undefined)
    next();
};
