import { Leaf, X, Mail, Heart } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const currentYear = new Date().getFullYear()

const footerLinks = {
  product: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Impact', href: '/impact' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Map', href: '/map' },
    { label: 'Log Waste', href: '/log-waste' },
    { label: 'Team', href: '/team' },
  ],
  resources: [
    { label: 'About EcoSense', href: '#' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
}

const socialLinks = [
  { icon: X, href: '#', label: 'X (Twitter)' },
  { icon: Mail, href: 'mailto:support@ecosense.com', label: 'Email' },
]

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/25">
                <Leaf size={20} fill="currentColor" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 dark:text-dark-text-heading">EcoSense</span>
                <p className="text-xs text-slate-500 dark:text-dark-text-muted">Sustainability Platform</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-dark-text-muted leading-relaxed">
              Track your environmental impact and contribute to a sustainable future through collective action.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-dark-card text-slate-500 dark:text-dark-text-muted transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400"
                  aria-label={social.label}
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-dark-text-heading uppercase tracking-wider">Product</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <NavLink
                    to={link.href}
                    className="text-sm text-slate-500 dark:text-dark-text-muted transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-dark-text-heading uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-500 dark:text-dark-text-muted transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-200 dark:border-dark-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-500 dark:text-dark-text-muted">
              &copy; {currentYear} EcoSense. All rights reserved.
            </p>
            <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-dark-text-muted">
              Made with <Heart size={14} className="text-red-500" /> for a greener planet
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}