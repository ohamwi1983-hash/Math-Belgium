import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  demarrerSessionFormeCanoniqueTransformation,
  soumettreReponseCanonique,
  soumettreReponseEvCvSox,
  soumettreReponseTh,
  soumettreReponseTv,
} from "./moteur/sessionFormeCanoniqueTransformations";
import type { EtatSessionFormeCanoniqueTransformation, PhaseFormeCanoniqueTransformation } from "./moteur/typesFormeCanoniqueTransformations";
import { genererExerciceFormeCanoniqueTransformation } from "./generateurs/formeCanoniqueTransformations";
import { EtapeCanonique } from "./components/EtapeCanonique";
import { EtapeTh } from "./components/EtapeTh";
import { EtapeEvCvSox } from "./components/EtapeEvCvSox";
import { EtapeTv } from "./components/EtapeTv";
import { Katex } from "./components/Katex";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { SaisieExpressionLatex } from "./components/SaisieExpressionLatex";
import { calculerRecapitulatifFormeCanoniqueTransformations } from "./ui/recapitulatifFormeCanoniqueTransformations";

const CONSIGNE_GENERALE = "Détermine la forme canonique de cette fonction du second degré.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionFormeCanoniqueTransformation {
  return demarrerSessionFormeCanoniqueTransformation(REGLAGES_DEMO, genererExerciceFormeCanoniqueTransformation);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son exercice est
 * cette instance — tirée avec la MÊME fonction que l'adaptateur d'export
 * (`generateurs/formeCanoniqueTransformations/exportEvaluation.ts`, sans catalogue de variantes). */
function sessionInitiale(): EtatSessionFormeCanoniqueTransformation {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionFormeCanoniqueTransformation(REGLAGES_DEMO, () => genererAvecCode(code, undefined, genererExerciceFormeCanoniqueTransformation, undefined));
}

/** Ordre d'affichage des puces de progression — même ordre que la vraie séquence des phases
 * (`PhaseFormeCanoniqueTransformation`), toujours linéaire ici (jamais de phase sautée). */
const ORDRE_PHASES: PhaseFormeCanoniqueTransformation[] = ["canonique", "th", "evCvSox", "tv"];

/** `tv` (dernière phase) n'a jamais besoin de sa propre branche "close" : une fois l'exercice
 * terminé, un nouveau redémarre à "canonique" (index 0), donc `tv` reste "a-venir" jusqu'à devenir
 * "courante" — jamais consultée en tant que phase passée (même principe que `AppAnalyseFonction`/
 * `AppMethodeRapide`). Les puces closes sont cliquables (fiche « Ta réponse » / « Réponse attendue »,
 * historique tenu par l'appli). Ce générateur n'a pas de mécanisme d'aide : jamais « aide ». */
function calculerSegmentsProgression(etat: EtatSessionFormeCanoniqueTransformation): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele = phase === "canonique" ? etat.canoniqueRevele : phase === "th" ? etat.thRevele : etat.evCvSoxRevele;
    return revele ? "revele" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionFormeCanoniqueTransformation;
  revele: boolean;
}

/** Expression saisie, rendue comme dans l'aperçu sous le champ. */
function fonctionSaisie(texte: string): ReactNode {
  return <SaisieExpressionLatex texte={texte} prefixeLatex="f(x) =" />;
}

export function AppFormeCanoniqueTransformations() {
  const [etat, setEtat] = useState<EtatSessionFormeCanoniqueTransformation>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables) — tenu ICI, jamais dans
   * le moteur ; remis à vide à chaque nouvel exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** Appelé quand un écran se clôt, avec l'état DÉJÀ mis à jour : la réponse attendue est la
   * dernière entrée du récapitulatif (même source que « Ce qu'on sait déjà »). Jamais pour "tv"
   * (dernier écran : clôt l'exercice, sa puce n'est jamais consultable). */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionFormeCanoniqueTransformation) {
    const recap = calculerRecapitulatifFormeCanoniqueTransformations(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? (
          <span className="equation-box-termes">
            {(derniere.valeurs ?? [derniere.valeur]).map((v, i) => (
              <Katex key={i} expression={v} />
            ))}
          </span>
        ) : undefined,
      },
    ]);
  }
  /** Compteur de génération, dans la clé des écrans : « Nouvel exercice » remonte l'écran même s'il
   * revient à la même phase (champs vidés). */
  const [generation, setGeneration] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionFormeCanoniqueTransformation, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined && !nouvelEtat.terminee) ajouterHistorique(votreReponse, nouvelEtat);
      const revele =
        etat.phase === "canonique"
          ? nouvelEtat.canoniqueRevele
          : etat.phase === "th"
            ? nouvelEtat.thRevele
            : etat.phase === "evCvSox"
              ? nouvelEtat.evCvSoxRevele
              : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.tvRevele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setGeneration((g) => g + 1);
      setHistorique([]);
      setFicheOuverteIndex(null);
    }
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : etat.phase === "canonique" ? (
          <span className="equation-box-termes">
            <Katex expression={`x_S = ${exercice.xS}`} />
            <Katex expression={`y_S = ${exercice.yS}`} />
          </span>
        ) : etat.phase === "th" ? (
          <>TH attendu : {exercice.xS}</>
        ) : etat.phase === "evCvSox" ? (
          <>
            EV = {exercice.ev} ; CV = {exercice.cv} ; SOX = {exercice.sox ? "Oui" : "Non"}
          </>
        ) : (
          <>TV attendu : {exercice.yS}</>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Forme canonique et transformations — second degré</h1>
        <p className="app-subtitle">Chapitre 1</p>
      </header>

      <main className="card">
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          <RecapitulatifPanel entrees={calculerRecapitulatifFormeCanoniqueTransformations(etat)} />
          {etat.phase === "canonique" ? (
            <EtapeCanonique
              key={`${generation}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) =>
                terminerEtape(
                  soumettreReponseCanonique(etat, reponse),
                  <span className="equation-box-termes">
                    <Katex expression={`x_S = ${reponse.xS}`} />
                    <Katex expression={`y_S = ${reponse.yS}`} />
                    {fonctionSaisie(reponse.formeCanonique)}
                  </span>,
                )
              }
              validation={validation}
            />
          ) : etat.phase === "th" ? (
            <EtapeTh
              key={`${generation}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) =>
                terminerEtape(
                  soumettreReponseTh(etat, reponse),
                  <span className="equation-box-termes">
                    <Katex expression={`\\text{TH} = ${reponse.th}`} />
                    {fonctionSaisie(reponse.fonctionIntermediaire)}
                  </span>,
                )
              }
              validation={validation}
            />
          ) : etat.phase === "evCvSox" ? (
            <EtapeEvCvSox
              key={`${generation}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) =>
                terminerEtape(
                  soumettreReponseEvCvSox(etat, reponse),
                  <span className="equation-box-termes">
                    <Katex expression={`\\text{EV} = ${reponse.ev}`} />
                    <Katex expression={`\\text{CV} = ${reponse.cv}`} />
                    <Katex expression={`\\text{SOX : ${reponse.sox ? "oui" : "non"}}`} />
                    {fonctionSaisie(reponse.fonctionIntermediaire)}
                  </span>,
                )
              }
              validation={validation}
            />
          ) : (
            <EtapeTv
              key={`${generation}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) => terminerEtape(soumettreReponseTv(etat, reponse))}
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
