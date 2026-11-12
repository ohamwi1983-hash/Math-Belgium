import type { ExerciceComposeeGraphique, PointGraphique } from "../core5e/composeeGraphique.types";
import { COULEURS_ECRAN_F, COULEURS_ECRAN_G } from "../ui5e/composeeGraphiqueGraph";
import { CourbeGraph } from "./CourbeGraph";

interface Props {
  exercice: ExerciceComposeeGraphique;
  /** Aide niveau 2 : quelle fonction affiche le point révélé, et à quelles coordonnées — `null`/absent
   * tant que ce palier d'aide n'est pas atteint. */
  pointRevele?: { fonction: "f" | "g"; point: PointGraphique } | null;
}

/** Bloc "données" persistant — les 2 graphes restent affichés sur tous les écrans de questions d'un
 * même exercice. Couleurs prises dans les jetons du thème (bleu --sky pour f, orange --accent pour g),
 * lisibles en thème clair comme en thème sombre. */
export function PaireGraphesComposeeGraphique({ exercice, pointRevele }: Props) {
  return (
    <div className="paire-graphes-composee">
      <CourbeGraph courbe={exercice.f} couleurs={COULEURS_ECRAN_F} nom="f" pointRevele={pointRevele?.fonction === "f" ? pointRevele.point : null} />
      <CourbeGraph courbe={exercice.g} couleurs={COULEURS_ECRAN_G} nom="g" pointRevele={pointRevele?.fonction === "g" ? pointRevele.point : null} />
    </div>
  );
}
