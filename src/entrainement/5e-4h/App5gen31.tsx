import { useRef, useState } from "react";
import type { EnsembleReelGuide } from "./core5e/domaineDefinition.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEtudierFonction } from "./generateurs5e/etudierFonction/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  avancerRecap,
  demarrerSessionEtudierFonction,
  niveauAideMaxEtudierFonction,
  niveauAideMaxGraphique,
  soumettreReponseCalculerFPrime,
  soumettreReponseCalculerFSeconde,
  soumettreReponseDomaine,
  soumettreReponseGraphique,
  soumettreReponseLimites,
  soumettreReponseTableauFPrime,
  soumettreReponseTableauFSeconde,
} from "./moteur5e/sessionEtudierFonction";
import type { EcranEtudierFonction, EtatSessionEtudierFonction } from "./moteur5e/typesEtudierFonction";
import { ordreEcransEtudierFonction } from "./moteur5e/typesEtudierFonction";
import { diagnostiquerCalculerFPrime, diagnostiquerCalculerFSeconde, pointsClesEtudierFonction } from "./moteur5e/verificationEtudierFonction";
import { EtapeDomaineEtudierFonction } from "./components5e/EtapeDomaineEtudierFonction";
import { EtapeLimitesEtudierFonction } from "./components5e/EtapeLimitesEtudierFonction";
import { EtapeCalculerDeriveeGenerique } from "./components5e/EtapeCalculerDeriveeGenerique";
import { EtapeTableauEtudierFonction } from "./components5e/EtapeTableauEtudierFonction";
import { EtapeRecapitulatifEtudierFonction } from "./components5e/EtapeRecapitulatifEtudierFonction";
import { PlacementPointsGraphique } from "./components5e/PlacementPointsGraphique";
import { EtudierFonctionGraph } from "./components5e/EtudierFonctionGraph";
import { ResultatPanelEtudierFonction } from "./components5e/ResultatPanelEtudierFonction";
import { ResumeSessionEtudierFonction } from "./components5e/ResumeSessionEtudierFonction";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import { calculerRecapitulatifEtudierFonction } from "./ui5e/recapitulatifEtudierFonction";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionEtudierFonction {
  return demarrerSessionEtudierFonction(REGLAGES_DEMO, genererExerciceEtudierFonction);
}

interface Bilan {
  resultat: EtatSessionEtudierFonction["resultats"][number];
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
}

/** Puces de progression — séquence RÉELLEMENT parcourue par CET exercice
 * (`ordreEcransEtudierFonction`, 7 ou 8 écrans selon `possedeDomaineRestreint`). Index-based plutôt
 * que la seule présence d'un score dans `scoresPartiels` : l'écran "recap" (purement
 * présentationnel, voir `typesEtudierFonction.ts`/`sessionEtudierFonction.ts::avancerRecap`) n'a
 * JAMAIS de clé dans `scoresPartiels` même une fois franchi — seule sa position dans l'ordre avant
 * `etat.phase` dit qu'il est déjà clos ("correcte", jamais "revele", aucune notion de révélation
 * pour un écran sans question). Pour les autres écrans, heuristique `score === 0 ⟺ révélée`
 * (`soumettreEtapeTentatives`, `moteur/etapeTentatives.ts` — score forcé à 0 exactement quand
 * l'écran est révélé), même convention que `AppMethodeRapide.tsx` (4e). */
function calculerSegmentsProgression(etat: EtatSessionEtudierFonction): EtatPuceProgression[] {
  const ordre = ordreEcransEtudierFonction(etat.exerciceCourant);
  const indexCourant = ordre.indexOf(etat.phase);
  return ordre.map((ecran, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) return "correcte";
    return score === 0 ? "revele" : "correcte";
  });
}

