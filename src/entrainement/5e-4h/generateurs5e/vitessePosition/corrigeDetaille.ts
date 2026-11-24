import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceVitessePosition } from "../../core5e/vitessePosition.types";
import { ordreEcransVitessePosition, type EcranVitessePosition } from "../../moteur5e/typesVitessePosition";
import { formatPositionLatex, formatReponseAttenduePhaseLatex, formatVitesseLatex } from "../../ui5e/formatVitessePosition";
import { COURS_VITESSE, approche, decimalExact, f, finaliserDerivees, lignesTrinome, nbT, q, qL, racineL, t } from "../../ui5e/corrigeDerivees2";
import { valeurVitesseExacte } from "./index";

/**
 * Corrigé détaillé « comme au tableau » de 5gen35 (vitesse et position) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`ordreEcransVitessePosition`) :
 * v = s′ dérivée terme à terme, a = v′, équation s(t) = D ramenée à t² + Bt + C = 0 et résolue par le
 * discriminant (vérification s(t) = D), rejet de la solution négative (décision), v(t₀) substituée,
 * conversion × 3,6 (A) ; ou second segment à vitesse constante D₂ = D − D₁, t₂ = D₂/v, et temps total
 * calculé avec t₂ non arrondi (B). SANS `docx` : importé par l'adaptateur ET par `App5gen35.tsx`.
 */

const LETTRES = "abcdefgh";

export function lettreEcranVitessePosition(exercice: ExerciceVitessePosition, ecran: EcranVitessePosition): string {
  return LETTRES[ordreEcransVitessePosition(exercice).indexOf(ecran)] ?? "a";
}

function rep(exercice: ExerciceVitessePosition, ecran: EcranVitessePosition) {
  return formatReponseAttenduePhaseLatex(exercice, ecran).map((x) => f(x));
}

/** s(t) sans « s(t)= ». */
function sDeT(exercice: ExerciceVitessePosition): string {
  return formatPositionLatex(exercice.a, exercice.b).replace("s(t)=", "");
}

function etapeDerivee(e: ExerciceVitessePosition, l: string): EtapeCorrection[] {
  const terme2 = e.a === 2 ? "2t" : "\\dfrac{1}{2}\\cdot 2t";
  const brut = e.b === 0 ? terme2 : `${terme2}+${e.b}`;
  const lignes: LigneCalcul[] = [
    ligne(`s(t)=${sDeT(e)}`, "distance parcourue (énoncé)"),
    ligne(`v(t)=s'(t)`, "la vitesse est la dérivée de la distance"),
    ligne(`=${brut}`, [t("terme à terme : "), f("(t^{2})'=2t"), t(e.b === 0 ? "" : ", "), ...(e.b === 0 ? [] : [f(`(${e.b}t)'=${e.b}`)])]),
    ligne(`=${formatVitesseLatex(e.a, e.b)}`),
  ];
  return [
    utilise(l, [t("La vitesse instantanée est la dérivée de la distance parcourue : "), f("v(t)=s'(t)"), t(", en m/s ; on dérive terme à terme "), t(COURS_VITESSE), t(".")]),
    calcul(l, lignes),
    resultat(l, [...rep(e, "derivee"), t(" (en m/s).")]),
  ];
}

function etapeAcceleration(e: ExerciceVitessePosition, l: string): EtapeCorrection[] {
  const lignes: LigneCalcul[] = [ligne(`v(t)=${formatVitesseLatex(e.a, e.b)}`, "étape précédente"), ligne(`a(t)=v'(t)`, "l'accélération est la dérivée de la vitesse"), ligne(`=${e.a}`, [t("car "), f(e.a === 1 ? "(t)'=1" : `(${e.a}t)'=${e.a}`), t(e.b === 0 ? "" : " et une constante a pour dérivée 0")])];
  return [
    utilise(l, [t("L'accélération est la dérivée de la vitesse : "), f("a(t)=v'(t)"), t(", en m/s² "), t(COURS_VITESSE), t(".")]),
    calcul(l, lignes),
    resultat(l, [...rep(e, "acceleration"), t(".")]),
  ];
}

