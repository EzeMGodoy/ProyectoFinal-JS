const cards = document.getElementById("cards");
const items = document.getElementById("items");
const footer = document.getElementById("footer");
const templateCard = document.getElementById("template-card").content; //! .content --> para acceder a los elementos de los templates
const templateFooter = document.getElementById("template-footer").content;
const templateCarrito = document.getElementById("template-carrito").content;

const tabla = document.getElementById("table");

console.log(templateCard);

const fragment = document.createDocumentFragment(); //! no genera reflow, memoria volatil, se va

let carrito = {};

document.addEventListener("DOMContentLoaded", () => {
  fetchData(); //! Capturo los datos pero todavia sin pintar
  if (localStorage.getItem("carrito")) {
    carrito = JSON.parse(localStorage.getItem("carrito"));
    pintarCarrito();
  }
});

cards.addEventListener("click", (e) => {
  addCarrito(e); // con el "e", capturo el elemento q quiero modificar
});

items.addEventListener("click", (e) => {
  btnAccion(e);
});

const fetchData = async () => {
  try {
    const res = await fetch("../api.json"); //! Llamo elementos de la api
    const data = await res.json(); //! Objeto tipo RESPONSE con los datos de la respuesta con metodo .json() ya que la api es json
    pintarCards(data);
  } catch (error) {
    console.log(error);
  }
};

const pintarCards = (data) => {
  data.forEach((producto) => {
    templateCard.querySelector("h5").textContent = producto.title;
    templateCard.querySelector(".description").textContent =
      producto.description; //!No funciona ver en api y html
    templateCard.querySelector(".precio").textContent = `$${producto.precio}`;
    templateCard.querySelector("img").setAttribute("src", producto.imgCurso);
    templateCard.querySelector(".btn-success").dataset.id = producto.id;

    const clone = templateCard.cloneNode(true); //Tengo el clon y lo paso al fragment
    fragment.appendChild(clone);
  });

  cards.appendChild(fragment); // aca pinto todas las cards. Evito el reflow gracias al fragment
};

const addCarrito = (e) => {
  if (e.target.classList.contains("btn-success")) {
    //Detecté el boton entonces agrego al carrito al hacer click
    setCarrito(e.target.parentElement); //*Accedo al padre del target(boton), o sea al div card-body. Ver dsp de agregar el div de img

    const alert = document.querySelector(".alert");

    Swal.fire({
      text: "Producto añadido",
      icon: "success",
    });

    setTimeout(function () {
      //! Alert de producto añadido
      alert.classList.add("hide");
    }, 2000); //! entre add y remove, hay 2 segundos de retraso
    alert.classList.remove("hide");
  }
  e.stopPropagation(); //! detengo cualquier otro evento q se pueda generar en el item
};

const setCarrito = (objeto) => {
  //Cuando hago click, selecciono todos los elementos de la card y los empujo dentro de setCarrito y generar ese objeto

  const producto = {
    id: objeto.querySelector(".btn-success").dataset.id,
    title: objeto.querySelector("h5").textContent,
    description: objeto.querySelector(".description").textContent,
    precio: Number(
      objeto.querySelector(".precio").textContent.replace("$", "")
    ),
    cantidad: 1, //Si el producto no existe en el carrito, por defecto su cantidad es 1 al hacer click
  };

  if (carrito.hasOwnProperty(producto.id)) {
    //*si existe queire decir que el producto se está duplicando por lo tanto agregar 1 mas
    producto.cantidad = carrito[producto.id].cantidad + 1;
  }

  carrito[producto.id] = { ...producto }; //! Spread Operator. Hago una copia de producto. Si NO existe, lo crea, pero si existe, lo sobreescribe
  pintarCarrito();
};

const pintarCarrito = () => {
  items.innerHTML = ""; //* Gracias a esto no repito la lista. Probar que pasa si lo comento o borro ;)
  Object.values(carrito).forEach((producto) => {
    //! Uso Object.values, porque al ser un objeto NO le puedo pasar metodos de arrays. Con esta propiedad si.
    templateCarrito.querySelector("th").textContent = producto.id;
    templateCarrito.querySelectorAll("td")[0].textContent = producto.title;
    templateCarrito.querySelectorAll("td")[1].textContent = producto.cantidad;
    templateCarrito.querySelector(".btn-agregar").dataset.id = producto.id;
    templateCarrito.querySelector(".btn-borrar").dataset.id = producto.id;
    // templateCarrito.querySelector(".btn-comprar").dataset.id = producto.id;
    templateCarrito.querySelector("span").textContent =
      producto.precio * producto.cantidad;

    const clone = templateCarrito.cloneNode(true);
    fragment.appendChild(clone);
  });
  items.appendChild(fragment);

  pintarFooterCarrito();

  localStorage.setItem("carrito", JSON.stringify(carrito)); //item 'carrito' definido en linea 15
};

const pintarFooterCarrito = () => {
  footer.innerHTML = "";
  if (Object.keys(carrito).length === 0) {
    footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío</th>
        `;
    return; //* Cuando detecta q el carrito esta vacio, se sale y no hace lo siguiente
  }

  const nCantidad = Object.values(carrito).reduce(
    (acc, { cantidad }) => acc + cantidad,
    0
  );
  const nPrecio = Object.values(carrito).reduce(
    (acc, { cantidad, precio }) => acc + cantidad * precio,
    0
  );
  templateFooter.querySelectorAll("td")[0].textContent = nCantidad;
  templateFooter.querySelector("span").textContent = nPrecio;

  const clone = templateFooter.cloneNode(true);
  fragment.appendChild(clone);
  footer.appendChild(fragment);

  const btnVaciar = document.getElementById("vaciar-carrito");
  btnVaciar.addEventListener("click", () => {
    carrito = {};
    pintarCarrito();
  });

  const btnComprar = document.getElementById("comprar-carrito");
  btnComprar.addEventListener("click", () => {
    Swal.fire({
      text: "Gracias por su compra",
      icon: "success",
    });
    carrito = {};
    pintarCarrito();
    
  });
};

const btnAccion = (e) => {
  //!para aumentar cantidad en boton "+"
  if (e.target.classList.contains("btn-agregar")) {
    console.log(carrito[e.target.dataset.id]);
    const producto = carrito[e.target.dataset.id];
    producto.cantidad = carrito[e.target.dataset.id].cantidad + 1;
    carrito[e.target.dataset.id] = { ...producto }; //! Spread operator, copia de producto
    pintarCarrito();
  }

  if (e.target.classList.contains("btn-borrar")) {
    //!para disminuir cantidad en boton "-"
    const producto = carrito[e.target.dataset.id];
    producto.cantidad--;
    if (producto.cantidad == 0) {
      delete carrito[e.target.dataset.id]; //*Delete --> propiedad de los objetos
    }
    pintarCarrito();
  }

  e.stopPropagation();
};

//! Todo este codigo Sortable, funciona pero me faltaria hacer que cuando se arrastran al carrito, sumen cantidad y precio

/*
Sortable.create(cards, {   
  group: {
    name: "shared",
    // pull: "clone",
    // put: false
  },
  animation: 400,
  chosenClass: "seleccionado",       
  dragClass: "drag",

  onEnd: () =>{

  }
});

Sortable.create(table, {
  group: {
    name: "shared",
    // put: false,
    // pull: "clone"
  },
})

*/
