import { Navigate, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import PaymentStatus from "./pages/PaymentStatus.jsx";
import Dashboard from "./pages/user/Dashboard.jsx";
import FundAccount from "./pages/user/FundAccount.jsx";
import PhoneNumber from "./pages/user/PhoneNumber.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserLayout from "./layouts/UserLayout.jsx";
import OtpBox from "./pages/user/OtpBox.jsx";
import UserDeposits from "./pages/user/UserDeposits.jsx";
import UserReceipts from "./pages/user/UserReceipts.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import Users from "./pages/Admin/Users.jsx";
import Transactions from "./pages/Admin/Transactions.jsx";
import AdminNumbers from "./pages/Admin/AdminNumbers.jsx";
import AdminOtpOrders from "./pages/Admin/AdminOtpOrders.jsx";
import ManualAccount from "./pages/Admin/ManualAccount.jsx";
import Setting from "./pages/user/Setting.jsx";
import UserSupport from "./pages/user/UserSupport.jsx";
import AdminSupport from "./pages/Admin/AdminSupport.jsx";
import AdminStats from "./pages/Admin/AdminStats.jsx";
import TermsAndConditions from "./pages/termsAndConditions.jsx";
import PrivacyPolicy from "./pages/privacy.jsx";
import FloatingChat from "./components/FloatingChat.jsx";
// import SiteNotWorking from  "./components/SiteNotWorking.jsx"

const App = () => {
  return (
    <>
      <ToastContainer
        position="bottom-right"
        theme="light"
        toastClassName="toast-themed"
      />
      {/* <SiteNotWorking /> */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/payment/status" element={<PaymentStatus />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/Privacy" element={<PrivacyPolicy />} />

        <Route
          path="/f"
          element={
            <ProtectedRoute role="user">
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/f/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="fund-account" element={<FundAccount />} />
          <Route path="numbers" element={<PhoneNumber />} />
          <Route path="otp-box" element={<OtpBox />} />
          <Route path="deposits" element={<UserDeposits />} />
          <Route path="receipts" element={<UserReceipts />} />
          <Route path="settings" element={<Setting />} />
          <Route path="support" element={<UserSupport />} />
        </Route>

        <Route
          path="/a"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/a/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="stats" element={<AdminStats />} />
          <Route path="users" element={<Users />} />
          <Route path="deposits" element={<Transactions />} />
          <Route path="manual-account" element={<ManualAccount />} />
          <Route path="numbers" element={<AdminNumbers />} />
          <Route path="otp-orders" element={<AdminOtpOrders />} />
          <Route path="support" element={<AdminSupport />} />
        </Route>
      </Routes>
      <FloatingChat />
    </>
  );
};

export default App;
