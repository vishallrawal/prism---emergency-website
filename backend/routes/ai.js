const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
router.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required.' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash-lite'];

    for (const model of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{
                  text: `You are PRISM Safety AI, an emergency response assistant for Surat city, India.
Provide:
- First aid guidance (CPR, bleeding, burns, etc.)
- Emergency helpline numbers (Police: 112, Ambulance: 108, Fire: 101, Women: 1091)
- Safety tips and emergency protocols
Keep responses concise, clear, and action-oriented. Always prioritize emergency calls when life is at risk.`
                }]
              },
              contents: [{ parts: [{ text: message }] }]
            })
          }
        );

        const data = await response.json();

        if (response.ok && data.candidates && data.candidates.length > 0) {
          const candidate = data.candidates[0];
          const textPart = candidate.content?.parts?.find(p => p.text && !p.thoughtSignature)?.text
            || candidate.content?.parts?.[0]?.text;

          if (textPart) {
            return res.json({ reply: textPart });
          }
        } else {
          console.warn(`Gemini model ${model} response not ok:`, data.error?.message || data);
        }
      } catch (err) {
        console.error(`Gemini model ${model} error:`, err.message);
      }
    }
  }
  const lower = message.toLowerCase();
  let reply = 'PRISM AI: For immediate emergencies, call 108 (Ambulance) or 112 (Police). Stay safe!';

  if (lower.includes('cpr') || lower.includes('heart')) {
    reply = '🫀 CPR Steps:\n1. Call 108 immediately\n2. Push hard & fast (100-120/min) on center of chest\n3. Tilt head back, lift chin\n4. Give 2 rescue breaths every 30 compressions\n5. Continue until help arrives';
  } else if (lower.includes('bleed') || lower.includes('blood')) {
    reply = '🩸 Severe Bleeding:\n1. Apply direct pressure with clean cloth\n2. Do NOT remove cloth - add more on top\n3. Elevate injured limb above heart\n4. Call 108 immediately';
  } else if (lower.includes('fire') || lower.includes('burn')) {
    reply = '🔥 Fire/Burns:\n1. Get out immediately\n2. Stay low under smoke\n3. Call 101 (Fire Brigade)\n4. Cool burns with water 10-15 mins';
  } else if (lower.includes('help') || lower.includes('emergency')) {
    reply = '🆘 Emergency Helplines - Surat:\n• Police: 112\n• Ambulance: 108\n• Fire Brigade: 101\n• Women Helpline: 1091';
  }

  return res.json({ reply });
});

module.exports = router;