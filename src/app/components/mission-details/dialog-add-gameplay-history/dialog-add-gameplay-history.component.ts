import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MissionsService } from '@app/services/missions.service';

import { IMission, IUpdate } from '@app/models/mission';
import { DialogActionsComponent } from '@app/components/mission-details/dialog-actions/dialog-actions.component';
import { UserService } from '@app/services/user.service';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { DiscordUser } from '@app/models/discordUser';
import { Editor } from 'ngx-editor';

@Component({
	selector: 'app-dialog-add-gameplay-history',
	templateUrl: './dialog-add-gameplay-history.component.html',
	styleUrls: ['./dialog-add-gameplay-history.component.scss']
})
export class DialogAddGameplayHistoryComponent implements OnInit, OnDestroy  {
	constructor(
		public dialogRef: MatDialogRef<DialogActionsComponent>,
		public missionsService: MissionsService,
		public userService: UserService,
		@Inject(MAT_DIALOG_DATA)
		public data: {
			discordUser: DiscordUser;
			mission: IMission;
			update: IUpdate;
		}
	) {}

	userListControl = new FormControl();

	filteredOptions: Observable<DiscordUser[]>;

	editor: Editor;
	html: '';


	public discordUsers: DiscordUser[] = [];
	public selectedLeaders: Set<DiscordUser> = new Set();


	getOptionText(option) {
		return option?.displayName ?? '';
	}

	private _filter(value: string | DiscordUser): DiscordUser[] {
		if (typeof value !== 'string') {
			return [value];
		}
		const filterValue = value.toLowerCase();
		return this.discordUsers.filter(
			(option) =>
				option.displayName?.toLowerCase().indexOf(filterValue) === 0
		);
	}

	ngOnDestroy(): void {
		this.editor.destroy();
	}

	ngOnInit(): void {
		this.editor = new Editor();
		this.filteredOptions = this.userListControl.valueChanges.pipe(
			startWith(''),
			map((value) => this._filter(value))
		);

		this.userService.listDiscordUsers().subscribe((value) => {
			this.discordUsers = value;
		});
	}

	onLeaderSelected(option: any) {
		this.userListControl.setValue('');
		this.selectedLeaders.add(option.value);
	}

	removeLeader(leader: DiscordUser) {
		this.selectedLeaders.delete(leader);
	}

	onSideSelected(option, leader) {
		console.log(option);
		console.log(leader);
	}

	submitGameplayHistory() {

	}
}
