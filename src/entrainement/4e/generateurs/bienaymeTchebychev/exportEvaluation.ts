import type {
  ExerciceBienaymeTchebychev,
  ExerciceBienaymeTchebychevIntervalleVersNombre,
  ExerciceBienaymeTchebychevIntervalleVersPourcent,
  ExerciceBienaymeTchebychevIntervalleVersSigma,
  ExerciceBienaymeTchebychevIntervalleVersXBar,
  ExerciceBienaymeTchebychevNombreVersIntervalle,
  ExerciceBienaymeTchebychevNombreVersSigma,
  ExerciceBienaymeTchebychevNombreVersXBar,
  ExerciceBienaymeTchebychevPourcentVersIntervalle,
} from "../../core/bienaymeTchebychev.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  formatEnonceSegments,
  formatIntervalleAttenduTexte,
  formatKAttenduTexte,
  formatNombreAttenduTexte,
  formatNombreLatex,
  formatPourcentAttenduTexte,
  formatPourcentDepuisNombreAttenduTexte,
  formatSigmaAttenduTexte,
  formatXBarAttenduTexte,
  PRECISION_K,
  PRECISION_POURCENT_INTERMEDIAIRE,
  PRECISION_UNITE,
  precisionPourcentFinal,
  texteAideIntervalleFinalNiveau1,
  texteAideKDepuisIntervalleNiveau1,
  texteAideKDepuisIntervalleNiveau2,
  texteAideKDepuisPourcentNiveau1,
  texteAideKDepuisPourcentNiveau2,
  texteAidePourcentNiveau1,
  texteAidePourcentNiveau2,
  texteAideSigmaNiveau1,
  texteAideSigmaNiveau2,
  texteAideXBarNiveau1,
  texteAideXBarNiveau2,
  type SegmentTexte,
} from "../../ui/formatBienaymeTchebychev";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceBienaymeTchebychev } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceBienaymeTchebychev>` pour gen37 (Inégalité de
 * Bienaymé-Tchebychev, `AppBienaymeTchebychev.tsx`) — voir `generateurs/analyseFonction/exportWord.ts`
 * pour le mécanisme générique de référence.
 *
 * **8 variantes structurellement différentes, une par construction directe de `generateurs/
 * bienaymeTchebychev/index.ts`** (jamais un tirage-puis-classification — voir le commentaire de tête
 * de ce fichier et de `core/bienaymeTchebychev.types.ts`) :
 * - `intervalleVersPourcent` (`construireIntervalleVersPourcent`) : x̄, σ, intervalle donnés → k →
 *   pourcentage minimal (arrondi vers le BAS, à l'unité).
 * - `pourcentVersIntervalle` (`construirePourcentVersIntervalle`) : x̄, σ, pourcentage minimal cible
 *   donnés → k → intervalle (bornes élargies vers l'extérieur, à l'unité).
 * - `intervalleVersNombre` (`construireIntervalleVersNombre`) : x̄, σ, n, intervalle donnés → k →
 *   pourcentage minimal intermédiaire (arrondi standard, 2 décimales) → nombre minimal d'individus
 *   (arrondi vers le BAS, à l'unité).
 * - `nombreVersIntervalle` (`construireNombreVersIntervalle`) : x̄, σ, n, nombre minimal donnés →
 *   pourcentage minimal (arrondi standard, 2 décimales) → k → intervalle (bornes élargies).
 * - `intervalleVersSigma` (`construireIntervalleVersSigma`) : x̄, intervalle, pourcentage minimal
 *   donnés → k → σ (arrondi standard, à l'unité).
 * - `intervalleVersXBar` (`construireIntervalleVersXBar`) : σ, intervalle, pourcentage minimal
 *   donnés → k → x̄ (arrondi standard, à l'unité).
 * - `nombreVersSigma` (`construireNombreVersSigma`) : x̄, intervalle, n, nombre minimal donnés →
 *   pourcentage minimal (arrondi standard) → k → σ (arrondi standard, à l'unité).
 * - `nombreVersXBar` (`construireNombreVersXBar`) : σ, intervalle, n, nombre minimal donnés →
 *   pourcentage minimal (arrondi standard) → k → x̄ (arrondi standard, à l'unité).
 *
 * `ExerciceBienaymeTchebychev` est une UNION discriminée sur `variante` (8 interfaces distinctes,
 * `core/bienaymeTchebychev.types.ts`), jamais un type unique aux champs optionnels — chaque
 * `construireCorrectionXxx`/étape ci-dessous est donc typée sur l'interface précise de la ou des
 * variantes qui la concernent (TypeScript garantit ainsi qu'aucun champ n'est lu sur une variante
 * qui ne le porte pas), et `construireEnonceBienaymeTchebychev`/`construireCorrectionBienaymeTchebychev`
 * dispatchent sur `instance.variante` avec un `switch` exhaustif (pas de `default`, erreur de
 * compilation si une variante est oubliée).
 *
 * PAS `regroupable` : au-delà du fait que les 8 variantes posent 8 tâches structurellement
 * différentes (donnée/inconnue échangées : k+intervalle→pourcentage pour l'une, k+pourcentage→
 * intervalle pour l'autre, etc. — voir `AdaptateurFeuilleExercices.regroupable` dans
 * `genererFeuilleExercices.ts`, qui exclut explicitement ce cas), la consigne de la question elle-
 * même (`construireConsigneTravail` ci-dessous) mentionne les valeurs tirées à chaque fois qu'une
 * étape intermédiaire "sans aide" (calcul du pourcentage depuis le nombre donné, V4/V7/V8, ou le
 * nombre d'individus final, V3) n'a pas de formule d'aide dédiée sur l'écran interactif et doit donc
 * être réexpliquée en toutes lettres — jamais une consigne GÉNÉRIQUE indépendante de l'instance,
 * même au sein d'une seule variante.
 *
 * **Énoncé (`enteteFragments`) : réutilise directement `formatEnonceSegments` (ui/
 * formatBienaymeTchebychev.ts), jamais réécrit** — c'est la même fonction qui alimente
 * `EnonceBienaymeTchebychev.tsx`, affichée sur TOUS les écrans de l'exercice interactif (règle
 * d'affichage transversale documentée en tête de ce fichier) : elle contient déjà, pour chacune des
 * 8 variantes, la bonne phrase distinguant ce qui est DONNÉ (x̄ et/ou σ, éventuellement le
 * pourcentage ou le nombre minimal cible) de ce qui est DEMANDÉ (la question finale, ex. "Quelle est
 * la proportion minimale... ?" pour V1 contre "Dans quel intervalle... ?" pour V2) — aucun risque de
 * divergence de formulation entre l'écran et la feuille imprimée. Seul le type des segments diffère
 * (`SegmentTexte` "texte"/"katex" côté écran vs `FragmentConsigne` "texte"/"latex" ici) : `versFragments`
 * ci-dessous fait la conversion 1-pour-1.
 *
 * **Consigne de travail (`questions[0].consigne`)** : une seule question par instance (une seule
 * inconnue finale par variante), qui ne répète jamais la question déjà posée dans `enteteFragments`
 * mais explicite la METHODE attendue (calculer k d'abord, puis la grandeur demandée) et les règles
 * d'arrondi EXACTEMENT celles appliquées à la génération (`generateurs/bienaymeTchebychev/arrondis.ts`
 * via les constantes `PRECISION_*`/`precisionPourcentFinal` de `ui/formatBienaymeTchebychev.ts`,
 * jamais une nouvelle tolérance réinventée ici).
 *
 * **Corrigé RESYNTHÉTISÉ en réutilisant les fonctions déjà utilisées côté écran interactif**, jamais
 * reconstruit indépendamment : les formules d'aide (`texteAideXxxNiveauN`, normalement révélées à
 * l'élève contre points) deviennent les étapes de calcul détaillées, et les valeurs finales
 * proviennent des fonctions `formatXxxAttenduTexte` du panneau de révélation
 * (`ResultatPanelBienaymeTchebychev.tsx`) — MÊME correspondance variante→formateur que ce composant :
 * `formatKAttenduTexte` (toutes), `formatPourcentAttenduTexte` (V1/V3), `formatIntervalleAttenduTexte`
 * (V2/V4), `formatNombreAttenduTexte` (V3), `formatPourcentDepuisNombreAttenduTexte` (V4/V7/V8),
 * `formatSigmaAttenduTexte` (V5/V7), `formatXBarAttenduTexte` (V6/V8). Ces fonctions portent déjà le
 * bon signe "=" vs "≈" (arrondi exact ou non, voir le commentaire de tête de
 * `ui/formatBienaymeTchebychev.ts`) — jamais recalculé ici. Les 2 étapes "pourcentage" SANS aide
 * dédiée sur l'écran interactif (pourcentage depuis le nombre donné pour V4/V7/V8 ; nombre minimal
 * d'individus final pour V3 — toutes deux documentées "AUCUNE aide" dans `core/
 * bienaymeTchebychev.types.ts`) sont les deux seuls endroits où une formule est écrite directement
 * ici plutôt qu'importée, en dupliquant fidèlement le calcul de `generateurs/bienaymeTchebychev/
 * index.ts` (`tirerNombreMinDonne`/`arrondiVersLeBas`), jamais une nouvelle logique.
 *
 * Pas de zone de réponse dédiée (`QuestionExercice.reponse` omis) : une seule question courte par
 * instance (une valeur numérique ou un intervalle à isoler), la ligne vierge par défaut
 * (`construireZoneReponse`, `export/genererFeuilleExercices.ts`) suffit — jamais un tableau ou un
 * bloc de plusieurs lignes qui suggérerait à tort un développement long comme pour "Analyse d'une
 * fonction"/"Simplification".
 */

/** Conversion 1-pour-1 `SegmentTexte` (écran, "texte"/"katex") → `FragmentConsigne` (papier,
 * "texte"/"latex") — mêmes deux variantes, seul le nom du type KaTeX diffère. */
function versFragments(segments: SegmentTexte[]): FragmentConsigne[] {
  return segments.map((segment) => (segment.type === "texte" ? texte(segment.valeur) : latex(segment.valeur)));
}

function construireEnonceBienaymeTchebychev(instance: ExerciceBienaymeTchebychev): SectionExercice {
  return {
    enteteFragments: versFragments(formatEnonceSegments(instance)),
    questions: [{ consigne: [texte(construireConsigneTravail(instance))] }],
  };
}

/** Consigne de méthode — jamais une répétition de la question (déjà dans `enteteFragments`), jamais
 * générique (mentionne les règles d'arrondi propres à la variante, elles-mêmes propres à chaque
 * inconnue finale — voir `arrondis.ts`). */
function construireConsigneTravail(instance: ExerciceBienaymeTchebychev): string {
  switch (instance.variante) {
    case "intervalleVersPourcent":
      return `Calcule k (${PRECISION_K}), puis le pourcentage minimal demandé (${PRECISION_UNITE}, vers le bas), en détaillant chaque étape.`;
    case "pourcentVersIntervalle":
      return `Calcule k (${PRECISION_K}), puis les bornes de l'intervalle demandé (arrondies à l'unité, élargies vers l'extérieur), en détaillant chaque étape.`;
    case "intervalleVersNombre":
      return `Calcule k (${PRECISION_K}), le pourcentage minimal intermédiaire (${PRECISION_POURCENT_INTERMEDIAIRE}), puis le nombre minimal d'individus demandé (${PRECISION_UNITE}, vers le bas), en détaillant chaque étape.`;
    case "nombreVersIntervalle":
      return `Calcule d'abord le pourcentage minimal correspondant au nombre donné (${PRECISION_POURCENT_INTERMEDIAIRE}), puis k (${PRECISION_K}), puis les bornes de l'intervalle demandé (arrondies à l'unité, élargies vers l'extérieur), en détaillant chaque étape.`;
    case "intervalleVersSigma":
      return `Calcule k (${PRECISION_K}), puis l'écart-type σ demandé (${PRECISION_UNITE}), en détaillant chaque étape.`;
    case "intervalleVersXBar":
      return `Calcule k (${PRECISION_K}), puis la moyenne x̄ demandée (${PRECISION_UNITE}), en détaillant chaque étape.`;
    case "nombreVersSigma":
      return `Calcule d'abord le pourcentage minimal correspondant au nombre donné (${PRECISION_POURCENT_INTERMEDIAIRE}), puis k (${PRECISION_K}), puis l'écart-type σ demandé (${PRECISION_UNITE}), en détaillant chaque étape.`;
    case "nombreVersXBar":
      return `Calcule d'abord le pourcentage minimal correspondant au nombre donné (${PRECISION_POURCENT_INTERMEDIAIRE}), puis k (${PRECISION_K}), puis la moyenne x̄ demandée (${PRECISION_UNITE}), en détaillant chaque étape.`;
  }
}

