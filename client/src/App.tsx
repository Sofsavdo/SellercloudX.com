import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { AuthProvider } from "./hooks/useAuth";
import { LanguageProvider } from "./context/LanguageContext";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import LandingNew from "./pages/LandingNew";
import AuthPage from "./pages/AuthPage";
import AdminLogin from "./pages/AdminLogin";
import PartnerDashboard from "./pages/PartnerDashboard";
import PartnerAIDashboard from "./pages/PartnerAIDashboard";
import EnhancedAIDashboard from "./pages/EnhancedAIDashboard";
import RemoteAccessDashboard from "./pages/RemoteAccessDashboard";
import OnboardingWizard from "./pages/OnboardingWizard";
import AdminPanel from "./pages/AdminPanel";
import InvestorPitch from "./pages/InvestorPitch";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import NotFound from "./pages/not-found";
import PartnerRegistrationNew from "./pages/PartnerRegistrationNew";
import TrendHunterDashboard from "./pages/TrendHunterDashboard";
import CameraAIScanner from "./pages/CameraAIScanner";
import UzumMarketDashboard from "./pages/UzumMarketDashboard";
import PartnerCredentialsPage from "./pages/PartnerCredentialsPage";
import AIManagerPage from "./pages/AIManagerPage";
import UnifiedAIScanner from "./pages/UnifiedAIScanner";
import YandexMarketScanner from "./pages/YandexMarketScanner";
import YandexQuickCreate from "./pages/YandexQuickCreate";
import InfographicGenerator from "./pages/InfographicGenerator";
import AIProductCreator from "./pages/AIProductCreator";
import PricingPage from "./pages/PricingPage";
import YandexDashboard from "./pages/YandexDashboard";
import SellerLandingPage from "./pages/SellerLandingPage";

function Router() {
  return (
    <Switch>
      {/* Ochiq sahifalar */}
      <Route path="/" component={LandingNew} />
      <Route path="/seller" component={SellerLandingPage} />
      <Route path="/seller-landing" component={SellerLandingPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/partner-registration" component={PartnerRegistrationNew} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/investor-pitch" component={InvestorPitch} />
      
      {/* Himoyalangan sahifalar - Bepul */}
      <Route path="/partner-dashboard">
        <ProtectedRoute><PartnerDashboard /></ProtectedRoute>
      </Route>
      <Route path="/onboarding">
        <ProtectedRoute><OnboardingWizard /></ProtectedRoute>
      </Route>
      <Route path="/partner-credentials">
        <ProtectedRoute><PartnerCredentialsPage /></ProtectedRoute>
      </Route>
      
      {/* Himoyalangan - Start tarif */}
      <Route path="/ai-scanner">
        <ProtectedRoute requiredTier="start"><UnifiedAIScanner /></ProtectedRoute>
      </Route>
      <Route path="/product-scanner">
        <ProtectedRoute requiredTier="start"><UnifiedAIScanner /></ProtectedRoute>
      </Route>
      <Route path="/uzum-scanner">
        <ProtectedRoute requiredTier="start"><UnifiedAIScanner /></ProtectedRoute>
      </Route>
      <Route path="/camera-scanner">
        <ProtectedRoute requiredTier="start"><CameraAIScanner /></ProtectedRoute>
      </Route>
      <Route path="/ai-dashboard">
        <ProtectedRoute requiredTier="start"><PartnerAIDashboard /></ProtectedRoute>
      </Route>
      <Route path="/partner-ai-dashboard">
        <ProtectedRoute requiredTier="start"><PartnerAIDashboard /></ProtectedRoute>
      </Route>
      
      {/* Himoyalangan - Business tarif */}
      <Route path="/uzum-market">
        <ProtectedRoute requiredTier="business"><UzumMarketDashboard /></ProtectedRoute>
      </Route>
      <Route path="/yandex-market">
        <ProtectedRoute requiredTier="business"><YandexMarketScanner /></ProtectedRoute>
      </Route>
      <Route path="/yandex-scanner">
        <ProtectedRoute requiredTier="business"><YandexMarketScanner /></ProtectedRoute>
      </Route>
      <Route path="/yandex-quick">
        <ProtectedRoute requiredTier="business"><YandexQuickCreate /></ProtectedRoute>
      </Route>
      <Route path="/yandex-tez">
        <ProtectedRoute requiredTier="business"><YandexQuickCreate /></ProtectedRoute>
      </Route>
      <Route path="/create-product">
        <ProtectedRoute requiredTier="business"><AIProductCreator /></ProtectedRoute>
      </Route>
      <Route path="/ai-product-creator">
        <ProtectedRoute requiredTier="business"><AIProductCreator /></ProtectedRoute>
      </Route>
      <Route path="/infographic">
        <ProtectedRoute requiredTier="business"><InfographicGenerator /></ProtectedRoute>
      </Route>
      <Route path="/infographic-generator">
        <ProtectedRoute requiredTier="business"><InfographicGenerator /></ProtectedRoute>
      </Route>
      
      {/* Himoyalangan - Enterprise tarif */}
      <Route path="/ai-manager">
        <ProtectedRoute requiredTier="enterprise"><AIManagerPage /></ProtectedRoute>
      </Route>
      <Route path="/trend-hunter">
        <ProtectedRoute requiredTier="enterprise"><TrendHunterDashboard /></ProtectedRoute>
      </Route>
      <Route path="/enhanced-ai-dashboard">
        <ProtectedRoute requiredTier="enterprise"><EnhancedAIDashboard /></ProtectedRoute>
      </Route>
      <Route path="/remote-access">
        <ProtectedRoute requiredTier="enterprise"><RemoteAccessDashboard /></ProtectedRoute>
      </Route>
      <Route path="/yandex-dashboard">
        <ProtectedRoute requiredTier="basic"><YandexDashboard /></ProtectedRoute>
      </Route>
      
      {/* Admin panel - faqat adminlar uchun */}
      <Route path="/admin-panel">
        <ProtectedRoute requiredTier="admin"><AdminPanel /></ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
