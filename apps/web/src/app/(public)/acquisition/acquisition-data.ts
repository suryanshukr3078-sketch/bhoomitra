export interface ProjectLifecycleStage {
  stage_number: number;
  stage_name: string;
  statutory_act: string;
  section_in_progress: string;
}

export interface AcquisitionProject {
  id: string;
  title: string;
  project_type: string;
  requiring_body: string;
  acquiring_authority: string;
  state: string;
  districts_covered: string[];
  total_alignment_length_km: number;
  total_land_required_ha: number;
  land_notified_ha: number;
  land_possessed_ha: number;
  possession_percent: number;
  current_lifecycle_stage: ProjectLifecycleStage;
  total_compensation_assessed_crores: number;
  compensation_disbursed_crores: number;
  disbursement_percent: number;
  affected_families_count: number;
  displaced_families_count: number;
  families_resettled_count: number;
  r_and_r_status: string;
  delay_risk_score: number;
  delay_risk_category: string;
  predicted_delay_months: number;
  target_completion_date: string;
  gis_corridor_coordinates: [number, number][];
}

export interface DelayDriver {
  factor: string;
  impact_percent: number;
  status: string;
  description: string;
}

export interface DelayPrediction {
  project_id: string;
  project_title: string;
  delay_risk_score: number;
  delay_risk_category: string;
  predicted_delay_months: number;
  delay_probability_percent: number;
  current_stage: ProjectLifecycleStage;
  model_version: string;
  explainable_delay_drivers: DelayDriver[];
  actionable_recommendations: string[];
  timeline_forecast: {
    scheduled_completion: string;
    statutory_risk_buffer_days: number;
    critical_path_milestone: string;
  };
}

export const STANDARD_LIFECYCLE_STAGES = [
  { stage: 1, stage_number: 1, stage_name: 'Land Requisition & Alignment Fixation', statutory_act: 'RFCTLARR Act 2013', section_in_progress: 'Requisition Form A' },
  { stage: 2, stage_number: 2, stage_name: 'Social Impact Assessment (SIA) Study', statutory_act: 'RFCTLARR Act 2013', section_in_progress: 'Section 4 / Section 7 Evaluation' },
  { stage: 3, stage_number: 3, stage_name: 'Preliminary Notification', statutory_act: 'RFCTLARR Act 2013 / NH Act', section_in_progress: 'Section 11(1) / Section 3A' },
  { stage: 4, stage_number: 4, stage_name: 'Hearing of Objections & Final Boundary', statutory_act: 'RFCTLARR Act 2013', section_in_progress: 'Section 15 Hearing' },
  { stage: 5, stage_number: 5, stage_name: 'Declaration of Acquisition', statutory_act: 'RFCTLARR Act 2013 / Section 3D', section_in_progress: 'Section 19 Declaration' },
  { stage: 6, stage_number: 6, stage_name: 'Valuation & Award Determination', statutory_act: 'RFCTLARR Act 2013 (First Sched)', section_in_progress: 'Section 23 / 30 Award' },
  { stage: 7, stage_number: 7, stage_name: 'Disbursement of Compensation & R&R', statutory_act: 'RFCTLARR Act (Second Sched)', section_in_progress: 'Section 77 Direct Benefit Transfer' },
  { stage: 8, stage_number: 8, stage_name: 'Possession & Physical Eviction', statutory_act: 'RFCTLARR Act 2013 / Section 3E', section_in_progress: 'Section 38 Collector Handover' },
  { stage: 9, stage_number: 9, stage_name: 'Land Record Mutation & Geo-fencing', statutory_act: 'State Revenue Code', section_in_progress: 'Final Title Mutation & RoR' },
];

