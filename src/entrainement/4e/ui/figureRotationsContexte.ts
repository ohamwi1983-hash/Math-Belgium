import type { ExerciceRotationsContexte } from "../core/rotationsContexte.types";
import { hauteurDirecte, kInverse, normaliserAngle, solutionsTheta, thetaDirect } from "../moteur/modeleRotationsContexte";
import { nombreFr } from "./formatRotationsContexte";

/**
 * Figure de gen79 : le contexte schématisé (grande roue, horloge, bras de robot, éolienne, roue de
 * vélo) avec le cercle trigonométrique superposé (axes X et Y en pointillés, centrés sur le centre
 * de rotation). Chaîne SVG AUTONOME :
 * - à l'écran, injectée telle quelle (`dangerouslySetInnerHTML`) : couleurs par les jetons du thème
 *   (`var(--color-text)`…), donc clair/sombre suivent la page ;
 * - sur papier (`enteteHtml` de l'énoncé, `figureHtml` du corrigé) : chaque `var(--x, #…)` a une
 *   valeur de repli littérale, adaptée à l'impression.
 *
 * `enonce` : les données seulement (position de départ, rayon, hauteur du centre) — aucune réponse,
 * pas même le sens de rotation (le reconnaître fait partie du transfert). `corrige` : en plus, le
 * sens de rotation, l'angle parcouru, le(s) point(s) cherché(s) avec leur angle trigonométrique et la
 * hauteur.
 */

const C = {
  encre: "var(--color-text, #1b1d22)",
  doux: "var(--color-text-muted, #5c6370)",
  pale: "var(--color-border, #c9d1d9)",
  accent: "var(--color-primary, #b65c1f)",
  ciel: "var(--sky, #2f6fb0)",
  fond: "var(--color-surface, #ffffff)",
};

const LARGEUR = 340;
const CX = 150;
const CY = 128;
const R = 78;
const PLAFOND_SOL = 1.75;

function pt(angle: number, rayon: number): { x: number; y: number } {
  const a = (angle * Math.PI) / 180;
  return { x: CX + rayon * Math.cos(a), y: CY - rayon * Math.sin(a) };
}

const f = (v: number) => Math.round(v * 10) / 10;

function texteSvg(x: number, y: number, contenu: string, options: { ancre?: "start" | "middle" | "end"; couleur?: string; taille?: number; gras?: boolean } = {}): string {
  const echappe = contenu.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<text x="${f(x)}" y="${f(y)}" font-size="${options.taille ?? 12}" text-anchor="${options.ancre ?? "middle"}" fill="${options.couleur ?? C.encre}"${options.gras ? ' font-weight="600"' : ""} font-family="system-ui, sans-serif">${echappe}</text>`;
}

function ligne(x1: number, y1: number, x2: number, y2: number, couleur: string, epaisseur = 1.5, pointilles = false): string {
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${couleur}" stroke-width="${epaisseur}"${pointilles ? ' stroke-dasharray="5 4"' : ""} stroke-linecap="round"/>`;
}

function cercle(x: number, y: number, r: number, trait: string, epaisseur = 1.5, remplissage = "none", pointilles = false): string {
  return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${remplissage}" stroke="${trait}" stroke-width="${epaisseur}"${pointilles ? ' stroke-dasharray="5 4"' : ""}/>`;
}

function fleche(pointe: { x: number; y: number }, depuis: { x: number; y: number }, couleur: string, taille = 8): string {
  const dx = pointe.x - depuis.x;
  const dy = pointe.y - depuis.y;
  const n = Math.hypot(dx, dy) || 1;
  const ux = dx / n;
  const uy = dy / n;
  const bx = pointe.x - ux * taille;
  const by = pointe.y - uy * taille;
  const p1 = `${f(bx - uy * taille * 0.5)},${f(by + ux * taille * 0.5)}`;
  const p2 = `${f(bx + uy * taille * 0.5)},${f(by - ux * taille * 0.5)}`;
  return `<polygon points="${f(pointe.x)},${f(pointe.y)} ${p1} ${p2}" fill="${couleur}"/>`;
}

