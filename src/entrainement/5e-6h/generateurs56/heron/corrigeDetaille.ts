import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceHeron, ExerciceHeronRectangles, ExercicePuissances } from "./index";
import { ecartDe, ecartFraction, largeurDe, longueurDe } from "./index";
import { baseL, COURS_HERON, decimalesHeron, formeL, racineL, reponse, valeurApprocheeL } from "./ui/formatHeron";
import { dixMoinsL, egalOuEnvironL, fractionL, nbL, parDefautA, parExcesA, scientifiqueL, tronqueL } from "../nombres56";

/**
 * Corrigé détaillé « comme au tableau » de `56gen20` (cours, étape 5), une lettre par écran.
 * Héron : a) deuxième rectangle ; b) troisième rectangle et encadrement (minorant par défaut,
 * majorant par excès) ; c) rectangles successifs jusqu'au premier écart < 10⁻ᵏ ; d) valeur approchée.
 * Puissances : a) premier carré ; b) second carré ; c) fraction réduite ; d) écart (toujours par excès).
 * Valeurs approchées calculées depuis les valeurs NON arrondies (mémoire de la calculatrice).
 */

const t = texte;
const f = latex;

/** Écart écrit : décimal si ≥ 10⁻³, sinon notation scientifique. */
function ecartL(x: number): string {
  return x >= 1e-3 ? `\\approx ${nbL(x, 4, true)}` : `\\approx ${scientifiqueL(x)}`;
}

