import type { ExerciceMediane, ExerciceMedianeClasses, ExerciceMedianeDiscrete } from "../../core/mediane.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, EnoncePapier, EtapeCorrection, ErreurFrequente, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  LABEL_EFFECTIF_CUMULE_VI,
  LABEL_EFFECTIF_NI,
  LABEL_VALEUR_XI,
  consigneMedianeDiscrete,
  consigneMinMaxMode,
  consigneQ1,
  consigneQ3,
  consigneSynthese,
  effectifMaximalMinMaxMode,
  effectifMaximalSynthese,
  formatClasseTexte,
  formatEnonceTexte,
  formatFormuleInterpolationLatex,
  libellePrecisionLecture,
  pointsEncadresLecture,
} from "../../ui/formatMediane";
import { precisionLecture, seuilLecture, valeurCibleLecture, type ParametreLecture } from "../../moteur/verificationMediane";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceMediane } from "./index";
import { avecVirgulesBelges, nombreFr, nombreFrLatex, segmentEnVirgules } from "../../ui/nombreFr";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceMediane>` pour gen33 (« Médiane, quartiles et
 * mode » côté Math-Belgium — renommé « Paramètres de position » à l'écran, voir l'en-tête de
 * `core/mediane.types.ts` ; les identifiants de code internes, ce fichier compris, restent
 * inchangés) — voir `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de
 * référence. Couvre la SEULE section "Médiane, quartiles et mode" du chapitre "Statistique
 * descriptive à une variable" (4e) — médiane, Q1/Q3 ET mode y sont tous les trois pilotés par ce
 * seul générateur (`src/content/chapters/4e/statistique-descriptive.ts`, section `position`),
 * jamais 3 générateurs séparés.
 *
 * **Screen → question mapping, variante `"discrete"`** (`moteur/sessionMediane.ts` :
 * `mediane → q1 → q3 → minMaxMode`, ce dernier terminal) — 4 écrans regroupés en 3 questions
 * papier COHÉRENTES (même principe de consolidation que `simplification/exportEvaluation.ts`,
 * qui regroupe déjà 2 à 9 micro-écrans en 3 questions) :
 * - a) écran "mediane" tel quel (seuil n/2 puis médiane Q2).
 * - b) écrans "q1"+"q3" FUSIONNÉS en une seule question (même tableau, même méthode, seule la
 *   valeur du seuil change — les séparer en 2 questions aurait été une répétition pure).
 * - c) écran "minMaxMode" tel quel (minimum, maximum, mode(s)).
 * Consignes RÉUTILISÉES verbatim depuis `ui/formatMediane.ts` (`consigneMedianeDiscrete`/
 * `consigneQ1`/`consigneQ3`/`consigneMinMaxMode`) — mêmes fonctions déjà utilisées à l'écran, donc
 * jamais de divergence de formulation entre `/genN` et la feuille imprimée (même principe de
 * réutilisation que `simplification/exportEvaluation.ts` avec `ui/formatSimplification.ts`).
 *
 * **Screen → question mapping, variante `"classes"`** (`mediane.types.ts`/`sessionMediane.ts` :
 * `polygone → lectureMediane → lectureQ1 → lectureQ3 → synthese`, ce dernier terminal) — 5 écrans
 * regroupés en 3 questions, avec UNE décision de fond documentée ci-dessous :
 * - **L'écran "polygone" n'a PAS de question papier dédiée.** Ce n'est pas un oubli : ce n'est
 *   PAS un écran de calcul (aucune saisie libre, un point par classe DÉPLACÉ sur un graphe Mafs,
 *   vérifié par égalité stricte de coordonnées, `evaluerPolygone`) — construire un polygone sur
 *   une feuille imprimée supposerait de fournir un système d'axes gradué, une brique absente du
 *   pipeline d'export actuel (contrairement à `caracteristiquesFonction/exportEvaluation.ts`, qui
 *   fournit un `enteteHtml` pour un graphique déjà DONNÉ à lire, jamais à construire). Comme pour
 *   les aides purement visuelles de gen7 (voir l'en-tête d'`analyseFonction/exportWord.ts`), le
 *   contenu mathématique réel de cet écran — lire Q1/médiane/Q3 par interpolation linéaire sur le
 *   polygone des effectifs cumulés — est intégralement RESYNTHÉTISÉ dans les questions a/b
 *   ci-dessous, sous forme d'un calcul direct par la formule d'interpolation plutôt que d'une
 *   lecture graphique. La tolérance de lecture graphique (`precisionLecture(etendue)`,
 *   `verificationMediane.ts`) reste réutilisée telle quelle pour formuler l'arrondi attendu
 *   (`libellePrecisionLecture`) — jamais un calcul exact au-delà de ce palier, cohérent avec le
 *   fait que la cible `mediane`/`q1`/`q3` de l'instance est elle-même déjà arrondie à ce palier
 *   (`arrondirSelonPrecisionLecture`, `generateurs/mediane/index.ts`).
 * - a) écrans "lectureMediane" (seuil n/2, interpolation → médiane Q2).
 * - b) écrans "lectureQ1"+"lectureQ3" FUSIONNÉS (même principe que la variante "discrete").
 * - c) écran "synthese" tel quel (xMin, xMax, étendue, classe modale, mode = centre de la classe
 *   modale) — consigne réutilisée verbatim (`consigneSynthese`).
 * Le détail du calcul (segment d'interpolation `x_inf`/`x_sup`/`v_inf`/`v_sup`, formule) est
 * RESYNTHÉTISÉ dans la correction via les utilitaires déjà exposés par `ui/formatMediane.ts`
 * (`pointsEncadresLecture`, `formatFormuleInterpolationLatex`, eux-mêmes bâtis sur la géométrie
 * pure de `ui/lectureQuartileGraph.ts`) — jamais un second calcul indépendant de ces bornes.
 *
 * **PAS `regroupable`** : chaque instance produit 3 questions (jamais une seule), et la consigne
 * de chacune dépend de l'instance tirée (mentionne `contexte.unite`, variable d'un contexte à
 * l'autre de la banque partagée avec "Inégalité de Bienaymé-Tchebychev") — aucune des 2 conditions
 * requises par `AdaptateurFeuilleExercices.regroupable` (voir sa doc dans
 * `genererFeuilleExercices.ts`) n'est réunie, même conclusion et même raisonnement que
 * `simplification/exportEvaluation.ts`.
 *
 * **Table de données DONNÉE (x_i/n_i/v_i, ou Classe/n_i/v_i) affichée dans l'énoncé** : le
 * contrat `SectionExercice` n'offre aucune primitive de "tableau déjà rempli" côté énoncé (`type:
 * "tableau"` n'existe que pour `ZoneReponse`, vierge, et `BlocCorrection`, côté corrigé — voir
 * `genererFeuilleExercices.ts`) ; `enteteHtml` existe mais n'est rendu QUE par le pipeline HTML de
 * l'évaluation, jamais par Word/PDF (voir sa doc). La table est donc composée comme UNE formule
 * KaTeX `\begin{array}{c|ccc...}` (un fragment `latex()` unique dans `enteteFragments`, rendu par
 * les 3 pipelines Word/PDF/HTML sans distinction) — même technique déjà utilisée ailleurs dans le
 * projet pour une petite table de données (`ui6e/formatVariablesDiscretesEsperance.ts::tableLoiLatexA`,
 * table x_i/p_i). Orientation CHOISIE : grandeurs en LIGNES (x_i ou Classe, n_i, v_i), valeurs en
 * COLONNES — même convention que `analyseFonction/exportWord.ts`/`tableauFrequences/exportEvaluation.ts`
 * pour une table de ce type, la plus lisible sur une feuille imprimée.
 *
 * **Corrigé RESYNTHÉTISÉ** depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`lignes[indexMediane/indexQ1/indexQ3]`, `min`/`max`/`modes` pour "discrete" ;
 * `mediane`/`q1`/`q3`/`xMin`/`xMax`/`etendue`/`indexClasseModale`/`modeCentreClasseModale` pour
 * "classes"), jamais un second calcul indépendant — même principe que tous les adaptateurs
 * existants. Chaque question se termine par un bloc `type: "tableau"` récapitulant les valeurs
 * finales (une ligne par grandeur, une seule colonne) — lisible en un coup d'œil pour la
 * correction, même esprit que la table de vérification finale de `tableauFrequences/exportEvaluation.ts`.
 */

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

// ============================================================================
// Table de données DONNÉE — un unique fragment KaTeX `\begin{array}` (voir en-tête de fichier).
// ============================================================================

function tableauDonneesLatexDiscrete(instance: ExerciceMedianeDiscrete): string {
  const colonnes = "c".repeat(instance.lignes.length);
  const ligneX = instance.lignes.map((l) => formatNombre(l.valeur)).join(" & ");
  const ligneN = instance.lignes.map((l) => formatNombre(l.effectif)).join(" & ");
  const ligneV = instance.lignes.map((l) => formatNombre(l.effectifCumule)).join(" & ");
  return `\\begin{array}{c|${colonnes}}${LABEL_VALEUR_XI} & ${ligneX}\\\\\\hline ${LABEL_EFFECTIF_NI} & ${ligneN}\\\\\\hline ${LABEL_EFFECTIF_CUMULE_VI} & ${ligneV}\\end{array}`;
}

function tableauDonneesLatexClasses(instance: ExerciceMedianeClasses): string {
  const colonnes = "c".repeat(instance.classes.length);
  const ligneClasse = instance.classes.map((_, i) => `\\text{${formatClasseTexte(instance, i)}}`).join(" & ");
  const ligneN = instance.classes.map((c) => formatNombre(c.effectif)).join(" & ");
  const ligneV = instance.classes.map((c) => formatNombre(c.effectifCumule)).join(" & ");
  return `\\begin{array}{c|${colonnes}}\\text{Classe} & ${ligneClasse}\\\\\\hline ${LABEL_EFFECTIF_NI} & ${ligneN}\\\\\\hline ${LABEL_EFFECTIF_CUMULE_VI} & ${ligneV}\\end{array}`;
}

// ============================================================================
// Variante "discrete" — 3 questions (mediane ; q1+q3 fusionnés ; minMaxMode).
// ============================================================================

function construireEnonceDiscrete(instance: ExerciceMedianeDiscrete): SectionExercice {
  return {
    enteteFragments: [texte(formatEnonceTexte(instance)), latex(tableauDonneesLatexDiscrete(instance))],
    questions: [
      { consigne: [texte(consigneMedianeDiscrete(instance))] },
      { consigne: [texte(`${consigneQ1(instance)} ${consigneQ3(instance)}`)] },
      { consigne: [texte(consigneMinMaxMode(instance))] },
    ],
  };
}

/** Fragments "seuil = ... → première valeur retenue" pour un écran seuil+valeur de la variante
 * "discrete" ("mediane"/"q1"/"q3") — la RÈGLE (première valeur dont l'effectif cumulé dépasse
 * STRICTEMENT le seuil) est déjà appliquée par `generateurs/mediane/index.ts` : ce fragment se
 * contente d'exposer la ligne déjà retenue (`indexMediane`/`indexQ1`/`indexQ3`), jamais de la
 * recalculer. */
function fragmentSeuilValeurDiscrete(labelFormule: string, seuil: number, ligne: { valeur: number; effectifCumule: number }, symboleLatex: string, unite: string): FragmentConsigne[] {
  return [
    texte(`Seuil ${labelFormule} = ${formatNombre(seuil)}. La première valeur du tableau dont l'effectif cumulé dépasse strictement ce seuil est `),
    latex(`x = ${formatNombre(ligne.valeur)}`),
    texte(` (effectif cumulé ${formatNombre(ligne.effectifCumule)}), donc `),
    latex(`${symboleLatex} = ${formatNombre(ligne.valeur)}`),
    texte(` ${unite}.`),
  ];
}

