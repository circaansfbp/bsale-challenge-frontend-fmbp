'use strict';

// Obtener elementos del DOM
const selectCategoriaEl = document.querySelector('.filtro-select');
const seccionProductosEl = document.querySelector('.productos');
const inputBuscarProd = document.querySelector('.filtro-input');
const btnBuscarProd = document.querySelector('.filtro-btn');
const divPaginacion = document.querySelector('.paginacion');

// URL al que se realizarán las peticiones
const url = 'http://localhost:8080/api';

// Permite guardar el parámetro de búsqueda de productos (mediante input)
let searchedProduct = '';

// Funciones
// Permite crear elementos HTML dinámicamente
const createHTMLElements = function (element, classes) {
    const createdElement = document.createElement(element);
    createdElement.classList.add(...classes);

    return createdElement;
}

// Función encargada de crear dinámicamente el listado de productos
const createAndDisplayProducts = function (data) {
    // Crea el div contenedor 
    const divProducto = createHTMLElements('div', ['producto']);

    // Crea la imagen del producto
    const img = createHTMLElements('img', 'img-producto');

    // Despliega la imagen provista por BD u otra provisional
    data.urlImage !== null && data.urlImage !== '' ? img.src = `${data.urlImage}` : img.src = 'assets/images/img-not-found.png';
    img.alt = 'Imagen del producto en venta';
    divProducto.appendChild(img);

    // Crea el div contenedor de la descripción del producto
    const divDescProducto = createHTMLElements('div', ['descripcion-producto']);
    divProducto.appendChild(divDescProducto);

    // Crea el nombre del producto
    const nombreProducto = createHTMLElements('p', ['nombre-producto']);
    nombreProducto.textContent = `${data.name}`;
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
    precioProducto.textContent = `$${data.price}`;
    divPrecio.appendChild(precioProducto);

    // Botón para añadir al carrito
    const addToCartBtn = createHTMLElements('button', ['btn', 'add-to-cart-btn']);
    addToCartBtn.textContent = 'Añadir al carrito';
    divProducto.appendChild(addToCartBtn);

    // Se adjunta el div a la sección "productos"
    seccionProductosEl.appendChild(divProducto);
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

// Generar los links (buttons) de paginación dinámicamente
const genPagination = function (totalPages, event) {
    divPaginacion.innerHTML = ' ';

    for (let i = 1; i <= totalPages; i++) {
        const linkPage = createHTMLElements('button', ['nro-pagina']);

        // Si el evento existe, entonces significa que la paginación se generó al gatillarse el evento de filtro por categoría.
        // De lo contrario, la paginación se generó al realizar la búsqueda de un producto.
        linkPage.setAttribute('data-request', event ? `${url}/productos/categoria/${event?.target.value}/page/${i - 1}` : `${url}/productos/buscar/page/${i - 1}?`);
        linkPage.textContent = `${i}`;
        divPaginacion.appendChild(linkPage);
    }

    // Añade la clase 'active' al primer link y lo deshabilita
    divPaginacion.children[0].classList.add('nro-pagina--active');
    divPaginacion.children[0].setAttribute('disabled', 'true');
}

// Función que permite generar los toasts a mostrar al usuario
const genToastify = function (text, status) {
    return Toastify({
        text: text,
        duration: 3000,
        close: true,
        gravity: 'bottom',
        position: 'center',
        stopOnFocus: true,
        style: {
            background: `${status ? '#ff5c1a' : '#331205'}`
        }
    }).showToast();
}

// Función callback gatillada al percibirse un cambio en el select
const selectCategory = function (e) {
    seccionProductosEl.innerHTML = '';
    divPaginacion.innerHTML = '';
    inputBuscarProd.value = '';

    // Se obtienen los productos de acuerdo con la categoría seleccionada
    fetch(`${url}/productos/categoria/${e.target.value}/page/0`)
        .then(res => res.json())
        .then(data => {
            console.log(data);

            genPagination(data.totalPages, e);

            for (let d of data.content) {
                createAndDisplayProducts(d);
            }

            genToastify(`${data.totalElements} producto(s) encontrado(s)`, true);
        })
        .catch(err => {
            divPaginacion.innerHTML = ' ';
            genToastify('Algo salió mal :(', false);
        });

};

// Función callback que permite buscar productos
const searchProduct = function () {
    // Guard clause
    // Si solo existen espacios en blanco en el input
    if (inputBuscarProd.value.match(/^\s*$/)) {
        genToastify('Debes ingresar el producto a buscar!', false);
        return;
    }

    // Si el input posee menos de 3 caracteres
    if (inputBuscarProd.value.length < 3) {
        genToastify('Debes ingresar al menos 3 caracteres!', false);
        return;
    }

    // Se conserva el producto buscado para evitar errores al borrar el value del input
    searchedProduct = `${inputBuscarProd.value}`;

    seccionProductosEl.innerHTML = '';
    divPaginacion.innerHTML = '';
    selectCategoriaEl.value = "";

    // Obtiene los productos de acuerdo al parámetro buscado
    fetch(`${url}/productos/buscar/page/0?` + new URLSearchParams({
        name: `${searchedProduct}`
    }))
        .then(res => {
            if (res.ok) return res.json();
            else if (res.status === 404) {
                genToastify(`La búsqueda de "${searchedProduct}" no dió resultados :(`);
            }
        })
        .then(data => {
            genPagination(data.totalPages);

            for (let d of data.content) {
                createAndDisplayProducts(d);
            }

            genToastify(`${data.totalElements} producto(s) encontrado(s)`, true);
        })
        .catch(err => {
            divPaginacion.innerHTML = ' ';
        });
};

// Función callback para cambiar de número de página
const loadPage = function (e) {
    // Guard clause
    // Si no se hace click en un botón
    if (!e.target.classList.contains('nro-pagina')) return;

    seccionProductosEl.innerHTML = '';
    let urlPageToFetch = '';

    // Remueve la clase 'active' y el atributo disabled de los links
    // y luego se agregan al que fue clickado.
    Array.from(divPaginacion.children).forEach(child => {
        child.classList.remove('nro-pagina--active');
        child.removeAttribute('disabled');
    });

    e.target.classList.add('nro-pagina--active');
    e.target.setAttribute('disabled', 'true');

    // Si la paginación viene desde el filtrado de productos por categoría
    if (e.target.getAttribute('data-request').includes('categoria'))
        urlPageToFetch = `${e.target.getAttribute('data-request')}`;

    // Si la paginación viene desde la búsqueda entre todos los productos
    else
        urlPageToFetch = `${e.target.getAttribute('data-request')}${new URLSearchParams({ name: `${searchedProduct}` })}`;


    fetch(`${urlPageToFetch}`)
        .then(res => res.json())
        .then(data => {
            for (let d of data.content) {
                createAndDisplayProducts(d);
            }
        })
        .catch(err => console.log(err));
};

// Función de inicio
const init = function () {
    loadCategories();
}

init();

// Event listeners
selectCategoriaEl.addEventListener('change', selectCategory);
btnBuscarProd.addEventListener('click', searchProduct);
divPaginacion.addEventListener('click', loadPage);