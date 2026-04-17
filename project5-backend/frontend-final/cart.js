const API_BASE = "http://project5-alb-1049667680.us-east-1.elb.amazonaws.com";

function loadCart() {
    fetch(`${API_BASE}/api/cart`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load cart. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(cart => {
            const container = document.getElementById("cart");
            const totalElement = document.getElementById("total");

            container.innerHTML = "";

            let total = 0;

            if (!cart || cart.length === 0) {
                container.innerHTML = "<p>Your cart is empty.</p>";
                totalElement.innerText = "Total: ₹0";
                return;
            }

            cart.forEach(item => {
                const subtotal = item.price * item.quantity;
                total += subtotal;

                const div = document.createElement("div");
                div.className = "card";
                div.innerHTML = `
                    <h3>${item.name}</h3>
                    <p>Price: ₹${item.price}</p>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Subtotal: ₹${subtotal}</p>
                    <button onclick="removeItem(${item.id})">Remove</button>
                `;
                container.appendChild(div);
            });

            totalElement.innerText = "Total: ₹" + total;
        })
        .catch(error => {
            console.error("Error loading cart:", error);
            alert("Unable to load cart");
        });
}

function removeItem(id) {
    fetch(`${API_BASE}/api/cart/${id}`, {
        method: "DELETE"
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to remove item. Status: ${response.status}`);
        }
        return response.json();
    })
    .then(() => {
        loadCart();
    })
    .catch(error => {
        console.error("Error removing item:", error);
        alert("Unable to remove item");
    });
}

function placeOrder() {
    fetch(`${API_BASE}/api/cart`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to read cart. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(cart => {
            if (!cart || cart.length === 0) {
                alert("Cart is empty!");
                return null;
            }

            const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return fetch(`${API_BASE}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: "user1",
                    items: cart,
                    total_amount: totalAmount,
                    status: "PLACED"
                })
            });
        })
        .then(response => {
            if (!response) return null;

            if (!response.ok) {
                throw new Error(`Failed to place order. Status: ${response.status}`);
            }

            return response.json();
        })
        .then(data => {
            if (!data) return null;

            localStorage.setItem("latestOrder", JSON.stringify(data.order));

            return fetch(`${API_BASE}/api/cart`, {
                method: "DELETE"
            });
        })
        .then(response => {
            if (!response) return;

            if (!response.ok) {
                throw new Error(`Failed to clear cart. Status: ${response.status}`);
            }

            window.location.href = "order.html";
        })
        .catch(error => {
            console.error("Error placing order:", error);
            alert("Unable to place order");
        });
}

window.onload = loadCart;