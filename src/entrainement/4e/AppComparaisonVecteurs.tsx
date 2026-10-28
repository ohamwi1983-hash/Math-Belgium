import { useState } from "react";
import type { ExerciceComparaisonVecteurs, ProprieteComparaison } from "./core/comparaisonVecteurs.types";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionComparaisonVecteurs, soumettreReponseEgalite, soumettreReponseSelection } from "./moteur/sessionComparaisonVecteurs";
import type { EtatSessionComparaisonVecteurs, PhaseComparaisonVecteurs } from "./moteur/typesComparaisonVecteurs";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComparaisonVecteurs } from "./generateurs/comparaisonVecteurs";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeSelectionComparaison } from "./components/EtapeSelectionComparaison";
import { EtapeEgaliteComparaison } from "./components/EtapeEgaliteComparaison";
import { Katex } from "./components/Katex";
import { EnTeteExercice } from "./components/EnTeteExercice";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const CONSIGNE_GENERALE = "Compare visuellement ces vecteurs sur la figure.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionComparaisonVecteurs {
  return demarrerSessionComparaisonVecteurs(REGLAGES_DEMO, genererExerciceComparaisonVecteurs);
}

/** Coefficient jamais explicite s'il vaut `1`/`-1` — même convention que le reste de la
 * plateforme (ex. `formatRelationVectorielle.ts::formatCoefficientTraduction`). */
function formatCoefficientLatex(coef: number): string {
  if (coef === 1) return "";
  if (coef === -1) return "-";
  return String(coef);
}

function formatVecteursAttendusLatex(labels: string[]): string {
  return labels.map((label) => `\\vec{${label}}`).join(", ");
}

function formatEgaliteAttendueLatex(exercice: ExerciceComparaisonVecteurs): string {
  return `\\vec{${exercice.cibleEgalite}} = ${formatCoefficientLatex(exercice.coefficientEgalite)}\\vec{${exercice.labelReference}}`;
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionComparaisonVecteurs;
  revele: boolean;
}

const ORDRE_PHASES: PhaseComparaisonVecteurs[] = ["selection", "egalite"];

function calculerSegmentsProgression(etat: EtatSessionComparaisonVecteurs): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((_phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    return etat.selectionRevele ? "revele" : "correcte";
  });
}

export function AppComparaisonVecteurs() {
  const [etat, setEtat] = useState<EtatSessionComparaisonVecteurs>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionComparaisonVecteurs) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "selection" ? nouvelEtat.selectionRevele : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.egaliteRevele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionComparaisonVecteurs(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as ProprieteComparaison)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec
          ? undefined
          : etat.phase === "selection" ? (
              <>
                Vecteurs attendus : <Katex expression={formatVecteursAttendusLatex(exercice.labelsCorrects)} />
              </>
            ) : (
              <>
                Égalité attendue : <Katex expression={formatEgaliteAttendueLatex(exercice)} />
              </>
            ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Comparaison visuelle de vecteurs sur figure</h1>
        <p className="app-subtitle">Chapitre 4 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>

      <main className="card">
        <div className="card-body">
        <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
        {etat.phase === "selection" ? (
          <EtapeSelectionComparaison
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(labels) => terminerEtape(soumettreReponseSelection(etat, labels))}
            validation={validation}
          />
        ) : (
          <EtapeEgaliteComparaison
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(texte) => terminerEtape(soumettreReponseEgalite(etat, texte))}
            validation={validation}
          />
        )}
        </div>
      </main>
    </div>
  );
}
