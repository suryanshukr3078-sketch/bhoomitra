export interface IndianPlace {
  id: string;
  name: string;
  state: string;
  district?: string;
  coordinates: [number, number]; // [lng, lat]
  zoom: number;
  surveyNumber: string;
  owner: string;
  areaHa: number;
  tenureType: string;
  jurisdiction: string;
}

export const INDIAN_PRESET_PLACES: IndianPlace[] = [
  // National Capital
  {
    id: 'PAR-DEL-01',
    name: 'Delhi (Central)',
    state: 'Delhi',
    district: 'New Delhi',
    coordinates: [77.2090, 28.6139],
    zoom: 13,
    surveyNumber: 'Survey DL-01/Central',
    owner: 'Delhi Development Authority & Public Estate',
    areaHa: 6.2,
    tenureType: 'Institutional Freehold',
    jurisdiction: 'Delhi (Central District)',
  },
  {
    id: 'PAR-DEL-02',
    name: 'North Delhi (Rohini)',
    state: 'Delhi',
    district: 'North West Delhi',
    coordinates: [77.1126, 28.7495],
    zoom: 14,
    surveyNumber: 'Survey DL-08/Rohini-Sector-14',
    owner: 'Municipal Corporation of Delhi',
    areaHa: 9.4,
    tenureType: 'Commercial Freehold',
    jurisdiction: 'Delhi (North West)',
  },
  // Maharashtra
  {
    id: 'PAR-MUM-01',
    name: 'Mumbai (Nariman Point & Fort)',
    state: 'Maharashtra',
    district: 'Mumbai City',
    coordinates: [72.8238, 18.9256],
    zoom: 14,
    surveyNumber: 'Survey MC-402/Fort',
    owner: 'Maharashtra State Land Revenue Division',
    areaHa: 4.15,
    tenureType: 'Commercial Coastal Freehold',
    jurisdiction: 'Maharashtra (Mumbai City)',
  },
  {
    id: 'PAR-MUM-02',
    name: 'Mumbai Suburban (Bandra-Kurla)',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    coordinates: [72.8687, 19.0664],
    zoom: 14,
    surveyNumber: 'Survey BKC-Sector-G/14',
    owner: 'Mumbai Metropolitan Region Development Authority',
    areaHa: 14.8,
    tenureType: 'Institutional Long-Term Leasehold',
    jurisdiction: 'Maharashtra (Mumbai Suburban)',
  },
  {
    id: 'PAR-44029',
    name: 'Pune (Haveli & Shivaji Nagar)',
    state: 'Maharashtra',
    district: 'Pune',
    coordinates: [73.8567, 18.5204],
    zoom: 13,
    surveyNumber: 'Survey 142/3A',
    owner: 'Ramesh K. Joshi & Co-owners',
    areaHa: 4.85,
    tenureType: 'Freehold Agricultural',
    jurisdiction: 'Maharashtra (Pune)',
  },
  {
    id: 'PAR-NAG-01',
    name: 'Nagpur (Zero Mile Cadastre)',
    state: 'Maharashtra',
    district: 'Nagpur',
    coordinates: [79.0882, 21.1458],
    zoom: 13,
    surveyNumber: 'Survey NGP-88/Civil',
    owner: 'Nagpur Improvement Trust',
    areaHa: 5.6,
    tenureType: 'Public Municipal Land',
    jurisdiction: 'Maharashtra (Nagpur)',
  },
  // Karnataka
  {
    id: 'PAR-12093',
    name: 'Bangalore (Whitefield & Rural)',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    coordinates: [77.5946, 12.9716],
    zoom: 13,
    surveyNumber: 'Survey 88/1',
    owner: 'Bangalore Metropolitan Land Trust',
    areaHa: 12.4,
    tenureType: 'Communal Forest Buffer',
    jurisdiction: 'Karnataka (Bangalore Urban)',
  },
  {
    id: 'PAR-MYS-01',
    name: 'Mysore (Chamundi Foothills)',
    state: 'Karnataka',
    district: 'Mysuru',
    coordinates: [76.6394, 12.2958],
    zoom: 13,
    surveyNumber: 'Survey MYS-42/Palace',
    owner: 'Karnataka Revenue Estate Division',
    areaHa: 8.2,
    tenureType: 'Heritage Preservation Title',
    jurisdiction: 'Karnataka (Mysuru)',
  },
  // Madhya Pradesh
  {
    id: 'PAR-BPL-74',
    name: 'Bhopal (Upper Lake Sector)',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    coordinates: [77.4126, 23.2599],
    zoom: 13,
    surveyNumber: 'Survey MP-BPL/74',
    owner: 'Madhya Pradesh State Land Revenue Dept',
    areaHa: 8.5,
    tenureType: 'Municipal Land Trust',
    jurisdiction: 'Madhya Pradesh (Bhopal)',
  },
  {
    id: 'PAR-IND-01',
    name: 'Indore (Vijay Nagar Corridor)',
    state: 'Madhya Pradesh',
    district: 'Indore',
    coordinates: [75.8577, 22.7196],
    zoom: 13,
    surveyNumber: 'Survey IND-102/Agro',
    owner: 'Indore Development Authority',
    areaHa: 11.2,
    tenureType: 'Commercial Freehold',
    jurisdiction: 'Madhya Pradesh (Indore)',
  },
  // Bihar
  {
    id: 'PAR-PAT-01',
    name: 'Patna (Kankarbagh & Ganga Riverfront)',
    state: 'Bihar',
    district: 'Patna',
    coordinates: [85.1376, 25.5941],
    zoom: 13,
    surveyNumber: 'Survey PAT-204/Ganga',
    owner: 'Bihar State Revenue & Land Reforms Dept',
    areaHa: 7.8,
    tenureType: 'Alluvial Riverine Cadastre',
    jurisdiction: 'Bihar (Patna)',
  },
  {
    id: 'PAR-GAY-01',
    name: 'Gaya (Bodh Gaya Sacred Buffer)',
    state: 'Bihar',
    district: 'Gaya',
    coordinates: [84.9913, 24.6961],
    zoom: 14,
    surveyNumber: 'Survey BGY-18/Mahabodhi',
    owner: 'Bodh Gaya Temple Management & Revenue Estate',
    areaHa: 15.6,
    tenureType: 'Religious & Cultural Trust',
    jurisdiction: 'Bihar (Gaya)',
  },
  {
    id: 'PAR-MFP-01',
    name: 'Muzaffarpur (Tirhut Division)',
    state: 'Bihar',
    district: 'Muzaffarpur',
    coordinates: [85.3906, 26.1209],
    zoom: 13,
    surveyNumber: 'Survey MZ-55/Litchi-Belt',
    owner: 'Tirhut Agricultural Land Syndicate',
    areaHa: 18.2,
    tenureType: 'Agricultural RoR Holding',
    jurisdiction: 'Bihar (Muzaffarpur)',
  },
  {
    id: 'PAR-DBG-01',
    name: 'Darbhanga (Raj Darbhanga Estate)',
    state: 'Bihar',
    district: 'Darbhanga',
    coordinates: [85.8918, 26.1542],
    zoom: 13,
    surveyNumber: 'Survey DBG-94/Maharajadhiraja',
    owner: 'Bihar Land Bank & Wetland Trust',
    areaHa: 22.4,
    tenureType: 'Wetland Agro-Ecosystem',
    jurisdiction: 'Bihar (Darbhanga)',
  },
  {
    id: 'PAR-BGP-01',
    name: 'Bhagalpur (Silk City Riverine)',
    state: 'Bihar',
    district: 'Bhagalpur',
    coordinates: [87.0055, 25.2425],
    zoom: 13,
    surveyNumber: 'Survey BGP-33/Diara',
    owner: 'Bhagalpur Cadastral Settlement Board',
    areaHa: 13.5,
    tenureType: 'Diara Floodplain Concession',
    jurisdiction: 'Bihar (Bhagalpur)',
  },
  // Uttar Pradesh
  {
    id: 'PAR-LKO-01',
    name: 'Lucknow (Gomti Nagar Extension)',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    coordinates: [80.9462, 26.8467],
    zoom: 13,
    surveyNumber: 'Survey LKO-112/Gomti',
    owner: 'Lucknow Development Authority (LDA)',
    areaHa: 9.3,
    tenureType: 'Urban Residential Freehold',
    jurisdiction: 'Uttar Pradesh (Lucknow)',
  },
  {
    id: 'PAR-VNS-01',
    name: 'Varanasi (Kashi Vishwanath Corridor)',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    coordinates: [82.9739, 25.3176],
    zoom: 14,
    surveyNumber: 'Survey VNS-07/Ghat-Zone',
    owner: 'Varanasi Smart City Land Authority',
    areaHa: 5.1,
    tenureType: 'Ancient Cadastral Settlement',
    jurisdiction: 'Uttar Pradesh (Varanasi)',
  },
  {
    id: 'PAR-KNP-01',
    name: 'Kanpur (Civil Lines & Industrial)',
    state: 'Uttar Pradesh',
    district: 'Kanpur Nagar',
    coordinates: [80.3319, 26.4499],
    zoom: 13,
    surveyNumber: 'Survey KNP-58/Ganges',
    owner: 'Uttar Pradesh State Industrial Development Corp',
    areaHa: 21.0,
    tenureType: 'Industrial Freehold Lease',
    jurisdiction: 'Uttar Pradesh (Kanpur Nagar)',
  },
  {
    id: 'PAR-AGR-01',
    name: 'Agra (Taj Heritage Zone)',
    state: 'Uttar Pradesh',
    district: 'Agra',
    coordinates: [78.0081, 27.1767],
    zoom: 14,
    surveyNumber: 'Survey AGR-Taj-Trapezium/02',
    owner: 'Taj Trapezium Zone Authority',
    areaHa: 16.8,
    tenureType: 'Eco-Sensitive Heritage Zone',
    jurisdiction: 'Uttar Pradesh (Agra)',
  },
  {
    id: 'PAR-PRY-01',
    name: 'Prayagraj (Triveni Sangam)',
    state: 'Uttar Pradesh',
    district: 'Prayagraj',
    coordinates: [81.8463, 25.4358],
    zoom: 13,
    surveyNumber: 'Survey PRY-09/Sangam-Alluvium',
    owner: 'Prayagraj Mela Authority & Revenue Board',
    areaHa: 34.0,
    tenureType: 'Seasonal Communal Riverbed',
    jurisdiction: 'Uttar Pradesh (Prayagraj)',
  },
  {
    id: 'PAR-NOI-01',
    name: 'Noida / Greater Noida (Expressway)',
    state: 'Uttar Pradesh',
    district: 'Gautam Buddha Nagar',
    coordinates: [77.3910, 28.5355],
    zoom: 13,
    surveyNumber: 'Survey NOIDA-Sec-128/Parcel-A',
    owner: 'New Okhla Industrial Development Authority',
    areaHa: 28.5,
    tenureType: 'High-Tech Planned Urban Lease',
    jurisdiction: 'Uttar Pradesh (Gautam Buddha Nagar)',
  },
  // West Bengal
  {
    id: 'PAR-KOL-01',
    name: 'Kolkata (BBD Bagh & Raj Bhavan)',
    state: 'West Bengal',
    district: 'Kolkata',
    coordinates: [88.3639, 22.5726],
    zoom: 14,
    surveyNumber: 'Survey KOL-Ward-45/CS-1890',
    owner: 'West Bengal Land & Land Reforms Dept',
    areaHa: 4.8,
    tenureType: 'Colonial Cadastral Freehold',
    jurisdiction: 'West Bengal (Kolkata)',
  },
  {
    id: 'PAR-SLK-01',
    name: 'Kolkata (Salt Lake & New Town)',
    state: 'West Bengal',
    district: 'North 24 Parganas',
    coordinates: [88.4312, 22.5867],
    zoom: 13,
    surveyNumber: 'Survey WBHIDCO-Action-Area-2',
    owner: 'West Bengal Housing Infrastructure Dev Corp',
    areaHa: 19.4,
    tenureType: 'Reclaimed Wetland Urban Titling',
    jurisdiction: 'West Bengal (North 24 Parganas)',
  },
  {
    id: 'PAR-DGP-01',
    name: 'Durgapur (Steel City Industrial)',
    state: 'West Bengal',
    district: 'Paschim Bardhaman',
    coordinates: [87.3119, 23.5204],
    zoom: 13,
    surveyNumber: 'Survey DGP-Steel-Belt/04',
    owner: 'Steel Authority of India Ltd (SAIL)',
    areaHa: 45.0,
    tenureType: 'Public Sector Statutory Estate',
    jurisdiction: 'West Bengal (Paschim Bardhaman)',
  },
  // Telangana & Andhra Pradesh
  {
    id: 'PAR-HYD-01',
    name: 'Hyderabad (HITEC City & Cyberabad)',
    state: 'Telangana',
    district: 'Hyderabad',
    coordinates: [78.3780, 17.4474],
    zoom: 14,
    surveyNumber: 'Survey HYD-Madhapur/83',
    owner: 'Telangana State Industrial Infrastructure Corp',
    areaHa: 22.3,
    tenureType: 'Special Economic Zone Titling',
    jurisdiction: 'Telangana (Hyderabad)',
  },
  {
    id: 'PAR-VSK-01',
    name: 'Visakhapatnam (Port & Beach Road)',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    coordinates: [83.2185, 17.6868],
    zoom: 13,
    surveyNumber: 'Survey VSP-Harbour/12',
    owner: 'Visakhapatnam Port Authority',
    areaHa: 38.6,
    tenureType: 'Maritime Statutory Leasehold',
    jurisdiction: 'Andhra Pradesh (Visakhapatnam)',
  },
  {
    id: 'PAR-AMR-01',
    name: 'Amaravati (Capital Greenfields)',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    coordinates: [80.5150, 16.5417],
    zoom: 13,
    surveyNumber: 'Survey AMV-Pooling-P18',
    owner: 'Andhra Pradesh Capital Region Land Bank',
    areaHa: 62.0,
    tenureType: 'Land Pooling Scheme (LPS) Title',
    jurisdiction: 'Andhra Pradesh (Guntur)',
  },
  // Tamil Nadu
  {
    id: 'PAR-CHE-01',
    name: 'Chennai (OMR IT Expressway)',
    state: 'Tamil Nadu',
    district: 'Chennai',
    coordinates: [80.2450, 12.9698],
    zoom: 14,
    surveyNumber: 'Survey TN-Taramani/14',
    owner: 'Tamil Nadu State Electronic Corp (ELCOT)',
    areaHa: 16.5,
    tenureType: 'Institutional Freehold',
    jurisdiction: 'Tamil Nadu (Chennai)',
  },
  {
    id: 'PAR-CBE-01',
    name: 'Coimbatore (Textile Corridor)',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    coordinates: [76.9558, 11.0168],
    zoom: 13,
    surveyNumber: 'Survey CBE-Peelamedu/209',
    owner: 'Coimbatore Industrial Land Association',
    areaHa: 12.8,
    tenureType: 'Industrial Freehold',
    jurisdiction: 'Tamil Nadu (Coimbatore)',
  },
  // Rajasthan
  {
    id: 'PAR-JAI-01',
    name: 'Jaipur (Pink City & Mansarovar)',
    state: 'Rajasthan',
    district: 'Jaipur',
    coordinates: [75.7873, 26.9124],
    zoom: 13,
    surveyNumber: 'Survey RJ-JDA/Sector-05',
    owner: 'Jaipur Development Authority (JDA)',
    areaHa: 10.4,
    tenureType: 'Urban Residential 99-Year Lease',
    jurisdiction: 'Rajasthan (Jaipur)',
  },
  {
    id: 'PAR-JDH-01',
    name: 'Jodhpur (Sun City & Thar Buffer)',
    state: 'Rajasthan',
    district: 'Jodhpur',
    coordinates: [73.0243, 26.2389],
    zoom: 13,
    surveyNumber: 'Survey JDH-Thar/188',
    owner: 'Rajasthan State Land Revenue Board',
    areaHa: 44.0,
    tenureType: 'Arid Pastoral Communal Title',
    jurisdiction: 'Rajasthan (Jodhpur)',
  },
  // Gujarat
  {
    id: 'PAR-AHM-01',
    name: 'Ahmedabad (Sabarmati Riverfront)',
    state: 'Gujarat',
    district: 'Ahmedabad',
    coordinates: [72.5714, 23.0225],
    zoom: 13,
    surveyNumber: 'Survey AHM-SRFD-02',
    owner: 'Sabarmati Riverfront Development Corp',
    areaHa: 15.0,
    tenureType: 'Municipal Embankment Freehold',
    jurisdiction: 'Gujarat (Ahmedabad)',
  },
  {
    id: 'PAR-GFT-01',
    name: 'GIFT City (Gandhinagar)',
    state: 'Gujarat',
    district: 'Gandhinagar',
    coordinates: [72.6841, 23.1610],
    zoom: 14,
    surveyNumber: 'Survey GIFT-SEZ/Plot-44',
    owner: 'Gujarat International Finance Tec-City Co.',
    areaHa: 32.5,
    tenureType: 'International Financial Services Centre (IFSC) Estate',
    jurisdiction: 'Gujarat (Gandhinagar)',
  },
  {
    id: 'PAR-SRT-01',
    name: 'Surat (Diamond Bourse & Textile)',
    state: 'Gujarat',
    district: 'Surat',
    coordinates: [72.8311, 21.1702],
    zoom: 13,
    surveyNumber: 'Survey SRT-DREAM-City/08',
    owner: 'Surat Municipal Corporation',
    areaHa: 26.0,
    tenureType: 'Commercial Conclusive Title',
    jurisdiction: 'Gujarat (Surat)',
  },
  // Punjab & Haryana
  {
    id: 'PAR-CHD-01',
    name: 'Chandigarh (Corbusier Grid Sector 17)',
    state: 'Chandigarh',
    district: 'Chandigarh',
    coordinates: [76.7794, 30.7333],
    zoom: 14,
    surveyNumber: 'Survey CHD-Sec-17/Block-C',
    owner: 'Chandigarh Administration Public Estate',
    areaHa: 8.0,
    tenureType: 'Planned Union Territory Freehold',
    jurisdiction: 'Chandigarh (UT)',
  },
  {
    id: 'PAR-GUR-01',
    name: 'Gurugram (Cyber City & Golf Course)',
    state: 'Haryana',
    district: 'Gurugram',
    coordinates: [77.0266, 28.4595],
    zoom: 13,
    surveyNumber: 'Survey HR-GGM-Sector-54/Plot-1',
    owner: 'Haryana Urban Development Authority (HSVP)',
    areaHa: 18.0,
    tenureType: 'Corporate Commercial Freehold',
    jurisdiction: 'Haryana (Gurugram)',
  },
  {
    id: 'PAR-ASR-01',
    name: 'Amritsar (Golden Temple Walled City)',
    state: 'Punjab',
    district: 'Amritsar',
    coordinates: [74.8723, 31.6340],
    zoom: 14,
    surveyNumber: 'Survey PB-ASR-Kotwali/10',
    owner: 'Shiromani Gurdwara Parbandhak Committee & Revenue Trust',
    areaHa: 12.0,
    tenureType: 'Historical Sanctioned Estate',
    jurisdiction: 'Punjab (Amritsar)',
  },
  // Odisha
  {
    id: 'PAR-BBI-01',
    name: 'Bhubaneswar (Infocity & Temple Corridor)',
    state: 'Odisha',
    district: 'Khordha',
    coordinates: [85.8245, 20.2961],
    zoom: 13,
    surveyNumber: 'Survey OD-BBS-Chandrasekharpur/9',
    owner: 'Odisha Industrial Infrastructure Dev Corp (IDCO)',
    areaHa: 14.2,
    tenureType: 'Statutory Development Freehold',
    jurisdiction: 'Odisha (Khordha)',
  },
  // Jharkhand
  {
    id: 'PAR-RNC-01',
    name: 'Ranchi (Chota Nagpur Plateau)',
    state: 'Jharkhand',
    district: 'Ranchi',
    coordinates: [85.3096, 23.3441],
    zoom: 13,
    surveyNumber: 'Survey JH-CNT-Act-Holding/244',
    owner: 'Chota Nagpur Tribal Collective & Revenue Board',
    areaHa: 30.5,
    tenureType: 'Chota Nagpur Tenancy (CNT) Act Protected',
    jurisdiction: 'Jharkhand (Ranchi)',
  },
  // Assam & North-East
  {
    id: 'PAR-GAU-01',
    name: 'Guwahati (Brahmaputra Valley & Dispur)',
    state: 'Assam',
    district: 'Kamrup Metropolitan',
    coordinates: [91.7362, 26.1445],
    zoom: 13,
    surveyNumber: 'Survey AS-KAM-Dispur-Capital/01',
    owner: 'Assam State Land Revenue & Disaster Authority',
    areaHa: 19.8,
    tenureType: 'Riverine Protected Tenancy',
    jurisdiction: 'Assam (Kamrup Metropolitan)',
  },
  // Kerala
  {
    id: 'PAR-KOC-01',
    name: 'Kochi (Backwaters & Marine Drive)',
    state: 'Kerala',
    district: 'Ernakulam',
    coordinates: [76.2673, 9.9312],
    zoom: 13,
    surveyNumber: 'Survey KL-EKM-Kochi-Reclamation/05',
    owner: 'Greater Cochin Development Authority (GCDA)',
    areaHa: 7.2,
    tenureType: 'Coastal Regulation Zone (CRZ) Freehold',
    jurisdiction: 'Kerala (Ernakulam)',
  },
  // Jammu & Kashmir
  {
    id: 'PAR-SXR-01',
    name: 'Srinagar (Dal Lake & Boulevard)',
    state: 'Jammu and Kashmir',
    district: 'Srinagar',
    coordinates: [74.7973, 34.0837],
    zoom: 13,
    surveyNumber: 'Survey JK-SRI-Nishat-Belt/12',
    owner: 'Jammu & Kashmir Forest & Revenue Dept',
    areaHa: 17.5,
    tenureType: 'Eco-Sensitive Protected Mountain Estate',
    jurisdiction: 'Jammu & Kashmir (Srinagar)',
  },
  // Uttarakhand
  {
    id: 'PAR-DED-01',
    name: 'Dehradun (Doon Valley Eco-Sensitive)',
    state: 'Uttarakhand',
    district: 'Dehradun',
    coordinates: [78.0322, 30.3165],
    zoom: 13,
    surveyNumber: 'Survey UK-DDN-Rajpur/88',
    owner: 'Uttarakhand Cadastral Land Board',
    areaHa: 11.6,
    tenureType: 'Sub-Himalayan Watershed Tenure',
    jurisdiction: 'Uttarakhand (Dehradun)',
  },
];

