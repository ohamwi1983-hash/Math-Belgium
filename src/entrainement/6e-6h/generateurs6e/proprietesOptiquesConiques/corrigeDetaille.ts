import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { lettreEtape } from "../../../export/corrigeTableau";
import type { ExerciceProprietesOptiquesConiques } from "../../core6e/proprietesOptiquesConiques.types";
import { phasesPourExercice } from "../../moteur6e/typesProprietesOptiquesConiques";
import type { PhaseProprietesOptiquesConiques } from "../../moteur6e/typesProprietesOptiquesConiques";
import { latexDroite, latexPoint, latexQ, q, qAdd, qDiv, qMul, qNeg, qNum, qSub } from "../../moteur6e/algebreLieux";
import type { Droite, Pt } from "../../moteur6e/algebreLieux";
import { c2Conique } from "../../moteur6e/algebreConiques";
import { calcul, finaliserCombinatoire, fx, ligne, piege, resultat, utiliseCours, verification } from "../../ui6e/corrigeCombinatoire";
import { lignesDroiteDeuxPoints } from "../../ui6e/corrigeLieux";
import { COURS_IDENTIFIER, COURS_OPTIQUE, avecFigureConique, carreL, decale, lignesDiscriminant, lignesSolutions, ligneRacine, milliersDans, parQ, trinome, yMK } from "../../ui6e/corrigeConiques";
import { figure6gen63 } from "../../ui6e/formatProprietesOptiquesConiques";
import { entiers, quadratique } from "../intersectionsConiques";

/**
 * Corrigé détaillé « comme au tableau » de `6gen63` (propriétés optiques des coniques, 6e ch. 10, § 6,
 * processus 3 TRANSFÉRER ; audit, lot E), une lettre par écran — même source pour l'écran et le papier.
 * Foyers (c² = a² ∓ b², ou F(p/2 ; 0) pour y² = 2px), rayon incident écrit puis substitué dans l'équation
 * du miroir, point d'impact choisi par le SENS de propagation (l'autre point commun est derrière la
 * source), propriété optique du cours, droite du rayon réfléchi et la PARTIE de cette droite que parcourt
 * le rayon (demi-droite ; pour l'hyperbole, elle s'éloigne de F′, c'est son prolongement qui passe par F′).
 * FIGURE du trajet sous le dernier résultat.
 */

type E = ExerciceProprietesOptiquesConiques;
type P = PhaseProprietesOptiquesConiques;

const lq = latexQ;
const L = (e: E, p: P) => lettreEtape(phasesPourExercice(e).indexOf(p));
const figure = (e: E) => figure6gen63(e, phasesPourExercice(e));

/** « y = mx + k » d'une droite non verticale, sinon « x = … ». */
export function droiteLatex(d: Droite): string {
  if (d.b === 0n) return `x=${lq(q(-d.c, d.a))}`;
  return yMK(q(-d.a, d.b), q(-d.c, d.b));
}

/** Partie de la droite réfléchie que parcourt le rayon (texte avec formules). */
export function trajetReflechi(e: E): string {
  switch (e.propriete) {
    case "passeParFp":
      return "la demi-droite d'origine $R$ qui passe par $F'$ : le rayon réfléchi passe par l'autre foyer";
    case "semblaVenirDeFp":
      return "la demi-droite d'origine $R$ qui s'éloigne de $F'$ : le rayon réfléchi semble venir de $F'$ (c'est son prolongement qui passe par $F'$)";
    case "paralleleAxe":
      return "la demi-droite d'origine $R$ parallèle à l'axe focal, dirigée vers les abscisses croissantes (vers l'ouverture de la parabole)";
    default:
      return "la demi-droite d'origine $R$ qui passe par le foyer $F$";
  }
}

