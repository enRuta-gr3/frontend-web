export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;

  const isArrayOfArrays = Array.isArray(rows[0])

  const csvContent = isArrayOfArrays
    ? rows.map(row =>
        row
          .map(cell => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      ).join("\n")
    : [
        Object.keys(rows[0]).join(","),
        ...rows.map(row =>
          Object.values(row)
            .map(cell => `"${String(cell).replace(/"/g, '""')}"`)
            .join(",")
        ),
      ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}