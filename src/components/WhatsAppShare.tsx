import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppShareProps {
  productName: string;
  productSlug: string;
  price: string;
}

const WhatsAppShare = ({ productName, productSlug, price }: WhatsAppShareProps) => {
  const shareUrl = `${window.location.origin}/product/${productSlug}`;
  const message = `Check out this Naija Original drip! 🇳🇬\n\n${productName}\nPrice: ${price}\n\n${shareUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <Button
      variant="outline"
      size="lg"
      className="py-6 rounded-xl gap-2 text-[#25D366] border-[#25D366]/30 hover:bg-[#25D366]/10 hover:text-[#25D366]"
      onClick={() => window.open(whatsappUrl, "_blank")}
    >
      <MessageCircle className="w-5 h-5" />
      <span className="hidden sm:inline font-accent text-sm">Share</span>
    </Button>
  );
};

export default WhatsAppShare;
