import type { LigneCalcul } from "../../export/genererFeuilleExercices";
import { ligne } from "../../export/corrigeTableau";
import type { AideEcran, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceDC, TypeCorrectionDC, VarianteDC } from "../core6e/detectiveConiques";
import type { D, Poly, Pt } from "../ui6e/outilsConiquesLotH2";
import { carreSurL, coefL, evalPoly, l, milliersL, nL, nPL, normaliserDroite, sgL, t, tangenteDedoublee, termeL, pL } from "../ui6e/outilsConiquesLotH2";
import { droiteL, listeL, racineL } from "../ui6e/outilsLieuxLotH2";

/**
 * Modèle de `6gen143` « Détective d'erreurs : coniques » : à partir des paramètres du scénario, la copie de
 * l'élève fictif (cohérente avec SON erreur), la ligne fausse, la bonne description, la réponse corrigée
 * (écran 3), les messages ciblés et le contenu du corrigé détaillé (la ligne refaite, ce qui montre
 * l'erreur, la résolution reprise et vérifiée). Une seule source pour l'écran, le papier et le corrigé.
 * Même contrat que 6gen131 (copie canonique + trois lignes justes préliminaires ; `av` lignes justes avant
 * la ligne fausse, les dernières gardées).
 */

type E = ExerciceDC;

export interface BlocCorrigeDC {
  utilise: Frag[];
  lignes: LigneCalcul[];
}

export interface CopieDC {
  enonce: Frag[];
  lignes: Frag[][];
  ligneFausse: number;
  regles: string[];
  regleCours: AideEcran;
  aideCorrection: AideEcran;
  type: TypeCorrectionDC;
  demande: Frag[];
  points: Pt[];
  nombre: number;
  poly: Poly;
  reponseL: string;
  pointsCopie: Pt[];
  nombreCopie: number;
  polyCopie: Poly;
  piege: Frag[];
  corrigeA: BlocCorrigeDC;
  corrigeB: BlocCorrigeDC;
  corrigeC: BlocCorrigeDC & { verification?: Frag[] };
}

// ============================================================================
// Descriptions (écran 2) : la juste (= variante) et trois leurres par variante.
// ============================================================================

export const LEURRES: Record<VarianteDC, string[]> = {
  hyperboleC: ["hcOrdonnees", "hcSomme", "hcSommets"],
  secondMembre: ["smEllipse", "smTrenteSix", "smUnSeul"],
  p2p: ["ppDouble", "ppOrdonnees", "ppSommet"],
  deltaNul: ["dnSigne", "dnDeux", "dnX"],
  demiConique: ["dcDroite", "dcHyperbole", "dcDomaine"],
  brancheSigne: ["bsRacine", "bsY", "bsVerticale"],
  ellipseParallele: ["epRetour", "epNormale", "epRelation"],
  excentricite: ["exBA", "exPlus", "exSup"],
};

const fracL = (n: number, d: number) => nL(n / d);

