import type { ExerciceOmbreSoleilObstacle } from "../core/ombreSoleil.types";
import { sommetPiquet } from "../moteur/verificationOmbreSoleil";
import { AIDE_POINT_OBSTACLE, COULEURS_OMBRE, CONSIGNE_POINT_OBSTACLE, dessinPoint, directionCorrecte, elementsScene, fusionner, libellePoint, rayonProlonge, solidePourAffichage, traceProlongee } from "../ui/formatOmbreSoleil";
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

/**
 * Variante B, écran 2 — UNE seule question par scène (décision H4a) : où l'ombre du sommet du bâton
 * s'arrête-t-elle réellement ? La direction confirmée à l'écran précédent est rappelée (court rayon
 * gris) ; les 4 points candidats sont indépendants des directions (audit, point 38) : le vrai premier
 * impact, et des erreurs typiques (rayon qui « traverse » l'obstacle, obstacle suivant, obstacle
 * survolé, trace au sol de mauvaise longueur…).
 */
export function EtapePointOmbre({ exercice, ...reste }: Props) {
  const sommet = sommetPiquet(exercice.baton);
  const direction = directionCorrecte(exercice);
  const rappel = { points: [], segments: [{ a: sommet, b: direction.extremiteApercu, couleur: COULEURS_OMBRE.exemple, pointille: true }] };
  const aide2 = { points: [], segments: [rayonProlonge(sommet, exercice.direction), traceProlongee(exercice.baton, exercice.direction)] };
  return (
    <ChoixCandidatsOmbre
      {...reste}
      solide={solidePourAffichage(exercice)}
      fond={fusionner(elementsScene(exercice), rappel)}
      consigne={CONSIGNE_POINT_OBSTACLE}
      candidats={exercice.pointsCandidats.map((c) => ({ id: c.id, dessin: (numero, etat) => dessinPoint(c.position, numero, etat) }))}
      idCorrect={exercice.pointsCandidats.find((c) => c.erreur === "aucune")!.id}
      libelle={libellePoint}
      aides={[{ texte: AIDE_POINT_OBSTACLE[0] }, { texte: AIDE_POINT_OBSTACLE[1], dessin: aide2 }]}
    />
  );
}
