import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, lignesDepuisChaine, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceProblemeContexte, ExerciceScenarioAConteneur, ExerciceScenarioAStockCommande, ExerciceScenarioB, ExerciceScenarioC, ModeleCoutUnitaire } from "../../core5e/problemesContexte.types";
import {
  formatTermeABLatex,
  formatTermeBeneficeC,
  formatTermeCoutMoyenC,
  formatTermeExtremumSimpleA,
  formatTermeFormuleBLatex,
  formatTermeHJustificationA,
  formatTermeIntersectionSimpleA,
  formatTermeSeuilC,
  formatTermeXEgaliteAiresA,
  formatTermeXOptimalA,
  formatTermesEvaluationBLatex,
  formatTermesFormulesGeneralisationA,
  formatTermesFormulesGeneralisationSimpleA,
  formatTermesLectureC,
  formatTermesReconnaissanceC,
  formatTermesSystemeBLatex,
  formatTermesTableauA,
  latexFormuleFB,
  nombreLatex,
} from "../../ui5e/formatProblemesContexte";
import { finaliserCorrige, sansDoublons } from "../../ui5e/corrigeTrigonometrie1";
import { COURS_CONTEXTE, etudeTrinome, etListe, jf, nb, t, f } from "../../ui5e/corrigeFonctions1";
import { coeffA, coeffB, coutTotalTheorique } from "./scenarioB";
import { hauteurCylindre } from "./scenarioA";
import { grapheA1, grapheA2, grapheC } from "./graphes";

/**
 * Corrigé détaillé « comme au tableau » de 5gen5 (fonctions en contexte) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN, dans l'ordre de l'appli
 * (`ETAPES_PAR_SCENARIO`) :
 * - A1 (bidon cylindrique) : tableau, généralisation, égalité des aires, graphique, justification ;
 * - A2 (stock et commande) : généralisation, intersection, minimum lu ;
 * - B (coût unitaire) : système, résolution, formule, évaluation ;
 * - C (coûts d'une entreprise) : coût total, coût moyen, expressions de CV et CP, bénéfice, seuil.
 * « Résultat » = la réponse de l'écran (`ui5e/formatProblemesContexte.ts`) ; les chaînes de l'écran
 * sont éclatées (`lignesDepuisChaine`). Les lectures graphiques ont leur figure annotée
 * (`figureHtml`). Valeurs RETENUES de l'appli (rayon lu, a et b trouvés) : `retenus`.
 * SANS `docx` : importé par l'adaptateur ET par `App5gen5.tsx`.
 */

export type PhaseContexte =
  | "tableau"
  | "generalisation"
  | "egaliteAires"
  | "graphique"
  | "justification"
  | "generalisationSimple"
  | "intersectionSimple"
  | "extremumSimple"
  | "systeme"
  | "resolution"
  | "formule"
  | "evaluation"
  | "lecture"
  | "coutMoyen"
  | "reconnaissance"
  | "benefice"
  | "seuil";

export function phasesContexte(e: ExerciceProblemeContexte): PhaseContexte[] {
  if (e.scenario === "A") return e.combo === "kInverseXAxCarre" ? ["tableau", "generalisation", "egaliteAires", "graphique", "justification"] : ["generalisationSimple", "intersectionSimple", "extremumSimple"];
  if (e.scenario === "B") return ["systeme", "resolution", "formule", "evaluation"];
  return ["lecture", "coutMoyen", "reconnaissance", "benefice", "seuil"];
}

const LETTRES = "abcdefgh";

export function lettrePhaseContexte(e: ExerciceProblemeContexte, phase: string): string {
  return LETTRES[phasesContexte(e).indexOf(phase as PhaseContexte)] ?? "a";
}

/** Écrans de pure lecture (niveau) : minimum lu sur le graphique (A1, A2), expressions de CV et CP
 * lues sur l'allure et la ligne x = 1 du tableau, seuil lu (C). */