/** Rappel de l'inégalité — identique pour les 8 variantes, en tête de chaque corrigé. */
function introFragments(): FragmentConsigne[] {
  return [
    texte("D'après l'inégalité de Bienaymé-Tchebychev, au moins "),
    latex("1-\\dfrac{1}{k^2}"),
    texte(" de l'effectif se trouve dans l'intervalle "),
    latex("[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]"),
    texte(" (pour k > 1)."),
  ];
}

/** Étape "k depuis l'intervalle donné" (V1, V3) — mêmes formules que les aides de
 * `EtapeKDepuisIntervalle*.tsx` (formule non substituée puis équation substituée), résolues ici. */
function etapeKDepuisIntervalle(instance: ExerciceBienaymeTchebychevIntervalleVersPourcent | ExerciceBienaymeTchebychevIntervalleVersNombre): FragmentConsigne[] {
  const aide1 = texteAideKDepuisIntervalleNiveau1();
  const aide2 = texteAideKDepuisIntervalleNiveau2(instance);
  return [
    texte(`${aide1.texte} `),
    latex(aide1.latex),
    texte(" — équation avec les données de l'exercice : "),
    latex(aide2.latex),
    texte(` — on isole k : ${formatKAttenduTexte(instance)} (${PRECISION_K}).`),
  ];
}

