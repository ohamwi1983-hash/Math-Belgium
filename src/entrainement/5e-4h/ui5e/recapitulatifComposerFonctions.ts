import type { CompositionDirigee } from "../core5e/composerFonctions.types";
import type { EtatSessionComposerFonctions, PhaseComposerFonctions } from "../moteur5e/typesComposerFonctions";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { estPhaseFRondG, formatTermesConditionsLatex, libellePhaseComposerFonctions } from "./formatComposerFonctions";
import { formatTermesEnsembleReelLatex } from "./formatDomaineDefinition";

/** Même préfixage "<libellé> = <premier terme>" que l'ancien bloc "état actuel" maison
 * (`formatTermesDomaineAvecPrefixe`, privée dans `ui5e/formatComposerFonctions.ts`) — dupliqué ici
 * car ce fichier n'est pas une des cibles autorisées à exporter de nouvelles fonctions. */
function termesAvecPrefixe(prefixe: string, termes: string[]): string[] {
  return termes.map((t, i) => (i === 0 ? `${prefixe} ${t}` : t));
}

/** Même notation que `nomComposition` (privée, `ui5e/formatComposerFonctions.ts`) — réutilisée telle
 * quelle y compris à l'intérieur d'expressions KaTeX (déjà le cas en production, voir
 * `formatTermesEtatActuelComposerFonctions`). */
function nomComposition(estFRondG: boolean): string {
  return estFRondG ? "f∘g" : "g∘f";
}

/**
 * Construit le récapitulatif des phases déjà closes de l'exercice en cours. Reprend EXACTEMENT les
 * valeurs déjà affichées par l'ancien bloc "état actuel" maison (`EtatActuelComposerFonctions`,
 * dupliqué dans les 3 `Etape*ComposerFonctions.tsx`, alimenté par
 * `formatTermesEtatActuelComposerFonctions`) — y compris son filtrage "mêmeDirection" (bug 2,
 * `promptcorrections5gen3bugs.md`) : une fois une direction ENTIÈREMENT close (progression vers
 * l'autre direction, `sens === "lesDeux"`), seuls ses 2 jalons (formule, domaine) restent dans le
 * récapitulatif — jamais un historique qui grossirait indéfiniment. Seule différence : une entrée
 * par phase (libellé + icône ✓/✗ via `revelesPartiels`, toujours explicitement renseigné pour une
 * phase close — voir `apresPhase`, `moteur5e/sessionComposerFonctions.ts`) plutôt qu'un flux unique
 * de fragments KaTeX sans label.
 */
export function calculerRecapitulatifComposerFonctions(etat: EtatSessionComposerFonctions): EntreeRecapitulatif[] {
  const { exerciceCourant: exercice, ordre, indexPhase, revelesPartiels } = etat;
  const phaseCourante = ordre[indexPhase] as PhaseComposerFonctions | undefined;
  const directionCourante = phaseCourante ? estPhaseFRondG(phaseCourante) : null;
  const entrees: EntreeRecapitulatif[] = [];

  for (let i = 0; i < indexPhase; i++) {
    const phase = ordre[i];
    const estFRondG = estPhaseFRondG(phase);
    const dir: CompositionDirigee | null = estFRondG ? exercice.fRondG : exercice.gRondF;
    if (dir === null) continue;
    const memeDirection = directionCourante !== null && estFRondG === directionCourante;
    const revele = revelesPartiels[phase] ?? false;
    const libelle = libellePhaseComposerFonctions(phase);

    if (phase.startsWith("formule")) {
      entrees.push({ libelle, estLatex: true, valeur: `(${nomComposition(estFRondG)})(x) = ${dir.latex}`, revele });
    } else if (phase.startsWith("conditions") && memeDirection) {
      const valeurs = formatTermesConditionsLatex(dir);
      entrees.push({ libelle, estLatex: true, valeur: valeurs.join(" \\text{ et } "), valeurs, revele });
    } else if (phase.startsWith("c1") && memeDirection) {
      const valeurs = termesAvecPrefixe(`\\text{domaine propre de } ${dir.nomInterieure} =`, formatTermesEnsembleReelLatex(dir.interieure.domaine));
      entrees.push({ libelle, estLatex: true, valeur: valeurs.join(" \\text{ et } "), valeurs, revele });
    } else if (phase.startsWith("c2") && memeDirection && dir.domaineApresCarre !== null) {
      const valeurs = termesAvecPrefixe("\\text{après mise au carré} =", formatTermesEnsembleReelLatex(dir.domaineApresCarre));
      entrees.push({ libelle, estLatex: true, valeur: valeurs.join(" \\text{ et } "), valeurs, revele });
    } else if (phase.startsWith("domaine")) {
      const valeurs = termesAvecPrefixe(`\\text{dom}(${nomComposition(estFRondG)}) =`, formatTermesEnsembleReelLatex(dir.domaine));
      entrees.push({ libelle, estLatex: true, valeur: valeurs.join(" \\text{ et } "), valeurs, revele });
    }
  }
  return entrees;
}
