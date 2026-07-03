import { notFound } from "next/navigation";
import { sql } from "@/lib/neon";
import PanelCategoriaProductos from "@/components/PanelCategoriaProductos";
import ModalPasswordPanel from "@/components/ModalPasswordPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function obtenerCategoria(id) {
  const categorias = await sql`
    SELECT 
      id,
      nombre
    FROM categorias
    WHERE id = ${id}
    LIMIT 1
  `;

  return categorias[0] || null;
}

async function obtenerProductos(categoriaId) {
  const productos = await sql`
    SELECT 
      p.id,
      p.categoria_id,
      p.nombre,
      p.descripcion,
      p.imagen_url,
      p.precio,
      p.disponible,
      p.orden,
      COALESCE(
        json_agg(
          json_build_object(
            'id', e.id,
            'nombre', e.nombre,
            'precio', e.precio
          )
          ORDER BY e.id ASC
        ) FILTER (WHERE e.id IS NOT NULL),
        '[]'
      ) AS extras
    FROM productos p
    LEFT JOIN producto_extras e ON e.producto_id = p.id
    WHERE p.categoria_id = ${categoriaId}
    GROUP BY 
      p.id,
      p.categoria_id,
      p.nombre,
      p.descripcion,
      p.imagen_url,
      p.precio,
      p.disponible,
      p.orden
    ORDER BY p.orden ASC, p.id ASC
  `;

  return productos;
}

export default async function PanelCategoriaPage({ params }) {
  const { id } = await params;
  const categoriaId = Number(id);

  if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
    notFound();
  }

  const categoria = await obtenerCategoria(categoriaId);

  if (!categoria) {
    notFound();
  }

  const productos = await obtenerProductos(categoriaId);

  return (
    <>
      <ModalPasswordPanel />

      <PanelCategoriaProductos
        categoria={categoria}
        productosIniciales={productos}
      />
    </>
  );
}