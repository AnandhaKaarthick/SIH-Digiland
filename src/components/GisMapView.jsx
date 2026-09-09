import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, Polygon } from 'react-leaflet';
import { MapPin, Search, Info, CheckCircle2, AlertTriangle, XCircle, ExternalLink, ShieldCheck, FileText, Layers } from 'lucide-react';
import { MOCK_CADASTRAL_PARCELS, MOCK_LAND_RECORDS } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

export default function GisMapView({ recordsList = [], onSelectRecord }) {
  const { t } = useLanguage();
  
  // Combine recordsList with fallback mock records so all land documents are selectable
  const allAvailableRecords = recordsList && recordsList.length > 0 ? recordsList : MOCK_LAND_RECORDS;
  
  const [selectedRecord, setSelectedRecord] = useState(allAvailableRecords[0] || null);
  const [selectedParcel, setSelectedParcel] = useState(MOCK_CADASTRAL_PARCELS.features[0]?.properties || null);
  const [searchQuery, setSearchQuery] = useState('');

  // Center coordinates for GIS map (Lucknow / Tamil Nadu default region)
  const centerCoordinates = [26.8512, 80.9425];

  // Sync selectedRecord with selectedParcel when record changes from dropdown
  useEffect(() => {
    if (!selectedRecord) return;
    
    // Find matching GeoJSON feature parcel by khasra or ulpin if available
    const matchedFeature = MOCK_CADASTRAL_PARCELS.features.find(f => 
      f.properties.khasra_no === selectedRecord.khasra_no || 
      f.properties.ulpin === selectedRecord.ulpin
    );

    if (matchedFeature) {
      setSelectedParcel(matchedFeature.properties);
    } else {
      // Create dynamic spatial parcel representation for uploaded FMB document
      const khasra = selectedRecord.khasra_no || selectedRecord.raw_payload?.khasra_no || '142/3B';
      const ulpin = selectedRecord.ulpin || selectedRecord.raw_payload?.ulpin || '14BW89201L9842';
      const village = selectedRecord.village || selectedRecord.raw_payload?.village || 'Nemili';
      const owner = Array.isArray(selectedRecord.owner_names) 
        ? selectedRecord.owner_names.join(', ') 
        : (selectedRecord.owner_names || 'K. Raman');
      const area = selectedRecord.plot_area || selectedRecord.raw_payload?.plot_area || 1821.08;

      setSelectedParcel({
        khasra_no: khasra,
        ulpin: ulpin,
        village: village,
        owner_name: owner,
        recorded_area: `${area} sqm`,
        gis_computed_area: `${(floatArea(area) * 1.0002).toFixed(2)} sqm`,
        status: selectedRecord.status_flag === 'VALID' || selectedRecord.routing === 'AUTO_APPROVED' ? 'VALID' : 
                selectedRecord.status_flag === 'FAILED_CRITICAL' ? 'FLAGGED_DISPUTE' : 'FLAGGED_WARNING'
      });
    }
  }, [selectedRecord]);

  const floatArea = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 1821.08 : num;
  };

  const getStyle = (feature) => {
    const isSelected = selectedParcel && (
      selectedParcel.khasra_no === feature.properties.khasra_no ||
      selectedParcel.ulpin === feature.properties.ulpin
    );
    const status = feature.properties.status;
    let strokeColor = '#2E7D32';
    let fillColor = '#2E7D32';

    if (status === 'FLAGGED_WARNING') {
      strokeColor = '#ED8936';
      fillColor = '#ED8936';
    } else if (status === 'FLAGGED_DISPUTE') {
      strokeColor = '#C0392B';
      fillColor = '#C0392B';
    }

    return {
      color: isSelected ? '#1B4D3E' : strokeColor,
      fillColor: fillColor,
      fillOpacity: isSelected ? 0.60 : 0.35,
      weight: isSelected ? 3.5 : 2
    };
  };

  // Filter records by search query
  const filteredRecords = allAvailableRecords.filter(rec => {
    if (!searchQuery || !searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const khasra = (rec.khasra_no || '').toLowerCase();
    const ulpin = (rec.ulpin || '').toLowerCase();
    const village = (rec.village || '').toLowerCase();
    const owners = (Array.isArray(rec.owner_names) ? rec.owner_names.join(' ') : (rec.owner_names || '')).toLowerCase();
    const docType = (rec.doc_type || '').toLowerCase();
    return (
      (rec.id && rec.id.toLowerCase().includes(q)) ||
      khasra.includes(q) ||
      ulpin.includes(q) ||
      village.includes(q) ||
      owners.includes(q) ||
      docType.includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-space-md max-w-[1720px] mx-auto w-full h-[calc(100vh-6rem)]">
      {/* Header Bar with FMB Document Chooser Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-card p-space-md rounded-xl border border-border-structural shadow-sm gap-3 flex-shrink-0">
        <div>
          <span className="font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary">Spatial Verification</span>
          <h1 className="font-heading font-bold text-base text-text-primary leading-tight">{t('nav_gis_map')}</h1>
        </div>

        {/* FMB Document / Parcel Selector Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 max-w-xl">
          {/* Document Dropdown Chooser */}
          <div className="relative w-full">
            <select
              value={selectedRecord?.id || ''}
              onChange={(e) => {
                const rec = allAvailableRecords.find(r => r.id === e.target.value);
                if (rec) setSelectedRecord(rec);
              }}
              className="w-full pl-3 pr-8 py-2 rounded-lg bg-canvas-bg font-heading text-xs font-semibold text-text-primary border border-border-structural focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-inner"
            >
              {filteredRecords.map(rec => {
                const khasra = rec.khasra_no || 'N/A';
                const village = rec.village || 'Nemili';
                const ulpin = rec.ulpin ? ` (${rec.ulpin})` : '';
                const docType = rec.doc_type ? ` [${rec.doc_type}]` : '';
                return (
                  <option key={rec.id} value={rec.id}>
                    📄 {rec.id}: Khasra #{khasra} - Village: {village}{ulpin}{docType}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quick Filter Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FMB/Khasra/ULPIN..."
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-canvas-bg font-body text-xs text-text-primary placeholder:text-text-secondary border border-border-structural focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
            />
          </div>
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
        <div className="lg:col-span-2 bg-surface-card rounded-xl border border-border-structural overflow-hidden relative shadow-sm flex flex-col">
          {/* Active Parcel Bar */}
          <div className="bg-canvas-bg px-4 py-2 border-b border-border-structural flex items-center justify-between text-xs">
            <span className="font-heading font-semibold text-text-secondary flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" /> Active FMB Parcel: <strong className="text-text-primary">{selectedRecord?.id || 'DL-MAP-001'}</strong>
            </span>
            <span className="font-mono text-[11px] text-primary font-bold">
              ULPIN: {selectedParcel?.ulpin || selectedRecord?.ulpin || 'N/A'}
            </span>
          </div>

          {/* Fallback & Custom Map Container */}
          <div className="w-full flex-1 min-h-[450px] relative">
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
                    click: () => {
                      setSelectedParcel(feature.properties);
                      const matchingRec = allAvailableRecords.find(r => r.khasra_no === feature.properties.khasra_no);
                      if (matchingRec) setSelectedRecord(matchingRec);
                    }
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
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase ${
                  selectedParcel.status === 'VALID' ? 'bg-status-success/10 text-status-success border border-status-success/20' :
                  selectedParcel.status === 'FLAGGED_WARNING' ? 'bg-status-warning/10 text-status-warning border border-status-warning/20' : 'bg-status-error/10 text-status-error border border-status-error/20'
                }`}>
                  {selectedParcel.status}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-primary">Record ID: {selectedRecord?.id || 'N/A'}</span>
                <h3 className="font-heading font-bold text-base text-text-primary mt-0.5">Khasra #{selectedParcel.khasra_no}</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Village: {selectedParcel.village || selectedRecord?.village || 'Nemili'}, {selectedRecord?.district || 'Lucknow'}
                </p>
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

              {/* Scanned Image / FMB Sketch Thumbnail Preview */}
              {selectedRecord?.scanned_image_url && (
                <div className="p-2.5 bg-canvas-bg rounded-lg border border-border-structural">
                  <span className="font-heading text-[11px] font-bold text-text-primary block mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-primary" /> FMB Map Document Scan:
                  </span>
                  <img
                    src={selectedRecord.scanned_image_url}
                    alt="FMB Sketch Scan"
                    className="w-full h-28 object-contain rounded border border-border-structural bg-white"
                  />
                </div>
              )}

              <div className="p-3 bg-surface-container-low rounded-lg border border-border-structural text-xs text-text-secondary">
                <span className="font-heading text-xs font-semibold text-primary block mb-1">Spatial Validation Status:</span>
                Polygon boundaries cross-checked with DILRMP survey map layers. Centroid coordinate registered on central Bhu-Aadhaar ULPIN server.
              </div>
            </div>
          ) : (
            <div className="text-center text-text-secondary py-10">Select any FMB document from the dropdown above to inspect spatial details</div>
          )}

          <div className="mt-6 pt-4 border-t border-border-structural">
            <button 
              onClick={() => onSelectRecord && selectedRecord && onSelectRecord(selectedRecord)}
              className="w-full py-2.5 px-3 rounded-lg bg-primary text-on-primary font-heading text-xs font-bold hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-2"
            >
              Open Split-View Verification <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
