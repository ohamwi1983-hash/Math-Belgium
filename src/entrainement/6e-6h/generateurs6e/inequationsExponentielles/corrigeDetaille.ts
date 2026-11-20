import type { BaseIneq, Comparateur, DirectionSigne, ExerciceIneqA, ExerciceIneqB, ExerciceIneqCf, ExerciceIneqCk, ExerciceIneqDConstant, ExerciceIneqDVariable, ExerciceIneqE, ExerciceInequationExponentielle, FacteurUnZero } from "../../core6e/inequationsExponentielles.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { phaseApres, phaseInitiale, type PhaseInequationExponentielle } from "../../moteur6e/typesInequationsExponentielles";
import {
  baseLatex,
  baseLatexPourExposant,
  contenuRecapPhase,
  formatEnonceLatex,
  formatExposantLineaireLatex,
  formatFacteurUnZeroLatex,
  formatGCkLatex,
  formatMembreGaucheB,
  formatPremierFacteurLatex,
  formatSecondFacteurConstantLatex,
  formatValeurExacteLatex,
  formatXMoinsZero,
  texteSensLisible,
} from "../../ui6e/formatInequationsExponentielles";
import { formatEnsembleReelLatex } from "../../ui6e/formatEnsembleReel";
import { tableauSignesLatex, type CelluleSigne } from "../../../4e/generateurs/signesProduit/tableauSignesLatex";
import { COURS_INEQUATIONS, finaliserCorrige, inverser, justif, lignesInequationAffine, q, qL, sym, symTexte } from "../../ui6e/corrigeExponentielles2";
import type { Q } from "../../ui6e/corrigeExponentielles2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen10` (inéquations exponentielles) — règle
 * `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : importé par l'adaptateur papier
 * (`exportEvaluation.ts`) ET par l'appli (`App6gen10.tsx`, corrigé d'une étape échouée). Une étape
 * (lettre) = un écran réellement traversé (`phasesInequationExpo`, même parcours que la session).
 * Résultats = réponses de l'écran (`contenuRecapPhase`, ensembles de l'instance) ; les puissances,
 * exposants et bornes sont recalculés en rationnels exacts depuis les paramètres tirés, une
 * transformation par ligne (sens conservé / inversé écrit à chaque passage aux exposants et à
 * chaque division par un négatif).
 */

/** Étapes du corrigé papier : les écrans réellement traversés, sans l'écran de verdict
 * « existence » des familles A, C-k, D et E (son corrigé à l'écran : `etapesExistenceIneqExpo`). */
export function phasesInequationExpo(exercice: ExerciceInequationExponentielle): PhaseInequationExponentielle[] {
  const phases: PhaseInequationExponentielle[] = [];
  let phase: PhaseInequationExponentielle | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    if (phase !== "existence") phases.push(phase);
    phase = phaseApres(phase, exercice);
  }
  return phases;
}

/** Corrigé de l'écran « existence » (A, C-k, D, E), lettre « a » : pourquoi le signe ne suffit pas. */
export function etapesExistenceIneqExpo(exercice: ExerciceInequationExponentielle): EtapeCorrection[] {
  const raison =
    exercice.famille === "A"
      ? "Les deux membres sont strictement positifs : comparer leurs signes ne suffit pas, il faut comparer les exposants."
      : exercice.famille === "C"
        ? "Les deux membres sont des exponentielles strictement positives : il faut les comparer après regroupement."
        : exercice.famille === "D"
          ? "Le premier membre est un produit dont un facteur peut changer de signe : il faut étudier son signe."
          : "Les deux membres sont des exponentielles strictement positives : il faut les comparer après regroupement.";
  return [
    utilise("a", [texte("Une exponentielle de base positive est toujours strictement positive "), texte(`${COURS_INEQUATIONS}.`)]),
    resultat("a", [texte(raison)]),
  ];
}

const ens = formatEnsembleReelLatex;
const PLUS_UN = "sens conservé";

/** Rationnel de la base (`e` exclu). */
function baseQ(b: BaseIneq): Q {
  return q(b.num, b.den);
}

/** Puissance entière exacte d'un rationnel. */
function puissanceQ(b: Q, e: number): Q {
  let r = q(1);
  const k = Math.abs(e);
  for (let i = 0; i < k; i++) r = q(r.n * b.n, r.d * b.d);
  return e < 0 ? q(r.d, r.n) : r;
}

/** Valeur exacte affichée comme dans l'énoncé (entier, décimal fini ou fraction). */
function valeurL(v: Q): string {
  return formatValeurExacteLatex({ num: v.n, den: v.d });
}

/** « 2\times 2\times 2 » (produit de p facteurs égaux). */
function produitFacteurs(b: number, p: number): string {
  return Array.from({ length: p }, () => String(b)).join("\\times ");
}

function justifSens(baseL: string, superieure: boolean): FragmentConsigne[] {
  return superieure ? justif("base ", { l: `${baseL}>1` }, ` : ${PLUS_UN}`) : justif("base ", { l: `0<${baseL}<1` }, " : sens inversé");
}

function utiliseSens(baseL: string, superieure: boolean, avant: string): FragmentConsigne[] {
  return [
    texte(avant),
    texte("Base "),
    latex(superieure ? `${baseL}>1` : `0<${baseL}<1`),
    texte(superieure ? " : l'exponentielle est croissante, le sens de l'inégalité est conservé" : " : l'exponentielle est décroissante, le sens de l'inégalité est inversé"),
    texte(` ${COURS_INEQUATIONS}.`),
  ];
}

/** Lignes « V = base^p » : le second membre réécrit comme une puissance de la base, une étape par ligne. */
function lignesPuissance(base: BaseIneq, p: number, V: Q): LigneCalcul[] {
  const VL = valeurL(V);
  const bL = baseLatexPourExposant(base);
  const lignes: LigneCalcul[] = [];
  const pousser = (l: string, j?: string | FragmentConsigne[]) => lignes.push(ligne(lignes.length === 0 ? `${VL}=${l}` : `=${l}`, j));
  if (V.d !== 1 && VL.includes("{,}")) pousser(`\\dfrac{${V.n}}{${V.d}}`, "décimal écrit en fraction");
  const { n: num, d: den } = baseQ(base);
  if (p === 0) {
    pousser(`${bL}^{0}`, justif("", { l: "a^{0}=1" }));
    return lignes;
  }
  if (p === 1) {
    pousser(`${bL}^{1}`, justif("", { l: "a^{1}=a" }));
    return lignes;
  }
  const k = Math.abs(p);
  if (den === 1) {
    if (p > 0) {
      pousser(`${num}^{${p}}`, justif("car ", { l: `${produitFacteurs(num, p)}=${Math.pow(num, p)}` }));
    } else {
      if (k === 1) {
        pousser(`${num}^{-1}`, justif("", { l: "\\dfrac{1}{a}=a^{-1}" }));
        return lignes;
      }
      pousser(`\\dfrac{1}{${num}^{${k}}}`, justif("car ", { l: `${num}^{${k}}=${Math.pow(num, k)}` }));
      pousser(`${num}^{${p}}`, justif("", { l: "\\dfrac{1}{a^{n}}=a^{-n}" }));
    }
    return lignes;
  }
  if (p > 0) {
    if (num === 1) pousser(`\\dfrac{1}{${den}^{${p}}}`, justif("car ", { l: `${den}^{${p}}=${Math.pow(den, p)}` }));
    else pousser(`\\dfrac{${num}^{${p}}}{${den}^{${p}}}`, justif("car ", { l: `${num}^{${p}}=${Math.pow(num, p)}` }, " et ", { l: `${den}^{${p}}=${Math.pow(den, p)}` }));
    pousser(`${bL}^{${p}}`, justif("", { l: "\\dfrac{a^{n}}{b^{n}}=\\left(\\dfrac{a}{b}\\right)^{n}" }));
    return lignes;
  }
  if (k === 1) {
    pousser(`${bL}^{-1}`, justif("", { l: num === 1 ? "a=\\left(\\dfrac{1}{a}\\right)^{-1}" : "\\dfrac{b}{a}=\\left(\\dfrac{a}{b}\\right)^{-1}" }));
    return lignes;
  }
  if (num === 1) {
    pousser(`${den}^{${k}}`, justif("car ", { l: `${den}^{${k}}=${Math.pow(den, k)}` }));
    pousser(`${bL}^{${p}}`, justif("", { l: "a^{n}=\\left(\\dfrac{1}{a}\\right)^{-n}" }));
    return lignes;
  }
  pousser(`\\dfrac{${den}^{${k}}}{${num}^{${k}}}`, justif("car ", { l: `${den}^{${k}}=${Math.pow(den, k)}` }, " et ", { l: `${num}^{${k}}=${Math.pow(num, k)}` }));
  pousser(`\\left(\\dfrac{${den}}{${num}}\\right)^{${k}}`, justif("", { l: "\\dfrac{a^{n}}{b^{n}}=\\left(\\dfrac{a}{b}\\right)^{n}" }));
  pousser(`${bL}^{${p}}`, justif("", { l: "\\left(\\dfrac{b}{a}\\right)^{n}=\\left(\\dfrac{a}{b}\\right)^{-n}" }));
  return lignes;
}

/** m·x₀ + n écrit avec x₀ remplacé (« 2\cdot 4-3 », « -(-1)+2 »). */
function substitueAffine(m: number, n: number, x0: number): string {
  const xs = x0 < 0 ? `(${x0})` : String(x0);
  const mx = m === 1 ? xs : m === -1 ? `-${xs}` : `${m}\\cdot ${xs}`;
  return n === 0 ? mx : `${mx}${n > 0 ? "+" : "-"}${Math.abs(n)}`;
}

/** Entier strictement à l'intérieur de « x cmp borne », le plus proche de la borne. */
function entierDansS(borne: Q, cmp: Comparateur): number {
  const b = borne.n / borne.d;
  const x0 = cmp === ">" || cmp === ">=" ? Math.floor(b) + 1 : Math.ceil(b) - 1;
  // Jamais x = 0 (« −0 + 1 » à la substitution) : on prend l'entier suivant, toujours dans S.
  return x0 !== 0 ? x0 : cmp === ">" || cmp === ">=" ? 1 : -1;
}

// ---------------------------------------------------------------------------- Famille A

function correctionA(e: ExerciceIneqA): EtapeCorrection[] {
  const bL = baseLatexPourExposant(e.base);
  const bNu = baseLatex(e.base);
  const u = formatExposantLineaireLatex(e.m, e.n);
  const V = q(e.valeurNumerique.num, e.valeurNumerique.den);
  const VL = valeurL(V);
  const cmp2 = e.baseSuperieureA1 ? e.comparateur : inverser(e.comparateur);
  const res = lignesInequationAffine(e.m, e.n, cmp2, q(e.p), false);
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte("On écrit le second membre comme une puissance de la même base "), latex(bNu), texte(` que le premier membre ${COURS_INEQUATIONS}.`)]),
    calcul("a", lignesPuissance(e.base, e.p, V)),
    resultat("a", [texte("Exposant cible : "), latex(contenuRecapPhase(e, "aReconnaitre").latex as string), texte(", car "), latex(`${VL}=${bL}^{${e.p}}`)]),
    utilise("b", utiliseSens(bNu, e.baseSuperieureA1, "Deux puissances de même base : on compare les exposants. ")),
    calcul("b", [
      ligne(`${bL}^{${u}}${sym(e.comparateur)}${VL}`, "inéquation de départ"),
      ligne(`${bL}^{${u}}${sym(e.comparateur)}${bL}^{${e.p}}`, justif("étape 1 : ", { l: `${VL}=${bL}^{${e.p}}` })),
      ligne(`${u}${sym(cmp2)}${e.p}`, justifSens(bNu, e.baseSuperieureA1)),
      ...res.lignes,
      ligne(`S=${ens(e.solutionEcran2)}`, "ensemble des solutions"),
    ]),
    resultat("b", [latex(`S=${ens(e.solutionEcran2)}`)]),
  ];
  const x0 = entierDansS(res.borne, res.cmpFinal);
  const ex = e.m * x0 + e.n;
  if (Math.abs(ex) <= 6) {
    const val = puissanceQ(baseQ(e.base), ex);
    etapes.push(
      verification("b", [texte("On remplace x par "), latex(String(x0)), texte(", qui est dans S :")], [
        ligne(`${bL}^{${substitueAffine(e.m, e.n, x0)}}=${bL}^{${ex}}`, `on calcule l'exposant`),
        ligne(`=${valeurL(val)}`),
        ligne(`${sym(e.comparateur)}${VL}`, "l'inégalité est vraie"),
      ]),
    );
  }
  etapes.push(
    piege(
      "b",
      !e.baseSuperieureA1
        ? [texte("Base comprise entre 0 et 1 : en passant aux exposants, le sens de l'inégalité s'inverse.")]
        : e.m < 0
          ? [texte("Diviser par "), latex(String(e.m)), texte(" (négatif) inverse le sens de l'inégalité.")]
          : [texte("Le sens n'est conservé que parce que la base est supérieure à 1.")],
    ),
  );
  return etapes;
}

