import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDefinitionDerivee } from "../../core5e/definitionDerivee.types";
import { ordreEcrans, type EcranDefinitionDerivee } from "../../moteur5e/typesDefinitionDerivee";
import { formatReponseAttendueEcranLatex, nombreTexte } from "../../ui5e/formatDefinitionDerivee";
import {
  COURS_DEFINITION,
  COURS_DERIVEE,
  coefFacteur,
  dernierMembre,
  f,
  finaliser,
  hPlus,
  jf,
  lignesValeurPoly,
  monome,
  par,
  pgcd,
  polyV,
  q,
  qL,
  sansDoublons,
  somme,
  t,
  type Q,
} from "../../ui5e/corrigeDerivees1";
import { deriveeExacte, valeurExacte } from "./index";

/**
 * Corrigé détaillé « comme au tableau » de 5gen26 (calculer f'(a) par la définition) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`ordreEcrans` : développer, taux
 * d'accroissement simplifié — absent pour une fonction affine —, limite). f(a) et f(a + h) : substitution
 * puis développement terme à terme ; taux : f(a + h) − f(a) (même dénominateur pour une fonction
 * rationnelle), mise en évidence de h, division par h ; limite : h remplacé par 0, vérification par les
 * règles de dérivation (cours, § 3). Valeurs finales = réponses de l'écran
 * (`formatReponseAttendueEcranLatex`). SANS `docx` : importé par l'adaptateur ET par `App5gen26.tsx`.
 */

const LETTRES = "abcdefgh";

export function lettreEcranDefinitionDerivee(e: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee): string {
  return LETTRES[ordreEcrans(e).indexOf(ecran)] ?? "a";
}

/** Numérateur de f(a + h) (polynôme en h) et dénominateur, pour les familles rationnelles. */
interface FormeRationnelle {
  /** Numérateur, coefficients ascendants en h. */
  A: number[];
  /** Dénominateur sans parenthèses (« h+2 ») ou carré (« (h+2)^{2} »). */
  B: string;
  /** Dénominateur prêt à être multiplié (« (h+2) », « (h+2)^{2} »). */
  Bpar: string;
  /** Dénominateur développé, coefficients ascendants en h. */
  Bpoly: number[];
  carre: boolean;
}

function formeRationnelle(e: ExerciceDefinitionDerivee): FormeRationnelle | null {
  const a = e.a;
  if (e.famille === "rationnelleSimple") {
    if (e.expo === 1) return { A: [e.k], B: hPlus(a), Bpar: `(${hPlus(a)})`, Bpoly: [a, 1], carre: false };
    return { A: [e.k], B: `(${hPlus(a)})^{2}`, Bpar: `(${hPlus(a)})^{2}`, Bpoly: [a * a, 2 * a, 1], carre: true };
  }
  if (e.famille === "rationnelleLineaire") {
    const D = a - e.q;
    return { A: [e.m * a + e.p, e.m], B: hPlus(D), Bpar: `(${hPlus(D)})`, Bpoly: [D, 1], carre: false };
  }
  return null;
}

/** Fraction exacte f(a) sous la forme d'un rationnel. */
function fa(e: ExerciceDefinitionDerivee): Q {
  const v = valeurExacte(e, e.a);
  return q(v.num, v.den);
}

function fpa(e: ExerciceDefinitionDerivee): Q {
  const v = deriveeExacte(e, e.a);
  return q(v.num, v.den);
}

// ============================================================================
// Étape « développer » : f(a), puis f(a + h).
// ============================================================================

