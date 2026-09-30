/**
 * Módulo para la gestión y control de menús desplegables (Apps y Perfil).
 */
export function initPopovers() {
    const popoverMappings = [
        { triggerId: 'btnAppsMenu', targetId: 'appsPopover' },
        { triggerId: 'btnProfileMenu', targetId: 'profilePopover' }
    ];

    // Filtra y valida los pares de botones y sus respectivos popovers existentes en el DOM
    const pairs = popoverMappings
        .map(({ triggerId, targetId }) => ({
            button: document.getElementById(triggerId),
            popover: document.getElementById(targetId)
        }))
        .filter(item => item.button && item.popover);

    if (pairs.length === 0) return;

    /**
     * Cierra todos los desplegables activos y sincroniza los estados de accesibilidad (ARIA).
     */
    const closeAllPopovers = () => {
        pairs.forEach(({ button, popover }) => {
            popover.classList.remove('active');
            popover.setAttribute('aria-hidden', 'true');
            button.setAttribute('aria-expanded', 'false');
        });
    };

    pairs.forEach(({ button, popover }) => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();

            const isCurrentlyActive = popover.classList.contains('active');

            // Garantiza que solo un popover permanezca abierto a la vez
            closeAllPopovers();

            if (!isCurrentlyActive) {
                popover.classList.add('active');
                popover.setAttribute('aria-hidden', 'false');
                button.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // Cierra cualquier desplegable activo al hacer clic fuera del área del botón o popover
    document.addEventListener('click', (event) => {
        const isClickInsideAnyPopover = pairs.some(({ button, popover }) => 
            button.contains(event.target) || popover.contains(event.target)
        );

        if (!isClickInsideAnyPopover) {
            closeAllPopovers();
        }
    });

    // Cierra desplegables con la tecla Escape y devuelve el foco al botón disparador
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const activePair = pairs.find(({ popover }) => popover.classList.contains('active'));
            if (activePair) {
                closeAllPopovers();
                activePair.button.focus();
            }
        }
    });
}