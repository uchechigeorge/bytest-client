import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  getPosts(params?: any) {
    return this.http.get(`${environment.apiHost}/api/posts`, {
      headers: this.storageService.getHeaders(),
      params,
    });
  }

  getPost(id: string) {
    return this.http.get(`${environment.apiHost}/api/posts/${id}`, {
      headers: this.storageService.getHeaders(),
    });
  }

  addPost(body: any) {
    return this.http.post(`${environment.apiHost}/api/posts`, body, {
      headers: this.storageService.getHeaders(),
    });
  }

  updatePost(id: string, body: any) {
    return this.http.patch(`${environment.apiHost}/api/posts/${id}`, body, {
      headers: this.storageService.getHeaders(),
    });
  }

  updatePostImage(id: string, body: any) {
    return this.http.patch(
      `${environment.apiHost}/api/posts/${id}/image`,
      body,
      {
        headers: this.storageService.getHeaders(),
      }
    );
  }

  deletePost(id: string) {
    return this.http.delete(`${environment.apiHost}/api/posts/${id}`, {
      headers: this.storageService.getHeaders(),
    });
  }
}
