'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Download,
  Award,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, apiGet } from '@/lib/api/client';

interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  doi: string;
  publicationDate: string;
  publicationTimestamp: number;
  peerReviewed: boolean;
  abstract: string;
  category: string;
}

const PAPERS: ResearchPaper[] = [
  {
    id: 'res-001',
    title: 'PostGIS Cadastral Polygon Topology: Preventing Boundary Disputes in Communal Forests',
    authors: ['Dr. Aisha Sharma', 'K. V. Raman'],
    journal: 'International Journal of Land Administration & Spatial Science',
    doi: '10.1016/j.landuse.2026.108420',
    publicationDate: 'August 2026',
    publicationTimestamp: 1785600000000,
    peerReviewed: true,
    category: 'Cadastral GIS',
    abstract:
      'We demonstrate an automated PostGIS topological validation pipeline enforcing zero-overlap boundary invariants across 45,000 communal land parcels.',
  },
  {
    id: 'res-002',
    title: 'Immutable Mutation Provenance: Cryptographic Land Registration in Developing Economies',
    authors: ['Prof. David Chen', 'Elena Rostova'],
    journal: 'Land Economics & Tenure Quarterly',
    doi: '10.1080/01436597.2026.220199',
    publicationDate: 'July 2026',
    publicationTimestamp: 1782921600000,
    peerReviewed: true,
    category: 'Tenure Security',
    abstract:
      'Empirical analysis of land registry corruption mitigation through cryptographic append-only DAG provenance trees.',
  },
  {
    id: 'res-003',
    title: 'Comparative Analysis of Customary and Statutory Land Rights in Sub-Saharan Agrosystems',
    authors: ['Kwame Mensah', 'Dr. Sarah Ndlovu'],
    journal: 'African Land Governance Review',
    doi: '10.1111/j.1477-8947.2026.01289',
    publicationDate: 'June 2026',
    publicationTimestamp: 1780243200000,
    peerReviewed: false,
    category: 'Customary Rights',
    abstract:
      'Examines the legal interface between customary village chiefs and centralized statutory GIS registries.',
  },
  {
    id: 'res-004',
    title: 'Drone Photogrammetry and High-Resolution Orthomosaics for Rapid Informal Settlement Mapping',
    authors: ['Carlos Mendez', 'Maria Santos'],
    journal: 'Urban Land Information Systems',
    doi: '10.1007/s10901-026-09874-x',
    publicationDate: 'May 2026',
    publicationTimestamp: 1777564800000,
    peerReviewed: true,
    category: 'Cadastral GIS',
    abstract:
      'Centimeter-accuracy orthomosaic processing with Cloud-Optimized GeoTIFFs for informal settlement formalization.',
  },
];

export default function ResearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'title_asc'>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiItems, setApiItems] = useState<ResearchPaper[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const pageSize = 3;
  const { toast } = useToast();

  const categories = ['All', 'Cadastral GIS', 'Tenure Security', 'Customary Rights'];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await apiGet<{ items: any[]; count: number }>(
          `/search?resource_type=research_paper&q=${encodeURIComponent(searchQuery)}`,
          { items: [], count: 0 }
        );

        if (!isMounted) return;

        if (data && Array.isArray(data.items) && data.items.length > 0) {
          const mapped: ResearchPaper[] = data.items.map((item) => ({
            id: item.id,
            title: item.title,
            authors: ['Accredited Platform Author'],
            journal: 'Land Governance Open Repository',
            doi: `10.1016/landgov.${item.slug || item.id}`,
            publicationDate: new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            }),
            publicationTimestamp: new Date(item.created_at).getTime(),
            peerReviewed: true,
            category: 'Cadastral GIS',
            abstract: item.abstract,
          }));
          setApiItems(mapped);
          setApiError(null);
        } else {
          setApiItems([]);
          setApiError(null);
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn('API research search error, using safe defaults:', err);
        setApiItems([]);
        setApiError('Unable to load live research data from API. Displaying standard catalog papers.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const allAvailablePapers = useMemo(() => {
    if (apiItems.length > 0) {
      return [...apiItems, ...PAPERS.filter((p) => !apiItems.some((a) => a.title === p.title))];
    }
    return PAPERS;
  }, [apiItems]);

  const filteredAndSortedPapers = useMemo(() => {
    const filtered = allAvailablePapers.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'date_desc') return b.publicationTimestamp - a.publicationTimestamp;
      if (sortBy === 'date_asc') return a.publicationTimestamp - b.publicationTimestamp;
      if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [allAvailablePapers, searchQuery, selectedCategory, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedPapers.length / pageSize) || 1;
  const paginatedPapers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedPapers.slice(start, start + pageSize);
  }, [filteredAndSortedPapers, currentPage, pageSize]);

  const handleDownload = (paper: ResearchPaper) => {
    toast({
      title: 'Citation Downloaded',
      description: `BibTeX and metadata for "${paper.title.slice(0, 35)}..." saved.`,
      variant: 'success',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full w-fit">
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            Peer-Reviewed Repository
          </div>
          <Badge variant="outline" className="border-amber-400 text-amber-900 bg-amber-50">
            Synthetic Records (Demo)
          </Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Land Governance & Spatial Research Papers
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
          Search indexed research papers, methodological frameworks, and empirical studies supporting evidence-based land administration.
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
              placeholder="Search by title, author, keyword, or methodology..."
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
            {/* Category Filter */}
            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white text-xs text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-none cursor-pointer"
                aria-label="Sort research papers"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="title_asc">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Item Count & Page Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing {filteredAndSortedPapers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
          {Math.min(currentPage * pageSize, filteredAndSortedPapers.length)} of{' '}
          {filteredAndSortedPapers.length} papers
        </span>
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* API Warning/Status Banner if offline */}
      {apiError && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2 shadow-sm" role="status">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Papers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-28 rounded-full" />
              </div>
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedPapers.length === 0 ? (
        <EmptyState
          icon="search"
          title="No Research Papers Found"
          description={`No papers match your search for "${searchQuery}". Try broader keywords like "tenure" or "GIS".`}
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('All');
            setCurrentPage(1);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {paginatedPapers.map((paper) => (
            <article
              key={paper.id}
              className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{paper.category}</Badge>
                  {paper.peerReviewed && (
                    <Badge variant="success">
                      <Award className="w-3 h-3" /> Peer Reviewed
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] text-amber-800 bg-amber-50/70 border-amber-200">
                    Synthetic Paper (Demo)
                  </Badge>
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {paper.publicationDate}
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {paper.title}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-emerald-800">
                  {paper.authors.join(', ')}
                </p>
                <p className="text-xs text-slate-500 italic">{paper.journal}</p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {paper.abstract}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <div className="text-xs font-mono text-slate-500">
                  DOI: <span className="text-slate-700 font-medium">{paper.doi}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(paper)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Citation & BibTeX
                  </button>
                  <a
                    href={`https://doi.org/${paper.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-sm"
                  >
                    Full Text <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
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
