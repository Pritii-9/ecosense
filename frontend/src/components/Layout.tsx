import { useState } from 'react';
import { LayoutDashboard, Leaf, Trophy, Map, LogOut, Sun, Moon, Users, Plus, UserCog, LogOut as LeaveOrg, Check, X, MessageSquare } from 'lucide-react';
import EcoSenseLogo from '/ecosense.svg';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { api, getApiErrorMessage } from '../lib/api';
import { NotificationDropdown } from './NotificationDropdown';
import { Footer } from './Footer';

export const Layout = () => {
  const { logout, user, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name ?? '');
  const [leaveOrgModal, setLeaveOrgModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateName = async () => {
    setError('');
    if (!newName.trim()) {
      setError('Name cannot be empty');
      return;
    }
    try {
      const response = await api.put('/auth/profile', { name: newName.trim() });
      if (setUser) {
        setUser(response.data.user);
      }
      setEditingName(false);
      setSuccess('Name updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleLeaveOrg = async () => {
    setError('');
    try {
      await api.post('/team/org/leave');
      if (setUser && user) {
        setUser({ ...user, org_id: undefined, role: 'admin' });
      }
      setLeaveOrgModal(false);
      setSuccess('You have left the organization');
      setTimeout(() => setSuccess(''), 3000);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Impact', path: '/impact', icon: Leaf },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Map', path: '/map', icon: Map },
    { label: 'Team', path: '/team', icon: Users },
    { label: 'Contact', path: '/contact', icon: MessageSquare },
  ];


  return (
    <div className="flex flex-col min-h-screen bg-brand-surface dark:bg-dark-bg transition-colors duration-300">
      {/* Professional Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-dark-border/50 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl transition-colors duration-300 shadow-sm">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6 lg:px-12">
          
          {/* Logo & Navigation */}
          <div className="flex items-center gap-10">
            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-dark-card shadow-lg transition-all duration-300 group-hover:shadow-emerald-500/40 group-hover:scale-105 overflow-hidden">
                <img src={EcoSenseLogo} alt="EcoSense" className="h-7 w-7" />
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
             {/* Log Activity Button */}
             <NavLink
               to="/log-waste"
                className={({ isActive }) =>
                 `hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md ${
                   isActive
                     ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                     : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105'
                 }`
               }
             >
               <Plus size={16} />
               Log Activity
             </NavLink>

             {/* Notification Dropdown */}
            <NotificationDropdown />
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 text-slate-500 dark:text-dark-text-muted hover:text-slate-700 dark:hover:text-dark-text-heading hover:bg-slate-100 dark:hover:bg-dark-card rounded-xl transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-dark-border" />

            {/* User Profile Dropdown */}
            <div className="relative pl-2">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                aria-label="Open profile menu"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-slate-900 dark:text-dark-text-heading leading-none">{user?.name}</p>
                  <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">{user?.total_points?.toLocaleString()} Points</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/30 border border-emerald-200 dark:border-emerald-700/50 shadow-sm flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-xl z-50 overflow-hidden">
                    {/* Header with User Info and Close Button */}
                    <div className="flex items-start justify-between border-b border-slate-200 dark:border-dark-border px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-dark-text-heading">{user?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-dark-text-muted truncate">{user?.email}</p>
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">{user?.total_points?.toLocaleString()} Points</p>
                      </div>
                      <button
                        onClick={() => setProfileOpen(false)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-dark-text-heading rounded-lg hover:bg-slate-100 dark:hover:bg-dark-surface transition-colors flex-shrink-0"
                        aria-label="Close profile menu"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Edit Name */}
                      <div className="px-4 py-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
                          <UserCog size={16} />
                          Edit Name
                        </div>
                        {editingName ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className="flex-1 rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface px-3 py-1.5 text-sm text-slate-900 dark:text-dark-text focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              placeholder="Enter new name"
                            />
                            <button
                              onClick={handleUpdateName}
                              className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                              aria-label="Save name"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => { setEditingName(false); setNewName(user?.name ?? ''); }}
                              className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-surface rounded-lg transition-colors"
                              aria-label="Cancel editing"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingName(true)}
                            className="w-full text-left px-3 py-1.5 text-sm text-slate-600 dark:text-dark-text-muted hover:bg-slate-50 dark:hover:bg-dark-surface rounded-lg transition-colors"
                          >
                            Click to edit name
                          </button>
                        )}
                      </div>

                      {/* Leave Organization */}
                      {user?.org_id && (
                        <div className="border-t border-slate-200 dark:border-dark-border px-4 py-2">
                          <button
                            onClick={() => setLeaveOrgModal(true)}
                            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <LeaveOrg size={16} />
                            Leave Organization
                          </button>
                        </div>
                      )}

                      {/* Logout */}
                      <div className="border-t border-slate-200 dark:border-dark-border">
                        <button
                          onClick={() => { logout(); navigate('/login'); }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-600 dark:text-dark-text-muted hover:bg-slate-50 dark:hover:bg-dark-surface transition-colors"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-brand-surface dark:bg-dark-bg transition-colors duration-300">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-8 animate-in fade-in duration-1000">
          <Outlet />
        </div>
      </main>

      {/* Success Toast */}
      {success && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400 shadow-lg animate-in fade-in slide-in-from-bottom-4">
          {success}
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 shadow-lg animate-in fade-in slide-in-from-bottom-4">
          {error}
        </div>
      )}

      {/* Leave Organization Modal */}
      {leaveOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-dark-text-heading">Leave Organization</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-dark-text-muted">
              Are you sure you want to leave your organization? You will need to create a new organization or be invited to join another one.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setLeaveOrgModal(false)}
                className="rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface px-4 py-2 text-sm font-medium text-slate-700 dark:text-dark-text hover:bg-slate-100 dark:hover:bg-dark-card transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveOrg}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Leave Organization
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};
