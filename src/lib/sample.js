// Shown only when the /api endpoints are unavailable (e.g. plain `npm run dev`).
const base = { department: '', comments: '', approver: 'Pablo Lewin' }

export const SAMPLE = [
  { ...base, id: 'demo!1', tab: 'NA A&E', row: 7, requester: 'Brian Enkelmann', department: 'Manufacturing Engineering', destination: 'Aurora, IL', startDate: '7/13', endDate: '7/14', reason: 'Chargrill pre-installation site readiness assessment', estCost: '$1400', status: 'Approved' },
  { ...base, id: 'demo!2', tab: 'NA Safety/AP/Sec', row: 35, requester: 'Jeff Newkirk', department: 'Safety/AP/Sec', destination: 'DEN', startDate: '7/13/2026', endDate: '7/16/2026', reason: 'Alignment with new AD, strategize org', estCost: '$5000', status: 'Pending' },
  { ...base, id: 'demo!3', tab: 'NA Safety/AP/Sec', row: 40, requester: 'Jeff Newkirk', department: 'Safety/AP/Sec', destination: 'EWR', startDate: '8/3/2026', endDate: '8/5/2026', reason: 'Local team alignment', estCost: '$1500', status: 'Pending' },
  { ...base, id: 'demo!4', tab: 'INTL Eng&Auto', row: 51, requester: 'Alex Wright', department: 'Eng&Auto', destination: 'Barleben', startDate: '09/09/2026', endDate: '09/09/2026', reason: 'BX site visit', estCost: '800 EUR', status: 'Pending', approver: 'Pablo Lewin' },
  { ...base, id: 'demo!5', tab: 'NA A&E', row: 40, requester: 'Sample Person', department: 'Manufacturing Engineering', destination: 'Newark, NJ', startDate: '9/1', endDate: '9/2', reason: 'Vendor meeting', estCost: '$1000', status: 'Rejected' },
  { ...base, id: 'demo!6', tab: 'INTL EHS', row: 12, requester: 'Sample Person', department: 'Health & Safety', destination: 'Ireland', startDate: '23.07', endDate: '23.07', reason: 'Hub visit', estCost: '£250.00', status: 'Approved', approver: 'Julie Cowlishaw-Ellison' },
  { ...base, id: 'demo!7', tab: 'NA Construction', row: 10, requester: 'Alex Praet', department: 'Construction Management', destination: 'Goodyear, AZ', startDate: '8/31', endDate: '9/1', reason: 'Site visit with consultant', estCost: '$1000', status: '' },
]
