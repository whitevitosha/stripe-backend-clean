const userEmail = "mitko_506@abv.bg"; // или взет от потребителя

fetch(`https://stripe-backend-clean.onrender.com/check-subscription?email=${userEmail}`)
  .then(res => res.json())
  .then(data => {
    if (data.active) {
      // ✅ Покажи всички функции
      document.getElementById("main").innerText = "Достъпът е активен!";
    } else {
      // ❌ Покажи бутон за плащане
      const btn = document.createElement("button");
      btn.textContent = "Плати 4.00 лв.";
      btn.onclick = async () => {
        const res = await fetch("https://stripe-backend-clean.onrender.com/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail })
        });
        const data = await res.json();
        window.open(data.url, "_blank");
      };
      document.body.appendChild(btn);
    }
  });
