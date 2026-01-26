import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'sonner';

// Components
import RequireAuth from './components/layout/RequireAuth';
import PublicOnly from './components/layout/PublicOnly';

// Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { ClassesPage } from './pages/ClassesPage';
import { CoursesPage } from './pages/CoursesPage';
import { ContactPage } from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import Enrollments from './pages/admin/Enrollments';
import ManageClasses from './pages/admin/ManageClasses';
import ManageCourses from './pages/admin/ManageCourses';
import ManageSessions from './pages/admin/ManageSessions';
import { CoursePlayerPage } from './pages/CoursePlayerPage';
import { ExploreCoursesPage } from './pages/ExploreCoursesPage';
import { ExploreClassesPage } from './pages/ExploreClassesPage';
import { ClassPlayerPage } from './pages/ClassPlayerPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import MyClasses from './pages/student/MyClasses';
import MyCourses from './pages/student/MyCourses';
import AdminLayout from './components/admin/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';
import MainLayout from './components/layout/MainLayout';
import RequireAdmin from './components/layout/RequireAdmin';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelledPage from './pages/PaymentCancelledPage';

// Redux
import { useGetMeQuery } from './features/auth/authApi';
import { setCredentials } from './features/auth/authSlice';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function SessionCheck() {
  const dispatch = useDispatch();
  const { data: user } = useGetMeQuery();

  useEffect(() => {
    if (user && user.data) {
      dispatch(setCredentials(user.data));
    } else if (user && !user.data && user.name) {
      // Handle case where user object is returned directly or wrapper differently
      dispatch(setCredentials(user));
    }
  }, [user, dispatch]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <SessionCheck />
      <div className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/30">
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          {/* Public & User Routes (Wrapped in MainLayout) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Protected User Routes */}
            <Route element={<RequireAuth />}>
              {/* Dashboard and Players moved to separate layout */}
              {/* <Route path="/profile" element={<ProfilePage />} /> */}
            </Route>
          </Route>

          {/* Student Routes (Standalone Layout) */}
          <Route element={<RequireAuth />}>
            <Route element={<StudentLayout />}>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/dashboard/my-classes" element={<MyClasses />} />
              <Route path="/dashboard/my-courses" element={<MyCourses />} />

              {/* Player Routes moved to Dashboard Layout */}
              <Route path="/dashboard/my-courses/:courseId" element={<CoursePlayerPage />} />
              <Route path="/dashboard/my-classes/:classId" element={<ClassPlayerPage />} />
            </Route>

            {/* Checkout (Protected but standalone layout) */}
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>

          {/* Payment Result Pages (Public - user may not be logged in after redirect) */}
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/cancelled" element={<PaymentCancelledPage />} />

          {/* Auth Routes (Standalone Layout) */}
          <Route element={<PublicOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Admin Routes (Standalone Layout) */}
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="enrollments" element={<Enrollments />} />
              <Route path="classes" element={<ManageClasses />} />
              <Route path="courses" element={<ManageCourses />} />
              <Route path="courses/:courseId/sessions" element={<ManageSessions />} />
              <Route path="classes/:classId/preview" element={<ClassPlayerPage backLink="/admin/classes" backText="Back to Classes" />} />
              <Route path="courses/:courseId/preview" element={<CoursePlayerPage backLink="/admin/courses" backText="Back to Courses" />} />
            </Route>
          </Route>

          {/* Standalone Explore Pages (No Header/Footer) */}
          <Route path="/courses/explore" element={<ExploreCoursesPage />} />
          <Route path="/classes/explore" element={<ExploreClassesPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;
