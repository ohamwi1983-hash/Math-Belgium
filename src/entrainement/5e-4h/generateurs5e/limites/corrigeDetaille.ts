import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceLimite, ExerciceLimiteFormeIndeterminee, ExerciceLimiteInfini, ExerciceLimiteInfiniePoint, ExerciceLimiteReelle } from "../../core5e/limites.types";
import { ordreComplet, type PhaseLimite } from "../../moteur5e/typesLimites";
import { formatBlocDonneesLatex, formatReponseAttenduePhaseLatex } from "../../ui5e/formatLimites";
import {
  COURS_LIMITES,
  cote,
  decL,
  facteurLatex,
  facteurNu,
  finaliser,
  fracBrute,
  fracL,
  infini,
  jf,
  lignesValeur,
  lim,
  miseEnEvidence,
  monomesDe,
  monomesLatex,
  nbL,
  nbT,
  par,
  polyDepuisMonomes,
  polyLatex,
  produitFacteurs,
  t,
  f,
  zeroSigne,
  type Monome,
  type Poly,
} from "../../ui5e/corrigeLimites";

/**
 * Corrigé détaillé « comme au tableau » de 5gen20 (limites : reconnaissance et calcul) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`ordreComplet` du moteur) :
 * - nombre réel : a = substitution N(a), D(a) ≠ 0, limite ;
 * - forme 0/0 : a = substitution (0/0), b = factorisation (racine connue a, produit des racines),
 *   c = simplification par (x − a) puis substitution ;
 * - forme k/0 : a = substitution (k/0), b = factorisation du dénominateur, c = signe de chaque facteur
 *   de part et d'autre de a (0⁺ / 0⁻), d = conclusion (limites latérales égales ou non) ;
 * - x → ±∞ : a = limites infinies de N et D (∞/∞), b = mise en évidence du terme de plus haut degré,
 *   c = simplification par la puissance commune, (d = limite finale).
 * N et D sont relus dans l'énoncé de l'écran (`formatBlocDonneesLatex`) ; réponses de l'écran
 * (`formatReponseAttenduePhaseLatex`) dans les « Résultat ». SANS `docx` : importé par l'adaptateur ET
 * par `App5gen20.tsx`.
 */

const LETTRES = "abcdefgh";

/** Lettre de l'écran d'une phase (ordre du moteur). */
export function lettrePhaseLimite(exercice: ExerciceLimite, phase: PhaseLimite): string {
  return LETTRES[ordreComplet(exercice).indexOf(phase)] ?? "a";
}

/** Groupe `{…}` qui commence à l'indice i (accolade ouvrante). */
function groupeA(s: string, i: number): { contenu: string; fin: number } {
  let n = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === "{") n++;
    else if (s[j] === "}") {
      n--;
      if (n === 0) return { contenu: s.slice(i + 1, j), fin: j + 1 };
    }
  }
  return { contenu: s.slice(i + 1), fin: s.length };
}

interface Donnees {
  nLatex: string;
  dLatex: string;
  nM: Monome[];
  dM: Monome[];
  N: Poly;
  D: Poly;
  cible: string;
}

/** Numérateur et dénominateur tels qu'écrits dans l'énoncé (`\lim_{…} \dfrac{N}{D}`). */
function donnees(exercice: ExerciceLimite): Donnees {
  const bloc = formatBlocDonneesLatex(exercice);
  const cible = groupeA(bloc, bloc.indexOf("{")).contenu.replace(/^x\\to\s*/, "").trim();
  const i = bloc.indexOf("\\dfrac");
  const num = groupeA(bloc, i + "\\dfrac".length);
  const den = groupeA(bloc, num.fin);
  const nM = monomesDe(num.contenu) ?? [];
  const dM = monomesDe(den.contenu) ?? [];
  return { nLatex: num.contenu, dLatex: den.contenu, nM, dM, N: polyDepuisMonomes(nM), D: polyDepuisMonomes(dM), cible };
}