function lignesFA(e: ExerciceDefinitionDerivee): LigneCalcul[] {
  const a = e.a;
  const g = `f(${a})`;
  const v = fa(e);
  switch (e.famille) {
    case "affine":
      return lignesValeurPoly(g, [e.p, e.m], q(a)).lignes;
    case "quadratique":
      return lignesValeurPoly(g, [e.p, 0, e.m], q(a)).lignes;
    case "rationnelleSimple": {
      if (e.expo === 1) {
        if (a === 1) return [ligne(`${g}=${qL(v)}`, "on remplace x par 1")];
        return sansDoublons([ligne(`${g}=\\dfrac{${e.k}}{${a}}`, `on remplace x par ${nombreTexte(a)}`), ligne(`=${qL(v)}`, pgcd(e.k, a) > 1 || a < 0 ? "on simplifie" : undefined)]);
      }
      return sansDoublons([ligne(`${g}=\\dfrac{${e.k}}{${par(a)}^{2}}`, `on remplace x par ${nombreTexte(a)}`), ligne(`=\\dfrac{${e.k}}{${a * a}}`, "on calcule le carré"), ligne(`=${qL(v)}`, pgcd(e.k, a * a) > 1 ? "on simplifie" : undefined)].filter((l) => !/\{1\}$/.test(l.latex)));
    }
    case "rationnelleLineaire": {
      const N = e.m * a + e.p;
      const D = a - e.q;
      const num = somme([e.m === 1 ? `${a}` : e.m === -1 ? `-${par(a)}` : `${e.m}\\cdot ${par(a)}`, `${e.p}`]);
      const den = e.q === 0 ? `${a}` : `${a}${e.q > 0 ? `-${e.q}` : `+${-e.q}`}`;
      const lignes = [ligne(den === "1" ? `${g}=${num}` : `${g}=\\dfrac{${num}}{${den}}`, `on remplace x par ${nombreTexte(a)}`)];
      if (D === 1) lignes.push(ligne(`=${N}`, "on calcule"));
      else {
        lignes.push(ligne(`=\\dfrac{${N}}{${D}}`, "on calcule le numérateur et le dénominateur"));
        lignes.push(ligne(`=${qL(v)}`, pgcd(N, D) > 1 ? `on simplifie par ${pgcd(N, D)}` : D < 0 ? "on écrit le signe devant la fraction" : undefined));
      }
      return sansDoublons(lignes);
    }
  }
}

function lignesFAH(e: ExerciceDefinitionDerivee): LigneCalcul[] {
  const a = e.a;
  const g = `f(${a}+h)`;
  const ah = `${a}+h`;
  switch (e.famille) {
    case "affine": {
      const lignes = [ligne(`${g}=${coefFacteur(e.m, `(${ah})`)}${e.p === 0 ? "" : e.p > 0 ? `+${e.p}` : e.p}`, [t("on remplace x par "), f(ah)])];
      lignes.push(ligne(`=${somme([`${e.m * a}`, monome(e.m, 1, "h"), `${e.p}`])}`, e.m === 1 ? "on supprime les parenthèses" : `on distribue ${nombreTexte(e.m)}`));
      lignes.push(ligne(`=${polyV([e.m * a + e.p, e.m], "h")}`, "on réduit et on ordonne"));
      return sansDoublons(lignes);
    }
    case "quadratique": {
      const m = e.m;
      const p = e.p;
      const carre = somme([`${a * a}`, monome(2 * a, 1, "h"), "h^{2}"]);
      const pTxt = p === 0 ? "" : p > 0 ? `+${p}` : `${p}`;
      const lignes = [
        ligne(`${g}=${coefFacteur(m, `(${ah})^{2}`)}${pTxt}`, [t("on remplace x par "), f(ah)]),
        ligne(`=${coefFacteur(m, `(${carre})`)}${pTxt}`, jf("identité remarquable ", { l: "(a+b)^2=a^2+2ab+b^2" })),
        ligne(`=${somme([`${m * a * a}`, monome(2 * m * a, 1, "h"), monome(m, 2, "h"), `${p}`])}`, m === 1 ? "on supprime les parenthèses" : `on distribue ${nombreTexte(m)}`),
        ligne(`=${polyV([m * a * a + p, 2 * m * a, m], "h")}`, "on réduit et on ordonne"),
      ];
      return sansDoublons(lignes);
    }
    case "rationnelleSimple":
      return e.expo === 1
        ? sansDoublons([ligne(`${g}=\\dfrac{${e.k}}{${ah}}`, [t("on remplace x par "), f(ah)]), ligne(`=\\dfrac{${e.k}}{${hPlus(a)}}`, "on écrit h en premier")])
        : sansDoublons([ligne(`${g}=\\dfrac{${e.k}}{(${ah})^{2}}`, [t("on remplace x par "), f(ah)]), ligne(`=\\dfrac{${e.k}}{(${hPlus(a)})^{2}}`, "on écrit h en premier")]);
    case "rationnelleLineaire": {
      const N = e.m * a + e.p;
      const D = a - e.q;
      const pTxt = e.p === 0 ? "" : e.p > 0 ? `+${e.p}` : `${e.p}`;
      const qTxt = e.q === 0 ? "" : e.q > 0 ? `-${e.q}` : `+${-e.q}`;
      return sansDoublons([
        ligne(`${g}=\\dfrac{${coefFacteur(e.m, `(${ah})`)}${pTxt}}{${e.q === 0 ? ah : `(${ah})${qTxt}`}}`, [t("on remplace x par "), f(ah)]),
        ligne(`=\\dfrac{${somme([`${e.m * a}`, monome(e.m, 1, "h"), `${e.p}`])}}{${somme([`${a}`, "h", `${-e.q}`])}}`, e.m === 1 ? "on supprime les parenthèses" : `on distribue ${nombreTexte(e.m)}`),
        ligne(`=\\dfrac{${polyV([N, e.m], "h")}}{${hPlus(D)}}`, "on réduit et on ordonne"),
      ]);
    }
  }
}

