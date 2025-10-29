let chatHistory = []; // Global array to hold the conversation history

let codeBlockMarkCount = 0; // Global variable to keep track of the number of code block markers

let continuationStack = []; // Global array to keep track of continuation messages

let useContext = true; // Always use context

if (window.marked) {
    marked.setOptions({
        breaks: true,
        gfm: true
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const referencesButton = document.querySelector('.references-button');
    const referencesPopup = document.getElementById('referencesPopup');
    const closeReferencesButton = document.getElementById('closeReferences');

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

            if (response.status >= 500) {
                showFriendlyError();
            }

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

        const renderedContent = renderMarkdown(botMessageContent);
        const botResponse = document.createElement("div");
        botResponse.className = "bot-response";
        const icon = document.createElement("i");
        icon.className = "fa-solid fa-robot";
        const messageSpan = document.createElement("span");
        messageSpan.className = "message-content";
        messageSpan.appendChild(renderedContent);
        botResponse.appendChild(icon);
        botResponse.appendChild(messageSpan);

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
        if (spinner.parentNode) {
            spinner.textContent = "Error fetching response.";
        } else {
            const errorDiv = document.createElement("div");
            errorDiv.className = "error-message";
            errorDiv.textContent = "Error fetching response: " + error.message;
            chatFeed.appendChild(errorDiv);
        }
    } finally {
        hideThinkingIndicator();
    }
}

function showFriendlyError() {
    const chatFeed = document.getElementById("chatFeed");

    // Remove spinner if still present
    const spinner = chatFeed.querySelector(".spinner");
    if (spinner) {
        chatFeed.removeChild(spinner);
    }

    hideThinkingIndicator();

    const botResponse = document.createElement("div");
    botResponse.className = "bot-response";
    botResponse.innerHTML = `<i class="fa-solid fa-robot"></i><span class="message-content">Sorry, something went wrong. Please try again shortly.</span>`;
    chatFeed.appendChild(botResponse);
    chatFeed.scrollTo({
        top: chatFeed.scrollHeight,
        behavior: 'smooth'
    });
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
    const messageElement = document.createElement("div");

    if (role === "user") {
        messageElement.classList.add("user-message");
        messageElement.innerHTML = `<i class="fa-solid fa-user"></i><span class="message-content">${content}</span>`;
    } else if (role === "assistant") {
        messageElement.classList.add("bot-response");
        messageElement.innerHTML = `<i class="fa-solid fa-robot"></i><span class="message-content">${content}</span>`;
    }

    chatFeed.appendChild(messageElement);
    
    chatFeed.scrollTop = chatFeed.scrollHeight;
}

function renderMarkdown(markdown) {
    const container = document.createElement('div');

    if (window.marked) {
        container.innerHTML = marked.parse(markdown);
    } else {
        container.innerHTML = markdown.replace(/\n/g, '<br>');
    }

    transformThinkingTags(container);
    enhanceCodeBlocks(container);

    const fragment = document.createDocumentFragment();
    while (container.firstChild) {
        fragment.appendChild(container.firstChild);
    }

    return fragment;
}

function transformThinkingTags(root) {
    root.querySelectorAll('think').forEach((thinkEl) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'thinking-process';

        const header = document.createElement('div');
        header.className = 'thinking-header';

        const label = document.createElement('span');
        label.textContent = '💭 Thinking Process';

        const toggleButton = document.createElement('button');
        toggleButton.className = 'toggle-thinking';
        toggleButton.textContent = '▼';

        header.appendChild(label);
        header.appendChild(toggleButton);

        const content = document.createElement('div');
        content.className = 'thinking-content';

        while (thinkEl.firstChild) {
            content.appendChild(thinkEl.firstChild);
        }

        wrapper.appendChild(header);
        wrapper.appendChild(content);
        thinkEl.replaceWith(wrapper);
    });
}

function enhanceCodeBlocks(root) {
    root.querySelectorAll('pre code').forEach((codeBlock) => {
        const pre = codeBlock.parentElement;
        const languageClass = Array.from(codeBlock.classList).find((cls) => cls.startsWith('language-'));
        const languageLabel = languageClass ? languageClass.replace('language-', '') : null;
        const codeText = codeBlock.textContent;

        const container = document.createElement('div');
        container.className = 'code-container';

        const header = document.createElement('div');
        header.className = 'code-header';

        const title = document.createElement('span');
        title.textContent = languageLabel ? `Language: ${languageLabel.toUpperCase()}` : 'Code';

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.type = 'button';
        copyButton.textContent = 'Copy code';
        copyButton.addEventListener('click', () => copyToClipboard(codeText));

        header.appendChild(title);
        header.appendChild(copyButton);

        pre.parentNode.replaceChild(container, pre);
        container.appendChild(header);
        container.appendChild(pre);
    });
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
