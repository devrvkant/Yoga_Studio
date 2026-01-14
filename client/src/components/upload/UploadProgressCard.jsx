import { Pause, Play, X, RotateCcw, Check, Loader2 } from 'lucide-react';
import { UploadStatus } from '../../services/upload';

/**
 * Upload Progress Card - Shows individual upload with controls
 */
const UploadProgressCard = ({
    fileName,
    fileSize,
    progress = 0,
    status = UploadStatus.PENDING,
    statusText = '',
    error = null,
    onPause,
    onResume,
    onCancel,
    onRetry
}) => {
    // Format file size
    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

    // Status badge colors
    const getStatusBadge = () => {
        switch (status) {
            case UploadStatus.UPLOADING:
                return (
                    <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        <Loader2 size={12} className="animate-spin" />
                        Uploading
                    </span>
                );
            case UploadStatus.PAUSED:
                return (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        Paused
                    </span>
                );
            case UploadStatus.COMPLETED:
                return (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <Check size={12} />
                        Complete
                    </span>
                );
            case UploadStatus.ERROR:
                return (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        Failed
                    </span>
                );
            default:
                return (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        Pending
                    </span>
                );
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate" title={fileName}>
                        {fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {formatSize(fileSize)}
                    </p>
                </div>
                {getStatusBadge()}
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{statusText || (status === UploadStatus.COMPLETED ? 'Complete' : 'Waiting...')}</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${status === UploadStatus.ERROR
                                ? 'bg-red-500'
                                : status === UploadStatus.COMPLETED
                                    ? 'bg-green-500'
                                    : status === UploadStatus.PAUSED
                                        ? 'bg-amber-500'
                                        : 'bg-primary'
                            }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-xs text-red-600 mb-3">
                    {error}
                </p>
            )}

            {/* Controls */}
            <div className="flex items-center gap-2">
                {status === UploadStatus.UPLOADING && onPause && (
                    <button
                        onClick={onPause}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors"
                    >
                        <Pause size={14} />
                        Pause
                    </button>
                )}

                {status === UploadStatus.PAUSED && onResume && (
                    <button
                        onClick={onResume}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                    >
                        <Play size={14} />
                        Resume
                    </button>
                )}

                {status === UploadStatus.ERROR && onRetry && (
                    <button
                        onClick={onRetry}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
                    >
                        <RotateCcw size={14} />
                        Retry
                    </button>
                )}

                {(status !== UploadStatus.COMPLETED) && onCancel && (
                    <button
                        onClick={onCancel}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                    >
                        <X size={14} />
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
};

export default UploadProgressCard;
