let emittingTexts = true;

function emitText(text) {
    const textElement = document.createElement('div');
    const container = document.getElementById('header-container');
    textElement.classList.add('drift-text', 'fade-out');
    textElement.textContent = text;
    textElement.style.left = `${Math.random() * 100}%`;
    textElement.style.animationDuration = `${Math.random() * 10 + 5}s`;
    textElement.style.fontSize = `${Math.random() * 10 + 14}px`;
    container.appendChild(textElement);

    textElement.addEventListener('animationend', () => textElement.remove());
}

function startEmittingTexts(contextTexts) {
    emittingTexts = true;
    const emitInterval = setInterval(() => {
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
}