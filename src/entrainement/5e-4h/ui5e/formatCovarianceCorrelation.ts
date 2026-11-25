import { CONTEXTES_PETITS, CONTEXTES_REELS } from "../core5e/contextesStat2vLotH1";
import type { ExerciceCorrelation } from "../core5e/covarianceCorrelation";
import type { ClasseR } from "../core5e/stat2vLotH1";
import { arrondi, decimales, moindresCarres, NOM_CLASSE, sEchantillon } from "../core5e/stat2vLotH1";
import type { AideEcran, ChampEcran, Frag, OptionEcran, TableauDonnees } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { nL, tableauEcran, tableauPapierL } from "./ecrituresStat2vLotH1";
import { figureNuage } from "./figureNuageLotH1";
import { nomPrecision } from "./formatDroiteMayer";

/**
 * Couche C — textes et figures de `5gen38` « Covariance et coefficient de corrélation » : consignes
 * (précisions affichées), champs, options (sens, intensité selon le tableau du cours), aides à deux
 * niveaux, réponses, tableau, nuage (la droite des moindres carrés n'apparaît qu'au corrigé). Source unique
 * de l'écran, du papier et du corrigé.
 */

type E = ExerciceCorrelation;
export type PhaseCorrelation = "covEcarts" | "covProduits" | "sigmas" | "r" | "cov" | "sens" | "intensite";

export function phases(e: E): PhaseCorrelation[] {
  return e.variante === "main" ? ["covEcarts", "covProduits", "sigmas", "r", "sens", "intensite"] : ["sigmas", "r", "cov", "sens", "intensite"];
}

export function contexte(e: E): { phrase: string; ent: { x: string; y: string }; titreX: string; titreY: string } {
  return (e.variante === "main" ? CONTEXTES_PETITS : CONTEXTES_REELS).find((c) => c.id === e.contexteId)!;
}

export const n = (e: E): number => e.points.length;

// ============================================================================
// Valeurs attendues.
// ============================================================================

export const sxEch = (e: E): number => sEchantillon(e.points.map((p) => p.x));
export const syEch = (e: E): number => sEchantillon(e.points.map((p) => p.y));
/** r calculé avec σx et σy arrondis au centième (accepté aussi pour `main`). */
export const rAvecSigmasArrondis = (e: E): number => e.cov / (arrondi(e.sx, e.ds) * arrondi(e.sy, e.ds));
/** Covariance r·σx·σy avec r et σ arrondis (accepté aussi pour `calculatrice`). */
export const covAvecArrondis = (e: E): number => arrondi(e.r, e.dr) * arrondi(e.sx, e.ds) * arrondi(e.sy, e.ds);

// ============================================================================
// Tableau et figures.
// ============================================================================

export const tableau = (e: E): TableauDonnees => tableauEcran(e.points, contexte(e).ent, e.dx, e.dy);
export const tableauPapier = (e: E): string => tableauPapierL(e.points, contexte(e).ent, e.dx, e.dy);

const titres = (e: E) => (e.contexteId === "generique" ? {} : { titreX: contexte(e).titreX, titreY: contexte(e).titreY });

export function figureEcran(e: E): string {
  return figureNuage({ points: e.points, ...titres(e) });
}

export function figureCorrige(e: E): string {
  const { a, b } = moindresCarres(e.points);
  return figureNuage({ points: e.points, ...titres(e), remarquables: [{ P: e.G, nom: "G" }], droites: [{ a, b }] });
}

// ============================================================================
// Options.
// ============================================================================

const CLASSES: ClasseR[] = ["parfaite", "tresForte", "forte", "moyenne", "faible", "nulle"];

export function options(_e: E, p: PhaseCorrelation): OptionEcran[] {
  if (p === "sens")
    return [
      { id: "positif", fragments: [tx("Corrélation positive : x et y varient dans le même sens.")] },
      { id: "negatif", fragments: [tx("Corrélation négative : quand x augmente, y diminue.")] },
    ];
  return CLASSES.map((c) => ({ id: c, fragments: [tx(`Corrélation ${NOM_CLASSE[c]}`)] }));
}

export function bonneOption(e: E, p: PhaseCorrelation): string {
  return p === "sens" ? (e.positif ? "positif" : "negatif") : e.classe;
}

// ============================================================================
// Écrans.
// ============================================================================

const LIBELLES: Record<PhaseCorrelation, string> = {
  covEcarts: "Covariance (écarts)",
  covProduits: "Covariance (seconde formule)",
  sigmas: "Écarts-types",
  r: "Coefficient r",
  cov: "Covariance",
  sens: "Sens de la corrélation",
  intensite: "Intensité de la corrélation",
};
export const libelle = (_e: E, p: PhaseCorrelation): string => LIBELLES[p];

