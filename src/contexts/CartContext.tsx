import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  selected_size: string | null;
  selected_color: string | null;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    product_images: { image_url: string }[];
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, size?: string, color?: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getSessionId = () => {
  let sessionId = localStorage.getItem("guest_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("guest_session_id", sessionId);
  }
  return sessionId;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("cart_items")
      .select("*, product:products(id, name, slug, price, product_images(image_url))");

    if (user) {
      query = query.eq("user_id", user.id);
    } else {
      query = query.eq("session_id", getSessionId());
    }

    const { data } = await query;
    setItems((data as any) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Merge guest cart to user cart on login
  useEffect(() => {
    if (user) {
      const sessionId = localStorage.getItem("guest_session_id");
      if (sessionId) {
        supabase
          .from("cart_items")
          .update({ user_id: user.id, session_id: null })
          .eq("session_id", sessionId)
          .then(() => {
            localStorage.removeItem("guest_session_id");
            fetchCart();
          });
      }
    }
  }, [user, fetchCart]);

  const addToCart = async (productId: string, size?: string, color?: string, quantity = 1) => {
    const payload: any = {
      product_id: productId,
      quantity,
      selected_size: size || null,
      selected_color: color || null,
    };

    if (user) {
      payload.user_id = user.id;
    } else {
      payload.session_id = getSessionId();
    }

    // Check if item already exists
    const existing = items.find(
      (i) => i.product_id === productId && i.selected_size === (size || null) && i.selected_color === (color || null)
    );

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert(payload);
    }
    await fetchCart();
  };

  const removeFromCart = async (itemId: string) => {
    await supabase.from("cart_items").delete().eq("id", itemId);
    await fetchCart();
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
    await fetchCart();
  };

  const clearCart = async () => {
    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    } else {
      await supabase.from("cart_items").delete().eq("session_id", getSessionId());
    }
    setItems([]);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.quantity * (i.product?.price || 0), 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
