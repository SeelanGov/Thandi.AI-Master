'use client';

import { useState, useRef, useEffect } from 'react';

const SUGGESTED_QUESTIONS = [
  "What if my marks improve by Grade 12?",
  "Tell me more about the bursaries mentioned",
  "What are similar careers to my top match?",
  "Which subjects should I focus on improving?",
  "How do I apply for these programs?"
];

const MAX_QUESTIONS = 10;

export default function ThandiChat({ assessmentData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (question = input) => {
    if (!question.trim() || isLoading || questionCount >= MAX_QUESTIONS) return;

    const userMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setQuestionCount(prev => prev + 1);

    try {
      // Build context-aware query with conversation history
      let contextQuery = '';
      
      // Add conversation history if exists
      if (conversationHistory.length > 0) {
        contextQuery += 'Previous conversation:\n';
        conversationHistory.slice(-4).forEach(msg => {
          contextQuery += `${msg.role}: ${msg.content.substring(0, 150)}...\n`;
        });
        contextQuery += '\n';
      }
      
      contextQuery += `Current question: ${question}\n\n`;
      contextQuery += `Student's assessment results:\n`;
      contextQuery += `- Grade: ${assessmentData.grade || 'Not specified'}\n`;
      contextQuery += `- Subjects I enjoy: ${assessmentData.enjoyedSubjects?.join(', ') || 'Not specified'}\n`;
      contextQuery += `- Interests: ${assessmentData.interests?.join(', ') || 'Not specified'}\n`;
      contextQuery += `- Top career recommendation: ${assessmentData.topCareer || 'See above'}\n\n`;
      contextQuery += `Answer the current question based on the conversation history and assessment results.\n`;
      contextQuery += `If you already answered this, reference your previous answer briefly and add new insights.`;

      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: contextQuery,
          curriculumProfile: assessmentData.curriculumProfile,
          options: {
            includeDebug: false,
            chatMode: true
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: data.response || data.fullResponse
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Update conversation history for next question
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: question },
          { role: 'assistant', content: data.response || data.fullResponse }
        ]);
      } else {
        const errorMessage = {
          role: 'assistant',
          content: '❌ Sorry, I had trouble answering that. Please try rephrasing your question.'
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: '❌ Network error. Please check your connection and try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    setIsExpanded(true);
    setTimeout(() => handleSend(question), 100);
  };

  if (!isExpanded) {
    return (
      <div className="chat-collapsed">
        <button onClick={() => setIsExpanded(true)} className="expand-button">
          💬 Have questions about your results? Chat with Thandi
        </button>

        <style jsx>{`
          .chat-collapsed {
            margin-top: 32px;
            padding: 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            text-align: center;
          }

          .expand-button {
            background: white;
            color: #667eea;
            border: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .expand-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">
          <span className="chat-icon">💬</span>
          <h3>Chat with Thandi</h3>
        </div>
        <button onClick={() => setIsExpanded(false)} className="minimize-button">
          ─
        </button>
      </div>

      {messages.length === 0 && (
        <div className="welcome-message">
          <p className="welcome-text">
            👋 Hi! I'm here to answer follow-up questions about your career results.
          </p>
          <p className="welcome-subtext">
            Try asking me about bursaries, alternative careers, or how to improve your marks.
          </p>
          
          <div className="suggested-questions">
            <p className="suggested-title">Suggested questions:</p>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestedQuestion(q)}
                className="suggested-button"
                disabled={isLoading || questionCount >= MAX_QUESTIONS}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">
              {msg.role === 'assistant' && <span className="avatar">🤖</span>}
              <div className="message-text">
                {formatMessage(msg.content)}
              </div>
              {msg.role === 'user' && <span className="avatar">👤</span>}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <span className="avatar">🤖</span>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        {questionCount >= MAX_QUESTIONS ? (
          <div className="limit-message">
            ⚠️ You've reached the maximum of {MAX_QUESTIONS} questions per session. Start a new assessment to ask more.
          </div>
        ) : (
          <>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a follow-up question..."
              className="chat-input"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="send-button"
            >
              {isLoading ? '...' : '→'}
            </button>
          </>
        )}
        <div className="question-counter">
          {questionCount}/{MAX_QUESTIONS} questions used
        </div>
      </div>

      <div className="chat-disclaimer">
        ⚠️ This is still AI advice. Verify everything with real people before deciding.
      </div>

      <style jsx>{`
        .chat-container {
          margin-top: 32px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          overflow: hidden;
        }

        .chat-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-icon {
          font-size: 24px;
        }

        .chat-title h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .minimize-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .minimize-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .welcome-message {
          padding: 24px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .welcome-text {
          font-size: 16px;
          color: #374151;
          margin: 0 0 8px 0;
        }

        .welcome-subtext {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 20px 0;
        }

        .suggested-questions {
          margin-top: 16px;
        }

        .suggested-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px 0;
        }

        .suggested-button {
          display: block;
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          margin-bottom: 8px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          color: #667eea;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .suggested-button:hover:not(:disabled) {
          background: #eff6ff;
          border-color: #667eea;
        }

        .suggested-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .messages-container {
          max-height: 400px;
          overflow-y: auto;
          padding: 20px;
          background: #f9fafb;
        }

        .message {
          margin-bottom: 16px;
        }

        .message-content {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .message.user .message-content {
          flex-direction: row-reverse;
        }

        .avatar {
          font-size: 24px;
          flex-shrink: 0;
        }

        .message-text {
          background: white;
          padding: 12px 16px;
          border-radius: 12px;
          max-width: 80%;
          line-height: 1.6;
          color: #374151;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .message.user .message-text {
          background: #667eea;
          color: white;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          background: white;
          border-radius: 12px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #9ca3af;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }

        .chat-input-container {
          padding: 16px;
          background: white;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .chat-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          min-width: 200px;
        }

        .chat-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .chat-input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .send-button {
          padding: 12px 24px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }

        .send-button:hover:not(:disabled) {
          background: #5568d3;
        }

        .send-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .question-counter {
          width: 100%;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }

        .limit-message {
          width: 100%;
          padding: 12px;
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 8px;
          color: #78350f;
          font-size: 14px;
          text-align: center;
        }

        .chat-disclaimer {
          padding: 12px 16px;
          background: #fff3cd;
          border-top: 2px solid #fbbf24;
          color: #856404;
          font-size: 13px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .messages-container {
            max-height: 300px;
          }

          .message-text {
            max-width: 90%;
            font-size: 14px;
          }

          .chat-input {
            font-size: 16px; /* Prevents zoom on iOS */
          }
        }
      `}</style>
    </div>
  );
}

function formatMessage(text) {
  if (!text) return '';
  
  // Simple formatting for chat messages
  return text
    .split('\n')
    .map((line, idx) => (
      <p key={idx} style={{ margin: idx === 0 ? 0 : '8px 0 0 0' }}>
        {line}
      </p>
    ));
}
