const express = require("express");
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Stripe backend ready!");
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { email } = req.body;

    const customer = await stripe.customers.create({ email });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customer.id,
      line_items: [
        {
          price: process.env.PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error("Checkout error", e);
    res.status(500).json({ error: e.message });
  }
});

// 👇 Проверка за активен абонамент
app.get("/check-subscription", async (req, res) => {
  const { email } = req.query;

  try {
    const customers = await stripe.customers.list({ email });
    if (customers.data.length === 0) return res.json({ active: false });

    const customerId = customers.data[0].id;

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
    });

    res.json({ active: subscriptions.data.length > 0 });
  } catch (err) {
    console.error("Subscription check error", err.message);
    res.status(500).json({ active: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