export const consigneGenerale = (e: E): Frag[] => [tx(`${contexte(e).phrase} ${e.variante === "main" ? "Les calculs se font à la main." : "Utilise ta calculatrice."}`)];

export function consigne(e: E, p: PhaseCorrelation): Frag[] {
  if (p === "covEcarts") return [tx("Calcule la covariance de x et y avec la formule des écarts à la moyenne :"), lx("\\operatorname{Cov}(x,y)=\\dfrac{1}{n}\\sum(x_i-\\bar{x})(y_i-\\bar{y})")];
  if (p === "covProduits") return [tx("Retrouve-la avec la seconde formule : calcule "), lx("\\dfrac{1}{n}\\sum x_iy_i"), tx(", puis "), lx("\\operatorname{Cov}(x,y)=\\dfrac{1}{n}\\sum x_iy_i-\\bar{x}\\,\\bar{y}"), tx(".")];
  if (p === "sigmas") return [tx(`Donne les écarts-types `), lx("\\sigma_x"), tx(" et "), lx("\\sigma_y"), tx(` (division par n), arrondis ${nomPrecision(e.ds)}.`)];
  if (p === "r") return [tx("Calcule le coefficient de corrélation "), lx("r=\\dfrac{\\operatorname{Cov}(x,y)}{\\sigma_x\\,\\sigma_y}"), tx(`, arrondi ${nomPrecision(e.dr)}.`)];
  if (p === "cov") return [tx("Déduis-en la covariance "), lx("\\operatorname{Cov}(x,y)=r\\,\\sigma_x\\,\\sigma_y"), tx(`, arrondie ${nomPrecision(e.dc)}.`)];
  if (p === "sens") return [tx("Quel est le sens de la corrélation entre x et y ?")];
  return [tx("D'après le tableau d'interprétation du cours, quelle est l'intensité de cette corrélation ?")];
}

const C = (label: string, labelLatex: string, placeholder: string): ChampEcran => ({ label, labelLatex, placeholder });

export function champs(e: E, p: PhaseCorrelation): ChampEcran[] {
  if (p === "covEcarts") return [C("Cov(x, y) =", "\\operatorname{Cov}(x,y)=", "ex. : 3,6")];
  if (p === "covProduits") return [C("Moyenne des produits xᵢyᵢ =", "\\dfrac{1}{n}\\sum x_iy_i=", "ex. : 51,6"), C("Cov(x, y) =", "\\operatorname{Cov}(x,y)=", "ex. : 3,6")];
  if (p === "sigmas") return [C("σx ≈", "\\sigma_x\\approx", "ex. : 1,41"), C("σy ≈", "\\sigma_y\\approx", "ex. : 2,83")];
  if (p === "r") return [C("r ≈", "r\\approx", e.dr === 3 ? "ex. : 0,912" : "ex. : 0,91")];
  return [C("Cov(x, y) ≈", "\\operatorname{Cov}(x,y)\\approx", "ex. : 42,19")];
}

export function aide1(e: E, p: PhaseCorrelation): AideEcran {
  if (p === "covEcarts") return { texte: [tx("Calcule d'abord "), lx("\\bar{x}"), tx(" et "), lx("\\bar{y}"), tx(", puis, pour chaque point, le produit des écarts "), lx("(x_i-\\bar{x})(y_i-\\bar{y})"), tx(" ; fais la moyenne de ces produits.")] };
  if (p === "covProduits") return { texte: [tx("Multiplie x et y point par point, fais la moyenne de ces produits, puis retire le produit des moyennes.")] };
  if (p === "sigmas")
    return e.variante === "main"
      ? { texte: [tx("L'écart-type est la racine carrée de la variance (moyenne des carrés des écarts, division par n) :")], latex: "\\sigma_x=\\sqrt{\\dfrac{1}{n}\\sum(x_i-\\bar{x})^2}" }
      : { texte: [tx("« 2-Var Stats » de la TI-30XB affiche "), lx("\\sigma_x"), tx(" et "), lx("S_x"), tx(" : le cours utilise "), lx("\\sigma_x"), tx(" (division par n).")] };
  if (p === "r") return e.variante === "main" ? { texte: [tx("Divise la covariance par le produit des deux écarts-types (garde les valeurs non arrondies si tu peux).")] } : { texte: [tx("La TI-30XB affiche r en fin de liste des résultats de « 2-Var Stats ».")] };
  if (p === "cov") return { texte: [tx("De "), lx("r=\\dfrac{\\operatorname{Cov}(x,y)}{\\sigma_x\\sigma_y}"), tx(", on tire "), lx("\\operatorname{Cov}(x,y)=r\\,\\sigma_x\\,\\sigma_y"), tx(" (la calculatrice ne donne pas la covariance).")] };
  if (p === "sens") return { texte: [tx("Le signe de la covariance (et de r) donne le sens : positif, x et y varient dans le même sens ; négatif, en sens contraire.")] };
  return { texte: [tx("Tableau du cours (selon "), lx("|r|"), tx(") :")], latex: "\\begin{array}{l}|r|<0{,}35:\\text{ nulle};\\ 0{,}35\\le|r|<0{,}60:\\text{ faible};\\ 0{,}60\\le|r|<0{,}80:\\text{ moyenne}\\\\0{,}80\\le|r|<0{,}98:\\text{ forte};\\ 0{,}98\\le|r|<1:\\text{ très forte};\\ |r|=1:\\text{ parfaite}\\end{array}" };
}

