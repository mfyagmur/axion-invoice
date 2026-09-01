import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, RefreshCw, Trash2, UploadCloud } from 'lucide-react'
import { Button } from '@/components/Button'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { getAssetUrl } from '@/lib/assetUrl'
import { useUploadLogo } from '../hooks/useUploadLogo'
import { useRemoveLogo } from '../hooks/useRemoveLogo'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']
const MAX_SIZE_BYTES = 2 * 1024 * 1024

export function LogoUpload() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const pushToast = useToastStore((state) => state.push)
  const uploadLogo = useUploadLogo()
  const removeLogo = useRemoveLogo()

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  const isUploading = uploadLogo.isPending
  const isRemoving = removeLogo.isPending
  const displayUrl = previewUrl ?? getAssetUrl(user?.logo_url)

  const handleFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      pushToast(t('settings.account.logo.invalidType'))
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      pushToast(t('settings.account.logo.tooLarge'))
      return
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }
    const blobUrl = URL.createObjectURL(file)
    objectUrlRef.current = blobUrl
    setPreviewUrl(blobUrl)

    uploadLogo.mutate(file, {
      onSettled: () => {
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current)
          objectUrlRef.current = null
        }
        setPreviewUrl(null)
      },
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const openFilePicker = () => fileInputRef.current?.click()

  const isBusy = isUploading || isRemoving
  const isDemo = user?.is_demo ?? false

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={handleInputChange}
        disabled={isDemo}
      />

      {!displayUrl ? (
        <div
          role="button"
          tabIndex={isDemo ? -1 : 0}
          onClick={isDemo ? undefined : openFilePicker}
          onKeyDown={(e) => !isDemo && e.key === 'Enter' && openFilePicker()}
          onDragOver={(e) => {
            if (!isDemo) {
              e.preventDefault()
              setDragActive(true)
            }
          }}
          onDragLeave={() => !isDemo && setDragActive(false)}
          onDrop={(e) => !isDemo && handleDrop(e)}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDemo
              ? 'cursor-not-allowed border-gray-300 bg-gray-100 dark:border-slate-700 dark:bg-slate-800 opacity-60'
              : dragActive
                ? 'cursor-pointer border-slate-400 bg-slate-100 dark:border-slate-500 dark:bg-slate-700'
                : 'cursor-pointer border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500 dark:hover:bg-slate-700'
          }`}
        >
          <UploadCloud className="text-slate-400 dark:text-slate-500" size={32} />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('settings.account.logo.dropzoneText')}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('settings.account.logo.formatHint')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex h-24 w-48 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
            <img
              src={displayUrl}
              alt={t('settings.account.logo.title')}
              className={`h-full w-full object-contain transition-opacity ${isBusy ? 'opacity-40' : 'opacity-100'}`}
            />
            {isBusy && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-500 dark:text-slate-400" size={20} />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={openFilePicker}
              disabled={isBusy || isDemo}
              title={isDemo ? t('demo.actionBlocked') : undefined}
              className="gap-2"
            >
              <RefreshCw size={16} />
              {t('settings.account.logo.changeButton')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => removeLogo.mutate()}
              disabled={isBusy || isDemo}
              title={isDemo ? t('demo.actionBlocked') : undefined}
              className="gap-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <Trash2 size={16} />
              {t('settings.account.logo.removeButton')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
