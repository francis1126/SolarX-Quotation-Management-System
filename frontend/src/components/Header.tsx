import { User, Menu } from 'lucide-react';
import { authService } from '../services/authService';

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const user = authService.getCurrentUser();

  return (
    <header className="bg-white border-b border-gray-200 h-16 fixed right-0 top-0 left-0 lg:left-64 z-30">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">SolarX Management System</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-700">{user?.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
