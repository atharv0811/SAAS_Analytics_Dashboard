type CsvValue = string | number | null | undefined;

function escapeCell(value: CsvValue) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: Record<string, CsvValue>[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  return [headers, ...rows.map((row) => headers.map((header) => row[header]))]
    .map((line) => line.map(escapeCell).join(","))
    .join("\n");
}

/** Triggers a browser download of the rows as a CSV file. */
export function downloadCsv(filename: string, rows: Record<string, CsvValue>[]) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
