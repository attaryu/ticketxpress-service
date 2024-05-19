import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';

import checkToken from './middleware/checkToken';
import router from './router';
import path from 'path';
import checkAdminRoute from './middleware/checkAdmin';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/asset', express.static(path.join(__dirname, '..', 'public')));

app.use(checkToken);
app.use(checkAdminRoute);
app.use(router);

export default app;
