function svgToDataUrl(svg) {
  try {
    const encoded = typeof window !== 'undefined' && window.btoa 
      ? window.btoa(unescape(encodeURIComponent(svg)))
      : Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${encoded}`;
  } catch (e) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}

export function generateJamabandiSvgDataUrl(record = {}) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 520" width="700" height="520">
    <defs>
      <linearGradient id="parchment" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f5f0e3"/>
        <stop offset="50%" stop-color="#ede4d1"/>
        <stop offset="100%" stop-color="#e6dbbf"/>
      </linearGradient>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d5c8ab" stroke-width="0.5" opacity="0.3"/>
      </pattern>
    </defs>

    <!-- Document Paper Background -->
    <rect width="700" height="520" fill="url(#parchment)"/>
    <rect width="700" height="520" fill="url(#grid)"/>

    <!-- Document Border & Vignette -->
    <rect x="15" y="15" width="670" height="490" fill="none" stroke="#b09f7a" stroke-width="2" stroke-dasharray="4 2"/>
    <rect x="20" y="20" width="660" height="480" fill="none" stroke="#8c7851" stroke-width="1.5"/>

    <!-- Official Header Banner -->
    <g transform="translate(350, 48)" text-anchor="middle">
      <text font-family="Georgia, serif" font-weight="bold" font-size="16" fill="#1b4332">उत्तर प्रदेश सरकार — राजस्व विभाग</text>
      <text font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#2d6a4f" y="18">REVENUE DEPARTMENT, GOVT OF UTTAR PRADESH</text>
      <text font-family="Georgia, serif" font-size="13" font-weight="bold" fill="#004526" y="36">अधिकार अभिलेख (खतौनी / जमाबंदी) — RECORD OF RIGHTS (RoR)</text>
    </g>

    <!-- State Emblem Watermark Symbol -->
    <circle cx="65" cy="55" r="22" fill="none" stroke="#1b4332" stroke-width="1.5"/>
    <text x="65" y="58" font-family="serif" font-size="10" text-anchor="middle" fill="#1b4332" font-weight="bold">GOVT</text>

    <!-- Village & District Metadata Sub-Header -->
    <g font-family="Arial, sans-serif" font-size="11" fill="#333333">
      <text x="35" y="100"><tspan font-weight="bold" fill="#1b4332">जनपद (District):</tspan> ${record.district || 'Lucknow'}</text>
      <text x="240" y="100"><tspan font-weight="bold" fill="#1b4332">तहसील (Tehsil):</tspan> ${record.tehsil || 'Sadar'}</text>
      <text x="440" y="100"><tspan font-weight="bold" fill="#1b4332">ग्राम (Village):</tspan> ${record.village || 'Rampur'}</text>
    </g>

    <!-- ULPIN Code Bar (At x:120, y:110, w:260, h:35) -->
    <g transform="translate(120, 110)">
      <rect width="260" height="32" fill="#fff" stroke="#1b4332" stroke-width="1" rx="3"/>
      <text x="10" y="21" font-family="monospace" font-weight="bold" font-size="13" fill="#004526">ULPIN: ${record.ulpin || 'UP-LKO-421-9921'}</text>
    </g>

    <!-- Primary Revenue Table Grid -->
    <g transform="translate(35, 155)">
      <!-- Table Header Row -->
      <rect x="0" y="0" width="630" height="28" fill="#d8ccb0" stroke="#8c7851" stroke-width="1"/>
      <line x1="120" y1="0" x2="120" y2="280" stroke="#8c7851" stroke-width="1"/>
      <line x1="240" y1="0" x2="240" y2="280" stroke="#8c7851" stroke-width="1"/>
      <line x1="430" y1="0" x2="430" y2="280" stroke="#8c7851" stroke-width="1"/>
      
      <!-- Column Labels -->
      <text x="60" y="18" font-family="Georgia, serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#1b4332">1. खसरा संख्या</text>
      <text x="180" y="18" font-family="Georgia, serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#1b4332">2. खाता संख्या</text>
      <text x="335" y="18" font-family="Georgia, serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#1b4332">3. खातेदार का नाम व अंश</text>
      <text x="530" y="18" font-family="Georgia, serif" font-size="11" font-weight="bold" text-anchor="middle" fill="#1b4332">4. विवरण व क्षेत्रफल</text>

      <!-- Table Outer Border -->
      <rect x="0" y="0" width="630" height="280" fill="none" stroke="#8c7851" stroke-width="1.5"/>

      <!-- Row 1 Lines -->
      <line x1="0" y1="90" x2="630" y2="90" stroke="#b8a888" stroke-width="1"/>
      <line x1="0" y1="170" x2="630" y2="170" stroke="#b8a888" stroke-width="1"/>

      <!-- Cell Content 1: Khasra No -->
      <text x="15" y="50" font-family="monospace" font-weight="bold" font-size="16" fill="#111">
        ${record.khasra_no || '42/1'}
      </text>
      <text x="15" y="70" font-family="sans-serif" font-size="10" fill="#666">
        (सर्वेक्षण संख्या)
      </text>

      <!-- Cell Content 2: Khata No -->
      <text x="140" y="50" font-family="monospace" font-weight="bold" font-size="16" fill="#111">
        ${record.khata_no || '104'}
      </text>
      <text x="140" y="70" font-family="sans-serif" font-size="10" fill="#666">
        (खेवट/खाता)
      </text>

      <!-- Cell Content 3: Landowner Names & Shares -->
      <g transform="translate(250, 45)">
        <text font-family="Georgia, serif" font-size="13" font-weight="bold" fill="#1a1a1a">
          ${(record.owner_names || ['Ramesh Kumar', 'Suresh Kumar']).join(' (अंश ' + ((record.owner_shares || [0.5])[0]) + '), ')}
        </text>
        <text y="22" font-family="sans-serif" font-size="11" fill="#444">
          निवासी: ${record.village || 'Rampur'}, ${record.tehsil || 'Sadar'} (स्थायी खातेदार)
        </text>
      </g>

      <!-- Cell Content 4: Plot Area -->
      <g transform="translate(85, 185)">
        <text font-family="monospace" font-weight="bold" font-size="15" fill="#004526">
          ${record.plot_area || 2428.11} SqM (${record.plot_area_legacy || '1 Bigha'})
        </text>
      </g>

      <!-- Cell Content 5: Land Classification -->
      <g transform="translate(345, 185)">
        <text font-family="Georgia, serif" font-weight="bold" font-size="13" fill="#895100">
          श्रेणी: ${record.land_classification || 'Agricultural (कृषि)'}
        </text>
      </g>

      <!-- Mutation Notes -->
      <g transform="translate(15, 235)">
        <text font-family="sans-serif" font-size="10" fill="#555">
          नामांतरण विवरण: ${record.mutation_details || 'नामांतरण आदेश स्वीकृत'}
        </text>
      </g>
    </g>

    <!-- Official Stamp & Signature Overlay at Bottom Right -->
    <g transform="translate(520, 420)">
      <circle cx="45" cy="35" r="32" fill="none" stroke="#2b3a8c" stroke-width="2" stroke-dasharray="8 2" opacity="0.85"/>
      <circle cx="45" cy="35" r="28" fill="none" stroke="#2b3a8c" stroke-width="1" opacity="0.85"/>
      <text x="45" y="28" font-family="Arial" font-size="8" font-weight="bold" text-anchor="middle" fill="#2b3a8c" opacity="0.85">कार्यालय तहसीलदार</text>
      <text x="45" y="42" font-family="Arial" font-size="8" font-weight="bold" text-anchor="middle" fill="#2b3a8c" opacity="0.85">लखनऊ — उ० प्र०</text>
      <text x="45" y="52" font-family="Arial" font-size="7" text-anchor="middle" fill="#2b3a8c" opacity="0.85">SEAL &amp; SIGN</text>
      <path d="M 10 50 Q 30 20 60 45 T 100 30" fill="none" stroke="#102a43" stroke-width="2" opacity="0.8"/>
      <text x="45" y="72" font-family="sans-serif" font-size="9" text-anchor="middle" fill="#333" font-weight="bold">राजस्व अधिकारी हस्ताक्षर</text>
    </g>

    <!-- Barcode at Bottom Left -->
    <g transform="translate(35, 455)">
      <rect x="0" y="0" width="160" height="25" fill="#111"/>
      <rect x="5" y="2" width="4" height="21" fill="#fff"/>
      <rect x="12" y="2" width="2" height="21" fill="#fff"/>
      <rect x="18" y="2" width="6" height="21" fill="#fff"/>
      <rect x="28" y="2" width="2" height="21" fill="#fff"/>
      <rect x="34" y="2" width="5" height="21" fill="#fff"/>
      <rect x="44" y="2" width="3" height="21" fill="#fff"/>
      <rect x="52" y="2" width="7" height="21" fill="#fff"/>
      <rect x="64" y="2" width="2" height="21" fill="#fff"/>
      <rect x="70" y="2" width="4" height="21" fill="#fff"/>
      <rect x="80" y="2" width="3" height="21" fill="#fff"/>
      <rect x="90" y="2" width="6" height="21" fill="#fff"/>
      <rect x="102" y="2" width="2" height="21" fill="#fff"/>
      <rect x="110" y="2" width="5" height="21" fill="#fff"/>
      <rect x="120" y="2" width="4" height="21" fill="#fff"/>
      <rect x="130" y="2" width="2" height="21" fill="#fff"/>
      <rect x="140" y="2" width="5" height="21" fill="#fff"/>
      <rect x="150" y="2" width="3" height="21" fill="#fff"/>
      <text x="80" y="38" font-family="monospace" font-size="9" text-anchor="middle" fill="#555">DILRMP-REF-${record.id || 'ROR-001'}</text>
    </g>
  </svg>
  `;
  return svgToDataUrl(svg);
}

export function generateSaleDeedSvgDataUrl(record = {}) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 520" width="700" height="520">
    <rect width="700" height="520" fill="#fcfaf2"/>
    <rect x="15" y="15" width="670" height="490" fill="none" stroke="#895100" stroke-width="2"/>
    <rect x="22" y="22" width="656" height="476" fill="none" stroke="#004526" stroke-width="1"/>
    
    <g transform="translate(350, 50)" text-anchor="middle">
      <text font-family="Georgia, serif" font-weight="bold" font-size="16" fill="#895100">STAMP DUTY PAID - REGISTRATION &amp; STAMPS DEPARTMENT</text>
      <text font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#004526" y="20">DEED OF CONVEYANCE / ABSOLUTE SALE DEED</text>
    </g>

    <g transform="translate(50, 110)">
      <rect width="600" height="40" fill="#f0ebd9" stroke="#895100" stroke-width="1" rx="4"/>
      <text x="15" y="25" font-family="monospace" font-weight="bold" font-size="13" fill="#004526">REGISTRATION NO: ${record.registration_number || '984/2021/SUB-REG'}</text>
    </g>

    <g transform="translate(50, 170)">
      <rect width="600" height="50" fill="#fff" stroke="#ccc" stroke-width="1"/>
      <text x="15" y="20" font-family="sans-serif" font-size="11" fill="#777">EXECUTANT (SELLER / VENDOR)</text>
      <text x="15" y="40" font-family="Georgia, serif" font-weight="bold" font-size="15" fill="#111">${record.seller_name || 'M. Murugan'}</text>
    </g>

    <g transform="translate(50, 240)">
      <rect width="600" height="50" fill="#fff" stroke="#ccc" stroke-width="1"/>
      <text x="15" y="20" font-family="sans-serif" font-size="11" fill="#777">CLAIMANT (BUYER / PURCHASER)</text>
      <text x="15" y="40" font-family="Georgia, serif" font-weight="bold" font-size="15" fill="#111">${record.buyer_name || 'K. Raman'}</text>
    </g>

    <g transform="translate(50, 310)">
      <rect width="600" height="50" fill="#e8f5e9" stroke="#2e7d32" stroke-width="1"/>
      <text x="15" y="20" font-family="sans-serif" font-size="11" fill="#2e7d32">CONSIDERATION AMOUNT (VALUATION)</text>
      <text x="15" y="40" font-family="monospace" font-weight="bold" font-size="16" fill="#004526">₹ ${Number(record.sale_value_inr || 1500000).toLocaleString('en-IN')}</text>
    </g>

    <g transform="translate(520, 410)">
      <circle cx="45" cy="35" r="30" fill="none" stroke="#895100" stroke-width="2"/>
      <text x="45" y="32" font-family="Arial" font-size="8" font-weight="bold" text-anchor="middle" fill="#895100">SUB-REGISTRAR</text>
      <text x="45" y="45" font-family="Arial" font-size="7" text-anchor="middle" fill="#895100">OFFICE SEAL</text>
    </g>
  </svg>
  `;
  return svgToDataUrl(svg);
}

export function generateMutationSvgDataUrl(record = {}) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 520" width="700" height="520">
    <rect width="700" height="520" fill="#f4f6f0"/>
    <rect x="15" y="15" width="670" height="490" fill="none" stroke="#2d6a4f" stroke-width="2"/>
    
    <g transform="translate(350, 50)" text-anchor="middle">
      <text font-family="Georgia, serif" font-weight="bold" font-size="16" fill="#004526">COURT OF THE TEHSILDAR / REVENUE OFFICER</text>
      <text font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#895100" y="20">MUTATION REGISTER ORDER (नामांतरण पंजिका आदेश)</text>
    </g>

    <g transform="translate(50, 100)">
      <rect width="600" height="40" fill="#fff" stroke="#004526" stroke-width="1" rx="4"/>
      <text x="15" y="25" font-family="monospace" font-weight="bold" font-size="13" fill="#004526">MUTATION CASE REF: ${record.mutation_serial_number || 'MUT-2024-0012'}</text>
    </g>

    <g transform="translate(50, 160)">
      <rect width="600" height="60" fill="#fff" stroke="#ccc" stroke-width="1"/>
      <text x="15" y="20" font-family="sans-serif" font-size="11" fill="#555">TRANSFEROR (PRIOR OWNER TO BE DELETED)</text>
      <text x="15" y="44" font-family="Georgia, serif" font-weight="bold" font-size="15" fill="#c0392b">${record.transferor_prior_owner || 'M. Murugan'}</text>
    </g>

    <g transform="translate(50, 240)">
      <rect width="600" height="60" fill="#fff" stroke="#ccc" stroke-width="1"/>
      <text x="15" y="20" font-family="sans-serif" font-size="11" fill="#555">TRANSFEREE (NEW OWNER TO BE RECORDED)</text>
      <text x="15" y="44" font-family="Georgia, serif" font-weight="bold" font-size="15" fill="#2e7d32">${record.transferee_new_owner || 'K. Raman'}</text>
    </g>

    <g transform="translate(50, 320)">
      <rect width="600" height="70" fill="#fff" stroke="#ccc" stroke-width="1"/>
      <text x="15" y="20" font-family="sans-serif" font-size="11" fill="#555">ORDER SUMMARY &amp; REASON</text>
      <text x="15" y="45" font-family="sans-serif" font-size="12" fill="#333">Mutated pursuant to Registered Sale Deed Ref ${record.registration_number || '984/2021'}. No dispute logged.</text>
    </g>
  </svg>
  `;
  return svgToDataUrl(svg);
}

