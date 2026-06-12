import { NextResponse } from "next/server";
import { sql } from "@/lib/neon";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const productoId = Number(id);

    if (!productoId) {
      return NextResponse.json(
        { error: "Producto no válido." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const nombre = String(body.nombre || "").trim();
    const descripcion = String(body.descripcion || "").trim();
    const imagen_url = String(body.imagen_url || "").trim();
    const precio = Number(body.precio);
    const disponible = Boolean(body.disponible);
    const orden = Number(body.orden || 0);

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es obligatorio." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(precio) || precio < 0) {
      return NextResponse.json(
        { error: "El precio no es válido." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(orden)) {
      return NextResponse.json(
        { error: "El orden no es válido." },
        { status: 400 }
      );
    }

    const productos = await sql`
      UPDATE productos
      SET
        nombre = ${nombre},
        descripcion = ${descripcion},
        imagen_url = ${imagen_url},
        precio = ${precio},
        disponible = ${disponible},
        orden = ${orden}
      WHERE id = ${productoId}
      RETURNING
        id,
        categoria_id,
        nombre,
        descripcion,
        imagen_url,
        precio,
        disponible,
        orden
    `;

    if (!productos[0]) {
      return NextResponse.json(
        { error: "No se encontró el producto." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      producto: productos[0],
    });
  } catch (error) {
    console.error("Error actualizando producto:", error);

    return NextResponse.json(
      { error: "Error interno al guardar el producto." },
      { status: 500 }
    );
  }
}