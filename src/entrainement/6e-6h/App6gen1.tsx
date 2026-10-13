import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceInjectiviteFonctions } from "./generateurs6e/injectiviteFonctions";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionInjectiviteFonctions,
  soumettreReponseBijection,
  soumettreReponseDomaine,
  soumettreReponseImage,
  soumettreReponseInjective,
  soumettreReponseReciproque,
} from "./moteur6e/sessionInjectiviteFonctions";
import type { EtatSessionInjectiviteFonctions } from "./moteur6e/typesInjectiviteFonctions";
import { Katex } from "./components/Katex";
import { EtapeBijectionInjectiviteFonctions } from "./components6e/EtapeBijectionInjectiviteFonctions";
import { EtapeDomaineInjectiviteFonctions } from "./components6e/EtapeDomaineInjectiviteFonctions";
import { EtapeImageInjectiviteFonctions } from "./components6e/EtapeImageInjectiviteFonctions";
import { EtapeInjectiveInjectiviteFonctions } from "./components6e/EtapeInjectiveInjectiviteFonctions";
import { EtapeReciproqueInjectiviteFonctions } from "./components6e/EtapeReciproqueInjectiviteFonctions";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { formatEnsembleReelLatex } from "./ui6e/formatEnsembleReel";
import { calculerRecapitulatifInjectiviteFonctions, calculerSegmentsProgressionInjectiviteFonctions } from "./ui6e/recapitulatifInjectiviteFonctions";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionInjectiviteFonctions {
  return demarrerSessionInjectiviteFonctions(REGLAGES_DEMO, genererExerciceInjectiviteFonctions);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionInjectiviteFonctions;
  revele: boolean;
}

export function App6gen1() {
  const [etat, setEtat] = useState<EtatSessionInjectiviteFonctions>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionInjectiviteFonctions) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // Le champ "Partiel" correspondant à la phase qui VIENT de se clore (`etat.phase`, pas
      // `nouvelEtat.phase`) — sauf "bijection", dernière phase, dont la révélation n'est jamais
      // stockée en "Partiel" mais directement dans le `resultats` qui vient d'être poussé (voir
      // `avancerPhase`/`cloturerExerciceOuSuivant`, `sessionInjectiviteFonctions.ts`).
      const revele =
        etat.phase === "domaine"
          ? (nouvelEtat.reveleDomainePartiel as boolean)
          : etat.phase === "injective"
            ? (nouvelEtat.reveleInjectivePartiel as boolean)
            : etat.phase === "reciproque"
              ? (nouvelEtat.reveleReciproquePartiel as boolean)
              : etat.phase === "image"
                ? (nouvelEtat.reveleImagePartiel as boolean)
                : nouvelEtat.resultats[nouvelEtat.resultats.length - 1].reveleBijection;
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

  function forcerVariante(id: string) {
    setEnAttente(null);
    setEtat(demarrerSessionInjectiviteFonctions(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const exercice = etat.exerciceCourant;
  const premierePhaseRef = useRef(etat.phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = etat.phase;
  }
  const estPremierEcran = etat.phase === premierePhaseRef.current;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAideMax = NIVEAU_AIDE_MAX[etat.phase];
  const intervalleConfirme = exercice.injective
    ? exercice.domaine
    : etat.coteChoisi === "gauche"
      ? exercice.intervalleGauche
      : exercice.intervalleDroite;

  const reponseAttenduePhase = (phase: typeof etat.phase) => {
    switch (phase) {
      case "domaine":
        return <Katex expression={formatEnsembleReelLatex(exercice.domaine)} />;
      case "injective":
        return exercice.injective ? (
          "Oui"
        ) : (
          <>
            Non — injective sur <Katex expression={formatEnsembleReelLatex(exercice.intervalleGauche)} /> ou sur{" "}
            <Katex expression={formatEnsembleReelLatex(exercice.intervalleDroite)} />
          </>
        );
      case "reciproque":
        return "f⁻¹(x) — voir la méthode (poser y=f(x), échanger x/y, isoler y) appliquée à l'intervalle retenu.";
      case "image":
        return <Katex expression={formatEnsembleReelLatex(exercice.image)} />;
      case "bijection":
      default:
        return (
          <>
            Sur <Katex expression={formatEnsembleReelLatex(exercice.intervalleGauche)} /> (ou{" "}
            <Katex expression={formatEnsembleReelLatex(exercice.intervalleDroite)} />
            {") dans "}
            <Katex expression={formatEnsembleReelLatex(exercice.image)} />
          </>
        );
    }
  };

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttenduePhase(etat.phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Fonctions injectives / surjectives / bijectives</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionInjectiviteFonctions(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifInjectiviteFonctions(etat)} />
        <div className="card-body">
          {etat.phase === "domaine" && (
            <EtapeDomaineInjectiviteFonctions
              key={etat.phase}
              estPremierEcran={estPremierEcran}
              exercice={exercice}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseDomaine(etat, reponse))}
              validation={validation}
            />
          )}
          {etat.phase === "injective" && (
            <EtapeInjectiveInjectiviteFonctions
              key={etat.phase}
              estPremierEcran={estPremierEcran}
              exercice={exercice}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseInjective(etat, reponse))}
              validation={validation}
            />
          )}
          {etat.phase === "reciproque" && (
            <EtapeReciproqueInjectiviteFonctions
              key={etat.phase}
              estPremierEcran={estPremierEcran}
              exercice={exercice}
              coteChoisi={etat.coteChoisi}
              intervalleConfirme={intervalleConfirme}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseReciproque(etat, reponse))}
              validation={validation}
            />
          )}
          {etat.phase === "image" && (
            <EtapeImageInjectiviteFonctions
              key={etat.phase}
              estPremierEcran={estPremierEcran}
              exercice={exercice}
              intervalleConfirme={intervalleConfirme}
              coteChoisi={etat.coteChoisi}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseImage(etat, reponse))}
              validation={validation}
            />
          )}
          {etat.phase === "bijection" && (
            <EtapeBijectionInjectiviteFonctions
              key={etat.phase}
              estPremierEcran={estPremierEcran}
              exercice={exercice}
              intervalleConfirme={intervalleConfirme}
              coteChoisi={etat.coteChoisi}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={niveauAideMax}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseBijection(etat, reponse))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
