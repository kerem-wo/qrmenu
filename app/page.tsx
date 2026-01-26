import Link from "next/link";
import Image from "next/image";
import { QrCode, Smartphone, Zap, Globe, ArrowRight, Check, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Rivo QR"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-lg font-bold text-gray-900">Rivo QR</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <Link href="/menu/demo-restoran" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Demo
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/restaurant/register"
                className="bg-[#FF6F00] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#E55F00] transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6F00]/5 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
              Digital QR Menu
              <br />
              <span className="text-[#FF6F00]">for Modern Restaurants</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Fast, contactless, and easy to manage. Create your digital menu in minutes and serve customers instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/restaurant/register"
                className="bg-[#FF6F00] text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-[#E55F00] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                Create Your Menu
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/menu/demo-restoran"
                className="bg-white text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-xl text-base font-semibold hover:border-gray-300 transition-all inline-flex items-center gap-2"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Everything you need to go digital
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for modern restaurants and cafes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Mobile Optimized */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#FF6F00]/20 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-[#FF6F00]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FF6F00]/20 transition-colors">
                <Smartphone className="w-6 h-6 text-[#FF6F00]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Mobile Optimized</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Perfect experience on any device. Your customers can browse and order seamlessly.
              </p>
            </div>

            {/* Instant QR Generation */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#FF6F00]/20 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-[#FF6F00]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FF6F00]/20 transition-colors">
                <QrCode className="w-6 h-6 text-[#FF6F00]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Instant QR Generation</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Generate your unique QR code instantly. Print or display anywhere in your restaurant.
              </p>
            </div>

            {/* Easy Menu Management */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#FF6F00]/20 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-[#FF6F00]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FF6F00]/20 transition-colors">
                <Zap className="w-6 h-6 text-[#FF6F00]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Easy Menu Management</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Update prices, add items, or change descriptions in seconds. Changes appear instantly.
              </p>
            </div>

            {/* Multi-language Support */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#FF6F00]/20 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-[#FF6F00]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FF6F00]/20 transition-colors">
                <Globe className="w-6 h-6 text-[#FF6F00]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Multi-language Support</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Serve international customers with automatic translation and multi-language menus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo / Preview Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                See it in action
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Experience how your customers will interact with your digital menu. Clean, fast, and intuitive design that works perfectly on any device.
              </p>
              <Link
                href="/menu/demo-restoran"
                className="inline-flex items-center gap-2 text-[#FF6F00] font-semibold hover:text-[#E55F00] transition-colors"
              >
                Try the demo
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="relative">
              <div className="bg-gray-900 rounded-3xl p-4 shadow-2xl">
                <div className="bg-white rounded-2xl overflow-hidden aspect-[9/16] max-w-xs mx-auto">
                  <div className="h-full bg-gradient-to-br from-gray-50 to-white p-4">
                    <div className="space-y-4">
                      <div className="h-32 bg-gray-200 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-24 bg-gray-200 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your restaurant
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-gray-200 transition-all">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Basic</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">Free</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Perfect for small cafes</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Up to 50 menu items</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">QR code generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Basic analytics</span>
                </li>
              </ul>
              <Link
                href="/restaurant/register"
                className="block w-full bg-gray-100 text-gray-900 text-center py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Start Free
              </Link>
            </div>

            {/* Pro Plan - Popular */}
            <div className="bg-white rounded-2xl p-8 border-2 border-[#FF6F00] hover:shadow-xl transition-all relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[#FF6F00] text-white px-4 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">₺99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">For growing restaurants</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Unlimited menu items</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Advanced analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Multi-language support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Priority support</span>
                </li>
              </ul>
              <Link
                href="/restaurant/register"
                className="block w-full bg-[#FF6F00] text-white text-center py-3 rounded-xl font-semibold hover:bg-[#E55F00] transition-colors shadow-lg"
              >
                Choose Plan
              </Link>
            </div>

            {/* Business Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-gray-200 transition-all">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Business</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">₺299</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">For restaurant chains</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Multiple locations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Custom branding</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-[#FF6F00] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">Dedicated support</span>
                </li>
              </ul>
              <Link
                href="/restaurant/register"
                className="block w-full bg-gray-100 text-gray-900 text-center py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Choose Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.png"
                  alt="Rivo QR"
                  width={24}
                  height={24}
                  className="h-6 w-auto"
                />
                <span className="text-base font-bold text-gray-900">Rivo QR</span>
              </div>
              <p className="text-sm text-gray-600">
                Digital QR menu solution for modern restaurants and cafes.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/menu/demo-restoran" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Demo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/gizlilik-politikasi" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/kvkk" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://softwareoffuture.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-600 text-center">
              © 2026 Rivo QR. All rights reserved.{" "}
              <span className="text-gray-400">Developed by{" "}
                <a
                  href="https://softwareoffuture.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF6F00] hover:text-[#E55F00] font-semibold"
                >
                  Software Of Future
                </a>
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
