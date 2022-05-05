const clickButton = document.querySelectorAll('.button')
const tbody = document.querySelector('.tbody')
let carrito = [];

clickButton.forEach(btn => {
    btn.addEventListener('click', addToCarritoItem)
})


function addToCarritoItem(e) {
    const button = e.target
    const item = button.closest('.card')
    const itemTitle = item.querySelector('.card-title').textContent;
    const itemPrice = item.querySelector('.precio').textContent;
    const itemImg = item.querySelector('.card-img-top').src;
    
    const newItem = {
        title: itemTitle,
        precio: itemPrice,
        img: itemImg,
        cantidad: 1
    }

    addItemCarrito(newItem)
}

function addItemCarrito(newItem) {


    const alert = document.querySelector('.alert');

    setTimeout(function(){  //! Alert de producto añadido
        alert.classList.add('hide')
    }, 2000);                   //! entre add y remove, hay 2 segundos de retraso
    alert.classList.remove('hide');




    const inputCantidad = tbody.getElementsByClassName('input__cantidad');

    for(let i = 0; i < carrito.length; i++){
        if(carrito[i].title.trim() === newItem.title.trim()){
            carrito[i].cantidad++; //* si el item ya esta en el carrito, se suma una unidad. No tendo id, pero tengo title el cual es unico

            const inputValue = inputCantidad[i];
            inputValue.value++; //* sumo cantidad en el input del carrito

            totalCarrito(); 

            return null; //* con null, salgo de la funcion y no se ejecuta linea 38 ni 40, asi no duplica el renderizado en pagina carrito
        }
    }

    carrito.push(newItem); //* Agrego este nuevo item a la variable global carrito (linea 2)

    renderCarrito();
}

function renderCarrito(){
    tbody.innerHTML = '';
    carrito.map(item => {
        const tr = document.createElement('tr');
        tr.classList.add('itemCarrito');
        const content = `

        <th scope="row">1</th>
            <td class="table__productos">
                <img src=${item.img} alt="">
                <h6 class="title">${item.title}</h6>
            </td>
            <td class="table__precio">
                <p>${item.precio}</p>
            </td>
            <td class="table__cantidad">
                <input type="number" min="1" value=${item.cantidad} class="input__cantidad">
                <button class="delete btn btn-danger">X</button>
            </td>
      
        `;

        tr.innerHTML = content; //* agrego a tr el contenido de content
        tbody.append(tr); //* al tbody le agrego el tr


        tr.querySelector('.delete').addEventListener('click', removeItemCarrito);
        tr.querySelector('.input__cantidad').addEventListener('change', sumaCantidad); //! al ser un input, me viene de 10 usar el evento change
    })


    totalCarrito();
}

function totalCarrito() {
    let total = 0;
    const itemCartTotal = document.querySelector('.itemCartTotal');
    carrito.forEach((item) => { //! recorro la matriz principal del carrito
        const precio = Number(item.precio.replace("$", "")) //* al precio le quito el valor $ y lo vuelvo un valor numerico asi lo puedo multiplicar abajo
        total = total + precio*item.cantidad;
    })

    itemCartTotal.innerHTML = `Total $${total}`;
    
    addLocalStorage();
}


function removeItemCarrito(e) { //! fn para remover una unidad del carrito con la "X"
    const buttonDelete = e.target;
    const tr = buttonDelete.closest('.itemCarrito'); //! componente padre de buttonDelete
    const title = tr.querySelector('.title').textContent;
    for(let i = 0; i < carrito.length; i++) {

        if(carrito[i].title.trim() === title.trim()) {
            carrito.splice(i, 1);
        }
    }
    tr.remove();
    totalCarrito();

    const alert = document.querySelector('.remove'); 

    setTimeout(function(){  //! Alert de producto removido
        alert.classList.add('remove')
    }, 2000);                   //! entre add y remove, hay 2 segundos de retraso
    alert.classList.remove('remove');
}


function sumaCantidad(e) { //! fn para modificar cantidad en el input
    const sumaInput = e.target;
    const tr = sumaInput.closest('.itemCarrito');
    const title = tr.querySelector('.title').textContent;
    carrito.forEach(item => {
        if(item.title.trim() === title.trim()){
            sumaInput.value < 1 ? (sumaInput.value = 1) : (sumaInput.value); //! uso de operador ternario
            item.cantidad = sumaInput.value;
            totalCarrito();
        }
    })
    
}

function addLocalStorage(){
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

window.onload = function() { //! se ejecuta cada vez q se refresque la pantalla
    const storage = JSON.parse(localStorage.getItem('carrito'));
    if(storage){
        carrito = storage;
        renderCarrito();
    }
}

