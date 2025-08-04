import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { AppConstants } from '../../app-constants';
@Injectable({
  providedIn: 'root'
})
export class StorageService extends BaseService {

  private _storage: any;
  private _sessionStorage: any;
  constructor() {
    super();
    this._storage = localStorage;
    this._sessionStorage = sessionStorage;
    // this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this._storage['create'];
    this._storage = storage;
  }

  async getFromStorage(key: string): Promise<any> {
    let data = await this._storage.getItem(key) || "";
    let res = await this.decrypt(data);
    return await this.getValueAsObject(res);
  }

  async saveToStorage(key: string, val: any) {
    let value: string = '';
    value = typeof (val) != typeof ('') ? JSON.stringify(val) : val;
    await this._storage.setItem(key, await this.encrypt(value));
  }

  async removeFromStorage(key: string) {
    await this._storage.removeItem(key);
  }

  async clearStorage() {
    return this._storage.clear();
  }


  /** Save To Session Storage*/
  async saveToSessionStorage(key: string, val: any) {
    let value: string = '';
    value = typeof (val) != typeof ('') ? JSON.stringify(val) : val;
    await this._sessionStorage.setItem(key, await this.encrypt(value));
  }

  // Get from Session Storage
  async getFromSessionStorage(key: string) {
    let data = await this._sessionStorage.getItem(key) || "";
    let res = await this.decrypt(data);
    return await this.getValueAsObject(res);
  }

  // Remove from Session Storage
  async removeFromSessionStorage(key: string) {
    this._sessionStorage.removeItem(key);
  }

  // Remove from Session Storage
  async clearSessionStorage() {
    this._sessionStorage.clear();
  }


  /** Get Data From Storage if Present
   * Checks appropriate storage as per the user remember
  */
  async getDataFromAnyStorage(key: string): Promise<any> {
    let remMe: boolean = await this.getFromStorage(AppConstants.DbKeys.REMEMBER_ME);
    if (remMe && remMe == true)
      return await this.getFromStorage(key);
    return await this.getFromSessionStorage(key);
  }

  private async getValueAsObject(val: any): Promise<any> {
    try {
      return await JSON.parse(val);
    } catch (err) {
      return await val;
    }
  }
}