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
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, ErreurFrequente, EtapeAmenagee, EtapeCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
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
  xExactA,
  xExactC,
  xExactD,
} from "../../ui6e/formatEquationsExpLog";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEquationsExpLog } from "./index";

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
// Feuilles enrichies (corrigé détaillé, barème, version aménagée). Les réponses viennent TOUJOURS
// de `formatReponseAttenduePhaseLatex` (la même fonction que `construireCorrection` et que la
// réponse révélée de l'écran interactif) ; les étapes intermédiaires (discriminant, racines
// rejetées, valeur testée dans la CE) sont recalculées depuis les paramètres de l'instance.
// Barème : 4 critères d'1 point, en correspondance 1-1 avec les 4 étapes de la version aménagée.
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

/** `x = log_base(t)` exact pour une valeur de t (entier, ln(t), ou ln(t)/ln(base)). */
function xDeTLatex(ex: ExerciceEqLogC, t: number): string {
  return xExactC(ex, t);
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

function difficulteEquationsExpLog(exercice: ExerciceEquationsExpLog): 1 | 2 | 3 {
  switch (exercice.famille) {
    case "A":
      return exercice.estPuissancePropre && (exercice.p as number) > 0 ? 1 : 2;
    case "B":
      return 2;
    case "C":
      return 3;
    case "D":
      return 1;
    case "E":
      return 3;
    case "G":
      return exercice.type === "discriminantNegatif" ? 2 : 3;
  }
}

/** Durée indicative par instance (minutes), moyenne pondérée des familles : A 4, B 6, C 8, D 3,
 * E 8, G 6. */
const DUREE_MINUTES_EQUATIONS_EXP_LOG = 6;

// ---------------------------------------------------------------------------- Famille A

function correctionA(ex: ExerciceEqLogA): EtapeCorrection[] {
  const base = String(ex.base);
  const affine = formatAffineLatex(ex.m, ex.n);
  const etapes: EtapeCorrection[] = [{ label: "Condition", fragments: [texte("Aucune condition d'existence : "), latex(`${base}^{${affine}}`), texte(" est défini pour tout réel x.")] }];
  if (ex.estPuissancePropre) {
    etapes.push({ label: "Méthode", sousQuestion: "a", fragments: [texte("Le second membre est une puissance de "), latex(base), texte(" : "), latex(`${formatCLatex(ex)}=${base}^{${ex.p}}`), texte(", on égale les exposants (aucun logarithme utile).")] });
  } else {
    etapes.push({ label: "Méthode", sousQuestion: "a", fragments: [latex(String(ex.C)), texte(" n'est pas une puissance entière de "), latex(base), texte(" : on prend le logarithme, "), latex(`${base}^{u}=${ex.C}\\iff u=\\log_{${base}}(${ex.C})=\\dfrac{\\ln(${ex.C})}{\\ln(${base})}`), texte(".")] });
  }
  etapes.push({ label: "Calcul", sousQuestion: "a", fragments: [latex(`${affine}=${exposantExactA(ex)}`)] });
  const secondMembre = ex.p !== null ? String(ex.p - ex.n) : `${exposantExactA(ex)}${ex.n === 0 ? "" : ex.n > 0 ? `-${ex.n}` : `+${-ex.n}`}`;
  etapes.push({ label: "Calcul", sousQuestion: "b", fragments: [latex(`${formatCoef(ex.m)}x=${secondMembre}`), texte(", donc "), latex(egaliteX(rep(ex, "aEcran2")[0]))] });
  etapes.push({ label: "Conclusion", fragments: [latex(ensembleLatex([xExactA(ex)]))] });
  const piege = piegeA(ex);
  if (piege) etapes.push({ label: "Piège", fragments: piege });
  return etapes;
}

function formatCoef(m: number): string {
  return m === 1 ? "" : m === -1 ? "-" : String(m);
}

/** Piège propre à l'instance — `null` quand aucun ne s'applique (ex. 5^{x+4} = 25 : m = 1, rien à
 * diviser), pour ne jamais afficher un avertissement hors sujet. */
function piegeA(ex: ExerciceEqLogA): FragmentConsigne[] | null {
  if (ex.estPuissancePropre && ex.p === 0) return [texte("Le second membre vaut 1 : "), latex(`1=${ex.base}^{0}`), texte(", l'exposant est 0 (pas 1).")];
  if (ex.estPuissancePropre && (ex.p as number) < 0) return [texte("Une fraction "), latex(`\\dfrac{1}{${ex.base}^{k}}`), texte(" s'écrit "), latex(`${ex.base}^{-k}`), texte(" : l'exposant est NÉGATIF.")];
  if (!ex.estPuissancePropre) return [latex(`\\log_{${ex.base}}(${ex.C})=\\dfrac{\\ln(${ex.C})}{\\ln(${ex.base})}`), texte(", et non "), latex(`\\dfrac{\\ln(${ex.base})}{\\ln(${ex.C})}`), texte(" ni "), latex(`\\ln\\!\\left(\\dfrac{${ex.C}}{${ex.base}}\\right)`), texte(".")];
  if (ex.m === 1) return null;
  const n = ex.n === 0 ? "" : ex.n > 0 ? `on soustrait ${ex.n}, puis ` : `on ajoute ${-ex.n}, puis `;
  if (ex.m < 0) return [texte(`Pour isoler x, ${n}on divise par `), latex(String(ex.m)), texte(" : diviser par un nombre négatif change le signe du résultat.")];
  return [texte(`Pour isoler x, ${n}on divise par `), latex(String(ex.m)), texte(" — dans cet ordre.")];
}

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

function amenageA(ex: ExerciceEqLogA): EtapeAmenagee[] {
  const base = String(ex.base);
  return [
    { consigne: [texte("Le second membre est-il une puissance de "), latex(base), texte(" ? Si oui, écris-le sous cette forme.")], rappel: [texte("Pense aux exposants 0 et négatifs : "), latex(`${base}^{0}=1`), texte(", "), latex(`${base}^{-1}=\\dfrac{1}{${base}}`), texte(".")], points: 1 },
    { consigne: [texte("Écris l'équation vérifiée par l'exposant "), latex(formatAffineLatex(ex.m, ex.n)), texte(".")], rappel: [texte("Sinon, prends le logarithme : "), latex(`${base}^{u}=C\\iff u=\\dfrac{\\ln(C)}{\\ln(${base})}`), texte(".")], points: 1 },
    { consigne: [texte("Isole x dans cette équation du premier degré.")], rappel: [texte("Enlève d'abord le terme constant, puis divise par le coefficient de x.")], points: 1 },
    { consigne: [texte("Donne x en valeur exacte ou arrondie au millième.")], points: 1 },
  ];
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

function correctionB(ex: ExerciceEqLogB): EtapeCorrection[] {
  return [
    { label: "Condition", fragments: [texte("Aucune condition d'existence : les deux exponentielles sont définies sur ℝ.")] },
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Bases différentes ("), latex(`${ex.base1}`), texte(" et "), latex(`${ex.base2}`), texte(") : on prend ln des deux membres, avec "), latex("\\ln(a^u)=u\\cdot\\ln(a)"), texte(".")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(rep(ex, "bEcran1")[0])] },
    { label: "Calcul", sousQuestion: "b", fragments: [texte("On regroupe les termes en x : "), latex(egaliteRegroupeeB(ex)), texte(", donc "), latex(egaliteX(rep(ex, "bEcran2")[0]))] },
    { label: "Conclusion", fragments: [latex(`S=\\left\\{${rep(ex, "bEcran2")[0].split(" \\approx")[0]}\\right\\}`)] },
    { label: "Piège", fragments: [texte("Tout l'exposant multiplie le ln : "), latex(`\\ln\\!\\left(${ex.base1}^{${formatAffineLatex(ex.m1, ex.n1)}}\\right)=(${formatAffineLatex(ex.m1, ex.n1)})\\ln(${ex.base1})`), texte(" — parenthèses obligatoires.")] },
  ];
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

function amenageB(ex: ExerciceEqLogB): EtapeAmenagee[] {
  return [
    { consigne: [texte("Prends le logarithme népérien des deux membres.")], rappel: [texte("Les bases "), latex(`${ex.base1}`), texte(" et "), latex(`${ex.base2}`), texte(" sont différentes : on ne peut pas égaler les exposants.")], points: 1 },
    { consigne: [texte("Fais descendre chaque exposant devant son ln.")], rappel: [latex("\\ln(a^u)=u\\cdot\\ln(a)"), texte(" : garde des parenthèses autour de u.")], points: 1 },
    { consigne: [texte("Regroupe les termes en x d'un côté, les autres de l'autre côté.")], rappel: [texte("Développe d'abord, puis mets x en évidence.")], points: 1 },
    { consigne: [texte("Isole x : valeur exacte ou arrondie au millième.")], points: 1 },
  ];
}

// ---------------------------------------------------------------------------- Famille C

function correctionC(ex: ExerciceEqLogC): EtapeCorrection[] {
  const b = formatBaseLatex(ex.base);
  const racines = racinesEnT(ex);
  const rejetees = racines.filter((t) => t <= 0);
  const delta = ex.B * ex.B - 4 * ex.A * ex.Cc;
  const etapes: EtapeCorrection[] = [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("On pose "), latex(`t=${b}^{x}`), texte(" ; alors "), latex(`${b}^{2x}=\\left(${b}^{x}\\right)^{2}=t^{2}`), texte(".")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(equationEnTLatex(ex))] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(`\\Delta=(${ex.B})^{2}-4\\cdot ${ex.A}\\cdot (${ex.Cc})=${delta}`), texte(", racines "), latex(`t_1=${racines[0]}`), texte(" et "), latex(`t_2=${racines[1]}`), texte(".")] },
    {
      label: "Condition",
      sousQuestion: "b",
      fragments:
        rejetees.length === 0
          ? [texte("Comme "), latex(`${b}^{x}>0`), texte(", t doit être strictement positif : les deux valeurs conviennent.")]
          : [texte("Comme "), latex(`${b}^{x}>0`), texte(", t doit être strictement positif : on rejette "), latex(rejetees.map((t) => `t=${t}`).join(",\\ ")), texte(".")],
    },
  ];
  if (ex.tValides.length > 0) {
    etapes.push({ label: "Calcul", sousQuestion: "c", fragments: ex.tValides.flatMap((t, i) => [...(i === 0 ? [] : [texte(" ; ")]), latex(`${b}^{x}=${t}\\iff ${egaliteX(rep(ex, "cEcran3")[i])}`)]) });
  } else {
    etapes.push({ label: "Calcul", sousQuestion: "c", fragments: [texte("Aucune valeur de t ne convient : il n'y a pas de x à calculer.")] });
  }
  etapes.push({ label: "Conclusion", fragments: [latex(ensembleLatex(ex.tValides.map((t) => xDeTLatex(ex, t))))] });
  etapes.push({
    label: "Piège",
    fragments: rejetees.length > 0 ? [texte("Une racine "), latex("t\\le 0"), texte(" ne donne AUCUNE solution : "), latex(`${b}^{x}`), texte(" n'est jamais négatif ni nul.")] : [latex(`${b}^{2x}=t^{2}`), texte(", et non "), latex("2t"), texte(".")],
  });
  return etapes;
}

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

