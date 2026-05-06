import StarRating from "./StarRating";
import Avatar from "./Avatar";
import ReviewMarkdown from "./ReviewMarkdown";
import ReviewImagesGallery from "./ReviewImagesGallery";
import type { Review } from "@/types";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-2"
      style={{ backgroundColor: "var(--color-surface-container-low)", border: "1px solid var(--color-surface-container-highest)" }}
    >
      <div className="flex items-center gap-3">
        <Avatar name={review.usuario?.nombre ?? "Usuario"} userId={review.usuario?.id} size={36} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: "var(--color-on-surface)" }}>
            {review.usuario?.nombre ?? "Usuario"}
          </p>
          <StarRating value={review.puntuacion ?? 0} />
        </div>
        <p className="text-xs flex-shrink-0" style={{ color: "var(--color-on-surface-variant)" }}>
          {review.fecha ? new Date(review.fecha).toLocaleDateString("es-ES") : ""}
        </p>
      </div>
      <ReviewMarkdown text={review.comentario} />
      <ReviewImagesGallery urls={review.imagenes} />
    </div>
  );
}
