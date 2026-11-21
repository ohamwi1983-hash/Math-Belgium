import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceProjeteSymetrique } from "../../core/projeteSymetrique.types";
import { q } from "../../ui/corrigeChapitre3";
import {
  affineL,
  colonne,
  equationL,
  l,
  membreDroite,
  n,
  nbp,
  parametriquesL,
  plusTerme,
  termeProduit,
  t,
  type D,
  type Fr,
  type P,
} from "../../ui/outilsAnalytiqueLotG";
import {
  droiteApB,
  figureCorrige,
  longueurCarre,
  parametreImpact,
  parametrePied,
  perpendiculaire,
  reponseAp,
  reponseApB,
  reponseH,
  reponseI,
  reponseLongueur,
  reponsePerpendiculaire,
  substitutionImpact,
  substitutionPied,
  unite,
  vecteurApB,
} from "../../ui/formatProjeteSymetrique";

/**
 * Corrigé détaillé « comme au tableau » de gen96 (`.claude/rules/feuilles-evaluations.md`), partagé
 * par l'adaptateur papier et l'appli (une lettre par écran).
 * Symétrique : a) vecteur directeur de d, vecteur perpendiculaire (produit scalaire nul), équations
 * paramétriques puis cartésienne de p ; b) substitution dans d, t, coordonnées de H, vérification
 * H ∈ d ; c) x_{A′} = 2x_H − x_A ligne à ligne, vérification par le milieu, figure annotée.
 * Réflexion : a) les trois temps (p, H, A′) ; b) (A′B) par le vecteur A′B (simplifié) ; c) I par
 * substitution, vérification I ∈ (A′B) ; d) AI + IB = A′I + IB = A′B, norme, vérification AI et IB.
 */

type E = ExerciceProjeteSymetrique;
const COURS_REL = "(cours, § 4)";
const COURS_INT = "(cours, § 5)";
const COURS_DIST = "(cours, § 6)";

/** Lignes « équation cartésienne d'une droite par un point et un vecteur directeur » :
 * a = y_v, b = −x_v, puis le terme constant par le point. */
function lignesCartesienne(nom: string, Pt: P, v: P, nomPoint: string): LigneCalcul[] {
  const a = v.y;
  const b = -v.x;
  const c = -(a * Pt.x + b * Pt.y);
  const lignes: LigneCalcul[] = [
    ligne(`${nom}\\equiv ${membreDroite({ a, b, c: 0 })}+c=0`, [t("vecteur directeur "), l(colonne("-b", "a")), t(" : "), l(`a=${n(a)}`), t(", "), l(`b=${n(b)}`)]),
    ligne(`${termeProduit(a, Pt.x, true)}${termeProduit(b, Pt.y)}+c=0`, `${nomPoint} est sur la droite`),
  ];
  const s = a * Pt.x + b * Pt.y;
  lignes.push(ligne(`${n(s)}+c=0`, "on calcule"));
  lignes.push(ligne(`c=${n(c)}`, "on isole c"));
  lignes.push(ligne(`${nom}\\equiv ${membreDroite({ a, b, c })}=0`, "on remplace c"));
  if (a < 0 || (a === 0 && b < 0)) lignes.push(ligne(`${nom}\\equiv ${membreDroite({ a: -a, b: -b, c: -c })}=0`, "on multiplie par −1"));
  return lignes;
}

/** Bloc perpendiculaire + pied H + symétrique A′ (réutilisé par la réflexion, étape a). */
function lignesPerpendiculaire(e: E): LigneCalcul[] {
  const { u, nrm } = e;
  return [
    ligne(`\\vec{u}=${colonne(u.x, u.y)}`, [t("vecteur directeur de d : "), l(colonne("-b", "a"))]),
    ligne(`\\vec{n}=${colonne(nrm.x, nrm.y)}`, "coefficients de x et de y dans l'équation de d"),
    ligne(`\\vec{u}\\cdot\\vec{n}=${nbp(u.x)}\\cdot ${nbp(nrm.x)}+${nbp(u.y)}\\cdot ${nbp(nrm.y)}`, "produit scalaire"),
    ligne("=0", "les deux vecteurs sont perpendiculaires"),
    ligne(`p\\equiv ${parametriquesL(e.A, nrm)}`, [t("p passe par A, vecteur directeur "), l("\\vec{n}")]),
  ];
}

