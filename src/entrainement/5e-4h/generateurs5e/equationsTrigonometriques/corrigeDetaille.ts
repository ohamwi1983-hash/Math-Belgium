import type {
  BrancheX,
  CoefficientRationnel,
  ExerciceEgaliteExpressions,
  ExerciceEquationTrig,
  ExerciceEquationTrigonometrique,
  ExerciceProduitFacteurs,
  ExercicePythagoricienne,
  FonctionTrig,
  ValeurPiOuDecimale,
} from "../../core5e/equationsTrigonometriques.types";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { formatArgumentLatex, formatBrancheLatex, formatEquationEnonceLatex, latexAideArgumentNiveau2, relationBranche } from "../../ui5e/formatEquationTrig";
import {
  ensembleApproche,
  formatAidePrefacteurNiveau2Latex,
  formatAideResoudreEgaliteNiveau2Latex,
  formatAideSepararFacteursNiveau2Latex,
  formatEnonceEgaliteLatex,
  formatEnonceEquationTrigonometriqueLatex,
  formatEnonceMixteLatex,
  formatEnonceProduitLatex,
  formatEnsembleSolutionsLatex,
  formatEquationConvertieEgaliteLatex,
  formatPolynomeCibleLatex,
  formatTermesArgumentDirecteLatex,
  formatTermesRacinesResolutionLatex,
  formatTermesRacinesTLatex,
  formatTermesXDirecteLatex,
  OPTIONS_FAMILLE,
  simplifierAffichageProduit,
} from "../../ui5e/formatEquationTrigonometrique";
import { phaseApres, phaseInitiale, type PhaseEquationTrigonometrique } from "../../moteur5e/typesEquationTrig";
import { tangenteIndefinie } from "./produitFacteurs";
import type { Expr, Fragments, Lin } from "../../ui5e/corrigeTrigonometrie2";
import {
  avecFinale,
  COURS_EQUATIONS,
  coefX,
  dec,
  E,
  eAdd,
  eExacte,
  eMul,
  eNeg,
  eNul,
  EPi,
  eSub,
  eVal,
  EZero,
  exprLatex,
  exprPar,
  finaliserCorrige,
  fr,
  lignesIsolerX,
  lignesSolutionsSerie,
  ouLatex,
  q,
  qDepuis,
  qEgal,
  qNeg,
  qNul,
  serie,
  serieApprochee,
  somme,
  termesExpr,
  UN,
  ZERO,
  dfrac,
} from "../../ui5e/corrigeTrigonometrie2";

/**
 * Corrigé détaillé « comme au tableau » de 5gen10 (équations trigonométriques, 4 familles) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN, dans l'ordre de l'appli
 * (`phaseInitiale`/`phaseApres` du moteur) : reconnaissance (la technique, décision qui compte comme
 * une étape), puis les écrans de la famille. Équation de base : angle de référence (valeur
 * remarquable, ou α = arccos k calculé à la calculatrice et gardé sous forme de lettre), les deux
 * séries écrites ligne à ligne (X = α + 2kπ, X = −α + 2kπ / π − α + 2kπ ; une seule pour tan ou
 * pour ±1), x isolé ligne à ligne (`lignesIsolerX` : on regroupe, on réduit, on divise — la période
 * aussi), puis les solutions de [0 ; 2π[ une par une (valeur de k, rejets de part et d'autre).
 * Valeurs arrondies calculées depuis α NON arrondi. Résultats = fonctions de l'écran
 * (`formatTermes…`, `formatEnsembleSolutionsLatex`). Aucun écran de lecture.
 */

type T = ExerciceEquationTrigonometrique;
const LETTRES = "abcdefghijklmnopqrstuvwxyz";
const NOM: Record<FonctionTrig, string> = { sin: "\\sin", cos: "\\cos", tan: "\\tan" };
const ARC: Record<FonctionTrig, string> = { sin: "\\arcsin", cos: "\\arccos", tan: "\\arctan" };
const NOM_FR: Record<FonctionTrig, string> = { sin: "sinus", cos: "cosinus", tan: "tangente" };
const ARC_F: Record<FonctionTrig, (x: number) => number> = { sin: Math.asin, cos: Math.acos, tan: Math.atan };
const DEUX_PI = EPi(2);
const PI = EPi(1);

/** Séquence des écrans de l'instance (même marche que l'appli). */
export function ecransEquationTrig(e: T): PhaseEquationTrigonometrique[] {
  const ordre: PhaseEquationTrigonometrique[] = [];
  let phase: PhaseEquationTrigonometrique | "termine" = phaseInitiale();
  while (phase !== "termine") {
    ordre.push(phase);
    phase = phaseApres(e, phase);
  }
  return ordre;
}

function lettre(e: T, phase: PhaseEquationTrigonometrique): string {
  return LETTRES[ecransEquationTrig(e).indexOf(phase)] ?? "a";
}

// ---------------------------------------------------------------------------------------------
// Valeurs de l'instance → expressions exactes
// ---------------------------------------------------------------------------------------------

function valeurExpr(v: ValeurPiOuDecimale): Expr {
  if (v.exact !== null) return v.exact.numerateur === 0 ? EZero : EPi(v.exact.numerateur, v.exact.denominateur);
  const r = qDepuis(v.decimal) ?? q(Math.round(v.decimal));
  return E(ZERO, r);
}

function linArg(a: CoefficientRationnel, b: ValeurPiOuDecimale): Lin {
  return { a: q(a.numerateur, a.denominateur), c: valeurExpr(b) };
}

