import { Component, Inject, OnInit } from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	Validators
} from '@angular/forms';
import {
	MatDialog,
	MatDialogRef,
	MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { DiscordUser } from '@app/models/discorduser';
import { IMission, IReport } from '@app/models/mission';
import { MissionsService } from '@app/services/missions.service';
import { UserService } from '@app/services/user.service';

@Component({
	selector: 'dialog-submit-bug-report',
	templateUrl: 'dialog-submit-bug-report.html'
})
export class DialogSubmitBugReportComponent implements OnInit {
	enableErrorLog = false;
	constructor(
		public dialogRef: MatDialogRef<DialogSubmitBugReportComponent>,
		@Inject(MAT_DIALOG_DATA) public mission: IMission,
		private formBuilder: FormBuilder,
		public missionsService: MissionsService,
		private userService: UserService
	) {}

	bugReportGroup: FormGroup;
	discordUser: DiscordUser | null;

	ngOnInit(): void {
		this.discordUser = this.userService.getUserLocally();
		this.bugReportGroup = this.formBuilder.group(
			{
				version: ['', [Validators.required]],
				report: ['', [Validators.required]],
				logEnabled: [''],
				log: ['']
			},
			{
				validators: [this.checkLog]
			}
		);
	}

	checkForm() {
		const report = this.bugReportGroup.get('report')?.errors;
		const version = this.bugReportGroup.get('version')?.errors;
		const logEnabled = this.bugReportGroup.get('logEnabled')?.errors;
		return [report, version, logEnabled].some((e) => e !== null);
	}

	checkLog(controlGroup: AbstractControl) {
		const enabled = controlGroup.get('logEnabled')?.value;
		if (enabled) {
			const log = controlGroup.get('log')?.value;
			if (log.length < 10) {
				controlGroup.get('logEnabled')?.setErrors({
					required: true
				});
			} else {
				controlGroup.get('logEnabled')?.setErrors(null);
			}
		} else {
			controlGroup.get('logEnabled')?.setErrors(null);
		}
	}

	getReportErrorMessages() {
		const report = this.bugReportGroup.get('report');
		if (report) {
			if (report.hasError('required')) {
				return `You must provide a report`;
			}
			return null;
		}
		return null;
	}

	getVersionErrorMessages() {
		const version = this.bugReportGroup.get('version');
		if (version) {
			if (version.hasError('required')) {
				return `You must choose a version`;
			}
			return null;
		}
		return null;
	}

	getLogErrorMessages() {
		const desc = this.bugReportGroup.get('logEnabled');
		if (desc) {
			if (desc.hasError('required')) {
				return `You must provide an error log`;
			}
			return null;
		}
		return null;
	}

	toggleErrorLog(event: { checked: boolean }) {
		this.enableErrorLog = event.checked ?? false;
	}

	buildFormData(
		formData: { append: (arg0: any, arg1: any) => void },
		data: { data: IReport; uniqueName: string } | null,
		parentKey?: string | undefined
	) {
		if (
			data &&
			typeof data === 'object' &&
			!(data instanceof Date) &&
			!(data instanceof File) &&
			!(data instanceof Blob)
		) {
			Object.keys(data).forEach((key) => {
				this.buildFormData(
					formData,
					data[key],
					parentKey ? `${parentKey}[${key}]` : key
				);
			});
		} else {
			const value = data == null ? '' : data;
			formData.append(parentKey, value);
		}
	}

	submit() {
		const report: IReport = {
			version: this.bugReportGroup.get('version')?.value,
			authorID: this.discordUser?.id ?? '',
			date: new Date(),
			report: this.bugReportGroup.get('report')?.value ?? ''
		};
		if (
			this.bugReportGroup.get('logEnabled')?.value &&
			this.bugReportGroup.get('log')?.value
		) {
			report.log = this.bugReportGroup.get('log')?.value;
		}
		console.log('report: ', report);
		const request = {
			data: report,
			uniqueName: this.mission.uniqueName
		};
		const formData: any = new FormData();
		this.buildFormData(formData, request);
		this.missionsService.submitReport(formData).subscribe(
			() => {
				console.log('upload success');
				this.dialogRef.close();
			},
			(httpError) => {
				console.log('upload error');
				this.dialogRef.close();
			}
		);
	}
}