function construireCorrectionDiscrete(instance: ExerciceMedianeDiscrete): BlocCorrection[] {
  const unite = instance.contexte.unite;
  const ligneMediane = instance.lignes[instance.indexMediane];
  const ligneQ1 = instance.lignes[instance.indexQ1];
  const ligneQ3 = instance.lignes[instance.indexQ3];
  const modesTexte = instance.modes.map((m) => formatNombre(m)).join(", ");
  const effectifMax = effectifMaximalMinMaxMode(instance);

  const blocs: BlocCorrection[] = [
    { type: "paragraphe", fragments: [texte("a) "), ...fragmentSeuilValeurDiscrete("n/2", instance.seuil, ligneMediane, "Q_2", unite)] },
    {
      type: "paragraphe",
      fragments: [
        texte("b) "),
        ...fragmentSeuilValeurDiscrete("n/4", instance.seuilQ1, ligneQ1, "Q_1", unite),
        texte(" "),
        ...fragmentSeuilValeurDiscrete("3n/4", instance.seuilQ3, ligneQ3, "Q_3", unite),
      ],
    },
    {
      type: "paragraphe",
      fragments: [
        texte(
          `c) Minimum = ${formatNombre(instance.min)} ${unite}, maximum = ${formatNombre(instance.max)} ${unite}. L'effectif maximal du tableau vaut ${effectifMax}, ` +
            `atteint par ${modesTexte} — donc mode(s) = ${modesTexte} ${unite}.`,
        ),
      ],
    },
    {
      type: "tableau",
      libellesLignes: ["Médiane (Q2)", "Q1", "Q3", "Minimum", "Maximum", "Mode(s)"],
      valeursParLigne: [
        [`${formatNombre(instance.mediane)} ${unite}`],
        [`${formatNombre(instance.q1)} ${unite}`],
        [`${formatNombre(instance.q3)} ${unite}`],
        [`${formatNombre(instance.min)} ${unite}`],
        [`${formatNombre(instance.max)} ${unite}`],
        [`${modesTexte} ${unite}`],
      ],
    },
  ];

  return blocs;
}

