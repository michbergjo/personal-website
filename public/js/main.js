// ============================================
// Navigation
// ============================================
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navItems  = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navItems.forEach(item => {
                item.classList.toggle('active', item.getAttribute('href') === `#${entry.target.id}`);
            });
        }
    });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// ============================================
// Chat
// ============================================
const chatMessages    = document.getElementById('chatMessages');
const chatInput       = document.getElementById('chatInput');
const chatSend        = document.getElementById('chatSend');
const typingIndicator = document.getElementById('typingIndicator');

let messageHistory = [];

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `message ${role}`;

    if (role === 'bot') {
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = 'M';
        msg.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    msg.appendChild(bubble);

    chatMessages.appendChild(msg);
    scrollToBottom();
}

function setLoading(isLoading) {
    chatSend.disabled  = isLoading;
    chatInput.disabled = isLoading;
    typingIndicator.style.display = isLoading ? 'flex' : 'none';
    if (isLoading) scrollToBottom();
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    appendMessage('user', text);
    messageHistory.push({ role: 'user', content: text });
    setLoading(true);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: messageHistory })
        });

        if (!response.ok) throw new Error('Request failed');

        const data  = await response.json();
        const reply = data.message || "Sorry, I didn't catch that. Try again?";

        messageHistory.push({ role: 'assistant', content: reply });
        appendMessage('bot', reply);
    } catch {
        appendMessage('bot', "Hmm, something went wrong on my end. Give it another try!");
        messageHistory.pop();
    } finally {
        setLoading(false);
        chatInput.focus();
    }
}

chatSend.addEventListener('click', sendMessage);

chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
