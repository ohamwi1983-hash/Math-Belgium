import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceDetectiveVecteurs, IdDescriptionVecteurs, Point, TypeErreurVecteurs, ValeurLigne } from "../core/detectiveVecteurs.types";
import {
  SCENARIOS,
  colonne,
  copieEleve,
  descriptionCorrecte,
  expressionChasles,
  indiceLigneFausse,
  nb,
  par,
  pointLatex,
  relationLatex,
  resolutionCorrecte,
  support,
  typeErreur,
  valeursAttendues,
} from "../moteur/modeleDetectiveVecteurs";

/**
 * Textes de gen91 (écran ET papier : une seule source). Formules toujours en LaTeX, jamais au
 * clavier ; virgule décimale ; notation du chapitre 6 (`\vec{AB}`, composantes en colonne,
 * `A(x\,;\,y)`, `\|\vec{u}\|`).
 */

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export const TITRES_ECRANS = ["La ligne fausse", "L'erreur commise", "La correction"];

export const CONSIGNE_GENERALE = "Une ligne de cette résolution est fausse. Trouve-la, explique l'erreur et corrige la résolution.";

// ---------------------------------------------------------------------------------------------
// Énoncé et copie
// ---------------------------------------------------------------------------------------------

/**
 * Un point ou une virgule collé à une formule passe DANS la formule : sinon, à 390 px, le navigateur
 * peut couper la ligne entre la formule et sa ponctuation (« C(2 ; −3) » puis « . » seul à la ligne).
 */
export function souderPonctuation(fragments: FragmentConsigne[]): FragmentConsigne[] {
  const resultat: FragmentConsigne[] = [];
  for (const f of fragments) {
    const precedent = resultat[resultat.length - 1];
    const m = f.type === "texte" ? /^([.,])(.*)$/s.exec(f.valeur) : null;
    if (m && precedent?.type === "latex") {
      resultat[resultat.length - 1] = { type: "latex", valeur: `${precedent.valeur}${m[1] === "," ? "{,}" : "."}` };
      if (m[2]) resultat.push({ type: "texte", valeur: m[2] });
    } else {
      resultat.push(f);
    }
  }
  return resultat;
}

function listePoints(e: ExerciceDetectiveVecteurs, noms: ("A" | "B" | "C" | "D")[]): FragmentConsigne[] {
  const f: FragmentConsigne[] = [];
  noms.forEach((nom, i) => {
    if (i > 0) f.push(t(i === noms.length - 1 ? " et " : ", "));
    const P = e.donnees[nom] as Point;
    f.push(l(pointLatex(nom, P.x, P.y)));
  });
  return f;
}

/** « On donne … L'élève doit … » (ce que l'élève fictif devait faire). */
export function enonceExercice(e: ExerciceDetectiveVecteurs): FragmentConsigne[] {
  return souderPonctuation(enonceBrut(e));
}

function enonceBrut(e: ExerciceDetectiveVecteurs): FragmentConsigne[] {
  const debut = [t("On donne "), ...listePoints(e, support(e) === "chasles" ? ["A", "B", "C", "D"] : ["A", "B", "C"]), t(". ")];
  switch (support(e)) {
    case "relation":
      return [...debut, t("L'élève doit trouver le point M tel que "), l(`\\vec{AM} = ${relationLatex(e.donnees.k!)}`), t(".")];
    case "chasles":
      return [...debut, t("L'élève doit trouver le point M tel que "), l(`\\vec{DM} = ${expressionChasles(e.sousVariante)}`), t(", en réduisant d'abord l'expression par la relation de Chasles.")];
    case "isocele":
      return [...debut, t("L'élève doit déterminer si le triangle ABC est isocèle en A.")];
    case "alignement":
      return [...debut, t("L'élève doit déterminer si les points A, B et C sont alignés.")];
    case "rectangle":
      return [...debut, t("L'élève doit déterminer si le triangle ABC est rectangle en A.")];
    case "parallelogramme":
    case "milieu":
      return [...debut, t("L'élève doit trouver le point D tel que ABCD soit un parallélogramme.")];
  }
}

