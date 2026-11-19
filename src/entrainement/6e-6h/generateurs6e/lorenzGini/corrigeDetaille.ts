import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, lignesDepuisChaine, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { aireConcentration, coefficientGini, courbesSeCroisent, evaluerLorenz } from "../../core6e/lorenzGini";
import type { CourbeLorenz, ExerciceLorenzComparaison, ExerciceLorenzGini, ExerciceLorenzLecture, ExerciceLorenzParametre } from "../../core6e/lorenzGini";
import { aireEgaleLatex, aireSousCourbeLatex, calculAireLatex, formatReponseAttenduePhaseLatex, giniEgalLatex, indiceCourbe, lectureEgaleLatex, nomRepartition, phraseCroisement, reponseChoix, substitutionLatex } from "../../ui6e/formatLorenzGini";
import { decimalLatex, decimalTexte, fractionDepuisValeur } from "../../ui6e/nombresExactsIntegrales";
import { figuresCorrigeSvg } from "../../ui6e/figureLorenzGini";
import { COURS_PROBLEMES, listeFormules } from "../../ui6e/corrigeIntegrales2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen82` (courbe de Lorenz et coefficient de Gini) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par écran : lecture (L(p) substitué et calculé,
 * interprétation part de population / part des revenus, aire de concentration par primitive entre
 * crochets, G = 2𝒜), comparaison (deux aires, deux coefficients, classement), paramètre (𝒜(a), G(a),
 * équation en a). Chaînes de l'écran (`formatLorenzGini.ts`) éclatées ligne à ligne.
 */

type E = ExerciceLorenzGini;
const t = texte;
const f = latex;

const METHODE_AIRE: FragmentConsigne[] = [
  t("Sur [0 ; 1], la diagonale "),
  f("y=x"),
  t(" est au-dessus de la courbe de Lorenz : l'aire de la région comprise entre elles est "),
  f("\\mathcal{A}=\\displaystyle\\int_0^1\\left(x-L(x)\\right)dx"),
  t(` ${COURS_PROBLEMES}.`),
];

const METHODE_GINI: FragmentConsigne[] = [
  t("Le coefficient de Gini rapporte cette aire à celle du triangle sous la diagonale, qui vaut "),
  f("\\frac{1}{2}"),
  t(" : "),
  f("G=\\dfrac{\\mathcal{A}}{\\frac{1}{2}}=2\\,\\mathcal{A}"),
  t(`, toujours compris entre 0 (égalité parfaite) et 1 ${COURS_PROBLEMES}.`),
];

function pL(p: number): string {
  return decimalLatex(p, 3);
}

/** Figures du corrigé côte à côte. */
function figures(e: E): string {
  const fs = figuresCorrigeSvg(e);
  return fs.length === 1 ? fs[0]! : `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px">${fs.join("")}</div>`;
}

/** Aire de concentration : primitive entre crochets (chaîne de l'écran), puis valeur. */
function lignesAire(c: CourbeLorenz, nom: string): LigneCalcul[] {
  const chaine = `${nom}=${calculAireLatex(c)}`;
  const lignes = lignesDepuisChaine(chaine, ["définition", "primitive terme à terme", "F(1) − F(0), avec F(0) = 0"]);
  const fin = aireEgaleLatex(c);
  if (lignes[lignes.length - 1]!.latex !== fin) lignes.push(ligne(fin, "on réduit"));
  return lignes;
}

function lignesGini(c: CourbeLorenz, nomG: string, nomA: string): LigneCalcul[] {
  const aire = aireEgaleLatex(c).replace(/^=/, "").replace(/\\approx.*$/, "");
  const facteur = /[+-]/.test(aire.slice(1)) ? `\\left(${aire}\\right)` : aire;
  return [ligne(`${nomG}=2\\times ${nomA}`, "définition du coefficient de Gini"), ligne(`=2\\times ${facteur}`, "aire de l'étape précédente"), ligne(giniEgalLatex(c))];
}

// ============================================================================
// Lecture.
// ============================================================================

function lignesValeur(e: ExerciceLorenzLecture): LigneCalcul[] {
  const c = e.courbe;
  const p = e.p;
  const lignes: LigneCalcul[] = [ligne(substitutionLatex(e), `on remplace x par ${decimalTexte(p, 3)}`)];
  if (c.famille === "puissance" && !Number.isInteger(c.parametre)) {
    const fr = fractionDepuisValeur(c.parametre, 12)!;
    const racine = Math.pow(p, 1 / fr.den);
    const rac = fr.den === 2 ? `\\sqrt{${pL(p)}}` : `\\sqrt[${fr.den}]{${pL(p)}}`;
    lignes.push(ligne(`=\\left(${rac}\\right)^{${fr.num}}`, `exposant ${fr.num}/${fr.den} : la racine, puis la puissance ${fr.num}`), ligne(`=${decimalLatex(racine, 6)}^{${fr.num}}`));
  } else if (c.famille === "mixte2" || c.famille === "mixte3") {
    const n = c.famille === "mixte2" ? 2 : 3;
    const a = c.parametre;
    lignes.push(ligne(`=${decimalLatex(a, 6)}\\times ${decimalLatex(p ** n, 6)}+${decimalLatex(1 - a, 6)}\\times ${pL(p)}`, `on calcule la puissance`), ligne(`=${decimalLatex(a * p ** n, 6)}+${decimalLatex((1 - a) * p, 6)}`));
  }
  lignes.push(ligne(lectureEgaleLatex(e)));
  return lignes;
}

