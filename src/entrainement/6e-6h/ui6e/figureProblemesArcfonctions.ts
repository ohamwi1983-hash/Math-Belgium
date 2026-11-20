import type { ExerciceProblemesArcfonctions } from "../core6e/problemesArcfonctions";
import { angleRefracte, angleSol } from "../core6e/problemesArcfonctions";

/**
 * Schémas de `6gen156` (chaîne SVG autonome : écran, papier `enteteHtml`) : dioptre avec la normale et
 * le rayon incident (et le rayon réfracté de la question a ou b, sans valeur), mur et angle de vue,
 * échelle contre un mur. Aucun nombre cherché n'y est écrit ; les lettres renvoient à l'énoncé.
 * Couleurs littérales (impression).
 */

type E = ExerciceProblemesArcfonctions;
const ENCRE = "#1b1d22";
const DOUX = "#868e96";
const RAYON = "#e8590c";
const BLEU = "#d0ebff";
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const f1 = (v: number) => v.toFixed(1);
const RAD = Math.PI / 180;

function texte(x: number, y: number, t: string, o: { taille?: number; ancre?: string; italique?: boolean; couleur?: string } = {}): string {
  return `<text x="${f1(x)}" y="${f1(y)}" font-size="${o.taille ?? 14}" text-anchor="${o.ancre ?? "middle"}" fill="${o.couleur ?? ENCRE}"${o.italique ? ' font-style="italic"' : ""} ${POLICE}>${t}</text>`;
}
function trait(x1: number, y1: number, x2: number, y2: number, o: { couleur?: string; ep?: number; tirets?: boolean } = {}): string {
  return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${o.couleur ?? ENCRE}" stroke-width="${o.ep ?? 1.4}"${o.tirets ? ' stroke-dasharray="5 4"' : ""} stroke-linecap="round"/>`;
}
/** Arc de cercle de centre (cx, cy), du cap a1 au cap a2 (degrés, sens trigonométrique, y vers le haut). */
function arc(cx: number, cy: number, r: number, a1: number, a2: number, couleur = ENCRE): string {
  const p = (a: number) => `${f1(cx + r * Math.cos(a * RAD))},${f1(cy - r * Math.sin(a * RAD))}`;
  const grand = Math.abs(a2 - a1) > 180 ? 1 : 0;
  const sens = a2 > a1 ? 0 : 1;
  return `<path d="M ${p(a1)} A ${r} ${r} 0 ${grand} ${sens} ${p(a2)}" fill="none" stroke="${couleur}" stroke-width="1.2"/>`;
}
function svg(L: number, H: number, contenu: string, label: string): string {
  return `<svg class="schema-probleme" xmlns="http://www.w3.org/2000/svg" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}" role="img" aria-label="${label}"><rect x="0" y="0" width="${L}" height="${H}" fill="#ffffff"/>${contenu}</svg>`;
}

