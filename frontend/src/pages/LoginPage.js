import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import global from '../styles/global.module.css';
import button from '../styles/buttons.module.css';
import form from '../styles/forms.module.css';
import layout1 from '../styles/layout1.module.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try { 
      const { data } = await api.post('/api/users/login', { email });
      setSuccess(data.message || 'Please check your email for a sign-in link.');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className={layout1.pageContainer}>
      <div className={layout1.leftHalf}>
        <img src="/logo.png" alt="Comic Collective Logo" className={layout1.logo} />
      </div>
      <div className={layout1.rightHalf}>
        <div className={form.formContainer}>
          <h1>Sign in</h1>
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          {success ? (
            <p className={global.success}>{success}</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={form.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={form.formActions}>
                <button type="submit" className={button.submitButton}>Log in</button>
                <Link to="/register" className={global.link}>Sign up here</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
 
export default LoginPage;