// ============================================================================
// Variante "classes" — 3 questions (mediane par interpolation ; q1+q3 par interpolation ;
// synthese). Voir en-tête de fichier pour la décision "pas de question polygone".
// ============================================================================

function consigneMedianeClasses(instance: ExerciceMedianeClasses): string {
  const precision = precisionLecture(instance.etendue);
  return `Calcule le seuil n/2, puis détermine par interpolation linéaire la médiane Q2 (en ${instance.contexte.unite}, ${libellePrecisionLecture(precision)}).`;
}

function consigneQ1Q3Classes(instance: ExerciceMedianeClasses): string {
  const precision = precisionLecture(instance.etendue);
  return `Calcule les seuils n/4 et 3n/4, puis détermine par interpolation linéaire Q1 et Q3 (en ${instance.contexte.unite}, ${libellePrecisionLecture(precision)}).`;
}

function construireEnonceClasses(instance: ExerciceMedianeClasses): SectionExercice {
  return {
    enteteFragments: [texte(formatEnonceTexte(instance)), latex(tableauDonneesLatexClasses(instance))],
    questions: [
      { consigne: [texte(consigneMedianeClasses(instance))] },
      { consigne: [texte(consigneQ1Q3Classes(instance))] },
      { consigne: [texte(consigneSynthese(instance))] },
    ],
  };
}

