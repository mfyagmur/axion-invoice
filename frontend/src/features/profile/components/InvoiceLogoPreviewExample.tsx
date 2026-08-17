import { useTranslation } from 'react-i18next'
import { ImageIcon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getAssetUrl } from '@/lib/assetUrl'

export function InvoiceLogoPreviewExample() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const logoUrl = getAssetUrl(user?.logo_url)

  if (!logoUrl) {
    return (
      <div className="flex min-h-24 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-4">
        <ImageIcon className="mb-2 text-slate-400" size={32} />
        <p className="text-center text-sm text-slate-500">{t('settings.account.logo.previewEmptyState')}</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="h-16 w-48">
          <img src={logoUrl} alt="Logo" className="h-full w-full object-contain object-left" />
        </div>
        <div className="text-right text-sm text-slate-500">
          <p className="font-semibold text-slate-900">{user?.company_name}</p>
          <p>FATURA #2026-00042</p>
        </div>
      </div>
    </div>
  )
}
