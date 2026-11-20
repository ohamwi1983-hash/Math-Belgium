import type { ExerciceExtremumsSinusoide } from "../../core5e/extremumsSinusoide.types";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { RationnelPi } from "../parametresSinusoide/rationnelPi";
import { additionnerRationnelPi, inverseRationnelPi, multiplierParEntier, multiplierRationnelPi, negatifRationnelPi, reduireRationnelPi, valeurNumerique } from "../parametresSinusoide/rationnelPi";
import { formatEquationSubstitueeLatex, formatSolutionsExtremumsLatex, formatTermesEtatActuelExtremums } from "../../ui5e/formatExtremumsSinusoide";
import { formatCoefficientAmplitudeLatex } from "../../ui5e/formatParametresSinusoide";
import { borneFenetreExtremums, fenetreExtremumsTexte, valeurTrigVisee } from "./index";
import { avecFinale, COURS_EXTREMUMS, finaliserCorrige, kDansIntervalle, rpLatex, rpPar, rpTermeK, somme } from "../../ui5e/corrigeTrigonometrie2";

/**
 * Corrigé détaillé « comme au tableau » de 5gen11 (extremums d'une fonction sinusoïdale) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (ordre `ORDRE_PHASES_EXTREMUMS`) :
 * a) l'équation des positions (valeur visée par sin u / cos u selon le mode et le signe de A, série
 * du cours, argument remplacé) ; b) x isolé ligne à ligne (on retranche la constante, puis on divise
 * par le coefficient de x — la période aussi) ; c) les positions de [0 ; 2π[ une par une (valeur de
 * k), avec les deux valeurs de k qui sortent de l'intervalle. Arithmétique exacte (`rationnelPi.ts`),
 * résultats = fonctions de l'écran (`formatEquationSubstitueeLatex`, `formatTermesEtatActuelExtremums`,
 * `formatSolutionsExtremumsLatex`). Aucun écran de lecture.
 */

type E = ExerciceExtremumsSinusoide;

const NOM_MODE = { maximums: "les maximums", minimums: "les minimums", extremums: "les extremums" } as const;

/** « 3x », « \dfrac{\pi}{3}\cdot x », « x ». */
function termeX(a: RationnelPi): string {
  const r = reduireRationnelPi(a);
  if (r.degrePi === 0 && r.numerateur === r.denominateur) return "x";
  const l = rpLatex(r);
  return /\\[a-zA-Z]+$/.test(l) ? `${l} x` : `${l}x`;
}

function argument(e: E): string {
  const b = reduireRationnelPi(e.bArg);
  return b.numerateur === 0 ? termeX(e.a) : somme([termeX(e.a), rpLatex(b)]);
}

