import type { ExerciceTraverserRiviere } from "../core/traverserRiviere.types";
import { abscisseAccostage, composanteYEnFace, estExacte, valeurAffichee, vitesseReelle } from "../moteur/modeleTraverserRiviere";
import { nombreFr } from "./nombreFr";

/**
 * Figure de gen87 — UNE seule fonction pour l'écran et le papier (énoncé, corrigé `figureHtml`).
 * Vue de dessus : les deux rives, l'eau, le courant (flèches), le repère d'origine D (x vers l'aval,
 * y vers l'autre rive), le point F juste en face et la largeur L.
 * - Énoncé (`resolue` absent) : schéma (pas à l'échelle des distances) ; accostage : la vitesse
 *   propre donnée est tracée en D (à l'échelle des vitesses), le point d'accostage est « ? » ; en
 *   face : la norme de la vitesse propre est un arc de cercle autour de D, sa direction « ? ».
 *   Aucune inconnue n'est placée à sa vraie position.
 * - Corrigé (`resolue`) : À L'ÉCHELLE des distances (L et x_A), trajectoire [DA] (ou [DF]), et en
 *   D le triangle des vitesses : v_p, puis v_c reporté à son extrémité, et v_R = v_p + v_c, porté par
 *   la trajectoire.
 * À l'écran, couleurs du thème (`var(--…)`, suit le mode sombre) ; sur papier, couleurs fixes.
 */

export type ThemeFigure = "ecran" | "papier";

interface Palette {
  fond: string;
  encre: string;
  doux: string;
  eau: string;
  rive: string;
  propre: string;
  courant: string;
  reelle: string;
  trajet: string;
  police: string;
}

const PALETTES: Record<ThemeFigure, Palette> = {
  ecran: {
    fond: "var(--surface)",
    encre: "var(--ink)",
    doux: "var(--ink-soft)",
    eau: "var(--sky)",
    rive: "var(--good)",
    propre: "var(--accent)",
    courant: "var(--sky)",
    reelle: "var(--plan)",
    trajet: "var(--plan)",
    police: "inherit",
  },
  papier: {
    fond: "#ffffff",
    encre: "#1f2933",
    doux: "#52606d",
    eau: "#1c7ed6",
    rive: "#2b8a3e",
    propre: "#c2410c",
    courant: "#1c7ed6",
    reelle: "#7048e8",
    trajet: "#7048e8",
    police: "Helvetica, Arial, sans-serif",
  },
};

interface Pt {
  x: number;
  y: number;
}

const LARGEUR = 360;
const POLICE = 14;
const BANDE = 26;

function r(v: number): string {
  return `${Math.round(v * 10) / 10}`;
}

