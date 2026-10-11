import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionConstructionVectorielle, soumettreReponseConstruction } from "./moteur/sessionConstructionVectorielle";
import type { EtatSessionConstructionVectorielle } from "./moteur/typesConstructionVectorielle";
import { genererExerciceConstructionVectorielle } from "./generateurs/constructionVectorielle";
import { EtapeConstructionVectorielle } from "./components/EtapeConstructionVectorielle";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionConstructionVectorielle {
  return demarrerSessionConstructionVectorielle(REGLAGES_DEMO, genererExerciceConstructionVectorielle);
}

/** Notation matricielle colonne (2×1) — jamais la notation en ligne d'un point (correction
 * transversale : un vecteur ne doit jamais être visuellement indiscernable d'un point). */
function formatVecteurColonneLatex(v: { x: number; y: number }): string {
  return `\\begin{pmatrix} ${v.x} \\\\ ${v.y} \\end{pmatrix}`;
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionConstructionVectorielle;
  revele: boolean;
}

export function AppConstructionVectorielle() {
  const [etat, setEtat] = useState<EtatSessionConstructionVectorielle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionConstructionVectorielle) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.constructionRevele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : (
          <>
            Vecteur attendu : <Katex expression={formatVecteurColonneLatex(exercice.cibleComposantes)} />, depuis n'importe quel point d'ancrage.
          </>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Construction graphique de vecteurs</h1>
        <p className="app-subtitle">Chapitre 4 — Calcul vectoriel</p>
      </header>

      <main className="card">
        <div className="card-body">
          <EtapeConstructionVectorielle
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(reponse) => terminerEtape(soumettreReponseConstruction(etat, reponse))}
            validation={validation}
          />
        </div>
      </main>
    </div>
  );
}
