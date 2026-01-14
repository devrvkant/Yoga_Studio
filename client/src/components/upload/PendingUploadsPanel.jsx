import { useState } from 'react';
import { Upload, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import UploadProgressCard from './UploadProgressCard';
import { UploadStatus } from '../../services/upload';

/**
 * Pending Uploads Panel - Shows after reload if incomplete uploads exist
 */
const PendingUploadsPanel = ({
    pendingUploads = [],
    onResumeUpload,
    onCancelUpload,
    onSelectFile,
    onResumeAll,
    onCancelAll
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (pendingUploads.length === 0) return null;

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            {/* Header */}
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <AlertCircle className="text-amber-600" size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-amber-900">
                            {pendingUploads.length} Incomplete Upload{pendingUploads.length > 1 ? 's' : ''}
                        </h3>
                        <p className="text-sm text-amber-700">
                            These uploads were interrupted. Re-select the files to resume.
                        </p>
                    </div>
                </div>
                <button className="p-2 hover:bg-amber-100 rounded-lg transition-colors">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="mt-4 space-y-3">
                    {/* Quick Actions */}
                    {pendingUploads.length > 1 && (
                        <div className="flex gap-2 mb-3">
                            <button
                                onClick={onCancelAll}
                                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                            >
                                Cancel All
                            </button>
                        </div>
                    )}

                    {/* Pending Upload Cards */}
                    <div className="grid gap-3">
                        {pendingUploads.map((upload) => (
                            <div key={upload.id} className="bg-white rounded-lg border border-amber-200 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="font-medium text-foreground">{upload.fileName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {Math.round((upload.uploadedBytes / upload.fileSize) * 100)}% uploaded before interruption
                                        </p>
                                    </div>
                                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                        {upload.status === UploadStatus.PAUSED ? 'Paused' : 'Interrupted'}
                                    </span>
                                </div>

                                {/* Progress */}
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-3">
                                    <div
                                        className="h-full bg-amber-500"
                                        style={{ width: `${Math.round((upload.uploadedBytes / upload.fileSize) * 100)}%` }}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors cursor-pointer">
                                        <Upload size={14} />
                                        Re-select File to Resume
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    onSelectFile(upload.id, e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </label>
                                    <button
                                        onClick={() => onCancelUpload(upload.id)}
                                        className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingUploadsPanel;
