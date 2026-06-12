import { ratingMeta, ratingToneClasses, type Rating } from "@/lib/crp-data"
import { cn } from "@/lib/utils"

export function RatingBadge({
  rating,
  size = "sm",
}: {
  rating: Rating
  size?: "sm" | "lg"
}) {
  const tone = ratingMeta[rating].tone
  const classes = ratingToneClasses[tone]

  if (size === "lg") {
    return (
      <div
        className={cn(
          "flex size-24 flex-col items-center justify-center rounded-2xl font-bold shadow-sm",
          classes.badge,
        )}
      >
        <span className="text-4xl leading-none">{rating}</span>
      </div>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg text-sm font-bold",
        classes.badge,
      )}
    >
      {rating}
    </span>
  )
}
