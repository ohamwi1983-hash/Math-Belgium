import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiBinomiale } from "./generateurs6e/loiBinomiale";
import type { IdVarianteLoiBinomiale } from "./generateurs6e/loiBinomiale";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionLoiBinomiale, soumettreReponseEcran } from "./moteur6e/sessionLoiBinomiale";
import type { EtatSessionLoiBinomiale } from "./moteur6e/typesLoiBinomiale";
import { diagnostiquerEcran } from "./moteur6e/verificationLoiBinomiale";
import { EtapeChampsLoiBinomiale } from "./components6e/EtapeChampsLoiBinomiale";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, niveauAideMaxEcran, formatReponseAttenduePhaseLatex, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatLoiBinomiale";
import type { ChampDef } from "./ui6e/formatLoiBinomiale";
import { calculerRecapitulatifLoiBinomiale, calculerSegmentsProgressionLoiBinomiale } from "./ui6e/recapitulatifLoiBinomiale";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/**
 * `6gen50` — Loi binomiale. Même patron que `App6gen48.tsx` : un dispatcher générique piloté par
 * `ui6e/formatLoiBinomiale.ts`/`moteur6e/verificationLoiBinomiale.ts`, PAS de JSX par famille/écran
 * — un SEUL composant écran (`EtapeChampsLoiBinomiale`) gère À LA FOIS les champs texte libre, la
 * checklist à 4 conditions (famille A) et le QCM d'interprétation (famille B), piloté entièrement
 * par `champs: ChampDef[]`.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionLoiBinomiale {
  return demarrerSessionLoiBinomiale(REGLAGES_DEMO, genererExerciceLoiBinomiale);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionLoiBinomiale;
  revele: boolean;
}

/** Formate la réponse de l'élève pour UN écran (`champs`/`valeurs` apparié par index) en une ligne
 * lisible "label = valeur" (ou "label : valeur" si le label ne se termine pas déjà par `=`/`:`) —
 * pour un champ `choix`, affiche le LABEL de l'option choisie, jamais sa valeur technique. Consultée
 * en lecture seule par `FicheReponseEcran` (voir `onValider` ci-dessous), jamais par le moteur. */
function formatVotreReponseChamps(champs: ChampDef[], valeurs: string[]): string {
  return champs
    .map((champ, i) => {
      const brut = valeurs[i] ?? "";
      const valeurAffichee = champ.type === "choix" ? champ.options?.find((o) => o.valeur === brut)?.label ?? brut : brut;
      const label = champ.label.trim();
      return /[=:]$/.test(label) ? `${label} ${valeurAffichee}` : `${label} : ${valeurAffichee}`;
    })
    .join(" ; ");
}

export function App6gen50() {
  const [etat, setEtat] = useState<EtatSessionLoiBinomiale>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionLoiBinomiale`, jamais dans le moteur : la saisie de l'élève n'a
   * aucune autre utilité une fois l'écran clos. Remis à vide à chaque nouvel exercice, comme
   * `enAttente` — mirroir `AppAnalyseFonction.tsx` (4e). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** Réutilise `calculerRecapitulatifLoiBinomiale` (même mécanisme que `RecapitulatifPanel`) pour la
   * réponse ATTENDUE : l'entrée qui vient d'être ajoutée est toujours la DERNIÈRE du tableau, les
   * écrans se closent dans l'ordre. */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionLoiBinomiale) {
    const recap = calculerRecapitulatifLoiBinomiale(nouvelEtat);
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

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'écran se clôt RÉELLEMENT
   * (`transitionDEcran`) — jamais à chaque clic sur "Valider" : tant qu'il reste des tentatives, une
   * réponse fausse renvoie un état où `etapeCourante.terminee` reste `false` SANS clore l'écran, et
   * `onValider`/`soumettreReponseEcran` sont quand même rappelés à CHAQUE tentative. Même garde que
   * `AppAnalyseFonction.tsx` (4e) — piège déjà documenté CLAUDE.md. */
  function terminerEtape(nouvelEtat: EtatSessionLoiBinomiale, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) {
        ajouterHistorique(votreReponse, nouvelEtat);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereTransitionRevelee });
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
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setEtat(demarrerSessionLoiBinomiale(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteLoiBinomiale)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen48.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen50?: unknown }).__debug6gen50 = { exercice, phase };
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <span className="equation-box-termes">
            {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </span>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, niveauAideMaxEcran(exercice, phase)),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
    validation,
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Loi binomiale</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionLoiBinomiale(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifLoiBinomiale(etat)} />
        <EtapeChampsLoiBinomiale
          // `${etat.generationId}-${phase}`, JAMAIS `phase` seul — voir `generationId`
          // (`moteur6e/typesLoiBinomiale.ts`/`sessionLoiBinomiale.ts`) : la famille B (écran de
          // calcul des termes) peut avoir un nombre de champs variable à phase de départ
          // identique entre 2 exercices consécutifs — mirroir du bug trouvé/corrigé sur 6gen48.
          key={`${etat.generationId}-${phase}`}
          {...aideCommun}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          consigneEcran={consigneEcran(exercice, phase)}
          champs={champsEcran(exercice, phase)}
          aideNiveau1={formatAideNiveau1(exercice, phase)}
          aideNiveau2={formatAideNiveau2(exercice, phase)}
          diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), formatVotreReponseChamps(champsEcran(exercice, phase), valeurs))}
        />
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
