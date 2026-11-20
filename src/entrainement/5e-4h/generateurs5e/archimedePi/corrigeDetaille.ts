import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceArchimedePi } from "../../core5e/archimedePi";
import { doublements, largeurDe, majorantDe, minorantDe, parDefaut, parExces } from "../../core5e/archimedePi";
import { exactA, nbL } from "../../ui5e/nombresTrigo";
import { degL, encadrementL, largeurL, milL, reponse, seuilL } from "../../ui5e/formatArchimedePi";

/**
 * Corrigé détaillé « comme au tableau » de `5gen56` (cours, § 1) : a) α = 180°/n ; b) |AB| = 2r sin α,
 * |DE| = 2r tan α ; c) n sin α ≤ π ≤ n tan α (minorant arrondi par défaut, majorant par excès : un
 * encadrement reste vrai) ; d) même calcul avec 2n côtés ; e) largeurs successives jusqu'au seuil.
 * Valeurs approchées calculées depuis les valeurs non arrondies.
 */

type E = ExerciceArchimedePi;
const t = texte;
const f = latex;
const COURS = "(cours, § 1)";
const v5 = (x: number) => (exactA(x, 5) ? nbL(x, 5) : nbL(x, 5, true));

function rel(x: number, dec: number): string {
  return exactA(x, dec) ? `=${nbL(x, dec)}` : `\\approx ${nbL(x, dec, true)}`;
}

function etapeAngle(e: E): EtapeCorrection[] {
  const sq = "a";
  return [
    utilise(sq, [t(`Le polygone régulier découpe le cercle en ${e.n} triangles isocèles de même angle au centre ; la hauteur [CH] partage cet angle en deux ${COURS}.`)]),
    calcul(sq, [ligne(`\\widehat{ACB}=\\dfrac{360^\\circ}{${e.n}}=${degL(360 / e.n)}`, "angle au centre qui intercepte un côté"), ligne(`\\alpha=\\dfrac{${degL(360 / e.n)}}{2}=${degL(e.alphaDeg)}`, "la moitié")]),
    resultat(sq, reponse(e, "angle")),
    verification(sq, [t("En radians, "), f(`\\alpha=\\dfrac{\\pi}{${e.n}}`), t(".")]),
    piege(sq, [t("Garder l'angle au centre entier "), f(`\\dfrac{360^\\circ}{${e.n}}`), t(" au lieu de sa moitié.")]),
  ];
}

function etapeCotes(e: E): EtapeCorrection[] {
  const sq = "b";
  const a = degL(e.alphaDeg);
  const lignes: LigneCalcul[] = [
    ligne(`|AB|=2\\cdot ${e.r}\\cdot\\sin ${a}${rel(e.coteInscrit, 2)}`, "[HB] est opposé à α dans le triangle rectangle CHB"),
    ligne(`|DE|=2\\cdot ${e.r}\\cdot\\tan ${a}${rel(e.coteCirconscrit, 2)}`, "[FD] est opposé à α dans le triangle rectangle CFD"),
  ];
  return [
    utilise(sq, [t("Dans le triangle rectangle CHB, "), f("|HB|=r\\sin\\alpha"), t(" ; dans CFD, "), f("|FD|=r\\tan\\alpha"), t(" ; chaque côté vaut le double "), t(COURS), t(" : "), f("|AB|=2r\\sin\\alpha"), t(", "), f("|DE|=2r\\tan\\alpha"), t(".")]),
    calcul(sq, lignes, [t("Calculatrice en mode degré :")]),
    resultat(sq, reponse(e, "cotes")),
    verification(sq, [t("Le côté inscrit est plus court que le côté circonscrit, et l'arc entre A et B est compris entre les deux :")], [ligne(`\\dfrac{2\\pi\\cdot ${e.r}}{${e.n}}\\approx ${nbL((2 * Math.PI * e.r) / e.n, 2, true)}`, "longueur de l'arc AB")]),
    piege(sq, [t("Calculer avec la calculatrice en mode radian alors que "), f("\\alpha"), t(" est en degrés, ou oublier le facteur 2.")]),
  ];
}

