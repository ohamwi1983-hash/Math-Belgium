import type { Exercice } from "../../core/generateur.types";
import type { ExerciceEquationRationnelle, FractionAReduire } from "../../core/equationRationnelle.types";
import type { PolynomeLineaire } from "../../core/simplification.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { PhaseEquationRationnelle } from "../../moteur/typesEquationRationnelle";
import { phasesExercice } from "../../moteur/sessionEquationRationnelle";
import { formatEnonceLatex, formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "../../ui/formatEquation";
import {
  formatEquationRationnelleLatexApresSimplification,
  formatFractionReduiteOuConstante,
  formatPolynomeLineaireDeveloppe,
} from "../../ui/formatEquationRationnelle";
import { formatFractionSimplifiee } from "../../ui/formatSimplification";
import { libelleCategorie } from "../../ui/categorieLabels";
import { mono, nombreTexte, polynome, q } from "../../ui/corrigeChapitre3";
import {
  COURS_DENOMINATEUR,
  COURS_RESOUDRE,
  deltaDe,
  ensembleSolutionsLatex,
  facteurX,
  fractionPapier,
  lignesDelta,
  lignesFacteurNul,
  lireFormeFactorisee,
  racineFacteur,
  lignesFactorisation,
  lignesProduitNul,
  lignesRacinesFormule,
  lignesReconnaissance,
  lignesSimplificationFraction,
  lignesVerificationViete,
  rac,
  trinomeDe,
  utiliseDelta,
  utiliseFactorisation,
  utiliseFormule,
  utiliseProduitNul,
  utiliseReconnaissance,
  finaliserCorrige,
} from "../../ui/corrigeSecondDegre1";
import { etapeChamp1, etapeFactorisation, etapeReconnaissance, etapeReduction } from "../simplification/corrigeDetaille";

/**
 * Corrigé détaillé « comme au tableau » de gen4 (« L'inconnue au dénominateur », équations
 * rationnelles, `AppEquationRationnelle.tsx`) — règle `.claude/rules/feuilles-evaluations.md`. Une
 * étape (lettre) par ÉCRAN, dans l'ordre réel des écrans de l'instance
 * (`moteur/sessionEquationRationnelle.ts::phasesExercice`) : conditions d'existence →
 * [simplification des fractions, ou factorisation du polynôme de la fraction de gauche puis
 * simplification] → produit en croix → [méthode] → [Δ ou factorisation] → solutions → racines
 * étrangères. Partagé par l'adaptateur papier et l'appli.
 */

type E = ExerciceEquationRationnelle;
type Phase = PhaseEquationRationnelle;

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

export function phasesEquationRationnelle(instance: E): Phase[] {
  return phasesExercice(instance);
}

export function lettrePhaseEquationRationnelle(instance: E, phase: Phase): string {
  return LETTRES[phasesEquationRationnelle(instance).indexOf(phase)] ?? "a";
}

const papier = (l: string) => l.replace(/\\frac/g, "\\dfrac");

// ---------------------------------------------------------------------------------------------
// Polynômes (coefficients croissants : [c0, c1, c2…])
// ---------------------------------------------------------------------------------------------

type P = number[];

function mul(a: P, b: P): P {
  const r = new Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => (r[i + j] += x * y)));
  return r;
}

function sub(a: P, b: P): P {
  const n = Math.max(a.length, b.length);
  return Array.from({ length: n }, (_, i) => (a[i] ?? 0) - (b[i] ?? 0));
}

function degre(a: P): number {
  for (let i = a.length - 1; i >= 0; i--) if (Math.abs(a[i]!) > 1e-12) return i;
  return -1;
}

function polyLatex(a: P): string {
  const d = Math.max(degre(a), 0);
  return polynome(Array.from({ length: d + 1 }, (_, i) => a[d - i] ?? 0));
}

function valeur(a: P, x: number): number {
  return a.reduce((s, c, i) => s + c * x ** i, 0);
}

const linP = (p: PolynomeLineaire): P => [-p.k * p.p, p.k];
const exP = (e: Exercice): P => [e.enonce.c, e.enonce.b, e.enonce.a];
const linLatex = (p: PolynomeLineaire) => formatPolynomeLineaireDeveloppe(p).replace(/\s+/g, "");

/** Facteur d'un produit : polynôme non monôme entre parenthèses, constante seule. */
function facteurProduit(a: P, l: string): string {
  return degre(a) <= 0 ? l : `(${l})`;
}

