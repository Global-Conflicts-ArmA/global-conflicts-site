import {Component, OnInit, ViewChild} from '@angular/core';
import {ColumnMode} from '@swimlane/ngx-datatable';
import {MissionsService} from '../../services/missions.service';
import {Mission} from '../../models/mission';
import {DiscordUser} from '../../models/discorduser';
import {UserService} from '../../services/user.service';

@Component({
	selector: 'app-mission-list',
	templateUrl: './mission-list.component.html',
	styleUrls: ['./mission-list.component.scss']
})
export class MissionListComponent implements OnInit {
	@ViewChild('myTable') table: any;
	rows: Mission[] = [];
	tempRows: Mission[] = [];
	timeout: any;
	columns = [{prop: 'name'}, {name: 'Company'}, {name: 'Gender'}];
	ColumnMode = ColumnMode;
	selectedServerPath = 'mainServer/MPMissions';
	discordUser: DiscordUser | null;
	searchString = "";

	constructor(private missionsService: MissionsService, private userService: UserService) {
	}

	ngOnInit(): void {
		this.missionsService.list().subscribe(value => {
			this.tempRows = [...value];
			this.rows = value;
			this.rows = this.tempRows.filter(mission => {
				return mission.paths.indexOf(this.selectedServerPath) !== -1;
			});
		});
		this.discordUser = this.userService.getUserLocally();
	}


	onActivate(event) {
		if (event.cellIndex === 8) {
			this.table.rowDetail.toggleExpandRow(event.row);
		}
	}

	onSelectedServerPathChange(event) {
		this.searchString = '';
		this.rows = this.tempRows.filter(mission => {
			return mission.paths.indexOf(this.selectedServerPath) !== -1;
		});
	}

	updateFilter(event) {
		this.rows = this.tempRows.filter(mission => {
			return this.containsString(mission, this.searchString) || !this.searchString;
		});
	}


	containsString(mission: Mission, search: string) {

		search = search.toLowerCase();
		return (mission.name.toLowerCase().indexOf(search) !== -1 ||
			mission.author.toLowerCase().indexOf(search) !== -1 ||
			mission.type.toLowerCase().indexOf(search) !== -1 ||
			mission.terrain.toLowerCase().indexOf(search) !== -1 ||
			mission.description.toLowerCase().indexOf(search) !== -1 ||
			mission.version.toString().toLowerCase().indexOf(search) !== -1) && mission.paths.indexOf(this.selectedServerPath) !== -1;
	}
}
