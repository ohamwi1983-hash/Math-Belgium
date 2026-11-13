import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { Composantes, EcranConstruction, EcranConstruireSomme, ExerciceConstruireSomme, Point } from "../core/construireSomme.types";
import {
  VEC_AB,
  VEC_AC,
  VEC_U,
  VEC_V,
  coefficientsEffectifs,
  ecrans,
  memePoint,
  moins,
  plus,
  termeLatex,
  vecteurDemandeLatex,
} from "../moteur/modeleConstruireSomme";

/**
 * Textes de gen83 (écran ET papier : une seule source). Formules toujours en LaTeX, jamais au
 * clavier ; signe moins typographique (KaTeX) ; composantes en colonne comme dans le cours.
 */

export function nombreLatex(n: number): string {
  const v = Math.round(n * 1e9) / 1e9;
  return String(v === 0 ? 0 : v).replace(".", "{,}");
}

export function colonneLatex(c: Composantes): string {
  return `\\begin{pmatrix} ${nombreLatex(c.x)} \\\\ ${nombreLatex(c.y)} \\end{pmatrix}`;
}

/** « 3/2 » écrit en fraction LaTeX, « −2 », « 1 » (facteur numérique seul). */
export function coefficientLatex(k: number): string {
  if (Number.isInteger(k)) return nombreLatex(k);
  return `${k < 0 ? "-" : ""}\\frac{${Math.round(Math.abs(k) * 2)}}{2}`;
}

// ---------------------------------------------------------------------------------------------
// Énoncé (données) et consigne générale
// ---------------------------------------------------------------------------------------------

export function consigneGenerale(e: ExerciceConstruireSomme): FragmentConsigne[] {
  switch (e.variante) {
    case "somme":
    case "difference":
    case "combinaison":
      return [texte("Construis le vecteur "), latex(vecteurDemandeLatex(e)), texte(" à partir du point O, sur le quadrillage magnétique.")];
    case "point":
      return [texte("Place le point M tel que "), latex(relationLatex(e)), texte(".")];
    case "lecture":
      return [texte("Lis les composantes des deux vecteurs tracés (un carreau = une unité).")];
  }
}

/** Relation de la variante point (« \vec{AM} = 2\vec{AB} - \vec{AC} » ou « \vec{MA} = … »). */
export function relationLatex(e: ExerciceConstruireSomme): string {
  return `${e.methode === "MA" ? "\\vec{MA}" : "\\vec{AM}"} = ${vecteurDemandeLatex(e)}`;
}

/** Bloc de données (sous la consigne générale) : ce que montre la figure. */
export function donneesFragments(e: ExerciceConstruireSomme): FragmentConsigne[] {
  switch (e.methode) {
    case "triangle":
    case "oppose":
      return [texte("Sur la figure : "), latex(VEC_U), texte(" part du point O ; "), latex(VEC_V), texte(" est tracé ailleurs (un vecteur peut être déplacé librement).")];
    case "parallelogramme":
    case "origineCommune":
      return [texte("Sur la figure : "), latex(VEC_U), texte(" et "), latex(VEC_V), texte(" partent tous deux du point O.")];
    case "chaine":
      return [texte("Sur la figure : le point O et les vecteurs "), latex(VEC_U), texte(" et "), latex(VEC_V), texte(", tracés ailleurs (un vecteur peut être déplacé librement).")];
    case "AM":
    case "MA":
      return [texte("Sur la figure : les points A, B et C.")];
    case "lecture":
      return [texte("Sur la figure : les vecteurs "), latex(VEC_U), texte(" et "), latex(VEC_V), texte(".")];
  }
}

/** Énoncé papier (données + consigne globale, « trace … »). */
export function enonceGlobalPapier(e: ExerciceConstruireSomme): FragmentConsigne[] {
  switch (e.variante) {
    case "somme":
    case "difference":
    case "combinaison":
      return [texte("On donne le point O et les vecteurs "), latex(VEC_U), texte(" et "), latex(VEC_V), texte(" ci-dessous. Trace le vecteur "), latex(vecteurDemandeLatex(e)), texte(" à partir du point O.")];
    case "point":
      return [texte("On donne les points A, B et C ci-dessous. Place le point M tel que "), latex(relationLatex(e)), texte(".")];
    case "lecture":
      return [texte("Donne les composantes des vecteurs "), latex(VEC_U), texte(" et "), latex(VEC_V), texte(" tracés ci-dessous (un carreau = une unité).")];
  }
}

