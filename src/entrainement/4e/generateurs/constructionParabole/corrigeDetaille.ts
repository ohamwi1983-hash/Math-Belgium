import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, lettreEtape, piege, resultat, utilise } from "../../../export/corrigeTableau";
import type { ExerciceConstructionParabole } from "../../core/constructionParabole.types";
import { ecransConstructionParabole, type EcranConstructionParabole } from "../../moteur/modeleConstructionParabole";
import { COURS_PARABOLE, finaliserAnalytique2 } from "../../ui/corrigeAnalytique2";
import { svgConstructionParabole } from "../../ui/figureConstructionParabole";
import { bilanEcran, fr } from "../../ui/formatConstructionParabole";

/**
 * Corrigé détaillé « comme au tableau » de gen53 « Construction de la parabole au compas et à
 * l'équerre » — règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN
 * (`ecransConstructionParabole` : 8 écrans pour la méthode du cercle et de la parallèle, 7 pour celle
 * de la médiatrice) ; partagé par l'adaptateur papier et l'appli (`AppConstructionParabole.tsx`).
 * Aucune coordonnée : le bloc « Construction » écrit, geste par geste, la relation que chaque tracé
 * garantit (PF = r, distance de P à d = r, MK = MF…), la justification dit l'instrument et le geste.
 * Résultat = bilan de l'écran (`bilanEcran`, même texte que l'appli). Le tracé final (geste à main
 * levée, aucune relation à écrire) n'a pas de bloc « Construction » ; la figure complète de la
 * construction est sous son résultat.
 */

type E = ExerciceConstructionParabole;
type Fragments = FragmentConsigne[];

const ORDINAL: Record<2 | 3, string> = { 2: "deuxième", 3: "troisième" };

function etape(l: string, util: Fragments, lignes: LigneCalcul[], ecran: EcranConstructionParabole, piegeTexte: string): EtapeCorrection[] {
  return [utilise(l, util), calcul(l, lignes, [], "Construction"), resultat(l, bilanEcran(ecran)), piege(l, fr(piegeTexte))];
}

