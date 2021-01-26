export class MissionConstants {

	MissionTypes: object[] = [
		{
			title: 'COOP',
			str: 'CO'
		},
		{
			title: 'LOL',
			ratio: true,
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
			title: 'TRAINING',
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
	];

	MissionTimes: string[] = [
		"Dawn",
		"Day",
		"Dusk",
		"Night",
		"Custom",
	]

}
