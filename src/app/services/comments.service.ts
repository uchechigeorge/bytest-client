import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  constructor(
    private storageService: StorageService,
    private http: HttpClient
  ) {}

  getComments(params: any) {
    return this.http.get(`${environment.apiHost}/api/comments`, {
      headers: this.storageService.getHeaders(),
      params,
    });
  }

  addComment(body: any) {
    return this.http.post(`${environment.apiHost}/api/comments`, body, {
      headers: this.storageService.getHeaders(),
    });
  }

  updateComment(id: string, body: any) {
    return this.http.patch(`${environment.apiHost}/api/comments/${id}`, body, {
      headers: this.storageService.getHeaders(),
    });
  }

  updateCommentStatus(id: string, body: any) {
    return this.http.patch(
      `${environment.apiHost}/api/comments/${id}/status`,
      body,
      {
        headers: this.storageService.getHeaders(),
      }
    );
  }

  deleteComment(id: string) {
    return this.http.delete(`${environment.apiHost}/api/comments/${id}`, {
      headers: this.storageService.getHeaders(),
    });
  }
}
