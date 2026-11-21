import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceCercleTangent, ExerciceDroiteCercle, ExercicePositionRelative, ExerciceTangentePoint } from "../../core/droiteCercle.types";
import { q } from "../../ui/corrigeChapitre3";
import { COURS_CERCLE, COURS_DISTANCE, lignesCentreRayon, lignesDistance, lignesDroiteNormale, lignesPied, lignesPointSurDroite, lignesVecteur } from "../../ui/corrigeLotG";
import { LIBELLES_POSITION, figure } from "../../ui/formatDroiteCercle";
import { carreLatex, cercleLatex, coordonnees, droiteLatex, nb, pointLatex, racine, vecteurLatex } from "../../ui/geometrieLotG";

function carre(t: number): string {
  return t < 0 ? `(${q(t)})^2` : `${q(t)}^2`;
}

/**
 * Corrigé détaillé « comme au tableau » de gen92 « Tangente et position relative d'une droite et d'un
 * cercle » — règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN
 * (`ui/formatDroiteCercle.ts::ecrans`) ; partagé par l'adaptateur papier et l'appli. Méthode du cours :
 * tangente ⟂ rayon (vecteur normal CP, § 8) ; distance par la perpendiculaire, son pied et une norme
 * (§ 6, jamais de formule toute faite) ; comparaison CH / r par les carrés.
 */

type E = ExerciceDroiteCercle;

function etapesTangente(e: ExerciceTangentePoint): EtapeCorrection[] {
  const { centre, p, cp, tangente, r2 } = e;
  return [
    utilise("a", [texte("Le cercle "), latex("(x-x_0)^2+(y-y_0)^2=r^2"), texte(" a pour centre "), latex("(x_0\\,;y_0)"), texte(` ; composantes d'un vecteur : arrivée moins départ ${COURS_CERCLE}.`)]),
    calcul("a", [ligne(`C=${coordonnees(centre)}`, "centre lu dans l'équation : les signes changent"), ...lignesVecteur("CP", centre, p)]),
    resultat("a", [latex(vecteurLatex("CP", cp))]),
    verification("a", [texte("P est bien sur le cercle : ")], [ligne(`CP^2=${carre(cp.x)}+${carre(cp.y)}=${q(r2)}`, "c'est bien r²")]),
    piege("a", [texte("Ne pas inverser : "), latex("\\vec{CP}=P-C"), texte(" va du centre vers le point de contact ; "), latex("\\vec{PC}"), texte(" conviendrait aussi comme vecteur normal, mais ce n'est pas ce qui est demandé.")]),
    utilise("b", [texte(`La tangente à un cercle en un point P est perpendiculaire au rayon [CP] ${COURS_CERCLE}.`)]),
    calcul("b", [ligne("\\vec{CP}\\cdot\\vec{PM}=0", "pour tout point M de la tangente : CP est perpendiculaire à la tangente")]),
    resultat("b", [latex("\\vec{CP}"), texte(" est un vecteur normal de la tangente t.")]),
    piege("b", [texte("Pris comme vecteur directeur, "), latex("\\vec{CP}"), texte(" donnerait la droite (CP) elle-même, qui traverse le cercle.")]),
    utilise("c", [texte("Droite de vecteur normal "), latex("\\begin{pmatrix}a\\\\b\\end{pmatrix}"), texte(" passant par "), latex("P(x_P\\,;y_P)"), texte(" : "), latex("a(x-x_P)+b(y-y_P)=0"), texte(` ${COURS_CERCLE}.`)]),
    calcul("c", lignesDroiteNormale(cp, p, [texte("vecteur normal "), latex("\\vec{CP}"), texte(", point P")])),
    { ...resultat("c", [latex(`t\\equiv ${droiteLatex(tangente)}`)]), figureHtml: figure(e) },
    verification("c", [texte("Le point de contact est sur la tangente : ")], lignesPointSurDroite(tangente, p, "P")),
    piege("c", [texte("La tangente passe par P, pas par le centre C.")]),
  ];
}

function etapesCentreRayon(centre: { x: number; y: number }, r2: number): EtapeCorrection[] {
  return [
    utilise("a", [texte("Compléter les carrés : "), latex("x^2-2ax=(x-a)^2-a^2"), texte(" ; on obtient "), latex("(x-x_0)^2+(y-y_0)^2=r^2"), texte(", de centre "), latex("(x_0\\,;y_0)"), texte(` et de rayon r ${COURS_CERCLE}.`)]),
    calcul("a", lignesCentreRayon(centre, r2)),
    resultat("a", [texte("Centre "), latex(pointLatex("C", centre)), texte(", rayon "), latex(`r=${racine(r2)}`), texte(".")]),
    piege("a", [texte("Le centre a pour coordonnées les moitiés des opposés des coefficients de x et de y ; le second membre est "), latex("r^2"), texte(", pas r.")]),
  ];
}