export function descriptionFragments(id: string, e: E): Frag[] {
  const d = e.d;
  switch (id) {
    case "hyperboleC":
      return [t("Pour une hyperbole, "), l("c^2=a^2+b^2"), t(" ; la relation "), l("c^2=a^2-b^2"), t(" est celle de l'ellipse.")];
    case "hcOrdonnees":
      return [t("Les foyers sont sur l'axe des ordonnées, car "), l("b<a"), t(".")];
    case "hcSomme":
      return [t("Il fallait "), l("c=a+b"), t(".")];
    case "hcSommets":
      return [t("Les foyers d'une hyperbole sont ses sommets "), l("(\\pm a\\,;0)"), t(".")];
    case "secondMembre":
      return [t("En divisant par un nombre négatif, les deux termes changent de signe : on obtient "), l(`${carreSurL("y", d.B! * d.B!)}-${carreSurL("x", d.A! * d.A!)}=1`), t(", d'axe focal l'axe des ordonnées.")];
    case "smEllipse":
      return [t("Ce n'est pas une hyperbole mais une ellipse.")];
    case "smTrenteSix":
      return [t("Il fallait diviser par "), l(milliersL(d.A! * d.A! * d.B! * d.B!)), t(" et non par son opposé.")];
    case "smUnSeul":
      return [t("Il fallait diviser seulement le terme en "), l("x^2"), t(".")];
    case "p2p":
      return [l("p"), t(" est la distance du foyer à la directrice : le foyer est à "), l("\\dfrac p2"), t(" du sommet, en "), l("\\left(\\dfrac p2\\,;0\\right)"), t(".")];
    case "ppDouble":
      return [t("Il fallait "), l(`p=${2 * d.N!}`), t(".")];
    case "ppOrdonnees":
      return [t("Le foyer est sur l'axe des ordonnées.")];
    case "ppSommet":
      return [t("Le foyer d'une parabole est son sommet.")];
    case "deltaNul":
      return [l("\\Delta=0"), t(" donne une racine double : il y a un point commun, la droite est tangente à l'ellipse.")];
    case "dnSigne":
      return [t("Il fallait "), l("\\Delta=b^2+4ac"), t(".")];
    case "dnDeux":
      return [l("\\Delta=0"), t(" donne deux points communs distincts.")];
    case "dnX":
      return [t("Il fallait remplacer "), l("x"), t(" et non "), l("y"), t(".")];
    case "demiConique":
      return [t("Une racine carrée est positive : "), l("y"), t(d.s! > 0 ? " est toujours positif ou nul, " : " est toujours négatif ou nul, "), t("donc la courbe n'est que la moitié "), t(d.s! > 0 ? "supérieure" : "inférieure"), t(" de l'ellipse ; élever au carré ajoute l'autre moitié.")];
    case "dcDroite":
      return [t("Il ne fallait pas élever au carré : la courbe est une droite.")];
    case "dcHyperbole":
      return [t("La courbe est une hyperbole, pas une ellipse.")];
    case "dcDomaine":
      return [t("La courbe n'existe que pour "), l(`x\\geq ${d.a}`), t(".")];
    case "brancheSigne":
      return [t("P a une ordonnée négative : il est sur la branche "), l("y=-f(x)"), t(", dont la dérivée est de signe opposé.")];
    case "bsRacine":
      return [t("La dérivée de "), l("\\sqrt{u}"), t(" est "), l("\\dfrac{u'}{\\sqrt{u}}"), t(".")];
    case "bsY":
      return [t("Il fallait dériver par rapport à "), l("y"), t(".")];
    case "bsVerticale":
      return [t("La tangente en "), l("P"), t(" est verticale.")];
    case "ellipseParallele":
      return [t("C'est la propriété de la parabole : dans un miroir elliptique, un rayon issu d'un foyer est réfléchi vers l'autre foyer ; il porte la droite "), l("(PF)"), t(".")];
    case "epRetour":
      return [t("Le rayon réfléchi repasse par "), l("F'"), t(".")];
    case "epNormale":
      return [t("Le rayon réfléchi est perpendiculaire à la tangente en "), l("P"), t(".")];
    case "epRelation":
      return [t("Il fallait "), l("c^2=a^2+b^2"), t(".")];
    case "excentricite":
      return [t("L'excentricité est "), l("e=\\dfrac{c}{a}"), t(" ; celle d'une ellipse est toujours comprise entre 0 et 1, et "), l(fracL(d.a!, d.c!)), t(" > 1 aurait dû alerter.")];
    case "exBA":
      return [t("Il fallait "), l("e=\\dfrac{b}{a}"), t(".")];
    case "exPlus":
      return [t("Il fallait "), l("c^2=a^2+b^2"), t(".")];
    case "exSup":
      return [t("Une ellipse a une excentricité supérieure à 1.")];
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
  reste: Omit<CopieDC, "enonce" | "lignes" | "ligneFausse" | "regles">;
}

const VIDE = { points: [] as Pt[], nombre: 0, poly: {} as Poly, pointsCopie: [] as Pt[], nombreCopie: 0, polyCopie: {} as Poly };
const polyDroite = (dr: D): Poly => ({ x: dr.a, y: dr.b, "1": dr.c });

/** Équation entière ordonnée en x d'une ellipse coupée par y = mx + K. */
function equationEllipseDroite(a: number, b: number, m: number, K: number) {
  let A = b * b + a * a * m * m;
  let B = 2 * a * a * m * K;
  let C = a * a * (K * K - b * b);
  for (let s = 1; s <= 64; s++) {
    if ([A, B, C].every((v) => Math.abs(v * s - Math.round(v * s)) < 1e-9)) {
      A = Math.round(A * s);
      B = Math.round(B * s);
      C = Math.round(C * s);
      break;
    }
  }
  return { A, B, C, latex: `${termeL(A, "x^2", true)}${termeL(B, "x")}${termeL(C, "")}=0` };
}

function canonique(e: E): Canonique {
  const d = e.d;
  switch (e.variante) {
    case "hyperboleC": {
      const a = d.a!;
      const b = d.b!;
      const c = Math.sqrt(a * a + b * b);
      const cf2 = a * a - b * b;
      const vrais = [{ x: c, y: 0 }, { x: -c, y: 0 }];
      const faux = [{ x: Math.sqrt(cf2), y: 0 }, { x: -Math.sqrt(cf2), y: 0 }];
      return {
        enonce: [t("Détermine les foyers de l'hyperbole "), l(`${carreSurL("x", a * a)}-${carreSurL("y", b * b)}=1`), t(".")],
        preliminaires: [
          { ligne: [t("Le terme positif est en "), l("x^2"), t(" : l'axe focal est l'axe des abscisses.")], regle: "axe focal" },
          { ligne: [t("On lit "), l(`a^2=${a * a}`), t(" et "), l(`b^2=${b * b}`), t(".")], regle: "lecture de a² et b²" },
          { ligne: [t("Donc "), l(`a=${a}`), t(" et "), l(`b=${b}`), t(".")], regle: "racines" },
        ],
        fausse: { ligne: [l(`c^2=a^2-b^2=${a * a}-${b * b}=${cf2}`), t(".")], regle: "relation entre a, b et c" },
        suites: [{ ligne: [l(`c=${racineL(cf2)}`), t(", foyers "), l(listeL(faux)), t(".")], regle: "conclusion" }],
        reste: {
          ...VIDE,
          type: "points",
          demande: [t("les coordonnées des deux foyers")],
          points: vrais,
          pointsCopie: faux,
          reponseL: listeL(vrais),
          regleCours: { texte: [t("Hyperbole "), l("\\dfrac{x^2}{a^2}-\\dfrac{y^2}{b^2}=1"), t(" (cours, point 1) : foyers "), l("(\\pm c\\,;0)"), t(" avec :")], latex: "c^2=a^2+b^2" },
          aideCorrection: { texte: [t("Calcule "), l("c^2=a^2+b^2"), t(" avec "), l(`a^2=${a * a}`), t(" et "), l(`b^2=${b * b}`), t(".")] },
          piege: [t("Ce sont les foyers de la copie : "), l("c^2=a^2-b^2"), t(" est la relation de l'ellipse.")],
          corrigeA: { utilise: [t("Relation de l'hyperbole (cours, point 1).")], lignes: [ligne(`c^2=a^2+b^2=${a * a}+${b * b}=${a * a + b * b}`)] },
          corrigeB: { utilise: [t("Pour une hyperbole, "), l("c>a"), t(" : les foyers sont plus loin du centre que les sommets. La copie donne "), l(`c=${racineL(cf2)}<a=${a}`), t(", impossible.")], lignes: [] },
          corrigeC: { utilise: [t("On reprend à partir de la ligne fausse.")], lignes: [ligne(`c=\\sqrt{${a * a + b * b}}=${nL(c)}`), ligne(`F(${nL(c)}\\,;0)\\quad F'(${nL(-c)}\\,;0)`)], verification: [l(`c=${nL(c)}>a=${a}`), t(" : les foyers sont bien au-delà des sommets.")] },
        },
      };
    }
    case "secondMembre": {
      const A = d.A!;
      const B = d.B!;
      const A2 = A * A;
      const B2 = B * B;
      const K = A2 * B2;
      const vrais = [{ x: 0, y: B }, { x: 0, y: -B }];
      const faux = [{ x: A, y: 0 }, { x: -A, y: 0 }];
      return {
        enonce: [t("Détermine les sommets de la conique d'équation "), l(`${coefL(B2)}x^2-${coefL(A2)}y^2=-${milliersL(K)}`), t(".")],
        preliminaires: [
          { ligne: [t("Les coefficients de "), l("x^2"), t(" et de "), l("y^2"), t(" sont de signes contraires : c'est une hyperbole (ou deux droites).")], regle: "nature" },
          { ligne: [t("Le second membre n'est pas nul : ce ne sont pas deux droites.")], regle: "cas dégénéré écarté" },
          { ligne: [t("Pour avoir un second membre égal à 1, on divise par "), l(`-${milliersL(K)}`), t(".")], regle: "méthode" },
        ],
        fausse: { ligne: [l(`${carreSurL("x", A2)}-${carreSurL("y", B2)}=1`), t(".")], regle: "division" },
        suites: [{ ligne: [t("L'axe focal est l'axe des abscisses : sommets "), l(listeL(faux)), t(".")], regle: "conclusion" }],
        reste: {
          ...VIDE,
          type: "points",
          demande: [t("les coordonnées des sommets")],
          points: vrais,
          pointsCopie: faux,
          reponseL: listeL(vrais),
          regleCours: { texte: [t("Diviser les deux membres par un nombre négatif change le signe de chaque terme ; le terme positif indique l'axe focal (cours, point 1).")] },
          aideCorrection: { texte: [t("Divise chaque terme par "), l(`-${milliersL(K)}`), t(", puis repère le terme positif.")] },
          piege: [t("Ce sont les sommets de la copie : les signes n'ont pas été changés en divisant par un nombre négatif.")],
          corrigeA: { utilise: [t("On divise chaque terme par "), l(`-${milliersL(K)}`), t(".")], lignes: [ligne(`\\dfrac{${coefL(B2)}x^2}{-${milliersL(K)}}-\\dfrac{${coefL(A2)}y^2}{-${milliersL(K)}}=1`), ligne(`-${carreSurL("x", A2)}+${carreSurL("y", B2)}=1`)] },
          corrigeB: { utilise: [t("Contrôle : le point "), l(`(${A}\\,;0)`), t(" de la copie vérifie-t-il l'équation de départ ?")], lignes: [ligne(`${milliersL(B2)}\\cdot ${A2}-0=${milliersL(K)}\\neq -${milliersL(K)}`)] },
          corrigeC: { utilise: [t("On reprend à partir de la ligne fausse.")], lignes: [ligne(`${carreSurL("y", B2)}-${carreSurL("x", A2)}=1`, "axe focal : l'axe des ordonnées"), ligne(`x=0\\ :\\ y^2=${B2},\\ y=\\pm${B}`)], verification: [t("Pour "), l(`(0\\,;${B})`), t(" : "), l(`0-${milliersL(A2)}\\cdot ${B2}=-${milliersL(K)}`), t(".")] },
        },
      };
    }
    case "p2p": {
      const N = d.N!;
      const p = N / 2;
      const vrai = { x: p / 2, y: 0 };
      const faux = { x: p, y: 0 };
      return {
        enonce: [t("Détermine le foyer de la parabole "), l(`y^2=${N}x`), t(".")],
        preliminaires: [
          { ligne: [t("La parabole a pour sommet l'origine et pour axe l'axe des abscisses.")], regle: "sommet et axe" },
          { ligne: [t("Elle est de la forme "), l("y^2=2px"), t(".")], regle: "forme du cours" },
          { ligne: [l(`2p=${N}`), t(", donc "), l(`p=${nL(p)}`), t(".")], regle: "lecture de p" },
        ],
        fausse: { ligne: [t("Le foyer est "), l(`F(p\\,;0)=(${nL(p)}\\,;0)`), t(".")], regle: "position du foyer" },
        suites: [{ ligne: [t("La directrice est la droite "), l(`x=${nL(-p)}`), t(".")], regle: "directrice" }],
        reste: {
          ...VIDE,
          type: "points",
          demande: [t("les coordonnées du foyer")],
          points: [vrai],
          pointsCopie: [faux],
          reponseL: `F${coordL(vrai)}`,
          regleCours: { texte: [t("Parabole "), l("y^2=2px"), t(" (cours, point 1) : "), l("p=\\text{dist}(F\\,;d)"), t(", donc :")], latex: "F\\left(\\dfrac p2\\,;0\\right),\\quad d\\equiv x=-\\dfrac p2" },
          aideCorrection: { texte: [t("Le sommet est au milieu du foyer et de la directrice : il est à "), l("\\dfrac p2"), t(" de chacun.")] },
          piege: [t("C'est le foyer de la copie : il est à "), l("p"), t(" du sommet au lieu de "), l("\\dfrac p2"), t(".")],
          corrigeA: { utilise: [t("Position du foyer de "), l("y^2=2px"), t(" (cours, point 1).")], lignes: [ligne(`F\\left(\\dfrac p2\\,;0\\right)=\\left(${nL(p / 2)}\\,;0\\right)`)] },
          corrigeB: { utilise: [t("Contrôle par la définition : le point "), l(`M(${nL(p / 2)}\\,;${nL(p)})`), t(" de la parabole doit être à la même distance du foyer et de la directrice. Avec le foyer et la directrice de la copie :")], lignes: [ligne(`MF=\\sqrt{${pL(p / 2 - p)}^2+${pL(p)}^2}\\neq ${nL(p / 2)}+${nL(p)}=\\text{dist}(M\\,;d)`)] },
          corrigeC: { utilise: [t("On reprend à partir de la ligne fausse.")], lignes: [ligne(`F\\left(${nL(p / 2)}\\,;0\\right)`), ligne(`d\\equiv x=${nL(-p / 2)}`)], verification: [t("Pour "), l(`M(${nL(p / 2)}\\,;${nL(p)})`), t(" : "), l(`MF=${nL(p)}`), t(" et "), l(`\\text{dist}(M\\,;d)=${nL(p / 2)}+${nL(p / 2)}=${nL(p)}`), t(".")] },
        },
      };
    }
    case "deltaNul": {
      const { a, b, m, K } = d as Record<string, number>;
      const eq = equationEllipseDroite(a!, b!, m!, K!);
      const x = (-a! * a! * m!) / K!;
      const y = (b! * b!) / K!;
      const droite = `y=${coefL(m!)}x${sgL(K!)}`;
      return {
        enonce: [t("Détermine les points communs à l'ellipse "), l(`${carreSurL("x", a! * a!)}+${carreSurL("y", b! * b!)}=1`), t(" et à la droite "), l(droite), t(".")],
        preliminaires: [
          { ligne: [t("On remplace "), l("y"), t(" par "), l(`${coefL(m!)}x${sgL(K!)}`), t(" dans l'équation de l'ellipse.")], regle: "substitution" },
          { ligne: [t("On obtient "), l(eq.latex), t(".")], regle: "développement" },
          { ligne: [l(`\\Delta=${pL(eq.B)}^2-4\\cdot ${eq.A}\\cdot ${nPL(eq.C)}=0`), t(".")], regle: "discriminant" },
        ],
        fausse: { ligne: [l("\\Delta=0"), t(" : l'équation n'a pas de solution, il n'y a aucun point commun.")], regle: "interprétation de Δ" },
        suites: [{ ligne: [t("La droite est extérieure à l'ellipse.")], regle: "conclusion" }],
        reste: {
          ...VIDE,
          type: "points",
          demande: [t("le ou les points communs")],
          points: [{ x, y }],
          pointsCopie: [],
          reponseL: coordL({ x, y }),
          regleCours: { texte: [t("Équation du second degré (cours, point 4) : "), l("\\Delta>0"), t(" deux solutions, "), l("\\Delta=0"), t(" une solution double (tangente), "), l("\\Delta<0"), t(" aucune.")] },
          aideCorrection: { texte: [t("Racine double : "), l("x=-\\dfrac{b}{2a}"), t(", puis "), l("y"), t(" sur la droite.")] },
          piege: [t("Il y a une solution double, donc un point.")],
          corrigeA: { utilise: [t("Interprétation du discriminant (cours, point 4).")], lignes: [ligne(`\\Delta=0\\ \\Rightarrow\\ x=-\\dfrac{${nL(eq.B)}}{2\\cdot ${eq.A}}=${nL(x)}`, "racine double")] },
          corrigeB: { utilise: [t("C'est "), l("\\Delta<0"), t(" qui donne « aucune solution » ; "), l("\\Delta=0"), t(" donne une racine double : la droite touche l'ellipse en un point, elle est tangente.")], lignes: [] },
          corrigeC: { utilise: [t("On reprend à partir de la ligne fausse.")], lignes: [ligne(`x=${nL(x)}`), ligne(`y=${nL(m!)}\\cdot ${nPL(x)}${sgL(K!)}=${nL(y)}`)], verification: [l(`${carreSurL(pL(x), a! * a!)}+${carreSurL(pL(y), b! * b!)}=${nL((x * x) / (a! * a!))}+${nL((y * y) / (b! * b!))}=1`), t(" : le point est sur l'ellipse.")] },
        },
      };
    }
    case "demiConique": {
      const { a, b, x0, s } = d as Record<string, number>;
      const y0 = (b! / a!) * Math.sqrt(a! * a! - x0! * x0!);
      const vrai = { x: x0!, y: s! * y0 };
      const faux = [{ x: x0!, y: y0 }, { x: x0!, y: -y0 }];
      const courbe = `y=${s! > 0 ? "" : "-"}${coefL(b! / a!)}\\sqrt{${a! * a!}-x^2}`;
      return {
        enonce: [t("Détermine les points d'intersection de la courbe "), l(`\\mathcal{C}:\\ ${courbe}`), t(" et de la droite "), l(`x=${nL(x0!)}`), t(".")],
        preliminaires: [
          { ligne: [t("La courbe est définie pour "), l(`-${a}\\leq x\\leq ${a}`), t(".")], regle: "domaine" },
          { ligne: [t("En élevant au carré : "), l(`y^2=\\dfrac{${b! * b!}}{${a! * a!}}\\left(${a! * a!}-x^2\\right)`), t(".")], regle: "élévation au carré" },
          { ligne: [t("Soit "), l(`${carreSurL("x", a! * a!)}+${carreSurL("y", b! * b!)}=1`), t(".")], regle: "réduction" },
        ],
        fausse: { ligne: [t("La courbe "), l("\\mathcal{C}"), t(" est donc l'ellipse "), l(`${carreSurL("x", a! * a!)}+${carreSurL("y", b! * b!)}=1`), t(".")], regle: "nature de la courbe" },
        suites: [{ ligne: [t("Pour "), l(`x=${nL(x0!)}`), t(" : "), l(`y=\\pm${nL(y0)}`), t(", d'où "), l(listeL(faux)), t(".")], regle: "intersection" }],
        reste: {
          ...VIDE,
          type: "points",
          demande: [t("le ou les points d'intersection")],
          points: [vrai],
          pointsCopie: faux,
          reponseL: coordL(vrai),
          regleCours: { texte: [t("Une conique est la réunion de deux graphiques "), l("y=\\pm f(x)"), t(" ; une seule des deux formules ne décrit que la moitié de la conique (cours, points 1 et 5).")] },
          aideCorrection: { texte: [t("Quel est le signe de "), l("y"), t(" pour un point de "), l("\\mathcal{C}"), t(" ?")] },
          piege: [t("Ce sont les deux points de l'ellipse entière ; la courbe n'en garde qu'un.")],
          corrigeA: { utilise: [t("Une racine carrée est positive ou nulle.")], lignes: [ligne(`${courbe}\\ \\Rightarrow\\ y${s! > 0 ? "\\geq" : "\\leq"} 0`), ligne(`\\mathcal{C}=\\text{ellipse}\\cap\\{y${s! > 0 ? "\\geq" : "\\leq"} 0\\}`)] },
          corrigeB: { utilise: [t("Élever au carré n'est pas une équivalence : les points de l'autre moitié vérifient aussi "), l("y^2=\\ldots"), t(". Le point "), l(coordL({ x: x0!, y: -s! * y0 })), t(" de la copie ne vérifie pas l'équation de "), l("\\mathcal{C}"), t(".")], lignes: [] },
          corrigeC: { utilise: [t("On reprend à partir de la ligne fausse.")], lignes: [ligne(`y=${s! > 0 ? "" : "-"}${coefL(b! / a!)}\\sqrt{${a! * a!}-${pL(x0!)}^2}=${nL(s! * y0)}`)], verification: [t("Un seul point : "), l(coordL(vrai)), t(".")] },
        },
      };
    }
    case "brancheSigne": {
      const { a, b, xp, yp } = d as Record<string, number>;
      const P = { x: xp!, y: yp! };
      const m = -(b! * b! * P.x) / (a! * a! * P.y);
      const mf = -m;
      const juste = tangenteDedoublee({ type: "ellipse", a: a!, b: b! }, P);
      const fausse = normaliserDroite({ a: mf, b: -1, c: P.y - mf * P.x });
      const k = coefL(b! / a!);
      return {
        enonce: [t("Détermine par la dérivée l'équation de la tangente à l'ellipse "), l(`${carreSurL("x", a! * a!)}+${carreSurL("y", b! * b!)}=1`), t(" au point "), l(`P${coordL(P)}`), t(".")],
        preliminaires: [
          { ligne: [l(`${carreSurL(pL(P.x), a! * a!)}+${carreSurL(pL(P.y), b! * b!)}=1`), t(" : "), l("P"), t(" est sur l'ellipse.")], regle: "vérification" },
          { ligne: [t("On isole "), l("y"), t(" : "), l(`y=\\pm${k}\\sqrt{${a! * a!}-x^2}`), t(".")], regle: "deux fonctions" },
          { ligne: [t("La pente de la tangente est le nombre dérivé en "), l(`x_P=${nL(P.x)}`), t(".")], regle: "méthode" },
        ],
        fausse: { ligne: [t("On dérive "), l(`f(x)=${k}\\sqrt{${a! * a!}-x^2}`), t(" : "), l(`f'(${nL(P.x)})=${nL(mf)}`), t(".")], regle: "dérivée" },
        suites: [{ ligne: [t("Tangente : "), l(`y${sgL(-P.y)}=${nPL(mf)}(x${sgL(-P.x)})`), t(", soit "), l(droiteL(fausse)), t(".")], regle: "équation de la tangente" }],
        reste: {
          ...VIDE,
          type: "equation",
          demande: [t("une équation de la tangente en "), l("P")],
          poly: polyDroite(juste),
          polyCopie: polyDroite(fausse),
          reponseL: droiteL(juste),
          regleCours: { texte: [t("On dérive la fonction dont le graphique contient "), l("P"), t(" : "), l("y=f(x)"), t(" si "), l("y_P>0"), t(", "), l("y=-f(x)"), t(" si "), l("y_P<0"), t(" (cours, point 5).")] },
          aideCorrection: { texte: [t("Ici "), l("y_P<0"), t(" : la pente est l'opposé de "), l(nL(mf)), t(".")] },
          piege: [t("C'est la tangente de la copie : elle a la pente de l'autre branche.")],
          corrigeA: { utilise: [t("P a une ordonnée négative : il est sur la branche "), l("y=-f(x)"), t(".")], lignes: [ligne(`g(x)=-${k}\\sqrt{${a! * a!}-x^2}`), ligne(`g'(${nL(P.x)})=-f'(${nL(P.x)})=${nL(m)}`)] },
          corrigeB: { utilise: [t("Contrôle par la formule du cours "), l("-\\dfrac{b^2x_P}{a^2y_P}"), t(" :")], lignes: [ligne(`-\\dfrac{${b! * b!}\\cdot ${nPL(P.x)}}{${a! * a!}\\cdot ${nPL(P.y)}}=${nL(m)}\\neq ${nL(mf)}`)] },
          corrigeC: { utilise: [t("On reprend à partir de la ligne fausse.")], lignes: [ligne(`y${sgL(-P.y)}=${nPL(m)}(x${sgL(-P.x)})`), ligne(droiteL(juste))], verification: [t("Forme dédoublée : "), l(`\\dfrac{${nPL(P.x)}\\,x}{${a! * a!}}+\\dfrac{${nPL(P.y)}\\,y}{${b! * b!}}=1`), t(", la même droite.")] },
        },
      };
    }
    case "ellipseParallele": {
      const { a, b, c, xp, yp } = d as Record<string, number>;
      const P = { x: xp!, y: yp! };
      const F = { x: c!, y: 0 };
      const pf = normaliserDroite({ a: P.y - F.y, b: F.x - P.x, c: -(P.y - F.y) * F.x - (F.x - P.x) * F.y });
      return {
        enonce: [t("Un miroir elliptique a pour section l'ellipse "), l(`${carreSurL("x", a! * a!)}+${carreSurL("y", b! * b!)}=1`), t(". Un rayon issu du foyer "), l(`F'(${-c!}\\,;0)`), t(" frappe le miroir en "), l(`P${coordL(P)}`), t(". Détermine une équation de la droite qui porte le rayon réfléchi.")],
        preliminaires: [
          { ligne: [l(`c^2=a^2-b^2=${a! * a!}-${b! * b!}=${c! * c!}`), t(", donc "), l(`c=${c}`), t(".")], regle: "foyers" },
          { ligne: [t("Les foyers sont "), l(`F(${c}\\,;0)`), t(" et "), l(`F'(${-c!}\\,;0)`), t(".")], regle: "foyers" },
          { ligne: [t("Le point "), l("P"), t(" est bien sur l'ellipse.")], regle: "vérification" },
        ],
        fausse: { ligne: [t("Comme pour un miroir parabolique, le rayon réfléchi est parallèle à l'axe focal.")], regle: "propriété optique" },
        suites: [{ ligne: [t("Il porte la droite "), l(`y=${nL(P.y)}`), t(".")], regle: "conclusion" }],
        reste: {
          ...VIDE,
          type: "equation",
          demande: [t("une équation du rayon réfléchi")],
          poly: polyDroite(pf),
          polyCopie: { y: 1, "1": -P.y },
          reponseL: droiteL(pf),
          regleCours: { texte: [t("Miroir elliptique (cours, point 6) : un rayon issu d'un foyer est réfléchi en passant par l'autre foyer. Seul le miroir parabolique renvoie parallèlement à l'axe.")] },
          aideCorrection: { texte: [t("Le rayon réfléchi passe par "), l("P"), t(" et par "), l(`F(${c}\\,;0)`), t(".")] },
          piege: [t("C'est la droite de la copie : parallèle à l'axe, comme dans une parabole.")],
          corrigeA: { utilise: [t("Propriété optique de l'ellipse (cours, point 6).")], lignes: [ligne("\\text{rayon réfléchi}=(PF)", "issu de F′, il passe par F")] },
          corrigeB: { utilise: [t("La propriété « réfléchi parallèlement à l'axe » est celle d'un rayon issu du foyer d'une parabole ; l'ellipse relie ses deux foyers.")], lignes: [] },
          corrigeC: { utilise: [t("On reprend à partir de la ligne fausse : droite par "), l(`P${coordL(P)}`), t(" et "), l(`F(${c}\\,;0)`), t(".")], lignes: [ligne(droiteL(pf))], verification: [t("Les coordonnées de "), l("P"), t(" et de "), l("F"), t(" vérifient l'équation.")] },
        },
      };
    }
    case "excentricite": {
      const { a, b, c } = d as Record<string, number>;
      return {
        enonce: [t("Calcule l'excentricité de l'ellipse "), l(`${carreSurL("x", a! * a!)}+${carreSurL("y", b! * b!)}=1`), t(".")],
        preliminaires: [
          { ligne: [l(`a^2=${a! * a!}`), t(" et "), l(`b^2=${b! * b!}`), t(", donc "), l(`a=${a}`), t(".")], regle: "lecture" },
          { ligne: [l(`c^2=a^2-b^2=${a! * a!}-${b! * b!}=${c! * c!}`), t(".")], regle: "relation de l'ellipse" },
          { ligne: [l(`c=${c}`), t(".")], regle: "racine" },
        ],
        fausse: { ligne: [l(`e=\\dfrac{a}{c}=${fracL(a!, c!)}`), t(".")], regle: "excentricité" },
        suites: [{ ligne: [t("L'excentricité de l'ellipse vaut "), l(fracL(a!, c!)), t(".")], regle: "conclusion" }],
        reste: {
          ...VIDE,
          type: "nombre",
          demande: [t("l'excentricité")],
          nombre: c! / a!,
          nombreCopie: a! / c!,
          reponseL: `e=${fracL(c!, a!)}`,
          regleCours: { texte: [t("Excentricité (cours, point 2) : "), l("e=\\dfrac{c}{a}"), t(" ; pour une ellipse, "), l("0\\leq e<1"), t(".")] },
          aideCorrection: { texte: [t("Divise "), l("c"), t(" par "), l("a"), t(".")] },
          piege: [t("C'est l'inverse : "), l("e=\\dfrac{c}{a}"), t(", qui est inférieure à 1 pour une ellipse.")],
          corrigeA: { utilise: [t("Excentricité (cours, point 2).")], lignes: [ligne(`e=\\dfrac{c}{a}=${fracL(c!, a!)}`)] },
          corrigeB: { utilise: [t("Une ellipse a une excentricité strictement inférieure à 1, car "), l("c<a"), t(" : la valeur "), l(`${fracL(a!, c!)}>1`), t(" est impossible.")], lignes: [] },
          corrigeC: { utilise: [t("On reprend à partir de la ligne fausse.")], lignes: [ligne(`e=\\dfrac{${c}}{${a}}=${fracL(c!, a!)}`)], verification: [l(`0<${fracL(c!, a!)}<1`), t(" : c'est bien une ellipse.")] },
        },
      };
    }
  }
}

const coordL = (p: Pt): string => {
  const c = `${nL(p.x)}\\,;${nL(p.y)}`;
  return /dfrac/.test(c) ? `\\left(${c}\\right)` : `(${c})`;
};

export function copie(e: E): CopieDC {
  const c = canonique(e);
  const av = e.d.av ?? 0;
  const prelims = c.preliminaires.slice(3 - av);
  const lignes = [...prelims.map((p) => p.ligne), c.fausse.ligne, ...c.suites.map((s) => s.ligne)];
  const regles = [...prelims.map((p) => p.regle), c.fausse.regle, ...c.suites.map((s) => s.regle)];
  return { enonce: c.enonce, lignes, ligneFausse: av, regles, ...c.reste };
}

export const nombreLignes = (e: E): number => copie(e).lignes.length;
export const evalPolyDC = (p: Poly, m: Pt): number => evalPoly(p, m.x, m.y);