/** f(x) = N(x)/D(x), N et D nommés (première étape). */
function definitions(d: Donnees): LigneCalcul[] {
  return [ligne(`N(x)=${d.nLatex}`, "numérateur de la fraction"), ligne(`D(x)=${d.dLatex}`, "dénominateur")];
}

function introF(): ReturnType<typeof t>[] {
  return [t("On note "), f("f(x)=\\dfrac{N(x)}{D(x)}"), t(" la fraction de l'énoncé :")];
}

// ============================================================================
// Nombre réel.
// ============================================================================

function etapesReelle(e: ExerciceLimiteReelle): EtapeCorrection[] {
  const d = donnees(e);
  const a = e.a;
  const vn = lignesValeur(`N(${a})`, d.nM, a);
  const vd = lignesValeur(`D(${a})`, d.dM, a);
  const l = "a";
  return [
    utilise(l, [t("Si le dénominateur ne s'annule pas en "), f(`x=${a}`), t(", la fraction est définie en ce point et sa limite est sa valeur : on remplace x par "), f(`${a}`), t(` ${COURS_LIMITES}.`)]),
    calcul(l, definitions(d), introF()),
    calcul(l, vn.lignes, [], "Numérateur"),
    calcul(l, [...vd.lignes.slice(0, -1), ligne(`=${nbL(vd.valeur)}\\neq 0`, "le dénominateur ne s'annule pas")], [], "Dénominateur"),
    calcul(
      l,
      [ligne(`${lim(a)} f(x)=\\dfrac{N(${a})}{D(${a})}`, "substitution directe"), ligne(`=${fracBrute(vn.valeur, vd.valeur)}`), ligne(`=${fracL(vn.valeur, vd.valeur)}`, "on simplifie")],
      [],
      "Limite",
    ),
    resultat(l, [f(`${lim(a)} ${fractionEnonce(d)}=${fracL(e.limite.num, e.limite.den)}`)]),
    piege(l, [t("Vérifier d'abord que le dénominateur ne s'annule pas en "), f(`x=${a}`), t(" : c'est ce qui autorise la substitution directe (sinon, forme "), f("\\frac{k}{0}"), t(" ou "), f("\\frac{0}{0}"), t(").")]),
  ];
}

function fractionEnonce(d: Donnees): string {
  return `\\dfrac{${d.nLatex}}{${d.dLatex}}`;
}

// ============================================================================
// Reconnaissance (formes 0/0, k/0, ∞/∞).
// ============================================================================

function etapeSubstitution(e: ExerciceLimiteFormeIndeterminee | ExerciceLimiteInfiniePoint, d: Donnees): EtapeCorrection[] {
  const a = e.a;
  const vn = lignesValeur(`N(${a})`, d.nM, a);
  const vd = lignesValeur(`D(${a})`, d.dM, a);
  const zero = vn.valeur === 0;
  return [
    utilise("a", [t("On remplace x par "), f(`${a}`), t(" dans le numérateur et dans le dénominateur : un dénominateur nul avec un numérateur non nul donne la forme "), f("\\frac{k}{0}"), t(" (limite infinie) ; tous deux nuls, la forme indéterminée "), f("\\frac{0}{0}"), t(` ${COURS_LIMITES}.`)]),
    calcul("a", definitions(d), introF()),
    calcul("a", vn.lignes, [], "Numérateur"),
    calcul("a", vd.lignes, [], "Dénominateur"),
    resultat("a", zero ? [t("Forme "), f("\\dfrac{0}{0}"), t(" : forme indéterminée, on factorise.")] : [t("Forme "), f(`\\dfrac{${vn.valeur}}{0}`), t(" : la limite est infinie (forme "), f("\\frac{k}{0}"), t(").")]),
    piege("a", zero ? [f("\\frac{0}{0}"), t(" n'est pas un résultat : c'est une forme indéterminée, qu'on lève en factorisant puis en simplifiant.")] : [t("Un dénominateur nul ne veut pas dire « limite 0 » ni « pas de limite » : avec un numérateur non nul, la limite est "), f("+\\infty"), t(" ou "), f("-\\infty"), t(".")]),
  ];
}

