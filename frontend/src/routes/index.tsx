import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PublicOnlyRoute } from '@/components/PublicOnlyRoute'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AdminTemplatesPage } from '@/pages/admin/AdminTemplatesPage'
import { AuthShell } from '@/features/auth/components/AuthShell'
import { DemoLoginForm } from '@/features/auth/components/DemoLoginForm'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'
import { CustomerDetailPage } from '@/pages/dashboard/CustomerDetailPage'
import { CustomersPage } from '@/pages/dashboard/CustomersPage'
import { DashboardHomePage } from '@/pages/dashboard/DashboardHomePage'
import { DashboardPlaceholderPage } from '@/pages/dashboard/DashboardPlaceholderPage'
import { InvoiceCreatePage } from '@/pages/dashboard/InvoiceCreatePage'
import { InvoiceDetailPage } from '@/pages/dashboard/InvoiceDetailPage'
import { InvoicesPage } from '@/pages/dashboard/InvoicesPage'
import { SettingsPage } from '@/pages/dashboard/SettingsPage'
import { TemplateEditorPage } from '@/pages/dashboard/TemplateEditorPage'
import { TemplatesPage } from '@/pages/dashboard/TemplatesPage'
import { LandingPage } from '@/pages/landing/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PaymentPlaceholderPage } from '@/pages/PaymentPlaceholderPage'
import { ContactPlaceholderPage } from '@/pages/ContactPlaceholderPage'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/odeme', element: <PaymentPlaceholderPage /> },
      { path: '/iletisim', element: <ContactPlaceholderPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: '/login', element: <AuthShell mode="login" /> },
          { path: '/signup', element: <AuthShell mode="signup" /> },
          { path: '/get-started', element: <DemoLoginForm /> },
          { path: '/forgot-password', element: <ForgotPasswordForm /> },
          { path: '/reset-password', element: <ResetPasswordForm /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: <DashboardHomePage /> },
          {
            path: '/dashboard/nasil-calisir',
            element: <DashboardPlaceholderPage titleKey="dashboardPlaceholder.howItWorks.title" />,
          },
          {
            path: '/dashboard/ne-nedir-nasil',
            element: <DashboardPlaceholderPage titleKey="dashboardPlaceholder.whatIsHow.title" />,
          },
          { path: '/dashboard/invoices', element: <InvoicesPage /> },
          { path: '/dashboard/invoices/new', element: <InvoiceCreatePage /> },
          { path: '/dashboard/invoices/:id', element: <InvoiceDetailPage /> },
          { path: '/dashboard/templates', element: <TemplatesPage /> },
          { path: '/dashboard/templates/new', element: <TemplateEditorPage /> },
          { path: '/dashboard/templates/:id/edit', element: <TemplateEditorPage /> },
          { path: '/dashboard/customers', element: <CustomersPage /> },
          { path: '/dashboard/customers/:id', element: <CustomerDetailPage /> },
          { path: '/dashboard/settings', element: <SettingsPage /> },
          { path: '/dashboard/billing', element: <Navigate to="/dashboard/settings?tab=billing" replace /> },
          { path: '/dashboard/admin/templates', element: <AdminTemplatesPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
