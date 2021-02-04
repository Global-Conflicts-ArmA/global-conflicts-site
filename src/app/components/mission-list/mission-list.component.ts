import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { MissionsService } from '../../services/missions.service';
import { IMission } from '../../models/mission';
import { DiscordUser } from '../../models/discorduser';
import { UserService } from '../../services/user.service';
import { MatTableDataSource, MatRow } from '@angular/material/table';

@Component({
	selector: 'app-mission-list',
	templateUrl: './mission-list.component.html',
	styleUrls: ['./mission-list.component.scss']
})
export class MissionListComponent implements OnInit {
	@ViewChild('myTable') table: any;
	rows: IMission[] = [];
	tempRows: IMission[] = [];
	timeout: any;
	columns = [{ prop: 'name' }, { name: 'Company' }, { name: 'Gender' }];
	ColumnMode = ColumnMode;
	selectedServerPath = 'mainServer/MPMissions';
	discordUser: DiscordUser | null;
	searchString = '';
	displayedColumns: string[] = ['name', 'version'];
	dataSource = new MatTableDataSource<IMission>([]);

	constructor(
		private missionsService: MissionsService,
		private userService: UserService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.missionsService.list().subscribe((value) => {
			console.log('collected Mission List:', value);
			this.tempRows = [...value];
			this.rows = value;
			// this.rows = this.tempRows.filter((mission) => {
			// 	return mission.paths.indexOf(this.selectedServerPath) !== -1;
			// });
			this.dataSource = new MatTableDataSource<IMission>(value);
		});
		this.discordUser = this.userService.getUserLocally();
	}

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();
	}

	onActivate(row: IMission) {
		console.log('got click event for:', row.name);
		this.router.navigate([`/mission-details/${row.uniqueName}`]);
	}

	onSelectedServerPathChange(event) {
		this.searchString = '';
		// this.rows = this.tempRows.filter((mission) => {
		// 	return mission.paths.includes(this.selectedServerPath);
		// });
	}
}