/** Factorisation d'un trinôme k(x − a)(x − r) dont on connaît la racine a : produit des racines
 * (a ≠ 0) ou mise en évidence de x (a = 0). */
function lignesFactorisationRacineConnue(nom: string, m: Monome[], p: Poly, a: number): { lignes: LigneCalcul[]; autre: number; k: number } {
  const k = p[2];
  const c = p[0];
  const lignes: LigneCalcul[] = [ligne(`${nom}=${polyLatex(p)}`, polyLatex(p) !== monomesLatex(m) ? "on ordonne les termes" : undefined)];
  if (a === 0) {
    const autre = -p[1] / k;
    lignes.push(ligne(`=${produitFacteurs(k, [0, autre])}`, [t("on met "), f(k === 1 ? "x" : k === -1 ? "-x" : `${k}x`), t(" en évidence")]));
    return { lignes, autre, k };
  }
  const autre = c / (k * a);
  lignes.push(ligne(`x_2=\\dfrac{${c}}{${par(k)}\\cdot ${par(a)}}`, [t("racine "), f(`x_1=${a}`), t(" ; produit des racines "), f("x_1x_2=\\frac{c}{a}")]));
  lignes.push(ligne(`=${nbL(autre)}`));
  lignes.push(ligne(`${nom}=${produitFacteurs(k, [a, autre])}`, [f("a(x-x_1)(x-x_2)")]));
  return { lignes, autre, k };
}

// ============================================================================
// Forme 0/0.
// ============================================================================

function etapesFormeIndeterminee(e: ExerciceLimiteFormeIndeterminee): EtapeCorrection[] {
  const d = donnees(e);
  const a = e.a;
  const fn = lignesFactorisationRacineConnue("N(x)", d.nM, d.N, a);
  const fd = lignesFactorisationRacineConnue("D(x)", d.dM, d.D, a);
  const nFact = produitFacteurs(e.kN, [a, e.p]);
  const dFact = produitFacteurs(e.kD, [a, e.q]);
  const nSimpl = produitFacteurs(e.kN, [e.p]);
  const dSimpl = produitFacteurs(e.kD, [e.q]);
  const vn = e.kN * (a - e.p);
  const vd = e.kD * (a - e.q);
  const [rN, rD] = formatReponseAttenduePhaseLatex(e, "factoriser");
  const limite = fracL(e.limite.num, e.limite.den);
  const subN = substitutionFacteur(e.kN, e.p, a);
  const subD = substitutionFacteur(e.kD, e.q, a);
  const xv = a + 0.001;
  const fv = (e.kN * (xv - e.p)) / (e.kD * (xv - e.q));
  return [
    ...etapeSubstitution(e, d),
    utilise("b", [t("N et D s'annulent en "), f(`x=${a}`), t(" : "), f(facteurLatex(a)), t(" est un facteur commun (racine connue). L'autre racine d'un trinôme "), f("ax^2+bx+c"), t(" se trouve par le produit des racines "), f("x_1x_2=\\frac{c}{a}"), t(` ${COURS_LIMITES}.`)]),
    calcul("b", fn.lignes, [], "Numérateur"),
    calcul("b", fd.lignes, [], "Dénominateur"),
    resultat("b", [f(rN), t(" et "), f(rD), t(".")]),
    utilise("c", [t("Pour "), f(`x\\neq ${a}`), t(", on simplifie le facteur commun "), f(facteurLatex(a)), t(" ; la fraction simplifiée est définie en "), f(`x=${a}`), t(" : on y remplace x.")]),
    calcul(
      "c",
      [
        ligne(`f(x)=\\dfrac{${nFact}}{${dFact}}`, "formes factorisées (étape 2)"),
        ligne(`=\\dfrac{${nSimpl}}{${dSimpl}}`, [t("on simplifie par "), f(facteurLatex(a)), t(", car "), f(`x\\neq ${a}`)]),
        ligne(`${lim(a)} f(x)=\\dfrac{${subN}}{${subD}}`, `on remplace x par ${nbT(a)}`),
        ligne(`=${fracBrute(vn, vd)}`),
        ligne(`=${limite}`, "on simplifie"),
      ],
    ),
    resultat("c", [f(`${lim(a)} f(x)=${limite}`)]),
    verification("c", [t("Juste à côté de "), f(`${a}`), t(" : "), f(`f(${decL(xv, 3)})\\approx ${decL(fv, 3)}`), t(", proche de la limite.")]),
    piege("c", [t("On remplace x dans la fraction simplifiée : dans la fraction de départ, on retrouverait "), f("\\frac{0}{0}"), t(".")]),
  ];
}

