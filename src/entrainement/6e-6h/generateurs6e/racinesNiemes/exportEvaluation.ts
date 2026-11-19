import type { ExerciceRacinesNiemes } from "../../core6e/racinesNiemes.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { LIBELLE_RELATION_C, blocDonnees, formatReponseAttenduePhaseLatex } from "../../ui6e/formatRacinesNiemes";
import { phasesPourExercice } from "../../moteur6e/typesRacinesNiemes";
import type { PhaseRacinesNiemes } from "../../moteur6e/typesRacinesNiemes";
import { LIBELLE_CAS_RACINES_NIEMES, profilRacinesNiemes } from "../profilsEvaluationComplexes37-39";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRacinesNiemes } from "./index";
import type { IdVarianteRacinesNiemes } from "./index";
import { correctionDetailleeRacinesNiemes, liste, listeK, ligne, piege, reponse } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceRacinesNiemes>` pour `6gen39` (Racines n-ièmes
 * d'un nombre complexe) — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : la donnée et la consigne globale (« Détermine les racines cubiques de w… »,
 *   « Résous zⁿ = wⁿ… ») ; les écrans du générateur deviennent les étapes du corrigé.
 * - Corrigé : r substitué, valeurs exactes (familles A et C) ou arrondies au centième avec virgule
 *   (famille B), et le polygone régulier des racines sur leur cercle (`figureHtml`).
 * - `planComplexeSvg` (exporté) dessine aussi le point de 6gen37.
 */

const LETTRES = "abcdefghij";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

export { anglePiLatex, avecFractionsNormalisees, indice, normaliserFractions, planComplexeSvg, type OptionsPlanComplexe, type PointPlanComplexe } from "../../ui6e/papierComplexes";
import { avecFractionsNormalisees } from "../../ui6e/papierComplexes";

const NOMS_RACINES: Record<number, string> = { 2: "racines carrées", 3: "racines cubiques", 4: "racines quatrièmes", 5: "racines cinquièmes", 6: "racines sixièmes" };
const NOMS_RACINE_UNITE: Record<number, string> = { 2: "racine carrée", 3: "racine cubique", 4: "racine quatrième", 5: "racine cinquième", 6: "racine sixième" };

// ============================================================================
// Énoncé papier et étapes.
// ============================================================================

function entetePapier(e: ExerciceRacinesNiemes): FragmentConsigne[] {
  const w = blocDonnees(e)[0];
  if (e.famille === "A") {
    return [t("Soit "), f(w), t(`. Détermine les ${NOMS_RACINES[e.n]} de w et écris-les sous la forme `), f("a+bi"), t(" (valeurs exactes). Les arguments sont exprimés en radians.")];
  }
  if (e.famille === "B") {
    return [
      t("Soit "),
      f(w),
      t(`. Détermine les ${NOMS_RACINES[e.n]} de w : donne leur module commun et leur argument `),
      f("\\theta_k"),
      t(" en fonction de l'entier k, pour "),
      f(listeK(e.n)),
      t(". Arguments en radians ; valeurs exactes ou arrondies au centième (calculatrice)."),
    ];
  }
  return [
    t("Soit "),
    f(w),
    t(". Résous dans ℂ l'équation "),
    f(`z^{${e.n}}=w^{${e.n}}`),
    t(` sans calculer `),
    f(`w^{${e.n}}`),
    t(` : remarque que `),
    f("\\dfrac{z}{w}"),
    t(` est alors une ${NOMS_RACINE_UNITE[e.n]} de l'unité. Donne les solutions sous la forme `),
    f("a+bi"),
    t(" (valeurs exactes). Les arguments sont exprimés en radians."),
  ];
}

/** Titres d'étapes du corrigé (« Étape n — … ») : consignes d'écran réécrites pour le papier. */
function titreEtape(e: ExerciceRacinesNiemes, phase: PhaseRacinesNiemes): FragmentConsigne[] {
  switch (phase) {
    case "aEcran1":
    case "bEcran1":
      return [t("Détermine le module r et un argument θ de w, en radians.")];
    case "aEcran2":
      return [t("Calcule le module commun des racines, "), f("\\sqrt[n]{r}"), t(", et écris leur argument "), f("\\theta_k"), t(" en fonction de k, pour "), f(listeK(e.n)), t(".")];
    case "aEcran3":
      return [t("Écris chaque racine sous la forme "), f("a+bi"), t(".")];
    case "bEcran2":
      return [t("Donne le module commun des racines et leur argument "), f("\\theta_k"), t(" en fonction de k, pour "), f(listeK(e.n)), t(".")];
    case "cEcran1":
      return [t("Exprime z en fonction de w et d'une racine n-ième de l'unité "), f("\\zeta_k"), t(".")];
    case "cEcran2":
      return [t("Écris les racines n-ièmes de l'unité "), f("\\zeta_k"), t(" sous la forme "), f("a+bi"), t(".")];
    case "cEcran3":
      return [t("Calcule les solutions "), f("z_k=w\\cdot\\zeta_k"), t(" sous la forme "), f("a+bi"), t(".")];
  }
}

