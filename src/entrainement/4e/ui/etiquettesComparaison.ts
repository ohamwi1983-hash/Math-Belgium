import type { Point } from "../core/vecteur.types";
import type { VecteurAffiche, ViewBoxTransformation } from "./vecteurGraph";

/**
 * Placement des étiquettes « flèche + lettre » des vecteurs de gen28 (comparaison visuelle), à
 * l'écran ET sur papier (retouche 4e ch. 6, décision de l'utilisateur : une étiquette loin de son
 * vecteur dans une figure dense se lisait comme celle d'un voisin).
 *
 * Tout se calcule en PIXELS, avec la vraie taille de l'étiquette dessinée (police, petite flèche
 * au-dessus de la lettre, largeur de la lettre) : l'ancien placement réservait une boîte en fraction
 * de la fenêtre, trop grande sur papier et sur un grand écran (conflits partout, étiquettes repoussées
 * loin), trop petite sur un écran étroit.
 *
 * Pour chaque vecteur, on essaie des ancrages près de SON milieu (puis plus loin le long du vecteur,
 * des deux côtés de la normale), la boîte collée au trait à un écart croissant mais BORNÉ. Un ancrage
 * est admis seulement si sa boîte ne touche aucun vecteur (trait, tête de flèche, extrémités, le sien
 * compris), aucune autre étiquette, reste dans le cadre, et si son centre est nettement plus proche de
 * son vecteur que de tout autre. Recherche avec retour arrière (étiquettes les plus contraintes
 * d'abord, ancrages du plus proche au plus lointain), budget fixe ; à défaut, le moins mauvais ancrage
 * (pénalités). Déterministe : un même exercice donne toujours la même figure.
 */

/** Taille réelle de l'étiquette dessinée, en pixels (mêmes valeurs que le tracé). */
export interface GabaritEtiquette {
  /** Taille de la zone tracée qui correspond exactement à la fenêtre (`viewBox`), en pixels. */
  largeurPx: number;
  hauteurPx: number;
  police: number;
  largeurFleche: number;
  espaceFleche: number;
  /** Demi-hauteur de la pointe de la petite flèche. */
  demiTete: number;
}

/** Étiquette du graphe Mafs (`components/VecteurGraph.tsx` : `TAILLE_POLICE_BASE`, `LARGEUR_FLECHE_PX`,
 * `ESPACE_FLECHE_LETTRE_PX`, `TAILLE_TETE_FLECHE_PX`) — la taille de la zone est fournie par l'appelant. */
export const ETIQUETTE_ECRAN = { police: 22, largeurFleche: 12, espaceFleche: 3, demiTete: 4 } as const;
/** Étiquette de la figure papier (`generateurs/comparaisonVecteurs/figure.ts`). */
export const ETIQUETTE_PAPIER = { police: 15, largeurFleche: 11, espaceFleche: 2, demiTete: 3 } as const;

/** Largeur des minuscules (fraction de la police, métriques Helvetica, majorées de 8 % pour la police
 * du site) ; lettres à jambage descendant. */
const LARGEUR_LETTRE: Record<string, number> = {
  a: 0.556, b: 0.556, c: 0.5, d: 0.556, e: 0.556, f: 0.278, g: 0.556, h: 0.556, i: 0.222, j: 0.222, k: 0.5, l: 0.222, m: 0.833,
  n: 0.556, o: 0.556, p: 0.556, q: 0.556, r: 0.333, s: 0.5, t: 0.278, u: 0.556, v: 0.5, w: 0.722, x: 0.5, y: 0.5, z: 0.5,
};
const MAJORATION_LARGEUR = 1.08;
const JAMBAGE = new Set(["g", "j", "p", "q", "y"]);
const RATIO_HAUTEUR_MAJUSCULE = 0.72;
const RATIO_JAMBAGE = 0.22;

/** Marges (px) : autour de la boîte, autour du trait (demi-épaisseur comprise), entre étiquettes. */
const MARGE_TRAIT = 2.5;
const MARGE_ETIQUETTES = 2;
/** Écarts essayés entre le bord de la boîte et le trait de son vecteur (px) : du plus proche au plus
 * loin, borné (au-delà, l'étiquette ne se lit plus comme celle de ce vecteur). */
