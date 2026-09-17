import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  // BarChart,
  // Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import AddObservationForm from '../components/AddObservationForm';
import ObservationMap from '../components/ObservationMap';
import '../styles/EnvironmentalDashboard.css';

export default function EnvironmentalDashboard() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [observations, setObservations] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in
  const user = localStorage.getItem('user');
  if (!user) {
    navigate('/login');
  }

  // Fetch all projects
  useEffect(() => {
    fetchProjects();
    fetchAlerts();
  }, [fetchProjects]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://web-production-9f29d.up.railway.app/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query {
            projects {
              id
              name
              location
              projectType
              co2Baseline
              targetCo2Reduction
              createdAt
            }
          }`,
        }),
      });
      const data = await response.json();
      setProjects(data.data.projects);
      if (data.data.projects.length > 0) {
        setSelectedProject(data.data.projects[0]);
        fetchProjectData(data.data.projects[0].id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
    setLoading(false);
  };

  const fetchProjectData = async (projectId) => {
    try {
      // Fetch observations
      const obsResponse = await fetch('https://web-production-9f29d.up.railway.app/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query {
            observationsByProject(projectId: ${projectId}) {
              id
              observationType
              value
              unit
              latitude
              longitude
              notes
              recordedAt
            }
          }`,
        }),
      });
      const obsData = await obsResponse.json();
      setObservations(obsData.data.observationsByProject);

      // Fetch impact metrics
      const metResponse = await fetch('https://web-production-9f29d.up.railway.app/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query {
            impactMetricsByProject(projectId: ${projectId}) {
              id
              metricType
              value
              unit
              calculatedAt
            }
          }`,
        }),
      });
      const metData = await metResponse.json();
      setMetrics(metData.data.impactMetricsByProject);
    } catch (error) {
      console.error('Error fetching project data:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('https://web-production-9f29d.up.railway.app/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query {
            activeAlerts {
              id
              projectId
              alertType
              severity
              description
              createdAt
            }
          }`,
        }),
      });
      const data = await response.json();
      setAlerts(data.data.activeAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleProjectChange = (project) => {
    setSelectedProject(project);
    fetchProjectData(project.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Process data for CO2 chart
  const co2Data = metrics
    .filter((m) => m.metricType === 'co2_sequestered')
    .map((m) => ({
      date: new Date(m.calculatedAt).toLocaleDateString(),
      co2: parseFloat(m.value),
    }));

  // Process data for observation types
  const observationCounts = {};
  observations.forEach((obs) => {
    observationCounts[obs.observationType] =
      (observationCounts[obs.observationType] || 0) + 1;
  });

  const observationData = Object.entries(observationCounts).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <div className="env-dashboard-container">
      <header className="env-dashboard-header">
        <h1>🌱 Environmental Impact Hub</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <main className="env-dashboard-main">
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <section className="alerts-section">
            <h2>⚠️ Active Alerts</h2>
            <div className="alerts-list">
              {alerts.map((alert) => (
                <div key={alert.id} className={`alert-item alert-${alert.severity}`}>
                  <div className="alert-type">{alert.alertType}</div>
                  <div className="alert-description">{alert.description}</div>
                  <div className="alert-time">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Project Selection */}
        <section className="projects-section">
          <h2>📊 Projects</h2>
          {loading && <p>Loading...</p>}
          <div className="projects-list">
            {projects.map((project) => (
              <button
                key={project.id}
                className={`project-card ${selectedProject?.id === project.id ? 'active' : ''}`}
                onClick={() => handleProjectChange(project)}
              >
                <div className="project-name">{project.name}</div>
                <div className="project-type">{project.projectType}</div>
                <div className="project-location">📍 {project.location}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Selected Project Details */}
        {selectedProject && (
          <>
            <section className="project-details">
              <h2>Project: {selectedProject.name}</h2>
              <div className="project-stats">
                <div className="stat-box">
                  <div className="stat-label">Baseline CO2</div>
                  <div className="stat-value">{selectedProject.co2Baseline} tons</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Target Reduction</div>
                  <div className="stat-value">{selectedProject.targetCo2Reduction} tons</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Observations</div>
                  <div className="stat-value">{observations.length}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Impact Metrics</div>
                  <div className="stat-value">{metrics.length}</div>
                </div>
              </div>
            </section>
            {/* Add Observation Form */}
              <AddObservationForm
                projectId={selectedProject.id}
                onObservationAdded={() => fetchProjectData(selectedProject.id)}
              />
              {/* Observation Map */}
            <section className="map-section">
              <h2>📍 Observation Locations</h2>
              <ObservationMap observations={observations} projectLocation={selectedProject.location} />
            </section>
            {/* CO2 Sequestration Chart */}
            {co2Data.length > 0 && (
              <section className="chart-section">
                <h2>CO2 Sequestration Over Time</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={co2Data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="co2"
                      stroke="#82ca9d"
                      name="CO2 (tons/year)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </section>
            )}

            {/* Observation Types Chart */}
            {observationData.length > 0 && (
              <section className="chart-section">
                <h2>Observation Types Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={observationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {observationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </section>
            )}

            {/* Recent Observations */}
            <section className="observations-section">
              <h2>📋 Recent Observations</h2>
              {observations.length === 0 ? (
                <p>No observations yet</p>
              ) : (
                <div className="observations-list">
                  {observations.slice(0, 10).map((obs) => (
                    <div key={obs.id} className="observation-item">
                      <div className="obs-type">{obs.observationType}</div>
                      <div className="obs-value">
                        {obs.value} {obs.unit}
                      </div>
                      <div className="obs-location">
                        📍 {obs.latitude}, {obs.longitude}
                      </div>
                      <div className="obs-date">
                        {new Date(obs.recordedAt).toLocaleDateString()}
                      </div>
                      {obs.notes && <div className="obs-notes">📝 {obs.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}