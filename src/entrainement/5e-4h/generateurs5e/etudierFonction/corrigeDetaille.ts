import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise } from "../../../export/corrigeTableau";
import type { ExerciceEtudeLocalePolynomiale, ExerciceEtudeLocaleRationnelle, RacineEtudeLocale } from "../../core5e/etudeLocale.types";
import type { ExerciceEtudierFonction, ExerciceRationnelleAO } from "../../core5e/etudierFonction.types";
import { ordreEcransEtudierFonction, type EcranEtudierFonction } from "../../moteur5e/typesEtudierFonction";
import {
  classificationFPrime,
  classificationFSeconde,
  decalageVertical,
  exclusionsCE,
  pointsClesEtudierFonction,
  racinesFPrime,
  racinesFSeconde,
  tableauFPrimeAttendu,
  tableauFSecondeAttendu,
  type PointCleEtudierFonction,
} from "../../moteur5e/verificationEtudierFonction";
import { valeurNumeriqueRacineEtudeLocale } from "../../moteur5e/verificationEtudeLocale";
import { formatCoordonneesLatex, formatDomaineLatex, formatReponseAttenduePhaseLatex, formatResumeTableauLatex } from "../../ui5e/formatEtudierFonction";
import { radicalSimplifieLatex } from "../../ui5e/formatEtudeLocale";
import { cote, infini, lim, zeroSigne } from "../../ui5e/corrigeLimites";
import {
  COURS_ETUDIER,
  COURS_LOCALE,
  COURS_REGLES,
  COURS_SIGNE,
  approche,
  deriveePoly,
  egalApprox,
  evalPoly,
  evalPolyQ,
  f,
  finaliserDerivees,
  lignesDeriveePoly,
  lignesTrinome,
  lignesValeurPoly,
  lignesValeurQ,
  listeEt,
  nbT,
  nombreExactL,
  nombreExactQ,
  parN,
  pointsTest,
  polyV,
  q,
  qAdd,
  qL,
  qVal,
  signeRel,
  t,
  type Fragments,
  type Q,
} from "../../ui5e/corrigeDerivees2";
import { asymptotesLatex, construireSvgEtudierFonction, tableauHtml } from "./figures";

/**
 * Corrigé détaillé « comme au tableau » de 5gen31 (étudier une fonction) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`ordreEcransEtudierFonction`, sans
 * l'écran « recap », purement présentationnel) :
 * - domaine : dénominateur nul résolu (x − e = 0, ou (x − e)² = m²) ;
 * - limites : terme de plus haut degré (polynôme), fraction qui tend vers 0 (asymptote horizontale
 *   y = décalage), signe du dénominateur de part et d'autre de chaque valeur exclue (0⁺ / 0⁻), écart
 *   f(x) − (ax + b) = c/(x − e) → 0 (asymptote oblique) ;
 * - f′ et f″ : terme à terme (polynôme), dénominateur nommé D(x) et règles du quotient et de la chaîne
 *   une par ligne (rationnelle), (1/u)′ et (1/u²)′ (asymptote oblique) ;
 * - tableaux : zéros résolus (trinôme rendu unitaire, discriminant, radical simplifié ; carré isolé ;
 *   équation du premier degré), signe par une valeur test dans chaque intervalle (numérateur quand le
 *   dénominateur est un carré), tableau en figure ;
 * - coordonnées : f (et non f′) en chaque point — substitution entière ou fractionnaire, puissances de
 *   e ± √r développées puis termes en √r regroupés (le point conjugué par changement de signe de √r),
 *   (x − e)² = r pour une rationnelle, c = a·r pour l'asymptote oblique ;
 * - graphique : points et asymptotes à placer (lecture), graphique en figure.
 * SANS `docx` : importé par l'adaptateur ET par `App5gen31.tsx`.
 */

const LETTRES = "abcdefghij";

function etapes(e: ExerciceEtudierFonction): EcranEtudierFonction[] {
  return ordreEcransEtudierFonction(e).filter((x) => x !== "recap");
}

export function lettreEcranEtudierFonction(e: ExerciceEtudierFonction, ecran: EcranEtudierFonction): string {
  return LETTRES[etapes(e).indexOf(ecran)] ?? "a";
}

const rep = (e: ExerciceEtudierFonction, ecran: EcranEtudierFonction): Fragments => listeEt(formatReponseAttenduePhaseLatex(e, ecran).map((x) => [f(x)]));

// ============================================================================
// Écritures communes.
// ============================================================================

/** « x-3 », « x+2 », « x ». */
function xMoins(e: number): string {
  return e === 0 ? "x" : e > 0 ? `x-${e}` : `x+${-e}`;
}

/** « (x-3)^{2} », « x^{2} ». */
function carre(e: number, n = 2): string {
  return e === 0 ? `x^{${n}}` : `(${xMoins(e)})^{${n}}`;
}

/** « +5 », « -3 » ; vide pour 0. */
function signe(n: number): string {
  return n === 0 ? "" : n > 0 ? `+${n}` : `${n}`;
}

/** Coefficient devant une écriture (« 3 », « -», « »). */
function coef(n: number): string {
  return n === 1 ? "" : n === -1 ? "-" : `${n}`;
}

function racineLatex(r: RacineEtudeLocale): string {
  if (r.exact) return qL(q(r.valeur.num, r.valeur.den));
  const rad = radicalSimplifieLatex(1, r.radicande);
  if (r.centre === 0) return r.signe < 0 ? `-${rad}` : rad;
  return `${r.centre}${r.signe < 0 ? "-" : "+"}${rad}`;
}

/** D(x) d'une rationnelle c/((x − e)² + k). */
function dLatex(n: ExerciceEtudeLocaleRationnelle): string {
  return `${carre(n.e)}${signe(n.k)}`;
}

type Noyau = { p: ExerciceEtudeLocalePolynomiale } | { r: ExerciceEtudeLocaleRationnelle; dd: number } | { ao: ExerciceRationnelleAO };

function noyau(e: ExerciceEtudierFonction): Noyau {
  if (e.famille === "rationnelleAO") return { ao: e };
  return e.noyau.type === "polynomiale" ? { p: e.noyau } : { r: e.noyau, dd: decalageVertical(e) };
}

