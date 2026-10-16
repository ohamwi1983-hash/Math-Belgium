/**
 * Couche A — mise en forme du polynôme développé embarqué dans une phrase narrative (`$...$`,
 * `contexte.phraseEnonce`) — même convention que `generateurs/optimisation/formatNarratif.ts`
 * (jamais un coefficient `±1` littéral ni un terme nul), mais réimplémentée ICI plutôt
 * qu'importée : module frère, pas une dépendance vers gen55 (voir `core/equationInequationSecondDegre.types.ts`,
 * en-tête — ce générateur n'importe plus rien de `generateurs/optimisation/`).
 */
export function formatFonctionNarrativeLatex(a: number, b: number, c: number, variable: string): string {
  const termes = [
    { valeur: a, suffixe: `${variable}^2` },
    { valeur: b, suffixe: variable },
    { valeur: c, suffixe: "" },
  ].filter((terme) => terme.valeur !== 0);

  return termes
    .map((terme, index) => {
      const abs = Math.abs(terme.valeur);
      const coefficient = abs === 1 && terme.suffixe !== "" ? "" : String(abs);
      const corps = `${coefficient}${terme.suffixe}`;
      if (index === 0) return terme.valeur < 0 ? `-${corps}` : corps;
      return terme.valeur < 0 ? ` - ${corps}` : ` + ${corps}`;
    })
    .join("");
}