function etapesEquation(e: E): EtapeCorrection[] {
  const f = e.fonction;
  const nom = f === "sin" ? "\\sin" : "\\cos";
  const u = e.brancheU;
  const serieU = somme([reduireRationnelPi(u.constante).numerateur === 0 ? "" : rpLatex(u.constante), rpTermeK(u.periode)]);
  const lignes: LigneCalcul[] = [];
  const A = formatCoefficientAmplitudeLatex(e.amplitude);
  const Alatex = A === "" ? "1" : A === "-" ? "-1" : A;
  if (e.mode === "extremums") {
    lignes.push(ligne(`${nom} u=1`, "maximums si A > 0, minimums si A < 0"), ligne(`${nom} u=-1`, "l'autre type d'extremum"));
    const deux = f === "sin" ? ["u=\\dfrac{\\pi}{2}+2k\\pi", "u=-\\dfrac{\\pi}{2}+2k\\pi"] : ["u=2k\\pi", "u=\\pi+2k\\pi"];
    lignes.push(ligne(deux[0]!, [texte("solutions de "), latex(`${nom} u=1`)]), ligne(deux[1]!, [texte("solutions de "), latex(`${nom} u=-1`)]));
    lignes.push(ligne(`u=${serieU}`, "les deux séries réunies : un extremum tous les π"));
  } else {
    const vise = valeurTrigVisee(e.mode, e.amplitude);
    const positif = e.amplitude.signe > 0;
    lignes.push(ligne(`A=${Alatex}${positif ? ">0" : "<0"}`, positif ? "amplitude positive" : "amplitude négative : les rôles s'inversent"));
    lignes.push(ligne(`${nom} u=${vise}`, [texte(`${e.mode === "maximums" ? "maximum" : "minimum"} de `), latex(`A${nom} u+b`), texte(` atteint quand ${f} u est ${vise === 1 ? "maximal" : "minimal"}`)]));
    lignes.push(ligne(`u=${serieU}`, "série du cours, période 2π"));
  }
  lignes.push(ligne(formatEquationSubstitueeLatex(e).replace(/\s*=\s*/, "="), [texte("on remplace u par "), latex(argument(e))]));
  const piegeTexte =
    e.mode === "extremums"
      ? "Tous les extremums réunis : la série en u a une période π (et non 2π) — une seule équation suffit."
      : e.amplitude.signe < 0
        ? `Amplitude négative : ${NOM_MODE[e.mode]} sont atteints quand ${f} u = ${e.mode === "maximums" ? "−1" : "1"}, et non l'inverse.`
        : `${e.mode === "maximums" ? "Les maximums" : "Les minimums"} seuls : une seule série, de période 2π — ne pas la réunir avec l'autre valeur.`;
  return [
    utilise("a", [
      texte("On pose "),
      latex(`u=${argument(e)}`),
      texte(". Le maximum de "),
      latex(`A${nom} u+b`),
      texte(" est atteint quand "),
      latex(`${nom} u=1`),
      texte(" si A > 0, quand "),
      latex(`${nom} u=-1`),
      texte(" si A < 0 ; le minimum dans l'autre cas ; maximums et minimums réunis : "),
      latex(`${nom} u=\\pm 1`),
      texte(` ${COURS_EXTREMUMS}.`),
    ]),
    calcul("a", lignes),
    resultat("a", [latex(formatEquationSubstitueeLatex(e))]),
    piege("a", [texte(piegeTexte)]),
  ];
}

