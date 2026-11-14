/**
 * Couche ui — textes de `gen53` : consignes, aides (deux paliers, jamais la position exacte),
 * messages de diagnostic, titres et réponses attendues. Les noms de points et de segments passent
 * par KaTeX (`$…$` découpé en fragments par `fr`).
 */
import type { ExerciceConstructionParabole } from "../core/constructionParabole.types";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { DiagnosticConstruction, EcranConstructionParabole } from "../moteur/modeleConstructionParabole";
import { indiceHEcran } from "../moteur/modeleConstructionParabole";

/** « Texte avec $latex$ » → fragments. */
export function fr(source: string): FragmentConsigne[] {
  return source
    .split("$")
    .map((morceau, i): FragmentConsigne => (i % 2 === 1 ? { type: "latex", valeur: morceau } : { type: "texte", valeur: morceau }))
    .filter((f) => f.valeur !== "");
}

function nomH(ecran: EcranConstructionParabole): string {
  return `H_${indiceHEcran(ecran) + 1}`;
}

export function consigneGenerale(e: ExerciceConstructionParabole): FragmentConsigne[] {
  return e.methode === "cercle"
    ? fr("On donne le foyer $F$ et la directrice $d$ d'une parabole. Construis-la au compas et à l'équerre, par la méthode du cercle et de la parallèle.")
    : fr("On donne le foyer $F$, la directrice $d$ d'une parabole et trois points $H_1$, $H_2$, $H_3$ de $d$. Construis la parabole au compas et à l'équerre, par la méthode de la médiatrice.");
}

export function titreEcran(ecran: EcranConstructionParabole): string {
  switch (ecran.type) {
    case "axe":
      return "Axe de la parabole";
    case "sommet":
      return "Sommet";
    case "report":
      return "Premier couple — report de l'ouverture";
    case "parallele":
      return "Premier couple — parallèle à d";
    case "cercleF":
      return "Premier couple — cercle de centre F";
    case "coupleRapide":
      return ecran.numero === 2 ? "Deuxième couple de points" : "Troisième couple de points";
    case "perpendiculaireH":
      return "Point de H₁ — perpendiculaire";
    case "mediatriceH":
      return "Point de H₁ — médiatrice";
    case "pointRapide":
      return ecran.indice === 1 ? "Point de H₂" : "Point de H₃";
    case "trace":
      return "Tracé de la parabole";
  }
}

export function consigneEcran(ecran: EcranConstructionParabole): FragmentConsigne[] {
  switch (ecran.type) {
    case "axe":
      return fr("Trace l'axe de la parabole : la perpendiculaire à $d$ passant par $F$. Fais glisser l'équerre le long de $d$, puis trace.");
    case "sommet":
      return fr("Construis le sommet $S$, milieu de $[KF]$, au compas : trace deux cercles de même ouverture, l'un de centre $K$, l'autre de centre $F$.");
    case "report":
      return fr("Choisis une ouverture de compas $r$ et reporte-la sur l'axe à partir de la directrice : trace le cercle de rayon $r$ qui marque, sur l'axe, les points situés à la distance $r$ de $d$.");
    case "parallele":
      return fr("Trace à l'équerre la parallèle à $d$ dont tous les points sont à la distance $r$ de $d$, du côté de $F$.");
    case "cercleF":
      return fr("Trace le cercle dont tous les points sont à la distance $r$ de $F$ : ses intersections avec la parallèle sont deux points de la parabole.");
    case "coupleRapide":
      return fr("Construis un nouveau couple de points avec une autre ouverture $r$ : report depuis la directrice, parallèle à l'équerre, cercle de centre $F$.");
    case "perpendiculaireH":
      return fr("Le point de la parabole qui se projette en $H_1$ sur $d$ est sur la perpendiculaire à $d$ en $H_1$. Trace cette perpendiculaire à l'équerre.");
    case "mediatriceH":
      return fr("Ce point est à la même distance de $F$ et de $H_1$. Construis au compas la médiatrice de $[FH_1]$ : deux cercles de même ouverture, de centres $F$ et $H_1$.");
    case "pointRapide":
      return fr(`Construis le point de la parabole qui se projette en $${nomH(ecran)}$ sur $d$ : perpendiculaire à l'équerre, puis médiatrice au compas.`);
    case "trace":
      return fr("Relie les points construits d'une extrémité à l'autre : touche-les l'un après l'autre, dans l'ordre le long de la courbe, en passant par $S$.");
  }
}

