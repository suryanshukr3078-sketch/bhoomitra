export interface ExtractedField {
  value: string;
  confidence: number;
  bbox?: [number, number, number, number];
}

export interface DigitizedRecord {
  id: string;
  title: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  document_type: string;
  original_language: string;
  scan_url: string;
  scanned_at: string;
  verification_status: 'pending_review' | 'verified' | 'flagged' | 'approved';
  overall_confidence: number;
  extracted_fields: Record<string, ExtractedField>;
  validation_warnings: string[];
  assigned_verifier: string;
}

export interface StateProgress {
  state: string;
  districts_total: number;
  total_records_lakhs: number;
  digitized_percent: number;
  ocr_accuracy_percent: number;
  pending_verification: number;
}

export const SEED_DIGITIZATION_RECORDS: DigitizedRecord[] = [
  {
    id: 'doc-ror-up-01',
    title: 'Khatoni (Record of Rights) Fasli 1431',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    tehsil: 'Pindra',
    village: 'Shivpur',
    document_type: 'Khatoni / RoR',
    original_language: 'Hindi (Devanagari)',
    scan_url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80',
    scanned_at: '2026-08-10',
    verification_status: 'pending_review',
    overall_confidence: 91.4,
    extracted_fields: {
      landowner_name: { value: 'रामेश्वर प्रसाद शर्मा (Rameshwar Prasad Sharma)', confidence: 96.2, bbox: [120, 180, 410, 215] },
      father_husband_name: { value: 'स्व. बद्री नारायण शर्मा (Late Badri Narayan Sharma)', confidence: 94.0, bbox: [120, 225, 410, 255] },
      khasra_number: { value: '412/1-क', confidence: 98.5, bbox: [430, 180, 560, 215] },
      khata_number: { value: '00184', confidence: 97.0, bbox: [580, 180, 690, 215] },
      total_area_hectares: { value: '1.4250', confidence: 93.8, bbox: [710, 180, 840, 215] },
      area_in_bigha: { value: '5.62 Bigha (Pucca)', confidence: 91.0, bbox: [710, 225, 840, 255] },
      land_classification: { value: 'संक्रमणीय भूमिधर (Bhumidhar with Transferable Rights)', confidence: 88.5, bbox: [120, 290, 480, 325] },
      mutation_order_number: { value: 'नामान्तरण वाद सं० 2024/0912', confidence: 78.4, bbox: [510, 290, 840, 325] },
      encumbrance_status: { value: 'भारमुक्त (Nil Encumbrance / No Bank Lien)', confidence: 92.1, bbox: [120, 350, 450, 380] },
    },
    validation_warnings: [
      'Mutation order date pending cross-match with Revenue Court Management System (RCMS).',
    ],
    assigned_verifier: 'Revenue Inspector (RI) Circle 3',
  },
  {
    id: 'doc-712-mh-02',
    title: 'Satbara 7/12 & 8-A Extract',
    state: 'Maharashtra',
    district: 'Pune',
    tehsil: 'Haveli',
    village: 'Wagholi',
    document_type: '7/12 Extract (Satbara)',
    original_language: 'Marathi',
    scan_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    scanned_at: '2026-08-14',
    verification_status: 'verified',
    overall_confidence: 96.8,
    extracted_fields: {
      landowner_name: { value: 'दत्तात्रय विठ्ठलराव कदम (Dattatraya Vithalrao Kadam)', confidence: 98.0, bbox: [140, 160, 460, 195] },
      father_husband_name: { value: 'विठ्ठलराव बापूराव कदम (Vithalrao Bapurao Kadam)', confidence: 97.4, bbox: [140, 205, 460, 235] },
      khasra_number: { value: 'सर्व्हे नं. 142/2/अ', confidence: 99.1, bbox: [480, 160, 620, 195] },
      khata_number: { value: 'खाते क्र. 329', confidence: 98.4, bbox: [640, 160, 750, 195] },
      total_area_hectares: { value: '0.8500', confidence: 97.2, bbox: [770, 160, 890, 195] },
      area_in_guntha: { value: '34.0 Guntha', confidence: 95.5, bbox: [770, 205, 890, 235] },
      land_classification: { value: 'जिरायत (Jirayat - Dry Crop Agriculture)', confidence: 96.0, bbox: [140, 270, 480, 305] },
      mutation_order_number: { value: 'फेरफार नोंद क्र. 8412', confidence: 94.2, bbox: [500, 270, 780, 305] },
      encumbrance_status: { value: 'बँक ऑफ महाराष्ट्र कर्ज बोजा रु. 4,50,000', confidence: 91.0, bbox: [140, 330, 520, 365] },
    },
    validation_warnings: [],
    assigned_verifier: 'Talathi Office Wagholi',
  },
  {
    id: 'doc-ror-wb-03',
    title: 'Khatian Register (Banglarbhumi Form 32)',
    state: 'West Bengal',
    district: 'North 24 Parganas',
    tehsil: 'Barasat',
    village: 'Kadambagachi',
    document_type: 'Khatian (LR Record)',
    original_language: 'Bengali',
    scan_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    scanned_at: '2026-08-18',
    verification_status: 'flagged',
    overall_confidence: 74.2,
    extracted_fields: {
      landowner_name: { value: 'সুনীল কুমার বিশ্বাস (Sunil Kumar Biswas)', confidence: 88.0, bbox: [110, 170, 420, 205] },
      father_husband_name: { value: 'মৃত অবিনাশ বিশ্বাস (Late Abinash Biswas)', confidence: 82.5, bbox: [110, 215, 420, 245] },
      khasra_number: { value: 'দাগ নং 891 (Daag No 891)', confidence: 76.0, bbox: [440, 170, 580, 205] },
      khata_number: { value: 'খতিয়ান নং 1042', confidence: 79.5, bbox: [600, 170, 720, 205] },
      total_area_hectares: { value: '0.3200', confidence: 68.0, bbox: [740, 170, 860, 205] },
      area_in_bigha: { value: '0.96 Bigha (24 Decimal)', confidence: 64.5, bbox: [740, 215, 860, 245] },
      land_classification: { value: 'বাস্তু (Bastu / Homestead Land)', confidence: 72.0, bbox: [110, 280, 460, 315] },
      mutation_order_number: { value: 'অস্পষ্ট (Faded Ink / Unreadable Stamp)', confidence: 42.0, bbox: [480, 280, 790, 315] },
      encumbrance_status: { value: 'নিরীক্ষণাধীন (Under Scrutiny)', confidence: 70.0, bbox: [110, 340, 480, 375] },
    },
    validation_warnings: [
      'Low OCR confidence on Area & Mutation Stamp due to historic page crease and faded ink.',
      'Area summation mismatch: Share fractions sum to 0.92, expected 1.00.',
    ],
    assigned_verifier: 'BL&LRO Barasat Desk 2',
  },
  {
    id: 'doc-rtc-ka-04',
    title: 'Bhoomi RTC (Form 16 - Pahani)',
    state: 'Karnataka',
    district: 'Bengaluru Rural',
    tehsil: 'Devanahalli',
    village: 'Vijayapura',
    document_type: 'RTC Pahani',
    original_language: 'Kannada',
    scan_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    scanned_at: '2026-08-20',
    verification_status: 'verified',
    overall_confidence: 94.6,
    extracted_fields: {
      landowner_name: { value: 'ಎಂ. ನಾರಾಯಣಸ್ವಾಮಿ (M. Narayanagowda)', confidence: 96.5, bbox: [130, 170, 450, 205] },
      father_husband_name: { value: 'ಮುನಿವೆಂಕಟಪ್ಪ (Munivenkatappa)', confidence: 95.0, bbox: [130, 215, 450, 245] },
      khasra_number: { value: 'ಸರ್ವೆ ನಂ 84/3', confidence: 98.2, bbox: [470, 170, 600, 205] },
      khata_number: { value: 'ಖಾತೆ ನಂ 512', confidence: 97.4, bbox: [620, 170, 730, 205] },
      total_area_hectares: { value: '1.2140', confidence: 94.0, bbox: [750, 170, 870, 205] },
      area_in_acre: { value: '3 Acres 00 Guntas', confidence: 93.5, bbox: [750, 215, 870, 245] },
      land_classification: { value: 'ತರಿ (Wet Land - Canal Irrigation)', confidence: 91.0, bbox: [130, 280, 470, 315] },
      mutation_order_number: { value: 'ಎಂ.ಆರ್ ನಂ H12/2023', confidence: 92.8, bbox: [490, 280, 770, 315] },
      encumbrance_status: { value: 'ಸಾಲ ರಹಿತ (No Encumbrance Certificate Verified)', confidence: 96.0, bbox: [130, 340, 500, 375] },
    },
    validation_warnings: [],
    assigned_verifier: 'Village Accountant Devanahalli',
  },
  {
    id: 'doc-adangal-ts-05',
    title: 'Dharani Integrated RoR & 1-B Adangal',
    state: 'Telangana',
    district: 'Ranga Reddy',
    tehsil: 'Shamshabad',
    village: 'Satamrai',
    document_type: 'Adangal / 1-B',
    original_language: 'Telugu',
    scan_url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80',
    scanned_at: '2026-08-25',
    verification_status: 'approved',
    overall_confidence: 97.8,
    extracted_fields: {
      landowner_name: { value: 'కె. శ్రీనివాస రావు (K. Srinivasa Rao)', confidence: 99.0, bbox: [135, 175, 455, 210] },
      father_husband_name: { value: 'రామచంద్రయ్య (Ramachandraiah)', confidence: 98.2, bbox: [135, 220, 455, 250] },
      khasra_number: { value: 'సర్వే నంబరు 214/ఈ', confidence: 99.5, bbox: [475, 175, 610, 210] },
      khata_number: { value: 'పట్టాదారు పాస్ బుక్ నం. T190800', confidence: 98.8, bbox: [630, 175, 850, 210] },
      total_area_hectares: { value: '0.8090', confidence: 96.5, bbox: [750, 175, 870, 210] },
      area_in_acre: { value: '2 Acres 00 Guntas', confidence: 97.0, bbox: [750, 220, 870, 250] },
      land_classification: { value: 'పట్టా భూమి (Patta Dry Land)', confidence: 98.0, bbox: [135, 285, 475, 320] },
      mutation_order_number: { value: 'ధరణి మ్యుటేషన్ TS/RR/2024/441', confidence: 97.5, bbox: [495, 285, 800, 320] },
      encumbrance_status: { value: 'భారరహితం (Clear Title Verified)', confidence: 96.0, bbox: [135, 345, 510, 380] },
    },
    validation_warnings: [],
    assigned_verifier: 'Tahsildar Shamshabad Desk 1',
  },
];