/** Arc de cercle de `debut` à `debut + sens·etendue` (degrés), avec une flèche au bout. */
function arcFleche(debut: number, etendue: number, sens: 1 | -1, rayon: number, couleur: string): string {
  if (etendue <= 0.5) return "";
  const fin = debut + sens * etendue;
  const a = pt(debut, rayon);
  const b = pt(fin, rayon);
  const grand = etendue > 180 ? 1 : 0;
  const balayage = sens === 1 ? 0 : 1;
  const avant = pt(fin - sens * 4, rayon);
  return `<path d="M ${f(a.x)} ${f(a.y)} A ${rayon} ${rayon} 0 ${grand} ${balayage} ${f(b.x)} ${f(b.y)}" fill="none" stroke="${couleur}" stroke-width="2"/>${fleche(b, avant, couleur)}`;
}

function ancrePour(angle: number): "start" | "middle" | "end" {
  const c = Math.cos((angle * Math.PI) / 180);
  if (c > 0.3) return "start";
  if (c < -0.3) return "end";
  return "middle";
}

/** Étiquette placée à l'extérieur d'un point du cercle, dans la direction de son angle. */
function etiquetteRadiale(angle: number, rayon: number, contenu: string, couleur = C.encre, gras = false): string {
  const p = pt(angle, rayon);
  const s = Math.sin((angle * Math.PI) / 180);
  const dy = s < -0.3 ? 12 : s > 0.3 ? -2 : 4;
  const ancre = ancrePour(angle);
  // Près de la verticale : décalée sur le côté, pour ne pas recouvrir l'axe Y.
  if (ancre === "middle") return texteSvg(p.x + 7, p.y + dy, contenu, { ancre: "start", couleur, gras });
  return texteSvg(p.x, p.y + dy, contenu, { ancre, couleur, gras });
}

