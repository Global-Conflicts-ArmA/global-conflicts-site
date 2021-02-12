import { Component, Inject } from '@angular/core';
import {
	MatDialog,
	MatDialogRef,
	MAT_DIALOG_DATA
} from '@angular/material/dialog';

export interface DialogData {
	name: string;
	text: string;
  }

@Component({
	selector: 'dialog-view-update',
	templateUrl: 'dialog-view-update.html'
})
export class DialogViewUpdateComponent {

	name: string;
	text: string;

	constructor(
		public dialogRef: MatDialogRef<DialogViewUpdateComponent>,
		@Inject(MAT_DIALOG_DATA) public data: DialogData
	) {}
}
