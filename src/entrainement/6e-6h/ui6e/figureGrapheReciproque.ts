import type { CandidatReciproque, ExerciceGrapheReciproque } from "../core6e/grapheReciproque.types";
import { FENETRE, LETTRES_GRAPHES, noeudTangente, pointA, pointsCandidat, transformer } from "../moteur6e/modeleGrapheReciproque";

/**
 * Figures de `6gen154` « Graphe de la réciproque » : quadrillage d'UNE unité sur [−6 ; 6]², même
 * échelle en x et en y (la droite y = x est à 45°), nombres écrits sur chaque ligne entière ; les
 * extrémités de la courbe (point plein / rond vide), le point A et le second nœud de la tangente sont
 * sur des intersections. Chaîne SVG AUTONOME : la même à l'écran, sur papier (`enteteHtml`) et dans
 * le corrigé (`figureHtml`). Identifiants de `clipPath` dérivés du contenu (jamais d'un compteur).
 */

type E = ExerciceGrapheReciproque;

const COULEUR_GRILLE = "#d8dee6";
const COULEUR_AXE = "#495057";
const COULEUR_F = "#1971c2";
const COULEUR_REC = "#2f9e44";
const COULEUR_TANGENTE = "#e8590c";
const COULEUR_DIAG = "#868e96";
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = 'stroke="#ffffff" stroke-width="3" stroke-linejoin="round" paint-order="stroke"';
const f1 = (v: number) => v.toFixed(1);
const nombre = (v: number) => (v < 0 ? `−${Math.abs(v)}` : String(v));

