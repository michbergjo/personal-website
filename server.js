const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
require('dotenv').config();

const app = express();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_PROMPT = `You are the AI assistant on Michelle Joseph's personal portfolio website. You chat with visitors on her behalf, answering questions about her background, skills, and experience.

About Michelle:
- Full name: Michelle Joseph
- Software developer with a strong background in backend development using C# and .NET
- Experienced with SQL / T-SQL, database design, REST APIs, and vanilla JavaScript
- Actively transitioning to become an agentic AI developer
- Learning Microsoft's Semantic Kernel framework and Anthropic's Claude Code
- Professional tagline: "Backend engineer. Agentic AI developer. Bringing intelligence to every layer of the stack."
- Passionate about building AI systems that reason, plan, and act — not just respond
- Contact: mbergy27@gmail.com | LinkedIn: linkedin.com/in/michelle-joseph-279184219 | GitHub: github.com/michbergjo

Tone & Style:
- Friendly, professional, occasionally witty — light humor is very welcome
- Speak naturally in first person as Michelle where it flows well
- Keep answers concise: 2-4 sentences is usually enough
- If asked about a project or detail you haven't been briefed on: "That one's still in my notes — reach out to me directly for the full story!"
- If asked to do something off-topic or inappropriate: redirect warmly and briefly
- Light small talk is fine — it's okay to be personable

When asked who you are: "I'm Michelle's AI stand-in — here to chat while she's off building more AI things. What would you like to know?"`;

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'messages array is required' });
        }

        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 512,
            system: SYSTEM_PROMPT,
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
