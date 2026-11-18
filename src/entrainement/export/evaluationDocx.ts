import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  ImageRun,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  TabStopType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type FileChild,
  type ParagraphChild,
} from "docx";
import { fragmentsVersRunsDocx } from "./fragmentsDocx";
import {
  dateEnToutesLettres,
  dureeEstimeeMinutes,
  nombreFr,
  pointsCriteres,
  pointsParSousQuestion,
  pointsTexte,
  TEXTE_CONSIGNES,
  titreEvaluation,
  titreNettoye,
  type EnteteEvaluation,
  type ItemEvaluation,
} from "./assemblerEvaluationHtml";
import type { BlocCorrection, EtapeCorrection } from "./genererFeuilleExercices";

/**
 * Export Word (.docx) d'une série d'évaluation, pour que le professeur puisse retoucher les
 * documents dans Word avant impression — même contenu que les documents HTML
 * (`assemblerEvaluationHtml.ts`) :
 * - COPIE (énoncé élève) : en-tête, tableau des résultats par processus, calculatrice, encadré
 *   « Consignes », questions numérotées en continu, points par question et par sous-question, pied
 *   de page « Série · Nom · page n / N » ;
 * - CORRIGÉ : la copie (sans tableau des résultats) avec, sous chaque question, son corrigé détaillé
 *   (« Étape n — consigne », lignes Méthode / Calcul / Conclusion…, encadré « Piège ») ;
 * - GRILLE de correction : réponse finale, critères et leurs points, erreurs fréquentes, réponses
 *   acceptées, code de l'exercice, règle de correction.
 *
 * Formules : images PNG (KaTeX rasterisé, `fragmentsDocx.ts` — `docx` n'écrit pas d'équation Word
 * native), comme la copie l'a toujours fait. Graphiques SVG (`enteteHtml` de l'énoncé, `figureHtml`
 * du corrigé, blocs `html` de l'ancien corrigé) : rasterisés en PNG après avoir recopié en ligne les
 * styles calculés par la page (classes `svg-*` du thème) ; en cas d'échec, une mention « graphique :
 * voir la version HTML » les remplace.
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


const ACCENT = "1D5B8F";
const GRIS = "4A4F58";
const ALERTE = "9A3B12";
const BON = "2F6B3A";
/** Largeur utile de la page en twips (A4 11 906 − marges 2 × 1 000). */
const LARGEUR_UTILE = 9906;

/** En-tête commun (école, titre, date · série en gras · durée, champs Nom/Classe/N°). */
function enteteDocx(entete: EnteteEvaluation, items: ItemEvaluation[], suffixe?: string): FileChild[] {
  return [
    new Paragraph({ children: [new TextRun({ text: `${ECOLE} · Mathématiques ${entete.heuresSemaine}h/sem · ${PROFESSEUR}`, size: 16, color: ACCENT })] }),
    new Paragraph({ children: [new TextRun({ text: `${titreEvaluation(entete)}${suffixe ? ` — ${suffixe}` : ""}`, bold: true, size: 32 })], spacing: { before: 60 } }),
    new Paragraph({
      children: [
        new TextRun({ text: `${dateEnToutesLettres(entete.date)} · Série `, size: 18, color: GRIS }),
        // Lettre de série en gras (demande de l'utilisateur), comme dans la copie HTML.
        new TextRun({ text: entete.serieLettre, size: 18, color: "1F2937", bold: true }),
        new TextRun({ text: entete.afficherDuree ? ` · ${dureeEstimeeMinutes(items)} minutes` : "", size: 18, color: GRIS }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({ children: [new TextRun({ text: "Nom : ________________________________    Classe : __________    N° : ____", size: 20 })], spacing: { after: 160 } }),
  ];
}

/** Encadré « Consignes » (même texte que la copie HTML). */
function consignesDocx(entete: EnteteEvaluation, items: ItemEvaluation[]): Paragraph {
  const calculatrice = entete.calculatrice ? ` Calculatrice ${entete.calculatrice === "interdite" ? "interdite" : "autorisée"}.` : "";
  const duree = entete.afficherDuree ? ` Durée : ${dureeEstimeeMinutes(items)} minutes.` : "";
  const bord = { style: BorderStyle.SINGLE, size: 10, color: ACCENT, space: 4 } as const;
  return new Paragraph({
    children: [new TextRun({ text: "Consignes", bold: true, color: ACCENT, size: 20 }), new TextRun({ text: ` — ${TEXTE_CONSIGNES}${calculatrice}${duree}`, size: 20 })],
    border: { top: bord, bottom: bord, left: bord, right: bord },
    shading: { type: ShadingType.CLEAR, color: "auto", fill: "F2F7FC" },
    spacing: { before: 160, after: 120 },
  });
}

/** Bandeau d'un processus (« Processus 2 — Appliquer (8 pts) »). */
function bandeauProcessus(p: 1 | 2 | 3, total: number): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `Processus ${p} — ${NOM_PROCESSUS[p]}`, bold: true, color: ACCENT, size: 24 }), ptsRun(total)],
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 2 } },
    spacing: { before: 320, after: 120 },
    keepNext: true,
  });
}

