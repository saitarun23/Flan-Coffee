// Checkout button logic
async function checkout() {
	const uid = localStorage.getItem('uid');
	const payment_method = document.getElementById('payment-method').value;

	const res = await fetch('/orders/checkout', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ uid, payment_method })
	});

	const data = await res.json();
	alert(data.message);
	if (data.orderId) window.location.href = "thankyou.html";
}