/** Étape "k depuis le pourcentage donné" (V2, V4, V5, V6, V7, V8) — `pourcentAffiche` est le
 * pourcentage déjà connu à ce stade : donné directement en énoncé (V2/V5/V6, `pourcentDonne`) ou
 * lui-même déjà calculé à l'étape précédente (V4/V7/V8, `pourcentAttendu0`). */
function etapeKDepuisPourcent(instance: ExerciceBienaymeTchebychev, pourcentAffiche: number): FragmentConsigne[] {
  const aide1 = texteAideKDepuisPourcentNiveau1();
  const aide2 = texteAideKDepuisPourcentNiveau2(pourcentAffiche);
  return [
    texte(`${aide1.texte} `),
    latex(aide1.latex),
    texte(" — équation avec les données de l'exercice : "),
    latex(aide2.latex),
    texte(` — on isole k : ${formatKAttenduTexte(instance)} (${PRECISION_K}).`),
  ];
}

/** Étape "pourcentage minimal, final ou intermédiaire" (V1, V3) — à partir du k déjà isolé. */
function etapePourcentFinal(
  instance: ExerciceBienaymeTchebychevIntervalleVersPourcent | ExerciceBienaymeTchebychevIntervalleVersNombre,
  variante: "intervalleVersPourcent" | "intervalleVersNombre",
): FragmentConsigne[] {
  const aide1 = texteAidePourcentNiveau1();
  const aide2 = texteAidePourcentNiveau2(instance.kAttendu);
  return [
    texte(`${aide1.texte} `),
    latex(aide1.latex),
    texte(" — formule substituée avec le k trouvé ci-dessus : "),
    latex(aide2.latex),
    texte(` — le pourcentage minimal garanti est donc ${formatPourcentAttenduTexte(instance)} (${precisionPourcentFinal(variante)}${variante === "intervalleVersPourcent" ? ", vers le bas" : ""}).`),
  ];
}

