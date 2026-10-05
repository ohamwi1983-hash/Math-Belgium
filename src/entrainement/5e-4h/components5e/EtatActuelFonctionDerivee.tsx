import type { ExerciceFonctionDerivee, TypeDerivee } from "../core5e/fonctionDerivee.types";
import type { EcranFonctionDerivee } from "../moteur5e/typesFonctionDerivee";
import { formatTermesEtatActuelLatex, libelleTypeReconnu } from "../ui5e/formatFonctionDerivee";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceFonctionDerivee;
  ecran: EcranFonctionDerivee;
  typeRetenu: TypeDerivee | null;
}

/** Bloc "état actuel" de 5gen27 — absent sur "reconnaissance" (rien n'est encore confirmé), puis
 * rappelle le type reconnu (texte SIMPLE, jamais de KaTeX pour un libellé — voir CLAUDE.md, piège
 * "phrase entière dans un unique \text{...}" déjà corrigé sur 5gen26) et, dès que la décomposition
 * est confirmée (écran "calculer", sauf pour "reglebase" qui n'en a pas), les 2 fragments
 * u(x)=.../v(x)=... ou u(x)=.../g(u)=... en KaTeX. */
export function EtatActuelFonctionDerivee({ exercice, ecran, typeRetenu }: Props) {
  if (ecran === "reconnaissance" || typeRetenu === null) return null;
  const termes = formatTermesEtatActuelLatex(exercice, ecran, typeRetenu);
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      <p>{libelleTypeReconnu(typeRetenu)}</p>
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}
