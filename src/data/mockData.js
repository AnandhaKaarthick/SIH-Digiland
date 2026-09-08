// DigiLand Seed Data & Mock Repositories
// Contains clean sample land records for all 4 document schemas matching user payload definitions
import { getDocumentSvgForRecord } from '../utils/documentSvgGenerator';

export const MOCK_GOV_GATEWAYS = [
  { id: "lgd", name: "LGD Master (Local Gov Directory)", status: "Active", latency: "24ms", version: "v2026.1" },
  { id: "ngdrs", name: "NGDRS / SRO Deed API", status: "Sync Active", uptime: "99.98%", version: "v4.1" },
  { id: "postgis", name: "PostGIS & Bhu-Naksha Vector Engine", status: "Online", spatialIndex: "GiST Active", version: "PostGIS 3.4" },
  { id: "crypto", name: "SHA-256 Immutable Ledger", status: "Verified", blockCount: 819420, hash: "a4f8...9c12" }
];

export const MOCK_USERS = [
  { id: "u1", name: "Rajesh Sharma, IRS", email: "rajesh.sharma@rev.gov.in", role: "tehsildar", district: "Sriperumbudur", active: true, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" },
  { id: "u2", name: "Vikram Singh Patwari", email: "vikram.singh@rev.gov.in", role: "patwari", district: "Sriperumbudur", active: true, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" },
  { id: "u3", name: "Sunita Verma", email: "sunita.verma@rev.gov.in", role: "clerk", district: "Sriperumbudur", active: true, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" },
  { id: "u4", name: "Citizen Public Access", email: "citizen@domain.in", role: "citizen", district: "State-Wide", active: true, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" }
];

// 8 Clean Sample Records (2 per document schema type)
export const RAW_MOCK_LAND_RECORDS = [
  // -------------------------------------------------------------
  // 1. RECORD OF RIGHTS (RoR Sample 1)
  // -------------------------------------------------------------
  {
    id: "DL-ROR-001",
    doc_type: "RECORD_OF_RIGHTS",
    document_id: "DOC-ROR-489",
    khata_no: "489",
    khasra_no: "142/3B",
    ulpin: "14BW89201L9842",
    village: "Nemili",
    tehsil: "Sriperumbudur",
    district: "Kanchipuram",
    state: "Tamil Nadu",
    plot_area: 1821.08,
    plot_area_legacy: "0.45 Acre (1821.08 sqm)",
    land_classification: "Agricultural (Wet / Nanja)",
    owner_names: ["K. Raman"],
    owner_shares: [1.0],
    confidence_score: 95.0,
    status_flag: "VALID",
    routing: "AUTO_APPROVED",
    priority_level: "LOW_PRIORITY",
    scoring_breakdown: { ocr_score: 96, rules_score: 100, database_gis_score: 95, deduplication_score: 100, area_rule_passed: true, share_rule_passed: true, share_sum: "1.00" },
    payload: {
      khata_number: "489",
      parcels: [
        {
          khasra_survey_number: "142/3B",
          base_survey_no: "142",
          sub_division: "3B",
          bhu_aadhaar_ulpin: "14BW89201L9842",
          plot_area: { raw_recorded: "0.45 Acre", metric_sqm: 1821.08, metric_hectares: 0.1821 },
          land_classification: "Agricultural",
          soil_type: "Wet / Nanja",
          irrigation_source: "Government Canal"
        }
      ],
      ownership_details: [
        { owner_name: "K. Raman", relationship_type: "Son of", relative_name: "M. Murugan", share_fraction: 1.0, is_primary_owner: true }
      ],
      revenue_taxation: { annual_assessment_inr: 85.50, cess_amount_inr: 12.00, tax_status: "PAID" },
      remarks_kaifiyat: "Bank loan lien active under SBI branch ref 2022/441"
    }
  },

  // -------------------------------------------------------------
  // 1. RECORD OF RIGHTS (RoR Sample 2)
  // -------------------------------------------------------------
  {
    id: "DL-ROR-002",
    doc_type: "RECORD_OF_RIGHTS",
    document_id: "DOC-ROR-00229",
    khata_no: "00229",
    khasra_no: "117/2",
    ulpin: "75QA02657Q4428",
    village: "Kondhali",
    tehsil: "Fatehpur",
    district: "Kanchipuram",
    state: "Tamil Nadu",
    plot_area: 19091.0,
    plot_area_legacy: "4.72 Acre (1.9091 Hectare)",
    land_classification: "Agricultural (Irrigated)",
    owner_names: ["Kavita Naidu", "Arumugam Kumar"],
    owner_shares: [0.5, 0.5],
    confidence_score: 83.0,
    status_flag: "FLAGGED_WARNING",
    routing: "REQUIRES_REVIEW",
    priority_level: "MEDIUM_PRIORITY",
    scoring_breakdown: { ocr_score: 83, rules_score: 100, database_gis_score: 85, deduplication_score: 100, area_rule_passed: true, share_rule_passed: true, share_sum: "1.00" },
    payload: {
      khata_number: "00229",
      parcels: [
        {
          khasra_survey_number: "117/2",
          base_survey_no: "117",
          sub_division: "2",
          bhu_aadhaar_ulpin: "75QA02657Q4428",
          plot_area: { raw_recorded: "4.72 Acre", metric_sqm: 19091.0, metric_hectares: 1.9091 },
          land_classification: "Agricultural (Irrigated)",
          soil_type: "Black Cotton Soil",
          irrigation_source: "Tube Well & River Lift"
        }
      ],
      ownership_details: [
        { owner_name: "Kavita Naidu", relationship_type: "Daughter of", relative_name: "Raman Naidu", share_fraction: 0.5, is_primary_owner: true },
        { owner_name: "Arumugam Kumar", relationship_type: "Son of", relative_name: "Raman Naidu", share_fraction: 0.5, is_primary_owner: false }
      ],
      revenue_taxation: { annual_assessment_inr: 164.92, cess_amount_inr: 25.00, tax_status: "PAID" },
      remarks_kaifiyat: "Joint khata record. Encumbrance clearance pending."
    }
  },

  // -------------------------------------------------------------
  // 2. CONVEYANCE & TRANSFER DEEDS (Deed Sample 1)
  // -------------------------------------------------------------
  {
    id: "DL-DEED-001",
    doc_type: "CONVEYANCE_DEED",
    document_id: "DOC-DEED-984",
    registration_number: "984/2021",
    khasra_no: "142/3B",
    khata_no: "489",
    ulpin: "14BW89201L9842",
    village: "Nemili",
    tehsil: "Sriperumbudur",
    district: "Kanchipuram",
    state: "Tamil Nadu",
    seller_name: "M. Murugan",
    buyer_name: "K. Raman",
    sale_value_inr: 1500000.0,
    plot_area: 1821.08,
    owner_names: ["K. Raman (Buyer)"],
    owner_shares: [1.0],
    confidence_score: 98.0,
    status_flag: "VALID",
    routing: "AUTO_APPROVED",
    priority_level: "LOW_PRIORITY",
    scoring_breakdown: { ocr_score: 98, rules_score: 100, database_gis_score: 95, deduplication_score: 100, area_rule_passed: true, share_rule_passed: true, share_sum: "1.00" },
    payload: {
      registration_details: {
        deed_type: "SALE_DEED",
        registration_number: "984/2021",
        book_volume: "1",
        page_range: "105-112",
        sro_office: "Sriperumbudur SRO",
        execution_date: "2021-04-12",
        registration_date: "2021-04-14"
      },
      parties: {
        executants_sellers: [
          { name: "M. Murugan", relationship_type: "Son of", relative_name: "K. Munusamy", address: "No 12, Car Street, Nemili", identifier_ref: "[Redacted]" }
        ],
        claimants_buyers: [
          { name: "K. Raman", relationship_type: "Son of", relative_name: "M. Murugan", address: "No 14, East Mada Street, Nemili", identifier_ref: "[Redacted]" }
        ]
      },
      financial_consideration: {
        sale_value_inr: 1500000.0,
        guideline_value_inr: 1420000.0,
        stamp_duty_paid_inr: 105000.0,
        registration_fee_inr: 60000.0
      },
      property_schedule: {
        survey_number: "142/3B",
        transacted_area_sqm: 1821.08,
        four_boundaries_chauhaddi: {
          north: "Survey No 141 (Public Canal)",
          south: "Village Panchayat Road",
          east: "Survey No 142/3A (P. Sundaram Land)",
          west: "Survey No 143 (Village Commons)"
        }
      },
      prior_title_recitals: "Vendor acquired rights via registered Settlement Deed No. 312/1998."
    }
  },

  // -------------------------------------------------------------
  // 2. CONVEYANCE & TRANSFER DEEDS (Deed Sample 2)
  // -------------------------------------------------------------
  {
    id: "DL-DEED-002",
    doc_type: "CONVEYANCE_DEED",
    document_id: "DOC-DEED-204",
    registration_number: "204 of 2018",
    khasra_no: "117/2",
    khata_no: "00229",
    ulpin: "75QA02657Q4428",
    village: "Kondhali",
    tehsil: "Fatehpur",
    district: "Kanchipuram",
    state: "Tamil Nadu",
    seller_name: "Kavita Naidu",
    buyer_name: "Arumugam Kumar",
    sale_value_inr: 6860408.0,
    plot_area: 19091.0,
    owner_names: ["Arumugam Kumar (Buyer)"],
    owner_shares: [1.0],
    confidence_score: 96.0,
    status_flag: "VALID",
    routing: "AUTO_APPROVED",
    priority_level: "LOW_PRIORITY",
    scoring_breakdown: { ocr_score: 95, rules_score: 100, database_gis_score: 95, deduplication_score: 100, area_rule_passed: true, share_rule_passed: true, share_sum: "1.00" },
    payload: {
      registration_details: {
        deed_type: "SALE_DEED",
        registration_number: "204 of 2018",
        book_volume: "4",
        page_range: "45-52",
        sro_office: "Sub-Registrar Office, Fatehpur",
        execution_date: "2018-11-18",
        registration_date: "2018-11-20"
      },
      parties: {
        executants_sellers: [
          { name: "Kavita Naidu", relationship_type: "Daughter of", relative_name: "Raman Naidu", address: "Village Kondhali, Fatehpur", identifier_ref: "PAN-XXXX-8812" }
        ],
        claimants_buyers: [
          { name: "Arumugam Kumar", relationship_type: "Son of", relative_name: "Raman Naidu", address: "Village Kondhali, Fatehpur", identifier_ref: "PAN-XXXX-9914" }
        ]
      },
      financial_consideration: {
        sale_value_inr: 6860408.0,
        guideline_value_inr: 6500000.0,
        stamp_duty_paid_inr: 480200.0,
        registration_fee_inr: 137200.0
      },
      property_schedule: {
        survey_number: "117/2",
        transacted_area_sqm: 19091.0,
        four_boundaries_chauhaddi: {
          north: "Survey No. 146 (Canal)",
          south: "Village Panchayat Road",
          east: "Survey No. 117/4A",
          west: "Survey No. 190 (Village Commons)"
        }
      },
      prior_title_recitals: "Transfer of undivided share via family partition agreement executed on 2015-06-10."
    }
  },

  // -------------------------------------------------------------
  // 3. MUTATION REGISTER & ORDERS (Mutation Sample 1)
  // -------------------------------------------------------------
  {
    id: "DL-MUT-001",
    doc_type: "MUTATION_REGISTER",
    document_id: "DOC-MUT-0012",
    mutation_serial_number: "MUT-2024-0012",
    khasra_no: "142/3B",
    khata_no: "489",
    ulpin: "14BW89201L9842",
    village: "Nemili",
    tehsil: "Sriperumbudur",
    district: "Kanchipuram",
    state: "Tamil Nadu",
    transferor_prior_owner: "M. Murugan",
    transferee_new_owner: "K. Raman",
    plot_area: 1821.08,
    owner_names: ["K. Raman (Transferee)"],
    owner_shares: [1.0],
    confidence_score: 97.0,
    status_flag: "VALID",
    routing: "AUTO_APPROVED",
    priority_level: "LOW_PRIORITY",
    scoring_breakdown: { ocr_score: 97, rules_score: 100, database_gis_score: 95, deduplication_score: 100, area_rule_passed: true, share_rule_passed: true, share_sum: "1.00" },
    payload: {
      mutation_serial_number: "MUT-2024-0012",
      case_reference_no: "REV/TEH/2024/782",
      nature_of_mutation: "SUCCESSION_INHERITANCE",
      applied_date: "2024-01-10",
      sanctioned_date: "2024-02-18",
      survey_numbers_affected: ["142/3B"],
      transferor_prior_owner: { name: "M. Murugan", prior_khata_no: "310" },
      transferee_new_owner: { name: "K. Raman", new_khata_no: "489", share_acquired: 1.0 },
      sanctioning_authority: { officer_designation: "Tehsildar", subdivision: "Sriperumbudur", digital_signature_verified: true }
    }
  },

  // -------------------------------------------------------------
  // 3. MUTATION REGISTER & ORDERS (Mutation Sample 2)
  // -------------------------------------------------------------
  {
    id: "DL-MUT-002",
    doc_type: "MUTATION_REGISTER",
    document_id: "DOC-MUT-2584",
    mutation_serial_number: "MUT-2018-2584",
    khasra_no: "117/2",
    khata_no: "00229",
    ulpin: "75QA02657Q4428",
    village: "Kondhali",
    tehsil: "Fatehpur",
    district: "Kanchipuram",
    state: "Tamil Nadu",
    transferor_prior_owner: "Kavita Naidu",
    transferee_new_owner: "Arumugam Kumar",
    plot_area: 19091.0,
    owner_names: ["Arumugam Kumar (Transferee)"],
    owner_shares: [0.5],
    confidence_score: 92.0,
    status_flag: "VALID",
    routing: "AUTO_APPROVED",
    priority_level: "LOW_PRIORITY",
    scoring_breakdown: { ocr_score: 90, rules_score: 100, database_gis_score: 90, deduplication_score: 100, area_rule_passed: true, share_rule_passed: true, share_sum: "1.00" },
    payload: {
      mutation_serial_number: "MUT-2018-2584",
      case_reference_no: "REV/FAT/2018/2584",
      nature_of_mutation: "TRANSFER_BY_SALE",
      applied_date: "2018-01-22",
      sanctioned_date: "2018-05-03",
      survey_numbers_affected: ["117/2"],
      transferor_prior_owner: { name: "Kavita Naidu", prior_khata_no: "00888" },
      transferee_new_owner: { name: "Arumugam Kumar", new_khata_no: "00229", share_acquired: 0.5 },
      sanctioning_authority: { officer_designation: "Tehsildar", subdivision: "Fatehpur", digital_signature_verified: true }
    }
  },

  // -------------------------------------------------------------
  // 4. SPATIAL CADASTRAL MAP (Cadastral Map Sample 1)
  // -------------------------------------------------------------
  {
    id: "DL-MAP-001",
    doc_type: "CADASTRAL_MAP",
    document_id: "DOC-MAP-S04",
    map_sheet_number: "Sheet-04",
    projection_system: "EPSG:4326",
    khasra_no: "142/3B",
    khata_no: "489",
    ulpin: "14BW89201L9842",
    village: "Nemili",
    tehsil: "Sriperumbudur",
    district: "Kanchipuram",
    state: "Tamil Nadu",
    plot_area: 1821.50,
    owner_names: ["K. Raman (Plot 142/3B)"],
    owner_shares: [1.0],
    confidence_score: 99.0,
    status_flag: "VALID",
    routing: "AUTO_APPROVED",
    priority_level: "LOW_PRIORITY",
    scoring_breakdown: { ocr_score: 99, rules_score: 100, database_gis_score: 100, deduplication_score: 100, area_rule_passed: true, share_rule_passed: true, share_sum: "1.00" },
    payload: {
      map_sheet_number: "Sheet-04",
      projection_system: "EPSG:4326",
      extracted_features: [
        {
          khasra_survey_number: "142/3B",
          geometry_type: "Polygon",
          coordinates: [
            [
              [79.94125, 12.98142],
              [79.94189, 12.98145],
              [79.94185, 12.98082],
              [79.94121, 12.98080],
              [79.94125, 12.98142]
            ]
          ],
          calculated_gis_area_sqm: 1821.50,
          centroid: { latitude: 12.98112, longitude: 79.94155 }
        }
      ],
      tie_line_measurements: [
        { from_marker: "G1", to_marker: "G2", field_distance_meters: 45.2 }
      ]
    }
  },

  // -------------------------------------------------------------
  // 4. SPATIAL CADASTRAL MAP (Cadastral Map Sample 2)
  // -------------------------------------------------------------
  {
    id: "DL-MAP-002",
    doc_type: "CADASTRAL_MAP",
    document_id: "DOC-MAP-S08",
    map_sheet_number: "Sheet-08",
    projection_system: "EPSG:4326",
    khasra_no: "185/5",
    khata_no: "00215",
    ulpin: "96QE71396Q2370",
    village: "Baideswar",
    tehsil: "Danapur",
    district: "Cuttack",
    state: "Odisha",
    plot_area: 20634.0,
    owner_names: ["Mahesh Singh (Plot 185/5)"],
    owner_shares: [1.0],
    confidence_score: 97.0,
    status_flag: "VALID",
    routing: "AUTO_APPROVED",
    priority_level: "LOW_PRIORITY",
    scoring_breakdown: { ocr_score: 97, rules_score: 100, database_gis_score: 95, deduplication_score: 100, area_rule_passed: true, share_rule_passed: true, share_sum: "1.00" },
    payload: {
      map_sheet_number: "Sheet-08",
      projection_system: "EPSG:4326",
      extracted_features: [
        {
          khasra_survey_number: "185/5",
          geometry_type: "Polygon",
          coordinates: [
            [
              [77.11704, 13.28595],
              [77.11750, 13.28620],
              [77.11780, 13.28550],
              [77.11710, 13.28520],
              [77.11704, 13.28595]
            ]
          ],
          calculated_gis_area_sqm: 20634.0,
          centroid: { latitude: 13.28595, longitude: 77.11704 }
        }
      ],
      tie_line_measurements: [
        { from_marker: "M1", to_marker: "M2", field_distance_meters: 112.5 }
      ]
    }
  }
];

export const MOCK_LAND_RECORDS = RAW_MOCK_LAND_RECORDS.map(r => ({
  ...r,
  scanned_image_url: r.scanned_image_url || getDocumentSvgForRecord(r)
}));

export const MOCK_AUDIT_TRAIL = [
  {
    history_id: 819418,
    record_id: "DL-ROR-001",
    action: "DOCUMENT_INGESTION",
    field_changed: "Initial Ingestion",
    old_value: null,
    new_value: "Jamabandi RoR Document Uploaded & Ingested",
    actor_name: "Sunita Verma (Clerk)",
    actor_role: "clerk",
    previous_hash: "0000000000000000000000000000000000000000000000000000000000000000",
    current_hash: "a4f89b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
    timestamp: "2026-09-08T10:14:02.105Z",
    digital_signature: "ECDSA-SHA256:3045022100a9b8c...12e3"
  },
  {
    history_id: 819419,
    record_id: "DL-DEED-001",
    action: "SALE_DEED_VERIFIED",
    field_changed: "buyer_name",
    old_value: "K. Raman",
    new_value: "K. Raman",
    actor_name: "Vikram Singh (Patwari)",
    actor_role: "patwari",
    previous_hash: "a4f89b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
    current_hash: "b5e90c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9b0b",
    timestamp: "2026-09-08T12:05:18.442Z",
    digital_signature: "ECDSA-SHA256:3044022011b2c3...99f0"
  },
  {
    history_id: 819420,
    record_id: "DL-MUT-001",
    action: "MUTATION_REVIEWED",
    field_changed: "status_flag",
    old_value: "REQUIRES_REVIEW",
    new_value: "AUTO_APPROVED",
    actor_name: "Rajesh Sharma, IRS (Tehsildar)",
    actor_role: "tehsildar",
    previous_hash: "b5e90c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9b0b",
    current_hash: "c6f01d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9c1c1c",
    timestamp: "2026-09-08T14:20:10.890Z",
    digital_signature: "Ed25519-SIG:77a8b9...cc11"
  }
];

export const MOCK_CADASTRAL_PARCELS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "DL-ROR-001",
      properties: {
        khasra_no: "142/3B",
        ulpin: "14BW89201L9842",
        owner_name: "K. Raman",
        recorded_area: "1821.08 sqm",
        gis_computed_area: "1821.50 sqm",
        status: "VALID",
        village: "Nemili"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [79.94125, 12.98142],
            [79.94189, 12.98145],
            [79.94185, 12.98082],
            [79.94121, 12.98080],
            [79.94125, 12.98142]
          ]
        ]
      }
    },
    {
      type: "Feature",
      id: "DL-ROR-002",
      properties: {
        khasra_no: "117/2",
        ulpin: "75QA02657Q4428",
        owner_name: "Kavita Naidu & Arumugam Kumar",
        recorded_area: "19091.00 sqm",
        gis_computed_area: "19091.00 sqm",
        status: "FLAGGED_WARNING",
        village: "Kondhali"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [80.9400, 26.8500],
            [80.9425, 26.8500],
            [80.9425, 26.8520],
            [80.9400, 26.8520],
            [80.9400, 26.8500]
          ]
        ]
      }
    }
  ]
};

