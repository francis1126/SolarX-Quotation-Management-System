import { useEffect, useState } from 'react';
import { formatCurrency } from '../utils/format';
import { quotationService } from '../services/quotationService';
import { DashboardStats } from '../types';
import { FileText, TrendingUp } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await quotationService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Failed to load dashboard</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Quotations', value: stats.total, icon: FileText, color: 'bg-blue-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your quotation management</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow-sm p-4 lg:p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-500">{card.label}</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`p-2 lg:p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Value Card */}
      <div className="bg-gradient-to-r from-solar-600 to-solar-700 rounded-lg shadow-sm p-4 lg:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs lg:text-sm font-medium text-solar-100">Total Quotation Value</p>
            <p className="text-2xl lg:text-4xl font-bold mt-2">{formatCurrency(stats.totalValue)}</p>
          </div>
          <TrendingUp className="w-10 h-10 lg:w-12 lg:h-12 text-solar-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent Quotations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Quotations</h2>
          </div>
          <div className="p-6">
            {stats.recentQuotations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No quotations yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentQuotations.map((quotation) => (
                  <div
                    key={quotation._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{quotation.quotationNumber}</p>
                      <p className="text-sm text-gray-500">
                        {typeof quotation.customerId === 'object' 
                          ? quotation.customerId.companyName || quotation.customerId.name 
                          : 'Unknown'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(quotation.grandTotal)}</p>
                      <StatusBadge status={quotation.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/quotations"
              className="text-solar-600 hover:text-solar-700 font-medium text-sm"
            >
              View all quotations →
            </Link>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Summary</h2>
          </div>
          <div className="p-6">
            {stats.monthlyStats.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No data available</p>
            ) : (
              <div className="space-y-4">
                {stats.monthlyStats.map((stat) => {
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const monthLabel = `${monthNames[stat._id.month - 1]} ${stat._id.year}`;
                  
                  return (
                    <div key={`${stat._id.year}-${stat._id.month}`} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{monthLabel}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(stat.total)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-solar-600 h-2 rounded-full"
                          style={{
                            width: `${(stat.total / Math.max(...stats.monthlyStats.map(s => s.total))) * 100}%`
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{stat.count} quotations</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
