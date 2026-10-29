import type { ExerciceOmbreSoleilDirectionInconnue } from "../core/ombreSoleil.types";
import { sommetPiquet } from "../moteur/verificationOmbreSoleil";
import { AIDE_DIRECTION_INCONNUE, avecId, COULEURS_OMBRE, fusionner, CONSIGNE_DIRECTION_INCONNUE, copieRayonDepuisPied, dessinDirection, directionCorrecte, elementsScene, libelleDirection, origineApercusDirection, solidePourAffichage } from "../ui/formatOmbreSoleil";
import { ChoixCandidatsOmbre } from "./ChoixCandidatsOmbre";
import type { FicheChoixOmbre } from "./ChoixCandidatsOmbre";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceOmbreSoleilDirectionInconnue;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (id: string, fiche: FicheChoixOmbre) => void;
  validation?: ValidationEtapeProps | null;
}

/** Variante C, étape 0 — déduire la direction de la lumière de la seule paire sommet/ombre connue.
 * Les aperçus partent d'un AUTRE sommet que le sommet connu : il faut comparer des inclinaisons,
 * pas repérer un aperçu superposé au trait déjà dessiné. */
export function EtapeDirectionInconnue({ exercice, ...reste }: Props) {
  const origine = origineApercusDirection(exercice);
  const sommet = sommetPiquet(origine);
  const copie = copieRayonDepuisPied(origine.base, sommetPiquet(exercice.piquetConnu), exercice.ombreConnue);
  return (
    <ChoixCandidatsOmbre
      {...reste}
      solide={solidePourAffichage(exercice)}
      fond={fusionner(elementsScene(exercice), { points: [{ position: sommet, label: origine.id, couleur: COULEURS_OMBRE.baton }], segments: [] })}
      consigne={avecId(CONSIGNE_DIRECTION_INCONNUE, origine.id, exercice.piquetConnu.id)}
      candidats={exercice.directionsCandidates.map((d) => ({ id: d.id, dessin: (numero, etat) => dessinDirection(sommet, d, numero, etat) }))}
      idCorrect={directionCorrecte(exercice).id}
      libelle={libelleDirection}
      aides={[
        { texte: avecId(AIDE_DIRECTION_INCONNUE[0], origine.id, exercice.piquetConnu.id) },
        { texte: avecId(AIDE_DIRECTION_INCONNUE[1], origine.id, exercice.piquetConnu.id), dessin: { points: [], segments: [copie] } },
      ]}
    />
  );
}
