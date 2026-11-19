import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceUnSansLautre } from "../../core/unSansLautre.types";
import {
  formatCarreCibleLatex,
  formatCarreLatex,
  formatFonctionCibleLatex,
  formatFonctionFinaleLatex,
  formatIntervalleLatex,
  formatSigneCibleLatex,
  formatValeurCibleSimplifieeLatex,
  formatValeurConnueLatex,
  formatValeurFinaleSimplifieeLatex,
  formatValeurTangenteSimplifieeLatex,
  libelleQuadrantUnSansLautre,
} from "../../ui/formatUnSansLautre";
import { racineSimplifiee } from "../../ui/corrigeChapitre3";
import { avecFinale, COURS_CERCLE, COURS_IDENTITE, dfrac, finaliserCorrige } from "../../ui/corrigeCercleTrigo";

/**
 * Corrigé détaillé « comme au tableau » de gen16 (l'un sans l'autre) — règle
 * `.claude/rules/feuilles-evaluations.md`. Trois écrans, trois lettres : a) le carré (identité
 * fondamentale), b) la valeur signée (racine simplifiée, signe donné par le quadrant), c) la
 * tangente (variantes cos / sin données) ou le sinus (variante tan donnée). Valeurs écrites par les
 * fonctions de l'écran (`formatValeurCibleSimplifieeLatex`…). Aucun écran de pure lecture.
 */

type E = ExerciceUnSansLautre;

export const ORDRE_ECRANS_UN_SANS_LAUTRE = ["carre", "valeurSignee", "tangente"] as const;

export function lettreEcranUnSansLautre(phase: string): string {
  return phase === "carre" ? "a" : phase === "valeurSignee" ? "b" : "c";
}

/** Valeur signée p/q (q = 1 : entier). */
function fraction(signe: number, p: number, q: number): string {
  const corps = q === 1 ? `${p}` : `\\dfrac{${p}}{${q}}`;
  return signe < 0 ? `-${corps}` : corps;
}

function entre(l: string): string {
  return l.startsWith("-") ? `\\left(${l}\\right)` : l;
}

/** Numérateur « k√m » d'une racine simplifiée (« 4 », « \sqrt{7} », « 2\sqrt{6} »). */
function radical(n: number): string {
  const { k, m } = racineSimplifiee(n);
  if (m === 1) return `${k}`;
  return k === 1 ? `\\sqrt{${m}}` : `${k}\\sqrt{${m}}`;
}

/** √(N/D) = ±√N/√D, puis le radical simplifié (une transformation par ligne). */
function lignesRacine(nom: string, num: number, den: number, intro: string): LigneCalcul[] {
  const lignes: LigneCalcul[] = [ligne(`${nom}=\\pm\\sqrt{\\dfrac{${num}}{${den}}}`, intro)];
  const rd = racineSimplifiee(den);
  const rn = racineSimplifiee(num);
  if (rd.m === 1) {
    lignes.push(ligne(`=\\pm\\dfrac{\\sqrt{${num}}}{${rd.k}}`, [texte("racine d'un quotient, "), latex(`\\sqrt{${den}}=${rd.k}`)]));
    if (rn.m === 1) lignes.push(ligne(`=\\pm\\dfrac{${rn.k}}{${rd.k}}`, [latex(`\\sqrt{${num}}=${rn.k}`)]));
    else if (rn.k > 1) lignes.push(ligne(`=\\pm\\dfrac{\\sqrt{${rn.k * rn.k}}\\cdot\\sqrt{${rn.m}}}{${rd.k}}`, [latex(`${num}=${rn.k * rn.k}\\cdot ${rn.m}`)]), ligne(`=\\pm\\dfrac{${rn.k}\\sqrt{${rn.m}}}{${rd.k}}`, [latex(`\\sqrt{${rn.k * rn.k}}=${rn.k}`)]));
    return lignes;
  }
  // Dénominateur irrationnel (variante tan : cos²θ = q²/S) : √(q²/S) = q/√S, puis rendu rationnel.
  lignes.push(ligne(`=\\pm\\dfrac{${radical(num)}}{\\sqrt{${den}}}`, "racine d'un quotient"));
  lignes.push(ligne(`=\\pm\\dfrac{${radical(num)}\\sqrt{${den}}}{${den}}`, [texte("on multiplie haut et bas par "), latex(`\\sqrt{${den}}`)]));
  return lignes;
}


const NOM_QUADRANT_POSITION: Record<string, Record<string, string>> = {
  sin: { "1": "ordonnée de M positive", "-1": "ordonnée de M négative" },
  cos: { "1": "abscisse de M positive", "-1": "abscisse de M négative" },
};

