const  cartBtn = document.querySelector(".cart-btn");
const CloseCartBtn = document.querySelector(".close-cart");  
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const  cartOverlay = document.querySelector(".cart-overly");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productDOM = document.querySelector(".product-center");




        // cart
let cart  = [];


// buttons

let buttonsDOM = [];
// gettting the products

class Products{

    async getProducts(){
        try{
            let result = await fetch('products.json');
            let data =  await result.json();

            let products = data.items;
            products = products.map(item =>{
                const {title,price} = item.fields;
                const {id} = item.sys
                const image = item.fields.image.fields.file.url;
                return {title,price,id,image}
            })
            return products
           
        }catch (error){
            console.log(error)

        }
    
     
}
}

// display products

class UI{

    displayProducts(products){
       let result = ``;
       products.forEach(product => {
           result += ` <!-- sigle production -->
           <article class="product">
            <div class="img-container">
                <img src=${product.image}
                 alt="product"
                 class="product-img">
                <button class="bag-btn" data-id=${product.id}>
                    <i class="fa fa-shopping-cart"></i>
                    add to cart
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>${product.price}</h4>
        </article>`;
       });
       productDOM.innerHTML = result;

    }
     getBagButtons(){
       const  buttons= [...document.querySelectorAll(".bag-btn")] ;
       buttonsDOM = buttons;
      buttons.forEach(button =>{
          let id = button.dataset.id;
         let inCart = cart.find(item => item.id === id);
         if(inCart){
             button.innerText = "In Cart";
             button.disabled = true;
         }
    
             button.addEventListener('click', (event)=>{
                 event.target.innerText = " In Cart";
                 event.target.disabled =  true;
                //  get product from products

                let cartItem = {...Storage.getProducts(id), amount:1};
                // add product to the cart

                cart = [...cart,cartItem];
                // save cart in lucal storage
                Storage.saveCart(cart);
                // stat cart values 
                this.setCartValues(cart);
                // display cart item
                this.addCartItem(cartItem);
                // show the cart 
                this.showCart();
             });
      });

     }
     setCartValues(cart){
         let tempTotal = 0;
         let itemsTotal = 0;
         cart.map(item => {
             tempTotal += item.price * item.amount;
             itemsTotal += item.amount;
         });
         cartTotal.innerText = parseFloat(tempTotal.toFixed(2));

         cartItems.innerText= itemsTotal;
        
     }
     addCartItem(item){
         const divEl = document.createElement('div');
          divEl.classList.add('.cart-item');
         
          divEl.innerHTML =`  <div class="cart-item"><img src=${item.image} class="img" alt="production">
                
         <div >
             <h4>${item.title}</h4>
             <h5>${item.price}</h5>
             <span class="remove-item" data-id=${item.id}>remove</span>
          </div>
          <div>
              <i class="fa fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fa fa-chevron-down" data-id=${item.id}></i>
              </div>
          </div>`;
            cartContent.appendChild(divEl);
        
         
     }
     showCart(){
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
     }
     setUpAPP(){
        cart =  Storage.getCart();
        this.setCartValues(cart)
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        CloseCartBtn.addEventListener('click',this.hideCart)

     }
     populateCart(Cart){
         cart.forEach(item =>this.addCartItem(item));
     }
     hideCart(){
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");

     }
     cartLogic() {
        //  clear cart button
         clearCartBtn.addEventListener('click', ()=>{
            this.clearCart()
         });
        //  cart functionality
        cartContent.addEventListener('click', event=>{
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild
               (removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            else if(event.target.classList.contains("fa-chevron-up")){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempIrem = cart.find(item => item.id===id);
                tempIrem.amount = tempIrem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempIrem.amount;
            }
            else if(event.target.classList.contains("fa-chevron-down")){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempIrem = cart.find(item => item.id===id);
                tempIrem.amount = tempIrem.amount - 1;
                if(tempIrem.amount > 0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempIrem.amount;
                }else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id)
                }


            }
        });
     }
     clearCart() {
        let cartItems = cart.map(item =>item.id);
        cartItems.forEach(id => this.removeItem(id));
        console.log(cartContent.children);
        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
     }
     removeItem(id){
         cart = cart.filter(item =>item.id  !==id);
         this.setCartValues(cart);
         Storage.saveCart(cart);
         let button = this.getSingleButton(id);
         button.disabled = false;
         button.innerHTML = `<i class="fa fa-shopping-cart"></i>add to cart`;

     }
     getSingleButton(id){
         return buttonsDOM.find(button => button.dataset.id ===id)
     }
}

// local storage

class Storage{
    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products));
    }
    static getProducts(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }
    static saveCart(cart){
        localStorage.setItem('cart',JSON.stringify(cart))
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }
}

document.addEventListener("DOMContentLoaded",() =>{
    const ui = new UI();
    const products = new Products();
    // setup app
    ui.setUpAPP();
    // get all product

    products.getProducts().then(products =>{ ui.displayProducts(products)
        Storage.saveProducts(products);
}).then(()=>{
    ui.getBagButtons();
    ui.cartLogic();

});
    
});

