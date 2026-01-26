import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { WifiOff, AlertCircle, RefreshCw, Loader2, Play, Signal, RotateCcw, PlayCircle } from 'lucide-react';
import useVideoPlayer, { ErrorTypes } from './useVideoPlayer';
import PlayerControls from './PlayerControls';
import './video-player.css';

/**
 * Error icons for different error types
 */
const ErrorIcons = {
    [ErrorTypes.NETWORK]: Signal,
    [ErrorTypes.MEDIA]: AlertCircle,
    [ErrorTypes.HLS]: RefreshCw,
    [ErrorTypes.OFFLINE]: WifiOff,
    [ErrorTypes.UNKNOWN]: AlertCircle,
};

/**
 * Keyboard shortcuts map
 */
const KEYBOARD_SHORTCUTS = {
    ' ': 'togglePlay',
    'k': 'togglePlay',
    'K': 'togglePlay',
    'm': 'toggleMute',
    'M': 'toggleMute',
    'f': 'toggleFullscreen',
    'F': 'toggleFullscreen',
    'j': 'seekBackward10',
    'J': 'seekBackward10',
    'l': 'seekForward10',
    'L': 'seekForward10',
    'ArrowLeft': 'seekBackward5',
    'ArrowRight': 'seekForward5',
    'ArrowUp': 'volumeUp',
    'ArrowDown': 'volumeDown',
    'p': 'togglePiP',
    'P': 'togglePiP',
    '>': 'speedUp',
    '<': 'speedDown',
    '0': 'seekTo0',
    '1': 'seekTo10',
    '2': 'seekTo20',
    '3': 'seekTo30',
    '4': 'seekTo40',
    '5': 'seekTo50',
    '6': 'seekTo60',
    '7': 'seekTo70',
    '8': 'seekTo80',
    '9': 'seekTo90',
};

/**
 * Professional Video Player Component
 * Features:
 * - HLS streaming with adaptive bitrate
 * - Professional controls (volume, speed, quality)
 * - Keyboard shortcuts
 * - Comprehensive error handling
 * - Network monitoring and auto-recovery
 */
