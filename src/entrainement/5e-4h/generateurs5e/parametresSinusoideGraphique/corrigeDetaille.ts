import type { ExerciceParametresSinusoideGraphique } from "../../core5e/parametresSinusoideGraphique.types";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { ORDRE_PHASES_SINUSOIDE_GRAPHIQUE, type PhaseParametresSinusoideGraphique } from "../../moteur5e/typesParametresSinusoideGraphique";
import type { RationnelPi } from "../parametresSinusoide/rationnelPi";
import { additionnerRationnelPi, diviserParEntier, inverseRationnelPi, multiplierParEntier, multiplierRationnelPi, negatifRationnelPi, reduireRationnelPi } from "../parametresSinusoide/rationnelPi";
import { formatChampParametreGraphiqueLatex, phaseRetenue, phiRetenu } from "../../ui5e/formatParametresSinusoideGraphique";
import { avecFinale, COURS_LECTURE, finaliserCorrige, fr, q, qAdd, qSub, rpLatex, rpPar } from "../../ui5e/corrigeTrigonometrie2";

/**
 * Corrigé détaillé « comme au tableau » de 5gen9 (paramètres d'une sinusoïde lus sur son graphique)
 * — règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN, dans l'ordre de l'appli
 * (`ORDRE_PHASES_SINUSOIDE_GRAPHIQUE`) : a) b, b) |A|, c) T, d) ω, e) fréquence, f) Φ, g) φ. Chaque
 * lecture est une ligne avec une relation (« \max f = 5 », lu sur le graphique) ; les valeurs
 * viennent de l'instance (arithmétique exacte `rationnelPi.ts`), les résultats des MÊMES fonctions
 * que l'écran (`formatChampParametreGraphiqueLatex`, `phiRetenu`, `phaseRetenue`).
 * Écrans de pure lecture (niveau) : a, b, c, f (`LETTRES_LECTURE_SINUSOIDE_GRAPHIQUE`).
 */

type E = ExerciceParametresSinusoideGraphique;

export const LETTRE_PHASE_SINUSOIDE_GRAPHIQUE: Record<PhaseParametresSinusoideGraphique, string> = { decalage: "a", amplitude: "b", periode: "c", pulsation: "d", frequence: "e", phi: "f", dephasage: "g" };
export const LETTRES_LECTURE_SINUSOIDE_GRAPHIQUE = ["a", "b", "c", "f"];

const DEUX_PI: RationnelPi = { numerateur: 2, denominateur: 1, degrePi: 1 };

function amplitude(e: E): { n: number; d: number } {
  const r = e.A.rationnelle!;
  return q(r.numerateur, r.denominateur);
}

/** Fraction en `\frac` (à l'intérieur d'un `\dfrac`). */
function frT(x: { n: number; d: number }): string {
  return fr(x).replace("\\dfrac", "\\frac");
}
function frTPar(x: { n: number; d: number }): string {
  return x.n < 0 ? `\\left(${frT(x)}\\right)` : frT(x);
}

function omegaDe(e: E): RationnelPi {
  return multiplierRationnelPi(DEUX_PI, inverseRationnelPi(e.T));
}

/** Abscisses de deux maximums consécutifs : un quart de période après le passage ascendant x₀. */
function maximums(e: E): [RationnelPi, RationnelPi] {
  const x1 = additionnerRationnelPi(phiRetenu(e), diviserParEntier(e.T, 4));
  return [x1, additionnerRationnelPi(x1, e.T)];
}

function etapesDecalage(e: E): EtapeCorrection[] {
  const A = amplitude(e);
  const b = q(e.b);
  const M = qAdd(b, A);
  const m = qSub(b, A);
  const lignes: LigneCalcul[] = [
    ligne(`\\max f=${fr(M)}`, "lu sur le graphique : ordonnée du sommet le plus haut"),
    ligne(`\\min f=${fr(m)}`, "lu sur le graphique : ordonnée du sommet le plus bas"),
    ligne("b=\\dfrac{\\max f+\\min f}{2}", "la ligne médiane est à mi-hauteur"),
    ligne(`=\\dfrac{${frT(M)}+${frTPar(m)}}{2}`, "on remplace"),
    ligne(`=\\dfrac{${2 * e.b}}{2}`),
  ];
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte(`Le décalage vertical b est l'ordonnée de la ligne médiane, à mi-chemin entre le maximum et le minimum ${COURS_LECTURE} : `), latex("b=\\dfrac{\\max f+\\min f}{2}"), texte(".")]),
    calcul("a", avecFinale(lignes, "=", `${e.b}`)),
    resultat("a", [latex(formatChampParametreGraphiqueLatex(e, "decalage"))]),
  ];
  if (e.b !== 0) etapes.push(piege("a", [texte("La ligne médiane n'est pas l'axe des abscisses : ici "), latex(`b=${e.b}`), texte(", et non 0.")]));
  return etapes;
}