/** Produit de deux facteurs (constante en tête, jamais « 1· »). */
function produit(a: P, la: string, b: P, lb: string): string {
  if (degre(a) <= 0 && degre(b) <= 0) return a[0] === 1 ? lb : b[0] === 1 ? la : `${la}\\cdot ${lb.startsWith("-") ? `(${lb})` : lb}`;
  if (degre(b) <= 0) return produit(b, lb, a, la);
  if (degre(a) <= 0) return a[0] === 1 ? lb : a[0] === -1 ? `-${facteurProduit(b, lb)}` : `${la}${facteurProduit(b, lb)}`;
  return `${facteurProduit(a, la)}${facteurProduit(b, lb)}`;
}

// ---------------------------------------------------------------------------------------------
// Membres de l'équation (avant et après simplification)
// ---------------------------------------------------------------------------------------------

interface Membre {
  num: P;
  den: P;
  numL: string;
  denL: string;
}

const membre = (num: P, numL: string, den: P = [1], denL = "1"): Membre => ({ num, den, numL, denL });
const xMoinsL = (v: number) => (v === 0 ? "x" : v > 0 ? `x-${v}` : `x+${-v}`);

/** Membres de l'équation de l'énoncé. */
function membresDepart(e: E): [Membre, Membre] {
  switch (e.construction) {
    case "un_denominateur":
      return [membre([e.A], q(e.A), [-e.p, 1], xMoinsL(e.p)), membre([-e.q, 1], xMoinsL(e.q))];
    case "deux_denominateurs": {
      const quad: P = [e.p * e.s, -(e.p + e.s), 1];
      return [membre([e.A], q(e.A), [-e.p, 1], xMoinsL(e.p)), membre([-e.k * e.t, e.k], polyLatex([-e.k * e.t, e.k]), quad, polyLatex(quad))];
    }
    case "deux_fractions_lineaires":
      return [
        membre(linP(e.numerateurGauche), linLatex(e.numerateurGauche), linP(e.denominateurGauche), linLatex(e.denominateurGauche)),
        membre(linP(e.numerateurDroit), linLatex(e.numerateurDroit), linP(e.denominateurDroit), linLatex(e.denominateurDroit)),
      ];
    case "p2_sur_p1": {
      const P2 = e.fractionGauche.numerateur as Exercice;
      const P1 = e.fractionGauche.denominateur as PolynomeLineaire;
      return [membre(exP(P2), formatMembreGauche(P2.enonce).replace(/\s+/g, ""), linP(P1), linLatex(P1)), membre([e.P0], q(e.P0), linP(e.denominateurDroit), linLatex(e.denominateurDroit))];
    }
    case "p1_sur_p2": {
      const P1 = e.fractionGauche.numerateur as PolynomeLineaire;
      const P2 = e.fractionGauche.denominateur as Exercice;
      return [membre(linP(P1), linLatex(P1), exP(P2), formatMembreGauche(P2.enonce).replace(/\s+/g, "")), membre(linP(e.numerateurDroit), linLatex(e.numerateurDroit), [e.P0], q(e.P0))];
    }
  }
}

/** Fraction réduite d'une fraction de l'énoncé (deux fractions du premier degré). */
function membreReduit(f: FractionAReduire): Membre {
  if (f.numerateur.p === f.denominateur.p) {
    const lambda = f.numerateur.k / f.denominateur.k;
    return membre([lambda], q(lambda));
  }
  const n = { k: f.numerateur.k / f.diviseur, p: f.numerateur.p };
  const d = { k: f.denominateur.k / f.diviseur, p: f.denominateur.p };
  return membre(linP(n), linLatex(n), linP(d), linLatex(d));
}

/** Membres de l'équation au moment du produit en croix (écran d'isolement). */
function membresApresSimplification(e: E): [Membre, Membre] {
  const [g, d] = membresDepart(e);
  switch (e.construction) {
    case "deux_fractions_lineaires": {
      const fg = e.fractionsSimplifiables.find((f) => f.cote === "gauche");
      const fd = e.fractionsSimplifiables.find((f) => f.cote === "droite");
      return [fg ? membreReduit(fg) : g, fd ? membreReduit(fd) : d];
    }
    case "p2_sur_p1": {
      const P2 = e.fractionGauche.numerateur as Exercice;
      const P1 = e.fractionGauche.denominateur as PolynomeLineaire;
      const p = e.fractionGauche.racineCommune;
      const r = P2.solution.racines.find((x) => x !== p) ?? p;
      const lin = { k: P2.enonce.a / P1.k, p: r };
      return [membre(linP(lin), linLatex(lin)), d];
    }
    case "p1_sur_p2": {
      const P1 = e.fractionGauche.numerateur as PolynomeLineaire;
      const P2 = e.fractionGauche.denominateur as Exercice;
      const p = e.fractionGauche.racineCommune;
      const s = P2.solution.racines.find((x) => x !== p) as number;
      const den = { k: P2.enonce.a, p: s };
      return [membre([P1.k], q(P1.k), linP(den), linLatex(den)), d];
    }
    default:
      return [g, d];
  }
}

