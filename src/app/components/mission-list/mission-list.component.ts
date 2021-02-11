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
		'lastUpdate',
		'uploadDate'
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
			misSearch: new FormControl(''),
			misState: new FormControl(''),
			misAuthor: new FormControl(''),
			misType: new FormControl(''),
			misTerrain: new FormControl(''),
			misTime: new FormControl(''),
			misEra: new FormControl(''),
			misTags: new FormControl('')
		});
		['misState', 'misAuthor', 'misType', 'misTerrain', 'misTime', 'misEra'].forEach(
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
			this.applyFilter();
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

	async applyFilter() {
		let filteredData = this.rowData;
		// State
		const state: string = this.filterGroup.get('misState')?.value;
		console.log('state selected: ', state);
		if (state && state !== 'ALL') {
			console.log('state selected: ', state);
			switch (state) {
				case 'MAIN':
					filteredData = filteredData.filter((element: IMission) => {
						return element.updates.some((u) => {
							return u.main ?? false;
						});
					});
					break;
				case 'TEST':
					filteredData = filteredData.filter((element: IMission) => {
						return element.updates.some((u) => {
							return u.test ?? false;
						});
					});
					break;
				case 'READY':
					filteredData = filteredData.filter((element: IMission) => {
						return element.updates.some((u) => {
							return u.ready ?? false;
						});
					});
					break;
				case 'ARCHIVE':
					filteredData = filteredData.filter((element: IMission) => {
						return element.updates.some((u) => {
							return u.archive ?? false;
						});
					});
					break;
				default:
					break;
			}
		}
		// Author
		const author: string = this.filterGroup.get('misAuthor')?.value;
		if (author && author !== 'ALL') {
			console.log('author selected: ', author);
			filteredData = filteredData.filter((element: IMission) => {
				return element.authorName === author;
			});
		}
		// Type
		const type: string = this.filterGroup.get('misType')?.value;
		if (type && type !== 'ALL') {
			console.log('type selected: ', type);
			filteredData = filteredData.filter((element: IMission) => {
				return element.type === type;
			});
		}
		// Terrain
		const terrain: string = this.filterGroup.get('misTerrain')?.value;
		if (terrain && terrain !== 'ALL') {
			console.log('terrain selected: ', terrain);
			filteredData = filteredData.filter((element: IMission) => {
				return (
					this.missionsService.getTerrainData(element.terrain)
						?.name === terrain
				);
			});
		}
		// Time
		const time: string = this.filterGroup.get('misTime')?.value;
		if (time && time !== 'ALL') {
			console.log('time selected: ', time);
			filteredData = filteredData.filter((element: IMission) => {
				return element.timeOfDay === time;
			});
		}
		// Era
		const era: string = this.filterGroup.get('misEra')?.value;
		if (era && era !== 'ALL') {
			console.log('era selected: ', era);
			filteredData = filteredData.filter((element: IMission) => {
				return element.era === era;
			});
		}
		// Tags
		const tagsSelected: string[] = this.filterGroup.get('misTags')?.value;
		if (tagsSelected && tagsSelected.length !== 0) {
			console.log('tagsSelected: ', tagsSelected);
			filteredData = filteredData.filter((element: IMission) => {
				return tagsSelected.every((tag: string) => {
					return element.tags.includes(tag);
				});
			});
		}
		// Search
		const searchFilter: string = this.filterGroup.get('misSearch')?.value?.toLowerCase();
		if (searchFilter && searchFilter !== '') {
			console.log('searchFilter: ', searchFilter);
			filteredData = filteredData.filter((element: IMission) => {
				return (
					element.name.toLowerCase().includes(searchFilter) ||
					element.size.min
						.toString()
						.toLowerCase()
						.includes(searchFilter) ||
					element.size.max
						.toString()
						.toLowerCase()
						.includes(searchFilter) ||
					element.era.toLowerCase().includes(searchFilter) ||
					element.authorName?.toLowerCase().includes(searchFilter) ||
					element.updates.some((update: IUpdate) => {
						return update.authorName === searchFilter;
					}) ||
					element.version.toString().includes(searchFilter) ||
					this.missionsService
						.getTerrainData(element.terrain)
						.name.toLowerCase()
						.includes(searchFilter) ||
					element.type.toLowerCase().includes(searchFilter) ||
					element.timeOfDay.toLowerCase().includes(searchFilter) ||
					element.description.toLowerCase().includes(searchFilter)
				);
			});
		}
		// Assign changes
		this.dataSource.data = filteredData;
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
