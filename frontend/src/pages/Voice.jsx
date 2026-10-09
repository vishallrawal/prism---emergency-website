import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SERVICES = {
  ambulance: { label: 'Ambulance', number: '108', icon: 'fa-truck-medical', color: '#22c55e' },
  police: { label: 'Police', number: '112', icon: 'fa-user-shield', color: '#60a5fa' },
  fire: { label: 'Fire Brigade', number: '101', icon: 'fa-fire-extinguisher', color: '#fb923c' },
  women: { label: 'Women Helpline', number: '1091', icon: 'fa-person-dress', color: '#f472b6' }
};

const normalise = (value) => value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const has = (text, expressions) => expressions.some((expression) => expression.test(text));

function understandCommand(rawText) {
  const text = normalise(rawText);
  if (!text) return { type: 'unknown' };
  if (has(text, [/\b(stop|cancel|never mind|false alarm|stand down)\b/])) return { type: 'cancel' };
  if (has(text, [/\b(repeat|say that again|again)\b/])) return { type: 'repeat' };

  let service;
  if (has(text, [/\b(ambulance|medical|hospital|injur|hurt|unconscious|heart attack|stroke|bleed)\b/])) service = 'ambulance';
  if (has(text, [/\b(police|crime|attack|assault|robbery|thief|stalk|danger)\b/])) service = 'police';
  if (has(text, [/\b(fire|smoke|burning|gas leak)\b/])) service = 'fire';
  if (has(text, [/\b(women|harass|domestic violence)\b/])) service = 'women';
  if (has(text, [/\b(share|send|text|message)\b.*\b(location|where i am|my place)\b/, /\b(location|where i am|my place)\b.*\b(share|send|text|message)\b/])) return { type: 'share', service };
  if (has(text, [/\b(direction|route|navigate|nearest|nearby|take me)\b/])) return { type: 'directions', service };
  if (has(text, [/\b(call|dial|phone|ring|contact)\b/]) && service) return { type: 'call', service };
  if (service) return { type: 'service', service };
  if (has(text, [/\b(help|emergency|sos|save me)\b/])) return { type: 'help' };
  return { type: 'unknown' };
}

