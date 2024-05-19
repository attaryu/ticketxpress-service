import type { Request, Response } from 'express';

import { createTicket, deleteTicket, getAllTickets } from '../services/ticket.service';
import { serverError } from '../utils/response';

export async function getAllTicketsHandler(_req: Request, res: Response) {
  try {
    const ticket = await getAllTickets();

    return res.status(ticket.code).send(ticket);
  } catch (error) {
    console.error(error);

    return res.status(serverError.code).send(serverError);
  }
}

export async function createTicketHandler(req: Request, res: Response) {
  try {
    const ticket = await createTicket({ ...req.body, id_jadwal: req.params.scheduleId });

    return res.status(ticket.code).send(ticket);
  } catch (error) {
    console.error(error);

    return res.status(serverError.code).send(serverError);
  }
}

export async function deleteTicketHandler(req: Request, res: Response) {
  try {
    const ticket = await deleteTicket({ id_jadwal: req.params.scheduleId, id_tiket: req.params.ticketId });

    return res.status(ticket.code).send(ticket);
  } catch (error) {
    console.error(error);

    return res.status(serverError.code).send(serverError);
  }
}
