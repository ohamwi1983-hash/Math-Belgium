import { useState, type ReactNode } from "react";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lignesDeLEtape } from "../export/corrigeTableau";
import { correctionDetailleeReductionVectorielle } from "./generateurs/reductionVectorielle/corrigeDetaille";
import type { ReglagesSession } from "./core/session.types";
import { activerAideSuivante, demarrerSessionReductionVectorielle, soumettreReponseReduction } from "./moteur/sessionReductionVectorielle";
import type { EtatSessionReductionVectorielle } from "./moteur/typesReductionVectorielle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceReductionVectorielle } from "./generateurs/reductionVectorielle";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import type { FigureReduction } from "./core/reductionVectorielle.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeReductionVectorielle } from "./components/EtapeReductionVectorielle";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ecranClos, saisieTexte, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";

const CONSIGNE_GENERALE = "Réduis cette somme de vecteurs à l'aide de la relation de Chasles.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionReductionVectorielle {
  return demarrerSessionReductionVectorielle(REGLAGES_DEMO, genererExerciceReductionVectorielle);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`, QR code de la
 * feuille ou de l'évaluation), son PREMIER exercice est celui de la copie — même catalogue et mêmes
 * fonctions de génération que l'adaptateur d'export. */
function sessionInitiale(): EtatSessionReductionVectorielle {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionReductionVectorielle(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceReductionVectorielle, (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0])));
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionReductionVectorielle;
  revele: boolean;
}

/** Vecteur saisi (« PQ », « pq ») écrit comme un vecteur ; toute autre saisie telle quelle. */
function vecteurSaisiAffiche(texte: string): ReactNode {
  const lettres = texte.replace(/\s+/g, "").toUpperCase();
  return /^[A-Z]{2}$/.test(lettres) ? <Katex expression={`\\vec{${lettres}}`} /> : saisieTexte(texte);
}

/** Pas de `Phase` : un seul écran par exercice. Mono-écran : la transition n'est jamais qu'une
 * clôture d'exercice (`terminee` passe à `true`, `nombreExercices` vaut 1). */
export function AppReductionVectorielle() {
  const [etat, setEtat] = useState<EtatSessionReductionVectorielle>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Incrémenté à chaque nouvel exercice (« Nouvel exercice » ou « Générer ») : sert de `key` à
   * l'écran pour qu'il reparte d'un champ vide, jamais de la saisie de l'exercice précédent. */
  const [numeroExercice, setNumeroExercice] = useState(0);
  /** Écrans clos de l'exercice en cours (puces cliquables → fiche en lecture seule). */
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function viderHistorique() {
    setHistorique([]);
    setFicheOuverteIndex(null);
  }

  function terminerEtape(nouvelEtat: EtatSessionReductionVectorielle, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!;
      setHistorique((h) => [...h, ecranClos("Vecteur réduit", votreReponse, resultat.reductionRevele, etat.niveauAide > 0, reponseAttendueEcran(), corrigeDetailleEcranCourant())]);
      setEnAttente({ etatSuivant: nouvelEtat, revele: resultat.reductionRevele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      viderHistorique();
      setEtat(nouvelleSession());
      setNumeroExercice((n) => n + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    viderHistorique();
    setEtat(demarrerSessionReductionVectorielle(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as FigureReduction)));
    setNumeroExercice((n) => n + 1);
  }

  function reponseAttendueEcran() {
    return <Katex expression={`\\vec{${exercice.pointDepart}${exercice.pointArrivee}}`} />;
  }

  /** Corrigé détaillé « comme au tableau » de l'écran unique — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique (fiche de la puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeReductionVectorielle(exercice), "a")} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueEcran(),
        corrigeDetaille: corrigeDetailleEcranCourant(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Réduction d'une somme de vecteurs (Chasles)</h1>
        <p className="app-subtitle">Chapitre 6 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, 1, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          <EtapeReductionVectorielle
            key={numeroExercice}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseReduction(etat, texte), vecteurSaisiAffiche(texte))}
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
