import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { logger } from './logger';

const cfg = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isConfigured = Object.values(cfg).every(v => v && v !== 'REPLACE_ME');

let db = null;

if (isConfigured) {
  try {
    const app = initializeApp(cfg);
    db = getFirestore(app);
    logger.info('Firebase', 'Firestore 연결 성공', { projectId: cfg.projectId });
  } catch (e) {
    logger.error('Firebase', 'Firestore 초기화 실패', e);
  }
} else {
  logger.warn('Firebase', '.env 설정이 필요합니다 — REPLACE_ME 값을 실제 키로 교체하세요');
}

export { db };
