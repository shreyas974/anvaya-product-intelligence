import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseFirestore, isFirebaseConfigured } from './firebase';
import { Product } from '@/types/product.types';

export interface FirestoreDataset {
  id: string | number;
  name: string;
  file_name?: string;
  file_path?: string;
  file_type?: string;
  file_size_bytes?: number;
  row_count?: number;
  column_count?: number;
  status?: string;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
}


export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: 'product' | 'dataset' | 'conflict' | 'system';
  entityId: string;
  userId?: string;
  userEmail?: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export const firestoreService = {
  /**
   * Save or update a dataset record in Cloud Firestore.
   */
  async saveDataset(dataset: FirestoreDataset): Promise<void> {
    const db = getFirebaseFirestore();
    const docId = String(dataset.id);
    if (!isFirebaseConfigured() || !db) {
      this.saveToLocalCache('anvaya_cached_datasets', docId, dataset);
      return;
    }

    try {
      const docRef = doc(db, 'datasets', docId);
      await setDoc(docRef, {
        ...dataset,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('[ANVAYA Firestore] Save dataset note:', err);
      this.saveToLocalCache('anvaya_cached_datasets', docId, dataset);
    }
  },

  /**
   * Fetch all datasets from Firestore or local fallback cache.
   */
  async fetchDatasets(): Promise<FirestoreDataset[]> {
    const db = getFirebaseFirestore();
    if (!isFirebaseConfigured() || !db) {
      return this.getFromLocalCache<FirestoreDataset>('anvaya_cached_datasets');
    }

    try {
      const q = query(collection(db, 'datasets'), orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      const datasets: FirestoreDataset[] = [];
      snapshot.forEach((d) => datasets.push(d.data() as FirestoreDataset));
      return datasets;
    } catch (err) {
      console.warn('[ANVAYA Firestore] Fetch datasets fallback:', err);
      return this.getFromLocalCache<FirestoreDataset>('anvaya_cached_datasets');
    }
  },

  /**
   * Save or update an enriched product in Firestore.
   */
  async saveProduct(product: Product): Promise<void> {
    const db = getFirebaseFirestore();
    if (!isFirebaseConfigured() || !db) {
      this.saveToLocalCache('anvaya_cached_products', product.id, product);
      return;
    }

    try {
      const docRef = doc(db, 'products', product.id);
      await setDoc(docRef, {
        ...product,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('[ANVAYA Firestore] Save product note:', err);
      this.saveToLocalCache('anvaya_cached_products', product.id, product);
    }
  },

  /**
   * Save audit log entry for human-in-the-loop review actions or conflict resolutions.
   */
  async saveAuditLog(log: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<string> {
    const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const fullLog: AuditLogEntry = {
      ...log,
      id,
      timestamp: new Date().toISOString(),
    };

    const db = getFirebaseFirestore();
    if (!isFirebaseConfigured() || !db) {
      this.saveToLocalCache('anvaya_audit_logs', id, fullLog);
      return id;
    }

    try {
      const docRef = doc(db, 'audit_logs', id);
      await setDoc(docRef, fullLog);
      return id;
    } catch (err) {
      console.warn('[ANVAYA Firestore] Audit log note:', err);
      this.saveToLocalCache('anvaya_audit_logs', id, fullLog);
      return id;
    }
  },

  /**
   * Delete a dataset record from Cloud Firestore.
   */
  async deleteDataset(docId: string): Promise<boolean> {
    const db = getFirebaseFirestore();
    if (!isFirebaseConfigured() || !db) {
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('anvaya_cached_datasets');
          if (raw) {
            const dict = JSON.parse(raw);
            delete dict[docId];
            localStorage.setItem('anvaya_cached_datasets', JSON.stringify(dict));
          }
        } catch {}
      }
      return true;
    }

    try {
      const docRef = doc(db, 'datasets', String(docId));
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.warn('[ANVAYA Firestore] Delete dataset note:', err);
      return false;
    }
  },

  /**
   * Subscribe to real-time updates for datasets.
   */
  subscribeToDatasets(onUpdate: (datasets: FirestoreDataset[]) => void): Unsubscribe {
    const db = getFirebaseFirestore();
    if (!isFirebaseConfigured() || !db) {
      onUpdate(this.getFromLocalCache<FirestoreDataset>('anvaya_cached_datasets'));
      return () => {};
    }

    try {
      const q = query(collection(db, 'datasets'), orderBy('createdAt', 'desc'), limit(50));
      return onSnapshot(q, (snapshot) => {
        const datasets: FirestoreDataset[] = [];
        snapshot.forEach((d) => datasets.push(d.data() as FirestoreDataset));
        onUpdate(datasets);
      }, (err) => {
        console.warn('[ANVAYA Firestore] Realtime dataset stream note:', err);
        onUpdate(this.getFromLocalCache<FirestoreDataset>('anvaya_cached_datasets'));
      });
    } catch {
      return () => {};
    }
  },


  // Helper methods for offline cache synchronization
  saveToLocalCache<T>(key: string, id: string, item: T): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(key);
      const dict: Record<string, T> = raw ? JSON.parse(raw) : {};
      dict[id] = item;
      localStorage.setItem(key, JSON.stringify(dict));
    } catch {
      // Ignore in strict mode
    }
  },

  getFromLocalCache<T>(key: string): T[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const dict: Record<string, T> = JSON.parse(raw);
      return Object.values(dict);
    } catch {
      return [];
    }
  },
};