export const SEED_ACQUISITION_PROJECTS: AcquisitionProject[] = [
  {
    id: 'proj-nhai-delhi-mumbai-exp',
    title: 'Delhi-Mumbai Expressway (Vadodara-Virar Spur Section 14)',
    project_type: 'Expressway / Highway',
    requiring_body: 'National Highways Authority of India (NHAI)',
    acquiring_authority: 'Competent Authority for Land Acquisition (CALA) / District Collector',
    state: 'Gujarat & Maharashtra',
    districts_covered: ['Valsad', 'Navsari', 'Palghar'],
    total_alignment_length_km: 118.4,
    total_land_required_ha: 840.5,
    land_notified_ha: 840.5,
    land_possessed_ha: 712.0,
    possession_percent: 84.7,
    current_lifecycle_stage: {
      stage_number: 7,
      stage_name: 'Possession & R&R Execution',
      statutory_act: 'RFCTLARR Act 2013 & NH Act 1956',
      section_in_progress: 'Section 3D / Section 3E Possession',
    },
    total_compensation_assessed_crores: 1420.5,
    compensation_disbursed_crores: 1285.3,
    disbursement_percent: 90.5,
    affected_families_count: 3240,
    displaced_families_count: 640,
    families_resettled_count: 580,
    r_and_r_status: '90.6% Resettled in Model Rehabilitation Colonies',
    delay_risk_score: 38,
    delay_risk_category: 'Low',
    predicted_delay_months: 1.2,
    target_completion_date: '2026-12-31',
    gis_corridor_coordinates: [
      [72.934, 20.612],
      [72.88, 20.25],
      [72.81, 19.82],
      [72.78, 19.45],
    ],
  },
  {
    id: 'proj-dfc-eastern-corridor',
    title: 'Eastern Dedicated Freight Corridor (Sonnagar-Dankuni Section)',
    project_type: 'Dedicated Railway Corridor',
    requiring_body: 'Dedicated Freight Corridor Corporation of India (DFCCIL)',
    acquiring_authority: 'Special Land Acquisition Officer (SLAO)',
    state: 'Jharkhand & West Bengal',
    districts_covered: ['Dhanbad', 'Burdwan', 'Hooghly'],
    total_alignment_length_km: 234.0,
    total_land_required_ha: 1250.0,
    land_notified_ha: 1180.0,
    land_possessed_ha: 790.0,
    possession_percent: 63.2,
    current_lifecycle_stage: {
      stage_number: 5,
      stage_name: 'Valuation & Award Formulation',
      statutory_act: 'Railways Act 1989 & RFCTLARR Act 2013',
      section_in_progress: 'Section 20F Award Determination',
    },
    total_compensation_assessed_crores: 2180.0,
    compensation_disbursed_crores: 1340.5,
    disbursement_percent: 61.5,
    affected_families_count: 5820,
    displaced_families_count: 1120,
    families_resettled_count: 620,
    r_and_r_status: '55.4% in Progress (Allotment of Housing Plots Pending)',
    delay_risk_score: 76,
    delay_risk_category: 'Critical',
    predicted_delay_months: 8.5,
    target_completion_date: '2027-06-30',
    gis_corridor_coordinates: [
      [86.43, 23.795],
      [87.25, 23.51],
      [87.85, 23.23],
      [88.31, 22.68],
    ],
  },
  {
    id: 'proj-solar-khavda-park',
    title: 'Khavda Ultra Mega Renewable Energy Hybrid Park Phase 3',
    project_type: 'Renewable Energy / Solar Park',
    requiring_body: 'Gujarat Power Corporation & NTPC Renewable',
    acquiring_authority: 'Collector Kutch & Revenue Department',
    state: 'Gujarat',
    districts_covered: ['Kutch'],
    total_alignment_length_km: 42.0,
    total_land_required_ha: 4500.0,
    land_notified_ha: 4500.0,
    land_possessed_ha: 4250.0,
    possession_percent: 94.4,
    current_lifecycle_stage: {
      stage_number: 8,
      stage_name: 'Possession & Infrastructure Handover',
      statutory_act: 'Gujarat Government Land Allotment Policy',
      section_in_progress: 'Final Mutation & Geo-Fencing Handover',
    },
    total_compensation_assessed_crores: 480.0,
    compensation_disbursed_crores: 462.0,
    disbursement_percent: 96.2,
    affected_families_count: 120,
    displaced_families_count: 0,
    families_resettled_count: 0,
    r_and_r_status: 'Nil Physical Displacement (Non-arable revenue wasteland)',
    delay_risk_score: 22,
    delay_risk_category: 'Low',
    predicted_delay_months: 0.5,
    target_completion_date: '2026-09-30',
    gis_corridor_coordinates: [
      [69.65, 23.85],
      [69.75, 23.95],
      [69.95, 24.1],
    ],
  },
  {
    id: 'proj-metro-bangalore-phase3',
    title: 'Bengaluru Suburban Rail Project Corridor 4 (Heelalige to Rajanukunte)',
    project_type: 'Urban Transit / Rail',
    requiring_body: 'Rail Infrastructure Development Company (K-RIDE)',
    acquiring_authority: 'Special Land Acquisition Officer (KIADB / BBMP)',
    state: 'Karnataka',
    districts_covered: ['Bengaluru Urban', 'Bengaluru Rural'],
    total_alignment_length_km: 46.2,
    total_land_required_ha: 142.5,
    land_notified_ha: 110.0,
    land_possessed_ha: 60.0,
    possession_percent: 42.1,
    current_lifecycle_stage: {
      stage_number: 4,
      stage_name: 'Hearing of Objections & Joint Measurement',
      statutory_act: 'KIAD Act 1966 & RFCTLARR Act 2013',
      section_in_progress: 'Section 28(2) Notice to Title Holders',
    },
    total_compensation_assessed_crores: 890.0,
    compensation_disbursed_crores: 340.0,
    disbursement_percent: 38.2,
    affected_families_count: 1480,
    displaced_families_count: 420,
    families_resettled_count: 110,
    r_and_r_status: '26.2% Transit Accommodation Provided',
    delay_risk_score: 58,
    delay_risk_category: 'Moderate',
    predicted_delay_months: 4.8,
    target_completion_date: '2027-12-31',
    gis_corridor_coordinates: [
      [77.712, 12.825],
      [77.625, 13.01],
      [77.56, 13.18],
    ],
  },
  {
    id: 'proj-bullet-mumbai-ahmedabad',
    title: 'Mumbai-Ahmedabad High Speed Rail (Bullet Train National Corridor)',
    project_type: 'High Speed Rail',
    requiring_body: 'National High Speed Rail Corporation Ltd (NHSRCL)',
    acquiring_authority: 'CALA & Revenue Divisions of MH/GJ',
    state: 'Maharashtra, Gujarat & Dadra Nagar Haveli',
    districts_covered: ['Mumbai Suburban', 'Thane', 'Palghar', 'Surat', 'Ahmedabad'],
    total_alignment_length_km: 508.17,
    total_land_required_ha: 1396.0,
    land_notified_ha: 1396.0,
    land_possessed_ha: 1378.0,
    possession_percent: 98.7,
    current_lifecycle_stage: {
      stage_number: 9,
      stage_name: 'Land Record Mutation & Geo-fencing',
      statutory_act: 'RFCTLARR Act 2013 / High Speed Rail Provisions',
      section_in_progress: 'RoR Mutation & Pier Foundation Construction',
    },
    total_compensation_assessed_crores: 11340.0,
    compensation_disbursed_crores: 11180.0,
    disbursement_percent: 98.6,
    affected_families_count: 14890,
    displaced_families_count: 2450,
    families_resettled_count: 2420,
    r_and_r_status: '98.8% R&R Package Complete & Direct Bank Disbursed',
    delay_risk_score: 18,
    delay_risk_category: 'Low',
    predicted_delay_months: 0.2,
    target_completion_date: '2027-03-31',
    gis_corridor_coordinates: [
      [72.82, 19.05],
      [72.98, 19.22],
      [72.83, 21.17],
      [72.58, 23.03],
    ],
  },
];

