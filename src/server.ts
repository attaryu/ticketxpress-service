import dotenv from 'dotenv';

import app from './main';

dotenv.config();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server already running at: http://localhost:${PORT}`);
});