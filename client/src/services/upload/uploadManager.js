/**
 * Upload Manager - Orchestrates resumable chunked uploads
 * Provides pause/resume/cancel functionality with persistence
 */

import { uploadChunk, splitFileIntoChunks } from './chunkUploader';
import * as uploadStore from './uploadStore';

// Threshold for chunked upload (20MB)
const CHUNK_THRESHOLD = 20 * 1024 * 1024;
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

// Active upload sessions (in-memory for pause/resume)
const activeUploads = new Map();

/**
 * Upload status enum
 */
export const UploadStatus = {
    PENDING: 'pending',
    UPLOADING: 'uploading',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    ERROR: 'error',
    CANCELLED: 'cancelled'
};

/**
 * Create a new upload session
 * @param {File} file - File to upload
 * @param {string} resourceType - 'image' or 'video'
 * @param {Object} metadata - Additional metadata (classId, field, etc.)
 * @returns {string} Session ID
 */
export const createUploadSession = (file, resourceType = 'video', metadata = {}) => {
    const sessionId = uploadStore.generateSessionId();
    const useChunked = file.size > CHUNK_THRESHOLD;

    const session = {
        sessionId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        resourceType,
        useChunked,
        totalChunks: useChunked ? Math.ceil(file.size / CHUNK_SIZE) : 1,
        uploadedChunks: 0,
        uploadedBytes: 0,
        status: UploadStatus.PENDING,
        cloudinaryUploadId: `upload_${Date.now()}`,
        resultUrl: null,
        error: null,
        metadata,
        createdAt: Date.now()
    };

    // Persist to localStorage
    uploadStore.saveSession(sessionId, session);

    // Store file reference in memory (can't persist File objects)
    activeUploads.set(sessionId, {
        file,
        abortController: null,
        onProgress: null,
        onComplete: null,
        onError: null
    });

    return sessionId;
};

/**
 * Start or resume an upload
 * @param {string} sessionId
 * @param {Object} callbacks
 * @param {Function} callbacks.onProgress - (progress: number, status: string) => void
 * @param {Function} callbacks.onComplete - (url: string) => void
 * @param {Function} callbacks.onError - (error: Error) => void
 */
export const startUpload = async (sessionId, { onProgress, onComplete, onError }) => {
    const session = uploadStore.getSession(sessionId);
    if (!session) {
        onError?.(new Error('Session not found'));
        return;
    }

    const activeSession = activeUploads.get(sessionId);
    if (!activeSession?.file) {
        onError?.(new Error('File not available. Please re-select the file.'));
        return;
    }

    // Setup abort controller for pause/cancel
    const abortController = new AbortController();
    activeSession.abortController = abortController;
    activeSession.onProgress = onProgress;
    activeSession.onComplete = onComplete;
    activeSession.onError = onError;

    // Update status
    uploadStore.updateSession(sessionId, { status: UploadStatus.UPLOADING });

    try {
        if (session.useChunked) {
            await uploadChunked(sessionId, session, activeSession, abortController.signal);
        } else {
            await uploadDirect(sessionId, session, activeSession, abortController.signal);
        }
    } catch (error) {
        if (error.message === 'Upload aborted') {
            // Paused or cancelled - don't treat as error
            return;
        }

        uploadStore.updateSession(sessionId, {
            status: UploadStatus.ERROR,
            error: error.message
        });
        onError?.(error);
    }
};

/**
 * Upload file in chunks with resume capability
 */
