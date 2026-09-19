import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  CheckCircle,
  FileDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';

export default function ReportsPage() {
  const { invoices, projects, timeLogs, clients, teamMembers } = useData();
  const [reportType, setReportType] = useState('Revenue');
  const [exportedMsg, setExportedMsg] = useState('');

  // 1. Export CSV
  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'Revenue' || reportType === 'Invoice') {
      csvContent += 'Invoice Number,Client,Project,Amount,Tax,Discount,Total,Status,Due Date\n';
      invoices.forEach(i => {
        csvContent += `"${i.invoiceNumber || i.id}","${i.clientName}","${i.projectName}",${i.amount || i.totalAmount},${i.taxAmount || 0},${i.discountAmount || 0},${i.totalAmount},"${i.status}","${i.dueDate}"\n`;
      });
    } else if (reportType === 'Project') {
      csvContent += 'Project Code,Project Name,Client,Budget,Spent,Status,Start Date,End Date\n';
      projects.forEach(p => {
        csvContent += `"${p.code}","${p.name}","${p.clientName}",${p.budget},${p.spent},"${p.status}","${p.startDate}","${p.endDate || p.dueDate}"\n`;
      });
    } else if (reportType === 'Employee') {
      csvContent += 'Name,Email,Department,Role,Salary CTC,Title\n';
      teamMembers.forEach(m => {
        csvContent += `"${m.name}","${m.email}","${m.department}","${m.role}","${m.salaryLPA || '12.5 LPA'}","${m.title || 'Team Member'}"\n`;
      });
    } else {
      csvContent += 'Client Name,Company,Email,Phone,Industry,GSTIN,Total Billed\n';
      clients.forEach(c => {
        csvContent += `"${c.name}","${c.company}","${c.email}","${c.phone}","${c.industry}","${c.gstNumber || c.gst || c.taxId}",${c.totalBilled || 0}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WorkForge_${reportType}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportedMsg(`Exported ${reportType} Report as CSV successfully.`);
    setTimeout(() => setExportedMsg(''), 4000);
  };

  // 2. Export Excel (.xlsx) using SheetJS
  const exportExcel = () => {
    let data = [];
    if (reportType === 'Revenue' || reportType === 'Invoice') {
      data = invoices.map(i => ({
        'Invoice ID': i.invoiceNumber || i.id,
        'Client': i.clientName,
        'Project': i.projectName,
        'Subtotal (INR)': i.amount || i.totalAmount,
        'Tax (INR)': i.taxAmount || 0,
        'Discount (INR)': i.discountAmount || 0,
        'Total Amount (INR)': i.totalAmount,
        'Status': i.status,
        'Due Date': i.dueDate
      }));
    } else if (reportType === 'Project') {
      data = projects.map(p => ({
        'Project Code': p.code,
        'Project Name': p.name,
        'Client': p.clientName,
        'Budget (INR)': p.budget,
        'Spent (INR)': p.spent,
        'Variance (INR)': p.budget - p.spent,
        'Status': p.status
      }));
    } else if (reportType === 'Employee') {
      data = teamMembers.map(m => ({
        'Employee Name': m.name,
        'Email Address': m.email,
        'Department': m.department,
        'Designation': m.title || 'Engineer',
        'Role': m.role,
        'Salary CTC': m.salaryLPA || '₹14 LPA'
      }));
    } else {
      data = clients.map(c => ({
        'Client Name': c.name,
        'Company': c.company,
        'Email': c.email,
        'Phone': c.phone,
        'GSTIN': c.gstNumber || c.gst || c.taxId,
        'Industry': c.industry,
        'Total Billed (INR)': c.totalBilled || 0
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${reportType} Report`);
    XLSX.writeFile(workbook, `WorkForge_${reportType}_Report.xlsx`);

    setExportedMsg(`Generated official Microsoft Excel (.xlsx) spreadsheet for ${reportType} Report.`);
    setTimeout(() => setExportedMsg(''), 4000);
  };

  // 3. Export PDF Report using jsPDF
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`EXECUTIVE ${reportType.toUpperCase()} REPORT`, 14, 20);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | WorkForge SaaS Platform`, 14, 28);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);

    let startY = 48;

    if (reportType === 'Revenue' || reportType === 'Invoice') {
      doc.setFont('helvetica', 'bold');
      doc.text('Invoice #', 14, startY);
      doc.text('Client', 50, startY);
      doc.text('Project', 100, startY);
      doc.text('Amount (INR)', 150, startY);
      doc.text('Status', 185, startY);

      doc.setFont('helvetica', 'normal');
      invoices.slice(0, 15).forEach((inv, idx) => {
        const y = startY + 8 + idx * 8;
        doc.text(String(inv.invoiceNumber || inv.id).substring(0, 15), 14, y);
        doc.text(String(inv.clientName).substring(0, 20), 50, y);
        doc.text(String(inv.projectName).substring(0, 20), 100, y);
        doc.text(`Rs. ${inv.totalAmount.toLocaleString('en-IN')}`, 150, y);
        doc.text(String(inv.status), 185, y);
      });
    } else if (reportType === 'Project') {
      doc.setFont('helvetica', 'bold');
      doc.text('Code', 14, startY);
      doc.text('Project Name', 45, startY);
      doc.text('Budget (INR)', 110, startY);
      doc.text('Spent (INR)', 150, startY);
      doc.text('Status', 185, startY);

      doc.setFont('helvetica', 'normal');
      projects.slice(0, 15).forEach((p, idx) => {
        const y = startY + 8 + idx * 8;
        doc.text(String(p.code || 'PRJ'), 14, y);
        doc.text(String(p.name).substring(0, 25), 45, y);
        doc.text(`Rs. ${p.budget.toLocaleString('en-IN')}`, 110, y);
        doc.text(`Rs. ${p.spent.toLocaleString('en-IN')}`, 150, y);
        doc.text(String(p.status), 185, y);
      });
    } else {
      doc.setFont('helvetica', 'bold');
      doc.text('Name', 14, startY);
      doc.text('Department / Company', 60, startY);
      doc.text('Contact', 120, startY);
      doc.text('Role / Status', 170, startY);

      doc.setFont('helvetica', 'normal');
      const dataset = reportType === 'Employee' ? teamMembers : clients;
      dataset.slice(0, 15).forEach((item, idx) => {
        const y = startY + 8 + idx * 8;
        doc.text(String(item.name).substring(0, 20), 14, y);
        doc.text(String(item.department || item.company || '').substring(0, 25), 60, y);
        doc.text(String(item.email || item.phone || '').substring(0, 25), 120, y);
        doc.text(String(item.role || item.status || 'Active'), 170, y);
      });
    }

    doc.save(`WorkForge_${reportType}_Report.pdf`);
    setExportedMsg(`Compiled and exported official PDF document for ${reportType} Report.`);
    setTimeout(() => setExportedMsg(''), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Business Intelligence & Compliance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Executive Reports & Data Export Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate and download financial, project margin, employee HR, and client account reports in PDF, Excel (.xlsx), and CSV formats.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportPDF}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={exportExcel}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {exportedMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center shadow-xs">
          <CheckCircle className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{exportedMsg}</span>
        </div>
      )}

      {/* Report Selector Tabs */}
      <div className="glass-panel p-4 rounded-xl flex items-center space-x-2 text-xs overflow-x-auto">
        {['Revenue', 'Invoice', 'Project', 'Employee', 'Client'].map(r => (
          <button
            key={r}
            onClick={() => setReportType(r)}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              reportType === r
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {r} Report
          </button>
        ))}
      </div>

      {/* Active Report Preview Panel */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
            Previewing: {reportType} Executive Report
          </h3>
          <span className="text-xs text-slate-500">Live Workspace Snapshot</span>
        </div>

        {reportType === 'Revenue' || reportType === 'Invoice' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Invoice #</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Project</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Discount</th>
                  <th className="pb-3">Total Billed</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {invoices.map(i => (
                  <tr key={i.id}>
                    <td className="py-3 font-bold text-blue-500">{i.invoiceNumber || `#${i.id}`}</td>
                    <td className="py-3 font-sans font-medium">{i.clientName}</td>
                    <td className="py-3 font-sans text-slate-500">{i.projectName}</td>
                    <td className="py-3">₹{(i.amount || i.totalAmount).toLocaleString('en-IN')}</td>
                    <td className="py-3 text-amber-500">₹{(i.discountAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 font-extrabold text-slate-900 dark:text-slate-100">₹{i.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        i.status === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                      }`}>
                        {i.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : reportType === 'Project' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Project</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Budget</th>
                  <th className="pb-3">Spent</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {projects.map(p => (
                  <tr key={p.id}>
                    <td className="py-3 font-mono text-blue-500 font-bold">{p.code}</td>
                    <td className="py-3 font-extrabold text-slate-900 dark:text-slate-100">{p.name}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{p.clientName}</td>
                    <td className="py-3 font-mono">₹{p.budget.toLocaleString('en-IN')}</td>
                    <td className="py-3 font-mono">₹{p.spent.toLocaleString('en-IN')}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : reportType === 'Employee' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Employee Name</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">CTC Salary</th>
                  <th className="pb-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {teamMembers.map(m => (
                  <tr key={m.id || m.email}>
                    <td className="py-3 font-bold text-slate-900 dark:text-slate-100">{m.name}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{m.department}</td>
                    <td className="py-3 text-slate-500">{m.email}</td>
                    <td className="py-3 font-mono font-bold text-emerald-600">{m.salaryLPA || '₹14.5 LPA'}</td>
                    <td className="py-3 font-bold text-indigo-600">{m.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Company</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Industry</th>
                  <th className="pb-3">GSTIN</th>
                  <th className="pb-3">Total Billed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {clients.map(c => (
                  <tr key={c.id}>
                    <td className="py-3 font-bold text-slate-900 dark:text-slate-100">{c.name}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{c.company}</td>
                    <td className="py-3 text-slate-500">{c.email}</td>
                    <td className="py-3">{c.industry}</td>
                    <td className="py-3 font-mono text-[11px]">{c.gstNumber || c.gst || c.taxId || 'N/A'}</td>
                    <td className="py-3 font-mono font-bold text-blue-600">₹{(c.totalBilled || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
