import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import router from './router';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(router);

export default app;
