import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Star, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

interface Review {
  id: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null } | null;
}

const StarRating = ({ rating, onRate, interactive = false, size = "w-5 h-5" }: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: string;
}) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={!interactive}
        onClick={() => onRate?.(star)}
        className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
      >
        <Star
          className={`${size} ${star <= rating ? "text-naija-gold fill-naija-gold" : "text-muted-foreground/30"}`}
        />
      </button>
    ))}
  </div>
);

const ProductReviews = ({ productId }: { productId: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [userReview, setUserReview] = useState<Review | null>(null);

  const fetchReviews = async () => {
    // Fetch approved reviews + user's own review
    const { data } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (data) {
      const approved = data.filter((r: any) => r.is_approved || r.user_id === user?.id);
      setReviews(approved);
      if (user) {
        const mine = data.find((r: any) => r.user_id === user.id);
        if (mine) setUserReview(mine as any);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Sign in first!", description: "You need to log in to leave a review.", variant: "destructive" });
      return;
    }
    if (rating === 0) {
      toast({ title: "Give am star!", description: "Select a rating before submitting.", variant: "destructive" });
      return;
    }
    if (comment.trim().length < 5) {
      toast({ title: "Write small something", description: "Your review must be at least 5 characters.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("product_reviews").insert({
      product_id: productId,
      user_id: user.id,
      rating,
      comment: comment.trim(),
    });

    if (error) {
      if (error.code === "23505") {
        toast({ title: "You don review before!", description: "You already reviewed this product.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "Review submitted! ⏳", description: "Your review dey wait for admin approval before e go show." });
      setRating(0);
      setComment("");
      fetchReviews();
    }
    setSubmitting(false);
  };

  const approvedReviews = reviews.filter((r) => r.is_approved);
  const avgRating = approvedReviews.length > 0
    ? approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length
    : 0;

  return (
    <section className="mt-12 md:mt-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
        <div>
          <h2 className="font-accent text-xl md:text-2xl font-black text-foreground">
            Customer Reviews
          </h2>
          {approvedReviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={Math.round(avgRating)} size="w-4 h-4" />
              <span className="font-accent text-sm font-bold text-foreground">{avgRating.toFixed(1)}</span>
              <span className="font-body text-sm text-muted-foreground">({approvedReviews.length} review{approvedReviews.length !== 1 ? "s" : ""})</span>
            </div>
          )}
        </div>
      </div>

      {/* Review form */}
      {!userReview && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="naija-card p-5 md:p-6 mb-8"
        >
          <h3 className="font-accent text-base font-bold text-foreground mb-4">
            {user ? "Drop Your Review 🗣️" : "Sign in to leave a review"}
          </h3>
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-body text-sm text-muted-foreground block mb-2">Your Rating</label>
                <StarRating rating={rating} onRate={setRating} interactive size="w-7 h-7" />
              </div>
              <div>
                <label className="font-body text-sm text-muted-foreground block mb-2">Your Review</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell people wetin you think about this product..."
                  className="bg-background border-border font-body text-sm min-h-[100px]"
                  maxLength={1000}
                />
                <p className="font-body text-xs text-muted-foreground mt-1">{comment.length}/1000</p>
              </div>
              <Button type="submit" disabled={submitting} className="font-body gap-2">
                <Send className="w-4 h-4" />
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
              <p className="font-body text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Reviews go show after admin approval
              </p>
            </form>
          ) : (
            <p className="font-body text-sm text-muted-foreground">
              <a href="/auth" className="text-primary hover:underline font-semibold">Sign in</a> to leave a review.
            </p>
          )}
        </motion.div>
      )}

      {/* User's pending review */}
      {userReview && !userReview.is_approved && (
        <div className="naija-card p-5 mb-6 border-naija-gold/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-naija-gold" />
            <span className="font-accent text-sm font-semibold text-naija-gold">Your review dey wait for approval</span>
          </div>
          <StarRating rating={userReview.rating} size="w-4 h-4" />
          <p className="font-body text-sm text-muted-foreground mt-2">{userReview.comment}</p>
        </div>
      )}

      {/* Approved reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="naija-card p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-32 mb-3" />
              <div className="h-3 bg-muted rounded w-full mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : approvedReviews.length === 0 ? (
        <div className="text-center py-10">
          <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvedReviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="naija-card p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <StarRating rating={review.rating} size="w-4 h-4" />
                <span className="font-body text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="font-body text-sm text-foreground leading-relaxed">{review.comment}</p>
              {review.user_id === user?.id && (
                <span className="font-accent text-[10px] text-primary mt-2 block">Your review</span>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export { StarRating };
export default ProductReviews;
