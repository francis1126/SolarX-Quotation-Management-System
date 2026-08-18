import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Settings,
  Sun,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { 
      path: '/quotations', 
      icon: FileText, 
      label: 'Quotations',
      subItems: [
        { path: '/quotations', label: 'All Quotations' },
        { path: '/quotations/create', label: 'Create Quotation' },
      ]
    },
    { path: '/products', icon: Package, label: 'Solar Parts' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fade-in motion-reduce:animate-none"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 w-64`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-8 h-8 text-solar-600 animate-pulse-soft motion-reduce:animate-none" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">SolarX</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Solar Parts Quotation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li
                key={item.path}
                className="animate-slide-in-left motion-reduce:animate-none"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                {item.subItems ? (
                  <div>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:translate-x-1 ${
                        isActive(item.path) 
                          ? 'bg-solar-50 dark:bg-solar-900/50 text-solar-700 dark:text-solar-300 shadow-sm ring-1 ring-solar-200 dark:ring-solar-800' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/80'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.path}>
                          <Link
                            to={subItem.path}
                            onClick={onClose}
                            className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                              location.pathname === subItem.path 
                                ? 'bg-solar-50 dark:bg-solar-900 text-solar-700 dark:text-solar-300' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:translate-x-1 ${
                      isActive(item.path) 
                        ? 'bg-solar-50 dark:bg-solar-900/50 text-solar-700 dark:text-solar-300 shadow-sm ring-1 ring-solar-200 dark:ring-solar-800' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/80'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
