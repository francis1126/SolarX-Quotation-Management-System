import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { customerService } from '../services/customerService';
import { Customer } from '../types';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const loadCustomers = async () => {
    try {
      const data = await customerService.getAll(search);
      setCustomers(data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer._id, formData);
        toast.success('Customer updated successfully');
      } else {
        await customerService.create(formData);
        toast.success('Customer added successfully');
      }

      setIsModalOpen(false);
      setEditingCustomer(null);
      resetForm();
      loadCustomers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      companyName: customer.companyName || '',
      contactPerson: customer.contactPerson || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      await customerService.delete(id);
      toast.success('Customer deleted successfully');
      loadCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    });
  };

  const handleOpenModal = () => {
    resetForm();
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-solar-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Customers</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your customer database</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-solar-600 text-white px-4 py-2 rounded-lg hover:bg-solar-700 transition-all duration-200 hover:shadow-md w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Customers Table - Desktop */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No customers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Person</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-50">{customer.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{customer.companyName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{customer.contactPerson || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{customer.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{customer.email || '-'}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button onClick={() => handleEdit(customer)} className="text-solar-600 dark:text-solar-400 hover:text-solar-700 dark:hover:text-solar-300 mr-3 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(customer._id)} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
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

      {/* Customers - Mobile Cards */}
      <div className="md:hidden space-y-4">
        {customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">No customers found</div>
        ) : (
          customers.map((customer) => (
            <div key={customer._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-50">{customer.name}</h3>
                {customer.companyName && <p className="text-sm text-gray-500 dark:text-gray-400">{customer.companyName}</p>}
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {customer.contactPerson && (
                  <div><span className="text-gray-500 dark:text-gray-400">Contact: </span><span className="text-gray-900 dark:text-gray-50">{customer.contactPerson}</span></div>
                )}
                {customer.phone && (
                  <div><span className="text-gray-500 dark:text-gray-400">Phone: </span><span className="text-gray-900 dark:text-gray-50">{customer.phone}</span></div>
                )}
                {customer.email && (
                  <div><span className="text-gray-500 dark:text-gray-400">Email: </span><span className="text-gray-900 dark:text-gray-50">{customer.email}</span></div>
                )}
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => handleEdit(customer)} className="flex-1 flex items-center justify-center gap-1 bg-solar-50 dark:bg-solar-900/50 text-solar-700 dark:text-solar-300 px-3 py-2 rounded-lg text-sm">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => handleDelete(customer._id)} className="flex-1 flex items-center justify-center gap-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-sm">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Person</label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-solar-600 text-white rounded-lg hover:bg-solar-700 transition-colors"
            >
              {editingCustomer ? 'Update' : 'Add'} Customer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
