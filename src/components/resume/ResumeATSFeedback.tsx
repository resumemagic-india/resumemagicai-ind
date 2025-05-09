import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BadgeCheck, AlertCircle, Sparkles, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import clsx from "clsx";
import styles from "./ResumeATSFeedback.module.css";

// Animated circular progress ring
function ProgressRing({ value, size = 90, stroke = 8, color = "#10b981", bg = "#e5e7eb" }: { value: number, size?: number, stroke?: number, color?: string, bg?: string }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="block">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={bg}
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="progress-ring__circle"
      />
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        fontSize={size / 4}
        fontWeight={800}
        fill={color}
        dy=".3em"
      >
        {value}%
      </text>
    </svg>
  );
}

interface ATSScore {
  overall_score: number;
  keyword_match: number;
  format_compatibility: number;
  matches_found: number;
  total_keywords: number;
  matched_keywords?: string[];
  missing_keywords?: string[];
  suggestion?: string;
  steps_performed?: string[];
}

export default function ResumeATSFeedback({ ats_score }: { ats_score: ATSScore | null }) {
  if (!ats_score) return null;

  // Color logic for ring and badges
  const scoreColor =
    ats_score.overall_score >= 85
      ? "#10b981"
      : ats_score.overall_score >= 70
      ? "#f59e42"
      : "#ef4444";

  // Glassmorphism + gradient + floating sparkles
  return (
    <Card className="relative overflow-hidden my-8 rounded-3xl border-0 shadow-2xl bg-gradient-to-br from-white/70 via-royal-50/80 to-blue-100/80 backdrop-blur-xl">
      <div className="absolute -top-10 -right-10 opacity-30 pointer-events-none select-none animate-pulse">
        <Sparkles size={140} className="text-blue-200" />
      </div>
      <CardContent className="pt-10 pb-8 px-8">
        <div className="flex items-center gap-4 mb-4">
          <BadgeCheck className="text-emerald-500 w-8 h-8 drop-shadow" />
          <h2 className="text-3xl font-extrabold tracking-tight text-royal-900 drop-shadow-lg">
            ATS Compatibility Report
          </h2>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-8 mb-6">
          <div className="flex flex-col items-center justify-center">
            <ProgressRing value={ats_score.overall_score} color={scoreColor} />
            <div className={clsx(
              "mt-2 text-lg font-bold",
              ats_score.overall_score >= 85
                ? "text-emerald-600"
                : ats_score.overall_score >= 70
                ? "text-yellow-600"
                : "text-red-600"
            )}>
              Overall ATS Score
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 gap-3">
            <div className="flex items-center gap-2 text-blue-900">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Keyword Match:</span>
              <span>
                <span className="font-bold">{ats_score.keyword_match}%</span> ({ats_score.matches_found} of {ats_score.total_keywords})
              </span>
            </div>
            <div className="flex items-center gap-2 text-purple-900">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="font-semibold">Format Compatibility:</span>
              <span className="font-bold">{ats_score.format_compatibility}/100</span>
            </div>
          </div>
        </div>
        {ats_score.steps_performed && ats_score.steps_performed.length > 0 && (
          <div className="my-6">
            <div className="font-semibold text-royal-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-royal-400" /> Optimization Steps Timeline
            </div>
            <ol className="relative border-l-2 border-royal-200 ml-3 pl-4 space-y-4">
              {ats_score.steps_performed.map((step, idx) => (
                <li key={idx} className="ml-2">
                  <div className="absolute -left-4 top-1.5 w-3 h-3 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-full border-2 border-white shadow"></div>
                  <span className="text-royal-800 text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {ats_score.suggestion && (
          <Alert className="mt-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-900 shadow-lg">
            <AlertTitle className="flex items-center gap-2">
              <AlertCircle className="text-blue-400" /> Personalized Suggestion
            </AlertTitle>
            <AlertDescription className="whitespace-pre-line">{ats_score.suggestion}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
