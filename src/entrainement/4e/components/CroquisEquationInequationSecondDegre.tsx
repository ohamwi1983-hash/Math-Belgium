import { useId } from "react";
import type { CroquisEquationInequationSecondDegre as CroquisType } from "../core/equationInequationSecondDegre.types";

interface Props {
  croquis: CroquisType;
}

/**
 * Croquis SVG sur mesure — même patron que `CroquisOptimisation.tsx` (gen55) : fond uni, sans
 * grille ni axes, `role="img"`, coordonnées FIXES jamais recalculées depuis l'instance réelle
 * (l'élève n'y lit AUCUNE valeur chiffrée, seulement les lettres x/y déjà nommées dans l'énoncé).
 * Composant INDÉPENDANT de `CroquisOptimisation.tsx` — jamais importé depuis lui, cohérent avec
 * "SANS AUCUNE dépendance vers gen55" (`core/equationInequationSecondDegre.types.ts`, en-tête).
 */
export function CroquisEquationInequationSecondDegre({ croquis }: Props) {
  switch (croquis.type) {
    case "jetEau":
      return <CroquisJetEau />;
    case "rectanglePerimetre":
      return <CroquisRectanglePerimetre />;
    case "enclosAdosseMur":
      return <CroquisEnclosAdosseMur />;
    case "triangleRectangleCathetes":
      return <CroquisTriangleRectangleCathetes />;
    case "perimetreAire":
      return <CroquisPerimetreAire />;
  }
}

/**
 * Famille A (`jetEau`) — SEULE figure du générateur qui ne soit pas un polygone : une trajectoire
 * courbe (arc), pour visualiser "hauteur en fonction de la distance horizontale" quand `f(x)` est
 * pourtant déjà révélée en toutes lettres dans l'énoncé (la formule reste abstraite sans un visuel
 * de la forme réelle du jet). Aucune valeur chiffrée, aucun point de la courbe n'est marqué comme
 * "la" hauteur maximale réelle (`yS` varie par instance) — seuls les 2 AXES (x horizontal, h
 * vertical) et leurs lettres sont annotés, jamais un point précis de la courbe.
 */
function CroquisJetEau() {
  return (
    <svg
      className="croquis-equation-inequation"
      viewBox="0 0 220 170"
      role="img"
      aria-label="Trajectoire en arc d'un jet d'eau : hauteur h en fonction de la distance horizontale x"
    >
      <line x1="30" y1="140" x2="200" y2="140" className="croquis-equation-inequation-axe" />
      <line x1="30" y1="140" x2="30" y2="25" className="croquis-equation-inequation-axe" />
      <path d="M 35 135 Q 112 15 195 135" className="croquis-equation-inequation-trajectoire" />
      <text x="205" y="140" className="croquis-equation-inequation-label">
        x
      </text>
      <text x="30" y="16" className="croquis-equation-inequation-label">
        h
      </text>
    </svg>
  );
}

const RECT = { gauche: 40, droite: 180, haut: 30, bas: 130 };

/**
 * Famille B (`rectanglePerimetre`) — rectangle ENTIÈREMENT clôturé (les 4 côtés en trait plein,
 * aucun mur) : la totalité du périmètre énoncé est à clôturer, contrairement à
 * `CroquisEnclosAdosseMur` ci-dessous. Seule la largeur (x, nommée dans l'énoncé) est annotée — la
 * longueur n'est jamais nommée dans l'énoncé (c'est précisément ce que l'élève doit exprimer en
 * fonction de x), donc jamais labellisée ici non plus.
 */
function CroquisRectanglePerimetre() {
  return (
    <svg
      className="croquis-equation-inequation"
      viewBox="0 0 220 170"
      role="img"
      aria-label="Terrain rectangulaire entièrement entouré d'une clôture : largeur x, longueur non nommée"
    >
      <rect x={RECT.gauche} y={RECT.haut} width={RECT.droite - RECT.gauche} height={RECT.bas - RECT.haut} className="croquis-equation-inequation-cloture" />
      <line x1={RECT.gauche - 10} y1={RECT.haut} x2={RECT.gauche - 10} y2={RECT.bas} className="croquis-equation-inequation-cote" />
      <line x1={RECT.gauche - 14} y1={RECT.haut} x2={RECT.gauche - 6} y2={RECT.haut} className="croquis-equation-inequation-cote" />
      <line x1={RECT.gauche - 14} y1={RECT.bas} x2={RECT.gauche - 6} y2={RECT.bas} className="croquis-equation-inequation-cote" />
      <text x={RECT.gauche - 22} y={(RECT.haut + RECT.bas) / 2} className="croquis-equation-inequation-label">
        x
      </text>
    </svg>
  );
}

/**
 * Famille B (`enclosAdosseMur`) — rectangle dont le côté bas est un mur EXISTANT (hachuré, jamais à
 * clôturer) et les 3 autres côtés sont la clôture à poser (trait plein coloré) — même convention
 * visuelle que `CroquisAireEnclosCloture` de gen55 (mur haché vs clôture pleine, jamais la couleur
 * seule), mais réimplémentée ici indépendamment (pas de configuration variable : cette famille a
 * TOUJOURS exactement 1 mur, contrairement à gen55). x (largeur, perpendiculaire au mur, nommée
 * dans l'énoncé) annoté sur le côté gauche — jamais sur le mur, rien à isoler dessus.
 */
