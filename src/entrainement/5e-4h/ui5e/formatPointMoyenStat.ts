import { CONTEXTES_PETITS } from "../core5e/contextesStat2vLotH1";
import type { ExercicePointMoyen, Manquant } from "../core5e/pointMoyenStat";
import { decimales, net, somme } from "../core5e/stat2vLotH1";
import type { AideEcran, ChampEcran, Frag, TableauDonnees } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { coordL, droiteL, nL, nT, pointL, tableauCellulesL, tableauEcranCellules } from "./ecrituresStat2vLotH1";
import { COULEUR_G12, figureNuage } from "./figureNuageLotH1";

/**
 * Couche C — textes et figures de `5gen77` « Point moyen et valeurs manquantes » : consignes, champs,
 * aides à deux niveaux, réponses, tableau (écran et papier, « ? » pour une valeur effacée), figures.
 * Source unique de l'écran, du papier et du corrigé.
 */

type E = ExercicePointMoyen;
export type PhasePointMoyen = "g" | "somme" | "valeur" | "xManquant" | "yManquant" | "pente" | "equation" | "prevY" | "prevX";

export function phases(e: E): PhasePointMoyen[] {
  if (e.variante === "pointMoyen") return ["g"];
  if (e.variante === "uneValeur") return ["somme", "valeur"];
  if (e.variante === "deuxValeurs") return ["xManquant", "yManquant"];
  return ["pente", "equation", "prevY", "prevX"];
}

export const contexte = (e: E) => CONTEXTES_PETITS.find((c) => c.id === e.contexteId) ?? CONTEXTES_PETITS[CONTEXTES_PETITS.length - 1]!;
export const n = (e: E): number => e.points.length;

// ============================================================================
// Valeurs attendues (une seule source).
// ============================================================================

export const valeurManquante = (e: E, m: Manquant): number => e.points[m.i]![m.coord];
/** n·x̄ (ou n·ȳ) : somme de TOUTES les valeurs de la ligne. */
export const sommeTotale = (e: E, c: "x" | "y"): number => net(n(e) * e.G[c]);
/** Somme des valeurs connues de la ligne. */
export const sommeConnue = (e: E, c: "x" | "y"): number => net(somme(e.points.filter((_, i) => !e.manquants.some((m) => m.i === i && m.coord === c)).map((p) => p[c])));
export const manquantDe = (e: E, c: "x" | "y"): Manquant | undefined => e.manquants.find((m) => m.coord === c);
export const prevY = (e: E): number => net(e.a! * e.x0! + e.b!);
export const prevX = (e: E): number => (e.y0! - e.b!) / e.a!;
/** Précision demandée : valeurs exactes (au plus trois décimales) ; x de la prévision inverse au centième. */
export const PRECISION_PREV_X = 2;

// ============================================================================
// Tableau et figures.
// ============================================================================

const estManquant = (e: E, i: number, c: "x" | "y") => e.manquants.some((m) => m.i === i && m.coord === c);

export function tableau(e: E): TableauDonnees | null {
  if (e.variante === "mayerG1G2") return null;
  return tableauEcranCellules(
    e.points.map((p, i) => [estManquant(e, i, "x") ? "?" : nT(p.x, e.dx), estManquant(e, i, "y") ? "?" : nT(p.y, e.dy)]),
    contexte(e).ent,
  );
}

export function tableauPapier(e: E): string {
  return tableauCellulesL(
    e.points.map((p, i) => [estManquant(e, i, "x") ? "?" : nL(p.x, e.dx), estManquant(e, i, "y") ? "?" : nL(p.y, e.dy)]),
    contexte(e).ent,
  );
}

/** Nuage complet avec G (corrigé). */
export function figureNuageG(e: E): string {
  const c = contexte(e);
  return figureNuage({ points: e.points, remarquables: [{ P: e.G, nom: "G" }], titreX: c.id === "generique" ? undefined : c.titreX, titreY: c.id === "generique" ? undefined : c.titreY });
}

/** G₁, G₂ et, si `avecDroite`, la droite de Mayer (écran après l'équation, corrigé). */
export function figureMayer(e: E, avecDroite: boolean, avecPrevisions = false): string {
  const pts = avecPrevisions ? [{ x: e.x0!, y: prevY(e) }, { x: prevX(e), y: e.y0! }] : [];
  return figureNuage({
    points: pts,
    remarquables: [
      { P: e.G1!, nom: "G1", couleur: COULEUR_G12 },
      { P: e.G2!, nom: "G2", couleur: COULEUR_G12 },
    ],
    droites: avecDroite ? [{ a: e.a!, b: e.b! }] : [],
  });
}

export function figureEcran(e: E, p: PhasePointMoyen): string | null {
  if (e.variante === "mayerG1G2") return figureMayer(e, p === "prevY" || p === "prevX");
  if (e.variante === "pointMoyen") return figureNuage({ points: e.points, titreX: contexte(e).id === "generique" ? undefined : contexte(e).titreX, titreY: contexte(e).id === "generique" ? undefined : contexte(e).titreY });
  return null;
}

