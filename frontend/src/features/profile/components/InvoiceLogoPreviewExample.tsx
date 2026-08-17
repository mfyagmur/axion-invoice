import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { getAssetUrl } from '@/lib/assetUrl'

export function InvoiceLogoPreviewExample() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const logoUrl = getAssetUrl(user?.logo_url)

  if (!logoUrl) return null

  return (
    <div className="mt-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {t('settings.account.logo.previewSectionTitle')}
      </p>
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
    </div>
  )
}