function etapesIsoler(e: E): EtapeCorrection[] {
  const u = e.brancheU;
  const b = reduireRationnelPi(e.bArg);
  const a = reduireRationnelPi(e.a);
  const depart = formatEquationSubstitueeLatex(e).replace(/\s*=\s*/, "=");
  const lignes: LigneCalcul[] = [ligne(depart, "équation de l'étape a")];
  const cU = reduireRationnelPi(u.constante);
  const tX = termeX(a);
  const kU = rpTermeK(u.periode);
  let c = cU;
  if (b.numerateur !== 0) {
    const negatif = b.numerateur < 0;
    const termeB = rpLatex(negatifRationnelPi(b));
    lignes.push(ligne(`${tX}=${somme([cU.numerateur === 0 ? "" : rpLatex(cU), termeB, kU])}`, [texte(negatif ? "on ajoute " : "on retranche "), latex(rpLatex(negatif ? negatifRationnelPi(b) : b)), texte(" aux deux membres")]));
    c = additionnerRationnelPi(cU, negatifRationnelPi(b));
    const l2 = `${tX}=${somme([c.numerateur === 0 ? "" : rpLatex(c), kU])}`;
    if (l2 !== lignes[lignes.length - 1]!.latex) lignes.push(ligne(l2, "on réduit"));
  }
  const inv = inverseRationnelPi(a);
  const unite = a.degrePi === 0 && a.numerateur === a.denominateur;
  if (!unite) {
    const kDivise = `${kU}\\cdot ${rpPar(inv)}`;
    const premier = c.numerateur === 0 ? "" : `${rpLatex(c)}\\cdot ${rpPar(inv)}`;
    lignes.push(ligne(`x=${somme([premier, kDivise])}`, [texte("on divise chaque terme par "), latex(rpLatex(a)), texte(" (la période aussi) : on multiplie par "), latex(rpLatex(inv))]));
  }
  const finale = formatTermesEtatActuelExtremums(e, "solutions")[1]!;
  const fin = avecFinale(lignes, "=", finale.replace(/^x\s*=\s*/, ""), "on calcule");
  // k = 0 : on retrouve la valeur visée de l'argument.
  const x0 = reduireRationnelPi(e.brancheX.constante);
  const verifie = additionnerRationnelPi(multiplierRationnelPi(a, x0), b);
  const tAx0 = a.degrePi === 0 && a.numerateur === a.denominateur ? rpPar(x0) : `${rpLatex(a)}\\cdot ${rpPar(x0)}`;
  if (b.numerateur === 0 && unite) {
    return [
      utilise("b", [texte(`Le coefficient de x vaut 1 et l'argument n'a pas de constante ${COURS_EXTREMUMS} : x est déjà isolé.`)]),
      calcul("b", [ligne(finale.replace(/\s*=\s*/, "="), "u = x : rien à transformer")]),
      resultat("b", [latex(finale)]),
    ];
  }
  return [
    utilise("b", [texte(`On isole x dans la série : on retranche la constante de l'argument, puis on divise tout par le coefficient de x — la constante et la période ${COURS_EXTREMUMS}.`)]),
    calcul("b", fin),
    resultat("b", [latex(finale)]),
    verification("b", [texte("Pour k = 0, l'argument redonne la valeur de la série en u :")], [ligne(`${somme([tAx0, b.numerateur === 0 ? "" : rpLatex(b)])}=${rpLatex(verifie)}`, "constante de la série de l'étape a")]),
    piege("b", [texte("La période se divise aussi par le coefficient de x : diviser seulement la constante donne de fausses positions.")]),
  ];
}

function etapesSolutions(e: E): EtapeCorrection[] {
  const c = reduireRationnelPi(e.brancheX.constante);
  const p = reduireRationnelPi(e.brancheX.periode);
  const cv = valeurNumerique(c);
  const pv = valeurNumerique(p);
  const borne = borneFenetreExtremums(e);
  const fenetre = fenetreExtremumsTexte(e);
  const ks = kDansIntervalle(cv, pv, valeurNumerique(borne), false);
  const kmin = ks[0]!;
  const kmax = ks[ks.length - 1]!;
  const lignes: LigneCalcul[] = [];
  for (let k = kmin - 1; k <= kmax + 1; k++) {
    const val = additionnerRationnelPi(c, multiplierParEntier(p, k));
    const sub = k === 0 ? rpLatex(c) : somme([c.numerateur === 0 ? "" : rpLatex(c), `${rpPar(p)}\\cdot ${k < 0 ? `(${k})` : k}`]);
    const v = rpLatex(val);
    const chaine = sub === v ? `x=${v}` : `x=${sub}=${v}`;
    if (k < kmin) lignes.push(ligne(`${chaine}<0`, `k = ${k} : hors de ${fenetre}`));
    else if (k > kmax) lignes.push(ligne(`${chaine}\\geq ${rpLatex(borne)}`, `k = ${k} : hors de ${fenetre}`));
    else lignes.push(ligne(chaine, `k = ${k}`));
  }
  return [
    utilise("c", [texte(`On donne à k des valeurs entières successives dans la série de x et on garde les valeurs de ${fenetre} (0 compris, ${fenetre.slice(4, -1)} exclu).`)]),
    calcul("c", lignes),
    resultat("c", [latex(formatSolutionsExtremumsLatex(e.solutions))]),
  ];
}

export function correctionDetailleeExtremumsSinusoide(e: E): EtapeCorrection[] {
  return finaliserCorrige([...etapesEquation(e), ...etapesIsoler(e), ...etapesSolutions(e)]);
}