/** Angle de référence d'une équation de base : exact (π-fraction) ou lettre (calculatrice). */
interface Alpha {
  exact: Expr | null;
  valeur: number;
  nom: string;
}

function fractionPi(v: number): Expr | null {
  if (Math.abs(v) < 1e-12) return EZero;
  for (let d = 1; d <= 12; d++) {
    const n = Math.round((v / Math.PI) * d);
    if (n !== 0 && Math.abs(v - (n * Math.PI) / d) < 1e-9) return EPi(n, d);
  }
  return null;
}

function alphaDe(f: ExerciceEquationTrig, nom: string): Alpha {
  const valeur = ARC_F[f.fonction](f.k.valeur);
  return { exact: fractionPi(valeur), valeur, nom };
}

function alphaExpr(al: Alpha): Expr {
  return al.exact ?? E(ZERO, ZERO, UN);
}

/** k dans un arccos : « \dfrac{1}{2} », « \left(-\dfrac{1}{2}\right) », « 0{,}3 ». */
function kArgument(kLatex: string): string {
  const k = dfrac(kLatex).replace(/\\sqrt(\d)/g, "\\sqrt{$1}");
  return k.startsWith("-") ? `\\left(${k}\\right)` : k.startsWith("\\dfrac") || k.startsWith("\\sqrt") ? k : ` ${k}`;
}

function kPropre(kLatex: string): string {
  return dfrac(kLatex).replace(/\\sqrt(\d)/g, "\\sqrt{$1}");
}

/** Séries en l'argument (constante, période) dans l'ordre du moteur (`identites.ts`). */
function seriesU(f: ExerciceEquationTrig, al: Alpha): { c: Expr; p: Expr }[] {
  if (f.aucuneSolution) return [];
  if (f.casSpecial) return [{ c: valeurExpr(f.branchesU[0]!.constante), p: DEUX_PI }];
  const a = alphaExpr(al);
  if (f.fonction === "tan") return [{ c: a, p: PI }];
  if (f.fonction === "cos") return [{ c: a, p: DEUX_PI }, { c: eNeg(a), p: DEUX_PI }];
  return [{ c: a, p: DEUX_PI }, { c: eSub(PI, a), p: DEUX_PI }];
}

function serieL(s: { c: Expr; p: Expr }, al: Alpha): string {
  return serie(s.c, s.p, al.nom);
}

// ---------------------------------------------------------------------------------------------
// Équation de base f(ax + b) = k : argument, x isolé, solutions
// ---------------------------------------------------------------------------------------------

function lignesArgument(f: ExerciceEquationTrig, al: Alpha): LigneCalcul[] {
  const arg = formatArgumentLatex(f.a, f.b).replace(/\s+/g, "");
  const nomFr = NOM_FR[f.fonction];
  if (f.aucuneSolution) {
    return [ligne(`${kPropre(f.k.latex)}${f.k.valeur > 0 ? ">1" : "<-1"}`, `un ${nomFr} est toujours compris entre −1 et 1 : aucune solution`)];
  }
  const series = seriesU(f, al);
  if (f.casSpecial) return [ligne(`${arg}=${serieL(series[0]!, al)}`, `seul angle de ${nomFr} ${f.k.valeur > 0 ? "1" : "−1"} (à 2π près) : une seule série`)];
  const lignes: LigneCalcul[] = [];
  const arc = `${ARC[f.fonction]}${kArgument(f.k.latex)}`;
  if (al.exact) lignes.push(ligne(`${arc}=${exprLatex(al.exact)}`, "valeur remarquable"));
  else lignes.push(ligne(`${al.nom}=${arc}\\approx ${dec(al.valeur, 4)}`, "calculatrice, en radians"));
  const approx = (s: { c: Expr; p: Expr }) => (eExacte(s.c) ? [] : [ligne(`\\approx ${serieApprochee(s.c, s.p, al.valeur)}`)]);
  const s1 = series[0]!;
  lignes.push(ligne(`${arg}=${serieL(s1, al)}`, f.fonction === "tan" ? "une seule série, période π" : `première série : même ${nomFr}`), ...approx(s1));
  const s2 = series[1];
  if (s2) {
    if (f.fonction === "cos") lignes.push(ligne(`${arg}=${serieL(s2, al)}`, "angle opposé : même cosinus"), ...approx(s2));
    else {
      const a = alphaExpr(al);
      if (eNul(a)) lignes.push(ligne(`${arg}=${serieL(s2, al)}`, "angle supplémentaire : π − 0 = π"));
      else {
        lignes.push(ligne(`${arg}=${somme(["\\pi", `-${exprPar(a, al.nom)}`, "2k\\pi"])}`, "angle supplémentaire : même sinus"));
        if (eExacte(s2.c)) lignes.push(ligne(`=${serieL(s2, al)}`));
        else lignes.push(...approx(s2));
      }
    }
  }
  return lignes;
}

