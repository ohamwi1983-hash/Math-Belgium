import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceDomaineDefinition, FamilleDomaineDefinition } from "./core5e/domaineDefinition.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDomaineDefinition } from "./generateurs5e/domaineDefinition";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionDomaineDefinition,
  niveauAideMaxCE,
  niveauAideMaxDomf,
  soumettreReponseCE,
  soumettreReponseDomf,
  soumettreReponseResolution,
} from "./moteur5e/sessionDomaineDefinition";
import type { EtatSessionDomaineDefinition, PhaseDomaineDefinition } from "./moteur5e/typesDomaineDefinition";
import { EtapeCEDomaineDefinition } from "./components5e/EtapeCEDomaineDefinition";
import { EtapeResolutionDomaineDefinition } from "./components5e/EtapeResolutionDomaineDefinition";
import { EtapeDomfDomaineDefinition } from "./components5e/EtapeDomfDomaineDefinition";
import { GrilleQuotientDomfRecap } from "./components5e/GrilleQuotientDomfRecap";
import { formatCEAttendueLatex, formatDomfLatex, formatResolutionAttendueLatex } from "./ui5e/formatDomaineDefinition";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionDomaineDefinition {
  return demarrerSessionDomaineDefinition(REGLAGES_DEMO, genererExerciceDomaineDefinition);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionDomaineDefinition;
  revele: boolean;
}

/** Reproduit exactement ce que `ResultatPanelDomaineDefinition` affichait pour UNE phase donnée,
 * scopé à l'exercice/phase qui vient juste de se terminer (`etat.exerciceCourant`/`etat.phase`,
 * jamais `enAttente.etatSuivant`). */
function reponseAttenduePhase(exercice: ExerciceDomaineDefinition, phase: PhaseDomaineDefinition): ReactNode {
  if (phase === "ce") return <Katex expression={formatCEAttendueLatex(exercice)} />;
  if (phase === "resolution") {
    if (exercice.famille === "fractionSousRacine") return <GrilleQuotientDomfRecap exercice={exercice} />;
    return <Katex expression={formatResolutionAttendueLatex(exercice) ?? ""} />;
  }
  return <Katex expression={formatDomfLatex(exercice.domf)} />;
}

/** Signal `revele` de la phase qui vient JUSTE de se terminer (`phaseFinie` = `etat.phase` AVANT
 * la transition) — "ce"/"resolution" l'exposent directement sur `nouvelEtat` ; "domf" clôture
 * toujours l'exercice (`cloturerExerciceOuSuivant`), donc seul le dernier `resultats[...]` le
 * porte encore. */
function releveRevelePhase(nouvelEtat: EtatSessionDomaineDefinition, phaseFinie: PhaseDomaineDefinition): boolean {
  if (phaseFinie === "ce") return nouvelEtat.ceRevele;
  if (phaseFinie === "resolution") return nouvelEtat.resolutionRevele;
  return nouvelEtat.resultats[nouvelEtat.resultats.length - 1].domfRevele;
}

export function App5gen1() {
  const [etat, setEtat] = useState<EtatSessionDomaineDefinition>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  // Compteur de génération — le panneau dev "forcer une variante" peut remplacer `exerciceCourant`
  // sans jamais changer `phase` (toujours "ce" avant ET après, les 6 familles démarrant toutes sur
  // cet écran) : sans clé dédiée, React réutilise l'instance déjà montée d'`EtapeCEDomaineDefinition`
  // au lieu de la remonter, laissant son état interne (`lignes`, notamment `slotId`) figé sur
  // l'exercice PRÉCÉDENT — même classe de bug que gen53 (4e)/5gen6/5gen7 ("composant d'écran partagé
  // non remonté entre phases"), ici entre deux exercices plutôt qu'entre deux écrans.
  const [generationExercice, setGenerationExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionDomaineDefinition) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: releveRevelePhase(nouvelEtat, etat.phase) });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice: ExerciceDomaineDefinition = etat.exerciceCourant;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttenduePhase(exercice, etat.phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Domaine de définition</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_FAMILLES}
        onGenerer={(id) => {
          setEnAttente(null);
          setGenerationExercice((g) => g + 1);
          setEtat(demarrerSessionDomaineDefinition(REGLAGES_DEMO, () => construireAvecFamilleId(id as FamilleDomaineDefinition)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {etat.phase === "ce" && (
            <EtapeCEDomaineDefinition
              key={generationExercice}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideCE}
              niveauAideMax={niveauAideMaxCE(exercice)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              donnees={
                <div className="equation-box">
                  <Katex expression={exercice.fLatex} block />
                </div>
              }
              onValider={(reponse) => terminerEtape(soumettreReponseCE(etat, reponse))}
              validation={validation}
            />
          )}
          {etat.phase === "resolution" && (
            <EtapeResolutionDomaineDefinition
              key={generationExercice}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              donnees={
                <div className="equation-box">
                  <Katex expression={exercice.fLatex} block />
                </div>
              }
              onValider={(reponse) => terminerEtape(soumettreReponseResolution(etat, reponse))}
              validation={validation}
            />
          )}
          {etat.phase === "domf" && (
            <EtapeDomfDomaineDefinition
              key={generationExercice}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideDomf}
              niveauAideMax={niveauAideMaxDomf(exercice)}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              donnees={
                <div className="equation-box">
                  <Katex expression={exercice.fLatex} block />
                </div>
              }
              onValider={(reponse) => terminerEtape(soumettreReponseDomf(etat, reponse))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
