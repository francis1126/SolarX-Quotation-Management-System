import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { authService } from '../services/authService';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login(formData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-solar-50/30 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-solar-400/10 dark:bg-solar-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-solar-600/10 dark:bg-solar-600/5 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-700" />
          )}
        </button>
      </div>

      <div className="max-w-md w-full relative z-10 animate-scale-in motion-reduce:animate-none">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/80 dark:border-gray-700/80 p-8">
          <div className="flex items-center justify-center gap-3 mb-8 animate-slide-in-down motion-reduce:animate-none">
            <div className="p-2 bg-solar-100 dark:bg-solar-900/50 rounded-xl">
              <Sun className="w-8 h-8 text-solar-600 dark:text-solar-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">SolarX</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Solar Parts Quotation Management</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-slide-in-up motion-reduce:animate-none" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent transition-shadow"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="animate-slide-in-up motion-reduce:animate-none" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-2 focus:ring-solar-500 focus:border-transparent transition-shadow"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-solar-600 dark:bg-solar-700 text-white py-3 rounded-xl font-medium hover:bg-solar-700 dark:hover:bg-solar-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg animate-slide-in-up motion-reduce:animate-none"
              style={{ animationDelay: '200ms', animationFillMode: 'both' }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center animate-fade-in motion-reduce:animate-none" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-solar-600 dark:text-solar-400 hover:text-solar-700 dark:hover:text-solar-300 font-medium transition-colors"
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