const coeffsP = (p: ExerciceEtudeLocalePolynomiale) => [p.d, p.c, p.b, p.a];

/** Valeur exacte d'une fonction rationnelle en un rationnel (f′, f″ des valeurs test). */
function signeLigne(gauche: string, valeur: Q, sub?: string): LigneCalcul[] {
  const out: LigneCalcul[] = [];
  if (sub) out.push(ligne(`${gauche}=${sub}`));
  out.push(ligne(`${sub ? "" : `${gauche}`}=${qL(valeur)}${signeRel(qVal(valeur))}`));
  return out;
}

/** Valeurs test d'un polynôme (entier ou fraction), dernière ligne suivie du signe. */
function lignesSignePoly(nom: string, P: number[], x: number): LigneCalcul[] {
  const xq = nombreExactQ(x);
  const v = xq.d === 1 ? lignesValeurPoly(`${nom}(${x})`, P, x) : lignesValeurQ(`${nom}\\left(${qL(xq, true)}\\right)`, P, xq);
  const lignes = [...v.lignes];
  const val = typeof v.valeur === "number" ? v.valeur : qVal(v.valeur);
  const der = lignes[lignes.length - 1];
  lignes[lignes.length - 1] = { ...der, latex: `${der.latex}${signeRel(val)}` };
  return lignes;
}

/** Intervalle « ]g ; d[ » (−∞, +∞ compris) pour une justification. */
function intervalle(g: number, d: number, noms?: Map<number, string>): string {
  const b = (x: number) => (x === -Infinity ? "-\\infty" : x === Infinity ? "+\\infty" : (noms?.get(x) ?? nombreExactL(x)));
  return `]${b(g)}\\,;\\,${b(d)}[`;
}

// ============================================================================
// Domaine.
// ============================================================================

function etapeDomaine(e: ExerciceEtudierFonction, l: string): EtapeCorrection[] {
  const n = noyau(e);
  let lignes: LigneCalcul[];
  if ("ao" in n) lignes = [ligne(`${xMoins(n.ao.e)}=0`, "le dénominateur s'annule"), ligne(`x=${n.ao.e}`)];
  else if ("r" in n) {
    const m = Math.round(Math.sqrt(-n.r.k));
    const ee = n.r.e;
    lignes = [
      ligne(`${dLatex(n.r)}=0`, "le dénominateur s'annule"),
      ligne(`${carre(ee)}=${m * m}`, `on isole le carré`),
      ligne(`${xMoins(ee)}=\\pm ${m}`, "deux valeurs opposées ont ce carré"),
      ...(ee === 0 ? [] : [ligne(`x_1=${ee}-${m}`, `on ajoute ${nbT(ee)}`), ligne(`=${ee - m}`), ligne(`x_2=${ee}+${m}`), ligne(`=${ee + m}`)]),
    ];
  } else lignes = [];
  return [
    utilise(l, [t("f est définie là où son dénominateur ne s'annule pas : on résout « dénominateur = 0 » "), t(COURS_ETUDIER), t(".")]),
    calcul(l, lignes),
    resultat(l, [f(formatDomaineLatex(e)), t(".")]),
  ];
}

// ============================================================================
// Limites et asymptotes.
// ============================================================================