export function aide2(e: E, p: PhaseCorrelation): AideEcran | null {
  if (p === "covEcarts") return { texte: [tx("Ici "), lx(`\\bar{x}=${nL(e.G.x)}`), tx(" et "), lx(`\\bar{y}=${nL(e.G.y)}`), tx(` ; additionne les ${n(e)} produits des écarts, puis divise par ${n(e)}.`)] };
  if (p === "covProduits") return { texte: [tx("Ici "), lx(`\\bar{x}\\,\\bar{y}=${nL(e.G.x)}\\times${nL(e.G.y)}=${nL(e.G.x * e.G.y)}`), tx(".")] };
  if (p === "sigmas") return e.variante === "main" ? { texte: [tx(`Calcule la somme des carrés des écarts de x, divise par ${n(e)}, puis prends la racine carrée ; de même pour y.`)] } : { texte: [tx("Dans la liste des résultats, prends la ligne σx (la ligne Sx divise par n − 1).")] };
  if (p === "r") return e.variante === "main" ? { texte: [tx("Ici "), lx(`r=\\dfrac{${nL(e.cov)}}{\\sigma_x\\times\\sigma_y}`), tx(" avec tes valeurs de l'écran précédent.")] } : { texte: [tx("Vérifie que r a le signe attendu d'après le nuage, et que "), lx("|r|\\le 1"), tx(".")] };
  if (p === "cov") return { texte: [tx("Multiplie r par "), lx("\\sigma_x"), tx(" et par "), lx("\\sigma_y"), tx(" (valeurs des écrans précédents).")] };
  if (p === "sens") return { texte: [tx("Regarde le signe de "), lx("\\operatorname{Cov}(x,y)"), tx(" trouvé plus haut, ou celui de r.")] };
  return { texte: [tx("Place "), lx("|r|"), tx(" dans le tableau : entre quels seuils se trouve-t-il ?")] };
}

const egalOuEnviron = (v: number, d: number) => (decimales(v) <= d ? "=" : "\\approx");

export function reponse(e: E, p: PhaseCorrelation): Frag[] {
  if (p === "covEcarts") return [lx(`\\operatorname{Cov}(x,y)=${nL(e.cov)}`)];
  if (p === "covProduits") return [lx(`\\dfrac{1}{n}\\sum x_iy_i=${nL(e.moyProduits)}`), tx(" et "), lx(`\\operatorname{Cov}(x,y)=${nL(e.cov)}`)];
  if (p === "sigmas") return [lx(`\\sigma_x${egalOuEnviron(e.sx, e.ds)}${nL(e.sx, e.ds)}`), tx(" et "), lx(`\\sigma_y${egalOuEnviron(e.sy, e.ds)}${nL(e.sy, e.ds)}`)];
  if (p === "r") return [lx(`r\\approx${nL(e.r, e.dr)}`)];
  if (p === "cov") return [lx(`\\operatorname{Cov}(x,y)\\approx${nL(e.cov, e.dc)}`)];
  if (p === "sens") return [tx(e.positif ? "corrélation positive" : "corrélation négative")];
  return [tx(`corrélation ${NOM_CLASSE[e.classe]}`)];
}

export const recap = reponse;

export function messageIllisible(): string {
  return "Nombre non reconnu : écris un nombre décimal avec une virgule (par exemple 0,91), une fraction ou une racine (√2). Cette saisie ne compte pas comme une tentative.";
}
