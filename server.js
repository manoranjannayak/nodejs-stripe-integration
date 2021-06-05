/* eslint-disable camelcase */
const express = require('express')
const bodyparser = require('body-parser')
const path = require('path')
const app = express()
const Publishable_Key = process.env.PUBLISHABLEKEY
const Secret_Key = process.env.SECRETKEY
const stripe = require('stripe')(Secret_Key)

const stdRes = require('./utils/standard-response')

const port = process.env.PORT || 3000

app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())

app.use(express.static('public'))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', function (_req, res) {
  res.render('payment', {
    key: Publishable_Key
  })
})

// validator.fieldValidation,

// payment
app.post('/payment', async function (req, res) {
  try {
    console.log('req.body---', req.body)
    // Creating customer
    const customer = await stripe.customers.create({
      description: 'My First Test Customer (created for API docs)',
      address: {
        city: req.body.city,
        country: req.body.country,
        postal_code: req.body.postal_code,
        state: req.body.state
      },
      email: req.body.email,
      name: req.body.name,
      phone: req.body.phone
    })

    console.log('customer', customer)

    // Creating payment method
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: req.body.number,
        exp_month: req.body.exp_month,
        exp_year: req.body.exp_year,
        cvc: req.body.cvc
      },
      billing_details: {
        address: customer.address,
        email: customer.email,
        name: customer.name,
        phone: customer.phone
      }
    })

    console.log('paymentMethod', paymentMethod)

    // Attaching payment method to customer
    const attachPaymentToCustomer = await stripe.paymentMethods.attach(
      paymentMethod.id,
      { customer: customer.id }
    )

    console.log('attachPaymentToCustomer', attachPaymentToCustomer)

    // creating charges
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000, // $20
      currency: 'usd',
      customer: customer.id
    })

    console.log('paymentIntent ', paymentIntent)

    // charges confirmation
    const paymentIntentConfirmation = await stripe.paymentIntents.confirm(
      paymentIntent.id,
      { payment_method: paymentMethod.id }
    )

    console.log('paymentIntentConfirmation', paymentIntentConfirmation)
    // return
    res.json(paymentIntentConfirmation)
  } catch (error) {
    console.log('error', error)
    stdRes._500(res, error.message)
  }
})

app.listen(port, function (_error) {
  console.log('Server created Successfully')
})