/** Étape "nombre minimal d'individus" (V3 uniquement, écran final SANS aide sur l'écran interactif
 * — voir le commentaire de tête) : nMinAttendu = ⌊pourcentAttendu / 100 × n⌋, dupliquant fidèlement
 * `arrondiVersLeBas((pourcentAttendu / 100) * n)` de `generateurs/bienaymeTchebychev/index.ts`. */
function etapeNombreFinal(instance: ExerciceBienaymeTchebychevIntervalleVersNombre): FragmentConsigne[] {
  return [
    texte("Nombre minimal d'individus : "),
    latex(`\\dfrac{${formatNombreLatex(instance.pourcentAttendu)}}{100}\\times ${formatNombreLatex(instance.n)}`),
    texte(` — arrondi vers le bas à l'entier inférieur : ${formatNombreAttenduTexte(instance.nMinAttendu)}.`),
  ];
}

/** Étape "pourcentage minimal correspondant au nombre donné" (V4, V7, V8 — écran 0, SANS aide sur
 * l'écran interactif) : pourcentAttendu0 = arrondi2(100 × nombreMinDonne / n), dupliquant fidèlement
 * `generateurs/bienaymeTchebychev/index.ts`. */
function etapePourcentDepuisNombre(
  instance: ExerciceBienaymeTchebychevNombreVersIntervalle | ExerciceBienaymeTchebychevNombreVersSigma | ExerciceBienaymeTchebychevNombreVersXBar,
): FragmentConsigne[] {
  return [
    texte("Pourcentage minimal correspondant au nombre donné : "),
    latex(`\\dfrac{100\\times ${formatNombreLatex(instance.nombreMinDonne)}}{${formatNombreLatex(instance.n)}}`),
    texte(` ${formatPourcentDepuisNombreAttenduTexte(instance)} (${PRECISION_POURCENT_INTERMEDIAIRE}).`),
  ];
}

