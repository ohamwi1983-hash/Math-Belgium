import type { LigneCalcul } from "../../export/genererFeuilleExercices";
import { ligne } from "../../export/corrigeTableau";
import type { AideEcran, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceDL, TypeCorrectionDL, VarianteDL } from "../core6e/detectiveLieux";
import type { D, Poly, Pt } from "../ui6e/outilsLieuxLotH2";
import { coordL, droiteL, evalPoly, l, listeL, mediatrice, nL, nP, normaliserDroite, normaliserPoly, polyDroite, polyL, polyProduit, ptL, racineL, t } from "../ui6e/outilsLieuxLotH2";

/**
 * Modèle de `6gen131` « Détective d'erreurs : lieux, droites et cercles » : à partir des paramètres
 * entiers du scénario, la copie de l'élève fictif (cohérente avec SON erreur), la ligne fausse, la bonne
 * description, la réponse corrigée (écran 3), les messages ciblés et le contenu du corrigé détaillé (la
 * ligne refaite, ce qui montre l'erreur, la résolution reprise et vérifiée). Une seule source pour
 * l'écran, le papier et le corrigé. Même contrat que 6gen122 (copie canonique + trois lignes justes
 * préliminaires ; `av` lignes justes avant la ligne fausse, les dernières gardées).
 */

type E = ExerciceDL;

export interface BlocCorrigeDL {
  utilise: Frag[];
  lignes: LigneCalcul[];
}

export interface CopieDL {
  enonce: Frag[];
  lignes: Frag[][];
  ligneFausse: number;
  /** Règle employée par chaque ligne (aide 2 de l'écran 1). */
  regles: string[];
  regleCours: AideEcran;
  aideCorrection: AideEcran;
  type: TypeCorrectionDL;
  /** Ce que l'écran 3 demande (« les quatre sommets du losange »). */
  demande: Frag[];
  /** Réponse juste : points, nombre (valeur et LaTeX) ou équation (polynôme et LaTeX). */
  points: Pt[];
  nombre: number;
  poly: Poly;
  reponseL: string;
  /** Résultat (faux) de la copie, pour le message ciblé. */
  pointsCopie: Pt[];
  nombreCopie: number;
  /** Équation (fausse) donnée par la copie (type `equation`) ; vide si sans objet. */
  polyCopie: Poly;
  piege: Frag[];
  corrigeA: BlocCorrigeDL;
  corrigeB: BlocCorrigeDL;
  corrigeC: BlocCorrigeDL & { verification?: Frag[] };
}

// ============================================================================
// Descriptions (écran 2) : la juste (= variante) et trois leurres par variante.
// ============================================================================

export const LEURRES: Record<VarianteDL, string[]> = {
  losange: ["losCentre", "losMoitie", "losCercle"],
  mediane: ["medCentre", "medSansDeux", "medVide"],
  apollonius: ["apoDiametre", "apoPlus", "apoMilieu"],
  centreM: ["cmSignes", "cmPasCercle", "cmSansDemi"],
  incentre: ["incHypo", "incAdj", "incRayon"],
  aire: ["aireSansDeux", "aireDiv", "aireHorsD"],
  tangente: ["tanCarre", "tanInterieur", "tanRayon"],
  restriction: ["resCentre", "resRayon", "resMoins"],
};

const absL = (v: string, c: number) => `|${v}${c === 0 ? "" : c > 0 ? `-${nL(c)}` : `+${nL(-c)}`}|`;
const carreL = (v: string, c: number) => (c === 0 ? `${v}^2` : `(${v}${c > 0 ? `-${nL(c)}` : `+${nL(-c)}`})^2`);
const sg = (c: number) => (c === 0 ? "" : c > 0 ? `+${nL(c)}` : `-${nL(-c)}`);

/** Points utiles d'un scénario. */
function pt(d: Record<string, number>, n: string): Pt {
  return { x: d[`x${n}`]!, y: d[`y${n}`]! };
}

/** Équation du cercle d'Apollonius-scénario : PA² = PB² développée (médiatrice). */
function aireDonnees(d: Record<string, number>) {
  const A = pt(d, "A");
  const B = pt(d, "B");
  const M = (B.x - A.x) * d.al! - (B.y - A.y);
  const K = (B.x - A.x) * (d.be! - A.y) + (B.y - A.y) * A.x;
  const t1 = (2 * d.S! - K) / M;
  const t2 = (-2 * d.S! - K) / M;
  const C = (tt: number): Pt => ({ x: tt, y: d.al! * tt + d.be! });
  return { A, B, M, K, t1, t2, C };
}
export { aireDonnees };

