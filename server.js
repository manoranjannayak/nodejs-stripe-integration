const express = require('express') 
const bodyparser = require('body-parser') 
const path = require('path') 
const app = express() 
  
var Publishable_Key = 'pk_test_51Hsv6KLzpNoJw5cRqsZQiQh1hqWafCluHiYVFIt68Y4RjWYsEFX4HGPaquJ3lcxNjOh393Ms39m0V4akBZ46727J00EzprcXql'
var Secret_Key = 'sk_test_51Hsv6KLzpNoJw5cRhFtvtSixJDOpLwLY0ZzDR6dM0nYcJUv4XV8zV4HUCpRVw0j0vjrhwotun4vAvmrESk4Chgzg00QakDHuoW'
  
const stripe = require('stripe')(Secret_Key) 
  
const port = process.env.PORT || 3000 
  
app.use(bodyparser.urlencoded({extended:false})) 
app.use(bodyparser.json()) 

app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views')) 
app.set('view engine', 'ejs') 
  
app.get('/', function(req, res){ 
    res.render('payment', { 
       key: Publishable_Key 
    }) 
}) 
  
  
// payment method
app.post('/paymentMethod', async function(req, res){ 
  console.log("req.body---",req.body);

  const number = req.body.number
  const exp_month = req.body.exp_month
  const exp_year = req.body.exp_year
  const cvc = req.body.cvc

  const email = req.body.email
  const name = req.body.name
  const phone = req.body.phone

  const city = req.body.city
  const state = req.body.state
  const country = req.body.country
  const postal_code = req.body.postal_code
  
    const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
            number,
            exp_month,
            exp_year,
            cvc,
        },
        billing_details: {
            address: {
              city,
              country,
              postal_code,
              state
            },
            email,
            name,
            phone
          }
    });

    console.log("paymentMethod",paymentMethod)
    res.json(paymentMethod)
    
})

// checkout
app.post('/checkout', async function(req, res){ 
    const session = await stripe.checkout.sessions.create({
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
        payment_method_types: ['card'],
        line_items: [
          {price: 'price_H5ggYwtDq4fbrJ', quantity: 2},
        ],
        mode: 'payment',
    })
    res.json(session)
      
})

app.listen(port, function(error){ 
    console.log("Server created Successfully") 
}) 