import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDroitesRemarquables } from "../../core/droitesRemarquables.types";
import { q, qp } from "../../ui/corrigeChapitre3";
import {
  COURS_DISTANCE,
  COURS_INTERSECTION,
  COURS_LIEU,
  COURS_RELATIONS,
  lignesDistance,
  lignesDroiteNormale,
  lignesIntersection,
  lignesMilieu,
  lignesNorme,
  lignesPied,
  lignesPointSurDroite,
  lignesSysteme,
  lignesVecteur,
} from "../../ui/corrigeLotG";
import { LIB, figure } from "../../ui/formatDroitesRemarquables";
import { colonne, droiteLatex, milieu, pointLatex, racine, vecteur, type Droite, type Pt } from "../../ui/geometrieLotG";

/**
 * Corrigé détaillé « comme au tableau » de gen94 « Droites remarquables d'un triangle » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`ui/formatDroitesRemarquables.ts::ecrans`) ;
 * partagé par l'adaptateur papier et l'appli. Vérifications : médiatrices — O équidistant des trois
 * sommets ; hauteurs — H sur la troisième hauteur (produit scalaire nul) ; médianes — G = moyenne des
 * coordonnées ; aire — H sur (BC).
 */

type E = ExerciceDroitesRemarquables;

const carre = (t: number) => (t < 0 ? `(${q(t)})^2` : `${q(t)}^2`);

function etapesMediatrice(l: string, id: string, p: Pt, q0: Pt, np: string, nq: string, d: Droite): EtapeCorrection[] {
  const m = milieu(p, q0);
  return [
    utilise(l, [texte(`La médiatrice de [${np}${nq}] passe par le milieu M du côté et a pour vecteur normal `), latex(`\\vec{${np}${nq}}`), texte(` ${COURS_LIEU}.`)]),
    calcul(l, [...lignesMilieu("M", p, q0), ...lignesVecteur(`${np}${nq}`, p, q0), ...lignesDroiteNormale(vecteur(p, q0), m, [texte("vecteur normal "), latex(`\\vec{${np}${nq}}`), texte(", point M")])]),
    resultat(l, [latex(`${LIB[id]}\\equiv ${droiteLatex(d)}`)]),
    verification(l, [texte("Le milieu M est sur la médiatrice : ")], lignesPointSurDroite(d, m, "M")),
    piege(l, [texte("Le vecteur du côté est normal à la médiatrice (pas directeur) ; la médiatrice passe par le milieu, pas par un sommet.")]),
  ];
}

function etapesHauteur(l: string, id: string, s: Pt, p: Pt, q0: Pt, ns: string, np: string, nq: string, d: Droite): EtapeCorrection[] {
  return [
    utilise(l, [texte(`La hauteur issue de ${ns} passe par ${ns} et est perpendiculaire au côté (${np}${nq}) : `), latex(`\\vec{${np}${nq}}`), texte(` en est un vecteur normal ${COURS_RELATIONS}.`)]),
    calcul(l, [...lignesVecteur(`${np}${nq}`, p, q0), ...lignesDroiteNormale(vecteur(p, q0), s, [texte("vecteur normal "), latex(`\\vec{${np}${nq}}`), texte(`, point ${ns}`)])]),
    resultat(l, [latex(`${LIB[id]}\\equiv ${droiteLatex(d)}`)]),
    verification(l, [texte(`Le sommet ${ns} est sur la hauteur : `)], lignesPointSurDroite(d, s, ns)),
    piege(l, [texte(`La hauteur passe par le sommet ${ns}, pas par le milieu de [${np}${nq}] (ce serait la médiatrice) ; le côté donne un vecteur normal, pas directeur.`)]),
  ];
}