export const SEED_DIGITIZATION_METRICS = {
  national_summary: {
    total_records_crores: 28.4,
    digitized_records_crores: 26.9,
    digitization_percentage: 94.7,
    cadastral_maps_georeferenced_percent: 88.2,
    languages_supported_count: 14,
    average_ocr_confidence_percent: 93.8,
    active_human_review_officials: 14250,
  },
  states_progress: [
    { state: 'Madhya Pradesh', districts_total: 55, total_records_lakhs: 412.5, digitized_percent: 99.4, ocr_accuracy_percent: 96.8, pending_verification: 1240 },
    { state: 'Gujarat', districts_total: 33, total_records_lakhs: 298.0, digitized_percent: 98.9, ocr_accuracy_percent: 97.2, pending_verification: 850 },
    { state: 'Maharashtra', districts_total: 36, total_records_lakhs: 560.2, digitized_percent: 98.1, ocr_accuracy_percent: 95.4, pending_verification: 4120 },
    { state: 'Karnataka', districts_total: 31, total_records_lakhs: 345.8, digitized_percent: 97.5, ocr_accuracy_percent: 94.8, pending_verification: 2310 },
    { state: 'Uttar Pradesh', districts_total: 75, total_records_lakhs: 820.4, digitized_percent: 95.2, ocr_accuracy_percent: 92.5, pending_verification: 9840 },
    { state: 'West Bengal', districts_total: 23, total_records_lakhs: 380.0, digitized_percent: 88.6, ocr_accuracy_percent: 89.2, pending_verification: 14200 },
    { state: 'Odisha', districts_total: 30, total_records_lakhs: 245.0, digitized_percent: 91.2, ocr_accuracy_percent: 91.0, pending_verification: 5400 },
  ],
};
