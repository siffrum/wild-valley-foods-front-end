import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import { BaseService } from './base.service';
import { IndexedDBStorage } from '../models/internal/common-models';
import { environment } from '../../environments/environment';
import { AppConstants } from '../../app-constants';

@Injectable({
  providedIn: 'root',
})
export class StorageService extends BaseService {
  // ──────── FIELDS ─────────────────────────────────────────────────────────

  /**
   * We store a single Promise from openDB(...) here. By keeping a dedicated
   * `dbPromise`, we ensure that any call to IndexedDB methods (get, put, etc.)
   * always awaits the real IndexedDB instance, and never accidentally operates
   * on localStorage. In the original code, `_storage` was set to localStorage
   * while openDB() was still pending, which caused errors like “db.get is not
   * a function.” Using `dbPromise` fixes that race condition.
   */
  private dbPromise: Promise<IDBPDatabase<IndexedDBStorage>>;

  /**
   * We keep sessionStorage in a separate field. We do **not** mix it with
   * IndexedDB. This way, session-only data is stored/encrypted in sessionStorage,
   * and IndexedDB is reserved solely for persistent storage.
   */
  private _sessionStorage: Storage;

  // ──────── CONSTRUCTOR ─────────────────────────────────────────────────────

  constructor() {
    super();

    // Kick off openDB(...) immediately. dbPromise will eventually resolve
    // to an IDBPDatabase<IndexedDBStorage>. We never overwrite this value.
    // This ensures that any call to dbPromise.await() after constructor
    // returns the actual IndexedDB handle.
    this.dbPromise = this.openIndexedDB();

    // Directly reference sessionStorage for temporary data (no race issues).
    this._sessionStorage = sessionStorage;
  }

  // ──────── PRIVATE: OPEN INDEXEDDB ───────────────────────────────────────────

  /**
   * Open (or migrate) the IndexedDB database. Returns a Promise that resolves
   * to an IDBPDatabase. We create the "localStorage" object store if it
   * doesn’t exist. By centralizing this logic here, we avoid duplicating openDB
   * calls and ensure a single database connection.
   */
  private async openIndexedDB(): Promise<IDBPDatabase<IndexedDBStorage>> {
    console.log('[StorageService] openIndexedDB() called');

    const db = await openDB<IndexedDBStorage>(
      environment.indexedDBName,
      environment.indexedDBVersion,
      {
        upgrade(db) {
          if (!db.objectStoreNames.contains('majorData')) {
            db.createObjectStore('majorData');
          }
        },
      }
    );

    console.log('[StorageService] IndexedDB opened:', db);
    return db;
  }

  // ──────── INDEXEDDB METHODS ─────────────────────────────────────────────────

  /**
   * Get an item from the IndexedDB "localStorage" store.
   * We `await this.dbPromise` to ensure `db` is an IDBPDatabase, not localStorage.
   * In the old approach, `_storage` was set to localStorage until openDB()
   * finished, causing calls to arrive too early. Now, `dbPromise` always represents
   * the real database, preventing “db.get is not a function” errors.
   *
   * @param key  The key to read from "localStorage" object store.
   * @returns    The parsed object (if stored), or null if not found.
   */
  async getFromStorage(key: string): Promise<any> {
    // Wait for the IndexedDB to be fully open
    const db = await this.dbPromise;

    // Use the IDBPDatabase.get() method (not localStorage.getItem())
    const encrypted: string = (await db.get('majorData', key)) || '';
    if (!encrypted) {
      return null;
    }

    // Decrypt, then attempt JSON.parse
    const decrypted: string = await this.decrypt(encrypted);
    return this.getValueAsObject(decrypted);
  }

