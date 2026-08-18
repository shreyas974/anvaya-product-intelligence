
import { AlertTriangle, Wrench, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MissingAttributeAnomaly } from '@/types/quality.types';

export interface MissingAttributesCardProps {
  missingAttributes: MissingAttributeAnomaly[];
  onRecoverMissing?: (attributeName: string) => void;
}

export function MissingAttributesCard({
  missingAttributes,
  onRecoverMissing,
}: MissingAttributesCardProps) {
  return (
    <Card className="overflow-hidden border-border/80 bg-card/95 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Missing Attribute Recovery Gaps</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Critical attributes absent from vendor feeds that impact customer search discovery.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-1">
        {missingAttributes.map((item) => (
          <div
            key={item.attributeName}
            className="flex flex-col gap-2.5 rounded-lg border border-border/50 bg-secondary/25 p-3 sm:flex-row sm:items-center sm:justify-between hover:bg-secondary/40 transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-foreground">
                  {item.attributeName}
                </span>
                <span className="rounded bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {item.category}
                </span>
                <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                  {item.affectedProductsCount} SKUs affected
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">{item.recommendation}</p>
            </div>

            {onRecoverMissing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRecoverMissing(item.attributeName)}
                className="h-7 gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/10 flex-shrink-0"
              >
                <Sparkles className="h-3 w-3" />
                <span>Auto-Recover</span>
              </Button>
            )}
          </div>
        ))}

        <div className="rounded-md bg-secondary/20 p-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
          <Wrench className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span>
            ANVAYA LLM entity extraction automatically mines unformatted descriptions and specs to populate these fields.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
