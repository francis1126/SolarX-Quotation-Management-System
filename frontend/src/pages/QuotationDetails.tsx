import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Edit2, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';
import { quotationService } from '../services/quotationService';
import { Quotation } from '../types';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const QuotationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuotation();
  }, [id]);

  const loadQuotation = async () => {
    try {
      const data = await quotationService.getById(id!);
      setQuotation(data);
    } catch (error) {
      toast.error('Failed to load quotation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!quotation) return;

    try {
      const blob = await quotationService.downloadPDF(quotation._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quotation-${quotation.quotationNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div className="text-gray-500 dark:text-gray-400">Loading quotation...</div>;
  }

  if (!quotation) {
    return <div className="text-gray-500 dark:text-gray-400">Quotation not found</div>;
  }

  const customer = typeof quotation.customerId === 'object' ? quotation.customerId : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate('/quotations')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">{quotation.quotationNumber}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Quotation Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 px-3 py-1 rounded-lg text-sm sm:px-4 sm:py-2 sm:text-base hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 print-hidden"
          >
            <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-solar-600 text-white px-3 py-1 rounded-lg text-sm sm:px-4 sm:py-2 sm:text-base hover:bg-solar-700 transition-colors print-hidden"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            Download
          </button>
          
          <Link
            to={`/quotations/${quotation._id}/edit`}
            className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 px-3 py-1 rounded-lg text-sm sm:px-4 sm:py-2 sm:text-base hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 print-hidden"
          >
            <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
            Edit
          </Link>
        </div>
      </div>

      <div className="printable-section bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-8 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 pb-8 border-b border-gray-200 dark:border-gray-700 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">QUOTATION</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{quotation.quotationNumber}</p>
          </div>
          <div className="text-right w-full sm:w-auto">
            <StatusBadge status={quotation.status} />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Date: {formatDate(quotation.quotationDate)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Valid Until: {quotation.validUntil ? formatDate(quotation.validUntil) : 'Not specified'}
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Bill To</h3>
          {customer ? (
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-50">{customer.companyName || customer.name}</p>
              {customer.contactPerson && <p className="text-gray-600 dark:text-gray-400">{customer.contactPerson}</p>}
              {customer.address && <p className="text-gray-600 dark:text-gray-400">{customer.address}</p>}
              {customer.phone && <p className="text-gray-600 dark:text-gray-400">{customer.phone}</p>}
              {customer.email && <p className="text-gray-600 dark:text-gray-400">{customer.email}</p>}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Customer information not available</p>
          )}
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Items</h3>
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Item</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Description</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Qty</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Unit</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Price</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Discount</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-4 text-sm text-gray-900 dark:text-gray-50">{item.productCode}</td>
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="font-medium text-gray-900 dark:text-gray-50">{item.productName}</div>
                      {item.description && <div className="text-xs">{item.description}</div>}
                    </td>
                    <td className="py-4 text-sm text-gray-900 dark:text-gray-50 text-right">{item.quantity}</td>
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400 text-right">{item.unit}</td>
                    <td className="py-4 text-sm text-gray-900 dark:text-gray-50 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400 text-right">{item.discount ? formatCurrency(item.discount) : '-'}</td>
                    <td className="py-4 text-sm font-medium text-gray-900 dark:text-gray-50 text-right">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Card View */}
          <div className="sm:hidden space-y-4">
            {quotation.items.map((item, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-50">{item.productCode}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.productName}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{formatCurrency(item.total)}</p>
                </div>
                {item.description && <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Qty</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{item.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Unit Price</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{formatCurrency(item.unitPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Unit</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{item.unit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="font-medium text-gray-900 dark:text-gray-50">{formatCurrency(quotation.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Discount:</span>
              <span className="font-medium text-gray-900 dark:text-gray-50">-{formatCurrency(quotation.discount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">VAT ({quotation.vatRate}%):</span>
              <span className="font-medium text-gray-900 dark:text-gray-50">{formatCurrency(quotation.vat)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-50 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>Total:</span>
              <span>{formatCurrency(quotation.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quotation.notes && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Notes</h3>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{quotation.notes}</p>
          </div>
        )}

        {/* Terms */}
        {quotation.termsAndConditions && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Terms & Conditions</h3>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{quotation.termsAndConditions}</p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            This quotation is valid until {quotation.validUntil ? formatDate(quotation.validUntil) : 'not specified'}
          </p>
          <p className="mt-1">Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetails;
