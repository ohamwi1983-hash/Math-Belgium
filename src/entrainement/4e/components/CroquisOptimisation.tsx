import { useId } from "react";
import type { ConfigurationCloture, CroquisOptimisation as CroquisOptimisationType } from "../core/optimisation.types";

interface Props {
  croquis: CroquisOptimisationType;
}

/**
 * Croquis SVG sur mesure (`prompt-implementation-3-diagrammes-svg.md`) — même patron de conteneur
 * que `TriangleQuelconqueSketch.tsx`/gen58 (fond uni, sans grille ni axes, `role="img"`) : croquis
 * purement illustratif, l'élève n'y lit AUCUNE coordonnée chiffrée (contrainte CLAUDE.md "Rendu
 * graphique" — Mafs réservé à la lecture de coordonnées, SVG sur mesure sinon). Fidélité aux
 * proportions réelles de l'instance volontairement secondaire à la lisibilité (validé par le
 * prompt) : les 3 croquis ci-dessous utilisent des coordonnées FIXES, jamais recalculées depuis
 * `sommet`/`domaine`/`fonction` — seul le CHOIX du croquis (`CroquisOptimisation.type`) et, pour
 * `aireEnclosCloture`, la configuration réellement tirée, dépendent de l'instance.
 */
export function CroquisOptimisation({ croquis }: Props) {
  switch (croquis.type) {
    case "rectangleInscrit":
      return <CroquisRectangleInscrit />;
    case "sommeDeuxCarresMateriau":
      return <CroquisSommeDeuxCarresMateriau />;
    case "aireEnclosCloture":
      return <CroquisAireEnclosCloture configuration={croquis.configuration} />;
  }
}

/**
 * Famille V (`rectangleInscrit`) — triangle isocèle (apex en haut) avec le rectangle inscrit, base
 * sur la base du triangle, sommets hauts exactement sur les côtés obliques (cohérent avec la vraie
 * géométrie "inscrit", même si les proportions exactes ne reflètent pas `demiBase`/`h0` de
 * l'instance). Une seule géométrie pour les 3 skins narratifs (`rectangleInscrit.ts`, en-tête :
 * habillages du MÊME triangle, jamais 2 configurations distinctes) — x=largeur (labellisée sur le
 * bas du rectangle), y=hauteur (labellisée sur son côté droit), convention fixée par la correction
 * de `prompt-groupe-corrections-gen55.md` (point 1).
 */
function CroquisRectangleInscrit() {
  return (
    <svg
      className="croquis-optimisation"
      viewBox="0 0 220 200"
      role="img"
      aria-label="Triangle isocèle avec un rectangle inscrit, base sur la base du triangle : largeur x, hauteur y"
    >
      <polygon points="110,15 20,150 200,150" className="croquis-optimisation-triangle" />
      <polygon points="63,150 157,150 157,85 63,85" className="croquis-optimisation-rectangle" />
      <text x="110" y="138" className="croquis-optimisation-label">
        x
      </text>
      <text x="170" y="120" className="croquis-optimisation-label">
        y
      </text>
    </svg>
  );
}

/**
 * Famille T (`sommeDeuxCarres`), sous-skin `materiau` UNIQUEMENT (`sommeDeuxCarres.ts` : `pierre`
 * n'a pas de forme géométrique définie, jamais de croquis pour ce sous-skin) — un fil représenté par
 * une ligne coupée en 2 segments (x à gauche, y à droite — ordre narratif "le premier... le
 * second..."), chaque segment relié par une ligne pointillée à sa forme résultante réelle : carré
 * (périmètre x) et TRIANGLE RECTANGLE 3-4-5 (périmètre y, PAS un triangle équilatéral ni un cercle —
 * écart documenté du code par rapport à une proposition initiale de spec, voir
 * `sommeDeuxCarres.ts::construireMateriau`, tracé ici avec un repère d'angle droit pour rester fidèle
 * à la vraie forme générée).
 */
function CroquisSommeDeuxCarresMateriau() {
  return (
    <svg
      className="croquis-optimisation"
      viewBox="0 0 280 200"
      role="img"
      aria-label="Fil coupé en 2 segments x et y, pliés respectivement en carré (périmètre x) et en triangle rectangle (périmètre y)"
    >
      <line x1="25" y1="30" x2="136" y2="30" className="croquis-optimisation-fil" />
      <line x1="144" y1="30" x2="255" y2="30" className="croquis-optimisation-fil" />
      <line x1="25" y1="24" x2="25" y2="36" className="croquis-optimisation-tick" />
      <line x1="136" y1="24" x2="136" y2="36" className="croquis-optimisation-tick" />
      <line x1="144" y1="24" x2="144" y2="36" className="croquis-optimisation-tick" />
      <line x1="255" y1="24" x2="255" y2="36" className="croquis-optimisation-tick" />
      <text x="80" y="18" className="croquis-optimisation-label">
        x
      </text>
      <text x="200" y="18" className="croquis-optimisation-label">
        y
      </text>

      <line x1="80" y1="30" x2="80" y2="85" className="croquis-optimisation-connecteur" />
      <line x1="200" y1="30" x2="195" y2="110" className="croquis-optimisation-connecteur" />

      <polygon points="45,85 115,85 115,155 45,155" className="croquis-optimisation-carre" />
      <text x="80" y="172" className="croquis-optimisation-legende">
        périmètre x
      </text>

      <polygon points="165,155 225,155 165,110" className="croquis-optimisation-triangle-forme" />
      <polyline points="165,148 172,148 172,155" className="croquis-optimisation-angle-droit" />
      <text x="195" y="172" className="croquis-optimisation-legende">
        périmètre y
      </text>
    </svg>
  );
}

