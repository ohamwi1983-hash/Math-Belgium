import { ORDRE_QUANTITES_ARC_SECTEUR } from "../core5e/arcsSecteurs.types";
import type { PhaseArcSecteur, ResultatExerciceArcSecteur } from "../moteur5e/typesArcsSecteurs";
import { LABELS, formatValeurCibleConversionLatex, formatValeurQuantiteLatex, labelReponseConversion } from "../ui5e/formatArcsSecteurs";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";
import { Katex } from "../components/Katex";

interface Props {
  resultat: ResultatExerciceArcSecteur;
  aideParPhase: Partial<Record<PhaseArcSecteur, number>>;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — liste à plat (`LigneRecap`), une ligne par écran réellement
 * traversé (les 3 quantités manquantes du mode "deuxVersTrois", ou l'unique écran du mode
 * "conversion"), contenant la réponse RÉELLEMENT attendue (jamais un score fractionnaire `X/100`).
 *
 * `niveauAide` n'est pas tracké par quantité/écran côté `ResultatExerciceArcSecteur`
 * (`Partial<Record<QuantiteArcSecteur,...>>` limité à `scores`/`reveles`,
 * `moteur5e/typesArcsSecteurs.ts`) — le niveau d'aide RÉELLEMENT utilisé sur chaque écran est donc
 * capturé côté présentation (`App5gen6.tsx`, `aideParPhase`, figé au moment où l'écran se ferme, clé
 * `PhaseArcSecteur` — `QuantiteArcSecteur | "conversion"`, couvre donc les deux modes) et transmis
 * ici en prop, jamais recalculé depuis le score.
 */
export function ResultatPanelArcSecteur({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {resultat.mode === "deuxVersTrois" &&
        ORDRE_QUANTITES_ARC_SECTEUR.filter((q) => resultat.scores[q] !== undefined).map((q) => (
          <LigneRecap key={q} label={LABELS[q]} statut={statutRecap(resultat.reveles[q] ?? false, aideParPhase[q] ?? null)}>
            <Katex expression={formatValeurQuantiteLatex(q, resultat.exercice)} />
          </LigneRecap>
        ))}
      {resultat.mode === "conversion" && (
        <LigneRecap label={labelReponseConversion(resultat.exercice).replace(/\s*=$/, "")} statut={statutRecap(resultat.revele, aideParPhase.conversion ?? null)}>
          <Katex expression={formatValeurCibleConversionLatex(resultat.exercice)} />
        </LigneRecap>
      )}
      <RecapTotalPoints
        ecrans={
          resultat.mode === "deuxVersTrois"
            ? ORDRE_QUANTITES_ARC_SECTEUR.filter((q) => resultat.scores[q] !== undefined).map((q) => ({ revele: resultat.reveles[q] ?? false, niveauAide: aideParPhase[q] ?? null }))
            : [{ revele: resultat.revele, niveauAide: aideParPhase.conversion ?? null }]
        }
      />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
