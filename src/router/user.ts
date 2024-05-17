import { Router } from 'express';

import {
  changeUserStatusHandler,
  deleteUserHandler,
  getAllUsersHandler,
} from '../controllers/user.controller';

const userRoutes = Router();

userRoutes
  .get('/admin/user', getAllUsersHandler)
  .put('/admin/user/:userId/status', changeUserStatusHandler)
  .delete('/admin/user/:userId', deleteUserHandler);

export default userRoutes;
