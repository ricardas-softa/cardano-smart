async function fetchAndDisplayVersion() {
    try {
        const response = await fetch('/version');
        if (!response.ok) {
            throw new Error('Failed to fetch version');
        }
        const data = await response.json();
        const versionDisplay = document.getElementById('version-display');
        versionDisplay.textContent = `v${data.version}`;
    } catch (error) {
        console.error('Error fetching version:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchAndDisplayVersion);
