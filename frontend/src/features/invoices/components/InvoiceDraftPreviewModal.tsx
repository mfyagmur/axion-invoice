import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, X } from 'lucide-react'
import { ErrorState } from '@/components/ErrorState'
import { A4_WIDTH_MM, A4_HEIGHT_MM, PX_PER_MM } from '@/features/invoice-editor/canvasGeometry'

interface InvoiceDraftPreviewModalProps {
  html: string | undefined
  isOpen: boolean
  isLoading: boolean
  isError: boolean
  onClose: () => void
  onRetry: () => void
}

const PREVIEW_PADDING_PX = 48
const DEFAULT_PAGE_SIZE_PX = { width: A4_WIDTH_MM * PX_PER_MM, height: A4_HEIGHT_MM * PX_PER_MM }

export function InvoiceDraftPreviewModal({
  html,
  isOpen,
  isLoading,
  isError,
  onClose,
  onRetry,
}: InvoiceDraftPreviewModalProps) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [pageSizePx, setPageSizePx] = useState(DEFAULT_PAGE_SIZE_PX)
  const [scale, setScale] = useState(1)

  const fitToContainer = (width: number, height: number) => {
    const container = containerRef.current
    if (!container) return
    const availableWidth = container.clientWidth - PREVIEW_PADDING_PX * 2
    const availableHeight = container.clientHeight - PREVIEW_PADDING_PX * 2
    setScale(Math.min(availableWidth / width, availableHeight / height, 1))
  }

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const handleResize = () => fitToContainer(pageSizePx.width, pageSizePx.height)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen, pageSizePx.width, pageSizePx.height])

  const handleIframeLoad = () => {
    const pageEl = iframeRef.current?.contentDocument?.querySelector<HTMLElement>('.page')
    const rect = pageEl?.getBoundingClientRect()
    const width = rect?.width || DEFAULT_PAGE_SIZE_PX.width
    const height = rect?.height || DEFAULT_PAGE_SIZE_PX.height
    setPageSizePx({ width, height })
    fitToContainer(width, height)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80">
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-6 py-4">
        <h2 className="text-base font-semibold text-white">
          {t('invoices.form.preview')}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          aria-label={t('invoices.detail.hidePreview')}
        >
          <X size={20} />
        </button>
      </div>

      <div ref={containerRef} className="flex flex-1 items-center justify-center overflow-auto p-6">
        {isLoading && <Loader2 className="animate-spin text-white" size={32} />}

        {isError && !isLoading && (
          <div className="rounded-md bg-white p-4">
            <ErrorState onRetry={onRetry} />
          </div>
        )}

        {!isLoading && !isError && html && (
          <div style={{ width: pageSizePx.width * scale, height: pageSizePx.height * scale }}>
            <iframe
              ref={iframeRef}
              title={t('invoices.form.preview')}
              srcDoc={html}
              onLoad={handleIframeLoad}
              sandbox="allow-same-origin"
              className="origin-top-left bg-white shadow-2xl"
              style={{
                width: pageSizePx.width,
                height: pageSizePx.height,
                transform: `scale(${scale})`,
                border: 'none',
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
