import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "./star-rating"
import type { ReviewData } from "@/app/actions/review-actions"

interface ReviewListProps {
  reviews: ReviewData[]
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
        <p className="text-gray-600 mb-4">Be the first to review this business</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`/placeholder.svg?text=${review.user.first_name.charAt(0)}`} />
              <AvatarFallback>
                {review.user.first_name.charAt(0)}
                {review.user.last_name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <div>
                  <h4 className="font-medium">
                    {review.user.first_name} {review.user.last_name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} size="small" />
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700">{review.comment}</p>

              <div className="flex items-center gap-4 mt-3">
                <button className="text-xs text-gray-500 hover:text-primary flex items-center gap-1">
                  Helpful ({review.helpful_votes})
                </button>
                <button className="text-xs text-gray-500 hover:text-primary flex items-center gap-1">Report</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}