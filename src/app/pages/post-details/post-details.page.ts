import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { CommentsService } from 'src/app/services/comments.service';
import { PostsService } from 'src/app/services/posts.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.page.html',
  styleUrls: ['./post-details.page.scss'],
})
export class PostDetailsPage implements OnInit {
  postId: string = '';
  postDetails: any = {};

  isFetching: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  comments: any[] = [];
  pageComments: number = 1;
  // Filters
  commentStatus: CommentVisibilityStatus | null =
    CommentVisibilityStatus.Approved;
  commentFilter: CommentFilterStatus = CommentFilterStatus.All;
  userId: string | null = null;
  parentId: string | null = null;

  commentForm = new FormGroup({
    content: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?!\s*$).+/),
    ]),
    anonymous: new FormControl(false),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?!\s*$).+/),
    ]),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    phone: new FormControl(''),
    saveDetails: new FormControl(false),
  });

  isAddingComment: boolean = false;

  loggedIn: boolean = false;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private postService: PostsService,
    private commentsService: CommentsService,
    private authService: AuthService,
    private storageService: StorageService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.authService.loggedIn.subscribe((value) => {
      this.loggedIn = value;

      if (value) {
        this.getUserDetails();
      }
    });
  }

  ngOnInit() {
    this.getId();
    this.getUserDetails();
    this.getPost();

    this.comments = [];
    this.getComments();
  }

  getId() {
    this.activatedRoute.paramMap.subscribe((value) => {
      this.postId = value.get('id') ?? '';
    });
  }

  getUserDetails() {
    if (this.loggedIn) {
      const credentials = this.storageService.getCredentials();
      this.commentForm.setValue({
        content: this.commentForm.value.content ?? '',
        anonymous: this.commentForm.value.anonymous ?? false,
        firstName: credentials.firstName ?? '',
        lastName: credentials.lastName ?? '',
        email: credentials.email ?? '',
        phone: credentials.phoneNumber ?? '',
        saveDetails: credentials.saveDetails ?? false,
      });
    }
  }

  getPost() {
    this.isFetching = true;
    const subscription = this.postService.getPost(this.postId).subscribe({
      next: (value: any) => {
        if (!value?.data) {
          this.hasError = false;
          this.errorMessage = '';
        } else {
          this.postDetails = value.data;
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

  getComments() {
    const params: any = {
      page: this.pageComments,
      postId: this.postId,
    };

    if (this.commentStatus != null) {
      params.status = this.commentStatus;
    }

    if (this.userId != null) {
      params.userId = this.userId;
    }

    if (this.parentId != null) {
      params.parentId = this.parentId;
    }

    this.commentsService.getComments({ ...params }).subscribe({
      next: (value: any) => {
        this.comments.push(...value.data);
        console.log(value);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  refreshComments() {
    this.comments = [];
    this.pageComments = 1;
    this.getComments();
  }

  showReplies: boolean = true;
  commentStatusChange(ev: any) {
    this.commentFilter = ev.detail.value;

    switch (this.commentFilter) {
      case CommentFilterStatus.All:
        this.commentStatus = CommentVisibilityStatus.Approved;
        this.userId = null;
        this.parentId = null;
        this.showReplies = true;
        break;
      case CommentFilterStatus.MyComments:
        this.commentStatus = null;
        this.userId = this.storageService.getCredentials()?.userId;
        this.parentId = 'all';
        this.showReplies = false;
        break;
      case CommentFilterStatus.Pending:
        this.commentStatus = CommentVisibilityStatus.Pending;
        this.userId = null;
        this.parentId = 'all';
        this.showReplies = false;
        break;
      case CommentFilterStatus.Hidden:
        this.commentStatus = CommentVisibilityStatus.Hidden;
        this.userId = null;
        this.parentId = 'all';
        this.showReplies = false;
        break;
      default:
        break;
    }

    this.comments = [];
    this.pageComments = 1;
    this.getComments();
  }

  addComment() {
    if (this.isAddingComment || this.commentForm.invalid) return;

    this.isAddingComment = true;

    const formData = this.commentForm.value;
    const data = {
      content: formData.content,
      anonymous: formData.anonymous,
      postId: this.postId,
      saveOwnerDetails: !this.loggedIn && formData.saveDetails,
      owner: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      },
    };
    const subscription = this.commentsService.addComment(data).subscribe({
      next: async (value: any) => {
        if (formData.saveDetails) {
          if (!value.meta?.userSaveSuccess) {
            const alert = await this.alertCtrl.create({
              message: 'Could not save your details',
              buttons: ['Ok'],
            });
            await alert.present();
          } else {
            const userDetails = value?.meta?.userDetails;
            const alert = await this.alertCtrl.create({
              message: `Your details were saved. A new password was generated for you: ${userDetails?.password}`,
              buttons: ['Ok'],
            });
            await alert.present();

            this.storageService.setToken(userDetails.token);
            this.storageService.setCredentials(userDetails.credentials);
            this.authService.loggedIn.next(true);
          }
        }

        const toast = await this.toastCtrl.create({
          message: value.message,
          duration: 3000,
        });

        await toast.present();

        this.pageComments = 1;
        this.comments = [];
        this.getComments();

        this.commentForm.reset();

        console.log(value);
      },
      error: async (err) => {
        const toast = await this.toastCtrl.create({
          message: err.error.message ?? err.statusText,
          duration: 3000,
        });

        await toast.present();
        console.log(err);
      },
    });

    subscription.add(() => {
      this.isAddingComment = false;
    });
  }

  formatDate(value: string) {
    const date: any = new Date(value);
    const valid = value != null && !isNaN(date) && date instanceof Date;
    return valid ? date.toLocaleString() : '';
  }

  logout() {
    this.storageService.clearLoginDetails();
    this.postDetails = {};
    this.getId();
    this.getPost();
    this.pageComments = 1;
    this.comments = [];
    this.getComments();

    this.authService.loggedIn.next(false);
  }

  login() {
    this.router.navigateByUrl('/login');
  }

  // newUserDetailsCheck(value: any) {
  //   if (value?.email == null || value?.email.toString()?.trim() == '')
  //     return false;
  //   if (value?.firstName == null || value?.firstName.toString()?.trim() == '')
  //     return false;
  //   if (value?.lastName == null || value?.lastName.toString()?.trim() == '')
  //     return false;

  //   return true;
  // }
}

enum CommentFilterStatus {
  All = 0,
  MyComments = 1,
  Pending = 2,
  Hidden = 3,
}

enum CommentVisibilityStatus {
  Pending = 0,
  Approved = 1,
  Hidden = 2,
}
