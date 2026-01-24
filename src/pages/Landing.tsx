import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  LayoutDashboard,
  BarChart,
  Users,
} from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'
import logo from '@/assets/logo-estilizado.jpg'

export default function Landing() {
  const { t } = useLanguageStore()

  useEffect(() => {
    document.title = 'COREPM - Property Management Platform'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Advanced property management software for modern landlords. Automate tasks, manage finances, and grow your portfolio with COREPM.',
      )
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content =
        'Advanced property management software for modern landlords. Automate tasks, manage finances, and grow your portfolio with COREPM.'
      document.head.appendChild(meta)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-trust-blue selection:text-white">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="COREPM" className="h-8 w-8 rounded-md" />
            <span className="font-bold text-xl tracking-tight text-trust-blue font-display">
              COREPM
            </span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-trust-blue transition">
              Features
            </a>
            <a href="#benefits" className="hover:text-trust-blue transition">
              Benefits
            </a>
            <a href="#pricing" className="hover:text-trust-blue transition">
              Pricing
            </a>
          </nav>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost">{t('auth.login_title')}</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-trust-blue hover:bg-blue-700 shadow-md">
                {t('marketing.get_started')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 container mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-6">
          ✨ New: QuickBooks Integration
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl bg-clip-text text-transparent bg-gradient-to-r from-trust-blue to-blue-600 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {t('marketing.hero_title')}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
          {t('marketing.hero_subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <Link to="/register">
            <Button
              size="lg"
              className="text-lg px-8 bg-trust-blue h-12 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              {t('marketing.cta_button')}
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="text-lg px-8 h-12">
              {t('marketing.learn_more')}
            </Button>
          </Link>
        </div>

        {/* Hero Image */}
        <div className="mt-16 rounded-xl overflow-hidden shadow-2xl border border-border/50 max-w-5xl w-full animate-in fade-in zoom-in-95 duration-1000 delay-300 bg-muted aspect-[16/9] relative group">
          <img
            src="https://img.usecurling.com/p/1200/675?q=dashboard%20interface%20analytics"
            alt="Dashboard Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              {t('marketing.benefits_title')}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Designed to solve the real problems of property managers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 bg-background rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-green-100 rounded-full text-green-600 mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-xl mb-2">
                {t('marketing.benefit_1')}
              </h3>
              <p className="text-center text-muted-foreground text-sm">
                Automated workflows handle routine tasks, freeing up your time
                for high-value activities.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-background rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600 mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-xl mb-2">
                {t('marketing.benefit_2')}
              </h3>
              <p className="text-center text-muted-foreground text-sm">
                Seamlessly operate in multiple regions with full localization
                and multi-currency support.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-background rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-purple-100 rounded-full text-purple-600 mb-4">
                <BarChart className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-xl mb-2">
                {t('marketing.benefit_3')}
              </h3>
              <p className="text-center text-muted-foreground text-sm">
                Make data-driven decisions with advanced analytics and market
                benchmarking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              {t('marketing.features_title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t('marketing.feature_1_title')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('marketing.feature_1_desc')} Set up rules for rent
                    reminders, late fees, and maintenance approvals.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <Shield className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t('marketing.feature_2_title')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('marketing.feature_2_desc')} Sync your data securely and
                    keep your books balanced effortlessly.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t('marketing.feature_3_title')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('marketing.feature_3_desc')} Give them a professional
                    experience with dedicated portals.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-3xl opacity-20 transform rotate-6 scale-90" />
              <img
                src="https://img.usecurling.com/p/600/400?q=app%20features%20ui"
                alt="App Features"
                className="relative rounded-2xl shadow-2xl border border-border/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-trust-blue text-white py-24 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('marketing.cta_title')}
          </h2>
          <p className="text-blue-100 mb-10 max-w-xl mx-auto">
            Join thousands of property managers who are scaling their business
            with COREPM.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-10 h-14 font-bold text-trust-blue shadow-lg hover:shadow-xl hover:scale-105 transition-transform"
            >
              {t('marketing.cta_button')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <img src={logo} alt="COREPM" className="h-8 w-8 rounded-sm" />
              <span className="font-bold text-xl text-white">COREPM</span>
            </div>
            <div className="flex gap-8 text-sm">
              <a href="#" className="hover:text-white transition">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition">
                Terms
              </a>
              <a href="#" className="hover:text-white transition">
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-gray-500">
            {t('marketing.copyright')}
          </div>
        </div>
      </footer>
    </div>
  )
}