// ---------------------------------------------------------------------------- Famille B

function correctionB(e: ExerciceIneqB): EtapeCorrection[] {
  const bL = baseLatexPourExposant(e.base);
  const expo = e.exposantNegatif ? "-x" : "x";
  const gauche = formatMembreGaucheB(e);
  const lignes: LigneCalcul[] = [ligne(`${bL}^{${expo}}>0`, justif("pour tout réel x : la base ", { l: baseLatex(e.base) }, " est strictement positive"))];
  if (e.c !== 1) lignes.push(ligne(`${gauche}>0`, `on multiplie par ${e.c} > 0`));
  lignes.push(ligne(`>${-e.k}`, "un nombre négatif"));
  lignes.push(ligne("S=\\varnothing", justif("le premier membre est toujours supérieur à ", { l: String(-e.k) }, ` : l'inégalité « ${symTexte(e.comparateur)} » n'est jamais vraie`)));
  return [
    utilise("a", [texte(`Une puissance de base strictement positive est strictement positive, quel que soit l'exposant ${COURS_INEQUATIONS}.`)]),
    calcul("a", lignes),
    resultat("a", [latex("S=\\varnothing"), texte(" : aucune solution")]),
    piege("a", [texte("Inutile de « passer au logarithme » : le second membre est négatif, et le logarithme d'un nombre négatif n'existe pas.")]),
  ];
}

