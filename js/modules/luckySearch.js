/**
 * Módulo para la funcionalidad del botón "Voy a tener suerte".
 * Redirige a sitios conocidos, URLs directas o al primer resultado vía API de DuckDuckGo.
 */

// Mapa de accesos directos para marcas y palabras clave frecuentes
const KNOWN_SITES = {
    'facebook': 'https://www.facebook.com',
    'fb': 'https://www.facebook.com',
    'youtube': 'https://www.youtube.com',
    'yt': 'https://www.youtube.com',
    'instagram': 'https://www.instagram.com',
    'twitter': 'https://www.x.com',
    'x': 'https://www.x.com',
    'github': 'https://www.github.com',
    'linkedin': 'https://www.linkedin.com',
    'gmail': 'https://mail.google.com',
    'whatsapp': 'https://web.whatsapp.com',
    'netflix': 'https://www.netflix.com',
    'amazon': 'https://www.amazon.com',
    'spotify': 'https://open.spotify.com'
};

// Expresión regular para validar formato de dominio web sin espacios
const DOMAIN_REGEX = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i;

/**
 * Inicializa los eventos y la lógica del botón "Voy a tener suerte".
 */
export function initLuckySearch() {
    const btnLucky = document.getElementById('btnLucky');
    if (!btnLucky) return;

    btnLucky.addEventListener('click', async () => {
        const input = document.getElementById('searchInput');
        const rawQuery = input ? input.value.trim() : '';

        // Si la barra está vacía, abre Google Doodles
        if (!rawQuery) {
            window.open('https://doodles.google/', '_blank');
            return;
        }

        // Normalización para remover tildes y caracteres especiales en la búsqueda local
        const query = rawQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // 1. Coincidencia directa con mapa de sitios conocidos
        if (KNOWN_SITES[query]) {
            window.open(KNOWN_SITES[query], '_blank');
            return;
        }

        // 2. Comprobación de URL o Dominio directo (ej: "github.com" o "https://platzi.com")
        if (DOMAIN_REGEX.test(rawQuery)) {
            const formattedUrl = /^https?:\/\//i.test(rawQuery) ? rawQuery : `https://${rawQuery}`;
            window.open(formattedUrl, '_blank');
            return;
        }

        // 3. Consulta asíncrona a la API de desambiguación con timeout de 3.5 segundos
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        try {
            const response = await fetch(
                `https://api.duckduckgo.com/?q=${encodeURIComponent(rawQuery)}&format=json&no_redirect=1&no_html=1`,
                { signal: controller.signal }
            );
            clearTimeout(timeoutId);

            const data = await response.json();

            if (data?.Redirect) {
                window.open(data.Redirect, '_blank');
            } else if (data?.AbstractURL) {
                window.open(data.AbstractURL, '_blank');
            } else {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(rawQuery)}`, '_blank');
            }
        } catch {
            // Fallback a búsqueda convencional de Google ante timeout o error de red
            window.open(`https://www.google.com/search?q=${encodeURIComponent(rawQuery)}`, '_blank');
        }
    });
}