export function generateCadastralMapSvgDataUrl(record = {}) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 520" width="700" height="520">
    <rect width="700" height="520" fill="#1b2a4a"/>
    
    <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2c3e67" stroke-width="1"/>
    </pattern>
    <rect width="700" height="520" fill="url(#mapgrid)"/>

    <g transform="translate(350, 40)" text-anchor="middle">
      <text font-family="Arial, sans-serif" font-weight="bold" font-size="15" fill="#00e676">BHU-NAKSHA CADASTRAL MAP (FMB SKETCH)</text>
      <text font-family="monospace" font-size="11" fill="#80d8ff" y="18">SHEET: ${record.map_sheet_number || 'Sheet-04'} | CRS: ${record.projection_system || 'EPSG:4326'}</text>
    </g>

    <g transform="translate(180, 90)">
      <polygon points="100,50 280,30 320,180 140,240 60,150" fill="#00e676" fill-opacity="0.25" stroke="#00e676" stroke-width="3"/>
      <circle cx="180" cy="130" r="4" fill="#ffeb3b"/>
      <text x="180" y="115" font-family="monospace" font-weight="bold" font-size="14" text-anchor="middle" fill="#ffffff">PARCEL ${record.khasra_no || '42/1'}</text>
      <text x="180" y="150" font-family="sans-serif" font-size="11" text-anchor="middle" fill="#80d8ff">${record.plot_area || 2428.11} SqM</text>
    </g>

    <g transform="translate(40, 420)">
      <rect width="620" height="60" fill="#0f172a" stroke="#1e293b" stroke-width="1" rx="4"/>
      <text x="15" y="25" font-family="monospace" font-size="12" fill="#00e676">BOUNDING POLYGON COORDINATES (EPSG:4326):</text>
      <text x="15" y="45" font-family="monospace" font-size="10" fill="#94a3b8">[ [78.1102, 28.4501], [78.1125, 28.4508], [78.1130, 28.4485], [78.1098, 28.4490] ]</text>
    </g>
  </svg>
  `;
  return svgToDataUrl(svg);
}

export function getDocumentSvgForRecord(record = {}) {
  const docType = record.doc_type || 'RECORD_OF_RIGHTS';
  if (docType === 'CONVEYANCE_DEED') {
    return generateSaleDeedSvgDataUrl(record);
  } else if (docType === 'MUTATION_ORDER') {
    return generateMutationSvgDataUrl(record);
  } else if (docType === 'CADASTRAL_MAP') {
    return generateCadastralMapSvgDataUrl(record);
  } else {
    return generateJamabandiSvgDataUrl(record);
  }
}
