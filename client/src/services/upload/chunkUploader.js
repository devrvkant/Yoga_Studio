/**
 * Chunk Uploader - Low-level XHR handler for uploading file chunks
 * Uses Cloudinary's chunked upload API with Content-Range headers
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a single chunk to Cloudinary
 * @param {Object} options
 * @param {Blob} options.chunk - The chunk data
 * @param {string} options.uploadId - Unique upload ID for this file
 * @param {number} options.chunkIndex - Current chunk index (0-based)
 * @param {number} options.totalChunks - Total number of chunks
 * @param {number} options.startByte - Start byte position
 * @param {number} options.endByte - End byte position
 * @param {number} options.totalSize - Total file size
 * @param {string} options.resourceType - 'image' or 'video'
 * @param {Function} options.onProgress - Progress callback (0-100 for this chunk)
 * @param {AbortSignal} options.signal - AbortController signal for cancellation
 * @returns {Promise<Object>} Cloudinary response
 */
export const uploadChunk = ({
    chunk,
    uploadId,
    chunkIndex,
    totalChunks,
    startByte,
    endByte,
    totalSize,
    resourceType = 'video',
    onProgress,
    signal
}) => {
    return new Promise((resolve, reject) => {
        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('resource_type', resourceType);

        const xhr = new XMLHttpRequest();

        // Handle abort signal
        if (signal) {
            signal.addEventListener('abort', () => {
                xhr.abort();
                reject(new Error('Upload aborted'));
            });
        }

        xhr.open('POST', url, true);

        // Set Content-Range header for chunked upload
        // Format: bytes startByte-endByte/totalSize
        xhr.setRequestHeader('Content-Range', `bytes ${startByte}-${endByte}/${totalSize}`);
        xhr.setRequestHeader('X-Unique-Upload-Id', uploadId);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                const percent = Math.round((e.loaded / e.total) * 100);
                onProgress(percent);
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
            } else if (xhr.status === 206) {
                // 206 = Partial Content - chunk received, more expected
                resolve({ partial: true, status: 206 });
            } else {
                reject(new Error(`Chunk upload failed: ${xhr.status}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error('Network error during chunk upload'));
        };

        xhr.ontimeout = () => {
            reject(new Error('Chunk upload timed out'));
        };

        // Set timeout (5 minutes per chunk)
        xhr.timeout = 300000;

        xhr.send(formData);
    });
};

/**
 * Split a file into chunks
 * @param {File} file - The file to split
 * @param {number} chunkSize - Size of each chunk in bytes (default 5MB)
 * @returns {Array<{chunk: Blob, startByte: number, endByte: number, index: number}>}
 */
export const splitFileIntoChunks = (file, chunkSize = 5 * 1024 * 1024) => {
    const chunks = [];
    let startByte = 0;
    let index = 0;

    while (startByte < file.size) {
        const endByte = Math.min(startByte + chunkSize, file.size);
        const chunk = file.slice(startByte, endByte);

        chunks.push({
            chunk,
            startByte,
            endByte: endByte - 1, // endByte is inclusive in Content-Range
            index
        });

        startByte = endByte;
        index++;
    }

    return chunks;
};

/**
 * Calculate which chunk we should resume from
 * @param {number} uploadedBytes - Bytes already uploaded
 * @param {number} chunkSize - Size of each chunk
 * @returns {number} Index of chunk to resume from
 */
export const getResumeChunkIndex = (uploadedBytes, chunkSize = 5 * 1024 * 1024) => {
    return Math.floor(uploadedBytes / chunkSize);
};
