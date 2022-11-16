require('dotenv').config()

const app = require('./routing.js');

const PORT = 9090;
app.listen(PORT, () => console.log(`Realiser up locally on http://localhost:${PORT}`))