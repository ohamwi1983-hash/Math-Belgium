import type { Point3D, Solide3D } from "./geometrieEspace.types";

/**
 * Contrat de gen135 « Réalité ou illusion ? » (4e, chapitre 8, § 6 « Positions de trois plans »,
 * processus 3 TRANSFÉRER ; d'après l'exercice 1 du manuel, fig. 35). Un solide ABCDEF — base ABC,
 * dessus DEF, arêtes latérales [AD], [BE], [CF] — est dessiné en perspective cavalière ; ses faces
 * sont supposées planes : peut-il exister ?
 *
 * Justification (théorème du § 6) : les trois faces latérales ABED, BCFE et ACFD sont sécantes deux à
 * deux suivant (AD), (BE), (CF) ; ces trois droites devraient être concourantes ou parallèles. La
 * perspective cavalière (projection parallèle) conserve le parallélisme et le point commun de deux
 * droites : le DESSIN suffit pour conclure, en prolongeant les arêtes latérales.
 *
 * - `tronc` : dessin d'un tronc de pyramide (arêtes latérales qui convergent) ; s'il existe, les trois
 *   droites passent par un même point S ; sinon l'une d'elles passe nettement à côté.
 * - `prisme` : dessin d'un prisme coupé par un plan oblique (arêtes latérales verticales) ; s'il
 *   existe, les trois droites sont parallèles ; sinon l'une d'elles est penchée.
 *
 * Le verdict (`existe` / `impossible`) est tiré à parts égales AVANT le dessin ; il n'est jamais dans
 * la `forme` du profil (= la variante). Coordonnées internes jamais montrées.
 */

export type VarianteRealiteIllusion = "tronc" | "prisme";
export type VerdictRealiteIllusion = "existe" | "impossible";
/** Position, SUR LE DESSIN, des trois arêtes latérales prolongées. */
export type DispositionRealiteIllusion = "concourantes" | "paralleles" | "aucune";

/** Point du DESSIN (sa projection cavalière est le point dessiné : y = 0, x et z = coordonnées du dessin). */
export interface PointDessinRealite {
  nom: string;
  position: Point3D;
}

export interface ExerciceRealiteIllusion {
  variante: VarianteRealiteIllusion;
  verdict: VerdictRealiteIllusion;
  disposition: DispositionRealiteIllusion;
  /** Côté où les arêtes latérales se prolongent jusqu'à leurs points de rencontre (au-dessus du dessus
   * DEF, ou en dessous de la base ABC). */
  sens: "haut" | "bas";
  /** Solide dessiné (sommets A–F, faces ABC, DEF, ABED, BCFE, ACFD). Impossible : une face latérale
   * ou deux ne sont pas planes dans ce modèle — c'est justement ce que le dessin trahit. */
  solide: Solide3D;
  /** Arête latérale « déplacée » (0 : [AD], 1 : [BE], 2 : [CF]) quand le solide est impossible. */
  areteDeplacee: number | null;
  /** Points de rencontre, sur le dessin, des arêtes latérales prolongées : S (concourantes) ; I, J, K
   * (tronc impossible : I rencontre des deux autres, J et K sur l'arête déplacée) ; J, K (prisme
   * impossible) ; aucun (parallèles). */
  points: PointDessinRealite[];
  /** Prolongements dessinés après l'écran 2 (une par arête latérale, sur le dessin), extrémités aussi
   * comprises dans le cadre dès l'énoncé (la figure ne saute pas). */
  prolongements: [Point3D, Point3D][];
  /** Ordre d'affichage des options des écrans 1 et 3 (tiré une fois : `?code=` reproductible). */
  ordre1: number[];
  ordre3: number[];
}
