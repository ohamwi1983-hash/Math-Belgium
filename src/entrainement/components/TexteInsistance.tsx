import { Fragment } from "react";
import { segmentsInsistance } from "./insistanceEcran";

/** Texte d'écran dont les mots d'insistance passent en gras minuscule (règle et raisons :
 * `insistanceEcran.ts`). Ne rend aucun conteneur ; `null` / `undefined` : rien, comme `{texte}`. */
export function TexteInsistance({ texte, debutDePhrase = true }: { texte: string | null | undefined; debutDePhrase?: boolean }) {
  if (texte === null || texte === undefined) return null;
  const segments = segmentsInsistance(texte, debutDePhrase);
  if (segments.length === 1 && !segments[0].gras) return <>{texte}</>;
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