// All 28 States and 8 Union Territories with Capital Centers for Instant Quick Jump
export interface IndianState {
  name: string;
  capital: string;
  code: string;
  coordinates: [number, number];
  zoom: number;
}

export const ALL_INDIAN_STATES: IndianState[] = [
  { name: 'Andhra Pradesh', capital: 'Amaravati', code: 'AP', coordinates: [80.5150, 16.5417], zoom: 11 },
  { name: 'Arunachal Pradesh', capital: 'Itanagar', code: 'AR', coordinates: [93.6053, 27.0844], zoom: 12 },
  { name: 'Assam', capital: 'Dispur / Guwahati', code: 'AS', coordinates: [91.7362, 26.1445], zoom: 12 },
  { name: 'Bihar', capital: 'Patna', code: 'BR', coordinates: [85.1376, 25.5941], zoom: 12 },
  { name: 'Chhattisgarh', capital: 'Raipur', code: 'CG', coordinates: [81.6296, 21.2514], zoom: 12 },
  { name: 'Goa', capital: 'Panaji', code: 'GA', coordinates: [73.8278, 15.4909], zoom: 13 },
  { name: 'Gujarat', capital: 'Gandhinagar / Ahmedabad', code: 'GJ', coordinates: [72.5714, 23.0225], zoom: 12 },
  { name: 'Haryana', capital: 'Chandigarh / Gurugram', code: 'HR', coordinates: [77.0266, 28.4595], zoom: 12 },
  { name: 'Himachal Pradesh', capital: 'Shimla', code: 'HP', coordinates: [77.1734, 31.1048], zoom: 13 },
  { name: 'Jharkhand', capital: 'Ranchi', code: 'JH', coordinates: [85.3096, 23.3441], zoom: 12 },
  { name: 'Karnataka', capital: 'Bengaluru', code: 'KA', coordinates: [77.5946, 12.9716], zoom: 12 },
  { name: 'Kerala', capital: 'Thiruvananthapuram', code: 'KL', coordinates: [76.9366, 8.5241], zoom: 12 },
  { name: 'Madhya Pradesh', capital: 'Bhopal', code: 'MP', coordinates: [77.4126, 23.2599], zoom: 12 },
  { name: 'Maharashtra', capital: 'Mumbai', code: 'MH', coordinates: [72.8777, 19.0760], zoom: 12 },
  { name: 'Manipur', capital: 'Imphal', code: 'MN', coordinates: [93.9368, 24.8170], zoom: 13 },
  { name: 'Meghalaya', capital: 'Shillong', code: 'ML', coordinates: [91.8933, 25.5788], zoom: 13 },
  { name: 'Mizoram', capital: 'Aizawl', code: 'MZ', coordinates: [92.7176, 23.7307], zoom: 13 },
  { name: 'Nagaland', capital: 'Kohima', code: 'NL', coordinates: [94.1086, 25.6751], zoom: 13 },
  { name: 'Odisha', capital: 'Bhubaneswar', code: 'OD', coordinates: [85.8245, 20.2961], zoom: 12 },
  { name: 'Punjab', capital: 'Chandigarh / Amritsar', code: 'PB', coordinates: [74.8723, 31.6340], zoom: 12 },
  { name: 'Rajasthan', capital: 'Jaipur', code: 'RJ', coordinates: [75.7873, 26.9124], zoom: 12 },
  { name: 'Sikkim', capital: 'Gangtok', code: 'SK', coordinates: [88.6138, 27.3389], zoom: 13 },
  { name: 'Tamil Nadu', capital: 'Chennai', code: 'TN', coordinates: [80.2707, 13.0827], zoom: 12 },
  { name: 'Telangana', capital: 'Hyderabad', code: 'TS', coordinates: [78.4867, 17.3850], zoom: 12 },
  { name: 'Tripura', capital: 'Agartala', code: 'TR', coordinates: [91.2868, 23.8315], zoom: 13 },
  { name: 'Uttar Pradesh', capital: 'Lucknow', code: 'UP', coordinates: [80.9462, 26.8467], zoom: 12 },
  { name: 'Uttarakhand', capital: 'Dehradun', code: 'UK', coordinates: [78.0322, 30.3165], zoom: 13 },
  { name: 'West Bengal', capital: 'Kolkata', code: 'WB', coordinates: [88.3639, 22.5726], zoom: 12 },
  // Union Territories
  { name: 'Delhi (NCT)', capital: 'New Delhi', code: 'DL', coordinates: [77.2090, 28.6139], zoom: 12 },
  { name: 'Jammu & Kashmir', capital: 'Srinagar / Jammu', code: 'JK', coordinates: [74.7973, 34.0837], zoom: 12 },
  { name: 'Ladakh', capital: 'Leh', code: 'LA', coordinates: [77.5771, 34.1526], zoom: 12 },
  { name: 'Chandigarh', capital: 'Chandigarh', code: 'CH', coordinates: [76.7794, 30.7333], zoom: 13 },
  { name: 'Puducherry', capital: 'Puducherry', code: 'PY', coordinates: [79.8083, 11.9416], zoom: 13 },
  { name: 'Andaman & Nicobar', capital: 'Port Blair', code: 'AN', coordinates: [92.7265, 11.6234], zoom: 12 },
  { name: 'Dadra & Nagar Haveli and Daman & Diu', capital: 'Daman', code: 'DD', coordinates: [72.8397, 20.4283], zoom: 13 },
  { name: 'Lakshadweep', capital: 'Kavaratti', code: 'LD', coordinates: [72.6420, 10.5667], zoom: 13 },
];