function utiliseArgument(f: ExerciceEquationTrig, sq: string): EtapeCorrection {
  if (f.aucuneSolution) return utilise(sq, [texte(`Un ${NOM_FR[f.fonction]} est toujours compris entre −1 et 1 ${COURS_EQUATIONS} : si la valeur visée n'est pas dans [−1 ; 1], l'équation n'a pas de solution.`)]);
  if (f.casSpecial) return utilise(sq, [texte(`Pour la valeur ${f.k.valeur > 0 ? "1" : "−1"}, les deux séries de la formule du cours sont confondues ${COURS_EQUATIONS} : une seule série, de période 2π.`)]);
  const intro = f.fonction === "sin" ? "Deux angles supplémentaires ont le même sinus" : f.fonction === "cos" ? "Deux angles opposés ont le même cosinus" : "La tangente a une seule série de solutions, de période π";
  return utilise(sq, [texte(`${intro} ${COURS_EQUATIONS} : `), latex(latexAideArgumentNiveau2(f.fonction).replace(/\\ \\text\{ ou \} \\ /g, "\\ \\text{ou}\\ ")), texte(".")]);
}

/** x isolé dans chaque série, une transformation par ligne ; fin = la forme de l'écran. */
function isolerSeries(f: ExerciceEquationTrig, al: Alpha): { lignes: LigneCalcul[]; series: { c: Expr; p: Expr }[] } {
  const gauche = linArg(f.a, f.b);
  const lignes: LigneCalcul[] = [];
  const series: { c: Expr; p: Expr }[] = [];
  seriesU(f, al).forEach((s, i) => {
    const r = lignesIsolerX(gauche, { a: ZERO, c: s.c }, s.p, {
      nomAlpha: al.nom,
      justificationDepart: qEgal(gauche.a, UN) && eNul(gauche.c) ? "x est déjà isolé" : i === 0 ? "première série" : "seconde série",
    });
    const bx = f.branchesX[i]!;
    const rel = relationBranche(bx) === "=" ? "=" : "\\approx";
    let fin = r.lignes;
    if (!eExacte(r.c)) fin = [...fin, ligne(`\\approx ${serieApprochee(r.c, r.p, al.valeur)}`, `${al.nom === "\\alpha" ? "α" : "β"} non arrondi`)];
    fin = avecFinale(fin, rel as "=" | "\\approx", formatBrancheLatex(bx));
    lignes.push(...fin);
    series.push({ c: r.c, p: r.p });
  });
  return { lignes, series };
}

/** Argument a·x + b évalué en x = v (expression) : « 2\cdot\dfrac{\pi}{4}+\dfrac{\pi}{3} ». */
function substitution(l: Lin, v: Expr, nomAlpha = "\\alpha"): string {
  const xv = qEgal(l.a, UN) ? exprPar(v, nomAlpha) : `${fr(l.a)}\\cdot ${exprPar(v, nomAlpha)}`;
  return somme([xv, ...termesExpr(l.c, nomAlpha)]);
}

// ---------------------------------------------------------------------------------------------
// Écran « reconnaissance »
// ---------------------------------------------------------------------------------------------

const LIBELLE: Record<T["famille"], string> = Object.fromEntries(OPTIONS_FAMILLE.map((o) => [o.id, o.label])) as Record<T["famille"], string>;

/** Produit non factorisé à argument non réduit à x : écrit avec u (la ligne complète sortait de sa cellule). */
function ligneReconnaissance(e: T, enonce: string, pourquoi: string): LigneCalcul {
  if (e.famille !== "produit" || e.sousCas !== "nonFactoree") return ligne(enonce, pourquoi);
  const f2 = e.facteur2;
  const arg = formatArgumentLatex(f2.a, f2.b).replace(/\s+/g, "");
  if (arg === "x") return ligne(enonce, pourquoi);
  const fn = NOM[f2.fonction];
  const l = simplifierAffichageProduit(`${fn}\\left(u\\right)^2 = ${f2.k.latex}\\cdot ${fn}\\left(u\\right)`);
  return ligne(dfrac(l).replace(/\s*=\s*/, "="), [texte("avec "), latex(`u=${arg}`), texte(` : ${pourquoi}`)]);
}

function etapesReconnaissance(e: T): EtapeCorrection[] {
  const enonce = formatEnonceEquationTrigonometriqueLatex(e).replace(/\s*=\s*/, "=");
  const pourquoi =
    e.famille === "directe"
      ? "une seule fonction trigonométrique, égale à une constante"
      : e.famille === "produit"
        ? e.sousCas === "factoree"
          ? "un produit de deux facteurs égal à 0"
          : "la même fonction dans les deux membres : en la mettant en évidence, on obtient un produit nul"
        : e.famille === "pythagoricienne"
          ? "un carré et la fonction associée : la relation fondamentale ramène à une seule fonction"
          : e.identite === "tanVersTan"
            ? "deux tangentes, dont une précédée d'un signe −"
            : "deux fonctions trigonométriques différentes de part et d'autre";
  return [
    utilise("a", [texte(`Les quatre techniques du cours ${COURS_EQUATIONS} : application directe (une fonction égale à une constante), produit nul, substitution pythagoricienne (`), latex("\\sin^2 x+\\cos^2 x=1"), texte("), égalité de deux fonctions après conversion.")]),
    calcul("a", [ligneReconnaissance(e, enonce, pourquoi)]),
    resultat("a", [texte(LIBELLE[e.famille])]),
  ];
}

// ---------------------------------------------------------------------------------------------
// Solutions de [0 ; 2π[ (toutes familles)
// ---------------------------------------------------------------------------------------------

const UTILISE_SOLUTIONS = "On donne à k des valeurs entières successives dans chaque série et on garde les valeurs de [0 ; 2π[ (0 compris, 2π exclu), chacune une seule fois.";
const UTILISE_ISOLER = `Dans chaque série, on fait passer la constante de l'argument dans l'autre membre, puis on divise tout par le coefficient de x — la constante ET la période ${COURS_EQUATIONS}.`;