// ---------------------------------------------------------------------------------------------
// Étapes
// ---------------------------------------------------------------------------------------------

function ceLatex(e: E): string {
  return e.ce.map((v) => `x\\neq ${q(v)}`).join("\\text{ et }");
}

/** Factorisation d'un dénominateur du second degré par la somme et le produit de ses racines. */
function lignesFactorisationSommeProduit(p2: Exercice | { enonce: { a: number; b: number; c: number }; racines: [number, number] }, gauche: string): { lignes: LigneCalcul[]; forme: string } {
  const enonce = p2.enonce;
  const racines = "solution" in p2 ? p2.solution.racines : p2.racines;
  const [r1, r2] = [...racines].sort((x, y) => y - x);
  const a = enonce.a;
  const forme = formatFormeFactoriseeDepuisRacines(enonce, racines).replace(/\s+/g, "");
  const reduit = polynome([1, -(r1! + r2!), r1! * r2!]);
  const lignes: LigneCalcul[] = [];
  if (a !== 1) lignes.push(ligne(`${gauche}=${q(a)}(${reduit})`, `mise en évidence de ${nombreTexte(a)}`));
  lignes.push(
    ligne(`${a !== 1 ? "" : gauche}=${forme}`, [
      texte("deux nombres de somme "),
      latex(q(r1! + r2!)),
      texte(" et de produit "),
      latex(q(r1! * r2!)),
      texte(" : "),
      latex(q(r1!)),
      texte(" et "),
      latex(q(r2!)),
      texte(` ${COURS_RESOUDRE}`),
    ]),
  );
  return { lignes, forme };
}

function etapeCE(e: E, l: string): EtapeCorrection[] {
  const [g, d] = membresDepart(e);
  const lignes: LigneCalcul[] = [];
  const vus = new Set<string>();
  const dejaExclues = new Set<number>();
  for (const m of [g, d]) {
    if (degre(m.den) <= 0 || vus.has(m.denL)) continue;
    vus.add(m.denL);
    if (degre(m.den) === 1) {
      lignes.push(...lignesFacteurNul({ alpha: m.den[1]!, beta: rac(m.den[0]!), latex: m.denL, carre: false }, "un dénominateur doit être non nul", "\\neq"));
      dejaExclues.add(-m.den[0]! / m.den[1]!);
      dejaExclues.add(-m.den[0]! / m.den[1]!);
    } else {
      const p2: Exercice | { enonce: { a: number; b: number; c: number }; racines: [number, number] } =
        e.construction === "p1_sur_p2" ? (e.fractionGauche.denominateur as Exercice) : { enonce: { a: 1, b: m.den[1]!, c: m.den[0]! }, racines: e.construction === "deux_denominateurs" ? [e.p, e.s] : [0, 0] };
      const { lignes: fact, forme } = lignesFactorisationSommeProduit(p2, m.denL);
      lignes.push(...fact);
      // Facteurs de la forme factorisée : seulement ceux qui donnent une valeur interdite nouvelle.
      const { facteurs } = lireFormeFactorisee(forme);
      let premier = true;
      for (const f of facteurs) {
        const r = racineFacteur(f);
        if (dejaExclues.has(r.c)) continue;
        dejaExclues.add(r.c);
        lignes.push(...lignesFacteurNul(f, premier ? "chaque facteur du dénominateur doit être non nul" : "", "\\neq"));
        premier = false;
      }
    }
  }
  return [
    utilise(l, [texte(`Un dénominateur ne peut pas être nul : chaque valeur qui annule un dénominateur est exclue (condition d'existence) ${COURS_DENOMINATEUR}.`)]),
    calcul(l, lignes),
    resultat(l, [texte("CE : "), latex(ceLatex(e))]),
  ];
}

function lignesFraction(f: FractionAReduire): LigneCalcul[] {
  const n = linLatex(f.numerateur);
  const d = linLatex(f.denominateur);
  const finale = papier(formatFractionReduiteOuConstante(f)).replace(/\s+/g, "");
  if (f.numerateur.p === f.denominateur.p) {
    const lambda = f.numerateur.k / f.denominateur.k;
    return [
      ligne(`\\dfrac{${n}}{${d}}=\\dfrac{${mono(lambda, `(${d})`)}}{${d}}`, `mise en évidence de ${nombreTexte(lambda)}`),
      ligne(`=${finale}`, [texte("on simplifie par "), latex(d), texte(" (non nul sous les CE)")]),
    ];
  }
  const g = f.diviseur;
  const nr = linLatex({ k: f.numerateur.k / g, p: f.numerateur.p });
  const dr = linLatex({ k: f.denominateur.k / g, p: f.denominateur.p });
  return [ligne(`\\dfrac{${n}}{${d}}=\\dfrac{${g}(${nr})}{${g}(${dr})}`, `mise en évidence de ${g}`), ligne(`=${finale}`, `on simplifie par ${g}`)];
}

