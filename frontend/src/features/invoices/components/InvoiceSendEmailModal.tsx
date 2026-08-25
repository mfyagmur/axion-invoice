import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { Select } from '@/components/Select'
import { useSendInvoiceEmail } from '@/features/invoices/hooks/useSendInvoiceEmail'
import { useUpdateInvoice } from '@/features/invoices/hooks/useUpdateInvoice'
import { useToastStore } from '@/store/toastStore'
import type { InvoiceDetail } from '@/types/invoice'

interface InvoiceSendEmailModalProps {
  invoice: InvoiceDetail
  isOpen: boolean
  onClose: () => void
}

interface FormValues {
  recipient_contact_ids: [string, string, string]
}

function contactOptions(invoice: InvoiceDetail) {
  return (invoice.customer.contacts ?? []).map((contact) => ({
    value: contact.id,
    label: contact.email
      ? `${contact.first_name} ${contact.last_name} — ${contact.email}`
      : `${contact.first_name} ${contact.last_name}`,
  }))
}

export function InvoiceSendEmailModal({ invoice, isOpen, onClose }: InvoiceSendEmailModalProps) {
  const { t } = useTranslation()
  const updateInvoice = useUpdateInvoice()
  const sendEmail = useSendInvoiceEmail()
  const pushToast = useToastStore((state) => state.push)

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      recipient_contact_ids: [
        invoice.recipient_contact_ids[0] ?? '',
        invoice.recipient_contact_ids[1] ?? '',
        invoice.recipient_contact_ids[2] ?? '',
      ],
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        recipient_contact_ids: [
          invoice.recipient_contact_ids[0] ?? '',
          invoice.recipient_contact_ids[1] ?? '',
          invoice.recipient_contact_ids[2] ?? '',
        ],
      })
    }
  }, [isOpen, invoice, reset])

  const options = contactOptions(invoice)
  const isSending = updateInvoice.isPending || sendEmail.isPending

  const onSubmit = handleSubmit((values) => {
    const nextRecipientIds = values.recipient_contact_ids.filter((id) => !!id)
    const hasChanged =
      nextRecipientIds.length !== invoice.recipient_contact_ids.length ||
      nextRecipientIds.some((id, index) => id !== invoice.recipient_contact_ids[index])

    const dispatchSend = () => {
      sendEmail.mutate(invoice.id, {
        onSuccess: () => {
          pushToast(t('invoices.detail.emailSent'), 'success')
          onClose()
        },
        onError: () => pushToast(t('invoices.detail.emailSendError')),
      })
    }

    if (hasChanged) {
      updateInvoice.mutate(
        { id: invoice.id, payload: { recipient_contact_ids: nextRecipientIds } },
        { onSuccess: dispatchSend },
      )
    } else {
      dispatchSend()
    }
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('invoices.detail.sendEmailModalTitle')}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Controller
          name="recipient_contact_ids.0"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              label={t('invoices.form.recipientContact')}
              value={field.value}
              onChange={field.onChange}
              options={options}
              placeholder={t('invoices.form.customerInfoOption')}
              error={errors.recipient_contact_ids?.[0] ? t('invoices.form.errors.recipientRequired') : undefined}
            />
          )}
        />
        <Controller
          name="recipient_contact_ids.1"
          control={control}
          render={({ field }) => (
            <Select
              label={t('invoices.form.additionalContact1')}
              value={field.value}
              onChange={field.onChange}
              options={options}
              placeholder={t('invoices.form.customerInfoOption')}
            />
          )}
        />
        <Controller
          name="recipient_contact_ids.2"
          control={control}
          render={({ field }) => (
            <Select
              label={t('invoices.form.additionalContact2')}
              value={field.value}
              onChange={field.onChange}
              options={options}
              placeholder={t('invoices.form.customerInfoOption')}
            />
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isSending}>
            {t('invoices.detail.sendEmail')}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSending}>
            {t('customers.form.cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