const ECART_MIN = 3;
const PAS_ECART = 3;
const ECARTS = 8;
/** Positions le long du vecteur (fraction de sa longueur), du milieu vers les extrémités. */
const FRACTIONS = [0.5, 0.42, 0.58, 0.34, 0.66, 0.26, 0.74, 0.18, 0.82, 0.1, 0.9];
/** Le centre de l'étiquette doit être plus proche de son vecteur que de tout autre, avec cette marge. */
const RAPPORT_PROPRE = 1.2;
const MARGE_PROPRE_PX = 4;
const BUDGET_RECHERCHE = 20000;

interface Px {
  x: number;
  y: number;
}
interface Boite {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}
interface Segment {
  a: Px;
  b: Px;
  /** Base de la tête de flèche (la tête est un triangle plein de demi-largeur `demiTete`). */
  base: Px;
  demiTete: number;
}
interface Candidat {
  ancrage: Px;
  boite: Boite;
  cout: number;
  /** Pénalité statique (vecteurs, cadre, plus proche d'un autre vecteur) — 0 si admis. */
  penalite: number;
}

/** Boîte de l'étiquette autour de son ancrage (px) : largeur centrée, hauteur au-dessus de la ligne
 * de base (lettre + petite flèche), jambage au-dessous. */
export function tailleEtiquette(
  lettre: string,
  gabarit: Pick<GabaritEtiquette, "police" | "largeurFleche" | "espaceFleche" | "demiTete">,
): { largeur: number; dessus: number; dessous: number } {
  return {
    largeur: Math.max(gabarit.largeurFleche, (LARGEUR_LETTRE[lettre] ?? 0.6) * MAJORATION_LARGEUR * gabarit.police),
    dessus: gabarit.police * RATIO_HAUTEUR_MAJUSCULE + gabarit.espaceFleche + gabarit.demiTete,
    dessous: JAMBAGE.has(lettre) ? gabarit.police * RATIO_JAMBAGE : 0,
  };
}

function distancePointSegment(p: Px, a: Px, b: Px): number {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const l2 = abx * abx + aby * aby;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / l2));
  return Math.hypot(p.x - a.x - t * abx, p.y - a.y - t * aby);
}

function distancePointBoite(p: Px, b: Boite): number {
  return Math.hypot(Math.max(b.x0 - p.x, 0, p.x - b.x1), Math.max(b.y0 - p.y, 0, p.y - b.y1));
}

function segmentsSeCoupent(a: Px, b: Px, c: Px, d: Px): boolean {
  const cote = (p: Px, q: Px, r: Px) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
  return cote(a, b, c) * cote(a, b, d) < 0 && cote(c, d, a) * cote(c, d, b) < 0;
}

/** Distance exacte entre un segment et un rectangle (0 s'ils se touchent). */
function distanceSegmentBoite(a: Px, b: Px, bo: Boite): number {
  const dedans = (p: Px) => p.x >= bo.x0 && p.x <= bo.x1 && p.y >= bo.y0 && p.y <= bo.y1;
  if (dedans(a) || dedans(b)) return 0;
  const coins: Px[] = [
    { x: bo.x0, y: bo.y0 },
    { x: bo.x1, y: bo.y0 },
    { x: bo.x1, y: bo.y1 },
    { x: bo.x0, y: bo.y1 },
  ];
  for (let i = 0; i < 4; i++) if (segmentsSeCoupent(a, b, coins[i], coins[(i + 1) % 4])) return 0;
  return Math.min(distancePointBoite(a, bo), distancePointBoite(b, bo), ...coins.map((c) => distancePointSegment(c, a, b)));
}

function boitesSeTouchent(p: Boite, q: Boite, marge: number): boolean {
  return p.x0 - marge < q.x1 && q.x0 - marge < p.x1 && p.y0 - marge < q.y1 && q.y0 - marge < p.y1;
}

