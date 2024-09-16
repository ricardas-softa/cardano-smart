let emittingTexts = false;
let emitInterval;

function emitText(text) {
    const textElement = document.createElement('div');
    const container = document.getElementById('header-container');
    textElement.classList.add('drift-text', 'fade-out');
    textElement.textContent = text;
    textElement.style.left = `${Math.random() * 80}%`;
    container.appendChild(textElement);

    textElement.addEventListener('animationend', () => textElement.remove());
}

function startEmittingTexts(contextTexts) {
    if (emittingTexts) return;
    emittingTexts = true;
    emitInterval = setInterval(() => {
        if (!emittingTexts) {
            clearInterval(emitInterval);
            return;
        }
        const randomIndex = Math.floor(Math.random() * contextTexts.length);
        emitText(contextTexts[randomIndex]);
    }, 1000);
}

function stopEmittingTexts() {
    emittingTexts = false;
    clearInterval(emitInterval);
}

// Export these functions so they can be used in other scripts
window.startEmittingTexts = startEmittingTexts;
window.stopEmittingTexts = stopEmittingTexts;