function lignesPied(e: E): LigneCalcul[] {
  const { a, b, c } = e.d;
  const tp = parametrePied(e);
  const s = a * a + b * b;
  const cst = a * e.A.x + b * e.A.y + c;
  return [
    ligne(substitutionPied(e), "on remplace x et y de p dans l'équation de d"),
    ligne(`${s === 1 ? "" : n(s)}t${plusTerme(cst)}=0`, "on distribue et on réduit"),
    ligne(`t=${q(tp)}`, `on isole t`),
    ligne(`x_H=${n(e.A.x)}${plusFois(e.nrm.x, tp)}`, "on remplace t dans p"),
    ligne(`=${n(e.H.x)}`),
    ligne(`y_H=${n(e.A.y)}${plusFois(e.nrm.y, tp)}`, "idem pour y"),
    ligne(`=${n(e.H.y)}`),
  ];
}

/** « +2\cdot(-1) », « -3\cdot 2 » : terme a·t ajouté à x₀. */
function plusFois(coef: number, tp: number): string {
  return `${coef < 0 ? "-" : "+"}${Math.abs(coef) === 1 ? "" : `${n(Math.abs(coef))}\\cdot `}${nbp(tp)}`;
}

function lignesSymetrique(e: E): LigneCalcul[] {
  return [
    ligne(`x_{A'}=2x_H-x_A`, [t("H milieu de [AA′] : "), l("x_H=\\dfrac{x_A+x_{A'}}{2}")]),
    ligne(`=2\\cdot ${nbp(e.H.x)}-${nbp(e.A.x)}`),
    ligne(`=${n(e.Ap.x)}`),
    ligne(`y_{A'}=2y_H-y_A`, "même chose pour l'ordonnée"),
    ligne(`=2\\cdot ${nbp(e.H.y)}-${nbp(e.A.y)}`),
    ligne(`=${n(e.Ap.y)}`),
  ];
}

const utilisePerp: Fr = [
  t("Un vecteur directeur de "),
  l("d\\equiv ax+by+c=0"),
  t(" est "),
  l(colonne("-b", "a")),
  t(" ; le vecteur "),
  l(colonne("a", "b")),
  t(" lui est perpendiculaire (produit scalaire nul) : c'est un vecteur directeur de la perpendiculaire "),
  t(COURS_REL),
  t("."),
];

const utilisePied: Fr = [t("Le pied H est sur p et sur d : on remplace x et y des équations paramétriques de p dans l'équation de d "), t(COURS_DIST), t(".")];

const utiliseMilieu: Fr = [l("H"), t(" est le milieu de "), l("[AA']"), t(" : "), l("x_H=\\dfrac{x_A+x_{A'}}{2}"), t(", donc "), l("x_{A'}=2x_H-x_A"), t(" (même chose pour y).")];

function verificationMilieu(e: E, lettre: string): EtapeCorrection {
  return verification(lettre, [t("H est bien le milieu de [AA′] :")], [
    ligne(`\\dfrac{x_A+x_{A'}}{2}=\\dfrac{${n(e.A.x)}+${nbp(e.Ap.x)}}{2}`),
    ligne(`=${n(e.H.x)}`, [t("c'est "), l("x_H")]),
    ligne(`\\dfrac{y_A+y_{A'}}{2}=\\dfrac{${n(e.A.y)}+${nbp(e.Ap.y)}}{2}`),
    ligne(`=${n(e.H.y)}`, [t("c'est "), l("y_H")]),
  ]);
}