export default function Voice() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('Tap the microphone, then say what you need.');
  const [action, setAction] = useState(null);
  const [status, setStatus] = useState('Ready for a voice command');
  const [copied, setCopied] = useState('');
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const lastCommandRef = useRef('');
  const lastSpokenRef = useRef('');

  const speak = useCallback((text) => {
    lastSpokenRef.current = text;
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) recognitionRef.current.stop();
    isListeningRef.current = false;
    setIsListening(false);
  }, []);

  const openDialer = useCallback((service) => {
    const item = SERVICES[service];
    if (!item) return;
    setAction({ type: 'call', service });
    setStatus(`Opening your phone dialer for ${item.label} (${item.number})`);
    speak(`Calling ${item.label}. Tell the operator your location and what happened.`);
    window.location.href = `tel:${item.number}`;
  }, [speak]);

  const shareLocation = useCallback((service) => {
    setStatus('Getting your current location…');
    if (!navigator.geolocation) {
      setStatus('Location is not available in this browser. Call emergency services and state your location.');
      speak('Location is not available in this browser. Please call emergency services and state your location.');
      return;
    }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const locationLink = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
      setAction({ type: 'share', service, locationLink });
      setStatus('Location found. Your message is ready to send.');
      speak('Location found. Your emergency message is ready to send.');
    }, () => {
      setStatus('Location permission was not granted. Call emergency services and state a nearby landmark.');
      speak('I could not access your location. Please call emergency services and state a nearby landmark.');
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  }, [speak]);

  const copyToClipboard = useCallback(async (text, label) => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const input = document.createElement('textarea');
        input.value = text;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
      }
      setCopied(label);
      setStatus(`${label} copied to your clipboard.`);
      window.setTimeout(() => setCopied(''), 2500);
    } catch (_) {
      setStatus(`Could not copy ${label.toLowerCase()}. Please select it manually.`);
    }
  }, []);

  const handleCommand = useCallback((rawText) => {
    const command = understandCommand(rawText);
    if (command.type === 'cancel') {
      window.speechSynthesis?.cancel(); setAction(null); setStatus('Cancelled. No emergency call or message was sent.'); speak('Cancelled. No emergency call or message was sent.'); return;
    }
    if (command.type === 'repeat') { if (lastSpokenRef.current) speak(lastSpokenRef.current); return; }
    if (command.type === 'call') return openDialer(command.service);
    if (command.type === 'share') return shareLocation(command.service);
    if (command.type === 'directions') {
      setAction({ type: 'directions', service: command.service });
      setStatus(`Opening emergency route options${command.service ? ` for ${SERVICES[command.service].label}` : ''}.`);
      speak(command.service ? `Opening directions for ${SERVICES[command.service].label}.` : 'Opening nearby emergency route options.');
      navigate('/emergency-route'); return;
    }
    if (command.service) {
      const item = SERVICES[command.service];
      setAction({ type: 'service', service: command.service });
      setStatus(`${item.label} recognised. Say “call ${item.label}”, “share my location”, or “directions”.`);
      speak(`${item.label} recognised. Say call ${item.label}, share my location, or directions.`); return;
    }
    if (command.type === 'help') {
      setAction({ type: 'help' }); setStatus('Choose Ambulance, Police, Fire, or share your location.'); speak('I can call an ambulance, police, or fire brigade, or help share your location. What do you need?'); return;
    }
    setStatus('I did not understand that. Try “call ambulance”, “share my location”, or “directions to police”.');
    speak('I did not understand. Try call ambulance, share my location, or directions to police.');
  }, [navigate, openDialer, shareLocation, speak]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setTranscript('Voice recognition is not supported here. Please use a current Chrome or Edge browser.'); return undefined; }
    const recognition = new SpeechRecognition();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-IN';
    recognition.onresult = (event) => {
      let interim = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]; const phrase = result[0].transcript.trim();
        if (result.isFinal) {
          setTranscript(`“${phrase}”`);
          const fingerprint = normalise(phrase);
          if (fingerprint && fingerprint !== lastCommandRef.current) { lastCommandRef.current = fingerprint; handleCommand(phrase); }
        } else interim += `${phrase} `;
      }
      if (interim) setTranscript(`Listening: “${interim.trim()}”`);
    };
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') setStatus('Microphone permission is required for voice activation.');
      else if (event.error !== 'aborted') setStatus(`Voice recognition issue: ${event.error}. Please try again.`);
      isListeningRef.current = false; setIsListening(false);
    };
    recognition.onend = () => { if (isListeningRef.current) { try { recognition.start(); } catch (_) { /* already restarting */ } } else setIsListening(false); };
    recognitionRef.current = recognition;
    return () => { isListeningRef.current = false; recognition.abort(); window.speechSynthesis?.cancel(); };
  }, [handleCommand]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListeningRef.current) return stopListening();
    lastCommandRef.current = '';
    try { recognitionRef.current.start(); isListeningRef.current = true; setIsListening(true); setStatus('Listening for a command…'); setTranscript('Listening… e.g. “Call ambulance” or “Share my location”'); }
    catch (_) { setStatus('Voice recognition is already starting. Please speak now.'); }
  };

  const selectedService = action?.service;
  const locationMessage = action?.locationLink && `EMERGENCY${selectedService ? ` — ${SERVICES[selectedService].label}` : ''}: I need help. My current location is ${action.locationLink}`;
  return <div className="page-wrapper"><Navbar /><main className="page-content"><div className="app-container"><div className="voice-card">
    <div className="voice-heading"><i className="fa-solid fa-shield-heart"></i><div><h2>Voice Emergency Activation</h2><p>Speak naturally: “Call ambulance”, “send my location”, “directions to police”, “repeat”, or “cancel”.</p></div></div>
    <button className={`mic-btn ${isListening ? 'listening' : ''}`} onClick={toggleListening} aria-label={isListening ? 'Stop listening' : 'Start voice emergency'}><i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i><span>{isListening ? 'Listening — tap to stop' : 'Tap to speak'}</span></button>
    <div className={`wave-container ${isListening ? 'active' : ''}`}>{[1, 2, 3, 4, 5].map((bar) => <div className="wave-bar" key={bar} />)}</div>
    <div className={`transcript-box ${isListening ? 'active' : ''}`}>{transcript}</div><div className="status-box"><i className="fa-solid fa-circle-info"></i>{status}</div>
    <div className="quick-actions">{Object.entries(SERVICES).slice(0, 3).map(([key, item]) => <div className="service-action" key={key}><button className={selectedService === key ? 'selected' : ''} onClick={() => openDialer(key)}><i className={`fa-solid ${item.icon}`} style={{ color: item.color }} /> Call {item.label} ({item.number})</button><button className="copy-number" onClick={() => copyToClipboard(item.number, `${item.label} number`)} title={`Copy ${item.label} number`}><i className={`fa-solid ${copied === `${item.label} number` ? 'fa-check' : 'fa-copy'}`} /></button></div>)}<button onClick={() => shareLocation(selectedService)}><i className="fa-solid fa-location-dot" /> Share location</button></div>
    {locationMessage && <div className="action-card"><strong>Emergency location message ready</strong><span>Choose a contact in your messaging app to send it, or copy it for desktop testing.</span><a href={`sms:?body=${encodeURIComponent(locationMessage)}`}><i className="fa-solid fa-comment-sms" /> Send SMS</a><button onClick={() => copyToClipboard(locationMessage, 'Emergency location message')}><i className={`fa-solid ${copied === 'Emergency location message' ? 'fa-check' : 'fa-copy'}`} /> {copied === 'Emergency location message' ? 'Copied' : 'Copy message'}</button></div>}
    <p className="safety-note">For an immediate threat to life, call the emergency number directly. PRISM opens your phone or message app; it does not contact emergency services on your behalf.</p>
  </div></div></main><Footer />
  <style>{`.app-container{padding:24px 40px}.voice-card{max-width:780px;margin:0 auto;background:#0c1220;border:1px solid #162035;border-radius:14px;padding:32px;display:flex;flex-direction:column;align-items:center;text-align:center}.voice-heading{display:flex;align-items:flex-start;gap:14px;text-align:left;width:100%;margin-bottom:26px}.voice-heading>i{color:#e62e2e;font-size:27px;margin-top:3px}.voice-card h2{font-size:26px;font-weight:800;margin:0 0 7px}.voice-card p{font-size:13.5px;color:#94a3b8;line-height:1.5;margin:0}.mic-btn{width:150px;height:150px;border-radius:50%;background:linear-gradient(135deg,#e62e2e,#b31217);border:none;color:#fff;font-size:38px;cursor:pointer;box-shadow:0 10px 25px rgba(230,46,46,.3);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}.mic-btn span{font-size:11px;font-weight:800}.mic-btn.listening{animation:pulse-ring 1.5s infinite;background:linear-gradient(135deg,#ef4444,#dc2626)}@keyframes pulse-ring{0%{box-shadow:0 0 0 0 rgba(230,46,46,.7)}70%{box-shadow:0 0 0 30px rgba(230,46,46,0)}100%{box-shadow:0 0 0 0 rgba(230,46,46,0)}}.wave-container{display:flex;align-items:center;gap:4px;height:30px;margin:13px 0;opacity:0}.wave-container.active{opacity:1}.wave-bar{width:4px;height:8px;background:#e62e2e;border-radius:4px;animation:wave 1s infinite ease-in-out}.wave-bar:nth-child(2){animation-delay:.1s}.wave-bar:nth-child(3){animation-delay:.2s}.wave-bar:nth-child(4){animation-delay:.3s}.wave-bar:nth-child(5){animation-delay:.4s}@keyframes wave{0%,100%{height:8px}50%{height:28px;background:#38bdf8}}.transcript-box,.status-box{width:100%;box-sizing:border-box;border-radius:10px;font-size:14px}.transcript-box{background:#060913;border:1px solid #1e2c45;padding:18px;color:#94a3b8;min-height:25px}.transcript-box.active{color:#38bdf8;border-color:#0284c7}.status-box{margin-top:12px;padding:12px 14px;background:#101a2d;color:#cbd5e1;display:flex;gap:9px;text-align:left;align-items:center}.status-box i{color:#38bdf8}.quick-actions{display:flex;gap:9px;margin-top:20px;flex-wrap:wrap;justify-content:center}.service-action{display:flex;gap:4px}.quick-actions button,.action-card a,.action-card button{background:#060913;color:#e2e8f0;border:1px solid #263754;padding:10px 12px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;text-decoration:none}.quick-actions button:hover,.quick-actions button.selected{border-color:#e62e2e;background:#261219}.quick-actions i,.action-card i{margin-right:4px}.copy-number{padding:10px!important}.copy-number i{margin:0!important}.action-card{width:100%;box-sizing:border-box;margin-top:18px;padding:16px;text-align:left;background:#052e2b;border:1px solid #0f766e;border-radius:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;color:#ccfbf1}.action-card strong{width:100%}.action-card span{font-size:12px;flex:1}.action-card a,.action-card button{background:#0f766e;border-color:#14b8a6;color:white}.safety-note{margin-top:20px!important;font-size:11px!important;color:#64748b!important}@media(max-width:600px){.app-container{padding:18px}.voice-card{padding:24px 18px}.voice-heading h2{font-size:22px}.quick-actions{flex-direction:column;width:100%}.service-action{width:100%}.service-action button:first-child,.quick-actions>button{width:100%}}`}</style>
  </div>;
}