function amenageC(ex: ExerciceEqLogC): EtapeAmenagee[] {
  const b = formatBaseLatex(ex.base);
  return [
    { consigne: [texte("Pose "), latex(`t=${b}^{x}`), texte(" et réécris l'équation avec t seulement.")], rappel: [latex(`${b}^{2x}=\\left(${b}^{x}\\right)^{2}`)], points: 1 },
    { consigne: [texte("Résous l'équation du second degré en t.")], rappel: [latex("\\Delta=b^{2}-4ac"), texte(", puis "), latex("t=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}")], points: 1 },
    { consigne: [texte("Barre les valeurs de t impossibles.")], rappel: [latex(`${b}^{x}`), texte(" est toujours strictement positif.")], points: 1 },
    { consigne: [texte("Pour chaque t restant, calcule x, puis donne S.")], rappel: [latex(`${b}^{x}=t\\iff x=\\dfrac{\\ln(t)}{\\ln(${b})}`)], points: 1 },
  ];
}

// ---------------------------------------------------------------------------- Famille D

function puissanceDLatex(ex: ExerciceEqLogD): string {
  return `${ex.a}^{${ex.k}}`;
}

function correctionD(ex: ExerciceEqLogD): EtapeCorrection[] {
  const calcul = ex.k < 0 ? `x=${puissanceDLatex(ex)}=\\dfrac{1}{${ex.a}^{${-ex.k}}}=${xExactD(ex)}` : `x=${puissanceDLatex(ex)}=${xExactD(ex)}`;
  return [
    { label: "Condition", sousQuestion: "a", fragments: [texte("L'argument du logarithme doit être strictement positif : "), latex("x>0"), texte(", soit "), latex(`\\text{CE} : ${rep(ex, "dEcran1")[0]}`), texte(".")] },
    { label: "Méthode", sousQuestion: "b", fragments: [latex(`\\log_{${ex.a}}(x)=${ex.k}\\iff x=${puissanceDLatex(ex)}`), texte(" (logarithme et exponentielle de même base se défont).")] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(ex.k === 0 ? `x=${ex.a}^{0}=1` : calcul)] },
    { label: "Vérification", fragments: [latex(`${xExactD(ex)}>0`), texte(" : la valeur respecte la CE.")] },
    { label: "Conclusion", fragments: [latex(ensembleLatex([xExactD(ex)]))] },
    { label: "Piège", fragments: ex.k < 0 ? [latex(`${ex.a}^{-n}=\\dfrac{1}{${ex.a}^{n}}`), texte(", jamais un nombre négatif.")] : ex.k === 0 ? [latex(`${ex.a}^{0}=1`), texte(", pas 0.")] : [latex(`x=${puissanceDLatex(ex)}`), texte(", pas "), latex(`${ex.k}^{${ex.a}}`), texte(" ni "), latex(`${ex.a}\\cdot ${ex.k}`), texte(".")] },
  ];
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

