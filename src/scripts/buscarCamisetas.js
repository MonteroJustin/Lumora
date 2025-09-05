import * as algoliasearch from './algoliasearch-lite.umd.js';

// Conexión con Algolia
const client = algoliasearch.default('8K5EQTCM77', '8a8980fe86c7f8d2350abced8ed67f62');
const index = client.initIndex('camisetas');

async function buscarPorNombre(terminoBusqueda) {
    const productosContainer = document.getElementById('productos-container');
    productosContainer.innerHTML = '';

    const infoElement = document.getElementById("info");
    if (infoElement) {
        infoElement.innerHTML = `<h2>Resultados de Búsqueda para: "${terminoBusqueda}"</h2>`;
    }

    const paginacionContainer = document.getElementById('paginacion-container');
    if (paginacionContainer) {
        paginacionContainer.innerHTML = '';
    }

    try {
        const { hits } = await index.search(terminoBusqueda);

        if (hits.length === 0) {
            productosContainer.innerHTML = '<p class="text-center mt-5">No se encontraron resultados para su búsqueda.</p>';
            return;
        }

        hits.forEach((producto) => {
            const imagenOriginalUrl = producto.imagen;
            const nombreLimpio = producto.nombre_original;
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
                window.abrirModal(fullImageUrl, productName);
            });

            productosContainer.appendChild(cardDiv);
        });
    } catch (error) {
        console.error("Error al realizar la búsqueda con Algolia: ", error);
        productosContainer.innerHTML = '<p class="text-danger mt-5">Ocurrió un error al buscar los productos. Por favor, inténtelo de nuevo.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const searchInput = document.getElementById('searchNameInput');
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                buscarPorNombre(searchTerm);
            }
        });
    }
});