import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePointsDroitesRemarquablesTriangle } from "./generateurs6e/pointsDroitesRemarquablesTriangle";
import type { IdVariantePointsDroitesRemarquablesTriangle } from "./generateurs6e/pointsDroitesRemarquablesTriangle";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionPointsDroitesRemarquablesTriangle, soumettreReponseEcran } from "./moteur6e/sessionPointsDroitesRemarquablesTriangle";
import type { EtatSessionPointsDroitesRemarquablesTriangle } from "./moteur6e/typesPointsDroitesRemarquablesTriangle";
import { diagnostiquerEcran } from "./moteur6e/verificationPointsDroitesRemarquablesTriangle";
import { Katex } from "./components/Katex";
import { EtapeChampsPointsDroitesRemarquablesTriangle } from "./components6e/EtapeChampsPointsDroitesRemarquablesTriangle";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { blocDonnees, consigneEcran, consigneGenerale, definitionEcran, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatPointsDroitesRemarquablesTriangle";
import type { ChampDef, DefinitionEcran } from "./ui6e/formatPointsDroitesRemarquablesTriangle";
import { calculerRecapitulatifPointsDroitesRemarquablesTriangle, calculerSegmentsProgressionPointsDroitesRemarquablesTriangle } from "./ui6e/recapitulatifPointsDroitesRemarquablesTriangle";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/**
 * `6gen54` — Points et droites remarquables du triangle. GÉNÉRATEUR D'OUVERTURE du chapitre "Lieux
 * géométriques" (voir `docs/historique-6e.md`). Même patron que `App6gen43.tsx`/`App6gen53.tsx` :
 * un dispatcher générique piloté par `ui6e/formatPointsDroitesRemarquablesTriangle.ts`/
 * `moteur6e/verificationPointsDroitesRemarquablesTriangle.ts`, PAS de JSX par famille/écran — un
 * SEUL composant écran (`EtapeChampsPointsDroitesRemarquablesTriangle`) gère À LA FOIS les champs
 * texte libre, les écrans de choix simple/multiple ET le mode liste add-as-needed (famille C),
 * piloté entièrement par `definition: DefinitionEcran`.
 *
 * **Pas de `QuestionFinale`** — convention RÉELLE déjà établie pour ce chantier (voir en-tête
 * `App6gen49.tsx`/`App6gen53.tsx` : 0 générateur 6e ne l'utilise) : ce composant appartient au
 * patron narratif "1 seul problème long" du chantier 4e, jamais adopté par le chantier 6e
 * (dispatcher générique par écrans courts, `consigneEcran` change à chaque phase — le rôle de
 * rappel persistant est déjà rempli par `blocDonnees`, réaffiché identique sur chaque écran).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionPointsDroitesRemarquablesTriangle {
  return demarrerSessionPointsDroitesRemarquablesTriangle(REGLAGES_DEMO, genererExercicePointsDroitesRemarquablesTriangle);
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionPointsDroitesRemarquablesTriangle;
  revele: boolean;
}

/** Formate la réponse de l'élève pour un écran `kind: "champs"` (`champs`/`valeurs` apparié par
 * index) en une ligne lisible "label = valeur" (ou "label : valeur" si le label ne se termine pas
 * déjà par `=`/`:`) — pour `choix`, affiche le LABEL de l'option choisie ; pour `choixMultiple`,
 * les labels des options sélectionnées (`valeurs[i]` = liste d'ids séparés par des virgules). */
function formatVotreReponseChamps(champs: ChampDef[], valeurs: string[]): string {
  return champs
    .map((champ, i) => {
      const brut = valeurs[i] ?? "";
      let valeurAffichee = brut;
      if (champ.type === "choix") {
        valeurAffichee = champ.options?.find((o) => o.valeur === brut)?.label ?? brut;
      } else if (champ.type === "choixMultiple") {
        valeurAffichee = brut
          .split(",")
          .filter((id) => id !== "")
          .map((id) => champ.options?.find((o) => o.valeur === id)?.label ?? id)
          .join(", ");
      }
      const label = champ.label.trim();
      return /[=:]$/.test(label) ? `${label} ${valeurAffichee}` : `${label} : ${valeurAffichee}`;
    })
    .join(" ; ");
}

/** Formate la réponse de l'élève pour UN écran, quelle que soit sa `DefinitionEcran` — `kind:
 * "champs"` délègue à `formatVotreReponseChamps` ci-dessus ; `kind: "liste"` (famille C, add-as-
 * needed, `valeurs` plat) regroupe par paires `(x;y)` si `forme === "point"`, sinon juste une
 * liste de valeurs séparées par des virgules. Consultée en lecture seule par `FicheReponseEcran`,
 * jamais par le moteur. */
function formatVotreReponseDefinition(definition: DefinitionEcran, valeurs: string[]): string {
  if (definition.kind === "champs") return formatVotreReponseChamps(definition.champs, valeurs);
  if (definition.forme === "point") {
    const paires: string[] = [];
    for (let i = 0; i + 1 < valeurs.length; i += 2) {
      paires.push(`(${valeurs[i]} ; ${valeurs[i + 1]})`);
    }
    return `${definition.label} ${paires.join(", ")}`;
  }
  return `${definition.label} ${valeurs.join(", ")}`;
}

export function App6gen54() {
  const [etat, setEtat] = useState<EtatSessionPointsDroitesRemarquablesTriangle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionPointsDroitesRemarquablesTriangle`, jamais dans le moteur : la
   * saisie de l'élève n'a aucune autre utilité une fois l'écran clos. Remis à vide à chaque nouvel
   * exercice, comme `enAttente` — mirroir `AppAnalyseFonction.tsx` (4e). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** Réutilise `calculerRecapitulatifPointsDroitesRemarquablesTriangle` (même mécanisme que
   * `RecapitulatifPanel`) pour la réponse ATTENDUE : l'entrée qui vient d'être ajoutée est toujours
   * la DERNIÈRE du tableau, les écrans se closent dans l'ordre. */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionPointsDroitesRemarquablesTriangle) {
    const recap = calculerRecapitulatifPointsDroitesRemarquablesTriangle(nouvelEtat);
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
  function terminerEtape(nouvelEtat: EtatSessionPointsDroitesRemarquablesTriangle, votreReponse?: ReactNode) {
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
    setEtat(demarrerSessionPointsDroitesRemarquablesTriangle(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVariantePointsDroitesRemarquablesTriangle)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même —
  // mirroir `App6gen43.tsx`/`App6gen37.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen54?: unknown }).__debug6gen54 = { exercice, phase };
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
  };

  const definitionActuelle = definitionEcran(exercice, phase);

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Points et droites remarquables du triangle</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionPointsDroitesRemarquablesTriangle(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifPointsDroitesRemarquablesTriangle(etat)} />
        <EtapeChampsPointsDroitesRemarquablesTriangle
          key={phase}
          {...aideCommun}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          consigneEcran={consigneEcran(exercice, phase)}
          definition={definitionActuelle}
          aideNiveau1={formatAideNiveau1(exercice, phase)}
          aideNiveau2={formatAideNiveau2(exercice, phase)}
          diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), formatVotreReponseDefinition(definitionActuelle, valeurs))}
          validation={validation}
        />
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
