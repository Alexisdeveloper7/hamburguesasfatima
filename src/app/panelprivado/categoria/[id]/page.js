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
      id,
      categoria_id,
      nombre,
      descripcion,
      imagen_url,
      precio,
      disponible,
      orden
    FROM productos
    WHERE categoria_id = ${categoriaId}
    ORDER BY orden ASC, id ASC
  `;

  return productos;
}

export default async function PanelCategoriaPage({ params }) {
  const { id } = await params;
  const categoriaId = Number(id);

  if (!categoriaId) {
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