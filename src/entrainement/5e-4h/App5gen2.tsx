import { useState, type ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import type { ExerciceDecompositionFonction } from "./core5e/decompositionFonction.types";
import { CATALOGUE_VARIANTES_DECOMPOSITION, construireAvecVariante, genererExerciceDecompositionFonction } from "./generateurs5e/decompositionFonction";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { correctionDetailleeDecompositionFonction } from "./generateurs5e/decompositionFonction/corrigeDetaille";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lignesDeLEtape } from "../export/corrigeTableau";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ecranClos, saisieEnLatex, segmentsDepuisHistorique, type EcranClos } from "../4e/ui/historiqueProgression";
import { labelLigne } from "./ui5e/formatDecompositionFonction";

/** Même catalogue que l'adaptateur d'export (le QR code d'une feuille rouvre la même instance). */
const OPTIONS_PROFONDEUR = CATALOGUE_VARIANTES_DECOMPOSITION;
import {
  activerAideSuivante,
  demarrerSessionDecompositionFonction,
  niveauAideMaxDecomposition,
  soumettreReponseDecomposition,
} from "./moteur5e/sessionDecompositionFonction";
import { diagnostiquerDecomposition, reconstruitSansDecomposer } from "./moteur5e/verificationDecompositionFonction";
import type { EtatSessionDecompositionFonction } from "./moteur5e/typesDecompositionFonction";
import { EtapeDecompositionFonction } from "./components5e/EtapeDecompositionFonction";
import { Katex } from "./components/Katex";
import { EnTeteExercice } from "./components5e/EnTeteExercice";

const CONSIGNE_GENERALE = "Décompose cette fonction composée.";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionDecompositionFonction {
  return demarrerSessionDecompositionFonction(REGLAGES_DEMO, genererExerciceDecompositionFonction);
}

/** Première session : `?code=XXXXXX` (QR code d'une feuille) → son premier exercice est l'instance
 * imprimée, tirée avec les MÊMES fonctions que `generateurs5e/decompositionFonction/exportEvaluation.ts`. */
function sessionInitiale(): EtatSessionDecompositionFonction {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionDecompositionFonction(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES_DECOMPOSITION, genererExerciceDecompositionFonction, construireAvecVariante));
}

/** État tenu en attente dès que l'écran unique se termine (bonne réponse, ou tentatives épuisées) —
 * `niveauAide` est capturé AVANT la soumission (comme l'ancien `terminerEtape(etat.niveauAide, ...)`) :
 * `nouvelEtat.niveauAide` vaut déjà 0 (exercice suivant) ou l'ancienne valeur (session terminée), jamais
 * fiable pour retrouver le niveau d'aide réellement utilisé sur l'écran qui vient de se fermer. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionDecompositionFonction;
  revele: boolean;
}

/** Décomposition saisie : une ligne par fonction intermédiaire, même libellé que le champ (« g(x) = »). */
function decompositionSaisieAffichee(lignes: string[]): ReactNode {
  return (
    <>
      {lignes.map((l, i) => (
        <span key={i} style={{ display: "block" }}>
          {labelLigne(i)} {saisieEnLatex(l)}
        </span>
      ))}
    </>
  );
}

export function App5gen2() {
  const [etat, setEtat] = useState<EtatSessionDecompositionFonction>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Incrémenté à chaque nouvel exercice (« Générer », « Nouvel exercice ») : remonte l'écran,
   * donc vide les champs et le dernier message (audit 5e ch. 1, point 12). */
  const [generation, setGeneration] = useState(0);
  /** Écrans clos de l'exercice en cours (puces cliquables → fiche en lecture seule). */
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function viderHistorique() {
    setHistorique([]);
    setFicheOuverteIndex(null);
  }

  function terminerEtape(nouvelEtat: EtatSessionDecompositionFonction, votreReponse: ReactNode) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      const dernier = nouvelEtat.resultats[nouvelEtat.resultats.length - 1];
      setHistorique((h) => [...h, ecranClos("Décomposition", votreReponse, dernier.revele, etat.niveauAide > 0, reponseAttendueEcran(dernier.exercice), corrigeDetailleEcranCourant(dernier.exercice))]);
      setEnAttente({ etatSuivant: nouvelEtat, revele: dernier.revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) viderHistorique();
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
    setGeneration((g) => g + 1);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    viderHistorique();
    setEtat(demarrerSessionDecompositionFonction(REGLAGES_DEMO, () => construireAvecVariante(id)));
    setGeneration((g) => g + 1);
  }

  const niveauAideMax = niveauAideMaxDecomposition(etat.exerciceCourant);
  const dernierResultat = enAttente ? enAttente.etatSuivant.resultats[enAttente.etatSuivant.resultats.length - 1] : null;

  function reponseAttendueEcran(exercice: ExerciceDecompositionFonction) {
    return (
      <div className="equation-box">
        <Katex expression={exercice.fLatex} block />
        <p>
          {exercice.couches.map((c, i) => (
            <span key={i} style={{ display: "block" }}>
              <Katex expression={`${["g", "h", "i", "j"][i] ?? `f_{${i}}`}(x) = ${c.propreLatex}`} />
            </span>
          ))}
        </p>
      </div>
    );
  }

  /** Corrigé détaillé « comme au tableau » de l'écran unique — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique (fiche de la puce). */
  function corrigeDetailleEcranCourant(exercice: ExerciceDecompositionFonction) {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeDecompositionFonction(exercice), "a")} />;
  }

  const validation =
    enAttente && dernierResultat
      ? {
          revele: enAttente.revele,
          reponseAttendue: reponseAttendueEcran(dernierResultat.exercice),
          corrigeDetaille: corrigeDetailleEcranCourant(dernierResultat.exercice),
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
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, 1, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          <EtapeDecompositionFonction
            key={generation}
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(lignes) => terminerEtape(soumettreReponseDecomposition(etat, lignes), decompositionSaisieAffichee(lignes))}
            diagnostiquer={(lignes) => diagnostiquerDecomposition(etat.exerciceCourant, lignes)}
            motifStructure={(lignes) => reconstruitSansDecomposer(etat.exerciceCourant, lignes)}
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
