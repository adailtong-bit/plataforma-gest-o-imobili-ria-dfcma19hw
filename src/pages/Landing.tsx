import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  LayoutDashboard,
} from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'
import logo from '@/assets/logo-estilizado.jpg'

export default function Landing() {
  const { t } = useLanguageStore()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-navy flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between container mx-auto">
        <div className="flex items-center gap-2">
          <img src={logo} alt="COREPM" className="h-10 w-10 rounded-md" />
          <span className="font-bold text-2xl tracking-tight text-brand font-display">
            COREPM
          </span>
        </div>
        <div className="flex gap-4">
          <Link to="/login">
            <Button variant="ghost">{t('auth.login_title')}</Button>
          </Link>
          <Link to="/register">
            <Button className="bg-trust-blue hover:bg-blue-700">
              {t('marketing.get_started')}
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 container mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl text-brand font-display">
          {t('marketing.hero_title')}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10">
          {t('marketing.hero_subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register">
            <Button size="lg" className="text-lg px-8 bg-trust-blue h-14">
              {t('marketing.cta_button')}
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="text-lg px-8 h-14">
              {t('marketing.learn_more')}
            </Button>
          </Link>
        </div>

        {/* Hero Image / Dashboard Preview */}
        <div className="mt-16 rounded-xl overflow-hidden shadow-2xl border border-gray-200 max-w-5xl w-full">
          <img
            src="https://img.usecurling.com/p/1200/600?q=dashboard%20ui%20screenshot"
            alt="Dashboard Preview"
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
            {t('marketing.features_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">
                {t('marketing.feature_1_title')}
              </h3>
              <p className="text-muted-foreground">
                {t('marketing.feature_1_desc')}
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-green-100 rounded-full text-green-600">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">
                {t('marketing.feature_2_title')}
              </h3>
              <p className="text-muted-foreground">
                {t('marketing.feature_2_desc')}
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-purple-100 rounded-full text-purple-600">
                <LayoutDashboard className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">
                {t('marketing.feature_3_title')}
              </h3>
              <p className="text-muted-foreground">
                {t('marketing.feature_3_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / Social Proof */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Why Top Managers Choose COREPM
              </h2>
              <ul className="space-y-4">
                {[
                  'QuickBooks Integration',
                  'Automated Workflows',
                  'Real-time Market Data',
                  'Multi-language Support',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Globe className="h-8 w-8 text-blue-500 mb-2" />
                <h4 className="font-bold text-2xl">15+</h4>
                <p className="text-sm text-muted-foreground">Countries</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Shield className="h-8 w-8 text-blue-500 mb-2" />
                <h4 className="font-bold text-2xl">100%</h4>
                <p className="text-sm text-muted-foreground">Secure Data</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm col-span-2">
                <p className="italic text-gray-600">
                  "COREPM transformed our operations. We saved 20 hours a week
                  on manual tasks."
                </p>
                <p className="mt-4 font-semibold">
                  - Sarah J., Property Manager
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-brand text-white py-20 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('marketing.cta_title')}
          </h2>
          <Link to="/register">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-10 h-14 font-bold text-brand"
            >
              {t('marketing.cta_button')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>&copy; 2026 COREPM. All rights reserved.</p>
      </footer>
    </div>
  )
}
