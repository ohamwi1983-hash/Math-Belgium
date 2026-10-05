import type { ExerciceCaracteristiquesFonction } from "../core/caracteristiquesFonction.types";
import { evaluerCourbeCaracteristiques, valeurHyperboleEnB5, valeurNaturelleEnB5 } from "../moteur/verificationCaracteristiquesFonction";
import { RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN, calculerPasGrille, formatEtiquetteGrille, xBordVisibleY } from "./mafsTransformation";
import { MARGE_DROITE_VISIBLE, MARGE_GAUCHE_VISIBLE } from "../generateurs/caracteristiquesFonction";

export { RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN, calculerPasGrille, formatEtiquetteGrille };

export interface SegmentTrace {
  domaine: [number, number];
}

/**
 * Refonte point 4 : remplace le rendu SVG statique (ancien src/ui/courbeCaracteristiquesFonction.ts,
 * supprimé) par un graphe Mafs — zoom/pan et grille adaptative façon GeoGebra, cohérent avec
 * l'expérience des autres générateurs du chapitre. Réutilise telles quelles les briques purement
 * géométriques de `mafsTransformation.ts` (RATIO_GRAPHE, ZOOM_MIN/MAX, calculerPasGrille,
 * formatEtiquetteGrille) et le domaine visible partagé avec le générateur
 * (MARGE_GAUCHE_VISIBLE/MARGE_DROITE_VISIBLE, src/generateurs/caracteristiquesFonction/index.ts)
 * — jamais deux constantes de marge indépendantes qui pourraient diverger entre génération et
 * tracé.
 *
 * Un segment `Plot.OfX` PAR ZONE CONTINUE, jamais un seul segment couvrant plusieurs exclusions de
 * domaine à la fois (refonte 2, correction du symptôme A) : Mafs (`Plot.OfX`/`sampleParametric`,
 * `minSamplingDepth`/`maxSamplingDepth`) ne casse JAMAIS le tracé SVG aux échantillons NaN — il les
 * saute silencieusement (`onPoint` ignore l'échantillon, sans jamais insérer de commande `M` de
 * rupture de tracé) et relie les deux points valides voisins par une ligne droite. Un seul segment
 * couvrant les zones 1 à 5 (ancienne implémentation) reliait donc silencieusement les deux bords
 * d'un trou/gap par une ligne droite — invisible à l'œil quand la zone est constante (zone 4),
 * exactement le symptôme observé (f(0)=4 affiché en continu alors que x=0 est dans un gap exclu du
 * domaine). Chaque coupure de domaine (le point creux `c`, chaque bord `g1`/`g2` de chaque gap de
 * zone 4) devient donc sa propre frontière de segment — le tracé s'arrête réellement là où le
 * domaine s'arrête, jamais relié par-dessus visuellement. Les deux branches de la partie
 * hyperbolique (zone 6, zone 7) restent chacune arrêtées à une petite marge de l'asymptote
 * verticale pour ne jamais échantillonner le pôle lui-même — même principe que le "BUFFER_POLE" de
 * la famille `inverse` (mafsFonctionsReference.ts).
 *
 * PIÈGE RENCONTRÉ ET CORRIGÉ (segment de discontinuité faussement plein) : le segment "zones 1-5"
 * s'arrêtait auparavant exactement À `exercice.b5` (borne incluse) — or `evaluerCourbeCaracteristiques`
 * évalue délibérément la branche HYPERBOLIQUE (pas la zone 5) exactement en x=b5 (c'est précisément
 * ce qui donne sa valeur au point plein). Mafs échantillonne donc ce dernier point du segment
 * "zones 1-5" en utilisant cette même valeur hyperbolique plutôt que la valeur naturelle de la
 * zone 5 — traçant, à l'intérieur de ce seul `Plot.OfX`, un bond quasi vertical PLEIN de la valeur
 * naturelle (cercle vide) jusqu'à la valeur réelle (cercle plein), qui se superposait exactement au
 * segment pointillé dédié à cette discontinuité (`MafsGraphCaracteristiquesFonction.tsx`) et le
 * masquait visuellement — confirmé empiriquement (élément `<path>` plein occupant systématiquement
 * le même pixel que le `<line>` en pointillé, à chaque point échantillonné le long du segment,
 * avant tout correctif). Corrigé en arrêtant ce segment juste AVANT b5 (petite marge, même principe
 * que epsilonGauche/epsilonDroite autour d'AV) — jamais exactement sur b5, qui reste la frontière
 * exclusive de la zone 6.
 *
 * MÊME PIÈGE, CÔTÉ ZONE 6 CETTE FOIS (3 cas possibles pour la discontinuité) : le segment "zone 6"
 * démarrait auparavant exactement À `exercice.b5` — inoffensif pour "pointPlein" (la valeur y est
 * la vraie valeur hyperbolique, cohérente avec le point plein affiché) et pour "trou" (NaN, sauté
 * silencieusement par Mafs, sans artefact). Mais pour "pointRedefini", `evaluerCourbeCaracteristiques`
 * y renvoie la valeur du point ISOLÉ (délibérément différente de la valeur hyperbolique naturelle) —
 * Mafs tracerait alors un bond plein de ce point isolé vers la courbe de la zone 6, suggérant à tort
 * qu'il en fait partie. Corrigé symétriquement : ce segment démarre désormais juste APRÈS b5, jamais
 * exactement dessus.
 *
 * **`visible`, fenêtre RÉACTIVE au zoom/pan** (`promptauditcourbesmafszoom.md`) — au lieu des
 * anciens bords fixes `b1-MARGE_GAUCHE_VISIBLE`/`AV+MARGE_DROITE_VISIBLE` (calculés une seule fois à
 * la génération), reçoit la fenêtre visible COURANTE (voir `ui/mafsTransformation.ts::domaineVisibleX`)
 * et l'utilise pour les deux bords SANS signification mathématique (à gauche de `b1` : extrapolation
 * affine, continue à l'infini ; à droite de l'AV : la branche hyperbolique continue indéfiniment vers
 * l'asymptote horizontale `L`). Les frontières d'exclusion RÉELLES (le point creux `c`, chaque gap
 * `g1`/`g2`, `b5`, `AV`) restent, elles, calculées EXACTEMENT comme avant (`evaluerCourbeCaracteristiques`
 * y renvoie `NaN` — jamais franchies). Un segment dont la borne visible tombe DEDANS ou AU-DELÀ d'une
 * frontière d'exclusion (zoom avancé à l'intérieur d'une zone restreinte) est simplement omis plutôt
 * que poussé inversé.
 *
 * **`visibleY`, prolongement en Y près de l'AV** (`promptauditcourbesmafszoomy.md`, addendum) — les
 * deux bords adjacents à l'AV (fin de zone 6, début de zone 7) n'utilisent plus une marge fixe
 * (`epsilonZone6`) pour s'arrêter près de l'asymptote : `epsilonZone6` restait pertinente pour éviter
 * d'échantillonner le pôle lui-même, mais à un zoom suffisamment poussé sur cette région, cette
 * distance ABSOLUE laissait la branche s'arrêter à un y bien en-deçà du bord du cadre (voire un
 * segment vide). `xBordVisibleY` (`ui/mafsTransformation.ts`) retrouve à la place, par bissection, le
 * point où chaque branche atteint réellement le bord visible en y. Seul le bord AV est concerné — le
 * bord `b5` (fin de zone 6, un simple SAUT FINI, jamais une asymptote) reste calculé exactement comme
 * avant (`epsilonB5`).
 */