export function aidesEcran(ecran: EcranConstructionParabole): FragmentConsigne[][] {
  switch (ecran.type) {
    case "axe":
      return [
        fr("L'axe de symétrie d'une parabole est la perpendiculaire à la directrice passant par le foyer."),
        fr("Un côté de l'angle droit de l'équerre reste posé sur $d$ ; arrête-la quand l'autre côté passe exactement par $F$. Le pied de cette perpendiculaire s'appelle $K$."),
      ];
    case "sommet":
      return [
        fr("Le sommet est le point de l'axe à égale distance de $F$ et de $d$ : c'est le milieu de $[KF]$, sur la médiatrice de $[KF]$."),
        fr("Ouvre le compas un peu plus que la moitié de $KF$. Sans changer l'ouverture, trace un cercle de centre $K$ puis un cercle de centre $F$ : la droite qui joint leurs deux points d'intersection coupe l'axe en $S$."),
      ];
    case "report":
      return [
        fr("Un point de la parabole est à la même distance $r$ de $F$ et de $d$. Commence par marquer, sur l'axe, les points à la distance $r$ de $d$ : la pointe du compas se pique sur la directrice."),
        fr("Pique le compas en $K$. L'ouverture doit dépasser $KS$ : sinon la parallèle passerait entre $d$ et $S$, et le cercle de centre $F$ ne la couperait pas."),
      ];
    case "parallele":
      return [
        fr("Les points à la distance $r$ de $d$, du côté de $F$, forment une droite parallèle à $d$. Une parallèle à $d$ est perpendiculaire à l'axe."),
        fr("Fais glisser l'équerre le long de l'axe jusqu'au point où le cercle de centre $K$ coupe l'axe du côté de $F$."),
      ];
    case "cercleF":
      return [
        fr("Les points à la distance $r$ de $F$ forment le cercle de centre $F$ et de rayon $r$."),
        fr("Ne touche pas à l'ouverture : pique simplement le compas en $F$ et trace."),
      ];
    case "coupleRapide":
      return [
        fr("Même construction qu'au premier couple : cercle de centre $K$, parallèle à $d$ à l'équerre par son intersection avec l'axe du côté de $F$, puis cercle de centre $F$ avec la même ouverture."),
        fr("Choisis une ouverture nettement différente des précédentes et plus grande que $KS$ ; une ouverture à peine plus grande que $KS$ donne des points proches du sommet."),
      ];
    case "perpendiculaireH":
      return [
        fr("Si $P$ est sur la parabole et $H_1$ est son projeté orthogonal sur $d$, la distance de $P$ à $d$ est $PH_1$ : $P$ est sur la perpendiculaire à $d$ en $H_1$."),
        fr("Un côté de l'angle droit reste posé sur $d$ ; arrête l'équerre quand l'autre côté passe exactement par $H_1$."),
      ];
    case "mediatriceH":
      return [
        fr("$P$ doit vérifier $PF = PH_1$ : il est sur la médiatrice de $[FH_1]$, comme le sommet était sur la médiatrice de $[KF]$."),
        fr("Ouvre le compas un peu plus que la moitié de $FH_1$. Sans changer l'ouverture, trace un cercle de centre $F$ et un cercle de centre $H_1$."),
      ];
    case "pointRapide": {
      const h = nomH(ecran);
      return [
        fr(`Même construction qu'avec $H_1$ : perpendiculaire à $d$ en $${h}$, puis médiatrice de $[F${h}]$.`),
        fr(`Pour la médiatrice, l'ouverture doit dépasser la moitié de $F${h}$ et rester la même pour les deux cercles, de centres $F$ et $${h}$.`),
      ];
    }
    case "trace":
      return [
        fr("Une parabole est une courbe lisse, symétrique par rapport à son axe, qui passe par son sommet."),
        fr("Commence par le point le plus éloigné d'un côté de l'axe, avance de voisin en voisin, passe par $S$ et termine par le plus éloigné de l'autre côté."),
      ];
  }
}

