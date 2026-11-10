/**
 * Croquis des problèmes en contexte du chapitre 1 de 4e (gen55 optimisation, gen57 équations et
 * inéquations en contexte), en chaînes SVG AUTONOMES pour les feuilles d'exercices et évaluations
 * (pas de DOM React, styles en ligne : la feuille imprimée n'a pas les classes CSS du site).
 *
 * Mêmes figures, mêmes coordonnées et mêmes étiquettes que les composants de l'écran
 * (`components/CroquisOptimisation.tsx`, `components/CroquisEquationInequationSecondDegre.tsx`) :
 * croquis purement illustratifs (proportions fixes, aucune mesure à lire), seul le choix du croquis
 * (et la configuration de clôture) dépend de l'instance.
 */
import type { ConfigurationCloture, CroquisOptimisation } from "../core/optimisation.types";
import type { CroquisEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";

const TRAIT = 'stroke="#1f2933" stroke-width="2" fill="none"';
const CLOTURE = 'stroke="#1971c2" stroke-width="3" fill="none"';
const FORME = 'stroke="#1971c2" stroke-width="2" fill="#e7f0fa"';
const POINTILLE = 'stroke="#5c6670" stroke-width="1.5" stroke-dasharray="5 4" fill="none"';
const LABEL = 'font-family="Georgia, serif" font-style="italic" font-size="16" fill="#1f2933" text-anchor="middle" dominant-baseline="middle"';
const LEGENDE = 'font-family="Arial, sans-serif" font-size="11" fill="#3e4c59" text-anchor="middle" dominant-baseline="middle"';

function svg(viewBox: string, largeur: number, contenu: string, description: string): string {
  const [, , w, h] = viewBox.split(" ").map(Number);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${largeur}" height="${Math.round((largeur * h) / w)}" role="img" aria-label="${description}" style="display:block;margin:6px auto;max-width:100%">${contenu}</svg>`;
}

function label(x: number, y: number, t: string): string {
  return `<text x="${x}" y="${y}" ${LABEL}>${t}</text>`;
}

/** Bande hachurée d'un mur (hachures dessinées en lignes : aucun `<pattern>`, dont l'identifiant
 * entrerait en collision entre plusieurs croquis d'une même feuille). */
function mur(x: number, y: number, largeur: number, hauteur: number): string {
  const traits: string[] = [];
  // Traits à 45°, coupés au bord de la bande par le `<svg>` imbriqué (débordement masqué).
  for (let k = -hauteur; k < largeur + hauteur; k += 6) {
    traits.push(`<line x1="${x + k}" y1="${y + hauteur}" x2="${x + k + hauteur}" y2="${y}" stroke="#8a8f98" stroke-width="1"/>`);
  }
  return `<svg x="${x}" y="${y}" width="${largeur}" height="${hauteur}" viewBox="${x} ${y} ${largeur} ${hauteur}" overflow="hidden">${traits.join("")}</svg><rect x="${x}" y="${y}" width="${largeur}" height="${hauteur}" stroke="#5c6670" stroke-width="1" fill="none"/>`;
}

// ---------------------------------------------------------------------------------------------
// gen55
// ---------------------------------------------------------------------------------------------

const RECT = { gauche: 40, droite: 180, haut: 30, bas: 130 };

const COTES_MUR: Record<ConfigurationCloture, ("haut" | "bas" | "gauche" | "droite")[]> = { libre: [], mur: ["bas"], deuxMurs: ["bas", "gauche"] };

function croquisEnclos(configuration: ConfigurationCloture): string {
  const murs = COTES_MUR[configuration];
  const ligne = { haut: [RECT.gauche, RECT.haut, RECT.droite, RECT.haut], bas: [RECT.gauche, RECT.bas, RECT.droite, RECT.bas], gauche: [RECT.gauche, RECT.haut, RECT.gauche, RECT.bas], droite: [RECT.droite, RECT.haut, RECT.droite, RECT.bas] } as const;
  const bande = {
    haut: [RECT.gauche - 5, RECT.haut - 5, RECT.droite - RECT.gauche + 10, 10],
    bas: [RECT.gauche - 5, RECT.bas - 5, RECT.droite - RECT.gauche + 10, 10],
    gauche: [RECT.gauche - 5, RECT.haut - 5, 10, RECT.bas - RECT.haut + 10],
    droite: [RECT.droite - 5, RECT.haut - 5, 10, RECT.bas - RECT.haut + 10],
  } as const;
  const contenu = (["haut", "bas", "gauche", "droite"] as const)
    .map((cote) => (murs.includes(cote) ? mur(bande[cote][0], bande[cote][1], bande[cote][2], bande[cote][3]) : `<line x1="${ligne[cote][0]}" y1="${ligne[cote][1]}" x2="${ligne[cote][2]}" y2="${ligne[cote][3]}" ${CLOTURE}/>`))
    .join("");
  const xLabel = murs.includes("gauche") ? 198 : 22;
  const yLabel = murs.includes("haut") ? 148 : 15;
  const legende = murs.length > 0 ? `<text x="110" y="${murs.includes("haut") ? 160 : 160}" ${LEGENDE}>hachuré : mur existant ; trait plein : clôture</text>` : "";
  return svg("0 0 220 170", 240, `${contenu}${label(xLabel, 80, "x")}${label(110, yLabel, "y")}${legende}`, "Enclos rectangulaire : largeur x, longueur y");
}

function croquisRectangleInscrit(): string {
  return svg(
    "0 0 220 200",
    240,
    `<polygon points="110,15 20,150 200,150" ${TRAIT}/><polygon points="63,150 157,150 157,85 63,85" ${FORME}/>${label(110, 138, "x")}${label(170, 120, "y")}`,
    "Triangle isocèle avec un rectangle inscrit de largeur x et de hauteur y",
  );
}

function croquisFilCoupe(): string {
  return svg(
    "0 0 280 200",
    280,
    `<line x1="25" y1="30" x2="136" y2="30" ${CLOTURE}/><line x1="144" y1="30" x2="255" y2="30" ${CLOTURE}/>` +
      [25, 136, 144, 255].map((x) => `<line x1="${x}" y1="24" x2="${x}" y2="36" stroke="#1f2933" stroke-width="1.5"/>`).join("") +
      `${label(80, 16, "x")}${label(200, 16, "y")}<line x1="80" y1="30" x2="80" y2="85" ${POINTILLE}/><line x1="200" y1="30" x2="195" y2="110" ${POINTILLE}/>` +
      `<polygon points="45,85 115,85 115,155 45,155" ${FORME}/><text x="80" y="172" ${LEGENDE}>périmètre x</text>` +
      `<polygon points="165,155 225,155 165,110" ${FORME}/><polyline points="165,148 172,148 172,155" stroke="#1f2933" stroke-width="1" fill="none"/><text x="195" y="172" ${LEGENDE}>périmètre y</text>`,
    "Fil coupé en deux morceaux x et y, pliés en carré (périmètre x) et en triangle rectangle (périmètre y)",
  );
}

export function croquisOptimisationSvg(croquis: CroquisOptimisation | undefined): string | undefined {
  if (!croquis) return undefined;
  switch (croquis.type) {
    case "aireEnclosCloture":
      return croquisEnclos(croquis.configuration);
    case "rectangleInscrit":
      return croquisRectangleInscrit();
    case "sommeDeuxCarresMateriau":
      return croquisFilCoupe();
  }
}

// ---------------------------------------------------------------------------------------------
// gen57
// ---------------------------------------------------------------------------------------------

function coteVertical(): string {
  return (
    `<line x1="${RECT.gauche - 10}" y1="${RECT.haut}" x2="${RECT.gauche - 10}" y2="${RECT.bas}" stroke="#1f2933" stroke-width="1"/>` +
    `<line x1="${RECT.gauche - 14}" y1="${RECT.haut}" x2="${RECT.gauche - 6}" y2="${RECT.haut}" stroke="#1f2933" stroke-width="1"/>` +
    `<line x1="${RECT.gauche - 14}" y1="${RECT.bas}" x2="${RECT.gauche - 6}" y2="${RECT.bas}" stroke="#1f2933" stroke-width="1"/>` +
    label(RECT.gauche - 24, (RECT.haut + RECT.bas) / 2, "x")
  );
}

export function croquisEquationInequationSvg(croquis: CroquisEquationInequationSecondDegre | undefined): string | undefined {
  if (!croquis) return undefined;
  const largeur = 230;
  switch (croquis.type) {
    case "jetEau":
      return svg(
        "0 0 220 170",
        largeur,
        `<line x1="30" y1="140" x2="200" y2="140" ${TRAIT}/><line x1="30" y1="140" x2="30" y2="25" ${TRAIT}/><path d="M 35 135 Q 112 15 195 135" stroke="#1971c2" stroke-width="2.5" fill="none" stroke-dasharray="6 4"/>${label(208, 140, "x")}${label(30, 14, "h")}`,
        "Trajectoire en arc d'un jet d'eau : hauteur h en fonction de la distance horizontale x",
      );
    case "rectanglePerimetre":
      return svg("0 0 220 170", largeur, `<rect x="${RECT.gauche}" y="${RECT.haut}" width="${RECT.droite - RECT.gauche}" height="${RECT.bas - RECT.haut}" ${CLOTURE}/>${coteVertical()}`, "Terrain rectangulaire entouré d'une clôture, de largeur x");
    case "enclosAdosseMur":
      return svg(
        "0 0 220 170",
        largeur,
        `${mur(RECT.gauche - 5, RECT.bas - 5, RECT.droite - RECT.gauche + 10, 10)}<polyline points="${RECT.gauche},${RECT.bas} ${RECT.gauche},${RECT.haut} ${RECT.droite},${RECT.haut} ${RECT.droite},${RECT.bas}" ${CLOTURE}/>${coteVertical()}<text x="110" y="${RECT.bas + 22}" ${LEGENDE}>mur existant</text>`,
        "Enclos rectangulaire adossé à un mur : largeur x, perpendiculaire au mur",
      );
    case "triangleRectangleCathetes":
      return svg(
        "0 0 220 170",
        largeur,
        `<polygon points="40,130 40,30 180,130" ${FORME}/><polyline points="40,118 52,118 52,130" stroke="#1f2933" stroke-width="1" fill="none"/>${label(110, 150, "x")}`,
        "Triangle rectangle : cathète horizontale x",
      );
    case "cerfVolantDiagonales":
      return svg(
        "0 0 220 170",
        largeur,
        `<polygon points="110,20 180,80 110,140 40,80" ${FORME}/><line x1="40" y1="80" x2="180" y2="80" ${POINTILLE}/><line x1="110" y1="20" x2="110" y2="140" ${POINTILLE}/>${label(110, 66, "x")}`,
        "Losange (cerf-volant) : diagonale horizontale x",
      );
    case "facadeMaisonToit":
      return svg(
        "0 0 220 170",
        largeur,
        `<polygon points="40,140 180,140 180,70 110,25 40,70" ${FORME}/><line x1="40" y1="70" x2="180" y2="70" ${POINTILLE}/>${label(110, 160, "x")}`,
        "Façade : mur rectangulaire de largeur x surmonté d'un toit triangulaire de même largeur",
      );
    case "perimetreAire":
      return svg(
        "0 0 220 170",
        largeur,
        `<rect x="${RECT.gauche}" y="${RECT.haut}" width="${RECT.droite - RECT.gauche}" height="${RECT.bas - RECT.haut}" ${FORME}/>${label(110, RECT.bas + 20, "x")}${label(RECT.droite + 16, (RECT.haut + RECT.bas) / 2, "y")}`,
        "Rectangle de largeur x et de longueur y",
      );
  }
}