/** k(a − r) écrit « 3(2-1) », « -(2+1) », « (2-1) » ; facteur x seul (r = 0) : « 3\cdot 2 ». */
function substitutionFacteur(k: number, r: number, a: number): string {
  const interieur = r === 0 ? par(a) : `(${a}${r > 0 ? `-${r}` : `+${-r}`})`;
  if (k === 1) return r === 0 ? `${a}` : interieur;
  if (k === -1) return `-${interieur}`;
  return r === 0 ? `${k}\\cdot ${par(a)}` : `${k}${interieur}`;
}

// ============================================================================
// Forme k/0.
// ============================================================================

function etapesInfiniePoint(e: ExerciceLimiteInfiniePoint): EtapeCorrection[] {
  const d = donnees(e);
  const a = e.a;
  const simple = e.sousCas === "racineSimple";
  const r = simple ? (e.q as number) : a;
  const fd = lignesFactorisationRacineConnue("D(x)", d.dM, d.D, a);
  const [rD] = formatReponseAttenduePhaseLatex(e, "factoriserDenominateur");
  const nA = e.kN * a + e.bN;
  const dFact = produitFacteurs(e.kD, [a, r]);
  const fSimple = `\\dfrac{${d.nLatex}}{${dFact}}`;
  const lignesSignes: LigneCalcul[] = [ligne(`${lim(a)} N(x)=${nA}`, [t("numérateur : il garde le signe de "), f(`${nA}`), t(` près de ${nbT(a)}`)])];
  if (simple) lignesSignes.push(ligne(`${lim(a)} ${r === 0 ? "x" : `(${facteurNu(r)})`}=${a - r}`, [t("l'autre facteur garde le signe de "), f(`${a - r}`), t(` près de ${nbT(a)}`)]));
  const kD = e.kD;
  const facteurA = simple ? (a === 0 ? "x" : `(${facteurNu(a)})`) : a === 0 ? "x^{2}" : `(${facteurNu(a)})^{2}`;
  for (const sens of ["gauche", "droite"] as const) {
    const s = sens === "gauche" ? -1 : 1;
    const signeFacteur = simple ? s : 1;
    const signeD = sens === "gauche" ? e.signeDenominateurGauche : e.signeDenominateurDroite;
    const signeL = sens === "gauche" ? e.signeLimiteGauche : e.signeLimiteDroite;
    lignesSignes.push(ligne(`${lim(cote(a, sens))} ${facteurA}=${zeroSigne(signeFacteur)}`, simple ? [f(s < 0 ? `x<${nbT(a).replace("−", "-").replace(",", "{,}")}` : `x>${nbT(a).replace("−", "-").replace(",", "{,}")}`)] : "un carré est positif des deux côtés"));
    lignesSignes.push(
      ligne(`${lim(cote(a, sens))} D(x)=${zeroSigne(signeD)}`, [t("signe de "), f(simple ? `${par(kD)}\\cdot(${signeFacteur > 0 ? "+" : "-"})\\cdot(${a - r > 0 ? "+" : "-"})` : `${par(kD)}\\cdot(+)`)]),
    );
    lignesSignes.push(ligne(`${lim(cote(a, sens))} f(x)=${infini(signeL)}`, [f(`\\frac{${nA}}{${zeroSigne(signeD)}}`), t(nA * signeD > 0 ? " : quotient positif" : " : quotient négatif")]));
  }
  const [gauche, droite] = [e.signeLimiteGauche, e.signeLimiteDroite];
  const egales = gauche === droite;
  return [
    ...etapeSubstitution(e, d),
    utilise("b", [t("D s'annule en "), f(`x=${a}`), t(" : "), f(facteurLatex(a)), t(" est un facteur de D. L'autre racine se trouve par le produit des racines "), f("x_1x_2=\\frac{c}{a}"), t(` ; si c'est encore ${nbT(a)}, la racine est double ${COURS_LIMITES}.`)]),
    calcul("b", fd.lignes),
    resultat("b", [f(rD), t(simple ? " : deux racines distinctes." : " : racine double.")]),
    utilise("c", [t("Près de "), f(`${a}`), t(", le numérateur garde son signe ; on étudie le signe de chaque facteur du dénominateur juste avant ("), f(`x<${a}`), t(") et juste après ("), f(`x>${a}`), t(`) : un nombre non nul divisé par 0⁺ ou 0⁻ donne ±∞ selon la règle des signes ${COURS_LIMITES}.`)]),
    calcul("c", lignesSignes, [t("Avec "), f(`f(x)=${fSimple}`), t(" :")]),
    resultat("c", [f(`${lim(cote(a, "gauche"))} f(x)=${infini(gauche)}`), t(" et "), f(`${lim(cote(a, "droite"))} f(x)=${infini(droite)}`), t(".")]),
    piege("c", simple ? [t("Pour une racine simple, le facteur "), f(facteurLatex(a)), t(" change de signe en "), f(`x=${a}`), t(" : il faut étudier les deux côtés.")] : [t("Pour une racine double, le carré "), f(facteurA), t(" est positif des deux côtés : le signe ne change pas.")]),
    utilise("d", [t("La limite en "), f(`${a}`), t(` existe si et seulement si les limites à gauche et à droite sont égales ${COURS_LIMITES}.`)]),
    calcul("d", [
      ligne(`${lim(cote(a, "gauche"))} f(x)=${infini(gauche)}`, "étape 3"),
      ligne(`${lim(cote(a, "droite"))} f(x)=${infini(droite)}`, "étape 3"),
      egales ? ligne(`${infini(gauche)}=${infini(droite)}`, "les deux limites sont égales") : ligne(`${infini(gauche)}\\neq ${infini(droite)}`, "les deux limites sont différentes"),
    ]),
    resultat("d", egales ? [f(`${lim(a)} f(x)=${infini(gauche)}`), t(` ; la droite x = ${nbT(a)} est asymptote verticale.`)] : [f(`${lim(a)} f(x)`), t(` n'existe pas ; la droite x = ${nbT(a)} est asymptote verticale.`)]),
    piege("d", [t("Deux limites infinies de signes différents : on ne conclut ni « +∞ » ni « −∞ » ; de même signe : la limite existe.")]),
  ];
}

