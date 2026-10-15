import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLectureGraphiqueLimites } from "./generateurs5e/lectureGraphiqueLimites";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  demarrerSessionLectureGraphiqueLimites,
  soumettreReponseCompleterLimites,
  soumettreReponseNommerAsymptotes,
} from "./moteur5e/sessionLectureGraphiqueLimites";
import { listeAsymptotes, listeComportements, ordreComplet } from "./moteur5e/typesLectureGraphiqueLimites";
import type { EtatSessionLectureGraphiqueLimites, PhaseLectureGraphiqueLimites } from "./moteur5e/typesLectureGraphiqueLimites";
import { diagnostiquerCibleAsymptote, diagnostiquerCibleComportement } from "./moteur5e/verificationLectureGraphiqueLimites";
import type { ExerciceLectureGraphiqueLimites } from "./core5e/lectureGraphiqueLimites.types";
import { EtapeComportementsLimites } from "./components5e/EtapeComportementsLimites";
import { EtapeEquationsAsymptotes } from "./components5e/EtapeEquationsAsymptotes";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";
import { formatReponseAttenduePhaseLatex } from "./ui5e/formatLectureGraphiqueLimites";
import { calculerRecapitulatifLectureGraphiqueLimites } from "./ui5e/recapitulatifLectureGraphiqueLimites";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionLectureGraphiqueLimites {
  return demarrerSessionLectureGraphiqueLimites(REGLAGES_DEMO, genererExerciceLectureGraphiqueLimites);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionLectureGraphiqueLimites;
  revele: boolean;
}

/** Une puce par phase de `ordreComplet(etat.exerciceCourant)` — "nommerAsymptotes" est SAUTÉE
 * quand le tirage n'a aucune asymptote à nommer, jamais un `ORDRE_PHASES` fixe à 2 éléments
 * reconstitué à la main : même source que `calculerRecapitulatifLectureGraphiqueLimites`.
 * "courante" pour `etat.phase`, "correcte"/"revele" pour les phases déjà closes
 * (`scoresPartiels[phase]`, 0 ⟺ révélée — exact ici, 5gen22 n'a pas de mécanisme d'aide), "a-venir"
 * au-delà. */
function calculerSegmentsProgression(etat: EtatSessionLectureGraphiqueLimites): EtatPuceProgression[] {
  return ordreComplet(etat.exerciceCourant).map((phase) => {
    if (phase === etat.phase) return "courante";
    const score = etat.scoresPartiels[phase];
    if (score === undefined) return "a-venir";
    return score === 0 ? "revele" : "correcte";
  });
}

export function App5gen22() {
  const [etat, setEtat] = useState<EtatSessionLectureGraphiqueLimites>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos — tenu ICI, à part de
   * `EtatSessionLectureGraphiqueLimites`, jamais dans le moteur (même principe que
   * `AppAnalyseFonction.tsx`, 4e). Pas de puce "aide" ici : 5gen22 n'a aucun mécanisme d'aide
   * (voir le commentaire de `calculerSegmentsProgression`). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionLectureGraphiqueLimites) {
    const recap = calculerRecapitulatifLectureGraphiqueLimites(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? (derniere.estLatex ? <Katex expression={derniere.valeur} /> : derniere.valeur) : undefined,
      },
    ]);
  }

  function terminerEtape(nouvelEtat: EtatSessionLectureGraphiqueLimites, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) ajouterHistorique(votreReponse, nouvelEtat);
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;
  const phase = etat.phase;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <span className="equation-box-termes">
            {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
              <Katex key={i} expression={frag} block={frag.includes("\\lim_{")} />
            ))}
          </span>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Limites et asymptotes — lecture graphique</h1>
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_FAMILLES}
        onGenerer={(id) => {
          setEnAttente(null);
          setHistorique([]);
          setEtat(demarrerSessionLectureGraphiqueLimites(REGLAGES_DEMO, () => construireAvecFamilleId(id)));
        }}
      />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifLectureGraphiqueLimites(etat)} />
          <EcranCourant
            exercice={exercice}
            phase={phase}
            etat={etat}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cleEcran={cleEcran}
            terminerEtape={terminerEtape}
            validation={validation}
          />
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

interface EcranProps {
  exercice: ExerciceLectureGraphiqueLimites;
  phase: PhaseLectureGraphiqueLimites;
  etat: EtatSessionLectureGraphiqueLimites;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionLectureGraphiqueLimites, votreReponse?: ReactNode) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({
  exercice,
  phase,
  etat,
  tentativesUtilisees,
  tentativesMax,
  cleEcran,
  terminerEtape,
  validation,
}: EcranProps) {
  switch (phase) {
    case "completerLimites": {
      const slots = listeComportements(exercice);
      return (
        <EtapeComportementsLimites
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          onValider={(textes) => terminerEtape(soumettreReponseCompleterLimites(etat, textes), textes.join(" ; "))}
          diagnostiquer={(textes) => textes.map((t, i) => diagnostiquerCibleComportement(t, slots[i].cible))}
          validation={validation}
        />
      );
    }

    case "nommerAsymptotes": {
      const slots = listeAsymptotes(exercice);
      return (
        <EtapeEquationsAsymptotes
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          onValider={(textes) => terminerEtape(soumettreReponseNommerAsymptotes(etat, textes), textes.join(" ; "))}
          diagnostiquer={(textes) => textes.map((t, i) => diagnostiquerCibleAsymptote(t, slots[i].cible))}
          validation={validation}
        />
      );
    }
  }
}
