import type { ExerciceInequationRationnelleSansFacteurCommun } from "../core/inequationRationnelle.types";
import { Katex } from "./Katex";
import { formatEnTeteInterieur } from "../ui/formatSignesProduit";
import { formatLigneDenominateurSansFacteurCommunLabel, formatLigneNumerateurNiveau3Label } from "../ui/formatInequationRationnelle";
import { calculerPositionsRunAide } from "../ui/positionRunAide";

interface Props {
  exercice: ExerciceInequationRationnelleSansFacteurCommun;
  /** Aide (prompt de corrections) : colonnes/racines à encadrer en vert — absent tant que l'aide n'est pas activée. */
  highlight?: { colonnes: boolean[]; racines: boolean[] };
}

/**
 * Rappel en lecture seule de la grille de signes correctement remplie (variante sans facteur
 * commun uniquement) — même principe que TableauSignesQuotientNiveau4Recap.tsx, mais les 2 lignes D
 * proviennent des racines du dénominateur QUADRATIQUE (exercice.denominateur), toujours moniques.
 * Toujours exercice.grille, jamais une saisie de l'élève.
 */
export function TableauSignesQuotientSansFacteurCommunRecap({ exercice, highlight }: Props) {
  const entete = formatEnTeteInterieur(exercice.racines);
  const [racineN1, racineN2] = [...exercice.numerateur.solution.racines].sort((a, b) => a - b);
  const [racineD1, racineD2] = [...exercice.denominateur.solution.racines].sort((a, b) => a - b);
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
          {ligne(formatLigneDenominateurSansFacteurCommunLabel(racineD1), exercice.grille.lignesDenominateur[0])}
          {ligne(formatLigneDenominateurSansFacteurCommunLabel(racineD2), exercice.grille.lignesDenominateur[1])}
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
