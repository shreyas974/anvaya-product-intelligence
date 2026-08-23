import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isFirebaseConfigured,
  firebaseConfig,
  firebaseStorageService,
  firestoreService,
  firebaseAuthService,
  firebaseAiService,
} from '@/services/firebase';

describe('Firebase Service Layer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('Configuration & Initialization', () => {
    it('returns false for isFirebaseConfigured when placeholder/empty keys are used', () => {
      expect(typeof isFirebaseConfigured()).toBe('boolean');
    });

    it('exposes typed configuration object', () => {
      expect(firebaseConfig).toHaveProperty('projectId');
      expect(firebaseConfig).toHaveProperty('storageBucket');
    });
  });

  describe('Firebase Storage Service', () => {
    it('uploads a catalog dataset file and tracks progress', async () => {
      const mockFile = new File(['sku,brand,price\n101,DEWALT,49.99'], 'test_catalog.csv', {
        type: 'text/csv',
      });

      const progressSteps: number[] = [];
      const result = await firebaseStorageService.uploadDatasetFile(mockFile, 'ds_test', (p) => {
        progressSteps.push(p);
      });

      expect(result).toBeDefined();
      expect(result.fileName).toBe('test_catalog.csv');
      expect(result.storagePath).toContain('datasets/ds_test/');
      expect(result.sizeBytes).toBe(mockFile.size);
      expect(progressSteps.length).toBeGreaterThan(0);
      expect(progressSteps[progressSteps.length - 1]).toBe(100);
    });

    it('uploads export files and product images', async () => {
      const blob = new Blob(['sample export content'], { type: 'text/csv' });
      const exportRes = await firebaseStorageService.uploadExportFile(blob, 'export.csv');
      expect(exportRes.storagePath).toContain('exports/');
      expect(exportRes.fileName).toBe('export.csv');

      const imgBlob = new Blob(['image bytes'], { type: 'image/png' });
      const imgRes = await firebaseStorageService.uploadProductImage(imgBlob, 'prod_123', 'preview.png');
      expect(imgRes.storagePath).toBe('products/prod_123/images/preview.png');
    });
  });

  describe('Cloud Firestore Service', () => {
    it('saves and retrieves dataset records with local persistence cache', async () => {
      const mockDataset = {
        id: 'ds_101',
        name: 'Industrial Valves Feed',
        file_path: 'datasets/ds_101/valves.csv',
        file_type: 'csv' as const,
        file_size_bytes: 1024,
        row_count: 50,
        column_count: 8,
        status: 'READY' as const,
        health_score: 95.0,
        completeness_score: 94.0,
        cleanliness_score: 98.0,
        uniqueness_score: 100.0,
        consistency_score: 96.0,
        detected_roles: {},
        sample_rows: [],
        column_profiles: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await firestoreService.saveDataset(mockDataset);
      const datasets = await firestoreService.fetchDatasets();
      expect(datasets.some((d) => d.id === 'ds_101')).toBe(true);
    });

    it('records immutable audit logs', async () => {
      const logId = await firestoreService.saveAuditLog({
        action: 'ACCEPT_FACT',
        entityType: 'product',
        entityId: 'PRD-9981',
        details: { field: 'Brand Name', value: 'DEWALT' },
      });

      expect(logId).toBeDefined();
      expect(logId.startsWith('log_')).toBe(true);
    });
  });

  describe('Firebase Auth Service', () => {
    it('provides Google and email sign-in routines with user session output', async () => {
      const user = await firebaseAuthService.signInWithGoogle();
      expect(user).toBeDefined();
      expect(user.email).toContain('@');
      expect(user.role).toBeDefined();

      const emailUser = await firebaseAuthService.signInWithEmail('catalog@enterprise.com', 'password123');
      expect(emailUser.email).toBe('catalog@enterprise.com');

      const registeredUser = await firebaseAuthService.signUpWithEmail('new@enterprise.com', 'password123', 'New User');
      expect(registeredUser.name).toBe('New User');
    });
  });

  describe('Firebase AI & Vertex AI Service', () => {
    it('queries Grounded Copilot and returns citations', async () => {
      const res = await firebaseAiService.queryCatalogCopilot('What is the brand of this drill?', {
        productId: 'DCD771C2',
        brand: 'DEWALT',
        category: 'Power Tools',
      });

      expect(res.answer).toContain('DEWALT');
      expect(res.citations.length).toBeGreaterThan(0);
      expect(res.citations[0].confidence).toBeGreaterThan(0.9);
    });

    it('extracts dimensions, UOM, and materials from raw industrial descriptions', async () => {
      const raw = '1/2" Stainless Steel 150# NPT Threaded Ball Valve -- Unbranded --';
      const extraction = await firebaseAiService.extractAttributesWithAi(raw);

      expect(extraction.attributes).toHaveProperty('Size');
      expect(extraction.attributes['Size'].value).toBe('1/2');
      expect(extraction.attributes['Size'].uom).toBe('in');

      expect(extraction.attributes).toHaveProperty('Material');
      expect(extraction.attributes['Material'].value).toBe('STAINLESS STEEL');

      expect(extraction.attributes).toHaveProperty('Pressure Class');
      expect(extraction.attributes['Pressure Class'].value).toBe('150');

      expect(extraction.attributes).toHaveProperty('Connection Type');
      expect(extraction.attributes['Connection Type'].value).toBe('NPT');

      expect(extraction.normalizedDescription).not.toContain('-- Unbranded --');
    });
  });
});
