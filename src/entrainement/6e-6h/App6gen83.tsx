import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExerciceContenanceObjets } from "./core6e/contenanceObjets.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceContenanceObjets } from "./generateurs6e/contenanceObjets";
import type { IdVarianteContenanceObjets } from "./generateurs6e/contenanceObjets";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionContenance, soumettreReponseEcran, tentativesMaxCourant } from "./moteur6e/sessionContenanceObjets";
import { estPhaseChoix } from "./moteur6e/typesContenanceObjets";
import type { EtatSessionContenance, PhaseContenance } from "./moteur6e/typesContenanceObjets";
import { diagnostiquerChamps, piegeEcran } from "./moteur6e/verificationContenanceObjets";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeContenanceObjets } from "./components6e/EtapeContenanceObjets";
import type { ModeEcranContenance } from "./components6e/EtapeContenanceObjets";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import {
  aideNiveau1,
  aideNiveau2,
  blocDonnees,
  champsEcran,
  consigneEcran,
  consigneGenerale,
  formatReponseAttenduePhaseLatex,
  libellePhase,
  optionsEcran,
  verdictComparaison,
} from "./ui6e/formatContenanceObjets";
import { figureCorrigeSvg, figureEnonceHtml } from "./ui6e/figureContenanceObjets";
import { calculerRecapitulatifContenance, calculerSegmentsProgressionContenance } from "./ui6e/recapitulatifContenanceObjets";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen83` — « Contenance d'objets de révolution » (6e, chapitre 4, section `volumes`, processus 3
 * TRANSFÉRER). La méthode des disques de 6gen27 appliquée à un objet du quotidien (verre à vin, vase,
 * tonneau, flacon de parfum, pot de fleurs) dont le profil intérieur tourne autour de son axe (axe
 * des abscisses du repère, comme au cours). Cinq écrans : modèle (choix fermé) → intégrale (bornes
 * lues sur les cotes + [f(x)]², ou f(x) depuis les diamètres pour le pot) → V en cm³ → contenance en
 * L/cL → transfert (hauteur du liquide, nombre de récipients, ou comparaison en choix fermé). Aucun
 * point affiché ; `?code=` : première instance tirée avec les MÊMES fonctions que l'adaptateur.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionContenance {
  return demarrerSessionContenance(REGLAGES_DEMO, genererExerciceContenanceObjets);
}

function sessionInitiale(): EtatSessionContenance {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionContenance(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceContenanceObjets, (id) => construireAvecVarianteId(id as IdVarianteContenanceObjets)),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionContenance;
  revele: boolean;
}

function modeEcran(e: ExerciceContenanceObjets, phase: PhaseContenance): ModeEcranContenance {
  return estPhaseChoix(e, phase) ? { type: "choix", options: optionsEcran(e, phase) } : { type: "champs", champs: champsEcran(e, phase) };
}

function reponseAttendue(e: ExerciceContenanceObjets, phase: PhaseContenance): ReactNode {
  const formules = (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(e, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
  if (phase === "transfert" && e.transfert === "comparer") {
    return (
      <>
        {formules}
        <p className="prompt-text">
          <RenduFragments fragments={verdictComparaison(e)} />
        </p>
      </>
    );
  }
  return formules;
}

export function App6gen83() {
  const [etat, setEtat] = useState<EtatSessionContenance>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Compteur d'exercices : dans la `key` de l'écran, pour vider la saisie après « Générer » / « Nouvel exercice ». */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const mode = modeEcran(exercice, phase);
  const choix = mode.type === "choix";

  function votreReponse(valeurs: string[]): ReactNode {
    if (mode.type === "choix") {
      const option = mode.options.find((o) => o.id === valeurs[0]);
      return option ? <RenduFragments fragments={option.fragments} /> : "";
    }
    return mode.champs.map((c, i) => `${c.label} ${valeurs[i]}${c.unite ? ` ${c.unite}` : ""}`).join(" ; ");
  }

  function terminerEtape(nouvelEtat: EtatSessionContenance, valeurs: string[]) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    setHistorique((h) => [...h, { titre: libellePhase(exercice, phase), votreReponse: votreReponse(valeurs), correcte: !revele, reponseAttendue: revele ? reponseAttendue(exercice, phase) : undefined }]);
    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function reinitialiser(nouvelEtat: EtatSessionContenance) {
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
    reinitialiser(demarrerSessionContenance(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteContenanceObjets)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen83?: unknown }).__debug6gen83 = { exercice, phase };
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        ...(choix ? { messageRevele: "Ce n'était pas la bonne réponse (une seule tentative sur un choix fermé)." } : {}),
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Contenance d'objets de révolution</h1>
        <p className="app-subtitle">Chapitre 4 — Intégrales et primitives</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionContenance(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifContenance(etat)} />
        <EtapeContenanceObjets
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={blocDonnees(exercice)}
          figureHtml={figureEnonceHtml(exercice)}
          consigneEcran={consigneEcran(exercice, phase)}
          mode={mode}
          aideNiveau1={aideNiveau1(exercice, phase)}
          aideNiveau2={aideNiveau2(exercice, phase)}
          tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
          tentativesMax={tentativesMaxCourant(etat)}
          niveauAide={etat.niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX}
          onActiverAide={() => setEtat(activerAideSuivante(etat))}
          validation={validation}
          diagnostiquer={(valeurs) => diagnostiquerChamps(exercice, phase, valeurs)}
          piege={(valeurs) => piegeEcran(exercice, phase, valeurs)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
        />
        {enAttente?.etatSuivant.terminee && (
          <figure style={{ margin: "1rem 0 0", textAlign: "center" }} aria-label="Solide de révolution de l'exercice">
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
