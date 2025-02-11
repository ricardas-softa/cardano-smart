let chatHistory = []; // Global array to hold the conversation history

let codeBlockMarkCount = 0; // Global variable to keep track of the number of code block markers

let continuationStack = []; // Global array to keep track of continuation messages

let useContext = true; // Global variable to track context usage

document.addEventListener('DOMContentLoaded', () => {
    const useContextCheckbox = document.getElementById('useContext');
    const referencesButton = document.querySelector('.references-button');
    const referencesPopup = document.getElementById('referencesPopup');
    const closeReferencesButton = document.getElementById('closeReferences');

    useContextCheckbox.addEventListener('change', (event) => {
        useContext = event.target.checked;
    });

    referencesButton.addEventListener('click', () => {
        referencesPopup.style.display = 'block';
        updateReferencesPopup();
    });

    closeReferencesButton.addEventListener('click', () => {
        referencesPopup.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === referencesPopup) {
            referencesPopup.style.display = 'none';
        }
    });
});

document.getElementById("questionForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const questionInput = document.getElementById("questionInput");
    const question = questionInput.value;
    questionInput.value = '';

    chatHistory.push({ role: "user", content: question });

    sendMessageToModel();
});

function copyToClipboard(textToCopy) {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    document.body.appendChild(textarea);
    
    // Select the text and copy it to the clipboard
    textarea.select();
    document.execCommand('copy');
    
    // Remove the temporary textarea element
    document.body.removeChild(textarea);
}

function createContinueButton() {
    const continueButton = document.createElement("button");
    continueButton.textContent = "Continue";
    continueButton.className = "continue-button";
    continueButton.onclick = continueConversation; // Attach the event handler
    return continueButton;
}

function continueConversation() {
    const continueButton = document.querySelector(".continue-button");
    continueButton.remove();
    continuationStack.push(chatHistory.length - 1);
    chatHistory.push({ role: "user", content: "continue" });
    sendMessageToModel(true);
}

function responseIsIncomplete(messageContent) {
    return messageContent && !messageContent.trim().endsWith('.');
}

async function sendMessageToModel(isContinuation = false) {
    showThinkingIndicator();
    
    const question = chatHistory[chatHistory.length - 1];
    if (question && question.role !== "system" && question.content !== "continue")  {
        appendMessage(question.role, ` ${question.content}`);
        await fetchContext(question.content);  // Wait for context to be fetched
    }

    const spinner = document.createElement("div");
    spinner.className = "spinner";
    chatFeed.appendChild(spinner);
    chatFeed.scrollTop = chatFeed.scrollHeight;

    try {
        const response = await fetch("/ask", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages: chatHistory, use_context: useContext })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        chatFeed.removeChild(spinner);

        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            chatHistory.push({
                role: "assistant",
                content: data.choices[0].message.content
            });
        }

        let botMessageContent = data.choices[0].message.content;

        if (isContinuation) {
            if (codeBlockMarkCount % 2 === 1) {
                chatFeed.removeChild(chatFeed.lastChild);
            }
        }

        codeBlockMarkCount += (botMessageContent.match(/```/g) || []).length;

        if (codeBlockMarkCount % 2 === 1 && !botMessageContent.trim().endsWith("```")) {
            botMessageContent += "\n```"; // Append closing backticks to the last code block
        }

        if (isContinuation) {
            joinedContinuationMessages = continuationStack.map(index => chatHistory[index].content).join("");
            botMessageContent = `${joinedContinuationMessages}${botMessageContent}`;
        }

        botMessageContent = botMessageContent.replace(/(```[\s\S]*?```)|\n/g, (match, codeBlock) => {
            return codeBlock ? codeBlock : '<br>';
        });

        botMessageContent = botMessageContent.replace(/```(\w+)?\n(.*?)```/gs, (match, lang, code) => {
            if (lang) {
                return `
                    <div class="code-container">
                        <div class="code-header">
                            Language: ${lang.toUpperCase()}
                            <button class="copy-button" onclick="copyToClipboard(atob('${btoa(code.trim())}'))">Copy code</button>
                        </div>
                        <pre><code class="language-${lang}">${code.trim()}</code></pre>
                    </div>
                `;
            } else {
                // If no language is recognized, do not include the language header
                return `
                    <div class="code-container">
                        <div class="code-header">
                            <button class="copy-button" onclick="copyToClipboard(atob('${btoa(code.trim())}'))">Copy code</button>
                        </div>
                        <pre><code>${code.trim()}</code></pre>
                    </div>
                `;
            }
        });

        botMessageContent = markdownToHTML(botMessageContent);
        const botResponse = document.createElement("div");
        botResponse.className = "bot-response";
        botResponse.innerHTML = `<i class="fa-solid fa-robot"></i> ${botMessageContent}`;

        chatFeed.appendChild(botResponse);
        chatFeed.scrollTo({
            top: chatFeed.scrollHeight,
            behavior: 'smooth'
        });

        stopEmittingTexts();

        // Apply syntax highlighting
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });

        if (data.choices && data.choices.length > 0 && data.choices[0].sources) {
            updateReferences(data.choices[0].sources);
        } else {
            updateReferences([]);
        }
    } catch (error) {
        console.error('Error:', error);
        spinner.textContent = "Error fetching response.";
    } finally {
        hideThinkingIndicator();
    }
}

