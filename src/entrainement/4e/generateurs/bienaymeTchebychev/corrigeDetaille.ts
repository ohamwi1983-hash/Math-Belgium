import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceBienaymeTchebychev } from "../../core/bienaymeTchebychev.types";
import {
  type ExerciceBienaymeTchebychevAvecK,
  formatEtatActuelKLatex,
  formatEtatActuelPourcentLatex,
  formatNombreAttenduTexte,
  formatSigmaAttenduTexte,
  kEtatActuel,
  pourcentAttendu0EtatActuel,
  pourcentAttenduEtatActuel,
  texteAideKDepuisIntervalleNiveau2,
  texteAideKDepuisPourcentNiveau2,
  texteAideSigmaNiveau2,
  texteAideXBarNiveau2,
} from "../../ui/formatBienaymeTchebychev";
import { arrondiA, auPlus, COURS_BT, nb, nbp, nbTexte, formulesInsecables } from "../../ui/corrigeStatistique2";

/**
 * Corrigé détaillé « comme au tableau » de gen37 (inégalité de Bienaymé-Tchebychev) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par écran du générateur (`etapesBienaymeTchebychev`,
 * même séquence que `SEQUENCES` du moteur) ; valeurs ARRONDIES de l'instance (cascade du générateur :
 * chaque écran repart de la valeur arrondie de l'écran précédent) et équations des aides de l'écran
 * (`texteAide…Niveau2`). Un arrondi orienté s'écrit avec une relation VRAIE : « ≈ 1,3571 ≥ 1,35 »
 * (par défaut), « ≈ 1,2910 ≤ 1,30 » (par excès), « = 44,8 ≥ 44 » (borne vers l'extérieur).
 * Partagé par l'adaptateur papier et l'appli (`AppBienaymeTchebychev.tsx`).
 */

type E = ExerciceBienaymeTchebychev;

export type EtapeBT = "kIntervalle" | "kPourcent" | "pourcentFinal" | "nombreFinal" | "pourcentDepuisNombre" | "intervalleFinal" | "sigma" | "xBar";

/** Écrans de chaque variante, dans l'ordre (mêmes rôles que `SEQUENCES`). */
export function etapesBienaymeTchebychev(e: E): EtapeBT[] {
  switch (e.variante) {
    case "intervalleVersPourcent":
      return ["kIntervalle", "pourcentFinal"];
    case "pourcentVersIntervalle":
      return ["kPourcent", "intervalleFinal"];
    case "intervalleVersNombre":
      return ["kIntervalle", "pourcentFinal", "nombreFinal"];
    case "nombreVersIntervalle":
      return ["pourcentDepuisNombre", "kPourcent", "intervalleFinal"];
    case "intervalleVersSigma":
      return ["kPourcent", "sigma"];
    case "intervalleVersXBar":
      return ["xBar"];
    case "nombreVersSigma":
      return ["pourcentDepuisNombre", "kPourcent", "sigma"];
    case "nombreVersXBar":
      return ["xBar"];
  }
}

const LETTRES = "abcdefgh";

/** Valeur approchée affichée avec assez de décimales (au moins `d`) pour que son arrondi au pas
 * `10^-cible` dans le sens demandé soit le même que celui de la valeur exacte. */
function approche(v: number, d: number, cible: number, sens: "bas" | "haut" | "proche"): string {
  const r = (x: number) => (sens === "bas" ? Math.floor(x * 10 ** cible + 1e-9) : sens === "haut" ? Math.ceil(x * 10 ** cible - 1e-9) : Math.round(x * 10 ** cible + 1e-9));
  for (let k = d; k <= 9; k++) {
    if (auPlus(v, k)) return `=${nb(arrondiA(v, k))}`;
    if (r(arrondiA(v, k)) === r(v)) return `\\approx ${nb(arrondiA(v, k))}`;
  }
  return `\\approx ${nb(arrondiA(v, 9))}`;
}

