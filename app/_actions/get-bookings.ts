"use server"

import { db } from "@/app/_lib/prisma"
import { endOfDay, startOfDay } from "date-fns"

interface GetBookingsProps {
  serviceId?: string // Opcional agora
  barbershopId: string // OBRIGATÓRIO: Vamos buscar pelo dono da agenda
  date: Date
}

export const getBookings = async ({ date, barbershopId }: GetBookingsProps) => {
  return await db.booking.findMany({
    where: {
      date: {
        lte: endOfDay(date),
        gte: startOfDay(date),
      },
      // CORREÇÃO CRÍTICA:
      // Não filtramos mais pelo ID do serviço específico.
      // Filtramos por QUALQUER serviço que pertença a este BARBEIRO.
      barbershopService: {
        barbershopId: barbershopId,
      },
    },
  })
}
