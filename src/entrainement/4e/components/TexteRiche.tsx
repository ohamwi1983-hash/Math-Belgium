import { Katex } from "./Katex";
import { TexteInsistance } from "../../components/TexteInsistance";

interface Props {
  texte: string;
}

/** Texte et formules mêlés, écrits en `RichText` (`$…$` = LaTeX en ligne) — même découpage que
 * `lib/banquesVraiFaux.ts::versFragments` (évaluations papier) et que `TexteRiche5e` (quiz de 5e).
 * Utilisé par les quiz gen61 (`quizEquationsSecondDegre`) et gen63 (`quizCercleTriangles`). Une chaîne sans `$`
 * s'affiche telle quelle. */
export function TexteRiche({ texte }: Props) {
  const morceaux = texte.split(/\$([^$]+)\$/g);
  return <>{morceaux.map((morceau, i) => (i % 2 === 1 ? <Katex key={i} expression={morceau} /> : morceau === "" ? null : <span key={i}><TexteInsistance texte={morceau} debutDePhrase={i === 0} /></span>))}</>;
}