const COTES_MUR: Record<ConfigurationCloture, ("haut" | "bas" | "gauche" | "droite")[]> = {
  libre: [],
  mur: ["bas"],
  deuxMurs: ["bas", "gauche"],
};

const RECT = { gauche: 40, droite: 180, haut: 30, bas: 130 };

const LIGNE_COTE: Record<"haut" | "bas" | "gauche" | "droite", { x1: number; y1: number; x2: number; y2: number }> = {
  haut: { x1: RECT.gauche, y1: RECT.haut, x2: RECT.droite, y2: RECT.haut },
  bas: { x1: RECT.gauche, y1: RECT.bas, x2: RECT.droite, y2: RECT.bas },
  gauche: { x1: RECT.gauche, y1: RECT.haut, x2: RECT.gauche, y2: RECT.bas },
  droite: { x1: RECT.droite, y1: RECT.haut, x2: RECT.droite, y2: RECT.bas },
};

/** Bande hachurée du mur — déborde de 5 aux 2 extrémités pour un rendu "coin plein" aux jonctions,
 * même principe que la ligne pleine (`LIGNE_COTE`) mais épaissie en rectangle plutôt qu'un simple
 * trait, jamais la couleur seule pour distinguer un mur d'une clôture à construire. */
const BANDE_MUR: Record<"haut" | "bas" | "gauche" | "droite", { x: number; y: number; width: number; height: number }> = {
  haut: { x: RECT.gauche - 5, y: RECT.haut - 5, width: RECT.droite - RECT.gauche + 10, height: 10 },
  bas: { x: RECT.gauche - 5, y: RECT.bas - 5, width: RECT.droite - RECT.gauche + 10, height: 10 },
  gauche: { x: RECT.gauche - 5, y: RECT.haut - 5, width: 10, height: RECT.bas - RECT.haut + 10 },
  droite: { x: RECT.droite - 5, y: RECT.haut - 5, width: 10, height: RECT.bas - RECT.haut + 10 },
};

/**
 * Famille A (`aireEnclos`), mode `cloture` uniquement — le rectangle de l'enclos, avec les côtés à
 * clôturer (trait plein coloré) et le(s) mur(s) existant(s) (hachures + couleur différente, jamais
 * la couleur seule) visuellement distincts, pour la SEULE configuration réellement tirée (`libre` :
 * 4 côtés en clôture ; `mur` : 1 côté haché, 3 en clôture ; `deuxMurs` : 2 côtés adjacents hachés, 2
 * en clôture) — voir `core/optimisation.types.ts::ConfigurationCloture` pour pourquoi cette
 * information doit venir du générateur plutôt que d'être redéduite de `contrainte`/`domaine` seuls.
 * x annoté sur un côté vertical NON muré (largeur), y sur un côté horizontal NON muré (longueur) —
 * jamais sur un mur (donnée fixe, rien à isoler dessus).
 */
function CroquisAireEnclosCloture({ configuration }: { configuration: ConfigurationCloture }) {
  const patternId = useId();
  const cotesMur = COTES_MUR[configuration];
  const estMur = (cote: "haut" | "bas" | "gauche" | "droite") => cotesMur.includes(cote);

  const coteLabelX = estMur("gauche") ? "droite" : "gauche";
  const coteLabelY = estMur("haut") ? "bas" : "haut";
  const positionLabelX = coteLabelX === "gauche" ? { x: 22, y: 80 } : { x: 198, y: 80 };
  const positionLabelY = coteLabelY === "haut" ? { x: 110, y: 15 } : { x: 110, y: 148 };

  const cotes: ("haut" | "bas" | "gauche" | "droite")[] = ["haut", "bas", "gauche", "droite"];

  return (
    <svg
      className="croquis-optimisation"
      viewBox="0 0 220 170"
      role="img"
      aria-label={`Enclos rectangulaire, configuration "${configuration}" : côtés à clôturer en trait plein, mur(s) existant(s) hachuré(s) — largeur x, longueur y`}
    >
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" className="croquis-optimisation-hachure-trait" />
        </pattern>
      </defs>

      {cotes.map((cote) =>
        estMur(cote) ? (
          <rect key={cote} {...BANDE_MUR[cote]} fill={`url(#${patternId})`} className="croquis-optimisation-enclos-mur" />
        ) : (
          <line key={cote} {...LIGNE_COTE[cote]} className="croquis-optimisation-enclos-cloture" />
        ),
      )}

      <text x={positionLabelX.x} y={positionLabelX.y} className="croquis-optimisation-label">
        x
      </text>
      <text x={positionLabelY.x} y={positionLabelY.y} className="croquis-optimisation-label">
        y
      </text>
    </svg>
  );
}
