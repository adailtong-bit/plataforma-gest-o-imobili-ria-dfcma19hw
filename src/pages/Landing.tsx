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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  CheckCircle2,
  Globe,
  LayoutDashboard,
  BarChart,
  Menu,
  X,
  ArrowRight,
  Star,
  Zap,
  CreditCard,
  MessageSquare,
  Calendar,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react'
import logo from '@/assets/logo-estilizado.jpg'
import { trackEvent } from '@/lib/analytics'
import useLanguageStore from '@/stores/useLanguageStore'
import useSubscriptionStore from '@/stores/useSubscriptionStore'
import { formatCurrency } from '@/lib/utils'

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { language, setLanguage, t } = useLanguageStore()
  const { subscriptionConfig } = useSubscriptionStore()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    trackEvent('page_view', { page: 'Landing' })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (section: string) => {
    trackEvent('nav_click', { section })
    setMobileMenuOpen(false)
  }

  const handleCtaClick = (ctaName: string, location: string) => {
    trackEvent('cta_click', { name: ctaName, location })
  }

  const features = [
    {
      icon: <LayoutDashboard className="h-6 w-6 text-trust-blue" />,
      title: t('landing.features.command_center.title'),
      description: t('landing.features.command_center.desc'),
    },
    {
      icon: <Globe className="h-6 w-6 text-trust-blue" />,
      title: t('landing.features.channel_sync.title'),
      description: t('landing.features.channel_sync.desc'),
    },
    {
      icon: <CreditCard className="h-6 w-6 text-trust-blue" />,
      title: t('landing.features.financials.title'),
      description: t('landing.features.financials.desc'),
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-trust-blue" />,
      title: t('landing.features.guest_inbox.title'),
      description: t('landing.features.guest_inbox.desc'),
    },
    {
      icon: <Calendar className="h-6 w-6 text-trust-blue" />,
      title: t('landing.features.smart_scheduling.title'),
      description: t('landing.features.smart_scheduling.desc'),
    },
    {
      icon: <BarChart className="h-6 w-6 text-trust-blue" />,
      title: t('landing.features.revenue_intel.title'),
      description: t('landing.features.revenue_intel.desc'),
    },
  ]

  const testimonials = [
    {
      quote: t('landing.testimonials.quote_1'),
      author: t('landing.testimonials.author_1'),
      role: t('landing.testimonials.role_1'),
      rating: 5,
    },
    {
      quote: t('landing.testimonials.quote_2'),
      author: t('landing.testimonials.author_2'),
      role: t('landing.testimonials.role_2'),
      rating: 5,
    },
    {
      quote: t('landing.testimonials.quote_3'),
      author: t('landing.testimonials.author_3'),
      role: t('landing.testimonials.role_3'),
      rating: 5,
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
            <span className="font-bold text-2xl tracking-tight text-trust-blue">
              COREPM
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 text-sm font-medium items-center">
            <a
              href="#about"
              onClick={() => handleNavClick('about')}
              className="hover:text-trust-blue transition-colors"
            >
              Who We Are
            </a>
            <a
              href="#features"
              onClick={() => handleNavClick('features')}
              className="hover:text-trust-blue transition-colors"
            >
              What We Offer
            </a>
            <a
              href="#pricing"
              onClick={() => handleNavClick('pricing')}
              className="hover:text-trust-blue transition-colors"
            >
              {t('landing.nav.pricing')}
            </a>
            <a
              href="#contact"
              onClick={() => handleNavClick('contact')}
              className="hover:text-trust-blue transition-colors"
            >
              Contact
            </a>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-trust-blue"
                >
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setLanguage('pt')}
                  className={language === 'pt' ? 'bg-accent' : ''}
                >
                  🇵🇹 Português
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage('en')}
                  className={language === 'en' ? 'bg-accent' : ''}
                >
                  🇺🇸 English
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage('es')}
                  className={language === 'es' ? 'bg-accent' : ''}
                >
                  🇪🇸 Español
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/login" onClick={() => handleCtaClick('Login', 'nav')}>
              <Button
                variant="ghost"
                className="hover:bg-blue-50 hover:text-trust-blue"
              >
                {t('landing.nav.login')}
              </Button>
            </Link>
            <Link
              to="/register"
              onClick={() => handleCtaClick('Get Started', 'nav')}
            >
              <Button className="bg-trust-blue hover:bg-blue-700 shadow-md transition-transform hover:-translate-y-0.5">
                {t('landing.nav.get_started')}
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
              href="#about"
              onClick={() => handleNavClick('about')}
              className="py-2 hover:text-trust-blue font-medium"
            >
              Who We Are
            </a>
            <a
              href="#features"
              onClick={() => handleNavClick('features')}
              className="py-2 hover:text-trust-blue font-medium"
            >
              What We Offer
            </a>
            <a
              href="#pricing"
              onClick={() => handleNavClick('pricing')}
              className="py-2 hover:text-trust-blue font-medium"
            >
              {t('landing.nav.pricing')}
            </a>
            <a
              href="#contact"
              onClick={() => handleNavClick('contact')}
              className="py-2 hover:text-trust-blue font-medium"
            >
              Contact
            </a>

            {/* Mobile Language Selector */}
            <div className="py-2 flex items-center justify-between border-t border-b border-border/50 my-2">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" /> Language
              </span>
              <div className="flex gap-2">
                <Button
                  variant={language === 'en' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('en')}
                  className="h-7 text-xs px-2"
                >
                  EN
                </Button>
                <Button
                  variant={language === 'pt' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('pt')}
                  className="h-7 text-xs px-2"
                >
                  PT
                </Button>
                <Button
                  variant={language === 'es' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('es')}
                  className="h-7 text-xs px-2"
                >
                  ES
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <Link
                to="/login"
                onClick={() => handleCtaClick('Login', 'mobile_nav')}
              >
                <Button variant="outline" className="w-full">
                  {t('landing.nav.login')}
                </Button>
              </Link>
              <Link
                to="/register"
                onClick={() => handleCtaClick('Get Started', 'mobile_nav')}
              >
                <Button className="w-full bg-trust-blue">
                  {t('landing.nav.get_started')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 container mx-auto text-center flex flex-col items-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/80 via-background to-background -z-10 pointer-events-none" />

        <Badge
          variant="secondary"
          className="mb-8 px-4 py-1.5 text-sm font-medium bg-blue-100/50 text-trust-blue border-blue-200 hover:bg-blue-100 animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <Zap className="w-3 h-3 mr-2 fill-trust-blue" />{' '}
          {t('landing.hero.badge')}
        </Badge>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-5xl text-navy animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 leading-tight">
          {t('landing.hero.title_start')} <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-trust-blue via-blue-600 to-blue-800">
            {t('landing.hero.title_end')}
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200 leading-relaxed">
          {t('landing.hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 w-full sm:w-auto">
          <Link
            to="/register"
            onClick={() => handleCtaClick('Start Now', 'hero')}
          >
            <Button
              size="lg"
              className="w-full sm:w-auto text-lg px-8 h-14 bg-trust-blue hover:bg-blue-700 shadow-xl hover:shadow-2xl transition-all font-bold"
            >
              {t('landing.hero.cta_primary')}{' '}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <a href="#features" onClick={() => handleNavClick('features_hero')}>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-lg px-8 h-14 gap-2 border-2"
            >
              <TrendingUp className="h-4 w-4" />{' '}
              {t('landing.hero.cta_secondary')}
            </Button>
          </a>
        </div>

        {/* Hero Dashboard Preview */}
        <div className="mt-16 rounded-xl overflow-hidden shadow-2xl border border-border/50 max-w-6xl w-full animate-in fade-in zoom-in-95 duration-1000 delay-500 bg-background aspect-[16/9] relative group ring-1 ring-black/5">
          <img
            src="https://img.usecurling.com/p/1600/900?q=saas%20dashboard%20analytics%20charts%20blue&dpr=2"
            alt="COREPM Dashboard Interface"
            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* About Us (Who We Are) */}
      <section id="about" className="py-24 bg-muted/20 border-y scroll-mt-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge
                variant="outline"
                className="text-trust-blue bg-blue-50 border-blue-200"
              >
                Who We Are
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-navy leading-tight">
                Empowering Property Managers with Next-Gen Tools
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                COREPM is built by industry veterans who understand the
                challenges of modern property management. We realized that
                juggling multiple tools for short-term and long-term rentals was
                slowing businesses down.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our mission is to provide a single, unified command center that
                handles everything from tenant communication and maintenance
                workflows to complex financial reporting and OTA
                synchronization.
              </p>
              <div className="pt-4">
                <Button variant="outline" className="gap-2 border-slate-300">
                  Read Our Story <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl">
              <img
                src="https://img.usecurling.com/p/800/600?q=office%20teamwork&color=blue"
                alt="Our Team"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid (What We Offer) */}
      <section id="features" className="py-24 bg-background scroll-mt-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <Badge
              variant="outline"
              className="mb-4 text-trust-blue border-trust-blue/20 bg-blue-50"
            >
              What We Offer
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-navy">
              {t('landing.features.title')}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card
                key={idx}
                className="border border-border/50 shadow-sm bg-card hover:bg-blue-50/30 transition-all hover:shadow-lg hover:-translate-y-1 group duration-300"
              >
                <CardHeader>
                  <div className="mb-4 p-3 bg-blue-100 w-fit rounded-xl group-hover:bg-trust-blue group-hover:text-white transition-colors duration-300">
                    <div className="group-hover:text-white transition-colors duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-navy">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground/80">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-muted/20 scroll-mt-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 text-trust-blue border-trust-blue/20 bg-blue-50"
            >
              {t('landing.nav.testimonials')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-navy">
              {t('landing.testimonials.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('landing.testimonials.subtitle')}
            </p>
          </div>

          <Carousel className="w-full max-w-5xl mx-auto" opts={{ loop: true }}>
            <CarouselContent>
              {testimonials.map((t, idx) => (
                <CarouselItem
                  key={idx}
                  className="md:basis-1/2 lg:basis-1/2 p-4"
                >
                  <Card className="h-full border-none shadow-md bg-background hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-8 flex flex-col gap-6 h-full justify-between">
                      <div>
                        <div className="flex gap-1 mb-4">
                          {[...Array(t.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-5 w-5 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <p className="text-lg italic text-muted-foreground leading-relaxed">
                          "{t.quote}"
                        </p>
                      </div>
                      <div className="flex items-center gap-4 pt-4 border-t">
                        <img
                          src={`https://img.usecurling.com/ppl/thumbnail?gender=${idx % 2 === 0 ? 'female' : 'male'}&seed=${idx}`}
                          alt={t.author}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-background shadow-sm"
                        />
                        <div>
                          <p className="font-bold text-navy">{t.author}</p>
                          <p className="text-sm text-muted-foreground font-medium">
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
              <CarouselPrevious className="-left-12 h-12 w-12 border-none shadow-md bg-background hover:bg-trust-blue hover:text-white transition-colors" />
              <CarouselNext className="-right-12 h-12 w-12 border-none shadow-md bg-background hover:bg-trust-blue hover:text-white transition-colors" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Dynamic Pricing */}
      <section id="pricing" className="py-24 bg-background scroll-mt-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-navy">
              {t('landing.pricing.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your property management business.
              Scalable, flexible, and transparent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {subscriptionConfig.tiers.map((plan, idx) => (
              <Card
                key={plan.id}
                className={`flex flex-col border transition-all duration-300 ${idx === 1 ? 'border-trust-blue shadow-2xl scale-105 z-10 relative' : 'border-border shadow-sm hover:shadow-lg hover:-translate-y-1'}`}
              >
                {idx === 1 && (
                  <div className="bg-trust-blue text-white text-center text-xs font-bold py-1.5 uppercase tracking-wider rounded-t-lg">
                    {t('landing.pricing.most_popular')}
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="mt-2 uppercase font-semibold">
                    Region: {plan.region}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="mb-4">
                    <span className="text-5xl font-extrabold text-navy">
                      {formatCurrency(plan.basePrice, language).replace(
                        /\.00$/,
                        '',
                      )}
                    </span>
                    <span className="text-muted-foreground font-medium">
                      /mo
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-600 mb-6 bg-slate-50 p-3 rounded-lg border">
                    <p>
                      Up to{' '}
                      <strong className="text-navy">{plan.maxUnits}</strong>{' '}
                      properties.
                    </p>
                    <p>
                      +
                      <strong className="text-navy">
                        {formatCurrency(plan.additionalUnitCost, language)}
                      </strong>{' '}
                      per extra property.
                    </p>
                  </div>
                  <ul className="flex-1 space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm text-foreground/80"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full h-12 text-base font-semibold ${idx === 1 ? 'bg-trust-blue hover:bg-blue-700 shadow-lg' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                    onClick={() =>
                      handleCtaClick(plan.cta, `pricing_${plan.name}`)
                    }
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

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-muted/20 scroll-mt-20 border-t">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold text-navy mb-4">
                Get in Touch
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Have questions about our pricing, features, or need a custom
                enterprise plan? Our team is ready to help you optimize your
                property management.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-100 flex items-center justify-center rounded-full">
                    <MapPin className="h-5 w-5 text-trust-blue" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy">Our Office</h4>
                    <p className="text-sm text-muted-foreground">
                      1500 Tech Blvd, Suite 200
                      <br />
                      Miami, FL 33132
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-100 flex items-center justify-center rounded-full">
                    <Mail className="h-5 w-5 text-trust-blue" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy">Email Us</h4>
                    <p className="text-sm text-muted-foreground">
                      contact@corepm.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-100 flex items-center justify-center rounded-full">
                    <Phone className="h-5 w-5 text-trust-blue" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy">Call Us</h4>
                    <p className="text-sm text-muted-foreground">
                      +1 (800) 555-0199
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle>Send a Message</CardTitle>
                <CardDescription>
                  Fill out the form and we'll be in touch soon.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input placeholder="John Doe" />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input placeholder="john@example.com" type="email" />
                </div>
                <div className="grid gap-2">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="How can we help?"
                    className="min-h-[120px]"
                  />
                </div>
                <Button className="w-full bg-trust-blue h-12 text-lg">
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 bg-gradient-to-br from-trust-blue to-blue-700 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://img.usecurling.com/p/100/100?q=pattern&color=white')] bg-repeat"></div>

        <div className="container mx-auto px-6 relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t('landing.footer_cta.title')}
          </h2>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('landing.footer_cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              onClick={() => handleCtaClick('Get Started Now', 'footer')}
            >
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-trust-blue hover:bg-blue-50 text-lg h-14 px-8 font-bold shadow-xl hover:shadow-2xl transition-all"
              >
                {t('landing.footer_cta.cta_primary')}
              </Button>
            </Link>
            <a
              href="#contact"
              onClick={() => handleCtaClick('Contact Sales', 'footer')}
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-lg h-14 px-8 backdrop-blur-sm"
              >
                {t('landing.footer_cta.cta_secondary')}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-white">
                <img
                  src={logo}
                  alt="COREPM"
                  className="h-8 w-8 rounded-sm grayscale opacity-80"
                />
                <span className="font-bold text-xl tracking-tight">COREPM</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">
                {t('landing.hero.subtitle')}
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                >
                  <Globe className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                >
                  <MessageSquare className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">
                {t('landing.footer.product')}
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    {t('landing.footer.features')}
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-white transition-colors"
                  >
                    {t('landing.footer.pricing')}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('landing.footer.integrations')}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('landing.footer.enterprise')}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">
                {t('landing.footer.resources')}
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('landing.footer.blog')}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('landing.footer.docs')}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('landing.footer.case_studies')}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('landing.footer.help')}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">
                {t('landing.footer.company')}
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#about"
                    className="hover:text-white transition-colors"
                  >
                    {t('landing.footer.about')}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('landing.footer.careers')}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t('landing.footer.legal')}
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-white transition-colors"
                  >
                    {t('landing.footer.contact')}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <p>© {new Date().getFullYear()} COREPM Inc. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">
                {t('landing.footer.privacy')}
              </a>
              <a href="#" className="hover:text-white transition-colors">
                {t('landing.footer.terms')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
