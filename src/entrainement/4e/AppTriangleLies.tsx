import { useRef, useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionTriangleLies,
  soumettreReponseAngles,
  soumettreReponseCible,
  soumettreReponseInterpretation,
  soumettreReponsePont,
  soumettreReponsePontSommetPartage,
  soumettreReponseSoustraction,
} from "./moteur/sessionTriangleLies";
import type { EtatSessionTriangleLies, PhaseTriangleLies } from "./moteur/typesTriangleLies";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceTriangleLies } from "./generateurs/triangleLies";
import type { FamilleTriangleLies } from "./core/triangleLies.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapePontTriangleLies } from "./components/EtapePontTriangleLies";
import { EtapeAnglesTriangleLies } from "./components/EtapeAnglesTriangleLies";
import { EtapeSoustractionTriangleLies } from "./components/EtapeSoustractionTriangleLies";
import { EtapeCibleTriangleLies } from "./components/EtapeCibleTriangleLies";
import { EtapeInterpretationTriangleLies } from "./components/EtapeInterpretationTriangleLies";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionTriangleLies {
  return demarrerSessionTriangleLies(REGLAGES_DEMO, genererExerciceTriangleLies);
}

function formatNombre(valeur: number): string {
  return Number(valeur.toFixed(2)).toString();
}

/** Écrans nécessitant un calcul décimal non fourni par l'énoncé (résolution du triangle pont/cible
 * par loi des sinus/cosinus ou SOH-CAH-TOA) — "angles"/"soustraction" restent de l'arithmétique
 * triviale sur des données déjà affichées, "interpretation" un QCM. */
const PHASES_CALCULATRICE = new Set<PhaseTriangleLies>(["pont", "cible"]);

const LIBELLE_PHASE: Record<PhaseTriangleLies, string> = {
  pont: "Triangle pont",
  angles: "Angles du triangle cible",
  soustraction: "Côtés du triangle cible",
  cible: "Triangle cible",
  interpretation: "Interprétation",
};

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionTriangleLies;
  revele: boolean;
}

export function AppTriangleLies() {
  const [etat, setEtat] = useState<EtatSessionTriangleLies>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionTriangleLies) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "pont"
          ? nouvelEtat.pontRevele
          : etat.phase === "angles"
            ? nouvelEtat.anglesRevele
            : etat.phase === "soustraction"
              ? nouvelEtat.soustractionRevele
              : etat.phase === "cible"
                ? nouvelEtat.cibleRevele
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
    setEtat(demarrerSessionTriangleLies(REGLAGES_DEMO, () => construireAvecFamilleId(familleId as FamilleTriangleLies)));
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

  const reponseAttendue =
    etat.phase === "pont" ? (
      exercice.variante === "sommetPartage" ? (
        <>
          Angle attendu : {formatNombre(exercice.trianglePont.A)}° — côté 1 attendu : {formatNombre(exercice.trianglePont.b)} — côté 2 attendu :{" "}
          {formatNombre(exercice.trianglePont.c)}
        </>
      ) : (
        <>
          {exercice.labelCoteTransfere} attendu : {formatNombre(exercice.trianglePont.a)} m
        </>
      )
    ) : etat.phase === "angles" ? (
      <>
        Angles attendus : angle utile = {formatNombre(exercice.triangleCible.B)}° — angle (hypothèse) = {formatNombre(exercice.triangleCible.C)}°
      </>
    ) : etat.phase === "soustraction" ? (
      <>
        Côtés attendus : côté 1 = {formatNombre(exercice.triangleCible.b)} — côté 2 = {formatNombre(exercice.triangleCible.c)}
      </>
    ) : etat.phase === "cible" ? (
      <>
        Réponse attendue : {formatNombre(exercice.valeurCibleAttendue)} {exercice.uniteGrandeurCible}
      </>
    ) : optionCorrecte ? (
      <>Interprétation attendue : {optionCorrecte.texte}</>
    ) : undefined;

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
        <h1 className="app-title">Triangles liés (triangulation, côté ou angle partagé)</h1>
        <p className="app-subtitle">Chapitre 3</p>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={onGenererDev} />
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>
      </header>

      <main className="card">
        <div className="card-body">
          {PHASES_CALCULATRICE.has(etat.phase) && <CalculatriceScientifique />}
          {etat.phase === "pont" ? (
            <EtapePontTriangleLies
              exercice={exercice}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAidePont}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(valeur) => terminerEtape(soumettreReponsePont(etat, valeur))}
              onValiderSommetPartage={(reponse) => terminerEtape(soumettreReponsePontSommetPartage(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "angles" ? (
            <EtapeAnglesTriangleLies
              exercice={exercice}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideAngles}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseAngles(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "soustraction" ? (
            <EtapeSoustractionTriangleLies
              exercice={exercice}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideSoustraction}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSoustraction(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "cible" ? (
            <EtapeCibleTriangleLies
              exercice={exercice}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideCible}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(valeur) => terminerEtape(soumettreReponseCible(etat, valeur))}
              validation={validation}
            />
          ) : (
            <EtapeInterpretationTriangleLies
              exercice={exercice}
              estPremierEcran={estPremierEcran}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideInterpretation}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(indexChoisi) => terminerEtape(soumettreReponseInterpretation(etat, indexChoisi))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
