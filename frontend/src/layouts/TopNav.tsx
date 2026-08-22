
import { useEffect, useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  Sparkles,
  Activity,
  Command,
  X,
  ArrowRight,
  Package,
  CheckCircle2,
  AlertTriangle,
  Info,
  Check,
} from 'lucide-react';
import { NavigationSection } from './Sidebar';
import { cn } from '@/utils/cn';
import { productsService } from '@/services/products.service';
import { Product } from '@/types/product.types';

export interface TopNavProps {
  activeSection: NavigationSection;
  onOpenMobileMenu: () => void;
  onNavigate?: (section: NavigationSection) => void;
  className?: string;
}

const sectionTitles: Record<NavigationSection, string> = {
  overview: 'Platform Overview',
  ingestion: 'Data Ingestion',
  products: 'Product Intelligence',
  quality: 'Quality Control',
  intelligence: 'Market Intelligence',
};

const sectionCodes: Record<NavigationSection, string> = {
  overview: 'OVR-00',
  ingestion: 'ING-01',
  products: 'PRD-02',
  quality: 'QLT-03',
  intelligence: 'INT-04',
};

type NotificationItem = {
  id: number;
  title: string;
  description: string;
  time: string;
  type: 'success' | 'warning' | 'info';
  section: NavigationSection;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: 'AI enrichment completed',
    description: '1,288 SKUs recovered through attribute enrichment.',
    time: '2 min ago',
    type: 'success',
    section: 'products',
  },
  {
    id: 2,
    title: 'Duplicate clusters detected',
    description: 'Semantic analysis identified clusters requiring review.',
    time: '18 min ago',
    type: 'warning',
    section: 'intelligence',
  },
  {
    id: 3,
    title: 'Catalog quality improved',
    description: 'Your catalog quality score is currently tracking upward.',
    time: '42 min ago',
    type: 'success',
    section: 'quality',
  },
  {
    id: 4,
    title: 'Pipeline is running',
    description: 'ANVAYA AI telemetry is actively monitoring your catalog.',
    time: '1 hr ago',
    type: 'info',
    section: 'overview',
  },
];