export function lettresLectureContexte(e: ExerciceProblemeContexte): string[] {
  const lues: PhaseContexte[] = ["graphique", "extremumSimple", "reconnaissance", "seuil"];
  return phasesContexte(e)
    .map((p, i) => (lues.includes(p) ? LETTRES[i]! : null))
    .filter((x): x is string => x !== null);
}

export interface RetenusContexte {
  xOptimalRetenu?: number | null;
  aRetenu?: number | null;
  bRetenu?: number | null;
}

/** « \text{ €} » (écran) → symbole € hors formule. */
function sansEuro(s: string): string {
  return s.replace(/\\text\{\s*€\}/g, "");
}

/** « A = B = C » (ou « … ≈ C ») de l'écran → « A = C » : le résultat se lit seul. */
function premierEtDernier(chaine: string): string {
  const coupes: { i: number; rel: string }[] = [];
  let prof = 0;
  for (let i = 0; i < chaine.length; i++) {
    const c = chaine[i];
    if (c === "{") prof++;
    else if (c === "}") prof--;
    else if (prof === 0 && c === "=") coupes.push({ i, rel: "=" });
    else if (prof === 0 && chaine.startsWith("\\approx", i)) coupes.push({ i, rel: "\\approx" });
  }
  if (coupes.length < 2) return chaine;
  const premier = coupes[0]!;
  const dernier = coupes[coupes.length - 1]!;
  return `${chaine.slice(0, premier.i)}${dernier.rel === "=" ? "=" : "\\approx "}${chaine.slice(dernier.i + dernier.rel.length)}`;
}

/** Nombre décimal exact (virgule `{,}`), jusqu'à 4 décimales. */
const d = (v: number) => nombreLatex(v, 4);

// ============================================================================
// A1 — bidon cylindrique.
// ============================================================================

