import type {
  Decomposition,
  ExerciceChangementBaseLog,
  ExerciceComparerEncadrerLog,
  ExerciceComparerLog,
  NombreARanger,
  Rationnel,
  TermeLog,
  TexteAvecLatex,
} from "../core6e/comparerEncadrerLogarithmes.types";
import { MILLIEMES, valeurDecomposition } from "../core6e/comparerEncadrerLogarithmesCalcul";
import type { PhaseChampsComparerEncadrerLog, PhaseChoixComparerEncadrerLog, PhaseComparerEncadrerLog } from "../moteur6e/typesComparerEncadrerLogarithmes";
import { cibles, optionCorrecte } from "../moteur6e/verificationComparerEncadrerLogarithmes";

/**
 * Couche C (6e) — textes de `6gen86` « Comparer et encadrer des logarithmes sans calculatrice ».
 * SOURCE UNIQUE des consignes, options, aides et réponses attendues : l'écran, le récapitulatif et
 * l'adaptateur de feuilles (`generateurs6e/comparerEncadrerLogarithmes/exportEvaluation.ts`) en
 * dérivent.
 *
 * Notations du cours (chapitre 3) : logₐ(x) avec parenthèses, log = logarithme décimal, ln ;
 * « − » typographique, virgule décimale `{,}`, aucune formule au clavier, aides sans la réponse.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface ChampDef {
  /** Libellé du champ, en LaTeX (ex. « 2^{k}= », « \log(12)\approx »). */
  labelLatex: string;
  placeholder: string;
}

export type AideAvecLatex = TexteAvecLatex;

export interface OptionChoix {
  id: string;
  fragments: FragmentConsigne[];
}

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const INTERVALLES_VOISINS = "\\mathopen{]}n\\,;\\,n+1\\mathclose{[}\\qquad\\mathopen{]}n+1\\,;\\,n+2\\mathclose{[}";
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ============================================================================
// Écritures.
// ============================================================================

/** Entier en LaTeX : « −12 », « 4\,573 » (espace fine des milliers). */
export function entierLatex(n: number): string {
  const s = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\\,");
  return n < 0 ? `-${s}` : s;
}

/** Entier en texte : « 7 544 » (espace fine insécable des milliers). */
export function entierTexte(n: number): string {
  const s = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
  return n < 0 ? `−${s}` : s;
}

/** Symbole du logarithme de base entière a : « \\log » pour 10, « \\log_{2} » sinon. */
export function symboleLogBase(a: number): string {
  return a === 10 ? "\\log" : `\\log_{${a}}`;
}

/** Rationnel positif : « 12 », « \dfrac{3}{2} ». */
export function ratLatex(r: Rationnel): string {
  return r.den === 1 ? entierLatex(r.num) : `\\dfrac{${entierLatex(r.num)}}{${entierLatex(r.den)}}`;
}

/** Base en indice : « 2 », « 1/2 » (comme le cours : log_{1/2}(8)). */
function indiceBase(b: Rationnel): string {
  return b.den === 1 ? `${b.num}` : `${b.num}/${b.den}`;
}

/** Argument entre parenthèses (« (12) », « \left(\dfrac{1}{5}\right) »). */
function argumentLatex(r: Rationnel): string {
  return r.den === 1 ? `(${entierLatex(r.num)})` : `\\left(${ratLatex(r)}\\right)`;
}

/** log_b(x) ; base 10 → log(x) (logarithme décimal). */
export function logLatex(base: Rationnel, argument: Rationnel): string {
  if (base.den === 1 && base.num === 10) return `\\log${argumentLatex(argument)}`;
  return `\\log_{${indiceBase(base)}}${argumentLatex(argument)}`;
}

export function termeLatex(te: TermeLog): string {
  return logLatex(te.base, te.argument);
}

/** Base comme facteur d'une puissance : « 2 », « \left(\dfrac{1}{2}\right) ». */
function basePuissance(b: Rationnel): string {
  return b.den === 1 ? `${b.num}` : `\\left(${ratLatex(b)}\\right)`;
}

