const DB_NAME = "spoolio_bazar_db";
const STORE_NAME = "bazar_images";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves an image blob or file to local IndexedDB
 * Reads file to DataURL first, then writes into transaction synchronously
 * to prevent TransactionInactiveError.
 */
export async function saveLocalImageBlob(id: string, blob: Blob): Promise<string> {
  // 1. Read blob into base64 DataURL first
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read image data"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

  // 2. Open DB and transaction immediately prior to store.put
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put({
          id,
          data: base64Data,
          type: blob.type,
          updatedAt: Date.now(),
        });

        req.onsuccess = () => resolve(base64Data);
        req.onerror = (err) => {
          console.warn("IndexedDB put error, falling back to base64Data", err);
          resolve(base64Data);
        };
      } catch (txErr) {
        console.warn("IndexedDB transaction error, falling back to base64Data", txErr);
        resolve(base64Data);
      }
    });
  } catch (err) {
    console.warn("Failed to open IndexedDB, falling back to direct DataURL", err);
    return base64Data;
  }
}

/**
 * Retrieves a stored image by ID from IndexedDB
 */
export async function getLocalImageBlob(id: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          resolve(req.result.data);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Deletes a stored image from IndexedDB
 */
export async function deleteLocalImage(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}
