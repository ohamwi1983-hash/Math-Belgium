import { useState } from "react";
import type { ExerciceInequationRationnelleCubique, GrilleQuotientCubique, ValeurCelluleQuotient } from "../core/inequationRationnelle.types";
import type { ValeurCellule } from "../core/signesProduit.types";
import { Katex } from "./Katex";
import {
  formatEnonceCubiqueFactoriseLatex,
  formatEnonceCubiqueLatex,
  formatLigneDenominateurLabel,
  formatLigneNumerateurNiveau3Label,
} from "../ui/formatInequationRationnelle";
import { formatEnTeteInterieur } from "../ui/formatSignesProduit";
import { celluleEstErronee, cyclerValeurCellule } from "../ui/cycleValeurCellule";
import { celluleQuotientEstErronee, cyclerValeurCelluleQuotient, grilleQuotientEstComplete } from "../ui/cycleValeurCelluleQuotient";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";

interface Props {
  exercice: ExerciceInequationRationnelleCubique;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  onValider: (reponse: GrilleQuotientCubique) => void;
}

/**
 * Étape "grille de signes" (variante cubique, item b) : même principe que
 * EtapeGrilleQuotientNiveau3, mais 3 lignes N fixes (le facteur x, toujours en tête, puis les 2
 * racines du facteur quadratique restant, triées) au lieu de 2, avec toujours 1 seule ligne D
 * (P1_D, un vrai PolynomeLineaire — formatLigneDenominateurLabel réutilisée telle quelle).
 */
export function EtapeGrilleQuotientCubique({ exercice, tentativesUtilisees, tentativesMax, recapitulatif, onValider }: Props) {
  const entete = formatEnTeteInterieur(exercice.racines);
  const nbColonnes = entete.length;
  const [racineQ1, racineQ2] = [...exercice.numerateur.solution.racines].sort((a, b) => a - b);

  const [ligneX, setLigneX] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));
  const [ligneQ1, setLigneQ1] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));
  const [ligneQ2, setLigneQ2] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));
  const [ligneD, setLigneD] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));
  const [ligneQuot, setLigneQuot] = useState<(ValeurCelluleQuotient | null)[]>(() => Array(nbColonnes).fill(null));

  function cyclerX(colonne: number) {
    setLigneX((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCellule(v) : v)));
  }
  function cyclerQ1(colonne: number) {
    setLigneQ1((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCellule(v) : v)));
  }
  function cyclerQ2(colonne: number) {
    setLigneQ2((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCellule(v) : v)));
  }
  function cyclerD(colonne: number) {
    setLigneD((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCellule(v) : v)));
  }
  function cyclerQuot(colonne: number) {
    setLigneQuot((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCelluleQuotient(v) : v)));
  }

  const complet =
    grilleQuotientEstComplete(ligneX, ligneD, ligneQuot) &&
    ligneQ1.every((v) => v !== null) &&
    ligneQ2.every((v) => v !== null);
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
      lignesNumerateur: [ligneX as ValeurCellule[], ligneQ1 as ValeurCellule[], ligneQ2 as ValeurCellule[]],
      ligneDenominateur: ligneD as ValeurCellule[],
      ligneQuotient: ligneQuot as ValeurCelluleQuotient[],
    });
  }

  function ligneInteractive(
    label: string,
    valeurs: (ValeurCellule | null)[],
    attendu: ValeurCellule[],
    cycler: (colonne: number) => void,
  ) {
    return (
      <tr>
        <td className="grille-signes-label">
          <Katex expression={label} />
        </td>
        <td className="grille-signes-borne" />
        {valeurs.map((valeur, j) => (
          <td key={j} className={j % 2 === 0 ? "grille-signes-zone" : "grille-signes-point"}>
            <button type="button" className={classeN(valeur, attendu[j])} onClick={() => cycler(j)}>
              {valeur ?? "?"}
            </button>
          </td>
        ))}
        <td className="grille-signes-borne" />
      </tr>
    );
  }

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <div className="equation-box">
        <Katex expression={formatEnonceCubiqueLatex(exercice)} block />
      </div>
      <div className="equation-box">
        <Katex expression={formatEnonceCubiqueFactoriseLatex(exercice)} block />
      </div>
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
            {ligneInteractive(formatLigneNumerateurNiveau3Label(0), ligneX, exercice.grille.lignesNumerateur[0], cyclerX)}
            {ligneInteractive(formatLigneNumerateurNiveau3Label(racineQ1), ligneQ1, exercice.grille.lignesNumerateur[1], cyclerQ1)}
            {ligneInteractive(formatLigneNumerateurNiveau3Label(racineQ2), ligneQ2, exercice.grille.lignesNumerateur[2], cyclerQ2)}
            {ligneInteractive(formatLigneDenominateurLabel(exercice.denominateur), ligneD, exercice.grille.ligneDenominateur, cyclerD)}
            <tr>
              <td className="grille-signes-label">Signe du quotient</td>
              <td className="grille-signes-borne" />
              {ligneQuot.map((valeur, j) => (
                <td key={j} className={j % 2 === 0 ? "grille-signes-zone" : "grille-signes-point"}>
                  <button type="button" className={classeQ(valeur, exercice.grille.ligneQuotient[j])} onClick={() => cyclerQuot(j)}>
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
