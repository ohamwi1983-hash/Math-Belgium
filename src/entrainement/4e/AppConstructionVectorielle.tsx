import { useState, type ReactNode } from "react";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lignesDeLEtape } from "../export/corrigeTableau";
import { correctionDetailleeConstructionVectorielle } from "./generateurs/constructionVectorielle/corrigeDetaille";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionConstructionVectorielle, soumettreReponseConstruction } from "./moteur/sessionConstructionVectorielle";
import type { EtatSessionConstructionVectorielle } from "./moteur/typesConstructionVectorielle";
import { genererExerciceConstructionVectorielle } from "./generateurs/constructionVectorielle";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { EtapeConstructionVectorielle } from "./components/EtapeConstructionVectorielle";
import { Katex } from "./components/Katex";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { consigneConstructionVectorielle } from "./ui/formatConstructionVectorielle";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ecranClos, nombreTexte, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";

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

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`, QR code de la
 * feuille ou de l'évaluation), son PREMIER exercice est celui de la copie — même catalogue et mêmes
 * fonctions de génération que l'adaptateur d'export. */
function sessionInitiale(): EtatSessionConstructionVectorielle {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionConstructionVectorielle(REGLAGES_DEMO, () => genererAvecCode(code, undefined, genererExerciceConstructionVectorielle, undefined));
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

/** Vecteur réellement tracé par l'élève : son origine, son extrémité et ses composantes. */
function vecteurTraceAffiche(reponse: { depart: { x: number; y: number }; arrivee: { x: number; y: number } }): ReactNode {
  const { depart, arrivee } = reponse;
  const p = (pt: { x: number; y: number }) => `(${nombreTexte(pt.x)}\\,;\\,${nombreTexte(pt.y)})`;
  return (
    <Katex
      expression={`\\text{de }${p(depart)}\\text{ à }${p(arrivee)}\\ :\\ ${formatVecteurColonneLatex({ x: arrivee.x - depart.x, y: arrivee.y - depart.y })}`}
    />
  );
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
  const [etat, setEtat] = useState<EtatSessionConstructionVectorielle>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Compteur d'exercices — `key` de l'étape : un nouvel exercice remonte le composant, donc
   * repart du tracé initial au lieu de garder celui de l'exercice précédent. */
  const [numeroExercice, setNumeroExercice] = useState(0);
  /** Écrans clos de l'exercice en cours (puces cliquables → fiche en lecture seule). */
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function viderHistorique() {
    setHistorique([]);
    setFicheOuverteIndex(null);
  }

  function terminerEtape(nouvelEtat: EtatSessionConstructionVectorielle, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.constructionRevele;
      // Pas d'aide sur cet écran : jamais « réussi avec aide ».
      setHistorique((h) => [...h, ecranClos("Construction", votreReponse, revele, false, reponseAttendueEcran(), corrigeDetailleEcranCourant())]);
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setNumeroExercice((n) => n + 1);
      viderHistorique();
    }
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;

  function reponseAttendueEcran() {
    return !etat.reglages.affichageReponseApresEchec ? undefined : (
      <Katex expression={`${formatVecteurLatex(exercice)} = ${formatVecteurColonneLatex(exercice.cibleComposantes)}`} />
    );
  }

  /** Corrigé détaillé « comme au tableau » de l'écran unique — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique (fiche de la puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeConstructionVectorielle(exercice), "a")} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        corrigeDetaille: corrigeDetailleEcranCourant(),
        reponseAttendue: reponseAttendueEcran(),
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
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, 1, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          <EtapeConstructionVectorielle
            key={numeroExercice}
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(reponse) => terminerEtape(soumettreReponseConstruction(etat, reponse), vecteurTraceAffiche(reponse))}
            validation={validation}
          />
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
