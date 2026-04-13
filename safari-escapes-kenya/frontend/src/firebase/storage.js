import { storage } from './config';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

// Upload a package image and return download URL
export const uploadPackageImage = async (file, packageId) => {
  try {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Use JPG, PNG or WebP');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 5MB');
    }

    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `packages/${packageId}_${timestamp}.${extension}`;

    const storageRef = ref(storage, filename);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Upload multiple package images
export const uploadPackageImages = async (files, packageId) => {
  const uploadPromises = Array.from(files).map((file, index) =>
    uploadPackageImage(file, `${packageId}_img${index}`)
  );
  return Promise.all(uploadPromises);
};

// Delete an image from storage
export const deletePackageImage = async (imageURL) => {
  try {
    const imageRef = ref(storage, imageURL);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Delete error:', error);
  }
};
