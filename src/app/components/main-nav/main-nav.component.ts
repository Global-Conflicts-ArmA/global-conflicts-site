import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {UserService} from '../../services/user.service';
import {DiscordUser} from '../../models/discorduser';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';


@Component({
  selector: 'main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class MainNavComponent implements OnInit {

	constructor(
		private breakpointObserver: BreakpointObserver,
		private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer,
		private userService: UserService
	) {
		this.matIconRegistry.addSvgIcon(
      "discord",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/Discord-Logo-Color.svg")
    );
	}

	discordUser: DiscordUser | null;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe('(max-width: 959.99px)')
    .pipe(
      map(result => {
				return result.matches
			}),
      shareReplay()
    )

		ngOnInit(): void {
			this.discordUser = this.userService.getUserLocally();
		}

		logout() {
			this.userService.logout();
		}
}
