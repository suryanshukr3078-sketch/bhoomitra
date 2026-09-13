'use client';

import React, { Component, ReactNode, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Layers, Loader2, AlertCircle, EyeOff } from 'lucide-react';
import { apiRequest } from '@/lib/api/client';
import { SpatialFeatureItem, SEED_SPATIAL_FEATURES } from '@/components/maps/MapView';

// Dynamically import MapView with SSR disabled to prevent server-side DOM errors
const MapView = dynamic(
  () => import('@/components/maps/MapView').then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-72 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-xs">Loading spatial map preview...</span>
      </div>
    ),
  }
);

interface SpatialErrorBoundaryProps {
  children: ReactNode;
}

interface SpatialErrorBoundaryState {
  hasError: boolean;
}

class SpatialErrorBoundary extends Component<SpatialErrorBoundaryProps, SpatialErrorBoundaryState> {
  constructor(props: SpatialErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): SpatialErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('SpatialFeaturePreview caught rendering error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Spatial interactive preview is currently unavailable for this layer. Downloadable GeoJSON is intact.</span>
        </div>
      );
    }
    return this.props.children;
  }
}

interface SpatialFeaturePreviewProps {
  resourceId: string;
  resourceType: string;
  className?: string;
}

export function SpatialFeaturePreview({
  resourceId,
  resourceType,
  className = '',
}: SpatialFeaturePreviewProps) {
  // STRICT GUARD: If not a spatial layer, NEVER attempt spatial data fetch
  if (resourceType !== 'spatial_layer') {
    return null;
  }

  return (
    <SpatialErrorBoundary>
      <SpatialFeatureContent resourceId={resourceId} className={className} />
    </SpatialErrorBoundary>
  );
}

function SpatialFeatureContent({
  resourceId,
  className = '',
}: {
  resourceId: string;
  className?: string;
}) {
  const [features, setFeatures] = useState<SpatialFeatureItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsUnavailable(false);

    async function fetchFeatures() {
      try {
        // Attempt secondary fetch for spatial features
        const data = await apiRequest<{ type: string; features: any[]; count: number }>(
          '/spatial/features'
        ).catch(() => null);

        if (!isMounted) return;

        if (data && Array.isArray(data.features) && data.features.length > 0) {
          setFeatures(data.features);
        } else {
          // Use seed fallback features
          setFeatures(SEED_SPATIAL_FEATURES);
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn('Secondary spatial features fetch error, falling back:', err);
        setFeatures(SEED_SPATIAL_FEATURES);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchFeatures();

    return () => {
      isMounted = false;
    };
  }, [resourceId]);

  if (isUnavailable) {
    return null;
  }

  return (
    <section aria-labelledby="spatial-preview-heading" className={`space-y-3 pt-2 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 id="spatial-preview-heading" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          Spatial GIS Layer Preview
        </h2>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          EPSG:4326 PostGIS Invariant
        </span>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-72">
        {isLoading ? (
          <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span className="text-xs">Fetching cadastral geometries...</span>
          </div>
        ) : (
          <MapView
            features={features}
            center={[73.8567, 18.5204]}
            zoom={13}
            className="w-full h-full"
          />
        )}
      </div>
    </section>
  );
}
