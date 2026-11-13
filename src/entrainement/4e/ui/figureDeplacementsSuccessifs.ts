import type { Point } from "../core/vecteur.types";
import type { ExerciceDeplacementsSuccessifs } from "../core/deplacementsSuccessifs.types";
import { echelle, nomArrivee, nomCible, positions, total } from "../moteur/modeleDeplacementsSuccessifs";

/**
 * Figure de gen86 — UNE seule fonction pour l'écran et le papier (énoncé, corrigé `figureHtml`).
 * Carte schématique : quadrillage (une case = 1 pas, 1 km ou 100 m), rose des vents, axes du repère
 * issus du départ D, et la cible éventuelle (trésor T, refuge ou client C). Dans l'énoncé, le trajet
 * n'est PAS tracé. Options : `trajet` dessine les déplacements successifs (bout à bout) et le
 * déplacement total ; `complet` ajoute le vecteur de la dernière question (retour, dernier
 * déplacement, grands pas répétés). À l'écran, couleurs du thème (`var(--…)`, suit le mode sombre) ;
 * sur papier, couleurs fixes.
 */

export type ThemeFigure = "ecran" | "papier";

export interface OptionsFigureDeplacements {
  theme: ThemeFigure;
  trajet?: boolean;
  complet?: boolean;
}

interface Palette {
  fond: string;
  grille: string;
  axes: string;
  encre: string;
  trajet: string;
  total: string;
  final: string;
  cible: string;
  police: string;
}

const PALETTES: Record<ThemeFigure, Palette> = {
  ecran: {
    fond: "var(--surface)",
    grille: "var(--line)",
    axes: "var(--ink-soft)",
    encre: "var(--ink)",
    trajet: "var(--accent)",
    total: "var(--plan)",
    final: "var(--good)",
    cible: "var(--bad)",
    police: "inherit",
  },
  papier: {
    fond: "#ffffff",
    grille: "#cfd8df",
    axes: "#52606d",
    encre: "#1f2933",
    trajet: "#c2410c",
    total: "#7048e8",
    final: "#2b8a3e",
    cible: "#c92a2a",
    police: "Helvetica, Arial, sans-serif",
  },
};

const LARGEUR = 360;
const MARGE = 18;
const BANDE = 60;
const CASE_MAX = 30;

function r(v: number): string {
  return `${Math.round(v * 10) / 10}`;
}