function etapeLimites(e: ExerciceEtudierFonction, l: string, avecDomaine: boolean): EtapeCorrection[] {
  const n = noyau(e);
  const blocs: EtapeCorrection[] = [];
  const res: Fragments = [...rep(e, "limites")];
  let utiliseFr: Fragments;
  if ("p" in n) {
    const a = n.p.a;
    const lignes: LigneCalcul[] = [];
    for (const s of [-1, 1]) {
      const cible = infini(s);
      const lim3 = s < 0 ? (a > 0 ? -1 : 1) : a > 0 ? 1 : -1;
      lignes.push(ligne(`${lim(cible)} f(x)=${lim(cible)} ${coef(a)}x^{3}`, "terme de plus haut degré"));
      lignes.push(ligne(`=${infini(lim3)}`, [f(`x^{3}\\to ${cible}`), t(a > 0 ? ", multiplié par un nombre positif" : ", multiplié par un nombre négatif")]));
    }
    blocs.push(calcul(l, lignes));
    utiliseFr = [t("f est un polynôme, défini sur ℝ : en −∞ et en +∞, il a la même limite que son terme de plus haut degré "), t(COURS_ETUDIER), t(".")];
    res.push(t(" : limites infinies, f définie sur ℝ, polynôme de degré 3 — aucune asymptote."));
  } else if ("r" in n) {
    const { c, e: ee, k } = n.r;
    const dd = n.dd;
    const D = dLatex(n.r);
    if (k < 0) {
      const m = Math.round(Math.sqrt(-k));
      for (const r of exclusionsCE(e)) {
        const lignes: LigneCalcul[] = [];
        for (const sens of ["gauche", "droite"] as const) {
          // D > 0 hors de [e − m ; e + m], D < 0 entre les deux racines.
          const dehors = (r === ee - m && sens === "gauche") || (r === ee + m && sens === "droite");
          const sD = dehors ? 1 : -1;
          const sf = Math.sign(c) * sD;
          lignes.push(ligne(`${lim(cote(r, sens))} (${D})=${zeroSigne(sD)}`, dehors ? [t(`hors de [${nbT(ee - m)} ; ${nbT(ee + m)}] : `), f(`${carre(ee)}>${m * m}`)] : [t("entre les valeurs exclues : "), f(`${carre(ee)}<${m * m}`)]));
          lignes.push(ligne(`${lim(cote(r, sens))} f(x)=${infini(sf)}`, [f(`\\frac{${c}}{${zeroSigne(sD)}}${signe(dd)}`), t(sf > 0 ? " : quotient positif" : " : quotient négatif")]));
        }
        blocs.push(calcul(l, lignes, [], `En x = ${nbT(r)}`));
      }
    }
    blocs.push(
      calcul(
        l,
        [
          ligne(`${lim("\\pm\\infty")} (${D})=+\\infty`, [t("le carré "), f(carre(ee)), t(" devient aussi grand qu'on veut")]),
          ligne(`${lim("\\pm\\infty")} \\dfrac{${c}}{${D}}=0`, "un nombre fixe divisé par un nombre infiniment grand"),
          ligne(`${lim("\\pm\\infty")} f(x)=${dd}`, dd === 0 ? "f est cette fraction" : [t("on ajoute "), f(`${dd}`)]),
        ],
        k > 0 ? [t("Le dénominateur "), f(`${D}\\geq ${k}>0`), t(" ne s'annule jamais : f est définie sur ℝ.")] : [],
        "En ±∞",
      ),
    );
    utiliseFr = [t("Près d'une valeur exclue, le numérateur garde son signe et le dénominateur tend vers 0⁺ ou 0⁻ : la règle des signes donne ±∞. En ±∞, une fraction à numérateur fixe tend vers 0 "), t(COURS_ETUDIER), t(".")];
    const asym = asymptotesLatex(e);
    res.push(t(" : "), ...listeEt(asym.map((x) => [t(x.startsWith("x") ? "AV " : "AH "), f(x)])), t("."));
  } else {
    const { a, b, c, e: ee } = n.ao;
    const lignes: LigneCalcul[] = [];
    for (const sens of ["gauche", "droite"] as const) {
      const s = sens === "gauche" ? -1 : 1;
      const sf = Math.sign(c) * s;
      lignes.push(ligne(`${lim(cote(ee, sens))} (${xMoins(ee)})=${zeroSigne(s)}`, [f(s < 0 ? `x<${nbT(ee).replace("−", "-").replace(",", "{,}")}` : `x>${nbT(ee).replace("−", "-").replace(",", "{,}")}`)]));
      lignes.push(ligne(`${lim(cote(ee, sens))} f(x)=${infini(sf)}`, [f(`${coef(a)}x${signe(b)}\\to ${a * ee + b}`), t(" et "), f(`\\frac{${c}}{${zeroSigne(s)}}=${infini(sf)}`)]));
    }
    blocs.push(calcul(l, lignes, [], `En x = ${nbT(ee)}`));
    blocs.push(
      calcul(
        l,
        [
          ligne(`f(x)-(${coef(a)}x${signe(b)})=\\dfrac{${c}}{${xMoins(ee)}}`, "on retire la partie affine"),
          ligne(`${lim("\\pm\\infty")} \\dfrac{${c}}{${xMoins(ee)}}=0`, "un nombre fixe divisé par un nombre infiniment grand"),
        ],
        [],
        "En ±∞",
      ),
    );
    utiliseFr = [t("Près de la valeur exclue, "), f(`${xMoins(ee)}\\to 0^{\\pm}`), t(" et la règle des signes donne ±∞. En ±∞, si "), f("f(x)-(ax+b)\\to 0"), t(", la droite "), f("y=ax+b"), t(" est asymptote oblique "), t(COURS_ETUDIER), t(".")];
    res.push(t(" : AV "), f(`x=${ee}`), t(" et AO "), f(`y=${coef(a)}x${signe(b)}`), t("."));
  }
  if (!avecDomaine) utiliseFr = [t("Domaine : "), f(formatDomaineLatex(e)), t(" (aucune valeur interdite). "), ...utiliseFr];
  return [
    utilise(l, utiliseFr),
    ...blocs,
    resultat(l, res),
    ...(e.famille === "rationnelleAO" ? [piege(l, [t("Le terme fraction tend vers 0 en ±∞ : l'asymptote oblique est la partie affine seule.")])] : []),
  ];
}

// ============================================================================
// f′(x).
// ============================================================================

function etapeFPrime(e: ExerciceEtudierFonction, l: string): EtapeCorrection[] {
  const n = noyau(e);
  let lignes: LigneCalcul[];
  let u: Fragments;
  if ("p" in n) {
    lignes = [ligne(`f(x)=${polyV(coeffsP(n.p))}`, "énoncé"), ...lignesDeriveePoly("f'(x)", coeffsP(n.p))];
    u = [t("f est un polynôme : on dérive terme à terme, "), f("(a\\,x^{n})'=n\\,a\\,x^{n-1}"), t(" "), t(COURS_REGLES), t(".")];
  } else if ("r" in n) {
    const { c, e: ee } = n.r;
    const D = dLatex(n.r);
    const dP = ee === 0 ? "2x" : `2(${xMoins(ee)})`;
    lignes = [
      ligne(`D(x)=${D}`, "on nomme le dénominateur"),
      ligne(`D'(x)=${dP}`, ee === 0 ? [f("(x^{2})'=2x"), t(", constante → 0")] : [t("règle de la chaîne : "), f(`\\big((${xMoins(ee)})^{2}\\big)'=2(${xMoins(ee)})\\cdot 1`)]),
      ligne(`f'(x)=\\dfrac{0\\cdot D(x)-${parN(c)}\\cdot D'(x)}{D(x)^{2}}`, [t("dérivée d'un quotient, numérateur constant "), f(`${c}`), ...(n.dd ? [t(", et la constante "), f(`${n.dd}`), t(" a pour dérivée 0")] : [])]),
      ligne(`=\\dfrac{${-2 * c}${ee === 0 ? "x" : `(${xMoins(ee)})`}}{D(x)^{2}}`, [f(`-${parN(c)}\\cdot 2=${-2 * c}`)]),
      ligne(`=\\dfrac{${polyV([2 * c * ee, -2 * c])}}{\\left[${D}\\right]^{2}}`, "on distribue et on remplace D(x)"),
    ];
    u = [t("f = numérateur constant ÷ D(x) : règle du quotient "), f("\\left(\\frac{u}{v}\\right)'=\\frac{u'v-uv'}{v^{2}}"), t(" avec u′ = 0, et règle de la chaîne pour "), f("D(x)"), t(" "), t(COURS_REGLES), t(".")];
  } else {
    const { a, c, e: ee } = n.ao;
    lignes = [
      ligne(`f'(x)=${a}+${parN(c)}\\cdot\\left(-\\dfrac{1}{${carre(ee)}}\\right)`, [f(`(${coef(a)}x${signe(n.ao.b)})'=${a}`), t(" et "), f("\\left(\\frac{1}{u}\\right)'=-\\frac{u'}{u^{2}}"), t(", u′ = 1")]),
      ligne(`=${a}${c > 0 ? "-" : "+"}\\dfrac{${Math.abs(c)}}{${carre(ee)}}`),
    ];
    u = [t("Terme à terme : la partie affine a pour dérivée son coefficient a, et "), f("\\left(\\frac{1}{u}\\right)'=-\\frac{u'}{u^{2}}"), t(" avec "), f(`u=${xMoins(ee)}`), t(" "), t(COURS_REGLES), t(".")];
  }
  return [utilise(l, u), calcul(l, lignes), resultat(l, [...rep(e, "calculerFPrime"), t(".")])];
}