// ---------------------------------------------------------------------------- Famille C

function correctionCf(e: ExerciceIneqCf): EtapeCorrection[] {
  const b = baseLatex(e.base);
  const bL = baseLatexPourExposant(e.base);
  const produit = `x\\cdot\\left(${bL}^{x}-1\\right)`;
  return [
    utilise("a", [texte("Signe d'un produit : on étudie séparément le signe de "), latex("x"), texte(" et celui de "), latex(`${bL}^{x}-1`), texte(` (base supérieure à 1) ${COURS_INEQUATIONS}.`)]),
    calcul("a", [
      ligne(`${bL}^{x}>1\\iff x>0`, justif("base ", { l: `${b}>1` }, " : sens conservé, ", { l: `1=${bL}^{0}` })),
      ligne(`${produit}>0`, justif("pour ", { l: "x<0" }, " : deux facteurs négatifs")),
      ligne(`${produit}=0`, justif("pour ", { l: "x=0" }, " : le premier facteur est nul")),
      ligne(`${produit}>0`, justif("pour ", { l: "x>0" }, " : deux facteurs positifs")),
      ligne("S=\\mathbb{R}", justif("le produit est positif ou nul pour tout x et l'inégalité ", { l: "\\geq" }, " est large")),
    ]),
    resultat("a", [latex("S=\\mathbb{R}"), texte(" : l'inéquation est vraie pour tout x réel")]),
    piege("a", [texte("En "), latex("x=0"), texte(", le produit vaut 0 : c'est une solution parce que l'inégalité est large.")]),
  ];
}