const uploadChunked = async (sessionId, session, activeSession, signal) => {
    const { file, onProgress, onComplete } = activeSession;
    const chunks = splitFileIntoChunks(file, CHUNK_SIZE);

    // Resume from last uploaded chunk
    let startChunk = session.uploadedChunks || 0;

    for (let i = startChunk; i < chunks.length; i++) {
        // Check if aborted
        if (signal.aborted) {
            throw new Error('Upload aborted');
        }

        const { chunk, startByte, endByte, index } = chunks[i];

        // Upload this chunk with retry
        let retries = 3;
        let success = false;

        while (retries > 0 && !success) {
            try {
                const result = await uploadChunk({
                    chunk,
                    uploadId: session.cloudinaryUploadId,
                    chunkIndex: index,
                    totalChunks: chunks.length,
                    startByte,
                    endByte,
                    totalSize: file.size,
                    resourceType: session.resourceType,
                    onProgress: (chunkProgress) => {
                        // Calculate overall progress
                        const completedBytes = index * CHUNK_SIZE;
                        const currentChunkBytes = (chunkProgress / 100) * chunk.size;
                        const totalProgress = Math.round(
                            ((completedBytes + currentChunkBytes) / file.size) * 100
                        );
                        onProgress?.(totalProgress, `Uploading chunk ${index + 1}/${chunks.length}`);
                    },
                    signal
                });

                // Check if this was the last chunk
                if (result.secure_url) {
                    // Upload complete!
                    uploadStore.updateSession(sessionId, {
                        status: UploadStatus.COMPLETED,
                        resultUrl: result.secure_url,
                        uploadedChunks: chunks.length,
                        uploadedBytes: file.size
                    });
                    onComplete?.(result.secure_url);
                    return;
                }

                success = true;
            } catch (error) {
                if (error.message === 'Upload aborted') {
                    throw error;
                }
                retries--;
                if (retries === 0) {
                    throw error;
                }
                // Wait before retry (exponential backoff)
                await new Promise(r => setTimeout(r, 1000 * (4 - retries)));
            }
        }

        // Update progress in localStorage
        uploadStore.updateSession(sessionId, {
            uploadedChunks: index + 1,
            uploadedBytes: endByte + 1
        });
    }
};

/**
 * Direct upload for small files (no chunking)
 */
const uploadDirect = async (sessionId, session, activeSession, signal) => {
    const { file, onProgress, onComplete } = activeSession;

    const result = await uploadChunk({
        chunk: file,
        uploadId: session.cloudinaryUploadId,
        chunkIndex: 0,
        totalChunks: 1,
        startByte: 0,
        endByte: file.size - 1,
        totalSize: file.size,
        resourceType: session.resourceType,
        onProgress: (progress) => {
            onProgress?.(progress, 'Uploading...');
        },
        signal
    });

    if (result.secure_url) {
        uploadStore.updateSession(sessionId, {
            status: UploadStatus.COMPLETED,
            resultUrl: result.secure_url,
            uploadedChunks: 1,
            uploadedBytes: file.size
        });
        onComplete?.(result.secure_url);
    }
};

/**
 * Pause an active upload
 * @param {string} sessionId
 */
export const pauseUpload = (sessionId) => {
    const activeSession = activeUploads.get(sessionId);
    if (activeSession?.abortController) {
        activeSession.abortController.abort();
        uploadStore.updateSession(sessionId, { status: UploadStatus.PAUSED });
    }
};

/**
 * Cancel an upload completely
 * @param {string} sessionId
 */
export const cancelUpload = (sessionId) => {
    const activeSession = activeUploads.get(sessionId);
    if (activeSession?.abortController) {
        activeSession.abortController.abort();
    }
    uploadStore.updateSession(sessionId, { status: UploadStatus.CANCELLED });
    uploadStore.clearSession(sessionId);
    activeUploads.delete(sessionId);
};

/**
 * Re-attach a file to a pending session (after reload)
 * @param {string} sessionId
 * @param {File} file
 */
export const reattachFile = (sessionId, file) => {
    const session = uploadStore.getSession(sessionId);
    if (!session) return false;

    // Validate file matches
    if (file.name !== session.fileName || file.size !== session.fileSize) {
        return false;
    }

    activeUploads.set(sessionId, {
        file,
        abortController: null,
        onProgress: null,
        onComplete: null,
        onError: null
    });

    return true;
};

/**
 * Get current session state
 * @param {string} sessionId
 * @returns {Object|null}
 */
export const getSessionState = (sessionId) => {
    return uploadStore.getSession(sessionId);
};

/**
 * Get all pending uploads that need attention
 * @returns {Array}
 */
export const getPendingUploads = () => {
    return uploadStore.getPendingSessions();
};

/**
 * Check if we should use chunked upload for a file
 * @param {File} file
 * @returns {boolean}
 */
export const shouldUseChunkedUpload = (file) => {
    return file.size > CHUNK_THRESHOLD;
};
