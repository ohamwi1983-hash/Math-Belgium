import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceIntersectionCercles } from "../../core/intersectionCercles.types";
import { developpe, difference, substitutionCercles, substitutionParabole, type Substitution } from "../../moteur/modeleIntersectionCercles";
import { mono, q, somme } from "../../ui/corrigeChapitre3";
import { carreL, figureCorrige, produitParaboleL, reponsePoints, reponseRacines } from "../../ui/formatIntersectionCercles";
import { equationL, l, membreDroite, n, nbp, nombreTexte, plusTerme, produitTerme, t, termeProduit, valeurSubst, type Fr } from "../../ui/outilsAnalytiqueLotG";

/**
 * Corrigé détaillé « comme au tableau » de gen98 (partagé par l'adaptateur et l'appli, une lettre par
 * écran). Cercle-cercle : a) soustraction terme à terme (x² et y² disparaissent), droite simplifiée ;
 * b) coordonnée isolée, substitution dans c₁, développement, réduction, discriminant, solutions ;
 * c) autre coordonnée par la droite, vérification dans c₂, figure. Cercle-parabole : a) le carré
 * commun remplacé ; b) développement, réduction, discriminant, solutions ; c) chaque solution testée
 * (carré négatif rejeté, nul : le sommet, positif : deux points), vérification dans le cercle, figure.
 */

type E = ExerciceIntersectionCercles;
const COURS = "(cours, § 10)";

/** « -4x-(2x)=-6x » : une colonne de la soustraction. */
function ligneDifference(c1: number, c2: number, partie: string, nom: string): LigneCalcul | null {
  if (c1 === 0 && c2 === 0) return null;
  const terme = (c: number) => (c === 0 ? "0" : mono(c, partie));
  const droite = c2 < 0 ? `(${terme(c2)})` : terme(c2);
  return ligne(`${terme(c1)}-${droite}=${terme(c1 - c2)}`, nom);
}

function expressionV(s: Substitution): string {
  return s.m === 0 ? n(s.p) : `${s.m === 1 ? "" : s.m === -1 ? "-" : n(s.m)}${s.u}${plusTerme(s.p)}`;
}

function lignesDiscriminant(A: number, B: number, C: number, u: string): LigneCalcul[] {
  if (B === 0) {
    // Pas de terme du premier degré : on isole le carré.
    const v = -C / A;
    const lignes: LigneCalcul[] = [];
    if (C !== 0) lignes.push(ligne(`${mono(A, `${u}^2`)}=${n(-C)}`, `on ${C > 0 ? "retire" : "ajoute"} ${nombreTexte(Math.abs(C))} aux deux membres`));
    if (A !== 1) lignes.push(ligne(`${u}^2=${q(v)}`, `on divise par ${nombreTexte(A)}`));
    if (v < 0) lignes.push(ligne(`${q(v)}<0`, "un carré n'est jamais négatif : aucune solution"));
    else if (v === 0) lignes.push(ligne(`${u}=0`, "seul nombre de carré nul"));
    else lignes.push(ligne(`${u}_1=-${n(Math.sqrt(v))}`, "les deux nombres dont le carré vaut " + nombreTexte(v)), ligne(`${u}_2=${n(Math.sqrt(v))}`));
    return lignes;
  }
  const delta = B * B - 4 * A * C;
  const lignes: LigneCalcul[] = [ligne(`\\Delta=${nbp(B)}^2-4\\cdot ${nbp(A)}\\cdot ${nbp(C)}`, [t("discriminant de "), l(`a${u}^2+b${u}+c=0`)]), ligne(`=${n(delta)}`, delta < 0 ? "négatif : aucune solution réelle" : delta === 0 ? "nul : une solution double" : "positif : deux solutions")];
  if (delta > 0) {
    const r = Math.sqrt(delta);
    lignes.push(ligne(`${u}_1=\\dfrac{${n(-B)}-${n(r)}}{${n(2 * A)}}`), ligne(`=${q((-B - r) / (2 * A))}`), ligne(`${u}_2=\\dfrac{${n(-B)}+${n(r)}}{${n(2 * A)}}`), ligne(`=${q((-B + r) / (2 * A))}`));
  } else if (delta === 0) lignes.push(ligne(`${u}=\\dfrac{${n(-B)}}{${n(2 * A)}}`), ligne(`=${q(-B / (2 * A))}`));
  return lignes;
}