function etapeResoudre(e: ExerciceVitessePosition, l: string): EtapeCorrection[] {
  const D = e.distanceCible;
  const B = e.a === 2 ? e.b : 2 * e.b;
  const C = e.a === 2 ? -D : -2 * D;
  const termeT = (k: number) => (k === 0 ? "" : k === 1 ? "+t" : `+${k}t`);
  const lignes: LigneCalcul[] = [ligne(`${sDeT(e)}=${D}`, [f(`s(t)=${D}`)])];
  if (e.a === 1) lignes.push(ligne(`t^{2}${termeT(2 * e.b)}=${2 * D}`, "on multiplie les deux membres par 2"));
  const sol = lignesTrinome(1, B, C, "t");
  if (B === 0) {
    lignes.push(ligne(`t=\\pm\\sqrt{${-C}}`, [f(`t^{2}=k`), t(" avec k > 0 : deux solutions opposées")]));
    lignes.push(ligne(`=\\pm ${e.tCible}`, [t("car "), f(`${e.tCible}^{2}=${-C}`)]));
  } else {
    lignes.push(ligne(`t^{2}${termeT(B)}-${-C}=0`, "on ramène tout dans le membre de gauche"));
    lignes.push(...sol.lignes);
  }
  const verif: LigneCalcul[] = [
    ligne(`s(${e.tCible})=${e.a === 2 ? `${e.tCible}^{2}` : `\\dfrac{1}{2}\\cdot ${e.tCible}^{2}`}${e.b === 0 ? "" : `+${e.b === 1 ? "" : `${e.b}\\cdot `}${e.tCible}`}`, `on remplace t par ${e.tCible}`),
    ligne(`=${(e.a / 2) * e.tCible * e.tCible}${e.b === 0 ? "" : `+${e.b * e.tCible}`}`),
    ligne(`=${D}`),
  ];
  const racines = sol.racines.length ? sol.racines.map((r) => racineL(r)) : [`${e.racineRejetee}`, `${e.tCible}`];
  return [
    utilise(l, B === 0 ? [t("On résout "), f(`s(t)=${D}`), t(" : c'est une équation de la forme "), f("t^2=k"), t(" (k > 0), qui a deux solutions opposées "), f("\\pm\\sqrt{k}"), t(" "), t(COURS_VITESSE), t(".")] : [t("On résout "), f(`s(t)=${D}`), t(" : on ramène l'équation à la forme "), f("t^2+bt+c=0"), t(", puis on utilise le discriminant "), f("\\Delta=b^2-4ac"), t(" "), t(COURS_VITESSE), t(".")]),
    calcul(l, lignes),
    resultat(l, [t("Deux solutions : "), f(`t=${racines[0]}`), t(" et "), f(`t=${racines[1]}`), t(".")]),
    verification(l, [t("La solution positive vérifie l'équation :")], verif),
  ];
}

function etapeRejet(e: ExerciceVitessePosition, l: string): EtapeCorrection[] {
  return [
    utilise(l, [t("t est le temps écoulé depuis le départ (en s) : seule une solution positive a un sens dans ce contexte "), t(COURS_VITESSE), t(".")]),
    calcul(l, [ligne(`t=${e.racineRejetee}<0`, "un temps négatif précède le départ : solution rejetée"), ligne(`t=${e.tCible}>0`, "solution retenue")]),
    resultat(l, [...rep(e, "rejet"), t(" ; on retient "), f(`t=${e.tCible}\\text{ s}`), t(".")]),
    piege(l, [t("Les deux solutions vérifient l'équation : on rejette l'une d'elles parce qu'elle n'a pas de sens physique, pas parce qu'elle serait fausse.")]),
  ];
}

function etapeVitessePointe(e: ExerciceVitessePosition, l: string): EtapeCorrection[] {
  const v = valeurVitesseExacte(e, e.tCible);
  const produit = e.a === 1 ? `${e.tCible}` : `${e.a}\\cdot ${e.tCible}`;
  const lignes: LigneCalcul[] = [ligne(`v(${e.tCible})=${e.b === 0 ? produit : `${produit}+${e.b}`}`, [t("on remplace t par "), f(`${e.tCible}`), t(" dans "), f(`v(t)=${formatVitesseLatex(e.a, e.b)}`)])];
  if (e.a !== 1 && e.b !== 0) lignes.push(ligne(`=${e.a * e.tCible}+${e.b}`));
  lignes.push(ligne(`=${v}`));
  return [
    utilise(l, [t("La vitesse atteinte à l'instant "), f(`t=${e.tCible}`), t(" est la vitesse instantanée "), f(`v(${e.tCible})`), t(" "), t(COURS_VITESSE), t(".")]),
    calcul(l, lignes),
    resultat(l, [...rep(e, "vitessePointe"), t(".")]),
    piege(l, [t("Évaluer s au lieu de v, ou calculer une vitesse moyenne (distance ÷ durée) : la vitesse atteinte est la vitesse instantanée "), f(`v(${e.tCible})`), t(".")]),
  ];
}