interface BlocSeries {
  label: string;
  intro?: Fragments;
  series: { c: Expr; p: Expr }[];
  al: Alpha;
}

function etapesSolutions(sq: string, blocs: BlocSeries[], solutions: number[], exclusions: LigneCalcul[]): EtapeCorrection[] {
  const vues: number[] = [];
  const etapes: EtapeCorrection[] = [utilise(sq, [texte(UTILISE_SOLUTIONS)])];
  for (const b of blocs) {
    const lignes: LigneCalcul[] = [];
    for (const s of b.series) {
      const r = lignesSolutionsSerie(s.c, s.p, { alpha: b.al.valeur, nomAlpha: b.al.nom, dejaVues: vues });
      lignes.push(...r.lignes);
      vues.push(...r.valeurs);
    }
    if (lignes.length) etapes.push(calcul(sq, lignes, b.intro ?? [], b.label));
  }
  if (exclusions.length) etapes.push(calcul(sq, exclusions, [], "Valeurs écartées"));
  etapes.push(resultat(sq, [latex(formatEnsembleSolutionsLatex(solutions)), ...(ensembleApproche(solutions) ? [texte(" (valeurs arrondies au centième)")] : [])]));
  return etapes;
}

/** Lignes « cos(argument) = 0 » pour les valeurs où une tangente n'est pas définie. */
function lignesExclusionTangente(l: Lin, candidats: { x: number; expr: Expr; al: Alpha }[]): LigneCalcul[] {
  const a = qNul(l.a) ? 0 : l.a.n / l.a.d;
  const b = eVal(l.c);
  return candidats
    .filter((c) => Math.abs(Math.cos(a * c.x + b)) < 1e-9)
    .map((c) => ligne(`\\cos\\left(${substitution(l, c.expr, c.al.nom)}\\right)=0`, [texte("la tangente n'y est pas définie : "), latex(`x=${eExacte(c.expr) ? exprLatex(c.expr) : dec(c.x)}`), texte(" est écartée")]));
}

