import { useRef, useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionOptimisation,
  soumettreReponseContrainteEtGrandeur,
  soumettreReponseDecision,
  soumettreReponseDomaine,
  soumettreReponseIdentification,
  soumettreReponseInterpretation,
  soumettreReponseSommet,
  soumettreReponseSysteme,
} from "./moteur/sessionOptimisation";
import type { EtatSessionOptimisation, PhaseOptimisation } from "./moteur/typesOptimisation";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceOptimisation } from "./generateurs/optimisation";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifOptimisation } from "./ui/recapitulatifOptimisation";
import { EtapeIdentificationOptimisation } from "./components/EtapeIdentificationOptimisation";
import { EtapeContrainteEtGrandeurOptimisation } from "./components/EtapeContrainteEtGrandeurOptimisation";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeSystemeOptimisation } from "./components/EtapeSystemeOptimisation";
import { EtapeDomaineOptimisation } from "./components/EtapeDomaineOptimisation";
import { EtapeSommetOptimisation } from "./components/EtapeSommetOptimisation";
import { EtapeDecisionOptimisation } from "./components/EtapeDecisionOptimisation";
import { EtapeInterpretationOptimisation } from "./components/EtapeInterpretationOptimisation";
import { Katex } from "./components/Katex";
import {
  formatDomaineLatex,
  formatFonctionDeveloppeeLatex,
  formatOptimalAttenduLatex,
  formatSommetAttenduLatex,
  formatSystemeAccoladeLatex,
  libellePositionOptimum,
} from "./ui/formatOptimisation";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionOptimisation {
  return demarrerSessionOptimisation(REGLAGES_DEMO, genererExerciceOptimisation);
}

const LIBELLE_PHASE: Record<PhaseOptimisation, string> = {
  identification: "Identifier x et y",
  contrainteEtGrandeur: "Poser la contrainte et exprimer la grandeur",
  systeme: "Résoudre le système",
  domaine: "Domaine de validité",
  sommet: "Sommet",
  decision: "Décision — sommet ou borne",
  interpretation: "Interprétation",
};

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionOptimisation;
  revele: boolean;
}

export function AppOptimisation() {
  const [etat, setEtat] = useState<EtatSessionOptimisation>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionOptimisation) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "identification"
          ? nouvelEtat.identificationRevele
          : etat.phase === "contrainteEtGrandeur"
            ? nouvelEtat.contrainteEtGrandeurRevele
            : etat.phase === "systeme"
              ? nouvelEtat.systemeRevele
              : etat.phase === "domaine"
                ? nouvelEtat.domaineRevele
                : etat.phase === "sommet"
                  ? nouvelEtat.sommetRevele
                  : etat.phase === "decision"
                    ? nouvelEtat.decisionRevele
                    : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.interpretationRevele;
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

  function onGenererDev(familleId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionOptimisation(REGLAGES_DEMO, () => construireAvecFamilleId(familleId as (typeof CATALOGUE_FAMILLES)[number]["id"])));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  /** `estPremierEcran` : vrai uniquement sur le premier écran vu pour CET `exercice` (voir
   * `EnTeteExercice.tsx`, option 1B "plein puis compact"). */
  const premierePhaseRef = useRef(phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = phase;
  }
  const estPremierEcran = phase === premierePhaseRef.current;

  const optionCorrecte = exercice.optionsInterpretation.find((option) => option.correcte);

  const recapitulatif = calculerRecapitulatifOptimisation(etat);

  const reponseAttendue =
    phase === "contrainteEtGrandeur" && exercice.variante === "modelisation" ? (
      <>
        Relation attendue : <Katex expression={formatSystemeAccoladeLatex(exercice)} />
      </>
    ) : phase === "systeme" && exercice.variante === "modelisation" ? (
      <>
        Réponse attendue : <Katex expression={formatFonctionDeveloppeeLatex(exercice.fonction, exercice.contexte.labelVariable)} />
      </>
    ) : phase === "domaine" && exercice.variante === "modelisation" ? (
      <>
        Domaine attendu : <Katex expression={formatDomaineLatex(exercice.domaine, exercice.contexte.labelVariable)} />
      </>
    ) : phase === "sommet" ? (
      <>
        Sommet attendu : <Katex expression={formatSommetAttenduLatex(exercice)} />
      </>
    ) : phase === "decision" ? (
      <>
        Optimum attendu ({libellePositionOptimum(exercice)}) : <Katex expression={formatOptimalAttenduLatex(exercice)} />
      </>
    ) : phase === "interpretation" && optionCorrecte ? (
      <>Interprétation attendue : {optionCorrecte.texte}</>
    ) : null;

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
        <h1 className="app-title">Problèmes d'optimisation (fonction du second degré)</h1>
        <p className="app-subtitle">Chapitre 1</p>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={onGenererDev} />
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[phase]}</span>
          </div>
        </div>
      </header>

      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={recapitulatif} />
          {phase === "identification" && exercice.variante === "modelisation" ? (
            <EtapeIdentificationOptimisation
              key={phase}
              exercice={exercice}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) => terminerEtape(soumettreReponseIdentification(etat, reponse))}
              validation={validation}
            />
          ) : phase === "contrainteEtGrandeur" && exercice.variante === "modelisation" ? (
            <EtapeContrainteEtGrandeurOptimisation
              key={phase}
              exercice={exercice}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideContrainteEtGrandeur}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseContrainteEtGrandeur(etat, reponse))}
              validation={validation}
            />
          ) : phase === "systeme" && exercice.variante === "modelisation" ? (
            <EtapeSystemeOptimisation
              key={phase}
              exercice={exercice}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideSysteme}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseSysteme(etat, texte))}
              validation={validation}
            />
          ) : phase === "domaine" && exercice.variante === "modelisation" ? (
            <EtapeDomaineOptimisation
              key={phase}
              exercice={exercice}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideDomaine}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseDomaine(etat, reponse))}
              validation={validation}
            />
          ) : phase === "sommet" ? (
            <EtapeSommetOptimisation
              key={phase}
              exercice={exercice}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideSommet}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSommet(etat, reponse))}
              validation={validation}
            />
          ) : phase === "decision" ? (
            <EtapeDecisionOptimisation
              key={phase}
              exercice={exercice}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideDecision}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseDecision(etat, reponse))}
              validation={validation}
            />
          ) : phase === "interpretation" ? (
            <EtapeInterpretationOptimisation
              key={phase}
              exercice={exercice}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideInterpretation}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(indexChoisi) => terminerEtape(soumettreReponseInterpretation(etat, indexChoisi))}
              validation={validation}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}
