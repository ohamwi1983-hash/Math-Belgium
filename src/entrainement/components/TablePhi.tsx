import { useMemo } from "react";
import { lignesTablePhi } from "../../lib/tablePhi";

function virgule(x: number, d: number): string {
  return x.toFixed(d).replace(".", ",");
}

/**
 * Table de Φ CONSULTABLE à l'écran (décision de l'utilisateur, 18/11/2026 : 6gen51 et tout
 * générateur qui en a besoin). Repliée par défaut (« Consulter la table de Φ »), ouverte d'une touche ;
 * défilement horizontal DANS le bloc à 390 px (la page ne déborde jamais), colonne des z collée à
 * gauche. Valeurs : `lib/tablePhi.ts` (même source que les vérifications et que l'annexe papier).
 * Composant partagé : le cours (§ 6) peut l'utiliser tel quel.
 */
export function TablePhi({ ouverte = false }: { ouverte?: boolean }) {
  const lignes = useMemo(() => lignesTablePhi(), []);
  return (
    <details className="table-phi" open={ouverte}>
      <summary>
        Consulter la table de Φ(z) = P(Z ≤ z)
      </summary>
      <p className="table-phi-mode">Ligne : z au dixième ; colonne : centième. Exemple : Φ(1,23) se lit ligne 1,2, colonne 0,03.</p>
      <div className="table-phi-defilement" tabIndex={0} role="region" aria-label="Table de la loi normale centrée réduite">
        <table>
          <thead>
            <tr>
              <th scope="col">z</th>
              {Array.from({ length: 10 }, (_, j) => (
                <th key={j} scope="col">
                  {virgule(j / 100, 2)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => (
              <tr key={l.z}>
                <th scope="row">{virgule(l.z, 1)}</th>
                {l.valeurs.map((v, j) => (
                  <td key={j}>{virgule(v, 4)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
