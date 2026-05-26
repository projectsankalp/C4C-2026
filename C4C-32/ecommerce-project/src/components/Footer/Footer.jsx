import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';
import '../../styles/footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      toast.success("Namaste! You have successfully joined our inner circle for limited edition catalog drops.", {
        icon: <FiMail style={{ color: 'var(--primary-terracotta)' }} />,
        duration: 5000
      });
      setEmail('');
    } else {
      toast.error("Please enter a valid email address to subscribe.");
    }
  };

  return (
    <footer className="footer-section">
      <div className="container">
        <div className="footer-grid">
          
          {/* Brand Info Column */}
          <div className="footer-brand-column">
            <h3 className="footer-logo">KariGhar<span>.</span></h3>
            <p className="footer-desc">
              Preserving ancient craftsmanship through a modern bridge of digital empowerment. Direct from hands that honor tradition.
            </p>
            <div className="footer-social-icons">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer-social-btn" title="Instagram">
                <FiInstagram />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer-social-btn" title="Twitter">
                <FiTwitter />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="footer-social-btn" title="Facebook">
                <FiFacebook />
              </a>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="footer-column-title">KariGhar</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item"><Link to="/help">Our Story</Link></li>
              <li className="footer-link-item"><Link to="/help">The Artisan Pledge</Link></li>
              <li className="footer-link-item"><Link to="/collections">Sustainability</Link></li>
              <li className="footer-link-item"><Link to="/help">Our Workshops</Link></li>
            </ul>
          </div>

          {/* Column 3: Experience */}
          <div>
            <h4 className="footer-column-title">Experience</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item"><Link to="/collections?category=Hand-loom%20Textiles">Handloom Silk</Link></li>
              <li className="footer-link-item"><Link to="/collections?category=Pottery%20%26%20Ceramics">Clay Pottery</Link></li>
              <li className="footer-link-item"><Link to="/seller">Artisan Dashboard</Link></li>
              <li className="footer-link-item"><Link to="/help">Custom Orders</Link></li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h4 className="footer-column-title">Support & Drops</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item"><Link to="/help">Shipping & Returns</Link></li>
              <li className="footer-link-item"><Link to="/help">Contact Us</Link></li>
              <li className="footer-link-item"><Link to="/help">Privacy Policy</Link></li>
            </ul>
            
            {/* Newsletter form */}
            <div className="footer-newsletter-wrapper">
              <form onSubmit={handleSubscribe} className="footer-newsletter-form">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="footer-newsletter-btn">
                  JOIN
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Bottom copyright details */}
        <div className="footer-bottom">
          <div>
            © 2026 KariGhar. Preserving Craft, Honoring Hands.
          </div>
          <div className="footer-bottom-links">
            <Link to="/help">Privacy Policy</Link>
            <Link to="/help">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
