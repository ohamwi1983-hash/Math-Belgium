import { Fragment } from "react";
import { segmentsInsistance } from "./insistanceEcran";

/** Espaces insécables (typographie française, comme `RichText` du cours) : avant « : ; ? ! » et à
 * l'intérieur de « … » — un « « » ne reste jamais seul en fin de ligne. Même longueur de chaîne. */
function insecables(texte: string): string {
  return texte.replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ");
}

/** Texte d'écran dont les mots d'insistance passent en gras minuscule (règle et raisons :
 * `insistanceEcran.ts`), avec les espaces insécables. Ne rend aucun conteneur ; `null` / `undefined` :
 * rien, comme `{texte}`. */
export function TexteInsistance({ texte, debutDePhrase = true }: { texte: string | null | undefined; debutDePhrase?: boolean }) {
  if (texte === null || texte === undefined) return null;
  const propre = insecables(texte);
  const segments = segmentsInsistance(propre, debutDePhrase);
  if (segments.length === 1 && !segments[0].gras) return <>{propre}</>;
  return (
    <>
      {segments.map((s, i) =>
        s.gras ? (
          <strong key={i} className="insistance">
            {s.texte}
          </strong>
        ) : (
          <Fragment key={i}>{s.texte}</Fragment>
        ),
      )}
    </>
  );
}
