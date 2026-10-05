import type { ExerciceInequationRationnelleNumerateurLineaire } from "../core/inequationRationnelle.types";
import { Katex } from "./Katex";
import { formatEnTeteInterieur } from "../ui/formatSignesProduit";
import { formatLigneDenominateurLabel, formatLigneNumerateurLabel } from "../ui/formatInequationRationnelle";
import { calculerPositionsRunAide } from "../ui/positionRunAide";

interface Props {
  exercice: ExerciceInequationRationnelleNumerateurLineaire;
  /** Aide (prompt de corrections) : colonnes/racines à encadrer en vert — absent tant que l'aide n'est pas activée. */
  highlight?: { colonnes: boolean[]; racines: boolean[] };
}

/**
 * Rappel en lecture seule de la grille de signes correctement remplie, affiché sur l'écran
 * "intervalle solution" — même principe que TableauSignesRecap.tsx (exercice "tableau de signes à
 * plusieurs facteurs") : toujours exercice.grille (jamais une saisie de l'élève), 3 lignes fixes
 * (N, D, quotient) au lieu d'un nombre variable de facteurs, mêmes colonnes alternées zone/point.
 */
export function TableauSignesQuotientRecap({ exercice, highlight }: Props) {
  const entete = formatEnTeteInterieur(exercice.racines);
  // Convention transversale "aide de lecture" (docs/conventions-transversales.md) : run de
  // colonnes surlignées consécutives fusionné en un rectangle continu (positionRunAide.ts) + ligne
  // pointillée verte permanente sur toute colonne "point" (racine) dès que l'aide est activée.
  const positions = highlight ? calculerPositionsRunAide(highlight.colonnes) : [];

  function classeColonne(j: number): string {
    const estPoint = j % 2 === 1;
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
            {entete.map((valeur, j) => (
              <th key={j} className={classeColonne(j)}>
                {valeur !== "" && <Katex expression={valeur} />}
              </th>
            ))}
            <th className="grille-signes-borne">
              <Katex expression="+\infty" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="grille-signes-label">
              <Katex expression={formatLigneNumerateurLabel(exercice.numerateur)} />
            </td>
            <td className="grille-signes-borne" />
            {exercice.grille.ligneNumerateur.map((valeur, j) => (
              <td key={j} className={classeColonne(j)}>
                {valeur}
              </td>
            ))}
            <td className="grille-signes-borne" />
          </tr>
          <tr>
            <td className="grille-signes-label">
              <Katex expression={formatLigneDenominateurLabel(exercice.denominateur)} />
            </td>
            <td className="grille-signes-borne" />
            {exercice.grille.ligneDenominateur.map((valeur, j) => (
              <td key={j} className={classeColonne(j)}>
                {valeur}
              </td>
            ))}
            <td className="grille-signes-borne" />
          </tr>
          <tr>
            <td className="grille-signes-label">Signe du quotient</td>
            <td className="grille-signes-borne" />
            {exercice.grille.ligneQuotient.map((valeur, j) => (
              <td key={j} className={classeColonne(j)}>
                {valeur}
              </td>
            ))}
            <td className="grille-signes-borne" />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
