// POST /macropage-connect/upload/tutorial expects multipart/form-data, so it
// can't go through client.js's JSON-only request() — this uses
// XMLHttpRequest directly (fetch has no upload-progress event) while
// reusing the same base URL, path prefix and 401 handling as everything else.
import { getToken } from './session';
import { BASE_URL, resolvePath, handleUnauthorized } from './client';

export const ACCEPTED_TUTORIAL_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'application/pdf',
];

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const MAX_TUTORIAL_SIZE_BYTES = 100 * 1024 * 1024;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export function validateTutorialFile(file) {
  if (!ACCEPTED_TUTORIAL_TYPES.includes(file.type)) {
    return 'Unsupported file type. Use JPEG, PNG, WEBP, GIF, MP4, WEBM or PDF.';
  }
  if (file.size > MAX_TUTORIAL_SIZE_BYTES) {
    return 'File is larger than the 100MB limit.';
  }
  return null;
}

export function validateImageUpload(file) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Unsupported image type. Use JPEG, PNG, WEBP or GIF.';
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Image is larger than the 10MB limit.';
  }
  return null;
}

// Returns { url } on success. onProgress(percent) is called as the upload advances.
export function uploadTutorialFile(file, { onProgress } = {}) {
  const path = resolvePath('/upload/tutorial');

  return new Promise((resolve, reject) => {
    const validationError = validateTutorialFile(file);
    if (validationError) {
      reject({ statusCode: 0, message: validationError, path });
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE_URL}${path}`);
    const token = getToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      let payload = null;
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        // No JSON body.
      }

      if (xhr.status === 401) {
        handleUnauthorized();
        reject({ statusCode: 401, message: payload?.message || 'Session expired.', path });
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300 || payload?.success === false) {
        reject({
          statusCode: payload?.statusCode ?? xhr.status,
          message: payload?.message || 'Could not upload file.',
          path: payload?.path ?? path,
        });
        return;
      }

      resolve(payload?.data);
    };

    xhr.onerror = () => {
      reject({ statusCode: 0, message: 'Could not reach the server. Check your connection.', path });
    };

    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
}

export function uploadImageFile(file, { onProgress } = {}) {
  const path = resolvePath('/upload/image');

  return new Promise((resolve, reject) => {
    const validationError = validateImageUpload(file);
    if (validationError) {
      reject({ statusCode: 0, message: validationError, path });
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE_URL}${path}`);
    const token = getToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      let payload = null;
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        // Some upload APIs respond without a JSON payload.
      }

      if (xhr.status === 401) {
        handleUnauthorized();
        reject({ statusCode: 401, message: payload?.message || 'Session expired.', path });
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300 || payload?.success === false) {
        reject({
          statusCode: payload?.statusCode ?? xhr.status,
          message: payload?.message || 'Could not upload image.',
          path,
        });
        return;
      }

      const uploadData = payload?.data ?? payload;
      const imageUrl =
        uploadData?.url ||
        uploadData?.imageUrl ||
        uploadData?.mediaUrl ||
        uploadData?.secure_url ||
        uploadData?.location ||
        (typeof uploadData === 'string' ? uploadData : null);

      if (!imageUrl) {
        reject({ statusCode: xhr.status, message: 'Upload succeeded but no image URL was returned.', path });
        return;
      }

      resolve(imageUrl);
    };

    xhr.onerror = () => {
      reject({ statusCode: 0, message: 'Could not reach the server. Check your connection.', path });
    };

    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
}
