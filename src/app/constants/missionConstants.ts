export interface IMissionType {
	title: string;
	str?: string;
	ratio?: boolean;
}

export class MissionConstants {
	MissionTypes: IMissionType[] = [
		{
			title: 'COOP',
			str: 'CO'
		},
		{
			title: 'TVT',
			ratio: true
		},
		{
			title: 'COTVT',
			ratio: true
		},
		{
			title: 'LOL'
		},
		{
			title: 'Training',
			str: 'TRN'
		}
	];

	MissionTags: string[] = [
		'Attack',
		'Boats',
		'Combined Arms',
		'Convoy',
		'Defence',
		'Escort',
		'Fixed Wing',
		'HVT',
		'Helicopter',
		'Hostage Rescue',
		'Infantry',
		'Mechanized',
		'Meeting Engagement',
		'Mines',
		'Motorized',
		'Raid',
		'Sabotage',
		'Seeder',
		'Tanks',
		'Urban Ops',
		'WAC',
		'Zeus'
	];

	MissionEras: string[] = [
		'World War 2',
		'1950s',
		'1960s',
		'1970s',
		'1980s',
		'1990s',
		'2000s',
		'2010s',
		'2020s',
		'2030s',
		'Other'
	];

	MissionTimes: string[] = ['Dawn', 'Day', 'Dusk', 'Night', 'Custom'];

	MissionTerrains = {
		cup_chernarus_A3: {
			class: 'cup_chernarus_A3',
			name: 'Chernarus 2020'
		},
		MCN_HazarKot: {
			class: 'MCN_HazarKot',
			name: 'Hazar Kot'
		},
		chernarus: {
			class: 'chernarus',
			name: 'Chernarus Autumn'
		}
	};
}