function etapesAmplitude(e: E): EtapeCorrection[] {
  const A = amplitude(e);
  const b = q(e.b);
  const M = qAdd(b, A);
  const m = qSub(b, A);
  const lignes: LigneCalcul[] = [
    ligne("|A|=\\dfrac{\\max f-\\min f}{2}", "moitié de l'écart entre le maximum et le minimum"),
    ligne(`=\\dfrac{${frT(M)}-${frTPar(m)}}{2}`, "maximum et minimum lus à l'étape a"),
    ligne(`=\\dfrac{${fr(qSub(M, m))}}{2}`),
  ];
  return [
    utilise("b", [texte(`L'amplitude est la distance entre un sommet et la ligne médiane, la moitié de l'écart entre le maximum et le minimum ${COURS_LECTURE} : `), latex("|A|=\\dfrac{\\max f-\\min f}{2}"), texte(".")]),
    calcul("b", avecFinale(lignes, "=", fr(A))),
    resultat("b", [latex(formatChampParametreGraphiqueLatex(e, "amplitude"))]),
    verification("b", [texte("Un sommet est à |A| au-dessus de la ligne médiane :")], [ligne(`b+|A|=${e.b}+${fr(A)}`), ligne(`=${fr(M)}`, "c'est bien le maximum lu")]),
    piege("b", [texte("L'amplitude est la moitié de l'écart entre le maximum et le minimum, pas l'écart complet.")]),
  ];
}

function etapesPeriode(e: E): EtapeCorrection[] {
  const [x1, x2] = maximums(e);
  return [
    utilise("c", [texte(`La période T est la distance horizontale entre deux maximums consécutifs ${COURS_LECTURE}.`)]),
    calcul("c", [
      ligne(`x_1=${rpLatex(x1)}`, "lu sur le graphique : abscisse d'un maximum"),
      ligne(`x_2=${rpLatex(x2)}`, "lu sur le graphique : abscisse du maximum suivant"),
      ligne("T=x_2-x_1", "distance entre deux maximums consécutifs"),
      ligne(`=${rpLatex(x2)}-${rpPar(x1)}`, "on remplace"),
      ligne(`=${rpLatex(e.T)}`),
    ]),
    resultat("c", [latex(formatChampParametreGraphiqueLatex(e, "periode"))]),
    piege("c", [texte("Entre un maximum et le minimum voisin, il n'y a qu'une demi-période.")]),
  ];
}

function etapesPulsation(e: E): EtapeCorrection[] {
  const omega = omegaDe(e);
  const T = reduireRationnelPi(e.T);
  const lignes: LigneCalcul[] = [ligne("\\omega=\\dfrac{2\\pi}{T}", "formule du cours"), ligne(`=\\dfrac{2\\pi}{${rpLatex(T)}}`, "période lue à l'étape c")];
  if (T.degrePi === 1 && T.numerateur !== 1) {
    // 2π / (nπ/d) = 2d/n : on simplifie d'abord par π.
    lignes.push(ligne(`=\\dfrac{${2 * T.denominateur}}{${T.numerateur}}`, "on simplifie par π"));
  }
  return [
    utilise("d", [texte(`La pulsation se déduit de la période ${COURS_LECTURE} : `), latex("\\omega=\\dfrac{2\\pi}{T}"), texte(".")]),
    calcul("d", avecFinale(lignes, "=", rpLatex(omega), "on simplifie")),
    resultat("d", [latex(formatChampParametreGraphiqueLatex(e, "pulsation"))]),
    verification("d", [texte("Sur une période, l'argument ωx avance d'un tour :")], [ligne(`\\omega\\cdot T=${rpLatex(omega)}\\cdot ${rpPar(T)}`), ligne("=2\\pi")]),
  ];
}

function etapesFrequence(e: E): EtapeCorrection[] {
  const T = reduireRationnelPi(e.T);
  const f = inverseRationnelPi(T);
  return [
    utilise("e", [texte(`La fréquence est l'inverse de la période ${COURS_LECTURE} : `), latex("f_{req}=\\dfrac{1}{T}"), texte(".")]),
    calcul("e", avecFinale([ligne("f_{req}=\\dfrac{1}{T}", "formule du cours"), ligne(`=\\dfrac{1}{${rpLatex(T)}}`, "période lue à l'étape c")], "=", rpLatex(f))),
    resultat("e", [latex(formatChampParametreGraphiqueLatex(e, "frequence"))]),
  ];
}

