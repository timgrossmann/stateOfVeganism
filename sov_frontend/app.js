const PORT = process.env.PORT || 3000

const path = require('path')
const express = require('express')
const app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.listen(PORT, () => console.log('App successfully started'))