/** Ligne d'arrondi orienté (relation vraie entre la valeur approchée et la valeur retenue). */
function arrondiOriente(exact: number, retenu: number, sens: "bas" | "haut" | "proche", justification: string, suffixe = ""): LigneCalcul[] {
  if (Math.abs(exact - retenu) < 1e-9) return [];
  if (sens === "bas") return [ligne(`\\geq ${nb(retenu)}${suffixe}`, justification)];
  if (sens === "haut") return [ligne(`\\leq ${nb(retenu)}${suffixe}`, justification)];
  return [ligne(`\\approx ${nb(retenu)}${suffixe}`, justification)];
}

function pourcentConnu(e: ExerciceBienaymeTchebychevAvecK): number {
  if ("pourcentDonne" in e) return e.pourcentDonne;
  if ("pourcentAttendu0" in e) return e.pourcentAttendu0;
  return 0;
}

// ---------------------------------------------------------------------------------------------
// Étapes
// ---------------------------------------------------------------------------------------------

function etapeKIntervalle(e: E & { xBar: number; sigma: number; borneInf: number; borneSup: number; kAttendu: number }, sq: string): EtapeCorrection[] {
  const d = e.borneSup - e.xBar;
  const exact = d / e.sigma;
  return [
    utilise(sq, [
      texte("L'intervalle garanti est "),
      latex("[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]"),
      texte(` : sa borne supérieure vaut x̄ + kσ. On pose l'équation, puis on isole k ; k arrondi par défaut (un k plus petit ne promet jamais plus que la garantie) ${COURS_BT}.`),
    ]),
    calcul(sq, [
      ligne(texteAideKDepuisIntervalleNiveau2(e).latex, "borne supérieure : x̄ + kσ"),
      ligne(`k\\times ${nb(e.sigma)}=${nb(e.borneSup)}-${nbp(e.xBar)}`, "on retire x̄"),
      ligne(`=${nb(d)}`, "demi-largeur de l'intervalle"),
      ligne(`k=\\dfrac{${nb(d)}}{${nb(e.sigma)}}`, "on divise par σ"),
      ...(auPlus(exact, 2)
        ? [ligne(`=${nb(arrondiA(exact, 2))}`)]
        : [ligne(approche(exact, 4, 2, "bas")), ...arrondiOriente(exact, e.kAttendu, "bas", "arrondi au centième par défaut (vers le bas)")]),
    ]),
    resultat(sq, [latex(formatEtatActuelKLatex(kEtatActuel(e as ExerciceBienaymeTchebychevAvecK)))]),
    verification(sq, [texte("L'intervalle est bien centré sur x̄ : la borne inférieure est à la même distance.")], [ligne(`${nb(e.xBar)}-${nbp(e.borneInf)}=${nb(e.xBar - e.borneInf)}`, "même demi-largeur ✓")]),
    piege(sq, [texte("k se calcule avec la DEMI-largeur de l'intervalle (distance de x̄ à une borne), pas avec sa largeur totale.")]),
  ];
}

