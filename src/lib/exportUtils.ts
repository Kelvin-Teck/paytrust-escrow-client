import * as XLSX from "xlsx";

export interface ExportColumn<T = any> {
  header: string;
  accessor: (item: T, index: number) => string | number | null | undefined;
}

export function formatTableDate(dateString?: string | number | Date | null): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function formatTableTime(dateString?: string | number | Date | null): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

export function exportToExcel<T = any>(
  data: T[],
  columns: ExportColumn<T>[],
  filenamePrefix: string = "export"
) {
  if (!data || data.length === 0) return false;

  const formattedRows = data.map((item, idx) => {
    const rowObj: Record<string, string | number> = {};
    columns.forEach((col) => {
      const val = col.accessor(item, idx);
      rowObj[col.header] = val ?? "";
    });
    return rowObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Records");

  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10);
  const fileName = `${filenamePrefix}_${dateStamp}.xlsx`;

  XLSX.writeFile(workbook, fileName);
  return true;
}

export function exportToCsv<T = any>(
  data: T[],
  columns: ExportColumn<T>[],
  filenamePrefix: string = "export"
) {
  if (!data || data.length === 0) return false;

  const headers = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`);
  const rows = data.map((item, idx) =>
    columns
      .map((col) => {
        const val = col.accessor(item, idx);
        const strVal = val === null || val === undefined ? "" : String(val);
        return `"${strVal.replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10);
  const fileName = `${filenamePrefix}_${dateStamp}.csv`;

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
