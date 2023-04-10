const express = require('express');
const connectDB = require('./utils/db');
const cors = require('cors');
const app = express();

///connect DataBase

connectDB();

//use cors middleware :cross-origin requests from any domain. You can configure it to allow requests only from specific domains if needed
app.use(cors());
// // //init middleware

app.use(express.json({ extended: true }));
app.get('/', (req, res) => res.send('API runing'));

// // //Define Route

app.use('/api/user', require('./routes/api/users'));
app.use('/api/support/admin', require('./routes/api/admin'));
app.use('/api/support/agent', require('./routes/api/agent'));
app.use('/api/support/superadmin', require('./routes/api/superAdmin'));
app.use('/api/support/tickets', require('./routes/api/ticket'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`connected to port ${PORT}`));
