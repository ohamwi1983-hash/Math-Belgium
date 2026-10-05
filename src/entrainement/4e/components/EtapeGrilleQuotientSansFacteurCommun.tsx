import { useState } from "react";
import type {
  ExerciceInequationRationnelleSansFacteurCommun,
  GrilleQuotientSansFacteurCommun,
  ValeurCelluleQuotient,
} from "../core/inequationRationnelle.types";
import type { ValeurCellule } from "../core/signesProduit.types";
import { Katex } from "./Katex";
import {
  formatEnonceCombineSansFacteurCommunFactoriseLatex,
  formatEnonceCombineSansFacteurCommunLatex,
  formatLigneDenominateurSansFacteurCommunLabel,
  formatLigneNumerateurNiveau3Label,
} from "../ui/formatInequationRationnelle";
import { formatEnTeteInterieur } from "../ui/formatSignesProduit";
import { celluleEstErronee, cyclerValeurCellule } from "../ui/cycleValeurCellule";
import { celluleQuotientEstErronee, cyclerValeurCelluleQuotient, grilleQuotientEstComplete } from "../ui/cycleValeurCelluleQuotient";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";

interface Props {
  exercice: ExerciceInequationRationnelleSansFacteurCommun;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  onValider: (reponse: GrilleQuotientSansFacteurCommun) => void;
}

/**
 * Étape "grille de signes" (variante sans facteur commun, item f) : même principe que
 * EtapeGrilleQuotientNiveau4 (2 lignes N + 2 lignes D + quotient, type identique
 * GrilleQuotientSansFacteurCommun = GrilleQuotientNiveau4), mais les 2 lignes D proviennent ici des
 * racines du dénominateur QUADRATIQUE (exercice.denominateur), toujours moniques — d'où
 * formatLigneDenominateurSansFacteurCommunLabel plutôt que formatLigneDenominateurLabel (qui exige
 * un vrai PolynomeLineaire, absent ici).
 */
export function EtapeGrilleQuotientSansFacteurCommun({ exercice, tentativesUtilisees, tentativesMax, recapitulatif, onValider }: Props) {
  const entete = formatEnTeteInterieur(exercice.racines);
  const nbColonnes = entete.length;
  const [racineN1, racineN2] = [...exercice.numerateur.solution.racines].sort((a, b) => a - b);
  const [racineD1, racineD2] = [...exercice.denominateur.solution.racines].sort((a, b) => a - b);

  const [ligneN1, setLigneN1] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));
  const [ligneN2, setLigneN2] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));
  const [ligneD1, setLigneD1] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));
  const [ligneD2, setLigneD2] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));
  const [ligneQ, setLigneQ] = useState<(ValeurCelluleQuotient | null)[]>(() => Array(nbColonnes).fill(null));

  function cyclerN1(colonne: number) {
    setLigneN1((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCellule(v) : v)));
  }
  function cyclerN2(colonne: number) {
    setLigneN2((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCellule(v) : v)));
  }
  function cyclerD1(colonne: number) {
    setLigneD1((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCellule(v) : v)));
  }
  function cyclerD2(colonne: number) {
    setLigneD2((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCellule(v) : v)));
  }
  function cyclerQ(colonne: number) {
    setLigneQ((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCelluleQuotient(v) : v)));
  }

  const complet =
    grilleQuotientEstComplete(ligneN1, ligneD1, ligneQ) &&
    ligneN2.every((v) => v !== null) &&
    ligneD2.every((v) => v !== null);
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
      lignesDenominateur: [ligneD1 as ValeurCellule[], ligneD2 as ValeurCellule[]],
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
        <Katex expression={formatEnonceCombineSansFacteurCommunLatex(exercice)} block />
      </div>
      <div className="equation-box">
        <Katex expression={formatEnonceCombineSansFacteurCommunFactoriseLatex(exercice)} block />
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
            {ligneInteractive(formatLigneDenominateurSansFacteurCommunLabel(racineD1), ligneD1, exercice.grille.lignesDenominateur[0], cyclerD1)}
            {ligneInteractive(formatLigneDenominateurSansFacteurCommunLabel(racineD2), ligneD2, exercice.grille.lignesDenominateur[1], cyclerD2)}
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
