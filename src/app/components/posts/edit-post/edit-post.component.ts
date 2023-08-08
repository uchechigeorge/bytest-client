import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { PostsService } from 'src/app/services/posts.service';

@Component({
  selector: 'app-edit-post',
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.scss'],
})
export class EditPostComponent implements OnInit {
  @Input() postId: string = '0';
  postDetails: any = {};
  isFetching: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';

  formGroup = new FormGroup({
    title: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?!\s*$).+/),
    ]),
    content: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?!\s*$).+/),
    ]),
    publish: new FormControl(true),
  });

  isUpdating: boolean = false;
  isUpdatingImage: boolean = false;
  constructor(
    private postsService: PostsService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.getPost();
  }

  getPost() {
    const subscription = this.postsService.getPost(this.postId).subscribe({
      next: (value: any) => {
        console.log(value);
        this.hasError = false;
        this.errorMessage = '';

        const data = value.data;
        this.formGroup.setValue({
          content: data.content,
          publish: !data.hidden,
          title: data.title,
        });
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

  edit() {
    if (this.isUpdating || this.formGroup.invalid) return;

    this.isUpdating = true;

    const subscription = this.postsService
      .updatePost(this.postId, this.formGroup.value)
      .subscribe({
        next: async (value: any) => {
          const toast = await this.toastCtrl.create({
            message: value.message,
            duration: 3000,
          });

          await toast.present();
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
  }

  editImage(ev: any) {
    if (this.isUpdatingImage) return;

    this.isUpdatingImage = true;

    var formData = new FormData(ev.currentTarget);

    const subscription = this.postsService
      .updatePostImage(this.postId, formData)
      .subscribe({
        next: async (value: any) => {
          const toast = await this.toastCtrl.create({
            message: value.message,
            duration: 3000,
          });

          await toast.present();
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
      this.isUpdatingImage = false;
    });
  }
}