function etapesSigne(e: E, lettre: string, valeurFinale: string, lignes: LigneCalcul[]): EtapeCorrection[] {
  const cible = formatFonctionCibleLatex(e);
  const q = libelleQuadrantUnSansLautre(e.quadrant);
  return [
    utilise(lettre, [
      texte("Deux nombres opposés ont ce carré ; le quadrant de θ choisit le signe "),
      texte(`${COURS_CERCLE}. Ici `),
      latex(formatIntervalleLatex(e)),
      texte(` : quadrant ${q}.`),
    ]),
    calcul(lettre, [
      ...lignes,
      ligne(formatSigneCibleLatex(e), `quadrant ${q} : ${NOM_QUADRANT_POSITION[e.fonctionCible]![String(e.signeCible)]}`),
      ligne(`${cible}=${valeurFinale}`, e.signeCible === 1 ? "on garde la valeur positive" : "on garde la valeur négative"),
    ]),
    resultat(lettre, [latex(`${cible}=${valeurFinale}`)]),
    piege(lettre, [
      e.quadrant === "I"
        ? texte("La racine carrée donne deux valeurs opposées : c'est l'intervalle de θ qui choisit le signe (ici, tout est positif).")
        : texte(`La racine carrée donne deux valeurs opposées : dans le quadrant ${e.quadrant}, le signe de ${e.fonctionCible} θ est ${e.signeCible === 1 ? "positif" : "négatif"}, ce n'est pas le signe de la valeur donnée qui décide.`),
    ]),
  ];
}

function correctionCosSin(e: E): EtapeCorrection[] {
  const { p, q, carreCibleNum: N, carreCibleDen: D } = e;
  const connu = formatCarreLatex(e.fonctionConnue);
  const carre = formatCarreLatex(e.fonctionCible);
  const vConnue = fraction(e.signeConnu, p, q);
  const cible = formatFonctionCibleLatex(e);
  const valeurCible = dfrac(formatValeurCibleSimplifieeLatex(e));
  const etapes: EtapeCorrection[] = [];

  // a) Le carré.
  etapes.push(
    utilise("a", [texte(`Identité fondamentale ${COURS_IDENTITE} : `), latex("\\cos^2\\theta+\\sin^2\\theta=1"), texte(", donc "), latex(`${carre}=1-${connu}`), texte(".")]),
    calcul("a", [
      ligne(`${carre}=1-${connu}`, "identité fondamentale"),
      ligne(`=1-\\left(${vConnue}\\right)^2`, [texte("on remplace "), latex(dfrac(formatValeurConnueLatex(e)))]),
      ligne(`=1-\\dfrac{${p * p}}{${q * q}}`, "un carré est positif"),
      ligne(`=\\dfrac{${q * q}}{${q * q}}-\\dfrac{${p * p}}{${q * q}}`, "même dénominateur"),
      ligne(`=\\dfrac{${N}}{${D}}`),
    ]),
    resultat("a", [latex(`${carre}=${dfrac(formatCarreCibleLatex(e))}`)]),
    verification("a", [texte("La somme des deux carrés vaut bien 1 :")], [ligne(`\\dfrac{${N}}{${D}}+\\dfrac{${p * p}}{${q * q}}=1`)]),
  );

  // b) La valeur signée.
  etapes.push(...etapesSigne(e, "b", valeurCible, lignesRacine(cible, N, D, "deux nombres opposés ont ce carré")));

  // c) La tangente : sin θ / cos θ, diviser = multiplier par l'inverse.
  const rn = racineSimplifiee(N);
  const numCible = radical(N); // numérateur de la valeur cible, dénominateur q
  const sinNum = e.fonctionConnue === "sin" ? `${p}` : numCible;
  const cosNum = e.fonctionConnue === "cos" ? `${p}` : numCible;
  const sinSigne = e.fonctionConnue === "sin" ? e.signeConnu : e.signeCible;
  const cosSigne = e.fonctionConnue === "cos" ? e.signeConnu : e.signeCible;
  const sinL = `${sinSigne < 0 ? "-" : ""}\\dfrac{${sinNum}}{${q}}`;
  const cosL = `${cosSigne < 0 ? "-" : ""}\\dfrac{${cosNum}}{${q}}`;
  const inverseCos = `${cosSigne < 0 ? "-" : ""}\\dfrac{${q}}{${cosNum}}`;
  const signe = sinSigne * cosSigne < 0 ? "-" : "";
  const lignesTan: LigneCalcul[] = [
    ligne(`\\tan\\theta=\\dfrac{\\sin\\theta}{\\cos\\theta}`, "définition de la tangente"),
    ligne(`=${sinL}:${entre(cosL)}`, "on remplace sin θ et cos θ"),
    ligne(`=${sinL}\\cdot ${entre(inverseCos)}`, "diviser par une fraction, c'est multiplier par son inverse"),
    ligne(`=${signe}\\dfrac{${sinNum}}{${cosNum}}`, `les ${q} se simplifient${sinSigne * cosSigne < 0 ? ", signes contraires" : ""}`),
  ];
  if (e.fonctionConnue === "sin" && rn.m !== 1) {
    // Dénominateur irrationnel k√m : on multiplie haut et bas par √m.
    lignesTan.push(ligne(`=${signe}\\dfrac{${p}\\sqrt{${rn.m}}}{${rn.k === 1 ? "" : `${rn.k}\\cdot `}${rn.m}}`, [texte("on multiplie haut et bas par "), latex(`\\sqrt{${rn.m}}`)]));
  }
  etapes.push(
    utilise("c", [texte(`Définition de la tangente ${COURS_CERCLE} : `), latex("\\tan\\theta=\\dfrac{\\sin\\theta}{\\cos\\theta}"), texte(", avec les valeurs exactes de sin θ et cos θ.")]),
    calcul("c", avecFinale(lignesTan, dfrac(formatValeurTangenteSimplifieeLatex(e)), "on simplifie")),
    resultat("c", [latex(`${formatFonctionFinaleLatex(e)}=${dfrac(formatValeurFinaleSimplifieeLatex(e))}`)]),
  );
  return etapes;
}

