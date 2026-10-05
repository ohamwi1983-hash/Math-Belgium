import type { EcranEtudierFonction, ResultatExerciceEtudierFonction } from "../moteur5e/typesEtudierFonction";
import { ordreEcransEtudierFonction } from "../moteur5e/typesEtudierFonction";
import { tableauFPrimeAttendu, tableauFSecondeAttendu } from "../moteur5e/verificationEtudierFonction";
import { LIBELLE_ECRAN_ETUDIER_FONCTION, formatEnteteColonnesTableauEtudierFonction, formatReponseAttenduePhaseLatex } from "../ui5e/formatEtudierFonction";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";
import { TableauEtudeLocaleRecap } from "./TableauEtudeLocaleRecap";

interface Props {
  resultat: ResultatExerciceEtudierFonction;
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Écran récapitulatif final — 1 ligne par écran RÉELLEMENT traversé, "recap" (étape 7) EXCLU
 * (jamais noté — voir `typesEtudierFonction.ts`). Même patron plat/coloré que
 * `ResultatPanelEtudeLocale.tsx` (5gen29) : tableaux étendus rendus en lecture seule
 * (`TableauEtudeLocaleRecap`), "graphique" affiché comme une ligne unique (déjà scoré PAR POINT par
 * `PlacementPointsGraphique`, aucun détail supplémentaire pertinent à re-décomposer ici). */
export function ResultatPanelEtudierFonction({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;

  function statutEcran(ecran: string) {
    const info = aideParPhase[ecran];
    return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
  }

  function contenu(ecran: EcranEtudierFonction) {
    if (ecran === "tableauFPrime" || ecran === "tableauFSeconde") {
      const mode = ecran === "tableauFPrime" ? "fprime" : "fseconde";
      const attendu = mode === "fprime" ? tableauFPrimeAttendu(exercice) : tableauFSecondeAttendu(exercice);
      const enteteColonnes = formatEnteteColonnesTableauEtudierFonction(exercice, attendu.colonnes, mode);
      return <TableauEtudeLocaleRecap colonnes={attendu.colonnes} enteteColonnes={enteteColonnes} mode={mode} attendu={attendu} />;
    }
    return (
      <span className="equation-box-termes">
        {formatReponseAttenduePhaseLatex(exercice, ecran).map((frag, i) => (
          <Katex key={i} expression={frag} block={frag.includes("\\lim_{")} />
        ))}
      </span>
    );
  }

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {ordreEcransEtudierFonction(exercice)
        .filter((ecran) => ecran !== "recap")
        .map((ecran) => {
          const score = resultat.scores[ecran];
          if (score === undefined) return null;
          return (
            <LigneRecap key={ecran} label={LIBELLE_ECRAN_ETUDIER_FONCTION[ecran]} statut={statutEcran(ecran)}>
              {contenu(ecran)}
            </LigneRecap>
          );
        })}
      <RecapTotalPoints
        ecrans={ordreEcransEtudierFonction(exercice)
          .filter((ecran) => ecran !== "recap")
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