export function construireFigureDeplacements(e: ExerciceDeplacementsSuccessifs, options: OptionsFigureDeplacements): string {
  const pal = PALETTES[options.theme];
  const f = echelle(e.situation);
  const enCases = (p: Point): Point => ({ x: p.x / f, y: p.y / f });
  const D: Point = { x: 0, y: 0 };
  const trajet = positions(e).map(enCases);
  const cible = e.cible ? enCases(e.cible) : null;
  const arrivee = enCases(total(e));
  const etapesPas = e.question === "repetition" && e.pas && e.k ? Array.from({ length: e.k }, (_, j) => ({ x: arrivee.x + (j + 1) * e.pas!.x, y: arrivee.y + (j + 1) * e.pas!.y })) : [];

  // Cadre : tous les points (le trajet compris, même s'il n'est pas tracé : la carte ne change pas
  // de cadrage d'un écran à l'autre).
  const tous = [D, ...trajet, ...(cible ? [cible] : []), ...etapesPas];
  let xMin = Math.min(...tous.map((p) => p.x)) - 1;
  let xMax = Math.max(...tous.map((p) => p.x)) + 1;
  let yMin = Math.min(...tous.map((p) => p.y)) - 1;
  let yMax = Math.max(...tous.map((p) => p.y)) + 1;
  while (xMax - xMin < 6) {
    xMax++;
    if (xMax - xMin < 6) xMin--;
  }
  while (yMax - yMin < 5) {
    yMax++;
    if (yMax - yMin < 5) yMin--;
  }
  const nx = xMax - xMin;
  const ny = yMax - yMin;
  const cote = Math.min(CASE_MAX, (LARGEUR - 2 * MARGE) / nx);
  const x0 = (LARGEUR - nx * cote) / 2;
  const y0 = BANDE;
  const hauteur = y0 + ny * cote + MARGE;
  const ecran = (p: Point): Point => ({ x: x0 + (p.x - xMin) * cote, y: y0 + (yMax - p.y) * cote });

  const morceaux: string[] = [];
  const trait = (couleur: string, epaisseur: number, extra = "") => `style="stroke:${couleur};stroke-width:${epaisseur};fill:none;stroke-linecap:round${extra}"`;
  const texte = (x: number, y: number, contenu: string, couleur: string, opts: { ancre?: string; taille?: number; gras?: boolean; italique?: boolean } = {}) =>
    `<text x="${r(x)}" y="${r(y)}" text-anchor="${opts.ancre ?? "middle"}" dominant-baseline="middle" style="fill:${couleur};font-size:${opts.taille ?? 14}px;font-family:${pal.police}${opts.gras ? ";font-weight:700" : ""}${opts.italique ? ";font-style:italic" : ""}">${contenu}</text>`;
  const fleche = (de: Point, vers: Point, couleur: string, epaisseur: number, pointille = false) => {
    const t = Math.atan2(vers.y - de.y, vers.x - de.x);
    const long = 10;
    const larg = 4.6;
    const base = { x: vers.x - long * Math.cos(t), y: vers.y - long * Math.sin(t) };
    morceaux.push(`<line x1="${r(de.x)}" y1="${r(de.y)}" x2="${r(base.x)}" y2="${r(base.y)}" ${trait(couleur, epaisseur, pointille ? ";stroke-dasharray:5 4" : "")} />`);
    morceaux.push(
      `<polygon points="${r(vers.x)},${r(vers.y)} ${r(base.x - larg * Math.sin(t))},${r(base.y + larg * Math.cos(t))} ${r(base.x + larg * Math.sin(t))},${r(base.y - larg * Math.cos(t))}" style="fill:${couleur};stroke:none" />`,
    );
  };

  morceaux.push(`<rect x="0" y="0" width="${LARGEUR}" height="${r(hauteur)}" rx="8" style="fill:${pal.fond};stroke:none" />`);

  // Bande du haut : échelle à gauche, rose des vents à droite.
  const yBande = 30;
  morceaux.push(`<line x1="${r(x0)}" y1="${yBande}" x2="${r(x0 + cote)}" y2="${yBande}" ${trait(pal.encre, 2)} />`);
  morceaux.push(`<line x1="${r(x0)}" y1="${yBande - 4}" x2="${r(x0)}" y2="${yBande + 4}" ${trait(pal.encre, 1.5)} />`);
  morceaux.push(`<line x1="${r(x0 + cote)}" y1="${yBande - 4}" x2="${r(x0 + cote)}" y2="${yBande + 4}" ${trait(pal.encre, 1.5)} />`);
  const echelleTexte = e.situation === "tresor" ? "1 pas" : e.situation === "randonnee" ? "1 km" : "100 m";
  morceaux.push(texte(x0 + cote + 8, yBande, echelleTexte, pal.encre, { ancre: "start", taille: 13 }));
  const cx = LARGEUR - MARGE - 18;
  const rr = 12;
  morceaux.push(`<line x1="${cx - rr}" y1="${yBande}" x2="${cx + rr}" y2="${yBande}" ${trait(pal.axes, 1.2)} />`);
  morceaux.push(`<line x1="${cx}" y1="${yBande + rr}" x2="${cx}" y2="${yBande - rr + 3}" ${trait(pal.axes, 1.2)} />`);
  morceaux.push(`<polygon points="${cx},${yBande - rr - 3} ${cx - 4},${yBande - rr + 4} ${cx + 4},${yBande - rr + 4}" style="fill:${pal.encre};stroke:none" />`);
  morceaux.push(texte(cx, yBande - rr - 11, "N", pal.encre, { taille: 12, gras: true }));
  morceaux.push(texte(cx + rr + 9, yBande, "E", pal.encre, { taille: 12, gras: true }));
  morceaux.push(texte(cx, yBande + rr + 10, "S", pal.encre, { taille: 12, gras: true }));
  morceaux.push(texte(cx - rr - 9, yBande, "O", pal.encre, { taille: 12, gras: true }));

  // Quadrillage.
  for (let i = xMin; i <= xMax; i++) {
    const a = ecran({ x: i, y: yMin });
    const b = ecran({ x: i, y: yMax });
    morceaux.push(`<line x1="${r(a.x)}" y1="${r(a.y)}" x2="${r(b.x)}" y2="${r(b.y)}" ${trait(pal.grille, 1)} />`);
  }
  for (let j = yMin; j <= yMax; j++) {
    const a = ecran({ x: xMin, y: j });
    const b = ecran({ x: xMax, y: j });
    morceaux.push(`<line x1="${r(a.x)}" y1="${r(a.y)}" x2="${r(b.x)}" y2="${r(b.y)}" ${trait(pal.grille, 1)} />`);
  }

  // Axes du repère, issus de D.
  fleche(ecran({ x: xMin, y: 0 }), ecran({ x: xMax, y: 0 }), pal.axes, 1.4);
  fleche(ecran({ x: 0, y: yMin }), ecran({ x: 0, y: yMax }), pal.axes, 1.4);
  const finX = ecran({ x: xMax, y: 0 });
  const finY = ecran({ x: 0, y: yMax });
  morceaux.push(texte(finX.x - 4, finX.y - 10, "x", pal.axes, { taille: 14, italique: true, ancre: "end" }));
  const yAGauche = xMax <= 1;
  morceaux.push(texte(finY.x + (yAGauche ? -10 : 10), finY.y + 6, "y", pal.axes, { taille: 14, italique: true, ancre: yAGauche ? "end" : "start" }));

  // Nom d'un point : à l'opposé des segments tracés qui en partent ou y arrivent (sinon, en haut à
  // gauche), pour ne jamais être caché par une flèche.
  const pointNomme = (p: Point, nom: string, voisins: Point[], couleur = pal.encre) => {
    const s = ecran(p);
    let dx = 0;
    let dy = 0;
    for (const v of voisins) {
      const sv = ecran(v);
      const n = Math.hypot(sv.x - s.x, sv.y - s.y);
      if (n > 1e-6) {
        dx += (sv.x - s.x) / n;
        dy += (sv.y - s.y) / n;
      }
    }
    let n = Math.hypot(dx, dy);
    if (n < 0.3) {
      dx = -1;
      dy = -1;
      n = Math.SQRT2;
    }
    morceaux.push(`<circle cx="${r(s.x)}" cy="${r(s.y)}" r="3.6" style="fill:${couleur};stroke:${pal.fond};stroke-width:1.2" />`);
    morceaux.push(texte(s.x - (dx / n) * 14, s.y - (dy / n) * 14, nom, couleur, { gras: true, taille: 14 }));
  };

  // Trajet et vecteurs du corrigé (dessinés avant les points pour que les noms restent lisibles).
  if (options.trajet || options.complet) {
    let precedent = ecran(D);
    trajet.forEach((p, i) => {
      const s = ecran(p);
      fleche(precedent, s, pal.trajet, 2.4);
      const mx = (precedent.x + s.x) / 2;
      const my = (precedent.y + s.y) / 2;
      const n = Math.hypot(s.x - precedent.x, s.y - precedent.y) || 1;
      const nxp = -(s.y - precedent.y) / n;
      const nyp = (s.x - precedent.x) / n;
      morceaux.push(texte(mx + nxp * 11, my + nyp * 11, String(i + 1), pal.trajet, { taille: 12, gras: true }));
      precedent = s;
    });
    fleche(ecran(D), ecran(arrivee), pal.total, 2.6);
  }
  if (options.complet) {
    if (e.question === "retour") {
      // Vecteur de retour AD, décalé parallèlement au total pour rester visible.
      const a = ecran(arrivee);
      const d = ecran(D);
      const n = Math.hypot(d.x - a.x, d.y - a.y) || 1;
      const ox = (-(d.y - a.y) / n) * 7;
      const oy = ((d.x - a.x) / n) * 7;
      fleche({ x: a.x + ox, y: a.y + oy }, { x: d.x + ox, y: d.y + oy }, pal.final, 2.2, true);
    } else if (e.question === "dernier" && cible) {
      fleche(ecran(arrivee), ecran(cible), pal.final, 2.4);
    } else if (e.question === "repetition") {
      let precedent = ecran(arrivee);
      for (const p of etapesPas) {
        const s = ecran(p);
        fleche(precedent, s, pal.final, 2.2);
        precedent = s;
      }
    }
  }

  // Cible.
  if (cible) {
    const s = ecran(cible);
    if (e.question === "repetition") {
      morceaux.push(`<line x1="${r(s.x - 6)}" y1="${r(s.y - 6)}" x2="${r(s.x + 6)}" y2="${r(s.y + 6)}" ${trait(pal.cible, 2.6)} />`);
      morceaux.push(`<line x1="${r(s.x - 6)}" y1="${r(s.y + 6)}" x2="${r(s.x + 6)}" y2="${r(s.y - 6)}" ${trait(pal.cible, 2.6)} />`);
    } else {
      morceaux.push(`<rect x="${r(s.x - 5)}" y="${r(s.y - 5)}" width="10" height="10" style="fill:${pal.cible};stroke:${pal.fond};stroke-width:1.2" />`);
    }
    morceaux.push(texte(s.x + 13, s.y - 11, nomCible(e) ?? "", pal.cible, { gras: true, taille: 14 }));
  }

  const trace = options.trajet || options.complet;
  const avant = trajet.length >= 2 ? trajet[trajet.length - 2]! : D;
  const apres: Point[] = options.complet && cible ? [e.question === "repetition" ? etapesPas[0]! : cible] : [];
  pointNomme(D, "D", trace ? [trajet[0]!, arrivee, { x: 1, y: 0 }, { x: 0, y: 1 }] : [{ x: 1, y: 0 }, { x: 0, y: 1 }]);
  if (trace) pointNomme(arrivee, nomArrivee(e), [avant, D, ...apres], pal.total);

  const largeurAffichee = options.theme === "papier" ? ` width="${r(LARGEUR * 0.85)}" height="${r(hauteur * 0.85)}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR} ${r(hauteur)}"${largeurAffichee} role="img" aria-label="Carte quadrillée avec rose des vents" style="display:block;${options.theme === "papier" ? `width:${r(LARGEUR * 0.85)}px;` : ""}max-width:100%;height:auto;margin:8px auto">${morceaux.join("")}</svg>`;
}
