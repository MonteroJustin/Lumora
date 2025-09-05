// Importa las funciones de Firestore necesarias
import { db } from "../services/firebase-config.js";
import { collection, query, where, getDocs, limit, startAfter, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Estado de la paginación
let paginaActual = 1;
let categoriaActual = '';
let totalDocumentos = 0;
const TAMANO_PAGINA = 30;
let docsPorPagina = {}; // Almacena el último documento de cada página

// Lógica para mostrar el título y la descripción
function actualizarInfo(categoria) {
    let resultado = "";
    switch (categoria) {
        case 'Conjuntos Adultos y Kids':
            resultado = `<h2>Conjuntos Adulto y Niño</h2><p>Precio: ₡20.000</p><p>Personalizada: ₡5.000</p>`;
            break;
        case 'Fan':
            resultado = `<h2>Edición Fan</h2><p>Precio: ₡14.000</p><p>Personalizada: ₡3.500</p>`;
            break;
        case 'Femenino':
            resultado = `<h2>Ropa Femenina</h2><p>Precio: ₡12.000</p><p>Personalizada: ₡3.000</p>`;
            break;
        case 'Jugador':
            resultado = `<h2>Ropa de Jugador</h2><p>Precio: ₡15.000</p><p>Personalizada: ₡3.500</p>`;
            break;
        case 'NFL':
            resultado = `<h2>Edición NFL</h2><p>Precio: ₡16.000</p><p>Personalizada: ₡4.000</p>`;
            break;
        case 'Retro Adultos ML':
            resultado = `<h2>Retro Adultos Manga Larga</h2><p>Precio: ₡13.000</p><p>Personalizada: ₡3.200</p>`;
            break;
        case 'Retro Futbol':
            resultado = `<h2>Retro Futbol</h2><p>Precio: ₡13.500</p><p>Personalizada: ₡3.300</p>`;
            break;
        case 'Niño Retro':
            resultado = `<h2>Ropa de Niño Retro</h2><p>Precio: ₡10.000</p><p>Personalizada: ₡2.600</p>`;
            break;
        case 'Trofeos':
            resultado = `<h2>Trofeos</h2><p>Precio: ₡8.000</p>`;
            break;
        case 'Llaveros':
            resultado = `<h2>Llaveros</h2><p>Precio: ₡3.500</p>`;
            break;
        case 'Collares':
            resultado = `<h2>Collares</h2><p>Precio: ₡4.500</p>`;
            break;
        default:
            resultado = `<p>Categoría no encontrada</p>`;
            break;
    }
    document.getElementById("info").innerHTML = resultado;
}

// Lógica para obtener el total de documentos de la categoría
async function contarDocumentos(categoria) {
    try {
        const productosRef = collection(db, 'camisetas');
        const q = query(productosRef, where("categoria", "==", categoria));
        const querySnapshot = await getDocs(q);
        totalDocumentos = querySnapshot.size;
    } catch (error) {
        console.error("Error al contar los documentos: ", error);
    }
}

// 🆕 Nueva función de búsqueda para texto parcial
async function buscarPorNombre(terminoBusqueda) {
    const productosContainer = document.getElementById('productos-container');
    productosContainer.innerHTML = '';
    document.getElementById("info").innerHTML = `<h2>Resultados de Búsqueda para: "${terminoBusqueda}"</h2>`;
    document.getElementById('paginacion-container').innerHTML = ''; // Oculta la paginación

    try {
        const productosRef = collection(db, 'camisetas');
        const searchTermLower = terminoBusqueda.toLowerCase();

        const q = query(
            productosRef,
            orderBy('nombre_minusculas'),
            startAt(searchTermLower),
            endAt(searchTermLower + '\uf8ff')
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            productosContainer.innerHTML = '<p class="text-center mt-5">No se encontraron resultados para su búsqueda.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const producto = doc.data();
            const imagenOriginalUrl = producto.imagen;
            const nombreLimpio = producto.nombre_original || decodeURIComponent(imagenOriginalUrl.split('/').pop().split('.')[0].trim());
            const miniaturaUrl = `${imagenOriginalUrl}?tr=w-100,q-10`;

            const cardDiv = document.createElement('div');
            cardDiv.classList.add('product-card');

            cardDiv.innerHTML = `
                <img src="${miniaturaUrl}" alt="${nombreLimpio}" data-full-image-url="${imagenOriginalUrl}" data-product-name="${nombreLimpio}">
                <h3>${nombreLimpio}</h3>
            `;
            const imgElement = cardDiv.querySelector('img');
            imgElement.addEventListener('click', () => {
                const fullImageUrl = imgElement.getAttribute('data-full-image-url');
                const productName = imgElement.getAttribute('data-product-name');
                abrirModal(fullImageUrl, productName);
            });

            productosContainer.appendChild(cardDiv);
        });
    } catch (error) {
        console.error("Error al realizar la búsqueda: ", error);
        productosContainer.innerHTML = '<p class="text-danger mt-5">Ocurrió un error al buscar los productos. Por favor, inténtelo de nuevo.</p>';
    }
}