function etapeSimplifier(e: E, l: string): EtapeCorrection[] {
  const blocs = e.fractionsSimplifiables.map((f) => calcul(l, lignesFraction(f), [], f.cote === "gauche" ? "Fraction de gauche" : "Fraction de droite"));
  return [
    utilise(l, [texte(`On simplifie une fraction par un facteur commun à son numérateur et à son dénominateur (un facteur numérique, ou un facteur en x non nul sous les CE) ${COURS_DENOMINATEUR}.`)]),
    ...blocs,
    resultat(l, [texte("Équation simplifiée : "), latex(papier(formatEquationRationnelleLatexApresSimplification(e)))]),
  ];
}

/** Le polynôme du second degré de la fraction de gauche (cas 4a : numérateur N, 4b : dénominateur D). */
function p2DeGauche(e: E): { p2: Exercice; nom: "N" | "D" } {
  const fg = e.fractionGauche!;
  return "k" in fg.numerateur ? { p2: fg.denominateur as Exercice, nom: "D" } : { p2: fg.numerateur as Exercice, nom: "N" };
}

function etapeRacinesP2(p2: Exercice, nom: "N" | "D", l: string): EtapeCorrection[] {
  const r = [...new Set(p2.solution.racines)].sort((x, y) => x - y);
  const res = resultat(l, [texte(r.length > 1 ? "Racines : " : "Racine : "), ...r.flatMap((v, i) => [...(i > 0 ? [texte(" et ")] : []), latex(`x=${q(v)}`)])]);
  if (p2.categorie === "cas_general") {
    return [utilise(l, utiliseFormule()), calcul(l, lignesRacinesFormule(trinomeDe(p2)).lignes, [latex(`\\Delta=${q(deltaDe(trinomeDe(p2)))}>0`), texte(" : deux racines distinctes.")]), res];
  }
  const forme = (p2.solution.formeFactorisee ?? "").replace(/\s+/g, "");
  return [utilise(l, utiliseProduitNul()), calcul(l, lignesProduitNul(forme), [texte("Sur "), latex(`${nom}(x)=${forme}`), texte(" :")]), res];
}

function etapeSimplifierFraction(e: E, l: string): EtapeCorrection[] {
  const fg = e.fractionGauche!;
  const [g] = membresDepart(e);
  return [
    utilise(l, [texte(`On simplifie des facteurs, jamais des termes : numérateur et dénominateur factorisés, on enlève le facteur commun (non nul sous les CE), puis on divise les coefficients par leur PGCD ${COURS_DENOMINATEUR}.`)]),
    calcul(l, lignesSimplificationFraction(fg, `\\dfrac{${g.numL}}{${g.denL}}`)),
    resultat(l, [texte("Fraction de gauche simplifiée : "), latex(fractionPapier(formatFractionSimplifiee(fg)))]),
  ];
}

/** Quotient de `a` par (x − c), ou null si c n'est pas racine (division synthétique). */
function divParRacine(a: P, c: number): P | null {
  const n = degre(a);
  if (n < 1 || Math.abs(valeur(a, c)) > 1e-9) return null;
  const desc = Array.from({ length: n + 1 }, (_, i) => a[n - i] ?? 0);
  const quotient: number[] = [];
  let acc = 0;
  for (let i = 0; i < n; i++) {
    acc = acc * c + desc[i]!;
    quotient.push(acc);
  }
  return quotient.reverse();
}

/**
 * Méthode du dénominateur commun (G5, recommandée par le cours § 5) : quand les deux dénominateurs
 * ont le facteur x − c en commun, on multiplie par le plus petit dénominateur commun au lieu du
 * produit en croix ; l'équation obtenue est du premier degré (`equationIsolee` linéaire, voir
 * `moteur/denominateurCommun.ts`). null si l'instance n'est pas dans ce cas.
 */
