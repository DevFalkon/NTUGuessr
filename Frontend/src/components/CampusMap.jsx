import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Tooltip,
  Polyline,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


// Fix for default marker not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const yellowIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const CampusMap = ({ onGuess, actual, difficulty, position, setPosition }) => {

  const GuessMarker = () => {
    useMapEvents({
      click(e) {
        if(position) return;
        const { lat, lng } = e.latlng;
        setPosition({ lat, lng });
        onGuess(lat, lng);
      },
    });
    return position ? (
      <Marker position={position}>
        <Tooltip>You guessed here</Tooltip>
      </Marker>
    ) : null;
  };

  const tileLayerUrl =
    difficulty === 'easy' 
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  const attribution =
    difficulty === 'easy'
      ? 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics'
      : '© <a href="https://carto.com/">CARTO</a>';

  return (
    <MapContainer
      center={[1.3483, 103.6831]}
      zoom={17}
      zoomControl={false}
      minZoom={16}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url={tileLayerUrl} attribution={attribution} />
      <GuessMarker />
      {actual && (
        <Marker position={[actual.lat, actual.lng]} icon={yellowIcon}>
          <Tooltip>Actual Location</Tooltip>
        </Marker>
      )}
      {position && actual && (
        <Polyline
          positions={[[position.lat, position.lng], [actual.lat, actual.lng]]}
          pathOptions={{ color: 'yellow', dashArray: '6, 6' }}
        />
      )}
    </MapContainer>
  );
};


export default CampusMap;