export function calculerSegmentsCaracteristiquesVisibles(
  exercice: ExerciceCaracteristiquesFonction,
  visible: [number, number],
  visibleY: [number, number],
): SegmentTrace[] {
  const [visMin, visMax] = visible;
  const epsilonB5 = (exercice.b5 - exercice.b4) / 40;
  const epsilonZone6 = (exercice.AV - exercice.b5) / 40;
  const evaluer = (x: number) => evaluerCourbeCaracteristiques(exercice, x);

  const exclusions = [
    { debut: exercice.c, fin: exercice.c },
    ...exercice.gaps.map((g) => ({ debut: g.g1, fin: g.g2 })),
  ].sort((a, b) => a.debut - b.debut);

  const segments: SegmentTrace[] = [];
  let debut = visMin;
  for (const exclusion of exclusions) {
    if (debut < exclusion.debut) segments.push({ domaine: [debut, exclusion.debut] });
    debut = Math.max(debut, exclusion.fin);
  }
  if (debut < exercice.b5 - epsilonB5) segments.push({ domaine: [debut, exercice.b5 - epsilonB5] });

  if (exercice.b5 + epsilonZone6 < exercice.AV - epsilonZone6) {
    const finZone6 = xBordVisibleY(evaluer, exercice.AV, exercice.b5 + epsilonZone6, visibleY);
    if (exercice.b5 + epsilonZone6 < finZone6) {
      segments.push({ domaine: [exercice.b5 + epsilonZone6, finZone6] });
    }
  }

  if (visMax > exercice.AV) {
    const debutZone7 = xBordVisibleY(evaluer, exercice.AV, visMax, visibleY);
    if (debutZone7 < visMax) {
      segments.push({ domaine: [debutZone7, visMax] });
    }
  }

  return segments;
}

