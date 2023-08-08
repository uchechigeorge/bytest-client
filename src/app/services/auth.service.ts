import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loggedIn = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  sessionsLogin() {
    return this.http.get(`${environment.apiHost}/api/auth/sessions-login`, {
      headers: this.storageService.getHeaders(),
    });
  }

  login(body: any) {
    return this.http.post(`${environment.apiHost}/api/auth/login`, body);
  }

  signup(body: any) {
    return this.http.post(`${environment.apiHost}/api/auth/signup`, body);
  }
}