export function lignesCopie(e: ExerciceDetectiveVecteurs): FragmentConsigne[][] {
  return copieEleve(e).map((ligne) => souderPonctuation(ligne.fragments));
}

// ---------------------------------------------------------------------------------------------
// Valeurs
// ---------------------------------------------------------------------------------------------

/** Une valeur, telle qu'on l'écrit dans une réponse (« \vec{AB} = (…) », « M(2 ; 4) », verdict). */
export function valeurFragments(v: ValeurLigne): FragmentConsigne[] {
  switch (v.genre) {
    case "nombre":
      return v.quantite ? [l(`${v.quantite} = ${v.latex}`)] : [t("déterminant : "), l(v.latex)];
    case "vecteur":
      return [l(`${v.quantite} = ${colonne(nb(v.x), nb(v.y))}`)];
    case "point":
      return [l(pointLatex(v.nom, v.x, v.y))];
    case "verdict":
      return [t(v.vrai ? v.libelleVrai : v.libelleFaux)];
  }
}

/** Libellé de chaque valeur demandée à l'écran 3. */
export function libellesValeurs(e: ExerciceDetectiveVecteurs): FragmentConsigne[][] {
  const n = indiceLigneFausse(e) + 1;
  const valeurs = valeursAttendues(e);
  return valeurs.map((v, i) => {
    if (i === 0 && valeurs.length > 1) {
      return [t(v.genre === "nombre" && !v.quantite ? `Ligne ${n} corrigée (déterminant) :` : `Ligne ${n} corrigée :`)];
    }
    return [t("Conclusion corrigée :")];
  });
}

/** Message de l'écran 3 quand une valeur est fausse. */
export function messagesARevoir(e: ExerciceDetectiveVecteurs): string[] {
  const n = indiceLigneFausse(e) + 1;
  const valeurs = valeursAttendues(e);
  return valeurs.map((_, i) => (i === 0 && valeurs.length > 1 ? `La ligne ${n} corrigée est à revoir.` : "La conclusion est à revoir."));
}

/** La syntaxe des racines n'est rappelée que si une racine peut être attendue. */
export function aideSaisie(e: ExerciceDetectiveVecteurs): string {
  return support(e) === "isocele"
    ? "Écris une valeur exacte : un entier, ou une racine avec rac(…), par exemple rac(20) ou 2rac(5)."
    : "Écris des valeurs exactes : entier, décimal (3,5) ou fraction (7/2).";
}

// ---------------------------------------------------------------------------------------------
// Consignes des écrans
// ---------------------------------------------------------------------------------------------

export function consignesEcrans(e: ExerciceDetectiveVecteurs): FragmentConsigne[][] {
  const n = indiceLigneFausse(e) + 1;
  const correction =
    valeursAttendues(e).length > 1
      ? [t(`Corrige la copie : donne la bonne valeur de la ligne ${n}, puis la conclusion correcte.`)]
      : [t(`Corrige la copie : reprends la résolution à partir de la ligne ${n} et donne la conclusion correcte.`)];
  return [[t("Quelle ligne de la copie est fausse ?")], [t(`Quelle erreur l'élève a-t-il commise à la ligne ${n} ?`)], correction];
}

// ---------------------------------------------------------------------------------------------
// Descriptions d'erreur (écran 2)
// ---------------------------------------------------------------------------------------------

/** Vecteur dont la copie calcule les composantes sur la ligne fausse (origine, extrémité). */
function vecteurLigneFausse(e: ExerciceDetectiveVecteurs): [string, string] {
  if (e.scenario === "S2") return ["A", "C"];
  if (e.scenario === "C1") {
    if (e.sousVariante === "enchainement") return ["A", "C"];
    return ["B", "C"];
  }
  return ["A", "B"];
}

/** Composante négative élevée au carré sur la ligne fausse (défaut « carré »), ou `null`. */
function negatifCarre(e: ExerciceDetectiveVecteurs): number | null {
  if (e.sousVariante !== "carre") return null;
  const { A, B, C } = e.donnees;
  const Q = e.scenario === "N1" ? B : C;
  const x = Q.x - A.x;
  const y = Q.y - A.y;
  return x < 0 ? x : y < 0 ? y : null;
}

