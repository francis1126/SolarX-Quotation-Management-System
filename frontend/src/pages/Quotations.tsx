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
    return <div className="text-gray-500">Loading quotations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Quotations</h1>
          <p className="text-gray-500 mt-1">Manage your quotations</p>
        </div>
        <Link
          to="/quotations/create"
          className="flex items-center gap-2 bg-solar-600 text-white px-4 py-2 rounded-lg hover:bg-solar-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Quotation
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search quotations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent"
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

      {/* Quotations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {quotations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No quotations found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quotation No.
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quotations.map((quotation) => (
                  <tr key={quotation._id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {quotation.quotationNumber}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                      {quotation.customerName || quotation.customerCompany || 'Unknown'}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(quotation.quotationDate)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quotation.validUntil ? formatDate(quotation.validUntil) : '-'}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(quotation.grandTotal)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={quotation.status} />
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/quotations/${quotation._id}`}
                        className="text-solar-600 hover:text-solar-700 mr-2 lg:mr-3"
                      >
                        <Eye className="w-4 h-4 inline" />
                      </Link>
                      <button
                        onClick={() => handleDownloadPDF(quotation._id, quotation.quotationNumber)}
                        className="text-solar-600 hover:text-solar-700 mr-2 lg:mr-3"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/quotations/${quotation._id}/edit`}
                        className="text-solar-600 hover:text-solar-700 mr-2 lg:mr-3"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </Link>
                      <button
                        onClick={() => handleDelete(quotation._id)}
                        className="text-red-600 hover:text-red-700"
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
    </div>
  );
};

export default Quotations;