export const SEED_INITIAL_DELAY_PREDICTION: DelayPrediction = {
  project_id: 'proj-dfc-eastern-corridor',
  project_title: 'Eastern Dedicated Freight Corridor (Sonnagar-Dankuni Section)',
  delay_risk_score: 76,
  delay_risk_category: 'Critical',
  predicted_delay_months: 8.5,
  delay_probability_percent: 84.2,
  current_stage: {
    stage_number: 5,
    stage_name: 'Valuation & Award Formulation',
    statutory_act: 'Railways Act 1989 & RFCTLARR Act 2013',
    section_in_progress: 'Section 20F Award Determination',
  },
  model_version: 'GBDT-RFCTLARR-v4.2',
  explainable_delay_drivers: [
    { factor: 'Disputed Land Title Claims in Burdwan Division', impact_percent: 36, status: 'Active Litigations', description: 'Pending partition disputes among legal heirs in 14 revenue villages.' },
    { factor: 'SLAO Staffing Shortfall in Hooghly District', impact_percent: 24, status: 'Resource Constraint', description: 'Award formulation pending due to unfilled amin/revenue surveyor vacancies.' },
    { factor: 'Forest Clearance Staging Delay (Jharkhand border)', impact_percent: 18, status: 'Statutory Approval', description: 'Stage-II forest clearance approval pending at regional MoEFCC desk.' },
    { factor: 'R&R Housing Colony Infrastructure Handover', impact_percent: 14, status: 'Rehabilitation Lag', description: 'Water and electricity connections pending in 2 designated resettlement clusters.' },
  ],
  actionable_recommendations: [
    'Convene Special Lok Adalat with District Legal Services Authority (DLSA) for summary settlement of family title disputes in Burdwan.',
    'Depute 6 additional revenue surveyors from neighboring districts on deputation to SLAO Hooghly office.',
    'Escalate Stage-II Forest diversion proposal to Chief Secretary High-Powered Committee for expedited sign-off.',
    'Authorize advance Solatium payment of 100% under Section 30(1) to accelerate consent possession.',
  ],
  timeline_forecast: {
    scheduled_completion: '2027-06-30',
    statutory_risk_buffer_days: 255,
    critical_path_milestone: 'Section 20F Final Award Declaration',
  },
};

