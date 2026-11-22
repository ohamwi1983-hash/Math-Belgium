import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceTraduireLieu, LieuCercle, LieuDeuxParalleles, LieuDistanceDroite, LieuMediatrice, LieuParabole, Pt } from "../../core/traduireLieu.types";
import { q, qp, somme } from "../../ui/corrigeChapitre3";
import { dedoublonner, lignesDroiteNormale, lignesMilieu, lignesPointSurCercle, lignesPointSurDroite } from "../../ui/corrigeLotG";
import { milieu, reduireDroite } from "../../ui/geometrieLotG";
import {
  carreDistance,
  cercleL,
  coordL,
  d1De,
  d2Ecrite,
  d2Ramenee,
  directriceL,
  droiteDonneeL,
  droitesDistance,
  equationDroite,
  equationParabole,
  figureLieu,
  implicite,
  lieuParalleles,
  mediatrice,
  mediatriceBrute,
  parametresParabole,
  pointL,
  pointsDistance,
  traductions,
} from "../../ui/formatTraduireLieu";
import { colonne, nombreTexte } from "../../ui/outilsAnalytiqueLotG";

/**
 * Corrigé détaillé « comme au tableau » de gen131 (partagé par l'adaptateur et l'appli, une lettre
 * par écran). Médiatrice : a) MA² = MB² par Pythagore, b) développement (les carrés s'éliminent), c)
 * milieu sur la droite et vecteur normal parallèle à AB → médiatrice. Distance à une droite : a) la
 * nature (réunion de deux parallèles), b) deux points B, B′ à la distance r sur la perpendiculaire
 * (droite oblique), c) les deux parallèles — raccourci |y − k| = r pour une droite horizontale ou
 * verticale. Deux parallèles : a) critère de colinéarité des vecteurs normaux, b) d₂ ramenée, c
 * moyen. Parabole : a) nature, b) pied H, sommet milieu de [FH], p signé, c) forme du cours.
 * Cercle : a) nature, b) équation par Pythagore. Figure du lieu sous le dernier résultat.
 */

type E = ExerciceTraduireLieu;

const COURS_LIEU = "(cours, § 7)";
const T = texte;
const L = latex;

function avecFigure(e: E, x: EtapeCorrection): EtapeCorrection {
  return { ...x, figureHtml: `<div style="max-width:8cm;margin:6px auto">${figureLieu(e)}</div>` };
}

// --- médiatrice ------------------------------------------------------------------------------

