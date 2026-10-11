import { Katex } from "../components/Katex";
import type { EntreeRecapitulatif } from "../ui6e/recapitulatif";

interface Props {
  entrees: EntreeRecapitulatif[];
}

/** Coche/croix devant chaque ligne — mêmes tracés que les équivalents 4e/5e-4h du même nom,
 * dupliqué ici pour la même raison que `Katex.tsx` (indépendance des chantiers). */
function IconeRecap({ revele }: { revele: boolean }) {
  return revele ? (
    <svg className="recap-icone-svg" viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
      <path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z" />
    </svg>
  ) : (
    <svg className="recap-icone-svg" viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
      <path fill="currentColor" d="M4.3 12.5 9 17.2 19.7 6.5 18.3 5.1 9 14.4 5.7 11.1Z" />
    </svg>
  );
}

/**
 * Récapitulatif accumulé des étapes déjà closes de l'exercice en cours — équivalent 6e-6h du
 * composant du même nom en 4e/5e-4h : toujours la valeur confirmée (jamais la saisie de l'élève),
 * avec une icône ✓/✗ devant chaque ligne (`entree.revele`).
 */
export function RecapitulatifPanel({ entrees }: Props) {
  if (entrees.length === 0) return null;

  return (
    <div className="recap-panel">
      <p className="recap-panel-titre">Ce qu'on sait déjà</p>
      <ul className="recap-list">
        {entrees.map((entree) => (
          <li key={entree.libelle} className="recap-item">
            <span className={`recap-icone ${entree.revele ? "recap-icone-revele" : "recap-icone-correcte"}`}>
              <IconeRecap revele={entree.revele} />
            </span>
            <span className="recap-corps">
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
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
