import { sql } from "@/lib/neon";
import ModalPasswordPanel from "@/components/ModalPasswordPanel";
import PanelCategoriasAdmin from "@/components/PanelCategoriasAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function obtenerCategorias() {
  const categorias = await sql`
    SELECT 
      id,
      nombre,
      orden,
      visible
    FROM categorias
    ORDER BY orden ASC, id ASC
  `;

  return categorias;
}

export default async function PanelPrivadoPage() {
  const categorias = await obtenerCategorias();

  return (
    <>
      <ModalPasswordPanel />

      <PanelCategoriasAdmin categorias={categorias} />
    </>
  );
}