function correctionA1(e: ExerciceScenarioAConteneur, r: RetenusContexte): EtapeCorrection[] {
  const [la, lb, lc, ld, le] = LETTRES.slice(0, 5).split("");
  const V = e.volumeCm3;
  // a) Tableau : h, aire des bases, aire latérale pour chaque rayon.
  const tab: LigneCalcul[] = [];
  for (const l of e.lignesTableau) {
    tab.push(ligne(`h=\\dfrac{${V}}{\\pi\\cdot ${l.r}^2}\\approx ${nombreLatex(l.hAttendu, 2)}`, jf("rayon ", { l: `r=${l.r}` }, " : on isole h dans ", { l: "V=\\pi r^2 h" })));
    tab.push(ligne(`A_{\\text{bases}}=2\\pi\\cdot ${l.r}^2\\approx ${nombreLatex(l.aireBasesAttendue, 2)}`, "deux disques de rayon r"));
    const exactLat = Math.abs(l.aireLateraleAttendue * 100 - Math.round(l.aireLateraleAttendue * 100)) < 1e-6;
    tab.push(ligne(`A_{\\text{lat}}=\\dfrac{2\\cdot ${V}}{${l.r}}${exactLat ? "=" : "\\approx "}${nombreLatex(l.aireLateraleAttendue, 2)}`, jf("périmètre × hauteur avec h non arrondi : ", { l: "2\\pi r\\cdot\\frac{V}{\\pi r^2}=\\frac{2V}{r}" })));
  }
  const xRet = r.xOptimalRetenu ?? Math.round(e.xOptimal);
  const xExact = e.xOptimal;
  const hRet = hauteurCylindre(V, xRet);
  return [
    utilise(la, [t("Contenance d'un cylindre "), f("V=\\pi r^2 h"), t(", aire des deux bases "), f("2\\pi r^2"), t(", aire latérale "), f("2\\pi r\\cdot h"), t(` (périmètre × hauteur) ${COURS_CONTEXTE}.`)]),
    calcul(la, tab),
    resultat(la, etListe(formatTermesTableauA(e))),
    piege(la, [t("On calcule l'aire latérale avec h non arrondi ; on n'arrondit qu'à la fin (à l'unité).")]),
    // b) Généralisation.
    utilise(lb, [t(`Mêmes formules, avec le rayon x à la place d'un rayon donné ; V reste un paramètre ${COURS_CONTEXTE}.`)]),
    calcul(lb, [
      ligne("V=\\pi x^2\\cdot h(x)", "contenance"),
      ligne("h(x)=\\dfrac{V}{\\pi x^2}", jf("on divise par ", { l: "\\pi x^2" })),
      ligne("f(x)=2\\pi x\\cdot h(x)", "aire latérale : périmètre × hauteur"),
      ligne("=2\\pi x\\cdot\\dfrac{V}{\\pi x^2}", jf("on remplace ", { l: "h(x)" })),
      ligne("=\\dfrac{2V}{x}", jf("on simplifie par ", { l: "\\pi x" })),
      ligne("g(x)=2\\pi x^2", "deux disques de rayon x"),
    ]),
    resultat(lb, etListe(formatTermesFormulesGeneralisationA())),
    piege(lb, [t("Garder V comme paramètre : les expressions valent pour toute contenance.")]),
    // c) Égalité des aires.
    utilise(lc, [t("On pose "), f("f(x)=g(x)"), t(` et on isole x : on obtient une équation du type x³ = c ${COURS_CONTEXTE}.`)]),
    calcul(lc, [
      ligne("f(x)=g(x)"),
      ligne("\\iff \\dfrac{2V}{x}=2\\pi x^2", "on remplace f et g"),
      ligne("\\iff 2V=2\\pi x^3", jf("on multiplie par ", { l: "x>0" })),
      ligne("\\iff x^3=\\dfrac{V}{\\pi}", jf("on divise par ", { l: "2\\pi" })),
      ligne("\\iff x=\\sqrt[3]{\\dfrac{V}{\\pi}}", "racine cubique"),
    ]),
    calcul(lc, [ligne(`x=\\sqrt[3]{\\dfrac{${V}}{\\pi}}\\approx ${nombreLatex(e.xEgaliteAires, 2)}`, jf("avec ", { l: `V=${V}` }, ", à la calculatrice"))], [], "Valeur"),
    resultat(lc, [f(formatTermeXEgaliteAiresA(e)), t(" cm")]),
    piege(lc, [t("Le rayon où les deux aires sont égales n'est pas celui qui minimise la quantité totale de matériau.")]),
    // d) Lecture du minimum.
    utilise(ld, [t("Le rayon qui minimise "), f("(f+g)(x)"), t(` est l'abscisse du point le plus bas de sa courbe ${COURS_CONTEXTE}.`)]),
    { ...calcul(ld, [ligne(`x\\approx ${Math.round(e.xOptimal)}`, "abscisse du point le plus bas de la courbe verte (sur une ligne du quadrillage)")]), figureHtml: grapheA1(e, true) },
    resultat(ld, [f(formatTermeXOptimalA(e)), t(" cm")]),
    piege(ld, [t("On lit le minimum de f + g, pas l'intersection des courbes de f et de g.")]),
    // e) Justification.
    utilise(le, [t("On reprend "), f("h(x)=\\dfrac{V}{\\pi x^2}"), t(` au rayon lu, puis on compare au diamètre 2x ${COURS_CONTEXTE}.`)]),
    calcul(le, [
      ligne(`h(${xRet})=\\dfrac{${V}}{\\pi\\cdot ${xRet}^2}\\approx ${nombreLatex(hRet, 2)}`, "au rayon lu"),
      ligne(`2x=2\\cdot ${xRet}=${2 * xRet}`, "le diamètre"),
    ]),
    resultat(le, [f(formatTermeHJustificationA(e, xRet)), t(" cm : la hauteur est (presque) égale au diamètre.")]),
    verification(
      le,
      [t("Au rayon optimal exact "), f(`x=\\sqrt[3]{\\dfrac{V}{2\\pi}}\\approx ${nombreLatex(xExact, 2)}`), t(", on a "), f("V=2\\pi x^3"), t(" : la hauteur égale exactement le diamètre, quelle que soit V (l'écart vient de l'arrondi de la lecture).")],
      [ligne("h(x)=\\dfrac{V}{\\pi x^2}"), ligne("=\\dfrac{2\\pi x^3}{\\pi x^2}", jf("car ", { l: "V=2\\pi x^3" })), ligne("=2x", "on simplifie")],
    ),
  ];
}