export function descriptionFragments(id: IdDescriptionVecteurs, e: ExerciceDetectiveVecteurs): FragmentConsigne[] {
  return souderPonctuation(descriptionBrute(id, e));
}

function descriptionBrute(id: IdDescriptionVecteurs, e: ExerciceDetectiveVecteurs): FragmentConsigne[] {
  switch (id) {
    case "sens": {
      const [X, Y] = vecteurLigneFausse(e);
      return [
        t("Les composantes de "),
        l(`\\vec{${X}${Y}}`),
        t(" sont calculées « origine moins extrémité » : il fallait "),
        l(`x_${Y} - x_${X}`),
        t(" et "),
        l(`y_${Y} - y_${X}`),
        t("."),
      ];
    }
    case "chaslesDifference":
      return [t("La différence est mal réduite : "), l("\\vec{AB} - \\vec{AC} = \\vec{AB} + \\vec{CA}"), t(", qui se réduit en "), l("\\vec{CB}"), t(", et non en "), l("\\vec{BC}"), t(".")];
    case "chaslesEnchainement":
      return [t("La relation de Chasles est appliquée à deux vecteurs qui ne se suivent pas : "), l("\\vec{BA}"), t(" se termine en A, alors que "), l("\\vec{CB}"), t(" commence en C. Il fallait d'abord les permuter.")];
    case "racine":
      return [t("La racine carrée est oubliée : la norme se calcule par "), l("\\|\\vec{u}\\| = \\sqrt{x_u^2 + y_u^2}"), t(".")];
    case "carre": {
      const n = descriptionCorrecte(e) === "carre" ? negatifCarre(e) : null;
      return n === null
        ? [t("Le carré d'un nombre négatif est compté comme négatif.")]
        : [t("Le carré d'un nombre négatif est compté comme négatif : "), l(`${par(n)}^2 = ${n * n}`), t(", et non "), l(`-${n * n}`), t(".")];
    }
    case "detSigne":
      return [t("Le déterminant est calculé avec un « + » au lieu d'un « − » : la condition de colinéarité est "), l("x_u \\cdot y_v - y_u \\cdot x_v = 0"), t(".")];
    case "rapports":
      return [
        t("Les rapports comparés ne se correspondent pas : il fallait comparer "),
        l("\\dfrac{x_{\\vec{AB}}}{x_{\\vec{AC}}}"),
        t(" à "),
        l("\\dfrac{y_{\\vec{AB}}}{y_{\\vec{AC}}}"),
        t(" (ou, plus sûr, calculer le déterminant)."),
      ];
    case "scalaireSigne":
      return [t("Le produit scalaire est calculé avec un « − » au lieu d'un « + » : la condition d'orthogonalité est "), l("x_u \\cdot x_v + y_u \\cdot y_v = 0"), t(".")];
    case "produitSigne":
      return [t("La règle des signes est mal appliquée : le produit de deux nombres négatifs est positif.")];
    case "parallelogrammeCD":
      return [t("Le parallélogramme est mal traduit : ses sommets se lisent dans l'ordre A, B, C, D, donc "), l("\\vec{AB} = \\vec{DC}"), t(", et non "), l("\\vec{AB} = \\vec{CD}"), t(".")];
    case "milieu":
      return [t("Le milieu est calculé avec une différence : ses coordonnées sont des moyennes, "), l("x_M = \\dfrac{x_A + x_C}{2}"), t(" et "), l("y_M = \\dfrac{y_A + y_C}{2}"), t(".")];
    case "milieuVecteur":
      return [t("Les composantes d'un vecteur se calculent comme un milieu : "), l("\\dfrac{x_A + x_B}{2}"), t(" et "), l("\\dfrac{y_A + y_B}{2}"), t(".")];
    case "chaslesSuivi":
      return [l("\\vec{AB}"), t(" et "), l("\\vec{AC}"), t(" ne se suivent pas : il fallait d'abord appliquer la relation de Chasles.")];
    case "translationSigne":
      return [t("Le point cherché est obtenu en soustrayant les composantes du vecteur au lieu de les ajouter.")];
    case "normeSomme":
      return [t("La norme d'un vecteur est la somme de ses composantes : "), l("\\|\\vec{u}\\| = x_u + y_u"), t(".")];
    case "pythagoreIsocele":
      return [t("Pour savoir si le triangle est isocèle, il fallait comparer "), l("AB^2 + AC^2"), t(" à "), l("BC^2"), t(".")];
    case "confondOrthogonalite":
      return [t("C'est le test d'orthogonalité qui est utilisé, au lieu de celui de la colinéarité.")];
    case "confondColinearite":
      return [t("C'est le test de colinéarité qui est utilisé, au lieu de celui de l'orthogonalité.")];
    case "conditionNorme":
      return [
        t(support(e) === "alignement" ? "Un déterminant nul ne suffit pas : il faut en plus que " : "Un produit scalaire nul ne suffit pas : il faut en plus que "),
        l("\\vec{AB}"),
        t(" et "),
        l("\\vec{AC}"),
        t(" aient la même norme."),
      ];
    case "parallelogrammeAD":
      return [t("Le parallélogramme est mal traduit : il fallait écrire "), l("\\vec{AD} = \\vec{CB}"), t(".")];
    case "milieuDiagonales":
      return [t("Les diagonales du parallélogramme ABCD sont [AB] et [CD], et non [AC] et [BD].")];
    case "milieuDouble":
      return [t("Pour un milieu, il fallait multiplier la somme des coordonnées par 2, et non la diviser par 2.")];
  }
}

