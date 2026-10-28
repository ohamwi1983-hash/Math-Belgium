import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRelationsDroites } from "./generateurs/relationsDroites";
import type { VarianteRelationsDroites } from "./core/relationsDroites.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { activerAideSuivante, demarrerSessionRelationsDroites, soumettreReponseConstruction, soumettreReponseEquation, soumettreReponseExtraction } from "./moteur/sessionRelationsDroites";
import type { EtatSessionRelationsDroites, PhaseRelationsDroites } from "./moteur/typesRelationsDroites";
import { EtapeConstructionRelationsDroites } from "./components/EtapeConstructionRelationsDroites";
import { EtapeEquationRelationsDroites } from "./components/EtapeEquationRelationsDroites";
import { EtapeExtractionRelationsDroites } from "./components/EtapeExtractionRelationsDroites";
import { Katex } from "./components/Katex";
import {
  formatAideConstructionNiveau2Latex,
  formatAideEquationNiveau2Latex,
  formatEtatActuelVecteurChercheLatex,
  formatEtatActuelVecteurReferenceLatex,
} from "./ui/formatRelationsDroites";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifRelationsDroites } from "./ui/recapitulatifRelationsDroites";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionRelationsDroites {
  return demarrerSessionRelationsDroites(REGLAGES_DEMO, genererExerciceRelationsDroites);
}

/** Ordre d'affichage des puces de progression — même ordre que la vraie séquence (3 phases fixes,
 * aucun saut conditionnel, voir `typesRelationsDroites.ts`). "equation" (dernière phase) n'a
 * jamais besoin de sa propre branche "close" — même principe que gen9/gen55. Puces purement
 * visuelles. */
const ORDRE_PHASES: PhaseRelationsDroites[] = ["extraction", "construction", "equation"];

function calculerSegmentsProgression(etat: EtatSessionRelationsDroites): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele = phase === "extraction" ? etat.extractionRevele : etat.constructionRevele;
    if (revele) return "revele";
    const niveauAide = phase === "extraction" ? etat.niveauAideExtraction : etat.niveauAideConstruction;
    return niveauAide > 0 ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionRelationsDroites;
  revele: boolean;
}

export function AppRelationsDroites() {
  const [etat, setEtat] = useState<EtatSessionRelationsDroites>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionRelationsDroites) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "extraction"
          ? nouvelEtat.extractionRevele
          : etat.phase === "construction"
            ? nouvelEtat.constructionRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.equationRevele;
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

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionRelationsDroites(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteRelationsDroites)));
  }

  const exercice = etat.exerciceCourant;
  const recapitulatif = calculerRecapitulatifRelationsDroites(etat);

  const reponseAttendue =
    etat.phase === "extraction" ? (
      <Katex expression={formatEtatActuelVecteurReferenceLatex(exercice)} />
    ) : etat.phase === "construction" ? (
      <Katex expression={formatAideConstructionNiveau2Latex(exercice)} />
    ) : (
      <>
        Point + vecteur attendus : <Katex expression={formatEtatActuelVecteurChercheLatex(exercice)} />
        <br />
        Équation attendue : <Katex expression={formatAideEquationNiveau2Latex(exercice)} />
      </>
    );

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Relations entre droites</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie analytique</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>

      <main className="card">
        <div className="card-body">
        <RecapitulatifPanel entrees={recapitulatif} />
        {etat.phase === "extraction" ? (
          <EtapeExtractionRelationsDroites
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideExtraction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseExtraction(etat, reponse))}
            validation={validation}
          />
        ) : etat.phase === "construction" ? (
          <EtapeConstructionRelationsDroites
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideConstruction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseConstruction(etat, reponse))}
            validation={validation}
          />
        ) : (
          <EtapeEquationRelationsDroites
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideEquation}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseEquation(etat, reponse))}
            validation={validation}
          />
        )}
        </div>
      </main>
    </div>
  );
}