// ============================================================================
// Étape « taux d'accroissement » (familles non affines).
// ============================================================================

function moinsFA(v: Q): string {
  if (v.n === 0) return "-0";
  return v.n < 0 ? `+${qL(q(-v.n, v.d))}` : `-${qL(v)}`;
}

function lignesQuotientQuadratique(e: ExerciceDefinitionDerivee & { famille: "quadratique" }): LigneCalcul[] {
  const a = e.a;
  const m = e.m;
  const v = m * a * a + e.p;
  const reste = polyV([0, 2 * m * a, m], "h");
  const fact = polyV([2 * m * a, m], "h");
  return sansDoublons([
    ligne(`f(${a}+h)-f(${a})=(${polyV([v, 2 * m * a, m], "h")})${moinsFA(q(v))}`, jf("on soustrait ", { l: `f(${a})=${v}` })),
    ligne(`=${reste}`, "les termes constants s'annulent"),
    ligne(`=h(${fact})`, "on met h en évidence"),
    ligne(`\\dfrac{f(${a}+h)-f(${a})}{h}=\\dfrac{h(${fact})}{h}`, "on divise par h"),
    ligne(`=${fact}`, "on simplifie par h (h ≠ 0)"),
  ]);
}

function lignesQuotientRationnel(e: ExerciceDefinitionDerivee, r: FormeRationnelle): LigneCalcul[] {
  const a = e.a;
  const v = fa(e);
  const n = v.n;
  const d = v.d;
  const Atxt = polyV(r.A, "h");
  const lignes: LigneCalcul[] = [];
  const gauche = `f(${a}+h)-f(${a})`;
  const den = d === 1 ? r.B : `${d}${r.Bpar}`;
  const quotientSur = (num: string) => `\\dfrac{${num}}{${den}}`;
  // Numérateur réduit : d·A − n·B (les constantes s'annulent puisque f(a) = A(0)/B(0)).
  const dA = r.A.map((c) => d * c);
  const nB = r.Bpoly.map((c) => n * c);
  const reduit = Array.from({ length: Math.max(dA.length, nB.length) }, (_, i) => (dA[i] ?? 0) - (nB[i] ?? 0));
  let numFinal: string;
  if (n === 0) {
    lignes.push(ligne(`${gauche}=\\dfrac{${Atxt}}{${r.B}}`, jf("car ", { l: `f(${a})=0` })));
    numFinal = Atxt;
  } else {
    lignes.push(ligne(`${gauche}=\\dfrac{${Atxt}}{${r.B}}${moinsFA(v)}`, jf("on soustrait ", { l: `f(${a})=${qL(v)}` })));
    const dAtxt = d === 1 ? Atxt : r.A.length > 1 ? `${d}(${Atxt})` : `${d}\\cdot ${par(r.A[0])}`;
    const nBtxt = `${n < 0 ? "+" : "-"}${Math.abs(n) === 1 ? "" : Math.abs(n)}${r.Bpar}`;
    lignes.push(ligne(`=${quotientSur(`${dAtxt}${nBtxt}`)}`, d === 1 ? jf("même dénominateur ", { l: r.B }) : jf("même dénominateur ", { l: den })));
    if (r.carre) {
      const carre = somme(["h^{2}", monome(2 * a, 1, "h"), `${a * a}`]);
      lignes.push(ligne(`=${quotientSur(`${dAtxt}${n < 0 ? "+" : "-"}${Math.abs(n) === 1 ? "" : Math.abs(n)}(${carre})`)}`, jf("identité remarquable ", { l: "(a+b)^2" })));
    }
    // Distribution : termes de d·A, puis de −n·B (degrés décroissants).
    const termes: string[] = [];
    for (let k = dA.length - 1; k >= 0; k--) termes.push(monome(dA[k], k, "h"));
    for (let k = nB.length - 1; k >= 0; k--) termes.push(monome(-nB[k], k, "h"));
    lignes.push(ligne(`=${quotientSur(somme(termes))}`, "on distribue"));
    lignes.push(ligne(`=${quotientSur(polyV(reduit, "h"))}`, "on réduit : les termes constants s'annulent"));
    numFinal = polyV(reduit, "h");
  }
  // Mise en évidence de h (numérateur de degré 2 : carré au dénominateur).
  let numSansH: string;
  let coefNum: number;
  if (r.carre) {
    const c = n === 0 ? 0 : -n; // reduit = [0, −2an, −n]
    const facteurH = `(${hPlus(2 * a)})`;
    numFinal = coefFacteur(c, `h${facteurH}`);
    lignes.push(ligne(`=${quotientSur(numFinal)}`, `on met ${c === 1 ? "" : c === -1 ? "−" : nombreTexte(c)}h en évidence`));
    numSansH = coefFacteur(c, facteurH);
    coefNum = c;
  } else {
    const c = n === 0 ? (e.famille === "rationnelleLineaire" ? e.m : 0) : reduit[1];
    numSansH = `${c}`;
    coefNum = c;
  }
  lignes.push(ligne(`\\dfrac{f(${a}+h)-f(${a})}{h}=${quotientSur(numFinal)}\\cdot\\dfrac{1}{h}`, jf("diviser par h, c'est multiplier par ", { l: "\\frac{1}{h}" })));
  lignes.push(ligne(`=${quotientSur(numSansH)}`, "on simplifie par h (h ≠ 0)"));
  const ecran = dernierMembre(formatReponseAttendueEcranLatex(e, "quotient")[0]);
  const derniere = lignes[lignes.length - 1].latex.replace(/^=/, "");
  if (ecran.replace(/\^\{2\}/g, "^2") !== derniere.replace(/\^\{2\}/g, "^2")) {
    const g = pgcd(coefNum, d);
    lignes.push(ligne(`=${ecran}`, g > 1 ? `on simplifie par ${g}` : "on écrit le signe devant la fraction"));
  }
  return sansDoublons(lignes);
}

