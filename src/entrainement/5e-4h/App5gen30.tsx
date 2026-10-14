import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLectureGraphiqueDerivees } from "./generateurs5e/lectureGraphiqueDerivees";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionLectureGraphiqueDerivees,
  niveauAideMaxLectureGraphiqueDerivees,
  soumettreReponseAsymptotes,
  soumettreReponseExtremums,
  soumettreReponseInflexions,
  soumettreReponseTableauFPrime,
  soumettreReponseTableauFSeconde,
} from "./moteur5e/sessionLectureGraphiqueDerivees";
import type { EcranLectureGraphiqueDerivees, EtatSessionLectureGraphiqueDerivees } from "./moteur5e/typesLectureGraphiqueDerivees";
import { ordreEcransLectureGraphiqueDerivees } from "./moteur5e/typesLectureGraphiqueDerivees";
import { diagnostiquerCibleAsymptote, listeAsymptotes } from "./moteur5e/verificationLectureGraphiqueDerivees";
import { diagnostiquerChampParmiCiblesExtremum, diagnostiquerChampParmiCiblesInflexion } from "./moteur5e/verificationLectureGraphiqueDerivees";
import { tableauFPrimeAttendu, tableauFSecondeAttendu } from "./moteur5e/verificationLectureGraphiqueDerivees";
import type { ExerciceLectureGraphiqueDerivees } from "./core5e/lectureGraphiqueDerivees.types";
import { EtapeAsymptotesLectureGraphiqueDerivees } from "./components5e/EtapeAsymptotesLectureGraphiqueDerivees";
import { EtapeTableauLectureGraphiqueDerivees } from "./components5e/EtapeTableauLectureGraphiqueDerivees";
import { EtapeChampsLectureGraphiqueDerivees } from "./components5e/EtapeChampsLectureGraphiqueDerivees";
import { TableauEtudeLocaleRecap } from "./components5e/TableauEtudeLocaleRecap";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import { calculerRecapitulatifLectureGraphiqueDerivees } from "./ui5e/recapitulatifLectureGraphiqueDerivees";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import {
  formatEnteteColonnesTableauFPrime,
  formatEnteteColonnesTableauFSeconde,
  formatReponseAttenduePhaseLatex,
  labelsChampsExtremums,
  labelsChampsInflexions,
  precisionAnnonceeExtremum,
  precisionAnnonceeInflexion,
} from "./ui5e/formatLectureGraphiqueDerivees";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionLectureGraphiqueDerivees {
  return demarrerSessionLectureGraphiqueDerivees(REGLAGES_DEMO, genererExerciceLectureGraphiqueDerivees);
}

/** Réponse attendue de la phase qui vient de se terminer — réplique exactement `contenu(phase)` de
 * l'ancien `ResultatPanelLectureGraphiqueDerivees.tsx` (le rappel graphique persistant de ce
 * panneau n'est pas repris ici : chaque écran `EtapeXxx` affiche déjà `LectureGraphiqueDeriveesGraph`
 * en continu, validation comprise). */
function reponseAttenduePhase(exercice: ExerciceLectureGraphiqueDerivees, phase: EcranLectureGraphiqueDerivees): ReactNode {
  if (phase === "tableauFPrime" || phase === "tableauFSeconde") {
    const mode = phase === "tableauFPrime" ? "fprime" : "fseconde";
    const attendu = mode === "fprime" ? tableauFPrimeAttendu(exercice) : tableauFSecondeAttendu(exercice);
    const enteteColonnes = mode === "fprime" ? formatEnteteColonnesTableauFPrime(exercice, attendu.colonnes) : formatEnteteColonnesTableauFSeconde(exercice, attendu.colonnes);
    return <TableauEtudeLocaleRecap colonnes={attendu.colonnes} enteteColonnes={enteteColonnes} mode={mode} attendu={attendu} />;
  }
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

/** État tenu en attente dès qu'un écran se termine — l'état de session calculé par le moteur n'est
 * appliqué (`setEtat`) qu'au clic sur le bouton de `ValidationEcran` (convention CLAUDE.md). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionLectureGraphiqueDerivees;
  revele: boolean;
}

/** Puces de progression — séquence RÉELLEMENT parcourue par CET exercice
 * (`ordreEcransLectureGraphiqueDerivees`, 2 à 5 écrans selon les asymptotes/extrema/PI
 * effectivement présents — jamais la liste complète des 5 écrans possibles). Aucun booléen
 * `xxxRevele` dédié par écran côté session : `scoresPartiels`
 * (`moteur5e/typesLectureGraphiqueDerivees.ts`/`sessionLectureGraphiqueDerivees.ts`) garde le score
 * de chaque écran déjà clos de l'exercice courant (remis à `{}` au prochain exercice) — heuristique
 * `score === 0 ⟺ révélée` (`soumettreEtapeTentatives`, `moteur/etapeTentatives.ts` — score forcé à 0
 * exactement quand l'écran est révélé), même convention que `AppMethodeRapide.tsx` (4e). */
function calculerSegmentsProgression(etat: EtatSessionLectureGraphiqueDerivees): EtatPuceProgression[] {
  return ordreEcransLectureGraphiqueDerivees(etat.exerciceCourant).map((ecran) => {
    if (ecran === etat.phase) return "courante";
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) return "a-venir";
    return score === 0 ? "revele" : "correcte";
  });
}

