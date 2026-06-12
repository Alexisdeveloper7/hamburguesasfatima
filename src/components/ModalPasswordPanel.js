"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CONTRASENA_PANEL = "fatima73";

export default function ModalPasswordPanel() {
  const router = useRouter();

  const [desbloqueado, setDesbloqueado] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  useEffect(() => {
    const accesoGuardado = sessionStorage.getItem("panel_privado_ok");

    if (accesoGuardado === "si") {
      setDesbloqueado(true);
    }
  }, []);

  useEffect(() => {
    if (desbloqueado) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [desbloqueado]);

  useEffect(() => {
    const bloquearEscape = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", bloquearEscape, true);

    return () => {
      window.removeEventListener("keydown", bloquearEscape, true);
    };
  }, []);

  const entrar = (e) => {
    e.preventDefault();

    if (password.trim() !== CONTRASENA_PANEL) {
      setError(true);
      setPassword("");
      return;
    }

    sessionStorage.setItem("panel_privado_ok", "si");
    setDesbloqueado(true);
  };

  const cancelar = () => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    router.push("/");
  };

  if (desbloqueado) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-black/85 px-4 backdrop-blur-md">
      <form
        onSubmit={entrar}
        className="relative w-full max-w-sm overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-white via-zinc-100 to-zinc-300 p-[1px] shadow-2xl shadow-black/50"
      >
        <div className="rounded-[1.55rem] bg-gradient-to-br from-zinc-50 via-white to-zinc-200 p-5 text-center ring-1 ring-white/40">
          <button
            type="button"
            onClick={cancelar}
            aria-label="Cerrar modal"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl font-black leading-none text-black shadow-md shadow-black/15 ring-1 ring-black/10 transition active:scale-90 active:bg-zinc-200"
          >
            ×
          </button>

          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#fff200] via-[#ffb000] to-[#d94b16] text-2xl shadow-lg shadow-black/20">
            🔒
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d94b16]">
            Panel privado
          </p>

          <h1 className="mt-1 text-xl font-black uppercase leading-tight text-black">
            Acceso bloqueado
          </h1>

          <p className="mt-2 text-[11px] font-semibold text-zinc-500">
            Escribe la contraseña para modificar productos
          </p>

          <div className="relative mt-4">
            <input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              type={mostrarPassword ? "text" : "password"}
              required
              autoFocus
              placeholder="Contraseña"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-12 text-center text-[16px] font-bold text-black shadow-inner outline-none transition focus:border-[#d94b16] focus:ring-4 focus:ring-[#fff200]/50"
            />

            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-zinc-600 transition active:scale-90 active:bg-zinc-100"
              aria-label={
                mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {mostrarPassword ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M4 20L20 4" />
                </svg>
              )}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.12em] text-red-600">
              Contraseña incorrecta
            </p>
          )}

          <button
            type="submit"
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#fff200] via-[#ffb000] to-[#d94b16] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-black shadow-lg shadow-black/20 transition active:scale-[0.96] active:brightness-110"
          >
            Entrar al panel
          </button>

          <button
            type="button"
            onClick={cancelar}
            className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-zinc-700 shadow-sm transition active:scale-[0.96] active:bg-zinc-200"
          >
            Cancelar
          </button>

          <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-400">
            Solo personal autorizado
          </p>
        </div>
      </form>
    </div>
  );
}