/** Étape "intervalle final" (V2, V4) — bornes élargies vers l'extérieur à partir du k déjà isolé. */
function etapeIntervalleFinal(instance: ExerciceBienaymeTchebychevPourcentVersIntervalle | ExerciceBienaymeTchebychevNombreVersIntervalle): FragmentConsigne[] {
  const aide1 = texteAideIntervalleFinalNiveau1();
  return [
    texte(`${aide1.texte} `),
    latex(aide1.latex),
    texte(` — l'intervalle garanti est donc ${formatIntervalleAttenduTexte(instance)} (${PRECISION_UNITE}, bornes élargies vers l'extérieur).`),
  ];
}

/** Étape "écart-type σ retrouvé" (V5, V7) — équation substituée avec le k déjà isolé et la borne
 * connue, non résolue par l'aide (l'élève isole encore σ) ; résolue ici pour le corrigé. */
function etapeSigma(instance: ExerciceBienaymeTchebychevIntervalleVersSigma | ExerciceBienaymeTchebychevNombreVersSigma): FragmentConsigne[] {
  const aide1 = texteAideSigmaNiveau1();
  const aide2 = texteAideSigmaNiveau2(instance);
  return [
    texte(`${aide1.texte} `),
    latex(aide1.latex),
    texte(" — équation avec le k trouvé ci-dessus et la borne connue : "),
    latex(aide2.latex),
    texte(` — on isole σ : ${formatSigmaAttenduTexte(instance)} (${PRECISION_UNITE}).`),
  ];
}

