import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class SharedService {
	constructor(
		private httpClient: HttpClient
	) {}

	public bytesToSize(bytes: number) {
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		if (bytes === 0) {
			return '0 Byte';
		}
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
	}

	public padZeros(count: number, size = 2) {
		let stringCount = count.toString();
		while (stringCount.length < size) {
			stringCount = '0' + stringCount;
		}
		return stringCount;
	}
}