function correctionCk(e: ExerciceIneqCk): EtapeCorrection[] {
  const b1 = baseLatex(e.base1);
  const b2 = baseLatex(e.base2);
  const g = formatGCkLatex(e, 1);
  const g2 = formatGCkLatex(e, 2);
  const cmp = e.comparateur;
  const inv = inverser(cmp);
  const rapport = `\\left(\\dfrac{${b1}}{${b2}^{2}}\\right)`;
  const delta = e.b * e.b - 4 * e.a * e.c;
  const bCarre = e.b < 0 ? `(${e.b})^{2}` : `${e.b}^{2}`;
  return [
    utilise("a", [
      texte("On écrit "),
      latex(`${b2}^{2g(x)}=\\left(${b2}^{2}\\right)^{g(x)}`),
      texte(", puis on divise par cette puissance, strictement positive (le sens ne change pas), et "),
      latex("\\dfrac{a^{u}}{b^{u}}=\\left(\\dfrac{a}{b}\\right)^{u}"),
      texte(` ${COURS_INEQUATIONS}.`),
    ]),
    calcul("a", [
      ligne(`${b1}^{${g}}${sym(cmp)}${b2}^{${g2}}`, justif("inéquation de départ, ", { l: `g(x)=${g}` })),
      ligne(`${b1}^{${g}}${sym(cmp)}\\left(${b2}^{2}\\right)^{${g}}`, justif("", { l: "a^{2u}=\\left(a^{2}\\right)^{u}" })),
      ligne(`\\dfrac{${b1}^{${g}}}{\\left(${b2}^{2}\\right)^{${g}}}${sym(cmp)}1`, justif("on divise par ", { l: `\\left(${b2}^{2}\\right)^{g(x)}>0` }, " : sens conservé")),
      ligne(`${rapport}^{${g}}${sym(cmp)}1`, justif("", { l: "\\dfrac{a^{u}}{b^{u}}=\\left(\\dfrac{a}{b}\\right)^{u}" })),
    ]),
    resultat("a", [latex(contenuRecapPhase(e, "ckRegrouper").latex as string)]),
    utilise("b", [
      ...utiliseSens(`\\dfrac{${b1}}{${b2}^{2}}`, false, "On écrit 1 comme une puissance du rapport et on compare les exposants. "),
      texte(" Un trinôme de discriminant négatif garde le signe de son coefficient dominant."),
    ]),
    calcul("b", [
      ligne(`${rapport}^{${g}}${sym(cmp)}${rapport}^{0}`, justif("", { l: "1=a^{0}" })),
      ligne(`${g}${sym(inv)}0`, justif("base ", { l: `0<\\dfrac{${b1}}{${e.base2.num * e.base2.num}}<1` }, " : sens inversé")),
      ligne(`\\Delta=${bCarre}-4\\cdot ${e.a}\\cdot ${e.c}`, "discriminant du trinôme"),
      ligne(`=${e.b * e.b}-${4 * e.a * e.c}`),
      ligne(`=${delta}`, "Δ < 0 : aucune racine"),
      ligne(`${g}>0`, justif("pour tout x : ", { l: "\\Delta<0" }, " et ", { l: `a=${e.a}>0` })),
      ligne("S=\\mathbb{R}", justif("l'inégalité ", { l: `${g}${sym(inv)}0` }, " est vraie pour tout x")),
    ]),
    resultat("b", [latex("S=\\mathbb{R}"), texte(" : l'inéquation est vraie pour tout x réel")]),
    piege("b", [texte("Le rapport des bases est inférieur à 1 : sans inverser le sens, on chercherait "), latex(`${g}${sym(cmp)}0`), texte(", jamais vrai, et on conclurait à tort qu'il n'y a aucune solution.")]),
  ];
}

