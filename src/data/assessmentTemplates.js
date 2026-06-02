// Plantillas de valoración (PDF: sección 10). Ajustables.

export const assessmentTemplates = [
  {
    id: 'geriatric',
    title: 'Valoración geriátrica',
    toolIds: ['tug', 'sppb', 'sts30', 'barthel', 'borg'],
  },
  {
    id: 'respiratory',
    title: 'Valoración respiratoria',
    toolIds: ['6mwt', 'monitoring', 'borg'],
  },
  {
    id: 'msk',
    title: 'Valoración musculoesquelética',
    toolIds: ['eva', 'oswestry', 'goniom', 'oxford'],
  },
  {
    id: 'neuro',
    title: 'Valoración neurológica',
    toolIds: ['tug', 'sppb', 'barthel'],
  },
  {
    id: 'quick',
    title: 'Valoración rápida',
    toolIds: ['tug', 'borg', 'imc', 'fcmax', 'monitoring'],
  },
];
