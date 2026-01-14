import { Loader2, X, Pause, Play, RotateCcw, AlertCircle } from 'lucide-react';
import { UploadStatus } from '../../services/upload';

/**
 * Floating Upload Overlay - Top-right toast-style upload progress indicator
 */
const UploadOverlay = ({ uploads, onPause, onResume, onCancel, onRetry }) => {
    if (!uploads || uploads.length === 0) return null;

    // Get the primary active upload (first one)
    const primaryUpload = uploads[0];
    const hasMultiple = uploads.length > 1;

    // Format file size
    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-2 fade-in duration-300">
            {/* Main Upload Card */}
            <div className="bg-card border border-border/50 rounded-xl shadow-input overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                {/* Header with Warning */}
                <div className="bg-primary/5 dark:bg-primary/10 border-b border-primary/10 px-4 py-3">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                                Upload in Progress
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                                Don't close this tab or reload the browser
                            </p>
                        </div>
                        {primaryUpload.status !== UploadStatus.UPLOADING && (
                            <button
                                onClick={() => onCancel(primaryUpload.sessionId)}
                                className="flex-shrink-0 p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                                title="Cancel upload"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Upload Details */}
                <div className="p-4 space-y-4 bg-card">
                    {uploads.map((upload, index) => (
                        <div key={upload.sessionId} className={index > 0 ? 'pt-4 border-t border-border' : ''}>
                            {/* File Info */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate" title={upload.fileName}>
                                        {upload.fileName}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {formatSize(upload.fileSize)}
                                    </p>
                                </div>

                                {/* Status Badge */}
                                {upload.status === UploadStatus.UPLOADING && (
                                    <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                        Uploading...
                                    </span>
                                )}
                                {upload.status === UploadStatus.PAUSED && (
                                    <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide uppercase text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                                        Paused
                                    </span>
                                )}
                                {upload.status === UploadStatus.ERROR && (
                                    <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide uppercase text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                                        Failed
                                    </span>
                                )}
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                    <span className="truncate max-w-[200px] font-medium">
                                        {upload.status === UploadStatus.ERROR ? 'Upload stopped' : upload.statusText || 'Processing...'}
                                    </span>
                                    <span className="font-semibold text-foreground">{upload.progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 rounded-full ${upload.status === UploadStatus.ERROR
                                            ? 'bg-destructive'
                                            : upload.status === UploadStatus.PAUSED
                                                ? 'bg-amber-400'
                                                : 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]'
                                            }`}
                                        style={{ width: `${upload.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {upload.error && (
                                <div className="flex items-start gap-2 p-3 bg-destructive/5 border border-destructive/20 rounded-lg mb-4">
                                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                                    <p className="text-xs font-medium text-destructive">
                                        {upload.error}
                                    </p>
                                </div>
                            )}

                            {/* Control Buttons */}
                            <div className="flex items-center gap-2">
                                {upload.status === UploadStatus.UPLOADING && onPause && (
                                    <button
                                        type="button"
                                        onClick={() => onPause(upload.sessionId)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors border border-border"
                                    >
                                        <Pause size={14} className="text-muted-foreground" />
                                        Pause Upload
                                    </button>
                                )}

                                {upload.status === UploadStatus.PAUSED && onResume && (
                                    <button
                                        type="button"
                                        onClick={() => onResume(upload.sessionId)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors shadow-sm"
                                    >
                                        <Play size={14} fill="currentColor" />
                                        Resume Upload
                                    </button>
                                )}

                                {upload.status === UploadStatus.ERROR && onRetry && (
                                    <button
                                        type="button"
                                        onClick={() => onRetry(upload.sessionId)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors shadow-sm"
                                    >
                                        <RotateCcw size={14} />
                                        Retry
                                    </button>
                                )}

                                {upload.status !== UploadStatus.UPLOADING && onCancel && (
                                    <button
                                        type="button"
                                        onClick={() => onCancel(upload.sessionId)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors border ${upload.status === UploadStatus.ERROR
                                            ? 'text-foreground bg-secondary hover:bg-secondary/80 border-border'
                                            : 'text-destructive bg-background hover:bg-destructive/5 border-border hover:border-destructive/20'
                                            }`}
                                    >
                                        <X size={14} />
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Multiple Uploads Indicator */}
                    {hasMultiple && (
                        <div className="pt-3 border-t border-border">
                            <p className="text-xs text-muted-foreground text-center font-medium">
                                {uploads.length} upload{uploads.length > 1 ? 's' : ''} in progress
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadOverlay;
