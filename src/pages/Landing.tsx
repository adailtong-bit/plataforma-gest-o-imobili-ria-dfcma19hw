import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Globe,
  LayoutDashboard,
  BarChart,
  Menu,
  X,
  ArrowRight,
  Star,
  Play,
  CreditCard,
  MessageSquare,
  Calendar,
} from 'lucide-react'
import logo from '@/assets/logo-estilizado.jpg'

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: <LayoutDashboard className="h-6 w-6 text-trust-blue" />,
      title: 'Unified Dashboard',
      description:
        'View all your properties, tasks, and financials in one centralized command center.',
    },
    {
      icon: <Globe className="h-6 w-6 text-trust-blue" />,
      title: 'Channel Manager',
      description:
        'Sync availability and rates across Airbnb, Vrbo, Booking.com, and more in real-time.',
    },
    {
      icon: <CreditCard className="h-6 w-6 text-trust-blue" />,
      title: 'Financial Automation',
      description:
        'Automate invoicing, owner payouts, and expense tracking with QuickBooks integration.',
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-trust-blue" />,
      title: 'Unified Inbox',
      description:
        'Manage guest communications from all channels in a single, threaded interface.',
    },
    {
      icon: <Calendar className="h-6 w-6 text-trust-blue" />,
      title: 'Smart Scheduling',
      description:
        'Auto-schedule cleaning and maintenance tasks based on check-in/out data.',
    },
    {
      icon: <BarChart className="h-6 w-6 text-trust-blue" />,
      title: 'Advanced Analytics',
      description:
        'Gain insights into occupancy, revenue, and market trends to optimize performance.',
    },
  ]

  const testimonials = [
    {
      quote:
        'COREPM has completely transformed how we manage our 50+ vacation rentals. The automation is a game-changer.',
      author: 'Sarah Jenkins',
      role: 'CEO, Coastal Stays',
      rating: 5,
    },
    {
      quote:
        'The financial reporting is spot on. My owners love the transparency of the portals.',
      author: 'Michael Rodriguez',
      role: 'Property Manager, Urban Living',
      rating: 5,
    },
    {
      quote:
        "We switched from a competitor and haven't looked back. The support team is incredible.",
      author: 'Elena Vasquez',
      role: 'Director, Luxury Villas',
      rating: 5,
    },
  ]

  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for individual hosts scaling up.',
      features: [
        'Up to 5 properties',
        'Basic Channel Sync',
        'Financial Reporting',
        'Email Support',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Professional',
      price: '$99',
      period: '/month',
      description: 'For growing property management agencies.',
      features: [
        'Up to 50 properties',
        'Advanced Automation',
        'Owner Portals',
        'Priority Support',
        'QuickBooks Sync',
      ],
      cta: 'Get Started',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Tailored solutions for large portfolios.',
      features: [
        'Unlimited properties',
        'Dedicated API Access',
        'Custom Onboarding',
        '24/7 Phone Support',
        'White Labeling',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-trust-blue selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-md shadow-sm border-b'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="COREPM"
              className="h-10 w-10 rounded-md object-contain"
            />
            <span
              className={`font-bold text-2xl tracking-tight font-display ${scrolled ? 'text-trust-blue' : 'text-trust-blue'}`}
            >
              COREPM
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 text-sm font-medium items-center">
            <a
              href="#features"
              className="hover:text-trust-blue transition-colors"
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="hover:text-trust-blue transition-colors"
            >
              Testimonials
            </a>
            <a
              href="#pricing"
              className="hover:text-trust-blue transition-colors"
            >
              Pricing
            </a>
            <Link to="/login">
              <Button
                variant="ghost"
                className="hover:bg-blue-50 hover:text-trust-blue"
              >
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-trust-blue hover:bg-blue-700 shadow-md transition-transform hover:-translate-y-0.5">
                Get Started
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-b shadow-lg absolute w-full px-6 py-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-trust-blue font-medium"
            >
              Features
            </a>
            <a
              href="#testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-trust-blue font-medium"
            >
              Testimonials
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-trust-blue font-medium"
            >
              Pricing
            </a>
            <div className="flex flex-col gap-2 mt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Log In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-trust-blue">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 container mx-auto text-center flex flex-col items-center">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-background to-background -z-10 pointer-events-none" />

        <Badge
          variant="secondary"
          className="mb-6 px-4 py-1.5 text-sm font-medium bg-blue-50 text-trust-blue border-blue-100 hover:bg-blue-100"
        >
          🚀 New V2.0 Released: Enhanced Automation
        </Badge>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-5xl text-navy animate-in fade-in slide-in-from-bottom-4 duration-700 leading-tight">
          The All-in-One Platform for <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-trust-blue to-blue-500">
            Modern Property Management
          </span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100 leading-relaxed">
          Automate operations, maximize revenue, and delight guests with
          COREPM's comprehensive suite for vacation and long-term rentals.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 w-full sm:w-auto">
          <Link to="/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto text-lg px-8 h-14 bg-trust-blue hover:bg-blue-700 shadow-xl hover:shadow-2xl transition-all"
            >
              Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <div className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-lg px-8 h-14 gap-2 border-2"
            >
              <Play className="h-4 w-4 fill-foreground" /> Watch Demo
            </Button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-16 rounded-xl overflow-hidden shadow-2xl border border-border/50 max-w-6xl w-full animate-in fade-in zoom-in-95 duration-1000 delay-300 bg-background aspect-[16/9] relative group ring-1 ring-black/5">
          <img
            src="https://img.usecurling.com/p/1600/900?q=saas%20dashboard%20analytics%20charts"
            alt="COREPM Dashboard"
            className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-[1.01]"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 bg-muted/20 border-y">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">
            Trusted by top property managers and platforms
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
            {['Airbnb', 'Booking.com', 'Expedia', 'Vrbo', 'QuickBooks'].map(
              (brand) => (
                <div key={brand} className="flex items-center gap-2">
                  <img
                    src={`https://img.usecurling.com/i?q=${brand}&color=black`}
                    alt={brand}
                    className="h-8 md:h-10 object-contain"
                  />
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-navy">
              Everything you need to scale your portfolio
            </h2>
            <p className="text-lg text-muted-foreground">
              Replace your fragmented tech stack with one robust platform
              designed for growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card
                key={idx}
                className="border-none shadow-lg bg-card/50 hover:bg-card transition-colors hover:shadow-xl group"
              >
                <CardHeader>
                  <div className="mb-4 p-3 bg-blue-50 w-fit rounded-lg group-hover:bg-trust-blue/10 transition-colors">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-navy">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-trust-blue text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/1920/600?q=abstract%20blue%20pattern&color=blue')] opacity-10 bg-cover bg-center mix-blend-overlay" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
            <div className="p-4">
              <div className="text-5xl font-extrabold mb-2">10k+</div>
              <div className="text-blue-100 font-medium text-lg">
                Properties Managed
              </div>
            </div>
            <div className="p-4">
              <div className="text-5xl font-extrabold mb-2">$500M+</div>
              <div className="text-blue-100 font-medium text-lg">
                Revenue Processed
              </div>
            </div>
            <div className="p-4">
              <div className="text-5xl font-extrabold mb-2">99.9%</div>
              <div className="text-blue-100 font-medium text-lg">
                System Uptime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-navy">
              Trusted by Industry Leaders
            </h2>
            <p className="text-muted-foreground">
              Don't just take our word for it. Hear from our partners.
            </p>
          </div>

          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {testimonials.map((t, idx) => (
                <CarouselItem
                  key={idx}
                  className="md:basis-1/2 lg:basis-1/2 p-4"
                >
                  <Card className="h-full border-none shadow-md bg-background">
                    <CardContent className="p-8 flex flex-col gap-4 h-full">
                      <div className="flex gap-1 mb-2">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-5 w-5 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <p className="text-lg italic text-muted-foreground flex-1">
                        "{t.quote}"
                      </p>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                        <img
                          src={`https://img.usecurling.com/ppl/thumbnail?gender=${idx % 2 === 0 ? 'female' : 'male'}&seed=${idx}`}
                          alt={t.author}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-navy">{t.author}</p>
                          <p className="text-sm text-muted-foreground">
                            {t.role}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="-left-12" />
              <CarouselNext className="-right-12" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-navy">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground">
              Choose the plan that fits your business needs. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, idx) => (
              <Card
                key={idx}
                className={`flex flex-col border transition-all ${plan.popular ? 'border-trust-blue shadow-xl scale-105 z-10' : 'border-border shadow-sm hover:shadow-md'}`}
              >
                {plan.popular && (
                  <div className="bg-trust-blue text-white text-center text-xs font-bold py-1 uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-navy">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="flex-1 space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.popular ? 'bg-trust-blue hover:bg-blue-700' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                    asChild
                  >
                    <Link to="/register">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 bg-gradient-to-r from-trust-blue to-blue-700 text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to streamline your property management?
          </h2>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Join thousands of property managers who are saving time and
            increasing revenue with COREPM.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-trust-blue hover:bg-blue-50 text-lg h-14 px-8 font-bold shadow-lg"
              >
                Get Started Now
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-lg h-14 px-8"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white">
                <img
                  src={logo}
                  alt="COREPM"
                  className="h-8 w-8 rounded-sm grayscale"
                />
                <span className="font-bold text-xl">COREPM</span>
              </div>
              <p className="text-sm">
                The all-in-one solution for modern property management.
                Automate, manage, and grow.
              </p>
              <div className="flex gap-4">
                {/* Social Icons */}
                <a href="#" className="hover:text-white transition">
                  <Globe className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-white transition">
                  <MessageSquare className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Enterprise
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Case Studies
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Legal
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>© {new Date().getFullYear()} COREPM Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
