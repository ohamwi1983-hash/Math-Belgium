import type { ExerciceUnSansLautre } from "../../core/unSansLautre.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  formatCarreCibleLatex,
  formatCarreLatex,
  formatFonctionCibleLatex,
  formatIntervalleLatex,
  formatSigneCibleLatex,
  formatValeurCibleSimplifieeLatex,
  formatValeurConnueLatex,
  formatValeurTangenteSimplifieeLatex,
  libelleQuadrantUnSansLautre,
} from "../../ui/formatUnSansLautre";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceUnSansLautre } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceUnSansLautre>` pour gen16 ("L'un sans l'autre",
 * chapitre 3, `AppUnSansLautre.tsx`/`moteur/sessionUnSansLautre.ts`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence. Couvre la
 * section "Identité fondamentale (sin²+cos²=1)" du chapitre Math-Belgium 4e "Cercle trigonométrique
 * & triangles quelconques" (`src/content/chapters/4e/cercle-trigonometrique-triangles.ts`, section
 * `identite`), qui renvoie déjà vers ce générateur.
 *
 * **Écran → question, mapping 1-pour-1, TOUJOURS les 3 mêmes écrans dans le même ordre**
 * (`sessionUnSansLautre.ts` — phases fixes `carre` → `valeurSignee` → `tangente`, jamais
 * réordonnées ni omises) :
 *  - a) écran "Carré" (`EtapeCarreUnSansLautre.tsx`) : valeur de `fonctionCible²` (sin²θ ou cos²θ),
 *    obtenue via l'identité fondamentale cos²θ+sin²θ=1 appliquée à la valeur connue ;
 *  - b) écran "Valeur signée" (`EtapeValeurSigneeUnSansLautre.tsx`) : valeur SIGNÉE de
 *    `fonctionCible` (sinθ ou cosθ), le signe étant tranché par le quadrant donné dans l'intervalle
 *    sur θ (jamais par la racine carrée elle-même, toujours positive) ;
 *  - c) écran "Tangente" (`EtapeTangenteUnSansLautre.tsx`) : tanθ = sinθ/cosθ, à partir des deux
 *    valeurs désormais connues.
 * Chaque écran réaffiche cumulativement le bloc énoncé ET les résultats déjà confirmés des écrans
 * précédents (jamais la saisie de l'élève — toujours des valeurs déjà connues de `instance`,
 * cf. les composants `Etape*UnSansLautre.tsx` cités) ; sur la feuille imprimée, ce même contenu
 * (valeur connue + intervalle sur θ) est affiché UNE SEULE FOIS en tête d'exercice
 * (`enteteFragments`), commun aux 3 questions, plutôt que répété à chaque question.
 *
 * **PAS `regroupable`** : 3 questions par instance (jamais une seule) — hors du cas d'usage de ce
 * flag par construction, qui exige une question UNIQUE par instance (voir sa doc dans
 * `genererFeuilleExercices.ts`). Par ailleurs les 3 consignes ci-dessous intègrent chacune une
 * expression LaTeX qui dépend de `fonctionCible` (donc de la variante `cos`/`sin` tirée, ex.
 * `\sin^2\theta` vs `\cos^2\theta`) — jamais une constante `CONSIGNE_GENERALE` indépendante de
 * l'instance, deuxième raison indépendante d'exclure `regroupable` même si ce générateur n'avait eu
 * qu'une seule question.
 *
 * **Corrigé RESYNTHÉTISÉ** depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`carreCibleNum`/`carreCibleDen`, `signeCible`, `valeurCible`, `tanValeur`), jamais recalculé
 * indépendamment : réutilise directement les formateurs déjà utilisés côté écran interactif
 * (`ui/formatUnSansLautre.ts` — `formatCarreCibleLatex` pour la réponse exacte de l'écran "Carré",
 * `formatValeurCibleSimplifieeLatex` pour la forme simplifiée de référence de l'écran "Valeur
 * signée" — déjà celle affichée en cas de révélation — et `formatValeurTangenteSimplifieeLatex`
 * pour celle de l'écran "Tangente") plutôt que d'en reconstruire de nouvelles. Les 2 aides visuelles
 * de `sessionUnSansLautre.ts` (l'identité `cos²θ+sin²θ=1` réécrite pour l'écran "Carré", le signe
 * déduit du quadrant pour l'écran "Valeur signée", la formule `tanθ=sinθ/cosθ` pour l'écran
 * "Tangente") sont déjà purement des rappels de méthode SANS texte à concaténer (même situation que
 * `analyseFonction/exportWord.ts` — voir son commentaire de tête) : elles sont donc réintégrées
 * telles quelles, en toutes lettres, dans le texte de résolution ci-dessous plutôt que révélées
 * séparément.
 *
 * **Pas de zone de réponse dédiée** (`QuestionExercice.reponse` omis sur les 3 questions) : chaque
 * question attend une seule valeur numérique/algébrique courte (un carré, une valeur signée, une
 * tangente), jamais un développement long ni un tableau — la ligne vierge par défaut
 * (`construireZoneReponse`, `export/genererFeuilleExercices.ts`) suffit, même choix que
 * `bienaymeTchebychev/exportEvaluation.ts` pour la même raison.
 */

function construireEnonceUnSansLautre(instance: ExerciceUnSansLautre): SectionExercice {
  return {
    enteteFragments: [texte("On donne "), latex(formatValeurConnueLatex(instance)), texte(", avec "), latex(formatIntervalleLatex(instance)), texte(".")],
    questions: [
      { consigne: [texte("Calcule "), latex(formatCarreLatex(instance.fonctionCible)), texte(".")] },
      { consigne: [texte("Déduis-en la valeur (signée) de "), latex(formatFonctionCibleLatex(instance)), texte(".")] },
      { consigne: [texte("Calcule "), latex("\\tan\\theta"), texte(".")] },
    ],
  };
}

function construireCorrectionUnSansLautre(instance: ExerciceUnSansLautre): BlocCorrection[] {
  const { fonctionConnue, fonctionCible, quadrant, p, q, carreCibleNum, carreCibleDen } = instance;

  const blocs: BlocCorrection[] = [];

  blocs.push({
    type: "paragraphe",
    fragments: [
      texte("a) L'identité fondamentale "),
      latex("\\cos^2\\theta + \\sin^2\\theta = 1"),
      texte(" donne "),
      latex(
        `${formatCarreLatex(fonctionCible)} = 1 - ${formatCarreLatex(fonctionConnue)} = 1 - \\frac{${p}^2}{${q}^2} = \\frac{${carreCibleNum}}{${carreCibleDen}}`,
      ),
      texte("."),
    ],
  });

  blocs.push({
    type: "paragraphe",
    fragments: [
      texte("b) "),
      latex(`${formatFonctionCibleLatex(instance)} = \\pm\\sqrt{${formatCarreCibleLatex(instance)}} = \\pm\\dfrac{\\sqrt{${carreCibleNum}}}{${q}}`),
      texte(`. Puisque θ appartient au quadrant ${libelleQuadrantUnSansLautre(quadrant)}, `),
      latex(formatSigneCibleLatex(instance)),
      texte(", donc "),
      latex(`${formatFonctionCibleLatex(instance)} = ${formatValeurCibleSimplifieeLatex(instance)}`),
      texte("."),
    ],
  });

  blocs.push({
    type: "paragraphe",
    fragments: [texte("c) "), latex(`\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta} = ${formatValeurTangenteSimplifieeLatex(instance)}`), texte(".")],
  });

  return blocs;
}

export const adaptateurEvaluationUnSansLautre: AdaptateurFeuilleExercices<ExerciceUnSansLautre> = {
  titreDocument: "Identité fondamentale (sin²θ + cos²θ = 1) — Évaluation",
  nomFichierBase: "un-sans-lautre-identite-fondamentale",
  genererInstance: genererExerciceUnSansLautre,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceUnSansLautre,
  construireCorrection: construireCorrectionUnSansLautre,
};
