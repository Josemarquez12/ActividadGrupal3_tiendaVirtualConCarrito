"use strict";

const productos = [
    { id: 1, nombre: "Teclado mecánico",     precio: 180000,  categoria: "Periféricos", stock: 5 },
    { id: 2, nombre: "Mouse inalámbrico",    precio: 60000,   categoria: "Periféricos", stock: 8 },
    { id: 3, nombre: "Webcam HD",            precio: 95000,   categoria: "Periféricos", stock: 3 },
    { id: 4, nombre: "Monitor 24 pulgadas",  precio: 650000,  categoria: "Monitores",   stock: 4 },
    { id: 5, nombre: "Monitor curvo 27\"",   precio: 980000,  categoria: "Monitores",   stock: 2 },
    { id: 6, nombre: "Audífonos con micrófono", precio: 120000, categoria: "Audio",     stock: 6 },
    { id: 7, nombre: "Parlante Bluetooth",   precio: 150000,  categoria: "Audio",       stock: 1 },
    { id: 8, nombre: "Micrófono USB",        precio: 210000,  categoria: "Audio",       stock: 3 }
];

const UMBRAL_DESCUENTO = 300000;
const PORCENTAJE_DESCUENTO = 0.10;


// Cada elemento: { id, cantidad }
let carrito = [];
let categoriaActiva = "Todas";


const contenedorFiltros   = document.getElementById("filtros-categorias");
const contadorProductos   = document.getElementById("contador-productos");
const listaProductos      = document.getElementById("lista-productos");
const listaCarrito        = document.getElementById("lista-carrito");
const botonVaciar         = document.getElementById("vaciar-carrito");
const spanTotalArticulos  = document.getElementById("total-articulos");
const spanSubtotal        = document.getElementById("subtotal");
const spanDescuento       = document.getElementById("descuento");
const strongTotal         = document.getElementById("total-compra");


function formatearDinero(valor) {
    return "$ " + valor.toLocaleString("es-CO");
}

function buscarProducto(id) {
    return productos.find(function (p) { return p.id === id; });
}

function buscarEnCarrito(id) {
    return carrito.find(function (item) { return item.id === id; });
}

function cantidadEnCarrito(id) {
    const item = buscarEnCarrito(id);
    return item ? item.cantidad : 0;
}

// Unidades que quedan disponibles en el catálogo
function disponibles(producto) {
    return producto.stock - cantidadEnCarrito(producto.id);
}

function obtenerCategorias() {
    const categorias = [];
    productos.forEach(function (p) {
        if (!categorias.includes(p.categoria)) {
            categorias.push(p.categoria);
        }
    });
    return categorias;
}


function renderizarFiltros() {
    const categorias = ["Todas"].concat(obtenerCategorias());
    contenedorFiltros.innerHTML = "";

    categorias.forEach(function (categoria) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = categoria;
        boton.dataset.categoria = categoria;
        if (categoria === categoriaActiva) {
            boton.classList.add("activo");
        }
        contenedorFiltros.appendChild(boton);
    });
}


function renderizarCatalogo() {
    const visibles = productos.filter(function (p) {
        return categoriaActiva === "Todas" || p.categoria === categoriaActiva;
    });

    listaProductos.innerHTML = "";

    visibles.forEach(function (producto) {
        const quedan = disponibles(producto);
        const agotado = quedan === 0;

        const tarjeta = document.createElement("article");
        if (agotado) {
            tarjeta.classList.add("agotado");
        }

        const titulo = document.createElement("h3");
        titulo.textContent = producto.nombre;

        const categoria = document.createElement("p");
        categoria.textContent = producto.categoria;

        const precio = document.createElement("p");
        precio.textContent = formatearDinero(producto.precio);

        const stock = document.createElement("p");
        stock.textContent = "Disponibles: " + quedan;

        const boton = document.createElement("button");
        boton.type = "button";
        boton.dataset.accion = "agregar";
        boton.dataset.id = producto.id;
        boton.textContent = "Agregar";
        boton.disabled = agotado;

        tarjeta.appendChild(titulo);
        tarjeta.appendChild(categoria);
        tarjeta.appendChild(precio);
        tarjeta.appendChild(stock);

        if (agotado) {
            const etiqueta = document.createElement("p");
            const textoEtiqueta = document.createElement("span");
            textoEtiqueta.className = "etiqueta-agotado";
            textoEtiqueta.textContent = "Agotado";
            etiqueta.appendChild(textoEtiqueta);
            tarjeta.appendChild(etiqueta);
        }

        tarjeta.appendChild(boton);
        listaProductos.appendChild(tarjeta);
    });

    contadorProductos.textContent = "Mostrando " + visibles.length +
        (visibles.length === 1 ? " producto" : " productos");
}