function corrigeMediatrice(e: LieuMediatrice): EtapeCorrection[] {
  const { A, B } = e;
  const brute = mediatriceBrute(e);
  const d = mediatrice(e);
  const I = milieu(A, B);
  const dev = (P: Pt) =>
    somme([
      [1, "x^2"],
      [-2 * P.x, "x"],
      [P.x * P.x, ""],
      [1, "y^2"],
      [-2 * P.y, "y"],
      [P.y * P.y, ""],
    ]);
  const reduit = (P: Pt) =>
    somme([
      [-2 * P.x, "x"],
      [-2 * P.y, "y"],
      [P.x * P.x + P.y * P.y, ""],
    ]);
  const lignesB: LigneCalcul[] = [
    ligne(`MA^2=${dev(A)}`, [T("on développe : "), L("(x-a)^2=x^2-2ax+a^2")]),
    ligne(`MB^2=${dev(B)}`),
    ligne(`${reduit(A)}=${reduit(B)}`, [L("MA^2=MB^2"), T(" : "), L("x^2"), T(" et "), L("y^2"), T(" s'éliminent, on réduit")]),
    ligne(implicite(brute), "on passe tout dans le membre de gauche"),
  ];
  const k = brute.a / d.a;
  if (k !== 1) lignesB.push(ligne(implicite(d), `on divise les deux membres par ${nombreTexte(k)}`));
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  return [
    utilise("a", [T("Distance de deux points dans un repère orthonormé (Pythagore) : "), L("MA=\\sqrt{(x-x_A)^2+(y-y_A)^2}"), T(". Deux distances positives sont égales exactement quand leurs carrés le sont "), T(COURS_LIEU), T(".")]),
    calcul("a", [ligne(`MA^2=${carreDistance(A)}`, [T("avec "), L(pointL("A", A))]), ligne(`MB^2=${carreDistance(B)}`, [T("avec "), L(pointL("B", B))])]),
    resultat("a", [L("MA=MB"), T(" se traduit par "), L(traductions(e)[0]!), T(".")]),
    piege("a", [T("Sans les carrés, "), L("(x-x_A)+(y-y_A)"), T(" n'est pas une distance ; et chaque carré réunit les deux coordonnées d'un même point.")]),
    utilise("b", [T("On développe "), L("(x-a)^2=x^2-2ax+a^2"), T(" : les termes "), L("x^2"), T(" et "), L("y^2"), T(" sont les mêmes des deux côtés, ils disparaissent et il reste une équation du premier degré : une droite.")]),
    calcul("b", dedoublonner(lignesB)),
    resultat("b", [T("Le lieu a pour équation "), L(equationDroite(d)), T(".")]),
    verification("b", [T("Son vecteur normal "), L(colonne(d.a, d.b)), T(" est colinéaire à "), L(`\\vec{AB}${colonne(dx, dy)}`), T(" (critère de colinéarité) :")], [ligne(`${q(d.a)}\\cdot ${qp(dy)}-${qp(d.b)}\\cdot ${qp(dx)}=0`, "la droite est perpendiculaire à (AB)")]),
    piege("b", [T("En passant le membre de droite à gauche, tous ses termes changent de signe, la constante aussi.")]),
    utilise("c", [T("La médiatrice de [AB] est la droite perpendiculaire à [AB] en son milieu I : tous ses points sont équidistants de A et de B, et eux seuls "), T(COURS_LIEU), T(".")]),
    calcul("c", [...lignesMilieu("I", A, B), ...lignesPointSurDroite(d, I, "I")]),
    avecFigure(e, resultat("c", [T("La droite "), L(equationDroite(d)), T(" passe par le milieu "), L(pointL("I", I)), T(" de [AB] et elle est perpendiculaire à (AB) : c'est la médiatrice de [AB].")])),
    piege("c", [T("La droite (AB) n'est pas le lieu : A lui-même n'est pas équidistant de A et de B.")]),
  ];
}

// --- distance à une droite -------------------------------------------------------------------