// ---------------------------------------------------------------------------- Famille D

function correctionDConstant(e: ExerciceIneqDConstant): EtapeCorrection[] {
  const pf = e.premierFacteur;
  const bL = baseLatexPourExposant(pf.base);
  const u = formatExposantLineaireLatex(pf.m, pf.n);
  const puissance = `${bL}^{${u}}`;
  const cPuiss = pf.c === 1 ? puissance : `${pf.c}\\cdot ${puissance}`;
  const P1 = formatPremierFacteurLatex(pf);
  const P2 = formatSecondFacteurConstantLatex(e.secondFacteur);
  const cmp2 = pf.positif ? e.comparateur : inverser(e.comparateur);
  const lignesA: LigneCalcul[] = [ligne(`${puissance}>0`, justif("pour tout réel x : la base ", { l: baseLatex(pf.base) }, " est strictement positive"))];
  if (pf.positif) lignesA.push(ligne(`${P1}>0`, `on multiplie par ${pf.c} > 0`));
  else lignesA.push(ligne(`-${cPuiss}<0`, `on multiplie par −${pf.c} < 0 : le sens change`), ligne(`${P1}<-${pf.d}`, `on soustrait ${pf.d}`), ligne("<0"));
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte(`Une puissance de base strictement positive est strictement positive ; on suit son signe à travers les opérations qui l'entourent ${COURS_INEQUATIONS}.`)]),
    calcul("a", lignesA),
    resultat("a", [latex(`${P1}${pf.positif ? ">" : "<"}0`), texte(` pour tout x : toujours ${pf.positif ? "positif" : "négatif"}`)]),
  ];
  const lignesB: LigneCalcul[] = [
    ligne(formatEnonceLatex(e), "inéquation de départ"),
    ligne(`${P2}${sym(cmp2)}0`, pf.positif ? "on divise par le premier facteur, strictement positif : sens conservé" : "on divise par le premier facteur, strictement négatif : le sens change"),
  ];
  const sf = e.secondFacteur;
  if (sf.type === "quadratique") {
    const dx2 = sf.d === 1 ? "x^{2}" : `${sf.d}x^{2}`;
    lignesB.push(ligne(`${dx2}${sym(cmp2)}${sf.e}`, `on ajoute ${sf.e}`));
    if (sf.d !== 1) lignesB.push(ligne(`x^{2}${sym(cmp2)}${sf.r * sf.r}`, `on divise par ${sf.d}`));
    lignesB.push(ligne(`|x|${sym(cmp2)}${sf.r}`, justif("racine carrée des deux membres positifs, ", { l: "\\sqrt{x^{2}}=|x|" })));
  } else {
    const b = baseLatex(sf.base);
    lignesB.push(ligne(`${b}^{x}${sym(cmp2)}${sf.k}`, `on ajoute ${sf.k}`));
    lignesB.push(ligne(`${b}^{x}${sym(cmp2)}${b}^{${sf.p}}`, justif("", { l: `${sf.k}=${b}^{${sf.p}}` })));
    lignesB.push(ligne(`x${sym(cmp2)}${sf.p}`, justifSens(b, true)));
  }
  lignesB.push(ligne(`S=${ens(e.solutionEcran2)}`, sf.type === "quadratique" ? justif("", { l: `|x|${sym(cmp2)}${sf.r}` }, cmp2 === ">" || cmp2 === ">=" ? " : à l'extérieur de −r et r" : " : entre −r et r").map((f) => (f.type === "texte" ? { ...f, valeur: f.valeur.replace(/r\b/g, String(sf.r)) } : f)) : "ensemble des solutions"));
  etapes.push(
    utilise("b", [texte("Diviser les deux membres par un facteur de signe connu : sens conservé s'il est positif, inversé s'il est négatif ; puis on résout l'inéquation sur le second facteur seul "), texte(`${COURS_INEQUATIONS}.`)]),
    calcul("b", lignesB),
    resultat("b", [latex(`S=${ens(e.solutionEcran2)}`)]),
  );
  if (!pf.positif) etapes.push(piege("b", [texte("Le premier facteur est toujours négatif : en divisant par lui, le sens de l'inégalité s'inverse.")]));
  else if (sf.type === "quadratique" && (cmp2 === ">" || cmp2 === ">=")) etapes.push(piege("b", [latex(`x^{2}${sym(cmp2)}${sf.r * sf.r}`), texte(" donne deux morceaux : "), latex(`x${sym(inverser(cmp2))}-${sf.r}`), texte(" ou "), latex(`x${sym(cmp2)}${sf.r}`), texte(".")]));
  return etapes;
}

