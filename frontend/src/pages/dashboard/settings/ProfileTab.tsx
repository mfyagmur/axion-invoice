import { useTranslation } from 'react-i18next'
import { Mail, MapPin, Phone, Pencil } from 'lucide-react'
import { Card } from '@/components/Card'
import { useAuthStore } from '@/store/authStore'
import { useLocaleStore } from '@/store/localeStore'
import type { Locale } from '@/types/auth'

const PROFESSIONS = [
  { value: 'yazilim', label: 'Yazılım Geliştirici' },
  { value: 'muhasebe', label: 'Muhasebeci' },
  { value: 'mali_musavir', label: 'Mali Müşavir' },
  { value: 'grafik', label: 'Grafik Tasarımcı' },
  { value: 'pazarlama', label: 'Pazarlama Uzmanı/Müdürü' },
  { value: 'satis', label: 'Satış Müdürü' },
  { value: 'insan_kaynaklari', label: 'İnsan Kaynakları' },
  { value: 'proje_yoneticisi', label: 'Proje Yöneticisi' },
  { value: 'danisman', label: 'Danışman' },
  { value: 'avukat', label: 'Avukat' },
  { value: 'bilgisayar_muhendisi', label: 'Bilgisayar Mühendisi' },
  { value: 'mimar', label: 'Mimar' },
  { value: 'elektrik_muhendisi', label: 'Elektrik Mühendisi' },
  { value: 'makine_muhendisi', label: 'Makine Mühendisi' },
  { value: 'endustri_muhendisi', label: 'Endüstri Mühendisi' },
  { value: 'yapay_zeka', label: 'Yapay Zeka Uzmanı/Mühendisi' },
  { value: 'veri', label: 'Veri Analisti' },
  { value: 'veritabani', label: 'Veritabanı Yöneticisi' },
  { value: 'siber_guvenlik', label: 'Siber Güvenlik Uzmanı' },
  { value: 'network', label: 'Network Uzmanı' },
  { value: 'bulut_bilisim', label: 'Bulut Bilişim Uzmanı' },
  { value: 'veri_bilimci', label: 'Veri Bilimci' },
  { value: 'mobil_uygulama', label: 'Mobil Uygulama Geliştirici' },
  { value: 'web_gelistirici', label: 'Web Geliştirici' },
  { value: 'oyun_gelistirici', label: 'Oyun Geliştirici' },
  { value: 'yapay_zeka_egitim', label: 'Yapay Zeka Eğitmeni' },
  { value: 'berber', label: 'Berber' },
  { value: 'kuafor', label: 'Kuaför' },
  { value: 'musteri_hizmetleri', label: 'Müşteri Hizmetleri' },
  { value: 'saglik', label: 'Sağlık Sektörü' },
  { value: 'egitim', label: 'Eğitim Sektörü' },
  { value: 'finans', label: 'Finans Sektörü' },
  { value: 'insaat', label: 'İnşaat Sektörü' },
  { value: 'lojistik', label: 'Lojistik Sektörü' },
  { value: 'turizm', label: 'Turizm Sektörü' },
  { value: 'medya', label: 'Medya Sektörü' },
  { value: 'hukuk', label: 'Hukuk Sektörü' },
  { value: 'e-ticaret', label: 'E-Ticaret Sektörü' },
  { value: 'diger', label: 'Diğer' },
]

const LANGUAGES = [
  { value: 'tr', label: 'Türkçe', flag: 'fi-tr' },
  { value: 'en', label: 'English', flag: 'fi-gb' },
]

export function ProfileTab() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const { locale, setLocale } = useLocaleStore()

  if (!user) return null

  return (
    <div className="flex flex-col gap-6">
      <Card className="rounded-xl shadow-md">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">{user.full_name}</h2>

          <div className="inline-block rounded bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {user.account_type === 'bireysel' ? 'Bireysel' : 'Kurumsal'}
          </div>

          {/* TODO: Konum/telefon salt-okunur placeholder; register akışına eklenecek */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="flex items-center gap-3">
              <Mail size={18} className="shrink-0 text-slate-500" />
              <span className="text-sm text-slate-700">{user.email}</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={18} className="shrink-0 text-slate-500" />
              <span className="text-sm text-slate-700">{user.country || '-'}</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={18} className="shrink-0 text-slate-500" />
              <span className="text-sm text-slate-700">{user.phone || '_ _ ( _ _ _ ) _ _ _ _ _ _ _'}</span>
              <button
                type="button"
                className="shrink-0 rounded p-1 hover:bg-slate-100"
                title={t('common.edit')}
              >
                <Pencil size={16} className="text-slate-500" />
              </button>
            </div>
          </div>

          <p className="border-t border-slate-200 pt-4 text-xs text-slate-600">
            Kişisel bilgilerinizi güncellemek için{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
              destek ekibimizle iletişime geçin
            </a>
            .
          </p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-xl shadow-md">
          <div className="space-y-2">
            <label htmlFor="language" className="block text-sm font-semibold text-slate-900">
              {t('common.language')}
            </label>
            <select
              id="language"
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <Card className="rounded-xl shadow-md">
          <div className="space-y-2">
            <label htmlFor="profession" className="block text-sm font-semibold text-slate-900">
              Meslek
            </label>
            <select
              id="profession"
              defaultValue=""
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="">Seçiniz...</option>
              {PROFESSIONS.map((prof) => (
                <option key={prof.value} value={prof.value}>
                  {prof.label}
                </option>
              ))}
            </select>
          </div>
        </Card>
      </div>
    </div>
  )
}
