import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import PageTransition from './PageTransition';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <main className="lg:ml-64 mt-16 p-3 sm:p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
};

export default Layout;
