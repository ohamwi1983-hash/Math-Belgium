import { WeightedTree } from "../../../components/illustrations/WeightedTree";
import { Katex } from "../components/Katex";
import type { ArbreAffichage, EnTeteTableau, TableauEffectifsAffichage } from "../ui6e/formatArbreTableauEffectifs";

/**
 * Figures de `6gen74` : l'arbre pondéré réutilise le composant des chapitres (`WeightedTree`, mêmes
 * classes `svg-*` du thème, donc clair/sombre suivent la page) ; le tableau d'effectifs reprend la
 * table `.summary-table` des générateurs 6e, avec des champs dans les cases à compléter.
 */

export function ArbreEffectifs({ arbre }: { arbre: ArbreAffichage }) {
  return (
    <div className="figure-arbre-effectifs" style={{ maxWidth: 460, margin: "0.5rem auto" }}>
      <WeightedTree kind="weightedTree" firstLevel={arbre.firstLevel} secondLevel={arbre.secondLevel} />
    </div>
  );
}

function EnTete({ entete }: { entete: EnTeteTableau }) {
  return "latex" in entete ? <Katex expression={entete.latex} /> : <>{entete.texte}</>;
}

interface PropsTableau {
  tableau: TableauEffectifsAffichage;
  /** Saisie (écran « tableau ») : valeur et erreur de chaque case `null`, dans l'ordre de lecture. */
  saisie?: {
    valeurs: string[];
    erreurs: boolean[];
    placeholder: string;
    libelles: string[];
    gele: boolean;
    onChange: (index: number, valeur: string) => void;
  };
}

export function TableauEffectifs({ tableau, saisie }: PropsTableau) {
  let index = -1;
  return (
    <div className="summary-table-scroll">
      <table className="summary-table" style={{ margin: "0.5rem auto" }}>
        <thead>
          <tr>
            <th />
            {tableau.enTetesColonnes.map((c, j) => (
              <th key={j}>
                <EnTete entete={c} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableau.cellules.map((ligne, i) => (
            <tr key={i}>
              <th scope="row">
                <EnTete entete={tableau.enTetesLignes[i]} />
              </th>
              {ligne.map((cellule) => {
                if (cellule.valeur !== null || !saisie) return <td key={cellule.cle}>{cellule.valeur ?? "…"}</td>;
                index += 1;
                const k = index;
                return (
                  <td key={cellule.cle}>
                    <input
                      type="text"
                      inputMode="numeric"
                      aria-label={saisie.libelles[k]}
                      className={`text-input ${saisie.erreurs[k] ? "is-erronee" : ""}`}
                      style={{ width: "4.6em", minWidth: 0, textAlign: "center", padding: "0.3rem 0.25rem" }}
                      value={saisie.valeurs[k]}
                      placeholder={saisie.placeholder}
                      disabled={saisie.gele}
                      onChange={(e) => saisie.onChange(k, e.target.value)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
