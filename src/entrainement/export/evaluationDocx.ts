import { AlignmentType, BorderStyle, Document, ImageRun, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, type FileChild, type ParagraphChild } from "docx";
import { fragmentsVersRunsDocx } from "./fragmentsDocx";
import { dateEnToutesLettres, dureeEstimeeMinutes, nombreFr, pointsParSousQuestion, pointsTexte, titreEvaluation, type EnteteEvaluation, type ItemEvaluation } from "./assemblerEvaluationHtml";

/**
 * Export Word (.docx) de la COPIE d'une évaluation (énoncé élève) — même contenu que la copie HTML
 * (`assemblerEvaluationHtml.ts`) : en-tête, tableau des résultats par processus, calculatrice,
 * questions numérotées en continu, points par question et par sous-question. Pour que le
 * professeur puisse retoucher la copie dans Word avant impression.
 *
 * Formules : images PNG (KaTeX rasterisé, `fragmentsDocx.ts` — `docx` n'écrit pas d'équation Word
 * native). Graphiques SVG (`enteteHtml`) : rasterisés en PNG après avoir recopié en ligne les styles
 * calculés par la page (classes `svg-*` du thème) ; en cas d'échec, une mention « graphique : voir
 * la version HTML » les remplace. Le corrigé et la grille restent en HTML/PDF.
 */

const NOM_PROCESSUS: Record<1 | 2 | 3, string> = { 1: "Connaître", 2: "Appliquer", 3: "Transférer" };
const LETTRES = "abcdefghijklmnopqrstuvwxyz";
const ECOLE = "Collège Saint-Pierre · Rue J.B. Verbeyst 25, 1090 Bruxelles";
const PROFESSEUR = "M. Hamwi";

const PROPRIETES_SVG = ["fill", "stroke", "stroke-width", "stroke-dasharray", "opacity", "fill-opacity", "stroke-opacity", "font-size", "font-family", "font-weight", "text-anchor", "dominant-baseline"];

async function svgVersPng(svg: SVGSVGElement): Promise<{ donnees: Uint8Array; largeur: number; hauteur: number } | null> {
  const rect = svg.getBoundingClientRect();
  const largeur = Math.round(rect.width || Number(svg.getAttribute("width")) || 300);
  const hauteur = Math.round(rect.height || Number(svg.getAttribute("height")) || 200);
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const originaux = [svg, ...Array.from(svg.querySelectorAll("*"))];
  const copies = [clone, ...Array.from(clone.querySelectorAll("*"))];
  originaux.forEach((el, i) => {
    const style = getComputedStyle(el);
    const cible = copies[i] as SVGElement;
    for (const p of PROPRIETES_SVG) {
      const v = style.getPropertyValue(p);
      if (v) cible.style.setProperty(p, v);
    }
  });
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(largeur));
  clone.setAttribute("height", String(hauteur));
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    await new Promise<void>((ok, ko) => {
      img.onload = () => ok();
      img.onerror = () => ko(new Error("svg"));
      img.src = url;
    });
    const echelle = 2;
    const canvas = document.createElement("canvas");
    canvas.width = largeur * echelle;
    canvas.height = hauteur * echelle;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/png"));
    if (!blob) return null;
    return { donnees: new Uint8Array(await blob.arrayBuffer()), largeur, hauteur };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Graphiques d'un `enteteHtml` → paragraphes image (montés hors écran le temps du calcul des styles). */
async function htmlVersParagraphes(html: string): Promise<FileChild[]> {
  const hote = document.createElement("div");
  hote.style.cssText = "position:fixed;left:-10000px;top:0;width:700px;background:#fff";
  hote.innerHTML = html;
  document.body.appendChild(hote);
  try {
    const svgs = Array.from(hote.querySelectorAll("svg"));
    if (svgs.length === 0) return [];
    const runs: ParagraphChild[] = [];
    for (const svg of svgs) {
      const png = await svgVersPng(svg);
      if (png) {
        // Largeur maximale ≈ 8 cm à 96 dpi pour garder la mise en page compacte.
        const facteur = Math.min(1, 300 / png.largeur);
        runs.push(new ImageRun({ type: "png", data: png.donnees, transformation: { width: Math.round(png.largeur * facteur), height: Math.round(png.hauteur * facteur) } }), new TextRun("  "));
      } else {
        runs.push(new TextRun({ text: "[graphique : voir la version HTML] ", italics: true }));
      }
    }
    return [new Paragraph({ children: runs, alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })];
  } finally {
    hote.remove();
  }
}

function cellule(texteCellule: string, options?: { gras?: boolean; largeur?: number }): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: texteCellule, bold: options?.gras, size: 18 })], alignment: AlignmentType.CENTER })],
    width: options?.largeur ? { size: options.largeur, type: WidthType.PERCENTAGE } : undefined,
  });
}