const NOMS_COURTS: Partial<Record<IdDescriptionVecteurs, string>> = {
  sens: "composantes calculées « origine moins extrémité »",
  chaslesDifference: "différence mal réduite par Chasles",
  chaslesEnchainement: "Chasles appliqué à des vecteurs qui ne se suivent pas",
  racine: "racine carrée oubliée dans la norme",
  carre: "carré d'un négatif compté négatif",
  detSigne: "signe faux dans le déterminant",
  rapports: "rapports de composantes mal associés",
  scalaireSigne: "signe faux dans le produit scalaire",
  produitSigne: "règle des signes mal appliquée",
  parallelogrammeCD: "AB = CD au lieu de AB = DC",
  milieu: "milieu calculé par une différence",
};

export function nomErreur(e: ExerciceDetectiveVecteurs): string {
  return NOMS_COURTS[descriptionCorrecte(e)] ?? "";
}

// ---------------------------------------------------------------------------------------------
// Aides (jamais la réponse : il reste toujours au moins un calcul ou un choix)
// ---------------------------------------------------------------------------------------------

function aidesLigne(e: ExerciceDetectiveVecteurs): FragmentConsigne[][] {
  const i = indiceLigneFausse(e);
  const n = SCENARIOS[e.scenario].nombreLignes;
  const [p, q] = i % 2 === 0 ? (i + 1 < n ? [i, i + 1] : [i - 1, i]) : [i - 1, i];
  return [
    [t("Refais la résolution à partir des données, ligne par ligne, en comparant chaque formule à celle du cours : la première ligne qui ne redonne pas le même résultat est la ligne fausse.")],
    [t(`L'erreur se trouve à la ligne ${p + 1} ou à la ligne ${q + 1}.`)],
  ];
}

const AIDES_ERREUR: Record<TypeErreurVecteurs, FragmentConsigne[][]> = {
  sens: [
    [t("Les composantes d'un vecteur s'obtiennent « extrémité moins origine » :"), l("\\vec{AB} = \\begin{pmatrix} x_B - x_A \\\\ y_B - y_A \\end{pmatrix}")],
    [t("Vérifie, sur cette ligne, l'ordre des coordonnées dans chaque soustraction.")],
  ],
  chasles: [
    [t("La relation de Chasles relie deux vecteurs qui se suivent :"), l("\\vec{AB} + \\vec{BC} = \\vec{AC}")],
    [t("Avant d'enchaîner, remplace un vecteur soustrait par son opposé et vérifie que l'extrémité du premier vecteur est l'origine du second.")],
  ],
  norme: [
    [t("La norme d'un vecteur se calcule ainsi :"), l("\\|\\vec{u}\\| = \\sqrt{x_u^2 + y_u^2}")],
    [t("Vérifie la racine carrée, puis le signe de chaque carré : un carré n'est jamais négatif.")],
  ],
  colinearite: [
    [t("Deux vecteurs sont colinéaires si et seulement si :"), l("x_u \\cdot y_v - y_u \\cdot x_v = 0")],
    [t("Compare, terme par terme, ce calcul avec celui de la copie.")],
  ],
  orthogonalite: [
    [t("Deux vecteurs sont orthogonaux si et seulement si :"), l("x_u \\cdot x_v + y_u \\cdot y_v = 0")],
    [t("Vérifie le signe entre les deux produits, puis le signe de chaque produit.")],
  ],
  parallelogramme: [
    [t("Rappel du cours : ABCD est un parallélogramme si et seulement si :"), l("\\vec{AB} = \\vec{DC}")],
    [t("Autre caractérisation : les diagonales [AC] et [BD] ont le même milieu, dont les coordonnées sont des moyennes.")],
  ],
};

