import { Router } from 'express';
import {
  createTicketHandler,
  deleteTicketHandler,
  getAllTicketsHandler,
} from '../controllers/ticket.controller';

const ticketRoutes = Router();

ticketRoutes.get('/admin/schedule/ticket', getAllTicketsHandler);
ticketRoutes.post('/admin/schedule/:scheduleId/ticket', createTicketHandler);
ticketRoutes.delete('/admin/schedule/:scheduleId/ticket/:ticketId', deleteTicketHandler);

export default ticketRoutes;
