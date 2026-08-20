import { useState } from 'react';
import {
  X,
  Send,
  Bot,
  TrendingUp,
  AlertTriangle,
  Database,
  WandSparkles,
  Sparkles,
  Copy,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AICopilotProps {
  qualityScore?: number;
  totalProducts?: number;
  enrichmentRate?: number;
  duplicateClusters?: number;
  missingAttributes?: number;
}

export function AICopilot({
  qualityScore = 88.4,
  totalProducts = 1420,
  enrichmentRate = 90.7,
  duplicateClusters = 6,
  missingAttributes = 5,
}: AICopilotProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<
    { role: 'user' | 'ai'; text: string }[]
  >([]);

  const generateResponse = (question: string) => {
    const q = question.toLowerCase();

    if (
      q.includes('quality') ||
      q.includes('score') ||
      q.includes('health')
    ) {
      return `Your current catalog quality score is ${qualityScore}/100. The catalog is in a healthy state, but there is still room to improve completeness and consistency.`;
    }

    if (
      q.includes('product') ||
      q.includes('sku') ||
      q.includes('catalog size') ||
      q.includes('catalog')
    ) {
      return `ANVAYA currently has ${totalProducts.toLocaleString()} products under analysis in the catalog.`;
    }

    if (
      q.includes('enrichment') ||
      q.includes('recovered') ||
      q.includes('attribute recovery')
    ) {
      return `The current AI enrichment rate is ${enrichmentRate}%. ANVAYA has successfully recovered and enriched a large portion of the catalog attributes.`;
    }

    if (
      q.includes('duplicate') ||
      q.includes('duplicates') ||
      q.includes('cluster')
    ) {
      return `I detected ${duplicateClusters} semantic duplicate clusters. These represent products that may be repeated across different vendor feeds and can potentially be consolidated.`;
    }

    if (
      q.includes('missing') ||
      q.includes('attribute gap') ||
      q.includes('gaps')
    ) {
      return `There are ${missingAttributes} major missing-attribute areas currently being monitored. ANVAYA can use automated attribute recovery to populate these fields from unstructured product data.`;
    }

    if (
      q.includes('improve') ||
      q.includes('recommend') ||
      q.includes('recommendation')
    ) {
      return `Based on your catalog telemetry, I recommend prioritizing missing attributes first, then reviewing semantic duplicate clusters, and finally running another enrichment pass on lower-confidence products.`;
    }

    if (
      q.includes('hello') ||
      q.includes('hi') ||
      q.includes('hey')
    ) {
      return `Hello! 👋 I'm ANVAYA Copilot. Ask me about catalog quality, products, enrichment, missing attributes, or duplicate clusters.`;
    }

    return `I can currently analyze your ANVAYA dashboard telemetry. Try asking about your quality score, product count, enrichment rate, missing attributes, duplicate clusters, or improvement recommendations.`;
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    const response = generateResponse(trimmedMessage);

    setConversation((previous) => [
      ...previous,
      { role: 'user', text: trimmedMessage },
      { role: 'ai', text: response },
    ]);

    setMessage('');
  };

  const askSuggestion = (question: string) => {
    setMessage(question);
  };

  const suggestions = [
    {
      icon: TrendingUp,
      text: 'What is my catalog quality?',
    },
    {
      icon: AlertTriangle,
      text: 'What are my biggest issues?',
    },
    {
      icon: Database,
      text: 'How many products do I have?',
    },
    {
      icon: Copy,
      text: 'Show me my duplicate issues',
    },
  ];

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-primary/30 bg-card/95 px-4 py-3 text-sm font-semibold text-foreground shadow-xl shadow-primary/10 backdrop-blur-xl transition-all duration-200 hover:scale-105 hover:border-primary/60 hover:shadow-primary/20"
        >
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-primary/15">
            <Sparkles className="h-4 w-4 text-primary" />

            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-card" />
          </span>

          <span>Ask ANVAYA AI</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[560px] w-[390px] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-2xl shadow-black/30 backdrop-blur-xl">
          {/* Header */}
          <div className="border-b border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                  <WandSparkles className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">
                      ANVAYA Copilot
                    </span>

                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                      ONLINE
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    Catalog intelligence assistant
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {conversation.length === 0 ? (
              <>
                <div className="flex gap-2.5">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>

                  <div className="max-w-[85%] rounded-xl rounded-tl-sm border border-border/50 bg-secondary/40 p-3">
                    <p className="text-xs leading-relaxed text-foreground">
                      Hi! I'm your ANVAYA AI Copilot. I can analyze your
                      catalog telemetry and answer questions about quality,
                      enrichment, missing attributes, products, and
                      duplicates.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Live Dashboard Context
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[9px] text-muted-foreground">
                        Quality
                      </p>
                      <p className="text-xs font-bold">
                        {qualityScore}/100
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] text-muted-foreground">
                        Products
                      </p>
                      <p className="text-xs font-bold">
                        {totalProducts.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] text-muted-foreground">
                        Enrichment
                      </p>
                      <p className="text-xs font-bold">
                        {enrichmentRate}%
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] text-muted-foreground">
                        Duplicates
                      </p>
                      <p className="text-xs font-bold">
                        {duplicateClusters}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Suggested questions
                  </p>

                  {suggestions.map((suggestion) => {
                    const Icon = suggestion.icon;

                    return (
                      <button
                        key={suggestion.text}
                        onClick={() => askSuggestion(suggestion.text)}
                        className="flex w-full items-center gap-2.5 rounded-lg border border-border/50 bg-secondary/20 p-2.5 text-left transition-all hover:border-primary/30 hover:bg-primary/5"
                      >
                        <Icon className="h-3.5 w-3.5 text-primary" />

                        <span className="text-[11px] text-muted-foreground">
                          {suggestion.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              conversation.map((item, index) => (
                <div
                  key={index}
                  className={`flex gap-2.5 ${
                    item.role === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  {item.role === 'ai' && (
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-xl p-3 text-xs leading-relaxed ${
                      item.role === 'user'
                        ? 'rounded-br-sm bg-primary text-primary-foreground'
                        : 'rounded-tl-sm border border-border/50 bg-secondary/40 text-foreground'
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border/60 bg-secondary/10 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 p-1.5">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSend();
                  }
                }}
                placeholder="Ask about your catalog..."
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground"
              />

              <Button
                size="icon"
                onClick={handleSend}
                disabled={!message.trim()}
                className="h-8 w-8 rounded-lg"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>

            <p className="mt-2 text-center text-[9px] text-muted-foreground">
              Powered by ANVAYA catalog telemetry
            </p>
          </div>
        </div>
      )}
    </>
  );
}