function tableauResultats(items: ItemEvaluation[]): Table {
  const totaux = ([1, 2, 3] as const).map((p) => ({ p, t: items.filter((it) => it.processus === p).reduce((s, it) => s + it.points, 0) })).filter((x) => x.t > 0);
  const total = items.reduce((s, it) => s + it.points, 0);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [cellule("Processus", { gras: true }), ...totaux.map((x) => cellule(NOM_PROCESSUS[x.p], { gras: true })), cellule("Total", { gras: true })] }),
      new TableRow({ children: [cellule("Points"), ...totaux.map((x) => cellule(`…… / ${nombreFr(x.t)}`)), cellule(`…… / ${nombreFr(total)}`, { gras: true })] }),
    ],
  });
}

function ptsRun(points: number): TextRun {
  return new TextRun({ text: `  (${pointsTexte(points)})`, size: 18, color: "4A4F58" });
}

export async function genererCopieEvaluationDocx(entete: EnteteEvaluation, items: ItemEvaluation[]): Promise<Blob> {
  const enfants: FileChild[] = [];
  enfants.push(new Paragraph({ children: [new TextRun({ text: `${ECOLE} · Mathématiques ${entete.heuresSemaine}h/sem · ${PROFESSEUR}`, size: 16, color: "1D5B8F" })] }));
  enfants.push(new Paragraph({ children: [new TextRun({ text: titreEvaluation(entete), bold: true, size: 32 })], spacing: { before: 60 } }));
  enfants.push(
    new Paragraph({
      children: [new TextRun({ text: `${dateEnToutesLettres(entete.date)} · Série ${entete.serieLettre} · ${dureeEstimeeMinutes(items)} minutes`, size: 18, color: "4A4F58" })],
      spacing: { after: 120 },
    }),
  );
  enfants.push(new Paragraph({ children: [new TextRun({ text: "Nom : ________________________________    Classe : __________    N° : ____", size: 20 })], spacing: { after: 160 } }));
  enfants.push(tableauResultats(items));
  if (entete.calculatrice) {
    enfants.push(new Paragraph({ children: [new TextRun({ text: `Calculatrice ${entete.calculatrice === "interdite" ? "interdite" : "autorisée"}`, bold: true, color: entete.calculatrice === "interdite" ? "9A3B12" : "2F6B3A" })], spacing: { before: 120 } }));
  }

  let numero = 0;
  for (const p of [1, 2, 3] as const) {
    const liste = items.filter((it) => it.processus === p);
    if (liste.length === 0) continue;
    const totalP = liste.reduce((s, it) => s + it.points, 0);
    enfants.push(
      new Paragraph({
        children: [new TextRun({ text: `Processus ${p} — ${NOM_PROCESSUS[p]}`, bold: true, color: "1D5B8F", size: 24 }), ptsRun(totalP)],
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "1D5B8F", space: 2 } },
        spacing: { before: 320, after: 120 },
        keepNext: true,
      }),
    );
    let sectionCourante: string | null = null;
    for (const item of liste) {
      numero++;
      if (entete.afficherTitresSection && item.titreSection !== sectionCourante) {
        sectionCourante = item.titreSection;
        enfants.push(new Paragraph({ children: [new TextRun({ text: item.titreSection, size: 18, color: "4A4F58" })], spacing: { before: 120 } }));
      }
      enfants.push(new Paragraph({ children: [new TextRun({ text: `Question ${numero}`, bold: true }), ptsRun(item.points)], spacing: { before: 200 }, keepNext: true }));
      if (item.section.enteteFragments) enfants.push(new Paragraph({ children: await fragmentsVersRunsDocx(item.section.enteteFragments), spacing: { after: 60 } }));
      if (item.section.enteteHtml) enfants.push(...(await htmlVersParagraphes(item.section.enteteHtml)));
      const pts = pointsParSousQuestion(item);
      const plusieurs = item.section.questions.length > 1;
      for (let q = 0; q < item.section.questions.length; q++) {
        const lettre = LETTRES[q] ?? String(q + 1);
        const runs = await fragmentsVersRunsDocx(item.section.questions[q].consigne);
        const p = pts.get(lettre);
        enfants.push(
          new Paragraph({
            children: [...(plusieurs ? [new TextRun({ text: `${lettre}) `, bold: true })] : []), ...runs, ...(plusieurs && p !== undefined ? [ptsRun(p)] : [])],
            spacing: { before: 60 },
            indent: plusieurs ? { left: 240 } : undefined,
          }),
        );
      }
    }
  }

  const document = new Document({
    styles: { default: { document: { run: { font: "Georgia", size: 22 } } } },
    sections: [{ properties: { page: { margin: { top: 850, bottom: 850, left: 1000, right: 1000 } } }, children: enfants }],
  });
  return Packer.toBlob(document);
}