function etapesMediane(l: string, id: string, s: Pt, p: Pt, q0: Pt, ns: string, np: string, nq: string, d: Droite): EtapeCorrection[] {
  const m = milieu(p, q0);
  const v = vecteur(s, m);
  const entier = Number.isInteger(v.x) && Number.isInteger(v.y);
  const u = entier ? v : { x: 2 * v.x, y: 2 * v.y };
  const n = { x: -u.y, y: u.x };
  const lignes: LigneCalcul[] = [...lignesMilieu("M", p, q0), ...lignesVecteur(`${ns}M`, s, m)];
  if (!entier) lignes.push(ligne(`\\vec{u}=2\\vec{${ns}M}=${colonne(u)}`, "même direction, sans fraction"));
  lignes.push(ligne(`\\vec{n}=${colonne(n)}`, [texte("on tourne "), latex(entier ? `\\vec{${ns}M}` : "\\vec{u}"), texte(" d'un quart de tour : vecteur normal")]));
  lignes.push(...lignesDroiteNormale(n, s, [texte("vecteur normal "), latex("\\vec{n}"), texte(`, point ${ns}`)]));
  return [
    utilise(l, [texte(`La médiane issue de ${ns} passe par ${ns} et par le milieu M de [${np}${nq}] : `), latex(`\\vec{${ns}M}`), texte(` en est un vecteur directeur ${COURS_RELATIONS}.`)]),
    calcul(l, lignes),
    resultat(l, [latex(`${LIB[id]}\\equiv ${droiteLatex(d)}`)]),
    verification(l, [texte(`Le milieu M de [${np}${nq}] est sur la médiane : `)], lignesPointSurDroite(d, m, "M")),
    piege(l, [texte("La médiane passe par le milieu du côté opposé, pas par un autre sommet.")]),
  ];
}

function etapesPoint(l: string, e: E, nom: string, d1: string, d2: string, j1: string, j2: string, propriete: string): EtapeCorrection[] {
  const p = e.points[nom]!;
  const D1 = e.droites[d1]!;
  const D2 = e.droites[d2]!;
  const verif: EtapeCorrection[] = [];
  if (e.variante === "mediatrices") {
    verif.push(
      verification(
        l,
        [texte("O est à la même distance des trois sommets : ")],
        (
          [
            [e.a, "A"],
            [e.b, "B"],
            [e.c, "C"],
          ] as [Pt, string][]
        ).map(([s, n]) => ligne(`O${n}^2=${carre(s.x - p.x)}+${carre(s.y - p.y)}=${q((s.x - p.x) ** 2 + (s.y - p.y) ** 2)}`)),
      ),
    );
  } else if (e.variante === "hauteurs") {
    const ch = vecteur(e.c, p);
    const ab = vecteur(e.a, e.b);
    verif.push(
      verification(l, [texte("H est aussi sur la troisième hauteur, issue de C : ")], [
        ligne(`\\vec{CH}\\cdot\\vec{AB}=${q(ch.x)}\\cdot ${qp(ab.x)}+${qp(ch.y)}\\cdot ${qp(ab.y)}=${q(ch.x * ab.x + ch.y * ab.y)}`, "(CH) est perpendiculaire à (AB)"),
      ]),
    );
  } else {
    verif.push(
      verification(l, [texte("Le centre de gravité est aussi la moyenne des coordonnées des sommets : ")], [
        ligne(`x_G=\\dfrac{${q(e.a.x)}+${qp(e.b.x)}+${qp(e.c.x)}}{3}=${q(p.x)}`),
        ligne(`y_G=\\dfrac{${q(e.a.y)}+${qp(e.b.y)}+${qp(e.c.y)}}{3}=${q(p.y)}`),
      ]),
    );
  }
  return [
    utilise(l, [texte(`${propriete} Il est sur les deux droites : on résout le système ${COURS_INTERSECTION}.`)]),
    calcul(l, [...lignesSysteme(D1, D2, j1, j2), ...lignesIntersection(D1, D2, p, nom)]),
    { ...resultat(l, [latex(pointLatex(nom, p))]), figureHtml: figure(e) },
    ...verif,
    piege(l, [texte("Après la première coordonnée, remplace-la dans une équation pour obtenir la seconde ; contrôle dans l'autre.")]),
  ];
}