/** bʲ (rationnel), exposant entier relatif. */
function puissanceRat(b: Rationnel, j: number): Rationnel {
  const num = Math.pow(j >= 0 ? b.num : b.den, Math.abs(j));
  const den = Math.pow(j >= 0 ? b.den : b.num, Math.abs(j));
  return { num, den };
}

function puissanceLatex(b: Rationnel, j: number): string {
  return `${basePuissance(b)}^{${j}}`;
}

/** Les deux puissances de la base qui encadrent l'argument, rangées par valeur croissante. */
function puissancesEncadrantes(te: TermeLog): [number, number] {
  const croissante = te.base.num > te.base.den;
  return croissante ? [te.plancher, te.plancher + 1] : [te.plancher + 1, te.plancher];
}

/** « 2^{3}=8<10<16=2^{4} » (ou bases < 1 : « (1/2)^{-3}=8<10<16=(1/2)^{-4} »). */
export function encadrementPuissancesLatex(te: TermeLog): string {
  const [jg, jd] = puissancesEncadrantes(te);
  return `${puissanceLatex(te.base, jg)}=${ratLatex(puissanceRat(te.base, jg))}<${ratLatex(te.argument)}<${ratLatex(puissanceRat(te.base, jd))}=${puissanceLatex(te.base, jd)}`;
}

/** « 3<\log_2(10)<4 ». */
export function encadrementEntierLatex(te: TermeLog): string {
  return `${entierLatex(te.plancher)}<${termeLatex(te)}<${entierLatex(te.plancher + 1)}`;
}

export function estBaseInf1(te: TermeLog): boolean {
  return te.base.num < te.base.den;
}

/** Décimal en LaTeX à partir de millièmes : « 1{,}079 », « -0{,}176 ». */
export function milliemesLatex(m: number): string {
  const s = (Math.abs(m) / 1000).toFixed(3).replace(".", "{,}");
  return m < 0 ? `-${s}` : s;
}

export function centiemesLatex(c: number): string {
  const s = (Math.abs(c) / 100).toFixed(2).replace(".", "{,}");
  return c < 0 ? `-${s}` : s;
}

function nombreRangerLatex(n: NombreARanger): string {
  if (n.type === "log") return termeLatex(n.terme);
  return `${n.negatif ? "-" : ""}${ratLatex(n.valeur)}`;
}

export function nombresRangerLatex(e: ExerciceComparerEncadrerLog): string[] {
  return e.variante === "ranger" ? e.nombres.map(nombreRangerLatex) : [];
}

// ============================================================================
// Changement de base : écritures.
// ============================================================================

function symboleLog(e: ExerciceChangementBaseLog): string {
  return e.mode === "log" ? "\\log" : "\\ln";
}

export function cibleChangementBase(e: ExerciceChangementBaseLog): string {
  return logLatex(valeurDecomposition(e.a), valeurDecomposition(e.N));
}

/** log(N) ou ln(N). */
export function logDonneLatex(e: ExerciceChangementBaseLog, d: Decomposition): string {
  return `${symboleLog(e)}${argumentLatex(valeurDecomposition(d))}`;
}

export function valeursDonneesLatex(e: ExerciceChangementBaseLog): string {
  const s = symboleLog(e);
  const m = MILLIEMES[e.mode];
  return `${s}(2)\\approx ${milliemesLatex(m.deux)}\\qquad ${s}(3)\\approx ${milliemesLatex(m.trois)}`;
}

/** « 2\log(2)+\log(3)-\log(5) » (développement de log(2^p 3^q 5^r)). */
export function developpementLatex(e: ExerciceChangementBaseLog, d: Decomposition): string {
  const s = symboleLog(e);
  const morceaux: string[] = [];
  for (const [coef, facteur] of [
    [d.p, 2],
    [d.q, 3],
    [d.r, 5],
  ] as const) {
    if (coef === 0) continue;
    const abs = Math.abs(coef);
    const terme = `${abs === 1 ? "" : abs}${s}(${facteur})`;
    morceaux.push(morceaux.length === 0 ? (coef < 0 ? `-${terme}` : terme) : `${coef < 0 ? "-" : "+"}${terme}`);
  }
  return morceaux.join("");
}