// ============================================================================
// Tableau de f′.
// ============================================================================

function etapeTableauFPrime(e: ExerciceEtudierFonction, l: string): EtapeCorrection[] {
  const n = noyau(e);
  const blocs: EtapeCorrection[] = [];
  const racines = racinesFPrime(e).map(valeurNumeriqueRacineEtudeLocale);
  const exclues = exclusionsCE(e);
  const tests = pointsTest([...racines, ...exclues]);
  const bornes = [-Infinity, ...[...racines, ...exclues].sort((x, y) => x - y), Infinity];
  const noms = new Map<number, string>(racinesFPrime(e).map((r) => [valeurNumeriqueRacineEtudeLocale(r), racineLatex(r)]));
  let u: Fragments;
  if ("p" in n) {
    const P = coeffsP(n.p);
    const dP = deriveePoly(P);
    const k = dP[2];
    const unit = dP.map((x) => x / k);
    const lignes: LigneCalcul[] = [ligne(`${polyV(dP)}=0`, [f("f'(x)=0")])];
    if (unit.every((x) => Number.isInteger(x))) {
      lignes.push(ligne(`${polyV(unit)}=0`, `on divise par ${nbT(k)}`));
      lignes.push(...lignesTrinome(1, unit[1], unit[0]).lignes);
    } else lignes.push(...lignesTrinome(dP[2], dP[1], dP[0]).lignes);
    blocs.push(calcul(l, lignes, [], "Zéros de f′"));
    blocs.push(calcul(l, tests.flatMap((x, i) => lignesSignePoly("f'", dP, x).map((li, j) => (j === 0 ? { ...li, justification: [t("sur "), f(intervalle(bornes[i], bornes[i + 1], noms))] } : li))), [], "Signe de f′"));
    u = [t("On résout f′(x) = 0 (second degré), puis on prend une valeur test dans chaque intervalle : f′ > 0 ⇒ f croissante, f′ < 0 ⇒ f décroissante ; une racine où f′ change de signe est un extremum, sinon non "), t(COURS_SIGNE), t(".")];
  } else if ("r" in n) {
    const { c, e: ee } = n.r;
    const N = [2 * c * ee, -2 * c];
    blocs.push(calcul(l, [ligne(`${polyV(N)}=0`, "numérateur de f′ nul"), ligne(`${-2 * c}x=${-2 * c * ee}`, "on isole le terme en x"), ligne(`x=${ee}`, `on divise par ${nbT(-2 * c)}`)], [t("Le dénominateur de f′ est un carré, positif sur le domaine : f′ a le signe de son numérateur "), f(`N(x)=${polyV(N)}`), t(".")], "Zéro de f′"));
    blocs.push(calcul(l, tests.flatMap((x, i) => lignesSignePoly("N", N, x).map((li, j) => (j === 0 ? { ...li, justification: [t("sur "), f(intervalle(bornes[i], bornes[i + 1], noms))] } : li))), [], "Signe de f′"));
    u = [t("f′ a le signe de son numérateur (le dénominateur est un carré) : on trouve son zéro, puis une valeur test par intervalle (valeurs exclues comprises) "), t(COURS_SIGNE), t(".")];
  } else {
    const { a, c, e: ee } = n.ao;
    const r2 = q(c, a);
    const lignes: LigneCalcul[] = [ligne(`${a}${c > 0 ? "-" : "+"}\\dfrac{${Math.abs(c)}}{${carre(ee)}}=0`, [f("f'(x)=0")]), ligne(`${carre(ee)}=${qL(r2)}`, [t("on multiplie par "), f(carre(ee)), t(`, puis on divise par ${nbT(a)}`)])];
    if (qVal(r2) < 0) lignes.push(ligne(`${carre(ee)}\\geq 0>${qL(r2)}`, "un carré n'est jamais négatif : f′ ne s'annule pas"));
    else {
      const rs = racinesFPrime(e);
      const delta = Math.round(Math.sqrt(qVal(r2)));
      const exact = rs[0].exact;
      lignes.push(ligne(`${xMoins(ee)}=\\pm ${exact ? delta : `\\sqrt{${r2.n}}`}`, "deux valeurs opposées ont ce carré"));
      if (!exact && radicalSimplifieLatex(1, r2.n) !== `\\sqrt{${r2.n}}`) lignes.push(ligne(`=\\pm ${radicalSimplifieLatex(1, r2.n)}`, [t("on simplifie la racine : "), f(`\\sqrt{${r2.n}}=${radicalSimplifieLatex(1, r2.n)}`)]));
      lignes.push(ligne(`x_1=${racineLatex(rs[0])}`, ee === 0 ? undefined : `on ajoute ${nbT(ee)}`));
      lignes.push(ligne(`x_2=${racineLatex(rs[1])}`));
    }
    blocs.push(calcul(l, lignes, [], "Zéros de f′"));
    const fp = (x: number) => q(a * (Math.round(x * 2) - 2 * ee) ** 2 - 4 * c, (Math.round(x * 2) - 2 * ee) ** 2);
    blocs.push(
      calcul(
        l,
        tests.flatMap((x, i) => {
          const xl = nombreExactL(x);
          const d = nombreExactQ(x);
          const ecart = qAdd(d, q(-ee));
          return signeLigne(`f'(${xl.replace("\\dfrac", "\\frac")})`, fp(x), `${a}${c > 0 ? "-" : "+"}\\dfrac{${Math.abs(c)}}{${ecart.d === 1 ? parN(ecart.n) : `\\left(${qL(ecart, true)}\\right)`}^{2}}`).map((li, j) => (j === 0 ? { ...li, justification: [t("sur "), f(intervalle(bornes[i], bornes[i + 1], noms))] } : li));
        }),
        [],
        "Signe de f′",
      ),
    );
    u = [t("On résout f′(x) = 0 en isolant le carré "), f(carre(n.ao.e)), t(", puis on prend une valeur test dans chaque intervalle (la valeur exclue sépare deux intervalles) "), t(COURS_SIGNE), t(".")];
  }
  const natures = racinesFPrime(e).map((r, i) => {
    const c = classificationFPrime(e)[i];
    return [f(`x=${racineLatex(r)}`), t(c === "max" ? " : f′ passe de + à −, maximum" : c === "min" ? " : f′ passe de − à +, minimum" : " : f′ s'annule sans changer de signe, ni maximum ni minimum")];
  });
  return [
    utilise(l, u),
    ...blocs,
    { ...resultat(l, natures.length ? [...listeEt(natures), t(".")] : [t("f′ ne s'annule pas et garde son signe sur chaque intervalle du domaine : aucun extremum.")]), figureHtml: tableauHtml(e, tableauFPrimeAttendu(e), "fprime") },
    ...(classificationFPrime(e).includes("ni_lun_ni_lautre") ? [piege(l, [t("Une racine double de f′ : le signe ne change pas, ce n'est pas un extremum.")])] : []),
  ];
}