function etapesAire(e: E): EtapeCorrection[] {
  const bc2 = e.longueurs.BC!;
  const ah2 = e.longueurs.AH!;
  const d = e.droites.BCd!;
  const h = e.points.H!;
  const u = vecteur(e.b, e.c);
  const n = { x: -u.y, y: u.x };
  const produit = Math.sqrt(bc2 * ah2);
  return [
    utilise("a", [texte("La longueur d'un côté est la norme du vecteur correspondant (Pythagore).")]),
    calcul("a", [...lignesVecteur("BC", e.b, e.c), ...lignesNorme("BC", u)]),
    resultat("a", [latex(`BC=${racine(bc2)}`)]),
    piege("a", [texte("La longueur est la racine carrée de "), latex(`BC^2=${q(bc2)}`), texte(".")]),
    utilise("b", [texte("La droite (BC) passe par B et a pour vecteur directeur "), latex("\\vec{BC}"), texte(` ; tourné d'un quart de tour, il donne un vecteur normal ${COURS_RELATIONS}.`)]),
    calcul("b", [ligne(`\\vec{n}=${colonne(n)}`, [texte("on tourne "), latex("\\vec{BC}"), texte(" d'un quart de tour")]), ...lignesDroiteNormale(n, e.b, [texte("vecteur normal "), latex("\\vec{n}"), texte(", point B")])]),
    resultat("b", [latex(`(BC)\\equiv ${droiteLatex(d)}`)]),
    verification("b", [texte("C est aussi sur la droite : ")], lignesPointSurDroite(d, e.c, "C")),
    piege("b", [latex("\\vec{BC}"), texte(" est un vecteur directeur de (BC), pas un vecteur normal.")]),
    utilise("c", [texte(`Le pied H de la hauteur issue de A est l'intersection de (BC) et de la perpendiculaire à (BC) passant par A ${COURS_DISTANCE}.`)]),
    calcul("c", lignesPied(d, e.a, h, "A")),
    resultat("c", [latex(pointLatex("H", h))]),
    verification("c", [texte("H est sur (BC) : ")], lignesPointSurDroite(d, h, "H")),
    piege("c", [texte("La perpendiculaire a pour vecteur directeur le vecteur normal de (BC).")]),
    utilise("d", [texte(`La hauteur est la distance de A à (BC), c'est-à-dire la longueur AH ${COURS_DISTANCE}.`)]),
    calcul("d", lignesDistance(d, e.a, h, "A")),
    resultat("d", [latex(`AH=${racine(ah2)}`)]),
    piege("d", [texte("La hauteur n'est pas AB ni AC : seulement la distance perpendiculaire AH.")]),
    utilise("e", [texte("Aire d'un triangle : "), latex("\\mathcal{A}=\\dfrac{\\text{base}\\cdot\\text{hauteur}}{2}"), texte(" ; produit de racines : "), latex("\\sqrt{a}\\cdot\\sqrt{b}=\\sqrt{ab}"), texte(".")]),
    calcul("e", [
      ligne("\\mathcal{A}=\\dfrac{BC\\cdot AH}{2}", "base [BC], hauteur AH"),
      ligne(`=\\dfrac{${racine(bc2)}\\cdot ${racine(ah2)}}{2}`),
      ligne(`=\\dfrac{${q(produit)}}{2}`, `${racine(bc2).includes("sqrt") ? "produit des racines" : "on multiplie"}`),
      ligne(`=${q(e.aire!)}`),
    ]),
    { ...resultat("e", [latex(`\\mathcal{A}=${q(e.aire!)}`)]), figureHtml: figure(e) },
    piege("e", [texte("Ne pas oublier de diviser par 2.")]),
  ];
}

export function correctionDetailleeDroitesRemarquables(e: E): EtapeCorrection[] {
  const { a, b, c } = e;
  if (e.variante === "mediatrices") {
    return [
      ...etapesMediatrice("a", "m1", a, b, "A", "B", e.droites.m1!),
      ...etapesMediatrice("b", "m2", b, c, "B", "C", e.droites.m2!),
      ...etapesPoint("c", e, "O", "m1", "m2", "médiatrice de [AB]", "médiatrice de [BC]", "Le centre O du cercle circonscrit est équidistant des trois sommets : il est sur chaque médiatrice."),
    ];
  }
  if (e.variante === "hauteurs") {
    return [
      ...etapesHauteur("a", "h1", a, b, c, "A", "B", "C", e.droites.h1!),
      ...etapesHauteur("b", "h2", b, c, a, "B", "C", "A", e.droites.h2!),
      ...etapesPoint("c", e, "H", "h1", "h2", "hauteur issue de A", "hauteur issue de B", "L'orthocentre H est le point de concours des hauteurs."),
    ];
  }
  if (e.variante === "medianes") {
    return [
      ...etapesMediane("a", "md1", a, b, c, "A", "B", "C", e.droites.md1!),
      ...etapesMediane("b", "md2", b, c, a, "B", "C", "A", e.droites.md2!),
      ...etapesPoint("c", e, "G", "md1", "md2", "médiane issue de A", "médiane issue de B", "Le centre de gravité G est le point de concours des médianes."),
    ];
  }
  return etapesAire(e);
}
