const API_BASE = "http://project5-alb-1049667680.us-east-1.elb.amazonaws.com";

const catalog = {
    laptops: [
        {
            id: 1,
            name: "MacBook Air",
            price: 90000,
            image: "./MacBook-Air.jpg",
            description: "Lightweight Apple laptop"
        },
        {
            id: 2,
            name: "HP Pavilion",
            price: 60000,
            image: "./HP-Pavilion.jpg",
            description: "HP performance laptop"
        },
        {
            id: 3,
            name: "Acer Aspire",
            price: 50000,
            image: "./Acer-Aspire.jpg",
            description: "Acer everyday laptop"
        },
        {
            id: 4,
            name: "Dell Inspiron",
            price: 65000,
            image: "./Dell-Inspiron.jpg",
            description: "Dell reliable laptop"
        },
        {
            id: 5,
            name: "Lenovo ThinkPad",
            price: 70000,
            image: "./Lenovo-ThinkPad.jpg",
            description: "Lenovo business laptop"
        }
    ],
    phones: [
        {
            id: 6,
            name: "iPhone",
            price: 80000,
            image: "./iphone-16-pro.jpeg",
            description: "Apple smartphone"
        },
        {
            id: 7,
            name: "MI",
            price: 25000,
            image: "./MI-8.jpeg",
            description: "Xiaomi smartphone"
        },
        {
            id: 8,
            name: "Samsung",
            price: 30000,
            image: "./Samsung-galaxy-A35.jpg",
            description: "Samsung Galaxy phone"
        },
        {
            id: 9,
            name: "Vivo",
            price: 28000,
            image: "./Vivo-X300-Pro.jpg",
            description: "Vivo smartphone"
        },
        {
            id: 10,
            name: "Oppo",
            price: 27000,
            image: "./Oppo-Reno15.jpg",
            description: "Oppo smartphone"
        }
    ]
};

function showCategory(category) {
    const categoriesDiv = document.getElementById("categories");
    const productsDiv = document.getElementById("products");

    categoriesDiv.style.display = "none";
    productsDiv.innerHTML = "";

    const items = catalog[category] || [];

    const heading = document.createElement("h2");
    heading.textContent = category === "laptops" ? "Laptops" : "Phones";
    productsDiv.appendChild(heading);

    const backButton = document.createElement("button");
    backButton.textContent = "Back";
    backButton.onclick = goBack;
    backButton.style.marginBottom = "20px";
    productsDiv.appendChild(backButton);

    const grid = document.createElement("div");
    grid.className = "grid";

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>₹${item.price}</p>
            <p>${item.description}</p>

            <div style="margin: 10px 0;">
                <button onclick="decreaseQuantity(${item.id})">-</button>
                <span id="qty-${item.id}" style="margin: 0 12px;">1</span>
                <button onclick="increaseQuantity(${item.id})">+</button>
            </div>

            <button onclick="addToCart(${item.id})">Add to Cart</button>
        `;

        grid.appendChild(card);
    });

    productsDiv.appendChild(grid);
}

function increaseQuantity(id) {
    const qtyElement = document.getElementById(`qty-${id}`);
    let currentQty = parseInt(qtyElement.textContent);
    qtyElement.textContent = currentQty + 1;
}

function decreaseQuantity(id) {
    const qtyElement = document.getElementById(`qty-${id}`);
    let currentQty = parseInt(qtyElement.textContent);

    if (currentQty > 1) {
        qtyElement.textContent = currentQty - 1;
    }
}

function addToCart(id) {
    let selectedItem = null;

    for (const category in catalog) {
        const found = catalog[category].find(item => item.id === id);
        if (found) {
            selectedItem = found;
            break;
        }
    }

    if (!selectedItem) {
        alert("Item not found");
        return;
    }

    const quantity = parseInt(document.getElementById(`qty-${id}`).textContent);

    fetch(`${API_BASE}/api/cart`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: selectedItem.id,
            name: selectedItem.name,
            price: selectedItem.price,
            quantity: quantity
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to add to cart. Status: ${response.status}`);
        }
        return response.json();
    })
    .then(() => {
        alert(`${selectedItem.name} added to cart`);
        document.getElementById(`qty-${id}`).textContent = "1";
    })
    .catch(error => {
        console.error("Error adding to cart:", error);
        alert("Unable to add to cart");
    });
}

function goBack() {
    document.getElementById("products").innerHTML = "";
    document.getElementById("categories").style.display = "flex";
}