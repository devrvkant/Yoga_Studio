import { useState, memo } from 'react';
import { ChevronLeft, ChevronRight, Check, Gauge } from 'lucide-react';
import { SPEED_OPTIONS } from './useVideoPlayer';

/**
 * Speed option labels
 */
const SPEED_LABELS = {
    0.5: 'Slower',
    0.75: 'Slow',
    1: 'Normal',
    1.25: 'Fast',
    1.5: 'Faster',
    2: 'Fastest',
};

/**
 * SettingsMenu - Quality and playback speed settings panel
 */
function SettingsMenu({
    playbackSpeed,
    setPlaybackSpeed,
    qualityLevels,
    currentQuality,
    isAutoQuality,
    detectedQuality,
    setQuality,
    onClose,
}) {
    const [activePanel, setActivePanel] = useState('main'); // main, speed, quality

    /**
     * Format bitrate for display
     */
    const formatBitrate = (bitrate) => {
        if (!bitrate) return '';
        const mbps = bitrate / 1000000;
        if (mbps >= 1) return `${mbps.toFixed(1)} Mbps`;
        return `${(bitrate / 1000).toFixed(0)} Kbps`;
    };

    /**
     * Get current quality label
     */
    const getCurrentQualityLabel = () => {
        if (isAutoQuality) {
            return `Auto${detectedQuality ? ` (${detectedQuality.label})` : ''}`;
        }
        const level = qualityLevels.find(q => q.index === currentQuality);
        return level ? level.label : 'Auto';
    };

    /**
     * Render main menu
     */
    const renderMainMenu = () => (
        <div className="yoga-settings-menu">
            {/* Speed option */}
            <button
                className="yoga-settings-item"
                onClick={() => setActivePanel('speed')}
            >
                <div className="yoga-settings-item-left">
                    <Gauge size={18} />
                    <span>Playback speed</span>
                </div>
                <div className="yoga-settings-item-right">
                    <span>{playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}</span>
                    <ChevronRight size={16} />
                </div>
            </button>

            {/* Quality option */}
            {qualityLevels.length > 0 && (
                <button
                    className="yoga-settings-item"
                    onClick={() => setActivePanel('quality')}
                >
                    <div className="yoga-settings-item-left">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <text x="12" y="15" fontSize="8" textAnchor="middle" fill="currentColor" stroke="none">HD</text>
                        </svg>
                        <span>Quality</span>
                    </div>
                    <div className="yoga-settings-item-right">
                        <span>{getCurrentQualityLabel()}</span>
                        <ChevronRight size={16} />
                    </div>
                </button>
            )}
        </div>
    );

    /**
     * Render speed submenu
     */
    const renderSpeedMenu = () => (
        <div className="yoga-settings-menu">
            <button
                className="yoga-settings-item yoga-settings-back"
                onClick={() => setActivePanel('main')}
            >
                <ChevronLeft size={16} />
                <span>Playback speed</span>
            </button>
            <div className="yoga-settings-divider" />
            {SPEED_OPTIONS.map((speed) => (
                <button
                    key={speed}
                    className={`yoga-settings-item ${playbackSpeed === speed ? 'active' : ''}`}
                    onClick={() => {
                        setPlaybackSpeed(speed);
                        setActivePanel('main');
                    }}
                >
                    <div className="yoga-settings-item-left">
                        {playbackSpeed === speed && <Check size={16} className="yoga-settings-check" />}
                        <span style={{ marginLeft: playbackSpeed === speed ? 0 : 24 }}>
                            {speed}x
                        </span>
                    </div>
                    <span className="yoga-settings-label">{SPEED_LABELS[speed]}</span>
                </button>
            ))}
        </div>
    );

    /**
     * Render quality submenu
     */
    const renderQualityMenu = () => (
        <div className="yoga-settings-menu">
            <button
                className="yoga-settings-item yoga-settings-back"
                onClick={() => setActivePanel('main')}
            >
                <ChevronLeft size={16} />
                <span>Quality</span>
            </button>
            <div className="yoga-settings-divider" />

            {/* Auto option */}
            <button
                className={`yoga-settings-item ${isAutoQuality ? 'active' : ''}`}
                onClick={() => {
                    setQuality(-1);
                    setActivePanel('main');
                }}
            >
                <div className="yoga-settings-item-left">
                    {isAutoQuality && <Check size={16} className="yoga-settings-check" />}
                    <span style={{ marginLeft: isAutoQuality ? 0 : 24 }}>
                        Auto
                    </span>
                </div>
                {detectedQuality && isAutoQuality && (
                    <span className="yoga-settings-label">{detectedQuality.label}</span>
                )}
            </button>

            {/* Quality levels */}
            {qualityLevels.map((level) => {
                const isActive = !isAutoQuality && currentQuality === level.index;
                return (
                    <button
                        key={level.index}
                        className={`yoga-settings-item ${isActive ? 'active' : ''}`}
                        onClick={() => {
                            setQuality(level.index);
                            setActivePanel('main');
                        }}
                    >
                        <div className="yoga-settings-item-left">
                            {isActive && <Check size={16} className="yoga-settings-check" />}
                            <span style={{ marginLeft: isActive ? 0 : 24 }}>
                                {level.label}
                            </span>
                        </div>
                        {level.bitrate && (
                            <span className="yoga-settings-label">
                                {formatBitrate(level.bitrate)}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );

    return (
        <div className="yoga-settings-panel" onClick={(e) => e.stopPropagation()}>
            {activePanel === 'main' && renderMainMenu()}
            {activePanel === 'speed' && renderSpeedMenu()}
            {activePanel === 'quality' && renderQualityMenu()}
        </div>
    );
}

export default memo(SettingsMenu);
