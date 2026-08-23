import { CheckCircle2, Clock } from 'lucide-react';

export interface PipelineStepItem {
  name: string;
  description?: string;
  id?: string;
  status?: 'completed' | 'in_progress' | 'pending';
}

export interface PipelineProgressBarProps {
  steps: PipelineStepItem[];
  currentStepIndex: number;
  className?: string;
}

export function PipelineProgressBar({
  steps,
  currentStepIndex,
  className = '',
}: PipelineProgressBarProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Step Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={idx}
              className={`glass-inset p-2.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'border-[#E8703A] bg-[#FBEEDD] shadow-sm'
                  : isDone
                  ? 'border-[rgba(199,127,46,0.25)] bg-white/70'
                  : 'border-[rgba(120,90,70,0.1)] opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-[#8A7E76]">0{idx + 1}</span>
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C77F2E]" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5 text-[#E8703A] animate-pulse" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-[rgba(120,90,70,0.2)]" />
                )}
              </div>
              <p className="text-[11px] font-bold text-[#2B2320] leading-tight truncate" title={step.name}>
                {step.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
