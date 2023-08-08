import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { PostsService } from 'src/app/services/posts.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.page.html',
  styleUrls: ['./posts.page.scss'],
})
export class PostsPage implements OnInit {
  posts: any[] = [];
  isFetching: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';
  page: number = 1;

  loggedIn: boolean = false;

  constructor(
    private authService: AuthService,
    private postsService: PostsService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.authService.loggedIn.subscribe((value) => {
      this.loggedIn = value;
    });
  }

  ngOnInit() {
    this.posts = [];
    this.getPosts();
  }

  getPosts() {
    const subscription = this.postsService
      .getPosts({ page: this.page, status: 1 })
      .subscribe({
        next: (value: any) => {
          const data = value?.data;
          if (this.page == 1 && data.length < 1) {
            this.hasError = true;
            this.errorMessage = 'No records';
          } else {
            this.posts.push(...data);
            this.hasError = false;
            this.errorMessage = '';
          }

          console.log(value);
        },
        error: (err) => {
          this.hasError = true;
          this.errorMessage = err.error.message ?? err.statusText;
          console.log(err);
        },
      });

    subscription.add(() => {
      this.isFetching = false;
    });
  }

  onInfinite(ev: any) {
    console.log('infinite');

    ev.target.complete();
  }

  viewPost(id: string) {
    this.router.navigateByUrl(`/posts/${id}`);
  }

  viewMyPosts() {
    this.router.navigateByUrl(`/posts/me`);
  }

  formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  login() {
    this.router.navigateByUrl('/login');
  }

  logout() {
    this.storageService.clearLoginDetails();
    this.authService.loggedIn.next(false);
  }
}
