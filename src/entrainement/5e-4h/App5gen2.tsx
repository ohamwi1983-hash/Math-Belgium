import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { construireAvecProfondeur, genererExerciceDecompositionFonction } from "./generateurs5e/decompositionFonction";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";

const OPTIONS_PROFONDEUR = [
  { id: "2", label: "2 couches" },
  { id: "3", label: "3 couches" },
  { id: "4", label: "4 couches" },
];
import {
  activerAideSuivante,
  demarrerSessionDecompositionFonction,
  niveauAideMaxDecomposition,
  soumettreReponseDecomposition,
} from "./moteur5e/sessionDecompositionFonction";
import { diagnostiquerDecomposition } from "./moteur5e/verificationDecompositionFonction";
import type { EtatSessionDecompositionFonction } from "./moteur5e/typesDecompositionFonction";
import { EtapeDecompositionFonction } from "./components5e/EtapeDecompositionFonction";
import { Katex } from "./components/Katex";
import { EnTeteExercice } from "./components5e/EnTeteExercice";

const CONSIGNE_GENERALE = "Décompose cette fonction composée.";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionDecompositionFonction {
  return demarrerSessionDecompositionFonction(REGLAGES_DEMO, genererExerciceDecompositionFonction);
}

/** État tenu en attente dès que l'écran unique se termine (bonne réponse, ou tentatives épuisées) —
 * `niveauAide` est capturé AVANT la soumission (comme l'ancien `terminerEtape(etat.niveauAide, ...)`) :
 * `nouvelEtat.niveauAide` vaut déjà 0 (exercice suivant) ou l'ancienne valeur (session terminée), jamais
 * fiable pour retrouver le niveau d'aide réellement utilisé sur l'écran qui vient de se fermer. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionDecompositionFonction;
  revele: boolean;
}

export function App5gen2() {
  const [etat, setEtat] = useState<EtatSessionDecompositionFonction>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionDecompositionFonction) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.resultats[nouvelEtat.resultats.length - 1].revele });
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
    setEtat(demarrerSessionDecompositionFonction(REGLAGES_DEMO, () => construireAvecProfondeur(Number(id) as 2 | 3 | 4)));
  }

  const niveauAideMax = niveauAideMaxDecomposition(etat.exerciceCourant);
  const dernierResultat = enAttente ? enAttente.etatSuivant.resultats[enAttente.etatSuivant.resultats.length - 1] : null;

  const validation =
    enAttente && dernierResultat
      ? {
          revele: enAttente.revele,
          reponseAttendue: (
            <div className="equation-box">
              <Katex expression={dernierResultat.exercice.fLatex} block />
              <p>
                {dernierResultat.exercice.couches.map((c, i) => (
                  <span key={i} style={{ display: "block" }}>
                    <Katex expression={`${["g", "h", "i", "j"][i] ?? `f_{${i}}`}(x) = ${c.propreLatex}`} />
                  </span>
                ))}
              </p>
            </div>
          ),
          labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
          onSuivant: passerEcranSuivant,
        }
      : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Décomposer une fonction composée</h1>
      </header>
      <SelecteurVarianteDev options={OPTIONS_PROFONDEUR} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          <EtapeDecompositionFonction
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(lignes) => terminerEtape(soumettreReponseDecomposition(etat, lignes))}
            diagnostiquer={(lignes) => diagnostiquerDecomposition(etat.exerciceCourant, lignes)}
            validation={validation}
          />
        </div>
      </main>
    </div>
  );
}