function corrigeRectangles(e: ExerciceHeronRectangles): EtapeCorrection[] {
  const A = e.A;
  const d = decimalesHeron(e);
  const eps = 10 ** -e.k;
  const a2 = longueurDe(e, 2);
  const a3 = longueurDe(e, 3);

  const etapeA: EtapeCorrection[] = [
    utilise("a", [t(`Le rectangle suivant a pour longueur la moyenne arithmétique des deux côtés du précédent, et pour largeur l'aire divisée par cette longueur ${COURS_HERON}.`)]),
    calcul("a", [
      ligne(`a_2=\\dfrac{1}{2}\\left(${e.q}+${e.p}\\right)=${nbL(a2, 4)}`, "moyenne des côtés du premier rectangle"),
      ligne(`\\dfrac{${A}}{a_2}=\\dfrac{${A}}{${nbL(a2, 4)}}${egalOuEnvironL(largeurDe(e, 2), 4)}`, "l'aire reste égale à " + A),
    ]),
    resultat("a", reponse(e, "rect2")),
    verification("a", [t("La racine est entre les deux côtés : "), f(`${tronqueL(largeurDe(e, 2), 4)}<${racineL(e)}<${nbL(a2, 4)}`), t(" ; le rectangle est plus proche d'un carré que le premier.")]),
    piege("a", [t("Garder l'ancienne largeur, ou oublier de diviser la somme des côtés par 2.")]),
  ];

  const etapeB: EtapeCorrection[] = [
    utilise("b", [t("Même calcul à partir du deuxième rectangle ; dès le deuxième rectangle, "), f(`{\\dfrac{A}{a_n}\\leq\\sqrt{A}\\leq a_n}`), t(` ${COURS_HERON}.`)]),
    calcul("b", [
      ligne(`a_3=\\dfrac{1}{2}\\left(${tronqueL(a2, d)}+${tronqueL(largeurDe(e, 2), d)}\\right)\\approx ${nbL(a3, d, true)}`, "on garde les décimales en mémoire"),
      ligne(`\\dfrac{${A}}{a_3}\\approx ${nbL(largeurDe(e, 3), d, true)}`, "largeur du troisième rectangle"),
    ]),
    resultat("b", reponse(e, "encadrement")),
    verification("b", [
      t("Le minorant est arrondi par défaut et le majorant par excès : "),
      f(`${nbL(parDefautA(largeurDe(e, 3), 4), 4, true)}\\leq ${nbL(largeurDe(e, 3), d, true)}`),
      t(" et "),
      f(`${nbL(a3, d, true)}\\leq ${nbL(parExcesA(a3, 4), 4, true)}`),
      t(" : l'encadrement reste vrai."),
    ]),
    piege("b", [t("Inverser les bornes (la largeur est le plus petit côté), ou arrondir le majorant par défaut : l'encadrement deviendrait faux.")]),
  ];

  const lignesC: LigneCalcul[] = [];
  for (let n = 2; n <= e.nPrecision; n++) {
    const g = ecartDe(e, n);
    lignesC.push(ligne(`a_{${n}}-\\dfrac{${A}}{a_{${n}}}${ecartL(g)}`, g >= eps ? [t("rectangle "), f(`${n}`), t(" : encore "), f(`\\geq ${dixMoinsL(e.k)}`)] : [t("rectangle "), f(`${n}`), t(" : "), f(`<${dixMoinsL(e.k)}`)]));
  }
  const etapeC: EtapeCorrection[] = [
    utilise("c", [t("Menu Récurrence : "), f(`a_{n+1}=\\dfrac{1}{2}\\left(a_n+\\dfrac{${A}}{a_n}\\right)`), t(", "), f(`a_1=${e.q}`), t(", puis la table ; pour chaque rang, on calcule l'écart entre la longueur et la largeur.")]),
    calcul("c", lignesC),
    resultat("c", reponse(e, "etapes")),
    verification("c", [t("L'écart est à peu près élevé au carré à chaque étape (divisé par le double de la longueur) : le nombre de décimales exactes double environ d'un rectangle au suivant.")]),
    piege("c", [t("Compter les étapes de calcul au lieu des rectangles : le rectangle de départ porte le numéro 1.")]),
  ];

  const n = e.nPrecision;
  const etapeD: EtapeCorrection[] = [
    utilise("d", [t("Au rectangle "), f(`${n}`), t(", la racine est entre la largeur et la longueur, qui diffèrent de moins de "), f(dixMoinsL(e.k)), t(" : tout nombre de cet intervalle convient.")]),
    calcul("d", [ligne(`${nbL(parDefautA(largeurDe(e, n), e.k + 2), e.k + 2, true)}\\leq ${racineL(e)}\\leq ${nbL(parExcesA(longueurDe(e, n), e.k + 2), e.k + 2, true)}`, `largeur (par défaut) et longueur (par excès) du rectangle ${n}`)]),
    resultat("d", reponse(e, "valeur")),
    verification("d", [t("La touche racine de la calculatrice donne "), f(`${racineL(e)}\\approx ${nbL(Math.sqrt(A), e.k + 3, true)}`), t(", qui arrondi à "), f(dixMoinsL(e.k)), t(" donne bien "), f(valeurApprocheeL(e)), t(".")]),
    piege("d", [t(`Garder trop peu de décimales : à ${e.k - 1} décimales, la précision n'est plus que de `), f(dixMoinsL(e.k - 1)), t(".")]),
  ];
  return [...etapeA, ...etapeB, ...etapeC, ...etapeD];
}