function etapeIsolementDenominateurCommun(e: E, l: string, g: Membre, d: Membre): EtapeCorrection[] | null {
  const cible = exP(e.equationIsolee);
  const c = e.construction === "deux_denominateurs" ? e.p : e.ce.find((v) => divParRacine(g.den, v) && divParRacine(d.den, v));
  if (c === undefined) return null;
  const gq = divParRacine(g.den, c);
  const dq = divParRacine(d.den, c);
  if (!gq || !dq) return null;
  const gqL = polyLatex(gq);
  const dqL = polyLatex(dq);
  const A = { p: mul(g.num, dq), l: produit(g.num, g.numL, dq, dqL) };
  const B = { p: mul(d.num, gq), l: produit(d.num, d.numL, gq, gqL) };
  let diff = sub(A.p, B.p);
  if (degre(diff) !== 1 || degre(cible) !== 1) return null;
  let [M, N] = [A, B];
  if (Math.sign(diff[1]!) !== Math.sign(cible[1]!)) {
    [M, N] = [B, A];
    diff = sub(M.p, N.p);
  }
  const k = diff[1]! / cible[1]!;
  if (Math.abs(diff[0]! - k * cible[0]!) > 1e-9) return null;
  const commun = mul(mul(gq, dq), [-c, 1]);
  const communL = produit(mul(gq, dq), polyLatex(mul(gq, dq)), [-c, 1], xMoinsL(c));
  const lignes: LigneCalcul[] = [
    ligne(papier(formatEquationRationnelleLatexApresSimplification(e)).replace(/\s+/g, "")),
    ligne(`${M.l}=${N.l}`, [texte("on multiplie les deux membres par le dénominateur commun "), latex(degre(commun) >= 1 ? communL : q(commun[0]!)), texte(" (non nul sous les CE)")]),
  ];
  const devM = polyLatex(M.p);
  const devN = polyLatex(N.p);
  if (`${devM}=${devN}` !== `${M.l}=${N.l}`) lignes.push(ligne(`${devM}=${devN}`, "on développe les deux membres"));
  lignes.push(ligne(`${polyLatex(diff)}=0`, [texte("on soustrait "), latex(devN), texte(" aux deux membres et on réduit")]));
  if (Math.abs(k - 1) > 1e-9) lignes.push(ligne(`${polyLatex(cible)}=0`, `on divise les deux membres par ${nombreTexte(k)}`));
  return [
    utilise(l, [texte(`Les deux dénominateurs ont le facteur commun ${"x"} ${c >= 0 ? "−" : "+"} ${nombreTexte(Math.abs(c))} : on multiplie par le plus petit dénominateur commun ${COURS_DENOMINATEUR}. L'équation obtenue est du premier degré.`)]),
    calcul(l, lignes),
    resultat(l, [texte("Équation obtenue : "), latex(formatEnonceLatex(e.equationIsolee.enonce))]),
    piege(l, [texte("Le produit en croix donnerait une équation du second degré dont "), latex(`x=${q(c)}`), texte(" est racine : une valeur interdite, à rejeter. Le dénominateur commun évite cette racine étrangère.")]),
  ];
}

function etapeIsolement(e: E, l: string): EtapeCorrection[] {
  const [g, d] = membresApresSimplification(e);
  if (e.equationIsolee.enonce.a === 0) {
    const dc = etapeIsolementDenominateurCommun(e, l, g, d);
    if (dc) return dc;
  }
  const cible = exP(e.equationIsolee);
  // Produit en croix (ou multiplication par le seul dénominateur quand l'autre membre est entier).
  const gauche = { p: mul(g.num, d.den), l: produit(g.num, g.numL, d.den, d.denL) };
  const droite = { p: mul(d.num, g.den), l: produit(d.num, d.numL, g.den, g.denL) };
  let diff = sub(gauche.p, droite.p);
  let [A, B] = [gauche, droite];
  if (cible.every((c, i) => Math.abs(c + (diff[i] ?? 0)) < 1e-9)) {
    [A, B] = [droite, gauche];
    diff = sub(A.p, B.p);
  }
  const entier = (m: Membre) => degre(m.den) <= 0 && m.den[0] === 1;
  const unSeul = entier(g) || entier(d);
  const den = entier(g) ? d.denL : g.denL;
  const lignes: LigneCalcul[] = [
    ligne(papier(formatEquationRationnelleLatexApresSimplification(e)).replace(/\s+/g, "")),
    ligne(`${A.l}=${B.l}`, unSeul ? [texte("on multiplie les deux membres par "), latex(den), texte(" (non nul sous les CE)")] : "produit en croix (dénominateurs non nuls sous les CE)"),
  ];
  const devA = polyLatex(A.p);
  const devB = polyLatex(B.p);
  if (`${devA}=${devB}` !== `${A.l}=${B.l}`) lignes.push(ligne(`${devA}=${devB}`, "on développe les deux membres"));
  const facteur = Math.abs(diff[degre(diff)]! / (cible[degre(cible)] ?? 1));
  const constB = degre(B.p) <= 0 ? (B.p[0] ?? 0) : null;
  lignes.push(
    ligne(
      `${polyLatex(diff)}=0`,
      constB !== null ? (constB < 0 ? `on ajoute ${nombreTexte(-constB)} aux deux membres` : `on soustrait ${nombreTexte(constB)} aux deux membres`) : [texte("on soustrait "), latex(devB), texte(" aux deux membres et on réduit")],
    ),
  );
  if (Math.abs(facteur - 1) > 1e-9) lignes.push(ligne(`${polyLatex(cible)}=0`, `on divise les deux membres par ${nombreTexte(facteur)}`));
  return [
    utilise(l, [texte(`On multiplie en croix (ou par le dénominateur commun) : l'équation obtenue n'a plus de fraction, mais elle peut accepter des valeurs interdites par la CE ${COURS_DENOMINATEUR}. Puis on ramène tout dans un membre.`)]),
    calcul(l, lignes),
    resultat(l, [texte("Équation obtenue : "), latex(formatEnonceLatex(e.equationIsolee.enonce))]),
  ];
}