function etapesPied(e: ExercicePositionRelative | ExerciceCercleTangent, l: string): EtapeCorrection[] {
  const { d, centre, h } = e;
  const axiale = d.a === 0 || d.b === 0;
  return [
    utilise(
      l,
      axiale
        ? [texte(`Raccourci du cours : la perpendiculaire à une droite verticale est horizontale (et inversement) ${COURS_DISTANCE}.`)]
        : [texte("La perpendiculaire à "), latex("d\\equiv ax+by+c=0"), texte(" a pour vecteur directeur le vecteur normal "), latex("\\begin{pmatrix}a\\\\b\\end{pmatrix}"), texte(` de d ; le pied H est son intersection avec d ${COURS_DISTANCE}.`)],
    ),
    calcul(l, lignesPied(d, centre, h)),
    resultat(l, [latex(pointLatex("H", h))]),
    verification(l, [texte("H est sur d : ")], lignesPointSurDroite(d, h, "H")),
    piege(l, [texte("La perpendiculaire a pour vecteur directeur le vecteur normal de d ; prise avec un vecteur directeur de d, elle serait parallèle à d et ne la couperait jamais.")]),
  ];
}

function etapesPosition(e: ExercicePositionRelative): EtapeCorrection[] {
  const { centre, h, d, dist2, r2, position } = e;
  const signe = dist2 > r2 ? ">" : dist2 < r2 ? "<" : "=";
  return [
    ...etapesCentreRayon(centre, r2),
    ...etapesPied(e, "b"),
    utilise("c", [texte(`La distance du centre à la droite est la longueur CH, norme du vecteur CH ${COURS_DISTANCE}.`)]),
    calcul("c", lignesDistance(d, centre, h)),
    resultat("c", [latex(`CH=${racine(dist2)}`)]),
    piege("c", [texte("Ne pas s'arrêter à "), latex(`CH^2=${q(dist2)}`), texte(" : la distance est sa racine carrée.")]),
    utilise("d", [texte("Position relative d'une droite et d'un cercle : "), latex("CH>r"), texte(" extérieure (aucun point commun), "), latex("CH=r"), texte(" tangente (un point), "), latex("CH<r"), texte(` sécante (deux points) ${COURS_CERCLE}.`)]),
    calcul("d", [
      ligne(`CH^2=${q(dist2)}`, "deux longueurs positives se rangent comme leurs carrés"),
      ligne(`r^2=${q(r2)}`),
      ligne(`CH^2${signe}r^2`, `donc CH ${signe === ">" ? ">" : signe === "<" ? "<" : "="} r`),
    ]),
    { ...resultat("d", [texte(`${LIBELLES_POSITION[position].replace(/^d/, "La droite d")}.`)]), figureHtml: figure(e) },
    piege("d", [texte("Comparer "), latex("CH^2"), texte(" à r (et non à "), latex("r^2"), texte(") mélange deux grandeurs de nature différente.")]),
  ];
}

function etapesCercleTangent(e: ExerciceCercleTangent): EtapeCorrection[] {
  const { centre, h, d, r2 } = e;
  return [
    ...etapesPied(e, "a"),
    utilise("b", [texte(`Un cercle de centre C tangent à d la touche au pied H de la perpendiculaire : son rayon est r = CH ${COURS_DISTANCE}.`)]),
    calcul("b", lignesDistance(d, centre, h).map((l, i) => (i === 0 ? { ...l, latex: l.latex.replace(/^CH/, "r=CH") } : l))),
    resultat("b", [latex(`r=${racine(r2)}`)]),
    piege("b", [texte("Le rayon n'est pas la distance de C à n'importe quel point de d : seulement au pied H de la perpendiculaire (la plus courte).")]),
    utilise("c", [texte("Cercle de centre "), latex("(x_0\\,;y_0)"), texte(" et de rayon r : "), latex("(x-x_0)^2+(y-y_0)^2=r^2"), texte(` ${COURS_CERCLE}.`)]),
    calcul("c", [
      ligne(`${carreLatex(centre.x, "x")}+${carreLatex(centre.y, "y")}=${Number.isInteger(Math.sqrt(r2)) ? `${q(Math.sqrt(r2))}^2` : `\\left(${racine(r2)}\\right)^2`}`, `centre (${nb(centre.x)} ; ${nb(centre.y)}), rayon r`),
      ligne(`${carreLatex(centre.x, "x")}+${carreLatex(centre.y, "y")}=${q(r2)}`, "on élève le rayon au carré"),
    ]),
    { ...resultat("c", [latex(cercleLatex(centre, r2))]), figureHtml: figure(e) },
    verification("c", [texte("H est sur le cercle : ")], [ligne(`${sub(h.x, centre.x)}+${sub(h.y, centre.y)}=${q(r2)}`, "H vérifie l'équation")]),
    piege("c", [texte("Au second membre, c'est "), latex("r^2"), texte(" et pas r.")]),
  ];
}

function sub(v: number, c: number): string {
  if (c === 0) return carre(v);
  return `(${q(v)}${c < 0 ? `+${q(-c)}` : `-${q(c)}`})^2`;
}

export function correctionDetailleeDroiteCercle(e: E): EtapeCorrection[] {
  if (e.variante === "tangente-point") return etapesTangente(e);
  if (e.variante === "position-relative") return etapesPosition(e);
  return etapesCercleTangent(e);
}