/** k(r − u_S) écrit avec la valeur de r : « 4(-5-1) », « -5-2 », « -(-5) ». */
function valeurParabole(k: number, r: number, uS: number): string {
  const inner = uS === 0 ? null : `${n(r)}${plusTerme(-uS)}`;
  if (inner === null) return k === 1 ? n(r) : k === -1 ? `-${nbp(r)}` : `${q(k)}\\cdot ${nbp(r)}`;
  return k === 1 ? inner : k === -1 ? `-(${inner})` : `${q(k)}(${inner})`;
}

/** Première racine non nulle (une vérification avec 0 ne prouve rien de lisible). */
function racineAVerifier(racines: number[]): number | undefined {
  return racines.find((r) => r !== 0);
}

function verificationRacine(A: number, B: number, C: number, u: string, r: number, lettre: string): EtapeCorrection {
  return verification(lettre, [l(`${u}=${n(r)}`), t(" vérifie l'équation :")], [ligne(`${termeProduit(A, r * r, true)}${termeProduit(B, r)}${plusTerme(C)}=0`, [t("car "), l(`${nbp(r)}^2=${n(r * r)}`)])]);
}

function correctionCercles(e: E): EtapeCorrection[] {
  const d1 = developpe(e.c1);
  const d2 = developpe(e.c2!);
  const { brute, normale } = difference(e.c1, e.c2!);
  const s = substitutionCercles(e.c1, normale)!;
  const lignesA = [ligneDifference(d1.D, d2.D, "x", "termes en x"), ligneDifference(d1.E, d2.E, "y", "termes en y"), ligneDifference(d1.F, d2.F, "", "termes constants")].filter((x): x is LigneCalcul => x !== null);
  lignesA.push(ligne(`${membreDroite(brute)}=0`, [l("x^2"), t(" et "), l("y^2"), t(" ont disparu")]));
  const g = brute.a !== 0 ? brute.a / normale.a : brute.b / normale.b;
  if (g !== 1) lignesA.push(ligne(`${equationL(normale)}`, `on divise par ${nombreTexte(g)}`));
  const [A, B, C] = s.brut;
  const [A2, B2, C2] = s.reduit;
  const vx = expressionV(s);
  const E1 = s.u === "x" ? d1.E : d1.D;
  const D1u = s.u === "x" ? d1.D : d1.E;
  // c₁ réécrite avec u et v : u² + v² + D_u·u + E_v·v + F = 0, v remplacé.
  const carreDev = somme([
    [s.m * s.m, `${s.u}^2`],
    [2 * s.m * s.p, s.u],
    [s.p * s.p, ""],
  ]);
  const prodDev = somme([
    [E1 * s.m, s.u],
    [E1 * s.p, ""],
  ]);
  const lignesB: LigneCalcul[] = [
    ligne(`${s.v}=${vx}`, `on isole ${s.v} dans l'équation de d`),
    ligne(`${s.u}^2+(${vx})^2${plusTerme(D1u, s.u)}${E1 === 0 ? "" : produitTerme(E1, vx)}${plusTerme(d1.F)}=0`, [t("on remplace "), l(s.v), t(" dans "), l("c_1")]),
  ];
  if (s.m !== 0) lignesB.push(ligne(`(${vx})^2=${carreDev}`, "on développe le carré"));
  if (E1 !== 0 && s.m !== 0) lignesB.push(ligne(`${produitTerme(E1, vx, true)}=${prodDev}`, "on distribue"));
  lignesB.push(ligne(`${somme([[A, `${s.u}^2`], [B, s.u], [C, ""]])}=0`, "on réduit"));
  if (s.g !== 1) lignesB.push(ligne(`${somme([[A2, `${s.u}^2`], [B2, s.u], [C2, ""]])}=0`, `on divise par ${nombreTexte(s.g)}`));
  lignesB.push(...lignesDiscriminant(A2, B2, C2, s.u));
  const sortie: EtapeCorrection[] = [
    utilise("a", [t("Un point commun vérifie les deux équations, donc aussi leur différence : en soustrayant membre à membre, "), l("x^2"), t(" et "), l("y^2"), t(" disparaissent et il reste l'équation d'une droite qui contient les points communs "), t(COURS), t(".")]),
    calcul("a", lignesA),
    resultat("a", [l(`d\\equiv ${equationL(e.radicale!)}`)]),
    piege("a", [t("On soustrait chaque terme, constante comprise : "), l("F_1-F_2"), t(" et non "), l("F_1+F_2"), t(".")]),
    utilise("b", [t("On isole la coordonnée de coefficient ±1 dans l'équation de d, puis on remplace dans l'équation de "), l("c_1"), t(" : on obtient une équation du second degré, résolue par le discriminant.")]),
    calcul("b", lignesB),
    resultat("b", reponseRacines(e)),
  ];
  { const r0 = racineAVerifier(s.racines); if (r0 !== undefined) sortie.push(verificationRacine(A2, B2, C2, s.u, r0, "b")); }
  sortie.push(piege("b", [t("La droite seule ne suffit pas : ses points ne sont pas tous sur les cercles. C'est l'équation du second degré qui donne les points communs.")]));
  const lignesC: LigneCalcul[] = [];
  if (s.racines.length === 0) lignesC.push(ligne(`\\Delta=${n(s.delta)}<0`, "aucune solution : aucun point commun"));
  s.racines.forEach((r, i) => {
    const nom = s.racines.length === 1 ? s.v : `${s.v}_${i + 1}`;
    lignesC.push(ligne(`${nom}=${valeurSubst(s.p, s.m, r)}`, [t("avec "), l(`${s.u}=${n(r)}`)]), ligne(`=${n(s.m * r + s.p)}`));
  });
  sortie.push(utilise("c", [t("Chaque solution donne un point commun : son autre coordonnée se calcule avec l'équation de la droite d.")]), calcul("c", lignesC), { ...resultat("c", reponsePoints(e)), figureHtml: figureCorrige(e) });
  if (e.points.length > 0) {
    const P = e.points[0]!;
    sortie.push(verification("c", [t("Le point "), l(`(${n(P.x)}\\,;${n(P.y)})`), t(" est aussi sur "), l("c_2"), t(" :")], [ligne(`${nbp(P.x)}^2+${nbp(P.y)}^2${termeProduit(d2.D, P.x)}${termeProduit(d2.E, P.y)}${plusTerme(d2.F)}=0`, "il vérifie l'équation de c₂")]));
  }
  sortie.push(piege("c", [t("Un point a deux coordonnées : il faut calculer l'autre coordonnée pour chaque solution.")]));
  return sortie;
}