function corrigeDistance(e: LieuDistanceDroite): EtapeCorrection[] {
  const [g1, g2] = droitesDistance(e);
  const sortie: EtapeCorrection[] = [
    utilise("a", [T("Les points à une distance donnée d'une droite forment la réunion de deux droites parallèles à celle-ci, une de chaque côté "), T(COURS_LIEU), T(".")]),
    calcul("a", [ligne(`\\text{dist}(M,d)=${e.r}`, "propriété qui définit le lieu : de part et d'autre de d")]),
    resultat("a", [T("Le lieu est la réunion de deux droites parallèles à "), L(`d\\equiv ${droiteDonneeL(e)}`), T(`, situées à la distance ${e.r} de d, une de chaque côté.`)]),
    piege("a", [T("Une seule parallèle ne suffit pas : elle ne contient que les points d'un côté de d.")]),
  ];
  if (e.type !== "oblique") {
    const v = e.type === "horizontale";
    const k = v ? e.A.y : e.A.x;
    const z = v ? "y" : "x";
    const ecart = `${z}-${qp(k)}`;
    sortie.push(
      utilise("b", [T(`Distance d'un point M à une droite ${v ? "horizontale" : "verticale"} `), L(`${z}=k`), T(" : "), L(`|${z}_M-k|`), T(", un simple écart " + (v ? "d'ordonnées" : "d'abscisses") + " (cours, § 6).")]),
      calcul("b", [
        ligne(`|${ecart}|=${e.r}`, "M est à la distance r de d"),
        ligne(`${ecart}=${e.r}`, `M ${v ? "au-dessus" : "à droite"} de d`),
        ligne(`${z}=${q(k + e.r)}`),
        ligne(`${ecart}=${-e.r}`, `M ${v ? "en dessous" : "à gauche"} de d`),
        ligne(`${z}=${q(k - e.r)}`),
      ]),
      avecFigure(e, resultat("b", [T("Le lieu est la réunion des droites "), L(equationDroite(g1)), T(" et "), L(equationDroite(g2)), T(".")])),
      verification("b", [T("La droite d est bien à mi-chemin des deux :")], [ligne(`\\dfrac{${q(k + e.r)}+${qp(k - e.r)}}{2}=${q(k)}`, `on retrouve ${z} = ${nombreTexte(k)}`)]),
      piege("b", [T(`Ces droites sont parallèles à d : elles s'écrivent ${z} = …, comme d.`)]),
    );
    return sortie;
  }
  const n = e.n;
  const [B, Bp] = pointsDistance(e);
  const f = e.r / 5;
  sortie.push(
    utilise("b", [T("Sur la perpendiculaire à d menée par A, on avance d'une longueur r dans un sens, puis dans l'autre : le vecteur "), L("\\dfrac{r}{\\|\\vec{n}\\|}\\,\\vec{n}"), T(" a la direction du vecteur normal et la norme r (cours, § 6).")]),
    calcul(
      "b",
      [
        ...lignesPointSurDroite(e.d, e.A, "A"),
        ligne(`\\|\\vec{n}\\|=\\sqrt{${qp(n.x)}^2+${qp(n.y)}^2}`, [T("norme de "), L(`\\vec{n}${colonne(n.x, n.y)}`)]),
        ligne("=\\sqrt{25}"),
        ligne("=5"),
        ligne(`\\dfrac{${e.r}}{5}\\,\\vec{n}=${colonne(f * n.x, f * n.y)}`, `vecteur de norme ${e.r}`),
        ligne(`x_B=${q(e.A.x)}+${qp(f * n.x)}=${q(B.x)}`, [L("B=A+\\dfrac{r}{5}\\,\\vec{n}")]),
        ligne(`y_B=${q(e.A.y)}+${qp(f * n.y)}=${q(B.y)}`),
        ligne(`x_{B'}=${q(e.A.x)}-${qp(f * n.x)}=${q(Bp.x)}`, [L("B'=A-\\dfrac{r}{5}\\,\\vec{n}")]),
        ligne(`y_{B'}=${q(e.A.y)}-${qp(f * n.y)}=${q(Bp.y)}`),
      ],
      [T("Le point "), L(pointL("A", e.A)), T(" est sur d :")],
    ),
    resultat("b", [L(pointL("B", B)), T(" et "), L(pointL("B'", Bp)), T(".")]),
    piege("b", [T(`Ajouter `), L("\\vec{n}"), T(` ne déplace pas de ${e.r} mais de sa norme, 5 : on multiplie d'abord par `), L(`\\dfrac{${e.r}}{5}`), T(".")]),
    utilise("c", [T("Chaque droite du lieu est parallèle à d : elle a le même vecteur normal "), L(`\\vec{n}${colonne(n.x, n.y)}`), T(" et passe par B, ou par B′ (cours, § 4).")]),
    calcul("c", [...lignesDroiteNormale(n, B, "parallèle à d passant par B"), ...lignesDroiteNormale(n, Bp, "parallèle à d passant par B′")]),
    avecFigure(e, resultat("c", [T("Le lieu est la réunion des droites "), L(equationDroite(g1)), T(" et "), L(equationDroite(g2)), T(".")])),
    verification("c", [T("La droite d est à mi-chemin des deux : son terme constant est la moyenne des leurs.")], [ligne(`\\dfrac{${q(g1.c)}+${qp(g2.c)}}{2}=${q(e.d.c)}`, [T("terme constant de "), L(`d\\equiv ${implicite(e.d)}`)])]),
    piege("c", [T("L'écart entre deux parallèles n'est pas l'écart de leurs termes constants : ici les termes constants s'écartent de "), L(`${e.r}\\cdot 5`), T(", pas de "), L(String(e.r)), T(".")]),
  );
  return sortie;
}

// --- deux parallèles -------------------------------------------------------------------------