function decor(e: ExerciceRotationsContexte, ySol: number): string {
  const morceaux: string[] = [];
  switch (e.situation) {
    case "roue": {
      morceaux.push(ligne(CX, CY, CX - R * 0.55, ySol, C.doux, 2.5), ligne(CX, CY, CX + R * 0.55, ySol, C.doux, 2.5));
      for (let a = 0; a < 360; a += 45) {
        const p = pt(a, R);
        morceaux.push(ligne(CX, CY, p.x, p.y, C.pale, 1));
      }
      morceaux.push(cercle(CX, CY, R, C.doux, 3));
      const d = pt(e.origine, R);
      morceaux.push(`<rect x="${f(d.x - 7)}" y="${f(d.y)}" width="14" height="11" rx="2" fill="${C.fond}" stroke="${C.encre}" stroke-width="1.5"/>`);
      break;
    }
    case "horloge": {
      const rc = R * 1.22;
      morceaux.push(ligne(CX - rc - 8, CY + rc * 0.6, CX - rc - 8, ySol, C.doux, 2), ligne(CX + rc + 8, CY + rc * 0.6, CX + rc + 8, ySol, C.doux, 2));
      morceaux.push(cercle(CX, CY, rc, C.doux, 3, C.fond));
      for (let h = 0; h < 12; h++) {
        const a = 90 - h * 30;
        const p1 = pt(a, rc);
        const p2 = pt(a, rc - (h % 3 === 0 ? 9 : 5));
        morceaux.push(ligne(p1.x, p1.y, p2.x, p2.y, C.doux, h % 3 === 0 ? 2 : 1));
      }
      for (const [h, a] of [
        ["12", 90],
        ["3", 0],
        ["6", 270],
        ["9", 180],
      ] as const) {
        const p = pt(a, rc - 9.5);
        morceaux.push(texteSvg(p.x, p.y + 4, h, { couleur: C.doux, taille: 11 }));
      }
      morceaux.push(cercle(CX, CY, R, C.pale, 1, "none", true));
      const p = pt(90, R);
      morceaux.push(ligne(CX, CY, p.x, p.y, C.encre, 3.5));
      break;
    }
    case "robot": {
      morceaux.push(`<rect x="${CX - 7}" y="${CY}" width="14" height="${f(ySol - CY)}" fill="${C.pale}" stroke="${C.doux}" stroke-width="1"/>`);
      morceaux.push(ligne(CX - R - 30, ySol, CX + R + 30, ySol, C.doux, 3));
      morceaux.push(cercle(CX, CY, R, C.pale, 1, "none", true));
      const p = pt(e.origine, R);
      morceaux.push(ligne(CX, CY, p.x, p.y, C.encre, 6));
      morceaux.push(cercle(CX, CY, 6, C.encre, 1.5, C.fond));
      break;
    }
    case "eolienne": {
      morceaux.push(`<polygon points="${CX - 4},${CY} ${CX + 4},${CY} ${CX + 9},${f(ySol)} ${CX - 9},${f(ySol)}" fill="${C.pale}" stroke="${C.doux}" stroke-width="1"/>`);
      morceaux.push(cercle(CX, CY, R, C.pale, 1, "none", true));
      for (const a of [90, 210, 330]) {
        const p = pt(a, R);
        morceaux.push(ligne(CX, CY, p.x, p.y, a === 90 ? C.encre : C.doux, a === 90 ? 4 : 3));
      }
      morceaux.push(cercle(CX, CY, 5, C.encre, 1.5, C.fond));
      break;
    }
    case "valve": {
      const rw = R * (e.hauteurCentre / e.rayon);
      morceaux.push(cercle(CX, CY, rw, C.doux, 5));
      morceaux.push(cercle(CX, CY, R, C.pale, 1, "none", true));
      for (let a = 0; a < 360; a += 30) {
        const p = pt(a, rw - 3);
        morceaux.push(ligne(CX, CY, p.x, p.y, C.pale, 0.8));
      }
      morceaux.push(cercle(CX, CY, 5, C.encre, 1.5, C.fond));
      const p = pt(e.origine, R);
      morceaux.push(`<rect x="${f(p.x - 3)}" y="${f(p.y - 5)}" width="6" height="10" fill="${C.encre}"/>`);
      // Sens de déplacement du vélo (une donnée de l'énoncé).
      const versDroite = e.rotation === -1;
      const yF = ySol + 18;
      const x1 = versDroite ? CX - 40 : CX + 40;
      const x2 = versDroite ? CX + 40 : CX - 40;
      morceaux.push(ligne(x1, yF, x2, yF, C.doux, 1.5), fleche({ x: x2, y: yF }, { x: x1, y: yF }, C.doux, 7));
      morceaux.push(texteSvg(versDroite ? x2 + 6 : x2 - 6, yF + 4, "vélo", { ancre: versDroite ? "start" : "end", couleur: C.doux, taille: 11 }));
      break;
    }
  }
  return morceaux.join("");
}

function rayonDecor(e: ExerciceRotationsContexte): number {
  if (e.situation === "horloge") return R * 1.22 + 8;
  if (e.situation === "valve") return R * (e.hauteurCentre / e.rayon);
  return R;
}