// ============================================================================
// A2 — stock et commande.
// ============================================================================

function correctionA2(e: ExerciceScenarioAStockCommande): EtapeCorrection[] {
  const [la, lb, lc] = ["a", "b", "c"];
  const [r1, r2] = e.releves as [{ x: number; f: number; g: number }, { x: number; f: number; g: number }];
  const df = r2.f - r1.f;
  const dx = r2.x - r1.x;
  const aCalc = sansDoublons([
    ligne(`a=\\dfrac{f(${r2.x})-f(${r1.x})}{${r2.x}-${r1.x}}`, "f affine : variation de f divisée par celle de x"),
    ligne(dx === 1 ? `=${d(r2.f)}-${d(r1.f)}` : `=\\dfrac{${d(r2.f)}-${d(r1.f)}}{${dx}}`, "relevés du tableau"),
    ...(dx === 1 ? [] : [ligne(`=\\dfrac{${d(df)}}{${dx}}`)]),
    ligne(`=${nb(e.a)}`),
  ]);
  const bCalc = [ligne(`b=f(${r1.x})-a\\cdot ${r1.x}`, jf("car ", { l: `f(${r1.x})=a\\cdot ${r1.x}+b` })), ligne(`=${d(r1.f)}-${nb(e.a)}\\cdot ${r1.x}`), ligne(`=${nb(e.b)}`)];
  const kCalc = [ligne(`k=${r1.x}\\cdot g(${r1.x})`, jf("car ", { l: "g(x)=\\dfrac{k}{x}" }, " donne ", { l: "k=x\\cdot g(x)" })), ligne(`=${r1.x}\\cdot ${d(r1.g)}`), ligne(`=${nb(e.k)}`)];
  const coef = e.a === 1 ? "" : `${e.a}`;
  const trinome = [-e.k, e.b, e.a];
  const etude = etudeTrinome(trinome);
  const x0 = e.xIntersection;
  return [
    utilise(la, [f("f(x)=ax+b"), t(" : a est la variation de f divisée par celle de x ; "), f("g(x)=\\dfrac{k}{x}"), t(` : un relevé donne k ${COURS_CONTEXTE}.`)]),
    calcul(la, aCalc, [], "Coefficient a"),
    calcul(la, bCalc, [], "Constante b"),
    calcul(la, kCalc, [], "Constante k"),
    resultat(la, etListe(formatTermesFormulesGeneralisationSimpleA(e))),
    verification(la, [t("Second relevé : "), f(`f(${r2.x})=${nb(e.a)}\\cdot ${r2.x}+${nb(e.b)}=${d(r2.f)}`), t(" et "), f(`g(${r2.x})=\\dfrac{${nb(e.k)}}{${r2.x}}=${d(r2.g)}`), t(".")]),
    piege(la, [t("k se calcule par "), f("x\\cdot g(x)"), t(", pas par "), f("\\dfrac{g(x)}{x}"), t(".")]),
    utilise(lb, [t("On pose "), f("f(x)=g(x)"), t(" et on multiplie par x (positif) : équation du second degré, résolue par Δ ; seule la solution positive a un sens "), t(COURS_CONTEXTE), t(".")]),
    calcul(lb, [
      ligne("f(x)=g(x)"),
      ligne(`\\iff ${coef}x+${e.b}=\\dfrac{${e.k}}{x}`, "on remplace f et g"),
      ligne(`\\iff ${coef}x^2+${e.b}x=${e.k}`, jf("on multiplie par ", { l: "x>0" })),
      ligne(`\\iff ${coef}x^2+${e.b}x-${e.k}=0`, jf("on retire ", { l: `${e.k}` })),
    ]),
    calcul(lb, [...etude.lignes, ligne(`x=${x0}`, "la solution négative est rejetée : une taille de lot est positive")], [], "Résolution"),
    resultat(lb, [f(formatTermeIntersectionSimpleA(e)), t(` ${e.contexte.unite}`)]),
    verification(lb, [f(`f(${x0})=${nb(e.a)}\\cdot ${x0}+${nb(e.b)}=${e.a * x0 + e.b}`), t(" et "), f(`g(${x0})=\\dfrac{${e.k}}{${x0}}=${nb(e.k / x0)}`), t(" : les deux coûts sont égaux.")]),
    utilise(lc, [t("Le coût total minimal se lit au point le plus bas de la courbe de "), f("f+g"), t(` ${COURS_CONTEXTE}.`)]),
    { ...calcul(lc, [ligne(`x\\approx ${Math.round(e.xExtremum)}`, "abscisse du point le plus bas de la courbe verte (sur une ligne du quadrillage)")]), figureHtml: grapheA2(e, true) },
    resultat(lc, [f(formatTermeExtremumSimpleA(e)), t(` ${e.contexte.unite}`)]),
    piege(lc, [t("Le lot où les deux coûts sont égaux n'est pas celui qui minimise le coût total : on lit le minimum de f + g, pas l'intersection de f et g.")]),
  ];
}