/** Énoncé d'une question : titre et points, en-tête, figures, sous-questions avec leurs points. */
async function enonceQuestionDocx(item: ItemEvaluation, numero: number): Promise<FileChild[]> {
  const enfants: FileChild[] = [];
  enfants.push(new Paragraph({ children: [new TextRun({ text: `Question ${numero}`, bold: true }), ptsRun(item.points)], spacing: { before: 200 }, keepNext: true }));
  if (item.section.enteteFragments) enfants.push(new Paragraph({ children: await fragmentsVersRunsDocx(item.section.enteteFragments), spacing: { after: 60 } }));
  if (item.section.enteteHtml) enfants.push(...(await htmlVersParagraphes(item.section.enteteHtml)));
  const pts = pointsParSousQuestion(item);
  const plusieurs = item.section.questions.length > 1;
  for (let q = 0; q < item.section.questions.length; q++) {
    const lettre = LETTRES[q] ?? String(q + 1);
    const runs = await fragmentsVersRunsDocx(item.section.questions[q].consigne);
    const p = pts.get(lettre);
    // Points de la sous-question dans une colonne à droite (taquet aligné à droite), comme la copie HTML.
    enfants.push(
      new Paragraph({
        children: [...(plusieurs ? [new TextRun({ text: `${lettre}) `, bold: true })] : []), ...runs, ...(plusieurs && p !== undefined ? [new TextRun({ text: `\t${pointsTexte(p)}`, size: 18, color: GRIS })] : [])],
        tabStops: [{ type: TabStopType.RIGHT, position: LARGEUR_UTILE - (plusieurs ? 240 : 0) }],
        spacing: { before: 60 },
        indent: plusieurs ? { left: 240 } : undefined,
      }),
    );
  }
  return enfants;
}

/** Questions groupées par processus, numérotées en continu. `corrige` : corrigé détaillé sous chacune. */
async function questionsDocx(entete: EnteteEvaluation, items: ItemEvaluation[], corrige: boolean): Promise<FileChild[]> {
  const enfants: FileChild[] = [];
  let numero = 0;
  for (const p of [1, 2, 3] as const) {
    const liste = items.filter((it) => it.processus === p);
    if (liste.length === 0) continue;
    enfants.push(bandeauProcessus(p, liste.reduce((s, it) => s + it.points, 0)));
    let sectionCourante: string | null = null;
    for (const item of liste) {
      numero++;
      if (entete.afficherTitresSection && item.titreSection !== sectionCourante) {
        sectionCourante = item.titreSection;
        enfants.push(new Paragraph({ children: [new TextRun({ text: item.titreSection, size: 18, color: GRIS })], spacing: { before: 120 } }));
      }
      enfants.push(...(await enonceQuestionDocx(item, numero)));
      if (corrige) enfants.push(...(await correctionDocx(item)));
    }
  }
  return enfants;
}

/* ----------------------------------------------------------------------------------------------
 * Corrigé détaillé (même structure que `correctionHtml`)
 * -------------------------------------------------------------------------------------------- */

const COULEUR_CORRIGE = "1155CC";

