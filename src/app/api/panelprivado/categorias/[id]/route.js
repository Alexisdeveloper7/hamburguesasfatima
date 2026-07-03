import { NextResponse } from "next/server";
import { sql } from "@/lib/neon";

function validarId(id) {
  const numero = Number(id);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const categoriaId = validarId(id);

    if (!categoriaId) {
      return NextResponse.json(
        { error: "ID de categoría inválido." },
        { status: 400 }
      );
    }

    const { nombre, orden, visible } = await request.json();

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { error: "El nombre de la categoría es obligatorio." },
        { status: 400 }
      );
    }

    const ordenNumero = Number(orden);
    const ordenFinal = Number.isFinite(ordenNumero) ? ordenNumero : 0;
    const visibleFinal = typeof visible === "boolean" ? visible : true;

    const categoriaActualizada = await sql`
      UPDATE categorias
      SET
        nombre = ${nombre.trim()},
        orden = ${ordenFinal},
        visible = ${visibleFinal}
      WHERE id = ${categoriaId}
      RETURNING id
    `;

    if (categoriaActualizada.length === 0) {
      return NextResponse.json(
        { error: "La categoría no existe." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al modificar categoría:", error);

    return NextResponse.json(
      { error: "Error al modificar categoría." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const categoriaId = validarId(id);

    if (!categoriaId) {
      return NextResponse.json(
        { error: "ID de categoría inválido." },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM producto_extras
      WHERE producto_id IN (
        SELECT id
        FROM productos
        WHERE categoria_id = ${categoriaId}
      )
    `;

    await sql`
      DELETE FROM productos
      WHERE categoria_id = ${categoriaId}
    `;

    const categoriaEliminada = await sql`
      DELETE FROM categorias
      WHERE id = ${categoriaId}
      RETURNING id
    `;

    if (categoriaEliminada.length === 0) {
      return NextResponse.json(
        { error: "La categoría no existe." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);

    return NextResponse.json(
      { error: "Error al eliminar categoría." },
      { status: 500 }
    );
  }
}