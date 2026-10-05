import type { ExerciceEtudierFonction } from "../core5e/etudierFonction.types";
import { domaineAttendu, exclusionsCE, listeSlotsLimites, tableauFPrimeAttendu, tableauFSecondeAttendu } from "../moteur5e/verificationEtudierFonction";
import {
  CONSIGNE_GENERALE_ETUDIER_FONCTION,
  formatEnsembleReelGuideLatex,
  formatEnteteColonnesTableauEtudierFonction,
  formatFPrimeDeXLatex,
  formatFSecondeDeXLatex,
  formatLabelSlotLimite,
  formatLimiteCibleLatex,
  formatTermesDonneesLatex,
  questionFinaleEtudierFonction,
} from "../ui5e/formatEtudierFonction";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { TableauEtudeLocaleRecap } from "./TableauEtudeLocaleRecap";

interface Props {
  exercice: ExerciceEtudierFonction;
  onContinuer: () => void;
}

/**
 * Écran "recap" (étape 7) — PUREMENT présentationnel, réunit dans une seule vue les faits déjà
 * TROUVÉS aux écrans précédents (jamais un nouveau calcul, jamais une nouvelle question à réponse —
 * conforme à CLAUDE.md, "jamais recalculé depuis la réponse élève"). Structure retenue (à discrétion
 * de l'implémentation, consigne source) : domaine + comportement aux bornes en tête, puis les 2
 * tableaux étendus déjà validés (f'/f'') rappelés en lecture seule via `TableauEtudeLocaleRecap`,
 * plutôt qu'une fusion en un unique tableau x|f|f'|f'' — les marqueurs (racines de f' vs f'') ne
 * coïncident pas forcément sur le même axe de colonnes, une fusion forcée risquerait d'induire en
 * erreur sur ce qui est réellement vrai à chaque zone. Aucune vérification ici (bouton "Continuer"
 * simple, jamais un `Valider`).
 */
export function EtapeRecapitulatifEtudierFonction({ exercice, onContinuer }: Props) {
  const attenduFPrime = tableauFPrimeAttendu(exercice);
  const attenduFSeconde = tableauFSecondeAttendu(exercice);
  const enteteFPrime = formatEnteteColonnesTableauEtudierFonction(exercice, attenduFPrime.colonnes, "fprime");
  const enteteFSeconde = formatEnteteColonnesTableauEtudierFonction(exercice, attenduFSeconde.colonnes, "fseconde");
  const slots = listeSlotsLimites(exercice);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_ETUDIER_FONCTION}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <QuestionFinale question={questionFinaleEtudierFonction()} />

      <h3>Synthèse de l'étude</h3>

      <div className="etat-actuel-box etat-actuel-box-termes">
        {exclusionsCE(exercice).length > 0 && <Katex expression={`domf=${formatEnsembleReelGuideLatex(domaineAttendu(exercice))}`} />}
        {slots.map((slot, i) => {
          const termeLimite = `${formatLabelSlotLimite(slot).replace("=\\,?", "")}${formatLimiteCibleLatex(slot)}`;
          return <Katex key={i} expression={termeLimite} block={termeLimite.includes("\\lim_{")} />;
        })}
        <Katex expression={formatFPrimeDeXLatex(exercice)} />
        <Katex expression={formatFSecondeDeXLatex(exercice)} />
      </div>

      <p className="prompt-text">Tableau de variations (issu de f') :</p>
      <TableauEtudeLocaleRecap colonnes={attenduFPrime.colonnes} enteteColonnes={enteteFPrime} mode="fprime" attendu={attenduFPrime} />

      <p className="prompt-text">Tableau de concavité (issu de f'') :</p>
      <TableauEtudeLocaleRecap colonnes={attenduFSeconde.colonnes} enteteColonnes={enteteFSeconde} mode="fseconde" attendu={attenduFSeconde} />

      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        Continuer vers le graphique
      </button>
    </div>
  );
}
