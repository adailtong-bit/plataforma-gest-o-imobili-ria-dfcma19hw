import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import useSubscriptionStore from '@/stores/useSubscriptionStore'
import {
  Check,
  Building2,
  DollarSign,
  Users,
  LineChart,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import logo from '@/assets/logo-estilizado.jpg'

export default function Index() {
  const { subscriptionConfig } = useSubscriptionStore()

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="COREPM Logo"
              className="h-8 w-8 rounded-md object-contain"
            />
            <span className="text-xl font-bold tracking-tight">COREPM</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a
              href="#about"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              About Us
            </a>
            <a
              href="#services"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#contact"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" className="hidden sm:inline-flex">
                Sign In
              </Button>
            </Link>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              The Ultimate Platform for{' '}
              <span className="text-blue-600">Property Management</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 mb-10">
              Streamline your short-term and long-term rentals, automate
              maintenance, and scale your real estate portfolio with COREPM's
              all-in-one solution.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 h-12 px-8 text-lg"
              >
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                Book a Demo
              </Button>
            </div>
            <div className="mt-16 mx-auto max-w-5xl rounded-xl border bg-slate-50/50 shadow-2xl overflow-hidden p-2">
              <img
                src="https://img.usecurling.com/p/1200/600?q=dashboard"
                alt="Dashboard Preview"
                className="w-full rounded-lg border object-cover"
              />
            </div>
          </div>
        </section>

        {/* About Us */}
        <section id="about" className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                  Who We Are
                </h2>
                <p className="text-lg text-slate-600 mb-4">
                  COREPM was built by property managers, for property managers.
                  We understand the complexities of juggling tenants, owners,
                  maintenance partners, and finances.
                </p>
                <p className="text-lg text-slate-600 mb-6">
                  Our mission is to provide an intuitive, scalable, and robust
                  software that handles the heavy lifting, so you can focus on
                  growing your business and providing exceptional guest
                  experiences.
                </p>
                <ul className="space-y-3">
                  {['Industry Experts', 'Global Reach', '24/7 Support'].map(
                    (item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 text-slate-700 font-medium"
                      >
                        <div className="rounded-full bg-blue-100 p-1">
                          <Check className="h-4 w-4 text-blue-600" />
                        </div>
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <div className="relative">
                <img
                  src="https://img.usecurling.com/p/600/500?q=team"
                  alt="Our Team"
                  className="rounded-2xl shadow-xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services/Offering */}
        <section id="services" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                What We Offer
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Everything you need to run a successful property management
                company from a single dashboard.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Building2,
                  title: 'Multi-Portfolio Management',
                  desc: 'Manage single-family homes, multi-family, vacation rentals, and hotels in one place.',
                },
                {
                  icon: DollarSign,
                  title: 'Automated Financials',
                  desc: 'Generate invoices, reconcile bank statements, and manage owner payouts effortlessly.',
                },
                {
                  icon: Users,
                  title: 'Tenant & Owner Portals',
                  desc: 'Provide self-service portals for tenants to pay rent and owners to view reports.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Maintenance Tracking',
                  desc: 'Assign work orders to partners, track progress, and automate approvals.',
                },
                {
                  icon: LineChart,
                  title: 'Advanced Analytics',
                  desc: 'Gain insights into occupancy rates, RevPAR, and market benchmarks.',
                },
                {
                  icon: Zap,
                  title: 'Workflow Automation',
                  desc: 'Set up rules to trigger tasks, emails, and notifications based on events.',
                },
              ].map((service, i) => (
                <Card key={i} className="border-slate-200">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <service.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{service.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-slate-900 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Simple, Scalable Pricing
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Pay for what you need. Our plans scale with your portfolio.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {subscriptionConfig.tiers.map((tier, idx) => (
                <Card
                  key={tier.id}
                  className={`flex flex-col border-slate-700 bg-slate-800 text-white ${idx === 1 ? 'ring-2 ring-blue-500 scale-105' : ''}`}
                >
                  {idx === 1 && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription className="text-slate-400">
                      For portfolios up to {tier.maxUnits} units
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-6">
                      <span className="text-4xl font-bold">
                        ${tier.basePrice}
                      </span>
                      <span className="text-slate-400">/mo</span>
                    </div>
                    <p className="text-sm text-slate-300 mb-6 font-medium bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                      + ${tier.additionalUnitCost} per additional unit
                    </p>
                    <ul className="space-y-3">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="h-5 w-5 shrink-0 text-blue-400" />
                          <span className="text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className={`w-full ${idx === 1 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-600'} text-white`}
                    >
                      {tier.cta || 'Choose Plan'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="rounded-3xl bg-blue-50 p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Ready to transform your business?
              </h2>
              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                Get in touch with our sales team to schedule a personalized demo
                and see how COREPM can work for you.
              </p>
              <form
                className="max-w-md mx-auto space-y-4"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Work Email"
                  className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Company Name"
                  className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg mt-4"
                >
                  Contact Sales
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-white text-slate-600">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src={logo}
                alt="COREPM Logo"
                className="h-6 w-6 rounded-sm object-contain"
              />
              <span className="font-bold text-slate-900">COREPM</span>
            </div>
            <p className="text-sm">
              The scalable solution for modern property managers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-600">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Integrations
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-600">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  API Docs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-600">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t text-sm flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} COREPM. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-blue-600">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-blue-600">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
