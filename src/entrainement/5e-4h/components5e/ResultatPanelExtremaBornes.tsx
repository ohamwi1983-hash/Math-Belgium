import type { EcranExtremaBornes, ResultatExerciceExtremaBornes } from "../moteur5e/typesExtremaBornes";
import { ORDRE_ECRANS_EXTREMA_BORNES } from "../moteur5e/typesExtremaBornes";
import { candidatsComparaisonBorne, indexMaxAbsoluBorne, indexMinAbsoluBorne, tableauFPrimeBorneAttendu } from "../moteur5e/verificationExtremaBornes";
import { LIBELLE_ECRAN_EXTREMA_BORNES, formatReponseAttenduePhaseLatex } from "../ui5e/formatExtremaBornes";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";
import { TableauEtudeLocaleRecap } from "./TableauEtudeLocaleRecap";

interface Props {
  resultat: ResultatExerciceExtremaBornes;
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Écran récapitulatif final — TOUJOURS 5 lignes (jamais de saut, voir `typesExtremaBornes.ts`),
 * même patron plat/coloré que `ResultatPanelEtudeLocale.tsx` (5gen29). L'écran "tableauFPrime"
 * rend le tableau étendu en lecture seule (`TableauEtudeLocaleRecap`) ; "comparaison" affiche les 2
 * fragments max/min séparément. */
export function ResultatPanelExtremaBornes({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const candidats = candidatsComparaisonBorne(exercice);
  const candidatMax = candidats[indexMaxAbsoluBorne(exercice)];
  const candidatMin = candidats[indexMinAbsoluBorne(exercice)];

  function statutEcran(ecran: string) {
    const info = aideParPhase[ecran];
    return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
  }

  function contenu(ecran: EcranExtremaBornes) {
    if (ecran === "tableauFPrime") {
      const attendu = tableauFPrimeBorneAttendu(exercice);
      const enteteColonnes = attendu.colonnes.map((col) => (col.type === "racine" ? `${exercice.racinesFPrime[col.index]}` : ""));
      return <TableauEtudeLocaleRecap colonnes={attendu.colonnes} enteteColonnes={enteteColonnes} mode="fprime" attendu={attendu} />;
    }
    return (
      <span className="equation-box-termes">
        {formatReponseAttenduePhaseLatex(exercice, ecran, candidatMax, candidatMin).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </span>
    );
  }

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {ORDRE_ECRANS_EXTREMA_BORNES.map((ecran) => (
        <LigneRecap key={ecran} label={LIBELLE_ECRAN_EXTREMA_BORNES[ecran]} statut={statutEcran(ecran)}>
          {contenu(ecran)}
        </LigneRecap>
      ))}
      <RecapTotalPoints
        ecrans={ORDRE_ECRANS_EXTREMA_BORNES.map((ecran) => {
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
