import type { FormEvent } from 'react'
import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, MessageSquare, Clock, Globe, ArrowUpRight, Sparkles, HeadphonesIcon, Zap } from 'lucide-react'

const contactChannels = [
  {
    icon: Mail,
    title: 'Email Support',
    details: 'support@ecosense.com',
    description: 'We typically respond within 24 hours',
    href: 'mailto:support@ecosense.com',
    gradient: 'from-blue-500 to-cyan-500',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Phone,
    title: 'Phone Support',
    details: '+1 (555) 123-4567',
    description: 'Mon-Fri from 9am to 6pm EST',
    href: 'tel:+15551234567',
    gradient: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: MapPin,
    title: 'Headquarters',
    details: '123 Green Street',
    description: 'Eco Valley, CA 90210',
    href: '#',
    gradient: 'from-violet-500 to-purple-500',
    bgLight: 'bg-violet-50 dark:bg-violet-900/20',
    textColor: 'text-violet-600 dark:text-violet-400',
  },
]

const faqItems = [
  {
    question: 'How do I log waste entries?',
    answer: 'Navigate to the "Log Waste" page from the main menu. Fill in the waste type, quantity, and date, then submit the form. Your entries will be verified and points will be awarded automatically.',
    icon: Zap,
  },
  {
    question: 'How are leaderboard points calculated?',
    answer: 'Points are awarded based on the type and quantity of waste you log. Different materials have different point values to encourage recycling of all types. Bonus points are given for verified entries.',
    icon: Sparkles,
  },
  {
    question: 'Can I join an organization?',
    answer: 'Yes! You can join an organization by using an invitation link sent to your email, or by entering an invitation code on the Team Invite page. Admins can also invite new members directly.',
    icon: Globe,
  },
  {
    question: 'How do I reset my password?',
    answer: 'Click "Forgot password?" on the login page. Enter your email address and we will send you a verification code to reset your password. The code expires after 15 minutes.',
    icon: Clock,
  },
]

const stats = [
  { label: 'Avg. Response Time', value: '< 4hrs', icon: Clock },
  { label: 'Support Satisfaction', value: '98%', icon: CheckCircle },
  { label: 'Active Users', value: '50K+', icon: MessageSquare },
]

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSubmitSuccess(false)
    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSubmitSuccess(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch {
      setError('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 dark:from-emerald-800 dark:via-emerald-900 dark:to-teal-950 px-6 py-16 sm:px-12 sm:py-20 mb-12">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-xl">
              <HeadphonesIcon size={32} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Get in Touch
            </h1>
            <p className="mt-4 text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed">
              Have questions about EcoSense? Need help with your sustainability tracking? 
              Our team is here to help you make a difference.
            </p>
            
            {/* Stats Row */}
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm text-white mb-2">
                    <stat.icon size={18} />
                  </div>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-emerald-200 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Channels Grid */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-dark-text-heading">
              Reach Us Directly
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {contactChannels.map((channel) => (
              <a
                key={channel.title}
                href={channel.href}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-transparent"
              >
                {/* Hover gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${channel.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${channel.bgLight} ${channel.textColor} mb-4 transition-transform duration-300 group-hover:scale-110`}>
                    <channel.icon size={24} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-dark-text-heading mb-1">
                    {channel.title}
                  </h3>
                  <p className={`text-sm font-semibold ${channel.textColor} mb-2`}>
                    {channel.details}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-dark-text-muted">
                    {channel.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-5 mb-12">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm overflow-hidden">
              {/* Form Header */}
              <div className="border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface/50 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <Send size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-dark-text-heading">
                      Send us a message
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-dark-text-muted">
                      Fill out the form and we'll get back to you shortly
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-6 sm:p-8">
                {submitSuccess && (
                  <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-5 py-4 text-sm text-green-700 dark:text-green-400">
                    <CheckCircle size={20} className="flex-shrink-0" />
                    <span>Your message has been sent successfully! We'll get back to you soon.</span>
                  </div>
                )}

                {error && (
                  <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-5 py-4 text-sm text-red-700 dark:text-red-400">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-dark-text">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface px-4 text-sm text-slate-900 dark:text-dark-text shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-dark-text-muted focus:border-emerald-500 focus:bg-white dark:focus:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-dark-text">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface px-4 text-sm text-slate-900 dark:text-dark-text shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-dark-text-muted focus:border-emerald-500 focus:bg-white dark:focus:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-dark-text">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface px-4 text-sm text-slate-900 dark:text-dark-text shadow-sm transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="feedback">Feedback</option>
                      <option value="bug">Report a Bug</option>
                      <option value="feature">Feature Request</option>
                      <option value="billing">Billing Question</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-dark-text">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      rows={5}
                      className="flex w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface px-4 py-3 text-sm text-slate-900 dark:text-dark-text shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-dark-text-muted focus:border-emerald-500 focus:bg-white dark:focus:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending message...
                      </div>
                    ) : (
                      <>
                        Send Message
                        <Send size={16} className="transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* FAQ Section */}
            <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface/50 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-dark-text-heading">
                      Frequently Asked Questions
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-dark-text-muted">
                      Quick answers to common questions
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-2">
                  {faqItems.map((faq, index) => (
                    <div key={index} className="rounded-xl border border-slate-100 dark:border-dark-border overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-dark-surface/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                            <faq.icon size={14} />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-dark-text">{faq.question}</span>
                        </div>
                        <svg
                          className={`h-4 w-4 text-slate-400 transition-transform flex-shrink-0 ml-2 ${expandedFaq === index ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedFaq === index && (
                        <div className="px-4 pb-4 pt-1">
                          <div className="ml-11 pl-3 border-l-2 border-emerald-200 dark:border-emerald-800">
                            <p className="text-sm text-slate-500 dark:text-dark-text-muted leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface/50 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <Globe size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-dark-text-heading">
                      Follow Us
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-dark-text-muted">
                      Stay connected on social media
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-3 gap-3">
                  <a
                    href="#"
                    className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-dark-surface p-4 text-slate-500 dark:text-dark-text-muted transition-all hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:-translate-y-0.5"
                    aria-label="Twitter"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span className="text-xs font-medium">Twitter</span>
                  </a>
                  <a
                    href="#"
                    className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-dark-surface p-4 text-slate-500 dark:text-dark-text-muted transition-all hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:-translate-y-0.5"
                    aria-label="GitHub"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="text-xs font-medium">GitHub</span>
                  </a>
                  <a
                    href="#"
                    className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-dark-surface p-4 text-slate-500 dark:text-dark-text-muted transition-all hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:-translate-y-0.5"
                    aria-label="LinkedIn"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    <span className="text-xs font-medium">LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
