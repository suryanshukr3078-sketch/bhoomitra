'use client';

import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Download,
  Layers,
  Globe2,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';

interface DatasetItem {
  id: string;
  title: string;
  format: 'GeoJSON' | 'Cloud-Optimized GeoTIFF' | 'Shapefile' | 'PMTiles';
  featuresCount: string;
  srid: string;
  bbox: string;
  fileSize: string;
  fileSizeBytes: number;
  lastUpdated: string;
  lastUpdatedTimestamp: number;
  jurisdiction: string;
  description: string;
}

const DATASETS: DatasetItem[] = [
  {
    id: 'ds-01',
    title: 'Pune District Cadastral Parcel Polygons (2026)',
    format: 'GeoJSON',
    featuresCount: '48,200 parcels',
    srid: 'EPSG:4326 (WGS 84)',
    bbox: '[73.75, 18.42, 73.98, 18.61]',
    fileSize: '64.2 MB',
    fileSizeBytes: 67318579,
    lastUpdated: 'September 2026',
    lastUpdatedTimestamp: 1788220800000,
    jurisdiction: 'Maharashtra',
    description:
      'High-precision cadastral boundary polygons with surveyor verification timestamps, mutation sequence numbers, and land use codes.',
  },
  {
    id: 'ds-02',
    title: 'Bangalore Metropolitan 10cm Digital Surface Model & Orthomosaics',
    format: 'Cloud-Optimized GeoTIFF',
    featuresCount: '1 Raster Layer (COG)',
    srid: 'EPSG:32643 (UTM Zone 43N)',
    bbox: '[77.48, 12.83, 77.74, 13.14]',
    fileSize: '1.4 GB',
    fileSizeBytes: 1503238553,
    lastUpdated: 'August 2026',
    lastUpdatedTimestamp: 1785600000000,
    jurisdiction: 'Karnataka',
    description:
      'High-resolution drone photogrammetry orthomosaic tiled for rapid streaming and informal settlement encroachment audits.',
  },
  {
    id: 'ds-03',
    title: 'National Protected Forest Rights & Tribal Demarcations',
    format: 'PMTiles',
    featuresCount: '12,840 boundaries',
    srid: 'EPSG:4326 (WGS 84)',
    bbox: '[68.12, 6.75, 97.41, 35.50]',
    fileSize: '128 MB',
    fileSizeBytes: 134217728,
    lastUpdated: 'July 2026',
    lastUpdatedTimestamp: 1782921600000,
    jurisdiction: 'National (India)',
    description:
      'Serverless vector tile archive containing digitized community forest rights boundaries and customary tenure buffers.',
  },
  {
    id: 'ds-04',
    title: 'Gujarat Agricultural Irrigation Command Cadastre',
    format: 'Shapefile',
    featuresCount: '31,500 parcels',
    srid: 'EPSG:4326 (WGS 84)',
    bbox: '[71.19, 21.05, 73.40, 23.52]',
    fileSize: '42.8 MB',
    fileSizeBytes: 44879052,
    lastUpdated: 'June 2026',
    lastUpdatedTimestamp: 1780243200000,
    jurisdiction: 'Gujarat',
    description:
      'Field-verified parcel shapefiles for canal irrigation distribution, soil classification, and crop tenancy records.',
  },
];

export default function DatasetsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [sortBy, setSortBy] = useState<'date_desc' | 'size_desc' | 'title_asc'>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 2;
  const { toast } = useToast();

  const formats = ['All', 'GeoJSON', 'Cloud-Optimized GeoTIFF', 'PMTiles', 'Shapefile'];

  const filteredAndSortedDatasets = useMemo(() => {
    const filtered = DATASETS.filter((ds) => {
      const matchesSearch =
        ds.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.jurisdiction.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFormat = selectedFormat === 'All' || ds.format === selectedFormat;
      return matchesSearch && matchesFormat;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'date_desc') return b.lastUpdatedTimestamp - a.lastUpdatedTimestamp;
      if (sortBy === 'size_desc') return b.fileSizeBytes - a.fileSizeBytes;
      if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [searchQuery, selectedFormat, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedDatasets.length / pageSize) || 1;
  const paginatedDatasets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedDatasets.slice(start, start + pageSize);
  }, [filteredAndSortedDatasets, currentPage, pageSize]);

  const handleDownload = (ds: DatasetItem) => {
    toast({
      title: 'Download Initiated',
      description: `Streaming ${ds.format} package for ${ds.title.slice(0, 30)}... (${ds.fileSize})`,
      variant: 'success',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full w-fit">
            <Database className="w-3.5 h-3.5" aria-hidden="true" />
            Open Spatial Catalog
          </div>
          <Badge variant="outline" className="border-amber-400 text-amber-900 bg-amber-50">
            Synthetic Datasets (Demo)
          </Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Cadastral Datasets & GIS Layers
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
          Standardized geospatial datasets, vector tile packages, and aerial orthomosaics available under open data licensing.
        </p>

        {/* Search, Filter & Sort Controls */}
        <div className="pt-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search datasets by jurisdiction, format, or parcel attributes..."
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
              {formats.map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => {
                    setSelectedFormat(fmt);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                    selectedFormat === fmt
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white text-xs text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-none cursor-pointer"
                aria-label="Sort datasets"
              >
                <option value="date_desc">Newest First</option>
                <option value="size_desc">File Size (Largest)</option>
                <option value="title_asc">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Item Count & Page Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing {filteredAndSortedDatasets.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
          {Math.min(currentPage * pageSize, filteredAndSortedDatasets.length)} of{' '}
          {filteredAndSortedDatasets.length} spatial layers
        </span>
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Dataset Cards Grid */}
      {filteredAndSortedDatasets.length === 0 ? (
        <EmptyState
          icon="database"
          title="No Datasets Found"
          description={`No spatial layers match your search query for "${searchQuery}".`}
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedFormat('All');
            setCurrentPage(1);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedDatasets.map((ds) => (
            <article
              key={ds.id}
              className="flex flex-col justify-between p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{ds.format}</Badge>
                    <Badge variant="outline" className="text-[10px] text-amber-800 bg-amber-50/70 border-amber-200">
                      Synthetic GeoJSON (Demo)
                    </Badge>
                  </div>
                  <span className="text-xs font-medium text-slate-500">{ds.jurisdiction}</span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 leading-snug">{ds.title}</h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {ds.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{ds.featuresCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{ds.srid}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">BBOX:</span> {ds.bbox}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100 text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Updated {ds.lastUpdated}
                </span>
                <button
                  type="button"
                  onClick={() => handleDownload(ds)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download ({ds.fileSize})
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination Controls Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-2 border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                  currentPage === pageNum
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-2 border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
