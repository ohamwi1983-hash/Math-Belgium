/**
 * Courbe de Gauss (densité de 𝒩(0 ; 1), éventuellement graduée en x = μ + zσ) avec des zones
 * colorées — SVG AUTONOME sans identifiant (écran, papier, corrigé : aucun `id` à dédoublonner),
 * étiquettes en texte SVG à halo blanc (lisibles sur la zone colorée), fond blanc (lisible en thème
 * sombre). 6gen117 (énoncé : aire colorée, quatre figures A–D ; corrigé : aire de la réponse),
 * 6gen116 / 6gen118 / 6gen120 (corrigé : aire calculée).
 */

export interface ZoneCloche {
  /** Bornes en z (−Infinity / Infinity : jusqu'au bord du dessin). */
  de: number;
  a: number;
}

export interface RepereCloche {
  z: number;
  /** Texte sous l'axe (« 1,2 », « μ − 2σ », « 154 »). */
  etiquette: string;
  /** Trait vertical jusqu'à la courbe. */
  trait?: boolean;
}

export interface OptionsCloche {
  zones: ZoneCloche[];
  reperes: RepereCloche[];
  /** Texte posé au milieu de la (première) zone, au-dessus de l'axe (« ? », « 95,4 % »). */
  etiquetteZone?: string;
  /** Largeur du dessin (px, défaut 320). */
  largeur?: number;
  /** Lettre en haut à gauche (« A »…), figures à choisir. */
  lettre?: string;
  /** Description pour les lecteurs d'écran. */
  titre: string;
  /** Demi-largeur de la fenêtre en z (défaut 3,6). */
  zMax?: number;
}

const densite = (z: number) => Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI);
const f = (x: number) => (Math.round(x * 10) / 10).toString();
const echapper = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Contenu (sans la balise `<svg>`) d'une cloche dans le rectangle [x0 ; x0 + l] × [y0 ; y0 + h]. */
function contenuCloche(o: OptionsCloche, x0: number, y0: number, l: number, h: number): string {
  const zMax = o.zMax ?? 3.6;
  const marge = 6;
  const axeY = y0 + h - 20;
  const haut = y0 + (o.lettre ? 16 : 8);
  const X = (z: number) => x0 + marge + ((z + zMax) / (2 * zMax)) * (l - 2 * marge);
  const Y = (d: number) => axeY - (d / densite(0)) * (axeY - haut);
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const z = -zMax + (2 * zMax * i) / 120;
    pts.push(`${f(X(z))},${f(Y(densite(z)))}`);
  }
  let s = "";
  for (const zone of o.zones) {
    const de = Math.max(-zMax, zone.de);
    const a = Math.min(zMax, zone.a);
    if (a <= de) continue;
    const zp: string[] = [`${f(X(de))},${f(axeY)}`];
    const n = Math.max(8, Math.round(((a - de) / (2 * zMax)) * 120));
    for (let i = 0; i <= n; i++) {
      const z = de + ((a - de) * i) / n;
      zp.push(`${f(X(z))},${f(Y(densite(z)))}`);
    }
    zp.push(`${f(X(a))},${f(axeY)}`);
    s += `<polygon points="${zp.join(" ")}" fill="#ffc078" fill-opacity="0.75" stroke="#e8590c" stroke-width="1"/>`;
  }
  s += `<line x1="${f(x0 + 2)}" y1="${f(axeY)}" x2="${f(x0 + l - 2)}" y2="${f(axeY)}" stroke="#495057" stroke-width="1.2"/>`;
  s += `<polyline points="${pts.join(" ")}" fill="none" stroke="#1971c2" stroke-width="2"/>`;
  const halo = `paint-order="stroke" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"`;
  const visibles = o.reperes.filter((r) => r.z >= -zMax && r.z <= zMax).sort((p, q) => p.z - q.z);
  for (const r of visibles) {
    const x = X(r.z);
    s += `<line x1="${f(x)}" y1="${f(axeY - 4)}" x2="${f(x)}" y2="${f(axeY + 4)}" stroke="#495057" stroke-width="1.2"/>`;
    if (r.trait) s += `<line x1="${f(x)}" y1="${f(axeY)}" x2="${f(x)}" y2="${f(Y(densite(r.z)))}" stroke="#495057" stroke-width="1" stroke-dasharray="3 2"/>`;
  }
  // Étiquettes voisines écartées (les graduations restent en place) : deux bornes proches (0,9 et 1,5
  // dans un petit panneau) se touchaient. Largeur estimée à 6,8 px par caractère (12 px), 3 px d'écart.
  const larg = (t: string) => t.length * 6.8;
  const pos = visibles.map((r) => X(r.z));
  for (let passe = 0; passe < 6; passe++) {
    for (let i = 1; i < pos.length; i++) {
      const manque = (larg(visibles[i - 1]!.etiquette) + larg(visibles[i]!.etiquette)) / 2 + 3 - (pos[i]! - pos[i - 1]!);
      if (manque > 0) {
        pos[i - 1] = pos[i - 1]! - manque / 2;
        pos[i] = pos[i]! + manque / 2;
      }
    }
    for (let i = 0; i < pos.length; i++) {
      const w = larg(visibles[i]!.etiquette) / 2;
      pos[i] = Math.min(x0 + l - 2 - w, Math.max(x0 + 2 + w, pos[i]!));
    }
  }
  visibles.forEach((r, i) => {
    s += `<text x="${f(pos[i]!)}" y="${f(axeY + 15)}" font-size="12" text-anchor="middle" fill="#212529" ${halo}>${echapper(r.etiquette)}</text>`;
  });
  if (o.etiquetteZone && o.zones.length) {
    const z0 = o.zones[0]!;
    const de = Math.max(-zMax, z0.de);
    const a = Math.min(zMax, z0.a);
    const zc = Math.abs(a - de) > 1.2 ? (de + a) / 2 : (de + a) / 2;
    const y = Math.min(axeY - 10, Y(densite(zc)) + (axeY - Y(densite(zc))) * 0.55);
    const demi = (o.etiquetteZone.length * 7.8) / 2;
    const xz = Math.min(x0 + l - 3 - demi, Math.max(x0 + 3 + demi, X(zc)));
    s += `<text x="${f(xz)}" y="${f(y)}" font-size="13" font-weight="700" text-anchor="middle" fill="#212529" ${halo}>${echapper(o.etiquetteZone)}</text>`;
  }
  if (o.lettre) s += `<text x="${f(x0 + 6)}" y="${f(y0 + 13)}" font-size="13" font-weight="700" fill="#212529">${echapper(o.lettre)}</text>`;
  return s;
}

