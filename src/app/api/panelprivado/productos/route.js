import { NextResponse } from "next/server";
import { sql } from "@/lib/neon";

function limpiarYValidarExtras(extras) {
  if (!Array.isArray(extras)) return { extrasLimpios: [], error: "" };

  const extrasLimpios = [];

  for (const extra of extras) {
    const nombre = String(extra.nombre || "").trim();
    const precioTexto = String(extra.precio ?? "").trim();

    if (!nombre) {
      return {
        extrasLimpios: [],
        error: "Escribe el nombre de todos los extras o elimínalos.",
      };
    }

    if (precioTexto === "") {
      return {
        extrasLimpios: [],
        error: "Escribe el precio de todos los extras, aunque sea 0.",
      };
    }

    const precio = Number(precioTexto);

    if (!Number.isFinite(precio) || precio < 0) {
      return {
        extrasLimpios: [],
        error: "El precio de los extras no puede ser negativo.",
      };
    }

    extrasLimpios.push({
      nombre,
      precio,
    });
  }

  return { extrasLimpios, error: "" };
}

export async function POST(request) {
  try {
    const body = await request.json();

    const categoriaId = Number(body.categoria_id);
    const nombre = String(body.nombre || "").trim();
    const descripcion = String(body.descripcion || "").trim();
    const imagen_url = String(body.imagen_url || "").trim();
    const precio = Number(body.precio);
    const disponible = body.disponible === false ? false : true;
    const orden = Number(body.orden || 0);

    const { extrasLimpios, error: errorExtras } = limpiarYValidarExtras(
      body.extras
    );

    if (errorExtras) {
      return NextResponse.json({ error: errorExtras }, { status: 400 });
    }

    if (!categoriaId) {
      return NextResponse.json(
        { error: "Categoría no válida." },
        { status: 400 }
      );
    }

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
      INSERT INTO productos (
        categoria_id,
        nombre,
        descripcion,
        imagen_url,
        precio,
        disponible,
        orden
      )
      VALUES (
        ${categoriaId},
        ${nombre},
        ${descripcion},
        ${imagen_url},
        ${precio},
        ${disponible},
        ${orden}
      )
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

    const producto = productos[0];

    for (const extra of extrasLimpios) {
      await sql`
        INSERT INTO producto_extras (
          producto_id,
          nombre,
          precio
        )
        VALUES (
          ${producto.id},
          ${extra.nombre},
          ${extra.precio}
        )
      `;
    }

    const extrasGuardados = await sql`
      SELECT
        id,
        nombre,
        precio
      FROM producto_extras
      WHERE producto_id = ${producto.id}
      ORDER BY id ASC
    `;

    return NextResponse.json({
      ok: true,
      producto: {
        ...producto,
        extras: extrasGuardados,
      },
    });
  } catch (error) {
    console.error("Error creando producto:", error);

    return NextResponse.json(
      { error: "Error interno al crear el producto." },
      { status: 500 }
    );
  }
}