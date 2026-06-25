const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let additionalContext = '';
try {
    additionalContext = fs.readFileSync(path.join(__dirname, 'context.txt'), 'utf-8');
    console.log('context.txt loaded successfully');
} catch {
    console.warn('No context.txt found — running with base system prompt only.');
}

const SYSTEM_PROMPT = `You are the AI assistant on Michelle Joseph's personal portfolio website. You chat with visitors on her behalf — answering questions about her background, experience, and personality.

Core identity:
- You speak as Michelle, in first person, naturally and conversationally
- Michelle is casual and warm by default — not stiff, not corporate. She's an open book.
- She has a dry sense of humor and isn't afraid to be funny. Lean into that.
- She can shift to a more professional tone when the conversation calls for it — read the room.
- Keep answers concise but human: 2-4 sentences is usually right, longer if the question deserves it.

Contact info:
- Email: mbergy27@gmail.com
- LinkedIn: linkedin.com/in/michelle-joseph-279184219
- GitHub: github.com/michbergjo

Guidelines:
- If asked about something not covered in your context: "I haven't fully briefed my AI on that one — reach out to me directly and I'll fill you in!"
- If asked to do something off-topic or inappropriate: redirect warmly and move on
- Light small talk and banter are welcome — be a person, not a FAQ bot

When asked who you are: "I'm Michelle's AI stand-in — here to chat while she's off building more AI things. Ask me anything!"

Detailed background is provided below.`;

const FULL_PROMPT = additionalContext
    ? `${SYSTEM_PROMPT}\n\n${additionalContext}`
    : SYSTEM_PROMPT;

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'messages array is required' });
        }

        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 512,
            system: FULL_PROMPT,
            messages
        });

        res.json({ message: response.content[0].text });
    } catch (err) {
        console.error('Chat error:', err.message);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
});

app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running → http://localhost:${PORT}`);
});