function etapeKPourcent(e: ExerciceBienaymeTchebychevAvecK, sq: string): EtapeCorrection[] {
  const p = pourcentConnu(e);
  const q = arrondiA(100 - p, 9);
  const k2 = 100 / q;
  const exact = Math.sqrt(k2);
  const parExces = e.variante === "pourcentVersIntervalle" || e.variante === "nombreVersIntervalle";
  const sens = parExces ? "haut" : "proche";
  const justifArrondi = parExces ? "arrondi au centième par excès (vers le haut) : l'intervalle reste assez large" : "arrondi au centième";
  return [
    utilise(sq, [
      texte("Au moins "),
      latex("1-\\dfrac{1}{k^2}"),
      texte(" de l'effectif est dans "),
      latex("[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]"),
      texte(` : on égale cette proportion à la proportion voulue, puis on isole k (k > 1, racine positive) ${COURS_BT}.`),
    ]),
    calcul(sq, [
      ligne(texteAideKDepuisPourcentNiveau2(p).latex, [latex(`${nb(p)}\\,\\%=\\dfrac{${nb(p)}}{100}`)]),
      ligne(`\\dfrac{1}{k^2}=1-\\dfrac{${nb(p)}}{100}`, [texte("on isole "), latex("\\dfrac{1}{k^2}")]),
      ligne(`=\\dfrac{${nb(q)}}{100}`),
      ligne(`k^2=\\dfrac{100}{${nb(q)}}`, "on inverse les deux membres"),
      ...(auPlus(k2, 4) ? [ligne(`=${nb(arrondiA(k2, 4))}`)] : []),
      ligne(`k=\\sqrt{\\dfrac{100}{${nb(q)}}}`, "k > 1 : racine carrée positive"),
      ...(auPlus(exact, 2)
        ? [ligne(`=${nb(arrondiA(exact, 2))}`)]
        : [ligne(approche(exact, 4, 2, sens)), ...arrondiOriente(exact, e.kAttendu, sens, justifArrondi)]),
    ]),
    resultat(sq, [latex(formatEtatActuelKLatex(kEtatActuel(e)))]),
    piege(sq, [texte("La proportion s'écrit "), latex(`\\dfrac{${nb(p)}}{100}`), texte(`, pas ${nbTexte(p)} ; et k est la racine carrée de `), latex("\\dfrac{100}{100-p}"), texte(", pas ce quotient lui-même.")]),
  ];
}

function etapePourcentFinal(e: E & { kAttendu: number; pourcentAttendu: number }, sq: string, final: boolean): EtapeCorrection[] {
  const k = e.kAttendu;
  const k2 = arrondiA(k * k, 6);
  const exact = 100 * (1 - 1 / k2);
  const cible = final ? 0 : 2;
  const prop = approche(exact / 100, cible + 4, cible + 2, "bas");
  const propValeur = Number(prop.replace(/^(=|\\approx )/, "").replace("{,}", ".").replace(/\\,/g, ""));
  return [
    utilise(sq, [
      texte("Au moins "),
      latex("1-\\dfrac{1}{k^2}"),
      texte(` de l'effectif est dans l'intervalle ; on calcule avec le k arrondi trouvé. Un pourcentage minimal garanti s'arrondit vers le bas ${COURS_BT}.`),
    ]),
    calcul(sq, [
      ligne(`1-\\dfrac{1}{k^2}=1-\\dfrac{1}{${nb(k)}^2}`, "on remplace k par sa valeur"),
      ligne(`=1-\\dfrac{1}{${nb(k2)}}`, `${nbTexte(k)}² = ${nbTexte(k2)}`),
      ligne(prop),
      ligne(`=${nb(arrondiA(propValeur * 100, 9))}\\,\\%`, "× 100 : en pourcentage"),
      ...arrondiOriente(exact, e.pourcentAttendu, "bas", final ? "arrondi à l'unité par défaut (vers le bas) : la garantie reste vraie" : "arrondi au centième par défaut (vers le bas)", "\\,\\%"),
    ]),
    resultat(sq, [latex(formatEtatActuelPourcentLatex(pourcentAttenduEtatActuel(e)))]),
    piege(sq, [texte("La proportion garantie est "), latex("1-\\dfrac{1}{k^2}"), texte(", pas "), latex("1-\\dfrac{1}{k}"), texte(" ; un minimum garanti s'arrondit vers le BAS.")]),
  ];
}

function etapeNombreFinal(e: E & { n: number; pourcentAttendu: number; nMinAttendu: number }, sq: string): EtapeCorrection[] {
  const exact = (e.pourcentAttendu / 100) * e.n;
  return [
    utilise(sq, [texte(`Le nombre minimal d'individus est le pourcentage minimal de l'effectif n. Un nombre d'individus est entier : « au moins 18,75 » veut dire « au moins 19 », on arrondit vers le haut ${COURS_BT}.`)]),
    calcul(sq, [
      ligne(`\\dfrac{${nb(e.pourcentAttendu)}}{100}\\times ${nb(e.n)}=${nb(arrondiA(exact, 6))}`, `${nbTexte(e.pourcentAttendu)} % de l'effectif`),
      ...arrondiOriente(exact, e.nMinAttendu, "haut", "un nombre d'individus est entier : arrondi vers le haut"),
    ]),
    resultat(sq, [texte(`Au moins ${formatNombreAttenduTexte(e.nMinAttendu)}.`)]),
    piege(sq, [texte("Un nombre d'individus est entier : « au moins 18,75 » veut dire « au moins 19 » — on arrondit vers le haut, pas vers le bas.")]),
  ];
}

