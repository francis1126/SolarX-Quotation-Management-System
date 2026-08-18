import { useEffect, useState } from 'react';
import { Save, LogOut } from 'lucide-react';
import { settingsService } from '../services/settingsService';
import { authService } from '../services/authService';
import { Settings } from '../types';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsService.get();
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      await settingsService.update(settings);
      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-solar-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return <div className="text-gray-500 dark:text-gray-400">No settings found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage company and quotation settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Company Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
              <input
                type="text"
                value={settings.company.name}
                onChange={(e) => setSettings({
                  ...settings,
                  company: { ...settings.company, name: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <textarea
                value={settings.company.address}
                onChange={(e) => setSettings({
                  ...settings,
                  company: { ...settings.company, address: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={settings.company.phone}
                  onChange={(e) => setSettings({
                    ...settings,
                    company: { ...settings.company, phone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={settings.company.email}
                  onChange={(e) => setSettings({
                    ...settings,
                    company: { ...settings.company, email: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                <input
                  type="url"
                  value={settings.company.website}
                  onChange={(e) => setSettings({
                    ...settings,
                    company: { ...settings.company, website: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TIN</label>
                <input
                  type="text"
                  value={settings.company.tin}
                  onChange={(e) => setSettings({
                    ...settings,
                    company: { ...settings.company, tin: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quotation Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Quotation Settings</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Validity Period (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={settings.quotation.defaultValidityDays}
                  onChange={(e) => setSettings({
                    ...settings,
                    quotation: { ...settings.quotation, defaultValidityDays: parseInt(e.target.value) || 30 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">VAT Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={settings.quotation.vatPercentage}
                  onChange={(e) => setSettings({
                    ...settings,
                    quotation: { ...settings.quotation, vatPercentage: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quotation Prefix</label>
              <input
                type="text"
                value={settings.quotation.prefix || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  quotation: { ...settings.quotation, prefix: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                placeholder="QT"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Terms & Conditions</label>
              <textarea
                value={settings.quotation.defaultTermsAndConditions}
                onChange={(e) => setSettings({
                  ...settings,
                  quotation: { ...settings.quotation, defaultTermsAndConditions: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                rows={4}
                placeholder="Enter default terms and conditions for quotations..."
              />
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Currency Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency Code</label>
              <input
                type="text"
                value={settings.currency?.code || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  currency: { ...settings.currency, code: e.target.value, symbol: settings.currency?.symbol || '₱' }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                placeholder="PHP"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={settings.currency?.symbol || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  currency: { ...settings.currency, symbol: e.target.value, code: settings.currency?.code || 'PHP' }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                placeholder="₱"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              authService.logout();
              window.location.href = '/login';
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-solar-600 text-white px-6 py-3 rounded-lg hover:bg-solar-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
