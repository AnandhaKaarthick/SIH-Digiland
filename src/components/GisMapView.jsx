import React, { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, Polygon } from 'react-leaflet';
import { MapPin, Search, Info, CheckCircle2, AlertTriangle, XCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { MOCK_CADASTRAL_PARCELS, MOCK_LAND_RECORDS } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

export default function GisMapView({ onSelectRecord }) {
  const { t } = useLanguage();
  const [selectedParcel, setSelectedParcel] = useState(MOCK_CADASTRAL_PARCELS.features[0].properties);
  const [searchKhasra, setSearchKhasra] = useState('');

  const centerCoordinates = [26.8512, 80.9425]; // Lucknow Village Coordinates

  const getStyle = (feature) => {
    const status = feature.properties.status;
    if (status === 'VALID') {
      return { color: '#2E7D32', fillColor: '#2E7D32', fillOpacity: 0.35, weight: 2 };
    } else if (status === 'FLAGGED_WARNING') {
      return { color: '#ED8936', fillColor: '#ED8936', fillOpacity: 0.40, weight: 2 };
    } else {
      return { color: '#C0392B', fillColor: '#C0392B', fillOpacity: 0.45, weight: 2 };
    }
  };

  return (
    <div className="flex flex-col gap-space-md max-w-[1720px] mx-auto w-full h-[calc(100vh-6rem)]">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-surface-card p-space-md rounded-xl border border-border-structural shadow-sm flex-shrink-0">
        <div>
          <span className="font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary">Spatial Verification</span>
          <h1 className="font-heading font-bold text-base text-text-primary leading-tight">{t('nav_gis_map')}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-status-success inline-block"></span> Validated
            <span className="w-2.5 h-2.5 rounded-full bg-status-warning inline-block ml-2"></span> Flagged
            <span className="w-2.5 h-2.5 rounded-full bg-status-error inline-block ml-2"></span> Mismatch / Dispute
          </div>
        </div>
      </div>

      {/* Main Grid: Left Map + Right Parcel Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md flex-1 min-h-0">
        {/* Left GIS Leaflet Map (2 Columns) */}
        <div className="lg:col-span-2 bg-surface-card rounded-xl border border-border-structural overflow-hidden relative shadow-sm">
          {/* Fallback & Custom Map Container */}
          <div className="w-full h-full min-h-[500px] relative">
            <MapContainer 
              center={centerCoordinates} 
              zoom={16} 
              style={{ width: '100%', height: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <GeoJSON 
                data={MOCK_CADASTRAL_PARCELS}
                style={getStyle}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    click: () => setSelectedParcel(feature.properties)
                  });
                }}
              />
            </MapContainer>
          </div>
        </div>

        {/* Right Panel: Selected Parcel Details & ULPIN Card */}
        <div className="bg-surface-card rounded-xl border border-border-structural p-space-lg flex flex-col justify-between shadow-sm overflow-y-auto">
          {selectedParcel ? (
            <div className="flex flex-col gap-space-md">
              <div className="flex items-center justify-between pb-space-xs border-b border-border-structural">
                <span className="font-mono text-xs font-bold text-primary px-2.5 py-1 rounded bg-primary-container text-on-primary">
                  ULPIN: {selectedParcel.ulpin}
                </span>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                  selectedParcel.status === 'VALID' ? 'bg-status-success/10 text-status-success' :
                  selectedParcel.status === 'FLAGGED_WARNING' ? 'bg-status-warning/10 text-status-warning' : 'bg-status-error/10 text-status-error'
                }`}>
                  {selectedParcel.status}
                </span>
              </div>

              <div>
                <h3 className="font-heading font-bold text-base text-text-primary">Khasra #{selectedParcel.khasra_no}</h3>
                <p className="text-xs text-text-secondary mt-0.5">Village: {selectedParcel.village}, Sadar Tehsil, Lucknow</p>
              </div>

              <div className="bg-canvas-bg p-3 rounded-lg border border-border-structural/80 flex flex-col gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary font-semibold">Committed Landowner:</span>
                  <span className="font-heading font-semibold text-text-primary">{selectedParcel.owner_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary font-semibold">Recorded Plot Area:</span>
                  <span className="font-mono text-text-primary">{selectedParcel.recorded_area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary font-semibold">GIS Computed Polygon Area:</span>
                  <span className="font-mono text-text-primary font-bold">{selectedParcel.gis_computed_area}</span>
                </div>
              </div>

              <div className="p-3 bg-surface-container-low rounded-lg border border-border-structural text-xs text-text-secondary">
                <span className="font-heading text-xs font-semibold text-primary block mb-1">Spatial Validation Status:</span>
                Polygon boundaries cross-checked with DILRMP survey map layers. Centroid coordinate registered on central Bhu-Aadhaar ULPIN server.
              </div>
            </div>
          ) : (
            <div className="text-center text-text-secondary py-10">Click any parcel polygon on the map to inspect spatial details</div>
          )}

          <div className="mt-6 pt-4 border-t border-border-structural">
            <button 
              onClick={() => onSelectRecord && onSelectRecord(MOCK_LAND_RECORDS[0])}
              className="w-full py-2 px-3 rounded-lg bg-primary text-on-primary font-heading text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              Open Split-View Verification <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
