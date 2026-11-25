import type { ContexteSerie } from "../core5e/contextesStat2vLotH1";
import { CONTEXTES_REELS } from "../core5e/contextesStat2vLotH1";
import type { ExerciceDroiteMayer } from "../core5e/droiteMayer";
import { arrondi, decimales } from "../core5e/stat2vLotH1";
import type { AideEcran, ChampEcran, Frag, TableauDonnees } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { droiteL, nL, nT, pointL, tableauEcran, tableauPapierL } from "./ecrituresStat2vLotH1";
import { COULEUR_G12, figureNuage } from "./figureNuageLotH1";

/**
 * Couche C — textes et figures de `5gen36` « Droite de Mayer » : consignes (précisions d'arrondi
 * affichées), champs, aides à deux niveaux, réponses, tableau (écran et papier), nuage qui s'enrichit
 * écran après écran (G₁ et G₂ une fois calculés, la droite une fois l'équation trouvée, G à la fin). Source
 * unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceDroiteMayer;
export type PhaseDroiteMayer = "partage" | "groupes" | "pente" | "equation" | "g" | "prevision";
export const PHASES: PhaseDroiteMayer[] = ["partage", "groupes", "pente", "equation", "g", "prevision"];

export const contexte = (e: E): ContexteSerie => CONTEXTES_REELS.find((c) => c.id === e.contexteId)!;
export const n = (e: E): number => e.points.length;

export function nomPrecision(d: number): string {
  return ["à l'unité", "au dixième", "au centième", "au millième", "au dix-millième"][d] ?? `à 10⁻${d}`;
}

// ============================================================================
// Valeurs attendues.
// ============================================================================

export const derniereAbscisse = (e: E): number => e.m.tries[e.m.k - 1]!.x;
/** b calculé avec la pente ARRONDIE (piège « pente arrondie avant b »). */
export const bAvecPenteArrondie = (e: E): number => e.m.G1.y - arrondi(e.m.a, e.da) * e.m.G1.x;
export const prevision = (e: E): number => e.m.a * e.x0 + e.m.b;
/** Prévision faite avec l'équation arrondie (acceptée aussi). */
export const previsionArrondie = (e: E): number => arrondi(e.m.a, e.da) * e.x0 + arrondi(e.m.b, e.db);
export const DECIMALES_G = 2;

// ============================================================================
// Tableau et figures.
// ============================================================================

export const tableau = (e: E): TableauDonnees => tableauEcran(e.points, contexte(e).ent, e.dx, e.dy);
export const tableauPapier = (e: E): string => tableauPapierL(e.points, contexte(e).ent, e.dx, e.dy);

/** Nuage ; `etat` = nombre d'écrans clos (0 : nuage seul ; ≥ 2 : G₁, G₂ ; ≥ 4 : droite ; ≥ 5 : G). */
export function figureEtat(e: E, etat: number): string {
  const c = contexte(e);
  const rem = [];
  if (etat >= 2) rem.push({ P: e.m.G1, nom: "G1", couleur: COULEUR_G12 }, { P: e.m.G2, nom: "G2", couleur: COULEUR_G12 });
  if (etat >= 5) rem.push({ P: e.G, nom: "G" });
  return figureNuage({ points: e.points, titreX: c.titreX, titreY: c.titreY, remarquables: rem, droites: etat >= 4 ? [{ a: e.m.a, b: e.m.b }] : [] });
}

export const figureEcran = (e: E, p: PhaseDroiteMayer): string => figureEtat(e, PHASES.indexOf(p));

// ============================================================================
// Écrans.
// ============================================================================

export const LIBELLES: Record<PhaseDroiteMayer, string> = {
  partage: "Tri et partage",
  groupes: "Points moyens G₁ et G₂",
  pente: "Pente",
  equation: "Équation",
  g: "Point moyen G",
  prevision: "Prévision",
};
export const libelle = (_e: E, p: PhaseDroiteMayer): string => LIBELLES[p];

export const consigneGenerale = (e: E): Frag[] => [tx(`${contexte(e).phrase} On ajuste ce nuage par la droite de Mayer.`)];

export function consigne(e: E, p: PhaseDroiteMayer): Frag[] {
  if (p === "partage")
    return [
      tx(`Range les données par abscisses croissantes et partage-les en deux groupes (${n(e) % 2 ? "n est impair : le premier groupe a un point de moins que le second" : "deux groupes de même effectif"}). Donne l'effectif du premier groupe et sa plus grande abscisse.`),
    ];
  if (p === "groupes") return [tx("Calcule les coordonnées des points moyens "), lx("G_1"), tx(" (premier groupe) et "), lx("G_2"), tx(" (second groupe), en valeurs exactes.")];
  if (p === "pente") return [tx("Calcule la pente a de la droite "), lx("G_1G_2"), tx(`, arrondie ${nomPrecision(e.da)}.`)];
  if (p === "equation") return [tx("Écris l'équation de la droite de Mayer, a arrondie "), tx(`${nomPrecision(e.da)} et b arrondi ${nomPrecision(e.db)} (calcule b avec la pente non arrondie).`)];
  if (p === "g") return [tx("Calcule les coordonnées du point moyen G du nuage (exactes ou arrondies au centième) : la droite de Mayer passe par G.")];
  return [tx(`${contexte(e).questionY(nT(e.x0, e.dx))} Donne la valeur arrondie ${nomPrecision(e.dp)}.`)];
}

const CHAMP = (label: string, labelLatex: string, placeholder: string): ChampEcran => ({ label, labelLatex, placeholder });