/** Fragments du calcul d'interpolation complet pour un paramètre ("mediane"/"q1"/"q3") de la
 * variante "classes" — segment `x_inf`/`v_inf`/`x_sup`/`v_sup` retrouvé via `pointsEncadresLecture`
 * (`ui/formatMediane.ts`, lui-même bâti sur `ui/lectureQuartileGraph.ts::pointsEncadrementSeuil`,
 * même règle stricte `>` que la Couche A) puis la formule d'interpolation elle-même
 * (`formatFormuleInterpolationLatex`) appliquée à la cible déjà arrondie de l'instance
 * (`valeurCibleLecture`) — jamais un second calcul indépendant de ces valeurs. */
function fragmentInterpolation(instance: ExerciceMedianeClasses, parametre: ParametreLecture): FragmentConsigne[] {
  const unite = instance.contexte.unite;
  const seuil = seuilLecture(instance, parametre);
  const { inf, sup } = pointsEncadresLecture(instance, parametre);
  const cible = valeurCibleLecture(instance, parametre);
  const precision = precisionLecture(instance.etendue);
  return [
    texte(`Seuil = ${formatNombre(seuil)}. Segment d'interpolation : `),
    latex(`x_{inf}=${formatNombre(inf.x)}`),
    texte(", "),
    latex(`v_{inf}=${formatNombre(inf.y)}`),
    texte(", "),
    latex(`x_{sup}=${formatNombre(sup.x)}`),
    texte(", "),
    latex(`v_{sup}=${formatNombre(sup.y)}`),
    texte(". "),
    latex(formatFormuleInterpolationLatex(parametre)),
    texte(` ≈ ${formatNombre(cible)} ${unite} (${libellePrecisionLecture(precision)}).`),
  ];
}

