import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAiresFormesReelles } from "./generateurs6e/airesFormesReelles";
import type { IdVarianteAiresFormesReelles } from "./generateurs6e/airesFormesReelles";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionFormesReelles, soumettreReponseEcran } from "./moteur6e/sessionAiresFormesReelles";
import type { EtatSessionFormesReelles } from "./moteur6e/sessionAiresFormesReelles";
import { diagnostiquerChamps } from "./moteur6e/verificationAiresFormesReelles";
import { Katex } from "./components/Katex";
import { EtapeAiresFormesReelles } from "./components6e/EtapeAiresFormesReelles";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1, aideNiveau2, blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, libellePhase } from "./ui6e/formatAiresFormesReelles";
import { figureCorrigeSvg, schemaEnonceSvg } from "./ui6e/figureAiresFormesReelles";
import { calculerRecapitulatifFormesReelles, calculerSegmentsProgressionFormesReelles } from "./ui6e/recapitulatifAiresFormesReelles";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen81` — « Aires de formes réelles » (chapitre 4, section `aires`, processus 3 TRANSFÉRER) :
 * un mur à fronton arrondi, un vitrail, la section d'un canal / tunnel / gouttière, une parcelle
 * bordée par une rivière. Écrans : modéliser (fonction et bornes, ou intersections) → aire → réponse
 * dans le contexte (surface, peinture et pots, coût, volume, m²…). Même patron que `App6gen76.tsx` ;
 * le `?code=` (QR code des feuilles) rejoue l'instance de `generateurs6e/airesFormesReelles/
 * exportEvaluation.ts` avec les MÊMES fonctions de génération.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionFormesReelles {
  return demarrerSessionFormesReelles(REGLAGES_DEMO, genererExerciceAiresFormesReelles);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionFormesReelles {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionFormesReelles(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceAiresFormesReelles, (id) => construireAvecVarianteId(id as IdVarianteAiresFormesReelles)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionFormesReelles;
  revele: boolean;
}

export function App6gen81() {
  const [etat, setEtat] = useState<EtatSessionFormesReelles>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Compteur d'exercices : entre dans la `key` de l'écran pour vider les champs à chaque nouvel
   * exercice (« Générer », « Nouvel exercice »). */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const champs = champsEcran(exercice, phase);

  function reponseAttendue(): ReactNode {
    return (
      <span className="equation-box-termes">
        {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </span>
    );
  }

  function terminerEtape(nouvelEtat: EtatSessionFormesReelles, valeurs: string[]) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    setHistorique((h) => [
      ...h,
      { titre: libellePhase(exercice, phase), votreReponse: champs.map((c, i) => `${c.label} ${valeurs[i]}`).join(" ; "), correcte: !revele, reponseAttendue: revele ? reponseAttendue() : undefined },
    ]);
    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function reinitialiser(nouvelEtat: EtatSessionFormesReelles) {
    setEtat(nouvelEtat);
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setCompteur((c) => c + 1);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      reinitialiser(nouvelleSession());
      return;
    }
    setEtat(enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    reinitialiser(demarrerSessionFormesReelles(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteAiresFormesReelles)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen81?: unknown }).__debug6gen81 = { exercice, phase };
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Aires de formes réelles</h1>
        <p className="app-subtitle">Chapitre 4 — Intégrales et primitives</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionFormesReelles(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifFormesReelles(etat)} />
        <EtapeAiresFormesReelles
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          schemaSvg={schemaEnonceSvg(exercice)}
          consigneEcran={consigneEcran(exercice, phase)}
          champs={champs}
          aideNiveau1={aideNiveau1(exercice, phase)}
          aideNiveau2={aideNiveau2(exercice, phase)}
          tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
          tentativesMax={etat.reglages.tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX}
          onActiverAide={() => setEtat(activerAideSuivante(etat))}
          validation={validation}
          diagnostiquer={(valeurs) => diagnostiquerChamps(exercice, phase, valeurs)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
        />
        {enAttente?.etatSuivant.terminee && (
          <figure style={{ margin: "1rem 0 0", textAlign: "center" }} aria-label="Figure du corrigé">
            <div dangerouslySetInnerHTML={{ __html: figureCorrigeSvg(exercice) }} />
          </figure>
        )}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
