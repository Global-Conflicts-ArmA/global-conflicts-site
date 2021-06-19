import { Injectable } from '@angular/core';
import {
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserService } from '@app/services/user.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
	constructor(public userService: UserService) {}

	intercept(
		request: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
		request = request.clone({
			setHeaders: {
				token: ` ${this.userService.getToken()}`
			}
		});
		return next.handle(request);
	}
}
