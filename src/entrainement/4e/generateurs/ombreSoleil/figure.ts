import type { ExerciceOmbreSoleil, Piquet } from "../../core/ombreSoleil.types";
import type { Point3D } from "../../core/geometrieEspace.types";
import { COULEURS_OMBRE, elementsConclusion, elementsScene, fusionner, meilleurDecalageEtiquette, solidePourAffichage, type ElementsCroquis } from "../../ui/formatOmbreSoleil";
import { calculerEchelleProjection, calculerGeometrieSolide3D, HAUTEUR_SVG, LARGEUR_SVG, projeter3DVersPixel } from "../../ui/solide3DSketch";

/**
 * Scène papier de gen41 — sans `docx` (importée par l'adaptateur ET par le corrigé détaillé, donc
 * par l'appli). Sortie de `exportEvaluation.ts` à la migration « comme au tableau ». Corrigé : en
 * plus de l'image de conclusion, les PIEDS des bâtons / sommets (A₀, E₀, K₀…) et les traces au sol
 * construites (d′, pointillés), pour que la figure porte les tracés du raisonnement.
 */

/** Pied d'un piquet (point du sol à sa verticale). */
export function piedPiquet(p: Piquet): Point3D {
  return { x: p.base.x, y: p.base.y, z: 0 };
}

/** Nom du pied d'un piquet : « A₀ ». */
export function nomPied(id: string): string {
  return `${id}₀`;
}

/** Pieds nommés et traces au sol construites (corrigé). */
function constructionCorrige(e: ExerciceOmbreSoleil): ElementsCroquis {
  const couleur = COULEURS_OMBRE.aide;
  const pieds: { id: string; pied: Point3D; trace?: Point3D }[] = [];
  if (e.variante === "simple") {
    pieds.push({ id: e.piquetExemple.id, pied: piedPiquet(e.piquetExemple) }, { id: e.piquet.piquet.id, pied: piedPiquet(e.piquet.piquet) });
  } else if (e.variante === "obstacle") {
    pieds.push({ id: e.piquetExemple.id, pied: piedPiquet(e.piquetExemple) }, { id: e.baton.id, pied: piedPiquet(e.baton), trace: e.ombreSansObstacle });
  } else {
    pieds.push({ id: e.piquetConnu.id, pied: piedPiquet(e.piquetConnu) }, ...e.piquets.map((p) => ({ id: p.piquet.id, pied: piedPiquet(p.piquet), trace: p.ombre })));
  }
  return {
    points: pieds.map((p) => ({ position: p.pied, label: nomPied(p.id), couleur })),
    segments: pieds.filter((p) => p.trace).map((p) => ({ a: p.pied, b: p.trace!, couleur, pointille: true })),
  };
}

const COULEUR_ARETE_VISIBLE = "#495057";
const COULEUR_ARETE_CACHEE = "#adb5bd";

/** Étiquettes des PIEDS (A₀, S₀…) posées là où elles touchent le moins de traits (audit 4e ch. 8 :
 * dans la variante « direction inconnue », S₀ et G₀ tombent dans l'emprise de la base et leurs
 * étiquettes chevauchaient les arêtes). Décalage en pixels choisi parmi 12 directions, le plus loin
 * possible de tout trait (arêtes du solide, traits annexes) et des autres points. */
function placerEtiquettesPieds(exercice: ExerciceOmbreSoleil, elements: ElementsCroquis): ElementsCroquis {
  const solide = solidePourAffichage(exercice);
  const geometrie = calculerGeometrieSolide3D(solide);
  const echelle = calculerEchelleProjection(solide);
  const px = (p: Point3D) => projeter3DVersPixel(p, echelle);
  const traits: [{ x: number; y: number }, { x: number; y: number }][] = [
    ...geometrie.aretes.map((a): [{ x: number; y: number }, { x: number; y: number }] => [geometrie.sommetsPixel[a.sommets[0]]!, geometrie.sommetsPixel[a.sommets[1]]!]),
    ...elements.segments.map((sg): [{ x: number; y: number }, { x: number; y: number }] => [px(sg.a), px(sg.b)]),
  ];
  const estPied = (label: string) => label.endsWith("₀");
  // Les autres points et leurs étiquettes (12 px au-dessus, rendu d'avant) sont à éviter.
  const autres = elements.points.filter((pt) => !estPied(pt.label)).flatMap((pt) => {
    const q = px(pt.position);
    return [q, { x: q.x, y: q.y - 12 }];
  });
  const posees: { x: number; y: number }[] = [];
  const points = elements.points.map((pt) => {
    if (!estPied(pt.label) || pt.decalageLabel) return pt;
    const p = px(pt.position);
    const autresPieds = elements.points.filter((q) => q !== pt && estPied(q.label)).map((q) => px(q.position));
    const choix = meilleurDecalageEtiquette([p], traits, [...autres, ...autresPieds], posees);
    posees.push({ x: p.x + choix.d.x, y: p.y + choix.d.y });
    return { ...pt, decalageLabel: choix.d };
  });
  return { points, segments: elements.segments };
}

