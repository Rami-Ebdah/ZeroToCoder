import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { lightTheme } from "./theme";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import HomePage from "./pages/HomePage";

// Pages are code-split so the home page doesn't download the whole app.
const AuthPage = lazy(() => import("./pages/auth/AuthPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));

const CoursesPage = lazy(() => import("./pages/courses/CoursesPage"));
const CourseDetailsPage = lazy(() => import("./pages/courses/CourseDetailsPage"));
const MyLearningPage = lazy(() => import("./pages/courses/MyLearningPage"));
const ExamPage = lazy(() => import("./pages/courses/ExamPage"));
const ExamResultPage = lazy(() => import("./pages/courses/ExamResultPage"));
const EvaluationPage = lazy(() => import("./pages/courses/EvaluationPage"));
const CertificatePage = lazy(() => import("./pages/courses/CertificatePage"));
const AchievementsPage = lazy(() => import("./pages/courses/AchievementsPage"));
const ReviewPage = lazy(() => import("./pages/courses/ReviewPage"));

const PaymentPage = lazy(() => import("./pages/payment/PaymentPage"));
const BundlePaymentPage = lazy(() => import("./pages/payment/BundlePaymentPage"));
const CouponsPage = lazy(() => import("./pages/payment/CouponsPage"));
const SavingBundlesPage = lazy(() => import("./pages/payment/SavingBundlesPage"));

const CommunityPage = lazy(() => import("./pages/community/CommunityPage"));
const FAQPage = lazy(() => import("./pages/faq/FAQPage"));
const JobsPage = lazy(() => import("./pages/jobs/JobsPage"));
const RoadmapsPage = lazy(() => import("./pages/roadmaps/RoadmapsPage"));
const RoadmapDetailsPage = lazy(() => import("./pages/roadmaps/RoadmapDetailsPage"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));
const TodoPage = lazy(() => import("./pages/todo/TodoPage"));

const AdminProfilePage = lazy(() => import("./pages/admin/AdminProfilePage"));
const AdminCoursesPage = lazy(() => import("./pages/admin/AdminCoursesPage"));
const AdminCouponsPage = lazy(() => import("./pages/admin/AdminCouponsPage"));
const AdminBundlesPage = lazy(() => import("./pages/admin/AdminBundlesPage"));
const AdminJobsPage = lazy(() => import("./pages/admin/AdminJobsPage"));
const AdminRoadmapsPage = lazy(() => import("./pages/admin/AdminRoadmapsPage"));
const AdminFAQsPage = lazy(() => import("./pages/admin/AdminFAQsPage"));

const USER = ["user"];
const ANY = ["user", "admin"];
const ADMIN = ["admin"];

/** [path, Page, allowedRoles] — every route here requires login. */
const protectedRoutes = [
  // Student
  ["/profile", ProfilePage, USER],
  ["/my-learning", MyLearningPage, ANY],
  ["/courses", CoursesPage, ANY],
  ["/course/:id", CourseDetailsPage, ANY],
  ["/course/:courseId/exam", ExamPage, USER],
  ["/course/:courseId/exam/result", ExamResultPage, USER],
  ["/course/:courseId/review", ReviewPage, USER],
  ["/course/:id/evaluation", EvaluationPage, USER],
  ["/course/:id/CertificatePage", CertificatePage, USER],
  ["/course/:id/achievements", AchievementsPage, USER],
  ["/payment/:courseId", PaymentPage, ANY],
  ["/bundle-payment/:bundleID", BundlePaymentPage, ANY],
  ["/community", CommunityPage, ANY],
  ["/FAQs", FAQPage, ANY],
  ["/coupons", CouponsPage, ANY],
  ["/bundles", SavingBundlesPage, ANY],
  ["/jobs", JobsPage, ANY],
  ["/roadmaps", RoadmapsPage, ANY],
  ["/roadmaps/:roadmapName", RoadmapDetailsPage, ANY],
  ["/ToDoList", TodoPage, ANY],

  // Admin
  ["/admin/profile", AdminProfilePage, ADMIN],
  ["/admin/coupons", AdminCouponsPage, ADMIN],
  ["/admin/bundles", AdminBundlesPage, ADMIN],
  ["/admin/jobs", AdminJobsPage, ADMIN],
  ["/admin/Courses", AdminCoursesPage, ADMIN],
  ["/admin/roadmaps", AdminRoadmapsPage, ADMIN],
  ["/admin/FAQs", AdminFAQsPage, ADMIN],
];

const PageLoader = () => (
  <div style={{ display: "grid", placeItems: "center", minHeight: "60vh" }} aria-busy="true">
    Loading…
  </div>
);

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <AuthProvider>
        <BrowserRouter>
          <div id="up" className="container">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {protectedRoutes.map(([path, Page, roles]) => (
                  <Route
                    key={path}
                    path={path}
                    element={<ProtectedRoute element={<Page />} allowedRoles={roles} />}
                  />
                ))}

                <Route path="*" element={<HomePage />} />
              </Routes>
            </Suspense>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
