import type { LigneAide } from "../ui5e/formatConvergenceSuites";
import { Katex } from "../components/Katex";

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
