import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { PostsService } from 'src/app/services/posts.service';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.scss'],
})
export class AddPostComponent implements OnInit {
  formGroup = new FormGroup({
    title: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?!\s*$).+/),
    ]),
    content: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?!\s*$).+/),
    ]),
    image: new FormControl(),
    publish: new FormControl(true),
  });

  isAdding: boolean = false;

  constructor(
    private postsService: PostsService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {}

  add(ev: any) {
    ev.preventDefault();
    if (this.isAdding || this.formGroup.invalid) return;

    this.isAdding = true;
    const imageFile = new FormData(ev.currentTarget).get('image');
    const formData = new FormData();
    for (var key in this.formGroup.value) {
      formData.append(key, (this.formGroup.value as any)[key]);
    }
    formData.append('image', imageFile ?? '');

    console.log({ imageFile });

    const subscription = this.postsService.addPost(formData).subscribe({
      next: async (value: any) => {
        const toast = await this.toastCtrl.create({
          message: value.message,
          duration: 3000,
        });

        await toast.present();
        this.formGroup.reset();
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
      this.isAdding = false;
    });
  }
}
