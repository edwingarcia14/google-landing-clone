/**
 * Módulo para la gestión, persistencia y alternancia del tema (Claro / Oscuro).
 */
const TEMA_KEY = 'google_clone_theme';

/**
 * Inicializa el tema cargando la preferencia guardada o detectando la configuración del sistema.
 */
export function initTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem(TEMA_KEY);

    // Prioriza la preferencia guardada; en su ausencia, adopta la configuración del SO
    const isDark = savedTheme ? savedTheme === 'dark' : mediaQuery.matches;

    applyTheme(isDark);

    // Escucha cambios en las preferencias del SO únicamente si el usuario no ha forzado un tema manual
    mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem(TEMA_KEY)) {
            applyTheme(e.matches);
        }
    });
}

/**
 * Alterna entre el tema claro y oscuro actualizando la UI y guardando la selección en localStorage.
 */
export function toggleTheme() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const newStatus = !isDarkMode;

    applyTheme(newStatus);
    localStorage.setItem(TEMA_KEY, newStatus ? 'dark' : 'light');
}

/**
 * Aplica la clase CSS correspondiente al body y actualiza los atributos de accesibilidad en la UI.
 * @param {boolean} isDark - Determina si se aplica el tema oscuro.
 */
function applyTheme(isDark) {
    document.body.classList.toggle('dark-mode', isDark);

    const btnToggleTheme = document.getElementById('btnToggleTheme');
    if (btnToggleTheme) {
        btnToggleTheme.textContent = `Modo Oscuro: ${isDark ? 'On' : 'Off'}`;
        // Actualiza el atributo aria-pressed para lectores de pantalla
        btnToggleTheme.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    }
}