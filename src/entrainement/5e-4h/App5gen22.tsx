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
import type { EtatSessionLectureGraphiqueLimites, PhaseLectureGraphiqueLimites, ReponseNommerAsymptotes } from "./moteur5e/typesLectureGraphiqueLimites";
import { diagnostiquerCibleComportement, diagnostiquerNommerAsymptotes } from "./moteur5e/verificationLectureGraphiqueLimites";
import type { ExerciceLectureGraphiqueLimites } from "./core5e/lectureGraphiqueLimites.types";
import { EtapeComportementsLimites } from "./components5e/EtapeComportementsLimites";
import { EtapeEquationsAsymptotes } from "./components5e/EtapeEquationsAsymptotes";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";
import { LIBELLE_PHASE_LECTURE_GRAPHIQUE, LIBELLE_TYPE_ASYMPTOTE, formatReponseAttenduePhaseLatex } from "./ui5e/formatLectureGraphiqueLimites";
import { calculerRecapitulatifLectureGraphiqueLimites } from "./ui5e/recapitulatifLectureGraphiqueLimites";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

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
  /** Écran révélé AVANT d'épuiser les tentatives (verdict « aucune asymptote » faux) : message adapté. */
  closTot: boolean;
}

/** Une puce par phase de `ordreComplet(etat.exerciceCourant)` (toujours les 2 écrans depuis l'audit
 * 5e ch. 4 : « aucune asymptote » se répond à l'écran 2) — même source que
 * `calculerRecapitulatifLectureGraphiqueLimites`.
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
  /** Incrémenté à chaque « Générer » / « Nouvel exercice » : la clé d'écran change, les champs se
   * vident même quand le nouvel exercice recommence au même écran (audit 5e ch. 4). */
  const [numeroGeneration, setNumeroGeneration] = useState(0);

  /** Fiche de l'écran QUI VIENT DE SE CLORE (`etat.phase`, avant la transition) — jamais « la dernière
   * entrée du récapitulatif », qui peut appartenir à l'exercice suivant. */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionLectureGraphiqueLimites) {
    const phaseClose = etat.phase;
    const revele = nouvelEtat.derniereEtapeRevelee;
    setHistorique((h) => [
      ...h,
      {
        titre: LIBELLE_PHASE_LECTURE_GRAPHIQUE[phaseClose],
        votreReponse,
        correcte: !revele,
        reponseAttendue: revele ? <Katex expression={formatReponseAttenduePhaseLatex(etat.exerciceCourant, phaseClose).join("\\quad ")} /> : undefined,
      },
    ]);
  }

  function terminerEtape(nouvelEtat: EtatSessionLectureGraphiqueLimites, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) ajouterHistorique(votreReponse, nouvelEtat);
      const closTot = nouvelEtat.derniereEtapeRevelee && etat.etapeCourante.tentativesUtilisees + 1 < etat.reglages.tentativesMax;
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee, closTot });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setNumeroGeneration((g) => g + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${numeroGeneration}-${etat.indexExercice}-${etat.phase}`;
  const phase = etat.phase;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <span className="equation-box-termes">
            {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
              <Katex key={i} expression={frag} block={frag.includes("\\lim_{") || phase === "nommerAsymptotes"} />
            ))}
          </span>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: enAttente.closTot ? "Ce n'était pas la bonne réponse : il y a des asymptotes (ou il n'y en a aucune), ce choix ne se rejoue pas." : undefined,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Limites et asymptotes — lecture graphique</h1>
        <p className="app-subtitle">Chapitre 4 — Limites et asymptotes</p>
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_FAMILLES}
        onGenerer={(id) => {
          setEnAttente(null);
          setHistorique([]);
          setNumeroGeneration((g) => g + 1);
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

/** Réponse de l'écran 2 en clair pour la fiche des puces (« AV : x = 3 ; AH : y = 2 », ou « Aucune asymptote »). */
function texteReponseAsymptotes(reponse: ReponseNommerAsymptotes): string {
  if (reponse.aucune) return "Aucune asymptote";
  return reponse.lignes.map((l) => `${LIBELLE_TYPE_ASYMPTOTE[l.type].sigle} : ${l.type === "verticale" ? "x" : "y"} = ${l.texte}`).join(" ; ");
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
          onValider={(reponse) => terminerEtape(soumettreReponseNommerAsymptotes(etat, reponse), texteReponseAsymptotes(reponse))}
          diagnostiquer={(reponse) => diagnostiquerNommerAsymptotes(reponse, slots)}
          validation={validation}
        />
      );
    }
  }
}