// Función principal llamada desde el menú
window.obtenerCamisetas = async function (categoria, pagina = 1) {
    if (categoria !== categoriaActual) {
        categoriaActual = categoria;
        paginaActual = 1;
        docsPorPagina = {};
        totalDocumentos = 0;
        await contarDocumentos(categoria);
    } else {
        paginaActual = pagina;
    }
    actualizarInfo(categoria);
    await obtenerProductosDeFirestore(categoria, paginaActual);
}

// Lógica para obtener y mostrar los productos
async function obtenerProductosDeFirestore(categoria, pagina) {
    const productosContainer = document.getElementById('productos-container');
    productosContainer.innerHTML = '';

    try {
        const productosRef = collection(db, 'camisetas');
        let q = query(productosRef, where("categoria", "==", categoria));

        // Paginación hacia adelante
        if (pagina > 1) {
            const ultimoDocPaginaAnterior = docsPorPagina[pagina - 1];
            if (ultimoDocPaginaAnterior) {
                q = query(q, startAfter(ultimoDocPaginaAnterior));
            }
        }

        q = query(q, limit(TAMANO_PAGINA));

        const querySnapshot = await getDocs(q);

        if (querySnapshot.docs.length > 0) {
            // Guardar la referencia del último documento de la página actual
            docsPorPagina[pagina] = querySnapshot.docs[querySnapshot.docs.length - 1];
        }

        querySnapshot.forEach((doc) => {
            const producto = doc.data();
            const imagenOriginalUrl = producto.imagen;
            const nombreLimpio = producto.nombre_original || decodeURIComponent(imagenOriginalUrl.split('/').pop().split('.')[0].trim());
            const miniaturaUrl = `${imagenOriginalUrl}?tr=w-100,q-10`;

            const cardDiv = document.createElement('div');
            cardDiv.classList.add('product-card');

            cardDiv.innerHTML = `
                <img src="${miniaturaUrl}" alt="${nombreLimpio}" data-full-image-url="${imagenOriginalUrl}" data-product-name="${nombreLimpio}">
                <h3>${nombreLimpio}</h3>
            `;
            const imgElement = cardDiv.querySelector('img');
            imgElement.addEventListener('click', () => {
                const fullImageUrl = imgElement.getAttribute('data-full-image-url');
                const productName = imgElement.getAttribute('data-product-name');
                abrirModal(fullImageUrl, productName);
            });

            productosContainer.appendChild(cardDiv);
        });
        renderPaginacion();
    } catch (error) {
        console.error("Error al obtener los productos: ", error);
    }
}

// Lógica para renderizar la paginación
function renderPaginacion() {
    const paginacionContainer = document.getElementById('paginacion-container');
    if (!paginacionContainer) return;
    paginacionContainer.innerHTML = '';
    const totalPaginas = Math.ceil(totalDocumentos / TAMANO_PAGINA);

    // Botón Primera
    const btnPrimera = document.createElement('button');
    btnPrimera.textContent = 'Primera';
    btnPrimera.disabled = paginaActual === 1;
    btnPrimera.addEventListener('click', () => obtenerCamisetas(categoriaActual, 1));
    paginacionContainer.appendChild(btnPrimera);

    // Botones numéricos
    let inicio = Math.max(1, paginaActual - 2);
    let fin = Math.min(totalPaginas, paginaActual + 2);

    // Si hay más páginas, ajusta el rango
    if (fin - inicio < 4) {
        if (inicio === 1) fin = Math.min(totalPaginas, 5);
        if (fin === totalPaginas) inicio = Math.max(1, totalPaginas - 4);
    }

    for (let i = inicio; i <= fin; i++) {
        const btnNumero = document.createElement('button');
        btnNumero.textContent = i;
        if (i === paginaActual) {
            btnNumero.disabled = true;
        }
        btnNumero.addEventListener('click', () => obtenerCamisetas(categoriaActual, i));
        paginacionContainer.appendChild(btnNumero);
    }

    // Botón Última
    const btnUltima = document.createElement('button');
    btnUltima.textContent = 'Última';
    btnUltima.disabled = paginaActual === totalPaginas || totalDocumentos === 0;
    btnUltima.addEventListener('click', () => obtenerCamisetas(categoriaActual, totalPaginas));
    paginacionContainer.appendChild(btnUltima);
}

// Lógica para el modal
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('full-image');
const closeModalBtn = document.querySelector('.close-modal');

window.abrirModal = function(urlDeImagen, productName) {
    modal.style.display = 'flex';
    modalImg.src = urlDeImagen;
    const whatsappNumber = "50686505915";
    const mensaje = `${urlDeImagen}\n¡Hola!\nEstoy interesado/a en la camiseta:\n${productName}.\nCategoría: ${categoriaActual}.\n¿Me podrían dar más información para reservarla?`;
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
    const reservarBtn = document.getElementById('reservar-btn');
    if (reservarBtn) {
        reservarBtn.href = whatsappLink;
    }
}

closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});