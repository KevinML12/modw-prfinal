export const brand = {
	identity: {
		name: 'Moda Orgánica',
		logo: '/logos/moda-organica-logo.svg', // Asumimos que tienes este logo
		colors: {
			// Paleta basada en tu diseño (fondo oscuro, texto blanco)
			primary: '#E1AEC1', // Rosa principal (para botones y acentos)
			secondary: '#2C2C2C', // Gris oscuro (para las tarjetas)
			background: '#181818', // Fondo principal (casi negro)
			text: '#FFFFFF', // Texto principal (blanco)
			accent: '#DDAF3B', // Acento dorado (opcional)
			primary_content: '#181818', // Texto para botones primarios
		},
		fonts: {
			// Las fuentes de tu diseño
			headings: 'Playfair Display',
			body: 'Lato',
		},
	},
	businessRules: {
		shipping: {
			localZones: ['chiantla', 'huehuetenango'],
			costs: { local: 15.0, national: 35.0 },
			nationalProvider: 'Cargo Expreso',
		},
	},
	seo: {
		title: 'Moda Orgánica | Joyería Única en Guatemala',
		description: 'Descubre colecciones exclusivas de joyería y bisutería.',
	},
};