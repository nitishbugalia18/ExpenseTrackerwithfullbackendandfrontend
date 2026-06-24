// Client-side fallback export to Excel using ExcelJS, used when the
// server-side download endpoint is unavailable.
import ExcelJS from "exceljs";

export const exportToExcel = async (data, filename = "export") => {
  if (!data || data.length === 0) {
    throw new Error("No data to export");
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Data");

  const headers = Object.keys(data[0]);
  sheet.columns = headers.map((key) => ({ header: key, key, width: 20 }));
  sheet.getRow(1).font = { bold: true };

  data.forEach((row) => sheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
};