  /**
   * Save an item to the IndexedDB "localStorage" store.
   * We first serialize non-string values to JSON, then encrypt before storing.
   * By always using `db = await this.dbPromise`, we avoid any chance of writing
   * to the wrong storage API. In the prior code, writing to localStorage by mistake
   * was possible if openDB() hadn't resolved.
   *
   * @param key  The key under which to store.
   * @param val  The value (object or string). If not a string, JSON.stringify() is used.
   */
  async saveToStorage(key: string, val: any): Promise<void> {
    const db = await this.dbPromise;

    // Convert objects to JSON strings; leave real strings as-is
    const rawString: string =
      typeof val !== 'string' ? JSON.stringify(val) : (val as string);

    // Encrypt the raw JSON/string before storing
    const encrypted: string = await this.encrypt(rawString);
    await db.put('majorData', encrypted, key);
  }

  /**
   * Remove an item from the IndexedDB "localStorage" store.
   * Since `dbPromise` always represents an open DB, we can safely call delete().
   *
   * @param key  The key to delete.
   */
  async removeFromStorage(key: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('majorData', key);
  }

  /**
   * Clear all data from the IndexedDB "localStorage" store.
   * Awaiting `dbPromise` ensures the database connection is ready beforehand.
   */
  async clearStorage(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear('majorData');
  }

  // ──────── SESSION STORAGE METHODS ───────────────────────────────────────────

  /**
   * Save a key/value pair to sessionStorage (encrypted).
   * We keep sessionStorage usage separate from IndexedDB to avoid the race
   * condition where IndexedDB might not be ready yet. Temporary data should
   * reside in sessionStorage only.
   *
   * @param key  The sessionStorage key.
   * @param val  The value (object or string). JSON.stringify() if not a string.
   */
  async saveToSessionStorage(key: string, val: any): Promise<void> {
    const rawString: string =
      typeof val !== 'string' ? JSON.stringify(val) : (val as string);

    const encrypted: string = await this.encrypt(rawString);
    this._sessionStorage.setItem(key, encrypted);
  }

  /**
   * Get a key from sessionStorage, decrypt it, then parse JSON.
   * This method never touches IndexedDB, so there's no need to await dbPromise.
   *
   * @param key  The sessionStorage key.
   * @returns    The parsed object (if stored), or null if not found.
   */
  async getFromSessionStorage(key: string): Promise<any> {
    const encrypted: string = this._sessionStorage.getItem(key) || '';
    if (!encrypted) {
      return null;
    }

    const decrypted: string = await this.decrypt(encrypted);
    return this.getValueAsObject(decrypted);
  }

  /**
   * Remove a key from sessionStorage (unencrypted removal).
   *
   * @param key  The sessionStorage key to remove.
   */
  async removeFromSessionStorage(key: string): Promise<void> {
    this._sessionStorage.removeItem(key);
  }

  /**
   * Clear all of sessionStorage in one go.
   */
  async clearSessionStorage(): Promise<void> {
    this._sessionStorage.clear();
  }

  // ──────── UTILITY / MIXED STORAGE ────────────────────────────────────────────

  /**
   * Get data from either IndexedDB or sessionStorage based on the
   * "remember me" flag (stored under AppConstants.DATABASE_KEYS.REMEMBER_PWD).
   * If REMEMBER_PWD is true in IndexedDB, read from IndexedDB; otherwise, from
   * sessionStorage. Because we always await `dbPromise` for getFromStorage(),
   * we avoid the previous pitfall where `_storage` was localStorage prematurely.
   *
   * @param key  The key to retrieve.
   * @returns    Whatever object/string was stored (or null if missing).
   */
  async getDataFromAnyStorage(key: string): Promise<any> {
    const remMe: boolean = await this.getFromStorage(
      AppConstants.DbKeys.REMEMBER_PWD
    );
    if (remMe) {
      return this.getFromStorage(key);
    } else {
      return this.getFromSessionStorage(key);
    }
  }

  /**
   * Helper: Attempt to JSON.parse the string; if it fails, return the raw string.
   * This is used after decryption to convert back to an object if needed.
   *
   * @param val  The decrypted string.
   */
  private async getValueAsObject(val: string): Promise<any> {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
}
