import { useState, useRef, useCallback, useEffect, memo } from 'react';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Volume1,
    Maximize,
    Minimize,
    Settings,
    SkipBack,
    SkipForward,
    PictureInPicture2,
} from 'lucide-react';
import { SPEED_OPTIONS } from './useVideoPlayer';
import SettingsMenu from './SettingsMenu';

/**
 * Format time in MM:SS or HH:MM:SS format
 */
const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get volume icon based on level
 */
const VolumeIcon = ({ volume, isMuted }) => {
    if (isMuted || volume === 0) return <VolumeX size={20} />;
    if (volume < 0.5) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
};

/**
 * PlayerControls - Professional video player controls component
 */
function PlayerControls({
    // State
    isPlaying,
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
    isFullscreen,
    isPiPSupported,

    // Controls
    togglePlay,
    seek,
    seekBy,
    setVolume,
    toggleMute,
    setPlaybackSpeed,
    setQuality,
    toggleFullscreen,
    togglePictureInPicture,

    // Visibility
    isVisible,
}) {
    const progressRef = useRef(null);
    const volumeSliderRef = useRef(null);

    // Local state
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [hoverTime, setHoverTime] = useState(null);
    const [hoverPosition, setHoverPosition] = useState(0);
    const [isDraggingProgress, setIsDraggingProgress] = useState(false);
    const [isDraggingVolume, setIsDraggingVolume] = useState(false);

    // Calculate progress percentages
    const progressPercent = duration ? (currentTime / duration) * 100 : 0;
    const bufferedPercent = duration ? (buffered / duration) * 100 : 0;

    /**
     * Handle progress bar interactions
     */
    const handleProgressClick = useCallback((e) => {
        if (!progressRef.current || !duration) return;

        const rect = progressRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        seek(percent * duration);
    }, [duration, seek]);

    const handleProgressMouseMove = useCallback((e) => {
        if (!progressRef.current || !duration) return;

        const rect = progressRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

        setHoverTime(percent * duration);
        setHoverPosition(e.clientX - rect.left);

        if (isDraggingProgress) {
            seek(percent * duration);
        }
    }, [duration, seek, isDraggingProgress]);

    const handleProgressMouseDown = useCallback((e) => {
        setIsDraggingProgress(true);
        handleProgressClick(e);
    }, [handleProgressClick]);

    const handleProgressMouseLeave = useCallback(() => {
        setHoverTime(null);
        setHoverPosition(0);
    }, []);

    /**
     * Handle volume slider interactions
     */
    const handleVolumeChange = useCallback((e) => {
        if (!volumeSliderRef.current) return;

        const rect = volumeSliderRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setVolume(percent);
    }, [setVolume]);

    const handleVolumeMouseDown = useCallback((e) => {
        setIsDraggingVolume(true);
        handleVolumeChange(e);
    }, [handleVolumeChange]);

    /**
     * Global mouse up handler for dragging
     */
    useEffect(() => {
        const handleMouseUp = () => {
            setIsDraggingProgress(false);
            setIsDraggingVolume(false);
        };

        const handleMouseMove = (e) => {
            if (isDraggingProgress && progressRef.current) {
                const rect = progressRef.current.getBoundingClientRect();
                const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                seek(percent * duration);
            }
            if (isDraggingVolume && volumeSliderRef.current) {
                const rect = volumeSliderRef.current.getBoundingClientRect();
                const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                setVolume(percent);
            }
        };

        if (isDraggingProgress || isDraggingVolume) {
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isDraggingProgress, isDraggingVolume, seek, duration, setVolume]);

    /**
     * Close settings when clicking outside
     */
    useEffect(() => {
        if (!showSettings) return;

        const handleClickOutside = (e) => {
            if (!e.target.closest('.yoga-settings-container')) {
                setShowSettings(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showSettings]);

    return (
        <div
            className={`yoga-player-controls ${isVisible ? 'visible' : 'hidden'}`}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Progress Bar */}
            <div
                ref={progressRef}
                className="yoga-player-progress"
                onClick={handleProgressClick}
                onMouseMove={handleProgressMouseMove}
                onMouseDown={handleProgressMouseDown}
                onMouseLeave={handleProgressMouseLeave}
            >
                {/* Buffer indicator */}
                <div
                    className="yoga-player-progress-buffer"
                    style={{ width: `${bufferedPercent}%` }}
                />
                {/* Played indicator */}
                <div
                    className="yoga-player-progress-filled"
                    style={{ width: `${progressPercent}%` }}
                />
                {/* Seek handle */}
                <div
                    className="yoga-player-progress-handle"
                    style={{ left: `${progressPercent}%` }}
                />
                {/* Hover preview tooltip */}
                {hoverTime !== null && (
                    <div
                        className="yoga-player-progress-tooltip"
                        style={{ left: `${hoverPosition}px` }}
                    >
                        {formatTime(hoverTime)}
                    </div>
                )}
            </div>

            {/* Controls Row */}
            <div className="yoga-player-controls-row">
                {/* Left Controls */}
                <div className="yoga-player-controls-left">
                    {/* Play/Pause */}
                    <button
                        className="yoga-player-btn"
                        onClick={togglePlay}
                        title={isPlaying ? 'Pause (k)' : 'Play (k)'}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    {/* Skip Backward */}
                    <button
                        className="yoga-player-btn"
                        onClick={() => seekBy(-10)}
                        title="Rewind 10 seconds (j)"
                        aria-label="Rewind 10 seconds"
                    >
                        <SkipBack size={18} />
                    </button>

                    {/* Skip Forward */}
                    <button
                        className="yoga-player-btn"
                        onClick={() => seekBy(10)}
                        title="Forward 10 seconds (l)"
                        aria-label="Forward 10 seconds"
                    >
                        <SkipForward size={18} />
                    </button>

                    {/* Volume Control */}
                    <div
                        className="yoga-player-volume-container"
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => !isDraggingVolume && setShowVolumeSlider(false)}
                    >
                        <button
                            className="yoga-player-btn"
                            onClick={toggleMute}
                            title={isMuted ? 'Unmute (m)' : 'Mute (m)'}
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                        >
                            <VolumeIcon volume={volume} isMuted={isMuted} />
                        </button>
                        <div className={`yoga-player-volume-slider-container ${showVolumeSlider ? 'visible' : ''}`}>
                            <div
                                ref={volumeSliderRef}
                                className="yoga-player-volume-slider"
                                onClick={handleVolumeChange}
                                onMouseDown={handleVolumeMouseDown}
                            >
                                <div
                                    className="yoga-player-volume-filled"
                                    style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                                />
                                <div
                                    className="yoga-player-volume-handle"
                                    style={{ left: `${(isMuted ? 0 : volume) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Time Display */}
                    <span className="yoga-player-time">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                </div>

                {/* Right Controls */}
                <div className="yoga-player-controls-right">
                    {/* Speed indicator (if not 1x) */}
                    {playbackSpeed !== 1 && (
                        <span className="yoga-player-speed-indicator">
                            {playbackSpeed}x
                        </span>
                    )}

                    {/* Settings */}
                    <div className="yoga-settings-container">
                        <button
                            className={`yoga-player-btn ${showSettings ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowSettings(!showSettings);
                            }}
                            title="Settings"
                            aria-label="Settings"
                        >
                            <Settings size={20} />
                        </button>
                        {showSettings && (
                            <SettingsMenu
                                playbackSpeed={playbackSpeed}
                                setPlaybackSpeed={setPlaybackSpeed}
                                qualityLevels={qualityLevels}
                                currentQuality={currentQuality}
                                isAutoQuality={isAutoQuality}
                                detectedQuality={detectedQuality}
                                setQuality={setQuality}
                                onClose={() => setShowSettings(false)}
                            />
                        )}
                    </div>

                    {/* Picture-in-Picture */}
                    {isPiPSupported && (
                        <button
                            className="yoga-player-btn"
                            onClick={togglePictureInPicture}
                            title="Picture in Picture (p)"
                            aria-label="Picture in Picture"
                        >
                            <PictureInPicture2 size={20} />
                        </button>
                    )}

                    {/* Fullscreen */}
                    <button
                        className="yoga-player-btn"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? 'Exit Fullscreen (f)' : 'Fullscreen (f)'}
                        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(PlayerControls);
