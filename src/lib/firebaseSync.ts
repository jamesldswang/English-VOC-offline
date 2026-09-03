import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { QuizRecord } from '../types';

const HISTORY_COLLECTION = 'quiz_history';

/**
 * Creates a unique document ID for a quiz record
 */
export function getRecordDocId(record: QuizRecord): string {
  const safeName = (record.name || 'anonymous').replace(/[/\\#?%]/g, '_');
  const safeTime = (record.time || Date.now().toString()).replace(/[/\\#?%]/g, '_');
  const safePrefix = (record.bankPrefix || 'general').replace(/[/\\#?%]/g, '_');
  return `${safeName}__${safeTime}__${safePrefix}`;
}

/**
 * Uploads a quiz record to Firestore
 */
export async function syncQuizRecordToFirebase(record: QuizRecord): Promise<void> {
  if (!db) return;
  try {
    const docId = getRecordDocId(record);
    const docRef = doc(db, HISTORY_COLLECTION, docId);
    await setDoc(docRef, {
      ...record,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to sync quiz record to Firebase:', err);
  }
}

/**
 * Batch syncs multiple records to Firestore
 */
export async function syncAllRecordsToFirebase(records: QuizRecord[]): Promise<void> {
  if (!db) return;
  try {
    const promises = records.map((record) => syncQuizRecordToFirebase(record));
    await Promise.allSettled(promises);
  } catch (err) {
    console.warn('Failed to batch sync records to Firebase:', err);
  }
}

/**
 * Fetches all quiz history from Firestore
 */
export async function fetchQuizHistoryFromFirebase(): Promise<QuizRecord[]> {
  if (!db) return [];
  try {
    const colRef = collection(db, HISTORY_COLLECTION);
    const snapshot = await getDocs(colRef);
    const records: QuizRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as QuizRecord;
      if (data && data.name && data.time) {
        records.push(data);
      }
    });
    return records;
  } catch (err) {
    console.warn('Failed to fetch quiz history from Firebase:', err);
    return [];
  }
}