/**
 * Searches local catalog of Indian hubs with case-insensitive matching
 */
export function searchLocalIndianPlaces(query: string): IndianPlace[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return INDIAN_PRESET_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.state.toLowerCase().includes(q) ||
      (p.district && p.district.toLowerCase().includes(q)) ||
      p.surveyNumber.toLowerCase().includes(q) ||
      p.jurisdiction.toLowerCase().includes(q)
  );
}

export interface GeocodedPlaceResult {
  id: string;
  displayName: string;
  name: string;
  state?: string;
  coordinates: [number, number]; // [lng, lat]
  importance?: number;
  type?: string;
}

/**
 * Real-time pan-India geocoding.
 * Tries server-side /api/geocode endpoint first (powered by Photon + Nominatim with custom User-Agent).
 * Automatically falls back to client-side Photon OSM API (CORS enabled for all browsers).
 */
export async function geocodePanIndia(query: string): Promise<GeocodedPlaceResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery || cleanQuery.length < 2) return [];

  // 1. Try our internal server route /api/geocode
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`/api/geocode?q=${encodeURIComponent(cleanQuery)}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.results) && data.results.length > 0) {
        return data.results.map((r: any) => ({
          id: r.id || `GEO-${Math.random().toString(36).slice(2, 9)}`,
          displayName: r.displayName || r.name,
          name: r.name || cleanQuery,
          state: r.state || '',
          coordinates: r.coordinates,
          importance: r.importance,
          type: r.type,
        }));
      }
    }
  } catch {
    // Silently proceed to direct Photon fallback
  }

  // 2. Direct browser fallback via Photon OpenStreetMap Geocoder
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      cleanQuery
    )}&limit=6&bbox=68.1,6.5,97.4,35.5`;

    const pRes = await fetch(photonUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (pRes.ok) {
      const pData = await pRes.json();
      if (Array.isArray(pData?.features) && pData.features.length > 0) {
        const results: GeocodedPlaceResult[] = [];
        for (const feat of pData.features) {
          const props = feat.properties || {};
          const geom = feat.geometry || {};
          if (
            geom.type === 'Point' &&
            Array.isArray(geom.coordinates) &&
            geom.coordinates.length >= 2
          ) {
            const [lng, lat] = geom.coordinates;
            // Validate bounding box of India
            if (lng >= 68.0 && lng <= 97.5 && lat >= 6.5 && lat <= 37.5) {
              const name = props.name || cleanQuery;
              const state = props.state || '';
              const district = props.district || props.county || '';
              const parts = [name, district, state, 'India'].filter(Boolean);

              results.push({
                id: `PHOTON-${props.osm_id || Math.random().toString(36).slice(2, 9)}`,
                name,
                displayName: parts.join(', '),
                state,
                coordinates: [lng, lat],
                type: props.type || props.osm_value,
              });
            }
          }
        }
        if (results.length > 0) return results;
      }
    }
  } catch {
    // Silently fall back to local lookup
  }

  // 3. Fallback: Search local catalog
  const local = searchLocalIndianPlaces(cleanQuery);
  return local.map((p) => ({
    id: p.id,
    name: p.name,
    displayName: `${p.name}, ${p.district || p.state}`,
    state: p.state,
    coordinates: p.coordinates,
    importance: 0.9,
    type: 'preset',
  }));
}

/**
 * Generates a dynamic Cadastral Polygon boundary feature around any coordinates [lon, lat]
 */
export function createCadastralFeature(
  parcelId: string,
  name: string,
  jurisdiction: string,
  coordinates: [number, number],
  surveyNumber?: string,
  areaHa: number = 5.4
) {
  const [lng, lat] = coordinates;
  const dLng = 0.004;
  const dLat = 0.003;

  return {
    id: parcelId,
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [lng - dLng, lat - dLat],
          [lng + dLng, lat - dLat],
          [lng + dLng, lat + dLat],
          [lng - dLng, lat + dLat],
          [lng - dLng, lat - dLat],
        ],
      ],
    },
    properties: {
      id: parcelId,
      name,
      jurisdiction,
      surveyNumber: surveyNumber || `Survey Plot ${Math.floor(Math.random() * 800) + 1}/A`,
      areaHa,
      tenureType: 'Revenue Cadastral Title',
      mutationDate: '18 September 2026',
    },
  };
}