export function descriptionFragments(id: string, e: E): Frag[] {
  const d = e.d;
  switch (id) {
    case "losange":
      return [t("Un sommet annule une des deux valeurs absolues : les sommets sont "), l(`(${nL(d.p!)}\\pm${d.k}\\,;${nL(d.q!)})`), t(" et "), l(`(${nL(d.p!)}\\,;${nL(d.q!)}\\pm${d.k})`), t(", pas les quatre combinaisons, qui ne vérifient même pas l'équation.")];
    case "losCentre":
      return [t("Le centre du losange est "), l(coordL({ x: -d.p!, y: -d.q! })), t(".")];
    case "losMoitie":
      return [t("Les sommets sont à la distance "), l(nL(d.k! / 2)), t(" du centre.")];
    case "losCercle":
      return [t("Le lieu est un cercle de centre "), l(coordL({ x: d.p!, y: d.q! })), t(" et de rayon "), l(nL(d.k!)), t(".")];
    case "mediane":
      return [t("Le théorème de la médiane s'écrit "), l("PA^2+PB^2=2PM^2+\\dfrac{AB^2}{2}"), t(" : la moitié de "), l("AB^2"), t(" a été oubliée.")];
    case "medCentre":
      return [t("Le centre du cercle est "), l("A"), t(", pas "), l("M"), t(".")];
    case "medSansDeux":
      return [t("Il fallait "), l("PA^2+PB^2=PM^2+AB^2"), t(".")];
    case "medVide":
      return [t("Le nombre "), l(nL(2 * d.r2! + (d.dx! ** 2 + d.dy! ** 2) / 2)), t(" est sous le seuil : le lieu est vide.")];
    case "apollonius":
      return [t("Pour "), l("k=1"), t(", le coefficient "), l("1-k"), t(" est nul : on ne peut pas diviser par lui ; l'équation est celle d'une droite, la médiatrice de "), l("[AB]"), t(".")];
    case "apoDiametre":
      return [t("Pour "), l("k=1"), t(", le lieu est le cercle de diamètre "), l("[AB]"), t(".")];
    case "apoPlus":
      return [t("Il fallait diviser par "), l("1+k"), t(".")];
    case "apoMilieu":
      return [t("Pour "), l("k=1"), t(", le lieu est réduit au milieu de "), l("[AB]"), t(".")];
    case "centreM":
      return [t("Il fallait d'abord diviser l'équation par "), l(nL(d.m!)), t(" pour que le coefficient de "), l("x^2"), t(" vaille 1 : le centre est "), l("\\left(-\\dfrac{D}{2m}\\,;-\\dfrac{E}{2m}\\right)"), t(".")];
    case "cmSignes":
      return [t("Le centre est "), l("\\left(\\dfrac{D}{2}\\,;\\dfrac{E}{2}\\right)"), t(" : les signes sont inversés.")];
    case "cmPasCercle":
      return [t("Ce n'est pas un cercle, car le coefficient de "), l("x^2"), t(" n'est pas 1.")];
    case "cmSansDemi":
      return [t("Le centre est "), l("(-D\\,;-E)"), t(".")];
    case "incentre":
      return [t("Le centre du cercle inscrit n'est pas le centre de gravité : "), l("I=\\dfrac{a\\,A+b\\,B+c\\,C}{a+b+c}"), t(", chaque sommet pondéré par la longueur du côté opposé.")];
    case "incHypo":
      return [t("Il fallait prendre le milieu de l'hypoténuse "), l("[AB]"), t(".")];
    case "incAdj":
      return [t("Il fallait pondérer chaque sommet par la longueur d'un côté adjacent.")];
    case "incRayon":
      return [t("Le rayon du cercle inscrit est la moitié de l'hypoténuse.")];
    case "aire": {
      const a = aireDonnees(d);
      return [t("La valeur absolue donne deux équations, "), l(`${polyL({ "1": a.K, x: a.M }).replace(/x/, "t")}=${2 * d.S!}`), t(" ou "), l(`${polyL({ "1": a.K, x: a.M }).replace(/x/, "t")}=${-2 * d.S!}`), t(" : il y a deux points C.")];
    }
    case "aireSansDeux":
      return [t("Il fallait écrire l'aire sans le facteur "), l("\\dfrac12"), t(".")];
    case "aireDiv":
      return [t("Il fallait diviser "), l(nL(d.S!)), t(" par 2 au lieu de le multiplier.")];
    case "aireHorsD":
      return [t("Le point "), l("C"), t(" n'est pas forcément sur "), l("d"), t(".")];
    case "tangente":
      return [t("Les droites verticales n'ont pas d'équation de la forme "), l("y-y_P=m(x-x_P)"), t(" : la droite "), l(`x=${nL(d.a! + d.r!)}`), t(" est aussi tangente.")];
    case "tanCarre":
      return [t("Il fallait écrire "), l("\\text{dist}(C\\,;d)=r^2"), t(".")];
    case "tanInterieur":
      return [t("Le point "), l("P"), t(" est intérieur au cercle : il n'y a pas de tangente.")];
    case "tanRayon":
      return [t("La tangente est la droite "), l("(CP)"), t(".")];
    case "restriction":
      return [t("Pour "), l("P=A"), t(" ou "), l("P=B"), t(", il n'y a pas de triangle "), l("APB"), t(" : il faut retirer "), l("A"), t(" et "), l("B"), t(" du cercle.")];
    case "resCentre":
      return [t("Le centre du cercle est "), l("A"), t(".")];
    case "resRayon":
      return [t("Le rayon est "), l("AB"), t(", pas "), l("\\dfrac{AB}{2}"), t(".")];
    case "resMoins":
      return [t("Il fallait écrire "), l("PA^2-PB^2=AB^2"), t(".")];
  }
  return [];
}