function etapesLecture(e: ExerciceLorenzLecture): EtapeCorrection[] {
  const c = e.courbe;
  const p = pL(e.p);
  const v = evaluerLorenz(c, e.p);
  const approche = c.famille === "expo";
  const pct = (x: number) => decimalLatex(x * 100, approche ? 1 : 4);
  const rel = approche ? "\\approx " : "=";
  return [
    utilise("a", [t(`La part des revenus détenue par les ${decimalTexte(e.p * 100, 1)} % ${e.contexte === "pays" ? "les plus pauvres" : "les moins bien payés"} est l'image de `), f(p), t(` par L ${COURS_PROBLEMES}.`)]),
    calcul("a", lignesValeur(e)),
    resultat("a", listeFormules(formatReponseAttenduePhaseLatex(e, "valeur"))),
    utilise("b", [t("En abscisse : une part de la population, rangée des revenus les plus faibles aux plus élevés ; en ordonnée : la part des revenus qu'elle se partage.")]),
    calcul("b", [
      ligne(`${p}=${pct(e.p).replace(/\{,\}0+$/, "")}\\,\\%`, "part de la population (abscisse)"),
      ligne(`L(${p})${rel}${pct(v)}\\,\\%`, "part des revenus (ordonnée)"),
      ligne(`1-L(${p})${rel}${pct(1 - v)}\\,\\%`, "ce que se partagent les autres"),
    ]),
    resultat("b", reponseChoix(e, "interpretation")),
    piege("b", [t("Lire à l'envers : "), f(p), t(" est une part de la population (en abscisse), "), f(`L(${p})`), t(" une part des revenus (en ordonnée). Les plus riches détiennent le reste, "), f(`1-L(${p})`), t(".")]),
    utilise("c", METHODE_AIRE),
    calcul("c", lignesAire(c, "\\mathcal{A}")),
    { ...resultat("c", listeFormules(formatReponseAttenduePhaseLatex(e, "aire"))), figureHtml: figures(e) },
    piege("c", [
      t("Intégrer L au lieu de x − L(x) : on obtient l'aire sous la courbe, "),
      f(`\\displaystyle\\int_0^1 L(x)\\,dx=${aireSousCourbeLatex(c)}`),
      t(Math.abs(aireConcentration(c) - 0.25) < 1e-9 ? " — ici égale à l'aire cherchée par pure coïncidence (les deux aires valent un quart du carré), mais la méthode est fausse." : ", et non l'aire entre la diagonale et la courbe."),
    ]),
    utilise("d", METHODE_GINI),
    calcul("d", lignesGini(c, "G", "\\mathcal{A}")),
    resultat("d", listeFormules(formatReponseAttenduePhaseLatex(e, "gini"))),
    verification("d", [t("La valeur est bien comprise entre 0 et 1 : "), f(`0\\leq ${decimalLatex(coefficientGini(c), 3)}\\leq 1`), t(".")]),
    piege("d", [t("Oublier le facteur 2 (donner l'aire "), f(`\\mathcal{A}${aireEgaleLatex(c)}`), t(" comme coefficient de Gini). Un coefficient supérieur à 1 ou négatif signale toujours une erreur.")]),
  ];
}

// ============================================================================
// Comparaison.
// ============================================================================

