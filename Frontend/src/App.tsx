import { Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from '@/contexts/cart-context'
import { AuthProvider } from '@/contexts/auth-context'
import { ToastProvider } from '@/contexts/toast-context'
import { ChatbotButton } from '@/components/chatbot-button'
import ScrollToTop from '@/components/scroll-to-top'
import { Preloader } from '@/components/ui/preloader'

// Pages
import HomePage from '@/pages/HomePage'
import AuthPage from '@/pages/AuthPage'
import BookingPage from '@/pages/BookingPage'
import CartPage from '@/pages/CartPage'
import ContactPage from '@/pages/ContactPage'
import AboutPage from '@/pages/AboutPage'
import EHRPage from '@/pages/EHRPage'
import HistoryPage from '@/pages/HistoryPage'
import AccountPage from '@/pages/AccountPage'
import AdminPage from '@/pages/AdminPage'
import ClientsPage from '@/pages/ClientsPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Health Card Pages
import HealthCardPage from '@/pages/health-card/HealthCardPage'
import HealthCardAuthPage from '@/pages/health-card/HealthCardAuthPage'
import HealthCardFormPage from '@/pages/health-card/HealthCardFormPage'
import HealthCardViewPage from '@/pages/health-card/HealthCardViewPage'

// Lab Pages
import LabDetailPage from '@/pages/lab/LabDetailPage'
import TestDetailPage from '@/pages/lab/TestDetailPage'

// Services Pages
import LabsPage from '@/pages/services/LabsPage'
import HealthProgramPage from '@/pages/services/HealthProgramPage'
import SchoolHealthProgramPage from '@/pages/services/SchoolHealthProgramPage'
import CorporateHealthScreeningPage from '@/pages/services/CorporateHealthScreeningPage'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <Preloader />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/contact-us" element={<Navigate to="/contact" replace />} />
            <Route path="/ehr" element={<EHRPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/admin" element={<AdminPage />} />

            {/* Health Card Routes */}
            <Route path="/health-card" element={<HealthCardPage />} />
            <Route path="/health-card/auth" element={<HealthCardAuthPage />} />
            <Route path="/health-card/form" element={<HealthCardFormPage />} />
            <Route path="/health-card/view" element={<HealthCardViewPage />} />

            {/* Lab Routes */}
            <Route path="/lab/:labId" element={<LabDetailPage />} />
            <Route path="/lab/:labId/test/:testId" element={<TestDetailPage />} />

            {/* Services Routes */}
            <Route path="/services/labs" element={<LabsPage />} />
            <Route path="/services/health-program" element={<HealthProgramPage />} />
            <Route path="/services/school-health-program" element={<SchoolHealthProgramPage />} />
            <Route path="/services/corporate-health-screening" element={<CorporateHealthScreeningPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <ChatbotButton />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App