function amenageD(ex: ExerciceEqLogD): EtapeAmenagee[] {
  return [
    { consigne: [texte("Écris la condition d'existence.")], rappel: [texte("Ce qui est dans le logarithme doit être strictement positif.")], points: 1 },
    { consigne: [texte("Enlève le logarithme : écris x comme une puissance de "), latex(String(ex.a)), texte(".")], rappel: [latex("\\log_a(x)=k\\iff x=a^{k}")], points: 1 },
    { consigne: [texte("Calcule cette puissance.")], rappel: ex.k < 0 ? [latex("a^{-n}=\\dfrac{1}{a^{n}}")] : ex.k === 0 ? [latex("a^{0}=1")] : undefined, points: 1 },
    { consigne: [texte("Ta réponse respecte-t-elle la condition ? Conclus.")], points: 1 },
  ];
}

// ---------------------------------------------------------------------------- Famille E

function correctionE(ex: ExerciceEqLogE): EtapeCorrection[] {
  const S = ex.p + ex.q + ex.e;
  const P = ex.p * ex.q - ex.d;
  const delta = S * S - 4 * P;
  const [r1, r2] = ex.racinesAlgebriques;
  const statut = (r: number) => (ex.solutionsFinales.includes(r) ? `${r}\\ \\text{convient}` : `${r}\\ \\text{est rejeté}`);
  const b = formatBaseLatex(ex.base);
  return [
    { label: "Condition", sousQuestion: "a", fragments: [latex(`x-${ex.p}>0`), texte(", "), latex(`x-${ex.q}>0`), texte(" et "), latex(`${formatAffineLatex(ex.e, ex.d)}>0`), texte(", donc "), latex(`\\text{CE} : ${ceELatex(ex)}`), texte(".")] },
    { label: "Méthode", sousQuestion: "b", fragments: [latex(`\\log_{${b}}(A)+\\log_{${b}}(B)=\\log_{${b}}(A\\cdot B)`), texte(", puis on égale les arguments (même base).")] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(rep(ex, "eEcran2")[0])] },
    { label: "Calcul", sousQuestion: "c", fragments: [latex(`${polynomeELatex(ex)}=0`), texte(", "), latex(`\\Delta=${delta}`), texte(", racines "), latex(`x_1=${r1}`), texte(" et "), latex(`x_2=${r2}`), texte(".")] },
    { label: "Vérification", sousQuestion: "c", fragments: [texte("Avec la CE "), latex(ceELatex(ex)), texte(" : "), latex(`${statut(r1)}\\ ;\\ ${statut(r2)}`), texte(".")] },
    { label: "Conclusion", fragments: [latex(ensembleLatex(ex.solutionsFinales.map(String)))] },
    { label: "Piège", fragments: ex.solutionsFinales.length < 2 ? [texte("Une racine de l'équation du second degré n'est solution que si elle respecte la CE de l'équation de DÉPART.")] : [latex(`\\log_{${b}}(A)+\\log_{${b}}(B)\\neq\\log_{${b}}(A+B)`), texte(" : la somme de logarithmes devient le logarithme du PRODUIT.")] },
  ];
}

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

