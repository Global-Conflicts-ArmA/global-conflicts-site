import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { MissionsService } from '../../services/missions.service';
import { IMission } from '../../models/mission';
import { DiscordUser } from '../../models/discorduser';
import { UserService } from '../../services/user.service';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelect } from '@angular/material/select';
import { MissionConstants } from '@app/constants/missionConstants';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';

@Component({
	selector: 'app-mission-list',
	templateUrl: './mission-list.component.html',
	styleUrls: ['./mission-list.component.scss']
})
export class MissionListComponent implements OnInit {
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatTable) table: MatTable<any>;
	@ViewChild(MatSort) sort: MatSort;

	rows: IMission[] = [];
	tempRows: IMission[] = [];
	timeout: any;
	columns = [{ prop: 'name' }, { name: 'Company' }, { name: 'Gender' }];
	ColumnMode = ColumnMode;
	selectedServerPath = 'mainServer/MPMissions';
	discordUser: DiscordUser | null;
	searchString = '';
	displayedColumns: string[] = [
		'name',
		'type',
		'min',
		'max',
		'terrain',
		'era',
		'author',
		'version'
	];
	dataSource: MatTableDataSource<IMission>;
	filterGroup: FormGroup;

	public keepOriginalOrder = (a, b) => a.key;
	
	constructor(
		private missionsService: MissionsService,
		private userService: UserService,
		private router: Router,
		public mC: MissionConstants,
		private formBuilder: FormBuilder
	) {}

	ngOnInit(): void {
		this.filterGroup = this.formBuilder.group({
			misType: new FormControl({ value: 'ALL' }),
			misTerrain: new FormControl({ value: 'ALL' }),
			misTime: new FormControl({ value: 'ALL' }),
			misEra: new FormControl({ value: 'ALL' }),
			misTags: new FormControl('')
		});
		this.missionsService.list().subscribe((value) => {
			console.log('collected Mission List:', value);
			this.tempRows = [...value];
			this.rows = value;
			// this.rows = this.tempRows.filter((mission) => {
			// 	return mission.paths.indexOf(this.selectedServerPath) !== -1;
			// });
			this.dataSource = new MatTableDataSource<IMission>(value);
			this.dataSource.paginator = this.paginator;
			this.dataSource.sort = this.sort;
		});
		this.discordUser = this.userService.getUserLocally();
	}

	onListChipRemoved(multiSelect: MatSelect, matChipIndex: number): void {
		const misTags = this.filterGroup.get('misTags');
		if (misTags) {
			const selectedChips = [...misTags.value];
			selectedChips.splice(matChipIndex, 1);
			misTags.patchValue(selectedChips);
			multiSelect.writeValue(selectedChips);
		}
	}
	// TODO: display whether mission is on main server, test, or archived
	// TODO: functionality of filter controls
	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.data.forEach((element) => {
			for (const key in element) {
				if (['image', 'uploadDate', 'authorID'].includes(key)) {
					element[key] = '';
				}
			}
		});
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
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