/** Le développement contient-il log 5 (à remplacer par 1 − log 2) ? */
function utiliseCinq(e: ExerciceChangementBaseLog): boolean {
  return e.N.r !== 0 || e.a.r !== 0;
}

/** Écritures de l'écran « formule » : 0 = correcte, 1 = inversée, 2 = différence, 3 = log du quotient. */
function formuleLatex(e: ExerciceChangementBaseLog, id: number): string {
  const s = symboleLog(e);
  const aN = argumentLatex(valeurDecomposition(e.N));
  const aA = argumentLatex(valeurDecomposition(e.a));
  const N = ratLatex(valeurDecomposition(e.N));
  const A = ratLatex(valeurDecomposition(e.a));
  switch (id) {
    case 0:
      return `\\dfrac{${s}${aN}}{${s}${aA}}`;
    case 1:
      return `\\dfrac{${s}${aA}}{${s}${aN}}`;
    case 2:
      return `${s}${aN}-${s}${aA}`;
    default:
      return `${s}\\left(\\dfrac{${N.replace(/\\dfrac/g, "\\frac")}}{${A}}\\right)`;
  }
}

// ============================================================================
// Consigne générale et données.
// ============================================================================

export function consigneGenerale(e: ExerciceComparerEncadrerLog): FragmentConsigne[] {
  switch (e.variante) {
    case "encadrer":
      return [t("Sans calculatrice, encadre "), l(logLatex({ num: e.a, den: 1 }, { num: e.N, den: 1 })), t(` entre deux entiers consécutifs, à l'aide des puissances de ${e.a}.`)];
    case "comparer":
      return [t("Sans calculatrice, compare les nombres "), l("A"), t(" et "), l("B"), t(" ci-dessous, en les encadrant chacun entre deux entiers consécutifs (puis, si cela ne suffit pas, par un changement de base).")];
    case "ranger":
      return [t("Sans calculatrice, range ces quatre nombres dans l'ordre croissant, en encadrant d'abord chaque logarithme entre deux entiers consécutifs.")];
    case "changementBase":
      return [
        t("On donne les valeurs approchées ci-dessous. Sans calculatrice, calcule une valeur approchée de "),
        l(cibleChangementBase(e)),
        t(", arrondie au centième, à l'aide des propriétés du logarithme et du changement de base."),
      ];
  }
}

export function blocDonnees(e: ExerciceComparerEncadrerLog): string[] {
  switch (e.variante) {
    case "encadrer":
      return [logLatex({ num: e.a, den: 1 }, { num: e.N, den: 1 })];
    case "comparer":
      return [`A=${termeLatex(e.A)}\\qquad B=${termeLatex(e.B)}`];
    case "ranger": {
      const n = nombresRangerLatex(e);
      return [`${n[0]}\\qquad ${n[1]}`, `${n[2]}\\qquad ${n[3]}`];
    }
    case "changementBase":
      return [valeursDonneesLatex(e), cibleChangementBase(e)];
  }
}

// ============================================================================
// Écrans.
// ============================================================================

export function libellePhase(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog): string {
  switch (phase) {
    case "puissances":
      return "Puissances qui encadrent le nombre";
    case "encadrement":
      return "Encadrement du logarithme";
    case "encadrerA":
      return "Encadrement de A";
    case "encadrerB":
      return "Encadrement de B";
    case "verdict":
      return "Comparaison de A et B";
    case "situer":
      return "Encadrement des logarithmes";
    case "ordre":
      return "Ordre croissant";
    case "formule":
      return "Changement de base";
    case "valeurs":
      return e.variante === "changementBase" && e.mode === "ln" ? "Valeurs approchées des ln" : "Valeurs approchées des log";
    case "quotient":
      return "Valeur approchée du logarithme";
  }
}