/** Exposant du facteur exponentiel (« x-2 », « -x-1 », « -x ») — même écriture que l'énoncé. */
function exposantFacteur(f: Extract<FacteurUnZero, { type: "exponentiel" }>): string {
  if (f.sgn === 1) return formatXMoinsZero(f.zero);
  return f.zero === 0 ? "-x" : `-x${f.zero > 0 ? `+${f.zero}` : `-${-f.zero}`}`;
}

function isoleX(zero: number): string | FragmentConsigne[] {
  return zero > 0 ? `on ajoute ${zero}` : `on soustrait ${-zero}`;
}

/** Zéro et signe d'un facteur à un seul zéro (étapes a et b de la sous-famille « variable »). */
function etapeFacteur(sq: string, f: FacteurUnZero, zero: number, sens: DirectionSigne, nom: string): EtapeCorrection[] {
  const F = formatFacteurUnZeroLatex(f);
  const zeroL: LigneCalcul[] = [ligne(`${nom}(x)=${F}`, nom === "f_1" ? "premier facteur" : "second facteur")];
  const signeL: LigneCalcul[] = [];
  let utiliseF: FragmentConsigne[];
  if (f.type === "exponentiel") {
    const b = baseLatex(f.base);
    const arg = exposantFacteur(f);
    const puiss = `${b}^{${arg}}`;
    const cPuiss = f.c === 1 ? puiss : `${f.c}\\cdot ${puiss}`;
    zeroL.push(ligne(`${cPuiss}-${f.c}=0`, "le facteur s'annule"), ligne(`${cPuiss}=${f.c}`, `on ajoute ${f.c}`));
    if (f.c !== 1) zeroL.push(ligne(`${puiss}=1`, `on divise par ${f.c}`));
    zeroL.push(ligne(`${puiss}=${b}^{0}`, justif("", { l: `1=${b}^{0}` })), ligne(`${arg}=0`, "même base : exposants égaux"));
    if (f.sgn === -1 && zero !== 0) zeroL.push(ligne(`${formatXMoinsZero(zero)}=0`, "on multiplie par −1"));
    if (f.sgn === -1 && zero === 0) zeroL.push(ligne("x=0", "on multiplie par −1"));
    if (zero !== 0) zeroL.push(ligne(`x=${zero}`, isoleX(zero)));
    signeL.push(ligne(`${cPuiss}-${f.c}>0\\iff ${cPuiss}>${f.c}`, `on ajoute ${f.c}`));
    if (f.c !== 1) signeL.push(ligne(`\\iff ${puiss}>1`, `on divise par ${f.c} > 0`));
    signeL.push(ligne(`\\iff ${arg}>0`, justif("base ", { l: `${b}>1` }, " : sens conservé")));
    if (f.sgn === 1) {
      if (zero !== 0) signeL.push(ligne(`\\iff x>${zero}`, isoleX(zero)));
    } else {
      if (zero !== 0) signeL.push(ligne(`\\iff ${formatXMoinsZero(zero)}<0`, "on multiplie par −1 : le sens change"), ligne(`\\iff x<${zero}`, isoleX(zero)));
      else signeL.push(ligne("\\iff x<0", "on multiplie par −1 : le sens change"));
    }
    utiliseF = [texte("Une puissance de base supérieure à 1 est supérieure à "), latex("1"), texte(" exactement quand son exposant est positif : "), latex(`${b}^{u}>1\\iff u>0`), texte(` ${COURS_INEQUATIONS}.`)];
  } else {
    if (f.pente === 1) {
      if (zero === 0) zeroL.push(ligne("x=0", "le facteur s'annule"));
      else zeroL.push(ligne(`${F}=0`, "le facteur s'annule"), ligne(`x=${zero}`, isoleX(zero)));
      signeL.push(ligne(zero === 0 ? "x>0\\iff x>0" : `${F}>0\\iff x>${zero}`, zero === 0 ? "le facteur est x lui-même" : isoleX(zero)));
    } else {
      zeroL.push(ligne(`${F}=0`, "le facteur s'annule"));
      if (zero !== 0) zeroL.push(ligne(`-x=${-zero}`, `on soustrait ${zero}`.replace("soustrait -", "ajoute ")));
      zeroL.push(ligne(`x=${zero}`, "on multiplie par −1"));
      if (zero !== 0) signeL.push(ligne(`${F}>0\\iff -x>${-zero}`, `on soustrait ${zero}`.replace("soustrait -", "ajoute ")), ligne(`\\iff x<${zero}`, "on multiplie par −1 : le sens change"));
      else signeL.push(ligne("-x>0\\iff x<0", "on multiplie par −1 : le sens change"));
    }
    utiliseF = [texte(`Signe d'une expression du premier degré : on cherche son zéro, puis on résout « facteur > 0 » ${COURS_INEQUATIONS}.`)];
  }
  const etapes: EtapeCorrection[] = [
    utilise(sq, utiliseF),
    calcul(sq, zeroL, [], "Zéro"),
    calcul(sq, signeL, [], "Signe"),
    resultat(sq, [texte(`${texteSensLisible(sens)} ; zéro en `), latex(`x=${zero}`)]),
  ];
  if (sens === "positif_puis_negatif") etapes.push(piege(sq, [texte("Ce facteur est positif avant son zéro : on ne lit pas le signe « − puis + » par habitude.")]));
  return etapes;
}

