import type { ExerciceFrequenceProbabilite } from "../core6e/frequenceProbabilite.types";
import { COULEURS } from "./figureRepereIntegrales";
import { couplesDeSomme, frequenceObservee, probabiliteModele, probabiliteNaiveB } from "../moteur6e/verificationFrequenceProbabilite";

/**
 * Figures SVG AUTONOMES de `6gen75` (chaînes de caractères) — utilisées telles quelles par l'appli
 * (rendu en ligne) ET par les corrigés papier (`EtapeCorrection.figureHtml`). Même contrat que
 * `figureRepereIntegrales.ts` : chaque couleur est un jeton du thème avec une valeur de repli
 * littérale (clair/sombre dans l'appli, impression hors de la page).
 *
 * - `svgGrilleSommes` : la grille 6 × 6 des 36 couples (dé 1 ; dé 2), somme dans chaque case ; cases
 *   de l'événement surlignées si demandé (JAMAIS avant la fin de l'écran 1 : ce serait la réponse).
 * - `svgDiagrammeFrequences` : fréquences observées (barres) face aux probabilités du modèle
 *   (traits), et en B le modèle naïf des sommes équiprobables (pointillés).
 */

const fmt = (v: number) => (Math.round(v * 10) / 10).toString();

function echapper(texte: string): string {
  return texte.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function svgGrilleSommes(surlignees: number[] | null): string {
  const c = 30;
  const x0 = 46;
  const y0 = 40;
  const L = x0 + 6 * c + 8;
  const H = y0 + 6 * c + 8;
  const morceaux: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${H}" width="${L}" height="${H}" style="max-width:100%;height:auto" role="img" aria-label="Grille des 36 couples de deux dés">`,
    `<text x="${x0 + 3 * c}" y="12" text-anchor="middle" font-size="11" fill="${COULEURS.doux}">dé 2</text>`,
    `<text x="12" y="${y0 + 3 * c}" text-anchor="middle" font-size="11" fill="${COULEURS.doux}" transform="rotate(-90 12 ${y0 + 3 * c})">dé 1</text>`,
  ];
  for (let j = 1; j <= 6; j++) morceaux.push(`<text x="${x0 + (j - 0.5) * c}" y="${y0 - 8}" text-anchor="middle" font-size="12" font-weight="700" fill="${COULEURS.encre}">${j}</text>`);
  for (let i = 1; i <= 6; i++) {
    morceaux.push(`<text x="${x0 - 10}" y="${y0 + (i - 0.5) * c + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="${COULEURS.encre}">${i}</text>`);
    for (let j = 1; j <= 6; j++) {
      const s = i + j;
      const actif = surlignees !== null && surlignees.includes(s);
      morceaux.push(
        `<rect x="${x0 + (j - 1) * c}" y="${y0 + (i - 1) * c}" width="${c}" height="${c}" fill="${actif ? COULEURS.accentDoux : "none"}" stroke="${actif ? COULEURS.accent : COULEURS.pale}" stroke-width="${actif ? 1.6 : 0.8}"/>`,
        `<text x="${x0 + (j - 0.5) * c}" y="${y0 + (i - 0.5) * c + 4}" text-anchor="middle" font-size="12" ${actif ? 'font-weight="700"' : ""} fill="${actif ? COULEURS.accent : COULEURS.encre}">${s}</text>`,
      );
    }
  }
  morceaux.push("</svg>");
  return morceaux.join("");
}

interface Categorie {
  libelle: string;
  frequence: number;
  modele: number;
  dansEvenement: boolean;
}

function categories(ex: ExerciceFrequenceProbabilite): Categorie[] {
  if (ex.famille === "A") return ex.effectifs.map((eff, i) => ({ libelle: String(i + 1), frequence: eff / ex.n, modele: 1 / 6, dansEvenement: ex.evenement.faces.includes(i + 1) }));
  if (ex.famille === "B") return ex.effectifs.map((eff, i) => ({ libelle: String(i + 2), frequence: eff / ex.n, modele: couplesDeSomme(i + 2) / 36, dansEvenement: ex.evenement.sommes.includes(i + 2) }));
  const p0 = probabiliteModele(ex);
  const f = frequenceObservee(ex);
  return [
    { libelle: ex.objet.issue, frequence: f, modele: p0, dansEvenement: true },
    { libelle: ex.objet.autreIssue, frequence: 1 - f, modele: 1 - p0, dansEvenement: false },
  ];
}

