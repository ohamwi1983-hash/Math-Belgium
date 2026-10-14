import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionOmbreSoleil,
  soumettreConclusion,
  soumettreReponseDirection,
  soumettreReponseDirectionInconnue,
  soumettreReponsePoint,
  soumettreReponsePointSimple,
} from "./moteur/sessionOmbreSoleil";
import type { EtatSessionOmbreSoleil, PhaseOmbreSoleil } from "./moteur/typesOmbreSoleil";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceOmbreSoleil } from "./generateurs/ombreSoleil";
import type { VarianteOmbreSoleil } from "./core/ombreSoleil.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeConclusionOmbreSoleil } from "./components/EtapeConclusionOmbreSoleil";
import { EtapeDirectionInconnue } from "./components/EtapeDirectionInconnue";
import { EtapeDirectionOmbre } from "./components/EtapeDirectionOmbre";
import { EtapePointOmbre } from "./components/EtapePointOmbre";
import { EtapePointSimple } from "./components/EtapePointSimple";
import { EnTeteExercice } from "./components/EnTeteExercice";

const CONSIGNE_GENERALE = "Détermine l'ombre de cet objet au soleil.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionOmbreSoleil {
  return demarrerSessionOmbreSoleil(REGLAGES_DEMO, genererExerciceOmbreSoleil);
}

/** Libellé de la phase COURANTE — même principe que "Section plane d'un solide" : le nombre
 * d'écrans varie par exercice (variante + nombre d'obstacles/de piquets), la progression AU SEIN de
 * la boucle est portée par `texteProgressionBoucle`, pas par ce libellé fixe. */
const LIBELLE_PHASE: Record<PhaseOmbreSoleil, string> = {
  pointSimple: "Point d'ombre",
  directionInconnue: "Direction inconnue",
  direction: "Direction",
  point: "Point d'ombre",
  conclusion: "Conclusion",
};

/** État tenu en attente dès qu'un écran NOTÉ se termine (bonne réponse, ou tentatives épuisées) —
 * l'état de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`. "conclusion" n'est PAS un écran noté (aucune interaction/vérification,
 * `EtapeConclusionOmbreSoleil.tsx` n'a jamais eu de prop `validation` — voir `sessionOmbreSoleil.ts`,
 * `soumettreConclusion`) : son bouton "Continuer" clôture directement l'exercice, sans pause. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionOmbreSoleil;
  revele: boolean;
}

export function AppOmbreSoleil() {
  const [etat, setEtat] = useState<EtatSessionOmbreSoleil>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  /** `revelesAccumules` gagne exactement une entrée à la clôture de chaque écran NOTÉ
   * (pointSimple/directionInconnue/direction/point — jamais plus d'un à la fois), quelle que soit
   * la phase suivante (y compris "conclusion") : sa dernière entrée est donc toujours la
   * révélation de l'écran qui vient de se clore, sans avoir besoin d'un aiguillage par phase. */
  function terminerEtape(nouvelEtat: EtatSessionOmbreSoleil) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = nouvelEtat.revelesAccumules[nouvelEtat.revelesAccumules.length - 1]!;
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
    setEtat(demarrerSessionOmbreSoleil(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteOmbreSoleil)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Ombre au soleil</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie dans l'espace</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[phase]}</span>
          </div>
        </div>
      </header>

      <main className="card">
        <div className="card-body">
        <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
        {phase === "pointSimple" && exercice.variante === "simple" ? (
          <EtapePointSimple
            key={phase}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(id) => terminerEtape(soumettreReponsePointSimple(etat, id))}
            validation={validation}
          />
        ) : phase === "directionInconnue" && exercice.variante === "directionInconnue" ? (
          <EtapeDirectionInconnue
            key={phase}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(id) => terminerEtape(soumettreReponseDirectionInconnue(etat, id))}
            validation={validation}
          />
        ) : phase === "direction" && exercice.variante !== "simple" ? (
          <EtapeDirectionOmbre
            key={etat.resolus.length}
            exercice={exercice}
            resolus={etat.resolus}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(id) => terminerEtape(soumettreReponseDirection(etat, id))}
            validation={validation}
          />
        ) : phase === "point" && exercice.variante !== "simple" ? (
          <EtapePointOmbre
            key={etat.resolus.length}
            exercice={exercice}
            resolus={etat.resolus}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(id) => terminerEtape(soumettreReponsePoint(etat, id))}
            validation={validation}
          />
        ) : (
          <EtapeConclusionOmbreSoleil
            key={phase}
            exercice={exercice}
            onContinuer={() => {
              const nouvelEtat = soumettreConclusion(etat);
              setEtat(nouvelEtat.terminee ? nouvelleSession() : nouvelEtat);
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
