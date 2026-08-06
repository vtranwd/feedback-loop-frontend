import { useState } from 'react';
import '../styles/AddObservationForm.css';

export default function AddObservationForm({ projectId, onObservationAdded }) {
  const [formData, setFormData] = useState({
    observationType: 'soil_health',
    value: '',
    unit: '',
    latitude: '',
    longitude: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const observationTypes = [
    { value: 'soil_health', label: 'Soil Health (pH)' },
    { value: 'tree_count', label: 'Tree Count' },
    { value: 'wildlife', label: 'Wildlife Sightings' },
    { value: 'water_quality', label: 'Water Quality' },
    { value: 'carbon_sequestration', label: 'Carbon Sequestration' },
    { value: 'biodiversity', label: 'Biodiversity' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate required fields
    if (!formData.value || !formData.unit) {
      setError('Value and unit are required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation {
            createObservation(
              projectId: ${projectId}
              observationType: "${formData.observationType}"
              value: "${formData.value}"
              unit: "${formData.unit}"
              latitude: "${formData.latitude || null}"
              longitude: "${formData.longitude || null}"
              notes: "${formData.notes || ''}"
            ) {
              id
              observationType
              value
              unit
              recordedAt
            }
          }`,
        }),
      });

      const data = await response.json();

      if (data.errors) {
        setError(data.errors[0].message);
      } else {
        setSuccess('Observation added successfully!');
        // Reset form
        setFormData({
          observationType: 'soil_health',
          value: '',
          unit: '',
          latitude: '',
          longitude: '',
          notes: '',
        });
        // Notify parent to refresh data
        if (onObservationAdded) {
          onObservationAdded();
        }
      }
    } catch (err) {
      setError('Failed to add observation');
    }
    setLoading(false);
  };

  return (
    <div className="add-observation-form">
      <h3>📋 Add New Observation</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="observationType">Observation Type</label>
          <select
            id="observationType"
            name="observationType"
            value={formData.observationType}
            onChange={handleChange}
          >
            {observationTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="value">Value</label>
            <input
              id="value"
              type="number"
              name="value"
              placeholder="e.g., 7.5"
              value={formData.value}
              onChange={handleChange}
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="unit">Unit</label>
            <input
              id="unit"
              type="text"
              name="unit"
              placeholder="e.g., pH, count, ppm"
              value={formData.unit}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="latitude">Latitude</label>
            <input
              id="latitude"
              type="number"
              name="latitude"
              placeholder="e.g., 37.7749"
              value={formData.latitude}
              onChange={handleChange}
              step="0.00001"
            />
          </div>
          <div className="form-group">
            <label htmlFor="longitude">Longitude</label>
            <input
              id="longitude"
              type="number"
              name="longitude"
              placeholder="e.g., -122.4194"
              value={formData.longitude}
              onChange={handleChange}
              step="0.00001"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            placeholder="Add any additional notes..."
            value={formData.notes}
            onChange={handleChange}
            rows={3}
          />
        </div>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : '✅ Add Observation'}
        </button>
      </form>
    </div>
  );
}