export function transformDatasetRecordToLandRecord(item) {
  if (!item) return MOCK_LAND_RECORDS[0];
  const docType = item.doc_type || 'RECORD_OF_RIGHTS';
  const id = item.id || item.record_id || `DL-${Math.floor(1000 + Math.random()*9000)}`;
  return {
    id,
    doc_type: docType,
    document_id: item.document_id || `DOC-${id}`,
    khasra_no: item.khasra_no || item.ror?.khasra_no || '142/3B',
    khata_no: item.khata_no || item.ror?.khata_no || '489',
    ulpin: item.ulpin || item.ror?.ulpin || '14BW89201L9842',
    village: item.village || item.location?.village || 'Nemili',
    tehsil: item.tehsil || item.location?.tehsil || 'Sriperumbudur',
    district: item.district || item.location?.district || 'Kanchipuram',
    state: item.state || 'Tamil Nadu',
    plot_area: item.plot_area || 1821.08,
    owner_names: item.owner_names || ['K. Raman'],
    owner_shares: item.owner_shares || [1.0],
    confidence_score: item.confidence_score || 95.0,
    status_flag: item.status_flag || 'VALID',
    routing: item.routing || 'AUTO_APPROVED',
    priority_level: item.priority_level || 'LOW_PRIORITY',
    scoring_breakdown: item.scoring_breakdown || { ocr_score: 96, rules_score: 100, database_gis_score: 95, deduplication_score: 100, area_rule_passed: true, share_rule_passed: true },
    raw_payload: item.raw_payload || item.payload || item
  };
}
