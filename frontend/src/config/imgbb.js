/**
 * ImgBB Image Upload Utility
 * Bypasses Firebase Storage to host images for free.
 */

const IMGBB_API_KEY = 'd70c049465730a09ab9a644f431d79ff';

export const uploadToImgBB = async (file, onProgress) => {
  if (!file) throw new Error('No file provided');

  const formData = new FormData();
  formData.append('image', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`);

    if (onProgress && xhr.upload) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success && response.data && response.data.url) {
            resolve(response.data.url);
          } else {
            reject(new Error(response.error?.message || 'ImgBB upload failed'));
          }
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(`ImgBB upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during ImgBB upload'));
    xhr.send(formData);
  });
};
