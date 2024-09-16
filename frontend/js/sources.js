const isLocalMode = new URLSearchParams(window.location.search).get('mode') === 'local';

function openTab(evt, tabName) {
    var i, tabContent, tabButtons;
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    tabButtons = document.getElementsByClassName("tab-button");
    for (i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    if (tabName === 'imported-files') {
        fetchScrapingReport();
    }
}

async function fetchScrapingReport() {
    try {
        let report;
        if (isLocalMode) {
            // In local mode, fetch the report from a local file
            const response = await fetch('/report.json');
            if (!response.ok) {
                throw new Error('Failed to fetch local scraping report');
            }
            report = await response.json();
        } else {
            // In production mode, fetch from the server endpoint
            const response = await fetch('/scraping-report');
            if (!response.ok) {
                throw new Error('Failed to fetch scraping report');
            }
            report = await response.json();
        }
        displayScrapingReport(report);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('report-content').textContent = 'Failed to load scraping report.';
    }
}

function displayScrapingReport(report) {
    const reportContent = document.getElementById('report-content');
    const utcTimestamp = new Date(report.timestamp).toUTCString();
    reportContent.innerHTML = `
        <p><strong>Timestamp (UTC):</strong> ${utcTimestamp}</p>
        <div class="report-item">
            <h3>New Files:</h3>
            <ul>${report.new_files.map(file => `<li>${file}</li>`).join('') || '<li>None</li>'}</ul>
        </div>
        <div class="report-item">
            <h3>Deleted Files:</h3>
            <ul>${report.deleted_files.map(file => `<li>${file}</li>`).join('') || '<li>None</li>'}</ul>
        </div>
        <div class="report-item">
            <h3>Changed Files:</h3>
            <ul>${report.changed_files.map(file => `<li>${file}</li>`).join('') || '<li>None</li>'}</ul>
        </div>
    `;
}

// Initialize the page with the first tab open
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.tab-button').click();
});

// Add this at the end of the file
if (isLocalMode) {
    console.log('Running in local mode');
    document.body.classList.add('local-mode');
}
