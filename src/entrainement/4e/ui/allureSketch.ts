import type { SigneAllure, SigneProduitAB } from "../core/analyseFonction.types";

/**
 * Croquis schématique de l'allure du graphe (étape 2) : seul Oy est visible (pas d'axe Ox,
 * contrairement à ParabolaSketch de l'exercice "tableau de signes") — coordonnées pixel fixes,
 * pas à l'échelle numérique réelle. Mis à jour en temps réel à mesure des choix de l'élève, donc
 * signeA/signeAB peuvent être `null` (pas encore choisis) : "neutre" indique alors une valeur pas
 * encore déterminée plutôt qu'un défaut arbitraire faussement confirmé.
 */
export interface PointCroquisAllure {
  x: number;
  y: number;
}

export interface AllureCroquis {
  concavite: "haut" | "bas" | "neutre";
  position: "gauche" | "centre" | "droite" | "neutre";
  /** Point où la courbe touche Oy, à la hauteur c (jamais à l'échelle réelle de c, juste son signe). */
  pointContactC: PointCroquisAllure;
  valeurC: number;
  points: PointCroquisAllure[];
  axeOyX: number;
  largeur: number;
  hauteur: number;
}

const LARGEUR = 220;
const HAUTEUR = 200;
const AXE_OY_X = 110;
const CENTRE_Y = 100;
const DECALAGE_POSITION = 45;
const DECALAGE_C = 30;
const COEFF = 0.02;
const XS = Array.from({ length: 41 }, (_, i) => i * (LARGEUR / 40));

function decalageXPosition(position: SigneProduitAB | null): number {
  if (position === "+") return -DECALAGE_POSITION; // a·b>0 : sommet à gauche
  if (position === "-") return DECALAGE_POSITION; // a·b<0 : sommet à droite
  return 0; // "0" ou pas encore choisi : sur l'axe
}

function decalageYContact(c: number): number {
  if (c > 0) return -DECALAGE_C;
  if (c < 0) return DECALAGE_C;
  return 0;
}

export function calculerAllureSketch(
  signeA: SigneAllure | null,
  signeAB: SigneProduitAB | null,
  c: number,
): AllureCroquis {
  const concavite = signeA === "+" ? "haut" : signeA === "-" ? "bas" : "neutre";
  const position = signeAB === "+" ? "gauche" : signeAB === "-" ? "droite" : signeAB === "0" ? "centre" : "neutre";

  // a>0 ("haut") : le sommet est le point le plus bas visuellement (grand y SVG), les arcs
  // remontent de part et d'autre — d'où s négatif (le terme quadratique DIMINUE le y SVG en
  // s'éloignant du sommet). a<0 ("bas") : l'inverse, s positif. "neutre" traité comme "haut" par
  // défaut visuellement (prompt-8-corrections-analyse-fonction.md, correction 7 : l'ancienne
  // formule inversait ce mapping).
  const s = concavite === "bas" ? 1 : -1;
  const sommetX = AXE_OY_X + decalageXPosition(signeAB);
  const contactY = CENTRE_Y + decalageYContact(c);

  // La parabole passe par (AXE_OY_X, contactY) et a son sommet en x=sommetX — dérivée directement
  // de y = contactY + s·COEFF·(x - sommetX)² - s·COEFF·(AXE_OY_X - sommetX)² pour garantir le
  // passage exact par le point de contact quel que soit le décalage horizontal du sommet.
  const decalageAuContact = s * COEFF * (AXE_OY_X - sommetX) ** 2;
  const points = XS.map((x) => ({ x, y: contactY - decalageAuContact + s * COEFF * (x - sommetX) ** 2 }));

  return {
    concavite,
    position,
    pointContactC: { x: AXE_OY_X, y: contactY },
    valeurC: c,
    points,
    axeOyX: AXE_OY_X,
    largeur: LARGEUR,
    hauteur: HAUTEUR,
  };
}