function corrigeParalleles(e: LieuDeuxParalleles): EtapeCorrection[] {
  const d1 = d1De(e);
  const d2 = d2Ecrite(e);
  const lieu = lieuParalleles(e);
  const lieuEntier = reduireDroite(lieu);
  const lignesB: LigneCalcul[] = [];
  if (e.k !== 1) lignesB.push(ligne(`d_2\\equiv ${implicite(d2Ramenee(e))}`, `on divise l'équation de d₂ par ${nombreTexte(e.k)} : mêmes coefficients que d₁`));
  lignesB.push(ligne(`c=\\dfrac{${q(e.c1)}+${qp(e.c2)}}{2}`, "moyenne des termes constants"));
  lignesB.push(ligne(`=${q(lieu.c)}`));
  lignesB.push(ligne(implicite(lieu), [T("parallèle médiane "), L("ax+by+c=0")]));
  if (lieuEntier.a !== lieu.a || lieuEntier.b !== lieu.b) lignesB.push(ligne(implicite(lieuEntier), `on multiplie les deux membres par ${nombreTexte(lieuEntier.a !== 0 ? lieuEntier.a / lieu.a : lieuEntier.b / lieu.b)}`));
  const verif: LigneCalcul[] =
    e.b !== 0
      ? [
          ligne(`y_1=${q(-e.c1 / e.b)}`, [T("point de "), L("d_1"), T(" sur l'axe Oy ("), L("x=0"), T(")")]),
          ligne(`y_2=${q(-e.c2 / e.b)}`, [T("point de "), L("d_2"), T(" sur l'axe Oy")]),
          ligne(`\\dfrac{${q(-e.c1 / e.b)}+${qp(-e.c2 / e.b)}}{2}=${q(-lieu.c / e.b)}`, "le milieu est sur le lieu (même calcul pour x = 0)"),
        ]
      : [
          ligne(`x_1=${q(-e.c1 / e.a)}`, [T("point de "), L("d_1"), T(" sur l'axe Ox ("), L("y=0"), T(")")]),
          ligne(`x_2=${q(-e.c2 / e.a)}`, [T("point de "), L("d_2"), T(" sur l'axe Ox")]),
          ligne(`\\dfrac{${q(-e.c1 / e.a)}+${qp(-e.c2 / e.a)}}{2}=${q(-lieu.c / e.a)}`, "le milieu est sur le lieu"),
        ];
  return [
    utilise("a", [T("Les points équidistants de deux droites parallèles forment la droite parallèle à mi-chemin entre les deux "), T(COURS_LIEU), T(". Deux droites sont parallèles quand leurs vecteurs normaux sont colinéaires (critère de colinéarité).")]),
    calcul("a", [ligne(`${q(d1.a)}\\cdot ${qp(d2.b)}-${qp(d1.b)}\\cdot ${qp(d2.a)}=0`, [T("vecteurs normaux "), L(colonne(d1.a, d1.b)), T(" et "), L(colonne(d2.a, d2.b)), T(" colinéaires")])], [T("Avec "), L(`d_1\\equiv ${implicite(d1)}`), T(" et "), L(`d_2\\equiv ${implicite(d2)}`), T(" :")]),
    resultat("a", [T("Les droites sont parallèles ; le lieu est la droite parallèle à "), L("d_1"), T(" et à "), L("d_2"), T(", à mi-chemin entre elles.")]),
    piege("a", [T("Entre deux parallèles, un seul point de chaque perpendiculaire est à égale distance des deux : le lieu est une seule droite.")]),
    utilise("b", [T("Écrites avec les mêmes coefficients, "), L("ax+by+c_1=0"), T(" et "), L("ax+by+c_2=0"), T(" ont pour parallèle médiane "), L("ax+by+\\dfrac{c_1+c_2}{2}=0"), T(".")]),
    calcul("b", lignesB),
    avecFigure(e, resultat("b", [T("Le lieu a pour équation "), L(equationDroite(lieu)), T(".")])),
    verification("b", [T(e.b !== 0 ? "Sur l'axe Oy, le point du lieu est le milieu des points de d₁ et de d₂ :" : "Sur l'axe Ox, le point du lieu est le milieu des points de d₁ et de d₂ :")], verif),
    piege("b", e.k !== 1 ? [T("On ne fait la moyenne des termes constants qu'une fois les deux équations écrites avec les mêmes coefficients de x et de y : d₂ était multipliée par "), L(q(e.k)), T(".")] : [T("La moyenne des termes constants : leur somme divisée par 2, avec leurs signes.")]),
  ];
}

