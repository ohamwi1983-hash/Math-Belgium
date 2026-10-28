import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideEquationDepuisRacines,
  activerAideFactorisation,
  activerAideSommeProduit,
  demarrerSessionRelationsRacines,
  soumettreReponseEquationDepuisRacines,
  soumettreReponseFactorisation,
  soumettreReponseSommeProduit,
} from "./moteur/sessionRelationsRacines";
import type { EtatSessionRelationsRacines, PhaseRelationsRacines } from "./moteur/sessionRelationsRacines";
import { diagnostiquerEquationDepuisRacines, diagnostiquerFactorisation } from "./moteur/verificationRelationsRacines";
import { genererExerciceRelationsRacines } from "./generateurs/relationsRacines";
import { EtapeSommeProduit } from "./components/EtapeSommeProduit";
import { EtapeFactorisationRacines } from "./components/EtapeFactorisationRacines";
import { EtapeEquationDepuisRacines } from "./components/EtapeEquationDepuisRacines";
import { formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "./ui/formatEquation";
import { calculerRecapitulatifRelationsRacines } from "./ui/recapitulatifRelationsRacines";
import { Katex } from "./components/Katex";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { EnTeteExercice } from "./components/EnTeteExercice";

const CONSIGNE_GENERALE = "Exploite les relations entre les racines et les coefficients de cette équation.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionRelationsRacines {
  return demarrerSessionRelationsRacines(REGLAGES_DEMO, genererExerciceRelationsRacines);
}

/** Même ordre que la vraie séquence des phases (type `PhaseRelationsRacines`). */
const ORDRE_PHASES: PhaseRelationsRacines[] = ["sommeProduit", "factorisation", "equationDepuisRacines"];

/** Même heuristique que `calculerSegmentsProgression` de `AppInequation.tsx` — ici les 3 étapes
 * ont toutes un mécanisme d'aide, contrairement à ce générateur-là. */
function calculerSegmentsProgression(etat: EtatSessionRelationsRacines): EtatPuceProgression[] {
  return ORDRE_PHASES.map((phase) => {
    if (phase === etat.phase) return "courante";
    const score =
      phase === "sommeProduit" ? etat.scoreSommeProduitExercice : phase === "factorisation" ? etat.scoreFactorisationExercice : null;
    if (score === null) return "a-venir";
    const revele = phase === "sommeProduit" ? etat.sommeProduitRevele : etat.factorisationRevele;
    if (revele) return "revele";
    const aide = phase === "sommeProduit" ? etat.aideSommeProduitUtilisee : etat.aideFactorisationUtilisee;
    return aide ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine — même convention que `AppInequation.tsx`
 * ("validation/invalidation avant de passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionRelationsRacines;
  revele: boolean;
}

export function AppRelationsRacines() {
  const [etat, setEtat] = useState<EtatSessionRelationsRacines>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionRelationsRacines) {
    const recap = calculerRecapitulatifRelationsRacines(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? <Katex expression={derniere.valeur} /> : undefined,
      },
    ]);
  }

  function terminerEtape(nouvelEtat: EtatSessionRelationsRacines, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) {
        ajouterHistorique(votreReponse, nouvelEtat);
      }
      const revele =
        etat.phase === "sommeProduit"
          ? nouvelEtat.sommeProduitRevele
          : etat.phase === "factorisation"
            ? nouvelEtat.factorisationRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.equationDepuisRacinesRevele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;
  const recapitulatif = calculerRecapitulatifRelationsRacines(etat);

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : <Katex expression={recapDerniereReponse(etat)} />,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Relations entre racines et coefficients</h1>
        <p className="app-subtitle">Équations et inéquations du second degré</p>
      </header>

      <main className="card">
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={CONSIGNE_GENERALE}
            blocDonnees={
              <div className="equation-box">
                <Katex expression={`${formatMembreGauche(exercice.enonce)} = 0`} block />
              </div>
            }
          />
          {etat.phase === "sommeProduit" ? (
            <EtapeSommeProduit
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              aideActivee={etat.aideSommeProduitUtilisee}
              onActiverAide={() => setEtat(activerAideSommeProduit(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSommeProduit(etat, reponse), `S = ${reponse.s} ; P = ${reponse.p}`)}
              validation={validation}
            />
          ) : etat.phase === "factorisation" ? (
            <EtapeFactorisationRacines
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideFactorisationUtilisee}
              onActiverAide={() => setEtat(activerAideFactorisation(etat))}
              diagnostiquer={(v) => diagnostiquerFactorisation(v, exercice)}
              onValider={(reponse) => terminerEtape(soumettreReponseFactorisation(etat, reponse), reponse)}
              validation={validation}
            />
          ) : (
            <EtapeEquationDepuisRacines
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideEquationDepuisRacinesUtilisee}
              onActiverAide={() => setEtat(activerAideEquationDepuisRacines(etat))}
              diagnostiquer={(v) => diagnostiquerEquationDepuisRacines(v, exercice)}
              onValider={(reponse) => terminerEtape(soumettreReponseEquationDepuisRacines(etat, reponse))}
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

/** Réponse attendue à afficher après révélation — dépend de la phase qui vient de se clôturer
 * (`etat.phase` AVANT la transition, c'est pourquoi cette fonction relit l'état "ancien" passé par
 * le composant, jamais `enAttente.etatSuivant`). Réutilise les mêmes helpers de formatage que le
 * récapitulatif/l'énoncé (jamais une mise en forme ad hoc) — `formatFormeFactoriseeDepuisRacines`
 * gère déjà la racine double (jamais "(x-3)(x-3)") et le préfixe a=1/-1 ; `formatMembreGauche`
 * omet déjà les termes nuls et gère les signes, pour x²-Sx+P=0 comme pour ax²+bx+c=0. */
function recapDerniereReponse(etat: EtatSessionRelationsRacines): string {
  const exercice = etat.exerciceCourant;
  if (etat.phase === "sommeProduit") {
    const [x1, x2] = exercice.racines;
    return `S = ${x1 + x2} \\quad P = ${x1 * x2}`;
  }
  if (etat.phase === "factorisation") {
    return `${formatFormeFactoriseeDepuisRacines(exercice.enonce, exercice.racines)} = 0`;
  }
  const [x1, x2] = exercice.racines;
  return `${formatMembreGauche({ a: 1, b: -(x1 + x2), c: x1 * x2 })} = 0`;
}
