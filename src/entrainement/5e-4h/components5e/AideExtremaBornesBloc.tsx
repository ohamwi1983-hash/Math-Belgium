import type { AideExtremaBornes } from "../ui5e/formatExtremaBornes";
import { Katex } from "../components/Katex";
import { TexteRiche5e } from "./TexteRiche5e";

interface Props {
  niveauAide: number;
  niveau1: AideExtremaBornes;
  niveau2: AideExtremaBornes;
}

/** Bloc d'aides de 5gen34 — prose (formules courtes en `$…$`) puis formule display éventuelle :
 * jamais de formule écrite au clavier dans le texte. */
export function AideExtremaBornesBloc({ niveauAide, niveau1, niveau2 }: Props) {
  if (niveauAide < 1) return null;
  const aides = niveauAide >= 2 ? [niveau1, niveau2] : [niveau1];
  return (
    <div className="aide-5e">
      {aides.map((aide, i) => (
        <div key={i}>
          <p>
            <TexteRiche5e texte={aide.texte} />
          </p>
          {aide.latex && <Katex expression={aide.latex} block />}
        </div>
      ))}
    </div>
  );
}
