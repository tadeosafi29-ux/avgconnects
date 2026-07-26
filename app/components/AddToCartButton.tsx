"use client";

import { useCart, type CartItem } from "@/app/context/CartContext";

interface AddToCartButtonProps {
  item: Omit<CartItem, "quantity">;
  quantity?: number;
  className?: string;
  label?: string;
}

export default function AddToCartButton({ item, quantity = 1, className, label = "Agregar al carrito" }: AddToCartButtonProps) {
  const { addToCart } = useCart();

  return (
    <button type="button" className={className} onClick={() => addToCart(item, quantity)}>
      {label}
    </button>
  );
}
