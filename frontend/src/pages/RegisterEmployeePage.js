import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import EmployeeLayout from '../components/EmployeeLayout';
import buttons from '../styles/buttons.module.css';
import form from '../styles/forms.module.css';

function RegisterEmployeePage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await api.post('/api/users/register-employee', { email }, config);
      setMessage(data.message || 'Employee registered successfully!');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <EmployeeLayout title="Register a New Employee">
      <div className={form.formContainer} style={{ width: '50%', margin: 'auto' }}>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className={form.formGroup}>
            <label htmlFor="email">Email:</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" />
          </div>
          <div className={form.formActions} style={{ justifyContent: 'center', gap: '1rem' }}>
            <button type="submit" className={buttons.submitButton}>Register Employee</button>
            <button type="button" className={buttons.cancelButton} onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </EmployeeLayout>
  );
}
 
export default RegisterEmployeePage;
