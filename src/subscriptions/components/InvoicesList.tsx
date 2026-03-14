import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/src/shared/utils/formatCurrency"
import { Download } from "lucide-react"
import moment from "moment-timezone"
import { getTranslations } from "next-intl/server"

interface Invoice {
  id: string
  date: string | null
  amount: number
  currency: string
  status: string | null
  pdfUrl: string | null
}

interface InvoicesListProps {
  invoices: Invoice[]
}

export const InvoicesList = async ({ invoices }: InvoicesListProps) => {
  const t = await getTranslations("Subscriptions.invoices")

  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("noInvoices")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("date")}</TableHead>
              <TableHead>{t("amount")}</TableHead>
              <TableHead>{t("statusLabel")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  {moment(invoice.date).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell>
                  {formatCurrency(invoice.amount, invoice.currency)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      invoice.status === "paid"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }
                  >
                    {invoice.status === "paid" ? t("paid") : invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {invoice.pdfUrl && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="size-4" />
                      </a>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
