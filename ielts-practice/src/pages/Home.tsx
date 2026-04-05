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
        <h1>Master English with AI-Powered Learning</h1>
        <p>Learn grammar, business English, and prepare for IELTS with personalized assistance</p>
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
          <h3>Structured Courses</h3>
          <p>Learn from beginner to advanced level with comprehensive modules</p>
        </div>
        <div className="feature">
          <span className="feature-icon">🤖</span>
          <h3>AI Assistant</h3>
          <p>Get instant help with your English learning questions</p>
        </div>
        <div className="feature">
          <span className="feature-icon">📄</span>
          <h3>File Analysis</h3>
          <p>Upload PDFs, images, or documents for text extraction and analysis</p>
        </div>
        <div className="feature">
          <span className="feature-icon">📊</span>
          <h3>Track Progress</h3>
          <p>Monitor your learning journey with detailed progress tracking</p>
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
