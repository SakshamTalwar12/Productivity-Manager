import React, { useState } from 'react';
import '../styles/Contact.css';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    window.alert('Message sent!');
  };

  return (
    <div className="contact-page unified-theme-bg">
      <div className="contact-card unified-card">
        <h2 className="unified-title">Contact Us</h2>
        <form className="contact-form" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required className="unified-input" />
          <input type="email" name="email" placeholder="Your Email" value={form.email} onChange={handleChange} required className="unified-input" />
          <input type="tel" name="phone" placeholder="Your Phone Number" value={form.phone} onChange={handleChange} required className="unified-input" />
          <textarea name="message" placeholder="Your Message" value={form.message} onChange={handleChange} required className="unified-input" />
          <button type="submit" className="contact-submit contact-button">Send Message</button>
        </form>
        {submitted && <div className="contact-success">Thank you for reaching out! We'll get back to you soon.</div>}
      </div>
      <div className="contact-info unified-card">
        <h3 className="unified-title">Our Team</h3>
        <div className="team-member">
          <div className="member-avatar">S</div>
          <div>
            <div className="member-name">Saksham Talwar</div>
            <div className="unified-muted">talwarsaksham125@gmailcom</div>
          </div>
        </div>
        <div className="team-member">
          <div className="member-avatar">A</div>
          <div>
            <div className="member-name">Aaryan Mishra</div>
            <div className="unified-muted">aaryanmishra123@gmail.com</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 