export function TopNav({
  activeSection,
  onOpenMobileMenu,
  onNavigate,
  className,
}: TopNavProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  const openSearch = () => {
    setNotificationsOpen(false);
    setSearchOpen(true);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  const openNotifications = () => {
    setSearchOpen(false);
    setNotificationsOpen((previous) => !previous);
  };

  const closeNotifications = () => {
    setNotificationsOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openSearch();
      }

      if (event.key === 'Escape') {
        closeSearch();
        closeNotifications();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!searchOpen) return;

    const loadProducts = async () => {
      try {
        setSearchLoading(true);

        const response = await productsService.fetchProducts({
          limit: 100,
        });

        setProducts(response.data || []);
      } catch (error) {
        console.error('Failed to load products for search:', error);
      } finally {
        setSearchLoading(false);
      }
    };

    loadProducts();
  }, [searchOpen]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts =
    normalizedQuery.length === 0
      ? []
      : products.filter((product: any) => {
        const searchableText = [
          product.name,
          product.title,
          product.sku,
          product.id,
          product.category,
          product.brand,
          product.description,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      });

  const unreadCount = notifications.length;

  const handleProductClick = () => {
    closeSearch();
    onNavigate?.('products');
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    setNotificationsOpen(false);
    setNotifications((current) =>
      current.filter((item) => item.id !== notification.id)
    );
    onNavigate?.(notification.section);
  };

  const markAllAsRead = () => {
    setNotifications([]);
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-20 flex h-[76px] w-full items-center',
          'border-b border-border bg-background/90 backdrop-blur-xl',
          'px-4 sm:px-6 lg:px-8',
          className
        )}
      >
        {/* Left */}
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary lg:hidden"
            aria-label="Open mobile menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="anvaya-mono text-[9px] text-muted-foreground/50">
              ANVAYA
            </span>

            <span className="h-3 w-px bg-border" />

            <span className="anvaya-mono text-[9px] text-primary">
              {sectionCodes[activeSection]}
            </span>

            <span className="h-3 w-px bg-border" />

            <span className="max-w-[220px] truncate text-xs font-medium tracking-wide text-foreground">
              {sectionTitles[activeSection]}
            </span>
          </div>

          <div className="sm:hidden">
            <div className="anvaya-label">ACTIVE MODULE</div>
            <div className="mt-0.5 text-xs font-medium">
              {sectionTitles[activeSection]}
            </div>
          </div>
        </div>

        {/* Center Search */}
        <div className="mx-6 hidden flex-1 justify-center md:flex">
          <button
            type="button"
            onClick={openSearch}
            className="group flex h-9 w-full max-w-[460px] items-center justify-between border border-border bg-card/50 px-3 text-left transition-all hover:border-primary/25 hover:bg-card"
            aria-label="Global search products and attributes"
          >
            <div className="flex items-center gap-2.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />

              <span className="text-[11px] text-muted-foreground">
                Search catalog, SKU, attribute...
              </span>
            </div>

            <kbd className="flex h-5 items-center gap-1 border border-border bg-background px-1.5 font-mono text-[9px] text-muted-foreground">
              <Command className="h-2.5 w-2.5" />
              K
            </kbd>
          </button>
        </div>

        {/* Right telemetry */}
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-2 lg:flex">
            <Activity className="h-3 w-3 text-primary" />

            <span className="anvaya-mono text-[9px] text-muted-foreground">
              PIPELINE
            </span>

            <span className="h-1.5 w-1.5 animate-pulse bg-primary shadow-[0_0_8px_rgba(211,255,77,0.8)]" />

            <span className="anvaya-mono text-[9px] text-primary">
              LIVE
            </span>
          </div>

          <div className="hidden h-5 w-px bg-border lg:block" />

          <div className="hidden items-center gap-1.5 xl:flex">
            <Sparkles className="h-3 w-3 text-primary" />

            <span className="anvaya-mono text-[9px] text-muted-foreground">
              AI ENGINE
            </span>

            <span className="anvaya-mono text-[9px] text-primary">
              READY
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={openNotifications}
              className={cn(
                'relative flex h-9 w-9 items-center justify-center border',
                'transition-all',
                notificationsOpen
                  ? 'border-primary/30 bg-primary/5 text-primary'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              )}
              aria-label="View notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell className="h-4 w-4" />

              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[7px] font-bold text-primary-foreground shadow-[0_0_8px_rgba(211,255,77,0.6)]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={closeNotifications}
                />

                <div className="absolute right-0 top-12 z-40 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/40">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-foreground">
                          Notifications
                        </h3>

                        {unreadCount > 0 && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold text-primary">
                            {unreadCount} NEW
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-[9px] text-muted-foreground">
                        ANVAYA platform telemetry
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="flex items-center gap-1 text-[9px] font-medium text-primary hover:underline"
                      >
                        <Check className="h-3 w-3" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-[390px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-12 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>

                        <p className="mt-3 text-xs font-medium">
                          You're all caught up
                        </p>

                        <p className="mt-1 text-[10px] text-muted-foreground">
                          No new platform notifications.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const Icon =
                          notification.type === 'success'
                            ? CheckCircle2
                            : notification.type === 'warning'
                              ? AlertTriangle
                              : Info;

                        return (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                            className="group flex w-full gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-primary/5"
                          >
                            <div
                              className={cn(
                                'mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                                notification.type === 'success' &&
                                'bg-emerald-500/10 text-emerald-400',
                                notification.type === 'warning' &&
                                'bg-amber-500/10 text-amber-400',
                                notification.type === 'info' &&
                                'bg-primary/10 text-primary'
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-[11px] font-semibold text-foreground">
                                  {notification.title}
                                </p>

                                <span className="flex-shrink-0 text-[8px] text-muted-foreground">
                                  {notification.time}
                                </span>
                              </div>

                              <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                                {notification.description}
                              </p>

                              <div className="mt-2 flex items-center gap-1 text-[8px] font-semibold uppercase tracking-wider text-primary opacity-0 transition-opacity group-hover:opacity-100">
                                Review
                                <ArrowRight className="h-2.5 w-2.5" />
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-border bg-background/40 px-4 py-2.5">
                    <span className="anvaya-mono text-[8px] text-muted-foreground">
                      AI TELEMETRY • LIVE MONITORING
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="hidden h-7 w-px bg-border sm:block" />

          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-7 w-7 items-center justify-center border border-primary/20 bg-primary/5">
              <span className="anvaya-mono text-[9px] text-primary">
                SV
              </span>
            </div>

            <div className="hidden flex-col md:flex">
              <span className="text-[10px] font-medium text-foreground">
                Shantha
              </span>

              <span className="anvaya-mono text-[8px] text-muted-foreground">
                FRONTEND
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
          onMouseDown={closeSearch}
        >
          <div
            className="mx-auto mt-[110px] w-[calc(100%-2rem)] max-w-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-2xl shadow-black/40">
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-border px-4">
                <Search className="h-5 w-5 text-primary" />

                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search products, SKUs, brands, categories..."
                  className="h-14 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                <kbd className="hidden rounded-md border border-border bg-background px-2 py-1 font-mono text-[9px] text-muted-foreground sm:block">
                  ESC
                </kbd>
              </div>

              {/* Search Results */}
              <div className="max-h-[420px] overflow-y-auto p-2">
                {searchLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />

                    <span className="ml-3 text-xs text-muted-foreground">
                      Searching catalog...
                    </span>
                  </div>
                )}

                {!searchLoading && !normalizedQuery && (
                  <div className="py-12 text-center">
                    <Search className="mx-auto h-8 w-8 text-muted-foreground/30" />

                    <p className="mt-3 text-sm font-medium">
                      Search your catalog
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Find products, SKUs, brands and categories instantly.
                    </p>
                  </div>
                )}

                {!searchLoading &&
                  normalizedQuery &&
                  filteredProducts.length === 0 && (
                    <div className="py-12 text-center">
                      <Package className="mx-auto h-8 w-8 text-muted-foreground/30" />

                      <p className="mt-3 text-sm font-medium">
                        No products found
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Try another product name, SKU, brand or category.
                      </p>
                    </div>
                  )}

                {!searchLoading &&
                  filteredProducts.map((product: any) => (
                    <button
                      key={product.id || product.sku || product.name}
                      type="button"
                      onClick={handleProductClick}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-primary/5"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                        <Package className="h-4 w-4 text-primary" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {product.name || product.title || 'Unnamed Product'}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          {product.sku && (
                            <span className="anvaya-mono text-[9px] text-muted-foreground">
                              {product.sku}
                            </span>
                          )}

                          {product.category && (
                            <>
                              <span className="h-1 w-1 rounded-full bg-border" />

                              <span className="truncate text-[10px] text-muted-foreground">
                                {product.category}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </button>
                  ))}
              </div>

              {/* Search Footer */}
              <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
                <span className="anvaya-mono text-[9px] text-muted-foreground">
                  ANVAYA CATALOG SEARCH
                </span>

                <button
                  type="button"
                  onClick={() => {
                    closeSearch();
                    onNavigate?.('products');
                  }}
                  className="flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
                >
                  Open full catalog
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}