function VideoPlayer({
    src,
    videoId,
    poster,
    title,
    autoPlay = false,
    enableResume = true,
    onEnded,
    onError,
    onTimeUpdate,
    className = '',
}) {
    // Refs
    const containerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    // Player hook
    const {
        videoRef,
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
        togglePlay,
        seek,
        seekBy,
        seekToPercent,
        setVolume,
        toggleMute,
        setPlaybackSpeed,
        setQuality,
        toggleFullscreen,
        togglePictureInPicture,
        isPiPSupported,
        retry,
        videoEventHandlers,
        // Resume
        savedPosition,
        showResumePrompt,
        resumeFromSaved,
        startFromBeginning,
        formatSavedTime,
    } = useVideoPlayer({
        src,
        videoId: videoId || src,
        autoPlay,
        enableResume,
        onEnded,
        onError,
        onTimeUpdate,
    });

    // Local state
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showBigPlayButton, setShowBigPlayButton] = useState(!autoPlay);

    /**
     * Handle fullscreen changes
     */
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    /**
     * Auto-hide controls
     */
    const resetControlsTimeout = useCallback(() => {
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        setShowControls(true);

        if (isPlaying && !error) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    }, [isPlaying, error]);

    useEffect(() => {
        resetControlsTimeout();
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [isPlaying, resetControlsTimeout]);

    const handleMouseMove = useCallback(() => {
        resetControlsTimeout();
    }, [resetControlsTimeout]);

    const handleMouseLeave = useCallback(() => {
        if (isPlaying && !error) {
            setShowControls(false);
        }
    }, [isPlaying, error]);

    /**
     * Handle keyboard shortcuts
     */
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't trigger if focus is on an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Check if the player container or its children are focused/hovered
            const isPlayerFocused = containerRef.current?.contains(document.activeElement) ||
                containerRef.current?.matches(':hover');

            if (!isPlayerFocused) return;

            const action = KEYBOARD_SHORTCUTS[e.key];
            if (!action) return;

            e.preventDefault();

            switch (action) {
                case 'togglePlay':
                    togglePlay();
                    break;
                case 'toggleMute':
                    toggleMute();
                    break;
                case 'toggleFullscreen':
                    toggleFullscreen(containerRef);
                    break;
                case 'seekBackward5':
                    seekBy(-5);
                    break;
                case 'seekForward5':
                    seekBy(5);
                    break;
                case 'seekBackward10':
                    seekBy(-10);
                    break;
                case 'seekForward10':
                    seekBy(10);
                    break;
                case 'volumeUp':
                    setVolume(Math.min(1, volume + 0.05));
                    break;
                case 'volumeDown':
                    setVolume(Math.max(0, volume - 0.05));
                    break;
                case 'togglePiP':
                    togglePictureInPicture();
                    break;
                case 'speedUp': {
                    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
                    const currentIndex = speeds.indexOf(playbackSpeed);
                    if (currentIndex < speeds.length - 1) {
                        setPlaybackSpeed(speeds[currentIndex + 1]);
                    }
                    break;
                }
                case 'speedDown': {
                    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
                    const currentIndex = speeds.indexOf(playbackSpeed);
                    if (currentIndex > 0) {
                        setPlaybackSpeed(speeds[currentIndex - 1]);
                    }
                    break;
                }
                default:
                    // Handle number keys for seeking
                    if (action.startsWith('seekTo')) {
                        const percent = parseInt(action.replace('seekTo', ''), 10);
                        seekToPercent(percent);
                    }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        togglePlay,
        toggleMute,
        toggleFullscreen,
        seekBy,
        seekToPercent,
        setVolume,
        volume,
        togglePictureInPicture,
        playbackSpeed,
        setPlaybackSpeed,
    ]);

    /**
     * Handle click on video area
     */
    const handleVideoClick = useCallback(() => {
        if (showBigPlayButton) {
            setShowBigPlayButton(false);
        }
        togglePlay();
        resetControlsTimeout();
    }, [togglePlay, resetControlsTimeout, showBigPlayButton]);

    /**
     * Handle double click for fullscreen
     */
    const handleDoubleClick = useCallback(() => {
        toggleFullscreen(containerRef);
    }, [toggleFullscreen]);

    // Get error icon
    const ErrorIcon = error ? (ErrorIcons[error.type] || AlertCircle) : AlertCircle;

    // No source provided
    if (!src) {
        return (
            <div className={`yoga-video-player ${className}`}>
                <div className="yoga-player-error">
                    <AlertCircle className="yoga-player-error-icon" />
                    <p className="yoga-player-error-title">No Video Available</p>
                    <p className="yoga-player-error-message">
                        This content doesn't have a video attached.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`yoga-video-player ${className} ${isFullscreen ? 'fullscreen' : ''}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            tabIndex={0}
            role="application"
            aria-label={title || 'Video player'}
        >
            {/* Offline Overlay */}
            {isOffline && (
                <div className="yoga-player-overlay yoga-player-offline">
                    <WifiOff className="yoga-player-overlay-icon" />
                    <p className="yoga-player-overlay-title">You're Offline</p>
                    <p className="yoga-player-overlay-message">
                        Check your internet connection to continue watching.
                    </p>
                </div>
            )}

            {/* Error Overlay */}
            {error && !isOffline && (
                <div className="yoga-player-overlay yoga-player-error">
                    <ErrorIcon className="yoga-player-overlay-icon" />
                    <p className="yoga-player-overlay-title">
                        {isRecovering ? 'Recovering...' : 'Playback Error'}
                    </p>
                    <p className="yoga-player-overlay-message">{error.message}</p>
                    {!error.isRetrying && (
                        <button className="yoga-player-retry-btn" onClick={retry}>
                            <RefreshCw size={16} />
                            Try Again
                        </button>
                    )}
                </div>
            )}

            {/* Loading/Buffering Overlay */}
            {(isLoading || isBuffering) && !error && !isOffline && (
                <div className="yoga-player-overlay yoga-player-loading">
                    <div className="yoga-player-spinner" />
                </div>
            )}

            {/* Big Play Button (initial state) */}
            {showBigPlayButton && !isPlaying && !isLoading && !error && !isOffline && !showResumePrompt && (
                <button
                    className="yoga-player-big-play"
                    onClick={handleVideoClick}
                    aria-label="Play video"
                >
                    <Play size={48} fill="currentColor" />
                </button>
            )}

            {/* Resume Prompt Overlay */}
            {showResumePrompt && !isOffline && !error && (
                <div className="yoga-player-overlay yoga-player-resume">
                    <PlayCircle className="yoga-player-overlay-icon yoga-player-resume-icon" />
                    <p className="yoga-player-overlay-title">Resume watching?</p>
                    <p className="yoga-player-overlay-message">
                        You left off at {formatSavedTime()}
                    </p>
                    <div className="yoga-player-resume-actions">
                        <button
                            className="yoga-player-resume-btn yoga-player-resume-btn-primary"
                            onClick={resumeFromSaved}
                        >
                            <PlayCircle size={18} />
                            Resume
                        </button>
                        <button
                            className="yoga-player-resume-btn yoga-player-resume-btn-secondary"
                            onClick={startFromBeginning}
                        >
                            <RotateCcw size={18} />
                            Start Over
                        </button>
                    </div>
                </div>
            )}

            {/* Video Element */}
            <video
                ref={videoRef}
                poster={poster}
                playsInline
                preload="metadata"
                {...videoEventHandlers}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    background: '#000',
                }}
            />

            {/* Click Overlay */}
            {!isLoading && !error && !isOffline && (
                <div
                    className="yoga-player-click-overlay"
                    onClick={handleVideoClick}
                    onDoubleClick={handleDoubleClick}
                />
            )}

            {/* Controls */}
            <PlayerControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                buffered={buffered}
                volume={volume}
                isMuted={isMuted}
                playbackSpeed={playbackSpeed}
                qualityLevels={qualityLevels}
                currentQuality={currentQuality}
                isAutoQuality={isAutoQuality}
                detectedQuality={detectedQuality}
                isFullscreen={isFullscreen}
                isPiPSupported={isPiPSupported}
                togglePlay={togglePlay}
                seek={seek}
                seekBy={seekBy}
                setVolume={setVolume}
                toggleMute={toggleMute}
                setPlaybackSpeed={setPlaybackSpeed}
                setQuality={setQuality}
                toggleFullscreen={() => toggleFullscreen(containerRef)}
                togglePictureInPicture={togglePictureInPicture}
                isVisible={showControls || !isPlaying}
            />
        </div>
    );
}

export default memo(VideoPlayer);
export { VideoPlayer };
