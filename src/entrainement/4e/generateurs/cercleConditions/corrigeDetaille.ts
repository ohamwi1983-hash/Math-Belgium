import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceCercleConditions } from "../../core/cercleConditions.types";
import {
  COURS_CERCLE,
  COURS_INTERSECTION,
  COURS_LIEU,
  lignesDroiteNormale,
  lignesEquationCercle,
  lignesIntersection,
  lignesMilieu,
  lignesNorme,
  lignesPointSurCercle,
  lignesPointSurDroite,
  lignesSysteme,
  lignesVecteur,
} from "../../ui/corrigeLotG";
import { OMEGA, figure } from "../../ui/formatCercleConditions";
import { cercleLatex, droiteLatex, droiteNommee, milieu, pointLatex, racine, vecteur, type Droite, type Pt } from "../../ui/geometrieLotG";

/**
 * Corrigé détaillé « comme au tableau » de gen93 « Déterminer un cercle par des conditions » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`ui/formatCercleConditions.ts::ecrans`) ;
 * partagé par l'adaptateur papier et l'appli. Médiatrice : milieu, vecteur du segment (normal), équation
 * a(x − x_M) + b(y − y_M) = 0 développée ; centre par le système (substitution ou combinaison) ;
 * rayon = distance du centre à A ; équation (x − x₀)² + (y − y₀)² = r².
 */

type E = ExerciceCercleConditions;

function etapesMediatrice(l: string, p: Pt, q: Pt, np: string, nq: string, nom: string, cible: Droite): EtapeCorrection[] {
  const m = milieu(p, q);
  const seg = `[${np}${nq}]`;
  return [
    utilise(l, [texte(`La médiatrice de ${seg} passe par son milieu M et est perpendiculaire à ${seg} : `), latex(`\\vec{${np}${nq}}`), texte(` en est un vecteur normal ${COURS_LIEU}.`)]),
    calcul(l, [...lignesMilieu("M", p, q), ...lignesVecteur(`${np}${nq}`, p, q), ...lignesDroiteNormale(vecteur(p, q), m, [texte("vecteur normal "), latex(`\\vec{${np}${nq}}`), texte(", point M")])]),
    resultat(l, [latex(`${nom}\\equiv ${droiteLatex(cible)}`)]),
    verification(l, [texte(`Le milieu de ${seg} est sur la médiatrice : `)], lignesPointSurDroite(cible, m, "M")),
    piege(l, [texte("Le vecteur du segment est normal à la médiatrice, pas directeur ; et la médiatrice passe par le milieu, pas par une extrémité.")]),
  ];
}

function etapesCentre(l: string, d1: Droite, d2: Droite, n1: string, n2: string, centre: Pt, j1: string, j2: string): EtapeCorrection[] {
  return [
    utilise(l, [texte(`Le centre est sur les deux droites : on résout le système de leurs équations ${COURS_INTERSECTION}.`)]),
    calcul(l, [...lignesSysteme(d1, d2, j1, j2), ...lignesIntersection(d1, d2, centre, OMEGA)]),
    resultat(l, [latex(pointLatex(OMEGA, centre))]),
    verification(l, [texte(`Ω est bien sur ${n1} et sur ${n2} : `)], [...lignesPointSurDroite(d1, centre, "Ω"), ...lignesPointSurDroite(d2, centre, "Ω")]),
    piege(l, [texte("Après avoir trouvé la première coordonnée, remplace-la dans une équation pour obtenir la seconde, puis contrôle dans l'autre.")]),
  ];
}

function etapesRayon(l: string, e: E, diametre: boolean): EtapeCorrection[] {
  return [
    utilise(l, diametre ? [texte(`Le rayon est la moitié du diamètre AB, c'est-à-dire la distance du centre Ω à l'extrémité A ${COURS_CERCLE}.`)] : [texte(`Le rayon est la distance du centre à n'importe quel point du cercle : r = ΩA ${COURS_CERCLE}.`)]),
    calcul(l, [...lignesVecteur(`${OMEGA} A`, e.centre, e.a), ...lignesNorme(`r=${OMEGA} A`, vecteur(e.centre, e.a))]),
    resultat(l, [latex(`r=${racine(e.r2)}`)]),
    ...(e.variante === "diametre"
      ? []
      : [verification(l, [texte("Même distance au point B : ")], lignesNorme(`${OMEGA} B`, vecteur(e.centre, e.b), "le centre est équidistant de A et de B"))]),
    piege(l, diametre ? [texte("AB est le diamètre : le rayon en est la moitié.")] : [texte("Le rayon se calcule à partir du centre trouvé, pas d'un milieu de segment.")]),
  ];
}

function etapesEquation(l: string, e: E): EtapeCorrection[] {
  const autres: Pt[] = e.variante === "trois-points" ? [e.b, e.c!] : [e.b];
  return [
    utilise(l, [texte("Cercle de centre "), latex("(x_0\\,;y_0)"), texte(" et de rayon r : "), latex("(x-x_0)^2+(y-y_0)^2=r^2"), texte(` ${COURS_CERCLE}.`)]),
    calcul(l, lignesEquationCercle(e.centre, e.r2)),
    { ...resultat(l, [latex(cercleLatex(e.centre, e.r2))]), figureHtml: figure(e) },
    verification(l, [texte("Les points donnés vérifient l'équation : ")], [...lignesPointSurCercle(e.centre, e.r2, e.a, "A"), ...autres.flatMap((p, i) => lignesPointSurCercle(e.centre, e.r2, p, i === 0 ? "B" : "C"))]),
    piege(l, [texte("Au second membre, c'est "), latex("r^2"), texte(" ; et les signes du centre changent dans les parenthèses.")]),
  ];
}

export function correctionDetailleeCercleConditions(e: E): EtapeCorrection[] {
  if (e.variante === "diametre") {
    return [
      utilise("a", [texte(`Le centre d'un cercle de diamètre [AB] est le milieu de [AB] ${COURS_CERCLE}.`)]),
      calcul("a", lignesMilieu(OMEGA, e.a, e.b)),
      resultat("a", [latex(pointLatex(OMEGA, e.centre))]),
      piege("a", [texte("Le milieu est la moyenne des coordonnées : on additionne et on divise par 2.")]),
      ...etapesRayon("b", e, true),
      ...etapesEquation("c", e),
    ];
  }
  if (e.variante === "trois-points") {
    const { m1, m2 } = e.droites as { m1: Droite; m2: Droite };
    return [
      ...etapesMediatrice("a", e.a, e.b, "A", "B", "m_1", m1),
      ...etapesMediatrice("b", e.b, e.c!, "B", "C", "m_2", m2),
      ...etapesCentre("c", m1, m2, "m₁", "m₂", e.centre, "médiatrice de [AB]", "médiatrice de [BC]"),
      ...etapesRayon("d", e, false),
      ...etapesEquation("e", e),
    ];
  }
  const m1 = e.droites.m1!;
  return [
    ...etapesMediatrice("a", e.a, e.b, "A", "B", "m_1", m1),
    ...etapesCentre("b", m1, e.d!, "m₁", "d", e.centre, "médiatrice de [AB]", "la droite d"),
    ...etapesRayon("c", e, false),
    ...etapesEquation("d", e),
  ];
}

export { droiteNommee };
