/**
 * Guatemala Location Data
 * 22 Departamentos y sus municipios (INE oficial)
 * Zonas de envío configuradas para cálculo futuro de costos
 */

export const GUATEMALA_DEPARTMENTS = [
  {
    id: 'GT-01',
    name: 'Guatemala',
    shippingZone: 'central',
    municipalities: [
      { id: 'GT-01-01', name: 'Guatemala', zone: 'metropolitana' },
      { id: 'GT-01-02', name: 'Santa Catarina Pinula', zone: 'metropolitana' },
      { id: 'GT-01-03', name: 'San José Pinula', zone: 'metropolitana' },
      { id: 'GT-01-04', name: 'San Juan Sacatepéquez', zone: 'central' },
      { id: 'GT-01-05', name: 'San Raimundo', zone: 'central' },
      { id: 'GT-01-06', name: 'Chuarrancho', zone: 'central' },
      { id: 'GT-01-07', name: 'Fraijanes', zone: 'central' },
      { id: 'GT-01-08', name: 'Palencia', zone: 'central' },
      { id: 'GT-01-09', name: 'Chinautla', zone: 'metropolitana' },
      { id: 'GT-01-10', name: 'San Pedro Ayampuc', zone: 'metropolitana' },
      { id: 'GT-01-11', name: 'Mixco', zone: 'metropolitana' },
      { id: 'GT-01-12', name: 'San Pedro Sacatepéquez', zone: 'central' },
      { id: 'GT-01-13', name: 'San Juan Ixtenco', zone: 'central' },
      { id: 'GT-01-14', name: 'Petapa', zone: 'metropolitana' },
      { id: 'GT-01-15', name: 'Villa Nueva', zone: 'metropolitana' },
      { id: 'GT-01-16', name: 'Villa Canales', zone: 'central' },
      { id: 'GT-01-17', name: 'Santa Rosa de Lima', zone: 'central' }
    ]
  },
  {
    id: 'GT-02',
    name: 'Sacatepéquez',
    shippingZone: 'central',
    municipalities: [
      { id: 'GT-02-01', name: 'Antigua Guatemala', zone: 'central' },
      { id: 'GT-02-02', name: 'Vieja', zone: 'central' },
      { id: 'GT-02-03', name: 'San Bartolomé Milpas Altas', zone: 'central' },
      { id: 'GT-02-04', name: 'Santa Lucía Milpas Altas', zone: 'central' },
      { id: 'GT-02-05', name: 'San Miguel Dueñas', zone: 'central' },
      { id: 'GT-02-06', name: 'Santiago Sacatepéquez', zone: 'central' },
      { id: 'GT-02-07', name: 'San Antonio Aguas Calientes', zone: 'central' },
      { id: 'GT-02-08', name: 'Santa María de Jesús', zone: 'central' },
      { id: 'GT-02-09', name: 'Ciudad Vieja', zone: 'central' },
      { id: 'GT-02-10', name: 'Jocotenango', zone: 'central' },
      { id: 'GT-02-11', name: 'Pastores', zone: 'central' },
      { id: 'GT-02-12', name: 'Sumpango', zone: 'central' },
      { id: 'GT-02-13', name: 'San Lucas Sacatepéquez', zone: 'central' },
      { id: 'GT-02-14', name: 'Magdalena Milpas Altas', zone: 'central' }
    ]
  },
  {
    id: 'GT-03',
    name: 'Amatitlán',
    shippingZone: 'central',
    municipalities: [
      { id: 'GT-03-01', name: 'Amatitlán', zone: 'central' },
      { id: 'GT-03-02', name: 'Villa Canales', zone: 'central' },
      { id: 'GT-03-03', name: 'Palín', zone: 'central' },
      { id: 'GT-03-04', name: 'San Vicente Pacaya', zone: 'central' },
      { id: 'GT-03-05', name: 'Santa María de Jesús', zone: 'central' },
      { id: 'GT-03-06', name: 'Alotenango', zone: 'central' }
    ]
  },
  {
    id: 'GT-04',
    name: 'Escuintla',
    shippingZone: 'sur',
    municipalities: [
      { id: 'GT-04-01', name: 'Escuintla', zone: 'sur' },
      { id: 'GT-04-02', name: 'Guanagazapa', zone: 'sur' },
      { id: 'GT-04-03', name: 'Siquinalá', zone: 'sur' },
      { id: 'GT-04-04', name: 'Tiquisate', zone: 'sur' },
      { id: 'GT-04-05', name: 'Masagua', zone: 'sur' },
      { id: 'GT-04-06', name: 'Palín', zone: 'sur' },
      { id: 'GT-04-07', name: 'Santa Lucía Cotzumalguapa', zone: 'sur' },
      { id: 'GT-04-08', name: 'La Demanda', zone: 'sur' },
      { id: 'GT-04-09', name: 'Iztapa', zone: 'sur' },
      { id: 'GT-04-10', name: 'Puerto San José', zone: 'sur' },
      { id: 'GT-04-11', name: 'Taxisco', zone: 'sur' },
      { id: 'GT-04-12', name: 'San José', zone: 'sur' }
    ]
  },
  {
    id: 'GT-05',
    name: 'Santa Rosa',
    shippingZone: 'sur',
    municipalities: [
      { id: 'GT-05-01', name: 'Santa Rosa', zone: 'sur' },
      { id: 'GT-05-02', name: 'Barberena', zone: 'sur' },
      { id: 'GT-05-03', name: 'Guachapán', zone: 'sur' },
      { id: 'GT-05-04', name: 'Taxisco', zone: 'sur' },
      { id: 'GT-05-05', name: 'San Paul La Laguna', zone: 'sur' },
      { id: 'GT-05-06', name: 'Ayutla', zone: 'sur' },
      { id: 'GT-05-07', name: 'Cantel', zone: 'sur' },
      { id: 'GT-05-08', name: 'Cuilapa', zone: 'sur' },
      { id: 'GT-05-09', name: 'Chiquimulilla', zone: 'sur' },
      { id: 'GT-05-10', name: 'Oratorio', zone: 'sur' },
      { id: 'GT-05-11', name: 'San Juan Tecuaco', zone: 'sur' },
      { id: 'GT-05-12', name: 'Pueblo Nuevo Viñas', zone: 'sur' },
      { id: 'GT-05-13', name: 'Nueva Santa Rosa', zone: 'sur' }
    ]
  },
  {
    id: 'GT-06',
    name: 'Sololá',
    shippingZone: 'occidente',
    municipalities: [
      { id: 'GT-06-01', name: 'Sololá', zone: 'occidente' },
      { id: 'GT-06-02', name: 'Comalguapa', zone: 'occidente' },
      { id: 'GT-06-03', name: 'San José Chacayá', zone: 'occidente' },
      { id: 'GT-06-04', name: 'Santa Clara La Laguna', zone: 'occidente' },
      { id: 'GT-06-05', name: 'San Andrés Semetabaj', zone: 'occidente' },
      { id: 'GT-06-06', name: 'Santiago Atitlán', zone: 'occidente' },
      { id: 'GT-06-07', name: 'San Pedro La Laguna', zone: 'occidente' },
      { id: 'GT-06-08', name: 'San Juan La Laguna', zone: 'occidente' },
      { id: 'GT-06-09', name: 'Panajachel', zone: 'occidente' },
      { id: 'GT-06-10', name: 'Santa Catarina Palopó', zone: 'occidente' },
      { id: 'GT-06-11', name: 'San Antonio Palopó', zone: 'occidente' },
      { id: 'GT-06-12', name: 'San Marcos La Laguna', zone: 'occidente' }
    ]
  },
  {
    id: 'GT-07',
    name: 'Chichicastenango',
    shippingZone: 'occidente',
    municipalities: [
      { id: 'GT-07-01', name: 'Chichicastenango', zone: 'occidente' },
      { id: 'GT-07-02', name: 'Santa Cruz del Quiché', zone: 'occidente' },
      { id: 'GT-07-03', name: 'Canillá', zone: 'occidente' },
      { id: 'GT-07-04', name: 'Chicamán', zone: 'occidente' },
      { id: 'GT-07-05', name: 'Chinique', zone: 'occidente' },
      { id: 'GT-07-06', name: 'Chajul', zone: 'occidente' },
      { id: 'GT-07-07', name: 'Cotzal', zone: 'occidente' },
      { id: 'GT-07-08', name: 'Ixcán', zone: 'occidente' },
      { id: 'GT-07-09', name: 'Nebaj', zone: 'occidente' },
      { id: 'GT-07-10', name: 'Patzité', zone: 'occidente' },
      { id: 'GT-07-11', name: 'Sacapulas', zone: 'occidente' },
      { id: 'GT-07-12', name: 'San Andrés Xecul', zone: 'occidente' },
      { id: 'GT-07-13', name: 'San Juan Cotzal', zone: 'occidente' },
      { id: 'GT-07-14', name: 'San Pedro Jocopilas', zone: 'occidente' }
    ]
  },
  {
    id: 'GT-08',
    name: 'Totonicapán',
    shippingZone: 'occidente',
    municipalities: [
      { id: 'GT-08-01', name: 'Totonicapán', zone: 'occidente' },
      { id: 'GT-08-02', name: 'San Cristóbal Totonicapán', zone: 'occidente' },
      { id: 'GT-08-03', name: 'San Francisco El Alto', zone: 'occidente' },
      { id: 'GT-08-04', name: 'San Andrés Xecul', zone: 'occidente' },
      { id: 'GT-08-05', name: 'Momostenango', zone: 'occidente' },
      { id: 'GT-08-06', name: 'Santa María Chiquimula', zone: 'occidente' },
      { id: 'GT-08-07', name: 'Santa Lucía La Reforma', zone: 'occidente' },
      { id: 'GT-08-08', name: 'Santa María Ixtatán', zone: 'occidente' }
    ]
  },
  {
    id: 'GT-09',
    name: 'Quetzaltenango',
    shippingZone: 'occidente',
    municipalities: [
      { id: 'GT-09-01', name: 'Quetzaltenango', zone: 'occidente' },
      { id: 'GT-09-02', name: 'Almolonga', zone: 'occidente' },
      { id: 'GT-09-03', name: 'Cantel', zone: 'occidente' },
      { id: 'GT-09-04', name: 'Cabricán', zone: 'occidente' },
      { id: 'GT-09-05', name: 'Huitán', zone: 'occidente' },
      { id: 'GT-09-06', name: 'Salcajá', zone: 'occidente' },
      { id: 'GT-09-07', name: 'Sibilia', zone: 'occidente' },
      { id: 'GT-09-08', name: 'San Miguel Sigüilá', zone: 'occidente' },
      { id: 'GT-09-09', name: 'Olintepeque', zone: 'occidente' },
      { id: 'GT-09-10', name: 'El Palmar', zone: 'occidente' },
      { id: 'GT-09-11', name: 'Zunil', zone: 'occidente' },
      { id: 'GT-09-12', name: 'Genova', zone: 'occidente' },
      { id: 'GT-09-13', name: 'Coatepeque', zone: 'occidente' },
      { id: 'GT-09-14', name: 'La Esperanza', zone: 'occidente' }
    ]
  },
  {
    id: 'GT-10',
    name: 'Suchitepéquez',
    shippingZone: 'occidente',
    municipalities: [
      { id: 'GT-10-01', name: 'Suchitepéquez', zone: 'occidente' },
      { id: 'GT-10-02', name: 'Mazatenango', zone: 'occidente' },
      { id: 'GT-10-03', name: 'San Bernardino', zone: 'occidente' },
      { id: 'GT-10-04', name: 'Cuyotenango', zone: 'occidente' },
      { id: 'GT-10-05', name: 'Santo Domingo', zone: 'occidente' },
      { id: 'GT-10-06', name: 'Samayac', zone: 'occidente' },
      { id: 'GT-10-07', name: 'Patulul', zone: 'occidente' },
      { id: 'GT-10-08', name: 'Pueblo Nuevo', zone: 'occidente' },
      { id: 'GT-10-09', name: 'San Francisco Zapotitlán', zone: 'occidente' },
      { id: 'GT-10-10', name: 'San Gabriel', zone: 'occidente' },
      { id: 'GT-10-11', name: 'San Antonio Sacatepéquez', zone: 'occidente' },
      { id: 'GT-10-12', name: 'San Miguel Panán', zone: 'occidente' },
      { id: 'GT-10-13', name: 'San Andrés Villa Seca', zone: 'occidente' },
      { id: 'GT-10-14', name: 'San Sebastián', zone: 'occidente' }
    ]
  },
  {
    id: 'GT-11',
    name: 'Retalhuleu',
    shippingZone: 'occidente',
    municipalities: [
      { id: 'GT-11-01', name: 'Retalhuleu', zone: 'occidente' },
      { id: 'GT-11-02', name: 'Ococingo', zone: 'occidente' },
      { id: 'GT-11-03', name: 'San Andrés Villa Seca', zone: 'occidente' },
      { id: 'GT-11-04', name: 'Santa Cruz Mulúa', zone: 'occidente' },
      { id: 'GT-11-05', name: 'Nuevo San Carlos', zone: 'occidente' },
      { id: 'GT-11-06', name: 'El Asintal', zone: 'occidente' },
      { id: 'GT-11-07', name: 'Champerico', zone: 'occidente' },
      { id: 'GT-11-08', name: 'Méndez', zone: 'occidente' }
    ]
  },
  {
    id: 'GT-12',
    name: 'San Marcos',
    shippingZone: 'occidente',
    municipalities: [
      { id: 'GT-12-01', name: 'San Marcos', zone: 'occidente' },
      { id: 'GT-12-02', name: 'Espitacia', zone: 'occidente' },
      { id: 'GT-12-03', name: 'San Pablo', zone: 'occidente' },
      { id: 'GT-12-04', name: 'Ixchiguán', zone: 'occidente' },
      { id: 'GT-12-05', name: 'Sibinal', zone: 'occidente' },
      { id: 'GT-12-06', name: 'Tajumulco', zone: 'occidente' },
      { id: 'GT-12-07', name: 'Tacaná', zone: 'occidente' },
      { id: 'GT-12-08', name: 'Ocós', zone: 'occidente' },
      { id: 'GT-12-09', name: 'Unión Cantinil', zone: 'occidente' },
      { id: 'GT-12-10', name: 'El Rodeo', zone: 'occidente' },
      { id: 'GT-12-11', name: 'Comitancillo', zone: 'occidente' },
      { id: 'GT-12-12', name: 'San Antonio Sacatepéquez', zone: 'occidente' },
      { id: 'GT-12-13', name: 'Nuevo Progreso', zone: 'occidente' },
      { id: 'GT-12-14', name: 'El Quetzal', zone: 'occidente' }
    ]
  },
  {
    id: 'GT-13',
    name: 'Huehuetenango',
    shippingZone: 'occidente',
    municipalities: [
      { id: 'GT-13-01', name: 'Huehuetenango', zone: 'local-delivery', special: true },
      { id: 'GT-13-02', name: 'Chiantla', zone: 'local-delivery', special: true },
      { id: 'GT-13-03', name: 'La Libertad', zone: 'occidente' },
      { id: 'GT-13-04', name: 'La Antigua Concepción', zone: 'occidente' },
      { id: 'GT-13-05', name: 'San Juan Ixcoy', zone: 'occidente' },
      { id: 'GT-13-06', name: 'Santa Bárbara', zone: 'occidente' },
      { id: 'GT-13-07', name: 'Paquete', zone: 'occidente' },
      { id: 'GT-13-08', name: 'Peñol', zone: 'occidente' },
      { id: 'GT-13-09', name: 'San Sebastián Coatán', zone: 'occidente' },
      { id: 'GT-13-10', name: 'Tcucán', zone: 'occidente' },
      { id: 'GT-13-11', name: 'Todos Santos Cuchumatán', zone: 'occidente' },
      { id: 'GT-13-12', name: 'Santa Eulalia', zone: 'occidente' },
      { id: 'GT-13-13', name: 'San Mateo Ixtatán', zone: 'occidente' },
      { id: 'GT-13-14', name: 'Nentón', zone: 'occidente' },
      { id: 'GT-13-15', name: 'Jacaltenango', zone: 'occidente' },
      { id: 'GT-13-16', name: 'Soloma', zone: 'occidente' },
      { id: 'GT-13-17', name: 'Santa Cruz Barillas', zone: 'occidente' },
      { id: 'GT-13-18', name: 'Aguacatán', zone: 'occidente' },
      { id: 'GT-13-19', name: 'San Rafael Pétzal', zone: 'occidente' },
      { id: 'GT-13-20', name: 'San Juan Atitán', zone: 'occidente' },
      { id: 'GT-13-21', name: 'Santa Ana Huista', zone: 'occidente' },
      { id: 'GT-13-22', name: 'Cundapé', zone: 'occidente' },
      { id: 'GT-13-23', name: 'San Pedro Necta', zone: 'occidente' },
      { id: 'GT-13-24', name: 'Colotenango', zone: 'occidente' }
    ]
  },
  {
    id: 'GT-14',
    name: 'Quiché',
    shippingZone: 'occidente',
    municipalities: [
      { id: 'GT-14-01', name: 'Santa Cruz del Quiché', zone: 'occidente' },
      { id: 'GT-14-02', name: 'Canillá', zone: 'occidente' },
      { id: 'GT-14-03', name: 'Chicamán', zone: 'occidente' },
      { id: 'GT-14-04', name: 'Chinique', zone: 'occidente' },
      { id: 'GT-14-05', name: 'Chichicastenango', zone: 'occidente' },
      { id: 'GT-14-06', name: 'Chajul', zone: 'occidente' },
      { id: 'GT-14-07', name: 'Cotzal', zone: 'occidente' },
      { id: 'GT-14-08', name: 'Ixcán', zone: 'occidente' },
      { id: 'GT-14-09', name: 'Joyabaj', zone: 'occidente' },
      { id: 'GT-14-10', name: 'Nebaj', zone: 'occidente' },
      { id: 'GT-14-11', name: 'Patzité', zone: 'occidente' },
      { id: 'GT-14-12', name: 'Sacapulas', zone: 'occidente' },
      { id: 'GT-14-13', name: 'San Andrés Xecul', zone: 'occidente' },
      { id: 'GT-14-14', name: 'San Juan Cotzal', zone: 'occidente' },
      { id: 'GT-14-15', name: 'San Pedro Jocopilas', zone: 'occidente' },
      { id: 'GT-14-16', name: 'Uspantán', zone: 'occidente' },
      { id: 'GT-14-17', name: 'Zacualpa', zone: 'occidente' }
    ]
  },
  {
    id: 'GT-15',
    name: 'Baja Verapaz',
    shippingZone: 'norte',
    municipalities: [
      { id: 'GT-15-01', name: 'Salamá', zone: 'norte' },
      { id: 'GT-15-02', name: 'Purulhá', zone: 'norte' },
      { id: 'GT-15-03', name: 'Cubulco', zone: 'norte' },
      { id: 'GT-15-04', name: 'Balneario de Agua Caliente', zone: 'norte' },
      { id: 'GT-15-05', name: 'Granados', zone: 'norte' },
      { id: 'GT-15-06', name: 'El Chol', zone: 'norte' },
      { id: 'GT-15-07', name: 'Rabanál', zone: 'norte' },
      { id: 'GT-15-08', name: 'Santa Cruz Verapaz', zone: 'norte' }
    ]
  },
  {
    id: 'GT-16',
    name: 'Alta Verapaz',
    shippingZone: 'norte',
    municipalities: [
      { id: 'GT-16-01', name: 'Cobán', zone: 'norte' },
      { id: 'GT-16-02', name: 'San Cristóbal Verapaz', zone: 'norte' },
      { id: 'GT-16-03', name: 'Tamahú', zone: 'norte' },
      { id: 'GT-16-04', name: 'Tactic', zone: 'norte' },
      { id: 'GT-16-05', name: 'Turanza', zone: 'norte' },
      { id: 'GT-16-06', name: 'Cahabón', zone: 'norte' },
      { id: 'GT-16-07', name: 'Lanquín', zone: 'norte' },
      { id: 'GT-16-08', name: 'Panzós', zone: 'norte' },
      { id: 'GT-16-09', name: 'Senahú', zone: 'norte' },
      { id: 'GT-16-10', name: 'Chahal', zone: 'norte' },
      { id: 'GT-16-11', name: 'Raxruhá', zone: 'norte' },
      { id: 'GT-16-12', name: 'La Tinta', zone: 'norte' },
      { id: 'GT-16-13', name: 'Fray Bartolomé de las Casas', zone: 'norte' },
      { id: 'GT-16-14', name: 'Chisec', zone: 'norte' }
    ]
  },
  {
    id: 'GT-17',
    name: 'Petén',
    shippingZone: 'norte',
    municipalities: [
      { id: 'GT-17-01', name: 'Flores', zone: 'norte' },
      { id: 'GT-17-02', name: 'San Benito', zone: 'norte' },
      { id: 'GT-17-03', name: 'San Andrés', zone: 'norte' },
      { id: 'GT-17-04', name: 'La Libertad', zone: 'norte' },
      { id: 'GT-17-05', name: 'Sayaxché', zone: 'norte' },
      { id: 'GT-17-06', name: 'Melchor de Mencos', zone: 'norte' },
      { id: 'GT-17-07', name: 'Poptún', zone: 'norte' },
      { id: 'GT-17-08', name: 'Dolores', zone: 'norte' },
      { id: 'GT-17-09', name: 'San Luis', zone: 'norte' },
      { id: 'GT-17-10', name: 'Las Cruces', zone: 'norte' },
      { id: 'GT-17-11', name: 'Livingston', zone: 'norte' }
    ]
  },
  {
    id: 'GT-18',
    name: 'Izabal',
    shippingZone: 'norte',
    municipalities: [
      { id: 'GT-18-01', name: 'Puerto Barrios', zone: 'norte' },
      { id: 'GT-18-02', name: 'Livingston', zone: 'norte' },
      { id: 'GT-18-03', name: 'Morales', zone: 'norte' },
      { id: 'GT-18-04', name: 'Los Amates', zone: 'norte' },
      { id: 'GT-18-05', name: 'Punta Gorda', zone: 'norte' },
      { id: 'GT-18-06', name: 'El Estor', zone: 'norte' }
    ]
  },
  {
    id: 'GT-19',
    name: 'Chiquimula',
    shippingZone: 'oriente',
    municipalities: [
      { id: 'GT-19-01', name: 'Chiquimula', zone: 'oriente' },
      { id: 'GT-19-02', name: 'Subinás', zone: 'oriente' },
      { id: 'GT-19-03', name: 'Sillá', zone: 'oriente' },
      { id: 'GT-19-04', name: 'Chuarrancho', zone: 'oriente' },
      { id: 'GT-19-05', name: 'Quetzaltepeque', zone: 'oriente' },
      { id: 'GT-19-06', name: 'Concepción Las Minas', zone: 'oriente' },
      { id: 'GT-19-07', name: 'San Jacinto', zone: 'oriente' },
      { id: 'GT-19-08', name: 'Chiticapa', zone: 'oriente' }
    ]
  },
  {
    id: 'GT-20',
    name: 'Jalapa',
    shippingZone: 'oriente',
    municipalities: [
      { id: 'GT-20-01', name: 'Jalapa', zone: 'oriente' },
      { id: 'GT-20-02', name: 'San Pedro Pinula', zone: 'oriente' },
      { id: 'GT-20-03', name: 'San Luis Jilotepeque', zone: 'oriente' }
    ]
  },
  {
    id: 'GT-21',
    name: 'Jutiapa',
    shippingZone: 'oriente',
    municipalities: [
      { id: 'GT-21-01', name: 'Jutiapa', zone: 'oriente' },
      { id: 'GT-21-02', name: 'Asunción Mita', zone: 'oriente' },
      { id: 'GT-21-03', name: 'Jerez', zone: 'oriente' },
      { id: 'GT-21-04', name: 'Comapa', zone: 'oriente' },
      { id: 'GT-21-05', name: 'Jalpatagua', zone: 'oriente' },
      { id: 'GT-21-06', name: 'Conguaco', zone: 'oriente' },
      { id: 'GT-21-07', name: 'Agua Blanca', zone: 'oriente' },
      { id: 'GT-21-08', name: 'Sign', zone: 'oriente' }
    ]
  },
  {
    id: 'GT-22',
    name: 'Zacapa',
    shippingZone: 'oriente',
    municipalities: [
      { id: 'GT-22-01', name: 'Zacapa', zone: 'oriente' },
      { id: 'GT-22-02', name: 'Estanzuela', zone: 'oriente' },
      { id: 'GT-22-03', name: 'Río Hondo', zone: 'oriente' },
      { id: 'GT-22-04', name: 'San Andrés Machaca', zone: 'oriente' },
      { id: 'GT-22-05', name: 'La Unión', zone: 'oriente' },
      { id: 'GT-22-06', name: 'Teculután', zone: 'oriente' },
      { id: 'GT-22-07', name: 'Usumatlán', zone: 'oriente' },
      { id: 'GT-22-08', name: 'Cabañas', zone: 'oriente' }
    ]
  }
];

