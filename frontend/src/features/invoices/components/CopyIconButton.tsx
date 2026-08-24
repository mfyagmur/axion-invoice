import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useToastStore } from '@/store/toastStore'

interface CopyIconButtonProps {
  value: string
  label?: string
}

export function CopyIconButton({ value, label = 'Copy' }: CopyIconButtonProps) {
  const { t } = useTranslation()
  const addToast = useToastStore((state) => state.push)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      addToast(t('common.copied'), 'success')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      addToast(t('common.genericError'), 'error')
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-500 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
    >
      {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
    </button>
  )
}
