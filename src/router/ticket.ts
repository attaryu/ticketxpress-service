import { Router } from 'express';
import {
  createTicketHandler,
  deleteTicketHandler,
  getAllTicketsHandler,
} from '../controllers/ticket.controller';
import checkAdmin from '../middleware/checkAdmin';

const ticketRoutes = Router();

ticketRoutes.get('/admin/schedule/ticket', checkAdmin, getAllTicketsHandler);
ticketRoutes.post('/admin/schedule/:scheduleId/ticket', checkAdmin, createTicketHandler);
ticketRoutes.delete('/admin/schedule/:scheduleId/ticket/:ticketId', checkAdmin, deleteTicketHandler);

export default ticketRoutes;
