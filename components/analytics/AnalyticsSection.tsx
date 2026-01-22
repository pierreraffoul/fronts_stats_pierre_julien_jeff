"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingDown, 
  HelpCircle, 
  Target, 
  CornerDownRight, 
  Calendar, 
  RotateCcw, 
  Ban, 
  Home, 
  Sigma, 
  Swords,
  type LucideIcon
} from "lucide-react";
import { type SectionColor } from "@/lib/section-colors";

// Mapping des noms vers les composants (côté client)
const ICON_MAP: Record<string, LucideIcon> = {
  TrendingDown,
  HelpCircle,
  Target,
  CornerDownRight,
  Calendar,
  RotateCcw,
  Ban,
  Home,
  Sigma,
  Swords,
} as const;

type AnalyticsSectionProps = {
  index: number;
  title: string;
  description: string | ReactNode;
  aiInsight: {
    title: string;
    content: string;
  };
  chartComponent: ReactNode;
  chartTitle: string;
  color: SectionColor;
  iconName: string;
  reversed?: boolean;
};

export function AnalyticsSection({
  index,
  title,
  description,
  aiInsight,
  chartComponent,
  chartTitle,
  color,
  iconName,
  reversed = false,
}: AnalyticsSectionProps) {
  const Icon = ICON_MAP[iconName] || Target;

  return (
    <section className="py-16 md:py-24">
      <div className={`grid xl:grid-cols-2 gap-8 lg:gap-12 items-center ${reversed ? "xl:flex-row-reverse" : ""}`}>
        {/* Texte */}
        <div className={`space-y-6 ${reversed ? "order-1 xl:order-2" : ""}`}>
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <span className={`flex items-center justify-center w-10 h-10 rounded-xl ${color.bg} ${color.text} text-xl font-bold shadow-sm`}>
              {index}
            </span>
            {title}
          </h2>
          <div className="text-muted-foreground space-y-4">
            {typeof description === "string" ? (
              <p className="text-lg" key="description-text">{description}</p>
            ) : (
              <div key="description-content">{description}</div>
            )}
          </div>
          
          {/* Card Insight IA */}
          <Card className={`${color.bg} ${color.border} ${color.darkBg} ${color.darkBorder} shadow-sm`}>
            <CardContent className="p-4 flex gap-4">
              <Icon className={`${color.icon} w-8 h-8 shrink-0`} />
              <div>
                <h4 className={`font-semibold ${color.text} ${color.darkText}`}>{aiInsight.title}</h4>
                <p className={`text-sm mt-1 ${color.text} ${color.darkText} opacity-80`}>
                  {aiInsight.content}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphique */}
        <div className={`bg-card p-6 rounded-2xl shadow-lg border border-border hover:shadow-xl transition-shadow duration-300 ${reversed ? "order-2 xl:order-1" : ""}`}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
            {chartTitle}
          </h3>
          {chartComponent}
        </div>
      </div>
    </section>
  );
}