function amenageE(ex: ExerciceEqLogE): EtapeAmenagee[] {
  const b = formatBaseLatex(ex.base);
  return [
    { consigne: [texte("Écris la condition d'existence.")], rappel: [texte("Chacun des trois arguments doit être strictement positif ; garde la condition la plus forte.")], points: 1 },
    { consigne: [texte("Écris le membre de gauche avec un seul logarithme, puis égale les arguments.")], rappel: [latex(`\\log_{${b}}(A)+\\log_{${b}}(B)=\\log_{${b}}(A\\cdot B)`)], points: 1 },
    { consigne: [texte("Développe et résous l'équation du second degré.")], rappel: [latex("\\Delta=b^{2}-4ac")], points: 1 },
    { consigne: [texte("Garde seulement les racines qui respectent la condition. Conclus.")], points: 1 },
  ];
}

// ---------------------------------------------------------------------------- Famille G

function ceViolationLatex(ex: Extract<ExerciceEqLogG, { type: "violationCE" }>): string {
  return `${formatAffineLatex(ex.m1, ex.n1)}>0 \\ \\text{et}\\ ${formatAffineLatex(ex.m2, ex.n2)}>0`;
}

function correctionG(ex: ExerciceEqLogG): EtapeCorrection[] {
  const simplifiee = rep(ex, "gEcran1")[0];
  if (ex.type === "violationCE") {
    const x0 = (ex.n2 - ex.n1) / (ex.m1 - ex.m2);
    const v = ex.m1 * x0 + ex.n1;
    return [
      { label: "Condition", fragments: [latex(`\\text{CE} : ${ceViolationLatex(ex)}`)] },
      { label: "Méthode", sousQuestion: "a", fragments: [texte("Deux logarithmes de même base sont égaux si et seulement si leurs arguments le sont.")] },
      { label: "Calcul", sousQuestion: "a", fragments: [latex(simplifiee), texte(", donc "), latex(`x=${x0}`), texte(".")] },
      { label: "Vérification", sousQuestion: "b", fragments: [texte("Pour "), latex(`x=${x0}`), texte(" : "), latex(`${formatAffineLatex(ex.m1, ex.n1)}=${v}\\le 0`), texte(" — la CE n'est pas respectée.")] },
      { label: "Conclusion", fragments: [latex("S=\\varnothing")] },
      { label: "Piège", fragments: [texte("La valeur trouvée en égalant les arguments n'est qu'une CANDIDATE : sans test de la CE, on conclurait à tort "), latex(`S=\\{${x0}\\}`), texte(".")] },
    ];
  }
  if (ex.type === "identite") {
    const b = formatBaseLatex(ex.base);
    return [
      { label: "Condition", fragments: [latex(`${formatAffineLatex(ex.m1, ex.n1)}>0`), texte(" et "), latex(`${formatAffineLatex(ex.m2, ex.n2)}>0`), texte(", soit "), latex(`\\text{CE} : ${ceIdentiteLatex(ex)}`), texte(".")] },
      { label: "Méthode", sousQuestion: "a", fragments: [texte("Propriété du produit au membre de gauche : "), latex(`\\log_{${b}}(A)+\\log_{${b}}(B)=\\log_{${b}}(A\\cdot B)`), texte(".")] },
      { label: "Calcul", sousQuestion: "a", fragments: [latex(simplifiee)] },
      { label: "Conclusion", sousQuestion: "b", fragments: [texte("L'égalité est vraie pour tout x où l'équation a un sens : "), latex(reponseBreveEquationsExpLog(ex)[0].valeur)] },
      { label: "Piège", fragments: [texte("« Vrai pour tout x » ne veut pas dire "), latex("S=\\mathbb{R}"), texte(" : seulement les x de la CE.")] },
    ];
  }
  return [
    { label: "Condition", fragments: [latex(`x^{2}+${ex.b0}>0`), texte(" pour tout réel x : pas de restriction.")] },
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Même base des deux côtés : on égale les arguments.")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`x^{2}+${ex.b0}=${ex.c0}`), texte(", donc "), latex(simplifiee), texte(".")] },
    { label: "Vérification", sousQuestion: "b", fragments: [texte("Un carré n'est jamais négatif : "), latex(`x^{2}=${ex.c0 - ex.b0}`), texte(" n'a pas de solution réelle.")] },
    { label: "Conclusion", fragments: [latex("S=\\varnothing")] },
    { label: "Piège", fragments: [texte("Écrire "), latex(`x=\\pm\\sqrt{${ex.c0 - ex.b0}}`), texte(" n'a pas de sens : la racine carrée d'un nombre négatif n'existe pas.")] },
  ];
}

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

