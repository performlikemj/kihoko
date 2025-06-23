function addToCart(merchId) {
    const csrfToken = getCookie('csrftoken');
    fetch("/add_to_cart/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ merch_id: merchId }),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.success) {
            updateCartDisplay(data.cart);
        } else {
            if (data.message === "Please verify your email address to shop.") {
                document.getElementById('email-verification-message').classList.remove('d-none');
            } else {
                console.error("Error adding item to cart.");
            }
        }
    })
    .catch((error) => {
        console.error("Error adding item to cart:", error);
    });
}


function updateCartDisplay(cart) {
    console.log('Updating cart display:', cart);  // Add this line
    const cartCounter = document.getElementById("cart-count");  // Changed from "#cart-counter" to "cart-count"

    if (cart && cart.total_items) {
        cartCounter.textContent = cart.total_items;
    } else {
        cartCounter.textContent = 0;
    }
}





function updateCartItem(merchId, quantity) {
    fetch("/update_cart_item/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ merch_id: merchId, quantity: quantity }),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.success) {
            updateCartDisplay(data.cart);
        } else {
            console.error("Error updating cart item.");
        }
    });
}

function removeCartItem(merchId) {
    fetch("/remove_cart_item/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ merch_id: merchId }),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.success) {
            updateCartDisplay(data.cart);
        } else {
            console.error("Error removing cart item.");
        }
    });
}


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrfToken = getCookie('csrftoken');


document.addEventListener("click", (event) => {
    if (event.target.classList.contains("update-cart-item")) {
        const merchId = event.target.dataset.merchId;
        const action = event.target.dataset.action;
        updateCartItem(merchId, action);
    } else if (event.target.classList.contains("remove-cart-item")) {
        const merchId = event.target.dataset.merchId;
        removeCartItem(merchId);
    }
});