// ============================================================================
// f″(x).
// ============================================================================

function etapeFSeconde(e: ExerciceEtudierFonction, l: string): EtapeCorrection[] {
  const n = noyau(e);
  let lignes: LigneCalcul[];
  let u: Fragments;
  if ("p" in n) {
    const dP = deriveePoly(coeffsP(n.p));
    lignes = [ligne(`f'(x)=${polyV(dP)}`, "étape précédente"), ...lignesDeriveePoly("f''(x)", dP)];
    u = [t("On dérive f′ terme à terme "), t(COURS_REGLES), t(".")];
    return [utilise(l, u), calcul(l, lignes), resultat(l, [...rep(e, "calculerFSeconde"), t(".")])];
  }
  if ("r" in n) {
    const { c, e: ee, k } = n.r;
    const xe = ee === 0 ? "x" : `(${xMoins(ee)})`;
    const xe2 = carre(ee);
    const k2 = -2 * c;
    lignes = [
      ligne(`u(x)=${k2}${xe}`, "numérateur de f′ (avec D(x) de l'étape précédente)"),
      ligne(`u'(x)=${k2}`),
      ligne(`v(x)=D(x)^{2}`, "dénominateur de f′"),
      ligne(`v'(x)=2D(x)\\cdot D'(x)`, "règle de la chaîne"),
      ligne(`=4${xe}D(x)`, [f(`D'(x)=2${xe}`)]),
      ligne(`u(x)v'(x)=${k2}${xe}\\cdot 4${xe}D(x)`, "produit u·v′"),
      ligne(`=${-8 * c}${xe2}D(x)`),
      ligne(`f''(x)=\\dfrac{${k2}D(x)^{2}${signe(8 * c)}${xe2}D(x)}{D(x)^{4}}`, [f("\\frac{u'v-uv'}{v^{2}}")]),
      ligne(`=\\dfrac{${k2}D(x)${signe(8 * c)}${xe2}}{D(x)^{3}}`, "on simplifie par D(x), non nul"),
      ligne(`=\\dfrac{${k2}[${dLatex(n.r)}]${signe(8 * c)}${xe2}}{D(x)^{3}}`, "on remplace D(x)"),
      ligne(`=\\dfrac{${6 * c}${xe2}${signe(-2 * c * k)}}{D(x)^{3}}`, [t("on regroupe les termes en "), f(xe2)]),
      ligne(`=\\dfrac{${polyV([6 * c * ee * ee - 2 * c * k, -12 * c * ee, 6 * c])}}{\\left[${dLatex(n.r)}\\right]^{3}}`, [t("on développe "), f(xe2)]),
    ];
    if (ee === 0) lignes.pop();
    u = [t("f′ est un quotient : numérateur u(x), dénominateur v(x) = "), f("D(x)^{2}"), t(" ; règle du quotient "), f("\\left(\\frac{u}{v}\\right)'=\\frac{u'v-uv'}{v^{2}}"), t(" et règle de la chaîne pour v ; on simplifie par D(x) "), t(COURS_REGLES), t(".")];
  } else {
    const { c, e: ee } = n.ao;
    lignes = [ligne(`f''(x)=${c < 0 ? `-(${c})` : `-${c}`}\\cdot\\dfrac{-2}{${carre(ee, 3)}}`, [t("la constante a disparaît, et "), f("\\left(\\frac{1}{u^{2}}\\right)'=-\\frac{2u'}{u^{3}}"), t(" avec u′ = 1")]), ligne(`=${2 * c < 0 ? "-" : ""}\\dfrac{${Math.abs(2 * c)}}{${carre(ee, 3)}}`)];
    u = [t("On dérive f′ terme à terme : la constante a pour dérivée 0 et "), f("\\left(\\frac{1}{u^{2}}\\right)'=-\\frac{2u'}{u^{3}}"), t(" "), t(COURS_REGLES), t(".")];
  }
  return [utilise(l, u), calcul(l, lignes), resultat(l, [...rep(e, "calculerFSeconde"), t(".")])];
}

// ============================================================================
// Tableau de f″.
// ============================================================================

