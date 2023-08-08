import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

const TOKEN_KEY = 'APP_TOKEN';
const CREDENTIALS_KEY = 'APP_CREDENTIALS';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  getHeaders() {
    let data: any = {
      Authorization: 'Bearer ' + this.getToken(),
    };

    let headers: HttpHeaders = new HttpHeaders(data);

    return headers;
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY) ?? '';
  }

  getCredentials() {
    return JSON.parse(localStorage.getItem(CREDENTIALS_KEY) ?? '{}');
  }

  setToken(value: string) {
    localStorage.setItem(TOKEN_KEY, value);
  }

  setCredentials(value: any) {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(value));
  }

  clearLoginDetails() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CREDENTIALS_KEY);
  }
}
