import { Router } from 'express';

import {
  changeUserStatusHandler,
  deleteUserHandler,
  getAllUsersHandler,
  getLoggedUserHandler,
  loginUserHandler,
  logoutUserHandler,
  registrationUserHandler,
} from '../controllers/user.controller';
import checkAdmin from '../middleware/checkAdmin';
import checkToken from '../middleware/checkToken';

const userRoutes = Router();

userRoutes
  .get('/admin/user', checkAdmin, getAllUsersHandler)
  .put('/admin/user/:userId/status', checkAdmin, changeUserStatusHandler)
  .delete('/admin/user/:userId', checkAdmin, deleteUserHandler);

userRoutes.get('/user', checkToken, getLoggedUserHandler);
userRoutes.post('/user/registration', registrationUserHandler);
userRoutes.post('/user/login', loginUserHandler);
userRoutes.delete('/user/logout', logoutUserHandler);

export default userRoutes;
