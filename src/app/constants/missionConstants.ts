export interface IMissionType {
	title: string;
	str?: string;
	ratio?: boolean;
}

export interface ITerrain {
	class: string;
	name: string;
	winter?: boolean;
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
		MCN_Aliabad: {
			class: 'MCN_Aliabad',
			name: 'Aliabad Region'
		},
		Altis: {
			class: 'Altis',
			name: 'Altis'
		},
		tem_anizay: {
			class: 'tem_anizay',
			name: 'Anizay'
		},
		Woodland_ACR: {
			class: 'Woodland_ACR',
			name: 'Bystrica'
		},
		mbg_celle2: {
			class: 'mbg_celle2',
			name: 'Celle 2'
		},
		chernarus: {
			class: 'chernarus',
			name: 'Chernarus (Autumn)'
		},
		Chernarus_Winter: {
			class: 'Chernarus_Winter',
			name: 'Chernarus (Winter)'
		},
		Desert_E: {
			class: 'Desert_E',
			name: 'Desert'
		},
		MCN_HazarKot: {
			class: 'MCN_HazarKot',
			name: 'Hazar-Kot Valley'
		},
		hellanmaa: {
			class: 'hellanmaa',
			name: 'Hellanmaa'
		},
		hellanmaaw: {
			class: 'hellanmaaw',
			name: 'Hellanmaa Winter'
		},
		tem_ihantalaww: {
			class: 'tem_ihantalaww',
			name: 'Ihantala'
		},
		tem_ihantalawww: {
			class: 'tem_ihantalawww',
			name: 'Ihantala Winter'
		},
		swu_kokoda_map: {
			class: 'swu_kokoda_map',
			name: 'Kokoda Trail'
		},
		Khoramshahr: {
			class: 'Khoramshahr',
			name: 'Khoramshahr'
		},
		tem_kujari: {
			class: 'tem_kujari',
			name: 'Kujari'
		},
		CUP_Kunduz: {
			class: 'CUP_Kunduz',
			name: 'Kunduz, Afghanistan'
		},
		Enoch: {
			class: 'Enoch',
			name: 'Livonia'
		},
		Malden: {
			class: 'Malden',
			name: 'Malden 2035'
		},
		rof_mok: {
			class: 'rof_mok',
			name: 'Mull of Kintyre, Scotland'
		},
		opx_tac: {
			class: 'opx_tac',
			name: 'OPX MOUT Training Facility'
		},
		FDF_Isle1_a: {
			class: 'FDF_Isle1_a',
			name: 'Podagorsk'
		},
		rhspkl: {
			class: 'rhspkl',
			name: 'Prei Khmaoch Luong'
		},
		ProvingGrounds_PMC: {
			class: 'ProvingGrounds_PMC',
			name: 'Proving Grounds'
		},
		Shapur_BAF: {
			class: 'Shapur_BAF',
			name: 'Shapur'
		},
		Stratis: {
			class: 'Stratis',
			name: 'Stratis'
		},
		tem_summaw: {
			class: 'tem_summaw',
			name: 'Summa Winter'
		},
		tem_summas: {
			class: 'tem_summas',
			name: 'Summa'
		},
		WL_Rosche: {
			class: 'WL_Rosche',
			name: 'Rosche, Germany'
		},
		Tanoa: {
			class: 'Tanoa',
			name: 'Tanoa'
		},
		fow_map_tarawa: {
			class: 'fow_map_tarawa',
			name: 'Tarawa Betio'
		},
		tem_vinjesvingenc: {
			class: 'tem_vinjesvingenc',
			name: 'Vinjesvingen'
		},
		vt7: {
			class: 'vt7',
			name: 'Virolahti'
		},
		VR: {
			class: 'VR',
			name: 'Virtual Reality'
		}
	};
}