function empreinte(texte: string): string {
  let h = 5381;
  for (let i = 0; i < texte.length; i++) h = ((h * 33) ^ texte.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

interface Trace {
  points: [number, number][];
  couleur: string;
  epaisseur?: number;
  tirets?: string;
  /** Extrémités : rond plein (false) ou vide (true) ; absent : aucune marque. */
  bouts?: [boolean, boolean];
}

interface Repere {
  x: number;
  y: number;
  label: string;
  couleur: string;
  /** Position de l'étiquette par rapport au point. */
  cote?: "ne" | "no" | "se" | "so";
}

interface OptionsPanneau {
  ox: number;
  oy: number;
  carreau: number;
  traces: Trace[];
  reperes?: Repere[];
  graduations: boolean;
  titre?: string;
}

/** Un panneau (repère + traces) en coordonnées SVG absolues. */
function panneau(o: OptionsPanneau): string {
  const W = FENETRE;
  const c = o.carreau;
  const X = (x: number) => o.ox + (x + W) * c;
  const Y = (y: number) => o.oy + (W - y) * c;
  const taille = 2 * W * c;
  const parts: string[] = [];
  const id = `gr${empreinte(JSON.stringify([o.ox, o.oy, o.traces.map((t) => t.points.slice(0, 3))]))}`;
  parts.push(`<clipPath id="${id}"><rect x="${f1(o.ox)}" y="${f1(o.oy)}" width="${f1(taille)}" height="${f1(taille)}"/></clipPath>`);
  for (let k = -W; k <= W; k++) {
    parts.push(`<line x1="${f1(X(k))}" y1="${f1(o.oy)}" x2="${f1(X(k))}" y2="${f1(o.oy + taille)}" stroke="${k === 0 ? COULEUR_AXE : COULEUR_GRILLE}" stroke-width="${k === 0 ? 1.4 : 0.8}"/>`);
    parts.push(`<line x1="${f1(o.ox)}" y1="${f1(Y(k))}" x2="${f1(o.ox + taille)}" y2="${f1(Y(k))}" stroke="${k === 0 ? COULEUR_AXE : COULEUR_GRILLE}" stroke-width="${k === 0 ? 1.4 : 0.8}"/>`);
  }
  // droite y = x
  parts.push(`<line x1="${f1(X(-W))}" y1="${f1(Y(-W))}" x2="${f1(X(W))}" y2="${f1(Y(W))}" stroke="${COULEUR_DIAG}" stroke-width="1" stroke-dasharray="4 3"/>`);
  if (o.graduations) {
    const fs = Math.max(9, Math.round(c * 0.42));
    for (let k = -W + 1; k <= W - 1; k++) {
      if (k === 0) continue;
      parts.push(`<text x="${f1(X(k))}" y="${f1(Y(0) + fs + 2)}" font-size="${fs}" text-anchor="middle" fill="${COULEUR_AXE}" ${POLICE} ${HALO}>${nombre(k)}</text>`);
      parts.push(`<text x="${f1(X(0) - 3)}" y="${f1(Y(k) + fs / 3)}" font-size="${fs}" text-anchor="end" fill="${COULEUR_AXE}" ${POLICE} ${HALO}>${nombre(k)}</text>`);
    }
    parts.push(`<text x="${f1(X(0) - 3)}" y="${f1(Y(0) + fs + 2)}" font-size="${fs}" text-anchor="end" fill="${COULEUR_AXE}" ${POLICE} ${HALO}>0</text>`);
    parts.push(`<text x="${f1(X(W) - 4)}" y="${f1(Y(0) - 4)}" font-size="${fs + 1}" text-anchor="end" font-style="italic" fill="${COULEUR_AXE}" ${POLICE} ${HALO}>x</text>`);
    parts.push(`<text x="${f1(X(0) + 5)}" y="${f1(Y(W) + fs + 2)}" font-size="${fs + 1}" font-style="italic" fill="${COULEUR_AXE}" ${POLICE} ${HALO}>y</text>`);
  }
  for (const t of o.traces) {
    const d = t.points.map((p, i) => `${i === 0 ? "M" : "L"}${f1(X(p[0]))} ${f1(Y(p[1]))}`).join(" ");
    parts.push(`<path d="${d}" fill="none" stroke="${t.couleur}" stroke-width="${t.epaisseur ?? 2.2}" ${t.tirets ? `stroke-dasharray="${t.tirets}"` : ""} clip-path="url(#${id})"/>`);
    if (t.bouts) {
      const r = Math.max(2.6, c * 0.16);
      [t.points[0], t.points[t.points.length - 1]].forEach((p, i) => {
        parts.push(`<circle cx="${f1(X(p[0]))}" cy="${f1(Y(p[1]))}" r="${f1(r)}" fill="${t.bouts![i] ? "#ffffff" : t.couleur}" stroke="${t.couleur}" stroke-width="1.6"/>`);
      });
    }
  }
  for (const p of o.reperes ?? []) {
    const fs = Math.max(11, Math.round(c * 0.5));
    parts.push(`<circle cx="${f1(X(p.x))}" cy="${f1(Y(p.y))}" r="3.4" fill="${p.couleur}"/>`);
    const cote = p.cote ?? "no";
    const dx = cote.endsWith("e") ? 6 : -6;
    const dy = cote.startsWith("n") ? -6 : fs + 2;
    parts.push(`<text x="${f1(X(p.x) + dx)}" y="${f1(Y(p.y) + dy)}" font-size="${fs}" font-weight="600" text-anchor="${dx > 0 ? "start" : "end"}" fill="${p.couleur}" ${POLICE} ${HALO}>${p.label}</text>`);
  }
  if (o.titre) parts.push(`<text x="${f1(o.ox + taille / 2)}" y="${f1(o.oy - 8)}" font-size="14" font-weight="700" text-anchor="middle" fill="#2b2d42" ${POLICE}>${o.titre}</text>`);
  return parts.join("");
}

/** Côté de l'étiquette d'un point, à l'opposé de la courbe (pente positive : nord-ouest / sud-est). */
function coteEtiquette(pente: number): "no" | "se" | "ne" | "so" {
  return pente > 0 ? "no" : "ne";
}

/** Figure principale : f (bouts plein / vide), A, la tangente en A (option). */
export function figurePrincipale(e: E, options: { tangente: boolean; largeur?: number }): string {
  const c = 26;
  const marge = 14;
  const taille = 2 * FENETRE * c;
  const L = taille + 2 * marge;
  const A = pointA(e);
  const traces: Trace[] = [{ points: pointsCandidat(e, "f"), couleur: COULEUR_F, bouts: e.ouvert }];
  if (options.tangente) {
    const N = noeudTangente(e);
    const dx = N[0] - A[0];
    const dy = N[1] - A[1];
    traces.push({ points: [[A[0] - 1.6 * dx, A[1] - 1.6 * dy], [A[0] + 1.6 * dx, A[1] + 1.6 * dy]], couleur: COULEUR_TANGENTE, epaisseur: 1.6, tirets: "6 4" });
  }
  const corps = panneau({ ox: marge, oy: marge, carreau: c, traces, reperes: [{ x: A[0], y: A[1], label: "A", couleur: "#2b2d42", cote: coteEtiquette(e.p) }], graduations: true });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${L}" width="${options.largeur ?? L}" height="${options.largeur ?? L}" role="img" aria-label="Graphe de f sur un quadrillage">${corps}</svg>`;
}

/** Les quatre graphes candidats (2 × 2) : f en gris pointillé, le candidat en vert, y = x. */
export function figureCandidats(e: E): string {
  const c = 13;
  const taille = 2 * FENETRE * c;
  const mx = 14;
  const my = 28;
  const L = 2 * (taille + 2 * mx);
  const H = 2 * (taille + my + 8);
  const parts: string[] = [];
  e.candidats.forEach((cand: CandidatReciproque, i) => {
    const col = i % 2;
    const lig = Math.floor(i / 2);
    const ox = mx + col * (taille + 2 * mx);
    const oy = my + lig * (taille + my + 8);
    const pts = pointsCandidat(e, cand);
    parts.push(
      panneau({
        ox,
        oy,
        carreau: c,
        graduations: false,
        titre: `Graphe ${LETTRES_GRAPHES[i]}`,
        traces: [
          { points: pointsCandidat(e, "f"), couleur: COULEUR_DIAG, epaisseur: 1.3, tirets: "3 3" },
          { points: pts, couleur: COULEUR_REC, epaisseur: 2, bouts: e.ouvert },
        ],
      }),
    );
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${H}" width="${L}" height="${H}" role="img" aria-label="Quatre graphes candidats A, B, C, D">${parts.join("")}</svg>`;
}

/** Figure du corrigé : f, f⁻¹, y = x, A et A′, tangentes en A et en A′. */
export function figureCorrige(e: E): string {
  const c = 22;
  const marge = 14;
  const L = 2 * FENETRE * c + 2 * marge;
  const A = pointA(e);
  const Ap = transformer("reciproque", A);
  const N = noeudTangente(e);
  const dx = N[0] - A[0];
  const dy = N[1] - A[1];
  const tan: [number, number][] = [[A[0] - 1.6 * dx, A[1] - 1.6 * dy], [A[0] + 1.6 * dx, A[1] + 1.6 * dy]];
  const corps = panneau({
    ox: marge,
    oy: marge,
    carreau: c,
    graduations: true,
    traces: [
      { points: pointsCandidat(e, "f"), couleur: COULEUR_F, bouts: e.ouvert },
      { points: pointsCandidat(e, "reciproque"), couleur: COULEUR_REC, bouts: e.ouvert },
      { points: tan, couleur: COULEUR_TANGENTE, epaisseur: 1.4, tirets: "6 4" },
      { points: tan.map((p) => transformer("reciproque", p)), couleur: COULEUR_TANGENTE, epaisseur: 1.4, tirets: "6 4" },
    ],
    reperes: [
      { x: A[0], y: A[1], label: "A", couleur: COULEUR_F, cote: coteEtiquette(e.p) },
      { x: Ap[0], y: Ap[1], label: "A′", couleur: COULEUR_REC, cote: coteEtiquette(e.p) === "no" ? "se" : "so" },
    ],
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${L}" width="${L}" height="${L}" role="img" aria-label="f, sa réciproque et la droite y = x">${corps}</svg>`;
}