function etapeReconnaissanceEq(e: E, l: string): EtapeCorrection[] {
  const ex = e.equationIsolee;
  return [
    utilise(l, utiliseReconnaissance()),
    calcul(l, lignesReconnaissance(trinomeDe(ex), ex.categorie), [texte("Sur "), latex(formatEnonceLatex(ex.enonce)), texte(" :")]),
    resultat(l, [texte(`Méthode : ${libelleCategorie(ex.categorie)}`)]),
  ];
}

/** Produit en croix des deux fractions réduites, (x − p₃) mis en évidence avant de développer. */
function lignesMiseEnEvidenceGeneralisee(e: E): { lignes: LigneCalcul[]; p3: number } {
  const [g, d] = membresApresSimplification(e);
  const p3 = e.construction === "deux_fractions_lineaires" ? e.numerateurDroit.p : 0;
  const alpha = g.num[1]!;
  const beta = d.num[1]!;
  const F = facteurX(p3);
  const terme = (c: number, den: string) => (c === 1 ? `${F}(${den})` : c === -1 ? `-${F}(${den})` : `${q(c)}${F}(${den})`);
  const crochet = sub(mul([alpha], d.den), mul([beta], g.den));
  const t1 = terme(alpha, d.denL);
  const t2 = terme(beta, g.denL);
  const moins = (t: string) => (t.startsWith("-") ? `+${t.slice(1)}` : `-${t}`);
  const c1 = alpha === 1 ? `(${d.denL})` : alpha === -1 ? `-(${d.denL})` : `${q(alpha)}(${d.denL})`;
  const c2 = beta === 1 ? `(${g.denL})` : beta === -1 ? `-(${g.denL})` : `${q(beta)}(${g.denL})`;
  const forme = (e.equationIsolee.solution.formeFactorisee ?? "").replace(/\s+/g, "");
  return {
    p3,
    lignes: [
      ligne(`(${g.numL})(${d.denL})-(${d.numL})(${g.denL})=0`, "produit en croix ramené dans le membre de gauche, sans développer"),
      ligne(`${t1}${moins(t2)}=0`, [texte("on met en évidence dans "), latex(g.numL), texte(" et "), latex(d.numL)]),
      ligne(`${F}[${c1}${c2.startsWith("-") ? `+${c2.slice(1)}` : `-${c2}`}]=0`, [texte("mise en évidence de "), latex(F)]),
      ligne(`${F}(${polyLatex(crochet)})=0`, "on réduit le crochet"),
      ligne(`${forme}=0`, crochet[1] === 1 ? "on range les facteurs" : `mise en évidence de ${nombreTexte(crochet[1]!)}, facteurs rangés`),
    ],
  };
}

function etapeChamp1Eq(e: E, l: string): EtapeCorrection[] {
  const ex = e.equationIsolee;
  const t = trinomeDe(ex);
  if (ex.categorie === "cas_general") return [utilise(l, utiliseDelta()), calcul(l, lignesDelta(t)), resultat(l, [latex(`\\Delta=${q(deltaDe(t))}`)])];
  const forme = (ex.solution.formeFactorisee ?? formatFormeFactoriseeDepuisRacines(ex.enonce, ex.solution.racines)).replace(/\s+/g, "");
  if (ex.categorie === "mise_en_evidence_generalisee") {
    const { lignes, p3 } = lignesMiseEnEvidenceGeneralisee(e);
    return [
      utilise(l, [texte("Cas caché : avant de développer, le facteur "), latex(facteurX(p3)), texte(` est commun aux deux produits du produit en croix ; on le met en évidence ${COURS_RESOUDRE}.`)]),
      calcul(l, lignes),
      resultat(l, [latex(`${forme}=0`)]),
    ];
  }
  return [utilise(l, utiliseFactorisation(ex.categorie)), calcul(l, lignesFactorisation(ex, {}, forme, formatMembreGauche(ex.enonce))), resultat(l, [latex(`${forme}=0`)])];
}