// ============================================================================
// B — coût unitaire.
// ============================================================================

/** « 4a », « a », « \dfrac{b}{4} », « 16b » : coefficient × inconnue. */
function terme(c: number, inconnue: string): string {
  if (Math.abs(c - 1) < 1e-12) return inconnue;
  if (c < 1 && Math.abs(1 / c - Math.round(1 / c)) < 1e-9) return `\\dfrac{${inconnue}}{${Math.round(1 / c)}}`;
  return `${d(c)}${inconnue}`;
}

/** Système ramené à « c·(inconnue 1) + (inconnue 2) = R » (coefficients entiers ou décimaux exacts). */
function systemeNormalise(e: ExerciceScenarioB): { lignes: LigneCalcul[]; eqs: { cU: number; R: number }[]; u: "a" | "b"; v: "a" | "b"; transformation: string | null } {
  const m: ModeleCoutUnitaire = e.modele;
  const pts = [e.point1, e.point2];
  const lignes: LigneCalcul[] = [];
  if (m === "B2") {
    // a·x + b·x² = F ; on divise par x : a + x·b = cu.
    const eqs = pts.map((p) => ({ cU: p.x, R: p.coutUnitaire }));
    pts.forEach((p, i) => lignes.push(ligne(`a+${terme(p.x, "b")}=${d(p.coutUnitaire)}`, `équation (${i + 1}) divisée par ${p.x}`)));
    return { lignes, eqs, u: "b", v: "a", transformation: "on divise chaque équation par x" };
  }
  if (m === "B3" || m === "B4") {
    // ×x : B3 x²·a + b = F·x ; B4 x·a + b = F·x.
    const eqs = pts.map((p) => {
      const F = p.coutUnitaire * p.x;
      return { cU: m === "B3" ? p.x * p.x : p.x, R: F * p.x };
    });
    pts.forEach((p, i) => lignes.push(ligne(`${terme(eqs[i]!.cU, "a")}+b=${d(eqs[i]!.R)}`, `équation (${i + 1}) multipliée par ${p.x}`)));
    return { lignes, eqs, u: "a", v: "b", transformation: "on multiplie chaque équation par x" };
  }
  const eqs = pts.map((p) => ({ cU: coeffA(m, p.x), R: p.coutUnitaire * p.x }));
  return { lignes, eqs, u: "a", v: "b", transformation: null };
}