// ============================================================================
// Écrans.
// ============================================================================

const xi = (m: Manquant) => `${m.coord}_{${m.i + 1}}`;
const barre = (c: "x" | "y") => `\\bar{${c}}`;

export function libelle(e: E, p: PhasePointMoyen): string {
  if (p === "g") return "Point moyen G";
  if (p === "somme") return `Somme des ${e.manquants[0]!.coord}ᵢ`;
  if (p === "valeur") return "Valeur manquante";
  if (p === "xManquant") return "Abscisse manquante";
  if (p === "yManquant") return "Ordonnée manquante";
  if (p === "pente") return "Pente de G₁G₂";
  if (p === "equation") return "Droite de Mayer";
  if (p === "prevY") return "Ordonnée pour x donné";
  return "Abscisse pour y donné";
}

export function consigneGenerale(e: E): Frag[] {
  if (e.variante === "pointMoyen") return [tx(contexte(e).phrase)];
  if (e.variante === "mayerG1G2")
    return [tx("On donne les deux points moyens "), lx(pointL("G_1", e.G1!)), tx(" et "), lx(pointL("G_2", e.G2!)), tx(" d'un nuage de points : la droite de Mayer est la droite "), lx("G_1G_2"), tx(".")];
  return [tx(`Dans la série statistique suivante, ${e.manquants.length === 1 ? "une valeur a été effacée" : "deux valeurs ont été effacées"}. Le point moyen du nuage est `), lx(pointL("G", e.G)), tx(".")];
}

export function consigne(e: E, p: PhasePointMoyen): Frag[] {
  if (p === "g") return [tx("Calcule les coordonnées du point moyen G de cette série (valeurs exactes).")];
  if (p === "somme") {
    const c = e.manquants[0]!.coord;
    return [tx(`Combien vaut la somme de toutes les valeurs de ${c} (la valeur effacée comprise) ?`)];
  }
  if (p === "valeur") return [tx("Déduis-en la valeur effacée "), lx(xi(e.manquants[0]!)), tx(".")];
  if (p === "xManquant") return [tx("Retrouve l'abscisse effacée "), lx(xi(manquantDe(e, "x")!)), tx(".")];
  if (p === "yManquant") return [tx("Retrouve l'ordonnée effacée "), lx(xi(manquantDe(e, "y")!)), tx(".")];
  if (p === "pente") return [tx("Calcule la pente a de la droite de Mayer "), lx("G_1G_2"), tx(".")];
  if (p === "equation") return [tx("Écris l'équation de la droite de Mayer sous la forme "), lx("y=ax+b"), tx(".")];
  if (p === "prevY") return [tx("Calcule l'ordonnée du point de la droite de Mayer d'abscisse "), lx(nL(e.x0!)), tx(".")];
  return [tx("Calcule l'abscisse du point de la droite de Mayer d'ordonnée "), lx(nL(e.y0!)), tx(" (arrondie au centième).")];
}

export function champs(e: E, p: PhasePointMoyen): ChampEcran[] {
  if (p === "g")
    return [
      { label: "x̄ =", labelLatex: "\\bar{x}=", placeholder: "ex. : 4,25" },
      { label: "ȳ =", labelLatex: "\\bar{y}=", placeholder: "ex. : 12,5" },
    ];
  if (p === "somme") return [{ label: `Somme des ${e.manquants[0]!.coord}ᵢ =`, labelLatex: `\\sum ${e.manquants[0]!.coord}_i=`, placeholder: "ex. : 37,7" }];
  if (p === "valeur") return [{ label: "Valeur effacée", labelLatex: `${xi(e.manquants[0]!)}=`, placeholder: "ex. : 6,1" }];
  if (p === "xManquant") return [{ label: "Abscisse effacée", labelLatex: `${xi(manquantDe(e, "x")!)}=`, placeholder: "ex. : 6,1" }];
  if (p === "yManquant") return [{ label: "Ordonnée effacée", labelLatex: `${xi(manquantDe(e, "y")!)}=`, placeholder: "ex. : 15,2" }];
  if (p === "pente") return [{ label: "a =", labelLatex: "a=", placeholder: "ex. : 0,75" }];
  if (p === "equation") return [{ label: "Équation", labelLatex: "\\text{Droite de Mayer : }", placeholder: "ex. : y = 0,75x + 2,1" }];
  if (p === "prevY") return [{ label: "y =", labelLatex: "y=", placeholder: "ex. : 8,35" }];
  return [{ label: "x ≈", labelLatex: "x\\approx", placeholder: "ex. : 6,47" }];
}

