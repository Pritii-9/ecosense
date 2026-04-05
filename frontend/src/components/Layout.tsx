import { LayoutDashboard, Leaf, Trophy, Map, LogOut, Bell, Sun, Moon } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

const currentYear = new Date().getFullYear();

export const Layout = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Impact', path: '/impact', icon: Leaf },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Map', path: '/map', icon: Map },
  ];


  return (
    <div className="flex flex-col min-h-screen bg-brand-surface dark:bg-dark-bg transition-colors duration-300">
      {/* Professional Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-dark-border/50 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl transition-colors duration-300 shadow-sm">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6 lg:px-12">
          
          {/* Logo & Navigation */}
          <div className="flex items-center gap-10">
            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 group-hover:shadow-emerald-500/40 group-hover:scale-105">
                <Leaf size={20} fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-dark-text-heading leading-none">EcoSense</span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-dark-text-muted uppercase tracking-widest leading-none mt-0.5">Sustainability Platform</span>
              </div>
            </NavLink>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => {
                    return `group flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                      isActive 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                        : 'text-slate-600 dark:text-dark-text-muted hover:text-slate-900 dark:hover:text-dark-text-heading hover:bg-slate-50 dark:hover:bg-dark-card/50'
                    }`
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} className={`transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-dark-text-muted group-hover:text-slate-600 dark:group-hover:text-dark-text-heading'}`} />
                      {item.label}
                      {isActive && <span className="absolute -bottom-[14px] left-1/2 -translate-x-1/2 w-5 h-0.5 bg-emerald-500 rounded-full" />}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2.5 text-slate-500 dark:text-dark-text-muted hover:text-slate-700 dark:hover:text-dark-text-heading hover:bg-slate-100 dark:hover:bg-dark-card rounded-xl transition-all duration-200">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-dark-surface" />
            </button>
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 text-slate-500 dark:text-dark-text-muted hover:text-slate-700 dark:hover:text-dark-text-heading hover:bg-slate-100 dark:hover:bg-dark-card rounded-xl transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-dark-border" />

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-dark-text-heading leading-none">{user?.name}</p>
                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">{user?.total_points?.toLocaleString()} Points</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/30 border border-emerald-200 dark:border-emerald-700/50 shadow-sm flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <button 
                onClick={() => { logout(); navigate('/login'); }} 
                className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-8 animate-in fade-in duration-1000">
        <Outlet />
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface transition-colors duration-300">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm">
                <Leaf size={16} fill="currentColor" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-dark-text-heading">EcoSense</span>
                <p className="text-xs text-slate-500 dark:text-dark-text-muted">&copy; {currentYear} All rights reserved.</p>
              </div>
            </div>

            {/* Essential Links */}
            <div className="flex items-center gap-6">
              <NavLink to="/dashboard" className="text-sm text-slate-500 dark:text-dark-text-muted hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Dashboard
              </NavLink>
              <NavLink to="/impact" className="text-sm text-slate-500 dark:text-dark-text-muted hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Impact
              </NavLink>
              <a href="mailto:support@ecosense.com" className="text-sm text-slate-500 dark:text-dark-text-muted hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