export function messageDiagnostic(diagnostic: DiagnosticConstruction, ecran: EcranConstructionParabole): FragmentConsigne[] {
  const h = ecran.type === "pointRapide" || ecran.type === "mediatriceH" || ecran.type === "perpendiculaireH" ? nomH(ecran) : "";
  const paire = ecran.type === "sommet" ? ["K", "F"] : ["F", h];
  switch (diagnostic) {
    case "equerre-absente":
      return fr("Trace d'abord la droite le long de l'équerre.");
    case "equerre-decalee":
      return fr("La droite tracée ne passe pas par $F$ : l'équerre doit glisser le long de $d$ jusqu'à ce que son autre côté passe exactement par $F$.");
    case "perpendiculaire-decalee":
      return fr(`La perpendiculaire tracée ne passe pas par $${h}$ : fais glisser l'équerre le long de $d$ jusqu'à $${h}$.`);
    case "compas-centres":
      return fr(`Il faut un cercle de centre $${paire[0]}$ et un cercle de centre $${paire[1]}$.`);
    case "compas-ouvertures-differentes":
      return fr("Les deux cercles doivent avoir la même ouverture : ne change pas l'écartement du compas entre les deux tracés.");
    case "compas-trop-petit":
      return fr(`Avec cette ouverture, les deux cercles ne se coupent pas franchement : ouvre le compas à plus de la moitié de $${paire[0]}${paire[1]}$.`);
    case "compas-trop-grand":
      return fr("Cette ouverture est trop grande : les points d'intersection sortent de la figure. Ferme un peu le compas.");
    case "report-centre-F":
      return fr("Tu as piqué le compas en $F$ : c'est la distance à la directrice que tu reportes d'abord, la pointe se pique en $K$, sur $d$.");
    case "report-centre-S":
      return fr("Tu as piqué le compas en $S$ : la distance se mesure depuis la directrice, la pointe se pique en $K$, sur $d$.");
    case "report-centre-autre":
      return fr("Le cercle qui reporte l'ouverture sur l'axe doit avoir pour centre $K$, le pied de l'axe sur $d$.");
    case "report-trop-petit":
      return fr("Ouverture trop petite : elle doit dépasser $KS$. Sinon la parallèle passe entre $d$ et $S$ et le cercle de centre $F$ ne la coupe pas.");
    case "report-deja-utilise":
      return fr("Cette ouverture est presque celle d'un couple déjà construit : choisis-en une nettement différente pour obtenir de nouveaux points.");
    case "parallele-mauvais-cote":
      return fr("Cette parallèle est du côté opposé à $F$ : ses points sont bien à la distance $r$ de $d$, mais le cercle de centre $F$ ne la couperait pas. Arrête l'équerre au point de l'autre côté.");
    case "parallele-decalee":
      return fr("La parallèle doit passer par le point où le cercle de centre $K$ coupe l'axe, du côté de $F$.");
    case "cercleF-absent":
      return fr("Il manque le cercle de centre $F$.");
    case "cercleF-ouverture":
      return fr("Le cercle de centre $F$ doit garder l'ouverture du cercle de centre $K$ : c'est la même distance $r$ qui sépare le point de $F$ et de $d$.");
    case "trace-incomplet":
      return fr("Touche tous les points avant de valider.");
    case "trace-ordre":
      return fr("Les points ne sont pas reliés de proche en proche : la courbe doit passer d'un point à son voisin, sans revenir en arrière.");
  }
}

/** Phrase de bilan affichée quand l'écran se clôt (bonne réponse ou réponse révélée). */
export function bilanEcran(ecran: EcranConstructionParabole): FragmentConsigne[] {
  switch (ecran.type) {
    case "axe":
      return fr("L'axe coupe $d$ en $K$. La parabole est symétrique par rapport à cet axe.");
    case "sommet":
      return fr("À la règle, la droite qui joint les deux points d'intersection des cercles est la médiatrice de $[KF]$ : elle coupe l'axe au sommet $S$, avec $SK = SF$.");
    case "report":
      return fr("Le cercle de centre $K$ coupe l'axe en deux points situés à la distance $r$ de $d$ ; seul celui du côté de $F$ servira.");
    case "parallele":
      return fr("Tous les points de cette parallèle sont à la distance $r$ de $d$.");
    case "cercleF":
    case "coupleRapide":
      return fr("Les deux points d'intersection sont à la fois à la distance $r$ de $F$ et à la distance $r$ de $d$ : $PF = PH$, ils sont sur la parabole.");
    case "perpendiculaireH":
      return fr("Tout point $P$ de cette perpendiculaire a $H_1$ pour projeté sur $d$ : sa distance à $d$ est $PH_1$.");
    case "mediatriceH":
    case "pointRapide": {
      const h = nomH(ecran);
      return fr(`La médiatrice (tracée à la règle par les deux points d'intersection des cercles) coupe la perpendiculaire en $P$, avec $PF = P${h}$ : $P$ est sur la parabole. Son symétrique par rapport à l'axe, $P'$, aussi.`);
    }
    case "trace":
      return fr("La parabole passe par tous les points construits, symétrique par rapport à son axe.");
  }
}