function corrigeFoyers(e: E, a: string): EtapeCorrection[] {
  const c = e.conique;
  if (c.type === "parabole") {
    return [
      utiliseCours(a, fx("Parabole $y^2=2px$ ($p>0$) : le foyer est $F\\left(\\frac{p}{2}\\,;0\\right)$"), COURS_IDENTIFIER),
      calcul(a, [ligne(`2p=${lq(qMul(q(2), c.p))}`, "coefficient de x"), ligne(`p=${lq(c.p)}`), ligne(`\\dfrac{p}{2}=${lq(qDiv(c.p, q(2)))}`)]),
      resultat(a, fx(`Le foyer est $F${latexPoint(e.F)}$.`)),
    ];
  }
  if (c.type !== "ellipse" && c.type !== "hyperbole") return [];
  const c2 = c2Conique(c);
  const op = c.type === "ellipse" ? "-" : "+";
  return [
    utiliseCours(a, fx(`Les foyers sont sur l'axe focal (ici l'axe des abscisses), à la distance $c$ du centre, avec $c^2=a^2${op}b^2$ (${c.type})`), COURS_IDENTIFIER),
    calcul(a, [ligne(`c^2=${lq(c.a2)}${op}${lq(c.b2)}=${lq(c2)}`), ligneRacine("c", c2)]),
    resultat(a, fx(`$F${latexPoint(e.F)}$ (le foyer d'abscisse négative, d'où part le rayon) et $F'${latexPoint(e.Fp!)}$.`)),
  ];
}

