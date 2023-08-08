import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { PostsService } from 'src/app/services/posts.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-posts-me',
  templateUrl: './posts-me.page.html',
  styleUrls: ['./posts-me.page.scss'],
})
export class PostsMePage implements OnInit {
  userId: string = '';
  posts: any[] = [];
  selectedPostId: string = '';
  isFetching: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';
  page: number = 1;

  isDeleting: boolean = false;

  loggedIn: boolean = false;

  constructor(
    private postsService: PostsService,
    private router: Router,
    private storageService: StorageService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    this.authService.loggedIn.subscribe((value) => {
      this.loggedIn = value;

      if (value) {
        this.posts = [];
        this.getUser();
        this.getPosts();
      }
    });
  }

  ngOnInit() {}

  getUser() {
    const credentials = this.storageService.getCredentials();
    this.userId = credentials.userId;
  }

  getPosts() {
    const subscription = this.postsService
      .getPosts({
        page: this.page,
        userId: this.userId,
      })
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

  async deletePost(id: string) {
    if (this.isDeleting) return;

    const alert = await this.alertCtrl.create({
      message: 'Are you sure you want to delete this post?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Go Ahead',
          handler: (value) => {
            console.log(value);
            this.isDeleting = true;

            const subscription = this.postsService.deletePost(id).subscribe({
              next: async (value: any) => {
                console.log(value);
                const toast = await this.toastCtrl.create({
                  duration: 3000,
                  message: value.message,
                });
                await toast.present();

                this.page = 1;
                this.posts = [];
                this.getPosts();
              },
              error: async (err) => {
                const toast = await this.toastCtrl.create({
                  duration: 3000,
                  message: err.error.message ?? err.statusText,
                });
                await toast.present();
                console.log(err);
              },
            });

            subscription.add(() => {
              this.isDeleting = false;
            });
          },
        },
      ],
    });

    await alert.present();
  }

  onInfinite(ev: any) {
    this.page++;
    console.log('infinite');

    ev.target.complete();
  }

  onAddWillDismiss(ev: any) {
    this.page = 0;
    this.posts = [];
    this.getPosts();
  }

  onEditWillDismiss(ev: any) {
    this.page = 0;
    this.posts = [];
    this.getPosts();
  }

  viewPost(id: string) {
    this.router.navigateByUrl(`/posts/${id}`);
  }

  onEdit(id: string) {
    this.selectedPostId = id;
  }

  formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  logout() {
    this.storageService.clearLoginDetails();
    this.userId = '';
    this.page = 1;
    this.posts = [];
    this.router.navigateByUrl('/posts');

    this.authService.loggedIn.next(false);
  }

  login() {
    this.router.navigateByUrl('/login');
  }
}
