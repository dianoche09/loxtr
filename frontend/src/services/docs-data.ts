// services/docs-data.ts

export const HSCodeDatabase = [
    {
        code: '0802.22',
        description: 'Shelled Hazelnuts',
        hasAdditionalDuty: true,
        dutyRate: 12.0,
        regulations: ['EUDR (Deforestation)', 'Plant Health Certificate Required']
    },
    {
        code: '0802.21',
        description: 'In-shell Hazelnuts',
        hasAdditionalDuty: false,
        dutyRate: 3.2,
        regulations: ['Plant Health Certificate Required']
    },
    {
        code: '2008.19',
        description: 'Prepared/Roasted Hazelnuts',
        hasAdditionalDuty: true,
        dutyRate: 10.2,
        regulations: ['Aflatoxin Sampling Required']
    }
];
