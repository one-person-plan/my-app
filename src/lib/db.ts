import type { OogiriEvent } from '@/data/types';

const DB_NAME = 'oogiri-db';
const DB_VERSION = 2;
const EVENTS_STORE = 'events';
const META_STORE = 'meta';
const INITIALIZED_KEY = 'initialized';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(EVENTS_STORE)) {
        db.createObjectStore(EVENTS_STORE, {
          keyPath: 'id',
        });
      }

      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
    };
  });
}

export async function loadEventsFromDB(): Promise<
  OogiriEvent[] | null
> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [EVENTS_STORE, META_STORE],
      'readonly'
    );

    const eventStore = transaction.objectStore(
      EVENTS_STORE
    );

    const metaStore = transaction.objectStore(
      META_STORE
    );

    const eventsRequest = eventStore.getAll();
    const initializedRequest = metaStore.get(
      INITIALIZED_KEY
    );

    transaction.onerror = () => {
      reject(transaction.error);
    };

    transaction.oncomplete = () => {
      const initialized =
        initializedRequest.result === true;

      if (!initialized) {
        resolve(null);
        return;
      }

      resolve(eventsRequest.result ?? []);
    };
  });
}

export async function saveEventsToDB(
  events: OogiriEvent[]
): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [EVENTS_STORE, META_STORE],
      'readwrite'
    );

    const eventStore = transaction.objectStore(
      EVENTS_STORE
    );

    const metaStore = transaction.objectStore(
      META_STORE
    );

    eventStore.clear();

    for (const event of events) {
      eventStore.put(event);
    }

    metaStore.put(true, INITIALIZED_KEY);

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}