// ---------------------------------------------------------------------------------------------
// Écrans : titres et consignes
// ---------------------------------------------------------------------------------------------

/** Nom de l'origine d'une construction (« O », « l'extrémité de \vec{u} », « P »…). */
export function origineFragments(e: ExerciceConstruireSomme, ec: EcranConstruction, index: number): FragmentConsigne[] {
  if (memePoint(ec.origine, e.O)) return [texte(e.variante === "point" ? "A" : "O")];
  if (e.variante === "point") return [texte("P")];
  if (e.methode === "origineCommune" && index === 0) return [texte("l'extrémité de "), latex(VEC_V)];
  if (e.methode === "chaine") return [texte("l'extrémité de "), latex(termeLatex(e.k, VEC_U))];
  return [texte("l'extrémité de "), latex(VEC_U)];
}

export function titresEcrans(e: ExerciceConstruireSomme): string[] {
  return ecrans(e).map((ec, i) => {
    if (ec.type === "choix") return "Retourner la relation";
    if (ec.type === "lecture") return "Les composantes";
    switch (ec.role) {
      case "resultat":
        return "Le vecteur résultat";
      case "placerPoint":
        return "Le point M";
      case "differenceCommune":
        return "Le sens de u − v";
      default:
        if (e.variante === "point") return "Le point P";
        if (e.methode === "origineCommune") return "Reporter à partir de O";
        return i === 0 && e.methode === "chaine" ? "Le premier terme" : e.methode === "chaine" ? "Le second terme, bout à bout" : "Bout à bout";
    }
  });
}

export function consignesEcrans(e: ExerciceConstruireSomme): FragmentConsigne[][] {
  return ecrans(e).map((ec, i) => consigneEcran(e, ec, i));
}

function consigneEcran(e: ExerciceConstruireSomme, ec: EcranConstruireSomme, i: number): FragmentConsigne[] {
  if (ec.type === "choix") return [texte("Retourne d'abord la relation : quelle est l'écriture de "), latex("\\vec{AM}"), texte(" ?")];
  if (ec.type === "lecture") return [texte("Donne les composantes de "), latex(VEC_U), texte(" et de "), latex(VEC_V), texte(".")];
  const origine = origineFragments(e, ec, i);
  const vecteur = latex(ec.vecteurLatex);
  switch (ec.role) {
    case "differenceCommune":
      return [texte("Les deux vecteurs partent de O. Trace "), vecteur, texte(" en le faisant partir de l'extrémité de "), latex(VEC_V), texte(" : où doit arriver la flèche ?")];
    case "resultat":
      return [texte("Trace maintenant "), vecteur, texte(" à partir de O.")];
    case "placerPoint":
      return [texte("Place M : trace "), vecteur, texte(" à partir de P (Chasles : "), latex("\\vec{AM} = \\vec{AP} + \\vec{PM}"), texte(").")];
    case "oppose":
      if (e.methode === "oppose") return [texte("Soustraire "), latex(VEC_V), texte(", c'est ajouter son opposé : trace "), vecteur, texte(" à partir de l'extrémité de "), latex(VEC_U), texte(".")];
      break;
    case "reporter":
      if (e.methode === "triangle") return [texte("Méthode du triangle : reporte "), vecteur, texte(" à partir de l'extrémité de "), latex(VEC_U), texte(" (bout à bout).")];
      if (e.methode === "parallelogramme")
        return [texte("Méthode du parallélogramme : à partir de l'extrémité de "), latex(VEC_U), texte(", trace le côté parallèle à "), latex(VEC_V), texte(" (une copie de "), latex(VEC_V), texte(").")];
      if (e.methode === "origineCommune") return [texte("Reporte "), vecteur, texte(" à partir de O.")];
      break;
    default:
      break;
  }
  if (e.variante === "point") return [texte("Place le point P tel que "), latex(`\\vec{AP} = ${ec.vecteurLatex}`), texte(" : trace ce vecteur à partir de A.")];
  if (e.methode === "chaine" && i === 1) return [texte("Bout à bout : trace "), vecteur, texte(" à partir de "), ...origine, texte(".")];
  return [texte("Trace "), vecteur, texte(" à partir de "), ...origine, texte(".")];
}

