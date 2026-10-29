import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionReductionVectorielle, soumettreReponseReduction } from "./moteur/sessionReductionVectorielle";
import type { EtatSessionReductionVectorielle } from "./moteur/typesReductionVectorielle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceReductionVectorielle } from "./generateurs/reductionVectorielle";
import type { FigureReduction } from "./core/reductionVectorielle.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeReductionVectorielle } from "./components/EtapeReductionVectorielle";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";

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

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionReductionVectorielle;
  revele: boolean;
}

/** Pas de `Phase` : un seul écran par exercice. Mono-écran : la transition n'est jamais qu'une
 * clôture d'exercice (`terminee` passe à `true`, `nombreExercices` vaut 1). */
export function AppReductionVectorielle() {
  const [etat, setEtat] = useState<EtatSessionReductionVectorielle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Incrémenté à chaque nouvel exercice (« Nouvel exercice » ou « Générer ») : sert de `key` à
   * l'écran pour qu'il reparte d'un champ vide, jamais de la saisie de l'exercice précédent. */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionReductionVectorielle) {
    const transitionDEcran = nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!;
      setEnAttente({ etatSuivant: nouvelEtat, revele: resultat.reductionRevele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
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
    setEtat(demarrerSessionReductionVectorielle(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as FigureReduction)));
    setNumeroExercice((n) => n + 1);
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <Katex expression={`\\vec{${exercice.pointDepart}${exercice.pointArrivee}}`} />,
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
        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          <EtapeReductionVectorielle
            key={numeroExercice}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(texte) => terminerEtape(soumettreReponseReduction(etat, texte))}
            validation={validation}
          />
        </div>
      </main>
    </div>
  );
}
