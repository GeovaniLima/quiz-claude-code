interface ScoreDisplayProps {
  score: number;
}

export default function ScoreDisplay({ score }: ScoreDisplayProps) {
  return (
    <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
      <span className="text-claude" aria-hidden="true">★</span>
      <span aria-label={`Pontuação atual: ${score}`}>{score} pts</span>
    </div>
  );
}
