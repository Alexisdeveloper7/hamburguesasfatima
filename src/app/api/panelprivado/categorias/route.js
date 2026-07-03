import { NextResponse } from "next/server";
import { sql } from "@/lib/neon";

export async function POST(request) {
  try {
    const { nombre } = await request.json();

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { error: "El nombre de la categoría es obligatorio" },
        { status: 400 }
      );
    }

    const ultimoOrden = await sql`
      SELECT COALESCE(MAX(orden), 0) AS max_orden
      FROM categorias
    `;

    const nuevoOrden = Number(ultimoOrden[0].max_orden) + 1;

    await sql`
      INSERT INTO categorias (nombre, orden)
      VALUES (${nombre.trim()}, ${nuevoOrden})
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al crear categoría:", error);

    return NextResponse.json(
      { error: "Error al crear categoría" },
      { status: 500 }
    );
  }
}