import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.login();
  }

  login() {
    this.authService.sessionsLogin().subscribe({
      next: () => {
        this.authService.loggedIn.next(true);
      },
      error: () => {
        this.authService.loggedIn.next(false);
      },
    });
  }
}