function signeFacteur(sens: DirectionSigne, x: number, zero: number): -1 | 0 | 1 {
  if (x === zero) return 0;
  return (x < zero) === (sens === "negatif_puis_positif") ? -1 : 1;
}

const SIGNE_TEXTE: Record<string, string> = { "-1": "−", "1": "+", "0": "0" };

function correctionDVariable(e: ExerciceIneqDVariable): EtapeCorrection[] {
  const zA = Math.min(e.zero1, e.zero2);
  const zB = Math.max(e.zero1, e.zero2);
  const pts = [zA - 1, zA, (zA + zB) / 2, zB, zB + 1];
  const cellule = (s: number): CelluleSigne => (s === 0 ? "0" : s > 0 ? "+" : "-");
  const s1 = pts.map((x) => signeFacteur(e.sens1, x, e.zero1));
  const s2 = pts.map((x) => signeFacteur(e.sens2, x, e.zero2));
  const sp = s1.map((s, i) => s * s2[i]!);
  const tableau = tableauSignesLatex([zA, zB], [{ libelle: formatFacteurUnZeroLatex(e.facteur1), valeurs: s1.map(cellule) }, { libelle: formatFacteurUnZeroLatex(e.facteur2), valeurs: s2.map(cellule) }], { libelle: "\\text{produit}", valeurs: sp.map(cellule) });
  const rel = (s: number) => (s > 0 ? ">" : s < 0 ? "<" : "=");
  const zone = (i: number, cond: string): LigneCalcul => ligne(`f_1(x)\\cdot f_2(x)${rel(sp[i]!)}0`, justif("pour ", { l: cond }, ` : (${SIGNE_TEXTE[String(s1[i])]}) × (${SIGNE_TEXTE[String(s2[i])]})`));
  const positif = e.comparateur === ">" || e.comparateur === ">=";
  const large = e.comparateur === ">=" || e.comparateur === "<=";
  return [
    ...etapeFacteur("a", e.facteur1, e.zero1, e.sens1, "f_1"),
    ...etapeFacteur("b", e.facteur2, e.zero2, e.sens2, "f_2"),
    utilise("c", [texte("Règle des signes d'un produit : deux facteurs de même signe donnent un produit positif, de signes contraires un produit négatif ; le produit est nul en chaque zéro "), texte(`${COURS_INEQUATIONS}.`)]),
    calcul("c", [
      zone(0, `x<${zA}`),
      ligne(`f_1(${zA})\\cdot f_2(${zA})=0`, "un facteur est nul"),
      zone(2, `${zA}<x<${zB}`),
      ligne(`f_1(${zB})\\cdot f_2(${zB})=0`, "un facteur est nul"),
      zone(4, `x>${zB}`),
      ligne(`S=${ens(e.solutionEcran3)}`, `on garde les zones où le produit est ${positif ? "positif" : "négatif"}${large ? ", zéros compris (inégalité large)" : ", zéros exclus (inégalité stricte)"}`),
    ]),
    resultat("c", [latex(tableau), texte(" donc "), latex(`S=${ens(e.solutionEcran3)}`)]),
    piege("c", large ? [texte("Inégalité large : les deux zéros, où le produit vaut 0, font partie des solutions (crochets fermés).")] : [texte("Inégalité stricte : les deux zéros, où le produit vaut 0, sont exclus (crochets ouverts).")]),
  ];
}

// ---------------------------------------------------------------------------- Famille E

