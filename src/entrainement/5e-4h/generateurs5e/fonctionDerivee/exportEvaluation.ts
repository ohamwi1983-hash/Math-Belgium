import type { ExerciceFonctionDerivee } from "../../core5e/fonctionDerivee.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  consigneGenerale,
  formatFDeXLatex,
  formatReponseAttendueCalculerLatex,
  formatTermesReponseAttendueDecomposerLatex,
  LIBELLE_TYPE,
  texteReponseAttendueReconnaissance,
} from "../../ui5e/formatFonctionDerivee";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceFonctionDerivee } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFonctionDerivee>` pour 5gen27 ("Fonction
 * dérivée"), 3e générateur du chapitre "Dérivées et applications" — feuille d'évaluation. L'écran
 * interactif (`App5gen27.tsx`) traverse jusqu'à 3 écrans par instance selon la famille tirée
 * (`core5e/fonctionDerivee.types.ts`) : "reconnaissance" (identifier reglebase/produit/quotient/
 * composée — commun aux 4 familles, avec un cas ambigu délibéré où 2 lectures sont acceptées à la
 * fois, `1/(trig(ax+b))²`), puis "decomposer" (u(x)/v(x) ou u(x)/g(u) — SAUTÉ pour "reglebase", qui
 * n'a rien à décomposer), puis "calculer" (f'(x)). La version papier condense TOUJOURS cela en UNE
 * SEULE question ("reconnais la structure, décompose si besoin, calcule f'(x)"), même principe que
 * `generateurs5e/limites/exportEvaluation.ts` : on demande le résultat justifié en une fois plutôt
 * que de rejouer chaque écran séparément — la consigne reprend d'ailleurs `consigneGenerale()`
 * TELLE QUELLE (déjà volontairement générique côté écran, indépendante de la famille tirée).
 *
 * Le corrigé RESYNTHÉTISE les étapes clé (jamais recalculées : uniquement les formateurs déjà
 * utilisés côté écran, `ui5e/formatFonctionDerivee.ts` — `texteReponseAttendueReconnaissance`,
 * `formatTermesReponseAttendueDecomposerLatex`, `formatReponseAttendueCalculerLatex`, eux-mêmes
 * lus depuis les champs déjà connus de l'instance tirée, JAMAIS une nouvelle dérivation en JS) :
 * un paragraphe "Type reconnu : …", puis un paragraphe de décomposition par type accepté (absent
 * pour "reglebase", qui n'en a pas — `formatTermesReponseAttendueDecomposerLatex` renvoie `[]` dans
 * ce cas et le paragraphe est alors omis ; DEUX paragraphes de décomposition, un par lecture, pour
 * le cas ambigu — `exercice.typesAcceptes` porte alors `["quotient","composee"]`), et enfin le
 * paragraphe final f'(x) (`formatReponseAttendueCalculerLatex`).
 *
 * `regroupable: true` — les 3 conditions du contrat (`AdaptateurFeuilleExercices.regroupable`)
 * sont réunies ICI, à la différence de `limites` qui les décline explicitement : (1) consigne
 * générique et FIXE quelle que soit l'instance (`consigneGenerale()`, indépendante de la famille
 * tirée — contrairement à `limites` où rien ne change non plus, ce point était déjà correct pour ce
 * générateur) ; (2) une seule question par instance ; (3) aucun `enteteHtml`. Le piège qui a fait
 * décliner `regroupable` pour `limites` (son `enteteFragments` a structurellement besoin du mode
 * KaTeX DISPLAY pour empiler "lim"/la cible sous la fraction — voir son commentaire de tête) ne
 * s'applique PAS ici : le seul fragment KaTeX par instance est `f(x)=…` (`formatFDeXLatex`), qui
 * peut contenir une fraction (`\dfrac{…}{…}`, familles "quotient"/"reglebase" à exposant négatif/
 * "composee" à exposant négatif) — or `\dfrac` (contrairement à `\frac`) FORCE le style display de
 * la fraction quel que soit le mode KaTeX ambiant (inline ou display), c'est précisément sa raison
 * d'être dans ce projet (voir `formatCoeffNoyauLatex`/`formatDeriveeAtomeLatex`,
 * `generateurs5e/fonctionDerivee/index.ts`) : le rendu de `f(x)` reste donc visuellement identique,
 * que ce fragment soit rendu en mode entête (`{bloc:true}`, chemin non regroupé) ou en ligne de
 * tableau (chemin regroupé, `AppEvaluation5e.tsx::construireItemRegroupe`, SANS `{bloc:true}`) —
 * aucun risque de cassure/désempilement comparable au cas `\lim` de `limites`.
 */

const NOMBRE_LIGNES_PAR_FAMILLE: Record<ExerciceFonctionDerivee["famille"], number> = {
  reglebase: 3,
  produit: 4,
  quotient: 5,
  composee: 3,
};

function construireEnonceFonctionDerivee(exercice: ExerciceFonctionDerivee): SectionExercice {
  return {
    enteteFragments: [latex(formatFDeXLatex(exercice))],
    questions: [
      {
        consigne: [texte(consigneGenerale())],
        reponse: { type: "lignes", nombre: NOMBRE_LIGNES_PAR_FAMILLE[exercice.famille] },
      },
    ],
  };
}

function construireCorrectionFonctionDerivee(exercice: ExerciceFonctionDerivee): BlocCorrection[] {
  const blocs: BlocCorrection[] = [{ type: "paragraphe", fragments: [texte("Type reconnu : "), texte(texteReponseAttendueReconnaissance(exercice))] }];

  // Un paragraphe de décomposition par type accepté — vide (donc omis) pour "reglebase" ; DEUX
  // paragraphes (un par lecture) pour le cas ambigu "quotient"+"composee".
  for (const type of exercice.typesAcceptes) {
    const decomposition = formatTermesReponseAttendueDecomposerLatex(exercice, type);
    if (decomposition.length === 0) continue;
    const prefixe = exercice.typesAcceptes.length > 1 ? `Lecture « ${LIBELLE_TYPE[type]} » : ` : "";
    blocs.push({ type: "paragraphe", fragments: [texte(prefixe), latex(decomposition.join(" \\quad "))] });
  }

  blocs.push({ type: "paragraphe", fragments: [latex(formatReponseAttendueCalculerLatex(exercice))] });

  return blocs;
}

export const adaptateurEvaluationFonctionDerivee: AdaptateurFeuilleExercices<ExerciceFonctionDerivee> = {
  titreDocument: "Fonction dérivée — Évaluation",
  nomFichierBase: "fonction-derivee",
  genererInstance: genererExerciceFonctionDerivee,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceFonctionDerivee,
  construireCorrection: construireCorrectionFonctionDerivee,
  regroupable: true,
};