function amenageG(ex: ExerciceEqLogG): EtapeAmenagee[] {
  const methode: FragmentConsigne[] = ex.type === "identite" ? [texte("Écris le membre de gauche avec un seul logarithme.")] : [texte("Les deux membres ont la même base : égale les arguments.")];
  return [
    { consigne: methode, rappel: ex.type === "identite" ? [latex("\\log_b(A)+\\log_b(B)=\\log_b(A\\cdot B)")] : [latex("\\log_b(A)=\\log_b(B)\\iff A=B")], points: 1 },
    { consigne: [texte("Simplifie l'équation obtenue au maximum.")], points: 1 },
    { consigne: [texte("Écris la condition d'existence de l'équation de départ.")], rappel: [texte("Chaque argument doit être strictement positif.")], points: 1 },
    { consigne: [texte("Compare ton résultat à cette condition et conclus.")], rappel: [texte("Trois issues possibles : aucune solution, ou tous les x de la condition.")], points: 1 },
  ];
}

// ---------------------------------------------------------------------------- Dispatch

function correctionDetailleeEquationsExpLog(exercice: ExerciceEquationsExpLog): EtapeCorrection[] {
  switch (exercice.famille) {
    case "A":
      return correctionA(exercice);
    case "B":
      return correctionB(exercice);
    case "C":
      return correctionC(exercice);
    case "D":
      return correctionD(exercice);
    case "E":
      return correctionE(exercice);
    case "G":
      return correctionG(exercice);
  }
}

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

