import { useMemo } from "react";
import type { ExerciceOmbreSoleilSolidePose } from "../core/ombreSoleil.types";
import { sommetPiquet } from "../moteur/verificationOmbreSoleil";
import {
  aidesPointSolidePose,
  appliquerEtiquettes,
  consignePointSolidePose,
  dessinPoint,
  elementsPiedApex,
  elementsScene,
  fusionner,
  libellePoint,
  messagePointFauxSolidePose,
  ombresSolidePose,
  placerEtiquettesSolidePose,
  rayonProlonge,
  solidePourAffichage,
} from "../ui/formatOmbreSoleil";
import type { ElementsCroquis } from "../ui/formatOmbreSoleil";
import { ChoixCandidatsOmbre } from "./ChoixCandidatsOmbre";
import type { FicheChoixOmbre } from "./ChoixCandidatsOmbre";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceOmbreSoleilSolidePose;
  index: number;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (id: string, fiche: FicheChoixOmbre) => void;
  validation?: ValidationEtapeProps | null;
}

/** Variante D (solide posé au sol) — un écran par sommet du haut à projeter : choisir son ombre parmi
 * 4 points. Les ombres déjà trouvées restent dessinées ; étiquettes placées en pixels sur TOUT ce que
 * l'écran peut montrer (aides et candidats compris), donc immobiles d'un état à l'autre. */
export function EtapePointSolidePose({ exercice, index, ...reste }: Props) {
  const p = exercice.piquets[index]!;
  const aides = aidesPointSolidePose(exercice, index);
  const { fond, dessinAide, decalages } = useMemo(() => {
    const sommet = sommetPiquet(p.piquet);
    const fondBrut = fusionner(elementsScene(exercice), ombresSolidePose(exercice, index));
    const aide: ElementsCroquis = fusionner(
      { points: [], segments: [rayonProlonge(sommet, exercice.direction)] },
      exercice.forme === "pyramide" ? elementsPiedApex(exercice) : { points: [], segments: [] },
    );
    const tout = fusionner(fondBrut, aide, ...p.pointsCandidats.map((c) => dessinPoint(c.position, 1, "neutre")));
    const d = placerEtiquettesSolidePose(exercice, tout);
    return { fond: appliquerEtiquettes(fondBrut, d), dessinAide: appliquerEtiquettes(aide, d), decalages: d };
  }, [exercice, index, p]);
  return (
    <ChoixCandidatsOmbre
      {...reste}
      solide={solidePourAffichage(exercice)}
      fond={fond}
      consigne={consignePointSolidePose(exercice, index)}
      information={exercice.piquets.length > 1 ? `Sommet ${index + 1}/${exercice.piquets.length}` : undefined}
      candidats={p.pointsCandidats.map((c) => ({ id: c.id, dessin: (numero, etat) => appliquerEtiquettes(dessinPoint(c.position, numero, etat), decalages) }))}
      idCorrect={p.pointsCandidats.find((c) => c.erreur === "aucune")!.id}
      libelle={libellePoint}
      messageFaux={(id) => messagePointFauxSolidePose(p.pointsCandidats.find((c) => c.id === id)!.erreur, exercice, index)}
      aides={[{ texte: aides[0] }, { texte: aides[1], dessin: dessinAide }]}
    />
  );
}
