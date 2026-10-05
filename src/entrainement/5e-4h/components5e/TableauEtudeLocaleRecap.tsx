import type { ColonneTableauEtudeLocale } from "../core5e/etudeLocale.types";
import type { TableauEtudeLocaleAttendu } from "../moteur5e/verificationEtudeLocale";
import { libelleLigne2Tableau, libelleSigneTableau } from "../ui5e/formatEtudeLocale";
import { Katex } from "../components/Katex";
import { calculerPositionsRunAide } from "../ui/positionRunAide";

interface Props {
  colonnes: ColonneTableauEtudeLocale[];
  enteteColonnes: string[];
  mode: "fprime" | "fseconde";
  attendu: TableauEtudeLocaleAttendu;
  /** Aide (niveau 2) — colonnes à surligner en vert, absent tant que l'aide n'est pas activée.
   * Même principe que `GrilleQuotientDomfRecap.tsx` (5gen1). */
  highlight?: boolean[];
}

/** Rappel en lecture seule du tableau déjà complété — élément du bloc "état actuel" (écrans
 * ultérieurs) et du récapitulatif final. Jamais interactif (aucun cycle au clic). */
export function TableauEtudeLocaleRecap({ colonnes, enteteColonnes, mode, attendu, highlight }: Props) {
  const libelleLigne2 = mode === "fprime" ? "Variations de f" : "Concavité de f";
  // Convention transversale "aide de lecture" (docs/conventions-transversales.md) : run de
  // colonnes surlignées consécutives fusionné en un rectangle continu (positionRunAide.ts) + ligne
  // pointillée verte permanente sur toute colonne "point" (racine/exclusion) dès que l'aide est
  // activée.
  const positions = highlight ? calculerPositionsRunAide(highlight) : [];

  function classeColonne(j: number): string {
    const estPoint = colonnes[j].type !== "zone";
    const classes = [estPoint ? "grille-signes-point" : "grille-signes-zone"];
    if (positions[j]) classes.push(`is-aidee-${positions[j]}`);
    if (estPoint && highlight) classes.push("grille-signes-repere");
    return classes.join(" ");
  }

  return (
    <div className="grille-signes-scroll">
      <table className="grille-signes grille-signes-recap">
        <thead>
          <tr>
            <th className="grille-signes-label">x</th>
            <th className="grille-signes-borne">
              <Katex expression="-\infty" />
            </th>
            {colonnes.map((_, j) => (
              <th key={j} className={classeColonne(j)}>
                {enteteColonnes[j] !== "" && <Katex expression={enteteColonnes[j]} />}
              </th>
            ))}
            <th className="grille-signes-borne">
              <Katex expression="+\infty" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="grille-signes-label">Signe</td>
            <td className="grille-signes-borne" />
            {attendu.signes.map((s, j) => (
              <td key={j} className={classeColonne(j)}>
                {libelleSigneTableau(s)}
              </td>
            ))}
            <td className="grille-signes-borne" />
          </tr>
          <tr>
            <td className="grille-signes-label">{libelleLigne2}</td>
            <td className="grille-signes-borne" />
            {attendu.ligne2.map((v, j) => (
              <td key={j} className={classeColonne(j)}>
                {v !== null && libelleLigne2Tableau(v)}
              </td>
            ))}
            <td className="grille-signes-borne" />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
