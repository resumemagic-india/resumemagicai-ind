
import { Award, Star, BarChart, CheckCircle, ThumbsUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ATSScore {
  overall_score: number;
  keyword_match: number;
  format_compatibility: number;
  matches_found: number;
  total_keywords: number;
}

interface ATSScoreDisplayProps {
  atsScore: ATSScore;
}

export const ATSScoreDisplay = ({ atsScore }: ATSScoreDisplayProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-gradient-to-r from-emerald-500 to-emerald-600";
    if (score >= 60) return "bg-gradient-to-r from-yellow-500 to-yellow-600";
    return "bg-gradient-to-r from-red-500 to-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Award className="w-8 h-8 text-emerald-500" />;
    if (score >= 60) return <Star className="w-8 h-8 text-yellow-500" />;
    return <BarChart className="w-8 h-8 text-red-500" />;
  };

  return (
    <Card className="bg-gradient-to-br from-white/95 to-royal-50 border-2 border-royal-200 shadow-lg">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getScoreIcon(atsScore.overall_score)}
            <div>
              <h3 className="text-xl font-semibold text-royal-900">ATS Compatibility Score</h3>
              <p className="text-royal-600 text-sm">Your resume's performance against ATS systems</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-royal-900">{atsScore.overall_score}%</div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-royal-700">Keyword Match</span>
              <span className="text-sm font-semibold text-royal-900">{atsScore.keyword_match}%</span>
            </div>
            <Progress 
              value={atsScore.keyword_match} 
              className="h-2"
              indicatorClassName={getScoreColor(atsScore.keyword_match)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-royal-700">Format Compatibility</span>
              <span className="text-sm font-semibold text-royal-900">{atsScore.format_compatibility}%</span>
            </div>
            <Progress 
              value={atsScore.format_compatibility} 
              className="h-2"
              indicatorClassName={getScoreColor(atsScore.format_compatibility)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-white/80 rounded-lg border border-royal-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-royal-900">Matches Found</p>
                <p className="text-2xl font-bold text-emerald-600">{atsScore.matches_found}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsUp className="text-blue-500" />
              <div>
                <p className="text-sm font-medium text-royal-900">Total Keywords</p>
                <p className="text-2xl font-bold text-blue-600">{atsScore.total_keywords}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
