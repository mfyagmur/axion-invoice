import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { SignupForm } from '@/features/auth/components/SignupForm'

interface AuthShellProps {
  mode: 'login' | 'signup'
}

export function AuthShell({ mode }: AuthShellProps) {
  const { t } = useTranslation()
  const isLogin = mode === 'login'

  const loginPanelRef = useRef<HTMLDivElement>(null)
  const signupPanelRef = useRef<HTMLDivElement>(null)
  const [panelHeight, setPanelHeight] = useState<number>()

  // Aktif panelin gerçek içerik yüksekliği ölçülür (ör. Kurumsal seçilince "Şirket Adı"
  // alanı eklenince), kart bu yüksekliğe göre büyür/küçülür — sabit yükseklikte içerik
  // kesilmesini (overflow) önler.
  useEffect(() => {
    const el = isLogin ? loginPanelRef.current : signupPanelRef.current
    if (!el) return
    const updateHeight = () => setPanelHeight(el.scrollHeight)
    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(el)
    return () => observer.disconnect()
  }, [isLogin])

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/60">
      {/* Mobil: overlay yok, sadece aktif form tam genişlik */}
      <div className="p-6 sm:p-8 md:hidden">{isLogin ? <LoginForm /> : <SignupForm />}</div>

      {/* Masaüstü: gerçek kayan panel geçişi — form ve overlay karşılıklı yer değiştirir */}
      <div
        className="relative hidden overflow-hidden transition-[height] duration-300 ease-in-out md:block"
        style={{ height: panelHeight ? `${panelHeight}px` : undefined, minHeight: panelHeight ? undefined : '35rem' }}
      >
        {/*
          Login ve Signup panelleri her zaman AYNI konumda hareket eder (ikisi de left-0'dan
          translateX(100%)'e geçer) — sadece opacity/z-index ile hangisinin görünür olduğu
          değişir. Böylece form paneli hiçbir zaman overlay panelinin durduğu yarıyla çakışmaz:
          mode=login iken form solda + overlay sağda, mode=signup iken form sağda + overlay
          solda (aşağıdaki overlay bloğuna bakın). Kartın yüksekliği aktif panelin gerçek
          içeriğine göre ölçülüp uygulanır (bkz. yukarıdaki ResizeObserver) — Kurumsal
          seçilince eklenen "Şirket Adı" alanı kartı kesmeden büyütür.
        */}
        <div
          ref={loginPanelRef}
          className="absolute inset-x-0 top-0 flex w-1/2 items-center justify-center transition-all duration-600 ease-in-out"
          style={{
            transform: isLogin ? 'translateX(0%)' : 'translateX(100%)',
            opacity: isLogin ? 1 : 0,
            zIndex: isLogin ? 2 : 1,
          }}
          inert={!isLogin}
        >
          <LoginForm />
        </div>

        <div
          ref={signupPanelRef}
          className="absolute inset-x-0 top-0 flex w-1/2 items-center justify-center transition-all duration-600 ease-in-out"
          style={{
            transform: isLogin ? 'translateX(0%)' : 'translateX(100%)',
            opacity: isLogin ? 0 : 1,
            zIndex: isLogin ? 1 : 2,
          }}
          inert={isLogin}
        >
          <SignupForm />
        </div>

        <div
          className="absolute inset-y-0 z-30 w-1/2 overflow-hidden transition-transform duration-600 ease-in-out"
          style={{ left: '50%', transform: isLogin ? 'translateX(0%)' : 'translateX(-100%)' }}
        >
          <div className="flex h-full flex-col items-center justify-center gap-4 bg-linear-to-br from-[#111827] to-[#1e3a8a] p-10 text-center text-white">
            {isLogin ? (
              <>
                <h2 className="text-2xl font-semibold">{t('auth.overlay.toSignup.title')}</h2>
                <p className="text-sm text-white/80">{t('auth.overlay.toSignup.body')}</p>
                <Link
                  to="/signup"
                  className="rounded-md border border-white/70 px-5 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                >
                  {t('auth.overlay.toSignup.cta')}
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold">{t('auth.overlay.toLogin.title')}</h2>
                <p className="text-sm text-white/80">{t('auth.overlay.toLogin.body')}</p>
                <Link
                  to="/login"
                  className="rounded-md border border-white/70 px-5 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                >
                  {t('auth.overlay.toLogin.cta')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
