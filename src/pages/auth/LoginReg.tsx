import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginRegPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5003";

    const endpoint = `${BASE_URL}/api/auth/${isLogin ? 'login' : 'register'}`;

    const body = isLogin
      ? { email: formData.email, password: formData.password }
      : { ...formData };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      const token = data?.data?.token;
      const role = data?.data?.user?.role;
      const user = data?.data?.user;

      if (!token) {
        throw new Error('Token not received from server');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('user', JSON.stringify(user));

      if (isLogin) {
        toast.success('Login successful!');
        setTimeout(() => {
          window.location.href = '/blogs';
        }, 1000);
      } else {
        toast.success('Registration successful! Please login.');
        setIsLogin(true);
        setFormData({ name: '', email: '', password: '' });
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="card p-4 shadow-sm" style={{ width: 400 }}>
        <h2 className="text-center mb-4">{isLogin ? 'Login' : 'Register'}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="mt-3 text-center">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button className="btn btn-link p-0" onClick={toggleMode}>
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginRegPage;