function racinesEq(e: E): number[] {
  return [...new Set(e.equationIsolee.solution.racines)].sort((x, y) => x - y);
}

function etapeChamp2(e: E, l: string): EtapeCorrection[] {
  const ex = e.equationIsolee;
  const r = racinesEq(e);
  const res = resultat(l, [texte(r.length > 1 ? "Solutions de l'équation obtenue : " : "Solution de l'équation obtenue : "), ...r.flatMap((v, i) => [...(i > 0 ? [texte(" et ")] : []), latex(`x=${q(v)}`)])]);
  if (ex.enonce.a === 0) {
    const f = { alpha: ex.enonce.b, beta: rac(ex.enonce.c), latex: polynome([ex.enonce.b, ex.enonce.c]), carre: false };
    return [utilise(l, [texte("Équation du premier degré : on isole x.")]), calcul(l, lignesFacteurNul(f, "équation obtenue")), res];
  }
  const t = trinomeDe(ex);
  if (ex.categorie === "cas_general") {
    const { lignes, racines } = lignesRacinesFormule(t);
    return [
      utilise(l, utiliseFormule()),
      calcul(l, lignes, [latex(`\\Delta=${q(deltaDe(t))}>0`), texte(" : deux solutions distinctes.")]),
      res,
      verification(l, [texte(`Somme et produit des racines ${COURS_RESOUDRE} :`)], lignesVerificationViete(t, racines[0], racines[1])),
    ];
  }
  const forme = (ex.solution.formeFactorisee ?? formatFormeFactoriseeDepuisRacines(ex.enonce, ex.solution.racines)).replace(/\s+/g, "");
  return [utilise(l, utiliseProduitNul()), calcul(l, lignesProduitNul(forme)), res];
}

/** Valeur d'un membre de l'énoncé en x (exacte : quotient d'entiers). */
function valeurMembre(m: Membre, x: number): { n: number; d: number } {
  return { n: valeur(m.num, x), d: valeur(m.den, x) };
}

function etapeRacinesEtrangeres(e: E, l: string): EtapeCorrection[] {
  const r = racinesEq(e);
  const valides = r.filter((v) => !e.ce.includes(v));
  const rejetees = r.filter((v) => e.ce.includes(v));
  const ceTexte: FragmentConsigne[] = e.ce.flatMap((v, i) => [...(i > 0 ? [texte(" et ")] : []), latex(`x\\neq ${q(v)}`)]);
  const lignes = r.map((v) =>
    e.ce.includes(v)
      ? ligne(`x=${q(v)}`, [texte("exclu par la CE "), latex(`x\\neq ${q(v)}`), texte(" : racine étrangère, rejetée")])
      : ligne(`x=${q(v)}`, [texte("respecte "), ...ceTexte, texte(" : solution")]),
  );
  const [g, d] = membresDepart(e);
  const verif: LigneCalcul[] = valides.flatMap((v) => {
    const vg = valeurMembre(g, v);
    const vd = valeurMembre(d, v);
    const ecrit = (x: { n: number; d: number }) => (x.d === 1 ? q(x.n) : `\\dfrac{${q(x.n)}}{${q(x.d)}}`);
    const lg = [ligne(`${ecrit(vg)}=${q(vg.n / vg.d)}`, [texte("membre de gauche en "), latex(`x=${q(v)}`)])];
    const ld = [ligne(`${ecrit(vd)}=${q(vd.n / vd.d)}`, "membre de droite : même valeur ✓")];
    return [...lg, ...ld];
  });
  return [
    utilise(l, [texte(`Une solution de l'équation obtenue n'est solution de l'équation de départ que si elle respecte la CE ; sinon c'est une racine étrangère, à rejeter ${COURS_DENOMINATEUR}.`)]),
    calcul(l, lignes, [texte("Chaque valeur trouvée, confrontée à la CE :")]),
    resultat(l, [latex(ensembleSolutionsLatex(valides.map((v) => rac(v))))]),
    ...(valides.length ? [verification(l, [texte("On remplace dans l'équation de départ :")], verif)] : []),
    ...(rejetees.length
      ? [piege(l, [latex(`x=${q(rejetees[0]!)}`), texte(" vérifie l'équation sans fractions, mais annule un dénominateur de l'équation de départ : c'est une racine étrangère, à rejeter.")])]
      : [piege(l, [texte("Même quand aucune solution n'est rejetée, il faut confronter chaque solution à la CE : c'est l'étape qu'on oublie le plus souvent.")])]),
  ];
}