function correctionB(e: ExerciceScenarioB, r: RetenusContexte): EtapeCorrection[] {
  const [la, lb, lc, ld] = ["a", "b", "c", "d"];
  const [eq1, eq2] = formatTermesSystemeBLatex(e);
  const p1 = e.point1;
  const p2 = e.point2;
  const F = (p: { x: number; coutUnitaire: number }) => p.coutUnitaire * p.x;
  const a = e.aArrondiAttendu;
  const b = e.bArrondiAttendu;
  const aR = r.aRetenu ?? a;
  const bR = r.bRetenu ?? b;
  // a) système
  const sys: LigneCalcul[] = [
    ligne(`${latexFormuleFB(e.modele).replace(/^f\(x\)=/, "\\text{cu}(x)\\times x=")}`, "coût total = coût unitaire × nombre d'unités"),
    ligne(eq1!, jf("relevé ", { l: `x=${p1.x}` }, " : le coût unitaire vaut ", { l: d(p1.coutUnitaire) })),
    ligne(eq2!, jf("relevé ", { l: `x=${p2.x}` }, " : le coût unitaire vaut ", { l: d(p2.coutUnitaire) })),
  ];
  // b) résolution
  const n = systemeNormalise(e);
  const [E1, E2] = n.eqs as [{ cU: number; R: number }, { cU: number; R: number }];
  const depart: LigneCalcul[] = [
    ligne(`${terme(coeffA(e.modele, p1.x), "a")}+${terme(coeffB(e.modele, p1.x), "b")}=${d(F(p1))}`, jf("équation (1) : ", { l: `${d(p1.coutUnitaire)}\\times ${p1.x}=${d(F(p1))}` })),
    ligne(`${terme(coeffA(e.modele, p2.x), "a")}+${terme(coeffB(e.modele, p2.x), "b")}=${d(F(p2))}`, jf("équation (2) : ", { l: `${d(p2.coutUnitaire)}\\times ${p2.x}=${d(F(p2))}` })),
  ];
  const u = n.u;
  const v = n.v;
  const uVal = u === "a" ? a : b;
  const vVal = v === "a" ? a : b;
  const elimination: LigneCalcul[] = sansDoublons([
    ligne(`${terme(E2.cU - E1.cU, u)}=${d(E2.R - E1.R)}`, jf("(2) − (1) : ", { l: v }, " disparaît")),
    ligne(`${u}=\\dfrac{${d(E2.R - E1.R)}}{${d(E2.cU - E1.cU)}}`, jf("on divise par ", { l: d(E2.cU - E1.cU) })),
    ligne(`=${d(uVal)}`),
  ]);
  const substitution: LigneCalcul[] = sansDoublons([
    ligne(`${v}=${d(E1.R)}-${terme(E1.cU, u)}`, jf("dans (1)", n.transformation ? " transformée" : "", ", on isole ", { l: v })),
    ligne(`=${d(E1.R)}-${d(E1.cU)}\\cdot ${d(uVal)}`),
    ligne(`=${d(vVal)}`),
  ]);
  // d) évaluations
  const substitue = (x: number, va: number, vb: number): string =>
    ({
      B1: `${d(va)}\\cdot ${x}+${d(vb)}`,
      B2: `${d(va)}\\cdot ${x}+${d(vb)}\\cdot ${x}^2`,
      B3: `${d(va)}\\cdot ${x}+\\dfrac{${d(vb)}}{${x}}`,
      B4: `${d(va)}+\\dfrac{${d(vb)}}{${x}}`,
      B5: `${d(va)}\\cdot ${x}^2+${d(vb)}`,
    })[e.modele];
  const evaluation = (x: number): LigneCalcul[] => {
    const ta = coeffA(e.modele, x) * aR;
    const tb = coeffB(e.modele, x) * bR;
    const val = coutTotalTheorique(e.modele, aR, bR, x);
    const exact = (v2: number) => Math.abs(v2 * 10000 - Math.round(v2 * 10000)) < 1e-6;
    const lignes: LigneCalcul[] = [ligne(`f(${x})=${substitue(x, aR, bR)}`, jf("on remplace x par ", { l: `${x}` }))];
    if (exact(ta) && exact(tb)) lignes.push(ligne(`=${d(ta)}+${d(tb)}`));
    else lignes.push(ligne(`\\approx ${nombreLatex(ta, 2)}+${nombreLatex(tb, 2)}`));
    lignes.push(Math.abs(val - Math.round(val)) < 1e-9 ? ligne(`=${Math.round(val)}`) : ligne(`\\approx ${nombreLatex(val, 0)}`, "arrondi à l'euro"));
    return sansDoublons(lignes);
  };
  return [
    utilise(la, [t("Le coût total vaut le coût unitaire multiplié par x : "), f(`${latexFormuleFB(e.modele).replace(/^f\(x\)=/, "\\text{cu}(x)\\times x=")}`), t(`. Chaque relevé donne une équation en a et b ${COURS_CONTEXTE}.`)]),
    calcul(la, sys),
    resultat(la, etListe(formatTermesSystemeBLatex(e))),
    piege(la, [t("Le relevé donne le coût unitaire : on le multiplie par x avant de l'égaler au coût total.")]),
    utilise(lb, [t(`Système de deux équations du premier degré : on élimine une inconnue en soustrayant les équations${n.transformation ? ` (après avoir ${n.transformation.replace("on multiplie", "multiplié").replace("on divise", "divisé")})` : ""}, puis on remplace ${COURS_CONTEXTE}.`)]),
    calcul(lb, depart, [], "Système"),
    ...(n.lignes.length ? [calcul(lb, n.lignes, [t(n.transformation ? `Pour éliminer une inconnue, ${n.transformation} :` : "")], "Mise en forme")] : []),
    calcul(lb, elimination, [], "Élimination"),
    calcul(lb, substitution, [], "Substitution"),
    resultat(lb, [f(formatTermeABLatex(a, b))]),
    verification(lb, [t("Dans l'équation (2) : "), f(`${substitue(p2.x, a, b)}=${d(F(p2))}`), t(", c'est bien le coût total du second relevé.")]),
    utilise(lc, [t("On remplace a et b par leurs valeurs dans "), f(latexFormuleFB(e.modele)), t(` ${COURS_CONTEXTE}.`)]),
    calcul(lc, [ligne(latexFormuleFB(e.modele), "forme du coût total"), ligne(`=${formatTermeFormuleBLatex(aR, bR, e.modele).replace(/^f\(x\)=/, "")}`, jf("avec ", { l: `a=${d(aR)}` }, " et ", { l: `b=${d(bR)}` }))]),
    resultat(lc, [f(formatTermeFormuleBLatex(aR, bR, e.modele))]),
    utilise(ld, [t(`On remplace x par la valeur demandée dans f(x) ${COURS_CONTEXTE}.`)]),
    calcul(ld, evaluation(e.xEval1), [], `Pour x = ${e.xEval1}`),
    calcul(ld, evaluation(e.xEval2), [], `Pour x = ${e.xEval2}`),
    resultat(ld, [...etListe(formatTermesEvaluationBLatex(e, aR, bR)), t(" (en euros)")]),
    piege(ld, [t("On calcule le coût TOTAL f(x), pas le coût unitaire.")]),
  ];
}