function dioptre(e: Extract<E, { variante: "refraction" | "reflexion-totale" }>): string {
  const L = 320;
  const H = 230;
  const ox = 160;
  const oy = 115;
  const theta1 = e.theta1;
  const theta2 = angleRefracte(e.milieu1.n, e.milieu2.n, theta1);
  let s = `<rect x="0" y="${oy}" width="${L}" height="${H - oy}" fill="${e.milieu2.n > e.milieu1.n ? BLEU : "#f1f3f5"}"/>`;
  s += `<rect x="0" y="0" width="${L}" height="${oy}" fill="${e.milieu1.n > e.milieu2.n ? BLEU : "#ffffff"}"/>`;
  s += trait(0, oy, L, oy, { ep: 1.6 });
  s += trait(ox, 8, ox, H - 8, { couleur: DOUX, tirets: true, ep: 1 });
  s += texte(ox + 6, 20, "normale", { taille: 12, ancre: "start", couleur: DOUX, italique: true });
  const r = 100;
  const ix = ox - r * Math.sin(theta1 * RAD);
  const iy = oy - r * Math.cos(theta1 * RAD);
  s += trait(ix, iy, ox, oy, { couleur: RAYON, ep: 2.2 });
  const mx = (ix + ox) / 2;
  const my = (iy + oy) / 2;
  const ang = Math.atan2(oy - iy, ox - ix);
  s += `<polygon points="${f1(mx + 7 * Math.cos(ang))},${f1(my + 7 * Math.sin(ang))} ${f1(mx - 5 * Math.cos(ang) - 5 * Math.sin(ang))},${f1(my - 5 * Math.sin(ang) + 5 * Math.cos(ang))} ${f1(mx - 5 * Math.cos(ang) + 5 * Math.sin(ang))},${f1(my - 5 * Math.sin(ang) - 5 * Math.cos(ang))}" fill="${RAYON}"/>`;
  s += arc(ox, oy, 34, 90, 90 + theta1);
  s += texte(ox - 30 * Math.sin((theta1 / 2) * RAD) - 6, oy - 44 * Math.cos((theta1 / 2) * RAD), "θ₁", { italique: true });
  if (Number.isFinite(theta2)) {
    const fx = ox + r * Math.sin(theta2 * RAD);
    const fy = oy + r * Math.cos(theta2 * RAD);
    s += trait(ox, oy, fx, fy, { couleur: RAYON, ep: 2.2 });
    s += arc(ox, oy, 34, -90, -90 + theta2);
    s += texte(ox + 40 * Math.sin((theta2 / 2) * RAD) + 8, oy + 48 * Math.cos((theta2 / 2) * RAD) + 4, "θ₂", { italique: true });
  }
  const nom = (m: { nom: string }) => m.nom.replace(/^l'|^le /, "");
  s += texte(12, oy - 12, `${nom(e.milieu1)} (n₁)`, { ancre: "start", taille: 13 });
  s += texte(12, oy + 22, `${nom(e.milieu2)} (n₂)`, { ancre: "start", taille: 13 });
  s += `<circle cx="${ox}" cy="${oy}" r="2.5" fill="${ENCRE}"/>`;
  return svg(L, H, s, "Schéma : rayon incident, normale et rayon réfracté");
}

function vue(e: Extract<E, { variante: "angle-de-vue" }>): string {
  const L = 340;
  const H = 210;
  const mur = 300;
  const oeil = 40;
  const yOeil = 170;
  // Échelle verticale lisible quel que soit le contexte (pas à l'échelle exacte).
  const k = 140 / e.b;
  const ya = yOeil - e.a * k;
  const yb = yOeil - e.b * k;
  let s = trait(mur, 10, mur, H - 10, { ep: 2 });
  s += `<rect x="${mur - 7}" y="${f1(yb)}" width="7" height="${f1(ya - yb)}" fill="#ffd8a8" stroke="${ENCRE}" stroke-width="1"/>`;
  s += trait(oeil, yOeil, mur, yOeil, { couleur: DOUX, tirets: true, ep: 1 });
  s += trait(oeil, yOeil, mur - 7, ya, { couleur: RAYON, ep: 1.8 });
  s += trait(oeil, yOeil, mur - 7, yb, { couleur: RAYON, ep: 1.8 });
  const aA = Math.atan2(yOeil - ya, mur - oeil) / RAD;
  const aB = Math.atan2(yOeil - yb, mur - oeil) / RAD;
  s += arc(oeil, yOeil, 52, aA, aB, RAYON);
  s += texte(oeil + 62 * Math.cos(((aA + aB) / 2) * RAD) + 4, yOeil - 62 * Math.sin(((aA + aB) / 2) * RAD) + 5, "θ", { italique: true, couleur: RAYON });
  s += `<circle cx="${oeil}" cy="${yOeil}" r="4" fill="${ENCRE}"/>`;
  s += texte(oeil, yOeil + 22, "yeux", { taille: 12 });
  // Cotes a, b à droite du mur.
  s += trait(mur + 12, yOeil, mur + 12, ya, { ep: 1 });
  s += texte(mur + 18, (yOeil + ya) / 2 + 5, "a", { ancre: "start", italique: true });
  s += trait(mur + 28, yOeil, mur + 28, yb, { ep: 1 });
  s += texte(mur + 33, (yOeil + yb) / 2 + 5, "b", { ancre: "start", italique: true });
  s += trait(oeil, yOeil + 32, mur, yOeil + 32, { ep: 1 });
  s += texte((oeil + mur) / 2, yOeil + 28, "x", { italique: true });
  return svg(L + 20, H, s, "Schéma : angle de vue depuis la distance x");
}

function echelle(e: Extract<E, { variante: "echelle" }>): string {
  const L = 280;
  const H = 230;
  const mur = 230;
  const sol = 200;
  const k = 180 / e.L;
  const alpha = angleSol(e.L, e.d);
  const px = mur - e.d * k;
  const hy = sol - e.L * k * Math.sin(alpha * RAD);
  let s = trait(20, sol, L - 10, sol, { ep: 2 });
  s += trait(mur, sol, mur, 10, { ep: 2 });
  s += trait(px, sol, mur, hy, { couleur: "#1971c2", ep: 3 });
  s += arc(px, sol, 30, 0, alpha);
  s += texte(px + 38 * Math.cos((alpha / 2) * RAD) + 4, sol - 38 * Math.sin((alpha / 2) * RAD) + 5, "α", { italique: true });
  s += texte((px + mur) / 2 - 14, (sol + hy) / 2, "L", { italique: true, couleur: "#1971c2" });
  s += trait(px, sol + 14, mur, sol + 14, { ep: 1 });
  s += texte((px + mur) / 2, sol + 28, "d", { italique: true });
  s += `<rect x="${mur - 8}" y="${sol - 8}" width="8" height="8" fill="none" stroke="${ENCRE}" stroke-width="1"/>`;
  return svg(L, H + 10, s, "Schéma : échelle appuyée contre un mur");
}

export function figureProbleme(e: E): string {
  switch (e.variante) {
    case "refraction":
    case "reflexion-totale":
      return dioptre(e);
    case "angle-de-vue":
      return vue(e);
    case "echelle":
      return echelle(e);
  }
}
