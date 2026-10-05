import { useState } from "react";
import type { ExerciceInequationRationnelleFacteurCommun, GrilleQuotient, ValeurCelluleQuotient } from "../core/inequationRationnelle.types";
import type { ValeurCellule } from "../core/signesProduit.types";
import { Katex } from "./Katex";
import { formatEnonceFacteurCommunSimplifieLatex, formatLigneDenominateurLabel, formatLigneNumerateurLabel } from "../ui/formatInequationRationnelle";
import { formatEnTeteInterieur } from "../ui/formatSignesProduit";
import { celluleEstErronee, cyclerValeurCellule } from "../ui/cycleValeurCellule";
import { celluleQuotientEstErronee, cyclerValeurCelluleQuotient, grilleQuotientEstComplete } from "../ui/cycleValeurCelluleQuotient";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { EtatActuelPanel } from "./EtatActuelPanel";

interface Props {
  exercice: ExerciceInequationRationnelleFacteurCommun;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  /** Bloc "état actuel" (prompt-corrections-moteur-partage.md, points 1 et 4) — absent/null par défaut : rien de rendu. */
  etatActuel?: string | null;
  onValider: (reponse: GrilleQuotient) => void;
}

/**
 * Étape "grille de signes" (variante facteur commun) : structurellement identique à
 * EtapeGrilleQuotient.tsx (même type GrilleQuotient, réutilisé littéralement — après
 * simplification, N(x)/D(x) redevient une vraie fraction P1/P1, voir
 * core/inequationRationnelle.types.ts), composant séparé uniquement parce que l'exercice n'a pas de
 * champs `numerateur`/`denominateur` de premier niveau (embarqués dans `fraction`) : les labels de
 * ligne utilisent `numerateurSimplifie`/`denominateurSimplifie` (dérivés une fois à la
 * construction) et l'énoncé affiché est la fraction déjà simplifiée (spec section 4), pas
 * l'énoncé N(x)/D(x) d'origine. Le nombre de colonnes est ici toujours 7 (3 racines distinctes : p,
 * q, s), contre 5 pour EtapeGrilleQuotient (2 racines) — géré nativement puisque `formatEnTeteInterieur`
 * et le cycle de saisie sont déjà génériques sur `exercice.racines.length`.
 */
export function EtapeGrilleQuotientFacteurCommun({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  etatActuel,
  onValider,
}: Props) {
  const entete = formatEnTeteInterieur(exercice.racines);
  const nbColonnes = entete.length;

  const [ligneN, setLigneN] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));
  const [ligneD, setLigneD] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));
  const [ligneQ, setLigneQ] = useState<(ValeurCelluleQuotient | null)[]>(() => Array(nbColonnes).fill(null));

  function cyclerN(colonne: number) {
    setLigneN((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCellule(v) : v)));
  }
  function cyclerD(colonne: number) {
    setLigneD((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCellule(v) : v)));
  }
  function cyclerQ(colonne: number) {
    setLigneQ((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCelluleQuotient(v) : v)));
  }

  const complet = grilleQuotientEstComplete(ligneN, ligneD, ligneQ);
  const montrerErreurs = tentativesUtilisees > 0;

  function classeN(saisie: ValeurCellule | null, attendu: ValeurCellule): string {
    return montrerErreurs && celluleEstErronee(saisie, attendu) ? "btn toggle-signe is-erronee" : "btn toggle-signe";
  }
  function classeQ(saisie: ValeurCelluleQuotient | null, attendu: ValeurCelluleQuotient): string {
    return montrerErreurs && celluleQuotientEstErronee(saisie, attendu) ? "btn toggle-signe is-erronee" : "btn toggle-signe";
  }

  function valider() {
    if (!complet) return;
    onValider({
      ligneNumerateur: ligneN as ValeurCellule[],
      ligneDenominateur: ligneD as ValeurCellule[],
      ligneQuotient: ligneQ as ValeurCelluleQuotient[],
    });
  }

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <div className="equation-box">
        <Katex expression={formatEnonceFacteurCommunSimplifieLatex(exercice)} block />
      </div>
      <EtatActuelPanel latex={etatActuel ?? null} />
      <p className="prompt-text">Complète le tableau de signes.</p>

      <div className="grille-signes-scroll">
        <table className="grille-signes">
          <thead>
            <tr>
              <th className="grille-signes-label">x</th>
              <th className="grille-signes-borne">
                <Katex expression="-\infty" />
              </th>
              {entete.map((valeur, j) => (
                <th key={j} className={j % 2 === 0 ? "grille-signes-zone" : "grille-signes-point"}>
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
                <Katex expression={formatLigneNumerateurLabel(exercice.numerateurSimplifie)} />
              </td>
              <td className="grille-signes-borne" />
              {ligneN.map((valeur, j) => (
                <td key={j} className={j % 2 === 0 ? "grille-signes-zone" : "grille-signes-point"}>
                  <button type="button" className={classeN(valeur, exercice.grille.ligneNumerateur[j])} onClick={() => cyclerN(j)}>
                    {valeur ?? "?"}
                  </button>
                </td>
              ))}
              <td className="grille-signes-borne" />
            </tr>
            <tr>
              <td className="grille-signes-label">
                <Katex expression={formatLigneDenominateurLabel(exercice.denominateurSimplifie)} />
              </td>
              <td className="grille-signes-borne" />
              {ligneD.map((valeur, j) => (
                <td key={j} className={j % 2 === 0 ? "grille-signes-zone" : "grille-signes-point"}>
                  <button type="button" className={classeN(valeur, exercice.grille.ligneDenominateur[j])} onClick={() => cyclerD(j)}>
                    {valeur ?? "?"}
                  </button>
                </td>
              ))}
              <td className="grille-signes-borne" />
            </tr>
            <tr>
              <td className="grille-signes-label">Signe du quotient</td>
              <td className="grille-signes-borne" />
              {ligneQ.map((valeur, j) => (
                <td key={j} className={j % 2 === 0 ? "grille-signes-zone" : "grille-signes-point"}>
                  <button type="button" className={classeQ(valeur, exercice.grille.ligneQuotient[j])} onClick={() => cyclerQ(j)}>
                    {valeur ?? "?"}
                  </button>
                </td>
              ))}
              <td className="grille-signes-borne" />
            </tr>
          </tbody>
        </table>
      </div>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
