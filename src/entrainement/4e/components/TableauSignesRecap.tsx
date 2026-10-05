import type { ExerciceSignesProduit } from "../core/signesProduit.types";
import { Katex } from "./Katex";
import { formatEnTeteInterieur, formatLigneLabel } from "../ui/formatSignesProduit";
import { ordreLignesGrille } from "../generateurs/signesProduit/grille";
import { calculerPositionsRunAide } from "../ui/positionRunAide";

interface Props {
  exercice: ExerciceSignesProduit;
  /** Aide (section 6, prompt-refonte-tableau-signes.md) : colonnes/racines à encadrer en vert — absent tant que l'aide n'est pas activée. */
  highlight?: { colonnes: boolean[]; racines: boolean[] };
}

/**
 * Rappel en lecture seule du tableau de signes correctement rempli (section 5,
 * prompt-refonte-tableau-signes.md) — affiché sur l'écran "intervalle solution", toujours les
 * vraies valeurs confirmées (exercice.grille), jamais une saisie de l'élève, même principe que le
 * reste du récapitulatif persistant du projet (voir CLAUDE.md). Même structure de colonnes que
 * EtapeGrilleSignes (alternance zone/point, ordreLignesGrille), mais cellules non interactives.
 */
export function TableauSignesRecap({ exercice, highlight }: Props) {
  const refs = ordreLignesGrille(exercice.facteurs);
  const entete = formatEnTeteInterieur(exercice.racines);
  // Convention transversale "aide de lecture" (docs/conventions-transversales.md) : un run de
  // colonnes surlignées consécutives fusionne en un rectangle continu (positionRunAide.ts), et
  // toute colonne "point" (racine) porte en plus une ligne pointillée verte permanente reliant
  // l'en-tête à la dernière ligne, indépendamment de son propre surlignage.
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
          {refs.map((ref, i) => (
            <tr key={i}>
              <td className="grille-signes-label">
                <Katex expression={formatLigneLabel(exercice.facteurs, ref)} />
              </td>
              <td className="grille-signes-borne" />
              {exercice.grille.lignes[i].map((valeur, j) => (
                <td key={j} className={classeColonne(j)}>
                  {valeur}
                </td>
              ))}
              <td className="grille-signes-borne" />
            </tr>
          ))}
          <tr>
            <td className="grille-signes-label">Signe du produit</td>
            <td className="grille-signes-borne" />
            {exercice.grille.produit.map((valeur, j) => (
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