/** Valeurs gardées de [0 ; 2π[ avec leur expression exacte (pour les exclusions). */
function valeursDesSeries(series: { c: Expr; p: Expr }[], al: Alpha): { x: number; expr: Expr; al: Alpha }[] {
  const out: { x: number; expr: Expr; al: Alpha }[] = [];
  for (const s of series) {
    const c = eVal(s.c, al.valeur);
    const p = eVal(s.p, al.valeur);
    for (let k = Math.ceil((-c - 1e-9) / p); c + k * p < 2 * Math.PI - 1e-9; k++) out.push({ x: c + k * p, expr: eAdd(s.c, eMul(s.p, q(k))), al });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Famille « directe »
// ---------------------------------------------------------------------------------------------

function piegeDirecte(f: ExerciceEquationTrig): string {
  if (f.fonction === "tan") return "Une seule série pour la tangente, de période π — et la période se divise aussi par le coefficient de x.";
  if (f.casSpecial) return "Valeur ±1 : une seule série (les deux angles de la formule sont confondus) — et la période se divise aussi par le coefficient de x.";
  return "Deux séries pour le sinus et le cosinus — et la période se divise aussi par le coefficient de x.";
}

function correctionDirecte(e: T & { famille: "directe" }): EtapeCorrection[] {
  const f = e.exercice;
  const al = alphaDe(f, "\\alpha");
  const etapes: EtapeCorrection[] = [...etapesReconnaissance(e)];
  const sb = "b";
  etapes.push(utiliseArgument(f, sb), calcul(sb, lignesArgument(f, al)));
  if (f.aucuneSolution) {
    etapes.push(resultat(sb, [texte("Aucune solution : la valeur visée n'est pas dans [−1 ; 1]. "), latex("S=\\varnothing")]));
    return etapes;
  }
  etapes.push(resultat(sb, ouLatex(formatTermesArgumentDirecteLatex(f))));
  if (al.exact && !f.casSpecial) etapes.push(verification(sb, [texte("L'angle de référence redonne la valeur de l'énoncé :")], [ligne(`${NOM[f.fonction]}\\left(${exprLatex(al.exact)}\\right)=${kPropre(f.k.latex)}`)]));
  etapes.push(piege(sb, [texte(piegeDirecte(f))]));
  const iso = isolerSeries(f, al);
  etapes.push(utilise("c", [texte(UTILISE_ISOLER)]), calcul("c", iso.lignes), resultat("c", ouLatex(formatTermesXDirecteLatex(f))));
  const gauche = linArg(f.a, f.b);
  const s0 = iso.series[0]!;
  const u0 = seriesU(f, al)[0]!;
  if (eExacte(s0.c) && (!qEgal(gauche.a, UN) || !eNul(gauche.c))) {
    etapes.push(verification("c", [texte("Pour k = 0, l'argument redonne la constante de la première série :")], [ligne(`${substitution(gauche, s0.c)}=${exprLatex(u0.c)}`)]));
  }
  etapes.push(piege("c", [texte("La période se divise aussi par le coefficient de x : diviser seulement la constante donne de fausses solutions.")]));
  etapes.push(...etapesSolutions("d", [{ label: "Calcul", series: iso.series, al }], f.solutions, []));
  return etapes;
}

// ---------------------------------------------------------------------------------------------
// Famille « produit »
// ---------------------------------------------------------------------------------------------

function correctionProduit(e: ExerciceProduitFacteurs): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [...etapesReconnaissance(e)];
  const f1 = e.facteur1;
  const f2 = e.facteur2;
  const facteurs = [f1, f2];
  const alphas = [alphaDe(f1, "\\alpha"), alphaDe(f2, "\\beta")];
  const nomEq = ["1ʳᵉ équation", "2ᵉ équation"];
  if (e.sousCas === "nonFactoree") {
    const sq = lettre(e, "prefacteur");
    const fn = NOM[f2.fonction];
    const argComplet = formatArgumentLatex(f2.a, f2.b);
    // Argument non réduit à x : on pose u (la ligne complète, insécable, sortait de sa cellule).
    const avecU = argComplet.replace(/\s+/g, "") !== "x";
    const arg = avecU ? "u" : argComplet;
    const enonceU = simplifierAffichageProduit(`${fn}\\left(${arg}\\right)^2 = ${f2.k.latex}\\cdot ${fn}\\left(${arg}\\right)`);
    const factoriseU = simplifierAffichageProduit(`${fn}\\left(${arg}\\right)\\left(${fn}\\left(${arg}\\right) - ${f2.k.latex}\\right) = 0`);
    const tout = simplifierAffichageProduit(`${fn}\\left(${arg}\\right)^2 - ${f2.k.latex}\\cdot ${fn}\\left(${arg}\\right) = 0`);
    etapes.push(
      utilise(sq, [
        ...(avecU ? [texte("On pose "), latex(`u=${argComplet.replace(/\s+/g, "")}`), texte(". ")] : []),
        texte("Les deux termes ont un facteur commun, la fonction trigonométrique elle-même : on ramène tout dans un membre, puis on la met en évidence, comme pour un polynôme ("),
        latex("X^2-aX=X(X-a)"),
        texte(")."),
      ]),
      calcul(sq, [
        ligne(dfrac(enonceU).replace(/\s*=\s*/, "="), avecU ? "équation de départ, écrite avec u" : "équation de départ"),
        ligne(dfrac(tout).replace(/\s*=\s*/, "="), [
          texte(f2.k.valeur < 0 ? "on ajoute " : "on retranche "),
          latex(simplifierAffichageProduit(`${kPropre(f2.k.latex).replace(/^-/, "")}\\cdot ${fn}\\left(${arg}\\right)`)),
          texte(" aux deux membres"),
        ]),
        ligne(dfrac(factoriseU).replace(/\s*=\s*/, "="), [texte("on met "), latex(`${fn}\\left(${arg}\\right)`), texte(" en évidence")]),
      ]),
      resultat(sq, [latex(formatAidePrefacteurNiveau2Latex(e))]),
      piege(sq, [texte("Ne jamais diviser par le facteur commun : on perdrait toutes les solutions où il s'annule.")]),
    );
  }
  const sSep = lettre(e, "separerFacteurs");
  const produit = e.sousCas === "factoree" ? formatEnonceProduitLatex(e) : formatAidePrefacteurNiveau2Latex(e);
  const lignesSep: LigneCalcul[] = [ligne(dfrac(produit).replace(/\s*=\s*/, "="), "produit nul")];
  facteurs.forEach((f, i) => {
    const eq = dfrac(formatEquationEnonceLatex(f)).replace(/\s*=\s*/, "=");
    const nul = i === 0 ? "premier facteur nul" : "ou second facteur nul";
    if (f.k.valeur === 0) lignesSep.push(ligne(eq, nul));
    else {
      lignesSep.push(ligne(dfrac(simplifierAffichageProduit(`${NOM[f.fonction]}\\left(${formatArgumentLatex(f.a, f.b)}\\right) - ${f.k.latex} = 0`)).replace(/\s*=\s*/, "="), nul));
      lignesSep.push(ligne(eq, "on isole la fonction trigonométrique"));
    }
  });
  etapes.push(
    utilise(sSep, [texte(`Un produit est nul si et seulement si l'un de ses facteurs est nul ${COURS_EQUATIONS} : `), latex("A\\cdot B=0\\iff A=0\\ \\text{ou}\\ B=0"), texte(".")]),
    calcul(sSep, lignesSep),
    resultat(sSep, ouLatex(formatAideSepararFacteursNiveau2Latex(e))),
  );
  if (e.sousCas === "factoree") etapes.push(piege(sSep, [texte("Un produit nul donne deux équations à résoudre séparément, puis on réunit leurs solutions.")]));
  // Arguments
  const sArg = lettre(e, "argumentProduit");
  etapes.push(utilise(sArg, [texte(`Pour chaque équation, la formule du cours ${COURS_EQUATIONS} : deux séries pour sin et cos (une seule pour la valeur ±1), une seule pour tan, aucune si la valeur visée n'est pas dans [−1 ; 1].`)]));
  facteurs.forEach((f, i) => etapes.push(calcul(sArg, lignesArgument(f, alphas[i]!), [latex(dfrac(formatEquationEnonceLatex(f)))], nomEq[i])));
  const termesArg = facteurs.flatMap((f) => (f.aucuneSolution ? [] : formatTermesArgumentDirecteLatex(f)));
  etapes.push(resultat(sArg, termesArg.length ? ouLatex(termesArg) : [texte("Aucune série.")]));
  // x isolé
  const sX = lettre(e, "isolerXProduit");
  etapes.push(utilise(sX, [texte(UTILISE_ISOLER)]));
  const isos = facteurs.map((f, i) => isolerSeries(f, alphas[i]!));
  facteurs.forEach((f, i) => {
    if (f.aucuneSolution) etapes.push(calcul(sX, [ligne(`${kPropre(f.k.latex)}${f.k.valeur > 0 ? ">1" : "<-1"}`, "aucune série : rien à isoler")], [], nomEq[i]));
    else etapes.push(calcul(sX, isos[i]!.lignes, [], nomEq[i]));
  });
  const termesX = facteurs.flatMap((f) => f.branchesX.map((b: BrancheX) => `x ${relationBranche(b)} ${formatBrancheLatex(b)}`));
  etapes.push(resultat(sX, termesX.length ? ouLatex(termesX) : [texte("Aucune série.")]));
  etapes.push(piege(sX, [texte("La période se divise aussi par le coefficient de x.")]));
  // Solutions
  const sS = lettre(e, "solutionsProduit");
  const exclusions: LigneCalcul[] = [];
  facteurs.forEach((ft) => {
    if (ft.fonction !== "tan") return;
    const candidats = facteurs.flatMap((_f, i) => valeursDesSeries(isos[i]!.series, alphas[i]!)).filter((c, i, t) => t.findIndex((d) => Math.abs(d.x - c.x) < 1e-6) === i);
    exclusions.push(...lignesExclusionTangente(linArg(ft.a, ft.b), candidats.filter((c) => tangenteIndefinie(ft, c.x))));
  });
  etapes.push(...etapesSolutions(sS, facteurs.map((_f, i) => ({ label: nomEq[i]!, series: isos[i]!.series, al: alphas[i]! })), e.solutionsUnion, exclusions));
  return etapes;
}

// ---------------------------------------------------------------------------------------------
// Famille « pythagoricienne »
// ---------------------------------------------------------------------------------------------

function terme(coef: number, expr: string): string {
  if (coef === 0) return "";
  if (expr === "") return `${coef}`;
  return coef === 1 ? expr : coef === -1 ? `-${expr}` : `${coef}${expr}`;
}
function par(v: number, d = 2): string {
  return v < 0 ? `(${dec(v, d)})` : dec(v, d);
}

function correctionPythagoricienne(e: ExercicePythagoricienne): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [...etapesReconnaissance(e)];
  const { alpha, beta, gamma, fonctionCible: fc } = e;
  const cible = fc === "cos" ? "\\cos(x)" : "\\sin(x)";
  const cible2 = fc === "cos" ? "\\cos^2(x)" : "\\sin^2(x)";
  const autre2 = fc === "cos" ? "\\sin^2(x)" : "\\cos^2(x)";
  // b) conversion
  const sb = "b";
  const remplace = somme([`${-alpha === -1 ? "-" : `${-alpha}`}\\left(1-${cible2}\\right)`, terme(beta, cible), terme(alpha + gamma, "")]);
  const distribue = somme([`${-alpha}`, terme(alpha, cible2), terme(beta, cible), terme(alpha + gamma, "")]);
  etapes.push(
    utilise(sb, [texte(`La relation fondamentale ${COURS_EQUATIONS} donne `), latex(`${autre2}=1-${cible2}`), texte(" : on remplace, puis on développe et on réduit.")]),
    calcul(sb, [
      ligne(formatEnonceMixteLatex(e).replace(/\s*=\s*/, "="), "équation de départ"),
      ligne(`${remplace}=0`, [texte("on remplace "), latex(autre2), texte(" par "), latex(`1-${cible2}`)]),
      ligne(`${distribue}=0`, "on distribue"),
      ligne(formatPolynomeCibleLatex(e).replace(/\s*=\s*/, "="), "on réduit"),
    ]),
    resultat(sb, [latex(formatPolynomeCibleLatex(e))]),
    piege(sb, [texte("Remplacer le carré par « 1 − » l'autre carré (et non « 1 + ») : "), latex(`${autre2}=1-${cible2}`), texte(".")]),
  );
  // c) racines t
  const sc = "c";
  const delta = beta * beta - 4 * alpha * gamma;
  const s = Math.round(Math.sqrt(delta));
  const moins = (-beta - s) / (2 * alpha);
  const ordre = Math.abs(moins - e.racine1.t) < 1e-9 ? ["-", "+"] : ["+", "-"];
  const poly = somme([terme(alpha, "t^2"), terme(beta, "t"), terme(gamma, "")]);
  const lignesT: LigneCalcul[] = [
    ligne(`${poly}=0`, `on pose t = ${fc}(x)`),
    ligne(`\\Delta=${par(beta, 0)}^2-4\\cdot ${alpha}\\cdot ${par(gamma, 0)}`, "discriminant"),
    ligne(`=${delta}`),
  ];
  [e.racine1, e.racine2].forEach((r, i) => {
    const sg = ordre[i]!;
    lignesT.push(
      ligne(`t_${i + 1}=\\dfrac{${-beta}${sg}\\sqrt{${delta}}}{2\\cdot ${alpha}}`, sg === "-" ? "racine avec −√Δ" : "racine avec +√Δ"),
      ligne(`=\\dfrac{${-beta}${sg}${s}}{${2 * alpha}}`),
      ligne(`=${dec(r.t, 2)}`),
    );
  });
  etapes.push(
    utilise(sc, [texte(`On pose t = ${fc}(x) : l'équation devient une équation du second degré en t, résolue par le discriminant `), latex("\\Delta=b^2-4ac"), texte(", puis "), latex("t=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}"), texte(".")]),
    calcul(sc, lignesT),
    resultat(sc, ouLatex(formatTermesRacinesTLatex(e))),
    verification(sc, [texte("Le produit des racines vaut "), latex(alpha === 1 ? `\\dfrac{c}{a}=${gamma}` : `\\dfrac{c}{a}=\\dfrac{${gamma}}{${alpha}}`), texte(" :")], [ligne(`t_1\\cdot t_2=${par(e.racine1.t)}\\cdot ${par(e.racine2.t)}`), ligne(`=${dec((e.racine1.t * e.racine2.t), 2)}`)]),
  );
  // d) retour à x
  const sd = "d";
  etapes.push(utilise(sd, [texte(`${fc === "cos" ? "Un cosinus" : "Un sinus"} est toujours compris entre −1 et 1 : une racine hors de [−1 ; 1] est rejetée ; pour les autres, on résout ${fc}(x) = t avec la formule du cours ${COURS_EQUATIONS}.`)]));
  const seriesRacines: BlocSeries[] = [];
  [e.racine1, e.racine2].forEach((r, i) => {
    const nomT = `t_${i + 1}`;
    if (r.invalide || r.resolution === null) {
      etapes.push(calcul(sd, [ligne(`${nomT}=${dec(r.t, 2)}${r.t > 0 ? ">1" : "<-1"}`, `un ${NOM_FR[fc]} est toujours compris entre −1 et 1 : t${i === 0 ? "₁" : "₂"} est rejetée`)], [], `Racine t${i === 0 ? "₁" : "₂"}`));
      return;
    }
    const f = r.resolution;
    const al = alphaDe(f, "\\alpha");
    const lignes: LigneCalcul[] = [ligne(`${NOM[fc]}(x)=${dec(r.t, 2)}`, "on revient à x")];
    const series = seriesU(f, al);
    // t = ±1 : les deux séries du moteur sont confondues → une seule ligne.
    const uniques = series.filter((s2, j) => series.findIndex((s3) => Math.abs(eVal(eSub(s3.c, s2.c))) < 1e-9) === j);
    if (Math.abs(r.t) === 1) {
      lignes.push(ligne(`x=${serieL(uniques[0]!, al)}`, `seul angle de ${NOM_FR[fc]} ${r.t > 0 ? "1" : "−1"} : une seule série`));
    } else {
      lignes.push(...lignesArgument({ ...f, k: { valeur: r.t, latex: dec(r.t, 2) } }, al));
    }
    etapes.push(calcul(sd, lignes, [], `Racine t${i === 0 ? "₁" : "₂"}`));
    seriesRacines.push({ label: `Racine t${i === 0 ? "₁" : "₂"}`, series: uniques, al });
  });
  etapes.push(resultat(sd, ouLatex(formatTermesRacinesResolutionLatex(e))));
  if ([e.racine1, e.racine2].some((r) => r.invalide)) etapes.push(piege(sd, [texte(`Une racine t hors de [−1 ; 1] ne donne aucune solution : ${fc}(x) ne peut pas valoir t. Elle est rejetée, pas résolue.`)]));
  etapes.push(...etapesSolutions("e", seriesRacines, e.solutionsUnion, []));
  return etapes;
}

