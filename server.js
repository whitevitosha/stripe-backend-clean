require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.use(cors({
  origin: 'https://6856eb9bf4c1104610f91785--darling-dango-869a11.netlify.app',
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Stripe backend ready!');
});

// ТОВА Е ВАЖНОТО - добави този маршрут!
app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.PRICE_ID, // добави го в .env
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