function etapeEncadrement(_e: E, n: number, sq: string): EtapeCorrection[] {
  const a = degL(180 / n);
  const mi = minorantDe(n);
  const ma = majorantDe(n);
  const lignes: LigneCalcul[] = [];
  if (sq === "c") {
    lignes.push(ligne(`${n}\\cdot 2r\\sin\\alpha\\leq 2\\pi r\\leq ${n}\\cdot 2r\\tan\\alpha`, "périmètre inscrit ≤ périmètre du cercle ≤ périmètre circonscrit"));
    lignes.push(ligne(`${n}\\sin\\alpha\\leq\\pi\\leq ${n}\\tan\\alpha`, [t("on divise par "), f("2r")]));
  }
  lignes.push(ligne(`${n}\\sin ${a}${rel(mi, 5)}`, "minorant"));
  lignes.push(ligne(`${n}\\tan ${a}${rel(ma, 5)}`, "majorant"));
  return [
    utilise(sq, sq === "c"
      ? [t("Le périmètre du cercle est compris entre ceux des deux polygones ; on simplifie par "), f("2r"), t(" "), t(COURS), t(" : "), f("n\\sin\\alpha\\leq\\pi\\leq n\\tan\\alpha"), t(".")]
      : [t(`Même encadrement avec ${n} côtés : le demi-angle au centre vaut `), f(`\\dfrac{180^\\circ}{${n}}=${a}`), t(", la moitié du précédent.")]),
    calcul(sq, lignes),
    resultat(sq, [f(encadrementL(mi, ma))]),
    verification(sq, [t("Arrondir le minorant par défaut et le majorant par excès garde un encadrement vrai : "), f(`${milL(parDefaut(mi))}\\leq ${v5(mi)}`), t(" et "), f(`${v5(ma)}\\leq ${milL(parExces(ma))}`), t(sq === "d" ? " ; l'encadrement est plus serré qu'avec moitié moins de côtés." : ".")]),
    piege(sq, sq === "c" ? [t("Diviser par "), f("r"), t(" au lieu de "), f("2r"), t(" : on encadrerait "), f("2\\pi"), t(".")] : [t("Garder le même angle "), f("\\alpha"), t(" avec deux fois plus de côtés, ou doubler les bornes.")]),
  ];
}

function etapePrecision(e: E): EtapeCorrection[] {
  const sq = "e";
  const lignes: LigneCalcul[] = doublements(e).map((m) => {
    const w = largeurDe(m);
    const a = degL(180 / m);
    return ligne(`w_{${m}}=${m}\\tan ${a}-${m}\\sin ${a}\\approx ${largeurL(w)}`, w >= e.seuil ? `${m} côtés : encore au-dessus du seuil` : `${m} côtés : sous le seuil`);
  });
  const avant = e.nSeuil / 2;
  return [
    utilise(sq, [t("La largeur de l'encadrement à "), f("m"), t(" côtés vaut "), f("w_m=m\\tan\\dfrac{180^\\circ}{m}-m\\sin\\dfrac{180^\\circ}{m}"), t(" ; on la calcule à chaque doublement.")]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "precision")),
    verification(sq, [t("À "), f(`${avant}`), t(" côtés, "), f(`w_{${avant}}\\approx ${largeurL(largeurDe(avant))}`), t(" dépasse encore "), f(seuilL(e)), t(" ; à chaque doublement, la largeur est environ divisée par 4.")]),
    piege(sq, [t("S'arrêter un doublement trop tôt, ou donner le nombre de doublements au lieu du nombre de côtés.")]),
  ];
}

export function correctionDetailleeArchimedePi(e: E): EtapeCorrection[] {
  return [...etapeAngle(e), ...etapeCotes(e), ...etapeEncadrement(e, e.n, "c"), ...etapeEncadrement(e, 2 * e.n, "d"), ...etapePrecision(e)];
}
