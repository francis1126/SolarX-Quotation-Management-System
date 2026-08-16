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
    return <div className="text-gray-500">Loading quotation...</div>;
  }

  if (!quotation) {
    return <div className="text-gray-500">Quotation not found</div>;
  }

  const customer = typeof quotation.customerId === 'object' ? quotation.customerId : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/quotations')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{quotation.quotationNumber}</h1>
                  <p className="text-gray-500 mt-1">Quotation Details</p>
                </div>
              </div>
          <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-solar-600 text-white px-3 py-1 rounded-lg text-sm sm:px-4 sm:py-2 sm:text-base hover:bg-solar-700 transition-colors"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 border border-gray-300 px-3 py-1 rounded-lg text-sm sm:px-4 sm:py-2 sm:text-base hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
            Print
          </button>
          <Link
            to={`/quotations/${quotation._id}/edit`}
            className="flex items-center gap-2 border border-gray-300 px-3 py-1 rounded-lg text-sm sm:px-4 sm:py-2 sm:text-base hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
            Edit
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">QUOTATION</h2>
            <p className="text-gray-500 mt-1">{quotation.quotationNumber}</p>
          </div>
          <div className="text-right">
            <StatusBadge status={quotation.status} />
            <p className="text-sm text-gray-500 mt-2">
              Date: {formatDate(quotation.quotationDate)}
            </p>
            <p className="text-sm text-gray-500">
              Valid Until: {quotation.validUntil ? formatDate(quotation.validUntil) : 'Not specified'}
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill To</h3>
          {customer ? (
            <div>
              <p className="font-medium text-gray-900">{customer.companyName || customer.name}</p>
              {customer.contactPerson && <p className="text-gray-600">{customer.contactPerson}</p>}
              {customer.address && <p className="text-gray-600">{customer.address}</p>}
              {customer.phone && <p className="text-gray-600">{customer.phone}</p>}
              {customer.email && <p className="text-gray-600">{customer.email}</p>}
            </div>
          ) : (
            <p className="text-gray-500">Customer information not available</p>
          )}
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
          <table className="w-full">
            <thead>
                <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-500">Item</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Description</th>
                <th className="text-right py-3 text-sm font-medium text-gray-500">Qty</th>
                <th className="hidden sm:table-cell text-right py-3 text-sm font-medium text-gray-500">Unit</th>
                <th className="hidden sm:table-cell text-right py-3 text-sm font-medium text-gray-500">Price</th>
                <th className="hidden sm:table-cell text-right py-3 text-sm font-medium text-gray-500">Discount</th>
                <th className="hidden sm:table-cell text-right py-3 text-sm font-medium text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                  <td className="py-4 text-sm text-gray-900">{item.productCode}</td>
                  <td className="py-4 text-sm text-gray-600">
                    <div className="font-medium">{item.productName}</div>
                    {item.description && <div className="text-xs">{item.description}</div>}
                  </td>
                  <td className="py-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                  <td className="hidden sm:table-cell py-4 text-sm text-gray-600 text-right">{item.unit}</td>
                  <td className="hidden sm:table-cell py-4 text-sm text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="hidden sm:table-cell py-4 text-sm text-gray-600 text-right">{item.discount ? formatCurrency(item.discount) : '-'}</td>
                  <td className="hidden sm:table-cell py-4 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(quotation.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="font-medium">-{formatCurrency(quotation.discount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">VAT ({quotation.vatRate}%):</span>
              <span className="font-medium">{formatCurrency(quotation.vat)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>{formatCurrency(quotation.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {quotation.notes && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{quotation.notes}</p>
          </div>
        )}

        {/* Terms */}
        {quotation.termsAndConditions && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{quotation.termsAndConditions}</p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
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