/**
 * Helper Functions
 */

/**
 * Obtener departamento por ID
 * @param {string} id - ID del departamento (ej: 'GT-01')
 * @returns {Object|null} Departamento o null si no existe
 */
export function getDepartmentById(id) {
  return GUATEMALA_DEPARTMENTS.find(dept => dept.id === id) || null;
}

/**
 * Obtener municipio por IDs de departamento y municipio
 * @param {string} deptId - ID del departamento
 * @param {string} munId - ID del municipio
 * @returns {Object|null} Municipio o null si no existe
 */
export function getMunicipalityById(deptId, munId) {
  const dept = getDepartmentById(deptId);
  if (!dept) return null;
  return dept.municipalities.find(mun => mun.id === munId) || null;
}

/**
 * Verificar si un municipio es zona de envío especial
 * (Huehuetenango y Chiantla)
 * @param {string} deptId - ID del departamento
 * @param {string} munId - ID del municipio
 * @returns {boolean}
 */
export function isSpecialDeliveryZone(deptId, munId) {
  const mun = getMunicipalityById(deptId, munId);
  return mun ? mun.special === true : false;
}

/**
 * Obtener zona de envío para un municipio
 * @param {string} deptId - ID del departamento
 * @param {string} munId - ID del municipio
 * @returns {string} Zona de envío ('metropolitana', 'central', 'occidente', 'oriente', 'norte', etc)
 */
