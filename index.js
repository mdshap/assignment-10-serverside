const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('User Server Is Available')
})



app.listen(port, ()=>{
    console.log('User server is started on port:', port);
    
})