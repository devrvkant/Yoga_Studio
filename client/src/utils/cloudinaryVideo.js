/**
 * Utility functions for Cloudinary video URL transformations
 */

/**
 * Convert a standard Cloudinary video URL to an HLS streaming URL
 * Uses Cloudinary's sp_auto transformation for adaptive bitrate streaming
 * 
 * @param {string} videoUrl - The original Cloudinary video URL
 * @returns {string} - The HLS streaming URL (.m3u8)
 * 
 * @example
 * Input:  https://res.cloudinary.com/cloud_name/video/upload/v123/folder/video.mp4
 * Output: https://res.cloudinary.com/cloud_name/video/upload/sp_auto/folder/video.m3u8
 */
export function getHlsUrl(videoUrl) {
    if (!videoUrl || typeof videoUrl !== 'string') {
        return null;
    }

    // Check if it's already an HLS URL
    if (videoUrl.endsWith('.m3u8')) {
        return videoUrl;
    }

    // Check if it's a Cloudinary URL
    if (!videoUrl.includes('cloudinary.com')) {
        // For non-Cloudinary URLs, return as-is (fallback to direct playback)
        return videoUrl;
    }

    try {
        // Parse the Cloudinary URL
        // Format: https://res.cloudinary.com/{cloud_name}/video/upload/{transformations}/{version}/{public_id}.{format}
        const url = new URL(videoUrl);
        const pathParts = url.pathname.split('/');

        // Find the 'upload' segment
        const uploadIndex = pathParts.indexOf('upload');
        if (uploadIndex === -1) {
            return videoUrl;
        }

        // Get the public_id (everything after upload, excluding version if present)
        let publicIdParts = pathParts.slice(uploadIndex + 1);

        // Remove version segment if present (starts with 'v' followed by numbers)
        if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
            publicIdParts = publicIdParts.slice(1);
        }

        // Remove existing transformations (segments containing ',' or specific transformation patterns)
        publicIdParts = publicIdParts.filter(part => {
            // Keep parts that look like folder names or filenames
            return !part.includes(',') && !part.startsWith('sp_') && !part.startsWith('f_') && !part.startsWith('q_');
        });

        // Get the filename and change extension to m3u8
        const filename = publicIdParts[publicIdParts.length - 1];
        const filenameWithoutExt = filename.replace(/\.[^.]+$/, '');
        publicIdParts[publicIdParts.length - 1] = `${filenameWithoutExt}.m3u8`;

        // Reconstruct the URL with sp_auto transformation
        const newPath = [
            ...pathParts.slice(0, uploadIndex + 1), // cloud_name/video/upload
            'sp_auto', // Streaming profile auto
            ...publicIdParts // public_id with .m3u8 extension
        ].join('/');

        return `${url.origin}${newPath}`;
    } catch (error) {
        console.warn('Failed to parse Cloudinary URL:', error);
        return videoUrl;
    }
}

/**
 * Check if the browser supports HLS natively (Safari) or needs hls.js
 * @returns {boolean}
 */
export function supportsNativeHls() {
    const video = document.createElement('video');
    return video.canPlayType('application/vnd.apple.mpegurl') !== '';
}

/**
 * Get video type from URL
 * @param {string} url - Video URL
 * @returns {'hls' | 'mp4' | 'webm' | 'unknown'}
 */
export function getVideoType(url) {
    if (!url) return 'unknown';

    if (url.endsWith('.m3u8') || url.includes('/sp_auto/')) {
        return 'hls';
    }
    if (url.endsWith('.mp4')) {
        return 'mp4';
    }
    if (url.endsWith('.webm')) {
        return 'webm';
    }
    return 'unknown';
}
