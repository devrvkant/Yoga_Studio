/**
 * Loading skeleton for video player
 */
export function VideoPlayerSkeleton({ className = '' }) {
    return (
        <div
            className={`yoga-video-player ${className}`}
            style={{
                width: '100%',
                aspectRatio: '16 / 9',
                background: '#0f172a',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(110deg, #1e293b 8%, #334155 18%, #1e293b 33%)',
                    backgroundSize: '200% 100%',
                    animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {/* Play button placeholder */}
                <div
                    style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(13, 148, 136, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                </div>
            </div>

            {/* Bottom controls placeholder */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '48px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    gap: '12px'
                }}
            >
                {/* Play button skeleton */}
                <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }} />

                {/* Progress bar skeleton */}
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)' }} />

                {/* Volume skeleton */}
                <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }} />

                {/* Fullscreen skeleton */}
                <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }} />
            </div>
        </div>
    );
}

export default VideoPlayerSkeleton;
