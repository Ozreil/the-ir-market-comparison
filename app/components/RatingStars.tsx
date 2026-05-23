type RatingStarsProps = {
  rating: number;
  className?: string;
};

export function RatingStars({ rating, className }: RatingStarsProps) {
  const roundedRating = Math.round(rating);

  return (
    <div
      className={`flex items-center gap-1 leading-none text-gold ${className ?? ""}`}
      aria-label={`${rating} out of 5 rating`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} aria-hidden="true">
          {index < roundedRating ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}