function correctionParabole(e: E): EtapeCorrection[] {
  const s = substitutionParabole(e);
  const carreV = carreL(s.v, s.vS);
  const second = produitParaboleL(s.k, s.u, s.uS);
  const u = s.u;
  const lignesB: LigneCalcul[] = [
    ligne(`${second}+${carreL(u, s.b)}=${n(s.R)}`, "équation obtenue à l'étape 1"),
    ligne(`${somme([[s.k, u], [-s.k * s.uS, ""]])}+${somme([[1, `${u}^2`], [-2 * s.b, u], [s.b * s.b, ""]])}=${n(s.R)}`, "on développe"),
    ligne(`${somme([[1, `${u}^2`], [s.B, u], [s.C, ""]])}=0`, "on réduit"),
    ...lignesDiscriminant(1, s.B, s.C, u),
  ];
  const lignesC: LigneCalcul[] = [];
  if (s.racines.length === 0) lignesC.push(ligne(`\\Delta=${n(s.delta)}<0`, "aucune solution : aucun point commun"));
  s.racines.forEach((r, i) => {
    const c = s.carres[i]!;
    const expr = valeurParabole(s.k, r, s.uS);
    const avec: Fr = [t("avec "), l(`${u}=${n(r)}`), t(" : valeur de "), l(carreV)];
    const direct = expr === n(c);
    if (!direct) lignesC.push(ligne(`${expr}=${n(c)}`, avec));
    const just = (texteSuite: string): Fr => (direct ? [...avec, t(` ; ${texteSuite}`)] : [t(texteSuite)]);
    if (c < 0) lignesC.push(ligne(`${n(c)}<0`, just("un carré n'est jamais négatif : valeur rejetée")));
    else if (c === 0) lignesC.push(ligne(`${s.v}=${n(s.vS)}`, just("carré nul : un seul point, le sommet")));
    else {
      const rc = Math.sqrt(c);
      lignesC.push(ligne(`${s.v}_1=${n(s.vS)}-${n(rc)}`, direct ? just(`les deux racines de ${nombreTexte(c)}`) : [t("on prend les deux racines de "), l(n(c))]), ligne(`=${n(s.vS - rc)}`), ligne(`${s.v}_2=${n(s.vS)}+${n(rc)}`), ligne(`=${n(s.vS + rc)}`));
    }
  });
  const sortie: EtapeCorrection[] = [
    utilise("a", [t("Le carré "), l(carreV), t(" apparaît dans les deux équations : on le remplace, dans l'équation du cercle, par son expression tirée de la parabole. Il reste une équation du second degré à une seule inconnue "), t(COURS), t(".")]),
    calcul("a", [ligne(`${carreV}=${second}`, "équation de la parabole"), ligne(`${second}+${carreL(u, s.b)}=${n(s.R)}`, "on remplace le carré dans l'équation du cercle")]),
    resultat("a", [t("On remplace "), l(carreV), t(" par "), l(second), t(" dans l'équation du cercle.")]),
    piege("a", [t(`Isoler ${u} dans l'équation de la parabole mènerait à une équation de degré 4 : c'est le carré commun qu'on remplace.`)]),
    utilise("b", [t("On développe, on réduit, puis on résout l'équation du second degré par le discriminant.")]),
    calcul("b", lignesB),
    resultat("b", reponseRacines(e)),
  ];
  { const r0 = racineAVerifier(s.racines); if (r0 !== undefined) sortie.push(verificationRacine(1, s.B, s.C, u, r0, "b")); }
  sortie.push(
    piege("b", [t("À cet écran, on garde toutes les solutions de l'équation : le tri se fait à l'étape suivante.")]),
    utilise("c", [t("Pour chaque solution, l'équation de la parabole donne "), l(carreV), t(" : négatif, aucun point (un carré n'est jamais négatif) ; nul, un point (le sommet) ; positif, deux points symétriques par rapport à l'axe.")]),
    calcul("c", lignesC),
    { ...resultat("c", reponsePoints(e)), figureHtml: figureCorrige(e) },
  );
  if (e.points.length > 0) {
    const P = e.points[0]!;
    const C0 = e.c1.centre;
    sortie.push(verification("c", [t("Le point "), l(`(${n(P.x)}\\,;${n(P.y)})`), t(" est sur le cercle :")], [ligne(`${nbp(P.x - C0.x)}^2+${nbp(P.y - C0.y)}^2=${n(e.c1.R)}`, "il vérifie l'équation du cercle")]));
  }
  sortie.push(piege("c", [t("Une solution qui rend le carré négatif ne vérifie pas l'équation de la parabole : la garder donnerait un point qui n'existe pas.")]));
  return sortie;
}

export function correctionDetailleeIntersectionCercles(e: E): EtapeCorrection[] {
  return e.variante === "cercle-cercle" ? correctionCercles(e) : correctionParabole(e);
}

export type { Fr };
