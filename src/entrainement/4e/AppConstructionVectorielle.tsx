import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionConstructionVectorielle, soumettreReponseConstruction } from "./moteur/sessionConstructionVectorielle";
import type { EtatSessionConstructionVectorielle } from "./moteur/typesConstructionVectorielle";
import { genererExerciceConstructionVectorielle } from "./generateurs/constructionVectorielle";
import { EtapeConstructionVectorielle } from "./components/EtapeConstructionVectorielle";
import { Katex } from "./components/Katex";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { consigneConstructionVectorielle } from "./ui/formatConstructionVectorielle";

const CONSIGNE_GENERALE = "Construis ce vecteur sur la figure.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
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

/** Vecteur demandé (`k\vec{AB}`), même écriture que la consigne. */
function formatVecteurLatex(exercice: EtatSessionConstructionVectorielle["exerciceCourant"]): string {
  return consigneConstructionVectorielle(exercice).latex;
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
  /** Compteur d'exercices — `key` de l'étape : un nouvel exercice remonte le composant, donc
   * repart du tracé initial au lieu de garder celui de l'exercice précédent. */
  const [numeroExercice, setNumeroExercice] = useState(0);

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
    if (enAttente.etatSuivant.terminee) setNumeroExercice((n) => n + 1);
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : (
          <Katex expression={`${formatVecteurLatex(exercice)} = ${formatVecteurColonneLatex(exercice.cibleComposantes)}`} />
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
        <p className="app-subtitle">Chapitre 6 — Calcul vectoriel</p>
      </header>

      <main className="card">
        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          <EtapeConstructionVectorielle
            key={numeroExercice}
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