// ============================================================================
// x → ±∞.
// ============================================================================

function signeInfiniPoly(p: Poly, plus: boolean): number {
  const n = p.length - 1;
  const lead = p[n];
  return Math.sign(lead) * (plus || n % 2 === 0 ? 1 : -1);
}

function etapesInfini(e: ExerciceLimiteInfini): EtapeCorrection[] {
  const d = donnees(e);
  const plus = e.direction === "plus";
  const c = plus ? "+\\infty" : "-\\infty";
  const N = e.coeffsN;
  const D = e.coeffsD;
  const sN = signeInfiniPoly(N, plus);
  const sD = signeInfiniPoly(D, plus);
  const mN = miseEnEvidence(N);
  const mD = miseEnEvidence(D);
  const egaux = e.sousCas === "degresEgaux";
  const r = e.degreResultat;
  const ratio = fracL(e.ratioCoefficients.num, e.ratioCoefficients.den);
  const ratioBrut = fracBrute(N[N.length - 1], D[D.length - 1]);
  const facteurX = r === 0 ? "" : r === 1 ? "x\\cdot " : r > 1 ? `x^{${r}}\\cdot ` : r === -1 ? "\\dfrac{1}{x}\\cdot " : `\\dfrac{1}{x^{${-r}}}\\cdot `;
  const puissanceCommune = Math.min(e.degN, e.degD);
  const pc = puissanceCommune === 1 ? "x" : `x^{${puissanceCommune}}`;
  const quotientPar = `\\dfrac{${mN.parenthese}}{${mD.parenthese}}`;
  const [domN, domD] = [mN.dominant, mD.dominant];
  const lignesB: LigneCalcul[] = [
    ligne(`N(x)=${mN.latex}`, mN.monome ? "un seul terme : c'est son terme de plus haut degré" : [t("on met "), f(mN.puissance), t(" en évidence")]),
    ligne(`D(x)=${mD.latex}`, mD.monome ? "un seul terme : c'est son terme de plus haut degré" : [t("on met "), f(mD.puissance), t(" en évidence")]),
  ];
  const ratioRes = formatReponseAttenduePhaseLatex(e, "simplifierLimiteRef")[0];
  const lignesC: LigneCalcul[] = [
    ligne(`f(x)=\\dfrac{${mN.latex}}{${mD.latex}}`, "mises en évidence (étape 2)"),
    ligne(`=${facteurX}${quotientPar}`, [t("on simplifie par "), f(pc)]),
    ...(mN.monome && mD.monome
      ? []
      : [ligne(`${lim(c)} ${quotientPar}=${ratioBrut}`, [t("chaque terme en "), f("\\frac{k}{x^n}"), t(" tend vers 0")]), ligne(`=${ratio}`, "on simplifie")]),
  ];
  const etapes: EtapeCorrection[] = [
    utilise("a", [t("Quand "), f(`x\\to ${c}`), t(", un polynôme non constant tend vers "), f("+\\infty"), t(" ou "), f("-\\infty"), t(" : son signe est celui de son terme de plus haut degré "), f(`(${c})^n`), t(` multiplié par le coefficient ${COURS_LIMITES}.`)]),
    calcul("a", [
      ...definitions(d),
      ligne(`${lim(c)} N(x)=${infini(sN)}`, [t("terme de plus haut degré "), f(domN)]),
      ligne(`${lim(c)} D(x)=${infini(sD)}`, [t("terme de plus haut degré "), f(domD)]),
    ], introF()),
    resultat("a", [t("Forme "), f("\\dfrac{\\infty}{\\infty}"), t(" : forme indéterminée, on compare les termes de plus haut degré.")]),
    utilise("b", [t("En "), f("\\pm\\infty"), t(", on met en évidence le terme de plus haut degré, au numérateur et au dénominateur : tous les autres termes deviennent négligeables "), t(COURS_LIMITES), t(".")]),
    calcul("b", lignesB),
    resultat("b", [t("Termes de plus haut degré : "), f(domN), t(" au numérateur, "), f(domD), t(" au dénominateur.")]),
    utilise("c", [t("On simplifie les puissances de x communes ; la fraction des parenthèses tend vers le rapport des coefficients dominants "), t(COURS_LIMITES), t(".")]),
    calcul("c", lignesC),
  ];
  if (egaux) {
    etapes.push(resultat("c", [f(`${lim(c)} ${fractionEnonce(d)}=${ratio}`)]));
    etapes.push(verificationLoin(e, d, plus, ratio));
    etapes.push(piege("b", [t("On compare les termes de plus haut degré, pas les termes constants.")]));
    return etapes;
  }
  etapes.push(resultat("c", [f("f(x)"), t(" se comporte comme "), f(`\\dfrac{${domN}}{${domD}}=${ratioRes}`), t(".")]));
  const limiteFinale = formatReponseAttenduePhaseLatex(e, "evaluerLimiteFinale")[0].replace(/^\\lim=/, "");
  const ratioV = e.ratioCoefficients.num / e.ratioCoefficients.den;
  const ratioFacteur = Number.isInteger(ratioV) ? par(ratioV) : `\\left(${ratio}\\right)`;
  const lignesD: LigneCalcul[] = [];
  if (r > 0) {
    const sPuissance = plus || r % 2 === 0 ? 1 : -1;
    lignesD.push(ligne(`${lim(c)} ${r === 1 ? "x" : `x^{${r}}`}=${infini(sPuissance)}`, r % 2 === 0 ? "puissance paire : positive des deux côtés" : "limite de référence"));
    lignesD.push(ligne(`${lim(c)} f(x)=${limiteFinale}`, [t("produit : "), f(`(${infini(sPuissance)})\\cdot ${ratioFacteur}`), t(ratioV > 0 ? ", facteur positif" : ", facteur négatif")]));
  } else {
    lignesD.push(ligne(`${lim(c)} ${r === -1 ? "\\dfrac{1}{x}" : `\\dfrac{1}{x^{${-r}}}`}=0`, "limite de référence"));
    lignesD.push(ligne(`${lim(c)} f(x)=0`, [t("produit : "), f(`0\\cdot ${ratioFacteur}`)]));
  }
  etapes.push(
    utilise("d", [t("D'après l'étape 3, "), f(`f(x)=${facteurX}${quotientPar}`), t(" : le second facteur tend vers "), f(ratio), t(" ; on conclut avec la limite de référence de la puissance de x "), t(COURS_LIMITES), t(".")]),
  );
  etapes.push(calcul("d", lignesD));
  etapes.push(resultat("d", [f(`${lim(c)} ${fractionEnonce(d)}=${limiteFinale}`)]));
  if (r < 0) etapes.push(verificationLoin(e, d, plus, "0"));
  etapes.push(
    piege(
      "d",
      r > 0
        ? [t("Le signe dépend du coefficient et, pour une puissance impaire de x, du sens : en "), f("-\\infty"), t(", "), f("x^3"), t(" est négatif mais "), f("x^2"), t(" est positif.")]
        : [t("Numérateur de degré plus petit : la limite vaut 0, pas le rapport des coefficients.")],
    ),
  );
  return etapes;
}

