import prisma from '../../config/database';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

export const reportService = {
  async getDeptSummaryData(semesterId?: string, departmentId?: string) {
    const filters: any = {};
    if (semesterId) filters.semesterId = semesterId;
    if (departmentId) filters.departmentId = departmentId;

    const projects = await prisma.project.findMany({ where: filters, include: { team: true, guideAssignment: true } });
    
    const byStatus: Record<string, number> = {};
    const byDomain: Record<string, number> = {};
    let guideAssigned = 0;

    projects.forEach(p => {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      const d = p.domain || 'Unspecified';
      byDomain[d] = (byDomain[d] || 0) + 1;
      if (p.guideAssignment) guideAssigned++;
    });

    return { totalProjects: projects.length, byStatus, byDomain, guideAssigned };
  },

  async getProjectStatusData(filters: any) {
    return prisma.project.findMany({
      where: filters,
      include: { team: true, guideAssignment: { include: { facultyProfile: { include: { user: true } } } } }
    });
  },

  async getDefaultersData(_semesterId?: string, _departmentId?: string) {
    const filters: any = {
      deadline: { lt: new Date() },
      status: { notIn: ['APPROVED', 'SUBMITTED'] }
    };
    
    return prisma.milestone.findMany({
      where: filters,
      include: { project: { include: { team: true } } }
    });
  },

  async getEvaluationMarksData(_semesterId?: string, reviewStageId?: string) {
    const filters: any = {};
    if (reviewStageId) filters.reviewStageId = reviewStageId;
    
    return prisma.evaluation.findMany({
      where: filters,
      include: { project: { include: { team: true } }, reviewStage: true, scores: true }
    });
  },

  async generatePDF(title: string, headers: string[], rows: (string | number | null | undefined)[][]): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(20).text(title, { align: 'center' });
      doc.fontSize(12).text('Institution Name', { align: 'center' });
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);

      const colWidth = 500 / headers.length;
      let y = doc.y;

      doc.font('Helvetica-Bold');
      headers.forEach((h, i) => {
        doc.text(h, 30 + i * colWidth, y, { width: colWidth, align: 'left' });
      });
      y += 20;

      doc.font('Helvetica');
      rows.forEach((row, rowIndex) => {
        if (rowIndex % 2 === 0) {
          doc.rect(30, y - 5, 500, 20).fill('#f0f0f0').fillColor('#000');
        }
        row.forEach((cell, i) => {
          doc.text(cell?.toString() || '', 30 + i * colWidth, y, { width: colWidth, align: 'left' });
        });
        y += 20;
        if (y > 750) { doc.addPage(); y = 50; }
      });

      doc.end();
    });
  },

  async generateExcel(title: string, headers: string[], rows: (string | number | null | undefined)[][]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(title);

    sheet.addRow(headers);
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

    rows.forEach(row => sheet.addRow(row.map(c => c ?? '')));

    sheet.columns.forEach(col => { col.width = 20; });
    
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
};
