import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  formGroup = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?!\s*$).+/),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?!\s*$).+/),
    ]),
  });

  formSubmiting = false;
  constructor(
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {}

  login() {
    if (this.formGroup.invalid || this.formSubmiting) return;

    this.formSubmiting = true;

    const subscription = this.authService
      .login(this.formGroup.value)
      .subscribe({
        next: async (value: any) => {
          const toast = await this.toastCtrl.create({
            duration: 3000,
            message: 'Successful',
          });
          await toast.present();

          this.storageService.setToken(value.data.token);
          this.storageService.setCredentials(value.data.credentials);

          this.authService.loggedIn.next(true);
          this.router.navigateByUrl('/posts');
        },
        error: async (err) => {
          const toast = await this.toastCtrl.create({
            duration: 3000,
            message: err.error.message,
          });
          toast.present();
        },
      });

    subscription.add(() => {
      this.formSubmiting = false;
    });
  }

  goToSignup() {
    this.router.navigateByUrl('/signup');
  }
}