export function App5gen30() {
  const [etat, setEtat] = useState<EtatSessionLectureGraphiqueDerivees>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionLectureGraphiqueDerivees) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setEtat(demarrerSessionLectureGraphiqueDerivees(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;

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
        <h1 className="app-title">Lecture graphique — dérivées et applications</h1>
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifLectureGraphiqueDerivees(etat)} />
          <EcranCourant
            exercice={exercice}
            phase={etat.phase}
            etat={etat}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cleEcran={cleEcran}
            terminerEtape={terminerEtape}
            setEtat={setEtat}
            validation={validation}
          />
        </div>
      </main>
    </div>
  );
}

interface EcranProps {
  exercice: ExerciceLectureGraphiqueDerivees;
  phase: EcranLectureGraphiqueDerivees;
  etat: EtatSessionLectureGraphiqueDerivees;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionLectureGraphiqueDerivees) => void;
  setEtat: (etat: EtatSessionLectureGraphiqueDerivees) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat, validation }: EcranProps) {
  const niveauAideMax = niveauAideMaxLectureGraphiqueDerivees();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  switch (phase) {
    case "asymptotes": {
      const slots = listeAsymptotes(exercice.asymptotique);
      return (
        <EtapeAsymptotesLectureGraphiqueDerivees
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(textes) => terminerEtape(soumettreReponseAsymptotes(etat, textes))}
          diagnostiquer={(textes) => textes.map((t, i) => diagnostiquerCibleAsymptote(t, slots[i].cible))}
          validation={validation}
        />
      );
    }

    case "tableauFPrime":
      return (
        <EtapeTableauLectureGraphiqueDerivees
          key={cleEcran}
          exercice={exercice}
          phase="tableauFPrime"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseTableauFPrime(etat, reponse))}
          validation={validation}
        />
      );

    case "extremums":
      return (
        <EtapeChampsLectureGraphiqueDerivees
          key={cleEcran}
          exercice={exercice}
          phase="extremums"
          labels={labelsChampsExtremums(exercice.extrema)}
          placeholders={exercice.extrema.map(() => "ex : 4")}
          positions={exercice.extrema.map((e) => e.position)}
          precisionAnnoncee={precisionAnnonceeExtremum()}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseExtremums(etat, reponses))}
          diagnostiquer={(t) =>
            diagnostiquerChampParmiCiblesExtremum(
              t,
              exercice.extrema.map((e) => e.valeur),
            )
          }
          validation={validation}
        />
      );

    case "tableauFSeconde":
      return (
        <EtapeTableauLectureGraphiqueDerivees
          key={cleEcran}
          exercice={exercice}
          phase="tableauFSeconde"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseTableauFSeconde(etat, reponse))}
          validation={validation}
        />
      );

    case "inflexions":
      return (
        <EtapeChampsLectureGraphiqueDerivees
          key={cleEcran}
          exercice={exercice}
          phase="inflexions"
          labels={labelsChampsInflexions(exercice.inflexions)}
          placeholders={exercice.inflexions.map(() => "ex : -1.5")}
          positions={exercice.inflexions.map((p) => p.position)}
          precisionAnnoncee={precisionAnnonceeInflexion()}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseInflexions(etat, reponses))}
          diagnostiquer={(t) =>
            diagnostiquerChampParmiCiblesInflexion(
              t,
              exercice.inflexions.map((p) => p.position),
            )
          }
          validation={validation}
        />
      );
  }
}
