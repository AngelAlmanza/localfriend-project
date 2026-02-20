export const formatCurrency = (amount: number, currency: string = 'mxn') => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(amount);
}