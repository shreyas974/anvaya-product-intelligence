import { useState } from 'react';
import {
  FileText,
  Smartphone,
  Receipt,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export interface ContentFieldData {
  value: string;
  char_count: number;
  char_limit: number;
  compliant: boolean;
  template: string;
  method: string;
}

export interface ContentStudioProps {
  content?: Record<string, ContentFieldData>;
  productMpn?: string;
  onRegenerate?: () => void;
  onInspectEvidence?: (field: string) => void;
}

export function ContentStudio({
  content,
  productMpn,
  onRegenerate,
  onInspectEvidence,
}: ContentStudioProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const defaultContent: Record<string, ContentFieldData> = content || {
    INVOICE_DESC: {
      value: 'DISHWASHER LEG 5 SST 120V 15A 50-1/4IN',
      char_count: 39,
      char_limit: 40,
      compliant: true,
      template: 'PRODUCT MOUNT CYCLES MATERIAL VOLTAGE AMPERAGE SIZE',
      method: 'deterministic_template',
    },
    MOBILE_DESC: {
      value: 'Rheem Manufacturing FRIGIDAIRE, Dishwasher, Professional Series, PDSH4816AF',
      char_count: 75,
      char_limit: 100,
      compliant: true,
      template: 'Manufacturer Brand, ProductType, Series, MPN',
      method: 'deterministic_template',
    },
    SHORT_DESC: {
      value: 'FRIGIDAIRE Professional Series PDSH4816AF Dishwasher, Leg Mounting, 5-Wash Cycle, Stainless Steel',
      char_count: 98,
      char_limit: 150,
      compliant: true,
      template: 'Brand Series MPN ProductType, Mounting, Material',
      method: 'deterministic_template',
    },
    LONG_DESC1: {
      value: 'FRIGIDAIRE Dishwasher, Professional Series, 120 V Voltage Rating, 15 A Amperage Rating, Leg Mounting Type, 47 dBA Sound Level, Stainless Steel Material',
      char_count: 153,
      char_limit: 500,
      compliant: true,
      template: 'Brand ProductType, Series, Attributes with UOM',
      method: 'deterministic_template',
    },
    RETAIL_DESC: {
      value: 'Professional Series Dishwasher, Leg Mounting, 5-Wash Cycle, Stainless Steel',
      char_count: 75,
      char_limit: 150,
      compliant: true,
      template: 'Series ProductType, Mounting, Material, Color',
      method: 'deterministic_template',
    },
  };

  const sections = [
    {
      key: 'INVOICE_DESC',
      title: 'Invoice Description',
      subtitle: 'Abbreviated uppercase specification for ERP and POS printing',
      icon: Receipt,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      key: 'MOBILE_DESC',
      title: 'Mobile Description',
      subtitle: 'High-density summary for e-commerce search and mobile views',
      icon: Smartphone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      key: 'SHORT_DESC',
      title: 'Short Description',
      subtitle: 'Catalog line-item description for distribution listings',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      key: 'LONG_DESC1',
      title: 'Long Technical Description',
      subtitle: 'Comprehensive specification breakdown with approved UOM tokens',
      icon: Sparkles,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      key: 'RETAIL_DESC',
      title: 'Retail Display Description',
      subtitle: 'Consumer-friendly presentation with series and primary attributes',
      icon: Eye,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EAE4DC] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              Content Studio
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {productMpn ? `Target MPN: ${productMpn}` : 'Multi-Channel Synthesis'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Multi-Channel Product Content Studio</h2>
          <p className="text-sm text-slate-500">
            Deterministic, rule-grounded content synthesis complying with strict character caps and Unilog standards.
          </p>
        </div>

        {onRegenerate && (
          <Button
            onClick={onRegenerate}
            variant="outline"
            className="border-slate-300 hover:bg-slate-50 text-slate-700 font-medium"
          >
            <RefreshCw className="h-4 w-4 mr-2 text-slate-500" />
            Regenerate All Content
          </Button>
        )}
      </div>

      {/* Content Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {sections.map(({ key, title, subtitle, icon: Icon, color, bgColor }) => {
          const item = defaultContent[key] || {
            value: '',
            char_count: 0,
            char_limit: 100,
            compliant: true,
            template: '',
            method: 'deterministic_template',
          };
          const isOverLimit = item.char_count > item.char_limit;

          return (
            <Card key={key} className="border-[#EAE4DC] shadow-sm hover:shadow-md transition bg-white">
              <CardHeader className="pb-3 border-b border-slate-100 bg-[#FAF8F5]/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${bgColor} ${color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">{title}</CardTitle>
                      <p className="text-xs text-slate-500">{subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Character Limit Badge */}
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className={`font-semibold ${isOverLimit ? 'text-rose-600' : 'text-slate-700'}`}>
                        {item.char_count}
                      </span>
                      <span className="text-slate-400">/</span>
                      <span className="text-slate-500">{item.char_limit} chars</span>
                    </div>

                    <Badge
                      variant="outline"
                      className={
                        isOverLimit
                          ? 'border-rose-300 bg-rose-50 text-rose-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }
                    >
                      {isOverLimit ? (
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Over Limit
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> Compliant
                        </span>
                      )}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-3">
                {/* Content Box */}
                <div className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-4 font-mono text-sm text-slate-900 break-words leading-relaxed select-all">
                  {item.value || '<Not generated>'}
                </div>

                {/* Footer Template Info & Actions */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-400">Template:</span>
                    <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {item.template || 'Default Schema'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onInspectEvidence && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        onClick={() => onInspectEvidence(key)}
                      >
                        <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                        View Evidence
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-slate-700 border-slate-300 hover:bg-slate-100"
                      onClick={() => copyToClipboard(item.value, key)}
                    >
                      {copiedField === key ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1 text-slate-500" />
                          Copy Text
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
