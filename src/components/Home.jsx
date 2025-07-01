import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../styles/Home.css";
import ScrollAnimation from "./ScrollAnimation.jsx";

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <>
      <ScrollAnimation 
        selectors={{
          features: '.features-section',
          additionalFeatures: '.additional-features',
          stats: '.stats-section',
          tasks: '.tasks-section',
          testimonials: '.testimonials',
          pricing: '.pricing',
          faq: '.faq',
          newsletter: '.newsletter',
          cta: '.cta-section'
        }}
        thresholds={{
          features: 0.2,
          additionalFeatures: 0.2,
          stats: 0.3,
          tasks: 0.2,
          testimonials: 0.2,
          pricing: 0.2,
          faq: 0.2,
          newsletter: 0.2,
          cta: 0.4
        }}
        cardSelectors=".feature-card, .stat-card, .task-item, .testimonial-card, .pricing-card, .faq-item"
        delay={150}
      />
      <nav>
        <div className="logo">
          <svg className="logo-svg" width="50" height="50" viewBox="0 0 50 50">
            {/* Modern hexagonal background */}
            <polygon
              className="logo-hex"
              points="25,2 45,13.5 45,36.5 25,48 5,36.5 5,13.5"
              fill="none"
              stroke="#b19cd9"
              strokeWidth="2"
            />
            {/* Animated lines */}
            <line className="logo-line" x1="15" y1="25" x2="35" y2="25" stroke="#b19cd9" strokeWidth="2" />
            <line className="logo-line" x1="25" y1="15" x2="25" y2="35" stroke="#b19cd9" strokeWidth="2" />
            {/* PM text with modern font */}
            <text x="25" y="28" textAnchor="middle" className="logo-text">PM</text>
          </svg>
          <span className="logo-text-full">
            Productivity<span className="accent">Manager</span>
          </span>
        </div>
        <ul className="nav-links">
          {/* <li><Link to="/">Home</Link></li> */}
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><a href="/todo">My Tasks</a></li>
          <li><a href="#analytics">Analytics</a></li>
          <li><a href="#features">Features</a></li>
          <li><Link to="/about">About</Link></li>
          {isLoggedIn ? (
            <li><button onClick={handleLogout} className="login-button">Logout</button></li>
          ) : (
            <li><Link to="/login" className="login-button">Login</Link></li>
          )}
        </ul>
      </nav>
      
      <header className="hero">
        <div className="hero-content">
          <h1>Productivity Manager</h1>
          <p>Maximize your potential, minimize your effort</p>
        </div>
      </header>
      
      <section className="features-section" id="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-image">
                <img src="/images/tasks.jpg" alt="Task Management" />
              </div>
              <div className="feature-text">
                <h2>Task Management</h2>
                <p>Organize your tasks with our intuitive task management system. Set priorities, deadlines, and track progress effortlessly.</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-image">
                <img src="/images/cll.jpg" alt="Time Tracking" />
              </div>
              <div className="feature-text">
                <h2>Time Tracking</h2>
                <p>Monitor your time usage with detailed analytics and insights to optimize your workflow.</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-image">
                <img src="/images/insight.webp" alt="Progress Analytics" />
              </div>
              <div className="feature-text">
                <h2>Progress Analytics</h2>
                <p>Visualize your productivity with beautiful charts and actionable insights.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Additional Features Section */}
      <section className="additional-features" id="additional-features">
        <div className="container">
          <h2 className="section-title">More Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-image">
                <img src="/images/po.jpg" alt="Maximize Productivity" />
              </div>
              <div className="feature-text">
                <h2>Maximize Productivity</h2>
                <p>Become more productive than ever with our intelligent tools.</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-image">
                <img src="/images/calender.webp" alt="Smart Calendar" />
              </div>
              <div className="feature-text">
                <h2>Smart Calendar</h2>
                <p>Intelligent scheduling that adapts to your work patterns and priorities.</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-image">
                <img src="/images/ree.webp" alt="Custom Reports" />
              </div>
              <div className="feature-text">
                <h2>Custom Reports</h2>
                <p>Generate detailed reports and insights about your productivity patterns.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="testimonials" id="testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonial-container">
          <div className="testimonial-card">
            <div className="user-info">
              <h3>Sarah Johnson</h3>
              <p>Product Manager</p>
            </div>
            <p className="testimonial-text">"This productivity manager has completely transformed how I organize my work. The focus timer is a game-changer!"</p>
          </div>
          <div className="testimonial-card">
            <div className="user-info">
              <h3>Mike Chen</h3>
              <p>Software Developer</p>
            </div>
            <p className="testimonial-text">"The task management system is intuitive and the analytics help me track my progress effectively."</p>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="pricing" id="pricing">
        <h2>Choose Your Plan</h2>
        <div className="pricing-container">
          <div className="pricing-card featured">
            <h3>Free</h3>
            <div className="price">$0<span>/month</span></div>
            <ul className="features-list">
              <li><i className="fas fa-check"></i> Basic Task Management</li>
              <li><i className="fas fa-check"></i> Focus Timer</li>
              <li><i className="fas fa-check"></i> Basic Analytics</li>
            </ul>
            <button className="pricing-btn">Get Started</button>
          </div>
          <div className="pricing-card featured">
            <h3>Pro</h3>
            <div className="price">$9.99<span>/month</span></div>
            <ul className="features-list">
              <li><i className="fas fa-check"></i> Advanced Task Management</li>
              <li><i className="fas fa-check"></i> Calendar Integration</li>
              <li><i className="fas fa-check"></i> Detailed Analytics</li>
              <li><i className="fas fa-check"></i> Priority Support</li>
            </ul>
            <button className="pricing-btn">Upgrade Now</button>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="faq" id="faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-container">
          <div className="faq-item">
            <div className="faq-question">
              <h3>How does the focus timer work?</h3>
              <i className="fas fa-chevron-down"></i>
            </div>
            <div className="faq-answer">
              <p>The focus timer uses the Pomodoro technique, allowing you to work in focused 25-minute intervals followed by short breaks.</p>
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">
              <h3>Can I sync with my calendar?</h3>
              <i className="fas fa-chevron-down"></i>
            </div>
            <div className="faq-answer">
              <p>Yes! Our Pro plan includes full calendar integration with Google Calendar and other popular calendar apps.</p>
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">
              <h3>Is my data secure?</h3>
              <i className="fas fa-chevron-down"></i>
            </div>
            <div className="faq-answer">
              <p>Absolutely. We use industry-standard encryption to protect your data and never share it without your consent.</p>
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">
              <h3>Can I generate productivity reports?</h3>
              <i className="fas fa-chevron-down"></i>
            </div>
            <div className="faq-answer">
              <p>Yes, detailed productivity reports are available under the Pro plan, helping you analyze time spent and task completion trends.</p>
            </div>
          </div>
          <div className="faq-item">
            <div className="faq-question">
              <h3>Does it work on mobile devices?</h3>
              <i className="fas fa-chevron-down"></i>
            </div>
            <div className="faq-answer">
              <p>Yes, the platform is fully responsive and works seamlessly on smartphones and tablets.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="newsletter" id="newsletter">
        <div className="newsletter-container">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for productivity tips and updates</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>
      
      {/* Social Media Buttons - Added above footer as requested */}
      <section className="social-section">
        <div className="container">
          <div className="social-buttons">
            <a href="#" className="social-button">
              <i className="fab fa-twitter"></i>
              <span>Twitter</span>
            </a>
            <a href="#" className="social-button">
              <i className="fab fa-linkedin"></i>
              <span>LinkedIn</span>
            </a>
            <a href="#" className="social-button">
              <i className="fab fa-github"></i>
              <span>GitHub</span>
            </a>
            <a href="#" className="social-button">
              <i className="fab fa-instagram"></i>
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </section>
      
      {/* Fixed Footer Structure */}
      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <h4>About</h4>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/careers">Careers</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <ul>
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/contact">Contact Support</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <ul>
                <li><Link to="/terms">Terms of Service</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/cookies">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Productivity Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;