"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { set } from "date-fns"

interface CreateBookingParams {
  serviceId: string
  date: Date
}

export const createBooking = async ({
  serviceId,
  date,
}: CreateBookingParams) => {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("Usuário não autenticado")
  }

  // 1. Limpa a data (segundos/ms)
  const dateWithTime = set(date, {
    seconds: 0,
    milliseconds: 0,
  })

  // 2. Descobre quem é o barbeiro desse serviço
  const service = await db.barbershopService.findUnique({
    where: { id: serviceId },
  })

  if (!service) {
    throw new Error("Serviço não encontrado")
  }

  // 3. TRAVA GLOBAL DO BARBEIRO 🛡️
  // Verifica se esse BARBEIRO já tem agendamento neste horário (em qualquer serviço)
  const conflict = await db.booking.findFirst({
    where: {
      date: dateWithTime,
      barbershopService: {
        barbershopId: service.barbershopId, // Verifica a agenda do PROFISSIONAL
      },
    },
  })

  if (conflict) {
    throw new Error("Horário indisponível para este barbeiro.")
  }

  // 4. Salva
  await db.booking.create({
    data: {
      date: dateWithTime,
      barbershopServiceId: serviceId,
      userId: (session.user as any).id,
    },
  })

  revalidatePath("/bookings")
  revalidatePath("/")
}