function correctionTangente(e: E): EtapeCorrection[] {
  const { p, q, carreCibleNum: N, carreCibleDen: S } = e;
  const tanL = fraction(e.signeConnu, p, q);
  const cosL = dfrac(formatValeurCibleSimplifieeLatex(e));
  const sinL = dfrac(formatValeurFinaleSimplifieeLatex(e));
  const etapes: EtapeCorrection[] = [];

  // a) cos²θ par 1 + tan²θ = 1/cos²θ.
  const lignesA: LigneCalcul[] = [
    ligne("\\dfrac{1}{\\cos^2\\theta}=1+\\tan^2\\theta", [texte("identité fondamentale divisée par "), latex("\\cos^2\\theta")]),
    ligne(`=1+\\left(${tanL}\\right)^2`, [texte("on remplace "), latex(dfrac(formatValeurConnueLatex(e)))]),
  ];
  if (q === 1) lignesA.push(ligne(`=1+${p * p}`, "un carré est positif"), ligne(`=${S}`));
  else lignesA.push(ligne(`=1+\\dfrac{${p * p}}{${q * q}}`, "un carré est positif"), ligne(`=\\dfrac{${q * q}}{${q * q}}+\\dfrac{${p * p}}{${q * q}}`, "même dénominateur"), ligne(`=\\dfrac{${S}}{${q * q}}`));
  lignesA.push(ligne(`\\cos^2\\theta=\\dfrac{${N}}{${S}}`, "on prend l'inverse des deux membres"));
  etapes.push(
    utilise("a", [texte(`Identité fondamentale ${COURS_IDENTITE} divisée par `), latex("\\cos^2\\theta"), texte(" : "), latex("1+\\tan^2\\theta=\\dfrac{1}{\\cos^2\\theta}"), texte(".")]),
    calcul("a", lignesA),
    resultat("a", [latex(`\\cos^2\\theta=${dfrac(formatCarreCibleLatex(e))}`)]),
    piege("a", [texte("La relation donne "), latex("\\dfrac{1}{\\cos^2\\theta}"), texte(", pas "), latex("\\cos^2\\theta"), texte(" : ne pas oublier de prendre l'inverse de "), latex("1+\\tan^2\\theta"), texte(".")]),
  );

  // b) cos θ signé.
  const lignesB = lignesRacine("\\cos\\theta", N, S, "deux nombres opposés ont ce carré");
  etapes.push(...etapesSigne(e, "b", cosL, avecFinale(lignesB, `\\pm${cosL.replace(/^-/, "")}`, "on simplifie")));

  // c) sin θ = tan θ · cos θ.
  etapes.push(
    utilise("c", [texte(`Définition de la tangente ${COURS_CERCLE} : `), latex("\\tan\\theta=\\dfrac{\\sin\\theta}{\\cos\\theta}"), texte(", donc "), latex("\\sin\\theta=\\tan\\theta\\cdot\\cos\\theta"), texte(".")]),
    calcul("c", [
      ligne("\\sin\\theta=\\tan\\theta\\cdot\\cos\\theta", "définition de la tangente"),
      ligne(`=${tanL}\\cdot ${entre(cosL)}`, "on remplace tan θ et cos θ"),
      ligne(`=${sinL}`, q === 1 ? "on multiplie" : `les ${q} se simplifient`),
    ]),
    resultat("c", [latex(`\\sin\\theta=${sinL}`)]),
    verification("c", [texte("Le signe est cohérent : dans le quadrant "), texte(`${e.quadrant}, `), latex(`\\sin\\theta${e.sinValeur > 0 ? ">" : "<"}0`), texte(".")]),
  );
  return etapes;
}

export function correctionDetailleeUnSansLautre(e: E): EtapeCorrection[] {
  return finaliserCorrige(e.fonctionConnue === "tan" ? correctionTangente(e) : correctionCosSin(e));
}
