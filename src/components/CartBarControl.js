"use client";

import { usePathname } from "next/navigation";
import CartBar from "@/components/CartBar";

export default function CartBarControl() {
  const pathname = usePathname();

  const esPanelPrivado = pathname?.startsWith("/panelprivado");

  if (esPanelPrivado) {
    return null;
  }

  return <CartBar />;
}