export type UserRole = 'CITIZEN' | 'SURVEYOR' | 'REGISTRAR' | 'ADMIN';

export type ParcelStatus = 'PENDING_SURVEY' | 'REGISTERED' | 'DISPUTED' | 'TRANSFERRED' | 'REVOKED';

export type OwnershipType = 'FREEHOLD' | 'LEASEHOLD' | 'CUSTOMARY' | 'COMMUNAL' | 'STATE';

export interface LandParcel {
  id: string;
  parcel_number: string;
  title_deed_number?: string;
  district: string;
  sub_county: string;
  parish?: string;
  village?: string;
  area_sq_meters: number;
  status: ParcelStatus;
  ownership_type: OwnershipType;
  coordinates_geojson?: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}