// ============================================================================
// Copies
// ============================================================================

interface Canonique {
  enonce: Frag[];
  preliminaires: { ligne: Frag[]; regle: string }[];
  fausse: { ligne: Frag[]; regle: string };
  suites: { ligne: Frag[]; regle: string }[];
  reste: Omit<CopieDL, "enonce" | "lignes" | "ligneFausse" | "regles">;
}

const VIDE = { points: [] as Pt[], nombre: 0, poly: {} as Poly, pointsCopie: [] as Pt[], nombreCopie: 0, polyCopie: {} as Poly };

function canonique(e: E): Canonique {
  const d = e.d;
  switch (e.variante) {
    case "losange": {
      const { p, q, k } = d as Record<string, number>;
      const vrais = [
        { x: p! + k!, y: q! },
        { x: p! - k!, y: q! },
        { x: p!, y: q! + k! },
        { x: p!, y: q! - k! },
      ];
      const faux = [
        { x: p! + k!, y: q! + k! },
        { x: p! + k!, y: q! - k! },
        { x: p! - k!, y: q! + k! },
        { x: p! - k!, y: q! - k! },
      ];
      const eq = `${absL("x", p!)}+${absL("y", q!)}=${k}`;
      return {
        enonce: [t("Détermine les sommets du lieu des points "), l("P(x\\,;y)"), t(" tels que "), l(eq), t(".")],
        preliminaires: [
          { ligne: [t("La somme de deux valeurs absolues est constante : le lieu est un losange.")], regle: "nature du lieu" },
          { ligne: [t("Son centre est le point "), l(coordL({ x: p!, y: q! })), t(", où les deux valeurs absolues sont nulles.")], regle: "centre du losange" },
          { ligne: [t("Le centre n'est pas sur le lieu : "), l(`0+0\\neq ${k}`), t(".")], regle: "contrôle du centre" },
        ],
        fausse: { ligne: [t("Sommets : "), l(`x${sg(-p!)}=\\pm${k}`), t(" et "), l(`y${sg(-q!)}=\\pm${k}`), t(", d'où "), l(listeL(faux)), t(".")], regle: "sommets du losange" },
        suites: [{ ligne: [t("Le lieu est le carré qui a ces quatre sommets.")], regle: "conclusion" }],
        reste: {
          ...VIDE,
          type: "points",
          demande: [t("les quatre sommets du losange")],
          points: vrais,
          pointsCopie: faux,
          reponseL: listeL(vrais),
          regleCours: { texte: [t("Losange du cours : ses sommets sont sur les deux axes de symétrie passant par le centre, une des deux valeurs absolues y est nulle :")], latex: "(p\\pm k\\,;q),\\quad (p\\,;q\\pm k)" },
          aideCorrection: { texte: [t("Pour "), l(`y=${nL(q!)}`), t(", résous "), l(`${absL("x", p!)}=${k}`), t(" ; pour "), l(`x=${nL(p!)}`), t(", résous "), l(`${absL("y", q!)}=${k}`), t(".")] },
          piege: [t("Ce sont les quatre points de la copie : ils ne vérifient pas l'équation.")],
          corrigeA: { utilise: [t("Un sommet du losange annule une des deux valeurs absolues (cours, § 4).")], lignes: [ligne(`y=${nL(q!)}\\ :\\ ${absL("x", p!)}=${k}`, "on annule la seconde valeur absolue"), ligne(`x=${nL(p! + k!)}\\ \\text{ou}\\ x=${nL(p! - k!)}`), ligne(`x=${nL(p!)}\\ :\\ ${absL("y", q!)}=${k}`, "on annule la première"), ligne(`y=${nL(q! + k!)}\\ \\text{ou}\\ y=${nL(q! - k!)}`)] },
          corrigeB: { utilise: [t("Un point de la copie testé dans l'équation :")], lignes: [ligne(`${absL(nL(p! + k!), p!)}+${absL(nL(q! + k!), q!)}=${k}+${k}=${2 * k!}\\neq ${k}`, [t("point "), l(coordL(faux[0]!))])] },
          corrigeC: { utilise: [t("Les quatre sommets, un par demi-axe de symétrie.")], lignes: [ligne(`(${nL(p!)}\\pm${k}\\,;${nL(q!)})\\ \\text{et}\\ (${nL(p!)}\\,;${nL(q!)}\\pm${k})`)], verification: [t("Pour "), l(coordL(vrais[0]!)), t(" : "), l(`${k}+0=${k}`), t(".")] },
        },
      };
    }
    case "mediane": {
      const A = pt(d, "A");
      const B = { x: A.x + d.dx!, y: A.y + d.dy! };
      const M = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
      const D2 = d.dx! ** 2 + d.dy! ** 2;
      const k = 2 * d.r2! + D2 / 2;
      const r2copie = (k - D2) / 2;
      return {
        enonce: [t("On donne "), l(ptL("A", A)), t(" et "), l(ptL("B", B)), t(". Détermine le lieu des points "), l("P"), t(" tels que "), l(`PA^2+PB^2=${k}`), t(".")],
        preliminaires: [
          { ligne: [l("M"), t(", milieu de "), l("[AB]"), t(" : "), l(ptL("M", M)), t(".")], regle: "milieu" },
          { ligne: [l(`AB^2=${nP(d.dx!)}^2+${nP(d.dy!)}^2=${D2}`), t(".")], regle: "distance" },
          { ligne: [t("On exprime "), l("PA^2+PB^2"), t(" à l'aide de "), l("PM"), t(" (théorème de la médiane).")], regle: "choix de la méthode" },
        ],
        fausse: { ligne: [l("PA^2+PB^2=2PM^2+AB^2"), t(", donc "), l(`2PM^2+${D2}=${k}`), t(".")], regle: "théorème de la médiane" },
        suites: [
          { ligne: [l(`PM^2=\\dfrac{${k}-${D2}}{2}=${nL(r2copie)}`), t(".")], regle: "calcul" },
          { ligne: [t("Le lieu est le cercle de centre "), l("M"), t(" et de rayon "), l(racineL(r2copie)), t(".")], regle: "conclusion" },
        ],
        reste: {
          ...VIDE,
          type: "nombre",
          demande: [t("le rayon du cercle")],
          nombre: Math.sqrt(d.r2!),
          nombreCopie: Math.sqrt(r2copie),
          reponseL: racineL(d.r2!),
          regleCours: { texte: [t("Théorème de la médiane, M milieu de [AB] :")], latex: "PA^2+PB^2=2PM^2+\\dfrac{AB^2}{2}" },
          aideCorrection: { texte: [t("Remplace "), l("AB^2"), t(" par "), l(`\\dfrac{${D2}}{2}`), t(" dans l'égalité, puis isole "), l("PM^2"), t(".")] },
          piege: [t("C'est le rayon de la copie : la moitié de "), l("AB^2"), t(" est oubliée.")],
          corrigeA: { utilise: [t("Théorème de la médiane (cours, § 4).")], lignes: [ligne("PA^2+PB^2=2PM^2+\\dfrac{AB^2}{2}"), ligne(`=2PM^2+\\dfrac{${D2}}{2}=2PM^2+${nL(D2 / 2)}`)] },
          corrigeB: { utilise: [t("Contrôle sur un point simple : en "), l("P=M"), t(", "), l("PA=PB=\\dfrac{AB}{2}"), t(".")], lignes: [ligne(`MA^2+MB^2=2\\cdot\\dfrac{AB^2}{4}=\\dfrac{AB^2}{2}`, "la formule de la copie donnerait AB²")] },
          corrigeC: { utilise: [t("On reprend à partir de la ligne fausse.")], lignes: [ligne(`2PM^2+${nL(D2 / 2)}=${k}`), ligne(`PM^2=${nL(d.r2!)}`, `on retire ${nL(D2 / 2)} puis on divise par 2`), ligne(`PM=${racineL(d.r2!)}`)], verification: [l(`${k}>\\dfrac{AB^2}{2}=${nL(D2 / 2)}`), t(" : c'est bien un cercle, de centre "), l("M"), t(".")] },
        },
      };
    }
    case "apollonius": {
      const A = pt(d, "A");
      const B = pt(d, "B");
      const med = mediatrice(A, B);
      const pa: Poly = { x2: 1, y2: 1, x: -2 * A.x, y: -2 * A.y, "1": A.x ** 2 + A.y ** 2 };
      const pb: Poly = { x2: 1, y2: 1, x: -2 * B.x, y: -2 * B.y, "1": B.x ** 2 + B.y ** 2 };
      const lin: Poly = { x: -2 * A.x + 2 * B.x, y: -2 * A.y + 2 * B.y, "1": A.x ** 2 + A.y ** 2 - B.x ** 2 - B.y ** 2 };
      return {
        enonce: [t("On donne "), l(ptL("A", A)), t(" et "), l(ptL("B", B)), t(". Détermine le lieu des points "), l("P"), t(" tels que "), l("PA^2=k\\cdot PB^2"), t(", avec "), l("k=1"), t(".")],
        preliminaires: [
          { ligne: [l(`PA^2=${carreL("x", A.x)}+${carreL("y", A.y)}`), t(".")], regle: "distance" },
          { ligne: [l(`PB^2=${carreL("x", B.x)}+${carreL("y", B.y)}`), t(".")], regle: "distance" },
          { ligne: [t("Cercle d'Apollonius : en développant "), l("PA^2-k\\cdot PB^2=0"), t(", le coefficient de "), l("x^2"), t(" et de "), l("y^2"), t(" est "), l("1-k"), t(".")], regle: "méthode du cours" },
        ],
        fausse: { ligne: [t("On divise par "), l("1-k"), t(" pour obtenir la forme "), l("x^2+y^2+Dx+Ey+F=0"), t(".")], regle: "division" },
        suites: [{ ligne: [t("Ici "), l("1-k=0"), t(" : la division est impossible, donc le lieu est vide.")], regle: "conclusion" }],
        reste: {
          ...VIDE,
          type: "equation",
          demande: [t("une équation du lieu")],
          poly: polyDroite(med),
          reponseL: droiteL(med),
          regleCours: { texte: [t("Cercle d'Apollonius : "), l("PA^2=k\\cdot PB^2"), t(" est un cercle si "), l("k\\neq 1"), t(", la médiatrice de "), l("[AB]"), t(" si "), l("k=1"), t(".")] },
          aideCorrection: { texte: [t("Pour "), l("k=1"), t(", écris "), l("PA^2=PB^2"), t(" et développe : les carrés disparaissent.")] },
          piege: [],
          corrigeA: { utilise: [t("Cercle d'Apollonius, cas "), { type: "latex", valeur: "k=1" }, t(" (cours, § 4).")], lignes: [ligne(`PA^2=PB^2`, "k = 1"), ligne(`${polyL(pa)}=${polyL(pb)}`, "on développe"), ligne(`${polyL(lin)}=0`, "les carrés disparaissent")] },
          corrigeB: { utilise: [t("Pour "), l("k=1"), t(", le coefficient de "), l("x^2"), t(" vaut "), l("1-1=0"), t(" : il n'y a rien à diviser, l'équation est du premier degré.")], lignes: [] },
          corrigeC: { utilise: [t("On reprend à partir de la ligne fausse.")], lignes: [ligne(`${polyL(lin)}=0`), ligne(droiteL(med), "on simplifie")], verification: [t("Le milieu "), l(coordL({ x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 })), t(" de "), l("[AB]"), t(" vérifie l'équation : c'est la médiatrice.")] },
        },
      };
    }
    case "centreM": {
      const { m, u, v, r2 } = d as Record<string, number>;
      const D = -2 * m! * u!;
      const Ec = -2 * m! * v!;
      const F = m! * (u! * u! + v! * v! - r2!);
      const poly: Poly = { x2: m!, y2: m!, x: D, y: Ec, "1": F };
      const faux = { x: -D / 2, y: -Ec / 2 };
      return {
        enonce: [t("On donne "), l(`\\Gamma:\\ ${polyL(poly)}=0`), t(". Détermine le centre de "), l("\\Gamma"), t(".")],
        preliminaires: [
          { ligne: [t("Les coefficients de "), l("x^2"), t(" et de "), l("y^2"), t(" sont égaux et il n'y a pas de terme en "), l("xy"), t(" : "), l("\\Gamma"), t(" est un cercle, un point ou le vide.")], regle: "nature" },
          { ligne: [t("On lit "), l(`D=${nL(D)}`), t(", "), l(`E=${nL(Ec)}`), t(" et "), l(`F=${nL(F)}`), t(".")], regle: "lecture des coefficients" },
          { ligne: [t("Le centre d'un cercle "), l("x^2+y^2+Dx+Ey+F=0"), t(" est "), l("\\left(-\\dfrac{D}{2}\\,;-\\dfrac{E}{2}\\right)"), t(".")], regle: "formule du cours" },
        ],
        fausse: { ligne: [t("Centre : "), l(`\\left(-\\dfrac{${nL(D)}}{2}\\,;-\\dfrac{${nL(Ec)}}{2}\\right)=${coordL(faux)}`), t(".")], regle: "application de la formule" },
        suites: [{ ligne: [t("Le centre de "), l("\\Gamma"), t(" est donc le point "), l(coordL(faux)), t(".")], regle: "conclusion" }],
        reste: {
          ...VIDE,
          type: "points",
          demande: [t("les coordonnées du centre")],
          points: [{ x: u!, y: v! }],
          pointsCopie: [faux],
          reponseL: coordL({ x: u!, y: v! }),
          regleCours: { texte: [t("La formule du centre vaut pour une équation dont le coefficient de "), l("x^2"), t(" et de "), l("y^2"), t(" est 1 : on divise d'abord par ce coefficient.")] },
          aideCorrection: { texte: [t("Divise toute l'équation par "), l(nL(m!)), t(", puis applique la formule.")] },
          piege: [t("C'est le centre de la copie : l'équation n'a pas été divisée par "), l(nL(m!)), t(".")],
          corrigeA: { utilise: [t("On divise d'abord par "), l(nL(m!)), t(" (cours, § 2).")], lignes: [ligne(`${polyL({ x2: 1, y2: 1, x: D / m!, y: Ec / m!, "1": F / m! })}=0`, `on divise par ${m}`), ligne(`\\left(-\\dfrac{${nL(D / m!)}}{2}\\,;-\\dfrac{${nL(Ec / m!)}}{2}\\right)=${coordL({ x: u!, y: v! })}`)] },
          corrigeB: { utilise: [t("La formule du cours suppose un coefficient 1 devant "), l("x^2"), t(" ; ici il vaut "), l(nL(m!)), t(".")], lignes: [] },
          corrigeC: { utilise: [t("On reprend à partir de la ligne fausse.")], lignes: [ligne(`\\left(-\\dfrac{D}{2m}\\,;-\\dfrac{E}{2m}\\right)=\\left(-\\dfrac{${nL(D)}}{${2 * m!}}\\,;-\\dfrac{${nL(Ec)}}{${2 * m!}}\\right)=${coordL({ x: u!, y: v! })}`)], verification: [t("Rayon : "), l(`r^2=${nL(u! * u!)}+${nL(v! * v!)}-${nP(F / m!)}=${nL(r2!)}>0`), t(", c'est bien un cercle.")] },
        },
      };
    }
    case "incentre": {
      const C = pt(d, "C");
      const A = { x: C.x + d.sx! * d.p!, y: C.y };
      const B = { x: C.x, y: C.y + d.sy! * d.q! };
      const h = Math.round(Math.sqrt(d.p! ** 2 + d.q! ** 2));
      const r = (d.p! + d.q! - h) / 2;
      const I = { x: C.x + d.sx! * r, y: C.y + d.sy! * r };
      const G = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
      const a = d.q!;
      const b = d.p!;
      const s = a + b + h;
      return {
        enonce: [t("Dans un repère orthonormé, on donne le triangle "), l("ABC"), t(" avec "), l(ptL("A", A)), t(", "), l(ptL("B", B)), t(" et "), l(ptL("C", C)), t(". Détermine le centre "), l("I"), t(" de son cercle inscrit.")],
        preliminaires: [
          { ligne: [l(`CA=${d.p}`), t(" ("), l("A"), t(" et "), l("C"), t(" ont la même ordonnée).")], regle: "longueur" },
          { ligne: [l(`CB=${d.q}`), t(" ("), l("B"), t(" et "), l("C"), t(" ont la même abscisse).")], regle: "longueur" },
          { ligne: [l(`AB=\\sqrt{${d.p}^2+${d.q}^2}=${h}`), t(".")], regle: "Pythagore" },
        ],
        fausse: { ligne: [l(`I=\\left(\\dfrac{${nL(A.x)}${sg(B.x)}${sg(C.x)}}{3}\\,;\\dfrac{${nL(A.y)}${sg(B.y)}${sg(C.y)}}{3}\\right)=${coordL(G)}`), t(".")], regle: "centre du cercle inscrit" },
        suites: [{ ligne: [t("Le cercle inscrit a pour centre "), l(coordL(G)), t(".")], regle: "conclusion" }],
        reste: {
          ...VIDE,
          type: "points",
          demande: [t("les coordonnées du centre "), l("I")],
          points: [I],
          pointsCopie: [G],
          reponseL: coordL(I),
          regleCours: { texte: [t("Centre du cercle inscrit (cours, § 2), avec "), l("a=BC"), t(", "), l("b=CA"), t(", "), l("c=AB"), t(" :")], latex: "I=\\dfrac{a\\,A+b\\,B+c\\,C}{a+b+c}" },
          aideCorrection: { texte: [t("Ici "), l(`a=BC=${a}`), t(", "), l(`b=CA=${b}`), t(", "), l(`c=AB=${h}`), t(" : pondère chaque sommet, puis divise par "), l(`${s}`), t(".")] },
          piege: [t("C'est le centre de gravité de la copie, pas le centre du cercle inscrit.")],
          corrigeA: {
            utilise: [t("Chaque sommet pondéré par la longueur du côté opposé (cours, § 2).")],
            lignes: [ligne(`a=BC=${a},\\ b=CA=${b},\\ c=AB=${h}`), ligne(`x_I=\\dfrac{${a}\\cdot ${nP(A.x)}+${b}\\cdot ${nP(B.x)}+${h}\\cdot ${nP(C.x)}}{${s}}=${nL(I.x)}`), ligne(`y_I=\\dfrac{${a}\\cdot ${nP(A.y)}+${b}\\cdot ${nP(B.y)}+${h}\\cdot ${nP(C.y)}}{${s}}=${nL(I.y)}`)],
          },
          corrigeB: { utilise: [t("Le point de la copie est le centre de gravité "), l("G=\\dfrac{A+B+C}{3}"), t(" ; ses distances aux côtés ne sont pas égales.")], lignes: [ligne(`\\text{dist}(G\\,;(CA))=${nL(Math.abs(G.y - C.y))}\\neq ${nL(Math.abs(G.x - C.x))}=\\text{dist}(G\\,;(CB))`)] },
          corrigeC: { utilise: [t("On reprend à partir de la ligne fausse.")], lignes: [ligne(`I=${coordL(I)}`)], verification: [l(`\\text{dist}(I\\,;(CA))=${nL(Math.abs(I.y - C.y))}=\\text{dist}(I\\,;(CB))=${nL(Math.abs(I.x - C.x))}`), t(", égales au rayon "), l(`r=\\dfrac{${d.p}+${d.q}-${h}}{2}=${nL(r)}`), t(".")] },
        },
      };
    }
    case "aire": {
      const a = aireDonnees(d);
      const S = d.S!;
      const lin = `${polyL({ "1": a.K, x: a.M }).replace(/x/, "t")}`;
      const dL = `d:\\ y=${polyL({ x: d.al!, "1": d.be! })}`;
      const C1 = a.C(a.t1);
      const C2 = a.C(a.t2);
      return {
        enonce: [t("On donne "), l(ptL("A", a.A)), t(", "), l(ptL("B", a.B)), t(" et la droite "), l(dL), t(". Détermine les points "), l("C"), t(" de "), l("d"), t(" tels que l'aire du triangle "), l("ABC"), t(" vaille "), l(nL(S)), t(".")],
        preliminaires: [
          { ligne: [l("C"), t(" est sur "), l("d"), t(" : "), l(`C\\left(t\\,;${polyL({ x: d.al!, "1": d.be! }).replace(/x/, "t")}\\right)`), t(".")], regle: "point de d" },
          { ligne: [t("Aire "), l("=\\dfrac12\\left|(x_B-x_A)(y_C-y_A)-(y_B-y_A)(x_C-x_A)\\right|"), t(".")], regle: "formule de l'aire" },
          { ligne: [t("Aire "), l(`=\\dfrac12|${lin}|`), t(".")], regle: "calcul" },
        ],
        fausse: { ligne: [l(`\\dfrac12(${lin})=${nL(S)}`), t(", donc "), l(`${lin}=${2 * S}`), t(".")], regle: "équation" },
        suites: [{ ligne: [l(`t=${nL(a.t1)}`), t(", d'où "), l(ptL("C", C1)), t(".")], regle: "résolution" }],
        reste: {
          ...VIDE,
          type: "points",
          demande: [t("les coordonnées des points "), l("C")],
          points: [C1, C2],
          pointsCopie: [C1],
          reponseL: listeL([C1, C2]),
          regleCours: { texte: [t("Une valeur absolue égale à un nombre positif donne deux équations :")], latex: "|X|=c\\iff X=c\\ \\text{ou}\\ X=-c" },
          aideCorrection: { texte: [t("Résous aussi "), l(`${lin}=${-2 * S}`), t(".")] },
          piege: [t("Il manque un point : la valeur absolue donne deux équations.")],
          corrigeA: { utilise: [t("Valeur absolue : deux équations (cours, § 1, aire variable).")], lignes: [ligne(`\\dfrac12|${lin}|=${nL(S)}`), ligne(`|${lin}|=${2 * S}`), ligne(`${lin}=${2 * S}\\ \\text{ou}\\ ${lin}=${-2 * S}`)] },
          corrigeB: { utilise: [t("La copie a remplacé "), l(`|${lin}|`), t(" par "), l(lin), t(" : elle ne garde que le cas positif.")], lignes: [] },
          corrigeC: { utilise: [t("On reprend à partir de la ligne fausse.")], lignes: [ligne(`t=${nL(a.t1)}\\ \\text{ou}\\ t=${nL(a.t2)}`), ligne(`${ptL("C_1", C1)}\\ \\text{ou}\\ ${ptL("C_2", C2)}`)], verification: [t("Pour "), l(`t=${nL(a.t2)}`), t(" : "), l(`\\dfrac12|${nL(a.K + a.M * a.t2)}|=${nL(S)}`), t(".")] },
        },
      };
    }
    case "tangente": {
      const { a, b, r, h } = d as Record<string, number>;
      const P = { x: a! + r!, y: b! + h! };
      const m = (h! * h! - r! * r!) / (2 * r! * h!);
      const tan2: D = normaliserDroite({ a: h! * h! - r! * r!, b: -2 * r! * h!, c: -(h! * h! - r! * r!) * P.x + 2 * r! * h! * P.y });
      const vert: D = { a: 1, b: 0, c: -P.x };
      return {
        enonce: [t("Détermine les équations des tangentes au cercle "), l(`\\Gamma:\\ ${carreL("x", a!)}+${carreL("y", b!)}=${r! * r!}`), t(" menées par le point "), l(ptL("P", P)), t(".")],
        preliminaires: [
          { ligne: [l("\\Gamma"), t(" a pour centre "), l(ptL("C", { x: a!, y: b! })), t(" et pour rayon "), l(`${r}`), t(".")], regle: "centre et rayon" },
          { ligne: [l(`CP^2=${r! * r!}+${h! * h!}>${r! * r!}`), t(" : "), l("P"), t(" est extérieur au cercle, il y a deux tangentes.")], regle: "position de P" },
          { ligne: [t("Une tangente issue de "), l("P"), t(" est une droite passant par "), l("P"), t(" dont la distance à "), l("C"), t(" vaut "), l(`${r}`), t(".")], regle: "condition de tangence" },
        ],
        fausse: { ligne: [t("Toute droite passant par "), l("P"), t(" a une équation de la forme "), l(`y${sg(-P.y)}=m(x${sg(-P.x)})`), t(".")], regle: "droite par P" },
        suites: [
          { ligne: [l(`\\dfrac{|${h}-${r}m|}{\\sqrt{m^2+1}}=${r}`), t(", donc "), l(`m=${nL(m)}`), t(".")], regle: "distance et résolution" },
          { ligne: [t("Une seule tangente : "), l(droiteL(tan2)), t(".")], regle: "conclusion" },
        ],
        reste: {
          ...VIDE,
          type: "equation",
          demande: [t("les équations des deux tangentes (séparées par « ou »)")],
          poly: polyProduit(vert, tan2),
          polyCopie: polyDroite(tan2),
          reponseL: `x=${nL(P.x)}\\ \\text{ou}\\ ${droiteL(tan2)}`,
          regleCours: { texte: [t("Une droite passant par "), l("P"), t(" est soit verticale, "), l("x=x_P"), t(", soit de la forme "), l("y-y_P=m(x-x_P)"), t(" : il faut tester les deux cas.")] },
          aideCorrection: { texte: [t("Calcule la distance de "), l("C"), t(" à la droite "), l(`x=${nL(P.x)}`), t(".")] },
          piege: [t("Il manque la tangente verticale.")],
          corrigeA: { utilise: [t("Une droite passant par "), l("P"), t(" peut être verticale (cours, § 2, tangentes).")], lignes: [ligne(`x=${nL(P.x)}\\ :\\ \\text{dist}(C\\,;d)=|${nL(a!)}-${nP(P.x)}|=${r}`, "c'est le rayon")] },
          corrigeB: { utilise: [t("La forme "), l("y-y_P=m(x-x_P)"), t(" exclut les droites verticales : elle ne pouvait donner qu'une seule des deux tangentes qu'un point extérieur admet.")], lignes: [] },
          corrigeC: { utilise: [t("On garde la tangente trouvée et on ajoute la verticale.")], lignes: [ligne(`x=${nL(P.x)}\\ \\text{ou}\\ ${droiteL(tan2)}`)], verification: [t("Distance de "), l("C"), t(" à la seconde droite : "), l(`\\dfrac{|${nL(tan2.a * a! + tan2.b * b! + tan2.c)}|}{\\sqrt{${tan2.a * tan2.a + tan2.b * tan2.b}}}=${r}`), t(".")] },
        },
      };
    }
    case "restriction": {
      const A = pt(d, "A");
      const B = pt(d, "B");
      const I = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
      const ab2 = (B.x - A.x) ** 2 + (B.y - A.y) ** 2;
      const poly: Poly = { x2: 1, y2: 1, x: -(A.x + B.x), y: -(A.y + B.y), "1": A.x * B.x + A.y * B.y };
      return {
        enonce: [t("On donne "), l(ptL("A", A)), t(" et "), l(ptL("B", B)), t(". Détermine le lieu des points "), l("P"), t(" tels que le triangle "), l("APB"), t(" soit rectangle en "), l("P"), t(".")],
        preliminaires: [
          { ligne: [t("Le triangle "), l("APB"), t(" est rectangle en "), l("P"), t(" si et seulement si "), l("PA^2+PB^2=AB^2"), t(".")], regle: "Pythagore" },
          { ligne: [l(`${carreL("x", A.x)}+${carreL("y", A.y)}+${carreL("x", B.x)}+${carreL("y", B.y)}=${ab2}`), t(".")], regle: "distances" },
          { ligne: [l(`${polyL(poly)}=0`), t(" : cercle de centre "), l(coordL(I)), t(" et de rayon "), l(racineL(ab2 / 4)), t(".")], regle: "équation réduite" },
        ],
        fausse: { ligne: [t("Tous les points de ce cercle conviennent : le lieu est le cercle entier.")], regle: "réciproque" },
        suites: [{ ligne: [t("En particulier, "), l("A"), t(" et "), l("B"), t(" appartiennent au lieu.")], regle: "conclusion" }],
        reste: {
          ...VIDE,
          type: "points",
          demande: [t("les points à retirer du cercle")],
          points: [A, B],
          reponseL: listeL([A, B]),
          regleCours: { texte: [t("Réciproque (cours, § 4) : un point de l'ensemble trouvé n'est dans le lieu que si la condition de l'énoncé a un sens pour lui.")] },
          aideCorrection: { texte: [t("Pour quels points du cercle le triangle "), l("APB"), t(" n'existe-t-il pas ?")] },
          piege: [],
          corrigeA: { utilise: [t("Réciproque : on teste les points particuliers du cercle.")], lignes: [ligne("P=A", "le triangle AAB n'existe pas"), ligne("P=B", "le triangle ABB n'existe pas")] },
          corrigeB: { utilise: [t("Pour "), l("P=A"), t(" ou "), l("P=B"), t(", l'égalité "), l("PA^2+PB^2=AB^2"), t(" est vraie, mais il n'y a pas de triangle : l'équivalence avec « rectangle en P » ne vaut que pour "), l("P\\neq A"), t(" et "), l("P\\neq B"), t(".")], lignes: [] },
          corrigeC: { utilise: [t("On reprend à partir de la ligne fausse.")], lignes: [ligne(`\\text{lieu}=\\text{cercle}\\setminus\\{A\\,;B\\}`)], verification: [t("Le lieu est le cercle de centre "), l(coordL(I)), t(" et de rayon "), l(racineL(ab2 / 4)), t(", privé de "), l(ptL("A", A)), t(" et de "), l(ptL("B", B)), t(".")] },
        },
      };
    }
  }
}

export function copie(e: E): CopieDL {
  const c = canonique(e);
  const av = e.d.av ?? 0;
  const prelims = c.preliminaires.slice(3 - av);
  const lignes = [...prelims.map((p) => p.ligne), c.fausse.ligne, ...c.suites.map((s) => s.ligne)];
  const regles = [...prelims.map((p) => p.regle), c.fausse.regle, ...c.suites.map((s) => s.regle)];
  return { enonce: c.enonce, lignes, ligneFausse: av, regles, ...c.reste };
}

export const nombreLignes = (e: E): number => copie(e).lignes.length;

/** Valeur de l'équation attendue (écran 3, type `equation`). */
export const evalPolyDL = (p: Poly, m: Pt): number => evalPoly(p, m.x, m.y);
export { normaliserPoly };
