import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Download,
  IndianRupee,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  X,
  Printer
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function InvoiceMgmtPage() {
  const { invoices, clients, projects, addInvoice, updateInvoiceStatus } = useData();
  const { currentOrg, apiFetch } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const statuses = ['All', 'Draft', 'Sent', 'Paid', 'Overdue'];

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.id.toLowerCase().includes(search.toLowerCase()) ||
                          inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
                          inv.projectName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const [processingPaymentId, setProcessingPaymentId] = useState(null);

  const handleOnlinePayment = async (inv) => {
    setProcessingPaymentId(inv.id);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setProcessingPaymentId(null);
        return;
      }

      // 1. Create Razorpay order on the backend
      const { res: orderRes, data: orderData } = await apiFetch('/payments/razorpay-order', {
        method: 'POST',
        body: JSON.stringify({ invoiceId: inv.id })
      });

      if (!orderRes.ok) {
        alert(orderData.message || 'Failed to initialize Razorpay payment order. Check if Razorpay integration settings are Connected in Integrations.');
        setProcessingPaymentId(null);
        return;
      }

      const { keyId, orderId, amount, currency } = orderData;

      // 2. Configure checkout overlay
      const options = {
        key: keyId,
        amount,
        currency,
        name: currentOrg.name || 'WorkForge Enterprise',
        description: `Invoice #${inv.invoiceNumber || inv.id} Payment`,
        order_id: orderId,
        handler: async function (response) {
          // 3. Verify Signature on payment success
          const { res: verifyRes, data: verifyData } = await apiFetch('/payments/razorpay-verify', {
            method: 'POST',
            body: JSON.stringify({
              invoiceId: inv.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
          });

          if (verifyRes.ok && verifyData.success) {
            // Update local state and backend via existing updateInvoiceStatus helper
            await updateInvoiceStatus(inv.id, 'Paid');
            alert('Payment successfully verified and invoice marked as Paid!');
          } else {
            alert(verifyData.message || 'Payment signature verification failed.');
          }
          setProcessingPaymentId(null);
        },
        prefill: {
          name: inv.clientName || '',
          email: '',
        },
        theme: {
          color: '#2563eb' // Indigo/Blue color matching theme
        },
        modal: {
          ondismiss: function () {
            setProcessingPaymentId(null);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Error during online payment', error);
      alert('An error occurred while launching Razorpay payment window.');
      setProcessingPaymentId(null);
    }
  };

  const [newInvoice, setNewInvoice] = useState({
    clientId: clients[0]?.id || '',
    projectId: projects[0]?.id || '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '2026-09-01',
    status: 'Sent',
    taxRate: 10,
    discountAmount: 0,
    paymentMethod: 'ACH Direct Bank Transfer',
    lineItems: [
      { description: 'Sprint Deliverable Development & QA', quantity: 80, rate: 250, amount: 20000 },
    ],
  });

  React.useEffect(() => {
    if (clients.length > 0 && !newInvoice.clientId) {
      setNewInvoice(prev => ({ ...prev, clientId: clients[0].id }));
    }
  }, [clients]);

  React.useEffect(() => {
    if (projects.length > 0 && !newInvoice.projectId) {
      setNewInvoice(prev => ({ ...prev, projectId: projects[0].id }));
    }
  }, [projects]);

  const handleAddLineItem = () => {
    setNewInvoice({
      ...newInvoice,
      lineItems: [...newInvoice.lineItems, { description: '', quantity: 1, rate: 100, amount: 100 }]
    });
  };

  const handleRemoveLineItem = (idx) => {
    const updated = newInvoice.lineItems.filter((_, i) => i !== idx);
    setNewInvoice({ ...newInvoice, lineItems: updated });
  };

  const handleLineItemChange = (idx, field, value) => {
    const updated = [...newInvoice.lineItems];
    updated[idx][field] = value;
    if (field === 'quantity' || field === 'rate') {
      updated[idx].amount = (updated[idx].quantity || 0) * (updated[idx].rate || 0);
    }
    setNewInvoice({ ...newInvoice, lineItems: updated });
  };

  // Calculate totals
  const subtotal = newInvoice.lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxAmount = (subtotal * newInvoice.taxRate) / 100;
  const totalAmount = subtotal + taxAmount - newInvoice.discountAmount;

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!newInvoice.clientId) {
      alert('A valid Client must be selected. If you do not have any clients, please onboard one first in the Client Directory.');
      return;
    }
    const client = clients.find(c => c.id === newInvoice.clientId);
    const project = projects.find(p => p.id === newInvoice.projectId);

    addInvoice({
      ...newInvoice,
      clientName: client ? client.name : 'Client Entity',
      projectName: project ? project.name : 'Project Contract',
      subtotal,
      taxAmount,
      totalAmount,
      currency: 'INR',
    });
    setShowAddModal(false);
  };

  // PDF Generator Function
  const generatePDFInvoice = (inv) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(currentOrg.name, 14, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('INVOICE / BILLING STATEMENT', 14, 32);

    doc.setFontSize(16);
    doc.text(`#${inv.id}`, 196, 22, { align: 'right' });
    doc.setFontSize(9);
    doc.text(`Status: ${inv.status.toUpperCase()}`, 196, 32, { align: 'right' });

    // Client & Date Info
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Billed To:', 14, 52);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(inv.clientName, 14, 60);
    doc.text(`Project: ${inv.projectName}`, 14, 67);

    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Details:', 140, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(`Issue Date: ${inv.issueDate}`, 140, 60);
    doc.text(`Due Date: ${inv.dueDate}`, 140, 67);

    // Line Items Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, 80, 182, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Description', 18, 86);
    doc.text('Qty / Hrs', 120, 86);
    doc.text('Rate', 150, 86);
    doc.text('Amount', 185, 86, { align: 'right' });

    // Table Content
    let yPos = 98;
    inv.lineItems.forEach((item) => {
      doc.setFont('helvetica', 'normal');
      doc.text(item.description, 18, yPos);
      doc.text(`${item.quantity}`, 120, yPos);
      doc.text(`Rs. ${item.rate}`, 150, yPos);
      doc.text(`Rs. ${item.amount.toLocaleString('en-IN')}`, 192, yPos, { align: 'right' });
      yPos += 10;
    });

    // Summary Box
    doc.setLineWidth(0.5);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, yPos + 5, 196, yPos + 5);

    yPos += 15;
    doc.text(`Subtotal:`, 140, yPos);
    doc.text(`Rs. ${inv.subtotal.toLocaleString('en-IN')}`, 192, yPos, { align: 'right' });

    yPos += 7;
    doc.text(`GST (${inv.taxRate}%):`, 140, yPos);
    doc.text(`Rs. ${inv.taxAmount.toLocaleString('en-IN')}`, 192, yPos, { align: 'right' });

    if (inv.discountAmount > 0) {
      yPos += 7;
      doc.text(`Discount:`, 140, yPos);
      doc.text(`-Rs. ${inv.discountAmount.toLocaleString('en-IN')}`, 192, yPos, { align: 'right' });
    }

    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Total Amount Due:`, 140, yPos);
    doc.text(`Rs. ${inv.totalAmount.toLocaleString('en-IN')}`, 192, yPos, { align: 'right' });

    // Payment Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Payment Instructions: ${inv.paymentMethod}`, 14, 270);
    doc.text(`Thank you for doing business with ${currentOrg.name}. Encrypted SaaS Invoice standard v3.4.`, 14, 276);

    doc.save(`Invoice_${inv.id}.pdf`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Financial Operations</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Invoice Management & PDF Billing
          </h1>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
            Generate client invoices, track receivable collections, calculate taxes, and export PDF billing statements.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-transparent focus:border-blue-500 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none"
            placeholder="Search invoice #, client, or project..."
          />
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-700 dark:text-slate-300 font-bold">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-transparent rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
          >
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-panel p-4 sm:p-6 rounded-xl overflow-x-auto touch-scroll">
        <table className="w-full min-w-[650px] text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 uppercase tracking-wider font-extrabold text-[11px]">
              <th className="pb-3">Invoice ID</th>
              <th className="pb-3">Client & Project</th>
              <th className="pb-3">Issue Date</th>
              <th className="pb-3">Due Date</th>
              <th className="pb-3">Total Amount</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">PDF & Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
            {filteredInvoices.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                  #{inv.id}
                </td>
                <td className="py-3 font-bold text-slate-900 dark:text-slate-100">
                  <div>{inv.clientName}</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">{inv.projectName}</div>
                </td>
                <td className="py-3 font-mono text-slate-700 dark:text-slate-300 font-medium">{inv.issueDate}</td>
                <td className="py-3 font-mono text-slate-700 dark:text-slate-300 font-medium">{inv.dueDate}</td>
                <td className="py-3 font-mono font-extrabold text-slate-900 dark:text-slate-100">
                  ₹{inv.totalAmount.toLocaleString('en-IN')}
                </td>
                <td className="py-3">
                  <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider border ${
                    inv.status === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' :
                    inv.status === 'Overdue' ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800' :
                    inv.status === 'Sent' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800' :
                    'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => generatePDFInvoice(inv)}
                      className="flex items-center space-x-1 px-3 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-lg text-slate-800 dark:text-slate-200 font-bold transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>

                     {inv.status !== 'Paid' && (
                      <>
                        <button
                          onClick={() => handleOnlinePayment(inv)}
                          disabled={processingPaymentId === inv.id}
                          className="flex items-center space-x-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[10px] disabled:opacity-50 transition-colors"
                        >
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span>{processingPaymentId === inv.id ? 'Processing...' : 'Pay Online'}</span>
                        </button>
                        
                        <button
                          onClick={() => updateInvoiceStatus(inv.id, 'Paid')}
                          className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 rounded-lg font-bold text-[10px]"
                        >
                          Mark Paid
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Invoice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Create Enterprise Invoice</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Select Client</label>
                  <select
                    value={newInvoice.clientId}
                    onChange={(e) => setNewInvoice({ ...newInvoice, clientId: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
                  >
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Associated Project</label>
                  <select
                    value={newInvoice.projectId}
                    onChange={(e) => setNewInvoice({ ...newInvoice, projectId: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
                  >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={newInvoice.issueDate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, issueDate: e.target.value })}
                    className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={newInvoice.taxRate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, taxRate: +e.target.value })}
                    className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Dynamic Line Items Builder */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                  <span>Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
                  </button>
                </div>

                {newInvoice.lineItems.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Item description..."
                      value={item.description}
                      onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                      className="flex-1 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                    />
                    <input
                      type="number"
                      placeholder="Qty/Hrs"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(idx, 'quantity', +e.target.value)}
                      className="w-16 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                    />
                    <input
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => handleLineItemChange(idx, 'rate', +e.target.value)}
                      className="w-20 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                    />
                    <span className="w-20 text-right font-mono font-bold">₹{item.amount.toLocaleString()}</span>
                    {newInvoice.lineItems.length > 1 && (
                      <button type="button" onClick={() => handleRemoveLineItem(idx)} className="text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-1 text-right font-mono text-xs text-slate-900 dark:text-slate-100">
                <div>Subtotal: ₹{subtotal.toLocaleString()}</div>
                <div>Tax ({newInvoice.taxRate}%): ₹{taxAmount.toLocaleString()}</div>
                <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400">Total: ₹{totalAmount.toLocaleString()}</div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 font-semibold hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Save & Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