export function consigneEcran(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog): FragmentConsigne[] {
  switch (phase) {
    case "puissances":
      if (e.variante !== "encadrer") return [];
      return [
        t(`Trouve les deux puissances consécutives de ${e.a}, d'exposants entiers, qui encadrent ${entierTexte(e.N)} : `),
        l(`${e.a}^{k}<${entierLatex(e.N)}<${e.a}^{k+1}`),
        t(". Donne leurs valeurs."),
      ];
    case "encadrement":
      if (e.variante !== "encadrer") return [];
      return [t("Déduis-en les deux entiers consécutifs qui encadrent "), l(logLatex({ num: e.a, den: 1 }, { num: e.N, den: 1 })), t(".")];
    case "encadrerA":
    case "encadrerB": {
      const nom = phase === "encadrerA" ? "A" : "B";
      return [t("Encadre "), l(nom), t(" entre deux entiers consécutifs : "), l(`n<${nom}<n+1`), t(".")];
    }
    case "verdict":
      return [t("Compare "), l("A"), t(" et "), l("B"), t(" (une seule réponse possible).")];
    case "situer":
      return [t("Pour chaque logarithme, donne l'entier "), l("n"), t(" situé juste en dessous : "), l("n<\\ldots<n+1"), t(".")];
    case "ordre":
      return [t("Touche les quatre nombres du plus petit au plus grand (une seule tentative ; « Effacer » recommence avant de valider).")];
    case "formule":
      if (e.variante !== "changementBase") return [];
      return [t(`Par le changement de base (en base ${e.mode === "log" ? "10" : "e"}), `), l(cibleChangementBase(e)), t(" s'écrit (une seule réponse possible) :")];
    case "valeurs":
      if (e.variante !== "changementBase") return [];
      return [
        t("À l'aide des propriétés du logarithme et des valeurs données, calcule une valeur approchée de "),
        l(logDonneLatex(e, e.N)),
        t(" et de "),
        l(logDonneLatex(e, e.a)),
        t(" (à 0,001 près)."),
      ];
    case "quotient":
      if (e.variante !== "changementBase") return [];
      return [t("Déduis-en une valeur approchée de "), l(cibleChangementBase(e)), t(", arrondie au centième.")];
  }
}

export function champsEcran(e: ExerciceComparerEncadrerLog, phase: PhaseChampsComparerEncadrerLog): ChampDef[] {
  switch (phase) {
    case "puissances":
      return e.variante === "encadrer"
        ? [
            { labelLatex: `${e.a}^{k}=`, placeholder: "ex. 32" },
            { labelLatex: `${e.a}^{k+1}=`, placeholder: "ex. 64" },
          ]
        : [];
    case "encadrement":
      return [
        { labelLatex: "k=", placeholder: "ex. 5" },
        { labelLatex: "k+1=", placeholder: "ex. 6" },
      ];
    case "encadrerA":
    case "encadrerB":
      return [
        { labelLatex: "n=", placeholder: "ex. −3" },
        { labelLatex: "n+1=", placeholder: "ex. −2" },
      ];
    case "situer":
      return e.variante === "ranger" ? e.nombres.flatMap((n) => (n.type === "log" ? [{ labelLatex: `${termeLatex(n.terme)}\\ :\\ n=`, placeholder: "ex. −2" }] : [])) : [];
    case "valeurs":
      return e.variante === "changementBase"
        ? [
            { labelLatex: `${logDonneLatex(e, e.N)}\\approx`, placeholder: "ex. 1,079" },
            { labelLatex: `${logDonneLatex(e, e.a)}\\approx`, placeholder: "ex. 0,778" },
          ]
        : [];
    case "quotient":
      return e.variante === "changementBase" ? [{ labelLatex: `${cibleChangementBase(e)}\\approx`, placeholder: "ex. 1,39" }] : [];
  }
}

// ============================================================================
// Options des écrans à choix fermé.
// ============================================================================

export function optionsEcran(e: ExerciceComparerEncadrerLog, phase: PhaseChoixComparerEncadrerLog): OptionChoix[] {
  switch (phase) {
    case "verdict":
      return [
        { id: "<", fragments: [l("A<B")] },
        { id: ">", fragments: [l("A>B")] },
        { id: "=", fragments: [l("A=B")] },
      ];
    case "formule":
      if (e.variante !== "changementBase") return [];
      return e.ordreFormules.map((id) => ({ id: `${id}`, fragments: [l(`${cibleChangementBase(e)}=${formuleLatex(e, id)}`)] }));
    case "ordre":
      // Les « options » d'un écran d'ordre : les quatre nombres, dans l'ordre d'affichage.
      return nombresRangerLatex(e).map((x, i) => ({ id: `${i}`, fragments: [l(x)] }));
  }
}

