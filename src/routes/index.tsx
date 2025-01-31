import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '../components/ui/AuthGuard';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';
import UserDashboard from '../components/UserDashboard';
import OnboardingFlow from '../pages/OnboardingFlow';
import ProgressTracker from '../components/dashboard/ProgressTracker';
import WorkoutSchedule from '../components/dashboard/WorkoutSchedule';
import NutritionLog from '../components/dashboard/NutritionLog';
import ProfileSettings from '../components/profile/ProfileSettings';
import Programs from '../pages/programs/index';

// Program Pages
import ShredProgram from '../pages/programs/ShredProgram';
import AppWorkouts from '../pages/programs/AppWorkouts';
import TrainerSupport from '../pages/programs/TrainerSupport';
import PlusMembership from '../pages/programs/PlusMembership';
import AppWorkoutsLanding from '../pages/memberships/AppWorkouts';
import NutritionOnlyLanding from '../pages/memberships/NutritionOnly';
import PlusMembershipLanding from '../pages/memberships/PlusMembership';
import NutritionCoaching from '../pages/programs/NutritionCoaching';

// Resource Pages
import WorkoutLibrary from '../pages/resources/WorkoutLibrary';
import NutritionGuides from '../pages/resources/NutritionGuides';
import RecipeCollection from '../pages/resources/RecipeCollection';
import MacroGuide from '../pages/resources/MacroGuide';
import MealPlans from '../pages/resources/MealPlans';
import TrainingTips from '../pages/resources/TrainingTips';
import Transformations from '../pages/resources/Transformations';
import Blog from '../pages/Blog';
import BlogPost from '../pages/BlogPost';

// Shop Pages
import Shop from '../pages/shop/Shop';
import Memberships from '../pages/shop/Memberships';
import TrainingPrograms from '../pages/shop/TrainingPrograms';
import Apparel from '../pages/shop/Apparel';
import Supplements from '../pages/shop/Supplements';
import Gear from '../pages/shop/Gear';
import ProductDetails from '../pages/shop/ProductDetails';
import Checkout from '../pages/Checkout';
import CheckoutSuccess from '../pages/checkout/Success';
import CheckoutCancel from '../pages/checkout/Cancel';
import QuestionnairePage from '../pages/questionnaire';
import TestStripe from '../components/TestStripe';

// Error Pages
import NotFound from '../pages/error/NotFound';
import Unauthorized from '../pages/error/Unauthorized';
import ServerError from '../pages/error/ServerError';

// Other Pages
import About from '../pages/About';
import FAQ from '../pages/FAQ';
import Contact from '../pages/Contact';
import ServicesPage from '../pages/ServicesPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/onboarding"
        element={
          <AuthGuard>
            <OnboardingFlow />
          </AuthGuard>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/shop/memberships" element={<Memberships />} />
      <Route path="/shop/programs" element={<TrainingPrograms />} />
      <Route path="/shop/gear" element={<Gear />} />
      <Route path="/shop/gear/:slug" element={<ProductDetails />} />
      <Route path="/shop/gear/apparel" element={<Apparel />} />
      <Route path="/shop/gear/supplements" element={<Supplements />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/checkout/success" element={<CheckoutSuccess />} />
      <Route path="/checkout/cancel" element={<CheckoutCancel />} />
      <Route path="/test-stripe" element={<TestStripe />} />

      {/* Membership & Program Routes */}
      <Route path="/memberships" element={<Programs />} />
      <Route path="/memberships/app-workouts">
        <Route index element={<AppWorkoutsLanding />} />
        <Route path="details" element={<AppWorkouts />} />
      </Route>
      <Route path="/memberships/nutrition">
        <Route index element={<NutritionOnlyLanding />} />
        <Route path="details" element={<NutritionCoaching />} />
      </Route>
      <Route path="/memberships/plus">
        <Route index element={<PlusMembershipLanding />} />
        <Route path="details" element={<PlusMembership />} />
      </Route>
      <Route path="/memberships/shred" element={<ShredProgram />} />
      <Route path="/memberships/trainer-support" element={<TrainerSupport />} />

      {/* Resource Routes */}
      <Route path="/resources/workouts" element={<WorkoutLibrary />} />
      <Route path="/resources/nutrition" element={<NutritionGuides />} />
      <Route path="/resources/recipes" element={<RecipeCollection />} />
      <Route path="/resources/macros" element={<MacroGuide />} />
      <Route path="/resources/meal-plans" element={<MealPlans />} />
      <Route path="/resources/tips" element={<TrainingTips />} />
      <Route path="/resources/transformations" element={<Transformations />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />

      {/* Other Routes */}
      <Route path="/about" element={<About />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Error Pages */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/500" element={<ServerError />} />

      {/* Protected Routes */}
      <Route
        path="/onboarding"
        element={
          <AuthGuard>
            <OnboardingFlow />
          </AuthGuard>
        }
      />
      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            {({ user }) => (
              user?.onboarding?.status === 'completed' ? (
                <UserDashboard />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            )}
          </AuthGuard>
        }
      />
      <Route
        path="/dashboard/progress"
        element={
          <AuthGuard>
            <ProgressTracker />
          </AuthGuard>
        }
      />
      <Route
        path="/dashboard/schedule"
        element={
          <AuthGuard>
            <WorkoutSchedule />
          </AuthGuard>
        }
      />
      <Route
        path="/dashboard/nutrition"
        element={
          <AuthGuard>
            <NutritionLog />
          </AuthGuard>
        }
      />
      <Route
        path="/dashboard/settings"
        element={
          <AuthGuard>
            <ProfileSettings />
          </AuthGuard>
        }
      />
      <Route
        path="/admin/*"
        element={
          <AuthGuard requireAdmin>
            <AdminDashboard />
          </AuthGuard>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;