function etapeTableauFSeconde(e: ExerciceEtudierFonction, l: string): EtapeCorrection[] {
  const n = noyau(e);
  const blocs: EtapeCorrection[] = [];
  const racines = racinesFSeconde(e).map(valeurNumeriqueRacineEtudeLocale);
  const exclues = exclusionsCE(e);
  const tests = pointsTest([...racines, ...exclues]);
  const bornes = [-Infinity, ...[...racines, ...exclues].sort((x, y) => x - y), Infinity];
  const noms = new Map<number, string>(racinesFSeconde(e).map((r) => [valeurNumeriqueRacineEtudeLocale(r), racineLatex(r)]));
  const just = (i: number) => [t("sur "), f(intervalle(bornes[i], bornes[i + 1], noms))];
  let u: Fragments;
  if ("p" in n) {
    const d2 = deriveePoly(deriveePoly(coeffsP(n.p)));
    const r = q(-d2[0], d2[1]);
    blocs.push(calcul(l, [ligne(`${polyV(d2)}=0`, [f("f''(x)=0")]), ligne(`${d2[1]}x=${-d2[0]}`, "on isole le terme en x"), ligne(`x=\\dfrac{${-d2[0]}}{${d2[1]}}`, `on divise par ${nbT(d2[1])}`), ...(r.d !== d2[1] || r.n !== -d2[0] ? [ligne(`=${qL(r)}`, "on simplifie")] : [])], [], "Zéro de f″"));
    blocs.push(calcul(l, tests.flatMap((x, i) => lignesSignePoly("f''", d2, x).map((li, j) => (j === 0 ? { ...li, justification: just(i) } : li))), [], "Signe de f″"));
    u = [t("On résout f″(x) = 0, puis une valeur test par intervalle : f″ > 0 ⇒ f convexe (∪), f″ < 0 ⇒ f concave (∩) ; f″ qui change de signe donne un point d'inflexion "), t(COURS_SIGNE), t(".")];
  } else if ("r" in n) {
    const { c, e: ee, k } = n.r;
    const M = [6 * c * ee * ee - 2 * c * k, -12 * c * ee, 6 * c];
    if (k > 0) {
      const r = k / 3;
      blocs.push(
        calcul(
          l,
          [
            ligne(`${6 * c}${carre(ee)}${signe(-2 * c * k)}=0`, "numérateur de f″ nul"),
            ligne(`${carre(ee)}=${r}`, `on isole le carré (÷ ${nbT(6 * c)})`),
            ligne(`${xMoins(ee)}=\\pm\\sqrt{${r}}`, "deux valeurs opposées ont ce carré"),
            ...racinesFSeconde(e).map((x, i) => ligne(`x_${i + 1}=${racineLatex(x)}`, i === 0 && ee !== 0 ? `on ajoute ${nbT(ee)}` : undefined)),
          ],
          [t("Le dénominateur "), f(`\\left[${dLatex(n.r)}\\right]^{3}`), t(" est positif (D(x) ≥ "), f(`${k}`), t(") : f″ a le signe de "), f(`M(x)=${polyV(M)}`), t(".")],
          "Zéros de f″",
        ),
      );
      blocs.push(calcul(l, tests.flatMap((x, i) => lignesSignePoly("M", M, x).map((li, j) => (j === 0 ? { ...li, justification: just(i) } : li))), [], "Signe de f″"));
    } else {
      const m2 = -k;
      blocs.push(calcul(l, [ligne(`M(x)=${6 * c}${carre(ee)}${signe(-2 * c * k)}`, "numérateur de f″"), ligne(`${6 * c * 1}${carre(ee)}${signe(2 * c * m2)}\\neq 0`, `deux termes du signe de ${nbT(c)} (un carré ≥ 0) : M ne s'annule pas`)], [], "Zéros de f″"));
      blocs.push(
        calcul(
          l,
          tests.flatMap((x, i) => {
            const xq = nombreExactQ(x);
            const Mx = evalPolyQ(M, xq);
            const Dx = evalPolyQ([ee * ee + k, -2 * ee, 1], xq);
            const v = q(Mx.n * Dx.d ** 3, Mx.d * Dx.n ** 3);
            return [ligne(`f''(${nombreExactL(x)})=\\dfrac{M(${nombreExactL(x)})}{D(${nombreExactL(x)})^{3}}`, just(i)), ligne(`=\\dfrac{${qL(Mx, true)}}{${Dx.d === 1 ? parN(Dx.n) : `\\left(${qL(Dx, true)}\\right)`}^{3}}`), ligne(`=${qL(v)}${signeRel(qVal(v))}`)];
          }),
          [t("Le dénominateur "), f("D(x)^{3}"), t(" change de signe aux valeurs exclues : une valeur test par intervalle.")],
          "Signe de f″",
        ),
      );
    }
    u = [t("Signe de f″ par son numérateur et son dénominateur, une valeur test par intervalle : f″ > 0 ⇒ convexe (∪), f″ < 0 ⇒ concave (∩) ; un point d'inflexion exige un changement de signe en un point du domaine "), t(COURS_SIGNE), t(".")];
  } else {
    const { c, e: ee } = n.ao;
    blocs.push(calcul(l, [ligne(`${2 * c}\\neq 0`, "le numérateur de f″ ne s'annule jamais : aucun zéro")], [], "Zéros de f″"));
    blocs.push(
      calcul(
        l,
        tests.flatMap((x, i) => {
          const d = Math.round(x) - ee;
          return [ligne(`f''(${Math.round(x)})=\\dfrac{${2 * c}}{${parN(d)}^{3}}`, just(i)), ligne(`=${qL(q(2 * c, d ** 3))}${signeRel((2 * c) / d ** 3)}`)];
        }),
        [],
        "Signe de f″",
      ),
    );
    u = [t("f″ ne s'annule pas, mais "), f("(x-e)^{3}"), t(" change de signe en la valeur exclue : une valeur test de chaque côté ; f″ > 0 ⇒ convexe (∪), f″ < 0 ⇒ concave (∩) "), t(COURS_SIGNE), t(".")];
  }
  const natures = racinesFSeconde(e).map((r, i) => [f(`x=${racineLatex(r)}`), t(classificationFSeconde(e)[i] === "pi" ? " : f″ change de signe, point d'inflexion" : " : pas de point d'inflexion")]);
  const sansPI = natures.length === 0 ? [t(exclues.length ? "Aucun point d'inflexion : f″ ne change de signe qu'en une valeur exclue, où f n'est pas définie." : "Aucun point d'inflexion.")] : [...listeEt(natures), t(".")];
  return [utilise(l, u), ...blocs, { ...resultat(l, sansPI), figureHtml: tableauHtml(e, tableauFSecondeAttendu(e), "fseconde") }];
}

// ============================================================================
// Coordonnées des points remarquables.
// ============================================================================

/** a + b√r (entiers). */
interface ZR {
  a: number;
  b: number;
}
const zr = (z: ZR, r: number) => (z.b === 0 ? `${z.a}` : `${z.a === 0 ? "" : z.a}${z.b < 0 ? "-" : z.a === 0 ? "" : "+"}${Math.abs(z.b) === 1 ? "" : Math.abs(z.b)}\\sqrt{${r}}`);
const zrMul = (x: ZR, y: ZR, r: number): ZR => ({ a: x.a * y.a + x.b * y.b * r, b: x.a * y.b + x.b * y.a });
const zrPar = (z: ZR, r: number) => ((z.a !== 0 && z.b !== 0) || zr(z, r).startsWith("-") ? `(${zr(z, r)})` : zr(z, r));

