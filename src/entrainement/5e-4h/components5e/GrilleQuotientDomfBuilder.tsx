import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceFractionSousRacine } from "../core5e/domaineDefinition.types";
import type { ValeurCellule } from "../core/signesProduit.types";
import type { ValeurCelluleQuotient } from "../core/inequationRationnelle.types";
import { celluleEstErronee, cyclerValeurCellule } from "../ui/cycleValeurCellule";
import { celluleQuotientEstErronee, cyclerValeurCelluleQuotient, grilleQuotientEstComplete } from "../ui/cycleValeurCelluleQuotient";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

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
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — remplace "Valider"
   * par le bloc `ValidationEcran` (convention CLAUDE.md, "validation/invalidation avant de passer à
   * l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
  /** Aides et bouton « Aide », rendus juste avant « Valider ». */
  avantValider?: ReactNode;
  tentativesMax?: number;
}

/** Message ciblé (audit 5e ch. 1, lot B) : un « 0 » au quotient là où le dénominateur s'annule, ou
 * une ligne du quotient qui ne suit pas la règle des signes des deux lignes saisies. */
function cibleGrille(n: (ValeurCellule | null)[], d: (ValeurCellule | null)[], q: (ValeurCelluleQuotient | null)[], attenduD: ValeurCellule[]): string | null {
  if (attenduD.some((v, j) => v === "0" && q[j] === "0")) return "Là où le dénominateur s'annule, le quotient n'existe pas (double barre) : il ne vaut pas 0.";
  const regle = q.every((v, j) => {
    if (j % 2 === 1) return true;
    if (n[j] === null || d[j] === null || v === null) return true;
    const attendu = n[j] === d[j] ? "+" : "-";
    return v === attendu;
  });
  if (!regle) return "Le signe du quotient suit la règle des signes de tes deux lignes : même signe → +, signes contraires → −.";
  return null;
}

export function GrilleQuotientDomfBuilder({ exercice, tentativesUtilisees, onValider, validation, avantValider, tentativesMax = 3 }: Props) {
  const [incomplet, setIncomplet] = useState(false);
  const [cible, setCible] = useState<string | null>(null);
  const nbColonnes = 2 * exercice.racines.length + 1;
  const [ligneN, setLigneN] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));
  const [ligneD, setLigneD] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));
  const [ligneQ, setLigneQ] = useState<(ValeurCelluleQuotient | null)[]>(() => Array(nbColonnes).fill(null));

  const entete: string[] = Array.from({ length: nbColonnes }, () => "");
  exercice.racines.forEach((r, j) => (entete[2 * j + 1] = String(r)));

  function cyclerN(j: number) {
    setIncomplet(false);
    setLigneN((etat) => etat.map((v, i) => (i === j ? cyclerValeurCellule(v) : v)));
  }
  function cyclerD(j: number) {
    setIncomplet(false);
    setLigneD((etat) => etat.map((v, i) => (i === j ? cyclerValeurCellule(v) : v)));
  }
  function cyclerQ(j: number) {
    setIncomplet(false);
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
    // Tableau incomplet : message, rien n'est transmis (aucune tentative consommée).
    if (!complet) {
      setIncomplet(true);
      return;
    }
    setIncomplet(false);
    setCible(cibleGrille(ligneN, ligneD, ligneQ, exercice.grille.ligneDenominateur));
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
      {!validation && (
        <>
          {avantValider}
          <button type="button" className="btn btn-primary" onClick={valider}>
            Valider
          </button>
          {incomplet ? (
            <p className="alert-error" role="alert">
              Complète chaque case du tableau (« ? » restant) avant de valider. Cette saisie ne compte pas comme une tentative.
            </p>
          ) : (
            montrerErreurs && (
              <p className="alert-error" role="alert">
                <span>
                  {cible ? `${cible} ` : ""}Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
                </span>
              </p>
            )
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