function etapeConversion(e: ExerciceVitessePosition, l: string): EtapeCorrection[] {
  const v = valeurVitesseExacte(e, e.tCible);
  const kmh = v * 3.6;
  return [
    utilise(l, [t("1 m/s = 3 600 m par heure = 3,6 km/h : on multiplie par 3,6 "), t(COURS_VITESSE), t(".")]),
    calcul(l, [ligne(`v=${v}\\text{ m/s}`, "étape précédente"), ligne(`=${v}\\times 3{,}6\\text{ km/h}`, "1 m/s = 3,6 km/h"), ligne(`${decimalExact(kmh, 1) ? "=" : "\\approx "}${approche(kmh, decimalExact(kmh, 0) ? 0 : 1)}\\text{ km/h}`)]),
    resultat(l, [...rep(e, "conversion"), t(".")]),
  ];
}

function etapeSegment(e: ExerciceVitessePosition, l: string): EtapeCorrection[] {
  if (e.variante !== "B") return [];
  const v = valeurVitesseExacte(e, e.tCible);
  const t2 = q(e.D2, v);
  const lignes: LigneCalcul[] = [
    ligne(`D_2=D-D_1`, "longueur du second segment"),
    ligne(`=${e.D}-${e.distanceCible}`),
    ligne(`=${e.D2}`),
    ligne(`t_2=\\dfrac{D_2}{v}`, "à vitesse constante, durée = distance ÷ vitesse"),
    ligne(`=\\dfrac{${e.D2}}{${v}}`, [t("vitesse atteinte : "), f(`v(${e.tCible})=${v}`), t(" m/s")]),
  ];
  if (t2.d !== v && t2.d !== 1) lignes.push(ligne(`=${qL(t2)}`, "on simplifie"));
  const val = e.D2 / v;
  lignes.push(ligne(`${decimalExact(val, 1) ? "=" : "\\approx "}${approche(val, 1)}`, decimalExact(val, 1) ? undefined : "arrondi au dixième"));
  return [
    utilise(l, [t("Sur le second segment, la vitesse est constante (égale à la vitesse atteinte) : "), f("s(t)"), t(" ne s'applique plus, et durée = distance ÷ vitesse "), t(COURS_VITESSE), t(".")]),
    calcul(l, lignes),
    resultat(l, [...rep(e, "segmentConstant"), t(".")]),
    piege(l, [t("Utiliser encore "), f("s(t)"), t(" sur le second segment : la vitesse y est constante, le modèle du premier segment ne s'applique plus.")]),
  ];
}

function etapeTempsTotal(e: ExerciceVitessePosition, l: string): EtapeCorrection[] {
  if (e.variante !== "B") return [];
  const v = valeurVitesseExacte(e, e.tCible);
  const total = q(e.tCible * v + e.D2, v);
  const val = e.tCible + e.D2 / v;
  const lignes: LigneCalcul[] = [
    ligne(`t_{\\text{total}}=${e.tCible}+t_2`, "durée du premier segment (solution retenue) + durée du second"),
    ligne(`=${e.tCible}+\\dfrac{${e.D2}}{${v}}`, [t("avec "), f(`t_2`), t(" non arrondi")]),
  ];
  if (v !== 1) lignes.push(ligne(`=\\dfrac{${e.tCible * v}+${e.D2}}{${v}}`, "même dénominateur"));
  lignes.push(ligne(`=${qL(total)}`));
  lignes.push(ligne(`${decimalExact(val, 1) ? "=" : "\\approx "}${approche(val, 1)}`, decimalExact(val, 1) ? undefined : "arrondi au dixième"));
  return [
    utilise(l, [t("Le temps total est la somme de la durée du premier segment (solution retenue) et de "), f("t_2"), t(" ; on additionne les valeurs exactes et on arrondit à la fin "), t(COURS_VITESSE), t(".")]),
    calcul(l, lignes.filter((x, i, a) => i === 0 || x.latex !== a[i - 1].latex)),
    resultat(l, [...rep(e, "tempsTotal"), t(".")]),
  ];
}

export function correctionDetailleeVitessePosition(e: ExerciceVitessePosition): EtapeCorrection[] {
  const l = (ecran: EcranVitessePosition) => lettreEcranVitessePosition(e, ecran);
  const etapes: EtapeCorrection[] = [
    ...etapeDerivee(e, l("derivee")),
    ...etapeAcceleration(e, l("acceleration")),
    ...etapeResoudre(e, l("resoudre")),
    ...etapeRejet(e, l("rejet")),
    ...etapeVitessePointe(e, l("vitessePointe")),
  ];
  if (e.variante === "A") etapes.push(...etapeConversion(e, l("conversion")));
  else etapes.push(...etapeSegment(e, l("segmentConstant")), ...etapeTempsTotal(e, l("tempsTotal")));
  return finaliserDerivees(etapes);
}

/** Écran « rejet » : décision sans calcul (lecture du signe), compté comme une lecture. */
export function lettresLectureVitessePosition(e: ExerciceVitessePosition): string[] {
  return [lettreEcranVitessePosition(e, "rejet")];
}

export { nbT };