function construireCorrectionClasses(instance: ExerciceMedianeClasses): BlocCorrection[] {
  const unite = instance.contexte.unite;
  const classeModaleTexte = formatClasseTexte(instance, instance.indexClasseModale);
  const effectifMax = effectifMaximalSynthese(instance);

  const blocs: BlocCorrection[] = [
    { type: "paragraphe", fragments: [texte("a) "), ...fragmentInterpolation(instance, "mediane")] },
    {
      type: "paragraphe",
      fragments: [texte("b) Q1 : "), ...fragmentInterpolation(instance, "q1"), texte(" Q3 : "), ...fragmentInterpolation(instance, "q3")],
    },
    {
      type: "paragraphe",
      fragments: [
        texte(
          `c) xmin = ${formatNombre(instance.xMin)} ${unite}, xmax = ${formatNombre(instance.xMax)} ${unite}, étendue = ${formatNombre(instance.etendue)} ${unite}. ` +
            `L'effectif maximal du tableau vaut ${effectifMax}, atteint par la classe ${classeModaleTexte} : mode = centre de cette classe = ${formatNombre(instance.modeCentreClasseModale)} ${unite}.`,
        ),
      ],
    },
    {
      type: "tableau",
      libellesLignes: ["Médiane (Q2)", "Q1", "Q3", "xmin", "xmax", "Étendue", "Classe modale", "Mode"],
      valeursParLigne: [
        [`${formatNombre(instance.mediane)} ${unite}`],
        [`${formatNombre(instance.q1)} ${unite}`],
        [`${formatNombre(instance.q3)} ${unite}`],
        [`${formatNombre(instance.xMin)} ${unite}`],
        [`${formatNombre(instance.xMax)} ${unite}`],
        [`${formatNombre(instance.etendue)} ${unite}`],
        [classeModaleTexte],
        [`${formatNombre(instance.modeCentreClasseModale)} ${unite}`],
      ],
    },
  ];

  return blocs;
}

// ============================================================================
// Dispatch — les 2 variantes partagent le même contrat `ExerciceMediane`.
// ============================================================================

function construireEnonceMediane(instance: ExerciceMediane): SectionExercice {
  return instance.variante === "discrete" ? construireEnonceDiscrete(instance) : construireEnonceClasses(instance);
}

function construireCorrectionMediane(instance: ExerciceMediane): BlocCorrection[] {
  return instance.variante === "discrete" ? construireCorrectionDiscrete(instance) : construireCorrectionClasses(instance);
}

// ============================================================================
// Feuilles enrichies (énoncé papier, réponse brève, corrigé détaillé, barème) — voir
// `.claude/rules/feuilles-evaluations.md`. Les étapes du corrigé sont les 3 questions de
// `construireEnonce` (a : médiane ; b : Q1 et Q3 ; c : min/max/mode ou synthèse) ; toutes les
// valeurs viennent de l'instance (déjà calculées par le générateur, règle « dépasse STRICTEMENT le
// seuil » du cours, interpolation pour les classes) — jamais un second calcul.
// ============================================================================

/** Notation décimale belge sur les fragments des champs enrichis (`avecVirgulesBelges` ne couvre
 * que `construireEnonce`/`construireCorrection`). */
function enVirgules(fragments: FragmentConsigne[]): FragmentConsigne[] {
  return fragments.map(segmentEnVirgules);
}

