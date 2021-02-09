import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { MissionsService } from '../../services/missions.service';
import { IMission, IUpdate } from '../../models/mission';
import { DiscordUser } from '../../models/discorduser';
import { UserService } from '../../services/user.service';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelect } from '@angular/material/select';
import { MissionConstants, ITerrain } from '@app/constants/missionConstants';
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

	rowData: IMission[] = [];
	timeout: any;
	columns = [{ prop: 'name' }, { name: 'Company' }, { name: 'Gender' }];
	ColumnMode = ColumnMode;
	selectedServerPath = 'mainServer/MPMissions';
	discordUser: DiscordUser | null;
	searchString = '';
	displayedColumns: string[] = [
		'name',
		'type',
		'size.min',
		'size.max',
		'terrain',
		'era',
		'author',
		'version'
	];
	dataSource: MatTableDataSource<IMission>;
	filterGroup: FormGroup;
	userList: any[];
	terrainList: string[];

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
			misAuthor: new FormControl({ value: 'ALL' }),
			misType: new FormControl({ value: 'ALL' }),
			misTerrain: new FormControl({ value: 'ALL' }),
			misTime: new FormControl({ value: 'ALL' }),
			misEra: new FormControl({ value: 'ALL' }),
			misTags: new FormControl()
		});
		['misAuthor', 'misType', 'misTerrain', 'misTime', 'misEra'].forEach(
			(element) => {
				this.filterGroup.get(element)?.setValue('ALL');
			}
		);
		this.missionsService.list().subscribe((value) => {
			console.log('collected Mission List:', value);
			this.dataSource = new MatTableDataSource<IMission>(value);
			this.rowData = this.dataSource.data;
			console.log('rowData: ', this.rowData);

			this.dataSource.paginator = this.paginator;
			this.dataSource.sortingDataAccessor = (item, property) => {
				switch (property) {
					case 'size.min':
						return item.size.min;
					case 'size.max':
						return item.size.max;
					default:
						return item[property];
				}
			};
			this.dataSource.sort = this.sort;
		});
		this.discordUser = this.userService.getUserLocally();
		this.userService.list().subscribe((value) => {
			this.userList = value;
		});
		this.terrainList = [];
		Object.values(this.mC.MissionTerrains).forEach(
			(terrain: ITerrain) => {
				this.terrainList.push(terrain.name);
			}
		);
		this.terrainList.sort();
		console.log('terrains: ', this.terrainList);
	}

	getTerrainData(terrainName: string) {
		return this.mC.MissionTerrains[terrainName];
	}

	getDiscordUserName(discordID: string) {
		const user: DiscordUser = this.userList.find(
			(element: DiscordUser) => element.id === discordID
		);
		return user?.username ?? '';
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
	applyFilterTags() {
		const tagsSelected: string[] = this.filterGroup.get('misTags')?.value;
		console.log('tagsSelected: ', tagsSelected);
		if (tagsSelected.length === 0) {
			this.dataSource.data = this.rowData;
		} else {
			this.dataSource.data = this.rowData.filter((element: IMission) => {
				return tagsSelected.every((tag: string) => {
					return element.tags.includes(tag);
				});
			});
		}
	}

	applyFilter(event: { target: { value: string }; value: string }) {
		this.dataSource.filterPredicate = (
			data: IMission,
			filter: string
		): boolean => {
			return (
				data.name.toLowerCase().includes(filter) ||
				data.size.min.toString().toLowerCase().includes(filter) ||
				data.size.max.toString().toLowerCase().includes(filter) ||
				data.era.toLowerCase().includes(filter) ||
				data.author.toLowerCase().includes(filter) ||
				data.updates.some(
					(update: IUpdate) =>
						this.getDiscordUserName(update.authorID) === filter
				) ||
				data.version.toString().includes(filter) ||
				this.getTerrainData(data.terrain)
					.name.toLowerCase()
					.includes(filter) ||
				data.type.toLowerCase().includes(filter) ||
				data.timeOfDay.toLowerCase().includes(filter)
			);
		};
		let filterValue: string = event.target
			? event.target.value
			: event.value;
		if (filterValue === 'ALL') {
			filterValue = '';
		}
		console.log('filterValue: ', filterValue);
		this.dataSource.filter = filterValue.trim().toLowerCase();
		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

	onActivate(row: IMission) {
		console.log('got click event for:', row.name);
		this.router.navigate([`/mission-details/${row.uniqueName}`]);
	}

	// TODO: display whether mission is on main server, test, or archived
	onSelectedServerPathChange(event) {
		this.searchString = '';
		// this.rows = this.tempRows.filter((mission) => {
		// 	return mission.paths.includes(this.selectedServerPath);
		// });
	}
}
