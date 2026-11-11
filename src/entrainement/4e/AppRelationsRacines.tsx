import { Fragment, useState } from "react";
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
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { EtapeSommeProduit } from "./components/EtapeSommeProduit";
import { EtapeFactorisationRacines } from "./components/EtapeFactorisationRacines";
import { EtapeEquationDepuisRacines } from "./components/EtapeEquationDepuisRacines";
import { formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "./ui/formatEquation";
import { calculerRecapitulatifRelationsRacines } from "./ui/recapitulatifRelationsRacines";
import { Katex } from "./components/Katex";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ecranClos, nombreSaisi, saisieEnLatex, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { EnTeteExercice } from "./components/EnTeteExercice";

const CONSIGNE_GENERALE = "Exploite les relations entre les racines et les coefficients de cette équation.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionRelationsRacines {
  return demarrerSessionRelationsRacines(REGLAGES_DEMO, genererExerciceRelationsRacines);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`, QR code de la
 * feuille), son exercice est cette instance — tirée avec la MÊME fonction que l'adaptateur d'export
 * (`generateurs/relationsRacines/exportEvaluation.ts`, sans catalogue de variantes) ; la suite reste
 * un tirage normal. */
function sessionInitiale(): EtatSessionRelationsRacines {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionRelationsRacines(REGLAGES_DEMO, () => genererAvecCode(code, undefined, genererExerciceRelationsRacines, undefined));
}

/** Les 3 écrans existent toujours, dans cet ordre. */
const NOMBRE_ECRANS = 3;

const TITRES: Record<PhaseRelationsRacines, string> = {
  sommeProduit: "Somme et produit",
  factorisation: "Forme factorisée",
  equationDepuisRacines: "Équation depuis les racines",
};

function aideEcran(etat: EtatSessionRelationsRacines): boolean {
  return etat.phase === "sommeProduit"
    ? etat.aideSommeProduitUtilisee
    : etat.phase === "factorisation"
      ? etat.aideFactorisationUtilisee
      : etat.aideEquationDepuisRacinesUtilisee;
}

/** État tenu en attente dès qu'un écran se termine — même convention que `AppInequation.tsx`
 * ("validation/invalidation avant de passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionRelationsRacines;
  revele: boolean;
}

export function AppRelationsRacines() {
  const [etat, setEtat] = useState<EtatSessionRelationsRacines>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Compteur d'exercices : clé de la zone d'étapes, pour que les champs repartent vides à chaque
   * nouvel exercice même quand il commence par le même écran que le précédent. */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionRelationsRacines, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "sommeProduit"
          ? nouvelEtat.sommeProduitRevele
          : etat.phase === "factorisation"
            ? nouvelEtat.factorisationRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.equationDepuisRacinesRevele;
      setHistorique((h) => [...h, ecranClos(TITRES[etat.phase], votreReponse, revele, aideEcran(etat), <Katex expression={recapDerniereReponse(etat)} />)]);
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
      setFicheOuverteIndex(null);
      setNumeroExercice((n) => n + 1);
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
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={CONSIGNE_GENERALE}
            blocDonnees={
              <div className="equation-box">
                <Katex expression={`${formatMembreGauche(exercice.enonce)} = 0`} block />
              </div>
            }
          />
          <Fragment key={numeroExercice}>
          {etat.phase === "sommeProduit" ? (
            <EtapeSommeProduit
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              aideActivee={etat.aideSommeProduitUtilisee}
              onActiverAide={() => setEtat(activerAideSommeProduit(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSommeProduit(etat, reponse), `S = ${nombreSaisi(reponse.s)} ; P = ${nombreSaisi(reponse.p)}`)}
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
              onValider={(reponse) => terminerEtape(soumettreReponseFactorisation(etat, reponse), saisieEnLatex(reponse.includes("=") ? reponse : `${reponse}=0`))}
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
              onValider={(reponse) => terminerEtape(soumettreReponseEquationDepuisRacines(etat, reponse), saisieEnLatex(reponse))}
              validation={validation}
            />
          )}
          </Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
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
    return `S = ${nombreLatex(x1 + x2)} \\quad P = ${nombreLatex(x1 * x2)}`;
  }
  if (etat.phase === "factorisation") {
    return `${formatFormeFactoriseeDepuisRacines(exercice.enonce, exercice.racines)} = 0`;
  }
  const [x1, x2] = exercice.racines;
  return `${formatMembreGauche({ a: 1, b: -(x1 + x2), c: x1 * x2 })} = 0`;
}

/** Nombre en LaTeX : virgule décimale « {,} », arrondi d'affichage contre les artefacts flottants. */
function nombreLatex(v: number): string {
  return String(Math.round(v * 1e6) / 1e6).replace(".", "{,}");
}
