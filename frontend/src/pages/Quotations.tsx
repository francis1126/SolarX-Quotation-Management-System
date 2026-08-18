import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Download, Eye, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';
import { quotationService } from '../services/quotationService';
import { Quotation } from '../types';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

const Quotations = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadQuotations();
  }, [search, statusFilter]);

  const loadQuotations = async () => {
    try {
      const data = await quotationService.getAll(search, statusFilter);
      setQuotations(data);
    } catch (error) {
      toast.error('Failed to load quotations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async (id: string, quotationNumber: string) => {
    try {
      const blob = await quotationService.downloadPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quotation-${quotationNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quotation?')) return;

    try {
      await quotationService.delete(id);
      toast.success('Quotation deleted successfully');
      loadQuotations();
    } catch (error) {
      toast.error('Failed to delete quotation');
    }
  };

  if (isLoading) {
    return <div className="text-gray-500 dark:text-gray-400">Loading quotations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">All Quotations</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your quotations</p>
        </div>
        <Link
          to="/quotations/create"
          className="flex items-center gap-2 bg-solar-600 text-white px-4 py-2 rounded-lg hover:bg-solar-700 transition-colors w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus className="w-4 h-4" />
          Create Quotation
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search quotations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Quotations - Desktop Table */}
      <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {quotations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No quotations found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quotation No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {quotations.map((quotation) => (
                  <tr key={quotation._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-50">
                      {quotation.quotationNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-50">
                      {quotation.customerName || quotation.customerCompany || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(quotation.quotationDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {quotation.validUntil ? formatDate(quotation.validUntil) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-50">
                      {formatCurrency(quotation.grandTotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={quotation.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link
                        to={`/quotations/${quotation._id}`}
                        className="text-solar-600 dark:text-solar-400 hover:text-solar-700 dark:hover:text-solar-300 transition-colors"
                      >
                        <Eye className="w-4 h-4 inline" />
                      </Link>
                      <button
                        onClick={() => handleDownloadPDF(quotation._id, quotation.quotationNumber)}
                        className="text-solar-600 dark:text-solar-400 hover:text-solar-700 dark:hover:text-solar-300 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/quotations/${quotation._id}/edit`}
                        className="text-solar-600 dark:text-solar-400 hover:text-solar-700 dark:hover:text-solar-300 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </Link>
                      <button
                        onClick={() => handleDelete(quotation._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quotations - Mobile Card View */}
      <div className="sm:hidden space-y-4">
        {quotations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No quotations found</div>
        ) : (
          quotations.map((quotation) => (
            <div
              key={quotation._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-3"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-50">{quotation.quotationNumber}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{quotation.customerName || quotation.customerCompany || 'Unknown'}</p>
                </div>
                <StatusBadge status={quotation.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Date</p>
                  <p className="font-medium text-gray-900 dark:text-gray-50">{formatDate(quotation.quotationDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Total</p>
                  <p className="font-medium text-gray-900 dark:text-gray-50">{formatCurrency(quotation.grandTotal)}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Valid Until</p>
                  <p className="font-medium text-gray-900 dark:text-gray-50">{quotation.validUntil ? formatDate(quotation.validUntil) : '-'}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to={`/quotations/${quotation._id}`}
                  className="flex-1 flex items-center justify-center gap-1 bg-solar-50 dark:bg-solar-900 text-solar-700 dark:text-solar-300 px-3 py-2 rounded text-sm hover:bg-solar-100 dark:hover:bg-solar-800 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                <button
                  onClick={() => handleDownloadPDF(quotation._id, quotation.quotationNumber)}
                  className="flex-1 flex items-center justify-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                <Link
                  to={`/quotations/${quotation._id}/edit`}
                  className="flex-1 flex items-center justify-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(quotation._id)}
                  className="flex-1 flex items-center justify-center gap-1 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-2 rounded text-sm hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Quotations;
