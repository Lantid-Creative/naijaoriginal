import { motion } from "framer-motion";
import { ShieldCheck, QrCode, Hash, Calendar, User, Crown, Star, ExternalLink, Sparkles, Award, Eye, Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface VerifyResultProps {
  result: any;
  user: any;
  onClaimOwnership: () => void;
}

const VerifyResult = ({ result, user, onClaimOwnership }: VerifyResultProps) => {
  const product = result.products;
  const images = product?.product_images || [];
  const isOwner = result.owner_id && user && result.owner_id === user.id;
  const { toast } = useToast();

  const publicUrl = `${window.location.origin}/verify?code=${encodeURIComponent(result.qr_code)}`;

  const handleShare = async () => {
    const shareText = `Check my authenticated Naija Original piece — "${product?.name}"${result.edition_number ? ` #${result.edition_number}${product?.edition_total ? `/${product.edition_total}` : ""}` : ""} 🇳🇬\n\n${publicUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `My ${product?.name}`, text: shareText, url: publicUrl });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({ title: "Link copied! 🔗", description: "Share am with your people." });
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    toast({ title: "Public link copied ✅", description: publicUrl });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-3xl mx-auto"
    >
      {/* Verified Badge Banner */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <span className="font-accent text-lg font-bold text-primary">100% Authentic — Verified ✅</span>
        </div>
      </motion.div>

      <div className="naija-card overflow-hidden">
        {/* Hero Image Section */}
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[16/10] overflow-hidden bg-muted">
              <img
                src={images[0].image_url}
                alt={product?.name}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>

            {/* Floating badges on image */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product?.is_limited_edition && (
                <motion.span
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground font-accent text-xs font-bold shadow-lg"
                >
                  <Crown className="w-3.5 h-3.5" /> Limited Edition
                </motion.span>
              )}
              <motion.span
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-accent text-xs font-bold shadow-lg"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Naija Original
              </motion.span>
            </div>

            {/* Edition badge */}
            {result.edition_number && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute top-4 right-4 px-4 py-2 rounded-xl bg-card/90 backdrop-blur-sm border border-border shadow-lg text-center"
              >
                <span className="font-accent text-2xl font-black text-primary block leading-none">
                  #{result.edition_number}
                </span>
                {product?.edition_total && (
                  <span className="font-body text-[10px] text-muted-foreground">of {product.edition_total}</span>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Multi-image gallery */}
        {images.length > 1 && (
          <div className="px-6 pt-4 flex gap-2 overflow-x-auto">
            {images.slice(1, 5).map((img: any, i: number) => (
              <motion.div
                key={img.id || i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted border-2 border-border hover:border-primary transition-colors cursor-pointer"
              >
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Product Info */}
        <div className="p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-black text-foreground mb-2">
              {product?.name}
            </h2>
            {product?.pidgin_tagline && (
              <p className="font-body text-sm text-primary italic mb-4">"{product.pidgin_tagline}"</p>
            )}
            {product?.description && (
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                {product.description}
              </p>
            )}
          </motion.div>

          {/* Certificate Details Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6"
          >
            <div className="naija-card p-3 text-center">
              <QrCode className="w-5 h-5 text-primary mx-auto mb-1" />
              <span className="font-body text-[10px] text-muted-foreground block uppercase tracking-wider">Auth Code</span>
              <span className="font-accent text-xs font-bold text-foreground">{result.qr_code}</span>
            </div>
            <div className="naija-card p-3 text-center">
              <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
              <span className="font-body text-[10px] text-muted-foreground block uppercase tracking-wider">Authenticated</span>
              <span className="font-accent text-xs font-bold text-foreground">
                {new Date(result.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}
              </span>
            </div>
            <div className="naija-card p-3 text-center">
              <Eye className="w-5 h-5 text-primary mx-auto mb-1" />
              <span className="font-body text-[10px] text-muted-foreground block uppercase tracking-wider">Times Verified</span>
              <span className="font-accent text-xs font-bold text-foreground">{(result.scan_count || 0) + 1}</span>
            </div>
            {product?.price && (
              <div className="naija-card p-3 text-center">
                <Star className="w-5 h-5 text-primary mx-auto mb-1" />
                <span className="font-body text-[10px] text-muted-foreground block uppercase tracking-wider">Retail Value</span>
                <span className="font-accent text-xs font-bold text-foreground">₦{Number(product.price).toLocaleString()}</span>
              </div>
            )}
            {result.edition_number && (
              <div className="naija-card p-3 text-center">
                <Hash className="w-5 h-5 text-primary mx-auto mb-1" />
                <span className="font-body text-[10px] text-muted-foreground block uppercase tracking-wider">Edition</span>
                <span className="font-accent text-xs font-bold text-foreground">
                  #{result.edition_number}{product?.edition_total ? ` / ${product.edition_total}` : ""}
                </span>
              </div>
            )}
            {result.owner_name && (
              <div className="naija-card p-3 text-center">
                <User className="w-5 h-5 text-primary mx-auto mb-1" />
                <span className="font-body text-[10px] text-muted-foreground block uppercase tracking-wider">Owner</span>
                <span className="font-accent text-xs font-bold text-foreground truncate block">{result.owner_name}</span>
              </div>
            )}
          </motion.div>

          {/* The Story */}
          {result.story && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-6 p-5 rounded-xl bg-primary/5 border border-primary/10"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-accent text-base font-bold text-foreground">The Story Behind This Piece</h3>
              </div>
              <p className="font-body text-sm text-muted-foreground leading-relaxed italic">
                "{result.story}"
              </p>
            </motion.div>
          )}

          {/* Ownership Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {isOwner && (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-accent text-sm font-bold text-primary mb-1">This Na Your Piece! 👑</h4>
                <p className="font-body text-xs text-muted-foreground mb-4">
                  You are the verified owner of this authentic Naija Original product.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={handleShare} size="sm" className="font-body gap-2">
                    <Share2 className="w-4 h-4" /> Share My Piece
                  </Button>
                  <Button onClick={handleCopy} size="sm" variant="outline" className="font-body gap-2">
                    <Copy className="w-4 h-4" /> Copy Public Link
                  </Button>
                </div>
                <p className="font-body text-[11px] text-muted-foreground/70 mt-3">
                  Anyone wey open this link go see say na you own this original piece.
                </p>
              </div>
            )}

            {!result.owner_id && user && (
              <div className="text-center space-y-3">
                <p className="font-body text-sm text-muted-foreground">
                  This product never get owner. Make you register am now!
                </p>
                <Button onClick={onClaimOwnership} size="lg" className="font-body gap-2 px-8">
                  <Crown className="w-5 h-5" /> Claim Ownership — Make E Be Yours
                </Button>
              </div>
            )}

            {!result.owner_id && !user && (
              <div className="text-center p-4 rounded-xl bg-muted/50 border border-border">
                <User className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="font-body text-sm text-muted-foreground mb-3">
                  Sign in to claim ownership and register this product for your name.
                </p>
                <Button asChild variant="outline" className="font-body gap-2">
                  <Link to="/auth"><User className="w-4 h-4" /> Sign In to Claim</Link>
                </Button>
              </div>
            )}

            {result.owner_id && !isOwner && (
              <div className="p-4 rounded-xl bg-muted/50 border border-border text-center">
                <User className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="font-body text-xs text-muted-foreground">
                  This product is registered to <span className="font-semibold text-foreground">{result.owner_name}</span>
                </p>
              </div>
            )}
          </motion.div>

          {/* View Product Link */}
          {product?.slug && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-center"
            >
              <Button asChild variant="ghost" className="font-body text-xs gap-1.5 text-muted-foreground">
                <Link to={`/product/${product.slug}`}>
                  View Full Product Page <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VerifyResult;
