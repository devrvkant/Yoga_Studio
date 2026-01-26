import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';

/**
 * Modal component for previewing videos in admin dashboard
 */
export function VideoPreviewModal({
    isOpen,
    onClose,
    videoUrl,
    posterUrl,
    title,
}) {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Handle backdrop click
    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full max-w-5xl animate-in fade-in zoom-in duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 md:-top-2 md:-right-12 p-2 text-white/70 hover:text-white transition-colors z-10 bg-black/30 hover:bg-black/50 rounded-full"
                    title="Close (Esc)"
                >
                    <X size={24} />
                </button>

                {/* Title */}
                {title && (
                    <div className="absolute -top-12 left-0 md:-top-10 text-white font-medium text-lg truncate max-w-md">
                        {title}
                    </div>
                )}

                {/* Video Player */}
                <div className="rounded-xl overflow-hidden shadow-2xl">
                    <VideoPlayer
                        src={videoUrl}
                        poster={posterUrl}
                        title={title}
                        autoPlay={true}
                    />
                </div>
            </div>
        </div>
    );
}

export default VideoPreviewModal;
