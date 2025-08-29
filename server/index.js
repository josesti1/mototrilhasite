import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(bodyParser.json())

let registrations = []
let price = 250001

app.get('/api/price', (req,res)=>{
  res.json({ current_price: price })
})

app.post('/api/register', (req,res)=>{
  const { documento } = req.body
  if(registrations.find(r=> r.documento===documento)){
    return res.status(409).json({error:'Já inscrito'})
  }
  const reg = {...req.body, id: registrations.length+1, preco: price++, criado_em: new Date(), pago:false}
  registrations.push(reg)
  res.json(reg)
})

app.get('/api/registration', (req,res)=>{
  const { documento, id } = req.query
  let r
  if(documento) r = registrations.find(x=> x.documento===documento)
  if(id) r = registrations.find(x=> String(x.id)===String(id))
  if(!r) return res.status(404).end()
  res.json(r)
})

app.get('/api/registrations', (req,res)=>{
  res.json(registrations)
})

app.listen(3001, ()=> console.log("API running on http://localhost:3001"))
