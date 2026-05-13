import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <header className="home-header">
        <div className="logo">📚 English Learning Hub</div>
        <div className="header-buttons">
          
          <button onClick={() => navigate('/signin')} className="signin-header-btn">
            Sign In
          </button>
        </div>
      </header>

      <div className="home-hero">
        <h1>Master IELTS and GRE with AI-Powered Training</h1>
        <p>Advanced support for reading, writing, listening, and speaking with adaptive coaching and feedback.</p>
        <div className="hero-buttons">
          <button onClick={() => navigate('/signin')} className="cta-button">
            Get Started
          </button>
          <button onClick={() => navigate('/chat')} className="cta-button secondary">
            Try Chat Now
          </button>
        </div>
      </div>

      <div className="home-features">
        <div className="feature">
          <span className="feature-icon">🎓</span>
          <h3>IELTS and GRE Tracks</h3>
          <p>Structured prep paths for academic English, verbal reasoning, and test-day strategy.</p>
        </div>
        <div className="feature">
          <span className="feature-icon">🤖</span>
          <h3>Adaptive AI Coach</h3>
          <p>Get personalized recommendations based on your latest skill performance.</p>
        </div>
        <div className="feature">
          <span className="feature-icon">📄</span>
          <h3>Reading and Listening Lab</h3>
          <p>Analyze passages, notes, and transcripts with exam-focused comprehension drills.</p>
        </div>
        <div className="feature">
          <span className="feature-icon">📊</span>
          <h3>Writing and Speaking Feedback</h3>
          <p>Receive rubric-based scoring with strengths, improvements, and next-step plans.</p>
        </div>
      </div>

      <div className="home-footer">
        <p>Ready to improve your English? 
          <button onClick={() => navigate('/signin')}>Sign in or create an account</button>
        
        </p>
      </div>
    </div>
  );
}