// ============================================================================
// Étape « limite ».
// ============================================================================

/** h remplacé par 0 dans une écriture de l'écran (« 2h-12 » → « 2\cdot 0-12 »). */
function hParZero(l: string): string {
  return l.replace(/(\d)h/g, "$1\\cdot 0").replace(/h/g, "0");
}

function lignesLimite(e: ExerciceDefinitionDerivee): LigneCalcul[] {
  const a = e.a;
  const val = qL(fpa(e));
  if (e.famille === "affine") {
    const v = e.m * a + e.p;
    const mh = monome(e.m, 1, "h");
    return sansDoublons([
      ligne(`f(${a}+h)-f(${a})=(${polyV([v, e.m], "h")})${moinsFA(q(v))}`, jf("on soustrait ", { l: `f(${a})=${v}` })),
      ligne(`=${mh}`, "les termes constants s'annulent"),
      ligne(`\\dfrac{f(${a}+h)-f(${a})}{h}=\\dfrac{${mh}}{h}`, "on divise par h"),
      ligne(`=${e.m}`, "on simplifie par h (h ≠ 0)"),
      ligne(`f'(${a})=\\lim\\limits_{h\\to 0}${par(e.m)}`, "définition du nombre dérivé"),
      ligne(`=${e.m}`, "la limite d'une constante est cette constante"),
    ]);
  }
  const quotient = dernierMembre(formatReponseAttendueEcranLatex(e, "quotient")[0]);
  return sansDoublons([
    ligne(`f'(${a})=\\lim\\limits_{h\\to 0}\\left(${quotient}\\right)`, "définition, avec le taux simplifié"),
    ligne(`=${hParZero(quotient)}`, jf("on remplace h par 0 : plus de forme ", { l: "\\frac{0}{0}" })),
    ligne(`=${val}`, "on calcule"),
  ]);
}

