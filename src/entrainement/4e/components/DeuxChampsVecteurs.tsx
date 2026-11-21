import { Katex } from "./Katex";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  id: string;
  /** Libellés LaTeX (« x_{A'} = », « x_{\vec t} = »). */
  labelX: string;
  labelY: string;
  texteX: string;
  texteY: string;
  onX: (t: string) => void;
  onY: (t: string) => void;
  erreurX?: boolean;
  erreurY?: boolean;
  desactive?: boolean;
}

/** Deux champs de saisie libre côte à côte (coordonnées d'un point, composantes d'un vecteur) des
 * anciens générateurs du 4e ch. 6 : jamais de blocage de frappe, seulement `normaliserSigneMoins`
 * (« − – — » → « - »), règle CLAUDE.md. */
export function DeuxChampsVecteurs({ id, labelX, labelY, texteX, texteY, onX, onY, erreurX, erreurY, desactive }: Props) {
  return (
    <div className="field-row">
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor={`${id}-x`}>
          <Katex expression={labelX} />
        </label>
        <input id={`${id}-x`} className={`text-input${erreurX ? " is-erronee" : ""}`} value={texteX} disabled={desactive} onChange={(e) => onX(normaliserSigneMoins(e.target.value))} />
      </div>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor={`${id}-y`}>
          <Katex expression={labelY} />
        </label>
        <input id={`${id}-y`} className={`text-input${erreurY ? " is-erronee" : ""}`} value={texteY} disabled={desactive} onChange={(e) => onY(normaliserSigneMoins(e.target.value))} />
      </div>
    </div>
  );
}