function enoncePapierMediane(instance: ExerciceMediane): EnoncePapier {
  const unite = instance.contexte.unite;
  if (instance.variante === "discrete") {
    return {
      section: {
        enteteFragments: enVirgules([texte(formatEnonceTexte(instance)), latex(tableauDonneesLatexDiscrete(instance))]),
        questions: [
          {
            consigne: [
              texte("Détermine la médiane "),
              latex("Q_2"),
              texte(", le premier quartile "),
              latex("Q_1"),
              texte(", le troisième quartile "),
              latex("Q_3"),
              texte(`, le minimum, le maximum et le(s) mode(s) de cette série (en ${unite}).`),
            ],
          },
        ],
      },
      etapesParQuestion: [["a", "b", "c"]],
    };
  }
  const precision = libellePrecisionLecture(precisionLecture(instance.etendue));
  return {
    section: {
      enteteFragments: enVirgules([texte(formatEnonceTexte(instance)), latex(tableauDonneesLatexClasses(instance))]),
      questions: [
        {
          consigne: [
            texte("Détermine par interpolation linéaire la médiane "),
            latex("Q_2"),
            texte(" et les quartiles "),
            latex("Q_1"),
            texte(" et "),
            latex("Q_3"),
            texte(` (en ${unite}, ${precision}). Donne ensuite `),
            latex("x_{min}"),
            texte(", "),
            latex("x_{max}"),
            texte(", l'étendue, la classe modale et le mode de cette série."),
          ],
        },
      ],
    },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

function reponseBreveMediane(instance: ExerciceMediane): FragmentConsigne[] {
  const u = instance.contexte.unite;
  if (instance.variante === "discrete") {
    const modes = instance.modes.map(nombreFr).join(" ; ");
    return [
      latex(`Q_2 = ${nombreFrLatex(instance.mediane)}`),
      texte(" ; "),
      latex(`Q_1 = ${nombreFrLatex(instance.q1)}`),
      texte(" ; "),
      latex(`Q_3 = ${nombreFrLatex(instance.q3)}`),
      texte(` (en ${u}) ; min = ${nombreFr(instance.min)} ; max = ${nombreFr(instance.max)} ; mode${instance.modes.length > 1 ? "s" : ""} = ${modes}`),
    ];
  }
  return [
    latex(`Q_2 \\approx ${nombreFrLatex(instance.mediane)}`),
    texte(" ; "),
    latex(`Q_1 \\approx ${nombreFrLatex(instance.q1)}`),
    texte(" ; "),
    latex(`Q_3 \\approx ${nombreFrLatex(instance.q3)}`),
    texte(` (en ${u}) ; `),
    latex(`x_{min} = ${nombreFrLatex(instance.xMin)}`),
    texte(" ; "),
    latex(`x_{max} = ${nombreFrLatex(instance.xMax)}`),
    texte(` ; étendue = ${nombreFr(instance.etendue)} ; classe modale ${formatClasseTexte(instance, instance.indexClasseModale)} ; mode = ${nombreFr(instance.modeCentreClasseModale)}`),
  ];
}

/** Lignes « seuil puis première valeur dont le cumulé dépasse strictement le seuil » (discrète). */
function etapesSeuilDiscrete(
  instance: ExerciceMedianeDiscrete,
  lettre: string,
  formule: string,
  seuil: number,
  index: number,
  symbole: string,
): EtapeCorrection[] {
  const ligne = instance.lignes[index];
  const calcul: EtapeCorrection = {
    label: "Calcul",
    sousQuestion: lettre,
    fragments: [latex(`${formule} = ${nombreFrLatex(seuil)}`), texte(` ; premier effectif cumulé strictement supérieur : ${nombreFr(ligne.effectifCumule)}, atteint en `), latex(`x = ${nombreFrLatex(ligne.valeur)}`), texte(".")],
  };
  const conclusion: EtapeCorrection = { label: "Conclusion", sousQuestion: lettre, fragments: [latex(`${symbole} = ${nombreFrLatex(ligne.valeur)}`), texte(` ${instance.contexte.unite}.`)] };
  return [calcul, conclusion];
}

/** Ligne dont l'effectif cumulé vaut EXACTEMENT un seuil — le piège du cours (« dépasse
 * strictement » : on passe à la ligne suivante). */
function cumuleEgalSeuil(instance: ExerciceMedianeDiscrete): { formule: string; seuil: number } | null {
  const seuils: [string, number][] = [["n/2", instance.seuil], ["n/4", instance.seuilQ1], ["3n/4", instance.seuilQ3]];
  for (const [formule, seuil] of seuils) if (instance.lignes.some((l) => l.effectifCumule === seuil)) return { formule, seuil };
  return null;
}

function correctionDetailleeDiscrete(instance: ExerciceMedianeDiscrete): EtapeCorrection[] {
  const u = instance.contexte.unite;
  const etapes: EtapeCorrection[] = [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [texte("La médiane est la première valeur dont l'effectif cumulé dépasse strictement le seuil "), latex("n/2"), texte(` (ici n = ${instance.n}).`)],
    },
    ...etapesSeuilDiscrete(instance, "a", "\\dfrac{n}{2}", instance.seuil, instance.indexMediane, "Q_2"),
    {
      label: "Méthode",
      sousQuestion: "b",
      fragments: [texte("Même règle avec les seuils "), latex("n/4"), texte(" pour "), latex("Q_1"), texte(" et "), latex("3n/4"), texte(" pour "), latex("Q_3"), texte(".")],
    },
    ...etapesSeuilDiscrete(instance, "b", "\\dfrac{n}{4}", instance.seuilQ1, instance.indexQ1, "Q_1"),
    ...etapesSeuilDiscrete(instance, "b", "\\dfrac{3n}{4}", instance.seuilQ3, instance.indexQ3, "Q_3"),
    {
      label: "Méthode",
      sousQuestion: "c",
      fragments: [texte(`Minimum et maximum : plus petite et plus grande valeur observée. Mode : valeur(s) d'effectif maximal (ici ${effectifMaximalMinMaxMode(instance)}).`)],
    },
    {
      label: "Conclusion",
      sousQuestion: "c",
      fragments: [texte(`Minimum = ${nombreFr(instance.min)} ${u} ; maximum = ${nombreFr(instance.max)} ${u} ; mode${instance.modes.length > 1 ? "s" : ""} = ${instance.modes.map(nombreFr).join(" et ")} ${u}.`)],
    },
  ];
  const piege = cumuleEgalSeuil(instance);
  etapes.push({
    label: "Piège",
    fragments: piege
      ? [texte(`Un effectif cumulé vaut exactement le seuil ${piege.formule} = ${nombreFr(piege.seuil)} : il ne le dépasse pas strictement, on passe donc à la valeur suivante.`)]
      : [texte("Le mode est la VALEUR la plus fréquente, pas son effectif.")],
  });
  return etapes;
}

function etapesInterpolation(instance: ExerciceMedianeClasses, lettre: string, parametre: ParametreLecture, symbole: string): EtapeCorrection[] {
  const { inf, sup } = pointsEncadresLecture(instance, parametre);
  const precision = libellePrecisionLecture(precisionLecture(instance.etendue));
  return [
    {
      label: "Calcul",
      sousQuestion: lettre,
      fragments: [
        texte(`Seuil ${nombreFr(seuilLecture(instance, parametre))}, entre `),
        latex(`(x_{inf} ; v_{inf}) = (${nombreFrLatex(inf.x)} ; ${nombreFrLatex(inf.y)})`),
        texte(" et "),
        latex(`(x_{sup} ; v_{sup}) = (${nombreFrLatex(sup.x)} ; ${nombreFrLatex(sup.y)})`),
        texte(" : "),
        latex(formatFormuleInterpolationLatex(parametre)),
      ],
    },
    { label: "Conclusion", sousQuestion: lettre, fragments: [latex(`${symbole} \\approx ${nombreFrLatex(valeurCibleLecture(instance, parametre))}`), texte(` ${instance.contexte.unite} (${precision}).`)] },
  ];
}

function correctionDetailleeClasses(instance: ExerciceMedianeClasses): EtapeCorrection[] {
  const u = instance.contexte.unite;
  return [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [
        texte("Sur le polygone des effectifs cumulés, on repère la classe où le cumulé franchit le seuil "),
        latex("n/2"),
        texte(`, puis on interpole linéairement dans cette classe (n = ${instance.n}).`),
      ],
    },
    ...etapesInterpolation(instance, "a", "mediane", "Q_2"),
    { label: "Méthode", sousQuestion: "b", fragments: [texte("Même méthode avec les seuils "), latex("n/4"), texte(" et "), latex("3n/4"), texte(".")] },
    ...etapesInterpolation(instance, "b", "q1", "Q_1"),
    ...etapesInterpolation(instance, "b", "q3", "Q_3"),
    {
      label: "Méthode",
      sousQuestion: "c",
      fragments: [
        latex("x_{min}"),
        texte(" et "),
        latex("x_{max}"),
        texte(` : bornes extrêmes des classes ; classe modale : classe d'effectif maximal (${effectifMaximalSynthese(instance)}) ; mode : centre de la classe modale.`),
      ],
    },
    {
      label: "Conclusion",
      sousQuestion: "c",
      fragments: [
        latex(`x_{min} = ${nombreFrLatex(instance.xMin)}`),
        texte(" ; "),
        latex(`x_{max} = ${nombreFrLatex(instance.xMax)}`),
        texte(` ; étendue = ${nombreFr(instance.etendue)} ${u} ; classe modale ${formatClasseTexte(instance, instance.indexClasseModale)} ; mode = ${nombreFr(instance.modeCentreClasseModale)} ${u}.`),
      ],
    },
    { label: "Piège", fragments: [texte("Pour des données en classes, le mode est le CENTRE de la classe modale, pas la classe elle-même ni son effectif.")] },
  ];
}

