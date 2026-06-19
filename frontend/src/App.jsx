// src/App.jsx
import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { CMSProvider, useCMS } from './context/CMSContext';
import { useScrollReveal } from './hooks/useScrollReveal';
import SmoothScroll from './components/SmoothScroll/SmoothScroll';

import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import FeaturedCategories from './components/FeaturedCategories/FeaturedCategories';
import NewArrivals from './components/NewArrivals/NewArrivals';
import BestSellers from './components/BestSellers/BestSellers';
import BrandStory from './components/BrandStory/BrandStory';
import ProductShowcase from './components/ProductShowcase/ProductShowcase';
import Testimonials from './components/Testimonials/Testimonials';
import WhyChooseUs from './components/WhyChooseUs/WhyChooseUs';
import SocialGallery from './components/SocialGallery/SocialGallery';
import ExclusiveOffers from './components/ExclusiveOffers/ExclusiveOffers';
import Footer from './components/Footer/Footer';
import AuthModal from './components/AuthModal/AuthModal';
import CartModal from './components/CartModal/CartModal';
import WishlistModal from './components/WishlistModal/WishlistModal';
import SupportModal from './components/SupportModal/SupportModal';
import QuickViewModal from './components/QuickViewModal/QuickViewModal';
import FloatingWhatsApp from './components/FloatingWhatsApp/FloatingWhatsApp';
import CustomerStoreSelector from './components/CustomerStoreSelector/CustomerStoreSelector';

const VirtualTryOn = lazy(() => import('./components/VirtualTryOn/VirtualTryOn'));
const Catalog = lazy(() => import('./pages/Catalog'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const MensJewellery = lazy(() => import('./pages/MensJewellery'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const LMSLanding = lazy(() => import('./pages/LMSLanding'));

const AdminApp = lazy(() => import('./admin/AdminApp'));
const CustomerApp = lazy(() => import('./customer/CustomerApp'));
const DeliveryApp = lazy(() => import('./delivery/DeliveryApp'));

import './index.css';
import { logError, logPerformance } from './services/logger';

function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return <div className="toast">{toast}</div>;
}

function GlobalModals() {
  const { isSupportOpen, setIsSupportOpen, vtoProduct, setVtoProduct, isCartOpen, setIsCartOpen, isWishlistOpen, setIsWishlistOpen } = useApp();
  return (
    <>
      <CustomerStoreSelector />
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      <QuickViewModal />
      <Suspense fallback={null}>
        <VirtualTryOn isOpen={!!vtoProduct} onClose={() => setVtoProduct(null)} product={vtoProduct} />
      </Suspense>
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistModal isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </>
  );
}

function StoreLayout() {
  useScrollReveal();
  const { isCartOpen, setIsCartOpen, isWishlistOpen, setIsWishlistOpen } = useApp();

  return (
    <SmoothScroll>
      <Header onCartClick={() => setIsCartOpen(true)} onWishlistClick={() => setIsWishlistOpen(true)} />
      <main>
        <Suspense fallback={<div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>Loading page...</div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <Toast />
      <AuthModal />
      <FloatingWhatsApp />
    </SmoothScroll>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Check if there's a pending hash scroll target (set by Footer when navigating cross-page)
    const pendingHash = sessionStorage.getItem('jw_scroll_to');
    if (pendingHash) {
      sessionStorage.removeItem('jw_scroll_to');
      // Give the new page time to render before scrolling
      const timer = setTimeout(() => {
        const el = document.getElementById(pendingHash);
        if (el) {
          if (window.lenis) {
            window.lenis.scrollTo(el, { duration: 1.4, offset: -120 });
          } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 300);
      return () => clearTimeout(timer);
    }

    // Default: scroll to top on route change
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: false, duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname]);

  return null;
}

function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <NewArrivals />
      <BestSellers />
      <ExclusiveOffers />
      <BrandStory />
      <ProductShowcase />
      <Testimonials />
      <WhyChooseUs />
      <SocialGallery />
    </>
  );
}

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
    logError(error, { componentStack: errorInfo.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', background: '#222', height: '100vh', overflow: 'auto' }}>
          <h2>Something went wrong in the app!</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children; 
  }
}

function GlobalBrandingApplier() {
  const { landingPageData, systemSettingsData } = useCMS();
  
  useEffect(() => {
    const title = landingPageData?.branding?.storeName || systemSettingsData?.storeName || landingPageData?.seo?.title || 'Lumina Jewels';
    document.title = title;

    // Dynamically update favicon if store logo is set
    const logoUrl = landingPageData?.branding?.logoUrl;
    if (logoUrl) {
      const links = document.querySelectorAll("link[rel*='icon']");
      links.forEach(link => {
        link.href = logoUrl;
      });
    }
  }, [systemSettingsData?.storeName, landingPageData?.branding?.storeName, landingPageData?.seo?.title, landingPageData?.branding?.logoUrl]);

  return null;
}

export default function App() {
  useEffect(() => {
    // Basic Performance Monitoring
    try {
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'LCP') {
              logPerformance('LCP', entry.startTime, { type: entry.entryType });
            }
          }
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Also log basic page load time
        window.addEventListener('load', () => {
          setTimeout(() => {
            const timing = performance.getEntriesByType('navigation')[0];
            if (timing) {
              logPerformance('PageLoad', timing.loadEventEnd - timing.startTime);
            }
          }, 0);
        });
      }
    } catch (e) {
      console.warn("Performance monitoring not supported", e);
    }
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>
        <CMSProvider>
          <GlobalBrandingApplier />
          <BrowserRouter>
            <ScrollToTop />
            <GlobalModals />
            <Suspense fallback={<div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>Loading Application...</div>}>
              <Routes>
                <Route path="/admin/*" element={<AdminApp />} />
                <Route path="/account/*" element={<CustomerApp />} />
                <Route path="/delivery/*" element={<DeliveryApp />} />
                <Route path="/track/:orderId" element={<TrackOrder />} />
                <Route path="/lms" element={<LMSLanding />} />
                <Route path="/*" element={<StoreLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="collections" element={<Catalog />} />
                  <Route path="mens" element={<MensJewellery />} />
                  <Route path="product/:id" element={<ProductDetails />} />
                  <Route path="privacy-policy" element={<LegalPage />} />
                  <Route path="terms-of-service" element={<LegalPage />} />
                  <Route path="cookies" element={<LegalPage />} />
                  <Route path="returns-policy" element={<LegalPage />} />
                  <Route path="size-guide" element={<LegalPage />} />
                  <Route path="care-instructions" element={<LegalPage />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CMSProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}
