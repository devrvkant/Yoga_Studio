import { useRef, useEffect, useState } from 'react';
import { X, Image as ImageIcon, Film } from 'lucide-react';
import { toast } from 'sonner';

// Warning component for missing config
const ConfigWarning = () => {
    const missing = !import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || !import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!missing) return null;
    return (
        <p className="text-[10px] text-yellow-600 bg-yellow-50 p-1 px-2 rounded border border-yellow-200 mt-1">
            ⚠️ Config Required: Create .env file with VITE_CLOUDINARY_CLOUD_NAME & PRESET
        </p>
    );
};

const FileUpload = ({ value, onChange, type = 'image', label, disabled }) => {
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    // Handle initial value or external updates
    useEffect(() => {
        if (typeof value === 'string') {
            setPreviewUrl(value);
        } else if (value instanceof File) {
            const url = URL.createObjectURL(value);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url); // Cleanup
        } else {
            setPreviewUrl('');
        }
    }, [value]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic Validation
        if (type === 'image' && !file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }
        if (type === 'video' && !file.type.startsWith('video/')) {
            toast.error('Please upload a video file');
            return;
        }

        // Pass the raw File object up to parent
        onChange(file);
    };

    const handleRemove = () => {
        onChange('');
        setPreviewUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium leading-none block">{label}</label>

            {/* Display Preview (URL or Local File) */}
            {previewUrl ? (
                <div className="relative group rounded-lg overflow-hidden border border-border bg-muted/40 text-center">
                    {type === 'image' ? (
                        <div className="relative h-48 w-full">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="relative h-48 w-full bg-black flex items-center justify-center">
                            <video
                                src={previewUrl}
                                className="h-full w-full object-contain"
                                controls
                            />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                            title="Remove file"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                /* Upload Interface */
                <div className={`relative border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-2 bg-muted/5 ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={type === 'image' ? "image/*" : "video/*"}
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        disabled={disabled}
                    />

                    <div className="p-3 bg-background rounded-full shadow-sm">
                        {type === 'image' ? <ImageIcon className="w-6 h-6 text-muted-foreground" /> : <Film className="w-6 h-6 text-muted-foreground" />}
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                            Click or drag to upload {type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {type === 'image' ? 'Supports high quality images' : 'Supports all video formats'}
                        </p>
                    </div>
                </div>
            )}

            <ConfigWarning />
        </div>
    );
};

export default FileUpload;
