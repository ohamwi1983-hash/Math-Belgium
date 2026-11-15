import type { ExerciceBatons, ExerciceCirculaire, ExerciceTrompeurBarres, ExerciceTrompeurCirculaire } from "../core/diagrammesTrompeurs.types";
import { angleSecteur, contexteBatons, pourcentageSecteur } from "../moteur/modeleDiagrammesTrompeurs";
import { nombreAffiche } from "./formatNombreDiagrammes";

/**
 * Figures de gen111 (« Diagrammes et graphiques trompeurs ») : chaînes SVG AUTONOMES, même principe
 * que gen84 (`figureNatureQuadrilatere.ts`) —
 * - à l'écran, injectées telles quelles (`dangerouslySetInnerHTML`) : couleurs par les jetons du
 *   thème, clair/sombre suivent la page ;
 * - sur papier (`enteteHtml` de l'énoncé, `figureHtml` du corrigé) : chaque `var(--x, #…)` a une
 *   valeur de repli littérale.
 * Aucun identifiant (`id`) : rien à neutraliser dans l'empreinte anti-doublon.
 *
 * Lisibilité (390 px et papier) : les valeurs à LIRE tombent toujours sur une ligne de quadrillage
 * (effectifs entiers sur un quadrillage d'une unité ; valeurs des graphiques trompeurs sur une
 * graduation) et ne sont jamais écrites sur la figure de l'énoncé ; chaque secteur fait au moins 36°.
 */

const C = {
  encre: "var(--color-text, #1b1d22)",
  doux: "var(--color-text-muted, #5c6370)",
  grille: "var(--color-border, #d0d7de)",
  fond: "var(--color-surface, #ffffff)",
  barre: "var(--sky, #2f6fb0)",
  accent: "var(--attn, #96650c)",
};

/** Teintes des secteurs (remplissage léger) — les noms sont écrits à côté : la couleur n'est jamais
 * nécessaire pour lire (impression en niveaux de gris). */
const TEINTES = ["var(--sky, #2f6fb0)", "var(--rose, #b23a7a)", "var(--good, #2f7a4f)", "var(--plan, #5b4ea3)", "var(--attn, #96650c)"];

const f = (v: number) => Math.round(v * 10) / 10;

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function texteSvg(x: number, y: number, contenu: string, o: { ancre?: "start" | "middle" | "end"; couleur?: string; taille?: number; gras?: boolean } = {}): string {
  return `<text x="${f(x)}" y="${f(y)}" font-size="${o.taille ?? 13}" text-anchor="${o.ancre ?? "middle"}" dominant-baseline="middle" fill="${o.couleur ?? C.encre}" stroke="${C.fond}" stroke-width="3" stroke-linejoin="round" paint-order="stroke"${o.gras ? ' font-weight="600"' : ""} font-family="system-ui, Arial, sans-serif">${echapper(contenu)}</text>`;
}

function ligne(x1: number, y1: number, x2: number, y2: number, couleur: string, epaisseur = 1, pointille = false): string {
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${couleur}" stroke-width="${epaisseur}"${pointille ? ' stroke-dasharray="4 3"' : ""}/>`;
}

function enveloppe(largeur: number, hauteur: number, etiquette: string, contenu: string[]): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largeur} ${hauteur}" width="${largeur}" style="display:block;margin:8px auto;width:100%;max-width:${largeur}px;height:auto" role="img" aria-label="${echapper(etiquette)}">${contenu.join("")}</svg>`;
}

function flecheHaut(x: number, y: number): string {
  return `<polygon points="${f(x)},${f(y - 7)} ${f(x - 4)},${f(y)} ${f(x + 4)},${f(y)}" fill="${C.encre}"/>`;
}

function flecheDroite(x: number, y: number): string {
  return `<polygon points="${f(x + 7)},${f(y)} ${f(x)},${f(y - 4)} ${f(x)},${f(y + 4)}" fill="${C.encre}"/>`;
}

// ---------------------------------------------------------------------------------------------
// Diagramme circulaire
// ---------------------------------------------------------------------------------------------

interface PartDisque {
  nom: string;
  /** Poids (proportionnel à l'angle dessiné). */
  poids: number;
  /** Texte écrit DANS le secteur (« 126° », « 35 % », « ? »), ou vide. */
  valeur: string;
}