/** Fragments d'une réponse à choix (pour `ordre` : « a < b < c < d » dans l'ordre choisi). */
export function fragmentsReponseChoix(e: ExerciceComparerEncadrerLog, phase: PhaseChoixComparerEncadrerLog, id: string | null | undefined): FragmentConsigne[] {
  if (phase === "ordre") {
    const n = nombresRangerLatex(e);
    const indices = (id ?? "").split(",").filter((x) => x !== "").map(Number);
    return indices.length === 0 ? [] : [l(indices.map((i) => n[i]).join("<"))];
  }
  return optionsEcran(e, phase).find((o) => o.id === id)?.fragments ?? [];
}

/** Option correcte d'un écran à choix (fragments). */
export function optionCorrecteFragments(e: ExerciceComparerEncadrerLog, phase: PhaseChoixComparerEncadrerLog): FragmentConsigne[] {
  if (phase === "verdict" && e.variante === "comparer") {
    return [l(`${termeLatex(e.A)}${e.verdict}${termeLatex(e.B)}`), t(", soit "), l(`A${e.verdict}B`)];
  }
  return fragmentsReponseChoix(e, phase, optionCorrecte(e, phase));
}

// ============================================================================
// Réponses attendues (LaTeX), écrans à champs.
// ============================================================================

export function formatReponseAttendueLatex(e: ExerciceComparerEncadrerLog, phase: PhaseChampsComparerEncadrerLog): string[] {
  switch (phase) {
    case "puissances":
      if (e.variante !== "encadrer") return [];
      return [`${e.a}^{${e.k}}=${entierLatex(Math.pow(e.a, e.k))}<${entierLatex(e.N)}<${entierLatex(Math.pow(e.a, e.k + 1))}=${e.a}^{${e.k + 1}}`];
    case "encadrement":
      if (e.variante !== "encadrer") return [];
      return [`${e.k}<${logLatex({ num: e.a, den: 1 }, { num: e.N, den: 1 })}<${e.k + 1}`];
    case "encadrerA":
      return e.variante === "comparer" ? [encadrementEntierLatex(e.A)] : [];
    case "encadrerB":
      return e.variante === "comparer" ? [encadrementEntierLatex(e.B)] : [];
    case "situer":
      return e.variante === "ranger" ? e.nombres.flatMap((n) => (n.type === "log" ? [encadrementEntierLatex(n.terme)] : [])) : [];
    case "valeurs": {
      if (e.variante !== "changementBase") return [];
      const [vN, vA] = cibles(e, phase);
      return [
        `${logDonneLatex(e, e.N)}=${developpementLatex(e, e.N)}\\approx ${milliemesLatex(Math.round(vN * 1000))}`,
        `${logDonneLatex(e, e.a)}=${developpementLatex(e, e.a)}\\approx ${milliemesLatex(Math.round(vA * 1000))}`,
      ];
    }
    case "quotient":
      if (e.variante !== "changementBase") return [];
      return [`${cibleChangementBase(e)}\\approx\\dfrac{${milliemesLatex(e.logNMilli)}}{${milliemesLatex(e.logAMilli)}}\\approx ${centiemesLatex(e.resultatCentiemes)}`];
  }
}

// ============================================================================
// Aides (jamais la réponse).
// ============================================================================

