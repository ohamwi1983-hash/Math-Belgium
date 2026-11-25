import { Katex } from "../components/Katex";

interface Props {
  /** En-têtes des deux lignes (KaTeX), par défaut « xᵢ » et « P(X = xᵢ) ». */
  entetes?: [string, string];
  valeurs: string[];
  probabilites: string[];
  description: string;
}

/**
 * Tableau d'une loi de probabilité (6gen49, 6gen50 — audit, G20 : le tableau KaTeX centré était
 * rogné des deux côtés, sans défilement possible). Vrai tableau HTML, cellules en KaTeX ; s'il est
 * plus large que l'écran, il défile DANS son bloc et commence à gauche (rien n'est inatteignable).
 */
export function TableauLoi({ entetes = ["x_i", "P(X=x_i)"], valeurs, probabilites, description }: Props) {
  return (
    <div className="tableau-loi" role="region" aria-label={description} tabIndex={0}>
      <table>
        <tbody>
          <tr>
            <th scope="row">
              <Katex expression={entetes[0]} />
            </th>
            {valeurs.map((v, i) => (
              <td key={i}>
                <Katex expression={v} />
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row">
              <Katex expression={entetes[1]} />
            </th>
            {probabilites.map((p, i) => (
              <td key={i}>
                <Katex expression={p} />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
