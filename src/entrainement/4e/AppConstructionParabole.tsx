import { useState, type ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import { genererExerciceConstructionParabole } from "./generateurs/constructionParabole";
import {
  NOMBRE_ITERATIONS_CONSTRUCTION_PARABOLE,
  activerAideSuivante,
  ciblesTraceConstructionParabole,
  demarrerSessionConstructionParabole,
  soumettreReponseConstruction,
  soumettreReponseTrace,
} from "./moteur/sessionConstructionParabole";
import type { EtatSessionConstructionParabole } from "./moteur/typesConstructionParabole";
import { EtapeConstructionParabole } from "./components/EtapeConstructionParabole";
import { EtapeTraceParabole } from "./components/EtapeTraceParabole";
import { EnTeteExercice } from "./components/EnTeteExercice";
import type { ReponseConstructionParabole } from "./moteur/verificationConstructionParabole";
import { TEXTE_TRACE_ATTENDU, texteConstructionAttendue } from "./ui/formatConstructionParabole";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";

const CONSIGNE_GENERALE = "Construis cette parabole au compas et à l'équerre.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionConstructionParabole {
  return demarrerSessionConstructionParabole(REGLAGES_DEMO, genererExerciceConstructionParabole);
}

function calculerSegmentsProgression(etat: EtatSessionConstructionParabole): EtatPuceProgression[] {
  const segmentsConstruction: EtatPuceProgression[] = [];
  for (let i = 0; i < NOMBRE_ITERATIONS_CONSTRUCTION_PARABOLE; i++) {
    if (etat.phase === "construction" && etat.iterationCourante === i) {
      segmentsConstruction.push("courante");
    } else if (i < etat.iterationsCompletes.length) {
      const iteration = etat.iterationsCompletes[i]!;
      segmentsConstruction.push(iteration.constructionRevele ? "revele" : iteration.constructionAideUtilisee ? "aide" : "correcte");
    } else {
      segmentsConstruction.push("a-venir");
    }
  }
  const segmentTrace: EtatPuceProgression = etat.phase === "trace" ? "courante" : "a-venir";
  return [...segmentsConstruction, segmentTrace];
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). Chaque itération de "construction" est son propre écran (même sans
 * changement de `phase`) : la transition se détecte aussi sur `iterationCourante`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionConstructionParabole;
  revele: boolean;
}

/** Ce que l'élève a construit (rayon + position de la droite), pour la fiche de consultation. */
function constructionSaisie(reponse: ReponseConstructionParabole): ReactNode {
  const cote = reponse.ligneY > 0 ? "du côté de F" : reponse.ligneY < 0 ? "du côté opposé à F" : "confondue avec la directrice";
  return reponse.ligneY === 0 ? `r = ${reponse.r} ; droite ${cote}` : `r = ${reponse.r} ; droite à la distance ${Math.abs(reponse.ligneY)}, ${cote}`;
}

export function AppConstructionParabole() {
  const [etat, setEtat] = useState<EtatSessionConstructionParabole>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des itérations closes (puces cliquables) — tenue ici, jamais dans
   * le moteur ; une itération close = une entrée, même index que sa puce. L'écran "trace", dernier,
   * n'est jamais consulté comme écran passé. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice : entre dans la `key` des écrans pour qu'aucun geste de
   * l'exercice précédent ne survive à « Nouvel exercice ». */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionConstructionParabole, votreReponse: ReactNode) {
    const transitionDEcran =
      nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.iterationCourante !== etat.iterationCourante;
    if (transitionDEcran) {
      const revele =
        etat.phase === "construction"
          ? nouvelEtat.iterationsCompletes[nouvelEtat.iterationsCompletes.length - 1]!.constructionRevele
          : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.traceRevele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      if (etat.phase === "construction") {
        const rRetenu = nouvelEtat.iterationsCompletes[nouvelEtat.iterationsCompletes.length - 1]!.r;
        setHistorique((h) => [
          ...h,
          { titre: `Construction ${etat.iterationCourante + 1}`, votreReponse, correcte: !revele, reponseAttendue: texteConstructionAttendue(rRetenu) },
        ]);
      }
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setHistorique([]);
      setFicheOuverteIndex(null);
      setNumeroExercice((n) => n + 1);
    }
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;

  /** Rayon de repli réellement retenu par le moteur pour l'itération qui vient de se clore — sa
   * construction est dessinée et décrite comme réponse attendue (jamais une phrase générique). */
  const rRetenu =
    enAttente && etat.phase === "construction" ? enAttente.etatSuivant.iterationsCompletes[enAttente.etatSuivant.iterationsCompletes.length - 1]!.r : null;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec
          ? undefined
          : etat.phase === "construction" && rRetenu !== null
            ? texteConstructionAttendue(rRetenu)
            : TEXTE_TRACE_ATTENDU,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Construction de la parabole au compas et à l'équerre</h1>
        <p className="app-subtitle">Chapitre 7 — Géométrie analytique plane</p>
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
        <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
        {etat.phase === "construction" ? (
          <EtapeConstructionParabole
            key={`${numeroExercice}-${etat.iterationCourante}`}
            rRevele={enAttente?.revele ? rRetenu : null}
            exercice={exercice}
            numeroIteration={etat.iterationCourante + 1}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideConstruction}
            rDejaUtilises={etat.iterationsCompletes.map((iteration) => iteration.r)}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseConstruction(etat, reponse), constructionSaisie(reponse))}
            validation={validation}
          />
        ) : (
          <EtapeTraceParabole
            key={`${numeroExercice}-trace`}
            exercice={exercice}
            cibles={ciblesTraceConstructionParabole(etat)}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(selectionnes) => terminerEtape(soumettreReponseTrace(etat, selectionnes), null)}
            validation={validation}
          />
        )}
        </div>
      </main>
      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
