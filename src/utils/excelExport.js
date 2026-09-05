import writeXlsxFile from 'write-excel-file/browser'

function toExcelCell(value) {
  if (value === undefined || value === null) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  return String(value)
}

export function objectsToExcelRows(rows) {
  if (!rows || rows.length === 0) return []

  const headers = Object.keys(rows[0])
  return [
    headers,
    ...rows.map((row) => headers.map((header) => toExcelCell(row[header])))
  ]
}

export async function downloadExcelWorkbook(sheets, filename) {
  await writeXlsxFile(
    sheets.map(({ name, data, widths, ...options }) => ({
      sheet: name,
      data,
      ...(widths ? { columns: widths.map((width) => ({ width })) } : {}),
      ...options
    }))
  ).toFile(filename)
}
