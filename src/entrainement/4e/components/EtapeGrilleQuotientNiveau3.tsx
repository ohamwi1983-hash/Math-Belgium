import { useState } from "react";
import type { ExerciceInequationRationnelleNiveau3, GrilleQuotientNiveau3, ValeurCelluleQuotient } from "../core/inequationRationnelle.types";
import type { ValeurCellule } from "../core/signesProduit.types";
import { Katex } from "./Katex";
import {
  formatEnonceCombineNiveau3FactoriseLatex,
  formatEnonceCombineNiveau3Latex,
  formatLigneDenominateurLabel,
  formatLigneNumerateurNiveau3Label,
} from "../ui/formatInequationRationnelle";
import { formatEnTeteInterieur } from "../ui/formatSignesProduit";
import { celluleEstErronee, cyclerValeurCellule } from "../ui/cycleValeurCellule";
import { celluleQuotientEstErronee, cyclerValeurCelluleQuotient, grilleQuotientEstComplete } from "../ui/cycleValeurCelluleQuotient";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";

interface Props {
  exercice: ExerciceInequationRationnelleNiveau3;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  onValider: (reponse: GrilleQuotientNiveau3) => void;
}

/**
 * Étape "grille de signes" (niveau 3 uniquement) : même principe que EtapeGrilleQuotient.tsx, mais
 * 4 lignes fixes — 2 lignes N (une par racine de P2_1, déjà confirmée à l'étape champ2) + 1 ligne D
 * + la ligne finale "signe du quotient" (4 états, ∄ en plus) — au lieu de 3, et un nombre de
 * colonnes variable (7 pour 3 racines distinctes) plutôt que fixe (toujours 5).
 */
export function EtapeGrilleQuotientNiveau3({ exercice, tentativesUtilisees, tentativesMax, recapitulatif, onValider }: Props) {
  const entete = formatEnTeteInterieur(exercice.racines);
  const nbColonnes = entete.length;
  const [racineN1, racineN2] = [...exercice.numerateur.solution.racines].sort((a, b) => a - b);

  const [ligneN1, setLigneN1] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));
  const [ligneN2, setLigneN2] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));
  const [ligneD, setLigneD] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));
  const [ligneQ, setLigneQ] = useState<(ValeurCelluleQuotient | null)[]>(() => Array(nbColonnes).fill(null));

  function cyclerN1(colonne: number) {
    setLigneN1((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCellule(v) : v)));
  }
  function cyclerN2(colonne: number) {
    setLigneN2((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCellule(v) : v)));
  }
  function cyclerD(colonne: number) {
    setLigneD((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCellule(v) : v)));
  }
  function cyclerQ(colonne: number) {
    setLigneQ((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCelluleQuotient(v) : v)));
  }

  const complet =
    grilleQuotientEstComplete(ligneN1, ligneD, ligneQ) && ligneN2.every((v) => v !== null);
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
      lignesNumerateur: [ligneN1 as ValeurCellule[], ligneN2 as ValeurCellule[]],
      ligneDenominateur: ligneD as ValeurCellule[],
      ligneQuotient: ligneQ as ValeurCelluleQuotient[],
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
        <Katex expression={formatEnonceCombineNiveau3Latex(exercice)} block />
      </div>
      <div className="equation-box">
        <Katex expression={formatEnonceCombineNiveau3FactoriseLatex(exercice)} block />
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
            {ligneInteractive(formatLigneNumerateurNiveau3Label(racineN1), ligneN1, exercice.grille.lignesNumerateur[0], cyclerN1)}
            {ligneInteractive(formatLigneNumerateurNiveau3Label(racineN2), ligneN2, exercice.grille.lignesNumerateur[1], cyclerN2)}
            {ligneInteractive(formatLigneDenominateurLabel(exercice.denominateur), ligneD, exercice.grille.ligneDenominateur, cyclerD)}
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
