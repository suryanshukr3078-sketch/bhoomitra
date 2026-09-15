export type AllowedResourceType = 'research_paper' | 'policy' | 'dataset' | 'spatial_layer';

export interface ResourceTypeOption {
  value: AllowedResourceType;
  label: string;
  icon: string;
}

export interface RoleContributeConfig {
  roleKey: 'researcher' | 'policymaker' | 'government' | 'civil_society' | 'admin' | 'contributor';
  roleName: string;
  badgeLabel: string;
  badgeColor: string;
  formTitle: string;
  formSubtitle: string;
  allowedTypes: ResourceTypeOption[];
  defaultType: AllowedResourceType;
  titlePlaceholder: string;
  abstractPlaceholder: string;
  isTypeLocked: boolean;
  lockedReason: string;
}

export function getRoleContributeConfig(role?: string | null, isSuperuser?: boolean): RoleContributeConfig {
  const normRole = (role || '').toLowerCase().replace(/[-_\s]/g, '');

  // 1. Administrator (Superuser or Admin role)
  if (isSuperuser || normRole === 'admin' || normRole === 'superuser') {
    return {
      roleKey: 'admin',
      roleName: 'Platform Administrator',
      badgeLabel: '🛡️ Admin Clearance — All Registry Categories Unlocked',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      formTitle: 'Submit to National Registry (Admin Clearance)',
      formSubtitle: 'Full administrative clearance to publish research papers, statutory policies, datasets, and spatial layers.',
      allowedTypes: [
        { value: 'research_paper', label: '📄 Research Paper', icon: '📄' },
        { value: 'policy', label: '⚖️ Policy Document', icon: '⚖️' },
        { value: 'dataset', label: '📊 Open Dataset', icon: '📊' },
        { value: 'spatial_layer', label: '🗺️ Spatial GIS Layer', icon: '🗺️' },
      ],
      defaultType: 'research_paper',
      titlePlaceholder: 'e.g. National Conclusive Titling Directive & PostGIS Topology 2026',
      abstractPlaceholder: 'Provide scope, legal mandate, or scientific methodology...',
      isTypeLocked: false,
      lockedReason: '',
    };
  }

  // 2. Researcher / Academic / Scholar -> RESEARCH PAPERS ONLY
  if (normRole.includes('research') || normRole.includes('scholar') || normRole.includes('academic') || normRole.includes('faculty')) {
    return {
      roleKey: 'researcher',
      roleName: 'Researcher & Academic',
      badgeLabel: '🎓 Researcher Clearance — Research Papers Only',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      formTitle: 'Submit Research Paper',
      formSubtitle: 'Upload peer-reviewed studies, cadastral science methodologies, and academic research papers.',
      allowedTypes: [
        { value: 'research_paper', label: '📄 Research Paper', icon: '📄' },
      ],
      defaultType: 'research_paper',
      titlePlaceholder: 'e.g. Cadastral Boundary Invariant & PostGIS Topology in Agro-Ecological Zones 2026',
      abstractPlaceholder: 'Provide research methodology, mathematical or spatial topology formulation, sample coverage, and key empirical findings...',
      isTypeLocked: true,
      lockedReason: 'Under your verified Researcher clearance, you can only publish Research Papers to the National Scientific Registry.',
    };
  }

  // 3. Policy Maker & Analyst -> POLICY DOCUMENTS ONLY
  if (normRole.includes('policy') || normRole.includes('legislat')) {
    return {
      roleKey: 'policymaker',
      roleName: 'Policy Maker & Analyst',
      badgeLabel: '⚖️ Policy Maker Clearance — Policy Documents Only',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      formTitle: 'Submit Policy Document',
      formSubtitle: 'Upload statutory frameworks, legislative acts, land revenue codes, and policy directives.',
      allowedTypes: [
        { value: 'policy', label: '⚖️ Policy Document', icon: '⚖️' },
      ],
      defaultType: 'policy',
      titlePlaceholder: 'e.g. National Conclusive Land Titling Model Act & Revenue Mutation Guidelines 2026',
      abstractPlaceholder: 'Provide statutory basis, issuing department, jurisdiction coverage, and policy implementation mandate...',
      isTypeLocked: true,
      lockedReason: 'Under your verified Policy Maker clearance, you can only publish Policy Documents to the Statutory Policy Registry.',
    };
  }

  // 4. Government Authority -> GOVERNMENT AUTHORISED PAPERS ONLY
  if (normRole.includes('govern') || normRole.includes('offic') || normRole.includes('revenue')) {
    return {
      roleKey: 'government',
      roleName: 'Government Authority',
      badgeLabel: '🏛️ Official Clearance — Government Authorized Papers Only',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      formTitle: 'Submit Government Authorized Paper',
      formSubtitle: 'Upload gazetted government orders, cadastral survey circulars, and authorized mutation notices.',
      allowedTypes: [
        { value: 'policy', label: '🏛️ Government Authorized Paper', icon: '🏛️' },
      ],
      defaultType: 'policy',
      titlePlaceholder: 'e.g. District Revenue Commissioner Cadastral Demarcation & Survey Order 2026',
      abstractPlaceholder: 'Provide government order number, issuing secretary/collectorate, statutory authority, and gazette details...',
      isTypeLocked: true,
      lockedReason: 'Under your verified Government clearance, you can only publish Government Authorized Papers and Gazette Orders.',
    };
  }

  // 5. Civil Society & Advocacy -> FIELD REPORTS & COMMUNITY DATA ONLY
  if (normRole.includes('civil') || normRole.includes('society') || normRole.includes('advoca') || normRole.includes('ngo')) {
    return {
      roleKey: 'civil_society',
      roleName: 'Civil Society & Grassroots',
      badgeLabel: '👥 Civil Society Clearance — Community Field Reports & Data',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      formTitle: 'Submit Community Report & Field Documentation',
      formSubtitle: 'Upload Forest Rights Act (FRA) ground audits, community tenure maps, and public interest documentation.',
      allowedTypes: [
        { value: 'research_paper', label: '📑 Community Field Report', icon: '📑' },
        { value: 'dataset', label: '📊 Community Land Dataset', icon: '📊' },
      ],
      defaultType: 'research_paper',
      titlePlaceholder: 'e.g. Community Forest Rights Titling Audit & Cadastral Overlap Report 2026',
      abstractPlaceholder: 'Provide field survey scope, gram sabha verification status, and community tenure findings...',
      isTypeLocked: false,
      lockedReason: '',
    };
  }

  // 6. Standard Contributor Fallback
  return {
    roleKey: 'contributor',
    roleName: 'Platform Contributor',
    badgeLabel: 'Standard Contributor Clearance',
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
    formTitle: 'Submit Resource to National Registry',
    formSubtitle: 'Upload verified documentation, research studies, or datasets.',
    allowedTypes: [
      { value: 'research_paper', label: '📄 Research Paper', icon: '📄' },
      { value: 'policy', label: '⚖️ Policy Document', icon: '⚖️' },
      { value: 'dataset', label: '📊 Open Dataset', icon: '📊' },
    ],
    defaultType: 'research_paper',
    titlePlaceholder: 'e.g. Pune Metropolitan Cadastral Survey & Mutation Guidelines 2026',
    abstractPlaceholder: 'Provide a summary of this resource — scope, methodology, geographic coverage, or legal basis...',
    isTypeLocked: false,
    lockedReason: '',
  };
}
