"use client";

import { useEffect, useState } from "react";

const KEY = "lm-crt";

/** Activa / desactiva las scanlines CRT (preferencia de accesibilidad). */
export function CrtToggle() {
  const [on, setOn] = useState(true);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza preferencia guardada
      if (localStorage.getItem(KEY) === "off") setOn(false);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.dataset.crt = on ? "on" : "off";
    try {
      localStorage.setItem(KEY, on ? "on" : "off");
    } catch {}
  }, [on]);

  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      className="mt-2 flex w-fit items-center gap-2 font-mono text-xs text-muted hover:text-text"
    >
      <span
        className={`size-3 rounded-sm border-[1.5px] ${on ? "border-cyan bg-cyan" : "border-line"}`}
      />
      Efecto CRT
    </button>
  );
}