// --- parabole --------------------------------------------------------------------------------

function corrigeParabole(e: LieuParabole): EtapeCorrection[] {
  const { p, S } = parametresParabole(e);
  const vert = e.axe === "vertical";
  const H: Pt = vert ? { x: e.F.x, y: e.k } : { x: e.k, y: e.F.y };
  const P: Pt = vert ? { x: S.x + p, y: e.F.y } : { x: e.F.x, y: S.y + p };
  const zF = vert ? "y" : "x";
  const lignesB: LigneCalcul[] = vert
    ? [
        ligne(`x_S=x_F=${q(e.F.x)}`, "le sommet est sur la perpendiculaire à d menée par F (l'axe)"),
        ligne(`y_S=\\dfrac{y_F+y_H}{2}=\\dfrac{${q(e.F.y)}+${qp(H.y)}}{2}=${q(S.y)}`, [T("milieu de [FH], avec "), L(pointL("H", H))]),
        ligne(`p=2(y_F-y_S)=2(${q(e.F.y)}-${qp(S.y)})=${q(p)}`, "p signé (cours, § 9)"),
      ]
    : [
        ligne(`y_S=y_F=${q(e.F.y)}`, "le sommet est sur la perpendiculaire à d menée par F (l'axe)"),
        ligne(`x_S=\\dfrac{x_F+x_H}{2}=\\dfrac{${q(e.F.x)}+${qp(H.x)}}{2}=${q(S.x)}`, [T("milieu de [FH], avec "), L(pointL("H", H))]),
        ligne(`p=2(x_F-x_S)=2(${q(e.F.x)}-${qp(S.x)})=${q(p)}`, "p signé (cours, § 9)"),
      ];
  const sub = vert ? `(x-${qp(S.x)})^2=2\\cdot ${qp(p)}\\,(y-${qp(S.y)})` : `(y-${qp(S.y)})^2=2\\cdot ${qp(p)}\\,(x-${qp(S.x)})`;
  return [
    utilise("a", [T("Les points équidistants d'un point F et d'une droite d (F hors de d) forment la parabole de foyer F et de directrice d (cours, § 9).")]),
    calcul("a", [ligne(`${zF}_F=${q(vert ? e.F.y : e.F.x)}\\neq ${q(e.k)}`, [T("F n'est pas sur "), L(`d\\equiv ${directriceL(e)}`)])]),
    resultat("a", [T("Le lieu est la parabole de foyer "), L(pointL("F", e.F)), T(" et de directrice "), L(`d\\equiv ${directriceL(e)}`), T(vert ? " ; d est horizontale, l'axe est vertical." : " ; d est verticale, l'axe est horizontal.")]),
    piege("a", [T("Ce n'est pas un cercle : la distance à F n'est pas fixée, elle doit être égale à la distance à d.")]),
    utilise("b", [T("Le sommet S est le milieu de [FH], où H est le pied de la perpendiculaire à d menée par F ; "), L(vert ? "p=2(y_F-y_S)" : "p=2(x_F-x_S)"), T(", avec son signe (cours, § 9).")]),
    calcul("b", lignesB),
    resultat("b", [L(pointL("S", S)), T(" et "), L(`p=${q(p)}`), T(".")]),
    verification("b", [T("La directrice retrouvée est bien d :")], [ligne(`${zF}=${zF}_S-\\dfrac{p}{2}=${q(vert ? S.y : S.x)}-${qp(p / 2)}=${q(e.k)}`, "directrice du cours")]),
    piege("b", [T(p < 0 ? "Ici, p est négatif : le foyer est " + (vert ? "en dessous" : "à gauche") + " de la directrice, la parabole s'ouvre de ce côté." : "p est la distance du foyer à la directrice, pas celle du foyer au sommet (qui en vaut la moitié).")]),
    utilise("c", [T(vert ? "Parabole d'axe vertical : " : "Parabole d'axe horizontal : "), L(vert ? "(x-x_S)^2=2p(y-y_S)" : "(y-y_S)^2=2p(x-x_S)"), T(" (cours, § 9).")]),
    calcul("c", dedoublonner([ligne(sub, [T("on remplace "), L("x_S"), T(", "), L("y_S"), T(" et p")]), ligne(equationParabole(e), "on calcule")])),
    avecFigure(e, resultat("c", [T("Le lieu a pour équation "), L(equationParabole(e)), T(".")])),
    verification(
      "c",
      [T("Le point "), L(pointL("P", P)), T(" vérifie l'équation :")],
      vert
        ? [ligne(`(${q(P.x)}-${qp(S.x)})^2=${q(p * p)}`, "membre de gauche"), ligne(`${q(2 * p)}\\cdot(${q(P.y)}-${qp(S.y)})=${q(p * p)}`, [T("membre de droite : P est sur le lieu (PF = |p| = distance à d)")])]
        : [ligne(`(${q(P.y)}-${qp(S.y)})^2=${q(p * p)}`, "membre de gauche"), ligne(`${q(2 * p)}\\cdot(${q(P.x)}-${qp(S.x)})=${q(p * p)}`, [T("membre de droite : P est sur le lieu (PF = |p| = distance à d)")])],
    ),
    piege("c", [T("Le carré et la parenthèse portent sur le sommet S, pas sur le foyer F ; et le coefficient est 2p, pas p.")]),
  ];
}

