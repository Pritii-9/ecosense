import { LayoutDashboard, Leaf, Trophy, Map, LogOut, Bell, Sun, Moon } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

export const Layout = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-brand-surface dark:bg-dark-bg transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-dark-border bg-white/70 dark:bg-dark-surface/70 backdrop-blur-xl transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-8">
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-dark text-brand-primary shadow-lg shadow-emerald-900/20">
                <Leaf size={20} fill="currentColor" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-dark-text-heading">EcoSense</span>
            </div>

            <nav className="hidden items-center gap-1 md:flex">
              {[
                { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                { label: 'Impact', path: '/impact', icon: Leaf },
                { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
                { label: 'Map', path: '/map', icon: Map },
              ].map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => {
                    const activeClasses = 'bg-slate-100 dark:bg-dark-card text-brand-dark dark:text-brand-primary'
                    const inactiveClasses = 'text-slate-500 dark:text-dark-text-muted hover:text-slate-900 dark:hover:text-dark-text-heading'
                    return `flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all rounded-lg ${isActive ? activeClasses : inactiveClasses}`
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-5">
            <button className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-slate-900 dark:hover:text-dark-text-heading transition-colors">
              <Bell size={20} />
            </button>
            
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-slate-900 dark:hover:text-dark-text-heading transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-dark-card"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="h-8 w-px bg-slate-200 dark:bg-dark-border mx-1" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 dark:text-dark-text-heading">{user?.name}</p>
                <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">{user?.total_points} Points</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-dark-card border-2 border-white dark:border-dark-border shadow-sm flex items-center justify-center font-bold text-brand-dark dark:text-brand-primary">
                {user?.name?.charAt(0)}
              </div>
              <button onClick={() => { logout(); navigate('/login'); }} className="ml-2 text-slate-400 dark:text-dark-text-muted hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-8 animate-in fade-in duration-1000">
        <Outlet />
      </main>
    </div>
  );
};
