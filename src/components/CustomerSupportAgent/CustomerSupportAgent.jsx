import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, AlertCircle, Check, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './CustomerSupportAgent.css';

export default function CustomerSupportAgent() {
  const { user, customerSelectedStore } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize with welcome message when opening
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeTexts = {
        en: "Hello! I am your Lumina Customer Support AI. How can I help you today?",
        hi: "नमस्ते! मैं आपका लुमिना ग्राहक सहायता एआई हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?",
        mr: "नमस्कार! मी आपला लुमिना ग्राहक सहाय्य एआय आहे. आज मी तुम्हाला कशी मदत करू शकतो?"
      };
      setMessages([{
        id: 'welcome',
        sender: 'agent',
        text: welcomeTexts[language],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [isOpen, language]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend, actionConfirmId = null, isCancel = false) => {
    const text = textToSend || message;
    if (!text && !actionConfirmId) return;

    if (!actionConfirmId) {
      setMessage('');
      setMessages(prev => [...prev, {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } else {
      setPendingAction(null);
    }

    setIsLoading(true);

    try {
      const token = user ? await user.getIdToken() : '';
      const response = await fetch('/api/ai/customer/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: text,
          language,
          storeId: customerSelectedStore || 'DEFAULT',
          confirmActionId: actionConfirmId,
          isCancel
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        if (data.pendingAction) {
          setPendingAction(data.pendingAction);
        }
      } else {
        setMessages(prev => [...prev, {
          id: `agent-error-${Date.now()}`,
          sender: 'agent',
          text: language === 'en' ? "Sorry, I encountered an issue. Please try again." : "क्षमा करें, मुझे एक समस्या आई। कृपया पुनः प्रयास करें।",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `agent-error-${Date.now()}`,
        sender: 'agent',
        text: "Network error. Please make sure you are online.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickOption = (option) => {
    let text = "";
    if (option === 'track') {
      text = language === 'en' ? "Track my order" : language === 'hi' ? "मेरा ऑर्डर ट्रैक करें" : "माझी ऑर्डर ट्रॅक करा";
    } else if (option === 'recommend') {
      text = language === 'en' ? "Recommend a gold ring under 50000" : language === 'hi' ? "50000 के तहत सोने की अंगूठी की सिफारिश करें" : "५०००० च्या आतील सोन्याच्या अंगठीची शिफारस करा";
    } else if (option === 'care') {
      text = language === 'en' ? "How do I care for my jewellery?" : language === 'hi' ? "मैं अपने आभूषणों की देखभाल कैसे करूँ?" : "मी माझ्या दागिन्यांची काळजी कशी घेऊ?";
    } else if (option === 'ticket') {
      text = language === 'en' ? "Raise a support ticket: Late delivery issue" : language === 'hi' ? "सहायता टिकट बनाएं: देरी से डिलीवरी" : "सहाय्य तिकीट बनवा: उशिरा डिलिव्हरी";
    }
    handleSend(text);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        className={`ai-agent-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Customer Support AI"
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
        {!isOpen && <span className="ai-agent-badge">AI</span>}
      </button>

      {/* Chat Window Drawer */}
      {isOpen && (
        <div className="ai-agent-drawer">
          {/* Header */}
          <div className="ai-agent-header">
            <div className="ai-agent-profile">
              <div className="ai-agent-avatar">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="ai-agent-name">Lumina Support AI</h3>
                <span className="ai-agent-status">Online · Multi-lingual</span>
              </div>
            </div>
            <div className="ai-agent-controls">
              <select 
                className="ai-agent-lang" 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          {/* Messages */}
          <div className="ai-agent-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-message-bubble ${msg.sender}`}>
                <div className="ai-message-text">{msg.text}</div>
                <div className="ai-message-time">{msg.timestamp}</div>
              </div>
            ))}
            {isLoading && (
              <div className="ai-message-bubble agent typing">
                <div className="ai-message-text">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            
            {/* Interactive Confirmations */}
            {pendingAction && (
              <div className="ai-confirm-box">
                <div className="ai-confirm-warning">
                  <AlertCircle size={16} />
                  <span>
                    {language === 'en' ? "Please confirm action:" : language === 'hi' ? "कृपया कार्रवाई की पुष्टि करें:" : "कृपया कृतीची खात्री करा:"}
                  </span>
                </div>
                <p className="ai-confirm-prompt">{pendingAction.promptText}</p>
                <div className="ai-confirm-actions">
                  <button 
                    className="btn btn-sm" 
                    style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}
                    onClick={() => handleSend(null, pendingAction.actionId, false)}
                  >
                    <Check size={14} /> {language === 'en' ? "Confirm" : language === 'hi' ? "पुष्टि करें" : "नक्की करा"}
                  </button>
                  <button 
                    className="btn btn-sm btn-outline" 
                    onClick={() => handleSend(null, pendingAction.actionId, true)}
                  >
                    <X size={14} /> {language === 'en' ? "Cancel" : language === 'hi' ? "रद्द करें" : "रद्द करा"}
                  </button>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Option Chips */}
          <div className="ai-agent-chips">
            <button className="ai-chip" onClick={() => handleQuickOption('track')}>
              🔍 {language === 'en' ? "Track Order" : language === 'hi' ? "ऑर्डर ट्रैक करें" : "ऑर्डर ट्रॅक करा"}
            </button>
            <button className="ai-chip" onClick={() => handleQuickOption('recommend')}>
              ✨ {language === 'en' ? "Recommend Ring" : language === 'hi' ? "अंगूठी ढूंढें" : "अंगठी शिफारस"}
            </button>
            <button className="ai-chip" onClick={() => handleQuickOption('care')}>
              🧼 {language === 'en' ? "Jewellery Care" : language === 'hi' ? "आभूषणों की देखभाल" : "दागिन्यांची काळजी"}
            </button>
            <button className="ai-chip" onClick={() => handleQuickOption('ticket')}>
              🎫 {language === 'en' ? "Create Ticket" : language === 'hi' ? "टिकट बनाएं" : "तिकीट तयार करा"}
            </button>
          </div>

          {/* Input Area */}
          <div className="ai-agent-input-wrap">
            <input 
              type="text" 
              className="ai-agent-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={language === 'en' ? "Type a message..." : language === 'hi' ? "एक संदेश लिखें..." : "संदेश टाईप करा..."}
            />
            <button className="ai-agent-send" onClick={() => handleSend()}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
