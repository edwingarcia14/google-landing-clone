/**
 * Módulo de sugerencias de autocompletado e interacción de entrada.
 */
const SUGGESTIONS_DATA = [
    'HTML5 semántico',
    'CSS custom properties',
    'JavaScript ES6 modules',
    'React',
    'Flexbox vs CSS Grid',
    'Clean code JavaScript'
];

let selectedIndex = -1;

/**
 * Escapa caracteres especiales de expresiones regulares para evitar inyecciones o errores de sintaxis.
 * @param {string} string - Cadena de texto a escapar.
 * @returns {string} Cadena sanitizada para uso seguro en RegExp.
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Limita la frecuencia de ejecución de una función para optimizar el rendimiento ante eventos continuos.
 * @param {Function} func - Función a ejecutar tras el retardo.
 * @param {number} wait - Tiempo de espera en milisegundos (por defecto 200ms).
 * @returns {Function} Función envuelta en lógica debounce.
 */
function debounce(func, wait = 200) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Inicializa los eventos de entrada, navegación por teclado y cierre del autocompletado.
 */
export function initAutocomplete() {
    const searchInput = document.getElementById('searchInput');
    const dropdown = document.getElementById('suggestionsDropdown');
    const listContainer = document.getElementById('suggestionsList');

    if (!searchInput || !dropdown || !listContainer) return;

    /**
     * Oculta el menú desplegable y reinicia el índice de selección.
     */
    const hideDropdown = () => {
        dropdown.classList.remove('active');
        dropdown.setAttribute('aria-hidden', 'true');
        selectedIndex = -1;
    };

    const handleInput = debounce((event) => {
        const query = event.target.value.trim().toLowerCase();

        if (query.length === 0) {
            hideDropdown();
            listContainer.innerHTML = '';
            return;
        }

        const filtered = SUGGESTIONS_DATA.filter(item => 
            item.toLowerCase().includes(query)
        );

        renderSuggestions(filtered, query, listContainer, dropdown, searchInput);
    }, 200);

    searchInput.addEventListener('input', handleInput);

    // Navegación interactiva por teclado (flechas arriba/abajo y tecla Escape)
    searchInput.addEventListener('keydown', (event) => {
        const items = listContainer.querySelectorAll('.suggestion-item');
        if (!items.length || !dropdown.classList.contains('active')) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            // Aritmética modular para ciclar hacia abajo
            selectedIndex = (selectedIndex + 1) % items.length;
            updateSelection(items, searchInput);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            // Aritmética modular para ciclar hacia arriba
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            updateSelection(items, searchInput);
        } else if (event.key === 'Escape') {
            hideDropdown();
        }
    });

    // Oculta las sugerencias si se hace clic fuera del buscador o del desplegable
    document.addEventListener('click', (event) => {
        if (!searchInput.contains(event.target) && !dropdown.contains(event.target)) {
            hideDropdown();
        }
    });
}

/**
 * Actualiza la clase visual y asigna el valor al campo de texto según la opción seleccionada.
 * @param {NodeListOf<Element>} items - Colección de elementos DOM de sugerencias.
 * @param {HTMLInputElement} input - Elemento input de búsqueda.
 */
function updateSelection(items, input) {
    items.forEach((item, idx) => {
        const isSelected = idx === selectedIndex;
        item.classList.toggle('selected', isSelected);
        if (isSelected) {
            input.value = item.dataset.value;
        }
    });
}

/**
 * Renderiza la lista de sugerencias en el DOM resaltando las coincidencias de texto.
 * @param {string[]} matches - Lista de sugerencias filtradas.
 * @param {string} query - Término de búsqueda ingresado por el usuario.
 * @param {HTMLElement} container - Contenedor lista (<ul>/<ol>) de las sugerencias.
 * @param {HTMLElement} dropdown - Contenedor desplegable principal.
 * @param {HTMLInputElement} input - Campo de entrada de búsqueda.
 */
function renderSuggestions(matches, query, container, dropdown, input) {
    container.innerHTML = '';
    selectedIndex = -1;

    if (matches.length === 0) {
        dropdown.classList.remove('active');
        dropdown.setAttribute('aria-hidden', 'true');
        return;
    }

    const safeQuery = escapeRegExp(query);
    const regex = new RegExp(`(${safeQuery})`, 'gi');

    matches.forEach(text => {
        const li = document.createElement('li');
        li.className = 'suggestion-item';
        li.dataset.value = text;
        
        // Resalta el texto coincidente manteniendo el resto de la cadena
        const highlighted = text.replace(regex, '<strong>$1</strong>');
        li.innerHTML = `<span>🔍</span> <span>${highlighted}</span>`;

        li.addEventListener('click', () => {
            input.value = text;
            dropdown.classList.remove('active');
            dropdown.setAttribute('aria-hidden', 'true');
        });

        container.appendChild(li);
    });

    dropdown.classList.add('active');
    dropdown.setAttribute('aria-hidden', 'false');
}