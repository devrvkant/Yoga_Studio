/**
 * Upload Store - localStorage persistence for resumable uploads
 * Stores upload session data to survive browser reloads
 */

const STORAGE_KEY = 'yoga_studio_uploads';

/**
 * Get all upload sessions from localStorage
 * @returns {Object} Map of sessionId -> session data
 */
export const getAllSessions = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error('Failed to read upload sessions:', e);
        return {};
    }
};

/**
 * Save a single session
 * @param {string} sessionId - Unique upload session ID
 * @param {Object} sessionData - Session data to persist
 */
export const saveSession = (sessionId, sessionData) => {
    try {
        const sessions = getAllSessions();
        sessions[sessionId] = {
            ...sessionData,
            updatedAt: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
        console.error('Failed to save upload session:', e);
    }
};

/**
 * Get a single session by ID
 * @param {string} sessionId
 * @returns {Object|null}
 */
export const getSession = (sessionId) => {
    const sessions = getAllSessions();
    return sessions[sessionId] || null;
};

/**
 * Update specific fields in a session
 * @param {string} sessionId
 * @param {Object} updates - Fields to update
 */
export const updateSession = (sessionId, updates) => {
    const session = getSession(sessionId);
    if (session) {
        saveSession(sessionId, { ...session, ...updates });
    }
};

/**
 * Remove a session (on completion or cancel)
 * @param {string} sessionId
 */
export const clearSession = (sessionId) => {
    try {
        const sessions = getAllSessions();
        delete sessions[sessionId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
        console.error('Failed to clear upload session:', e);
    }
};

/**
 * Get all pending (incomplete) sessions
 * @returns {Array} Array of pending session objects
 */
export const getPendingSessions = () => {
    const sessions = getAllSessions();
    return Object.entries(sessions)
        .filter(([_, session]) => session.status !== 'completed')
        .map(([id, session]) => ({ id, ...session }));
};

/**
 * Clear all sessions (for cleanup/reset)
 */
export const clearAllSessions = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error('Failed to clear all sessions:', e);
    }
};

/**
 * Generate a unique session ID
 * @returns {string}
 */
export const generateSessionId = () => {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
