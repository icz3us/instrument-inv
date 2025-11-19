import { useState } from 'react';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import styles from './LoginForm.module.css';

const LoginForm = ({ onLogin, loading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Email"
        id="email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
        required
      />
      
      <Input
        label="Password"
        id="password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your password"
        required
      />
      
      {error && <div className={styles.error}>{error}</div>}
      
      <Button 
        type="submit" 
        variant="primary" 
        size="medium" 
        disabled={loading}
        className={styles.submitButton}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;