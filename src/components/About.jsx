import React, { useState, useEffect } from "react";
import { Link, useNavigate  } from "react-router-dom";
import "../styles/About.css";
import ScrollAnimation from "./ScrollAnimation.jsx";

function About() {

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
          about: '.about-section',
          cards: '.about-card'
        }}
        thresholds={{
          about: 0.2,
          cards: 0.3
        }}
        cardSelectors=".about-card"
        delay={200}
      />
      <nav>
        <div className="logo">
          <svg className="logo-svg" width="50" height="50" viewBox="0 0 50 50">
            <polygon
              className="logo-hex"
              points="25,2 45,13.5 45,36.5 25,48 5,36.5 5,13.5"
              fill="none"
              stroke="#b19cd9"
              strokeWidth="2"
            />
            <line className="logo-line" x1="15" y1="25" x2="35" y2="25" stroke="#b19cd9" strokeWidth="2" />
            <line className="logo-line" x1="25" y1="15" x2="25" y2="35" stroke="#b19cd9" strokeWidth="2" />
            <text x="25" y="28" textAnchor="middle" className="logo-text">PM</text>
          </svg>
          <span className="logo-text-full">
            Productivity<span className="accent">Manager</span>
          </span>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><a href="/todo">My Tasks</a></li>
          <li><a href="/#analytics">Analytics</a></li>
          <li><a href="/#features">Features</a></li>
          {/* <li><Link to="/about">About</Link></li> */}
          {isLoggedIn ? (
                      <li><button onClick={handleLogout} className="login-button">Logout</button></li>
                    ) : (
                      <li><Link to="/login" className="login-button">Login</Link></li>
                    )}
          
        </ul>
      </nav>

      <section className="about-section">
        <div className="container1">
          <div className="about-flex">
            <div className="about-card" id="about1">
              <div className="about-image">
                <img src="/images/anime girl 3.jpg" alt="Aaryan Mishra" />
              </div>
              <div className="about-text">
                <h2>Aaryan Mishra</h2>
                <p>
                  The world is constantly evolving, shaped by the ever-changing landscapes of technology, nature, and human interaction. 
                  Innovation drives progress, creating new opportunities while also presenting unforeseen challenges. In today's fast-paced 
                  digital age, connectivity has transformed the way people communicate, work, and learn. The rise of artificial intelligence, 
                  automation, and data analytics has revolutionized industries, making processes more efficient and streamlined.
                </p>
              </div>
            </div>

            <div className="about-card" id="about2">
              <div className="about-image">
                <img src="/images/anime girl 7.jpg" alt="Saksham Talwar" />
              </div>
              <div className="about-text">
                <h2>Saksham Talwar</h2>
                <p>
                  Despite these advancements, the human element remains essential. Creativity, empathy, and intuition continue to play 
                  a crucial role in decision-making and problem-solving. Education and lifelong learning are more important than ever, 
                  as individuals adapt to new skills and knowledge in an ever-changing workforce. Remote work, once a niche concept, 
                  has become a norm, allowing individuals to collaborate across the globe without geographical limitations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default About;