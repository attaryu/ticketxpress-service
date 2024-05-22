import { Router } from 'express';

import {
  changeUserStatusHandler,
  deleteUserHandler,
  getAllUsersHandler,
  loginUserHandler,
  registrationUserHandler,
} from '../controllers/user.controller';
import checkAdmin from '../middleware/checkAdmin';

const userRoutes = Router();

userRoutes
  .get('/admin/user', checkAdmin, getAllUsersHandler)
  .put('/admin/user/:userId/status', checkAdmin, changeUserStatusHandler)
  .delete('/admin/user/:userId', checkAdmin, deleteUserHandler);

userRoutes.post('/user/registration', registrationUserHandler);
userRoutes.post('/user/login', loginUserHandler);

export default userRoutes;
