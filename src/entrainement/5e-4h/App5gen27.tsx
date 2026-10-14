import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceFonctionDerivee } from "./generateurs5e/fonctionDerivee/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionFonctionDerivee,
  niveauAideMaxFonctionDerivee,
  soumettreReponseCalculer,
  soumettreReponseDecomposerComposee,
  soumettreReponseDecomposerUV,
  soumettreReponseReconnaissance,
} from "./moteur5e/sessionFonctionDerivee";
import type { EtatSessionFonctionDerivee } from "./moteur5e/typesFonctionDerivee";
import {
  diagnostiquerCalculerDerivee,
  diagnostiquerChampExterieur,
  diagnostiquerChampInterieur,
  diagnostiquerChampU,
  diagnostiquerChampV,
} from "./moteur5e/verificationFonctionDerivee";
import type { ExerciceFonctionDerivee, TypeDerivee } from "./core5e/fonctionDerivee.types";
import { EtapeReconnaissanceFonctionDerivee } from "./components5e/EtapeReconnaissanceFonctionDerivee";
import { EtapeDecomposerFonctionDerivee } from "./components5e/EtapeDecomposerFonctionDerivee";
import { EtapeCalculerFonctionDerivee } from "./components5e/EtapeCalculerFonctionDerivee";
import { formatReponseAttendueCalculerLatex, formatTermesReponseAttendueDecomposerLatex, texteReponseAttendueReconnaissance } from "./ui5e/formatFonctionDerivee";
import { calculerRecapitulatifFonctionDerivee } from "./ui5e/recapitulatifFonctionDerivee";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionFonctionDerivee {
  return demarrerSessionFonctionDerivee(REGLAGES_DEMO, genererExerciceFonctionDerivee);
}

/** Réponse réellement attendue de l'écran qui vient de se clore — même dispatch que l'ancien
 * `ResultatPanelFonctionDerivee.tsx` (supprimé, remplacé par la validation inline). "decomposer"
 * a besoin du type RETENU (`etat.typeRetenu`, déjà résolu dès que "reconnaissance" est clos). */
function reponseAttendueFonctionDerivee(exercice: ExerciceFonctionDerivee, phase: "reconnaissance" | "decomposer" | "calculer", typeRetenu: TypeDerivee | null) {
  if (phase === "reconnaissance") return <>{texteReponseAttendueReconnaissance(exercice)}</>;
  if (phase === "decomposer") {
    return (
      <span className="equation-box-termes">
        {formatTermesReponseAttendueDecomposerLatex(exercice, typeRetenu as TypeDerivee).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </span>
    );
  }
  return <Katex expression={formatReponseAttendueCalculerLatex(exercice)} />;
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionFonctionDerivee;
  revele: boolean;
}

/** Séquence RÉELLE d'écrans pour CET exercice — "decomposer" est absent quand la famille est
 * "reglebase" (`exercice.famille` fixe cela dès le tirage, voir `typesFonctionDerivee.ts`) ; connu
 * dès le départ, contrairement à `etat.typeRetenu` (encore `null` tant que "reconnaissance" n'est
 * pas close). */
function ordreEcransReels(exercice: ExerciceFonctionDerivee): ("reconnaissance" | "decomposer" | "calculer")[] {
  return exercice.famille === "reglebase" ? ["reconnaissance", "calculer"] : ["reconnaissance", "decomposer", "calculer"];
}

/** Même heuristique que `calculerRecapitulatifFonctionDerivee` (`scoresPartiels[ecran] === 0 ⟺
 * révélée`). */
function calculerSegmentsProgression(etat: EtatSessionFonctionDerivee): EtatPuceProgression[] {
  return ordreEcransReels(etat.exerciceCourant).map((ecran) => {
    if (ecran === etat.phase) return "courante";
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) return "a-venir";
    return score === 0 ? "revele" : "correcte";
  });
}

export function App5gen27() {
  const [etat, setEtat] = useState<EtatSessionFonctionDerivee>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionFonctionDerivee) {
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
    setEtat(demarrerSessionFonctionDerivee(REGLAGES_DEMO, () => construireAvecFamilleId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueFonctionDerivee(exercice, etat.phase, etat.typeRetenu),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Fonction dérivée</h1>
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifFonctionDerivee(etat)} />
          <EcranCourant
            exercice={exercice}
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
  exercice: ExerciceFonctionDerivee;
  etat: EtatSessionFonctionDerivee;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionFonctionDerivee) => void;
  setEtat: (etat: EtatSessionFonctionDerivee) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({
  exercice,
  etat,
  tentativesUtilisees,
  tentativesMax,
  cleEcran,
  terminerEtape,
  setEtat,
  validation,
}: EcranProps) {
  const niveauAideMax = niveauAideMaxFonctionDerivee();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  switch (etat.phase) {
    case "reconnaissance":
      return (
        <EtapeReconnaissanceFonctionDerivee
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(choix) => terminerEtape(soumettreReponseReconnaissance(etat, choix))}
          validation={validation}
        />
      );

    case "decomposer": {
      const typeRetenu = etat.typeRetenu as Exclude<TypeDerivee, "reglebase">;
      if (typeRetenu === "produit" || typeRetenu === "quotient") {
        return (
          <EtapeDecomposerFonctionDerivee
            key={cleEcran}
            exercice={exercice}
            typeRetenu={typeRetenu}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(reponse) => terminerEtape(soumettreReponseDecomposerUV(etat, { u: reponse.champ1, v: reponse.champ2 }))}
            diagnostiquer={(r) => ({ champ1: diagnostiquerChampU(r.champ1, exercice), champ2: diagnostiquerChampV(r.champ2, exercice) })}
            validation={validation}
          />
        );
      }
      return (
        <EtapeDecomposerFonctionDerivee
          key={cleEcran}
          exercice={exercice}
          typeRetenu={typeRetenu}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseDecomposerComposee(etat, { interieur: reponse.champ1, exterieur: reponse.champ2 }))}
          diagnostiquer={(r) => ({
            champ1: diagnostiquerChampInterieur(r.champ1, exercice, typeRetenu),
            champ2: diagnostiquerChampExterieur(r.champ2, exercice, typeRetenu),
          })}
          validation={validation}
        />
      );
    }

    case "calculer":
      return (
        <EtapeCalculerFonctionDerivee
          key={cleEcran}
          exercice={exercice}
          typeRetenu={etat.typeRetenu as TypeDerivee}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseCalculer(etat, texte))}
          diagnostiquer={(t) => diagnostiquerCalculerDerivee(t, exercice)}
          validation={validation}
        />
      );
  }
}
