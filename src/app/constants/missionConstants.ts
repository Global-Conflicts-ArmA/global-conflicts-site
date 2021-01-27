export class MissionConstants {

	MissionTypes: object[] = [
		{
			title: 'COOP',
			str: 'CO'
		},
		{
			title: 'TVT',
			ratio: true,
		},
		{
			title: 'COTVT',
			ratio: true,
		},
		{
			title: 'LOL'
		},
		{
			title: 'Training',
			str: 'TRN',
		},
	]

	MissionTags: string[] = [
		"Defence",
		"Attack",
		"Meeting Engagement",
		"Tanks",
		"Helicopter",
		"Fixed Wing",
		"Boats",
		"Mechanized",
		"Motorized",
		"Infantry",
		"WAC",
		"Urban Ops",
		"Seeder",
		"Zeus",
		"Hostage Rescue",
		"HVT",
		"Convoy",
		"Escort",
		"Mines",
		"Sabotage",
		"Raid",
		"Combined Arms",
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

	MissionTimes: string[] = [
		"Dawn",
		"Day",
		"Dusk",
		"Night",
		"Custom",
	]

	MissionTerrains = {
		CUP_Chernarus_A3: {
			class: 'CUP_Chernarus_A3',
			name: 'Chernarus 2020',
		},
		MCN_HazarKot: {
			class: 'MCN_HazarKot',
			name: 'Hazar Kot',
		},
		chernarus: {
			class: 'chernarus',
			name: 'Chernarus Autumn',
		},
	}

}
