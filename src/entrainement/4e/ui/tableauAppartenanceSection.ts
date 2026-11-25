import type { Point3D } from "../core/geometrieEspace.types";
import type { ExerciceSectionPlaneSolide } from "../core/sectionPlaneSolide.types";
import { normalePlan, normeCarree3D, produitScalaire3D, soustraire3D } from "../moteur/geometrieEspace";
import { libellePoint, positionConnu } from "./formatSectionPlaneSolide";

/**
 * Tableau d'appartenance des points aux faces (manuel, exemples résolus 6 a et 7 a) — gen40, pour
 * TOUTES les variantes : une colonne par face (cube et pavé : Haut, Bas, Gauche, Droite, Avant,
 * Arrière, avec le nom de la face ; prisme et tétraèdre : la face par ses sommets), une ligne par
 * point dans l'ordre de la construction (donnés, puis trouvés ; points auxiliaires au passage sur
 * papier), la lettre du point dans la case de chaque face dont le PLAN le contient.
 *
 * Chaîne SVG AUTONOME (couleurs en attributs) : même rendu à l'écran (`dangerouslySetInnerHTML`),
 * dans le document HTML et dans le Word, qui ne rasterise que les `<svg>` d'un `figureHtml`.
 */

export interface LigneTableauAppartenance {
  nom: string;
  position: Point3D;
  /** Point auxiliaire (I, I₁…) : écrit en violet, comme sur la figure. */
  auxiliaire?: boolean;
}

const COULEUR_POINT = "#1971c2";
const COULEUR_AUXILIAIRE = "#7048e8";
const COULEUR_TRAIT = "#868e96";
const COULEUR_TEXTE = "#1a1a2e";

/** Nom d'usage d'une face de pavé (Haut, Bas…), d'après la direction de sa normale extérieure. */
function nomUsageFace(exercice: ExerciceSectionPlaneSolide, face: number): string | null {
  if (exercice.solide.id !== "cube" && exercice.solide.id !== "parallelepipede") return null;
  const sommets = Object.values(exercice.solide.sommets);
  const centre = (pts: Point3D[]) => ({ x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length, z: pts.reduce((s, p) => s + p.z, 0) / pts.length });
  const d = soustraire3D(centre(exercice.solide.faces[face]!.map((n) => exercice.solide.sommets[n]!)), centre(sommets));
  const ax = Math.abs(d.x);
  const ay = Math.abs(d.y);
  const az = Math.abs(d.z);
  if (az >= ax && az >= ay) return d.z > 0 ? "Haut" : "Bas";
  if (ax >= ay) return d.x > 0 ? "Droite" : "Gauche";
  return d.y > 0 ? "Arrière" : "Avant";
}

/** Colonnes du tableau, dans un ordre lisible : Haut, Bas, Gauche, Droite, Avant, Arrière pour un
 * pavé (comme le manuel), l'ordre des faces du gabarit sinon. */
function colonnes(exercice: ExerciceSectionPlaneSolide): { face: number; titre: string; sousTitre: string | null }[] {
  const cols = exercice.solide.faces.map((f, face) => {
    const usage = nomUsageFace(exercice, face);
    return { face, titre: usage ?? f.join(""), sousTitre: usage ? f.join("") : null };
  });
  const ordre = ["Haut", "Bas", "Gauche", "Droite", "Avant", "Arrière"];
  return cols[0]?.sousTitre ? [...cols].sort((a, b) => ordre.indexOf(a.titre) - ordre.indexOf(b.titre)) : cols;
}

function dansPlanFace(exercice: ExerciceSectionPlaneSolide, p: Point3D, face: number): boolean {
  const [a, b, c] = exercice.solide.faces[face]!.slice(0, 3).map((n) => exercice.solide.sommets[n]!);
  const n = normalePlan(a!, b!, c!);
  return Math.abs(produitScalaire3D(n, soustraire3D(p, a!))) / Math.sqrt(normeCarree3D(n)) < 1e-6;
}

const LARGEUR_COLONNE = 62;
const HAUTEUR_ENTETE = 42;
const HAUTEUR_LIGNE = 26;

/** Lignes du tableau pour une session de l'appli : les points connus dans l'ordre où l'élève les a
 * obtenus (donnés, puis trouvés). */
export function lignesTableauSession(exercice: ExerciceSectionPlaneSolide, connus: readonly number[]): LigneTableauAppartenance[] {
  return connus.map((id) => ({ nom: libellePoint(connus, id), position: positionConnu(exercice, id)! }));
}

export function tableauAppartenanceSvg(exercice: ExerciceSectionPlaneSolide, lignes: LigneTableauAppartenance[]): string {
  const cols = colonnes(exercice);
  const largeur = cols.length * LARGEUR_COLONNE;
  const hauteur = HAUTEUR_ENTETE + lignes.length * HAUTEUR_LIGNE;
  const trait = (x1: number, y1: number, x2: number, y2: number) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${COULEUR_TRAIT}" stroke-width="1"/>`;
  let corps = `<rect x="0.5" y="0.5" width="${largeur - 1}" height="${HAUTEUR_ENTETE - 0.5}" fill="#eef3f8"/>`;
  cols.forEach((c, i) => {
    const x = i * LARGEUR_COLONNE + LARGEUR_COLONNE / 2;
    if (c.sousTitre) {
      corps += `<text x="${x}" y="18" text-anchor="middle" font-size="12" font-weight="700" fill="${COULEUR_TEXTE}">${c.titre}</text>`;
      corps += `<text x="${x}" y="34" text-anchor="middle" font-size="11" fill="${COULEUR_TEXTE}">${c.sousTitre}</text>`;
    } else {
      corps += `<text x="${x}" y="26" text-anchor="middle" font-size="12" font-weight="700" fill="${COULEUR_TEXTE}">${c.titre}</text>`;
    }
  });
  lignes.forEach((l, j) => {
    const y = HAUTEUR_ENTETE + j * HAUTEUR_LIGNE + HAUTEUR_LIGNE / 2 + 5;
    cols.forEach((c, i) => {
      if (!dansPlanFace(exercice, l.position, c.face)) return;
      const x = i * LARGEUR_COLONNE + LARGEUR_COLONNE / 2;
      corps += `<text x="${x}" y="${y}" text-anchor="middle" font-size="14" font-weight="700" font-style="italic" fill="${l.auxiliaire ? COULEUR_AUXILIAIRE : COULEUR_POINT}">${l.nom}</text>`;
    });
  });
  for (let i = 0; i <= cols.length; i++) {
    const x = Math.min(Math.max(i * LARGEUR_COLONNE, 0.5), largeur - 0.5);
    corps += trait(x, 0.5, x, hauteur - 0.5);
  }
  for (let j = 0; j <= lignes.length + 1; j++) {
    const y = j === 0 ? 0.5 : Math.min(HAUTEUR_ENTETE + (j - 1) * HAUTEUR_LIGNE, hauteur - 0.5);
    corps += trait(0.5, y, largeur - 0.5, y);
  }
  return `<svg width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tableau d'appartenance des points aux faces" style="display:block;margin:6px auto;max-width:100%;height:auto;background:#ffffff;font-family:Georgia, 'Times New Roman', serif;">${corps}</svg>`;
}
