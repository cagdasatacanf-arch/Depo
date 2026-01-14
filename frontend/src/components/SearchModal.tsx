import { useEffect, useState, useCallback } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Bitcoin, DollarSign, Package } from 'lucide-react';

interface Asset {
  id: number;
  symbol: string;
  name: string;
  category: 'stock' | 'crypto' | 'forex' | 'commodity' | 'etf' | 'index';
  sector?: string;
  market_cap?: number;
  logo_url?: string;
  similarity?: number;
}

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAsset: (asset: Asset) => void;
}

const categoryIcons = {
  stock: TrendingUp,
  crypto: Bitcoin,
  forex: DollarSign,
  commodity: Package,
  etf: TrendingUp,
  index: TrendingUp,
};

const categoryColors = {
  stock: 'bg-blue-500',
  crypto: 'bg-orange-500',
  forex: 'bg-green-500',
  commodity: 'bg-yellow-600',
  etf: 'bg-purple-500',
  index: 'bg-indigo-500',
};

const categoryLabels = {
  stock: 'Stock',
  crypto: 'Crypto',
  forex: 'Forex',
  commodity: 'Commodity',
  etf: 'ETF',
  index: 'Index',
};

export function SearchModal({ open, onOpenChange, onSelectAsset }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 1) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          q: query,
          limit: '50',
        });

        if (selectedCategory) {
          params.append('category', selectedCategory);
        }

        const response = await fetch(
          `http://localhost:8000/api/assets/search?${params.toString()}`
        );

        const data = await response.json();

        if (data.status === 'ok') {
          setResults(data.results || []);
        } else {
          console.error('Search error:', data.message);
          setResults([]);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setSelectedCategory(null);
    }
  }, [open]);

  // Group results by category
  const groupedResults = results.reduce((acc, asset) => {
    if (!acc[asset.category]) {
      acc[asset.category] = [];
    }
    acc[asset.category].push(asset);
    return acc;
  }, {} as Record<string, Asset[]>);

  const handleSelect = useCallback((asset: Asset) => {
    onSelectAsset(asset);
    onOpenChange(false);
  }, [onSelectAsset, onOpenChange]);

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return '';

    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toFixed(0)}`;
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search assets by symbol or name..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <CommandEmpty>
            No assets found for "{query}"
            <div className="mt-2 text-xs text-muted-foreground">
              Try searching by symbol (e.g., AAPL) or name (e.g., Apple)
            </div>
          </CommandEmpty>
        )}

        {!loading && query.length === 0 && (
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="text-sm text-muted-foreground">Start typing to search...</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(['stock', 'crypto', 'forex', 'commodity'] as const).map((cat) => (
                  <Badge
                    key={cat}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                  >
                    {categoryLabels[cat]}
                  </Badge>
                ))}
              </div>
            </div>
          </CommandEmpty>
        )}

        {!loading && results.length > 0 && (
          <>
            {selectedCategory && (
              <div className="px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Filtering by:</span>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(null)}
                  >
                    {categoryLabels[selectedCategory as keyof typeof categoryLabels]}
                    <span className="ml-1">×</span>
                  </Badge>
                </div>
              </div>
            )}

            {Object.entries(groupedResults).map(([category, assets]) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              const color = categoryColors[category as keyof typeof categoryColors];

              return (
                <div key={category}>
                  <CommandSeparator />
                  <CommandGroup
                    heading={
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{categoryLabels[category as keyof typeof categoryLabels]}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {assets.length}
                        </Badge>
                      </div>
                    }
                  >
                    {assets.map((asset) => (
                      <CommandItem
                        key={asset.id}
                        value={`${asset.symbol}-${asset.name}`}
                        onSelect={() => handleSelect(asset)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-2 h-2 rounded-full ${color}`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{asset.symbol}</span>
                              <span className="text-sm text-muted-foreground truncate">
                                {asset.name}
                              </span>
                            </div>
                            {asset.sector && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {asset.sector}
                              </div>
                            )}
                          </div>
                        </div>
                        {asset.market_cap && (
                          <div className="text-sm text-muted-foreground ml-2">
                            {formatMarketCap(asset.market_cap)}
                          </div>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </div>
              );
            })}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

// Hook for keyboard shortcut (Cmd+K / Ctrl+K)
export function useSearchModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return { open, setOpen };
}