export function svgDiagrammeFrequences(ex: ExerciceFrequenceProbabilite): string {
  const cats = categories(ex);
  const L = 360;
  const H = 230;
  const g = 40;
  const d = 10;
  const h = ex.famille === "B" ? 40 : 26;
  const b = ex.famille === "C" ? 48 : 40;
  const naive = probabiliteNaiveB(ex);
  const vMax = Math.max(...cats.map((k) => Math.max(k.frequence, k.modele)), naive ?? 0);
  const pas = vMax > 0.5 ? 0.2 : vMax > 0.25 ? 0.1 : 0.05;
  const yMax = Math.ceil((vMax * 1.08) / pas) * pas;
  const sy = (v: number) => H - b - (v / yMax) * (H - b - h);
  const largeur = (L - g - d) / cats.length;
  const barre = Math.min(largeur * 0.62, 70);
  const m: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${H}" width="${L}" height="${H}" style="max-width:100%;height:auto" role="img" aria-label="Fréquences observées et probabilités du modèle">`,
  ];
  for (let v = 0; v <= yMax + 1e-9; v += pas) {
    const y = fmt(sy(v));
    m.push(`<line x1="${g}" y1="${y}" x2="${L - d}" y2="${y}" stroke="${COULEURS.pale}" stroke-width="0.5"/>`);
    m.push(`<text x="${g - 5}" y="${fmt(sy(v) + 3.5)}" text-anchor="end" font-size="10" fill="${COULEURS.doux}">${(Math.round(v * 100) / 100).toString().replace(".", ",")}</text>`);
  }
  m.push(`<line x1="${g}" y1="${fmt(sy(0))}" x2="${L - d}" y2="${fmt(sy(0))}" stroke="${COULEURS.doux}" stroke-width="1"/>`);
  cats.forEach((k, i) => {
    const xc = g + (i + 0.5) * largeur;
    const x = xc - barre / 2;
    m.push(
      `<rect x="${fmt(x)}" y="${fmt(sy(k.frequence))}" width="${fmt(barre)}" height="${fmt(sy(0) - sy(k.frequence))}" fill="${k.dansEvenement ? COULEURS.cielDoux : "none"}" stroke="${COULEURS.ciel}" stroke-width="1.2"/>`,
      `<line x1="${fmt(x - 3)}" y1="${fmt(sy(k.modele))}" x2="${fmt(x + barre + 3)}" y2="${fmt(sy(k.modele))}" stroke="${COULEURS.accent}" stroke-width="2.4"/>`,
      `<text x="${fmt(xc)}" y="${fmt(sy(0) + 14)}" text-anchor="middle" font-size="${ex.famille === "C" ? 10 : 11}" fill="${COULEURS.encre}">${echapper(k.libelle)}</text>`,
    );
  });
  if (naive !== null && ex.famille === "B") {
    const unique = 1 / 11;
    m.push(`<line x1="${g}" y1="${fmt(sy(unique))}" x2="${L - d}" y2="${fmt(sy(unique))}" stroke="${COULEURS.mauvais}" stroke-width="1.2" stroke-dasharray="5 4"/>`);
  }
  const titreAxe = ex.famille === "A" ? "face" : ex.famille === "B" ? "somme" : "";
  if (titreAxe) m.push(`<text x="${L - d}" y="${fmt(sy(0) + 28)}" text-anchor="end" font-size="10" fill="${COULEURS.doux}">${titreAxe}</text>`);
  // Légende (en haut).
  const libModele = ex.famille === "A" ? "dé équilibré" : ex.famille === "B" ? "grille 6 × 6" : "valeur affirmée";
  m.push(
    `<rect x="${g}" y="6" width="12" height="10" fill="${COULEURS.cielDoux}" stroke="${COULEURS.ciel}" stroke-width="1.2"/>`,
    `<text x="${g + 16}" y="15" font-size="10" fill="${COULEURS.encre}">fréquence observée</text>`,
    `<line x1="${g + 122}" y1="11" x2="${g + 138}" y2="11" stroke="${COULEURS.accent}" stroke-width="2.4"/>`,
    `<text x="${g + 142}" y="15" font-size="10" fill="${COULEURS.encre}">${libModele}</text>`,
  );
  if (ex.famille === "B") {
    m.push(
      `<line x1="${g}" y1="27" x2="${g + 12}" y2="27" stroke="${COULEURS.mauvais}" stroke-width="1.2" stroke-dasharray="5 4"/>`,
      `<text x="${g + 16}" y="31" font-size="10" fill="${COULEURS.encre}">11 sommes équiprobables</text>`,
    );
  }
  m.push("</svg>");
  return m.join("");
}
