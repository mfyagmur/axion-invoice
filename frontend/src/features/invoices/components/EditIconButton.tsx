import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface EditIconButtonProps {
  onClick: () => void
}

export function EditIconButton({ onClick }: EditIconButtonProps) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t('common.edit')}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    >
      <Pencil size={14} />
    </button>
  )
}
