import type { ExerciceOmbreSoleilSimple } from "../core/ombreSoleil.types";
import { sommetPiquet } from "../moteur/verificationOmbreSoleil";
import { AIDE_POINT_SIMPLE, CONSIGNE_POINT_SIMPLE, dessinPoint, elementsScene, libellePoint, rayonProlonge, solidePourAffichage } from "../ui/formatOmbreSoleil";
import { ChoixCandidatsOmbre } from "./ChoixCandidatsOmbre";
import type { FicheChoixOmbre } from "./ChoixCandidatsOmbre";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceOmbreSoleilSimple;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (id: string, fiche: FicheChoixOmbre) => void;
  validation?: ValidationEtapeProps | null;
}

/** Variante A — écran unique : choisir le point d'ombre du sommet du bâton parmi 4 points dessinés. */
export function EtapePointSimple({ exercice, ...reste }: Props) {
  const p = exercice.piquet;
  return (
    <ChoixCandidatsOmbre
      {...reste}
      solide={solidePourAffichage(exercice)}
      fond={elementsScene(exercice)}
      consigne={CONSIGNE_POINT_SIMPLE}
      candidats={p.pointsCandidats.map((c) => ({ id: c.id, dessin: (numero, etat) => dessinPoint(c.position, numero, etat) }))}
      idCorrect={p.pointsCandidats.find((c) => c.erreur === "aucune")!.id}
      libelle={libellePoint}
      aides={[{ texte: AIDE_POINT_SIMPLE[0] }, { texte: AIDE_POINT_SIMPLE[1], dessin: { points: [], segments: [rayonProlonge(sommetPiquet(p.piquet), exercice.direction)] } }]}
    />
  );
}
