import type { ExerciceOmbreSoleilObstacle } from "../core/ombreSoleil.types";
import { sommetPiquet } from "../moteur/verificationOmbreSoleil";
import { AIDE_DIRECTION_OBSTACLE, CONSIGNE_DIRECTION_OBSTACLE, copieRayonDepuisPied, dessinDirection, directionCorrecte, elementsScene, libelleDirection, solidePourAffichage } from "../ui/formatOmbreSoleil";
import { ChoixCandidatsOmbre } from "./ChoixCandidatsOmbre";
import type { FicheChoixOmbre } from "./ChoixCandidatsOmbre";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceOmbreSoleilObstacle;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (id: string, fiche: FicheChoixOmbre) => void;
  validation?: ValidationEtapeProps | null;
}

/** Variante B, écran 1 — choisir le rayon parallèle à celui de l'exemple (4 aperçus dessinés). */
export function EtapeDirectionOmbre({ exercice, ...reste }: Props) {
  const sommet = sommetPiquet(exercice.baton);
  const copie = copieRayonDepuisPied(exercice.baton.base, sommetPiquet(exercice.piquetExemple), exercice.ombreExemple);
  return (
    <ChoixCandidatsOmbre
      {...reste}
      solide={solidePourAffichage(exercice)}
      fond={elementsScene(exercice)}
      consigne={CONSIGNE_DIRECTION_OBSTACLE}
      candidats={exercice.directionsCandidates.map((d) => ({ id: d.id, dessin: (numero, etat) => dessinDirection(sommet, d, numero, etat) }))}
      idCorrect={directionCorrecte(exercice).id}
      libelle={libelleDirection}
      aides={[{ texte: AIDE_DIRECTION_OBSTACLE[0] }, { texte: AIDE_DIRECTION_OBSTACLE[1], dessin: { points: [], segments: [copie] } }]}
    />
  );
}