export function champs(e: E, p: PhaseDroiteMayer): ChampEcran[] {
  if (p === "partage") return [CHAMP("Effectif du premier groupe", "\\text{Effectif du 1}^{\\text{er}}\\text{ groupe : }", "ex. : 4"), CHAMP("Plus grande abscisse du premier groupe", "\\text{Plus grande abscisse : }", "ex. : 120")];
  if (p === "groupes")
    return [
      CHAMP("x̄₁ =", "\\bar{x}_1=", "ex. : 95"),
      CHAMP("ȳ₁ =", "\\bar{y}_1=", "ex. : 5,4"),
      CHAMP("x̄₂ =", "\\bar{x}_2=", "ex. : 166,25"),
      CHAMP("ȳ₂ =", "\\bar{y}_2=", "ex. : 7,2"),
    ];
  if (p === "pente") return [CHAMP("a ≈", "a\\approx", `ex. : ${e.da === 4 ? "0,0253" : e.da === 3 ? "0,253" : "2,53"}`)];
  if (p === "equation") return [CHAMP("Équation", "\\text{Droite de Mayer : }", e.da === 4 ? "ex. : y = 0,0253x + 2,99" : "ex. : y = 0,253x + 2,99")];
  if (p === "g") return [CHAMP("x̄ =", "\\bar{x}=", "ex. : 130,63"), CHAMP("ȳ =", "\\bar{y}=", "ex. : 6,3")];
  return [CHAMP("Prévision", "y\\approx", "ex. : 5,2")];
}

export function aide1(_e: E, p: PhaseDroiteMayer): AideEcran {
  if (p === "partage") return { texte: [tx("Méthode de Mayer : on classe les données par x croissants, puis on coupe la liste en deux groupes d'effectifs égaux (à une unité près).")] };
  if (p === "groupes") return { texte: [tx("Chaque point moyen a pour coordonnées la moyenne des x et la moyenne des y de son groupe :")], latex: "G_1(\\bar{x}_1\\,;\\bar{y}_1),\\quad\\bar{x}_1=\\dfrac{\\text{somme des }x\\text{ du groupe}}{\\text{effectif du groupe}}" };
  if (p === "pente") return { texte: [tx("Pente de la droite passant par "), lx("G_1"), tx(" et "), lx("G_2"), tx(" :")], latex: "a=\\dfrac{\\bar{y}_2-\\bar{y}_1}{\\bar{x}_2-\\bar{x}_1}" };
  if (p === "equation") return { texte: [tx("La droite passe par "), lx("G_1"), tx(" : "), lx("\\bar{y}_1=a\\,\\bar{x}_1+b"), tx(". Garde la pente en mémoire (non arrondie) pour calculer b.")] };
  if (p === "g") return { texte: [tx("G a pour coordonnées la moyenne de tous les x et de tous les y du nuage.")] };
  return { texte: [tx("Remplace x par la valeur donnée dans l'équation de la droite de Mayer.")] };
}

export function aide2(e: E, p: PhaseDroiteMayer): AideEcran | null {
  const k = e.m.k;
  if (p === "partage") return { texte: [tx(`Ici n = ${n(e)} : le premier groupe contient les ${k} plus petites abscisses${e.variante === "desordre" ? " (attention : le tableau n'est pas rangé)" : ""}.`)] };
  if (p === "groupes") return { texte: [tx(`Premier groupe : les ${k} points d'abscisses ${e.m.tries.slice(0, k).map((q) => nT(q.x, e.dx)).join(" ; ")} ; second groupe : les ${n(e) - k} autres.`)] };
  if (p === "pente") return { texte: [tx("Ici : "), lx(`a=\\dfrac{${nL(e.m.G2.y)}-${nL(e.m.G1.y)}}{${nL(e.m.G2.x)}-${nL(e.m.G1.x)}}`), tx(".")] };
  if (p === "equation") return { texte: [tx("Résous "), lx(`${nL(e.m.G1.y)}=a\\times${nL(e.m.G1.x)}+b`), tx(" avec la valeur de a affichée par ta calculatrice (pas l'arrondi).")] };
  if (p === "g") return { texte: [tx(`Additionne les ${n(e)} abscisses et divise par ${n(e)} ; de même pour les ordonnées. Tu peux aussi faire la moyenne de G₁ et G₂ pondérée par les effectifs des groupes.`)] };
  return { texte: [tx("Calcule "), lx(`a\\times${nL(e.x0)}+b`), tx(" avec ton équation.")] };
}

export function reponse(e: E, p: PhaseDroiteMayer): Frag[] {
  const { m } = e;
  if (p === "partage") return [tx(`premier groupe : ${m.k} points, plus grande abscisse `), lx(nL(derniereAbscisse(e)))];
  if (p === "groupes") return [lx(pointL("G_1", m.G1)), tx(" et "), lx(pointL("G_2", m.G2))];
  if (p === "pente") return [lx(`a${decimales(m.a) <= e.da ? "=" : "\\approx"}${nL(m.a, e.da)}`)];
  if (p === "equation") return [lx(droiteL(m.a, m.b, e.da, e.db))];
  if (p === "g") return [lx(`G${decimales(e.G.x) <= DECIMALES_G && decimales(e.G.y) <= DECIMALES_G ? "" : "\\approx"}(${nL(e.G.x, DECIMALES_G)}\\,;${nL(e.G.y, DECIMALES_G)})`)];
  return [lx(`y\\approx${nL(prevision(e), e.dp)}`), ...(contexte(e).uniteY ? [tx(` ${contexte(e).uniteY}`)] : [])];
}

export const recap = reponse;

export function messageIllisible(_e: E, p: PhaseDroiteMayer): string {
  if (p === "equation") return "Équation non reconnue : écris-la sous la forme y = ax + b, par exemple y = 0,253x + 2,99. Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un nombre décimal avec une virgule (par exemple 5,4). Cette saisie ne compte pas comme une tentative.";
}