function disque(parts: PartDisque[], etiquette: string, titre: string | null): string {
  const L = 400;
  const H = titre ? 318 : 296;
  const cx = L / 2;
  const cy = titre ? 172 : 150;
  const r = 104;
  const total = parts.reduce((s, p) => s + p.poids, 0);
  const m: string[] = [];
  if (titre) m.push(texteSvg(cx, 20, titre, { gras: true, taille: 14 }));
  let debut = -Math.PI / 2;
  parts.forEach((p, i) => {
    const angle = (p.poids / total) * 2 * Math.PI;
    const fin = debut + angle;
    const x1 = cx + r * Math.cos(debut);
    const y1 = cy + r * Math.sin(debut);
    const x2 = cx + r * Math.cos(fin);
    const y2 = cy + r * Math.sin(fin);
    const grand = angle > Math.PI ? 1 : 0;
    const teinte = TEINTES[i % TEINTES.length]!;
    m.push(
      `<path d="M ${f(cx)} ${f(cy)} L ${f(x1)} ${f(y1)} A ${r} ${r} 0 ${grand} 1 ${f(x2)} ${f(y2)} Z" fill="${teinte}" fill-opacity="0.34" stroke="${C.encre}" stroke-width="1.3" stroke-linejoin="round"/>`,
    );
    const milieu = debut + angle / 2;
    const cos = Math.cos(milieu);
    const sin = Math.sin(milieu);
    if (p.valeur) m.push(texteSvg(cx + 0.62 * r * cos, cy + 0.62 * r * sin, p.valeur, { gras: true, taille: 13 }));
    const ancre = cos > 0.25 ? "start" : cos < -0.25 ? "end" : "middle";
    const re = r + 14;
    m.push(texteSvg(cx + re * cos, cy + re * sin + (Math.abs(cos) <= 0.25 ? (sin > 0 ? 4 : -4) : 0), p.nom, { ancre, taille: 13 }));
    debut = fin;
  });
  return enveloppe(L, H, etiquette, m);
}

/** `inverse` : angles écrits dans les secteurs ; `circulaire` : pourcentages, l'inconnu en « ? » ;
 * `corrige` : pourcentage et angle de chaque secteur (diagramme attendu du sens direct). */
export function figureCirculaireSvg(e: ExerciceCirculaire, mode: "angles" | "pourcentages" | "corrige"): string {
  const parts = e.secteurs.map((s, i) => ({
    nom: s.nom,
    poids: s.effectif,
    valeur:
      mode === "angles"
        ? `${nombreAffiche(angleSecteur(e, i))}°`
        : mode === "pourcentages"
          ? i === e.inconnu
            ? "?"
            : `${nombreAffiche(pourcentageSecteur(e, i))} %`
          : `${nombreAffiche(angleSecteur(e, i))}°`,
  }));
  return disque(parts, `Diagramme circulaire : ${e.contexte.titre.toLowerCase()}`, e.contexte.titre);
}

/** Diagramme circulaire TROMPEUR : secteurs proportionnels aux pourcentages affichés (le disque est
 * « rempli » alors que leur somme dépasse 100 %). */
export function figureTotalFauxSvg(e: ExerciceTrompeurCirculaire): string {
  const parts = e.parts.map((p) => ({ nom: p.nom, poids: p.pourcentage, valeur: `${p.pourcentage} %` }));
  return disque(parts, `Diagramme circulaire : ${e.caractere.toLowerCase()}`, `${e.caractere} (${e.n} ${e.individus})`);
}

// ---------------------------------------------------------------------------------------------
// Diagramme en bâtons
// ---------------------------------------------------------------------------------------------

