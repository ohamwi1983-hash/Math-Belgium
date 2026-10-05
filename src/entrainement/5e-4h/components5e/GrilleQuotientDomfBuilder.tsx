import { useState } from "react";
import type { ExerciceFractionSousRacine } from "../core5e/domaineDefinition.types";
import type { ValeurCellule } from "../core/signesProduit.types";
import type { ValeurCelluleQuotient } from "../core/inequationRationnelle.types";
import { celluleEstErronee, cyclerValeurCellule } from "../ui/cycleValeurCellule";
import { celluleQuotientEstErronee, cyclerValeurCelluleQuotient, grilleQuotientEstComplete } from "../ui/cycleValeurCelluleQuotient";
import { Katex } from "../components/Katex";

/**
 * Écran "resolution" de la famille "fractionSousRacine" — tableau de signes N(x)/D(x) ≥ 0 à
 * convention ∄, même mécanique que le gen6 4e ("Inéquations rationnelles"). Réutilise directement
 * les primitives de cycle (`cyclerValeurCellule`/`cyclerValeurCelluleQuotient`, petites fonctions
 * pures génériques sans dépendance au contrat 4e) — voir CLAUDE.md section 5gen1, décision "import
 * direct cross-chantier".
 */
interface Props {
  exercice: ExerciceFractionSousRacine;
  tentativesUtilisees: number;
  onValider: (reponse: { ligneNumerateur: ValeurCellule[]; ligneDenominateur: ValeurCellule[]; ligneQuotient: ValeurCelluleQuotient[] }) => void;
}

export function GrilleQuotientDomfBuilder({ exercice, tentativesUtilisees, onValider }: Props) {
  const nbColonnes = 2 * exercice.racines.length + 1;
  const [ligneN, setLigneN] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));
  const [ligneD, setLigneD] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));
  const [ligneQ, setLigneQ] = useState<(ValeurCelluleQuotient | null)[]>(() => Array(nbColonnes).fill(null));

  const entete: string[] = Array.from({ length: nbColonnes }, () => "");
  exercice.racines.forEach((r, j) => (entete[2 * j + 1] = String(r)));

  function cyclerN(j: number) {
    setLigneN((etat) => etat.map((v, i) => (i === j ? cyclerValeurCellule(v) : v)));
  }
  function cyclerD(j: number) {
    setLigneD((etat) => etat.map((v, i) => (i === j ? cyclerValeurCellule(v) : v)));
  }
  function cyclerQ(j: number) {
    setLigneQ((etat) => etat.map((v, i) => (i === j ? cyclerValeurCelluleQuotient(v) : v)));
  }

  const complet = grilleQuotientEstComplete(ligneN, ligneD, ligneQ);
  const montrerErreurs = tentativesUtilisees > 0;

  function classe(saisie: ValeurCellule | null, attendu: ValeurCellule): string {
    return montrerErreurs && celluleEstErronee(saisie, attendu) ? "btn toggle-signe is-erronee" : "btn toggle-signe";
  }
  function classeQ(saisie: ValeurCelluleQuotient | null, attendu: ValeurCelluleQuotient): string {
    return montrerErreurs && celluleQuotientEstErronee(saisie, attendu) ? "btn toggle-signe is-erronee" : "btn toggle-signe";
  }

  function valider() {
    if (!complet) return;
    onValider({ ligneNumerateur: ligneN as ValeurCellule[], ligneDenominateur: ligneD as ValeurCellule[], ligneQuotient: ligneQ as ValeurCelluleQuotient[] });
  }

  return (
    <div>
      <p className="prompt-text">
        Complète le tableau de signes de <Katex expression={`\\dfrac{${exercice.numerateurLatex}}{${exercice.denominateurLatex}}`} />.
      </p>
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
                <Katex expression={exercice.numerateurLatex} />
              </td>
              <td className="grille-signes-borne" />
              {ligneN.map((valeur, j) => (
                <td key={j} className={j % 2 === 0 ? "grille-signes-zone" : "grille-signes-point"}>
                  <button type="button" className={classe(valeur, exercice.grille.ligneNumerateur[j])} onClick={() => cyclerN(j)}>
                    {valeur ?? "?"}
                  </button>
                </td>
              ))}
              <td className="grille-signes-borne" />
            </tr>
            <tr>
              <td className="grille-signes-label">
                <Katex expression={exercice.denominateurLatex} />
              </td>
              <td className="grille-signes-borne" />
              {ligneD.map((valeur, j) => (
                <td key={j} className={j % 2 === 0 ? "grille-signes-zone" : "grille-signes-point"}>
                  <button type="button" className={classe(valeur, exercice.grille.ligneDenominateur[j])} onClick={() => cyclerD(j)}>
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
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — réessaie.
        </p>
      )}
    </div>
  );
}
