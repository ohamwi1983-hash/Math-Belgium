import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTangentesConique } from "./generateurs6e/tangentesConique";
import type { IdVarianteTangentesConique } from "./generateurs6e/tangentesConique";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionTangentesConique, soumettreReponseEcran } from "./moteur6e/sessionTangentesConique";
import type { EtatSessionTangentesConique } from "./moteur6e/typesTangentesConique";
import { diagnostiquerEcran } from "./moteur6e/verificationTangentesConique";
import { EtapeChampsTangentesConique } from "./components6e/EtapeChampsTangentesConique";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { blocDonnees, champsEcran, consigneEcran, consigneGenerale, etatActuel, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatTangentesConique";

/**
 * `6gen62` — Tangentes à une conique. Chapitre "Les coniques", 6e FWB (6h). Même patron que
 * `App6gen59.tsx` : un dispatcher générique piloté par `ui6e/formatTangentesConique.ts`/
 * `moteur6e/verificationTangentesConique.ts`, PAS de JSX par famille/écran — un SEUL composant écran
 * (`EtapeChampsTangentesConique`) gère les champs texte libre, choix ET liste add-as-needed, piloté
 * entièrement par `champs: ChampDef[]`.
 *
 * Validation INLINE même écran (rollout UX approuvé) — `enAttente`/`terminerEtape`/`ValidationEcran`,
 * mirroir exact `App6gen13.tsx`/`App6gen12.tsx` : plus de `ResultatPanelTangentesConique`/
 * `ResumeSessionTangentesConique` séparés.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionTangentesConique {
  return demarrerSessionTangentesConique(REGLAGES_DEMO, genererExerciceTangentesConique);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionTangentesConique;
  revele: boolean;
}

export function App6gen62() {
  const [etat, setEtat] = useState<EtatSessionTangentesConique>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionTangentesConique) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici) — piège "revele stale" documenté CLAUDE.md.
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereTransitionRevelee });
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
    setEtat(demarrerSessionTangentesConique(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteTangentesConique)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen59.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen62?: unknown }).__debug6gen62 = { exercice, phase, champs: champsEcran(exercice, phase) };
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

  // Wiring calculatrice scientifique — familles B/C/E de ce générateur donnent un discriminant
  // (`Math.sqrt`, `algebreTangente.ts`) JAMAIS garanti carré parfait (contrairement à `6gen61`,
  // BigInt/carré parfait par construction) : les pentes `k`/`m` des tangentes, leurs points de
  // tangence, et les distances point-droite de la famille E sont donc génériquement irrationnels,
  // comparés par tolérance décimale (`diagnostiquerValeur`, `verificationTangentesConique.ts`).
  // Familles A (point déjà donné, simple substitution) et D (`a²`,`b²` toujours des carrés entiers
  // par construction, `familleD.ts`) restent exactes — jamais de calculatrice là. Même principe que
  // `App6gen12.tsx`/`App6gen60.tsx`.
  const calculatriceVisible =
    (exercice.famille === "B" && (phase === "bEcran3" || phase === "bEcran4")) ||
    (exercice.famille === "C" && (phase === "cEcran3" || phase === "cEcran4")) ||
    (exercice.famille === "E" && (phase === "eEcran1" || phase === "eEcran2" || phase === "eEcran3"));

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Tangentes à une conique</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <EtapeChampsTangentesConique
          key={phase}
          {...aideCommun}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          etatActuel={etatActuel(exercice, phase)}
          consigneEcran={consigneEcran(exercice, phase)}
          champs={champsEcran(exercice, phase)}
          aideNiveau1={formatAideNiveau1(exercice, phase)}
          aideNiveau2={formatAideNiveau2(exercice, phase)}
          diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs))}
        />
        {calculatriceVisible && <CalculatriceScientifique />}
      </main>
    </div>
  );
}