// ---------------------------------------------------------------------------------------------
// Assemblage
// ---------------------------------------------------------------------------------------------

export function correctionDetailleeEquationRationnelle(instance: E): EtapeCorrection[] {
  return finaliserCorrige(correctionDetailleeEquationRationnelleBrut(instance));
}

function correctionDetailleeEquationRationnelleBrut(instance: E): EtapeCorrection[] {
  return phasesEquationRationnelle(instance).flatMap((phase) => {
    const l = lettrePhaseEquationRationnelle(instance, phase);
    switch (phase) {
      case "ce":
        return etapeCE(instance, l);
      case "simplifier":
        return etapeSimplifier(instance, l);
      case "simplifierReduction": {
        const { p2, nom } = p2DeGauche(instance);
        return etapeReduction(p2, nom, l);
      }
      case "simplifierReconnaissance": {
        const { p2, nom } = p2DeGauche(instance);
        return etapeReconnaissance(p2, nom, l);
      }
      case "simplifierChamp1": {
        const { p2, nom } = p2DeGauche(instance);
        return etapeChamp1(p2, nom, l);
      }
      case "simplifierChamp2": {
        const { p2, nom } = p2DeGauche(instance);
        return etapeRacinesP2(p2, nom, l);
      }
      case "simplifierFactorisation": {
        const { p2, nom } = p2DeGauche(instance);
        return etapeFactorisation(p2, nom, l);
      }
      case "simplifierFraction":
        return etapeSimplifierFraction(instance, l);
      case "isolement":
        return etapeIsolement(instance, l);
      case "reconnaissance":
        return etapeReconnaissanceEq(instance, l);
      case "champ1":
        return etapeChamp1Eq(instance, l);
      case "champ2":
        return etapeChamp2(instance, l);
      case "racinesEtrangeres":
        return etapeRacinesEtrangeres(instance, l);
    }
  });
}

/** Consigne de chaque écran (titres « Étape n — … » du corrigé). */
export function consigneEtapeEquationRationnelle(instance: E, phase: Phase): FragmentConsigne[] {
  const cote = () => (p2DeGauche(instance).nom === "N" ? "numérateur" : "dénominateur");
  switch (phase) {
    case "ce":
      return [texte(instance.ce.length === 1 ? "Donne la condition d'existence de l'équation." : "Donne les conditions d'existence de l'équation.")];
    case "simplifier":
      return [texte(instance.fractionsSimplifiables.length === 1 ? "Simplifie la fraction réductible." : "Simplifie les fractions réductibles.")];
    case "simplifierReduction":
      return [texte(`Mets le facteur numérique commun du ${cote()} de la fraction de gauche en évidence.`)];
    case "simplifierReconnaissance":
      return [texte(`Choisis la méthode la plus rapide pour factoriser le ${cote()} de la fraction de gauche.`)];
    case "simplifierChamp1":
      return [texte(p2DeGauche(instance).p2.categorie === "cas_general" ? `Calcule le discriminant Δ du ${cote()} de la fraction de gauche.` : `Factorise le ${cote()} de la fraction de gauche.`)];
    case "simplifierChamp2":
      return [texte(`Donne les racines du ${cote()} de la fraction de gauche.`)];
    case "simplifierFactorisation":
      return [texte(`Écris la forme factorisée du ${cote()} de la fraction de gauche.`)];
    case "simplifierFraction":
      return [texte("Simplifie la fraction de gauche.")];
    case "isolement":
      return [texte("Élimine les dénominateurs et ramène tout dans un membre.")];
    case "reconnaissance":
      return [texte("Choisis la méthode la plus rapide pour résoudre cette équation.")];
    case "champ1":
      return [texte(instance.equationIsolee.categorie === "cas_general" ? "Calcule le discriminant Δ." : "Factorise le membre de gauche.")];
    case "champ2":
      return [texte("Donne les solutions de cette équation.")];
    case "racinesEtrangeres":
      return [texte("Vérifie chaque solution avec les conditions d'existence et donne l'ensemble des solutions.")];
  }
}

export function ensembleSolutionsEquationRationnelle(instance: E): string {
  return ensembleSolutionsLatex(racinesEq(instance).filter((v) => !instance.ce.includes(v)).map((v) => rac(v)));
}

