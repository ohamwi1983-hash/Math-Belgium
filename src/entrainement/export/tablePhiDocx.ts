import { AlignmentType, BorderStyle, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, type FileChild } from "docx";
import { COLONNES_TABLE_PHI, LIGNES_TABLE_PHI, formatProba4, formatZ, valeurCase } from "../../lib/tablePhi";
import type { ItemEvaluation } from "./assemblerEvaluationHtml";

/**
 * Annexe « Table de la loi normale centrée réduite » de la copie WORD (6e ch. 8, lot E ; décision de
 * l'utilisateur du 18/11/2026 : UNE table complète en annexe dès qu'une question en a besoin, jamais
 * d'extrait dans l'énoncé). Même source que la page HTML (`lib/tablePhi.ts`, `annexeTableNormale`) :
 * une page à part, en fin de copie, z de 0,00 à 3,49 (35 lignes × 10 colonnes, police 8 pt). Rien
 * n'est ajouté quand aucune question ne la demande : copies des autres chapitres identiques à avant.
 */

/** Largeur utile de la copie Word (twips) — même valeur que `evaluationDocx.ts`. */
const LARGEUR = 9906;
const BORD = { style: BorderStyle.SINGLE, size: 2, color: "9AA4AE" } as const;
const BORDS = { top: BORD, bottom: BORD, left: BORD, right: BORD };
const TAILLE = 16; // demi-points : 8 pt

function cellule(texte: string, largeur: number, entete: boolean): TableCell {
  return new TableCell({
    children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: texte, bold: entete, size: TAILLE, font: "Consolas" })] })],
    borders: BORDS,
    width: { size: largeur, type: WidthType.DXA },
    ...(entete ? { shading: { fill: "EEF1F4" } } : {}),
  });
}

/** La copie contient-elle une question qui demande la table (item ou ligne d'un groupe) ? */
export function copieDemandeTablePhi(items: ItemEvaluation[]): boolean {
  return items.some((it) => it.besoinTablePhi === true || (it.groupe ?? []).some((l) => l.item.besoinTablePhi === true));
}

/** Page d'annexe Word : titre, règle de lecture, table complète. */
export function annexeTablePhiDocx(): FileChild[] {
  const colZ = Math.round(LARGEUR * 0.1);
  const col = Math.floor((LARGEUR - colZ) / COLONNES_TABLE_PHI.length);
  const entete = new TableRow({ tableHeader: true, children: [cellule("z", colZ, true), ...COLONNES_TABLE_PHI.map((c) => cellule(formatZ(c), col, true))] });
  const lignes = LIGNES_TABLE_PHI.map(
    (l, i) => new TableRow({ children: [cellule(l.toFixed(1).replace(".", ","), colZ, true), ...COLONNES_TABLE_PHI.map((_, j) => cellule(formatProba4(valeurCase(i, j)), col, false))] }),
  );
  return [
    new Paragraph({ children: [new TextRun({ text: "Annexe — Table de la loi normale centrée réduite", bold: true, size: 28 })], pageBreakBefore: true, spacing: { after: 80 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Φ(z) = P(Z ≤ z) pour Z ∼ 𝒩(0 ; 1). Ligne : unités et dixième de z ; colonne : centième. Exemple : Φ(1,23) se lit ligne 1,2, colonne 0,03. Pour z < 0 : Φ(−z) = 1 − Φ(z). Au-delà de 3,49 : Φ(z) ≈ 1.",
          size: 18,
        }),
      ],
      spacing: { after: 120 },
    }),
    new Table({ width: { size: colZ + col * COLONNES_TABLE_PHI.length, type: WidthType.DXA }, columnWidths: [colZ, ...COLONNES_TABLE_PHI.map(() => col)], rows: [entete, ...lignes] }),
  ];
}
