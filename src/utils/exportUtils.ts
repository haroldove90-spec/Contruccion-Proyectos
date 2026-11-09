/**
 * Utilería para exportar datos a Excel (.csv compatible con Microsoft Excel y hojas de cálculo)
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const sanitize = (val: string | number) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    '\uFEFF' + headers.map(sanitize).join(','), // UTF-8 BOM for Excel
    ...rows.map((row) => row.map(sanitize).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Utilería para invocar impresión / guardado directo en PDF del módulo activo
 */
export function triggerPrintPDF(title: string) {
  const originalTitle = document.title;
  document.title = title;
  window.print();
  setTimeout(() => {
    document.title = originalTitle;
  }, 1000);
}