/** Vérification par les règles de dérivation (cours, § 3). */
function lignesVerification(e: ExerciceDefinitionDerivee): LigneCalcul[] {
  const a = e.a;
  const val = qL(fpa(e));
  switch (e.famille) {
    case "affine":
      return [ligne(`f'(x)=${e.m}`, "la dérivée de mx + p est m")];
    case "quadratique":
      return sansDoublons([
        ligne(`f'(x)=${monome(2 * e.m, 1)}`, jf("règle ", { l: "(x^2)'=2x" })),
        ligne(`f'(${a})=${2 * e.m}\\cdot ${par(a)}`, `on remplace x par ${nombreTexte(a)}`),
        ligne(`=${val}`),
      ]);
    case "rationnelleSimple": {
      if (e.expo === 1) {
        const c = -e.k;
        return sansDoublons([
          ligne(`f'(x)=${c < 0 ? "-" : ""}\\dfrac{${Math.abs(c)}}{x^{2}}`, jf("règle ", { l: "\\left(\\frac{1}{x}\\right)'=-\\frac{1}{x^2}" })),
          ligne(`f'(${a})=${c < 0 ? "-" : ""}\\dfrac{${Math.abs(c)}}{${par(a)}^{2}}`, `on remplace x par ${nombreTexte(a)}`),
          ligne(`=${val}`),
        ]);
      }
      const c = -2 * e.k;
      return sansDoublons([
        ligne(`f'(x)=${c < 0 ? "-" : ""}\\dfrac{${Math.abs(c)}}{x^{3}}`, jf("règle ", { l: "\\left(\\frac{1}{x^2}\\right)'=-\\frac{2}{x^3}" })),
        ligne(`f'(${a})=${c < 0 ? "-" : ""}\\dfrac{${Math.abs(c)}}{${par(a)}^{3}}`, `on remplace x par ${nombreTexte(a)}`),
        ligne(`=${val}`),
      ]);
    }
    case "rationnelleLineaire": {
      const c = -(e.m * e.q + e.p);
      const xq = e.q === 0 ? "x" : `(${e.q > 0 ? `x-${e.q}` : `x+${-e.q}`})`;
      const num = polyV([e.p, e.m]);
      const D = a - e.q;
      return sansDoublons([
        ligne(`f'(x)=\\dfrac{${coefFacteur(e.m, xq)}-(${num})}{${xq}^{2}}`, jf("dérivée d'un quotient ", { l: "\\frac{u'v-uv'}{v^2}" })),
        ligne(`=\\dfrac{${c}}{${xq}^{2}}`, "on réduit le numérateur"),
        ligne(`f'(${a})=\\dfrac{${c}}{${par(D)}^{2}}`, `on remplace x par ${nombreTexte(a)}`),
        ligne(`=${val}`),
      ]);
    }
  }
}