/** `corrige` : chaque bâton porte son effectif au-dessus (jamais dans l'énoncé : c'est ce qu'on lit). */
export function figureBatonsSvg(e: ExerciceBatons, mode: "enonce" | "corrige" = "enonce"): string {
  const ctx = contexteBatons(e);
  const L = 360;
  const H = 280;
  const mg = 40;
  const md = 18;
  const mh = 30;
  const mb = 46;
  const maxEff = Math.max(...e.valeurs.map((v) => v.effectif));
  const yMax = maxEff + 1;
  const pasEtiquette = yMax > 11 ? 2 : 1;
  const largeur = L - mg - md;
  const hauteur = H - mh - mb;
  const sy = (y: number) => mh + hauteur - (y / yMax) * hauteur;
  const pasX = largeur / (e.valeurs.length + 0.4);
  const sx = (i: number) => mg + pasX * (i + 0.7);
  const m: string[] = [];
  for (let y = 0; y <= yMax; y++) {
    const marquee = y % pasEtiquette === 0;
    m.push(ligne(mg, sy(y), mg + largeur, sy(y), C.grille, marquee ? 1 : 0.6));
    if (marquee) m.push(texteSvg(mg - 7, sy(y), String(y), { ancre: "end", couleur: C.doux, taille: 12 }));
  }
  e.valeurs.forEach((v, i) => {
    const x = sx(i);
    m.push(`<rect x="${f(x - 4)}" y="${f(sy(v.effectif))}" width="8" height="${f(sy(0) - sy(v.effectif))}" fill="${C.barre}"/>`);
    m.push(texteSvg(x, sy(0) + 14, nombreAffiche(v.x), { taille: 13 }));
    if (mode === "corrige") m.push(texteSvg(x, sy(v.effectif) - 10, String(v.effectif), { gras: true, couleur: C.barre, taille: 12 }));
  });
  m.push(ligne(mg, sy(0), mg + largeur + 4, sy(0), C.encre, 1.4));
  m.push(flecheDroite(mg + largeur + 4, sy(0)));
  m.push(ligne(mg, sy(0), mg, mh - 8, C.encre, 1.4));
  m.push(flecheHaut(mg, mh - 8));
  m.push(texteSvg(mg + 8, mh - 14, "effectif", { ancre: "start", couleur: C.doux, taille: 12 }));
  m.push(texteSvg(mg + largeur, sy(0) + 33, ctx.axe, { ancre: "end", couleur: C.doux, taille: 12 }));
  return enveloppe(L, H, `Diagramme en bâtons : ${ctx.caractere}`, m);
}

// ---------------------------------------------------------------------------------------------
// Graphiques trompeurs à barres / pictogrammes
// ---------------------------------------------------------------------------------------------

interface Repere {
  m: string[];
  sy: (rang: number) => number;
  mg: number;
  largeur: number;
  base: number;
}

/** Axe vertical aux graduations RÉGULIÈREMENT espacées sur le dessin, étiquetées par les valeurs de
 * `e.graduations` (irrégulières ou non) ; quadrillage horizontal à chaque graduation. */
function repereGradue(e: ExerciceTrompeurBarres, L: number, H: number): Repere {
  const mg = 56;
  const md = 16;
  const mh = 34;
  const mb = 40;
  const largeur = L - mg - md;
  const hauteur = H - mh - mb;
  const nb = e.graduations.length - 1;
  const sy = (rang: number) => mh + hauteur - (rang / nb) * hauteur;
  const m: string[] = [];
  e.graduations.forEach((g, rang) => {
    m.push(ligne(mg, sy(rang), mg + largeur, sy(rang), C.grille, 1));
    m.push(texteSvg(mg - 7, sy(rang), nombreAffiche(g), { ancre: "end", couleur: C.doux, taille: 12 }));
  });
  m.push(texteSvg(mg + 8, mh - 20, e.contexte.unite, { ancre: "start", couleur: C.doux, taille: 12 }));
  return { m, sy, mg, largeur, base: sy(0) };
}

function finirRepere(r: Repere): void {
  r.m.push(ligne(r.mg, r.base, r.mg + r.largeur, r.base, C.encre, 1.4));
}

export function figureBarresSvg(e: ExerciceTrompeurBarres): string {
  const L = 360;
  const H = 280;
  const r = repereGradue(e, L, H);
  const nb = e.barres.length;
  const pas = r.largeur / nb;
  const larg = Math.min(48, pas * 0.56);
  e.barres.forEach((b, i) => {
    const cx = r.mg + pas * (i + 0.5);
    const haut = r.sy(e.graduations.indexOf(b.valeur));
    r.m.push(`<rect x="${f(cx - larg / 2)}" y="${f(haut)}" width="${f(larg)}" height="${f(r.base - haut)}" fill="${C.barre}" fill-opacity="0.8" stroke="${C.barre}" stroke-width="1"/>`);
    r.m.push(texteSvg(cx, r.base + 15, String(b.annee), { taille: 13 }));
  });
  finirRepere(r);
  const haut = r.sy(e.graduations.length - 1);
  r.m.push(ligne(r.mg, r.base, r.mg, haut - 10, C.encre, 1.4));
  r.m.push(flecheHaut(r.mg, haut - 10));
  return enveloppe(L, H, `Graphique en barres : ${e.contexte.grandeur}`, r.m);
}

