// Alternative polling-based implementation for long-running requests

async function sendMessageWithPolling(chatHistory, useContext) {
    // Start the request and get a job ID
    const startResponse = await fetch("/ask-async", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            messages: chatHistory, 
            use_context: useContext,
            async: true 
        })
    });
    
    if (!startResponse.ok) {
        throw new Error(`HTTP error! status: ${startResponse.status}`);
    }
    
    const { jobId } = await startResponse.json();
    
    // Poll for the result
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes with 5-second intervals
    
    while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        
        const pollResponse = await fetch(`/ask-result/${jobId}`);
        
        if (pollResponse.ok) {
            const result = await pollResponse.json();
            
            if (result.status === 'completed') {
                return result.data;
            } else if (result.status === 'failed') {
                throw new Error(result.error || 'Request failed');
            }
            // If still processing, continue polling
        }
        
        attempts++;
    }
    
    throw new Error('Request timed out after 10 minutes');
}

// Export for use in main chat.js
window.sendMessageWithPolling = sendMessageWithPolling; 