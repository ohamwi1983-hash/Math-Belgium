import { useRef, useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceOptimisation } from "./generateurs5e/optimisationGeometrique/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionOptimisation,
  niveauAideMaxOptimisation,
  soumettreReponseEcran,
} from "./moteur5e/sessionOptimisationGeometrique";
import type { EtatSessionOptimisation } from "./moteur5e/typesOptimisationGeometrique";
import { ordreEcransOptimisation } from "./moteur5e/typesOptimisationGeometrique";
import { EtapeGeneriqueOptimisation } from "./components5e/EtapeGeneriqueOptimisation";
import { formatReponseAttendueEcranLatex } from "./ui5e/formatOptimisationGeometrique";
import { calculerRecapitulatifOptimisation } from "./ui5e/recapitulatifOptimisation";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionOptimisation {
  return demarrerSessionOptimisation(REGLAGES_DEMO, genererExerciceOptimisation);
}

/** État tenu en attente dès qu'un écran se termine — l'état de session calculé par le moteur n'est
 * appliqué (`setEtat`) qu'au clic sur le bouton de `ValidationEcran` (convention CLAUDE.md). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionOptimisation;
  revele: boolean;
}

/** Même heuristique que `calculerRecapitulatifOptimisation` (`scoresPartiels[ecran] === 0 ⟺
 * révélée`) — `ordreEcransOptimisation(exercice)` donne la séquence RÉELLE (4 écrans pour
 * "cubique", 6-7 pour les autres familles, fixée dès le tirage). */
function calculerSegmentsProgression(etat: EtatSessionOptimisation): EtatPuceProgression[] {
  return ordreEcransOptimisation(etat.exerciceCourant).map((ecran) => {
    if (ecran === etat.phase) return "courante";
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) return "a-venir";
    return score === 0 ? "revele" : "correcte";
  });
}

export function App5gen32() {
  const [etat, setEtat] = useState<EtatSessionOptimisation>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionOptimisation) {
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
    setEtat(demarrerSessionOptimisation(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;
  const niveauAideMax = niveauAideMaxOptimisation();

  const premierePhaseRef = useRef(etat.phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = etat.phase;
  }
  const estPremierEcran = etat.phase === premierePhaseRef.current;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <Katex expression={formatReponseAttendueEcranLatex(exercice, etat.phase)} />,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Optimisation géométrique</h1>
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifOptimisation(etat)} />
          <EtapeGeneriqueOptimisation
            key={cleEcran}
            exercice={exercice}
            phase={etat.phase}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponses) => terminerEtape(soumettreReponseEcran(etat, reponses))}
            validation={validation}
            estPremierEcran={estPremierEcran}
          />
        </div>
      </main>
    </div>
  );
}