async function fetchContext(text) {
    const chatFeed = document.getElementById("chatFeed");

    try {
        const response = await fetch("/context", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const contextTexts = data.data.map(chunk => chunk.text);

        // Start emitting texts with the actual context
        startEmittingTexts(contextTexts);

        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

function appendMessage(role, content) {
    const chatFeed = document.getElementById("chatFeed");
    const messageElement = document.createElement("p");
    const iconSpan = document.createElement("span");
    iconSpan.classList.add("icon");

    if (role === "user") {
        iconSpan.innerHTML = '<i class="fa-solid fa-user"></i>';
        messageElement.classList.add("user-message");
    } else if (role === "assistant") {
        iconSpan.innerHTML = '<i class="fa-solid fa-robot"></i>';
    }

    messageElement.appendChild(iconSpan);
    messageElement.innerHTML += "&nbsp;"+content;
    chatFeed.appendChild(messageElement);
    
    chatFeed.scrollTop = chatFeed.scrollHeight;
}

function markdownToHTML(text) {
    // Update think tag handling to include a toggle button
    text = text.replace(/<think>([\s\S]*?)<\/think>/g, 
        '<div class="thinking-process">' +
            '<div class="thinking-header">' +
                '<span>💭 Thinking Process</span>' +
                '<button class="toggle-thinking">▼</button>' +
            '</div>' +
            '<div class="thinking-content">$1</div>' +
        '</div>'
    );

    text = text.replace(/^(\#{1,6})\s+(.*)$/gm, function(_, hashes, content) {
        return `<h${hashes.length}>${content}</h${hashes.length}>`;
    });

    // Convert bold (**text** or __text__)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Convert italic (*text* or _text_)
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');

    // Convert links ([text](url))
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

    // Convert inline code (`code`)
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');

    // Convert code blocks (```code```)
    text = text.replace(/```([\s\S]*?)```/gm, '<pre><code>$1</code></pre>');

    // Convert lists (unordered and ordered)
    text = text.replace(/^\s*\*\s+(.*)$/gm, '<ul><li>$1</li></ul>');
    text = text.replace(/^\s*\d+\.\s+(.*)$/gm, '<ol><li>$1</li></ol>');
    text = text.replace(/<\/(ul|ol)>\s*<\1>/g, ''); // Fix repeated tags due to multiple lines

    return text;
}


function containsMarkdown(text) {
    const patterns = [
        /\#{1,6}\s/,          // Headers
        /\*\*.*?\*\*/s,       // Bold
        /__.*?__/s,           // Bold
        /\*.*?\*/s,           // Italic
        /_.*?_/s,             // Italic
        /\[.*?\]\(.*?\)/,     // Links
        /^\s*[\-\*]\s/m,      // Unordered lists
        /^\s*\d+\.\s/m,       // Ordered lists
        /`{3}.*?`{3}/s,       // Fenced code blocks
        /`.*?`/s              // Inline code
    ];

    let matchCount = patterns.reduce((acc, pattern) => acc + (pattern.test(text) ? 1 : 0), 0);

    // Check if two or more markdown features are detected
    return matchCount >= 2;
}

function showThinkingIndicator() {
    const indicator = document.querySelector('.thinking-indicator');
    indicator.classList.add('visible');
}

function hideThinkingIndicator() {
    const indicator = document.querySelector('.thinking-indicator');
    indicator.classList.remove('visible');
}

function updateReferences(references) {
    currentReferences = references;
    const sourceList = document.getElementById("sourceList");
    sourceList.innerHTML = ""; // Clear existing list items

    if (references.length > 0) {
        references.forEach(source => {
            if (source.document && source.document.doc_metadata) {
                const li = document.createElement("li");
                const fileName = source.document.doc_metadata.file_name;
                const excerpt = source.text;
                const sourceUrl = source.source_url || '#';

                li.innerHTML = `
                    <strong>${fileName}</strong>
                    <div class="source-content">${excerpt}</div>
                    <a href="${sourceUrl}" target="_blank" class="source-link">View Source</a>
                `;
                sourceList.appendChild(li);
            }
        });
    } else {
        sourceList.innerHTML = '<li>No references available</li>';
    }
}

function updateReferencesPopup() {
    const popupSourceList = document.getElementById('popupSourceList');
    popupSourceList.innerHTML = ''; // Clear existing content

    if (currentReferences.length > 0) {
        currentReferences.forEach(source => {
            if (source.document && source.document.doc_metadata) {
                const li = document.createElement('li');
                const fileName = source.document.doc_metadata.file_name;
                const excerpt = source.text;
                const sourceUrl = source.source_url || '#';

                li.innerHTML = `
                    <strong>${fileName}</strong>
                    <div class="source-content">${excerpt}</div>
                    <a href="${sourceUrl}" target="_blank" class="source-link">View Source</a>
                `;
                popupSourceList.appendChild(li);
            }
        });
    } else {
        popupSourceList.innerHTML = '<li>No references available</li>';
    }
}

let currentReferences = [];

// Add this new function at the end of the file
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('toggle-thinking')) {
        const content = e.target.closest('.thinking-process').querySelector('.thinking-content');
        const isCollapsed = content.style.display === 'none';
        
        content.style.display = isCollapsed ? 'block' : 'none';
        e.target.textContent = isCollapsed ? '▼' : '▶';
    }
});