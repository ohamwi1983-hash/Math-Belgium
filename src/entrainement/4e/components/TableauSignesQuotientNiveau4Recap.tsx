import type { ExerciceInequationRationnelleNiveau4 } from "../core/inequationRationnelle.types";
import { Katex } from "./Katex";
import { formatEnTeteInterieur } from "../ui/formatSignesProduit";
import { formatLigneDenominateurLabel, formatLigneNumerateurNiveau3Label } from "../ui/formatInequationRationnelle";
import { calculerPositionsRunAide } from "../ui/positionRunAide";

interface Props {
  exercice: ExerciceInequationRationnelleNiveau4;
  /** Aide (prompt de corrections) : colonnes/racines à encadrer en vert — absent tant que l'aide n'est pas activée. */
  highlight?: { colonnes: boolean[]; racines: boolean[] };
}

/**
 * Rappel en lecture seule de la grille de signes correctement remplie (niveau 4 uniquement) — même
 * principe que TableauSignesQuotientNiveau3Recap.tsx, mais 5 lignes fixes (2 lignes N + 2 lignes D
 * + quotient) au lieu de 4, et un nombre de colonnes variable (9 pour 4 racines distinctes) plutôt
 * que fixe. Toujours exercice.grille, jamais une saisie de l'élève.
 */
export function TableauSignesQuotientNiveau4Recap({ exercice, highlight }: Props) {
  const entete = formatEnTeteInterieur(exercice.racines);
  const [racineN1, racineN2] = [...exercice.numerateur.solution.racines].sort((a, b) => a - b);
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

  function ligne(label: string, valeurs: string[]) {
    return (
      <tr>
        <td className="grille-signes-label">
          <Katex expression={label} />
        </td>
        <td className="grille-signes-borne" />
        {valeurs.map((valeur, j) => (
          <td key={j} className={classeColonne(j)}>
            {valeur}
          </td>
        ))}
        <td className="grille-signes-borne" />
      </tr>
    );
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
          {ligne(formatLigneNumerateurNiveau3Label(racineN1), exercice.grille.lignesNumerateur[0])}
          {ligne(formatLigneNumerateurNiveau3Label(racineN2), exercice.grille.lignesNumerateur[1])}
          {ligne(formatLigneDenominateurLabel(exercice.denominateurGauche), exercice.grille.lignesDenominateur[0])}
          {ligne(formatLigneDenominateurLabel(exercice.denominateurDroit), exercice.grille.lignesDenominateur[1])}
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
