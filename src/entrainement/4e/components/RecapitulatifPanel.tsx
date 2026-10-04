import { Katex } from "./Katex";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";

interface Props {
  entrees: EntreeRecapitulatif[];
}

export function RecapitulatifPanel({ entrees }: Props) {
  if (entrees.length === 0) return null;

  return (
    <ul className="recap-list">
      {entrees.map((entree) => (
        <li key={entree.libelle} className="recap-item">
          <span className="recap-libelle">{entree.libelle} :</span>{" "}
          {entree.valeurs !== undefined ? (
            <span className="equation-box-termes">
              {entree.valeurs.map((valeur, i) => (
                <Katex key={i} expression={valeur} />
              ))}
            </span>
          ) : entree.estLatex ? (
            <Katex expression={entree.valeur} />
          ) : (
            entree.valeur
          )}
        </li>
      ))}
    </ul>
  );
}