/** Ce qui suit la ligne corrigée (aide 2 de l'écran 3). */
function aideSuite(e: ExerciceDetectiveVecteurs): FragmentConsigne[] {
  switch (support(e)) {
    case "relation":
      return [t("Reprends ensuite les lignes suivantes avec cette valeur, jusqu'au point M :"), l("x_M = x_A + x_{\\vec{AM}}")];
    case "chasles": {
      const nom = e.sousVariante === "enchainement" ? "CA" : "CB";
      return [t("Reprends ensuite les lignes suivantes avec ce vecteur, jusqu'au point M :"), l(`x_M = x_D + x_{\\vec{${nom}}}`)];
    }
    case "isocele":
      return [t("Compare ensuite les deux longueurs : le triangle est isocèle en A si et seulement si :"), l("AB = AC")];
    case "alignement":
      return [t("Conclus ensuite : A, B et C sont alignés si et seulement si :"), l("x_{\\vec{AB}} \\cdot y_{\\vec{AC}} - y_{\\vec{AB}} \\cdot x_{\\vec{AC}} = 0")];
    case "rectangle":
      return [t("Conclus ensuite : ABC est rectangle en A si et seulement si :"), l("\\vec{AB} \\cdot \\vec{AC} = 0")];
    case "parallelogramme":
      return [t("Reprends ensuite les équations avec cette valeur :"), l("x_C - x_D = x_{\\vec{AB}}")];
    case "milieu":
      return [t("Reprends ensuite la dernière ligne avec ce milieu :"), l("x_D = 2x_M - x_B")];
  }
}

function aidesCorrection(e: ExerciceDetectiveVecteurs): FragmentConsigne[][] {
  const i = indiceLigneFausse(e);
  const juste = resolutionCorrecte(e)[i]!;
  const premiere: FragmentConsigne[] = juste.formule
    ? [t(`La ligne ${i + 1} corrigée se calcule ainsi :`), l(juste.formule)]
    : [t(`La ligne ${i + 1} corrigée s'écrit :`), ...juste.fragments.filter((f) => f.type === "latex")];
  return [premiere, aideSuite(e)];
}

export function aidesEcran(e: ExerciceDetectiveVecteurs, ecran: number): FragmentConsigne[][] {
  if (ecran === 0) return aidesLigne(e);
  if (ecran === 1) return AIDES_ERREUR[typeErreur(e)];
  return aidesCorrection(e);
}

// ---------------------------------------------------------------------------------------------
// Corrigé : comment repérer la ligne fausse, piège
// ---------------------------------------------------------------------------------------------

export function constat(e: ExerciceDetectiveVecteurs): FragmentConsigne[] {
  return souderPonctuation(constatBrut(e));
}

