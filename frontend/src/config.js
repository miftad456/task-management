export const API_BASE_URL = 'https://task-management-4dmu.onrender.com';

/**
 * Helper function to get the correct image URL
 * - If the URL is already a complete URL (Cloudinary), return it as-is
 * - If it's a relative path (old local uploads), prepend API_BASE_URL
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // If it's already a complete URL (starts with http:// or https://), return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Otherwise, it's a relative path, prepend the API base URL
    return `${API_BASE_URL}/${imagePath}`;
};
