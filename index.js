const express = require('express')
const app = express()

// static file serve
// not found in static files, so default to index.html
app.use(express.static(__dirname))
app.use((req, res) => res.sendFile(`${__dirname}/index.html`))

app.listen(3000, () => console.log('State of veganism is running on port 3000'))