function etapesComparaison(e: ExerciceLorenzComparaison): EtapeCorrection[] {
  const ind = (i: number) => indiceCourbe(e, i as 0 | 1);
  const [g1, g2] = e.courbes.map(coefficientGini) as [number, number];
  const croisent = courbesSeCroisent(e.courbes[0], e.courbes[1]);
  const signe = g1 > g2 ? ">" : "<";
  const rel = (v: number) => (Math.abs(Math.round(v * 1000) / 1000 - v) < 1e-12 ? "=" : "\\approx ");
  return [
    utilise("a", METHODE_AIRE),
    ...e.courbes.map((c, i) => calcul("a", lignesAire(c, `\\mathcal{A}_{${ind(i)}}`), [], nomRepartition(e, i as 0 | 1).replace(/^./, (x) => x.toUpperCase()))),
    { ...resultat("a", listeFormules(formatReponseAttenduePhaseLatex(e, "aires"))), figureHtml: figures(e) },
    utilise("b", METHODE_GINI),
    calcul(
      "b",
      e.courbes.flatMap((c, i) => lignesGini(c, `G_{${ind(i)}}`, `\\mathcal{A}_{${ind(i)}}`)),
    ),
    resultat("b", listeFormules(formatReponseAttenduePhaseLatex(e, "ginis"))),
    piege("b", [t("Oublier le facteur 2 : on compare alors les aires, ce qui donne le même classement, mais les coefficients de Gini sont faux.")]),
    utilise("c", [t("Plus le coefficient de Gini est grand, plus la répartition est inégalitaire. "), t(phraseCroisement(e))]),
    calcul("c", [ligne(`G_{${ind(0)}}${rel(g1)}${decimalLatex(g1)}`, "étape 2"), ligne(`${decimalLatex(g1)}${signe}${decimalLatex(g2)}`, "on compare"), ligne(`G_{${ind(1)}}${rel(g2)}${decimalLatex(g2)}`, "étape 2")]),
    resultat("c", reponseChoix(e, "verdict")),
    piege(
      "c",
      croisent
        ? [t("Comparer les deux courbes en un seul point (par exemple en x = 0,5) : comme elles se croisent, la comparaison en un point peut donner la conclusion inverse.")]
        : [t("Croire que la courbe la plus éloignée de la diagonale est la plus égalitaire : c'est l'inverse, plus elle s'en éloigne, plus l'aire et G sont grands.")],
    ),
  ];
}

// ============================================================================
// Paramètre.
// ============================================================================

function etapesParametre(e: ExerciceLorenzParametre): EtapeCorrection[] {
  const n = e.famille === "mixte2" ? 2 : 3;
  const primitive = n === 2 ? "\\dfrac{x^{3}}{3}" : "\\dfrac{x^{4}}{4}";
  const d = n === 2 ? 6 : 4;
  const k = n === 2 ? 3 : 2;
  const G = decimalLatex(e.giniVise);
  const A = decimalLatex(e.a, 6);
  return [
    utilise("a", [...METHODE_AIRE.slice(0, 4), t(` ; on met a en évidence dans la différence ${COURS_PROBLEMES}.`)]),
    calcul("a", [
      ligne(`x-L(x)=x-ax^{${n}}-(1-a)x`, "définition de L"),
      ligne(`=ax-ax^{${n}}`, "on réduit"),
      ligne(`=a\\left(x-x^{${n}}\\right)`, "on met a en évidence"),
      ligne(`\\mathcal{A}(a)=a\\displaystyle\\int_0^1\\left(x-x^{${n}}\\right)dx`, "linéarité de l'intégrale"),
      ligne(`=a\\left[\\dfrac{x^{2}}{2}-${primitive}\\right]_0^1`, "primitive terme à terme"),
      ligne(`=a\\left(\\dfrac{1}{2}-\\dfrac{1}{${n + 1}}\\right)`, "F(1) − F(0), avec F(0) = 0"),
      ligne(`=\\dfrac{a}{${d}}`),
    ]),
    resultat("a", listeFormules(formatReponseAttenduePhaseLatex(e, "aireA"))),
    utilise("b", METHODE_GINI),
    calcul("b", [ligne("G(a)=2\\times\\mathcal{A}(a)", "définition du coefficient de Gini"), ligne(`=2\\times\\dfrac{a}{${d}}`, "étape 1"), ligne(`=\\dfrac{a}{${k}}`)]),
    resultat("b", listeFormules(formatReponseAttenduePhaseLatex(e, "giniA"))),
    utilise("c", [t("On égale l'expression de G(a) au coefficient visé et on résout l'équation du premier degré en a ; L reste une courbe de Lorenz si "), f("0\\leq a\\leq 1"), t(".")]),
    calcul("c", [ligne(`\\dfrac{a}{${k}}=${G}`, "G(a) = coefficient visé"), ligne(`a=${k}\\times ${G}`, `on multiplie par ${k}`), ligne(`=${A}`)]),
    { ...resultat("c", listeFormules(formatReponseAttenduePhaseLatex(e, "valeurA"))), figureHtml: figures(e) },
    verification("c", [f(`0\\leq ${A}\\leq 1`), t(" : la courbe obtenue est bien une courbe de Lorenz, et "), f(`G=\\dfrac{${A}}{${k}}=${G}`), t(".")]),
    piege("c", [
      t("Égaler l'aire (et non G) à la valeur visée : "),
      f(`\\dfrac{a}{${d}}=${G}`),
      t(" donne "),
      f(`a=${decimalLatex(2 * e.a, 6)}`),
      ...(2 * e.a > 1 ? [t(", impossible : avec a > 1, L n'est plus une courbe de Lorenz.")] : [t(", pour lequel le coefficient de Gini vaut en réalité "), f(decimalLatex(2 * e.giniVise)), t(", le double de la valeur visée.")]),
    ]),
  ];
}

export function correctionDetailleeLorenzGini(e: E): EtapeCorrection[] {
  switch (e.variante) {
    case "lecture":
      return etapesLecture(e);
    case "comparaison":
      return etapesComparaison(e);
    case "parametre":
      return etapesParametre(e);
  }
}

