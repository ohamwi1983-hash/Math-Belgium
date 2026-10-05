import { useState } from "react";
import type { ExerciceInequationRationnelleNumerateurLineaire, GrilleQuotient, ValeurCelluleQuotient } from "../core/inequationRationnelle.types";
import type { ValeurCellule } from "../core/signesProduit.types";
import { Katex } from "./Katex";
import {
  formatEnonceInequationRationnelleFactoriseLatex,
  formatEnonceInequationRationnelleLatex,
  formatLigneDenominateurLabel,
  formatLigneNumerateurLabel,
} from "../ui/formatInequationRationnelle";
import { formatEnTeteInterieur } from "../ui/formatSignesProduit";
import { celluleEstErronee, cyclerValeurCellule } from "../ui/cycleValeurCellule";
import { celluleQuotientEstErronee, cyclerValeurCelluleQuotient, grilleQuotientEstComplete } from "../ui/cycleValeurCelluleQuotient";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";

interface Props {
  exercice: ExerciceInequationRationnelleNumerateurLineaire;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  onValider: (reponse: GrilleQuotient) => void;
}

/**
 * Étape "grille de signes" (section 3 de la spec) : 3 lignes fixes — N (numérateur), D
 * (dénominateur, cycle à 3 états chacune, cyclerValeurCellule réutilisé tel quel), puis la ligne
 * finale "signe du quotient" (cycle à 4 états, cyclerValeurCelluleQuotient — ∄ en plus). Même
 * structure de colonnes alternées zone/point que le tableau de signes à plusieurs facteurs
 * (EtapeGrilleSignes.tsx), validée en un seul essai global pour toute la grille.
 */
export function EtapeGrilleQuotient({ exercice, tentativesUtilisees, tentativesMax, recapitulatif, onValider }: Props) {
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
        <Katex expression={formatEnonceInequationRationnelleLatex(exercice)} block />
      </div>
      <div className="equation-box">
        <Katex expression={formatEnonceInequationRationnelleFactoriseLatex(exercice)} block />
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
            <tr>
              <td className="grille-signes-label">
                <Katex expression={formatLigneNumerateurLabel(exercice.numerateur)} />
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
                <Katex expression={formatLigneDenominateurLabel(exercice.denominateur)} />
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