export function construireFigureTraverserRiviere(e: ExerciceTraverserRiviere, options: { theme: ThemeFigure; resolue?: boolean }): string {
  const pal = PALETTES[options.theme];
  const resolue = !!options.resolue;
  const enFace = e.variante === "enFace";
  const m: string[] = [];

  const trait = (couleur: string, epaisseur: number, extra = "") => `style="stroke:${couleur};stroke-width:${epaisseur};fill:none;stroke-linecap:round${extra}"`;
  const texte = (x: number, y: number, contenu: string, couleur: string, opts: { ancre?: string; taille?: number; gras?: boolean; italique?: boolean } = {}) =>
    `<text x="${r(x)}" y="${r(y)}" text-anchor="${opts.ancre ?? "middle"}" dominant-baseline="middle" style="fill:${couleur};font-size:${opts.taille ?? POLICE}px;font-family:${pal.police}${opts.gras ? ";font-weight:700" : ""}${opts.italique ? ";font-style:italic" : ""}">${contenu}</text>`;
  const fleche = (de: Pt, vers: Pt, couleur: string, epaisseur: number, extra = "") => {
    const t = Math.atan2(vers.y - de.y, vers.x - de.x);
    const long = 10;
    const larg = 4.5;
    if (Math.hypot(vers.x - de.x, vers.y - de.y) < long + 1) return;
    const base = { x: vers.x - long * Math.cos(t), y: vers.y - long * Math.sin(t) };
    m.push(`<line x1="${r(de.x)}" y1="${r(de.y)}" x2="${r(base.x)}" y2="${r(base.y)}" ${trait(couleur, epaisseur, extra)} />`);
    m.push(
      `<polygon points="${r(vers.x)},${r(vers.y)} ${r(base.x - larg * Math.sin(t))},${r(base.y + larg * Math.cos(t))} ${r(base.x + larg * Math.sin(t))},${r(base.y - larg * Math.cos(t))}" style="fill:${couleur};stroke:none" />`,
    );
  };
  /** Étiquette d'un vecteur : « v » italique + indice + petite flèche au-dessus (+ suite éventuelle). */
  const etiquetteVecteur = (cx: number, cy: number, indice: string, couleur: string, suite = "") => {
    const lLettre = POLICE * 0.55;
    const lIndice = POLICE * 0.72 * 0.6 * indice.length;
    const largeur = lLettre + lIndice;
    const x0 = cx - (largeur + suite.length * POLICE * 0.48) / 2;
    m.push(
      `<text x="${r(x0)}" y="${r(cy)}" dominant-baseline="middle" style="fill:${couleur};font-size:${POLICE}px;font-family:${pal.police};font-weight:700"><tspan style="font-style:italic;font-family:'Times New Roman',serif;font-size:${POLICE + 2}px">v</tspan><tspan dy="4" style="font-size:${Math.round(POLICE * 0.72)}px">${indice}</tspan><tspan dy="-4">${suite}</tspan></text>`,
    );
    const yF = cy - POLICE * 0.8;
    m.push(`<line x1="${r(x0 + 1)}" y1="${r(yF)}" x2="${r(x0 + largeur - 2)}" y2="${r(yF)}" ${trait(couleur, 1.1)} />`);
    m.push(`<polygon points="${r(x0 + largeur + 1)},${r(yF)} ${r(x0 + largeur - 4)},${r(yF - 2.4)} ${r(x0 + largeur - 4)},${r(yF + 2.4)}" style="fill:${couleur};stroke:none" />`);
  };
  const point = (p: Pt, nom: string, dx: number, dy: number) => {
    m.push(`<circle cx="${r(p.x)}" cy="${r(p.y)}" r="3" style="fill:${pal.encre}" />`);
    m.push(texte(p.x + dx, p.y + dy, nom, pal.encre, { gras: true }));
  };

  // --- Géométrie : origine D (en bas), F (en haut), échelle des distances. ---------------------
  const xA = abscisseAccostage(e);
  const vR = vitesseReelle(e);
  const vp = enFace ? { x: -e.courant, y: composanteYEnFace(e) } : { x: e.px, y: e.py };
  const longueurs = [Math.hypot(vp.x, vp.y), e.courant, Math.hypot(vR.x, vR.y)];
  // Plafond de la plus longue flèche (px) : la vitesse propre qui remonte le courant (px < 0) déborde
  // à gauche de D, qui est alors décalé vers la droite pour qu'elle reste dans le cadre.
  const plafondV = resolue ? 140 : 105;
  const debordGauche = (Math.max(0, -vp.x) / Math.max(...longueurs)) * plafondV;
  let hauteurEau: number;
  let echelle = 0; // px par mètre (corrigé à l'échelle seulement)
  let xD: number;
  if (resolue && !enFace) {
    xD = Math.max(62, 62 + debordGauche);
    echelle = Math.min((LARGEUR - 34 - xD) / xA, 170 / e.largeur);
    hauteurEau = e.largeur * echelle;
  } else {
    xD = enFace ? 214 : Math.max(70, 62 + debordGauche);
    hauteurEau = 150;
  }
  const yHaut = 12 + BANDE; // bord de l'eau, rive d'arrivée
  const yBas = yHaut + hauteurEau; // bord de l'eau, rive de départ
  const hauteur = yBas + BANDE + 8;
  const D = { x: xD, y: yBas };
  const F = { x: xD, y: yHaut };

  m.push(`<rect x="0" y="0" width="${LARGEUR}" height="${r(hauteur)}" rx="8" style="fill:${pal.fond};stroke:none" />`);
  // Rives (bandes de terre) et eau.
  m.push(`<rect x="0" y="12" width="${LARGEUR}" height="${BANDE}" style="fill:${pal.rive};fill-opacity:0.13;stroke:none" />`);
  m.push(`<rect x="0" y="${r(yBas)}" width="${LARGEUR}" height="${BANDE}" style="fill:${pal.rive};fill-opacity:0.13;stroke:none" />`);
  m.push(`<rect x="0" y="${r(yHaut)}" width="${LARGEUR}" height="${r(hauteurEau)}" style="fill:${pal.eau};fill-opacity:0.08;stroke:none" />`);
  m.push(`<line x1="0" y1="${r(yHaut)}" x2="${LARGEUR}" y2="${r(yHaut)}" ${trait(pal.rive, 1.6)} />`);
  m.push(`<line x1="0" y1="${r(yBas)}" x2="${LARGEUR}" y2="${r(yBas)}" ${trait(pal.rive, 1.6)} />`);

  // Courant : trois petites flèches dans l'eau, loin du point de départ, et sa valeur.
  const yCourant = yHaut + hauteurEau * (enFace ? 0.5 : 0.7);
  const xsCourant = enFace ? [24, 74] : [LARGEUR - 132, LARGEUR - 66];
  for (const x of xsCourant) fleche({ x, y: yCourant }, { x: x + 44, y: yCourant }, pal.courant, 1.6, ";stroke-opacity:0.8");
  const xTexteCourant = enFace ? 72 : LARGEUR - 66;
  m.push(texte(xTexteCourant, yCourant + 16, `courant ${nombreFr(e.courant)} m/s`, pal.courant, { taille: 12 }));

  // Largeur L (cote verticale à gauche du point de départ, ou à droite en face).
  const xCote = enFace ? LARGEUR - 18 : 16;
  fleche({ x: xCote, y: (yHaut + yBas) / 2 }, { x: xCote, y: yHaut + 1 }, pal.doux, 1.1);
  fleche({ x: xCote, y: (yHaut + yBas) / 2 }, { x: xCote, y: yBas - 1 }, pal.doux, 1.1);
  m.push(`<rect x="${r(xCote - 4)}" y="${r((yHaut + yBas) / 2 - 22)}" width="8" height="44" style="fill:${pal.fond};stroke:none" />`);
  m.push(texte(xCote + (enFace ? 0 : 1), (yHaut + yBas) / 2 - 8, "L", pal.doux, { italique: true }));
  m.push(texte(xCote + 1, (yHaut + yBas) / 2 + 8, `${nombreFr(e.largeur)} m`, pal.doux, { taille: 10 }));

  // Ligne « juste en face » [DF] (pointillés).
  m.push(`<line x1="${r(D.x)}" y1="${r(D.y)}" x2="${r(F.x)}" y2="${r(F.y)}" ${trait(pal.doux, 1, ";stroke-dasharray:3 4")} />`);

  // Repère en D : x vers l'aval (sur la rive de départ), y vers l'autre rive.
  fleche({ x: D.x, y: D.y + 14 }, { x: D.x + 44, y: D.y + 14 }, pal.encre, 1.2);
  m.push(texte(D.x + 52, D.y + 14, "x", pal.encre, { italique: true }));
  m.push(texte(D.x + (enFace && resolue ? 12 : -12), F.y + 14, "y", pal.encre, { italique: true }));

  // Échelle des vitesses : la plus longue flèche mesure au plus ~45 % de la largeur dessinée.
  const echelleV = Math.min(hauteurEau * (resolue ? (enFace ? 0.68 : 0.8) : 0.6), plafondV) / Math.max(...longueurs);
  const versEcran = (v: { x: number; y: number }, depuis: Pt = D): Pt => ({ x: depuis.x + v.x * echelleV, y: depuis.y - v.y * echelleV });

  if (!resolue) {
    if (enFace) {
      // Norme connue, direction inconnue : arc de cercle de rayon ‖v_p‖ autour de D.
      const rayon = e.normePropre * echelleV;
      m.push(`<path d="M${r(D.x - rayon)} ${r(D.y)} A${r(rayon)} ${r(rayon)} 0 0 1 ${r(D.x + rayon)} ${r(D.y)}" ${trait(pal.propre, 1.4, ";stroke-dasharray:5 4")} />`);
      const coin = { x: D.x - rayon * Math.cos(Math.PI / 3.2), y: D.y - rayon * Math.sin(Math.PI / 3.2) };
      etiquetteVecteur(coin.x - 26, coin.y - 20, "p", pal.propre, " = ?");
      m.push(texte(D.x + 6, D.y - rayon - 9, `norme ${nombreFr(e.normePropre)} m/s`, pal.propre, { taille: 11, ancre: "start" }));
      m.push(texte(F.x + 8, F.y - 13, "trajectoire voulue : [DF]", pal.doux, { taille: 11, ancre: "start" }));
    } else {
      const bout = versEcran(vp);
      fleche(D, bout, pal.propre, 2.4);
      etiquetteVecteur(bout.x + (vp.x < 0 ? -18 : 18), bout.y + 2, "p", pal.propre);
      // Point d'accostage inconnu, sur l'autre rive, vers l'aval (pas à sa vraie position).
      const xQ = Math.min(LARGEUR - 34, D.x + 190);
      m.push(`<line x1="${r(F.x)}" y1="${r(F.y - 7)}" x2="${r(xQ)}" y2="${r(F.y - 7)}" ${trait(pal.doux, 1, ";stroke-dasharray:2 3")} />`);
      m.push(texte(xQ, F.y - 7, "?", pal.trajet, { gras: true, taille: 17 }));
      m.push(texte((F.x + xQ) / 2 + 6, F.y - 17, "A = ?", pal.trajet, { taille: 12, gras: true }));
    }
  } else if (enFace) {
    const bout = versEcran(vp);
    const R = versEcran(vR);
    fleche(D, F, pal.trajet, 1.6, ";stroke-opacity:0.55");
    fleche(D, bout, pal.propre, 2.4);
    fleche(bout, R, pal.courant, 2.2);
    fleche(D, R, pal.reelle, 2.6);
    etiquetteVecteur(bout.x - 22, bout.y + 8, "p", pal.propre);
    etiquetteVecteur((bout.x + R.x) / 2, bout.y - 14, "c", pal.courant);
    etiquetteVecteur(D.x + 20, (D.y + R.y) / 2 + 6, "R", pal.reelle);
    m.push(texte(bout.x - 6, D.y - 8, `x = −${nombreFr(e.courant)}`, pal.propre, { taille: 11, ancre: "end" }));
    m.push(texte(F.x + 10, F.y - 13, `t ${estExacte(e, "dureeEnFace") ? "=" : "≈"} ${nombreFr(valeurAffichee(e, "dureeEnFace"))} s`, pal.trajet, { taille: 12, ancre: "start", gras: true }));
  } else {
    const A = { x: D.x + xA * echelle, y: yHaut };
    // Trajectoire réelle [DA] et distance x_A le long de la rive d'arrivée.
    m.push(`<line x1="${r(D.x)}" y1="${r(D.y)}" x2="${r(A.x)}" y2="${r(A.y)}" ${trait(pal.trajet, 1.6, ";stroke-dasharray:7 5;stroke-opacity:0.8")} />`);
    m.push(`<line x1="${r(F.x)}" y1="${r(F.y - 7)}" x2="${r(A.x)}" y2="${r(A.y - 7)}" ${trait(pal.trajet, 1.2)} />`);
    const etroit = A.x - F.x < 100;
    m.push(texte(etroit ? A.x + 14 : (F.x + A.x) / 2, F.y - 17, `<tspan style="font-style:italic">x</tspan><tspan dy="3" style="font-size:9px">A</tspan><tspan dy="-3"> = ${nombreFr(xA)} m</tspan>`, pal.trajet, { taille: 12, gras: true, ancre: etroit ? "start" : "middle" }));
    const bout = versEcran(vp);
    const R = versEcran(vR);
    fleche(D, bout, pal.propre, 2.4);
    fleche(bout, R, pal.courant, 2.2);
    fleche(D, R, pal.reelle, 2.6);
    etiquetteVecteur(bout.x + (vp.x < 0 ? -20 : -16), bout.y - 10, "p", pal.propre);
    etiquetteVecteur((bout.x + R.x) / 2, bout.y - 13, "c", pal.courant);
    etiquetteVecteur((D.x + R.x) / 2 + 20, (D.y + R.y) / 2 + 8, "R", pal.reelle);
    point(A, "A", 0, -30);
  }

  point(D, "D", -12, 13);
  point(F, "F", -12, -14);

  const largeurAffichee = options.theme === "papier" ? ` width="${LARGEUR * 0.85}" height="${r(hauteur * 0.85)}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR} ${r(hauteur)}"${largeurAffichee} role="img" aria-label="Traversée d'une rivière, vue de dessus" style="display:block;${options.theme === "papier" ? `width:${LARGEUR * 0.85}px;` : ""}max-width:100%;height:auto;margin:8px auto">${m.join("")}</svg>`;
}
