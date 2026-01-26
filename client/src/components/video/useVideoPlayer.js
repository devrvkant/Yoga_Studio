import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Hls from 'hls.js';
import { getHlsUrl, getVideoType } from '../../utils/cloudinaryVideo';

/**
 * Error types for categorization
 */
export const ErrorTypes = {
    NETWORK: 'network',
    MEDIA: 'media',
    HLS: 'hls',
    OFFLINE: 'offline',
    UNKNOWN: 'unknown',
};

/**
 * Error messages for different error types
 */
const ERROR_MESSAGES = {
    [ErrorTypes.NETWORK]: 'Connection problem. Check your internet.',
    [ErrorTypes.MEDIA]: 'Unable to play this video format.',
    [ErrorTypes.HLS]: 'Streaming error. Attempting recovery...',
    [ErrorTypes.OFFLINE]: 'You\'re offline. Check your connection.',
    [ErrorTypes.UNKNOWN]: 'Something went wrong. Please try again.',
};

/**
 * Speed options available for playback
 */
export const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

/**
 * Minimum seconds watched before saving progress
 */
const MIN_WATCH_TIME_TO_SAVE = 10;

/**
 * Minimum percentage left to consider video complete (don't show resume)
 */
const COMPLETION_THRESHOLD_PERCENT = 95;

/**
 * Storage key prefix for saved positions
 */
const STORAGE_KEY_PREFIX = 'yoga_video_progress_';

/**
 * Generate storage key for a video
 */
const getStorageKey = (videoId) => {
    if (!videoId) return null;
    // Create a consistent key from the video ID/URL
    const cleanId = videoId.replace(/[^a-zA-Z0-9]/g, '_').slice(-50);
    return `${STORAGE_KEY_PREFIX}${cleanId}`;
};

/**
 * Custom hook for managing video player state and HLS integration
 * @param {Object} options - Configuration options
 * @param {string} options.src - Video source URL
 * @param {string} options.videoId - Unique identifier for the video (for resume feature)
 * @param {boolean} options.autoPlay - Whether to autoplay
 * @param {boolean} options.enableResume - Whether to enable resume functionality
 * @param {Function} options.onEnded - Callback when video ends
 * @param {Function} options.onError - Callback when error occurs
 * @param {Function} options.onTimeUpdate - Callback for time updates
 */