function construireEnonce(e: ExerciceRacinesNiemes): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function construireCorrection(e: ExerciceRacinesNiemes): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, phase)] }));
}

function phaseFinale(e: ExerciceRacinesNiemes): PhaseRacinesNiemes {
  const phases = phasesPourExercice(e);
  return phases[phases.length - 1];
}

function reponseBreve(e: ExerciceRacinesNiemes): FragmentConsigne[] {
  return reponse(e, phaseFinale(e));
}

function enoncePapier(e: ExerciceRacinesNiemes): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

const correctionDetaillee = correctionDetailleeRacinesNiemes;

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceRacinesNiemes): CriteresDifficulte {
  const piege = e.famille === "B" && e.a < 0 ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode: 0, piege, anglesEnPi: true };
}

/** Poids par critère (somme 4, aucun critère sous 0,5). */
function criteres(e: ExerciceRacinesNiemes): { sq: string; critere: FragmentConsigne[]; points: number }[] {
  const L = (phase: PhaseRacinesNiemes) => formatReponseAttenduePhaseLatex(e, phase).map(ligne);
  switch (e.famille) {
    case "A":
      return [
        { sq: "a", critere: [t("Module et argument de w : "), ...liste(L("aEcran1"))], points: 1 },
        { sq: "b", critere: [t("Module des racines : "), f(L("aEcran2")[0])], points: 0.5 },
        { sq: "b", critere: [t("Argument en fonction de k : "), f(L("aEcran2")[1])], points: 1 },
        { sq: "c", critere: [t(`Les ${e.n} racines sous la forme a + bi (proportionnel au nombre de racines correctes)`)], points: 1.5 },
      ];
    case "B":
      return [
        { sq: "a", critere: [t("Module de w : "), f(L("bEcran1")[0])], points: 1 },
        { sq: "a", critere: [t("Argument de w, quadrant pris en compte : "), f(L("bEcran1")[1])], points: 1 },
        { sq: "b", critere: [t("Module commun des racines : "), f(L("bEcran2")[0])], points: 1 },
        { sq: "b", critere: [t("Argument en fonction de k : "), f(L("bEcran2")[1])], points: 1 },
      ];
    case "C":
      return [
        { sq: "a", critere: [t("Relation "), f(LIBELLE_RELATION_C.correct), t(" justifiée par "), f("\\left(\\dfrac{z}{w}\\right)^n=1")], points: 1 },
        { sq: "b", critere: [t(`Les ${e.n} racines de l'unité (proportionnel au nombre de valeurs correctes)`)], points: 1.5 },
        { sq: "c", critere: [t(`Les ${e.n} solutions sous la forme a + bi (proportionnel au nombre de solutions correctes)`)], points: 1.5 },
      ];
  }
}

function bareme(e: ExerciceRacinesNiemes): BaremeExercice {
  const phases = phasesPourExercice(e);
  const erreurs = phases.map((phase) => piege(e, phase)).filter((p): p is FragmentConsigne[] => !!p);
  return {
    reponseFinale: reponseBreve(e),
    criteres: criteres(e).map((c) => ({ sousQuestion: c.sq, critere: c.critere, points: c.points })),
    erreursFrequentes: erreurs.map((x) => ({ description: x, cout: "−1" })),
    reponsesAcceptees: [
      [t("Racines données dans n'importe quel ordre")],
      e.famille === "B" ? [t("Valeurs exactes ou arrondies au centième ; un argument égal à 2kπ près")] : [t("Forme trigonométrique correcte non convertie en a + bi : la moitié des points de l'étape")],
    ],
  };
}

export const adaptateurEvaluationRacinesNiemes: AdaptateurFeuilleExercices<ExerciceRacinesNiemes> = {
  titreDocument: "Racines n-ièmes d'un nombre complexe — Évaluation",
  nomFichierBase: "racines-niemes",
  genererInstance: genererExerciceRacinesNiemes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteRacinesNiemes),
  construireEnonce: avecFractionsNormalisees(construireEnonce),
  construireCorrection: avecFractionsNormalisees(construireCorrection),
  criteresDifficulte: avecFractionsNormalisees(criteresDifficulte),
  reponseBreve: avecFractionsNormalisees(reponseBreve),
  correctionDetaillee: avecFractionsNormalisees(correctionDetaillee),
  bareme: avecFractionsNormalisees(bareme),
  enoncePapier: avecFractionsNormalisees(enoncePapier),
  profilInstance: profilRacinesNiemes,
  libelleCasParticulier: LIBELLE_CAS_RACINES_NIEMES,
  // Famille B : racine n-ième de r et arguments arrondis — calculatrice pour toute instance complète
  // (seul w ∈ {1 ; −1 ; i ; −i}, cas particulier, s'en passe).
  calculatriceIndispensable: ["B"],
};
