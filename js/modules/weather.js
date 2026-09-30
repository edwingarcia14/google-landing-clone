/**
 * Módulo para la gestión y visualización de la temperatura y clima actual.
 * Consume la API pública de Open-Meteo para datos meteorológicos y BigDataCloud para geocodificación inversa.
 */

// Coordenadas y ubicación por defecto en caso de no obtener acceso a la geolocalización
const DEFAULT_COORDS = {
    lat: 2.4448,
    lon: -76.6147,
    city: 'Popayán',
    country: 'Colombia'
};

/**
 * Mapea los códigos meteorológicos del estándar WMO (World Meteorological Organization) a emojis representativos.
 * @param {number} wmoCode - Código meteorológico devuelto por Open-Meteo.
 * @param {boolean} isDay - Indica si en la ubicación es de día (true) o de noche (false).
 * @returns {string} Emoji representativo del estado del clima.
 */
function getWeatherIcon(wmoCode, isDay) {
    if (wmoCode === 0) return isDay ? '☀️' : '🌙';
    if ([1, 2, 3].includes(wmoCode)) return isDay ? '⛅' : '☁️';
    if ([45, 48].includes(wmoCode)) return '🌫️';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(wmoCode)) return '🌧️';
    if ([71, 73, 75, 77, 85, 86].includes(wmoCode)) return '❄️';
    if ([95, 96, 99].includes(wmoCode)) return '⛈️';
    return isDay ? '☀️' : '🌙';
}

/**
 * Encapsula la función fetch nativa añadiendo un límite de tiempo (timeout) mediante AbortController.
 * @param {string} resource - URL del recurso a consultar.
 * @param {Object} [options={}] - Opciones de configuración de fetch, incluyendo tiempo de espera en milisegundos.
 * @returns {Promise<Response>} Promesa con la respuesta HTTP.
 */
async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 3000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(resource, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

/**
 * Inicializa el flujo de obtención de clima, consultando geolocalización del usuario o aplicando la ubicación por defecto.
 */
export async function initWeather() {
    const widget = document.getElementById('headerWidget');
    const footerLocation = document.getElementById('footerLocation');

    if (!widget) return;

    const tempEl = widget.querySelector('.widget-temp');
    const iconEl = widget.querySelector('.widget-icon');

    /**
     * Actualiza el texto de ubicación visible en el pie de página.
     * @param {string} locationText - Nombre formateado de la ciudad y país.
     */
    const updateFooterLocation = (locationText) => {
        if (footerLocation) {
            footerLocation.textContent = locationText;
        }
    };

    /**
     * Realiza la petición a Open-Meteo y actualiza los elementos del widget.
     * @param {number} lat - Latitud geográfica.
     * @param {number} lon - Longitud geográfica.
     * @param {string} cityName - Nombre de la ciudad.
     * @param {string} countryName - Nombre del país.
     */
    const fetchWeatherData = async (lat, lon, cityName, countryName) => {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weather_code&timezone=auto`;
            const response = await fetchWithTimeout(url, { timeout: 4000 });

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const data = await response.json();

            if (data?.current && typeof data.current.temperature_2m === 'number') {
                const realTemp = Math.round(data.current.temperature_2m);
                const isDay = data.current.is_day === 1;
                const wmoCode = data.current.weather_code ?? 0;

                tempEl.textContent = `${realTemp}°C`;
                iconEl.textContent = getWeatherIcon(wmoCode, isDay);

                const fullLocation = countryName ? `${cityName}, ${countryName}` : cityName;
                updateFooterLocation(fullLocation);
            } else {
                throw new Error('Estructura de respuesta no válida');
            }
        } catch (error) {
            // Fallback en interfaz ante error de red o timeout
            tempEl.textContent = '--°C';
            iconEl.textContent = '☀️';
            updateFooterLocation(`${DEFAULT_COORDS.city}, ${DEFAULT_COORDS.country}`);
        }
    };

    /**
     * Obtiene el nombre legible de la ciudad y país mediante la latitud y longitud antes de solicitar el clima.
     * @param {number} lat - Latitud geográfica.
     * @param {number} lon - Longitud geográfica.
     */
    const fetchCityNameFromCoords = async (lat, lon) => {
        try {
            const geoRes = await fetchWithTimeout(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`,
                { timeout: 3000 }
            );

            if (!geoRes.ok) throw new Error('Error de geocodificación');

            const geoData = await geoRes.json();
            const city = geoData.city || geoData.locality || geoData.principalSubdivision || DEFAULT_COORDS.city;
            const country = geoData.countryName || DEFAULT_COORDS.country;

            fetchWeatherData(lat, lon, city, country);
        } catch {
            fetchWeatherData(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon, DEFAULT_COORDS.city, DEFAULT_COORDS.country);
        }
    };

    // Solicita coordenadas al navegador o utiliza los valores predeterminados
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchCityNameFromCoords(pos.coords.latitude, pos.coords.longitude),
            () => fetchWeatherData(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon, DEFAULT_COORDS.city, DEFAULT_COORDS.country),
            { timeout: 3000, maximumAge: 60000 }
        );
    } else {
        fetchWeatherData(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon, DEFAULT_COORDS.city, DEFAULT_COORDS.country);
    }
}