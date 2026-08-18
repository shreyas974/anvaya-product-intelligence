import { useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { NavigationSection } from '@/layouts/Sidebar';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sparkles,
  Database,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<NavigationSection>('overview');

  return (
    <MainLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {activeSection === 'overview' && (
        <div className="space-y-8">
          {/* Header */}
          <PageHeader
            title="ANVAYA Overview"
            description="Transform messy, unstructured product data into verified, high-confidence product intelligence."
            badge={
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                <Sparkles className="w-3 h-3" />
                <span>AI Intelligence Engine</span>
              </div>
            }
            actions={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveSection('products')}
                >
                  <Layers className="mr-1.5 h-3.5 w-3.5" />
                  View Catalog
                </Button>
                <Button
                  size="sm"
                  onClick={() => setActiveSection('ingestion')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  <UploadCloud className="mr-1.5 h-3.5 w-3.5" />
                  Ingest Raw Data
                </Button>
              </div>
            }
          />

          {/* KPI Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Ingested Products"
              value="1,420"
              icon={Database}
              change={{ value: '+18%', direction: 'up', label: 'vs last import' }}
            />
            <StatCard
              title="AI Enriched SKUs"
              value="1,288"
              icon={Sparkles}
              change={{ value: '90.7%', direction: 'up', label: 'enrichment rate' }}
            />
            <StatCard
              title="Average Quality Score"
              value="94.2"
              icon={ShieldCheck}
              change={{ value: '+12.4 pts', direction: 'up', label: 'post-cleaning' }}
            />
            <StatCard
              title="High Confidence Match"
              value="88.5%"
              icon={Zap}
              change={{ value: '>= 85% score', direction: 'neutral', label: 'threshold' }}
            />
          </div>

          {/* Design System Primitives Showcase */}
          <Tabs defaultValue="indicators" className="w-full space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="indicators">Design System Badges</TabsTrigger>
                <TabsTrigger value="pipeline">Pipeline Architecture</TabsTrigger>
              </TabsList>
            </div>

            {/* Badges and Confidence Showcase Tab */}
            <TabsContent value="indicators" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Confidence Badges */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>Confidence Indicators</span>
                    </CardTitle>
                    <CardDescription>
                      Accessible multi-tier indicators using text, icon, and standardized color thresholds.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 rounded-md bg-secondary/30 border border-border/40">
                      <div className="text-xs font-medium text-muted-foreground">High Confidence (&ge; 85%)</div>
                      <ConfidenceBadge score={94} />
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-md bg-secondary/30 border border-border/40">
                      <div className="text-xs font-medium text-muted-foreground">Medium Confidence (60–84%)</div>
                      <ConfidenceBadge score={72} />
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-md bg-secondary/30 border border-border/40">
                      <div className="text-xs font-medium text-muted-foreground">Low Confidence (&lt; 60%)</div>
                      <ConfidenceBadge score={44} />
                    </div>
                  </CardContent>
                </Card>

                {/* Status Badges */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <span>Product Lifecycle Status</span>
                    </CardTitle>
                    <CardDescription>
                      Unified status tags indicating product progress through ingestion, cleaning, and enrichment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      <StatusBadge status="raw" />
                      <StatusBadge status="cleaned" />
                      <StatusBadge status="enriched" />
                      <StatusBadge status="approved" />
                      <StatusBadge status="flagged" />
                    </div>
                    <div className="p-3 rounded-md bg-secondary/20 border border-border/40 text-xs text-muted-foreground space-y-1">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>WCAG AA Contrast Compliant</span>
                      </div>
                      <p>
                        Every status badge couples unique iconography and text labeling to ensure color-blind accessibility.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Pipeline Tab */}
            <TabsContent value="pipeline">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ANVAYA End-to-End Intelligence Pipeline</CardTitle>
                  <CardDescription>
                    Raw messy product data enters the pipeline and is systematically cleansed, enriched, and validated.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-5 text-center">
                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/60 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 1</div>
                      <div className="font-semibold text-sm text-foreground">Raw Ingestion</div>
                      <div className="text-[11px] text-muted-foreground">CSV / JSON / Stream</div>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/60 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 2</div>
                      <div className="font-semibold text-sm text-foreground">Normalization</div>
                      <div className="text-[11px] text-muted-foreground">Schema alignment</div>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/60 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 3</div>
                      <div className="font-semibold text-sm text-foreground">AI Enrichment</div>
                      <div className="text-[11px] text-muted-foreground">Missing attribute infer</div>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/60 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 4</div>
                      <div className="font-semibold text-sm text-foreground">Confidence Audit</div>
                      <div className="text-[11px] text-muted-foreground">Quality & validation</div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Step 5</div>
                      <div className="font-semibold text-sm text-white">Product Catalog</div>
                      <div className="text-[11px] text-primary/80">API & Intelligence</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Action / Ingestion Prompt */}
          <EmptyState
            icon={UploadCloud}
            title="Ingestion Engine Ready"
            description="Ready to ingest raw product catalog files. Drag and drop CSV or JSON files to start automatic extraction and AI enrichment."
            action={
              <Button
                onClick={() => setActiveSection('ingestion')}
                className="gap-2 font-medium"
              >
                <span>Go to Ingestion Studio</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      )}

      {/* Placeholder sections for Ingestion, Products, Quality, Intelligence */}
      {activeSection !== 'overview' && (
        <div className="space-y-6">
          <PageHeader
            title={activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            description={`ANVAYA ${activeSection} module placeholder ready for Phase 3+ implementation.`}
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSection('overview')}
              >
                Back to Overview
              </Button>
            }
          />
          <EmptyState
            icon={Layers}
            title={`${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Module`}
            description={`The foundation for the ${activeSection} module has been prepared. This view will be fully activated in subsequent phases.`}
            action={
              <Button onClick={() => setActiveSection('overview')} variant="secondary">
                Return to Overview
              </Button>
            }
          />
        </div>
      )}
    </MainLayout>
  );
}
