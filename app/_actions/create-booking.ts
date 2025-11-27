"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"

interface CreateBookingParams {
  userId: string
  serviceId: string
  date: Date
}

export const createBooking = async (params: CreateBookingParams) => {
  await db.booking.create({
    data: {
      userId: params.userId,
      barbershopServiceId: params.serviceId,
      date: params.date,
    },
  })
  revalidatePath("/barbershops/[id]")
}