/** Valeurs de référence FINIES pour cadrer le graphe — jamais un échantillonnage dense de la
 * branche hyperbolique tout près d'AV (qui exploserait le viewBox), même principe que l'ancien
 * rendu SVG statique. Utilise `valeurHyperboleEnB5` (jamais `evaluerCourbeCaracteristiques(ex,b5)`
 * directement) pour rester finie même au cas "trou" (qui vaudrait NaN à cette abscisse et
 * empoisonnerait tout le calcul de min/max) ; ajoute la valeur du point isolé du cas
 * "pointRedefini" pour qu'il reste toujours dans le cadrage. */
function valeursReferenceY(exercice: ExerciceCaracteristiquesFonction): number[] {
  const gNaturel = valeurHyperboleEnB5(exercice);
  const gLoin = evaluerCourbeCaracteristiques(exercice, exercice.AV + MARGE_DROITE_VISIBLE);
  const valeurs = [0, exercice.y1, exercice.y2, exercice.y3, exercice.valeurNaturelleC, valeurNaturelleEnB5(exercice), exercice.L, gNaturel, gLoin];
  if (exercice.discontinuite.type === "pointRedefini") valeurs.push(exercice.discontinuite.valeur);
  return valeurs;
}

export interface ViewBoxCaracteristiques {
  x: [number, number];
  y: [number, number];
}

/** Réplique la formule interne de Mafs pour ajuster une zone à un ratio donné — dupliquée plutôt
 * que réexportée depuis mafsTransformation.ts, même principe que mafsFonctionsReference.ts (ne
 * jamais risquer de régression sur les consommateurs existants d'un si petit utilitaire pur). */
function ajusterAuRatio(x: [number, number], y: [number, number], ratio: number): ViewBoxCaracteristiques {
  const largeurZone = x[1] - x[0];
  const hauteurZone = y[1] - y[0];
  const ratioZone = largeurZone / hauteurZone;

  if (ratioZone > ratio) {
    const centreY = (y[0] + y[1]) / 2;
    const demiHauteur = largeurZone / ratio / 2;
    return { x, y: [centreY - demiHauteur, centreY + demiHauteur] };
  }

  const centreX = (x[0] + x[1]) / 2;
  const demiLargeur = (hauteurZone * ratio) / 2;
  return { x: [centreX - demiLargeur, centreX + demiLargeur], y };
}

export function calculerViewBoxCaracteristiques(exercice: ExerciceCaracteristiquesFonction): ViewBoxCaracteristiques {
  const xMin = exercice.b1 - MARGE_GAUCHE_VISIBLE;
  const xMax = exercice.AV + MARGE_DROITE_VISIBLE;
  const ys = valeursReferenceY(exercice);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const margeY = Math.max(1, (yMax - yMin) * 0.15);

  return ajusterAuRatio([xMin, xMax], [yMin - margeY, yMax + margeY], RATIO_GRAPHE);
}

/** y = f(x), NaN hors domaine — délègue entièrement à evaluerCourbeCaracteristiques (moteur),
 * jamais de logique dupliquée entre vérification et rendu. */
export function evaluerPourGraphe(exercice: ExerciceCaracteristiquesFonction, x: number): number {
  return evaluerCourbeCaracteristiques(exercice, x);
}

/**
 * Points PLEINS aux 2 bornes (g1 ET g2) de CHAQUE gap de la zone 4 (`promptcorrectionsgen17gen12gen21.md`,
 * point 4) — un gap `]g1,g2[` exclut son INTÉRIEUR strict du domaine, mais ses bornes elles-mêmes y
 * restent (`evaluerCourbeCaracteristiques` ne renvoie NaN que pour `x>gap.g1 && x<gap.g2`, jamais
 * pour `x===gap.g1`/`x===gap.g2`) — un simple arrêt du tracé à ces bornes, sans marqueur, laisse
 * ambigu si elles appartiennent ou non au domaine. Générique : s'applique à N gaps (0 à 2 selon le
 * générateur), jamais un correctif isolé pour un seul tirage. Valeur toujours réévaluée via
 * `evaluerPourGraphe` (jamais supposée `=y3` en dur) — seule source de vérité partagée avec la
 * vérification, même principe que le reste de ce module. */
export function pointsPleinsGaps(exercice: ExerciceCaracteristiquesFonction): { x: number; y: number }[] {
  return exercice.gaps.flatMap((gap) => [
    { x: gap.g1, y: evaluerPourGraphe(exercice, gap.g1) },
    { x: gap.g2, y: evaluerPourGraphe(exercice, gap.g2) },
  ]);
}
