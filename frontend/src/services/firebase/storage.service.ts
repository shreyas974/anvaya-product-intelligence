import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { getFirebaseStorage, isFirebaseConfigured } from './firebase';

export interface StorageUploadResult {
  downloadUrl: string;
  storagePath: string;
  fileName: string;
  sizeBytes: number;
  contentType: string;
  uploadedAt: string;
  isCloudSynced: boolean;
}

export type UploadProgressCallback = (progress: number, snapshot?: UploadTaskSnapshot) => void;

/**
 * Storage Service for dataset files (CSV, XLSX, JSON), images, and catalog exports.
 */
export const firebaseStorageService = {
  /**
   * Upload a raw catalog dataset file to Firebase Cloud Storage.
   */
  async uploadDatasetFile(
    file: File,
    datasetId = `dataset_${Date.now()}`,
    onProgress?: UploadProgressCallback
  ): Promise<StorageUploadResult> {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `datasets/${datasetId}/${timestamp}_${sanitizedName}`;

    const storage = getFirebaseStorage();

    if (!isFirebaseConfigured() || !storage) {
      // Local / Offline simulated cloud upload for zero-crash stability
      return this.simulateCloudUpload(file, storagePath, onProgress);
    }

    return new Promise((resolve, reject) => {
      try {
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file, {
          contentType: file.type || 'application/octet-stream',
          customMetadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            datasetId,
          },
        });

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            if (onProgress) onProgress(progress, snapshot);
          },
          (error) => {
            console.warn('[ANVAYA Firebase Storage] Upload error, falling back to local result:', error);
            // Fallback gracefully on network / rule error
            this.simulateCloudUpload(file, storagePath, onProgress)
              .then(resolve)
              .catch(reject);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                downloadUrl,
                storagePath,
                fileName: file.name,
                sizeBytes: file.size,
                contentType: file.type,
                uploadedAt: new Date().toISOString(),
                isCloudSynced: true,
              });
            } catch (err) {
              console.warn('[ANVAYA Firebase Storage] URL retrieval failed, using fallback:', err);
              const fallback = await this.simulateCloudUpload(file, storagePath, onProgress);
              resolve(fallback);
            }
          }
        );
      } catch (err) {
        console.warn('[ANVAYA Firebase Storage] Task creation failed:', err);
        this.simulateCloudUpload(file, storagePath, onProgress).then(resolve).catch(reject);
      }
    });
  },

  /**
   * Upload a product asset / image to Firebase Storage.
   */
  async uploadProductImage(
    file: File | Blob,
    productId: string,
    fileName = `img_${Date.now()}.png`,
    onProgress?: UploadProgressCallback
  ): Promise<StorageUploadResult> {
    const storagePath = `products/${productId}/images/${fileName}`;
    const storage = getFirebaseStorage();

    if (!isFirebaseConfigured() || !storage) {
      return this.simulateCloudUpload(file, storagePath, onProgress);
    }

    try {
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            if (onProgress) onProgress(progress, snapshot);
          },
          (error) => reject(error),
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              downloadUrl,
              storagePath,
              fileName,
              sizeBytes: file.size,
              contentType: file.type || 'image/png',
              uploadedAt: new Date().toISOString(),
              isCloudSynced: true,
            });
          }
        );
      });
    } catch {
      return this.simulateCloudUpload(file, storagePath, onProgress);
    }
  },

  /**
   * Upload an enriched catalog export file (CSV or XLSX).
   */
  async uploadExportFile(
    blob: Blob,
    fileName: string,
    onProgress?: UploadProgressCallback
  ): Promise<StorageUploadResult> {
    const storagePath = `exports/${Date.now()}_${fileName}`;
    const storage = getFirebaseStorage();

    if (!isFirebaseConfigured() || !storage) {
      return this.simulateCloudUpload(blob, storagePath, onProgress);
    }

    try {
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      return new Promise((resolve) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            if (onProgress) onProgress(progress, snapshot);
          },
          async () => {
            const res = await this.simulateCloudUpload(blob, storagePath, onProgress);
            resolve(res);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              downloadUrl,
              storagePath,
              fileName,
              sizeBytes: blob.size,
              contentType: blob.type,
              uploadedAt: new Date().toISOString(),
              isCloudSynced: true,
            });
          }
        );
      });
    } catch {
      return this.simulateCloudUpload(blob, storagePath, onProgress);
    }
  },

  /**
   * Delete a file from Cloud Storage.
   */
  async deleteFile(storagePath: string): Promise<boolean> {
    const storage = getFirebaseStorage();
    if (!isFirebaseConfigured() || !storage) return true;

    try {
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
      return true;
    } catch (e) {
      console.warn('[ANVAYA Firebase Storage] Delete note:', e);
      return false;
    }
  },

  /**
   * Simulates cloud upload progress smoothly for zero-crash offline and demo stability.
   */
  async simulateCloudUpload(
    file: File | Blob,
    storagePath: string,
    onProgress?: UploadProgressCallback,
    explicitFileName?: string
  ): Promise<StorageUploadResult> {
    const totalSteps = 5;
    for (let i = 1; i <= totalSteps; i++) {
      await new Promise((r) => setTimeout(r, 60));
      if (onProgress) {
        onProgress(Math.min(100, i * 20));
      }
    }

    const rawBaseName = storagePath.split('/').pop() || 'file';
    const cleanedBaseName = rawBaseName.replace(/^\d+_/, '');
    const fileName =
      explicitFileName ||
      ('name' in file && (file as File).name ? (file as File).name : cleanedBaseName);

    let downloadUrl = '';

    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      try {
        downloadUrl = URL.createObjectURL(file);
      } catch {
        downloadUrl = `https://storage.googleapis.com/anvaya-ai/${storagePath}`;
      }
    } else {
      downloadUrl = `https://storage.googleapis.com/anvaya-ai/${storagePath}`;
    }

    return {
      downloadUrl,
      storagePath,
      fileName,
      sizeBytes: file.size,
      contentType: file.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
      isCloudSynced: false,
    };
  },

};