// ============================================================================
// C — coûts d'une entreprise.
// ============================================================================

function correctionC(e: ExerciceScenarioC): EtapeCorrection[] {
  const [la, lb, lc, ld, le] = ["a", "b", "c", "d", "e"];
  const ligne1 = e.tableau.find((l) => l.x === 1)!;
  const lb_ = e.tableau.find((l) => l.x === e.xBenefice)!;
  const ctB = Math.round((e.cf + lb_.cv + lb_.cp) * 100) / 100;
  const allure: Record<string, string> = {
    racineCarree: "allure d'une racine carrée (croissance qui ralentit)",
    racineCubique: "allure d'une racine cubique (croissance encore plus lente)",
    carre: "allure d'une parabole (croissance de plus en plus rapide)",
    cube: "allure d'une cubique (croissance très rapide)",
  };
  const formeCV: Record<string, string> = { racineCarree: "k\\sqrt{x}", racineCubique: "k\\sqrt[3]{x}", carre: "kx^2", cube: "kx^3" };
  const valeurEn1: Record<string, string> = { racineCarree: "k\\sqrt{1}", racineCubique: "k\\sqrt[3]{1}", carre: "k\\cdot 1^2", cube: "k\\cdot 1^3" };
  return [
    utilise(la, [f("\\text{CT}(x)=\\text{CF}+\\text{CV}(x)+\\text{CP}(x)"), t(` : on additionne le coût fixe et les deux coûts de la ligne du tableau ${COURS_CONTEXTE}.`)]),
    calcul(la, lignesDepuisChaine(formatTermesLectureC(e)[0]!, ["coût fixe et ligne du tableau", "on additionne"])),
    resultat(la, [f(premierEtDernier(formatTermesLectureC(e)[0]!)), t(" milliers d'euros")]),
    utilise(lb, [t("Coût moyen par unité : "), f("\\text{CM}=\\dfrac{\\text{CT}(x)}{x}"), t(` ; CT est en milliers d'euros, on le multiplie par 1 000 pour l'avoir en euros ${COURS_CONTEXTE}.`)]),
    calcul(lb, lignesDepuisChaine(sansEuro(formatTermeCoutMoyenC(e)), ["coût total en euros, divisé par le nombre d'unités"])),
    resultat(lb, [f(premierEtDernier(sansEuro(formatTermeCoutMoyenC(e)))), t(" €")]),
    piege(lb, [t("Le tableau est en milliers d'euros : sans la multiplication par 1 000, le coût moyen est mille fois trop petit.")]),
    utilise(lc, [t(`CV a l'${allure[e.formeCV]} ; CP est une droite qui passe par l'origine. La ligne x = 1 du tableau donne les coefficients ${COURS_CONTEXTE}.`)]),
    calcul(lc, [
      ligne(`\\text{CV}(x)=${formeCV[e.formeCV]}`, allure[e.formeCV]),
      ligne(`\\text{CV}(1)=${valeurEn1[e.formeCV]}=k`, "en x = 1"),
      ligne(`k=${d(ligne1.cv)}`, "ligne x = 1 du tableau"),
      ligne("\\text{CP}(x)=mx", "droite passant par l'origine"),
      ligne(`m=\\text{CP}(1)=${d(ligne1.cp)}`, "ligne x = 1 du tableau"),
    ]),
    resultat(lc, etListe(formatTermesReconnaissanceC(e))),
    utilise(ld, [t("Bénéfice "), f("=\\text{CA}(x)-\\text{CT}(x)"), t(` ; un résultat négatif est une perte ${COURS_CONTEXTE}.`)]),
    calcul(ld, [ligne(`\\text{CT}(${e.xBenefice})=${e.cf}+${d(lb_.cv)}+${d(lb_.cp)}`, "coût fixe et ligne du tableau"), ligne(`=${d(ctB)}`)], [], "Coût total"),
    calcul(ld, lignesDepuisChaine(formatTermeBeneficeC(e), ["chiffre d'affaires du tableau, coût total calculé", "on soustrait"]), [], "Bénéfice"),
    resultat(ld, [f(premierEtDernier(formatTermeBeneficeC(e))), t(" milliers d'euros")]),
    utilise(le, [t("L'entreprise devient rentable quand le chiffre d'affaires dépasse le coût total : seuil = abscisse du point où les courbes de "), f("\\text{CA}"), t(" et de "), f("\\text{CT}"), t(` se croisent ${COURS_CONTEXTE}.`)]),
    { ...calcul(le, [ligne(formatTermeSeuilC(e), "abscisse du croisement des courbes rose et verte")]), figureHtml: grapheC(e, true) },
    resultat(le, [f(formatTermeSeuilC(e))]),
  ];
}

export function correctionDetailleeProblemesContexte(e: ExerciceProblemeContexte, retenus: RetenusContexte = {}): EtapeCorrection[] {
  if (e.scenario === "A") return finaliserCorrige(e.combo === "kInverseXAxCarre" ? correctionA1(e, retenus) : correctionA2(e));
  if (e.scenario === "B") return finaliserCorrige(correctionB(e, retenus));
  return finaliserCorrige(correctionC(e));
}
