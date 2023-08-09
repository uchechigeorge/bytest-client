import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { CommentsService } from 'src/app/services/comments.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
})
export class CommentComponent implements OnInit {
  // @Input() loaded: boolean = false;
  @Input() commentId: string = '';
  @Input() postId: string = '';
  @Input() hasReply = false;
  @Input() content: string = '';
  @Input() name: string = '';
  @Input() imageUrl: string = '';
  @Input() noOfReplies: number = 0;
  @Input() children: any[] = [];
  @Input() edited: boolean = false;
  @Input() isOwner: boolean = false;
  @Input() isPostOwner: boolean = false;
  @Input() showReplyBtn: boolean = true;
  @Input() filters: {
    parentId?: string | null;
    userId?: string | null;
    status?: number | null;
  } = {};

  @Output() refresh = new EventEmitter<any>();

  // formControl = new FormControl('');
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

  showForm: boolean = false;
  isAddingReply: boolean = false;

  fetchingChildren: boolean = false;
  showReply: boolean = false;
  page: number = 1;

  isUpdating: boolean = false;

  loggedIn: boolean = false;
  constructor(
    private commentsService: CommentsService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private authService: AuthService,
    private storageService: StorageService
  ) {
    this.authService.loggedIn.subscribe((value) => {
      this.loggedIn = value;

      if (value) {
        const credentials = this.storageService.getCredentials();
        const formValue = this.commentForm.value;
        this.commentForm.setValue({
          content: formValue.content ?? '',
          anonymous: formValue.anonymous ?? false,
          saveDetails: formValue.saveDetails ?? false,
          firstName: credentials.firstName ?? '',
          lastName: credentials.lastName ?? '',
          email: credentials.email ?? '',
          phone: credentials.phoneNumber ?? '',
        });
      }
    });
  }

  ngOnInit() {}

  viewReplies() {
    this.showReply = !this.showReply;

    if (
      this.showReply &&
      this.children.length < 1 &&
      this.hasReply &&
      this.showReplyBtn
    ) {
      this.fetchChildren();
    }
  }

  fetchChildren() {
    if (this.fetchingChildren) return;
    this.fetchingChildren = true;

    const params: any = {
      parentId: this.commentId,
      postId: this.postId,
      page: this.page,
    };

    if (this.filters.status) {
      params.status = this.filters.status;
    }

    const subscription = this.commentsService
      .getComments({ ...params })
      .subscribe({
        next: (value: any) => {
          this.children.push(...value.data);
          console.log(value);
        },
        error: (err) => {
          console.log(err);
        },
      });

    subscription.add(() => {
      this.fetchingChildren = false;
    });
  }

  // async addReplyBtnClick() {
  //   if (!this.loggedIn) {
  //     const alert = await this.alertCtrl.create({
  //       subHeader: 'Leave a Comment',
  //       message:
  //         'You are not logged in. To leave a comment, provide the following details',
  //       inputs: [
  //         { placeholder: 'First name', name: 'firstName' },
  //         { placeholder: 'Last name', name: 'lastName' },
  //         { placeholder: 'Email', name: 'email' },
  //         { placeholder: 'Phone number', name: 'phone' },
  //       ],
  //       buttons: [
  //         { text: 'Cancel' },
  //         {
  //           text: 'Proceed',
  //           handler: (value) => {
  //             const valid = this.newUserDetailsCheck(value);
  //             if (!valid) return false;

  //             const details = {
  //               saveOwnerDetails: false,
  //               owner: value,
  //             };

  //             this.addReply(details);
  //             console.log(value);
  //             return true;
  //           },
  //         },
  //         {
  //           text: 'Proceed & Sign up',
  //           handler: (value) => {
  //             const valid = this.newUserDetailsCheck(value);
  //             if (!valid) return false;

  //             const details = {
  //               saveOwnerDetails: true,
  //               owner: value,
  //             };

  //             this.addReply(details);
  //             console.log(value);
  //             return true;
  //           },
  //         },
  //       ],
  //     });

  //     await alert.present();
  //   } else {
  //     this.addReply();
  //   }
  // }

  addReply(extraDetails?: any) {
    if (this.isAddingReply || this.commentForm.invalid) return;

    this.isAddingReply = true;
    const subscription = this.commentsService
      .addComment({
        ...this.commentForm.value,
        postId: this.postId,
        parentId: this.commentId,
        ...extraDetails,
      })
      .subscribe({
        next: (value: any) => {
          this.page = 1;
          this.children = [];
          this.fetchChildren();

          this.commentForm.get('content')?.reset();
          this.showForm = false;
          this.showReply = true;
          if (value?.meta?.total) {
            this.noOfReplies = value?.meta?.total;
          }
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
      this.isAddingReply = false;
    });
  }

  approveReply() {
    if (this.isUpdating) return;
    this.isUpdating = true;

    const subscription = this.commentsService
      .updateCommentStatus(this.commentId, { status: 1 })
      .subscribe({
        next: (value: any) => {
          this.refresh.emit();
          console.log(value);
        },
        error: (err) => {
          console.log(err);
        },
      });
    subscription.add(() => {
      this.isUpdating = false;
    });
  }

  hideReply() {
    if (this.isUpdating) return;
    this.isUpdating = true;
    const subscription = this.commentsService
      .updateCommentStatus(this.commentId, { status: 2 })
      .subscribe({
        next: (value: any) => {
          this.refresh.emit();
          console.log(value);
        },
        error: (err) => {
          console.log(err);
        },
      });

    subscription.add(() => {
      this.isUpdating = false;
    });
  }

  async editReply() {
    if (this.isUpdating) return;

    const alert = await this.alertCtrl.create({
      header: 'Edit Comment',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Ok',
          handler: (value) => {
            console.log(value);

            const subscription = this.commentsService
              .updateComment(this.commentId, { content: value.content })
              .subscribe({
                next: async (value: any) => {
                  const toast = await this.toastCtrl.create({
                    message: value.message,
                    duration: 3000,
                  });
                  await toast.present();

                  this.refresh.emit();
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
              this.isUpdating = false;
            });
          },
        },
      ],
      inputs: [
        {
          label: 'Content',
          value: this.content,
          name: 'content',
          placeholder: 'Type in new comment ...',
        },
      ],
    });

    await alert.present();
  }

  async deleteReply() {
    if (this.isUpdating) return;

    const alert = await this.alertCtrl.create({
      message: 'Are you sure you want to delete this comment?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Go Ahead',
          handler: () => {
            const subscription = this.commentsService
              .deleteComment(this.commentId)
              .subscribe({
                next: async (value: any) => {
                  const toast = await this.toastCtrl.create({
                    message: value.message,
                    duration: 3000,
                  });
                  await toast.present();

                  this.refresh.emit();
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
              this.isUpdating = false;
            });
          },
        },
      ],
    });

    await alert.present();
  }

  newUserDetailsCheck(value: any) {
    if (value?.email == null || value?.email.toString()?.trim() == '')
      return false;
    if (value?.firstName == null || value?.firstName.toString()?.trim() == '')
      return false;
    if (value?.lastName == null || value?.lastName.toString()?.trim() == '')
      return false;

    return true;
  }
}
