'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'

interface Invoice {
  id: string
  periodStart: string
  periodEnd: string
  amountTotal: number
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  paid: boolean
  paidAt?: string
  invoicePdfUrl?: string
}

interface InvoicesListProps {
  invoices: Invoice[]
}

const STATUS_LABELS: Record<Invoice['status'], { label: string; color: string }> = {
  draft: { label: '下書き', color: 'bg-gray-100 text-gray-800' },
  open: { label: '未払い', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: '支払済み', color: 'bg-green-100 text-green-800' },
  void: { label: '無効', color: 'bg-gray-100 text-gray-800' },
  uncollectible: { label: '回収不能', color: 'bg-red-100 text-red-800' },
}

export function InvoicesList({ invoices }: InvoicesListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  const handleDownload = async (invoicePdfUrl: string) => {
    window.open(invoicePdfUrl, '_blank')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>請求履歴</CardTitle>
        <CardDescription>過去の請求書とお支払い履歴</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            請求履歴がありません
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>請求期間</TableHead>
                  <TableHead>金額</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>支払日</TableHead>
                  <TableHead className="text-right">アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const statusLabel = STATUS_LABELS[invoice.status]

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        {formatDate(invoice.periodStart)} -{' '}
                        {formatDate(invoice.periodEnd)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(invoice.amountTotal)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusLabel.color}>
                          {statusLabel.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.paidAt ? formatDate(invoice.paidAt) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {invoice.invoicePdfUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(invoice.invoicePdfUrl!)}
                          >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