function etapePourcentDepuisNombre(e: E & { n: number; nombreMinDonne: number; pourcentAttendu0: number }, sq: string): EtapeCorrection[] {
  const exact = (100 * e.nombreMinDonne) / e.n;
  const parExces = e.variante === "nombreVersIntervalle";
  const sens = parExces ? "haut" : "proche";
  return [
    utilise(sq, [texte(`Un nombre d'individus s'exprime en pourcentage de l'effectif total n : nombre ÷ n × 100 % ${COURS_BT}.`)]),
    calcul(sq, [
      ligne(`\\dfrac{${nb(e.nombreMinDonne)}}{${nb(e.n)}}\\times 100\\,\\%${approche(exact, 4, 2, sens)}\\,\\%`, "part de l'effectif total"),
      ...arrondiOriente(exact, e.pourcentAttendu0, sens, parExces ? "arrondi au centième par excès (vers le haut) : l'intervalle contiendra assez d'individus" : "arrondi au centième", "\\,\\%"),
    ]),
    resultat(sq, [latex(formatEtatActuelPourcentLatex(pourcentAttendu0EtatActuel(e)))]),
    piege(sq, [texte(`Le pourcentage se calcule sur l'effectif total n = ${nbTexte(e.n)} : on divise le nombre donné par n, puis on multiplie par 100.`)]),
  ];
}

function etapeIntervalleFinal(e: E & { xBar: number; sigma: number; kAttendu: number; borneInfAttendue: number; borneSupAttendue: number }, sq: string): EtapeCorrection[] {
  const ks = arrondiA(e.kAttendu * e.sigma, 6);
  const inf = arrondiA(e.xBar - ks, 6);
  const sup = arrondiA(e.xBar + ks, 6);
  const unite = e.contexte.unite;
  return [
    utilise(sq, [
      texte("L'intervalle garanti est "),
      latex("[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]"),
      texte(`, avec le k arrondi trouvé. Pour ne pas perdre la garantie, ses bornes s'arrondissent vers l'extérieur : la borne inférieure vers le bas, la borne supérieure vers le haut ${COURS_BT}.`),
    ]),
    calcul(sq, [
      ligne(`k\\sigma=${nb(e.kAttendu)}\\times ${nb(e.sigma)}`, "on calcule d'abord kσ"),
      ligne(`=${nb(ks)}`),
      ligne(`\\bar{x}-k\\sigma=${nb(e.xBar)}-${nb(ks)}`, "borne inférieure"),
      ligne(`=${nb(inf)}`),
      ...arrondiOriente(inf, e.borneInfAttendue, "bas", "arrondie à l'unité vers le bas"),
      ligne(`\\bar{x}+k\\sigma=${nb(e.xBar)}+${nb(ks)}`, "borne supérieure"),
      ligne(`=${nb(sup)}`),
      ...arrondiOriente(sup, e.borneSupAttendue, "haut", "arrondie à l'unité vers le haut"),
    ]),
    resultat(sq, [texte("Intervalle garanti : "), latex(`[${nb(e.borneInfAttendue)}\\,;\\,${nb(e.borneSupAttendue)}]`), texte(` (en ${unite}).`)]),
    piege(sq, [texte("Pour garantir le pourcentage, l'intervalle s'arrondit vers l'EXTÉRIEUR (borne inférieure vers le bas, supérieure vers le haut).")]),
  ];
}