function verificationSur(nomPoint: string, Pt: P, d: D, nomDroite: string, lettre: string): EtapeCorrection {
  return verification(lettre, [l(nomPoint), t(" vérifie l'équation de "), l(nomDroite), t(" :")], [
    ligne(`${termeProduit(d.a, Pt.x, true)}${termeProduit(d.b, Pt.y)}${plusTerme(d.c)}=${n(d.a * Pt.x + d.b * Pt.y + d.c)}`, "le point est sur la droite"),
  ]);
}

function correctionSymetrique(e: E): EtapeCorrection[] {
  const p = perpendiculaire(e);
  return [
    utilise("a", utilisePerp),
    calcul("a", [...lignesPerpendiculaire(e), ...lignesCartesienne("p", e.A, e.nrm, "A")]),
    resultat("a", reponsePerpendiculaire(e)),
    verificationSur("A", e.A, p, "p", "a"),
    piege("a", [t("Le vecteur "), l(colonne("-b", "a")), t(" est un vecteur DIRECTEUR de d : le prendre pour p donnerait la parallèle à d passant par A, pas la perpendiculaire.")]),
    utilise("b", utilisePied),
    calcul("b", lignesPied(e)),
    resultat("b", reponseH(e)),
    verificationSur("H", e.H, e.d, "d", "b"),
    piege("b", [t("On remplace dans l'équation de d, pas dans celle de p : H est le point de p qui est aussi sur d.")]),
    utilise("c", utiliseMilieu),
    calcul("c", lignesSymetrique(e)),
    { ...resultat("c", reponseAp(e)), figureHtml: figureCorrige(e) },
    verificationMilieu(e, "c"),
    piege("c", [l("x_{A'}=2x_H-x_A"), t(", pas "), l("2x_A-x_H"), t(" : c'est H, et non A, le milieu du segment.")]),
  ];
}