function enonceAmenageEquationsExpLog(exercice: ExerciceEquationsExpLog): EtapeAmenagee[] {
  switch (exercice.famille) {
    case "A":
      return amenageA(exercice);
    case "B":
      return amenageB(exercice);
    case "C":
      return amenageC(exercice);
    case "D":
      return amenageD(exercice);
    case "E":
      return amenageE(exercice);
    case "G":
      return amenageG(exercice);
  }
}

export const adaptateurEvaluationEquationsExpLog: AdaptateurFeuilleExercices<ExerciceEquationsExpLog> = {
  titreDocument: "Résoudre une équation exponentielle ou logarithmique — Évaluation",
  nomFichierBase: "equations-exp-log",
  genererInstance: genererExerciceEquationsExpLog,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as FamilleEquationsExpLog),
  construireEnonce: construireEnonceEquationsExpLog,
  construireCorrection: construireCorrectionEquationsExpLog,
  difficulte: difficulteEquationsExpLog,
  reponseBreve: reponseBreveEquationsExpLog,
  correctionDetaillee: correctionDetailleeEquationsExpLog,
  bareme: baremeEquationsExpLog,
  enonceAmenage: enonceAmenageEquationsExpLog,
  dureeMinutes: DUREE_MINUTES_EQUATIONS_EXP_LOG,
};
