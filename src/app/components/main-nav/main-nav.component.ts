import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
	selector: 'app-main-nav',
	templateUrl: './main-nav.component.html',
	styleUrls: ['./main-nav.component.scss'],
	// tslint:disable-next-line:use-component-view-encapsulation
	encapsulation: ViewEncapsulation.None
})
export class MainNavComponent implements OnInit {
	constructor(
		private breakpointObserver: BreakpointObserver,
		private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer,
		private router: Router,
		public userService: UserService
	) {
		this.matIconRegistry.addSvgIcon(
			'discord',
			this.domSanitizer.bypassSecurityTrustResourceUrl(
				'../../assets/Discord-Logo-Color.svg'
			)
		);
	}



	isHandset$: Observable<boolean> = this.breakpointObserver
		.observe('(max-width: 959.99px)')
		.pipe(
			map((result) => {
				return result.matches;
			}),
			shareReplay()
		);

	ngOnInit(): void {
		console.log(this.userService);

	}

	logout() {
		this.userService.logout();
	}

	openMissionList() {
		this.router.navigate([`mission-list`]);
	}

	openUploadForm() {
		this.router.navigate([`mission-upload`]);
	}

	getDiscordHref() {
		if (environment.production) {
			return 'https://discord.com/api/oauth2/authorize?client_id=731266255306227813&redirect_uri=https%3A%2F%2Fglobalconflicts.net%2Fapi%2Fauth%2Fcallback&response_type=code&scope=identify%20guilds';
		} else {
			return 'https://discord.com/api/oauth2/authorize?client_id=731266255306227813&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Fapi%2Fauth%2Fcallback&response_type=code&scope=identify%20guilds';
		}
	}
}