function aideEncadrementTerme(te: TermeLog, niveau: 1 | 2): AideAvecLatex {
  const b = te.base;
  if (!estBaseInf1(te)) {
    if (niveau === 1) {
      return te.argument.den === 1
        ? { texte: `Cherche deux puissances consécutives de ${b.num} qui encadrent ${te.argument.num} :`, latex: `${b.num}^{j}<${entierLatex(te.argument.num)}<${b.num}^{j+1}` }
        : { texte: `L'argument est inférieur à 1 : cherche deux puissances de ${b.num} d'exposants négatifs qui l'encadrent, par exemple :`, latex: `${b.num}^{-2}=\\dfrac{1}{${b.num * b.num}}` };
    }
    return { texte: `Applique ensuite ${b.num === 10 ? "log" : `log de base ${b.num}`}, strictement croissante, aux trois membres, et la propriété (P3) :`, latex: `${b.num === 10 ? "\\log" : `\\log_{${indiceBase(b)}}`}\\left(${b.num}^{j}\\right)=j` };
  }
  const B = b.den;
  if (niveau === 1) {
    return {
      texte: `La base est inférieure à 1. Les puissances d'exposants négatifs de 1/${B} sont les puissances de ${B} :`,
      latex: `\\left(\\dfrac{1}{${B}}\\right)^{-j}=${B}^{j}`,
    };
  }
  return {
    texte: `Le logarithme de base 1/${B} est strictement DÉCROISSANT : en l'appliquant à un encadrement, les inégalités changent de sens.`,
    latex: `\\left(\\dfrac{1}{${B}}\\right)^{-j}<x<\\left(\\dfrac{1}{${B}}\\right)^{-j-1}\\ \\Rightarrow\\ -j-1<\\log_{1/${B}}(x)<-j`,
  };
}

function aideVerdict(e: ExerciceComparerLog, niveau: 1 | 2): AideAvecLatex {
  if (niveau === 1) {
    return {
      texte: "Si les deux encadrements ne se chevauchent pas, ils suffisent pour conclure. S'ils sont identiques, ramène les deux logarithmes à une même base par le changement de base :",
      latex: "\\log_{c^n}(x)=\\dfrac{\\log_c(x)}{\\log_c(c^n)}=\\dfrac{\\log_c(x)}{n}",
    };
  }
  if (e.type === "separes") return { texte: "Compare les deux intervalles trouvés : tout nombre du premier intervalle ci-dessous est plus petit que tout nombre du second :", latex: INTERVALLES_VOISINS };
  const lien = e.lien!;
  const c = lien.c;
  const sens = c.num < c.den ? "décroissant (base inférieure à 1)" : "croissant";
  if (lien.n === 1) return { texte: `Même base : compare les arguments, en tenant compte du sens de variation de ce logarithme, ${sens}.` };
  return {
    texte: `Le nombre de base ${indiceBase(puissanceRat(c, lien.n))} vaut le logarithme de base ${indiceBase(c)} de son argument, divisé par ${lien.n} ; écris l'autre de la même façon, puis compare les arguments, en tenant compte du sens de variation (logarithme ${sens}) :`,
    latex: `${logLatex(c, { num: lien.y, den: 1 })}=\\dfrac{${lien.n}\\,${logLatex(c, { num: lien.y, den: 1 })}}{${lien.n}}=\\dfrac{${logLatex(c, { num: Math.pow(lien.y, lien.n), den: 1 })}}{${lien.n}}`,
  };
}

