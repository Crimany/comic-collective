import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import global from '../styles/global.module.css';
import layout1 from '../styles/layout1.module.css';

function VerifyEmailPage() {
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState('');
  const { token } = useParams();
  // sign-in links are single use, so only submit the token once (StrictMode runs effects twice)
  const submitted = useRef(false);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError('No verification token found.');
        return;
      }

      try {
        const { data } = await api.post('/api/users/verify-email', { token });
        localStorage.setItem('userInfo', JSON.stringify(data));
        setMessage('Email verified successfully! Signing you in...');
        if (data.role === 'employee') {
          window.location.href = '/dashempl';
        } else if (data.role === 'customer') {
          window.location.href = '/dashcust';
        } else {
          window.location.href = '/';
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to verify email.');
      }
    };

    if (!submitted.current) {
      submitted.current = true;
      verify();
    }
  }, [token]);

  return (
    <div className={layout1.pageContainer}>
      <div className={layout1.leftHalf}>
        <img src="/logo.png" alt="Comic Collective Logo" className={layout1.logo} />
      </div>
      <div className={layout1.rightHalf}>
        <div style={{ textAlign: 'center' }}>
          <h1>Email Verification</h1>
          {error && <p className={global.error}>{error}</p>}
          {message && !error && <p className={global.success}>{message}</p>}
          {error && <Link to="/login" className={global.link}>Back to Sign in</Link>}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
