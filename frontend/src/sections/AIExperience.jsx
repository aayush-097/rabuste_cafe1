import { useState } from 'react';
import { useCoffeeBot } from '../context/CoffeeBotContext';
import { explainableCoffee } from '../utils/aiLogic';
import '../styles/AIExperience.css';

const AIExperience = () => {
  const { openCoffeeBot } = useCoffeeBot();
  const [mood, setMood] = useState('cozy');
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [prefersMilk, setPrefersMilk] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const moodOptions = ['cozy', 'calm', 'creative', 'bold', 'focused', 'energetic'];
  const timeOptions = ['morning', 'afternoon', 'evening', 'night'];

  const runCoffeeAI = (e) => {
    e.preventDefault();
    const local = explainableCoffee({ mood, timeOfDay, prefersMilk });
    setAiResult(local);
  };

  const handleChatbotClick = () => {
    openCoffeeBot();
  };

  return (
    <section id="ai-experience">
      <div className="ai-container">
        {/* HEADING & INTRO */}
        <div className="ai-header">
          <h2 className="ai-main-title">Enjoy Coffee According to Your Mood</h2>
          <p className="ai-intro-text">
            Tell us how you're feeling right now. Our AI-powered brew assistant will suggest the perfect coffee 
            that matches your mood, time of day, and preferences. Discover your next favorite cup.
          </p>
        </div>

        {/* COFFEE SUGGESTION SECTION */}
        <div className="coffee-suggestion-card">
          <div className="coffee-header">
            <h3>Coffee Discovery</h3>
            <span className="coffee-badge">AI Powered</span>
          </div>

          <form className="coffee-form" onSubmit={runCoffeeAI}>
            <div className="form-group">
              <label htmlFor="mood-select">How are you feeling?</label>
              <select 
                id="mood-select"
                className="form-input mood-select" 
                value={mood} 
                onChange={(e) => setMood(e.target.value)}
              >
                {moodOptions.map((m) => (
                  <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="time-select">What time of day?</label>
              <select 
                id="time-select"
                className="form-input time-select" 
                value={timeOfDay} 
                onChange={(e) => setTimeOfDay(e.target.value)}
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={prefersMilk}
                  onChange={(e) => setPrefersMilk(e.target.checked)}
                  className="checkbox-input"
                />
                <span>I prefer milk-based coffee</span>
              </label>
            </div>

            <button className="suggest-btn" type="submit">Get Coffee Suggestion</button>
          </form>

          {aiResult && (
            <div className="coffee-result">
              <h4 className="result-title">{aiResult.title}</h4>
              <p className="result-reasoning">{aiResult.reasoning}</p>

              <div className="result-tags">
                {aiResult.matches.map((c) => (
                  <span key={c.name} className="coffee-tag">{c.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CHATBOT PROMOTION SECTION */}
        <div className="chatbot-promotion">
          <div className="chatbot-content">
            <h3 className="chatbot-title">Interactive Brew Assistant</h3>
            <p className="chatbot-description">
              Want to chat with our AI assistant? Ask anything about our menu, get personalized recommendations, 
              learn about our coffee origins, explore café info, or just have a friendly conversation about 
              your perfect brew.
            </p>
            <button className="interact-btn" onClick={handleChatbotClick}>
              Interact Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIExperience;