export function aideNiveau1(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog): AideAvecLatex {
  switch (phase) {
    case "puissances":
      return e.variante === "encadrer" ? { texte: `On cherche l'exposant entier k tel que :`, latex: `${e.a}^{k}<${entierLatex(e.N)}<${e.a}^{k+1}` } : { texte: "" };
    case "encadrement":
      return e.variante === "encadrer"
        ? { texte: `La base ${e.a} est supérieure à 1 : ce logarithme est strictement croissant. Applique-le aux trois membres de l'encadrement :`, latex: `${symboleLogBase(e.a)}\\left(${e.a}^{k}\\right)<${logLatex({ num: e.a, den: 1 }, { num: e.N, den: 1 })}<${symboleLogBase(e.a)}\\left(${e.a}^{k+1}\\right)` }
        : { texte: "" };
    case "encadrerA":
      return e.variante === "comparer" ? aideEncadrementTerme(e.A, 1) : { texte: "" };
    case "encadrerB":
      return e.variante === "comparer" ? aideEncadrementTerme(e.B, 1) : { texte: "" };
    case "verdict":
      return e.variante === "comparer" ? aideVerdict(e, 1) : { texte: "" };
    case "situer":
      return { texte: "Pour chaque logarithme, encadre son argument entre deux puissances consécutives de la base :", latex: "b^{n}<x<b^{n+1}\\ \\Rightarrow\\ n<\\log_b(x)<n+1\\quad(b>1)" };
    case "ordre":
      return { texte: "Place chaque logarithme dans son intervalle trouvé à l'étape précédente, puis situe l'entier ou la fraction parmi ces intervalles. Tout nombre du premier intervalle ci-dessous est plus petit que tout nombre du second :", latex: INTERVALLES_VOISINS };
    case "formule":
      return e.variante === "changementBase" ? { texte: "Changement de base, pour toute base b > 0, b ≠ 1 :", latex: "\\log_a(x)=\\dfrac{\\log_b(x)}{\\log_b(a)}" } : { texte: "" };
    case "valeurs":
      return e.variante === "changementBase"
        ? { texte: "Écris chaque nombre comme un produit (ou un quotient) de puissances de 2 et de 3, puis applique les propriétés :", latex: `${symboleLog(e)}(xy)=${symboleLog(e)}(x)+${symboleLog(e)}(y)\\qquad ${symboleLog(e)}\\left(x^{r}\\right)=r\\,${symboleLog(e)}(x)` }
        : { texte: "" };
    case "quotient":
      return e.variante === "changementBase" ? { texte: "Remplace chaque logarithme par sa valeur approchée dans le changement de base :", latex: `${cibleChangementBase(e)}=\\dfrac{${logDonneLatex(e, e.N)}}{${logDonneLatex(e, e.a)}}` } : { texte: "" };
  }
}

export function aideNiveau2(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog): AideAvecLatex {
  switch (phase) {
    case "puissances": {
      if (e.variante !== "encadrer") return { texte: "" };
      const liste = Array.from({ length: e.k + 2 }, (_, i) => `${e.a}^{${i + 1}}=${entierLatex(Math.pow(e.a, i + 1))}`).join(",\\ ");
      return { texte: `Écris les premières puissances de ${e.a} et situe ${entierTexte(e.N)} parmi elles :`, latex: liste };
    }
    case "encadrement":
      return { texte: "Simplifie chaque membre à l'aide de la propriété (P3) :", latex: "\\log_a\\left(a^{r}\\right)=r" };
    case "encadrerA":
      return e.variante === "comparer" ? aideEncadrementTerme(e.A, 2) : { texte: "" };
    case "encadrerB":
      return e.variante === "comparer" ? aideEncadrementTerme(e.B, 2) : { texte: "" };
    case "verdict":
      return e.variante === "comparer" ? aideVerdict(e, 2) : { texte: "" };
    case "situer":
      return { texte: "Si la base est inférieure à 1, le logarithme est décroissant (l'encadrement change de sens) ; si l'argument est inférieur à 1, utilise des exposants négatifs :", latex: "2^{-3}=\\dfrac{1}{8}\\qquad\\left(\\dfrac{1}{3}\\right)^{-2}=9" };
    case "ordre":
      return { texte: "Un entier n est plus petit que tous les nombres de l'intervalle qui commence en n ; une fraction se situe en l'écrivant sous forme décimale, par exemple :", latex: "\\dfrac{7}{2}=3{,}5\\in\\,\\mathopen{]}3\\,;\\,4\\mathclose{[}" };
    case "formule":
      return e.variante === "changementBase" ? { texte: `Ici, la base b vaut ${e.mode === "log" ? "10" : "e"} : le logarithme de l'argument va au numérateur, celui de la base au dénominateur.` } : { texte: "" };
    case "valeurs":
      if (e.variante !== "changementBase") return { texte: "" };
      return utiliseCinq(e)
        ? { texte: "Pour log(5), pense à 5 = 10/2 :", latex: "\\log(5)=\\log(10)-\\log(2)=1-\\log(2)" }
        : { texte: "Par exemple, pour un quotient :", latex: `${symboleLog(e)}\\left(\\dfrac{x}{y}\\right)=${symboleLog(e)}(x)-${symboleLog(e)}(y)` };
    case "quotient":
      return { texte: "Effectue la division (à la main), puis arrondis au centième : regarde le chiffre des millièmes." };
  }
}