function etapesPhi(e: E): EtapeCorrection[] {
  const x0 = phiRetenu(e);
  const [x1] = maximums(e);
  return [
    utilise("f", [texte(`Le décalage horizontal Φ est l'abscisse x₀ d'un point où la courbe traverse sa ligne médiane en montant, juste après un minimum ${COURS_LECTURE}.`)]),
    calcul("f", [
      ligne(`y=${e.b}`, "ligne médiane, trouvée à l'étape a"),
      ligne(`x_0=${rpLatex(x0)}`, "lu sur le graphique : la courbe traverse la ligne médiane en montant"),
      ligne("\\Phi=x_0", "définition du décalage horizontal"),
      ligne(`=${rpLatex(x0)}`),
    ]),
    resultat("f", [latex(formatChampParametreGraphiqueLatex(e, "phi"))]),
    verification("f", [texte("Un quart de période après x₀, la courbe atteint un maximum :")], [
      ligne(`x_0+\\dfrac{T}{4}=${rpLatex(x0)}+${rpPar(diviserParEntier(e.T, 4))}`),
      ligne(`=${rpLatex(x1)}`, "c'est bien le maximum x₁ lu à l'étape c"),
    ]),
    piege("f", [texte("Un passage par la ligne médiane en descendant est décalé d'une demi-période : il ne donne pas Φ.")]),
  ];
}

function etapesPhase(e: E): EtapeCorrection[] {
  const omega = omegaDe(e);
  const x0 = phiRetenu(e);
  const brut = reduireRationnelPi(negatifRationnelPi(multiplierRationnelPi(omega, x0)));
  const retenu = phaseRetenue(e);
  const produit = `-${rpLatex(omega)}\\cdot ${rpPar(x0)}`;
  const lignes: LigneCalcul[] = [];
  if (brut.numerateur === retenu.numerateur && brut.denominateur === retenu.denominateur) {
    lignes.push(ligne("\\varphi=-\\omega\\cdot x_0", "formule du cours"), ligne(`=${produit}`, "ω (étape d) et x₀ (étape f)"));
    if (rpLatex(brut) !== produit) lignes.push(ligne(`=${rpLatex(brut)}`, "déjà dans ]−π ; π]"));
  } else {
    // La chaîne s'arrête à l'angle brut ; une seconde chaîne ajoute / retire les tours.
    const tours = (retenu.numerateur * brut.denominateur - brut.numerateur * retenu.denominateur) / (2 * retenu.denominateur * brut.denominateur);
    const t = Math.abs(tours);
    const tour = t === 1 ? "2\\pi" : `${t}\\cdot 2\\pi`;
    const d = brut.denominateur;
    const tourFraction = rpLatex(multiplierParEntier(DEUX_PI, t));
    const tourEnD = d === 1 ? tourFraction : `\\dfrac{${2 * t * d}\\pi}{${d}}`;
    lignes.push(
      ligne(`-\\omega\\cdot x_0=${produit}`, "formule du cours, ω (étape d) et x₀ (étape f)"),
      ligne(`=${rpLatex(brut)}`, "hors de ]−π ; π]"),
      ligne(`\\varphi=${rpLatex(brut)}${tours > 0 ? "+" : "-"}${tour}`, `${tours > 0 ? "on ajoute" : "on retire"} ${t === 1 ? "un tour" : `${t} tours`} : même phase, ramenée dans ]−π ; π]`),
    );
    if (tourEnD !== tour) lignes.push(ligne(`=${rpLatex(brut)}${tours > 0 ? "+" : "-"}${tourEnD}`, "même dénominateur"));
    lignes.push(ligne(`=${rpLatex(retenu)}`));
  }
  const somme = additionnerRationnelPi(multiplierRationnelPi(omega, x0), retenu);
  return [
    utilise("g", [texte(`En x₀, l'argument ωx + φ vaut 0 (passage ascendant), d'où la formule du cours ${COURS_LECTURE} : `), latex("\\varphi=-\\omega\\cdot x_0"), texte(", ramenée dans ]−π ; π] en ajoutant ou en retirant des tours de 2π.")]),
    calcul("g", lignes),
    resultat("g", [latex(formatChampParametreGraphiqueLatex(e, "dephasage"))]),
    verification("g", [texte("En x₀, l'argument doit être un multiple de 2π :")], [ligne(`\\omega\\cdot x_0+\\varphi=${rpLatex(omega)}\\cdot ${rpPar(x0)}+${rpPar(retenu)}`), ligne(`=${rpLatex(somme)}`, "multiple de 2π : sin s'annule et la courbe monte")]),
    piege("g", [texte("Ne pas oublier le signe « − » de la formule : φ = −ω·x₀, et non ω·x₀.")]),
  ];
}

const ETAPES: Record<PhaseParametresSinusoideGraphique, (e: E) => EtapeCorrection[]> = {
  decalage: etapesDecalage,
  amplitude: etapesAmplitude,
  periode: etapesPeriode,
  pulsation: etapesPulsation,
  frequence: etapesFrequence,
  phi: etapesPhi,
  dephasage: etapesPhase,
};

export function correctionDetailleeParametresSinusoideGraphique(e: E): EtapeCorrection[] {
  return finaliserCorrige(ORDRE_PHASES_SINUSOIDE_GRAPHIQUE.flatMap((phase) => ETAPES[phase](e)));
}

