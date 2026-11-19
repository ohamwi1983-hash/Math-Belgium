import type {
  ExerciceEqLogA,
  ExerciceEqLogB,
  ExerciceEqLogC,
  ExerciceEqLogD,
  ExerciceEqLogE,
  ExerciceEqLogG,
  ExerciceEquationsExpLog,
  FamilleEquationsExpLog,
} from "../../core6e/equationsExpLog.types";
import type { PhaseEquationsExpLog } from "../../moteur6e/typesEquationsExpLog";
import type { AdaptateurFeuilleExercices, EnoncePapier, BaremeExercice, BlocCorrection, CritereBareme, ErreurFrequente, SectionExercice } from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  CONSIGNE_GENERALE,
  LIBELLE_PHASE,
  PHASES_PAR_FAMILLE,
  blocDonnees,
  ceELatex,
  ceIdentiteLatex,
  combinaisonLnLatex,
  consigneEcran,
  exposantExactA,
  formatAffineLatex,
  formatBaseLatex,
  formatCLatex,
  formatDecimal,
  formatReponseAttenduePhaseLatex,
  polynomeELatex,
  xExactD,
} from "../../ui6e/formatEquationsExpLog";
import { correctionDetailleeEquationsExpLog } from "./corrigeDetaille";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEquationsExpLog } from "./index";
import { profilEquationsExpLog, LIBELLE_CAS_EQUATIONS_EXP_LOG } from "../profilsEvaluationLogarithmes";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationsExpLog>` pour `6gen14` (Résoudre une
 * équation exponentielle ou logarithmique) — feuille d'évaluation, voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * 6 familles STRUCTURELLEMENT DISJOINTES à 2 ou 3 écrans chacune (`PHASES_PAR_FAMILLE`,
 * `ui6e/formatEquationsExpLog.ts`) — plutôt que dupliquer un dispatch par famille comme
 * `equationsCyclometriques/exportEvaluation.ts`, cet adaptateur reste GÉNÉRIQUE sur `famille` en
 * réutilisant DIRECTEMENT les fonctions déjà écrites côté écran pour piloter l'interactif :
 * `consigneEcran` (consigne de chaque écran), `blocDonnees` (l'équation de tête) et surtout
 * `formatReponseAttenduePhaseLatex`, qui est la même fonction que consulte déjà
 * `ResultatPanelEquationsExpLog.tsx` pour afficher la réponse correcte du récapitulatif — jamais
 * recalculée indépendamment ici. Une question écrite PAR ÉCRAN traversé, dans le même ordre que
 * l'interactif (`PHASES_PAR_FAMILLE`) — jamais un question unique par instance, donc `regroupable`
 * reste absent (aucune famille n'a un seul écran).
 */

const TAILLE_REPONSE: Record<PhaseEquationsExpLog, number> = {
  aEcran1: 2,
  aEcran2: 2,
  bEcran1: 2,
  bEcran2: 3,
  cEcran1: 2,
  cEcran2: 3,
  cEcran3: 3,
  dEcran1: 2,
  dEcran2: 2,
  eEcran1: 2,
  eEcran2: 2,
  eEcran3: 3,
  gEcran1: 2,
  gEcran2: 2,
};

function construireEnonceEquationsExpLog(exercice: ExerciceEquationsExpLog): SectionExercice {
  const phases = PHASES_PAR_FAMILLE[exercice.famille];
  return {
    enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(blocDonnees(exercice)[0])],
    questions: phases.map((phase) => ({
      consigne: consigneEcran(exercice, phase),
      reponse: { type: "lignes", nombre: TAILLE_REPONSE[phase] },
    })),
  };
}

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function construireCorrectionEquationsExpLog(exercice: ExerciceEquationsExpLog): BlocCorrection[] {
  const phases = PHASES_PAR_FAMILLE[exercice.famille];
  return phases.map((phase, i) => {
    const reponseFragments = formatReponseAttenduePhaseLatex(exercice, phase).flatMap((frag, j) => (j === 0 ? [latex(frag)] : [texte(" ; "), latex(frag)]));
    const fragments: FragmentConsigne[] = [texte(`${LETTRES[i]}) ${LIBELLE_PHASE[phase]} : `), ...reponseFragments];
    return { type: "paragraphe", fragments };
  });
}

// ============================================================================
// Feuilles enrichies (corrigé détaillé, barème). Les réponses viennent TOUJOURS
// de `formatReponseAttenduePhaseLatex` (la même fonction que `construireCorrection` et que la
// réponse révélée de l'écran interactif) ; les étapes intermédiaires (discriminant, racines
// rejetées, valeur testée dans la CE) sont recalculées depuis les paramètres de l'instance.
// Barème : 4 critères d'1 point, en correspondance 1-1 avec les 4 étapes du corrigé.
// ============================================================================

/** Réponse(s) attendue(s) d'une phase (LaTeX), identiques au corrigé historique. */
function rep(exercice: ExerciceEquationsExpLog, phase: PhaseEquationsExpLog): string[] {
  return formatReponseAttenduePhaseLatex(exercice, phase);
}

function estEntierNum(v: number): boolean {
  return Math.abs(v - Math.round(v)) < 1e-9;
}

/** Valeur arrondie au millième, virgule décimale (« 1{,}262 »). */
function arrondiMillieme(v: number): string {
  return formatDecimal(v, 3);
}

/** Ensemble des solutions en forme exacte (`S=\{…\}`, ou `\varnothing`). */
function ensembleLatex(valeursExactes: string[]): string {
  return valeursExactes.length === 0 ? "S=\\varnothing" : `S=\\left\\{${valeursExactes.join(" ; ")}\\right\\}`;
}

/** « x = exact ≈ approché » — `exactEtApprox` déjà appliqué par `formatReponseAttenduePhaseLatex`. */
function egaliteX(valeur: string): string {
  return valeur.startsWith("\\approx") ? `x ${valeur}` : `x = ${valeur}`;
}

/** Racines (entières par construction) de `A t² + B t + Cc = 0`, triées. */
function racinesEnT(ex: ExerciceEqLogC): number[] {
  const delta = ex.B * ex.B - 4 * ex.A * ex.Cc;
  const r = Math.sqrt(delta);
  return [(-ex.B - r) / (2 * ex.A), (-ex.B + r) / (2 * ex.A)].map((t) => (estEntierNum(t) ? Math.round(t) : t)).sort((a, b) => a - b);
}

function equationEnTLatex(ex: ExerciceEqLogC): string {
  return rep(ex, "cEcran1")[0];
}


function reponseBreveEquationsExpLog(exercice: ExerciceEquationsExpLog): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return [latex(egaliteX(rep(exercice, "aEcran2")[0]))];
    case "B":
      return [latex(egaliteX(rep(exercice, "bEcran2")[0]))];
    case "C": {
      if (exercice.tValides.length === 0) return [latex("S=\\varnothing")];
      return rep(exercice, "cEcran3").flatMap((v, i) => (i === 0 ? [latex(egaliteX(v))] : [texte(" ou "), latex(egaliteX(v))]));
    }
    case "D":
      return [latex(egaliteX(rep(exercice, "dEcran2")[0]))];
    case "E":
      return [latex(ensembleLatex(exercice.solutionsFinales.map((r) => String(r))))];
    case "G":
      return [latex(exercice.type === "identite" ? `S=\\left\\{x\\in\\mathbb{R} \\mid ${ceIdentiteLatex(exercice)}\\right\\}` : "S=\\varnothing")];
  }
}

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceEquationsExpLog): CriteresDifficulte {
  const r = e.famille === "C" || e.famille === "E" || e.famille === "G" ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeEquationsExpLog(e)), methode: r, piege: r };
}

/** Durée indicative par instance (minutes), moyenne pondérée des familles : A 4, B 6, C 8, D 3,
 * E 8, G 6. */
// ---------------------------------------------------------------------------- Famille A



function baremeA(ex: ExerciceEqLogA): BaremeExercice {
  const base = String(ex.base);
  const affine = formatAffineLatex(ex.m, ex.n);
  const criteres: CritereBareme[] = [
    ex.estPuissancePropre
      ? { sousQuestion: "a", critere: [texte("Écrit le second membre comme puissance de la base : "), latex(`${formatCLatex(ex)}=${base}^{${ex.p}}`)], points: 1 }
      : { sousQuestion: "a", critere: [texte("Passe au logarithme (le second membre n'est pas une puissance de "), latex(base), texte(")")], points: 1 },
    { sousQuestion: "a", critere: [texte("Exposant : "), latex(`${affine}=${exposantExactA(ex)}`)], points: 1 },
    { sousQuestion: "b", critere: [texte("Résout l'équation du premier degré (n puis m)")], points: 1 },
    { sousQuestion: "b", critere: [latex(egaliteX(rep(ex, "aEcran2")[0]))], points: 1 },
  ];
  const erreurs: ErreurFrequente[] = [];
  if (!ex.estPuissancePropre) erreurs.push({ description: [texte("Rapport inversé : "), latex(`\\dfrac{\\ln(${base})}{\\ln(${ex.C})}`)], cout: "−1" });
  if (ex.estPuissancePropre && (ex.p as number) < 0) erreurs.push({ description: [texte("Exposant positif au lieu de "), latex(String(ex.p))], cout: "−1" });
  if (ex.estPuissancePropre && ex.p === 0) erreurs.push({ description: [texte("Exposant 1 au lieu de 0 (confusion "), latex(`${base}^{1}`), texte(" / "), latex(`${base}^{0}=1`), texte(")")], cout: "−1" });
  if (ex.m !== 1) erreurs.push({ description: [texte("Oubli de diviser par m, ou erreur de signe en isolant x")], cout: "−1" });
  else if (ex.n !== 0) erreurs.push({ description: [texte("Erreur de signe en faisant passer "), latex(String(ex.n)), texte(" dans l'autre membre")], cout: "−1" });
  const acceptees: FragmentConsigne[][] = [];
  if (!estEntierNum(ex.x)) acceptees.push([texte("Valeur arrondie au millième : "), latex(`x\\approx ${arrondiMillieme(ex.x)}`)]);
  if (!ex.estPuissancePropre) acceptees.push([texte("Forme exacte avec "), latex(`\\log_{${base}}(${ex.C})`), texte(" ou avec des log décimaux")]);
  else acceptees.push([texte("Fraction équivalente non simplifiée")]);
  return { reponseFinale: reponseBreveEquationsExpLog(ex), criteres, erreursFrequentes: erreurs, reponsesAcceptees: acceptees };
}

// ---------------------------------------------------------------------------- Famille B

function egaliteRegroupeeB(ex: ExerciceEqLogB): string {
  const den = combinaisonLnLatex([
    { c: ex.m1, arg: ex.base1 },
    { c: -ex.m2, arg: ex.base2 },
  ]);
  const num = combinaisonLnLatex([
    { c: ex.n2, arg: ex.base2 },
    { c: -ex.n1, arg: ex.base1 },
  ]);
  return `x\\left(${den}\\right)=${num}`;
}

function baremeB(ex: ExerciceEqLogB): BaremeExercice {
  return {
    reponseFinale: reponseBreveEquationsExpLog(ex),
    criteres: [
      { sousQuestion: "a", critere: [texte("Prend ln (ou log) des deux membres")], points: 1 },
      { sousQuestion: "a", critere: [latex(rep(ex, "bEcran1")[0])], points: 1 },
      { sousQuestion: "b", critere: [texte("Regroupe les termes en x : "), latex(egaliteRegroupeeB(ex))], points: 1 },
      { sousQuestion: "b", critere: [latex(egaliteX(rep(ex, "bEcran2")[0]))], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Exposants égalés directement alors que les bases diffèrent")], cout: "0 pt sur a) et b)" },
      ...erreurParenthesesB(ex),
    ],
    reponsesAcceptees: [[texte("Valeur arrondie au millième : "), latex(`x\\approx ${arrondiMillieme(ex.x)}`)], [texte("Forme exacte équivalente (log décimal, signes répartis autrement)")]],
  };
}

/** « m·x + n·ln(a) » au lieu de « (mx+n)·ln(a) » — sur le membre dont le terme constant est non nul
 * (sans terme constant, l'oubli des parenthèses ne change rien). */
function erreurParenthesesB(ex: ExerciceEqLogB): ErreurFrequente[] {
  const membre = ex.n1 !== 0 ? { m: ex.m1, n: ex.n1, base: ex.base1 } : ex.n2 !== 0 ? { m: ex.m2, n: ex.n2, base: ex.base2 } : null;
  if (!membre) return [];
  const faux = `${formatAffineLatex(membre.m, 0)}${membre.n > 0 ? "+" : "-"}${Math.abs(membre.n)}\\ln(${membre.base})`;
  return [{ description: [texte("Parenthèses oubliées : "), latex(faux), texte(" au lieu de "), latex(`(${formatAffineLatex(membre.m, membre.n)})\\ln(${membre.base})`)], cout: "−1" }];
}

// ---------------------------------------------------------------------------- Famille C

function baremeC(ex: ExerciceEqLogC): BaremeExercice {
  const racines = racinesEnT(ex);
  const rejetees = racines.filter((t) => t <= 0);
  const erreurs: ErreurFrequente[] = [];
  if (rejetees.length > 0) erreurs.push({ description: [texte("Valeur "), latex(rejetees.map((t) => `t=${t}`).join(",\\ ")), texte(" gardée (ou x calculé à partir d'elle)")], cout: "−1" });
  erreurs.push({ description: [latex(`${formatBaseLatex(ex.base)}^{2x}`), texte(" remplacé par "), latex("2t"), texte(" au lieu de "), latex("t^{2}")], cout: "0 pt sur a), suite notée sans double pénalité" });
  if (ex.base !== Math.E && ex.tValides.some((t) => !estEntierNum(Math.log(t) / Math.log(ex.base)))) erreurs.push({ description: [latex("x=\\ln(t)"), texte(" sans diviser par "), latex(`\\ln(${ex.base})`)], cout: "−0,5" });
  const acceptees: FragmentConsigne[][] = [];
  const approx = ex.xValides.filter((x) => !estEntierNum(x));
  if (approx.length > 0) acceptees.push([texte("Valeurs arrondies au millième : "), latex(approx.map((x) => `x\\approx ${arrondiMillieme(x)}`).join(" ; "))]);
  acceptees.push([texte("Équation en t multipliée ou divisée par une constante non nulle")]);
  return {
    reponseFinale: reponseBreveEquationsExpLog(ex),
    criteres: [
      { sousQuestion: "a", critere: [texte("Équation en t : "), latex(equationEnTLatex(ex))], points: 1 },
      { sousQuestion: "b", critere: [texte("Racines "), latex(`t_1=${racines[0]}`), texte(" et "), latex(`t_2=${racines[1]}`)], points: 1 },
      { sousQuestion: "b", critere: [texte("Ne garde que les t strictement positifs (justifié par "), latex("\\text{base}^{x}>0"), texte(")")], points: 1 },
      { sousQuestion: "c", critere: ex.tValides.length === 0 ? [texte("Conclut "), latex("S=\\varnothing")] : [texte("Calcule x pour chaque t retenu : "), ...reponseBreveEquationsExpLog(ex)], points: 1 },
    ],
    erreursFrequentes: erreurs.slice(0, 3),
    reponsesAcceptees: acceptees,
  };
}

// ---------------------------------------------------------------------------- Famille D

function puissanceDLatex(ex: ExerciceEqLogD): string {
  return `${ex.a}^{${ex.k}}`;
}

function baremeD(ex: ExerciceEqLogD): BaremeExercice {
  const erreurs: ErreurFrequente[] = [{ description: [latex(`x=${ex.k}^{${ex.a}}`), texte(" ou "), latex(`x=${ex.a}\\cdot ${ex.k}`), texte(" (base et exposant confondus)")], cout: "−2" }];
  if (ex.k < 0) erreurs.push({ description: [latex(`${ex.a}^{${ex.k}}`), texte(" calculé comme "), latex(`-${ex.a}^{${-ex.k}}`)], cout: "−1" });
  if (ex.k === 0) erreurs.push({ description: [latex(`${ex.a}^{0}`), texte(" calculé comme 0")], cout: "−1" });
  return {
    reponseFinale: reponseBreveEquationsExpLog(ex),
    criteres: [
      { sousQuestion: "a", critere: [texte("CE : "), latex("x>0"), texte(", soit "), latex(rep(ex, "dEcran1")[0])], points: 1 },
      { sousQuestion: "b", critere: [texte("Passage à la forme exponentielle : "), latex(`x=${puissanceDLatex(ex)}`)], points: 1 },
      { sousQuestion: "b", critere: [texte("Calcul : "), latex(`x=${xExactD(ex)}`)], points: 1 },
      { sousQuestion: "b", critere: [texte("Vérifie la CE et conclut : "), latex(ensembleLatex([xExactD(ex)]))], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: reponsesAccepteesD(ex),
  };
}

function reponsesAccepteesD(ex: ExerciceEqLogD): FragmentConsigne[][] {
  const acceptees: FragmentConsigne[][] = [[latex(`x=${puissanceDLatex(ex)}`), texte(" laissé sous forme de puissance")]];
  // 1/2ⁿ et 1/5ⁿ ont une écriture décimale finie (au plus 3 chiffres après la virgule ici).
  if (ex.k < 0 && (ex.a === 2 || ex.a === 5)) acceptees.push([texte("Écriture décimale "), latex(`x=${formatDecimal(ex.x, 3)}`)]);
  return acceptees;
}

// ---------------------------------------------------------------------------- Famille E

function baremeE(ex: ExerciceEqLogE): BaremeExercice {
  const rejetees = ex.racinesAlgebriques.filter((r) => !ex.solutionsFinales.includes(r));
  const erreurs: ErreurFrequente[] = [];
  if (rejetees.length > 0) erreurs.push({ description: [texte("Racine "), latex(rejetees.map(String).join(",\\ ")), texte(" gardée alors qu'elle sort de la CE")], cout: "−1" });
  erreurs.push({ description: [texte("Somme de logarithmes transformée en logarithme de la somme")], cout: "0 pt sur b) et c)" });
  const contrainteEffective = ex.ceSup !== null || ex.ceInf > Math.max(ex.p, ex.q) + 1e-9;
  if (contrainteEffective) erreurs.push({ description: [texte("CE incomplète : oubli de "), latex(`${formatAffineLatex(ex.e, ex.d)}>0`)], cout: "−0,5" });
  return {
    reponseFinale: reponseBreveEquationsExpLog(ex),
    criteres: [
      { sousQuestion: "a", critere: [texte("CE : "), latex(ceELatex(ex))], points: 1 },
      { sousQuestion: "b", critere: [latex(rep(ex, "eEcran2")[0])], points: 1 },
      { sousQuestion: "c", critere: [texte("Racines "), latex(`${ex.racinesAlgebriques[0]}`), texte(" et "), latex(`${ex.racinesAlgebriques[1]}`)], points: 1 },
      { sousQuestion: "c", critere: [texte("Filtre avec la CE et conclut : "), latex(ensembleLatex(ex.solutionsFinales.map(String)))], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("CE écrite sous forme d'intervalle")], [texte("Équation développée "), latex(`${polynomeELatex(ex)}=0`), texte(" à la place de la forme produit en b)")]],
  };
}

// ---------------------------------------------------------------------------- Famille G


function baremeG(ex: ExerciceEqLogG): BaremeExercice {
  const simplifiee = rep(ex, "gEcran1")[0];
  if (ex.type === "violationCE") {
    const x0 = (ex.n2 - ex.n1) / (ex.m1 - ex.m2);
    return {
      reponseFinale: reponseBreveEquationsExpLog(ex),
      criteres: [
        { sousQuestion: "a", critere: [texte("Égale les arguments : "), latex(simplifiee)], points: 1 },
        { sousQuestion: "a", critere: [texte("Candidate "), latex(`x=${x0}`)], points: 1 },
        { sousQuestion: "b", critere: [texte("Teste la CE : un argument vaut "), latex(`${ex.m1 * x0 + ex.n1}\\le 0`)], points: 1 },
        { sousQuestion: "b", critere: [texte("Conclut "), latex("S=\\varnothing")], points: 1 },
      ],
      erreursFrequentes: [{ description: [texte("Conclusion "), latex(`S=\\{${x0}\\}`), texte(" sans tester la CE")], cout: "−2" }],
      reponsesAcceptees: [[texte("Test de la CE fait sur l'un OU l'autre argument (les deux valent "), latex(`${ex.m1 * x0 + ex.n1}`), texte(")")]],
    };
  }
  if (ex.type === "identite") {
    return {
      reponseFinale: reponseBreveEquationsExpLog(ex),
      criteres: [
        { sousQuestion: "a", critere: [texte("Applique la propriété du produit au membre de gauche")], points: 1 },
        { sousQuestion: "a", critere: [texte("Obtient une égalité toujours vraie ("), latex("0=0"), texte(")")], points: 1 },
        { sousQuestion: "b", critere: [texte("CE : "), latex(ceIdentiteLatex(ex))], points: 1 },
        { sousQuestion: "b", critere: [texte("Conclut : S = la CE")], points: 1 },
      ],
      erreursFrequentes: [
        { description: [texte("Conclusion "), latex("S=\\mathbb{R}"), texte(" (CE oubliée)")], cout: "−1" },
        { description: [texte("Conclusion "), latex("S=\\varnothing"), texte(" parce que « x a disparu »")], cout: "−2" },
      ],
      reponsesAcceptees: [[texte("Ensemble écrit sous forme d'intervalle")]],
    };
  }
  return {
    reponseFinale: reponseBreveEquationsExpLog(ex),
    criteres: [
      { sousQuestion: "a", critere: [texte("Égale les arguments : "), latex(`x^{2}+${ex.b0}=${ex.c0}`)], points: 1 },
      { sousQuestion: "a", critere: [latex(simplifiee)], points: 1 },
      { sousQuestion: "b", critere: [texte("Justifie : un carré n'est jamais négatif")], points: 1 },
      { sousQuestion: "b", critere: [texte("Conclut "), latex("S=\\varnothing")], points: 1 },
    ],
    erreursFrequentes: [{ description: [latex(`x=\\pm\\sqrt{${ex.c0 - ex.b0}}`), texte(" ou racine d'un nombre négatif calculée")], cout: "−2" }],
    reponsesAcceptees: [[texte("Justification par le discriminant de "), latex(`x^{2}+${ex.b0 - ex.c0}=0`), texte(" (négatif)")]],
  };
}

// ---------------------------------------------------------------------------- Dispatch

function baremeEquationsExpLog(exercice: ExerciceEquationsExpLog): BaremeExercice {
  switch (exercice.famille) {
    case "A":
      return baremeA(exercice);
    case "B":
      return baremeB(exercice);
    case "C":
      return baremeC(exercice);
    case "D":
      return baremeD(exercice);
    case "E":
      return baremeE(exercice);
    case "G":
      return baremeG(exercice);
  }
}

/** Énoncé PAPIER (feuille d'exercices, évaluation) : l'énoncé et la consigne globale seulement.
 * Les sous-questions de `construireEnonce` sont les étapes d'apprentissage du générateur
 * interactif : sur papier, elles passent dans le corrigé (voir `EnoncePapier`). */
function enoncePapierEquationsExpLog(exercice: ExerciceEquationsExpLog): EnoncePapier {
  const precision = exercice.famille === "A" || exercice.famille === "B" || exercice.famille === "C" ? " Donne chaque solution en valeur exacte ou arrondie au millième." : "";
  return { section: { enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(blocDonnees(exercice)[0]), texte(`.${precision}`)], questions: [] } };
}

export const adaptateurEvaluationEquationsExpLog: AdaptateurFeuilleExercices<ExerciceEquationsExpLog> = {
  profilInstance: profilEquationsExpLog,
  libelleCasParticulier: LIBELLE_CAS_EQUATIONS_EXP_LOG,
  titreDocument: "Résoudre une équation exponentielle ou logarithmique — Évaluation",
  nomFichierBase: "equations-exp-log",
  genererInstance: genererExerciceEquationsExpLog,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as FamilleEquationsExpLog),
  construireEnonce: construireEnonceEquationsExpLog,
  construireCorrection: construireCorrectionEquationsExpLog,
  criteresDifficulte,
  reponseBreve: reponseBreveEquationsExpLog,
  correctionDetaillee: correctionDetailleeEquationsExpLog,
  bareme: baremeEquationsExpLog,
  enoncePapier: enoncePapierEquationsExpLog,
};