/** Étape "moyenne x̄ retrouvée" (V6, V8) — même principe en miroir que `etapeSigma`. */
function etapeXBar(instance: ExerciceBienaymeTchebychevIntervalleVersXBar | ExerciceBienaymeTchebychevNombreVersXBar): FragmentConsigne[] {
  const aide1 = texteAideXBarNiveau1();
  const aide2 = texteAideXBarNiveau2(instance);
  return [
    texte(`${aide1.texte} `),
    latex(aide1.latex),
    texte(" — équation avec le k trouvé ci-dessus et la borne connue : "),
    latex(aide2.latex),
    texte(` — on isole x̄ : ${formatXBarAttenduTexte(instance)} (${PRECISION_UNITE}).`),
  ];
}

function construireCorrectionBienaymeTchebychev(instance: ExerciceBienaymeTchebychev): BlocCorrection[] {
  const intro: BlocCorrection = { type: "paragraphe", fragments: introFragments() };

  switch (instance.variante) {
    case "intervalleVersPourcent":
      return [
        intro,
        { type: "paragraphe", fragments: etapeKDepuisIntervalle(instance) },
        { type: "paragraphe", fragments: etapePourcentFinal(instance, "intervalleVersPourcent") },
      ];
    case "pourcentVersIntervalle":
      return [
        intro,
        { type: "paragraphe", fragments: etapeKDepuisPourcent(instance, instance.pourcentDonne) },
        { type: "paragraphe", fragments: etapeIntervalleFinal(instance) },
      ];
    case "intervalleVersNombre":
      return [
        intro,
        { type: "paragraphe", fragments: etapeKDepuisIntervalle(instance) },
        { type: "paragraphe", fragments: etapePourcentFinal(instance, "intervalleVersNombre") },
        { type: "paragraphe", fragments: etapeNombreFinal(instance) },
      ];
    case "nombreVersIntervalle":
      return [
        intro,
        { type: "paragraphe", fragments: etapePourcentDepuisNombre(instance) },
        { type: "paragraphe", fragments: etapeKDepuisPourcent(instance, instance.pourcentAttendu0) },
        { type: "paragraphe", fragments: etapeIntervalleFinal(instance) },
      ];
    case "intervalleVersSigma":
      return [
        intro,
        { type: "paragraphe", fragments: etapeKDepuisPourcent(instance, instance.pourcentDonne) },
        { type: "paragraphe", fragments: etapeSigma(instance) },
      ];
    case "intervalleVersXBar":
      return [
        intro,
        { type: "paragraphe", fragments: etapeKDepuisPourcent(instance, instance.pourcentDonne) },
        { type: "paragraphe", fragments: etapeXBar(instance) },
      ];
    case "nombreVersSigma":
      return [
        intro,
        { type: "paragraphe", fragments: etapePourcentDepuisNombre(instance) },
        { type: "paragraphe", fragments: etapeKDepuisPourcent(instance, instance.pourcentAttendu0) },
        { type: "paragraphe", fragments: etapeSigma(instance) },
      ];
    case "nombreVersXBar":
      return [
        intro,
        { type: "paragraphe", fragments: etapePourcentDepuisNombre(instance) },
        { type: "paragraphe", fragments: etapeKDepuisPourcent(instance, instance.pourcentAttendu0) },
        { type: "paragraphe", fragments: etapeXBar(instance) },
      ];
  }
}

export const adaptateurEvaluationBienaymeTchebychev: AdaptateurFeuilleExercices<ExerciceBienaymeTchebychev> = {
  titreDocument: "Inégalité de Bienaymé-Tchebychev — Évaluation",
  nomFichierBase: "bienayme-tchebychev",
  genererInstance: genererExerciceBienaymeTchebychev,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceBienaymeTchebychev,
  construireCorrection: construireCorrectionBienaymeTchebychev,
  // 8 variantes structurellement différentes (donnée/inconnue échangées), consigne dépendante de
  // l'instance à chaque fois qu'une étape "sans aide" doit être réexpliquée — jamais une consigne
  // générique : voir le commentaire de tête.
};