function etapeSigma(e: E & { xBar: number; borneInf: number; borneSup: number; kAttendu: number; sigmaAttendu: number }, sq: string): EtapeCorrection[] {
  const d = e.borneSup - e.xBar;
  const exact = d / e.kAttendu;
  const egal = !formatSigmaAttenduTexte(e).includes("≈");
  return [
    utilise(sq, [texte(`La borne supérieure de l'intervalle garanti vaut x̄ + kσ : on remplace x̄, k (la valeur arrondie trouvée) et la borne, puis on isole σ ${COURS_BT}.`)]),
    calcul(sq, [
      ligne(texteAideSigmaNiveau2(e).latex, "borne supérieure : x̄ + kσ"),
      ligne(`${nb(e.kAttendu)}\\times\\sigma=${nb(e.borneSup)}-${nbp(e.xBar)}`, "on retire x̄"),
      ligne(`=${nb(d)}`),
      ligne(`\\sigma=\\dfrac{${nb(d)}}{${nb(e.kAttendu)}}`, "on divise par k"),
      ...(auPlus(exact, 0) ? [ligne(`=${nb(arrondiA(exact, 0))}`)] : [ligne(approche(exact, 4, 0, "proche")), ligne(`\\approx ${nb(e.sigmaAttendu)}`, "arrondi à l'unité")]),
    ]),
    resultat(sq, [latex(`\\sigma${egal ? "=" : "\\approx "}${nb(e.sigmaAttendu)}`), texte(` ${e.contexte.unite}`)]),
    piege(sq, [texte("σ s'isole en divisant la DEMI-largeur (borne − x̄) par k, pas la largeur totale de l'intervalle.")]),
  ];
}

function etapeXBar(e: E & { borneInf: number; borneSup: number; xBarAttendu: number }, sq: string): EtapeCorrection[] {
  const s = e.borneInf + e.borneSup;
  const m = e.xBarAttendu;
  return [
    utilise(sq, [
      texte("L'intervalle de Bienaymé-Tchebychev "),
      latex("[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]"),
      texte(` est symétrique autour de x̄ : x̄ est le milieu de ses deux bornes ${COURS_BT}.`),
    ]),
    calcul(sq, [ligne(texteAideXBarNiveau2(e).latex, "milieu de l'intervalle"), ligne(`=\\dfrac{${nb(s)}}{2}`), ligne(`=${nb(m)}`)]),
    resultat(sq, [latex(`\\bar{x}=${nb(m)}`), texte(` ${e.contexte.unite}`)]),
    verification(sq, [texte("x̄ est à la même distance des deux bornes :")], [ligne(`${nb(m)}-${nbp(e.borneInf)}=${nb(m - e.borneInf)}`), ligne(`${nb(e.borneSup)}-${nb(m)}=${nb(e.borneSup - m)}`, "même distance ✓")]),
    piege(sq, [texte("Ni le pourcentage ni σ ne servent ici : x̄ est le centre de l'intervalle, (a + b)/2, et non sa demi-largeur (b − a)/2.")]),
  ];
}

function correctionDetailleeBienaymeTchebychevBrut(e: E): EtapeCorrection[] {
  return etapesBienaymeTchebychev(e).flatMap((etape, i) => {
    const sq = LETTRES[i]!;
    const x = e as never;
    switch (etape) {
      case "kIntervalle":
        return etapeKIntervalle(x, sq);
      case "kPourcent":
        return etapeKPourcent(x, sq);
      case "pourcentFinal":
        return etapePourcentFinal(x, sq, e.variante === "intervalleVersPourcent");
      case "nombreFinal":
        return etapeNombreFinal(x, sq);
      case "pourcentDepuisNombre":
        return etapePourcentDepuisNombre(x, sq);
      case "intervalleFinal":
        return etapeIntervalleFinal(x, sq);
      case "sigma":
        return etapeSigma(x, sq);
      case "xBar":
        return etapeXBar(x, sq);
    }
  });
}

export function correctionDetailleeBienaymeTchebychev(e: E): EtapeCorrection[] {
  return formulesInsecables(correctionDetailleeBienaymeTchebychevBrut(e));
}