export function useVideoPlayer({
    src,
    videoId,
    autoPlay = false,
    enableResume = true,
    onEnded,
    onError,
    onTimeUpdate,
}) {
    // Refs
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const retryCountRef = useRef(0);
    const retryTimeoutRef = useRef(null);

    // Player state
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuffering, setIsBuffering] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);

    // Audio state
    const [volume, setVolumeState] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    // Playback state
    const [playbackSpeed, setPlaybackSpeedState] = useState(1);

    // Quality state
    const [qualityLevels, setQualityLevels] = useState([]);
    const [currentQuality, setCurrentQuality] = useState(-1); // -1 = auto
    const [isAutoQuality, setIsAutoQuality] = useState(true);
    const [detectedQuality, setDetectedQuality] = useState(null);

    // Error state
    const [error, setError] = useState(null);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    // Network state
    const [isRecovering, setIsRecovering] = useState(false);

    // Resume state
    const [savedPosition, setSavedPosition] = useState(null);
    const [showResumePrompt, setShowResumePrompt] = useState(false);
    const hasCheckedResumeRef = useRef(false);
    const lastSavedTimeRef = useRef(0);
    const hasPendingResumeRef = useRef(false); // Track if we need to check for resume before autoplay

    // Memoized video source
    const videoSrc = useMemo(() => {
        if (!src) return null;
        return getHlsUrl(src) || src;
    }, [src]);

    const isHlsSource = useMemo(() => {
        return videoSrc && getVideoType(videoSrc) === 'hls';
    }, [videoSrc]);

    // Constants
    const maxRetries = 3;
    const baseRetryDelay = 1000;

    // Storage key for this video
    const storageKey = useMemo(() => {
        return getStorageKey(videoId || src);
    }, [videoId, src]);

    /**
     * Load saved position from localStorage
     */
    const loadSavedPosition = useCallback(() => {
        if (!storageKey || !enableResume) return null;

        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                // Validate saved data
                if (data.time && data.time > MIN_WATCH_TIME_TO_SAVE) {
                    return data;
                }
            }
        } catch (err) {
            console.warn('Failed to load saved position:', err);
        }
        return null;
    }, [storageKey, enableResume]);

    /**
     * Save current position to localStorage
     */
    const savePosition = useCallback((time, videoDuration) => {
        if (!storageKey || !enableResume) return;
        if (!time || !videoDuration) return;

        // Don't save if too early or near the end
        const percentWatched = (time / videoDuration) * 100;
        if (time < MIN_WATCH_TIME_TO_SAVE || percentWatched >= COMPLETION_THRESHOLD_PERCENT) {
            // Clear saved position if video is complete
            if (percentWatched >= COMPLETION_THRESHOLD_PERCENT) {
                clearSavedPosition();
            }
            return;
        }

        // Throttle saves to every 5 seconds
        if (Math.abs(time - lastSavedTimeRef.current) < 5) return;
        lastSavedTimeRef.current = time;

        try {
            localStorage.setItem(storageKey, JSON.stringify({
                time,
                duration: videoDuration,
                timestamp: Date.now(),
            }));
        } catch (err) {
            console.warn('Failed to save position:', err);
        }
    }, [storageKey, enableResume]);

    /**
     * Clear saved position
     */
    const clearSavedPosition = useCallback(() => {
        if (!storageKey) return;

        try {
            localStorage.removeItem(storageKey);
        } catch (err) {
            console.warn('Failed to clear saved position:', err);
        }
        setSavedPosition(null);
        setShowResumePrompt(false);
    }, [storageKey]);

    /**
     * Clear any pending retry timeouts
     */
    const clearRetryTimeout = useCallback(() => {
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
    }, []);

    /**
     * Categorize error type
     */
    const categorizeError = useCallback((errorEvent, hlsError = null) => {
        if (!navigator.onLine) {
            return ErrorTypes.OFFLINE;
        }

        if (hlsError) {
            if (hlsError.type === Hls.ErrorTypes.NETWORK_ERROR) {
                return ErrorTypes.NETWORK;
            }
            if (hlsError.type === Hls.ErrorTypes.MEDIA_ERROR) {
                return ErrorTypes.MEDIA;
            }
            return ErrorTypes.HLS;
        }

        if (errorEvent?.target?.error) {
            const mediaError = errorEvent.target.error;
            switch (mediaError.code) {
                case MediaError.MEDIA_ERR_NETWORK:
                    return ErrorTypes.NETWORK;
                case MediaError.MEDIA_ERR_DECODE:
                case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    return ErrorTypes.MEDIA;
                default:
                    return ErrorTypes.UNKNOWN;
            }
        }

        return ErrorTypes.UNKNOWN;
    }, []);

    /**
     * Handle errors with retry logic
     */
    const handleError = useCallback((errorEvent, hlsError = null) => {
        const errorType = categorizeError(errorEvent, hlsError);
        console.error('Video error:', { errorType, hlsError, event: errorEvent });

        setIsLoading(false);
        setIsBuffering(false);

        // Handle offline separately
        if (errorType === ErrorTypes.OFFLINE) {
            setIsOffline(true);
            setError({ type: errorType, message: ERROR_MESSAGES[errorType] });
            onError?.({ type: errorType, message: ERROR_MESSAGES[errorType] });
            return;
        }

        // For HLS media errors, try recovery first
        if (hlsError && hlsRef.current && hlsError.type === Hls.ErrorTypes.MEDIA_ERROR) {
            setIsRecovering(true);
            hlsRef.current.recoverMediaError();
            return;
        }

        // Retry logic with exponential backoff
        if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            const delay = baseRetryDelay * Math.pow(2, retryCountRef.current - 1);

            setIsRecovering(true);
            setError({
                type: errorType,
                message: `Retrying... (${retryCountRef.current}/${maxRetries})`,
                isRetrying: true,
            });

            clearRetryTimeout();
            retryTimeoutRef.current = setTimeout(() => {
                if (hlsRef.current) {
                    hlsRef.current.startLoad();
                } else if (videoRef.current) {
                    videoRef.current.load();
                }
            }, delay);
        } else {
            // Max retries exceeded
            setIsRecovering(false);
            setError({ type: errorType, message: ERROR_MESSAGES[errorType] });
            onError?.({ type: errorType, message: ERROR_MESSAGES[errorType] });
        }
    }, [categorizeError, clearRetryTimeout, onError]);

    /**
     * Initialize HLS.js
     */
    const initHls = useCallback(() => {
        if (!videoRef.current || !videoSrc || !isHlsSource) return;

        // Destroy existing instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Check HLS.js support
        if (!Hls.isSupported()) {
            // Fallback to native HLS (Safari)
            if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                videoRef.current.src = videoSrc;
                return;
            }
            handleError(null, { type: 'UNSUPPORTED', message: 'HLS not supported' });
            return;
        }

        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90,
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            startLevel: -1, // Auto quality
            capLevelToPlayerSize: true,
            testBandwidth: true,
        });

        hlsRef.current = hls;

        // Event handlers
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            const levels = data.levels.map((level, index) => ({
                index,
                height: level.height,
                width: level.width,
                bitrate: level.bitrate,
                label: `${level.height}p`,
            }));

            // Sort by height descending
            levels.sort((a, b) => b.height - a.height);
            setQualityLevels(levels);

            // Only autoplay if:
            // 1. autoPlay is enabled
            // 2. There's no pending resume check OR resume is disabled
            if (autoPlay && !hasPendingResumeRef.current) {
                videoRef.current?.play().catch(() => {
                    // Autoplay blocked, that's fine
                });
            }
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
            const level = hls.levels[data.level];
            if (level) {
                setDetectedQuality({
                    height: level.height,
                    label: `${level.height}p`,
                });
            }
        });

        hls.on(Hls.Events.FRAG_LOADED, () => {
            setIsLoading(false);
            setIsRecovering(false);
            setError(null);
            retryCountRef.current = 0;
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                handleError(null, data);
            } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                // Non-fatal network error, HLS.js will retry
                setIsBuffering(true);
            }
        });

        hls.loadSource(videoSrc);
        hls.attachMedia(videoRef.current);
    }, [videoSrc, isHlsSource, autoPlay, handleError]);

    /**
     * Initialize non-HLS video
     */
    const initNativeVideo = useCallback(() => {
        if (!videoRef.current || !videoSrc || isHlsSource) return;
        videoRef.current.src = videoSrc;
    }, [videoSrc, isHlsSource]);

    /**
     * Online/Offline handling
     */
    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            if (error?.type === ErrorTypes.OFFLINE) {
                retry();
            }
        };

        const handleOffline = () => {
            setIsOffline(true);
            setError({ type: ErrorTypes.OFFLINE, message: ERROR_MESSAGES[ErrorTypes.OFFLINE] });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [error]);

    /**
     * Initialize video source
     */
    useEffect(() => {
        if (!videoSrc) return;

        setIsLoading(true);
        setError(null);
        retryCountRef.current = 0;
        setQualityLevels([]);
        setCurrentQuality(-1);
        setIsAutoQuality(true);
        hasCheckedResumeRef.current = false;
        setShowResumePrompt(false);

        // If resume is enabled, mark that we need to check before autoplay
        hasPendingResumeRef.current = enableResume;

        if (isHlsSource) {
            initHls();
        } else {
            initNativeVideo();
        }

        return () => {
            clearRetryTimeout();
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [videoSrc, isHlsSource, initHls, initNativeVideo, clearRetryTimeout, enableResume]);

    /**
     * Check for saved position when video metadata loads
     */
    useEffect(() => {
        if (!enableResume || hasCheckedResumeRef.current || !duration) return;

        const saved = loadSavedPosition();
        if (saved && saved.time > MIN_WATCH_TIME_TO_SAVE) {
            const percentWatched = (saved.time / duration) * 100;
            // Only show resume if video isn't nearly complete
            if (percentWatched < COMPLETION_THRESHOLD_PERCENT) {
                setSavedPosition(saved);
                setShowResumePrompt(true);
                hasPendingResumeRef.current = false; // We found a saved position, prompt is showing
                hasCheckedResumeRef.current = true;
                return; // Don't autoplay - wait for user choice
            }
        }

        // No saved position found - clear pending flag and autoplay if enabled
        hasPendingResumeRef.current = false;
        hasCheckedResumeRef.current = true;

        // If autoPlay was requested and we just confirmed no resume needed, start playing
        if (autoPlay && videoRef.current && !isPlaying) {
            videoRef.current.play().catch(() => {
                // Autoplay blocked, that's fine
            });
        }
    }, [duration, enableResume, loadSavedPosition, autoPlay, isPlaying]);

    /**
     * Retry loading
     */
    const retry = useCallback(() => {
        setError(null);
        setIsLoading(true);
        setIsRecovering(false);
        retryCountRef.current = 0;

        if (isHlsSource) {
            initHls();
        } else if (videoRef.current) {
            videoRef.current.load();
        }
    }, [isHlsSource, initHls]);

    /**
     * Play/Pause controls
     */
    const play = useCallback(() => {
        videoRef.current?.play().catch(console.error);
    }, []);

    const pause = useCallback(() => {
        videoRef.current?.pause();
    }, []);

    const togglePlay = useCallback(() => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }, [isPlaying, play, pause]);

    /**
     * Seek controls
     */
    const seek = useCallback((time) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, Math.min(time, duration));
        }
    }, [duration]);

    const seekBy = useCallback((seconds) => {
        if (videoRef.current) {
            seek(videoRef.current.currentTime + seconds);
        }
    }, [seek]);

    const seekToPercent = useCallback((percent) => {
        seek(duration * (percent / 100));
    }, [duration, seek]);

    /**
     * Volume controls
     */
    const setVolume = useCallback((value) => {
        const vol = Math.max(0, Math.min(1, value));
        if (videoRef.current) {
            videoRef.current.volume = vol;
            setVolumeState(vol);
            if (vol > 0 && isMuted) {
                videoRef.current.muted = false;
                setIsMuted(false);
            }
        }
    }, [isMuted]);

    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    /**
     * Playback speed
     */
    const setPlaybackSpeed = useCallback((speed) => {
        if (videoRef.current && SPEED_OPTIONS.includes(speed)) {
            videoRef.current.playbackRate = speed;
            setPlaybackSpeedState(speed);
        }
    }, []);

    /**
     * Quality control
     */
    const setQuality = useCallback((levelIndex) => {
        if (!hlsRef.current) return;

        if (levelIndex === -1) {
            // Auto quality
            hlsRef.current.currentLevel = -1;
            setIsAutoQuality(true);
            setCurrentQuality(-1);
        } else {
            hlsRef.current.currentLevel = levelIndex;
            setIsAutoQuality(false);
            setCurrentQuality(levelIndex);
        }
    }, []);

    /**
     * Fullscreen
     */
    const requestFullscreen = useCallback((containerRef) => {
        const container = containerRef?.current || videoRef.current;
        if (container?.requestFullscreen) {
            container.requestFullscreen();
        } else if (container?.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        }
    }, []);

    const exitFullscreen = useCallback(() => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (document.webkitFullscreenElement) {
            document.webkitExitFullscreen();
        }
    }, []);

    const toggleFullscreen = useCallback((containerRef) => {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            exitFullscreen();
        } else {
            requestFullscreen(containerRef);
        }
    }, [requestFullscreen, exitFullscreen]);

    /**
     * Picture-in-Picture
     */
    const togglePictureInPicture = useCallback(async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else if (videoRef.current && document.pictureInPictureEnabled) {
                await videoRef.current.requestPictureInPicture();
            }
        } catch (err) {
            console.warn('PiP failed:', err);
        }
    }, []);

    /**
     * Video event handlers for the video element
     */
    const videoEventHandlers = useMemo(() => ({
        onCanPlay: () => {
            setIsLoading(false);
            setError(null);
        },
        onPlay: () => setIsPlaying(true),
        onPause: () => setIsPlaying(false),
        onWaiting: () => setIsBuffering(true),
        onPlaying: () => {
            setIsBuffering(false);
            setIsLoading(false);
        },
        onTimeUpdate: (e) => {
            const video = e.target;
            setCurrentTime(video.currentTime);
            setDuration(video.duration || 0);
            onTimeUpdate?.(video.currentTime, video.duration);
            // Save position for resume feature
            if (enableResume && !showResumePrompt) {
                savePosition(video.currentTime, video.duration);
            }
        },
        onProgress: (e) => {
            const video = e.target;
            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                setBuffered(bufferedEnd);
            }
        },
        onLoadedMetadata: (e) => {
            setDuration(e.target.duration);
        },
        onEnded: () => {
            setIsPlaying(false);
            // Clear saved position when video completes
            clearSavedPosition();
            onEnded?.();
        },
        onError: (e) => {
            if (!isHlsSource) {
                handleError(e);
            }
        },
        onVolumeChange: (e) => {
            setVolumeState(e.target.volume);
            setIsMuted(e.target.muted);
        },
        onRateChange: (e) => {
            setPlaybackSpeedState(e.target.playbackRate);
        },
    }), [onTimeUpdate, onEnded, handleError, isHlsSource, enableResume, showResumePrompt, savePosition, clearSavedPosition]);

    /**
     * Check if PiP is supported
     */
    const isPiPSupported = useMemo(() => {
        return document.pictureInPictureEnabled !== undefined;
    }, []);

    /**
     * Resume playback from saved position
     */
    const resumeFromSaved = useCallback(() => {
        if (savedPosition && videoRef.current) {
            videoRef.current.currentTime = savedPosition.time;
            setShowResumePrompt(false);
            play();
        }
    }, [savedPosition, play]);

    /**
     * Start from beginning (dismiss resume prompt)
     */
    const startFromBeginning = useCallback(() => {
        clearSavedPosition();
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
        }
        setShowResumePrompt(false);
    }, [clearSavedPosition]);

    /**
     * Format saved position time for display
     */
    const formatSavedTime = useCallback(() => {
        if (!savedPosition) return '';
        const time = savedPosition.time;
        const hrs = Math.floor(time / 3600);
        const mins = Math.floor((time % 3600) / 60);
        const secs = Math.floor(time % 60);

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, [savedPosition]);

    return {
        // Refs
        videoRef,

        // State
        isPlaying,
        isLoading,
        isBuffering,
        currentTime,
        duration,
        buffered,
        volume,
        isMuted,
        playbackSpeed,
        qualityLevels,
        currentQuality,
        isAutoQuality,
        detectedQuality,
        error,
        isOffline,
        isRecovering,

        // Resume state
        savedPosition,
        showResumePrompt,

        // Controls
        play,
        pause,
        togglePlay,
        seek,
        seekBy,
        seekToPercent,
        setVolume,
        toggleMute,
        setPlaybackSpeed,
        setQuality,
        toggleFullscreen,
        requestFullscreen,
        exitFullscreen,
        togglePictureInPicture,
        isPiPSupported,
        retry,

        // Resume controls
        resumeFromSaved,
        startFromBeginning,
        formatSavedTime,
        clearSavedPosition,

        // Event handlers
        videoEventHandlers,
    };
}

export default useVideoPlayer;