function etapesEcran(e: E, ecran: EcranConstructionParabole, l: string): EtapeCorrection[] {
  switch (ecran.type) {
    case "axe":
      return etape(
        l,
        fr(`L'axe de la parabole est la perpendiculaire à la directrice $d$ passant par le foyer $F$ ; il coupe $d$ en $K$ ${COURS_PARABOLE}.`),
        [
          ligne("\\text{angle}(\\text{axe}\\,;d)=90^\\circ", "équerre : un côté de l'angle droit posé sur d"),
          ligne("F\\in\\text{axe}", "on fait glisser l'équerre le long de d jusqu'à ce que l'autre côté passe par F"),
          ligne("\\text{axe}\\cap d=\\{K\\}", "K est le point de d le plus proche de F"),
        ],
        ecran,
        "L'axe passe par $F$ et il est perpendiculaire à $d$ : une droite qui joint $F$ à un point quelconque de $d$ n'est pas l'axe.",
      );
    case "sommet":
      return etape(
        l,
        fr(`Le sommet $S$ est le point de l'axe à égale distance de $F$ et de $d$, donc de $F$ et de $K$ : le milieu de $[KF]$, sur la médiatrice de $[KF]$ ${COURS_PARABOLE}.`),
        [
          ligne("MK=MF", "M, M′ : points communs des cercles de centres K et F, de même ouverture (plus grande que la moitié de KF)"),
          ligne("M'K=M'F"),
          ligne("(MM')\\cap\\text{axe}=\\{S\\}", "(MM′), tracée à la règle, est la médiatrice de [KF]"),
          ligne("SK=SF", "S est sur la médiatrice : c'est le milieu de [KF]"),
        ],
        ecran,
        "Les deux cercles doivent avoir la même ouverture : sinon la droite qui joint leurs points communs n'est pas la médiatrice de $[KF]$.",
      );
    case "report":
      return etape(
        l,
        fr(`Un point $P$ est sur la parabole si et seulement si $PF$ est égale à la distance de $P$ à $d$. On cherche des points à la distance $r$ de $F$ et de $d$ ; on marque d'abord, sur l'axe, le point $A$ à la distance $r$ de $d$ ${COURS_PARABOLE}.`),
        [
          ligne("r>KS", "ouverture choisie, plus grande que KS"),
          ligne("KA=r", "cercle de centre K (sur d) : il coupe l'axe en A, du côté de F"),
          ligne("\\text{dist}(A\\,;d)=KA", "l'axe est perpendiculaire à d en K"),
          ligne("=r"),
        ],
        ecran,
        "La pointe se pique en $K$, sur la directrice : on reporte d'abord la distance à $d$, pas la distance à $F$.",
      );
    case "parallele":
      return etape(
        l,
        fr(`Les points à la distance $r$ de $d$, du côté de $F$, forment la parallèle à $d$ passant par $A$ ; une parallèle à $d$ est perpendiculaire à l'axe ${COURS_PARABOLE}.`),
        [
          ligne("\\text{angle}(\\text{parallèle}\\,;\\text{axe})=90^\\circ", "équerre : un côté posé sur l'axe"),
          ligne("A\\in\\text{parallèle}", "on fait glisser l'équerre le long de l'axe jusqu'à A"),
          ligne("\\text{dist}(M\\,;d)=r", "pour tout point M de cette parallèle"),
        ],
        ecran,
        "La parallèle se trace du côté de $F$ : de l'autre côté de $d$, ses points sont bien à la distance $r$ de $d$, mais le cercle de centre $F$ ne l'atteint pas.",
      );
    case "cercleF":
      return etape(
        l,
        fr(`Les points à la distance $r$ de $F$ forment le cercle de centre $F$ et de rayon $r$ ; ceux qui sont aussi sur la parallèle vérifient $PF$ = distance de $P$ à $d$ ${COURS_PARABOLE}.`),
        [
          ligne("PF=P'F=r", "cercle de centre F, même ouverture r : il coupe la parallèle en P et P′"),
          ligne("\\text{dist}(P\\,;d)=r", "P et P′ sont sur la parallèle"),
          ligne("PF=\\text{dist}(P\\,;d)", "P et P′ vérifient la définition : ils sont sur la parabole"),
        ],
        ecran,
        "L'ouverture ne change pas entre l'arc de centre $K$ et le cercle de centre $F$ : c'est la même distance $r$ qui garantit $PF$ = distance de $P$ à $d$.",
      );
    case "coupleRapide": {
      const n = ecran.numero;
      const differente = n === 2 ? "r_2\\neq r" : "r_3\\neq r_2";
      return etape(
        l,
        fr(`Même construction qu'au premier couple, avec une ${ORDINAL[n]} ouverture $r_${n}$ plus grande que $KS$ : report depuis $d$, parallèle à l'équerre, cercle de centre $F$ ${COURS_PARABOLE}.`),
        [
          ligne(`${differente}`, `nouvelle ouverture, plus grande que KS${n === 3 ? " et différente des deux premières" : ""}`),
          ligne(`KA_${n}=r_${n}`, `cercle de centre K : A${n === 2 ? "₂" : "₃"} sur l'axe, du côté de F`),
          ligne(`\\text{dist}(M\\,;d)=r_${n}`, `pour tout point M de la parallèle à d par A${n === 2 ? "₂" : "₃"} (équerre)`),
          ligne(`PF=r_${n}`, "cercle de centre F, même ouverture : deux nouveaux points P et P′"),
          ligne(`PF=\\text{dist}(P\\,;d)`, "P et P′ sont sur la parabole"),
        ],
        ecran,
        "Une ouverture à peine plus grande que $KS$ donne deux points serrés près du sommet : choisis des ouvertures nettement différentes pour bien répartir les points.",
      );
    }
    case "perpendiculaireH":
      return etape(
        l,
        fr(`Si $P$ est sur la parabole et $H_1$ est son projeté orthogonal sur $d$, la distance de $P$ à $d$ est $PH_1$ : $P$ est sur la perpendiculaire à $d$ en $H_1$ ${COURS_PARABOLE}.`),
        [
          ligne("\\text{angle}(\\text{perpendiculaire}\\,;d)=90^\\circ", "équerre : un côté de l'angle droit posé sur d"),
          ligne("H_1\\in\\text{perpendiculaire}", "on fait glisser l'équerre jusqu'à ce que l'autre côté passe par H₁"),
          ligne("\\text{dist}(P\\,;d)=PH_1", "pour tout point P de cette perpendiculaire"),
        ],
        ecran,
        "La perpendiculaire passe par le point $H_1$ donné sur $d$, pas par $F$ : c'est sur elle que se trouve le point de la parabole qui se projette en $H_1$.",
      );
    case "mediatriceH":
      return etape(
        l,
        fr(`$P$ doit vérifier $PF = PH_1$ : il est sur la médiatrice de $[FH_1]$, comme le sommet était sur la médiatrice de $[KF]$ ${COURS_PARABOLE}.`),
        [
          ligne("MF=MH_1", "M, M′ : points communs des cercles de centres F et H₁, de même ouverture"),
          ligne("(MM')\\cap\\text{perpendiculaire}=\\{P_1\\}", "(MM′), tracée à la règle, est la médiatrice de [FH₁]"),
          ligne("P_1F=P_1H_1", "P₁ est sur la médiatrice de [FH₁]"),
          ligne("=\\text{dist}(P_1\\,;d)", "P₁ est sur la perpendiculaire à d en H₁ : il est sur la parabole"),
          ligne("P'_1F=P_1F", "son symétrique P′₁ par rapport à l'axe est aussi sur la parabole"),
        ],
        ecran,
        "Les deux arcs de la médiatrice se tracent avec la même ouverture, plus grande que la moitié de $FH_1$.",
      );
    case "pointRapide": {
      const i = ecran.indice + 1;
      const h = `H_${i}`;
      const hu = i === 2 ? "H₂" : "H₃";
      return etape(
        l,
        fr(`Même construction qu'avec $H_1$ : perpendiculaire à $d$ en $${h}$ à l'équerre, puis médiatrice de $[F${h}]$ au compas ${COURS_PARABOLE}.`),
        [
          ligne(`\\text{dist}(P_${i}\\,;d)=P_${i}${h}`, `P${i === 2 ? "₂" : "₃"} sur la perpendiculaire à d en ${hu}`),
          ligne(`P_${i}F=P_${i}${h}`, `P${i === 2 ? "₂" : "₃"} sur la médiatrice de [F${hu}] : il est sur la parabole`),
          ligne(`P'_${i}F=P_${i}F`, "son symétrique par rapport à l'axe aussi"),
        ],
        ecran,
        `Pour la médiatrice, l'ouverture dépasse la moitié de $F${h}$ et reste la même pour les deux cercles.`,
      );
    }
    case "trace":
      return [
        utilise(l, fr(`Une parabole est une courbe lisse, symétrique par rapport à son axe, qui passe par son sommet et s'ouvre du côté du foyer ${COURS_PARABOLE}.`)),
        { ...resultat(l, bilanEcran(ecran)), figureHtml: svgConstructionParabole(e, true) },
        piege(l, fr("On relie les points de proche en proche, d'une extrémité à l'autre en passant par $S$, par une courbe lisse : ni segments, ni pointe au sommet.")),
      ];
  }
}

export function correctionDetailleeConstructionParabole(e: E): EtapeCorrection[] {
  return finaliserAnalytique2(etapesConstructionParabole(e));
}

function etapesConstructionParabole(e: E): EtapeCorrection[] {
  return ecransConstructionParabole(e).flatMap((ecran, i) => etapesEcran(e, ecran, lettreEtape(i)));
}

/** Lettres des écrans répétitifs (couples / points suivants, mêmes gestes) et du tracé à main levée :
 * comptés comme des lectures dans le niveau (règle des écrans répétitifs, 5gen15). */
export function lettresRepetitivesConstruction(e: E): string[] {
  return ecransConstructionParabole(e)
    .map((ecran, i) => (ecran.type === "coupleRapide" || ecran.type === "pointRapide" || ecran.type === "trace" ? lettreEtape(i) : ""))
    .filter((l) => l !== "");
}