async function lignesEtapesDocx(etapes: EtapeCorrection[]): Promise<FileChild[]> {
  const enfants: FileChild[] = [];
  const estPiege = (e: EtapeCorrection) => e.label.trim().toLowerCase() === "piège";
  for (const e of etapes.filter((x) => !estPiege(x))) {
    const lbl = `${e.sousQuestion ? `${e.sousQuestion.replace(/\)$/, "")}) ` : ""}${e.label}`.trim();
    enfants.push(
      new Paragraph({
        children: [...(lbl ? [new TextRun({ text: `${lbl}  `, bold: true, color: ACCENT, size: 18 })] : []), ...(await fragmentsVersRunsDocx(e.fragments))],
        spacing: { before: 40 },
        indent: { left: 240 },
      }),
    );
    if (e.figureHtml) enfants.push(...(await htmlVersParagraphes(e.figureHtml)));
  }
  for (const e of etapes.filter(estPiege)) {
    enfants.push(
      new Paragraph({
        children: [new TextRun({ text: "PIÈGE  ", bold: true, color: ALERTE, size: 18 }), ...(await fragmentsVersRunsDocx(e.fragments))],
        shading: { type: ShadingType.CLEAR, color: "auto", fill: "F3F5F8" },
        spacing: { before: 80, after: 40 },
        indent: { left: 240 },
      }),
    );
  }
  return enfants;
}

async function blocCorrectionDocx(bloc: BlocCorrection): Promise<FileChild[]> {
  if (bloc.type === "html") return htmlVersParagraphes(bloc.html);
  if (bloc.type === "tableau") {
    const n = (bloc.valeursParLigne[0]?.length ?? 0) + 1;
    const largeur = Math.floor(LARGEUR_UTILE / n);
    return [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: Array.from({ length: n }, () => largeur),
        rows: bloc.libellesLignes.map((libelle, i) => new TableRow({ children: [cellule(libelle, { gras: true }), ...(bloc.valeursParLigne[i] ?? []).map((v) => cellule(v))] })),
      }),
    ];
  }
  return [new Paragraph({ children: await fragmentsVersRunsDocx(bloc.fragments, { bloc: bloc.bloc }), alignment: bloc.bloc ? AlignmentType.CENTER : undefined, spacing: { before: 40 }, indent: { left: 240 } })];
}

async function correctionDocx(item: ItemEvaluation): Promise<FileChild[]> {
  const enfants: FileChild[] = [new Paragraph({ children: [new TextRun({ text: "Corrigé", bold: true, color: COULEUR_CORRIGE, size: 18 })], spacing: { before: 80 }, keepNext: true })];
  const lignes = item.correctionDetaillee ?? [];
  if (lignes.length === 0) {
    for (const bloc of item.correction) enfants.push(...(await blocCorrectionDocx(bloc)));
    return enfants;
  }
  if (item.etapesCorrige && lignes.some((e) => e.etape !== undefined)) {
    for (let i = 0; i < item.etapesCorrige.length; i++) {
      const groupe = lignes.filter((e) => e.etape === i + 1);
      if (groupe.length === 0) continue;
      const etape = item.etapesCorrige[i];
      enfants.push(
        new Paragraph({
          children: [new TextRun({ text: `${etape.question ? `${etape.question}) ` : ""}Étape ${i + 1} — `, bold: true, color: ACCENT, size: 18 }), ...(await fragmentsVersRunsDocx(etape.consigne))],
          spacing: { before: 100 },
          keepNext: true,
        }),
      );
      enfants.push(...(await lignesEtapesDocx(groupe.map((e) => ({ ...e, sousQuestion: undefined })))));
    }
    const reste = lignes.filter((e) => e.etape === undefined || e.etape > item.etapesCorrige!.length);
    if (reste.length > 0) enfants.push(...(await lignesEtapesDocx(reste)));
    return enfants;
  }
  enfants.push(...(await lignesEtapesDocx(lignes)));
  return enfants;
}

/* ----------------------------------------------------------------------------------------------
 * Documents
 * -------------------------------------------------------------------------------------------- */

