import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !workspace) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation {
            login(email: "${email}", workspace: "${workspace}") {
              token
              userId
              email
            }
          }`,
        }),
      });

      const data = await response.json();

      if (data.errors) {
        setError(data.errors[0].message);
        setLoading(false);
        return;
      }

      // Store token and user info
      localStorage.setItem('token', data.data.login.token);
      localStorage.setItem('user', JSON.stringify({
        userId: data.data.login.userId,
        email: data.data.login.email,
      }));

      navigate('/');
    } catch (err) {
      setError('Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Feedback Loop</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Workspace"
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}