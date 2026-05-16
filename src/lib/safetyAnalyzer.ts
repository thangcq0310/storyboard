export interface SafetyResult {
  label: string;
  score: number;
  severity: 'safe' | 'caution' | 'risk';
}

export function analyzeSafety(motionLevel: number, duration: number, numScenes: number, budgetMode: boolean): SafetyResult[] {
  const charConsistencyScore = Math.min(100, 100 - motionLevel * 0.3);
  const motionComplexityScore = Math.min(100, 100 - motionLevel * 0.6);
  const frameDriftScore = Math.max(0, 100 - motionLevel * 0.8);
  const continuityScore = Math.min(100, duration > 10 ? 60 : duration > 5 ? 80 : 95);
  const seedanceCompat = budgetMode ? 90 : 85;

  const severity = (score: number): 'safe' | 'caution' | 'risk' =>
    score >= 75 ? 'safe' : score >= 45 ? 'caution' : 'risk';

  return [
    { label: 'Character consistency', score: Math.round(charConsistencyScore), severity: severity(charConsistencyScore) },
    { label: 'Motion complexity', score: Math.round(motionComplexityScore), severity: severity(motionComplexityScore) },
    { label: 'Frame drift risk', score: Math.round(frameDriftScore), severity: severity(frameDriftScore) },
    { label: 'Continuity stability', score: Math.round(continuityScore), severity: severity(continuityScore) },
    { label: 'Seedance compatibility', score: seedanceCompat, severity: severity(seedanceCompat) },
  ];
}