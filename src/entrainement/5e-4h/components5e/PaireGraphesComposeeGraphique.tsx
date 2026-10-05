import type { ExerciceComposeeGraphique, PointGraphique } from "../core5e/composeeGraphique.types";
import { CourbeGraph } from "./CourbeGraph";

const COULEUR_F = "#1971c2";
const COULEUR_G = "#f08c00";

interface Props {
  exercice: ExerciceComposeeGraphique;
  /** Aide niveau 2 (E.7) : quelle fonction affiche le point révélé, et à quelles coordonnées —
   * `null`/absent tant que ce palier d'aide n'est pas atteint. */
  pointRevele?: { fonction: "f" | "g"; point: PointGraphique } | null;
}

/** Bloc "données" persistant — les 2 graphes restent affichés sur les 4-5 écrans de questions
 * d'un même exercice (spec explicite : "consigne générale redondante + bloc de données redondant").
 * Couleurs reprises du bleu/orange déjà établis ailleurs sur la plateforme (pont/cible, gen58). */
export function PaireGraphesComposeeGraphique({ exercice, pointRevele }: Props) {
  return (
    <div className="paire-graphes-composee">
      <CourbeGraph courbe={exercice.f} couleur={COULEUR_F} nom="f" pointRevele={pointRevele?.fonction === "f" ? pointRevele.point : null} />
      <CourbeGraph courbe={exercice.g} couleur={COULEUR_G} nom="g" pointRevele={pointRevele?.fonction === "g" ? pointRevele.point : null} />
    </div>
  );
}
