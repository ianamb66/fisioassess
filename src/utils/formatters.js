export const formatDateTime = (d) => {
  try {
    const dt = d instanceof Date ? d : new Date(d);
    return dt.toLocaleString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return String(d);
  }
};

export const fmt = {
  num: (n, decimals = 1) => {
    if (n === null || n === undefined || n === '' || Number.isNaN(Number(n))) return '';
    const v = Number(n);
    return v.toFixed(decimals);
  },
  int: (n) => {
    if (n === null || n === undefined || n === '' || Number.isNaN(Number(n))) return '';
    return String(Math.round(Number(n)));
  }
};
