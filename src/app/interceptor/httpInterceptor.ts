import {
	HttpErrorResponse,
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpRequest
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DialogJoinDiscordComponent } from '@app/components/home/dialog-join-discord/dialog-join-discord.component';
import { MatDialog } from '@angular/material/dialog';

export class HttpErrorInterceptor implements HttpInterceptor {
	constructor(private dialog: MatDialog) {}

	intercept(
		request: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
		return next.handle(request).pipe(
			catchError((error: HttpErrorResponse) => {
				if (error.error instanceof ErrorEvent) {
					// todo somthing
				} else {
					console.log(error);
					if(error?.error?.message === 'User not authorized.'){
						localStorage.clear();
						return next.handle(request);
					}
					if (error?.error?.message === 'Unknown Member') {
						this.dialog
							.open(DialogJoinDiscordComponent)
							.afterClosed()
							.subscribe((value) => {});
						return next.handle(request);
					}
					if (error.status === 401) {
						// todo somthing
					}
				}

				return throwError(error);
			})
		);
	}
}
