import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogActionsComponent } from '@app/components/mission-details/dialog-actions/dialog-actions.component';

@Component({
	selector: 'app-dialog-view-gm-notes',
	templateUrl: './dialog-view-gm-notes.component.html',
	styleUrls: ['./dialog-view-gm-notes.component.scss']
})
export class DialogViewGmNotesComponent implements OnInit {
	constructor(
		public dialogRef: MatDialogRef<DialogActionsComponent>,
		@Inject(MAT_DIALOG_DATA)
		public gmNote: string
	) {}

	ngOnInit(): void {}
}
