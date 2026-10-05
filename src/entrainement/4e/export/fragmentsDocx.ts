import { ImageRun, TextRun, type ParagraphChild } from "docx";
import type { FragmentConsigne } from "../ui/formatEquationDroite";
import { rasteriserLatex } from "./katexImage";

/**
 * Convertit un `FragmentConsigne[]` (texte brut mêlé à du LaTeX inline court — déjà le contrat
 * utilisé côté écran par `RenduFragments.tsx`) en une liste de runs `docx` : le pendant "papier"
 * du même pattern, réutilisable par n'importe quel générateur qui décrit déjà ses
 * consignes/aides sous cette forme. Chaque fragment "latex" devient une `ImageRun` (rasterisation
 * KaTeX, voir katexImage.ts — pas d'équation Word native en v1) ; chaque fragment "texte" reste
 * un `TextRun` normal. `bloc=true` agrandit légèrement le rendu KaTeX (une formule affichée seule
 * sur sa ligne mérite d'être plus lisible sur une feuille imprimée qu'une formule en ligne) —
 * n'affecte que les fragments "latex", jamais le texte environnant.
 */
export async function fragmentsVersRunsDocx(fragments: FragmentConsigne[], options?: { bloc?: boolean; gras?: boolean }): Promise<ParagraphChild[]> {
  const runs: ParagraphChild[] = [];
  for (const fragment of fragments) {
    if (fragment.type === "texte") {
      runs.push(new TextRun({ text: fragment.valeur, bold: options?.gras }));
    } else {
      const image = await rasteriserLatex(fragment.valeur, options?.bloc ?? false);
      runs.push(
        new ImageRun({
          type: "png",
          data: image.donnees,
          transformation: { width: image.largeur, height: image.hauteur },
        }),
      );
    }
  }
  return runs;
}

export function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}

export function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}