/** Pied de page : « Série A · Nom : … » (lettre en gras) à gauche, « page n / N » à droite. */
function piedDocx(serieLettre: string | null, mention?: string): Footer {
  const gauche: ParagraphChild[] = serieLettre
    ? [new TextRun({ text: "Série ", size: 16 }), new TextRun({ text: serieLettre, bold: true, size: 16 }), new TextRun({ text: " · Nom : ……………………………", size: 16 })]
    : [new TextRun({ text: mention ?? "", size: 16, color: GRIS })];
  return new Footer({
    children: [
      new Paragraph({
        children: [...gauche, new TextRun({ children: ["\tpage ", PageNumber.CURRENT, " / ", PageNumber.TOTAL_PAGES], size: 16 })],
        tabStops: [{ type: TabStopType.RIGHT, position: LARGEUR_UTILE }],
      }),
    ],
  });
}

function documentDocx(enfants: FileChild[], pied: Footer): Promise<Blob> {
  const document = new Document({
    styles: { default: { document: { run: { font: "Georgia", size: 22 } } } },
    sections: [{ properties: { page: { margin: { top: 850, bottom: 850, left: 1000, right: 1000 } } }, footers: { default: pied }, children: enfants }],
  });
  return Packer.toBlob(document);
}

export async function genererCopieEvaluationDocx(entete: EnteteEvaluation, items: ItemEvaluation[]): Promise<Blob> {
  const enfants: FileChild[] = [...enteteDocx(entete, items), tableauResultats(items)];
  if (entete.calculatrice) {
    enfants.push(new Paragraph({ children: [new TextRun({ text: `Calculatrice ${entete.calculatrice === "interdite" ? "interdite" : "autorisée"}`, bold: true, color: entete.calculatrice === "interdite" ? ALERTE : BON })], spacing: { before: 120 } }));
  }
  enfants.push(consignesDocx(entete, items));
  enfants.push(...(await questionsDocx(entete, items, false)));
  return documentDocx(enfants, piedDocx(entete.serieLettre));
}

/** Corrigé Word : même contenu que le corrigé HTML (énoncé de chaque question puis son corrigé détaillé). */
export async function genererCorrigeEvaluationDocx(entete: EnteteEvaluation, items: ItemEvaluation[]): Promise<Blob> {
  const enfants: FileChild[] = [...enteteDocx(entete, items, "Corrigé").slice(0, 3), ...(await questionsDocx(entete, items, true))];
  return documentDocx(enfants, piedDocx(null, `${titreEvaluation(entete)} — Série ${entete.serieLettre} — Corrigé`));
}

