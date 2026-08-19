import { apiClient } from '@/lib/apiClient'
import type { DefinitionUnit, UnitPayload, DefinitionTaxRate, TaxRatePayload, DefinitionPaymentTerm, PaymentTermPayload, DefinitionCategory, CategoryPayload, DefinitionBankAccount, BankAccountPayload, DefinitionNote, NotePayload } from '@/types/definitions'

export const definitionsApi = {
  units: {
    list: async (): Promise<DefinitionUnit[]> => {
      const { data } = await apiClient.get('/definitions/units')
      return data
    },
    create: async (payload: UnitPayload): Promise<DefinitionUnit> => {
      const { data } = await apiClient.post('/definitions/units', payload)
      return data
    },
    update: async (id: string, payload: UnitPayload): Promise<DefinitionUnit> => {
      const { data } = await apiClient.put(`/definitions/units/${id}`, payload)
      return data
    },
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/definitions/units/${id}`)
    },
    toggleStatus: async (id: string): Promise<DefinitionUnit> => {
      const { data } = await apiClient.patch(`/definitions/units/${id}/status`)
      return data
    },
    setDefault: async (id: string): Promise<DefinitionUnit> => {
      const { data } = await apiClient.patch(`/definitions/units/${id}/default`)
      return data
    },
  },

  taxRates: {
    list: async (): Promise<DefinitionTaxRate[]> => {
      const { data } = await apiClient.get('/definitions/tax-rates')
      return data
    },
    create: async (payload: TaxRatePayload): Promise<DefinitionTaxRate> => {
      const { data } = await apiClient.post('/definitions/tax-rates', payload)
      return data
    },
    update: async (id: string, payload: TaxRatePayload): Promise<DefinitionTaxRate> => {
      const { data } = await apiClient.put(`/definitions/tax-rates/${id}`, payload)
      return data
    },
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/definitions/tax-rates/${id}`)
    },
    toggleStatus: async (id: string): Promise<DefinitionTaxRate> => {
      const { data } = await apiClient.patch(`/definitions/tax-rates/${id}/status`)
      return data
    },
    setDefault: async (id: string): Promise<DefinitionTaxRate> => {
      const { data } = await apiClient.patch(`/definitions/tax-rates/${id}/default`)
      return data
    },
  },

  paymentTerms: {
    list: async (): Promise<DefinitionPaymentTerm[]> => {
      const { data } = await apiClient.get('/definitions/payment-terms')
      return data
    },
    create: async (payload: PaymentTermPayload): Promise<DefinitionPaymentTerm> => {
      const { data } = await apiClient.post('/definitions/payment-terms', payload)
      return data
    },
    update: async (id: string, payload: PaymentTermPayload): Promise<DefinitionPaymentTerm> => {
      const { data } = await apiClient.put(`/definitions/payment-terms/${id}`, payload)
      return data
    },
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/definitions/payment-terms/${id}`)
    },
    toggleStatus: async (id: string): Promise<DefinitionPaymentTerm> => {
      const { data } = await apiClient.patch(`/definitions/payment-terms/${id}/status`)
      return data
    },
  },

  categories: {
    list: async (): Promise<DefinitionCategory[]> => {
      const { data } = await apiClient.get('/definitions/categories')
      return data
    },
    create: async (payload: CategoryPayload): Promise<DefinitionCategory> => {
      const { data } = await apiClient.post('/definitions/categories', payload)
      return data
    },
    update: async (id: string, payload: CategoryPayload): Promise<DefinitionCategory> => {
      const { data } = await apiClient.put(`/definitions/categories/${id}`, payload)
      return data
    },
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/definitions/categories/${id}`)
    },
    toggleStatus: async (id: string): Promise<DefinitionCategory> => {
      const { data } = await apiClient.patch(`/definitions/categories/${id}/status`)
      return data
    },
  },

  bankAccounts: {
    list: async (): Promise<DefinitionBankAccount[]> => {
      const { data } = await apiClient.get('/definitions/bank-accounts')
      return data
    },
    create: async (payload: BankAccountPayload): Promise<DefinitionBankAccount> => {
      const { data } = await apiClient.post('/definitions/bank-accounts', payload)
      return data
    },
    update: async (id: string, payload: BankAccountPayload): Promise<DefinitionBankAccount> => {
      const { data } = await apiClient.put(`/definitions/bank-accounts/${id}`, payload)
      return data
    },
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/definitions/bank-accounts/${id}`)
    },
    toggleStatus: async (id: string): Promise<DefinitionBankAccount> => {
      const { data } = await apiClient.patch(`/definitions/bank-accounts/${id}/status`)
      return data
    },
  },

  notes: {
    list: async (): Promise<DefinitionNote[]> => {
      const { data } = await apiClient.get('/definitions/notes')
      return data
    },
    create: async (payload: NotePayload): Promise<DefinitionNote> => {
      const { data } = await apiClient.post('/definitions/notes', payload)
      return data
    },
    update: async (id: string, payload: NotePayload): Promise<DefinitionNote> => {
      const { data } = await apiClient.put(`/definitions/notes/${id}`, payload)
      return data
    },
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/definitions/notes/${id}`)
    },
    toggleStatus: async (id: string): Promise<DefinitionNote> => {
      const { data } = await apiClient.patch(`/definitions/notes/${id}/status`)
      return data
    },
    setDefault: async (id: string): Promise<DefinitionNote> => {
      const { data } = await apiClient.patch(`/definitions/notes/${id}/default`)
      return data
    },
  },
}