function maison(x: number, bas: number, h: number): string {
  const w = 0.78 * h;
  const toit = 0.42 * h;
  const corps = h - toit;
  const porteL = w * 0.22;
  const porteH = corps * 0.5;
  return [
    `<rect x="${f(x)}" y="${f(bas - corps)}" width="${f(w)}" height="${f(corps)}" fill="${C.accent}" fill-opacity="0.3" stroke="${C.accent}" stroke-width="1.4"/>`,
    `<polygon points="${f(x - w * 0.06)},${f(bas - corps)} ${f(x + w / 2)},${f(bas - h)} ${f(x + w * 1.06)},${f(bas - corps)}" fill="${C.accent}" fill-opacity="0.55" stroke="${C.accent}" stroke-width="1.4" stroke-linejoin="round"/>`,
    `<rect x="${f(x + w / 2 - porteL / 2)}" y="${f(bas - porteH)}" width="${f(porteL)}" height="${f(porteH)}" fill="${C.fond}" stroke="${C.accent}" stroke-width="1.2"/>`,
  ].join("");
}

function bouteille(x: number, bas: number, h: number): string {
  const w = 0.42 * h;
  const corps = 0.66 * h;
  const col = 0.22 * w;
  return [
    `<path d="M ${f(x)} ${f(bas)} L ${f(x)} ${f(bas - corps)} Q ${f(x)} ${f(bas - corps - 0.12 * h)} ${f(x + w / 2 - col)} ${f(bas - corps - 0.16 * h)} L ${f(x + w / 2 - col)} ${f(bas - h * 0.94)} L ${f(x + w / 2 + col)} ${f(bas - h * 0.94)} L ${f(x + w / 2 + col)} ${f(bas - corps - 0.16 * h)} Q ${f(x + w)} ${f(bas - corps - 0.12 * h)} ${f(x + w)} ${f(bas - corps)} L ${f(x + w)} ${f(bas)} Z" fill="${C.accent}" fill-opacity="0.3" stroke="${C.accent}" stroke-width="1.4" stroke-linejoin="round"/>`,
    `<rect x="${f(x + w / 2 - col * 1.25)}" y="${f(bas - h)}" width="${f(col * 2.5)}" height="${f(h * 0.07)}" fill="${C.accent}" fill-opacity="0.7"/>`,
  ].join("");
}

export function largeurDessin(dessin: "maison" | "bouteille" | null, h: number): number {
  return dessin === "bouteille" ? 0.42 * h : 0.78 * h * 1.06;
}

export function figurePictogrammesSvg(e: ExerciceTrompeurBarres): string {
  const L = 360;
  const H = 290;
  const r = repereGradue(e, L, H);
  const hauteurs = e.barres.map((b) => r.base - r.sy(e.graduations.indexOf(b.valeur)));
  const largeurs = hauteurs.map((h) => largeurDessin(e.dessin, h));
  const ecart = (r.largeur - largeurs[0]! - largeurs[1]!) / 3;
  let x = r.mg + ecart;
  e.barres.forEach((b, i) => {
    const h = hauteurs[i]!;
    const w = largeurs[i]!;
    const xd = e.dessin === "bouteille" ? x : x + 0.06 * 0.78 * h;
    r.m.push(e.dessin === "bouteille" ? bouteille(xd, r.base, h) : maison(xd, r.base, h));
    r.m.push(texteSvg(x + w / 2, r.base + 15, String(b.annee), { taille: 13 }));
    x += w + ecart;
  });
  finirRepere(r);
  const haut = r.sy(e.graduations.length - 1);
  r.m.push(ligne(r.mg, r.base, r.mg, haut - 10, C.encre, 1.4));
  r.m.push(flecheHaut(r.mg, haut - 10));
  return enveloppe(L, H, `Pictogrammes : ${e.contexte.grandeur}`, r.m);
}
