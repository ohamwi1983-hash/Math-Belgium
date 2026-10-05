import type { EcranEtudeLocale, ResultatExerciceEtudeLocale } from "../moteur5e/typesEtudeLocale";
import { ordreEcransEtudeLocale } from "../moteur5e/typesEtudeLocale";
import { tableauFPrimeAttendu, tableauFSecondeAttendu } from "../moteur5e/verificationEtudeLocale";
import { LIBELLE_ECRAN_ETUDE_LOCALE, formatEnteteColonnesTableau, formatReponseAttenduePhaseLatex } from "../ui5e/formatEtudeLocale";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";
import { TableauEtudeLocaleRecap } from "./TableauEtudeLocaleRecap";

interface Props {
  resultat: ResultatExerciceEtudeLocale;
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Écran récapitulatif final — 2 à 7 lignes à plat selon la variante/niveau/sauts (voir
 * `ordreEcransEtudeLocale`), même patron plat/coloré que `ResultatPanelTangentes.tsx` (5gen28). Les
 * écrans "tableauFPrime"/"tableauFSeconde" rendent le tableau étendu en lecture seule
 * (`TableauEtudeLocaleRecap`) plutôt qu'une simple ligne de fragments Katex. */
export function ResultatPanelEtudeLocale({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;

  function statutEcran(ecran: string) {
    const info = aideParPhase[ecran];
    return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
  }

  function contenu(ecran: EcranEtudeLocale) {
    if (ecran === "tableauFPrime" || ecran === "tableauFSeconde") {
      const mode = ecran === "tableauFPrime" ? "fprime" : "fseconde";
      const attendu = mode === "fprime" ? tableauFPrimeAttendu(exercice) : tableauFSecondeAttendu(exercice);
      const enteteColonnes = formatEnteteColonnesTableau(exercice, attendu.colonnes, mode);
      return <TableauEtudeLocaleRecap colonnes={attendu.colonnes} enteteColonnes={enteteColonnes} mode={mode} attendu={attendu} />;
    }
    return (
      <span className="equation-box-termes">
        {formatReponseAttenduePhaseLatex(exercice, ecran).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </span>
    );
  }

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {ordreEcransEtudeLocale(exercice).map((ecran) => {
        const score = resultat.scores[ecran];
        if (score === undefined) return null;
        return (
          <LigneRecap key={ecran} label={LIBELLE_ECRAN_ETUDE_LOCALE[ecran]} statut={statutEcran(ecran)}>
            {contenu(ecran)}
          </LigneRecap>
        );
      })}
      <RecapTotalPoints
        ecrans={ordreEcransEtudeLocale(exercice)
          .filter((ecran) => resultat.scores[ecran] !== undefined)
          .map((ecran) => {
            const info = aideParPhase[ecran];
            return { revele: info?.revele ?? false, niveauAide: info?.niveauAide ?? null };
          })}
      />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