function correctionDetailleeMediane(instance: ExerciceMediane): EtapeCorrection[] {
  const etapes = instance.variante === "discrete" ? correctionDetailleeDiscrete(instance) : correctionDetailleeClasses(instance);
  return etapes.map((e) => ({ ...e, fragments: enVirgules(e.fragments) }));
}

function baremeMediane(instance: ExerciceMediane): BaremeExercice {
  const discrete = instance.variante === "discrete";
  const criteres: CritereBareme[] = [
    { sousQuestion: "a", critere: discrete ? [texte("Seuil n/2 et médiane (règle « dépasse strictement »)")] : [texte("Médiane par interpolation dans la bonne classe")], points: 1 },
    { sousQuestion: "b", critere: [latex("Q_1"), texte(discrete ? " (seuil n/4)" : " par interpolation")], points: 1 },
    { sousQuestion: "b", critere: [latex("Q_3"), texte(discrete ? " (seuil 3n/4)" : " par interpolation")], points: 1 },
    { sousQuestion: "c", critere: [texte(discrete ? "Minimum et maximum" : "xmin, xmax et étendue")], points: 0.5 },
    { sousQuestion: "c", critere: [texte(discrete ? "Mode(s)" : "Classe modale et mode (centre de la classe)")], points: 0.5 },
  ];
  const erreurs: ErreurFrequente[] = discrete
    ? [
        { description: [texte("Valeur retenue dont l'effectif cumulé est ÉGAL au seuil (au lieu de le dépasser strictement)")], cout: "0 pt sur le paramètre concerné" },
        { description: [texte("Médiane prise au milieu de la liste des valeurs distinctes, sans tenir compte des effectifs")], cout: "0 pt sur a)" },
        { description: [texte("Mode donné comme l'effectif maximal au lieu de la valeur")], cout: "0 pt sur le mode" },
      ]
    : [
        { description: [texte("Interpolation dans la mauvaise classe (classe où le cumulé n'a pas encore franchi le seuil)")], cout: "0 pt sur le paramètre concerné" },
        { description: [texte("Mode donné comme la classe modale (ou son effectif) au lieu de son centre")], cout: "0 pt sur le mode" },
      ];
  const acceptees: FragmentConsigne[][] = discrete
    ? [[texte("Modes listés dans n'importe quel ordre")]]
    : [[texte("Valeur lue graphiquement sur le polygone des effectifs cumulés, à la précision demandée près")]];
  return {
    reponseFinale: reponseBreveMediane(instance).map(segmentEnVirgules),
    criteres: criteres.map((c) => ({ ...c, critere: enVirgules(c.critere) })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: acceptees,
  };
}

function difficulteMediane(instance: ExerciceMediane): 1 | 2 | 3 {
  return instance.variante === "classes" ? 3 : 2;
}

const adaptateurEvaluationMedianeBrut: AdaptateurFeuilleExercices<ExerciceMediane> = {
  titreDocument: "Médiane, quartiles et mode — Évaluation",
  nomFichierBase: "mediane-quartiles-mode",
  genererInstance: genererExerciceMediane,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceMediane,
  construireCorrection: construireCorrectionMediane,
};

/** Notation décimale belge (virgule) dans tout l'énoncé et la correction (audit chapitre 4). */
export const adaptateurEvaluationMediane: AdaptateurFeuilleExercices<ExerciceMediane> = {
  ...avecVirgulesBelges(adaptateurEvaluationMedianeBrut),
  difficulte: difficulteMediane,
  reponseBreve: (instance) => reponseBreveMediane(instance).map(segmentEnVirgules),
  correctionDetaillee: correctionDetailleeMediane,
  bareme: baremeMediane,
  enoncePapier: enoncePapierMediane,
  dureeMinutes: 8,
};