export function figureRotationsContexteSvg(e: ExerciceRotationsContexte, mode: "enonce" | "corrige"): string {
  const rapport = e.hauteurCentre / e.rayon;
  const coupe = rapport > PLAFOND_SOL;
  const ySol = CY + R * Math.min(rapport, PLAFOND_SOL);
  const hauteurSvg = Math.round(ySol + (e.situation === "valve" ? 34 : 18));
  const u = e.unite;
  const parties: string[] = [];

  // Sol (ou table pour le robot, dessinée dans le décor).
  if (e.situation !== "robot") {
    parties.push(ligne(10, ySol, LARGEUR - 10, ySol, C.doux, 2));
    for (let x = 16; x < LARGEUR - 10; x += 14) parties.push(ligne(x, ySol, x - 7, ySol + 7, C.pale, 1));
  }
  parties.push(decor(e, ySol));

  // Cercle trigonométrique superposé : axes en pointillés.
  const ext = rayonDecor(e) + 14;
  parties.push(ligne(CX - ext, CY, CX + ext, CY, C.ciel, 1.2, true), fleche({ x: CX + ext + 4, y: CY }, { x: CX + ext - 6, y: CY }, C.ciel, 7));
  parties.push(ligne(CX, Math.min(ySol, CY + ext), CX, CY - ext, C.ciel, 1.2, true), fleche({ x: CX, y: CY - ext - 4 }, { x: CX, y: CY - ext + 6 }, C.ciel, 7));
  parties.push(texteSvg(CX + ext, CY + 16, "X", { ancre: "start", couleur: C.ciel, gras: true }), texteSvg(CX - 8, CY - ext + 6, "Y", { ancre: "end", couleur: C.ciel, gras: true }));
  parties.push(texteSvg(CX - 11, CY + 17, "O", { ancre: "end", couleur: C.ciel, taille: 11 }));

  // Position de départ.
  const depart = pt(e.origine, R);
  parties.push(cercle(depart.x, depart.y, 4.5, C.encre, 1.5, C.accent));
  const decalDepart = e.situation === "valve" ? R * (e.hauteurCentre / e.rayon) + 14 : R + 14;
  // Corrigé : le point de départ reste (orange, d'où part la flèche du sens), son étiquette est déjà
  // sur la figure de l'énoncé et encombrerait les solutions.
  if (mode === "corrige") {
    // rien
  } else if (e.origine === 0 || e.origine === 180) parties.push(texteSvg(depart.x, depart.y - 10, "départ", { couleur: C.accent, gras: true }));
  else if (e.situation === "horloge") parties.push(texteSvg(depart.x + 8, depart.y + 16, "départ", { ancre: "start", couleur: C.accent, gras: true }));
  else if (!(e.origine === 270 && ySol - CY < decalDepart + 4)) parties.push(etiquetteRadiale(e.origine, decalDepart, "départ", C.accent, true));
  else {
    // Pas la place sous le point (sol trop proche) : étiquette à droite, hors des pieds de la roue,
    // reliée au point par un trait.
    const xe = CX + R * 0.78;
    const ye = ySol - 6;
    parties.push(ligne(depart.x + 5, depart.y - 1, xe - 2, ye - 4, C.accent, 1));
    parties.push(texteSvg(xe, ye, "départ", { ancre: "start", couleur: C.accent, gras: true }));
  }

  // Rayon r (vers 135°, une direction jamais occupée par le départ).
  const pr = pt(135, R);
  parties.push(ligne(CX, CY, pr.x, pr.y, C.encre, 1.2));
  const lr = pt(135, R * 0.55);
  parties.push(texteSvg(lr.x - 6, lr.y - 4, `r = ${nombreFr(e.rayon)} ${u}`, { ancre: "end", taille: 11.5 }));

  // Hauteur du centre h (cote verticale à droite).
  const xCote = CX + rayonDecor(e) + 26;
  parties.push(ligne(xCote, CY, xCote, ySol, C.encre, 1), fleche({ x: xCote, y: CY }, { x: xCote, y: CY + 10 }, C.encre, 6), fleche({ x: xCote, y: ySol }, { x: xCote, y: ySol - 10 }, C.encre, 6));
  parties.push(ligne(CX + 6, CY, xCote + 4, CY, C.pale, 0.8, true));
  if (coupe) {
    const ym = (CY + ySol) / 2 + 10;
    parties.push(`<path d="M ${xCote - 6} ${ym - 2} L ${xCote + 6} ${ym - 6} M ${xCote - 6} ${ym + 4} L ${xCote + 6} ${ym}" stroke="${C.encre}" stroke-width="1.2"/>`);
  }
  const labelH = `${nombreFr(e.hauteurCentre)} ${u}`;
  parties.push(texteSvg(xCote + 5, (CY + ySol) / 2 - 2, labelH, { ancre: "start", taille: 11.5 }));

  if (mode === "corrige") {
    // Sens de rotation, depuis le départ.
    if (e.sens === "direct") {
      const theta = thetaDirect(e);
      const etendue = normaliserAngle(e.rotation * (theta - e.origine));
      parties.push(arcFleche(e.origine, etendue, e.rotation, R * 0.42, C.accent));
      const milieu = pt(e.origine + (e.rotation * etendue) / 2, R * 0.42 + 12);
      parties.push(texteSvg(milieu.x, milieu.y + 4, "α", { couleur: C.accent, gras: true }));
      const p = pt(theta, R);
      parties.push(ligne(CX, CY, p.x, p.y, C.ciel, 2));
      // Hauteur du point : verticale jusqu'au sol.
      parties.push(ligne(p.x, p.y, p.x, ySol, C.ciel, 1.4, true));
      parties.push(cercle(p.x, p.y, 5, C.ciel, 1.5, C.ciel));
      parties.push(etiquetteRadiale(theta, R + 12, `θ = ${theta}°`, C.ciel, true));
      const H = hauteurDirecte(e);
      // Au ras du sol, du côté de la verticale opposé à l'étiquette de θ.
      const c = Math.cos((theta * Math.PI) / 180);
      const droite = c < -0.3;
      parties.push(texteSvg(p.x + (droite ? 5 : -5), ySol - 6, `${nombreFr(H)} ${u}`, { ancre: droite ? "start" : "end", couleur: C.ciel, taille: 11.5, gras: true }));
    } else {
      parties.push(arcFleche(e.origine, 60, e.rotation, R * 0.42, C.accent));
      const k = kInverse(e);
      const yH = CY - R * k;
      parties.push(ligne(18, yH, CX + rayonDecor(e) + 10, yH, C.ciel, 1.4, true));
      // Valeur de H d'un côté de la droite, noms des solutions de l'autre : jamais superposés.
      const dessus = k >= 0;
      parties.push(texteSvg(14, dessus ? yH + 15 : yH - 6, `${nombreFr(e.hauteurCible ?? 0)} ${u}`, { ancre: "start", couleur: C.ciel, taille: 11.5, gras: true }));
      const sols = solutionsTheta(e);
      sols.forEach((t, i) => {
        const p = pt(t, R);
        parties.push(ligne(CX, CY, p.x, p.y, C.ciel, 1.6));
        parties.push(cercle(p.x, p.y, 5, C.ciel, 1.5, C.ciel));
        const nom = sols.length > 1 ? `θ${i === 0 ? "₁" : "₂"}` : "θ";
        const c = Math.cos((t * Math.PI) / 180);
        const yEtiquette = sols.length === 1 ? p.y + (k > 0 ? -9 : 18) : dessus ? yH - 7 : yH + 16;
        parties.push(texteSvg(p.x + (c > 0.05 ? 8 : c < -0.05 ? -8 : 10), yEtiquette, nom, { ancre: c < -0.05 ? "end" : "start", couleur: C.ciel, gras: true, taille: 13 }));
      });
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR} ${hauteurSvg}" width="${LARGEUR}" style="display:block;margin:8px auto;max-width:100%;height:auto" role="img" aria-label="${mode === "enonce" ? "Schéma de la situation avec le cercle trigonométrique superposé" : "Schéma corrigé : sens de rotation et position cherchée"}">${parties.join("")}</svg>`;
}