function correctionReflexion(e: E): EtapeCorrection[] {
  const { v, g, w } = vecteurApB(e);
  const apb = droiteApB(e);
  const ti = parametreImpact(e);
  const { a, b, c } = e.d;
  const s = a * w.x + b * w.y;
  const cst = a * e.Ap.x + b * e.Ap.y + c;
  const L2 = longueurCarre(e);
  const L = Math.sqrt(L2);
  const AI = Math.sqrt((e.I!.x - e.A.x) ** 2 + (e.I!.y - e.A.y) ** 2);
  const IB = Math.sqrt((e.B!.x - e.I!.x) ** 2 + (e.B!.y - e.I!.y) ** 2);
  const lignesDroite: LigneCalcul[] = [
    ligne(`\\vec{A'B}=${colonne(`${n(e.B!.x)}-${nbp(e.Ap.x)}`, `${n(e.B!.y)}-${nbp(e.Ap.y)}`)}`, "extrémité moins origine"),
    ligne(`=${colonne(v.x, v.y)}`),
  ];
  if (g > 1) lignesDroite.push(ligne(`\\vec{w}=${colonne(w.x, w.y)}`, `on divise par ${g} : même direction`));
  lignesDroite.push(...lignesCartesienne("(A'B)", e.B!, w, "B"));
  const u = unite(e);
  return [
    utilise("a", [t("Trois temps : la perpendiculaire à d par A (vecteur directeur "), l(colonne("a", "b")), t(") "), t(COURS_REL), t(", son pied H sur d "), t(COURS_DIST), t(", puis A′ tel que H soit le milieu de [AA′].")]),
    calcul("a", lignesPerpendiculaire(e), [], "Perpendiculaire"),
    calcul("a", lignesPied(e), [], "Pied H"),
    calcul("a", lignesSymetrique(e), [], "Symétrique"),
    resultat("a", reponseAp(e)),
    verificationMilieu(e, "a"),
    piege("a", [l("x_{A'}=2x_H-x_A"), t(", pas "), l("2x_A-x_H"), t(" : c'est H, le milieu de [AA′].")]),
    utilise("b", [t("Une droite passant par deux points a pour vecteur directeur le vecteur qui les relie "), t("(cours, § 1)"), t(".")]),
    calcul("b", lignesDroite),
    resultat("b", reponseApB(e)),
    verificationSur("A'", e.Ap, apb, "(A'B)", "b"),
    piege("b", [t("La droite (AB) ne convient pas : le trajet réfléchi est aligné avec A′, pas avec A.")]),
    utilise("c", [t("I est sur (A′B) et sur d : on remplace x et y des équations paramétriques de (A′B) dans l'équation de d "), t(COURS_INT), t(".")]),
    calcul("c", [
      ligne(`(A'B)\\equiv ${parametriquesL(e.Ap, w)}`, [t("passe par A′, vecteur directeur "), l(g > 1 ? "\\vec{w}" : "\\vec{A'B}")]),
      ligne(substitutionImpact(e), "on remplace x et y dans l'équation de d"),
      ligne(`${s === 1 ? "" : s === -1 ? "-" : n(s)}t${plusTerme(cst)}=0`, "on distribue et on réduit"),
      ligne(`t=${q(ti)}`, "on isole t"),
      ligne(`x_I=${n(e.Ap.x)}${plusFoisQ(w.x, ti)}`, "on remplace t"),
      ligne(`=${n(e.I!.x)}`),
      ligne(`y_I=${n(e.Ap.y)}${plusFoisQ(w.y, ti)}`),
      ligne(`=${n(e.I!.y)}`),
    ]),
    resultat("c", reponseI(e)),
    verificationSur("I", e.I!, apb, "(A'B)", "c"),
    piege("c", [t("Le point d'impact n'est pas le projeté H de A : en visant H, le trajet repartirait vers A′ du côté de A, pas vers B.")]),
    utilise("d", [t("La symétrie conserve les longueurs : "), l("AI=A'I"), t(". Comme I est sur le segment [A′B], "), l("AI+IB=A'I+IB=A'B"), t(" "), t(COURS_DIST), t(".")]),
    calcul("d", [
      ligne(`AI+IB=A'I+IB`, "AI = A′I (symétrie)"),
      ligne(`=A'B`, "A′, I, B alignés, I entre A′ et B"),
      ligne(`=\\sqrt{${nbp(v.x)}^2+${nbp(v.y)}^2}`, [t("norme de "), l("\\vec{A'B}")]),
      ligne(`=\\sqrt{${n(L2)}}`),
      ...(Number.isInteger(L) || n(L) === `\\sqrt{${L2}}` ? (Number.isInteger(L) ? [ligne(`=${n(L)}`)] : []) : [ligne(`=${n(L)}`, "on simplifie la racine")]),
    ]),
    resultat("d", reponseLongueur(e)),
    verification("d", [t("En calculant les deux morceaux :")], [
      ligne(`AI=\\sqrt{${nbp(e.I!.x - e.A.x)}^2+${nbp(e.I!.y - e.A.y)}^2}=${n(AI)}`),
      ligne(`IB=\\sqrt{${nbp(e.B!.x - e.I!.x)}^2+${nbp(e.B!.y - e.I!.y)}^2}=${n(IB)}`),
      ligne(`AI+IB=${n(AI)}+${n(IB)}`),
      ligne(`=${n(L)}`, `en ${u}`),
    ]),
    { ...piege("d", [t("La longueur AB en ligne droite ne convient pas : le trajet passe par I.")]), figureHtml: figureCorrige(e) },
  ];
}

/** « +2\cdot\dfrac{1}{2} » : terme w·t ajouté à x₀ (t rationnel). */
function plusFoisQ(coef: number, tp: number): string {
  const tl = tp < 0 ? `\\left(${q(tp)}\\right)` : q(tp);
  return `${coef < 0 ? "-" : "+"}${Math.abs(coef) === 1 ? "" : `${n(Math.abs(coef))}\\cdot `}${tl}`;
}

export function correctionDetailleeProjeteSymetrique(e: E): EtapeCorrection[] {
  return e.variante === "symetrique" ? correctionSymetrique(e) : correctionReflexion(e);
}

export { equationL, affineL };
