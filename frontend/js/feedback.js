(() => {
    document.addEventListener('DOMContentLoaded', () => {
        const config = window.FEEDBACK_FORM_CONFIG || {};

        const feedbackButton = document.querySelector('.feedback-button');
        const popup = document.getElementById('feedbackPopup');
        const closeButton = document.getElementById('closeFeedback');
        const form = document.getElementById('feedbackForm');
        const status = document.getElementById('feedbackStatus');
        const csmartType = document.getElementById('csmart_use_feedback_type');
        const csmartFeedback = document.getElementById('csmart_use_feedback');
        const csmartSuggestions = document.getElementById('csmart_use_suggestions');
        const botType = document.getElementById('bot_installation_feedback_type');
        const botFeedback = document.getElementById('bot_installation_feedback');
        const botSuggestions = document.getElementById('bot_installation_suggestions');
        const submitButton = form ? form.querySelector('.feedback-submit') : null;
        const cancelButton = form ? form.querySelector('.feedback-cancel') : null;
        const submitFrame = document.getElementById('feedbackSubmitFrame');

        if (!feedbackButton || !popup || !form || !status) {
            return;
        }

    let iframeReady = false;
        if (submitFrame) {
            submitFrame.addEventListener('load', () => {
                if (!iframeReady) {
                    iframeReady = true;
                    return;
                }
                finalizeSuccess();
            });
        }

    function isConfigured() {
        return Boolean(
            config.action &&
            config.fields &&
            config.fields.csmart_use_feedback_type &&
            config.fields.csmart_use_feedback &&
            config.fields.csmart_use_suggestions &&
            config.fields.bot_installation_feedback_type &&
            config.fields.bot_installation_feedback &&
            config.fields.bot_installation_suggestions
        );
    }

    function setStatus(text, type) {
        status.textContent = text;
        status.className = `feedback-status${type ? ` ${type}` : ''}`;
    }

    function openPopup() {
        popup.style.display = 'block';
        setStatus('', '');
    }

    function closePopup() {
        popup.style.display = 'none';
        setStatus('', '');
    }

    function submitToGoogleForm(payload) {
        const formEl = document.createElement('form');
        formEl.method = 'POST';
        formEl.action = config.action;
        formEl.target = 'feedbackSubmitFrame';
        formEl.style.display = 'none';

        Object.entries(payload).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            formEl.appendChild(input);
        });

        document.body.appendChild(formEl);
        formEl.submit();
        formEl.remove();
    }

    function finalizeSuccess() {
        if (submitButton) {
            submitButton.disabled = false;
        }
        setStatus('Thanks! Feedback sent.', 'success');
        form.reset();
        setTimeout(() => {
            closePopup();
        }, 1000);
    }

    function finalizeError(message) {
        if (submitButton) {
            submitButton.disabled = false;
        }
        setStatus(message, 'error');
    }

        feedbackButton.addEventListener('click', () => {
            if (!isConfigured()) {
                setStatus('Feedback is not configured yet.', 'error');
            }
            openPopup();
            if (csmartFeedback) {
                csmartFeedback.focus();
            }
        });

        if (closeButton) {
            closeButton.addEventListener('click', closePopup);
        }

        if (cancelButton) {
            cancelButton.addEventListener('click', closePopup);
        }

        window.addEventListener('click', (event) => {
            if (event.target === popup) {
                closePopup();
            }
        });

        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && popup.style.display === 'block') {
                closePopup();
            }
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!isConfigured()) {
                finalizeError('Feedback is not configured yet.');
                return;
            }

        const csmartFeedbackValue = csmartFeedback ? csmartFeedback.value.trim() : '';
        const csmartSuggestionsValue = csmartSuggestions ? csmartSuggestions.value.trim() : '';
        const botFeedbackValue = botFeedback ? botFeedback.value.trim() : '';
        const botSuggestionsValue = botSuggestions ? botSuggestions.value.trim() : '';

        const hasAnyText =
            csmartFeedbackValue ||
            csmartSuggestionsValue ||
            botFeedbackValue ||
            botSuggestionsValue;

            if (!hasAnyText) {
                finalizeError('Please add feedback or suggestions before sending.');
                return;
            }

            const csmartTypeValue = csmartType ? csmartType.value.trim() : '';
            const botTypeValue = botType ? botType.value.trim() : '';

            if ((csmartFeedbackValue || csmartSuggestionsValue) && !csmartTypeValue) {
                finalizeError('Please select a Cardano Smart Use feedback type.');
                return;
            }

            if ((botFeedbackValue || botSuggestionsValue) && !botTypeValue) {
                finalizeError('Please select a Bot Installation feedback type.');
                return;
            }

        const payload = {};

            if (csmartTypeValue) {
                payload[config.fields.csmart_use_feedback_type] = csmartTypeValue;
            }
        if (csmartFeedbackValue) {
            payload[config.fields.csmart_use_feedback] = csmartFeedbackValue;
        }
        if (csmartSuggestionsValue) {
            payload[config.fields.csmart_use_suggestions] = csmartSuggestionsValue;
        }
            if (botTypeValue) {
                payload[config.fields.bot_installation_feedback_type] = botTypeValue;
            }
        if (botFeedbackValue) {
            payload[config.fields.bot_installation_feedback] = botFeedbackValue;
        }
        if (botSuggestionsValue) {
            payload[config.fields.bot_installation_suggestions] = botSuggestionsValue;
        }

            if (submitButton) {
                submitButton.disabled = true;
            }

            setStatus('Sending...', '');
            submitToGoogleForm(payload);

            if (!submitFrame) {
                setTimeout(() => finalizeSuccess(), 800);
            } else {
                setTimeout(() => {
                    if (submitButton && submitButton.disabled) {
                        finalizeSuccess();
                    }
                }, 2000);
            }
        });
    });
})();
