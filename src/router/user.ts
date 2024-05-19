import { Router } from 'express';

import {
  changeUserStatusHandler,
  deleteUserHandler,
  getAllUsersHandler,
  loginUserHandler,
  registrationUserHandler,
} from '../controllers/user.controller';

const userRoutes = Router();

userRoutes
  .get('/admin/user', getAllUsersHandler)
  .put('/admin/user/:userId/status', changeUserStatusHandler)
  .delete('/admin/user/:userId', deleteUserHandler);

userRoutes.post('/user/registration', registrationUserHandler);
userRoutes.post('/user/login', loginUserHandler);

export default userRoutes;