// ---------------------------------------------------------------------------------------------
// Famille « égalité »
// ---------------------------------------------------------------------------------------------

function correctionEgalite(e: ExerciceEgaliteExpressions): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [...etapesReconnaissance(e)];
  const argA = formatArgumentLatex(e.a1, e.b1).replace(/\s+/g, "");
  const argB = formatArgumentLatex(e.a2, e.b2).replace(/\s+/g, "");
  const bPar = e.b2.decimal === 0 ? argB : `\\left(${argB}\\right)`;
  const tan = e.identite === "tanVersTan";
  const fnB = e.identite === "cosVersCos" ? "\\sin" : "\\cos";
  const fnCible = e.identite === "cosVersCos" ? "\\cos" : e.identite === "sinVersSin" ? "\\sin" : "\\tan";
  // b) conversion
  const sb = "b";
  const identite = tan ? `-\\tan\\left(${argB}\\right)=\\tan\\left(-${bPar}\\right)` : `${fnB}\\left(${argB}\\right)=${fnCible}\\left(\\dfrac{\\pi}{2}-${bPar}\\right)`;
  etapes.push(
    utilise(sb, tan ? [texte(`La tangente est impaire ${COURS_EQUATIONS} : `), latex("-\\tan\\theta=\\tan(-\\theta)"), texte(".")] : [texte(`Deux angles complémentaires ${COURS_EQUATIONS} : `), latex(e.identite === "cosVersCos" ? "\\sin\\theta=\\cos\\left(\\dfrac{\\pi}{2}-\\theta\\right)" : "\\cos\\theta=\\sin\\left(\\dfrac{\\pi}{2}-\\theta\\right)"), texte(".")]),
    calcul(sb, [
      ligne(dfrac(formatEnonceEgaliteLatex(e)).replace(/\s*=\s*/, "="), "équation de départ"),
      ligne(identite, tan ? "la tangente est impaire" : "angles complémentaires"),
      ligne(dfrac(formatEquationConvertieEgaliteLatex(e)).replace(/\s*=\s*/, "="), "on remplace dans l'équation"),
    ]),
    resultat(sb, [latex(formatEquationConvertieEgaliteLatex(e))]),
  );
  // c) égaler les arguments, isoler x
  const sc = "c";
  const gauche = linArg(e.a1, e.b1);
  const b2 = valeurExpr(e.b2);
  const a2 = q(e.a2.numerateur, e.a2.denominateur);
  // B' : l'angle de la fonction convertie (π/2 − B, ou −B), réduit.
  const Bc: Lin = tan ? { a: qNeg(a2), c: eNeg(b2) } : { a: qNeg(a2), c: eSub(EPi(1, 2), b2) };
  const constantePremiere = (l: Lin) => somme([...termesExpr(l.c), qNul(l.a) ? "" : coefX(l.a)]);
  const pre: LigneCalcul[] = [];
  const brut = tan ? `-${bPar}` : `\\dfrac{\\pi}{2}-${bPar}`;
  if (brut !== constantePremiere(Bc)) pre.push(ligne(`${brut}=${constantePremiere(Bc)}`, tan ? "on distribue le signe −" : "on réduit l'angle"));
  const kP = tan ? PI : DEUX_PI;
  const blocs: { label: string; lignes: LigneCalcul[]; c: Expr; p: Expr; b: BrancheX }[] = [];
  const famille = (label: string, droite: Lin, debut: LigneCalcul[], b: BrancheX) => {
    const depart = `${argA}=${somme([constantePremiere(droite), tan ? "k\\pi" : "2k\\pi"])}`;
    const r = lignesIsolerX(gauche, droite, kP, { depart });
    const lignes = [...debut, ...r.lignes.slice(debut.length && debut[debut.length - 1]!.latex === depart ? 1 : 0)];
    blocs.push({ label, lignes: avecFinale(lignes, "=", formatBrancheLatex(b)), c: r.c, p: r.p, b });
  };
  const f1Depart = `${argA}=${somme([constantePremiere(Bc), tan ? "k\\pi" : "2k\\pi"])}`;
  famille(tan ? "Série" : "1ʳᵉ série", Bc, [...pre, ligne(f1Depart, tan ? "A = B + kπ" : "première série : A = B + 2kπ")], e.branches[0]!);
  if (!tan) {
    const debut: LigneCalcul[] = [];
    let droite: Lin;
    if (e.identite === "cosVersCos") {
      droite = { a: qNeg(Bc.a), c: eNeg(Bc.c) };
      debut.push(ligne(`${argA}=-\\left(${constantePremiere(Bc)}\\right)+2k\\pi`, "seconde série : A = −B + 2kπ"));
      debut.push(ligne(`${argA}=${somme([constantePremiere(droite), "2k\\pi"])}`, "on distribue le signe −"));
    } else {
      droite = { a: qNeg(Bc.a), c: eSub(PI, Bc.c) };
      debut.push(ligne(`${argA}=\\pi-\\left(${constantePremiere(Bc)}\\right)+2k\\pi`, "seconde série : A = π − B + 2kπ"));
      debut.push(ligne(`${argA}=${somme(["\\pi", ...termesExpr(eNeg(Bc.c)), coefX(qNeg(Bc.a)), "2k\\pi"])}`, "on distribue le signe −"));
      debut.push(ligne(`${argA}=${somme([constantePremiere(droite), "2k\\pi"])}`, "on réduit"));
    }
    famille("2ᵉ série", droite, debut, e.branches[1]!);
  }
  etapes.push(
    utilise(sc, [texte(`Deux ${tan ? "tangentes" : e.identite === "cosVersCos" ? "cosinus" : "sinus"} égaux ${COURS_EQUATIONS} : `), latex(tan ? "\\tan A=\\tan B\\iff A=B+k\\pi" : e.identite === "cosVersCos" ? "\\cos A=\\cos B\\iff A=B+2k\\pi\\ \\text{ou}\\ A=-B+2k\\pi" : "\\sin A=\\sin B\\iff A=B+2k\\pi\\ \\text{ou}\\ A=\\pi-B+2k\\pi"), texte(" ; dans chaque série, on isole x.")]),
    ...blocs.map((b) => calcul(sc, b.lignes, [], b.label)),
    resultat(sc, ouLatex(formatAideResoudreEgaliteNiveau2Latex(e))),
  );
  if (!tan) etapes.push(piege(sc, [texte("Deux séries : en oublier une fait perdre des solutions.")]));
  // d) solutions
  const sd = "d";
  const al: Alpha = { exact: EZero, valeur: 0, nom: "\\alpha" };
  const series = blocs.map((b) => ({ c: b.c, p: b.p }));
  const exclusions = tan ? lignesExclusionTangente(gauche, valeursDesSeries(series, al)) : [];
  etapes.push(...etapesSolutions(sd, blocs.map((b) => ({ label: b.label, series: [{ c: b.c, p: b.p }], al })), e.solutions, exclusions));
  if (tan) etapes.push(piege(sd, [texte("Les valeurs où l'une des tangentes n'est pas définie ne sont pas solutions, même si elles apparaissent dans la série.")]));
  return etapes;
}

export function correctionDetailleeEquationTrig(e: T): EtapeCorrection[] {
  const etapes =
    e.famille === "directe" ? correctionDirecte(e) : e.famille === "produit" ? correctionProduit(e) : e.famille === "pythagoricienne" ? correctionPythagoricienne(e) : correctionEgalite(e);
  return finaliserCorrige(etapes);
}

/** Lettres des écrans « solutions » (étapes sans charge : même substitution répétée pour chaque k). */
export function lettresSolutionsEquationTrig(e: T): string[] {
  return ecransEquationTrig(e)
    .map((p, i) => (p.startsWith("solutions") ? LETTRES[i]! : null))
    .filter((l): l is string => l !== null);
}