function lignesPointPoly(P: number[], p: PointCleEtudierFonction, conjugue: PointCleEtudierFonction | null): { lignes: LigneCalcul[]; label: string }[] {
  const [d, c, b, a] = P;
  if (!p.racine || p.racine.exact) {
    const xq = p.racine && p.racine.exact ? q(p.racine.valeur.num, p.racine.valeur.den) : nombreExactQ(p.x);
    if (xq.d === 1 && xq.n === 0) return [{ label: `${p.label}`, lignes: [ligne(`f(0)=${d}`, "les termes en x s'annulent")] }];
    const v = xq.d === 1 ? lignesValeurPoly(`f(${xq.n})`, P, xq.n) : lignesValeurQ(`f\\left(${qL(xq, true)}\\right)`, P, xq);
    const lignes = [...v.lignes];
    const val = typeof v.valeur === "number" ? v.valeur : qVal(v.valeur);
    if (!Number.isInteger(Math.round(val * 1e9) / 1e9)) lignes.push(ligne(egalApprox(val, 2)));
    return [{ label: p.label, lignes }];
  }
  const R = p.racine;
  const r = R.radicande;
  const x: ZR = { a: R.centre, b: R.signe };
  const x2 = zrMul(x, x, r);
  const x3 = zrMul(x2, x, r);
  const terme = (k: number, z: ZR, puiss: string) => (k === 1 ? [] : k === -1 ? [ligne(`-${puiss}=${zr({ a: -z.a, b: -z.b }, r)}`)] : [ligne(`${k}${puiss}=${k}${zrPar(z, r)}`), ligne(`=${zr({ a: k * z.a, b: k * z.b }, r)}`)]);
  const total: ZR = { a: a * x3.a + b * x2.a + c * x.a + d, b: a * x3.b + b * x2.b + c * x.b };
  const lignes: LigneCalcul[] = [
    ligne(`x^{2}=${zrPar(x, r)}^{2}`, [f(`x=${zr(x, r)}`)]),
    ligne(`=${zr(x2, r)}`, R.centre === 0 ? "carré d'une racine" : [t("identité remarquable, "), f(`(\\sqrt{${r}})^{2}=${r}`)]),
    ligne(`x^{3}=${zrPar(x2, r)}${zrPar(x, r)}`, [f("x^{3}=x^{2}\\cdot x")]),
    ligne(`=${zr(x3, r)}`, "on développe"),
    ...terme(a, x3, "x^{3}"),
    ...(b !== 0 ? terme(b, x2, "x^{2}") : []),
    ...(c !== 0 ? terme(c, x, "x") : []),
    ligne(`f(${zr(x, r)})=${zr(total, r)}`, [t("on additionne, avec "), f(`d=${d}`), t(" : termes sans racine, puis termes en "), f(`\\sqrt{${r}}`)]),
    ligne(`\\approx ${approche(total.a + total.b * Math.sqrt(r), 2)}`),
  ];
  const out = [{ label: p.label, lignes }];
  if (conjugue) {
    const tc: ZR = { a: total.a, b: -total.b };
    out.push({ label: conjugue.label, lignes: [ligne(`f(${zr({ a: x.a, b: -x.b }, r)})=${zr(tc, r)}`, [t("même calcul en changeant "), f(`\\sqrt{${r}}`), t(" en "), f(`-\\sqrt{${r}}`)]), ligne(`\\approx ${approche(tc.a + tc.b * Math.sqrt(r), 2)}`)] });
  }
  return out;
}

