import * as XLSX from 'xlsx'
import type { Customer } from '@/types/customer'

export function exportCustomersToExcel(customers: Customer[]) {
  const data = customers.map((customer) => ({
    'Ad Soyad / Şirket': customer.name,
    'E-posta': customer.email || '',
    'Telefon': customer.phone || '',
    'Adres': customer.address || '',
    'Vergi Dairesi': customer.tax_office || '',
    'Vergi No': customer.tax_number || '',
    'Faks': customer.fax || '',
    'MERSİS No': customer.mersis_no || '',
    'Durum': customer.is_active ? 'Aktif' : 'Pasif',
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Müşteriler')

  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 10 },
  ]

  XLSX.writeFile(workbook, 'musteriler.xlsx')
}
