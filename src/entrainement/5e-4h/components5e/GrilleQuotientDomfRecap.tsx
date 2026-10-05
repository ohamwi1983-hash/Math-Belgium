import type { ExerciceFractionSousRacine } from "../core5e/domaineDefinition.types";
import { Katex } from "../components/Katex";
import { calculerPositionsRunAide } from "../ui/positionRunAide";

interface Props {
  exercice: ExerciceFractionSousRacine;
  /** Aide (point 6, écran "domf") : colonnes/racines à surligner en vert — absent tant que
   * l'aide n'est pas activée. Même principe que `TableauSignesQuotientRecap.tsx` (4e). */
  highlight?: { colonnes: boolean[]; racines: boolean[] };
}

/**
 * Rappel en lecture seule de la grille de signes déjà complétée à l'écran "resolution" — élément
 * du bloc "état actuel" de l'écran "domf" (point 1.2, "s'enrichit au fur et à mesure") — même
 * principe que `TableauSignesQuotientRecap.tsx` (4e, gen6 "Inéquations rationnelles"), réimplémenté
 * ici (petit composant de présentation, jamais importé cross-chantier).
 */
export function GrilleQuotientDomfRecap({ exercice, highlight }: Props) {
  const entete: string[] = Array(2 * exercice.racines.length + 1).fill("");
  exercice.racines.forEach((r, j) => (entete[2 * j + 1] = String(r)));
  // Convention transversale "aide de lecture" (docs/conventions-transversales.md) : run de
  // colonnes surlignées consécutives fusionné en un rectangle continu (positionRunAide.ts) + ligne
  // pointillée verte permanente sur toute colonne "point" (racine) dès que l'aide est activée.
  // Même principe que TableauSignesQuotientRecap.tsx (4e), réimplémenté ici (petite fonction de
  // présentation, jamais un composant importé cross-chantier — seule calculerPositionsRunAide est
  // partagée, voir sa doc-string).
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
              <Katex expression={exercice.numerateurLatex} />
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
              <Katex expression={exercice.denominateurLatex} />
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
