import type { CatalogueVarianteEntree } from "../../../export/genererFeuilleExercices";
import type { ExerciceCercleConditions, VarianteCercleConditions } from "../../core/cercleConditions.types";
import { choisir, droiteDirectrice, droiteNormale, entier, intersection, milieu, pgcd, signe, vecteur, type Droite, type Pt } from "../../ui/geometrieLotG";

/**
 * Générateur de gen93 « Déterminer un cercle par des conditions » (4e, ch. 7, § 8). Tout le hasard
 * passe par `Math.random` (`?code=`). Construit à rebours : centre Ω entier, r² somme de deux carrés,
 * points du cercle à coordonnées entières (Ω + un vecteur entier de norme r²) — centre et r² entiers,
 * médiatrices à coefficients entiers (le milieu peut être à coordonnées demi-entières).
 * - `diametre` : A, B diamétralement opposés ; centre = milieu, r = AB/2.
 * - `trois-points` : A, B, C ; médiatrices de [AB] et [BC], centre = leur intersection.
 * - `centre-sur-droite` : A, B et une droite d par Ω (non parallèle à la médiatrice de [AB]) ;
 *   centre = d ∩ médiatrice de [AB].
 */

export const CATALOGUE_VARIANTES: CatalogueVarianteEntree[] = [
  { id: "diametre", label: "Cercle de diamètre [AB]" },
  { id: "trois-points", label: "Cercle passant par trois points (médiatrices)" },
  { id: "centre-sur-droite", label: "Cercle passant par A et B, centre sur une droite" },
];

const R2 = [5, 10, 13, 17, 20, 25, 26, 29, 34, 37, 40, 41, 45, 50];

/** Vecteurs entiers de norme r² (aucune composante nulle sauf r² carré parfait). */
function vecteursNorme(r2: number): Pt[] {
  const out: Pt[] = [];
  const m = Math.floor(Math.sqrt(r2));
  for (let x = -m; x <= m; x++)
    for (let y = -m; y <= m; y++) if (x * x + y * y === r2) out.push({ x, y });
  return out;
}

const ajoute = (p: Pt, v: Pt): Pt => ({ x: p.x + v.x, y: p.y + v.y });
const dansCadre = (...ps: Pt[]) => ps.every((p) => Math.abs(p.x) <= 9 && Math.abs(p.y) <= 9);

export function mediatrice(a: Pt, b: Pt): Droite {
  return droiteNormale(milieu(a, b), vecteur(a, b));
}

export function construireAvecVariante(id: string): ExerciceCercleConditions {
  const variante = (CATALOGUE_VARIANTES.some((c) => c.id === id) ? id : choisir(CATALOGUE_VARIANTES).id) as VarianteCercleConditions;
  for (;;) {
    const centre = { x: entier(-4, 4), y: entier(-4, 4) };
    const r2 = choisir(R2);
    const vs = vecteursNorme(r2);
    if (variante === "diametre") {
      const u = choisir(vs);
      const a = ajoute(centre, { x: -u.x, y: -u.y });
      const b = ajoute(centre, u);
      if (!dansCadre(a, b) || u.x === 0 || u.y === 0) continue;
      return { variante, a, b, centre, r2, droites: {}, points: { O: centre }, longueurs: { r: r2 } };
    }
    const u = choisir(vs);
    const v = choisir(vs);
    if (u.x === v.x && u.y === v.y) continue;
    if (u.x === -v.x && u.y === -v.y) continue;
    const a = ajoute(centre, u);
    const b = ajoute(centre, v);
    const m1 = mediatrice(a, b);
    if (Math.abs(m1.c) > 40 || Math.abs(m1.a) > 9 || Math.abs(m1.b) > 9) continue;
    if (variante === "trois-points") {
      const w = choisir(vs);
      if ((w.x === u.x && w.y === u.y) || (w.x === v.x && w.y === v.y)) continue;
      const c = ajoute(centre, w);
      if (!dansCadre(a, b, c)) continue;
      const m2 = mediatrice(b, c);
      if (Math.abs(m2.c) > 40 || Math.abs(m2.a) > 9 || Math.abs(m2.b) > 9) continue;
      // Au plus une médiatrice parallèle à un axe (sinon le centre se lit sans calcul).
      if ((m1.a === 0 || m1.b === 0) && (m2.a === 0 || m2.b === 0)) continue;
      // Une médiatrice parallèle à un axe allège un écran : gardée environ une fois sur quatre.
      if ((m1.a === 0 || m1.b === 0 || m2.a === 0 || m2.b === 0) && Math.random() < 0.6) continue;
      return { variante, a, b, c, centre, r2, droites: { m1, m2 }, points: { O: centre }, longueurs: { r: r2 } };
    }
    if (!dansCadre(a, b)) continue;
    if ((m1.a === 0 || m1.b === 0) && Math.random() < 0.4) continue;
    // Droite d par Ω, direction primitive, non parallèle à la médiatrice.
    const dx = entier(1, 3) * signe();
    const dy = entier(0, 3) * signe();
    if (pgcd(dx, dy) !== 1) continue;
    const d = droiteDirectrice(centre, { x: dx, y: dy });
    if (Math.abs(d.c) > 30) continue;
    const i = intersection(d, m1);
    if (!i || Math.abs(i.x - centre.x) > 1e-9 || Math.abs(i.y - centre.y) > 1e-9) continue;
    // d ne doit pas être la médiatrice elle-même ni passer par A ou B.
    if (Math.abs(d.a * a.x + d.b * a.y + d.c) < 1e-9 || Math.abs(d.a * b.x + d.b * b.y + d.c) < 1e-9) continue;
    return { variante, a, b, d, centre, r2, droites: { m1 }, points: { O: centre }, longueurs: { r: r2 } };
  }
}

export function genererExerciceCercleConditions(): ExerciceCercleConditions {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
