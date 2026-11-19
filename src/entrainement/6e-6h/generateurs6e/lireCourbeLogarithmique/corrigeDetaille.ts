import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { CourbeLog, ExerciceAssocierCourbesLog, ExerciceLectureCourbeLog, ExerciceLireCourbeLogarithmique } from "../../core6e/lireCourbeLogarithmique.types";
import type { PhaseLireCourbeLogarithmique } from "../../moteur6e/typesLireCourbeLogarithmique";
import { PHASES_ASSOCIER, PHASES_LECTURE } from "../../moteur6e/typesLireCourbeLogarithmique";
import {
  LETTRES_EXPRESSIONS,
  argumentLatex,
  baseLatex,
  coordonneesLatex,
  courbesExercice,
  entierBase,
  estCroissante,
  logLatex,
  expressionLatex,
  formatReponseAttenduePhaseLatex,
  nb,
  pointBase,
  pointUn,
} from "../../ui6e/formatLireCourbeLogarithmique";
import { figureLecture, figuresAssocier } from "../../ui6e/figureCourbeLogarithmique";
import { COURS_PARAMETRES, COURS_PROPRIETES } from "../../ui6e/corrigeLogarithmes2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen85` (lire une courbe logarithmique) — règle
 * `.claude/rules/feuilles-evaluations.md`, conventions « Lectures graphiques et décisions » : chaque
 * étape a un bloc Calcul où chaque chose lue est une ligne AVEC une relation (asymptote `x = c`,
 * points de la courbe, `log_a(k) = ±1`), la justification dit où on lit. Textes et réponses :
 * `ui6e/formatLireCourbeLogarithmique.ts` (mêmes fonctions que l'écran) ; figures annotées
 * `ui6e/figureCourbeLogarithmique.ts`.
 */

const t = texte;
const f = latex;

function rep(e: ExerciceLireCourbeLogarithmique, phase: PhaseLireCourbeLogarithmique): FragmentConsigne[] {
  return formatReponseAttenduePhaseLatex(e, phase).map(f);
}

/** Argument x − c évalué en un nombre : « 3 − 1 », « 0 + 2 », « 4 ». */
function argumentEn(x: number, c: number): string {
  if (c === 0) return String(x);
  return c > 0 ? `${x}-${c}` : `${x}+${-c}`;
}

/** Lignes qui lisent la base au point une unité plus haut (a > 1) ou plus bas (0 < a < 1). */
function lignesBase(k: CourbeLog, nomPoint: (p: { x: number; y: number }) => string): LigneCalcul[] {
  const un = pointUn(k);
  const b = pointBase(k);
  const n = entierBase(k.base);
  const monte = estCroissante(k.base);
  const lignes: LigneCalcul[] = [
    ligne(nomPoint(un), "point lu à l'abscisse c + 1 : l'argument vaut 1, le logarithme 0, l'ordonnée est d"),
    ligne(nomPoint(b), `point de la courbe une unité plus ${monte ? "haut" : "bas"}, sur une intersection du quadrillage`),
    ligne(`\\log_a(${argumentEn(b.x, k.c)})=${monte ? "1" : "-1"}`, `ordonnée ${monte ? "d + 1" : "d − 1"}`),
    ligne(`\\log_a(${n})=${monte ? "1" : "-1"}`),
  ];
  if (monte) lignes.push(ligne(`a=${n}`, [f("\\log_a(a)=1")]));
  else lignes.push(ligne(`a^{-1}=${n}`, [f("\\log_a(y)=-1\\iff a^{-1}=y")]), ligne(`a=${baseLatex(k.base)}`, "on prend l'inverse"));
  return lignes;
}

// ============================================================================
// Variante « lecture » : asymptote, domaine, base, expression.
// ============================================================================

function corrigeLecture(e: ExerciceLectureCourbeLog): EtapeCorrection[] {
  const k = e.courbe;
  const { c, d } = k;
  const croissante = estCroissante(k.base);
  const pointF = (p: { x: number; y: number }) => `f(${p.x})=${p.y}`;
  const piegeA: FragmentConsigne[] | null = croissante && c !== 0 ? [t(`L'asymptote x = ${nb(c)} donne l'argument `), f(argumentLatex(c)), t(", et non "), f(argumentLatex(-c)), t(" : le nombre change de signe dans la parenthèse.")] : null;
  const piegeC: FragmentConsigne[] | null = !croissante
    ? [t("La courbe descend : le point une unité plus bas donne "), f(`\\log_a(${entierBase(k.base)})=-1`), t(", donc "), f(`a=${baseLatex(k.base)}`), t(` et non ${entierBase(k.base)}.`)]
    : c === 0
      ? [t("La base se lit une unité au-dessus du point d'abscisse 1 (ordonnée d + 1), pas au point d'ordonnée 1.")]
      : null;
  return [
    // a) asymptote
    utilise("a", [t("Un logarithme n'est défini que pour un argument strictement positif : l'asymptote verticale est la droite où l'argument "), f("x-c"), t(` s'annule ${COURS_PARAMETRES}.`)]),
    calcul("a", [ligne(`x=${c}`, `droite en pointillés : elle coupe l'axe des abscisses en ${nb(c)}`), ligne(`${argumentLatex(c)}=0`, "l'argument s'annule sur l'asymptote")]),
    resultat("a", [t("Asymptote verticale : "), ...rep(e, "asymptote")]),
    ...(piegeA ? [piege("a", piegeA)] : []),
    // b) domaine
    utilise("b", [t("Le domaine est l'ensemble des réels pour lesquels l'argument est strictement positif ; la courbe n'existe qu'à droite de l'asymptote, sans la toucher " + COURS_PROPRIETES + ".")]),
    calcul("b", [ligne(`${argumentLatex(c)}>0`, "argument strictement positif"), ligne(`x>${c}`, c === 0 ? "" : c > 0 ? `on ajoute ${c}` : `on retranche ${-c}`)]),
    resultat("b", [...rep(e, "domaine"), t(` : la borne ${nb(c)} est exclue.`)]),
    // c) base
    utilise("c", [t(`Au point d'abscisse ${nb(c + 1)}, l'argument vaut 1 et `), f("\\log_a(1)=0"), t(" : l'ordonnée est d. Une unité plus haut (courbe croissante, a > 1) ou plus bas (courbe décroissante, 0 < a < 1), le logarithme vaut ±1, ce qui donne la base " + COURS_PARAMETRES + ".")]),
    calcul("c", [ligne(croissante ? "x_1<x_2\\Rightarrow f(x_1)<f(x_2)" : "x_1<x_2\\Rightarrow f(x_1)>f(x_2)", croissante ? "la courbe monte : a > 1" : "la courbe descend : 0 < a < 1"), ...lignesBase(k, pointF)]),
    { ...resultat("c", [t("Base : "), ...rep(e, "base")]), figureHtml: figureLecture(e, "corrige") },
    verification("c", [t("On recalcule le point lu : "), f(`\\log_{${baseLatex(k.base).replace("\\dfrac", "\\frac")}}(${entierBase(k.base)})=${croissante ? "1" : "-1"}`), t(" ✓")]),
    ...(piegeC ? [piege("c", piegeC)] : []),
    // d) expression
    utilise("d", [t("On assemble la forme "), f("f(x)=\\log_a(x-c)+d"), t(" avec c (asymptote), a (base) et d, l'ordonnée du point d'abscisse c + 1 " + COURS_PARAMETRES + ".")]),
    calcul("d", [
      ligne(`d=f(${c + 1})`, [f("\\log_a(1)=0")]),
      ligne(`=${d}`, `ordonnée lue au point d'abscisse ${nb(c + 1)}`),
      ligne(`f(x)=${expressionLatex(k)}`, `c = ${nb(c)}, a = ${croissante ? entierBase(k.base) : `1/${entierBase(k.base)}`}, d = ${nb(d)}`),
    ]),
    resultat("d", [t("Expression : "), ...rep(e, "expression")]),
    verification("d", [t("Au point qui donne la base : "), f(`f(${pointBase(k).x})=${logLatex(k.base, argumentEn(pointBase(k).x, c))}${d === 0 ? "" : d > 0 ? `+${d}` : `-${-d}`}=${pointBase(k).y}`), t(" ✓")]),
  ];
}

// ============================================================================
// Variante « associer » : une courbe par écran.
// ============================================================================

function corrigeAssocier(e: ExerciceAssocierCourbesLog): EtapeCorrection[] {
  const courbes = courbesExercice(e);
  const jumelles = e.expressions.flatMap((k, i) => e.expressions.map((m, j) => [k, m, i, j] as const)).find(([k, m, i, j]) => i < j && k.c === m.c && k.d === m.d && estCroissante(k.base) === estCroissante(m.base));
  return PHASES_ASSOCIER.flatMap((phase, j): EtapeCorrection[] => {
    const sq = "abcd"[j]!;
    const k = courbes[j]!;
    const i = e.expressionDeCourbe[j]!;
    const nom = `\\mathcal{C}_{${j + 1}}`;
    const point = (p: { x: number; y: number }) => `${coordonneesLatex(p)}\\in ${nom}`;
    const lignes: LigneCalcul[] = [
      ligne(`x=${k.c}`, `asymptote de la courbe ${j + 1} (pointillés)`),
      ligne(estCroissante(k.base) ? "x_1<x_2\\Rightarrow y_1<y_2" : "x_1<x_2\\Rightarrow y_1>y_2", estCroissante(k.base) ? "la courbe monte : a > 1" : "la courbe descend : 0 < a < 1"),
      ...lignesBase(k, point),
      ligne(`d=${k.d}`, `ordonnée du point d'abscisse ${nb(k.c + 1)}`),
      ligne(`y=${expressionLatex(k)}`, `expression ${LETTRES_EXPRESSIONS[i]}`),
    ];
    const etapes: EtapeCorrection[] = [
      utilise(sq, [t("Pour chaque courbe : l'asymptote x = c, le sens de variation (croissante si a > 1, décroissante si 0 < a < 1), le point d'abscisse c + 1 (ordonnée d) et le point une unité plus haut ou plus bas, qui donne la base " + COURS_PARAMETRES + ".")]),
      calcul(sq, lignes),
      { ...resultat(sq, [t(`Courbe ${j + 1} : `), ...rep(e, phase)]), ...(j === 0 ? { figureHtml: `<div class="grille-graphes-cyclo">${figuresAssocier(e, "corrige").join("")}</div>` } : {}) },
    ];
    if (jumelles && (i === jumelles[2] || i === jumelles[3])) {
      const [k1, , i1, i2] = jumelles;
      etapes.push(
        piege(sq, [
          t(`${LETTRES_EXPRESSIONS[i1]} et ${LETTRES_EXPRESSIONS[i2]} ont la même asymptote, passent toutes deux par `),
          f(coordonneesLatex(pointUn(k1))),
          t(" et varient dans le même sens : seule la base les distingue, lue au point une unité plus haut ou plus bas."),
        ]),
      );
    }
    return etapes;
  });
}

export function correctionDetailleeLireCourbeLogarithmique(e: ExerciceLireCourbeLogarithmique): EtapeCorrection[] {
  return e.variante === "lecture" ? corrigeLecture(e) : corrigeAssocier(e);
}

/** Lettre d'étape de l'écran `phase`. */
export function lettrePhaseLireCourbeLogarithmique(e: ExerciceLireCourbeLogarithmique, phase: PhaseLireCourbeLogarithmique): string {
  const phases: PhaseLireCourbeLogarithmique[] = e.variante === "lecture" ? PHASES_LECTURE : PHASES_ASSOCIER;
  return "abcd"[Math.max(0, phases.indexOf(phase))]!;
}