/** Le vecteur (trait, tête de flèche, extrémités) touche-t-il la boîte ? */
function vecteurToucheBoite(s: Segment, bo: Boite): boolean {
  return distanceSegmentBoite(s.a, s.b, bo) < MARGE_TRAIT || distanceSegmentBoite(s.base, s.b, bo) < s.demiTete + MARGE_TRAIT;
}

/**
 * Ancrages (coordonnées réelles, ligne de base de la lettre centrée — convention de
 * `VecteurGraph.tsx::LabelVecteurFleche` et de `figure.ts::labelVecteurFlecheSvg`), un par vecteur,
 * dans l'ordre de `vecteurs`. `lettres[i]` : lettre de l'étiquette du vecteur i. `teteUnites` : longueur
 * de la tête de flèche des vecteurs, en unités du quadrillage.
 */
export function placerEtiquettesComparaison(
  vecteurs: VecteurAffiche[],
  lettres: string[],
  viewBox: ViewBoxTransformation,
  gabarit: GabaritEtiquette,
  teteUnites: number,
): Point[] {
  const ex = gabarit.largeurPx / (viewBox.x[1] - viewBox.x[0]);
  const ey = gabarit.hauteurPx / (viewBox.y[1] - viewBox.y[0]);
  const versPx = (p: Point): Px => ({ x: (p.x - viewBox.x[0]) * ex, y: (viewBox.y[1] - p.y) * ey });
  const versReel = (p: Px): Point => ({ x: viewBox.x[0] + p.x / ex, y: viewBox.y[1] - p.y / ey });

  const segments: Segment[] = vecteurs.map((v) => {
    const a = versPx(v.origine);
    const b = versPx({ x: v.origine.x + v.vecteur.x, y: v.origine.y + v.vecteur.y });
    const longueur = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const tete = Math.min(teteUnites * Math.min(ex, ey), longueur * 0.45);
    return { a, b, base: { x: b.x - ((b.x - a.x) / longueur) * tete, y: b.y - ((b.y - a.y) / longueur) * tete }, demiTete: tete / 2 };
  });
  const cadre: Boite = { x0: 0, x1: gabarit.largeurPx, y0: 0, y1: gabarit.hauteurPx };

  const candidatsParVecteur: Candidat[][] = segments.map((s, i) => {
    const lettre = lettres[i] ?? "";
    const { largeur, dessus, dessous } = tailleEtiquette(lettre, gabarit);
    const hauteur = dessus + dessous;
    const dx = s.b.x - s.a.x;
    const dy = s.b.y - s.a.y;
    const longueur = Math.hypot(dx, dy) || 1;
    // Demi-épaisseur de la boîte dans la direction de la normale : le bord de la boîte est alors
    // exactement à `ecart` du trait.
    const normale = { x: -dy / longueur, y: dx / longueur };
    const support = (Math.abs(normale.x) * largeur) / 2 + (Math.abs(normale.y) * hauteur) / 2;
    const liste: Candidat[] = [];
    /** Évalue la boîte centrée en `centre` ; `eloignementMilieu` (0 au milieu, 0,5 à une extrémité,
     * plus au-delà) départage deux ancrages à même distance du trait. */
    const ajouter = (centre: Px, eloignementMilieu: number, dessousDuTrait: boolean) => {
      const boite: Boite = { x0: centre.x - largeur / 2, x1: centre.x + largeur / 2, y0: centre.y - hauteur / 2, y1: centre.y + hauteur / 2 };
      let penalite = 0;
      segments.forEach((autre) => {
        if (vecteurToucheBoite(autre, boite)) penalite += 100;
      });
      if (boite.x0 < cadre.x0 || boite.x1 > cadre.x1 || boite.y0 < cadre.y0 || boite.y1 > cadre.y1) penalite += 100;
      const dPropre = distancePointSegment(centre, s.a, s.b);
      let dAutre = Infinity;
      segments.forEach((autre, j) => {
        if (j !== i) dAutre = Math.min(dAutre, distancePointSegment(centre, autre.a, autre.b));
      });
      if (dAutre < dPropre * RAPPORT_PROPRE + MARGE_PROPRE_PX) penalite += dAutre <= dPropre ? 60 : 30;
      // Coût : distance au vecteur, puis éloignement du milieu ; léger avantage au côté « dessus ».
      const cout = dPropre + eloignementMilieu * Math.min(longueur, 80) * 0.5 + (dessousDuTrait ? 1 : 0);
      liste.push({ ancrage: { x: centre.x, y: boite.y0 + dessus }, boite, cout, penalite });
    };
    const direction = { x: dx / longueur, y: dy / longueur };
    for (let e = 0; e < ECARTS; e++) {
      const ecart = ECART_MIN + e * PAS_ECART + MARGE_TRAIT;
      // Le long du vecteur, de part et d'autre (côté gauche / droit selon la normale).
      for (const fraction of FRACTIONS) {
        for (const cote of [1, -1]) {
          const centre = {
            x: s.a.x + dx * fraction + normale.x * cote * (ecart + support),
            y: s.a.y + dy * fraction + normale.y * cote * (ecart + support),
          };
          ajouter(centre, Math.abs(fraction - 0.5), centre.y > s.a.y + dy * fraction);
        }
      }
      // Au-delà des extrémités (dans le prolongement, ou en biais à 45°) : seule place libre quand
      // un vecteur court est serré entre deux voisins parallèles.
      for (const [extremite, sortant, marge] of [
        [s.b, direction, s.demiTete],
        [s.a, { x: -direction.x, y: -direction.y }, 0],
      ] as const) {
        for (const angle of [0, Math.PI / 4, -Math.PI / 4]) {
          const c = Math.cos(angle);
          const sn = Math.sin(angle);
          const dir = { x: sortant.x * c - sortant.y * sn, y: sortant.x * sn + sortant.y * c };
          const appui = (Math.abs(dir.x) * largeur) / 2 + (Math.abs(dir.y) * hauteur) / 2;
          const centre = { x: extremite.x + dir.x * (ecart + marge + appui), y: extremite.y + dir.y * (ecart + marge + appui) };
          ajouter(centre, 0.6, centre.y > extremite.y);
        }
      }
    }
    return liste.sort((p, q) => p.penalite - q.penalite || p.cout - q.cout);
  });

  // Recherche avec retour arrière sur les ancrages admis, étiquettes les plus contraintes d'abord.
  // Un vecteur sans aucun ancrage admis (figure très dense) garde ses ancrages les moins pénalisés :
  // il ne bloque pas la recherche des autres.
  const admis = candidatsParVecteur.map((l) => l.filter((c) => c.penalite === l[0].penalite));
  const ordre = vecteurs
    .map((_, i) => i)
    .sort((p, q) => candidatsParVecteur[q][0].penalite - candidatsParVecteur[p][0].penalite || admis[p].length - admis[q].length || p - q);
  const choix: (Candidat | null)[] = vecteurs.map(() => null);
  let budget = BUDGET_RECHERCHE;
  const chercher = (k: number): boolean => {
    if (k === ordre.length) return true;
    const i = ordre[k];
    for (const c of admis[i]) {
      if (--budget < 0) return false;
      if (choix.some((d) => d && boitesSeTouchent(d.boite, c.boite, MARGE_ETIQUETTES))) continue;
      choix[i] = c;
      if (chercher(k + 1)) return true;
      choix[i] = null;
    }
    return false;
  };

  if (!chercher(0)) {
    // Repli glouton : le moins mauvais ancrage (pénalités statiques + chevauchement d'étiquettes).
    choix.fill(null);
    for (const i of ordre) {
      let meilleur: Candidat | null = null;
      let meilleurScore = Infinity;
      for (const c of candidatsParVecteur[i]) {
        const chevauche = choix.some((d) => d && boitesSeTouchent(d.boite, c.boite, MARGE_ETIQUETTES));
        const score = c.penalite + (chevauche ? 100 : 0) + c.cout;
        if (score < meilleurScore) {
          meilleurScore = score;
          meilleur = c;
        }
      }
      choix[i] = meilleur;
    }
  }
  return choix.map((c) => versReel(c!.ancrage));
}