// --- cercle ----------------------------------------------------------------------------------

function corrigeCercle(e: LieuCercle): EtapeCorrection[] {
  const r2 = e.r * e.r;
  const P: Pt = { x: e.C.x + e.r, y: e.C.y };
  return [
    utilise("a", [T("Les points à une distance r donnée d'un point C forment le cercle de centre C et de rayon r (cours, § 8).")]),
    calcul("a", [ligne(`MC=${e.r}`, "propriété qui définit le lieu")]),
    resultat("a", [T("Le lieu est le cercle de centre "), L(pointL("C", e.C)), T(` et de rayon ${e.r}.`)]),
    piege("a", [T("Le disque contient aussi les points intérieurs (à une distance plus petite que le rayon) : ce n'est pas le lieu.")]),
    utilise("b", [L(`MC=${e.r}`), T(" équivaut à "), L(`MC^2=${e.r}^2`), T(" ; par Pythagore, "), L("MC^2=(x-x_C)^2+(y-y_C)^2"), T(" (cours, § 8).")]),
    calcul("b", dedoublonner([ligne(`${carreDistance(e.C)}=${e.r}^2`, [T("centre "), L(coordL(e.C)), T(`, rayon ${e.r}`)]), ligne(cercleL(e.C, e.r), "on élève le rayon au carré")])),
    avecFigure(e, resultat("b", [T("Le lieu a pour équation "), L(cercleL(e.C, e.r)), T(".")])),
    verification("b", [T("Le point "), L(pointL("P", P)), T(", à la distance r de C sur l'horizontale, vérifie l'équation :")], lignesPointSurCercle(e.C, r2, P, "P")),
    piege("b", [T("Au second membre, c'est "), L("r^2"), T(", pas r ; et pour une abscisse négative du centre, le carré s'écrit avec « + » : "), L(e.C.x < 0 ? `(x+${q(-e.C.x)})^2` : `(x-${q(e.C.x)})^2`), T(".")]),
  ];
}

export function correctionDetailleeTraduireLieu(e: E): EtapeCorrection[] {
  switch (e.variante) {
    case "mediatrice":
      return corrigeMediatrice(e);
    case "distance-droite":
      return corrigeDistance(e);
    case "deux-paralleles":
      return corrigeParalleles(e);
    case "parabole":
      return corrigeParabole(e);
    case "cercle":
      return corrigeCercle(e);
  }
}
