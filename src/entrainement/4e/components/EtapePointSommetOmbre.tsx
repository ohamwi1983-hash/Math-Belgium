import type { ExerciceOmbreSoleilDirectionInconnue } from "../core/ombreSoleil.types";
import { sommetPiquet } from "../moteur/verificationOmbreSoleil";
import { AIDE_POINT_SOMMET, avecId, CONSIGNE_POINT_SOMMET, dessinPoint, elementsScene, fusionner, libellePoint, ombresDejaTrouvees, rayonProlonge, solidePourAffichage } from "../ui/formatOmbreSoleil";
import { ChoixCandidatsOmbre } from "./ChoixCandidatsOmbre";
import type { FicheChoixOmbre } from "./ChoixCandidatsOmbre";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceOmbreSoleilDirectionInconnue;
  index: number;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (id: string, fiche: FicheChoixOmbre) => void;
  validation?: ValidationEtapeProps | null;
}

/** Variante C — un écran par sommet à projeter : choisir l'ombre de ce sommet parmi 4 points. Les
 * ombres déjà trouvées restent dessinées. */
export function EtapePointSommetOmbre({ exercice, index, ...reste }: Props) {
  const p = exercice.piquets[index];
  const sommet = sommetPiquet(p.piquet);
  const repere = { points: [{ position: sommet, label: p.piquet.id, couleur: "#495057" }], segments: [] };
  return (
    <ChoixCandidatsOmbre
      {...reste}
      solide={solidePourAffichage(exercice)}
      fond={fusionner(elementsScene(exercice), ombresDejaTrouvees(exercice, index), repere)}
      consigne={avecId(CONSIGNE_POINT_SOMMET, p.piquet.id)}
      information={`Sommet ${index + 1}/${exercice.piquets.length}`}
      candidats={p.pointsCandidats.map((c) => ({ id: c.id, dessin: (numero, etat) => dessinPoint(c.position, numero, etat) }))}
      idCorrect={p.pointsCandidats.find((c) => c.erreur === "aucune")!.id}
      libelle={libellePoint}
      aides={[
        { texte: avecId(AIDE_POINT_SOMMET[0], p.piquet.id) },
        { texte: avecId(AIDE_POINT_SOMMET[1], p.piquet.id), dessin: { points: [], segments: [rayonProlonge(sommet, exercice.direction)] } },
      ]}
    />
  );
}
