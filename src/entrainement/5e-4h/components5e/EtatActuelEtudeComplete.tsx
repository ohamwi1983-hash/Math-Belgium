import type { ExerciceEtudeComplete } from "../core5e/etudeComplete.types";
import type { PhaseEtudeComplete } from "../moteur5e/typesEtudeComplete";
import { ordreComplet } from "../moteur5e/typesEtudeComplete";
import { formatTermesEtatActuelLatex } from "../ui5e/formatEtudeComplete";
import { Katex } from "../components/Katex";

/** Bloc "état actuel" — accumule domaine + chaque limite trouvée, absent à l'écran "domaine". */
export function EtatActuelEtudeComplete({ exercice, phase }: { exercice: ExerciceEtudeComplete; phase: PhaseEtudeComplete }) {
  const termes = formatTermesEtatActuelLatex(exercice, phase, ordreComplet(exercice));
  if (termes.length === 0) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} block={t.includes("\\lim_{")} />
      ))}
    </div>
  );
}
