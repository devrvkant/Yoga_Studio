import cloudinary from '../config/cloudinary.js';

/**
 * Cloudinary Service
 * Centralized service for managing Cloudinary operations including cleanup
 */

/**
 * Extract public_id from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null if extraction fails
 */
export const extractPublicId = (url) => {
    if (!url) return null;

    try {
        // Log the URL for debugging
        console.log('Extracting public_id from URL:', url);

        // Handle different Cloudinary URL formats:
        // 1. https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{folder}/{public_id}.{format}
        // 2. https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{folder}/{public_id}.{format}
        // 3. https://res.cloudinary.com/{cloud_name}/video/upload/v{version}/{folder}/{public_id}.{format}

        // First, try to extract everything after /upload/ and before the file extension
        const uploadIndex = url.indexOf('/upload/');
        if (uploadIndex === -1) {
            console.warn('Could not find /upload/ in URL:', url);
            return null;
        }

        let pathAfterUpload = url.substring(uploadIndex + 8); // Skip '/upload/'

        // Remove version number if present (v followed by digits and /)
        pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');

        // Remove file extension (last dot and everything after)
        const lastDotIndex = pathAfterUpload.lastIndexOf('.');
        if (lastDotIndex !== -1) {
            pathAfterUpload = pathAfterUpload.substring(0, lastDotIndex);
        }

        console.log('Extracted public_id:', pathAfterUpload);
        return pathAfterUpload || null;
    } catch (error) {
        console.error('Error extracting public_id from URL:', error);
        return null;
    }
};


/**
 * Delete a single asset from Cloudinary
 * @param {string} publicId - Public ID of the asset to delete
 * @param {string} resourceType - Type of resource ('image' or 'video'), defaults to 'image'
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    if (!publicId) {
        console.warn('No public_id provided for deletion');
        return null;
    }

    try {
        console.log(`Deleting ${resourceType} from Cloudinary:`, publicId);
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
        console.log('Cloudinary deletion result:', result);
        return result;
    } catch (error) {
        console.error(`Error deleting ${resourceType} from Cloudinary:`, error);
        throw error;
    }
};

/**
 * Delete asset from Cloudinary using its URL
 * @param {string} url - Cloudinary URL
 * @param {string} resourceType - Type of resource ('image' or 'video')
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
export const deleteFromCloudinaryByUrl = async (url, resourceType = 'image') => {
    const publicId = extractPublicId(url);
    if (!publicId) {
        console.warn('Could not extract public_id from URL:', url);
        return null;
    }
    return deleteFromCloudinary(publicId, resourceType);
};

/**
 * Clean up all assets associated with a class
 * @param {Object} classData - Class document with image and video URLs
 * @returns {Promise<Array>} - Array of deletion results
 */
export const cleanupClassAssets = async (classData) => {
    const deletionResults = [];

    try {
        // Delete image if exists and is not the default
        if (classData.image && classData.image !== 'default-class.jpg') {
            console.log('Cleaning up class image:', classData.image);
            const imageResult = await deleteFromCloudinaryByUrl(classData.image, 'image');
            deletionResults.push({ type: 'image', result: imageResult });
        }

        // Delete video if exists
        if (classData.video) {
            console.log('Cleaning up class video:', classData.video);
            const videoResult = await deleteFromCloudinaryByUrl(classData.video, 'video');
            deletionResults.push({ type: 'video', result: videoResult });
        }

        console.log(`Cleaned up ${deletionResults.length} assets for class:`, classData._id);
        return deletionResults;
    } catch (error) {
        console.error('Error cleaning up class assets:', error);
        throw error;
    }
};

/**
 * Clean up all assets associated with a course
 * @param {Object} courseData - Course document with videos array
 * @returns {Promise<Array>} - Array of deletion results
 */
export const cleanupCourseAssets = async (courseData) => {
    const deletionResults = [];

    try {
        // Delete all videos in the course
        if (courseData.videos && Array.isArray(courseData.videos)) {
            for (const videoItem of courseData.videos) {
                if (videoItem.url) {
                    const videoResult = await deleteFromCloudinaryByUrl(videoItem.url, 'video');
                    deletionResults.push({
                        type: 'video',
                        title: videoItem.title,
                        result: videoResult
                    });
                }

                // Delete thumbnail if exists for this video
                if (videoItem.thumbnail) {
                    const thumbnailResult = await deleteFromCloudinaryByUrl(videoItem.thumbnail, 'image');
                    deletionResults.push({
                        type: 'thumbnail',
                        title: videoItem.title,
                        result: thumbnailResult
                    });
                }
            }
        }

        console.log(`Cleaned up ${deletionResults.length} assets for course:`, courseData._id);
        return deletionResults;
    } catch (error) {
        console.error('Error cleaning up course assets:', error);
        throw error;
    }
};

/**
 * Rollback uploaded assets on error
 * Useful when DB operation fails after successful Cloudinary upload
 * @param {Array} uploadedAssets - Array of {publicId, resourceType} objects
 * @returns {Promise<void>}
 */
export const rollbackUploads = async (uploadedAssets) => {
    if (!uploadedAssets || uploadedAssets.length === 0) {
        return;
    }

    console.log(`Rolling back ${uploadedAssets.length} uploaded assets...`);

    const rollbackPromises = uploadedAssets.map(asset =>
        deleteFromCloudinary(asset.publicId, asset.resourceType || 'image')
            .catch(error => {
                console.error(`Failed to rollback asset ${asset.publicId}:`, error);
                return null;
            })
    );

    await Promise.all(rollbackPromises);
    console.log('Rollback complete');
};