/** Vérification numérique « loin » (x = ±1000) d'une limite finie. */
function verificationLoin(e: ExerciceLimiteInfini, d: Donnees, plus: boolean, limite: string): EtapeCorrection {
  const x = plus ? 1000 : -1000;
  const v = d.N.reduce((s, c, i) => s + c * x ** i, 0) / d.D.reduce((s, c, i) => s + c * x ** i, 0);
  void e;
  return verification(e.sousCas === "degresEgaux" ? "c" : "d", [t("Pour un x très "), t(plus ? "grand" : "négatif"), t(" : "), f(`f(${x})\\approx ${decL(v, 3)}`), t(", proche de "), f(limite), t(".")]);
}

/** Lignes du corrigé dans l'ordre des étapes. */
export function correctionDetailleeLimite(exercice: ExerciceLimite): EtapeCorrection[] {
  let etapes: EtapeCorrection[];
  switch (exercice.famille) {
    case "limiteReelle":
      etapes = etapesReelle(exercice);
      break;
    case "formeIndeterminee":
      etapes = etapesFormeIndeterminee(exercice);
      break;
    case "limiteInfiniePoint":
      etapes = etapesInfiniePoint(exercice);
      break;
    case "limiteInfini":
      etapes = etapesInfini(exercice);
      break;
  }
  const ordre = (l?: string) => LETTRES.indexOf(l ?? "a");
  return finaliser(
    etapes
      .map((x, i) => ({ x, i }))
      .sort((u, v) => ordre(u.x.sousQuestion) - ordre(v.x.sousQuestion) || u.i - v.i)
      .map(({ x }) => x),
  );
}

void jf;