/** Grille de correction Word : même contenu que la grille HTML (document professeur). */
export async function genererGrilleEvaluationDocx(entete: EnteteEvaluation, items: ItemEvaluation[]): Promise<Blob> {
  const totaux = ([1, 2, 3] as const).map((p) => ({ p, t: items.filter((it) => it.processus === p).reduce((s, it) => s + it.points, 0) })).filter((x) => x.t > 0);
  const total = items.reduce((s, it) => s + it.points, 0);
  const enfants: FileChild[] = [
    new Paragraph({ children: [new TextRun({ text: "Document professeur · Série ", size: 16, color: ACCENT }), new TextRun({ text: entete.serieLettre, size: 16, color: ACCENT, bold: true })] }),
    new Paragraph({ children: [new TextRun({ text: `Grille de correction — ${titreNettoye(entete)}`, bold: true, size: 32 })], spacing: { before: 60 } }),
    new Paragraph({
      children: [new TextRun({ text: `${totaux.map((x) => `${NOM_PROCESSUS[x.p]} ${nombreFr(x.t)}`).join(" · ")} · `, size: 18, color: GRIS }), new TextRun({ text: `Total ${nombreFr(total)}`, size: 18, bold: true })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "1B1D22", space: 4 } },
      spacing: { after: 160 },
    }),
  ];
  let numero = 0;
  for (const p of [1, 2, 3] as const) {
    for (const item of items.filter((it) => it.processus === p)) {
      numero++;
      const tete: ParagraphChild[] = [new TextRun({ text: `Question ${numero} · ${NOM_PROCESSUS[item.processus]} · ${pointsTexte(item.points)}`, bold: true, size: 19 })];
      if (item.bareme) tete.push(new TextRun({ text: "    Réponse : ", size: 19 }), ...(await fragmentsVersRunsDocx(item.bareme.reponseFinale, { gras: true })));
      else if (item.notion) tete.push(new TextRun({ text: `    ${item.notion}`, size: 19 }));
      enfants.push(new Paragraph({ children: tete, shading: { type: ShadingType.CLEAR, color: "auto", fill: "EEF3F8" }, spacing: { before: 200, after: 60 }, keepNext: true }));
      if (!item.bareme || item.bareme.criteres.length === 0) {
        enfants.push(new Paragraph({ children: [new TextRun({ text: `Barème global : ${pointsTexte(item.points)}.`, size: 20, color: GRIS })] }));
        enfants.push(...(await correctionDocx(item)).slice(1));
        continue;
      }
      const pts = pointsCriteres(item);
      const lignes: TableRow[] = [];
      for (let i = 0; i < item.bareme.criteres.length; i++) {
        const c = item.bareme.criteres[i];
        const prefixe = `${c.sousQuestion ? `${c.sousQuestion.replace(/\)$/, "")}) ` : ""}${c.etape ? `Étape ${c.etape} ` : ""}`;
        lignes.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [...(prefixe ? [new TextRun({ text: prefixe, bold: true, color: ACCENT, size: 18 })] : []), ...(await fragmentsVersRunsDocx(c.critere))] })], width: { size: 85, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: nombreFr(pts[i]), bold: true })], alignment: AlignmentType.RIGHT })], width: { size: 15, type: WidthType.PERCENTAGE } }),
            ],
          }),
        );
      }
      enfants.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths: [Math.round(LARGEUR_UTILE * 0.85), Math.round(LARGEUR_UTILE * 0.15)], rows: lignes }));
      const erreurs = item.bareme.erreursFrequentes ?? [];
      if (erreurs.length > 0) {
        const runs: ParagraphChild[] = [new TextRun({ text: "Erreurs fréquentes : ", bold: true, color: ALERTE, size: 20 })];
        for (let i = 0; i < erreurs.length; i++) {
          if (i > 0) runs.push(new TextRun({ text: " ; ", size: 20 }));
          runs.push(...(await fragmentsVersRunsDocx(erreurs[i].description)));
          if (erreurs[i].cout) runs.push(new TextRun({ text: ` → ${erreurs[i].cout}`, size: 20 }));
        }
        enfants.push(new Paragraph({ children: runs, spacing: { before: 60 } }));
      }
      const acceptees = item.bareme.reponsesAcceptees ?? [];
      if (acceptees.length > 0) {
        const runs: ParagraphChild[] = [new TextRun({ text: "Accepter : ", bold: true, color: BON, size: 20 })];
        for (let i = 0; i < acceptees.length; i++) {
          if (i > 0) runs.push(new TextRun({ text: " ; ", size: 20 }));
          runs.push(...(await fragmentsVersRunsDocx(acceptees[i])));
        }
        enfants.push(new Paragraph({ children: runs, spacing: { before: 40 } }));
      }
      if (item.code) enfants.push(new Paragraph({ children: [new TextRun({ text: `code ${item.code.code}`, size: 16, color: GRIS })], spacing: { before: 40 } }));
    }
  }
  const bord = { style: BorderStyle.SINGLE, size: 4, color: "B9BEC7", space: 4 } as const;
  enfants.push(
    new Paragraph({
      children: [new TextRun({ text: "RÈGLE  ", bold: true, color: ACCENT, size: 16 }), new TextRun({ text: "Une erreur n'est pénalisée qu'une fois : si une valeur fausse est réutilisée correctement dans la suite, la suite rapporte ses points.", size: 20 })],
      border: { top: bord, bottom: bord, left: bord, right: bord },
      spacing: { before: 280 },
    }),
  );
  return documentDocx(enfants, piedDocx(null, `${titreEvaluation(entete)} · ${dateEnToutesLettres(entete.date)} · Ne pas distribuer aux élèves`));
}