export function App5gen31() {
  const [etat, setEtat] = useState<EtatSessionEtudierFonction>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<string, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionEtudierFonction) {
    const miseAJour = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereEtapeRevelee } };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], aideParPhase: miseAJour });
      setAideParPhase({});
    } else {
      setAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;

  const premierePhaseRef = useRef(etat.phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = etat.phase;
  }
  const estPremierEcran = etat.phase === premierePhaseRef.current;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Étudier une fonction</h1>
        {enCoursDeSession && <ProgressionPuces segments={calculerSegmentsProgression(etat)} />}
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_VARIANTES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setAideParPhase({});
          setEtat(demarrerSessionEtudierFonction(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && <RecapitulatifPanel entrees={calculerRecapitulatifEtudierFonction(etat)} />}
          {enCoursDeSession && (
            <EcranCourant
              exercice={exercice}
              phase={etat.phase}
              etat={etat}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              cleEcran={cleEcran}
              terminerEtape={terminerEtape}
              setEtat={setEtat}
              estPremierEcran={estPremierEcran}
            />
          )}
          {dernierBilan && (
            <ResultatPanelEtudierFonction
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionEtudierFonction resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}

interface EcranProps {
  exercice: EtatSessionEtudierFonction["exerciceCourant"];
  phase: EcranEtudierFonction;
  etat: EtatSessionEtudierFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionEtudierFonction) => void;
  setEtat: (etat: EtatSessionEtudierFonction) => void;
  estPremierEcran: boolean;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat, estPremierEcran }: EcranProps) {
  const niveauAideMax = niveauAideMaxEtudierFonction();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  switch (phase) {
    case "domaine":
      return (
        <EtapeDomaineEtudierFonction
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse: EnsembleReelGuide) => terminerEtape(soumettreReponseDomaine(etat, reponse))}
          estPremierEcran={estPremierEcran}
        />
      );

    case "limites":
      return (
        <EtapeLimitesEtudierFonction
          key={cleEcran}
          exercice={exercice}
          phase="limites"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseLimites(etat, reponses))}
          estPremierEcran={estPremierEcran}
        />
      );

    case "calculerFPrime":
      return (
        <EtapeCalculerDeriveeGenerique
          key={cleEcran}
          exercice={exercice}
          phase="calculerFPrime"
          labelChamp="f'(x)="
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseCalculerFPrime(etat, texte))}
          diagnostiquer={(t) => diagnostiquerCalculerFPrime(t, exercice)}
          estPremierEcran={estPremierEcran}
        />
      );

    case "tableauFPrime":
      return (
        <EtapeTableauEtudierFonction
          key={cleEcran}
          exercice={exercice}
          phase="tableauFPrime"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseTableauFPrime(etat, reponse))}
          estPremierEcran={estPremierEcran}
        />
      );

    case "calculerFSeconde":
      return (
        <EtapeCalculerDeriveeGenerique
          key={cleEcran}
          exercice={exercice}
          phase="calculerFSeconde"
          labelChamp="f''(x)="
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseCalculerFSeconde(etat, texte))}
          diagnostiquer={(t) => diagnostiquerCalculerFSeconde(t, exercice)}
          estPremierEcran={estPremierEcran}
        />
      );

    case "tableauFSeconde":
      return (
        <EtapeTableauEtudierFonction
          key={cleEcran}
          exercice={exercice}
          phase="tableauFSeconde"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseTableauFSeconde(etat, reponse))}
          estPremierEcran={estPremierEcran}
        />
      );

    case "recap":
      return (
        <EtapeRecapitulatifEtudierFonction
          key={cleEcran}
          exercice={exercice}
          estPremierEcran={estPremierEcran}
          onContinuer={() => setEtat(avancerRecap(etat))}
        />
      );

    case "graphique": {
      const points = pointsClesEtudierFonction(exercice);
      return (
        <div key={cleEcran}>
          <p className="prompt-text">Place chaque point demandé sur le graphique en tapant à l'endroit correspondant.</p>
          <PlacementPointsGraphique
            points={points}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMaxGraphique()}
            onActiverAide={onActiverAide}
            onValider={(resume) => terminerEtape(soumettreReponseGraphique(etat, resume))}
            renderGraphe={({ onTap, propositionsConfirmees, dernierTapRate, zoneAideActive, pointActif }) => (
              <EtudierFonctionGraph
                exercice={exercice}
                onTap={onTap}
                propositionsConfirmees={propositionsConfirmees}
                dernierTapRate={dernierTapRate}
                zoneAide={zoneAideActive && pointActif ? { x: pointActif.x, y: pointActif.y } : null}
              />
            )}
          />
        </div>
      );
    }
  }
}