export const SEED_ACQUISITION_METRICS = {
  total_land_required_ha: 94200,
  overall_possession_rate_percent: 78.4,
  total_compensation_assessed_cr: 28450,
  total_compensation_disbursed_cr: 18240,
  dbt_disbursement_rate_percent: 64.1,
  total_resettled_families: 24890,
  r_and_r_completion_percent: 71.5,
  high_risk_delayed_projects: 18,
  total_monitored_projects: 142,
  national_kpis: {
    total_projects_monitored: 142,
    total_investment_outlay_crores: 284500,
    total_land_required_hectares: 94200,
    total_land_possessed_hectares: 73850,
    overall_possession_percent: 78.4,
    total_compensation_disbursed_crores: 64280,
    high_critical_risk_projects: 24,
    dispute_resolution_lok_adalats_held: 318,
  },
  risk_distribution: {
    low_risk_count: 68,
    moderate_risk_count: 50,
    high_risk_count: 18,
    critical_risk_count: 6,
  },
};

export function generateLocalDelayPrediction(project: AcquisitionProject): DelayPrediction {
  const isHigh = project.delay_risk_score > 65;
  const isMod = project.delay_risk_score > 40 && project.delay_risk_score <= 65;
  const category = isHigh ? 'Critical' : isMod ? 'Moderate' : 'Low';
  const delayMonths = isHigh ? 7.8 : isMod ? 3.4 : 0.8;
  const prob = isHigh ? 82.5 : isMod ? 48.0 : 15.0;

  return {
    project_id: project.id,
    project_title: project.title,
    delay_risk_score: project.delay_risk_score,
    delay_risk_category: category,
    predicted_delay_months: delayMonths,
    delay_probability_percent: prob,
    current_stage: project.current_lifecycle_stage,
    model_version: 'GBDT-RFCTLARR-v4.2',
    explainable_delay_drivers: [
      {
        factor: `Statutory Progress in ${project.current_lifecycle_stage.stage_name}`,
        impact_percent: isHigh ? 38 : isMod ? 25 : 12,
        status: isHigh ? 'Bottleneck Identified' : 'On Track',
        description: `Current milestone: ${project.current_lifecycle_stage.section_in_progress}. Possession is at ${project.possession_percent.toFixed(1)}%.`,
      },
      {
        factor: 'Disbursement of Assessed Compensation',
        impact_percent: isHigh ? 28 : isMod ? 20 : 10,
        status: project.disbursement_percent > 80 ? 'Optimal Flow' : 'Disbursement Pending',
        description: `Disbursed ₹${project.compensation_disbursed_crores} Cr out of ₹${project.total_compensation_assessed_crores} Cr (${project.disbursement_percent}%).`,
      },
      {
        factor: 'Rehabilitation & Resettlement (R&R) Completion',
        impact_percent: isHigh ? 22 : isMod ? 18 : 8,
        status: project.r_and_r_status.includes('Progress') ? 'Inter-departmental coordination' : 'Completed',
        description: `${project.families_resettled_count} of ${project.displaced_families_count || project.affected_families_count} families resettled.`,
      },
    ],
    actionable_recommendations: isHigh
      ? [
          'Convene Special Empowered Committee under District Collector to clear pending title verifications.',
          'Issue proactive DBT compensation tranches directly to bank accounts to reduce claimant friction.',
          'Fast-track model R&R housing allotment in coordination with State Revenue Department.',
        ]
      : [
          'Maintain regular fortnightly reviews between CALA and Executing Agency.',
          'Complete final revenue survey mutation in State Record of Rights.',
        ],
    timeline_forecast: {
      scheduled_completion: project.target_completion_date,
      statutory_risk_buffer_days: Math.round(delayMonths * 30),
      critical_path_milestone: project.current_lifecycle_stage.stage_name,
    },
  };
}