/** Une cloche, SVG autonome. */
export function clocheSvg(o: OptionsCloche): string {
  const l = o.largeur ?? 320;
  const h = Math.round(l * 0.47);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${l}" height="${h}" viewBox="0 0 ${l} ${h}" role="img" aria-label="${echapper(o.titre)}" style="max-width:100%;height:auto;background:#ffffff"><rect x="0" y="0" width="${l}" height="${h}" fill="#ffffff"/>${contenuCloche(o, 0, 0, l, h)}</svg>`;
}

/** Quatre cloches A, B, C, D en grille 2 × 2 (choix d'une figure), SVG autonome. */
export function quatreClochesSvg(panneaux: OptionsCloche[], titre: string): string {
  const l = 340;
  const cl = 166;
  const ch = 96;
  const h = 2 * ch + 8;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${l}" height="${h}" viewBox="0 0 ${l} ${h}" role="img" aria-label="${echapper(titre)}" style="max-width:100%;height:auto;background:#ffffff"><rect x="0" y="0" width="${l}" height="${h}" fill="#ffffff"/>`;
  panneaux.forEach((p, i) => {
    const x0 = (i % 2) * (cl + 8);
    const y0 = Math.floor(i / 2) * (ch + 8);
    s += `<rect x="${x0 + 0.5}" y="${y0 + 0.5}" width="${cl - 1}" height="${ch - 1}" fill="none" stroke="#ced4da" rx="4"/>`;
    s += contenuCloche({ ...p, zMax: p.zMax ?? 3.4 }, x0, y0, cl, ch);
  });
  return s + "</svg>";
}

/** Écriture courte d'un nombre pour une étiquette SVG (« 1,2 », « −0,85 »). */
export function nombreSvg(x: number): string {
  const s = (Math.round(x * 100) / 100).toString().replace(".", ",");
  return x < 0 ? s.replace("-", "−") : s;
}