function etapeCoordonnees(e: ExerciceEtudierFonction, l: string): EtapeCorrection[] {
  const n = noyau(e);
  const points = pointsClesEtudierFonction(e);
  const blocs: { label: string; lignes: LigneCalcul[] }[] = [];
  if ("p" in n) {
    const P = coeffsP(n.p);
    const faits = new Set<string>();
    for (const p of points) {
      if (faits.has(p.id)) continue;
      const conj = p.racine && !p.racine.exact ? points.find((o) => o !== p && o.racine && !o.racine.exact && o.racine.centre === (p.racine as { centre: number }).centre && o.racine.radicande === (p.racine as { radicande: number }).radicande) ?? null : null;
      if (conj) faits.add(conj.id);
      blocs.push(...lignesPointPoly(P, p, conj));
    }
  } else if ("r" in n) {
    const { c, e: ee, k } = n.r;
    const dd = n.dd;
    let inflexionsFaites = false;
    for (const p of points) {
      if (p.racine && !p.racine.exact) {
        if (inflexionsFaites) continue;
        inflexionsFaites = true;
        const r = p.racine.radicande;
        const v = qAdd(q(c, r + k), q(dd));
        const xpm = ee === 0 ? `\\pm\\sqrt{${r}}` : `${ee}\\pm\\sqrt{${r}}`;
        blocs.push({
          label: "Points d'inflexion",
          lignes: [
            ligne(`${carre(ee)}=(\\pm\\sqrt{${r}})^{2}`, [f(`${xMoins(ee)}=\\pm\\sqrt{${r}}`)]),
            ligne(`=${r}`),
            ligne(`f(${xpm})=\\dfrac{${c}}{${r}${signe(k)}}${signe(dd)}`, "on remplace le carré dans f(x) : même valeur pour les deux points"),
            ligne(`=${qL(v)}`),
            ...(v.d === 1 ? [] : [ligne(egalApprox(qVal(v), 2))]),
          ],
        });
      } else {
        const x = p.racine && p.racine.exact ? p.racine.valeur.num / p.racine.valeur.den : p.x;
        const den = (x - ee) ** 2 + k;
        const v = qAdd(q(c, den), q(dd));
        blocs.push({
          label: p.label,
          lignes: [
            ligne(`f(${x})=\\dfrac{${c}}{${ee === 0 ? `${parN(x)}^{2}` : `(${x}${signe(-ee)})^{2}`}${signe(k)}}${signe(dd)}`, `on remplace x par ${nbT(x)}`),
            ligne(`=\\dfrac{${c}}{${den}}${signe(dd)}`),
            ...(dd !== 0 || q(c, den).d !== den ? [ligne(`=${qL(v)}`)] : []),
            ...(v.d === 1 ? [] : [ligne(egalApprox(qVal(v), 2))]),
          ],
        });
      }
    }
  } else {
    const { a, b, c, e: ee } = n.ao;
    for (const p of points) {
      if (p.racine && !p.racine.exact) {
        const r = p.racine.radicande;
        const s = p.racine.signe;
        const val = a * ee + b + 2 * a * s * Math.sqrt(r);
        blocs.push({
          label: p.label,
          lignes: [
            ligne(`${xMoins(ee)}=${s < 0 ? "-" : ""}\\sqrt{${r}}`, [f(`x=${racineLatex(p.racine)}`)]),
            ligne(`\\dfrac{${c}}{${xMoins(ee)}}=\\dfrac{${c}}{${s < 0 ? "-" : ""}\\sqrt{${r}}}`),
            ligne(`=${s * a < 0 ? "-" : ""}${Math.abs(a) === 1 ? "" : Math.abs(a)}\\sqrt{${r}}`, [t("car "), f(`${c}=${a}\\cdot ${r}`), t(" et "), f(`\\frac{${r}}{\\sqrt{${r}}}=\\sqrt{${r}}`)]),
            ligne(`f(${racineLatex(p.racine)})=${coef(a)}(${racineLatex(p.racine)})${signe(b)}${s * a < 0 ? "-" : "+"}${Math.abs(a) === 1 ? "" : Math.abs(a)}\\sqrt{${r}}`, "on remplace dans f(x)"),
            ligne(`=${a * ee + b}${2 * a * s < 0 ? "-" : "+"}${Math.abs(2 * a) === 1 ? "" : Math.abs(2 * a)}\\sqrt{${r}}`, "on regroupe"),
            ...(radicalSimplifieLatex(2 * a, r) !== `${Math.abs(2 * a) === 1 ? "" : Math.abs(2 * a)}\\sqrt{${r}}` ? [ligne(`=${a * ee + b}${2 * a * s < 0 ? "-" : "+"}${radicalSimplifieLatex(2 * a, r)}`, [t("on simplifie : "), f(`\\sqrt{${r}}=${radicalSimplifieLatex(1, r)}`)])] : []),
            ligne(`\\approx ${approche(val, 2)}`, "valeur approchée, seulement pour placer le point"),
          ],
        });
      } else {
        const x = p.racine && p.racine.exact ? p.racine.valeur.num / p.racine.valeur.den : p.x;
        const v = qAdd(q(a * x + b), q(c, x - ee));
        blocs.push({
          label: p.label,
          lignes: [
            ligne(`f(${x})=${coef(a) === "-" ? "-" : coef(a) === "" ? "" : `${a}\\cdot `}${parN(x)}${signe(b)}+\\dfrac{${c}}{${parN(x)}-${parN(ee)}}`, `on remplace x par ${nbT(x)}`),
            ligne(`=${a * x + b}${qVal(q(c, x - ee)) < 0 ? "" : "+"}${qL(q(c, x - ee))}`, "on calcule la partie affine et la fraction"),
            ligne(`=${qL(v)}`),
            ...(v.d === 1 ? [] : [ligne(egalApprox(qVal(v), 2))]),
          ],
        });
      }
    }
  }
  return [
    utilise(l, [t("L'ordonnée d'un point de la courbe s'obtient en remplaçant x par son abscisse dans f(x) — et non dans f′(x) "), t(COURS_LOCALE), t(".")]),
    ...blocs.map((b) => calcul(l, b.lignes, [], b.label)),
    resultat(l, [...listeEt(formatCoordonneesLatex(e).map((x) => [f(x)])), t(".")]),
  ];
}

// ============================================================================
// Graphique (lecture : placer).
// ============================================================================

function etapeGraphique(e: ExerciceEtudierFonction, l: string): EtapeCorrection[] {
  const pts = pointsClesEtudierFonction(e);
  const coords = formatCoordonneesLatex(e);
  const lignes: LigneCalcul[] = pts.map((p, i) => {
    const c = coords[i].replace(/^\\text\{[^}]*\}/, "");
    return ligne(`${String.fromCharCode(65 + i)}=${c}`, p.label.toLowerCase());
  });
  for (const a of asymptotesLatex(e)) lignes.push(ligne(a, a.startsWith("x") ? "asymptote verticale, en pointillés" : "asymptote, en pointillés"));
  return [
    utilise(l, [t("On place les points remarquables (étape précédente) et les asymptotes, puis on trace une courbe qui respecte le tableau de variations et la concavité "), t(COURS_ETUDIER), t(".")]),
    calcul(l, lignes, [], "À placer"),
    { ...resultat(l, [t("Courbe passant par les points remarquables, avec ses asymptotes et le sens de variation trouvé.")]), figureHtml: construireSvgEtudierFonction(e) },
  ];
}

// ============================================================================
// Assemblage.
// ============================================================================

export function correctionDetailleeEtudierFonction(e: ExerciceEtudierFonction): EtapeCorrection[] {
  const ordre = etapes(e);
  const avecDomaine = ordre.includes("domaine");
  const out: EtapeCorrection[] = [];
  for (const ecran of ordre) {
    const l = lettreEcranEtudierFonction(e, ecran);
    if (ecran === "domaine") out.push(...etapeDomaine(e, l));
    else if (ecran === "limites") out.push(...etapeLimites(e, l, avecDomaine));
    else if (ecran === "calculerFPrime") out.push(...etapeFPrime(e, l));
    else if (ecran === "tableauFPrime") out.push(...etapeTableauFPrime(e, l));
    else if (ecran === "calculerFSeconde") out.push(...etapeFSeconde(e, l));
    else if (ecran === "tableauFSeconde") out.push(...etapeTableauFSeconde(e, l));
    else if (ecran === "coordonnees") out.push(...etapeCoordonnees(e, l));
    else if (ecran === "graphique") out.push(...etapeGraphique(e, l));
  }
  return finaliserDerivees(out);
}

/** Écran « graphique » : placer des points déjà calculés (lecture). */
export function lettresLectureEtudierFonction(e: ExerciceEtudierFonction): string[] {
  return [lettreEcranEtudierFonction(e, "graphique")];
}

export { evalPoly, formatResumeTableauLatex };
