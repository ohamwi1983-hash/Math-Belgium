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
      // Virgule décimale (« 0{,}02 », jamais « 0.02 ») ; arrondi d'affichage contre les artefacts
      // flottants (0.30000000000000004).
      const coefficient = abs === 1 && terme.suffixe !== "" ? "" : String(Number(abs.toFixed(6))).replace(".", "{,}");
      const corps = `${coefficient}${terme.suffixe}`;
      if (index === 0) return terme.valeur < 0 ? `-${corps}` : corps;
      return terme.valeur < 0 ? ` - ${corps}` : ` + ${corps}`;
    })
    .join("");
}