/** Énoncé : la scène (sol, obstacles, exemple ou paire connue, bâton à résoudre) sans aucune ombre
 * à trouver ; correction : l'image de l'écran de conclusion (`elementsConclusion`). Les sommets à
 * projeter de la variante `directionInconnue` sont repérés par leur nom. */
function elementsFigure(exercice: ExerciceOmbreSoleil, avecOmbre: boolean): ElementsCroquis {
  if (avecOmbre) return placerEtiquettesPieds(exercice, fusionner(elementsConclusion(exercice), constructionCorrige(exercice)));
  if (exercice.variante !== "directionInconnue") return elementsScene(exercice);
  const reperes: ElementsCroquis = {
    points: exercice.piquets.map((p) => ({ position: { x: p.piquet.base.x, y: p.piquet.base.y, z: p.piquet.hauteur }, label: p.piquet.id, couleur: COULEUR_ARETE_VISIBLE })),
    segments: [],
  };
  return fusionner(elementsScene(exercice), reperes);
}

export function construireSvgOmbreSoleil(exercice: ExerciceOmbreSoleil, avecOmbre: boolean): string {
  const solide = solidePourAffichage(exercice);
  const geometrie = calculerGeometrieSolide3D(solide);
  const echelleProjection = calculerEchelleProjection(solide);
  const { points, segments } = elementsFigure(exercice, avecOmbre);

  const traits = geometrie.aretes
    .map((arete) => {
      const [n1, n2] = arete.sommets;
      const p1 = geometrie.sommetsPixel[n1];
      const p2 = geometrie.sommetsPixel[n2];
      const couleur = arete.visible ? COULEUR_ARETE_VISIBLE : COULEUR_ARETE_CACHEE;
      const pointille = arete.visible ? "" : ` stroke-dasharray="4 3"`;
      return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${couleur}" stroke-width="1.6"${pointille}/>`;
    })
    .join("");

  const traitsExtra = segments
    .map((s) => {
      const p1 = projeter3DVersPixel(s.a, echelleProjection);
      const p2 = projeter3DVersPixel(s.b, echelleProjection);
      const pointille = s.pointille ? ` stroke-dasharray="5 4"` : "";
      return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${s.couleur}" stroke-width="1.6"${pointille}/>`;
    })
    .join("");

  const pointsExtra = points
    .map((pt) => {
      const p = projeter3DVersPixel(pt.position, echelleProjection);
      // `rayon: 0` (étiquettes K, L, M des obstacles) : pas de disque ; `decalageLabel` : étiquette
      // CENTRÉE à ce décalage (comme à l'écran), sinon 8 px au-dessus du point (rendu d'avant).
      const rayon = pt.rayon ?? 3.5;
      const disque = rayon > 0 ? `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${rayon}" fill="${pt.couleur}"/>` : "";
      const texteSvg = pt.decalageLabel
        ? `<text x="${(p.x + pt.decalageLabel.x).toFixed(1)}" y="${(p.y + pt.decalageLabel.y).toFixed(1)}" font-size="13" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${pt.couleur}">${pt.label}</text>`
        : `<text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" font-size="13" font-weight="700" text-anchor="middle" fill="${pt.couleur}">${pt.label}</text>`;
      return disque + texteSvg;
    })
    .join("");

  const svg = `<svg width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" viewBox="0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Scène en perspective cavalière — ombre au soleil">
<rect x="0" y="0" width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" fill="#ffffff"/>
${traits}
${traitsExtra}
${pointsExtra}
</svg>`;

  // `page-break-inside`/`break-inside` évitent qu'une impression coupe la figure entre deux pages.
  return `<div style="text-align:center;margin:0.6em 0;page-break-inside:avoid;break-inside:avoid;">${svg}</div>`;
}