function correctionE(e: ExerciceIneqE): EtapeCorrection[] {
  const b1 = baseLatex(e.base1);
  const b2 = baseLatex(e.base2);
  const u = formatExposantLineaireLatex(e.m, e.n);
  const rapport = `\\left(\\dfrac{${b1}}{${b2}}\\right)`;
  const rapportNu = `\\dfrac{${b1}}{${b2}}`;
  const cmp2 = e.ratioSuperieurA1 ? e.comparateur : inverser(e.comparateur);
  const res = lignesInequationAffine(e.m, e.n, cmp2, q(0), false);
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte("On divise les deux membres par "), latex(`${b2}^{${u}}`), texte(", strictement positif (le sens ne change pas), puis "), latex("\\dfrac{a^{u}}{b^{u}}=\\left(\\dfrac{a}{b}\\right)^{u}"), texte(` ${COURS_INEQUATIONS}.`)]),
    calcul("a", [
      ligne(`${b1}^{${u}}${sym(e.comparateur)}${b2}^{${u}}`, "inéquation de départ"),
      ligne(`\\dfrac{${b1}^{${u}}}{${b2}^{${u}}}${sym(e.comparateur)}1`, justif("on divise par ", { l: `${b2}^{${u}}>0` }, " : sens conservé")),
      ligne(`${rapport}^{${u}}${sym(e.comparateur)}1`, justif("", { l: "\\dfrac{a^{u}}{b^{u}}=\\left(\\dfrac{a}{b}\\right)^{u}" })),
    ]),
    resultat("a", [latex(contenuRecapPhase(e, "eRegrouper").latex as string)]),
    utilise("b", utiliseSens(rapportNu, e.ratioSuperieurA1, "On écrit 1 comme une puissance du rapport et on compare les exposants. ")),
    calcul("b", [
      ligne(`${rapport}^{${u}}${sym(e.comparateur)}${rapport}^{0}`, justif("", { l: "1=a^{0}" })),
      ligne(`${u}${sym(cmp2)}0`, justifSens(rapportNu, e.ratioSuperieurA1)),
      ...res.lignes,
      ligne(`S=${ens(e.solutionEcran2)}`, "ensemble des solutions"),
    ]),
    resultat("b", [latex(`S=${ens(e.solutionEcran2)}`)]),
  ];
  const x0 = entierDansS(res.borne, res.cmpFinal);
  const ex = e.m * x0 + e.n;
  if (Math.abs(ex) <= 4) {
    const v1 = puissanceQ(baseQ(e.base1), ex);
    const v2 = puissanceQ(baseQ(e.base2), ex);
    etapes.push(
      verification("b", [texte("On remplace x par "), latex(String(x0)), texte(", qui est dans S (exposant "), latex(`${substitueAffine(e.m, e.n, x0)}=${ex}`), texte(") :")], [
        ligne(`${b1}^{${ex}}=${qL(v1)}`, "premier membre"),
        ligne(`${b2}^{${ex}}=${qL(v2)}`, "second membre"),
        ligne(`${qL(v1)}${sym(e.comparateur)}${qL(v2)}`, "l'inégalité est vraie"),
      ]),
    );
  }
  etapes.push(
    piege(
      "b",
      !e.ratioSuperieurA1
        ? [texte("Rapport des bases compris entre 0 et 1 : en passant aux exposants, le sens de l'inégalité s'inverse.")]
        : e.m < 0
          ? [texte("Diviser par "), latex(String(e.m)), texte(" (négatif) inverse le sens de l'inégalité.")]
          : [texte("Le sens n'est conservé que parce que le rapport des bases est supérieur à 1.")],
    ),
  );
  return etapes;
}

function ordonner(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return [...etapes].sort((a, b) => (a.sousQuestion ?? "").localeCompare(b.sousQuestion ?? ""));
}

export function correctionDetailleeInequationsExpo(exercice: ExerciceInequationExponentielle): EtapeCorrection[] {
  switch (exercice.famille) {
    case "A":
      return finaliserCorrige(ordonner(correctionA(exercice)));
    case "B":
      return finaliserCorrige(correctionB(exercice));
    case "C":
      return finaliserCorrige(ordonner(exercice.sousType === "f" ? correctionCf(exercice) : correctionCk(exercice)));
    case "D":
      return finaliserCorrige(ordonner(exercice.sousType === "constant" ? correctionDConstant(exercice) : correctionDVariable(exercice)));
    case "E":
      return finaliserCorrige(ordonner(correctionE(exercice)));
  }
}

/** Lettre d'étape de l'écran `phase` (ordre des écrans de l'instance). */
export function lettrePhaseInequationExpo(exercice: ExerciceInequationExponentielle, phase: PhaseInequationExponentielle): string {
  return "abcdefgh"[phasesInequationExpo(exercice).indexOf(phase)] ?? "a";
}