function CroquisEnclosAdosseMur() {
  const patternId = useId();
  return (
    <svg
      className="croquis-equation-inequation"
      viewBox="0 0 220 170"
      role="img"
      aria-label="Enclos rectangulaire adossé à un mur existant (hachuré, côté bas) : les 3 autres côtés sont à clôturer — largeur x, perpendiculaire au mur"
    >
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" className="croquis-equation-inequation-hachure-trait" />
        </pattern>
      </defs>

      <rect
        x={RECT.gauche - 5}
        y={RECT.bas - 5}
        width={RECT.droite - RECT.gauche + 10}
        height={10}
        fill={`url(#${patternId})`}
        className="croquis-equation-inequation-mur"
      />
      <line x1={RECT.gauche} y1={RECT.haut} x2={RECT.droite} y2={RECT.haut} className="croquis-equation-inequation-cloture" />
      <line x1={RECT.gauche} y1={RECT.haut} x2={RECT.gauche} y2={RECT.bas} className="croquis-equation-inequation-cloture" />
      <line x1={RECT.droite} y1={RECT.haut} x2={RECT.droite} y2={RECT.bas} className="croquis-equation-inequation-cloture" />

      <line x1={RECT.gauche - 10} y1={RECT.haut} x2={RECT.gauche - 10} y2={RECT.bas} className="croquis-equation-inequation-cote" />
      <line x1={RECT.gauche - 14} y1={RECT.haut} x2={RECT.gauche - 6} y2={RECT.haut} className="croquis-equation-inequation-cote" />
      <line x1={RECT.gauche - 14} y1={RECT.bas} x2={RECT.gauche - 6} y2={RECT.bas} className="croquis-equation-inequation-cote" />
      <text x={RECT.gauche - 22} y={(RECT.haut + RECT.bas) / 2} className="croquis-equation-inequation-label">
        x
      </text>
      <text x={(RECT.gauche + RECT.droite) / 2} y={RECT.bas + 20} className="croquis-equation-inequation-legende">
        mur existant
      </text>
    </svg>
  );
}

/**
 * Famille B (`triangleRectangleCathetes`) — UNIQUE figure non-rectangulaire du générateur parmi les
 * architectures B/D : un triangle rectangle, angle droit marqué par un petit carré (convention
 * géométrique standard, jamais la couleur seule). La cathète horizontale (x, nommée dans l'énoncé)
 * est annotée en bas — l'autre cathète (verticale, S-x) n'est jamais nommée dans l'énoncé, donc
 * jamais labellisée ici non plus (même principe que `CroquisRectanglePerimetre`).
 */
function CroquisTriangleRectangleCathetes() {
  const sommetDroit = { x: 40, y: 130 };
  const sommetHaut = { x: 40, y: 30 };
  const sommetBas = { x: 180, y: 130 };
  const tailleAngleDroit = 12;

  return (
    <svg
      className="croquis-equation-inequation"
      viewBox="0 0 220 170"
      role="img"
      aria-label="Triangle rectangle : cathète horizontale x, cathète verticale non nommée, hypoténuse"
    >
      <polygon points={`${sommetDroit.x},${sommetDroit.y} ${sommetHaut.x},${sommetHaut.y} ${sommetBas.x},${sommetBas.y}`} className="croquis-equation-inequation-rectangle" />
      <polyline
        points={`${sommetDroit.x},${sommetDroit.y - tailleAngleDroit} ${sommetDroit.x + tailleAngleDroit},${sommetDroit.y - tailleAngleDroit} ${sommetDroit.x + tailleAngleDroit},${sommetDroit.y}`}
        className="croquis-equation-inequation-angle-droit"
      />
      <text x={(sommetDroit.x + sommetBas.x) / 2} y={sommetBas.y + 20} className="croquis-equation-inequation-label">
        x
      </text>
    </svg>
  );
}

/**
 * Famille D (`perimetreAire`) — simple rectangle, SANS mur (le périmètre entier est une donnée
 * abstraite du système à poser, pas une clôture à construire) : les 2 dimensions x et y sont TOUTES
 * LES DEUX des inconnues du système (contrairement à `CroquisRectanglePerimetre`, où seule x est
 * nommée) — largeur x annotée en bas, longueur y annotée à droite, même convention que
 * `CroquisRectangleInscrit` de gen55 (x bas, y côté droit).
 */
function CroquisPerimetreAire() {
  return (
    <svg className="croquis-equation-inequation" viewBox="0 0 220 170" role="img" aria-label="Rectangle de largeur x et de longueur y">
      <rect x={RECT.gauche} y={RECT.haut} width={RECT.droite - RECT.gauche} height={RECT.bas - RECT.haut} className="croquis-equation-inequation-rectangle" />
      <text x={(RECT.gauche + RECT.droite) / 2} y={RECT.bas + 20} className="croquis-equation-inequation-label">
        x
      </text>
      <text x={RECT.droite + 16} y={(RECT.haut + RECT.bas) / 2} className="croquis-equation-inequation-label">
        y
      </text>
    </svg>
  );
}
