'use strict';

// Obtener elementos del DOM
const selectCategoriaEl = document.querySelector('.filtro-select');
const seccionProductosEl = document.querySelector('.productos');

// URL al que se realizarán las peticiones
const url = 'http://localhost:8080/api';

// Funciones
// Permite crear elementos HTML dinámicamente
const createHTMLElements = function (element, classes) {
    const createdElement = document.createElement(element);
    createdElement.classList.add(...classes);

    return createdElement;
}

// Obtiene y carga las categorías en el dropdown
const loadCategories = function () {

    // Se obtienen las categorías
    fetch(`${url}/categorias/`)
        .then(res => res.json())
        .then(data => {

            for (let d of data) {
                const option = document.createElement('option');
                option.value = `${d.idCategoria}`;
                option.textContent = `${d.name}`;

                selectCategoriaEl.appendChild(option);
            }

        })
        .catch(err => console.log(err));
};

// Función callback gatillada al percibirse un cambio en el select
const selectCategory = function (e) {
    // Siempre parte en la primera página
    let page = 0;

    seccionProductosEl.innerHTML = '';

    // Se obtienes los productos de acuerdo con la categoría seleccionada
    fetch(`${url}/productos/categoria/${e.target.value}/page/${page}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);

            for (let d of data.content) {

                // Crea el div contenedor 
                const divProducto = createHTMLElements('div', ['producto']);

                // Crea la imagen del producto
                const img = createHTMLElements('img', 'img-producto');

                // Despliega la imagen provista por BD u otra provisional
                d.urlImage !== null && d.urlImage !== '' ? img.src = `${d.urlImage}` : img.src = 'assets/images/img-not-found.png';
                img.alt = 'Imagen del producto en venta';
                divProducto.appendChild(img);

                // Crea el div contenedor de la descripción del producto
                const divDescProducto = createHTMLElements('div', ['descripcion-producto']);
                divProducto.appendChild(divDescProducto);

                // Crea el nombre del producto
                const nombreProducto = createHTMLElements('p', ['nombre-producto']);
                nombreProducto.textContent = `${d.name}`;
                divDescProducto.appendChild(nombreProducto);

                // Crea el contenedor del precio del producto
                const divPrecio = createHTMLElements('div', ['precio-container']);
                divDescProducto.appendChild(divPrecio);

                // Crea el ícono 
                const iconoPrecio = createHTMLElements('ion-icon', ['precio-icon']);
                iconoPrecio.name = 'cash-outline';
                divPrecio.appendChild(iconoPrecio);

                // Despliega el precio del producto
                const precioProducto = createHTMLElements('p', ['precio-producto']);
                precioProducto.textContent = `$${d.price}`;
                divPrecio.appendChild(precioProducto);

                // Botón para añadir al carrito
                const addToCartBtn = createHTMLElements('button', ['btn', 'add-to-cart-btn']);
                addToCartBtn.textContent = 'Añadir al carrito';
                divProducto.appendChild(addToCartBtn);

                seccionProductosEl.appendChild(divProducto);
            }
        })
        .catch(err => console.log(err));

};

loadCategories();

// Event listeners
selectCategoriaEl.addEventListener('change', selectCategory);