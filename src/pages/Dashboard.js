import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [feedbackText, setFeedbackText] = useState('');
  const [source, setSource] = useState('slack');
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in
  const user = localStorage.getItem('user');
  if (!user) {
    navigate('/login');
  }

  // Fetch feedback on mount
  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://web-production-9f29d.up.railway.app/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query {
            listFeedback(pagination: { limit: 10, offset: 0 }) {
              items {
                id
                text
                source
                createdAt
              }
              total
            }
          }`,
        }),
      });
      const result = await response.json();
      if (result.data && result.data.listFeedback) {
        setFeedbackList(result.data.listFeedback.items);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
    setLoading(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!feedbackText.trim()) {
      alert('Please enter feedback');
      return;
    }

    setCreating(true);
    try {
      await fetch('https://web-production-9f29d.up.railway.app/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation {
            createFeedback(text: "${feedbackText}", source: "${source}") {
              id
              text
              createdAt
            }
          }`,
        }),
      });
      setFeedbackText('');
      fetchFeedback();
    } catch (error) {
      console.error('Error creating feedback:', error);
    }
    setCreating(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Feedback Loop</h1>
        <button onClick={handleLogout}>Logout</button>
        <a href="/environmental" className="nav-link">🌱 Environmental Hub</a>
      </header>

      <main className="dashboard-main">
        <section className="feedback-form">
          <h2>Submit Feedback</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              placeholder="Enter your feedback..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
            />
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="slack">Slack</option>
              <option value="email">Email</option>
              <option value="survey">Survey</option>
              <option value="interview">Interview</option>
            </select>
            <button type="submit" disabled={creating}>
              {creating ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </section>

        <section className="feedback-list">
          <h2>Recent Feedback</h2>
          {loading && <p>Loading...</p>}
          {feedbackList.length === 0 && !loading && <p>No feedback yet</p>}
          <ul>
            {feedbackList.map((feedback) => (
              <li key={feedback.id} className="feedback-item">
                <div className="feedback-text">{feedback.text}</div>
                <div className="feedback-meta">
                  <span className="source">{feedback.source}</span>
                  <span className="date">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}