// ============================================================================
// Assemblage.
// ============================================================================

function piegeEtape(e: ExerciceDefinitionDerivee): EtapeCorrection {
  const a = nombreTexte(e.a);
  switch (e.famille) {
    case "affine":
      return piege(lettreEcranDefinitionDerivee(e, "limite"), [t(`Le terme constant disparaît dans f(${a} + h) − f(${a}) : il ne s'ajoute pas au résultat, f'(${a}) vaut le coefficient de x.`)]);
    case "quadratique":
      return piege("a", [t(`En développant le carré de ${a} + h, ne pas oublier le double produit (terme en h) ni le signe du coefficient de x².`)]);
    default:
      return piege(lettreEcranDefinitionDerivee(e, "quotient"), [t(`On met f(${a} + h) − f(${a}) au même dénominateur avant de diviser par h : sinon le facteur h ne peut pas se simplifier.`)]);
  }
}

export function correctionDetailleeDefinitionDerivee(e: ExerciceDefinitionDerivee): EtapeCorrection[] {
  const a = e.a;
  const aT = nombreTexte(a);
  const [faEcran, fahEcran] = formatReponseAttendueEcranLatex(e, "developper");
  const etapes: EtapeCorrection[] = [
    utilise("a", [
      t(`On remplace x par ${aT} dans f(x) pour obtenir f(${aT}), puis par `),
      f(`${a}+h`),
      t(` pour obtenir f(${aT} + h), qu'on développe et réduit ${COURS_DEFINITION}.`),
    ]),
    calcul("a", lignesFA(e), [], `f(${aT})`),
    calcul("a", lignesFAH(e), [], `f(${aT} + h)`),
    resultat("a", [f(faEcran.replace(/\\,;$/, "")), t(" et "), f(fahEcran)]),
  ];
  const forme = formeRationnelle(e);
  if (e.famille !== "affine") {
    const l = lettreEcranDefinitionDerivee(e, "quotient");
    etapes.push(
      utilise(l, [
        t("Taux d'accroissement : on calcule "),
        f(`f(${a}+h)-f(${a})`),
        t(forme ? ", mis au même dénominateur, on met h en évidence au numérateur, puis on divise par h " : ", on met h en évidence, puis on divise par h "),
        t(`${COURS_DEFINITION}.`),
      ]),
      calcul(l, e.famille === "quadratique" ? lignesQuotientQuadratique(e) : lignesQuotientRationnel(e, forme!)),
      resultat(l, [f(formatReponseAttendueEcranLatex(e, "quotient")[0])]),
    );
  }
  const lL = lettreEcranDefinitionDerivee(e, "limite");
  etapes.push(
    utilise(lL, [
      f(`f'(${a})=\\lim\\limits_{h\\to 0}\\dfrac{f(${a}+h)-f(${a})}{h}`),
      t(e.famille === "affine" ? ` : on simplifie le taux par h, puis on passe à la limite ${COURS_DEFINITION}.` : ` : le facteur h a été simplifié, on peut remplacer h par 0 ${COURS_DEFINITION}.`),
    ]),
    calcul(lL, lignesLimite(e)),
    resultat(lL, [f(formatReponseAttendueEcranLatex(e, "limite")[0])]),
    verification(lL, [t(`Avec les règles de dérivation ${COURS_DERIVEE}, on retrouve la même valeur :`)], lignesVerification(e)),
  );
  // Piège sous l'étape qu'il concerne.
  const p = piegeEtape(e);
  const ordre = (x: EtapeCorrection) => LETTRES.indexOf(x.sousQuestion ?? "a");
  const pos = etapes.reduce((dernier, x, i) => (ordre(x) <= ordre(p) ? i : dernier), -1);
  etapes.splice(pos + 1, 0, p);
  return finaliser(etapes);
}