export function getShippingZone(deptId, munId) {
  const mun = getMunicipalityById(deptId, munId);
  return mun ? mun.zone : 'unknown';
}

/**
 * Obtener zona de envío del departamento
 * @param {string} deptId - ID del departamento
 * @returns {string} Zona de envío del departamento
 */
export function getDepartmentShippingZone(deptId) {
  const dept = getDepartmentById(deptId);
  return dept ? dept.shippingZone : 'unknown';
}

/**
 * Obtener municipios filtrados por departamento
 * @param {string} deptId - ID del departamento
 * @returns {Array} Array de municipios
 */
export function getMunicipalitiesByDepartment(deptId) {
  const dept = getDepartmentById(deptId);
  return dept ? dept.municipalities : [];
}

/**
 * Validar combinación de departamento/municipio
 * @param {string} deptId - ID del departamento
 * @param {string} munId - ID del municipio
 * @returns {boolean}
 */
export function isValidLocationCombination(deptId, munId) {
  const dept = getDepartmentById(deptId);
  if (!dept) return false;
  return dept.municipalities.some(m => m.id === munId);
}

/**
 * Obtener nombre completo de ubicación
 * @param {string} deptId - ID del departamento
 * @param {string} munId - ID del municipio
 * @returns {string} Nombre formateado (ej: "Guatemala, Guatemala" o "Huehuetenango, Chiantla")
 */
export function getLocationDisplayName(deptId, munId) {
  const dept = getDepartmentById(deptId);
  const mun = getMunicipalityById(deptId, munId);

  if (!dept || !mun) return '';

  return `${mun.name}, ${dept.name}`;
}

/**
 * Obtener todos los departamentos como array simple
 * @returns {Array} Array de { id, name }
 */
export function getDepartmentsList() {
  return GUATEMALA_DEPARTMENTS.map(dept => ({
    id: dept.id,
    name: dept.name
  }));
}
