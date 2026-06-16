export const calculateDateRange = (timeRange) => {
  const endDate = new Date();
  let startDate = new Date();

  switch (timeRange) {
    case '24hours':
      startDate.setDate(endDate.getDate() - 1);
      break;
    case '30days':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '1year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case '2years':
      startDate.setFullYear(endDate.getFullYear() - 2);
      break;
    case '5years':
      startDate.setFullYear(endDate.getFullYear() - 5);
      break;
    case '10years':
      startDate.setFullYear(endDate.getFullYear() - 10);
      break;
    case 'all':
      startDate = new Date('1988-01-01');
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
  }

  return { startDate, endDate };
};

export const TIME_RANGE_OPTIONS = [
  { value: '24hours', label: 'Últimes 24h' },
  { value: '30days', label: 'Últims 30 dies' },
  { value: '1year', label: 'Últim any' },
  { value: '2years', label: 'Últims 2 anys' },
  { value: '5years', label: 'Últims 5 anys' },
  { value: '10years', label: 'Últims 10 anys' },
  { value: 'all', label: 'Històric complet' },
];

export const BASIC_TIME_RANGE_OPTIONS = [
  { value: '24hours', label: 'Últimes 24h' },
  { value: '30days', label: 'Últims 30 dies' },
  { value: '1year', label: 'Últim any' },
  { value: '2years', label: 'Últims 2 anys' },
  { value: '5years', label: 'Últims 5 anys' },
];
