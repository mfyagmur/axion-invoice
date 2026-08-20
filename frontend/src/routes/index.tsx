import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PublicOnlyRoute } from '@/components/PublicOnlyRoute'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AdminTemplatesPage } from '@/pages/admin/AdminTemplatesPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { CustomerDetailPage } from '@/pages/dashboard/CustomerDetailPage'
import { CustomersPage } from '@/pages/dashboard/CustomersPage'
import { DashboardHomePage } from '@/pages/dashboard/DashboardHomePage'
import { InvoiceCreatePage } from '@/pages/dashboard/InvoiceCreatePage'
import { InvoiceDetailPage } from '@/pages/dashboard/InvoiceDetailPage'
import { InvoicesPage } from '@/pages/dashboard/InvoicesPage'
import { SettingsPage } from '@/pages/dashboard/SettingsPage'
import { TemplateEditorPage } from '@/pages/dashboard/TemplateEditorPage'
import { TemplatesPage } from '@/pages/dashboard/TemplatesPage'
import { LandingPage } from '@/pages/landing/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/signup', element: <SignupPage /> },
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
