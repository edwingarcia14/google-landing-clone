/**
 * Módulo para la búsqueda por voz mediante la Web Speech API nativa.
 */
export function initVoiceSearch() {
    const btnVoice = document.getElementById('btnVoiceSearch');
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.getElementById('searchForm');

    if (!btnVoice || !searchInput) return;

    // Verificación de compatibilidad con la API nativa de reconocimiento de voz
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        btnVoice.addEventListener('click', () => {
            alert('Tu navegador no soporta el reconocimiento de voz.');
        });
        return;
    }

    const recognition = new SpeechRecognition();
    // Configuración regional para optimizar la precisión en español
    recognition.lang = 'es-CO';
    recognition.continuous = false;
    recognition.interimResults = false;

    let isListening = false;

    /**
     * Actualiza el estado visual y los atributos de accesibilidad del botón.
     * @param {boolean} listening - Indica si el micrófono está capturando audio.
     */
    const setListeningState = (listening) => {
        isListening = listening;
        btnVoice.classList.toggle('listening', listening);
        btnVoice.setAttribute(
            'aria-label',
            listening ? 'Escuchando... Haz clic para cancelar' : 'Búsqueda por voz'
        );
    };

    btnVoice.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            try {
                recognition.start();
                setListeningState(true);
            } catch (err) {
                setListeningState(false);
            }
        }
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        setListeningState(false);

        // Envía el formulario disparando el evento submit nativo y sus validaciones
        if (searchForm) {
            searchForm.requestSubmit();
        }
    };

    recognition.onerror = (event) => {
        setListeningState(false);
        if (event.error === 'not-allowed') {
            alert('El acceso al micrófono fue denegado.');
        }
    };

    recognition.onend = () => {
        setListeningState(false);
    };
}