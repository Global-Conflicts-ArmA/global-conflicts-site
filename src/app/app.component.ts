import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from './services/user.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html'
})
export class AppComponent {
	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private userService: UserService,
		private cookieService: CookieService
	) {}
}
