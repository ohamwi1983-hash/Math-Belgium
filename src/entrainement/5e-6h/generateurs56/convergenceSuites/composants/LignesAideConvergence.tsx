// Copie 5e (6h) de `5e-4h/components5e/LignesAideConvergence.tsx` (56gen6 ← 5gen16, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { LigneAide } from "../ui/formatConvergenceSuites";
import { Katex } from "../../../../5e-4h/components/Katex";

/** Aides de 5gen16 rendues en PARAGRAPHES (prose qui passe à la ligne sur téléphone, formule courte
 * en KaTeX inline) — jamais de prose dans le mode maths (lettres collées, troncature à 390 px). */
export function LignesAideConvergence({ lignes }: { lignes: LigneAide[] }) {
  return (
    <>
      {lignes.map((l, i) => (
        <p key={i} className="aide-ligne">
          {l.texte}
          {l.latex && <Katex expression={l.latex} />}
          {l.texteApres}
        </p>
      ))}
    </>
  );
}