function constatBrut(e: ExerciceDetectiveVecteurs): FragmentConsigne[] {
  const n = indiceLigneFausse(e) + 1;
  switch (descriptionCorrecte(e)) {
    case "sens": {
      const [X, Y] = vecteurLigneFausse(e);
      return [t(`À la ligne ${n}, les composantes de `), l(`\\vec{${X}${Y}}`), t(" sont calculées avec "), l(`x_${X} - x_${Y}`), t(" au lieu de "), l(`x_${Y} - x_${X}`), t(" : toute la suite en hérite.")];
    }
    case "chaslesDifference":
      return [t(`À la ligne ${n}, la réduction `), l("\\vec{AB} - \\vec{AC} = \\vec{BC}"), t(" est fausse : un vecteur soustrait se remplace d'abord par son opposé.")];
    case "chaslesEnchainement":
      return [t(`À la ligne ${n}, la réduction `), l("\\vec{BA} + \\vec{CB} = \\vec{AC}"), t(" est fausse : la relation de Chasles ne s'applique qu'à des vecteurs qui se suivent.")];
    case "racine": {
      const nom = e.scenario === "N1" ? "AB" : "AC";
      return [t(`À la ligne ${n}, la longueur `), l(nom), t(" est la somme des carrés des composantes, sans racine carrée : ce n'est pas une norme.")];
    }
    case "carre": {
      const neg = negatifCarre(e) ?? -1;
      return [t(`À la ligne ${n}, un carré est négatif : `), l(`${par(neg)}^2`), t(" est remplacé par "), l(`-${neg * neg}`), t(".")];
    }
    case "detSigne":
      return [t(`À la ligne ${n}, le déterminant est calculé avec un « + » : ce n'est pas la condition de colinéarité du cours.`)];
    case "rapports":
      return [t(`À la ligne ${n}, les rapports comparés ne se correspondent pas : le premier divise les abscisses de `), l("\\vec{AB}"), t(" et "), l("\\vec{AC}"), t(", le second les ordonnées dans l'autre sens.")];
    case "scalaireSigne":
      return [t(`À la ligne ${n}, le produit scalaire est calculé avec un « − » : ce n'est pas la condition d'orthogonalité du cours.`)];
    case "produitSigne": {
      const { A, B, C } = e.donnees;
      const u = { x: B.x - A.x, y: B.y - A.y };
      const v = { x: C.x - A.x, y: C.y - A.y };
      const [a, b] = u.x < 0 && v.x < 0 ? [u.x, v.x] : [u.y, v.y];
      return [t(`À la ligne ${n}, le produit de deux nombres négatifs est compté négatif : `), l(`${par(a)} \\times ${par(b)} = ${a * b}`), t(", et non "), l(`-${a * b}`), t(".")];
    }
    case "parallelogrammeCD":
      return [t(`À la ligne ${n}, le parallélogramme ABCD est traduit par `), l("\\vec{AB} = \\vec{CD}"), t(" : avec cette égalité, c'est ABDC qui serait un parallélogramme.")];
    case "milieu":
      return [t(`À la ligne ${n}, les coordonnées du milieu sont des demi-différences, et non des moyennes.`)];
    default:
      return [t(`La ligne ${n} est fausse.`)];
  }
}

export function piege(e: ExerciceDetectiveVecteurs): FragmentConsigne[] {
  return souderPonctuation(piegeBrut(e));
}

function piegeBrut(e: ExerciceDetectiveVecteurs): FragmentConsigne[] {
  switch (typeErreur(e)) {
    case "sens":
      return [t("Composantes d'un vecteur : toujours « extrémité moins origine », "), l("x_B - x_A"), t(" pour "), l("\\vec{AB}"), t(".")];
    case "chasles":
      return [t("Avant d'appliquer Chasles, vérifie que l'extrémité du premier vecteur est l'origine du second ; une différence se transforme d'abord en somme avec l'opposé.")];
    case "norme":
      return [t("Une norme est la racine carrée d'une somme de carrés, et un carré n'est jamais négatif : "), l("(-3)^2 = 9"), t(".")];
    case "colinearite":
      return [t("Colinéarité : déterminant "), l("x_u \\cdot y_v - y_u \\cdot x_v"), t(" ; orthogonalité : produit scalaire "), l("x_u \\cdot x_v + y_u \\cdot y_v"), t(". Ne mélange pas les deux tests.")];
    case "orthogonalite":
      return [t("Produit scalaire : un « + » entre les deux produits, et la règle des signes dans chaque produit.")];
    case "parallelogramme":
      return [t("ABCD parallélogramme : "), l("\\vec{AB} = \\vec{DC}"), t(" (sommets lus dans l'ordre) ; les diagonales ont le même milieu, dont les coordonnées sont des moyennes.")];
  }
}