export const INDICATION_GLISSER = "Fais glisser l'extrémité de la flèche orange : elle s'accroche aux nœuds du quadrillage.";

// ---------------------------------------------------------------------------------------------
// Aides (jamais la réponse : il reste toujours à placer le point)
// ---------------------------------------------------------------------------------------------

/** Vecteur « source » d'une construction (celui qu'on reporte ou multiplie) et son coefficient. */
export function sourceConstruction(e: ExerciceConstruireSomme, ec: EcranConstruction, index: number): { nom: string; composantes: Composantes; coefficient: number } | null {
  const eff = coefficientsEffectifs(e);
  const nomU = e.variante === "point" ? VEC_AB : VEC_U;
  const nomV = e.variante === "point" ? VEC_AC : VEC_V;
  if (ec.role === "resultat" || ec.role === "differenceCommune") return null;
  if (e.methode === "origineCommune") return { nom: `${VEC_U}-${VEC_V}`, composantes: moins(plus(e.O, e.u), plus(e.O, e.v)), coefficient: 1 };
  if (e.methode === "triangle" || e.methode === "parallelogramme") return { nom: nomV, composantes: e.v, coefficient: 1 };
  if (e.methode === "oppose") return { nom: nomV, composantes: e.v, coefficient: -1 };
  const premier = e.methode === "MA" ? index === 1 : index === 0;
  return premier ? { nom: nomU, composantes: e.u, coefficient: eff.k } : { nom: nomV, composantes: e.v, coefficient: eff.l };
}

function aidesOperation(source: { nom: string; composantes: Composantes; coefficient: number }, origine: FragmentConsigne[]): FragmentConsigne[][] {
  const { nom, coefficient: k } = source;
  if (k === 1) {
    return [
      [texte("Reporter un vecteur, c'est garder sa direction, son sens et sa longueur : seule l'origine change.")],
      [texte("Compte les carreaux de "), latex(nom), texte(" (horizontalement, puis verticalement) et refais exactement le même trajet à partir de "), ...origine, texte(".")],
    ];
  }
  if (k === -1) {
    return [
      [texte("L'opposé de "), latex(nom), texte(" a la même direction et la même longueur, mais le sens contraire.")],
      [texte("Compte les carreaux de "), latex(nom), texte(", puis refais le trajet à partir de "), ...origine, texte(" en inversant les deux sens (droite et gauche, haut et bas).")],
    ];
  }
  const sens = k < 0 ? "le coefficient est négatif, donc le sens est inversé" : "le coefficient est positif, donc le sens est conservé";
  return [
    [texte("Même direction que "), latex(nom), texte(` ; ${sens} ; la longueur est multipliée par `), latex(coefficientLatex(Math.abs(k))), texte(".")],
    [texte("Multiplie chaque déplacement de "), latex(nom), texte(" par le coefficient, puis pars de "), ...origine, texte(" : "), latex(`${coefficientLatex(k)} \\cdot ${colonneLatex(source.composantes)}`)],
  ];
}

