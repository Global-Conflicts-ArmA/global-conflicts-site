import {Component, ViewChild} from '@angular/core';
import {ColumnMode, DatatableComponent} from '@swimlane/ngx-datatable';

@Component({
	selector: 'app-mission-list',
	templateUrl: './mission-list.component.html',
	styleUrls: ['./mission-list.component.scss']
})
export class MissionListComponent {
	rows: any[] = [];
	temp: any[] = [];

	columns = [{prop: 'name'}, {name: 'Company'}, {name: 'Gender'}];
	@ViewChild(DatatableComponent) table: DatatableComponent;
	ColumnMode = ColumnMode;

	constructor() {
		this.fetch(data => {
			this.temp = [...data];
			this.rows = data;
		});
	}

	fetch(cb) {
		const req = new XMLHttpRequest();
		req.open('GET', `assets/data/company.json`);
		req.onload = () => {
			cb(JSON.parse(req.response));
		};
		req.send();
	}

	updateFilter(event) {
		const val = event.target.value.toLowerCase();
		// filter our data
		const temp = this.temp.filter(function (d) {
			return d.name.toLowerCase().indexOf(val) !== -1 || !val;
		});
		// update the rows
		this.rows = temp;
		// Whenever the filter changes, always go back to the first page
		this.table.offset = 0;
	}
}
