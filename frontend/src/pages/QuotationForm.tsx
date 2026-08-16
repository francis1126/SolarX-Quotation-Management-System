import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { quotationService } from '../services/quotationService';
import { productService } from '../services/productService';
import { settingsService } from '../services/settingsService';
import { Product, QuotationItem } from '../types';
import toast from 'react-hot-toast';

const QuotationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    customerName: '',
    customerCompany: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    quotationDate: new Date().toISOString().split('T')[0],
    discount: 0,
    vatRate: 12,
    isVatable: true,
    notes: '',
    termsAndConditions: '',
  });

  const [items, setItems] = useState<QuotationItem[]>([]);

  useEffect(() => {
    loadData();
    if (isEdit) {
      loadQuotation();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [productsData, settingsData] = await Promise.all([
        productService.getAll(),
        settingsService.get(),
      ]);
      setProducts(productsData.filter((p: Product) => p.status === 'active'));

      setFormData(prev => ({
        ...prev,
        vatRate: settingsData?.quotation.vatPercentage || 12,
        termsAndConditions: settingsData?.quotation.defaultTermsAndConditions || '',
      }));
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadQuotation = async () => {
    try {
      const quotation = await quotationService.getById(id!);
      setFormData({
        customerName: typeof quotation.customerId === 'object' ? quotation.customerId.name || '' : '',
        customerCompany: typeof quotation.customerId === 'object' ? quotation.customerId.companyName || '' : '',
        customerPhone: typeof quotation.customerId === 'object' ? quotation.customerId.phone || '' : '',
        customerEmail: typeof quotation.customerId === 'object' ? quotation.customerId.email || '' : '',
        customerAddress: typeof quotation.customerId === 'object' ? quotation.customerId.address || '' : '',
        quotationDate: new Date(quotation.quotationDate).toISOString().split('T')[0],
        discount: quotation.discount,
        vatRate: quotation.vatRate,
        isVatable: quotation.vatRate > 0,
        notes: quotation.notes || '',
        termsAndConditions: quotation.termsAndConditions || '',
      });
      setItems(quotation.items);
    } catch (error) {
      toast.error('Failed to load quotation');
    }
  };

  const addItem = () => {
    setItems([...items, {
      productCode: '',
      productName: '',
      description: '',
      quantity: 0,
      unit: '',
      unitPrice: 0,
      discount: 0,
      total: 0,
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Auto-populate product details when product is selected
    if (field === 'productId' && value) {
      const product = products.find(p => p._id === value);
      if (product) {
        updatedItems[index] = {
          ...updatedItems[index],
          productCode: product.productCode,
          productName: product.name,
          description: product.description || '',
          unit: product.unit,
          unitPrice: product.sellingPrice,
        };
      }
    }

    // Calculate item total
    const item = updatedItems[index];
    const total = (item.quantity * item.unitPrice) - (item.discount || 0);
    updatedItems[index] = { ...updatedItems[index], total };

    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discount = formData.discount;
    const vat = formData.isVatable ? (subtotal * (formData.vatRate / 100)) : 0;
    const grandTotal = subtotal - discount + vat;

    return { subtotal, discount, vat, grandTotal };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const totals = calculateTotals();
      const quotationData = {
        ...formData,
        customerName: formData.customerName,
        customerCompany: formData.customerCompany,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        customerAddress: formData.customerAddress,
        items,
        ...totals,
      };

      if (isEdit) {
        await quotationService.update(id!, quotationData);
        toast.success('Quotation updated successfully');
      } else {
        await quotationService.create(quotationData);
        toast.success('Quotation created successfully');
      }

      navigate('/quotations');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save quotation');
    } finally {
      setIsLoading(false);
    }
  };

  const totals = calculateTotals();

  if (isLoadingData) {
    return <div className="text-gray-500">Loading...</div>;
  }

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
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Quotation' : 'Create Quotation'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEdit ? 'Update quotation details' : 'Create a new quotation'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quotation Details */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quotation Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.customerCompany}
                  onChange={(e) => setFormData({ ...formData, customerCompany: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={formData.customerAddress}
                onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quotation Date *</label>
                <input
                  type="date"
                  value={formData.quotationDate}
                  onChange={(e) => setFormData({ ...formData, quotationDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVatable}
                    onChange={(e) => setFormData({ ...formData, isVatable: e.target.checked })}
                    className="w-5 h-5 text-solar-600 rounded focus:ring-solar-500"
                  />
                  <span className="text-sm font-medium text-gray-700">VATable</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 bg-solar-600 text-white px-3 py-2 rounded-lg hover:bg-solar-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No items added yet</p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                        <select
                          value={item.productId || ''}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                        >
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.productCode} - {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                        <input
                          type="number"
                          min="0"
                          value={item.quantity === 0 ? '' : item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                          placeholder="Enter quantity"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.discount}
                        onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                      <input
                        type="text"
                        value={formatCurrency(item.total)}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VAT Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.vatRate}
                  onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium">-{formatCurrency(totals.discount)}</span>
              </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">VAT ({formData.vatRate}%):</span>
              <span className="font-medium">{formatCurrency(totals.vat)}</span>
            </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>GRAND TOTAL:</span>
                <span>{formatCurrency(totals.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes & Terms</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
              <textarea
                value={formData.termsAndConditions}
                onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/quotations')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || items.length === 0}
            className="flex items-center justify-center gap-2 bg-solar-600 text-white px-6 py-3 rounded-lg hover:bg-solar-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Save'} Quotation
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuotationForm;