function corrigePuissances(e: ExercicePuissances): EtapeCorrection[] {
  const P = e.P;
  const b = baseL(e);
  const developpe = e.racineDAbord ? `(\\sqrt{${P}})^2-2\\cdot ${e.c}\\cdot\\sqrt{${P}}+${e.c}^2` : `${e.c}^2-2\\cdot ${e.c}\\cdot\\sqrt{${P}}+(\\sqrt{${P}})^2`;
  const reduit = e.racineDAbord ? `${P}-${2 * e.c}\\sqrt{${P}}+${e.c * e.c}` : `${e.c * e.c}-${2 * e.c}\\sqrt{${P}}+${P}`;
  const etapeA: EtapeCorrection[] = [
    utilise("a", [t("Carré d'une différence : "), f("(a-b)^2=a^2-2ab+b^2"), t(", avec "), f(`(\\sqrt{${P}})^2=${P}`), t(` ${COURS_HERON}.`)]),
    calcul("a", [ligne(`(${b})^2=${developpe}`, "carré d'une différence"), ligne(`=${reduit}`, "on calcule les carrés"), ligne(`=${formeL(e.u1, e.v1, P)}`, "on regroupe les entiers")]),
    resultat("a", reponse(e, "carre1")),
    piege("a", [t("Oublier le double produit, ou écrire "), f(`(\\sqrt{${P}})^2`), t(" avec un signe « − ».")]),
  ];
  const etapeB: EtapeCorrection[] = [
    utilise("b", [f(`(${b})^4=\\left((${b})^2\\right)^2`), t(" : on élève au carré le résultat de l'étape précédente, avec la même identité.")]),
    calcul("b", [
      ligne(`(${formeL(e.u1, e.v1, P)})^2=${e.u1}^2-2\\cdot ${e.u1}\\cdot ${e.v1}\\sqrt{${P}}+${e.v1}^2\\cdot ${P}`, "carré d'une différence"),
      ligne(`=${e.u1 * e.u1}-${e.v2}\\sqrt{${P}}+${e.v1 * e.v1 * P}`, "on calcule"),
      ligne(`=${formeL(e.u2, e.v2, P)}`, "on regroupe les entiers"),
    ]),
    resultat("b", reponse(e, "carre2")),
    piege("b", [t("Écrire "), f(`(${e.v1}\\sqrt{${P}})^2=${e.v1 * e.v1}`), t(" en oubliant le facteur "), f(`${P}`), t(".")]),
  ];
  const simplifiee = e.num !== e.u2;
  const lignesC: LigneCalcul[] = [ligne(`${formeL(e.u2, e.v2, P)}\\approx 0`, "puissance quatrième d'un nombre entre 0 et 1"), ligne(`${e.v2}\\sqrt{${P}}\\approx ${e.u2}`, "on isole le terme en racine"), ligne(`\\sqrt{${P}}\\approx\\dfrac{${e.u2}}{${e.v2}}`, [t("on divise par "), f(`${e.v2}`)])];
  if (simplifiee) lignesC.push(ligne(`=${fractionL(e.num, e.den)}`, [t("on simplifie par "), f(`${e.u2 / e.num}`)]));
  const etapeC: EtapeCorrection[] = [
    utilise("c", [t("Une puissance d'un nombre compris entre 0 et 1 diminue : "), f(`(${b})^4`), t(" est très proche de 0, on le néglige.")]),
    calcul("c", lignesC),
    resultat("c", reponse(e, "fraction")),
    piege("c", [t("Inverser la fraction ("), f("\\dfrac{v}{u}"), t("), ou la laisser non simplifiée.")]),
  ];
  const ec = ecartFraction(e);
  const etapeD: EtapeCorrection[] = [
    utilise("d", [t("La fraction moins la racine, à la calculatrice ; d'après l'étape b, cet écart vaut "), f(`\\dfrac{(${b})^4}{${e.v2}}`), t(", un nombre positif.")]),
    calcul("d", [ligne(`${fractionL(e.num, e.den)}${egalOuEnvironL(e.num / e.den, 9)}`, "valeur de la fraction"), ligne(`\\sqrt{${P}}\\approx ${nbL(Math.sqrt(P), 9, true)}`, "touche racine"), ligne(`${fractionL(e.num, e.den)}-\\sqrt{${P}}\\approx ${scientifiqueL(ec)}`, "deux chiffres significatifs")]),
    resultat("d", reponse(e, "ecart")),
    verification("d", [t("L'écart est positif : la fraction est une valeur approchée par excès de "), f(`\\sqrt{${P}}`), t(".")]),
    piege("d", [t("Calculer la racine moins la fraction : l'écart demandé serait négatif.")]),
  ];
  return [...etapeA, ...etapeB, ...etapeC, ...etapeD];
}

export function correctionDetailleeHeron(e: ExerciceHeron): EtapeCorrection[] {
  return e.type === "heron" ? corrigeRectangles(e) : corrigePuissances(e);
}