export function aide1(e: E, p: PhasePointMoyen): AideEcran {
  if (p === "g") return { texte: [tx("Le point moyen a pour coordonnées les moyennes des deux séries :")], latex: "\\bar{x}=\\dfrac{x_1+x_2+\\cdots+x_n}{n}\\quad\\text{et}\\quad\\bar{y}=\\dfrac{y_1+y_2+\\cdots+y_n}{n}" };
  if (p === "somme" || p === "valeur" || p === "xManquant" || p === "yManquant") {
    const c = p === "yManquant" ? "y" : p === "xManquant" ? "x" : e.manquants[0]!.coord;
    return { texte: [tx("La moyenne est la somme divisée par l'effectif ; donc la somme de toutes les valeurs vaut l'effectif fois la moyenne :")], latex: `${barre(c)}=\\dfrac{\\sum ${c}_i}{n}\\iff\\sum ${c}_i=n\\cdot${barre(c)}` };
  }
  if (p === "pente") return { texte: [tx("La pente d'une droite passant par deux points est le quotient de la différence des ordonnées par la différence des abscisses :")], latex: "a=\\dfrac{y_2-y_1}{x_2-x_1}" };
  if (p === "equation") return { texte: [tx("La droite passe par "), lx("G_1"), tx(" : ses coordonnées vérifient "), lx("y=ax+b"), tx(", ce qui donne b.")] };
  if (p === "prevY") return { texte: [tx("Remplace x par l'abscisse donnée dans l'équation de la droite.")] };
  return { texte: [tx("Remplace y par l'ordonnée donnée dans l'équation, puis isole x.")] };
}

export function aide2(e: E, p: PhasePointMoyen): AideEcran | null {
  if (p === "g") return { texte: [tx(`Additionne les ${n(e)} valeurs de x, puis divise par ${n(e)} ; fais de même pour y.`)] };
  if (p === "somme") {
    const c = e.manquants[0]!.coord;
    return { texte: [tx(`Ici n = ${n(e)} : multiplie ${n(e)} par `), lx(`${barre(c)}=${nL(e.G[c])}`), tx(".")] };
  }
  if (p === "valeur") {
    const c = e.manquants[0]!.coord;
    return { texte: [tx("Retire de cette somme les valeurs connues : "), lx(`${nL(sommeTotale(e, c))}-(\\ldots)`), tx(".")] };
  }
  if (p === "xManquant" || p === "yManquant") {
    const c = p === "xManquant" ? "x" : "y";
    return { texte: [tx(`Ici n = ${n(e)} : la somme de tous les ${c}ᵢ vaut `), lx(`${n(e)}\\times${nL(e.G[c])}`), tx(" ; retires-en la somme des valeurs connues.")] };
  }
  if (p === "pente") return { texte: [tx("Ici : "), lx(`a=\\dfrac{${nL(e.G2!.y)}-${nL(e.G1!.y)}}{${nL(e.G2!.x)}-${nL(e.G1!.x)}}`), tx(".")] };
  if (p === "equation") return { texte: [tx("Résous "), lx(`${nL(e.G1!.y)}=${nL(e.a!)}\\times${nL(e.G1!.x)}+b`), tx(".")] };
  if (p === "prevY") return { texte: [tx("Calcule "), lx(`${nL(e.a!)}\\times${nL(e.x0!)}${e.b! < 0 ? "" : "+"}${nL(e.b!)}`), tx(".")] };
  return { texte: [tx("Résous "), lx(`${nL(e.a!)}x${e.b! < 0 ? "" : "+"}${nL(e.b!)}=${nL(e.y0!)}`), tx(" : retire b, puis divise par a.")] };
}

export function reponse(e: E, p: PhasePointMoyen): Frag[] {
  if (p === "g") return [lx(`\\bar{x}=${nL(e.G.x)}`), tx(" et "), lx(`\\bar{y}=${nL(e.G.y)}`), tx(", donc "), lx(pointL("G", e.G))];
  if (p === "somme") {
    const c = e.manquants[0]!.coord;
    return [lx(`\\sum ${c}_i=${n(e)}\\times${nL(e.G[c])}=${nL(sommeTotale(e, c))}`)];
  }
  if (p === "valeur") return [lx(`${xi(e.manquants[0]!)}=${nL(valeurManquante(e, e.manquants[0]!))}`)];
  if (p === "xManquant") return [lx(`${xi(manquantDe(e, "x")!)}=${nL(valeurManquante(e, manquantDe(e, "x")!))}`)];
  if (p === "yManquant") return [lx(`${xi(manquantDe(e, "y")!)}=${nL(valeurManquante(e, manquantDe(e, "y")!))}`)];
  if (p === "pente") return [lx(`a=${nL(e.a!)}`)];
  if (p === "equation") return [lx(droiteL(e.a!, e.b!))];
  if (p === "prevY") return [lx(`y=${nL(prevY(e))}`)];
  const v = prevX(e);
  return [lx(`x${decimales(v) <= PRECISION_PREV_X ? "=" : "\\approx"}${nL(v, PRECISION_PREV_X)}`)];
}

export const recap = reponse;

export function messageIllisible(_e: E, p: PhasePointMoyen): string {
  if (p === "equation") return "Équation non reconnue : écris-la sous la forme y = ax + b, par exemple y = 0,75x + 2,1. Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un nombre décimal avec une virgule (par exemple 6,25) ou une fraction. Cette saisie ne compte pas comme une tentative.";
}

/** Coordonnées « (3\,;4) » d'un point (rappel du corrigé). */
export const coordonnees = coordL;
