/**
 * Módulo para la gestión, accesibilidad y eventos del modal de Google Lens.
 */
export function initLensModal() {
    const lensBtn = document.getElementById('btnLensSearch');
    const modal = document.getElementById('lensModal');
    const closeBtn = document.getElementById('btnCloseLens');
    const dropArea = document.getElementById('dragDropArea');
    const urlInput = document.getElementById('lensUrlInput');

    if (!lensBtn || !modal) return;

    /**
     * Muestra el modal de Lens y enfoca la entrada de URL.
     */
    const openModal = () => {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        if (urlInput) urlInput.focus();
    };

    /**
     * Oculta el modal de Lens y devuelve el foco al botón disparador.
     */
    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        lensBtn.focus();
    };

    lensBtn.addEventListener('click', openModal);

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Cierra el modal al hacer clic en el área oscura de fondo (backdrop)
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Cierra el modal mediante la tecla Escape
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // --- Gestión de la zona de arrastre (Drag & Drop) ---
    if (dropArea) {
        // Prevención de comportamientos por defecto del navegador al arrastrar archivos
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropArea.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropArea.classList.remove('drag-over');
            });
        });

        // Procesamiento de la imagen soltada en el área objetivo
        dropArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    // Redirige al portal de Google Lens para completar la búsqueda visual
                    window.open('https://lens.google.com/', '_blank');
                    closeModal();
                } else {
                    alert('Por favor, arrastra un archivo de imagen válido.');
                }
            }
        });
    }

    // --- Procesamiento de búsqueda mediante URL de imagen ---
    if (urlInput) {
        urlInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const imageUrl = urlInput.value.trim();
                if (imageUrl) {
                    window.open(`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`, '_blank');
                    urlInput.value = '';
                    closeModal();
                }
            }
        });
    }
}