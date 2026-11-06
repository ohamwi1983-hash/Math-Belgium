import { Katex } from "../components/Katex";

interface Props {
  texte: string;
}

/** Texte et formules mêlés, écrits en `RichText` (`$…$` = LaTeX en ligne) — la même convention que
 * le cours et que `lib/banquesVraiFaux.ts::versFragments` (qui convertit ces chaînes pour les
 * évaluations). Une chaîne sans `$` s'affiche telle quelle : rétrocompatible avec les banques
 * encore écrites en texte brut. */
export function TexteRiche5e({ texte }: Props) {
  const morceaux = texte.split(/\$([^$]+)\$/g);
  return <>{morceaux.map((morceau, i) => (i % 2 === 1 ? <Katex key={i} expression={morceau} /> : morceau === "" ? null : <span key={i}>{morceau}</span>))}</>;
}
