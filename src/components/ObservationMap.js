import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import '../styles/ObservationMap.css';

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function ObservationMap({ observations, projectLocation }) {
  if (!observations || observations.length === 0) {
    return (
      <div className="map-placeholder">
        <p>No observations with location data yet</p>
      </div>
    );
  }

  // Filter observations with latitude and longitude
  const validObservations = observations.filter(
    (obs) => obs.latitude && obs.longitude
  );

  if (validObservations.length === 0) {
    return (
      <div className="map-placeholder">
        <p>No observations with GPS coordinates yet</p>
      </div>
    );
  }

  // Calculate center of map based on observations
  const center = [
    validObservations.reduce((sum, obs) => sum + parseFloat(obs.latitude), 0) /
      validObservations.length,
    validObservations.reduce((sum, obs) => sum + parseFloat(obs.longitude), 0) /
      validObservations.length,
  ];

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      className="observation-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validObservations.map((obs) => (
        <Marker key={obs.id} position={[parseFloat(obs.latitude), parseFloat(obs.longitude)]}>
          <Popup>
            <div className="popup-content">
              <h4>{obs.observationType}</h4>
              <p>
                <strong>Value:</strong> {obs.value} {obs.unit}
              </p>
              <p>
                <strong>Date:</strong> {new Date(obs.recordedAt).toLocaleDateString()}
              </p>
              {obs.notes && (
                <p>
                  <strong>Notes:</strong> {obs.notes}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}