function renderizarCarrito() {
    listaCarrito.innerHTML = "";

    if (carrito.length === 0) {
        const vacio = document.createElement("p");
        vacio.textContent = "Tu carrito está vacío";
        listaCarrito.appendChild(vacio);
        botonVaciar.disabled = true;
        return;
    }

    botonVaciar.disabled = false;

    carrito.forEach(function (item) {
        const producto = buscarProducto(item.id);
        const subtotal = producto.precio * item.cantidad;
        const alMaximo = item.cantidad >= producto.stock;

        const fila = document.createElement("div");

        const nombre = document.createElement("strong");
        nombre.textContent = producto.nombre;

        const precioUnitario = document.createElement("p");
        precioUnitario.textContent = "Precio unitario: " + formatearDinero(producto.precio);

        const controles = document.createElement("p");

        const botonMenos = document.createElement("button");
        botonMenos.type = "button";
        botonMenos.dataset.accion = "restar";
        botonMenos.dataset.id = producto.id;
        botonMenos.textContent = "−";
        botonMenos.setAttribute("aria-label", "Disminuir cantidad de " + producto.nombre);

        const cantidad = document.createElement("span");
        cantidad.textContent = " " + item.cantidad + " ";

        const botonMas = document.createElement("button");
        botonMas.type = "button";
        botonMas.dataset.accion = "sumar";
        botonMas.dataset.id = producto.id;
        botonMas.textContent = "+";
        botonMas.disabled = alMaximo;
        botonMas.setAttribute("aria-label", "Aumentar cantidad de " + producto.nombre);

        controles.appendChild(botonMenos);
        controles.appendChild(cantidad);
        controles.appendChild(botonMas);

        const textoSubtotal = document.createElement("p");
        textoSubtotal.textContent = "Subtotal: " + formatearDinero(subtotal);

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.dataset.accion = "eliminar";
        botonEliminar.dataset.id = producto.id;
        botonEliminar.textContent = "Eliminar";

        fila.appendChild(nombre);
        fila.appendChild(precioUnitario);
        fila.appendChild(controles);
        fila.appendChild(textoSubtotal);
        fila.appendChild(botonEliminar);

        listaCarrito.appendChild(fila);
    });
}


function renderizarResumen() {
    let articulos = 0;
    let subtotal = 0;

    carrito.forEach(function (item) {
        const producto = buscarProducto(item.id);
        articulos += item.cantidad;
        subtotal += producto.precio * item.cantidad;
    });

    const descuento = subtotal >= UMBRAL_DESCUENTO
        ? Math.round(subtotal * PORCENTAJE_DESCUENTO)
        : 0;
    const total = subtotal - descuento;

    spanTotalArticulos.textContent = articulos;
    spanSubtotal.textContent = formatearDinero(subtotal);
    spanDescuento.textContent = descuento > 0
        ? "-" + formatearDinero(descuento)
        : formatearDinero(0);
    strongTotal.textContent = formatearDinero(total);
}


function actualizarVista() {
    renderizarCatalogo();
    renderizarCarrito();
    renderizarResumen();
}


function agregarAlCarrito(id) {
    const producto = buscarProducto(id);
    if (!producto) return;

    const item = buscarEnCarrito(id);

    if (item) {
        if (item.cantidad < producto.stock) {
            item.cantidad++;
        }
    } else if (producto.stock > 0) {
        carrito.push({ id: id, cantidad: 1 });
    }
}

function sumarCantidad(id) {
    agregarAlCarrito(id);
}

function restarCantidad(id) {
    const item = buscarEnCarrito(id);
    if (!item) return;

    item.cantidad--;
    if (item.cantidad <= 0) {
        eliminarDelCarrito(id);
    }
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(function (item) { return item.id !== id; });
}

function vaciarCarrito() {
    carrito = [];
}


// Filtros por categoría
contenedorFiltros.addEventListener("click", function (evento) {
    const boton = evento.target.closest("button");
    if (!boton) return;

    categoriaActiva = boton.dataset.categoria;
    renderizarFiltros();
    renderizarCatalogo();
});

// Botón "Agregar" del catálogo
listaProductos.addEventListener("click", function (evento) {
    const boton = evento.target.closest("button");
    if (!boton || boton.disabled || boton.dataset.accion !== "agregar") return;

    agregarAlCarrito(Number(boton.dataset.id));
    actualizarVista();
});

// Botones −, +, Eliminar del carrito
listaCarrito.addEventListener("click", function (evento) {
    const boton = evento.target.closest("button");
    if (!boton || boton.disabled) return;

    const id = Number(boton.dataset.id);

    switch (boton.dataset.accion) {
        case "sumar":
            sumarCantidad(id);
            break;
        case "restar":
            restarCantidad(id);
            break;
        case "eliminar":
            eliminarDelCarrito(id);
            break;
        default:
            return;
    }

    actualizarVista();
});

// Vaciar carrito
botonVaciar.addEventListener("click", function () {
    vaciarCarrito();
    actualizarVista();
});

renderizarFiltros();
actualizarVista();