export function aidesEcrans(e: ExerciceConstruireSomme): FragmentConsigne[][][] {
  return ecrans(e).map((ec, i) => {
    if (ec.type === "choix") return [[texte("Deux vecteurs opposés : on change le sens, donc le signe de chaque terme : "), latex("\\vec{MA} = -\\vec{AM}")]];
    if (ec.type === "lecture")
      return [
        [texte("Une composante se lit de l'origine vers l'extrémité : d'abord le déplacement horizontal (vers la droite : positif ; vers la gauche : négatif), puis le vertical (vers le haut : positif ; vers le bas : négatif).")],
        [texte("Les deux nombres s'écrivent en colonne, l'horizontal en haut : "), latex(`${VEC_U}\\begin{pmatrix} x \\\\ y \\end{pmatrix}`)],
      ];
    const origine = origineFragments(e, ec, i);
    if (ec.role === "differenceCommune")
      return [[texte("La flèche cherchée, ajoutée à "), latex(VEC_V), texte(", doit redonner "), latex(VEC_U), texte(" (bout à bout, à partir de O) : "), latex(`${VEC_V} + (${VEC_U}-${VEC_V}) = ${VEC_U}`)]];
    if (ec.role === "resultat") {
      if (e.methode === "parallelogramme") return [[texte("Méthode du parallélogramme : la somme est la diagonale du parallélogramme issue de O.")]];
      return [[texte("Méthode du triangle : le vecteur résultat relie directement O au point d'arrivée de la chaîne construite bout à bout.")]];
    }
    const source = sourceConstruction(e, ec, i)!;
    if (ec.role === "placerPoint") return [[texte("Relation de Chasles : on passe par le point P de l'étape précédente : "), latex("\\vec{AM} = \\vec{AP} + \\vec{PM}")], ...aidesOperation(source, origine).slice(0, 1)];
    return aidesOperation(source, origine);
  });
}

// ---------------------------------------------------------------------------------------------
// Diagnostic d'une construction fausse (message ciblé, sans donner le point)
// ---------------------------------------------------------------------------------------------

function colineaires(a: Composantes, b: Composantes): boolean {
  return a.x * b.y - a.y * b.x === 0;
}

export function diagnosticConstruction(e: ExerciceConstruireSomme, ec: EcranConstruction, index: number, extremite: Point): FragmentConsigne[] {
  const d = moins(extremite, ec.origine);
  const a = moins(ec.attendu, ec.origine);
  if (d.x === 0 && d.y === 0) return [texte("Ta flèche est réduite à un point : fais glisser son extrémité.")];
  if (d.x === -a.x && d.y === -a.y) {
    if (ec.role === "differenceCommune") return [texte("Le sens est inversé : "), latex(`${VEC_U}-${VEC_V}`), texte(" part de l'extrémité de "), latex(VEC_V), texte(" et va vers celle de l'autre vecteur.")];
    const source = sourceConstruction(e, ec, index);
    if (source && source.coefficient < 0) return [texte("Le sens est inversé : le coefficient de "), latex(source.nom), texte(" est négatif, la flèche va dans le sens contraire de "), latex(source.nom), texte(".")];
    return [texte("Le sens est inversé.")];
  }
  if (ec.role === "resultat" || (e.methode === "origineCommune" && index === 1)) {
    const etapes = ecrans(e).flatMap((x) => (x.type === "construction" ? [x.origine, x.attendu] : []));
    if (e.methode === "parallelogramme" && (memePoint(extremite, plus(e.O, e.u)) || memePoint(extremite, plus(e.O, e.v)))) {
      return [texte("Ce n'est qu'un côté du parallélogramme : la somme en est la diagonale issue de O.")];
    }
    if (etapes.some((p) => memePoint(p, extremite) && !memePoint(p, e.O))) return [texte("Ce point appartient à la construction, mais ce n'est pas l'extrémité du vecteur demandé : va jusqu'au bout de la chaîne.")];
  }
  if (colineaires(d, a)) {
    const memeSens = d.x * a.x + d.y * a.y > 0;
    return memeSens ? [texte("Bonne direction et bon sens, mais la longueur n'est pas la bonne.")] : [texte("Bonne direction, mais le sens et la longueur sont à revoir.")];
  }
  return [texte("Ce n'est pas la bonne extrémité : la direction n'est pas la bonne.")];
}

/** Réponse attendue d'une construction : le vecteur et son déplacement en composantes. */
export function attenduConstructionLatex(ec: EcranConstruction): string {
  return `${ec.vecteurLatex} = ${colonneLatex(moins(ec.attendu, ec.origine))}`;
}

/** Ce que l'élève a tracé (historique) : son déplacement en composantes. */
export function traceLatex(origine: Point, extremite: Point): string {
  return colonneLatex(moins(extremite, origine));
}