function corrigeImpact(e: E, b: string): EtapeCorrection[] {
  if (e.mode === "parallele") {
    const c = e.conique as Extract<E["conique"], { type: "parabole" }>;
    const deuxP = qMul(q(2), c.p);
    return [
      utiliseCours(b, fx("Le point d'impact est sur la droite du rayon et sur le miroir : on remplace $y$ dans l'équation de $\\Gamma$"), COURS_OPTIQUE),
      calcul(b, [ligne(`${carreL(e.R.y)}=${lq(deuxP)}x`, `on remplace y par ${e.R.y.n < 0n ? "−" + lq(qNeg(e.R.y)) : lq(e.R.y)}`), ligne(`x=\\dfrac{${lq(qMul(e.R.y, e.R.y))}}{${lq(deuxP)}}=${lq(e.R.x)}`)]),
      resultat(b, fx(`Le rayon atteint le miroir en $R${latexPoint(e.R)}$.`)),
    ];
  }
  const k = qSub(e.F.y, qMul(e.m, e.F.x));
  const eq = entiers(quadratique(e.conique, e.m, k));
  const disc = lignesDiscriminant(eq, "x");
  const sol = lignesSolutions(eq, "x");
  const xs = sol.sol;
  const sensTexte = e.sens > 0 ? "les abscisses croissantes" : "les abscisses décroissantes";
  const devant = xs.filter((x) => (qNum(x) - qNum(e.F.x)) * e.sens > 1e-12);
  const lignes: LigneCalcul[] = [
    ligne(`y=${lq(e.m)}\\left(${decale("x", e.F.x)}\\right)`, "droite de pente m qui passe par F"),
    ligne(yMK(e.m, k), "on développe"),
    ligne(milliersDans(trinome(q(eq[0]), q(eq[1]), q(eq[2]))), "on remplace y dans l'équation de Γ, on développe et on simplifie"),
    ...disc.lignes,
    ...sol.lignes,
    ligne(`y_R=${lq(e.m)}\\cdot ${parQ(e.R.x)}${k.n === 0n ? "" : `${k.n < 0n ? "-" : "+"}${lq(k.n < 0n ? qNeg(k) : k)}`}=${lq(e.R.y)}`, "ordonnée du point retenu"),
  ];
  return [
    utiliseCours(b, fx(`Le rayon suit la droite de pente $m=${lq(e.m)}$ issue de $F$ ; ses points communs avec le miroir s'obtiennent en remplaçant $y$ dans l'équation de $\\Gamma$ (cours, point 4) ; le rayon va vers ${sensTexte} : il atteint le point commun situé de ce côté de $F$`), COURS_OPTIQUE),
    calcul(b, lignes),
    resultat(b, fx(`${devant.length === 1 ? `Seule l'abscisse $${lq(e.R.x)}$ est du côté où va le rayon` : `Le rayon atteint d'abord le point d'abscisse $${lq(e.R.x)}$`} : le rayon atteint le miroir en $R${latexPoint(e.R)}$${e.autre ? ` (l'autre point commun, $${latexPoint(e.autre)}$, n'est pas sur son trajet)` : ""}.`)),
  ];
}

const PROPRIETE: Record<string, string> = {
  passeParFp: "Ellipse : un rayon issu d'un foyer se réfléchit en passant par l'autre foyer $F'$.",
  semblaVenirDeFp: "Hyperbole : un rayon issu d'un foyer se réfléchit comme s'il venait de l'autre foyer $F'$ ; il s'éloigne de $F'$, et c'est son prolongement qui passe par $F'$.",
  paralleleAxe: "Parabole : un rayon issu du foyer se réfléchit parallèlement à l'axe focal (principe du phare).",
  passeParF: "Parabole : un rayon parallèle à l'axe se réfléchit en passant par le foyer (principe de l'antenne parabolique).",
};

function corrigeReflechi(e: E, d: string): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  let lignes: LigneCalcul[];
  let droite: string;
  if (e.propriete === "paralleleAxe") {
    lignes = [ligne(`y=${lq(e.R.y)}`, "parallèle à l'axe des abscisses, passe par R")];
    droite = `y=${lq(e.R.y)}`;
  } else {
    const cible: Pt = e.propriete === "passeParF" ? e.F : e.Fp!;
    const nom = e.propriete === "passeParF" ? "F" : "F'";
    const r = lignesDroiteDeuxPoints(e.R, cible, "R", nom);
    lignes = r.lignes;
    droite = droiteLatex(r.droite);
    if (droite !== latexDroite(r.droite)) lignes.push(ligne(droite, "on isole y"));
  }
  out.push(
    utiliseCours(d, fx(e.propriete === "paralleleAxe" ? "Le rayon réfléchi passe par $R$ et est parallèle à l'axe focal" : `Le rayon réfléchi est porté par la droite $(R${e.propriete === "passeParF" ? "F" : "F'"})$`), COURS_OPTIQUE),
    calcul(d, lignes),
    avecFigureConique(resultat(d, fx(`Le rayon réfléchi est porté par la droite $${droite}$ ; il parcourt ${trajetReflechi(e)}.`)), figure(e)),
  );
  return out;
}

function piegeDe(e: E): (sq: string) => EtapeCorrection {
  if (e.propriete === "semblaVenirDeFp") return (sq) => piege(sq, fx("Le rayon réfléchi par l'hyperbole ne passe pas par $F'$ : il s'en éloigne, seul son prolongement passe par $F'$."));
  if (e.mode === "parallele") return (sq) => piege(sq, fx("Le foyer de $y^2=2px$ est à la distance $\\frac{p}{2}$ du sommet, pas $p$."));
  return (sq) => piege(sq, fx("La droite du rayon coupe le miroir en deux points : seul celui qui est du côté où va le rayon est le point d'impact."));
}

export function correctionDetailleeProprietesOptiquesConiques(e: E): EtapeCorrection[] {
  const a = L(e, "foyers");
  const b = L(e, "impact");
  const c = L(e, "propriete");
  const d = L(e, "reflechi");
  const pg = piegeDe(e);
  const sqPiege = e.propriete === "semblaVenirDeFp" ? d : e.mode === "parallele" ? a : b;
  const verif = [verification(b, fx(`$R$ est bien sur le miroir : $${verifR(e)}$.`))];
  return finaliserCombinatoire([
    ...corrigeFoyers(e, a),
    ...corrigeImpact(e, b),
    ...verif,
    utiliseCours(c, fx("Propriétés optiques du cours"), COURS_OPTIQUE),
    resultat(c, fx(PROPRIETE[e.propriete])),
    ...corrigeReflechi(e, d),
    pg(sqPiege),
  ]);
}

/** « R vérifie l'équation du miroir », calculé avec ses coordonnées exactes. */
function verifR(e: E): string {
  const c = e.conique;
  if (c.type === "parabole") return `${carreL(e.R.y)}=${lq(qMul(e.R.y, e.R.y))}=${lq(qMul(q(2), c.p))}\\cdot ${parQ(e.R.x)}`;
  if (c.type !== "ellipse" && c.type !== "hyperbole") return "";
  const v = qAdd(qDiv(qMul(e.R.x, e.R.x), c.a2), qMul(q(c.type === "ellipse" ? 1 : -1), qDiv(qMul(e.R.y, e.R.y), c.b2)));
  return `\\dfrac{${carreL(e.R.x)}}{${lq(c.a2)}}${c.type === "ellipse" ? "+" : "-"}\\dfrac{${carreL(e.R.y)}}{${lq(c.b2)}}=${lq(v)}`;
}
