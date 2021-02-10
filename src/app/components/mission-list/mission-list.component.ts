import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
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
	discordUser: DiscordUser | null;
	displayedColumns: string[] = [
		'name',
		'type',
		'size.min',
		'size.max',
		'terrain',
		'era',
		'authorName',
		'version',
		'lastUpdate'
	];
	dataSource: MatTableDataSource<IMission>;
	filterGroup: FormGroup;
	userList: string[];
	terrainList: string[];

	constructor(
		public missionsService: MissionsService,
		public userService: UserService,
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
			this.userList = [];
			console.log('got value: ', value);
			value.map(async (mission: IMission) => {
				console.log('mission.authorID: ', mission.authorID);
				mission.authorName = await this.userService.getDiscordUsername(
					mission.authorID
				);
				if (!this.userList.includes(mission.authorName)) {
					this.userList.push(mission.authorName);
				}
				console.log('mission.authorName: ', mission.authorName);
				mission.updates.map(async (update: IUpdate) => {
					update.authorName = await this.userService.getDiscordUsername(
						update.authorID
					);
					if (!this.userList.includes(update.authorName)) {
						this.userList.push(update.authorName);
					}
					console.log('update.authorName: ', update.authorName);
				});
			});
			console.log('done map');
			this.userList.sort();
			this.dataSource = new MatTableDataSource<IMission>(value);
			this.rowData = this.dataSource.data;
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
		this.terrainList = [];
		Object.values(this.mC.MissionTerrains).forEach((terrain: ITerrain) => {
			this.terrainList.push(terrain.name);
		});
		this.terrainList.sort();
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

	async applyFilter(event: { target: { value: string }; value: string }) {
		this.dataSource.filterPredicate = (
			data: IMission,
			filter: string
		): boolean => {
			return (
				data.name.toLowerCase().includes(filter) ||
				data.size.min.toString().toLowerCase().includes(filter) ||
				data.size.max.toString().toLowerCase().includes(filter) ||
				data.era.toLowerCase().includes(filter) ||
				data.authorName?.toLowerCase().includes(filter) ||
				data.updates.some((update: IUpdate) => {
					return update.authorName === filter;
				}) ||
				data.version.toString().includes(filter) ||
				this.missionsService
					.getTerrainData(data.terrain)
					.name.toLowerCase()
					.includes(filter) ||
				data.type.toLowerCase().includes(filter) ||
				data.timeOfDay.toLowerCase().includes(filter) ||
				data.description.toLowerCase().includes(filter)
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
		// this.rows = this.tempRows.filter((mission) => {
		// 	return mission.paths.includes(this.selectedServerPath);
		// });
	}
}
