import { User, Menu, Moon, Sun } from 'lucide-react';
import { authService } from '../services/authService';
import { useTheme } from '../context/ThemeContext';

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const user = authService.getCurrentUser();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 fixed right-0 top-0 left-0 lg:left-64 z-30 shadow-sm transition-all duration-300">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="hidden sm:block text-lg font-semibold bg-gradient-to-r from-solar-600 to-solar-700 bg-clip-text text-transparent">
            SolarX Management System
          </h2>
          <h2 className="sm:hidden text-base font-semibold bg-gradient-to-r from-solar-600 to-solar-700 bg-clip-text text-transparent">
            SolarX
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300 transition-transform hover:-rotate-12" />
            )}
          </button>
          
          <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-700">
            <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span className="hidden md:inline text-sm text-gray-700 dark:text-gray-300 font-medium">{user?.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
