export const brand = {
	identity: {
		name: 'Moda Organica',
		logo: '/logos/moda-organica-logo.svg',
		colors: {
			primary: '#E1AEC1',
			secondary: '#2C2C2C',
			background: '#181818',
			text: '#FFFFFF',
			accent: '#DDAF3B',
			primary_content: '#181818'
		},
		fonts: {
			headings: 'Playfair Display',
			body: 'Lato'
		}
	},
	businessRules: {
		shipping: {
			localZones: ['chiantla', 'huehuetenango'],
			costs: {
				local: 0.00,
				national: 36.00
			},
			nationalProvider: 'Cargo Expreso',
			methods: {
				local: {
					id: 'local',
					name: 'Entrega Local',
					description: 'Entrega personal en Huehuetenango o Chiantla - GRATIS',
					estimatedDays: '1-2 dias habiles',
					cost: 0.00,
					requiresCourier: false,
					isFree: true
				},
				cargoExpreso: {
					id: 'cargo_expreso',
					name: 'Cargo Expreso',
					description: 'Envio nacional a todo Guatemala con tracking',
					estimatedDays: '3-5 dias habiles',
					cost: 36.00,
					requiresCourier: true,
					provider: 'Cargo Expreso',
					features: ['Tracking en vivo', 'Numero de guia', 'Envio asegurado'],
					allowsPickup: true
				}
			}
		},
		validation: {
			email: { minLength: 5, maxLength: 255 },
			fullName: { minLength: 3, maxLength: 255 },
			phone: { minLength: 8, maxLength: 20 },
			address: { minLength: 10, maxLength: 500 },
			deliveryNotes: { maxLength: 1000 }
		},
		cargoExpresoBranches: [
			{ id: 'gt-zona10', name: 'Zona 10, Ciudad de Guatemala', city: 'Guatemala' },
			{ id: 'gt-pradera', name: 'Centro Comercial Pradera Concepcion', city: 'Guatemala' },
			{ id: 'xela-centro', name: 'Centro, Quetzaltenango', city: 'Quetzaltenango' },
			{ id: 'antigua', name: 'Antigua Guatemala', city: 'Antigua' },
			{ id: 'escuintla', name: 'Escuintla Centro', city: 'Escuintla' },
			{ id: 'coban', name: 'Coban, Alta Verapaz', city: 'Coban' },
			{ id: 'peten', name: 'Santa Elena, Peten', city: 'Santa Elena' }
		]
	},
	seo: {
		title: 'Moda Organica | Joyeria Unica en Guatemala',
		description: 'Descubre colecciones exclusivas de joyeria y bisuteria.'
	}
};

export function getShippingCost(municipality) {
	const { localZones, costs } = brand.businessRules.shipping;
	const normalizedMun = municipality?.toLowerCase() || '';
	const isLocal = localZones.some(zone => normalizedMun.includes(zone.toLowerCase()));
	return isLocal ? costs.local : costs.national;
}

export function isLocalDelivery(municipality) {
	const { localZones } = brand.businessRules.shipping;
	const normalizedMun = municipality?.toLowerCase() || '';
	return localZones.some(zone => normalizedMun.includes(zone.toLowerCase()));
}

export function requiresCargoExpreso(municipality) {
	return !isLocalDelivery(municipality);
}

export function formatCurrency(amount) {
	return new Intl.NumberFormat('es-GT', {
		style: 'currency',
		currency: 'GTQ',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(amount);
}