//import element from HTML
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDom = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartContent = document.querySelector(".cart-content");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const productsDOM = document.querySelector(".products-center");
//Cart
let cart = []; // Avoid using global variables.

//when click outside of the catDom.it should be closed
window.onclick = function (event) {
  if (event.target == cartOverlay) {
    cartOverlay.classList.remove("transparentBcg");
    cartDom.classList.remove("showCart");
  }
};
//Prodcut class for importing products from API (works with JSON)
class Product {
  async getProduct() {
    try {
      const getData = await fetch("products.json")
        .then((res) => res.json());
      let products = getData.items.map((item) => {
        const id = item.sys.id;

        const { price, title } = item.fields;

        const img = item.fields.image.fields.file.url;
        return { id, price, title, img };
      });
      return products;
    } catch (err) {
      console.log(err);
      alert("Something went Wrong" + err);
    }
  }
}

//UI class for Importing functionality and product elements to DOM
class UI {
  showProducts(product) {
    let result = "";
    product.map((product) => {
      result += `
      <div class="product">
      <div class="img-container">
        <img src=${product.img} alt="product" class="product-img">
        <button class="bag-btn" data-id=${product.id}>
          <i class="fas fa-shopping-cart"></i>
          add to cart
        </button>
      </div>
      <h3>${product.title}</h3>
      <h4>
    $${product.price}
      </h4>
      
    </div>
      `;
    });

    productsDOM.innerHTML = result;
  }
  bindShowCartHandler() {
    cartBtn.addEventListener("click", () => {
      cartOverlay.classList.add("transparentBcg");
      cartDom.classList.add("showCart");
    });
  }
  bindCloseCartHandler() {
    closeCartBtn.addEventListener("click", () => {
      cartOverlay.classList.remove("transparentBcg");
      cartDom.classList.remove("showCart");
    });
  }
  setupApp() {
    this.bindShowCartHandler();
    this.bindCloseCartHandler();
    cart = Storage.getCart();
    this.setValues(cart);
    this.populateCart(cart);
  }
  populateCart() {
    cart.forEach(this.printCarts);
  }
  addToCart() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    let cartItem = {};

    buttons.forEach((btn) => {
      const id = btn.dataset.id;

      btn.addEventListener("click", () => {
        const inCart = cart.find((item) => item.id === id);

        if (inCart) {
          inCart.amount += 1;

          let showAmount = [...document.querySelectorAll(".item-amount")];
          showAmount.forEach((p) => {
            let pId = p.dataset.id;
            if (pId === id) {
              p.innerText = inCart.amount;
            }
          });
        } else {
          cartItem = { ...Storage.getProduct(id), amount: 1 };
          cart = [...cart, cartItem];
          this.printCarts(cartItem);
        }
        Storage.setCart(cart);

        //Set values
        this.setValues(cart);
      });
    });
  }
  setValues(cart) {
    let totalCost = 0;
    let totalValue = 0;
    cart.map((item) => {
      totalCost += item.price * item.amount;
      totalValue += item.amount;
    });
    cartTotal.innerText = parseInt(totalCost.toFixed(2));
    cartItems.innerText = totalValue;
  }
  printCarts(item) {
    let div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${item.img} alt="product" />
    <div>
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount " data-id=${item.id}  >${item.amount}</p>
      <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>
    `;
    cartContent.appendChild(div);
  }
  removeAll() {
    clearCartBtn.addEventListener("click", () => {
      let cartItem = cart.map((item) => item.id);
      cartItem.forEach((id) => this.removeItem(id));

      cartContent.innerHTML = "";
    });
  }
  cartlogic() {
    this.removeAll();
    cartContent.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-item")) {
        let id = e.target.dataset.id;

        this.removeItem(id);
        cartContent.removeChild(e.target.parentElement.parentElement);
      } else if (e.target.classList.contains("fa-chevron-up")) {
        let addAmount = e.target;
        let id = addAmount.dataset.id;
        let item = cart.find((item) => item.id === id);
        item.amount += 1;

        addAmount.nextElementSibling.textContent = item.amount;
        this.setValues(cart);
        Storage.setCart(cart);
      } else if (e.target.classList.contains("fa-chevron-down")) {
        let removeAmount = e.target;
        let id = removeAmount.dataset.id;
        let item = cart.find((item) => item.id === id);
        if (item.amount < 2) {
          this.removeItem(id);
          cartContent.removeChild(e.target.parentElement.parentElement);
        } else {
          item.amount -= 1;
          Storage.setCart(cart);
          this.setValues(cart);
          removeAmount.previousElementSibling.textContent = item.amount;
        }
      }
    });
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);

    console.log(cart);
    this.setValues(cart);
    Storage.setCart(cart);
  }
}

//STORAGE For dont repeat ourself after refress

class Storage {
  static setProduct(product) {
    localStorage.setItem("product", JSON.stringify(product));
  }
  static getProduct(id) {
    let product = JSON.parse(localStorage.getItem("product"));
    return product.find((item) => item.id === id);
  }
  static setCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

// cause we catch Product from API we need to add an event listener when DOMContent Loaded and call classes that we need
document.addEventListener("DOMContentLoaded", () => {
  const product = new Product();
  const ui = new UI();
  ui.setupApp();
  product
    .getProduct()
    .then((products) => {
      ui.showProducts(products);
      Storage.setProduct(products);
    })
    .then(() => {
      ui.addToCart();
      ui.cartlogic();
    });
});
