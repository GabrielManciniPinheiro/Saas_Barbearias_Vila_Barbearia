import { Card, CardContent } from "./ui/card"
import { format, format as formatDate } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Barbershop, BarbershopService } from "@prisma/client"

interface BookingSummaryProps {
  service: Pick<BarbershopService, "name" | "price">
  selectedDate: Date
  barbershop: Pick<Barbershop, "name">
}

const BookingSummary = ({
  service,
  barbershop,
  selectedDate,
}: BookingSummaryProps) => {
  return (
    <Card>
      <CardContent className="space-y-3 p-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{service.name}</h2>
          <p className="text-sm font-bold">
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Number(service.price))}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm text-gray-400">Data</h2>
          <p className="text-sm">
            {formatDate(selectedDate, "d 'de' MMMM", {
              locale: ptBR,
            })}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm text-gray-400">Horário</h2>
          <p className="text-sm">{format(selectedDate, "HH:mm")}</p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm text-gray-400">Barbeiro</h2>
          <p className="text-sm">{barbershop.name}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingSummary
