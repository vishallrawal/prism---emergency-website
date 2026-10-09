import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am PRISM Emergency AI Assistant for Surat City. How can I assist you with first-aid instructions, helpline numbers, or emergency safety protocols today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const newMsgs = [...messages, { sender: 'user', text: query }];
    setMessages(newMsgs);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: query })
      });

      const data = await res.json();
      setMessages([...newMsgs, { sender: 'bot', text: data.reply || 'PRISM AI: Call 108 for immediate medical emergency.' }]);
    } catch (err) {
      setMessages([...newMsgs, { sender: 'bot', text: 'PRISM AI: For immediate life-threatening emergencies in Surat, please call 108 (Ambulance) or 112 (Police).' }]);
    } finally {
      setLoading(false);
    }
  };
  const handleSpeak = (text, index) => {
    if (!('speechSynthesis' in window)) return;

    if (playingIndex === index) {
      window.speechSynthesis.cancel();
      setPlayingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.onend = () => setPlayingIndex(null);
    utterance.onerror = () => setPlayingIndex(null);
    setPlayingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content">
        <div className="chat-container">
          <div className="sidebar">
            <div className="sidebar-title">
              <i className="fa-solid fa-bolt"></i> Emergency Quick Prompts
            </div>

            <div className="quick-prompts">
              <button className="prompt-btn" onClick={() => handleSend('How to perform CPR on an adult?')}>
                <i className="fa-solid fa-heart-pulse"></i> CPR Instructions
              </button>
              <button className="prompt-btn" onClick={() => handleSend('How to control severe bleeding?')}>
                <i className="fa-solid fa-bandage"></i> Severe Bleeding First Aid
              </button>
              <button className="prompt-btn" onClick={() => handleSend('Surat emergency helpline numbers list')}>
                <i className="fa-solid fa-phone"></i> Surat Helplines
              </button>
              <button className="prompt-btn" onClick={() => handleSend('Fire safety & evacuation rules')}>
                <i className="fa-solid fa-fire"></i> Fire Safety Rules
              </button>
            </div>

            <div className="info-card">
              <i className="fa-solid fa-shield-cat" style={{ color: '#38bdf8' }}></i> <strong>Gemini AI</strong> powers this assistant. Voice playback uses your browser's speech engine. Always call 108 or 112 directly during life-threatening events.
            </div>
          </div>

          <div className="chat-panel">
            <div className="chat-header">
              <div className="chat-header-title">
                <i className="fa-solid fa-robot" style={{ color: '#38bdf8' }}></i> PRISM AI Response Center
              </div>
              <div className="status-badge">
                <div className="pulse-dot"></div> Active &amp; Monitoring
              </div>
            </div>

            <div className="messages-box">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  <div className={`avatar ${msg.sender}`}>
                    <i className={`fa-solid ${msg.sender === 'bot' ? 'fa-robot' : 'fa-user'}`}></i>
                  </div>
                  <div className="bubble-wrapper">
                    <div className="bubble" style={{ whiteSpace: 'pre-line' }}>
                      {msg.text}
                    </div>
                    {msg.sender === 'bot' && (
                      <button 
                        className={`btn-tts ${playingIndex === index ? 'playing' : ''}`}
                        onClick={() => handleSpeak(msg.text, index)}
                        title="Read Response Aloud"
                      >
                        <i className={`fa-solid ${playingIndex === index ? 'fa-stop' : 'fa-volume-high'}`}></i>
                        {playingIndex === index ? ' Stop Voice' : ' Listen Voice'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message bot">
                  <div className="avatar bot"><i className="fa-solid fa-robot"></i></div>
                  <div className="bubble">
                    <span className="spinner" style={{ width: '14px', height: '14px' }}></span> PRISM AI is generating guidance...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              <input 
                type="text" 
                className="chat-input" 
                placeholder="Ask PRISM AI anything about first aid or emergency safety..." 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
              />
              <button className="btn-send" onClick={() => handleSend()} disabled={loading}>
                <i className="fa-solid fa-paper-plane"></i> Send
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .chat-container { padding: 24px 40px; display: grid; grid-template-columns: 320px 1fr; gap: 24px; }
        .sidebar { background: #0c1220; border: 1px solid #162035; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
        .sidebar-title { font-size: 14px; font-weight: 800; color: #38bdf8; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }

        .quick-prompts { display: flex; flex-direction: column; gap: 10px; }
        .prompt-btn { background: #060913; border: 1px solid #1e2c45; color: #cbd5e1; padding: 12px; border-radius: 8px; font-size: 12px; font-weight: 600; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 10px; }
        .prompt-btn:hover { border-color: #38bdf8; color: #ffffff; background: #121929; }
        .prompt-btn i { color: #38bdf8; font-size: 14px; }

        .info-card { background: rgba(56, 189, 248, 0.05); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 10px; padding: 14px; font-size: 11px; color: #94a3b8; line-height: 1.5; margin-top: auto; }

        .chat-panel { background: #0c1220; border: 1px solid #162035; border-radius: 14px; display: flex; flex-direction: column; height: 580px; overflow: hidden; }
        .chat-header { padding: 16px 24px; background: #080d1a; border-bottom: 1px solid #162035; display: flex; justify-content: space-between; align-items: center; }
        .chat-header-title { font-size: 16px; font-weight: 800; display: flex; align-items: center; gap: 10px; }

        .status-badge { font-size: 11px; font-weight: 700; color: #34d399; background: rgba(52, 211, 153, 0.1); padding: 4px 10px; border-radius: 20px; display: flex; align-items: center; gap: 6px; }
        .pulse-dot { width: 6px; height: 6px; background: #34d399; border-radius: 50%; box-shadow: 0 0 6px #34d399; }

        .messages-box { padding: 24px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
        .message { display: flex; gap: 12px; max-width: 85%; }
        .message.bot { align-self: flex-start; }
        .message.user { align-self: flex-end; flex-direction: row-reverse; }

        .avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 14px; flex-shrink: 0; }
        .avatar.bot { background: rgba(56, 189, 248, 0.1); border: 1px solid #38bdf8; color: #38bdf8; }
        .avatar.user { background: rgba(230, 46, 46, 0.1); border: 1px solid #e62e2e; color: #e62e2e; }

        .bubble-wrapper { display: flex; flex-direction: column; gap: 6px; }
        .bubble { padding: 14px 18px; border-radius: 12px; font-size: 13px; line-height: 1.6; }
        .message.bot .bubble { background: #060913; border: 1px solid #1e2c45; color: #e2e8f0; }
        .message.user .bubble { background: #e62e2e; color: #ffffff; }

        .btn-tts { background: transparent; border: 1px solid #1e2c45; color: #38bdf8; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; align-self: flex-start; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease; }
        .btn-tts:hover { background: rgba(56, 189, 248, 0.1); border-color: #38bdf8; }
        .btn-tts.playing { background: rgba(230, 46, 46, 0.2); border-color: #e62e2e; color: #ef4444; }

        .input-area { padding: 16px 24px; background: #080d1a; border-top: 1px solid #162035; display: flex; gap: 12px; }
        .chat-input { flex: 1; background: #060913; border: 1px solid #1e2c45; border-radius: 8px; padding: 12px 16px; color: #ffffff; font-size: 13px; outline: none; }
        .chat-input:focus { border-color: #38bdf8; }

        .btn-send { background: #38bdf8; color: #060913; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 800; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; }

        @media (max-width: 900px) {
          .chat-container { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}