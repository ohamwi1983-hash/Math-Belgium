import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExerciceRegions } from "./core6e/regionsPlanComplexe.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRegions } from "./generateurs6e/regionsPlanComplexe";
import { activerAideSuivante, demarrerSessionRegions, niveauAideMaxPhase, soumettreReponseEcran, tentativesMaxPhase } from "./moteur6e/sessionRegionsPlanComplexe";
import { estPhaseChoix } from "./moteur6e/typesRegionsPlanComplexe";
import type { EtatSessionRegions, PhaseRegions } from "./moteur6e/typesRegionsPlanComplexe";
import { diagnosticEcran, messageSaisieNonDecomptee } from "./moteur6e/verificationRegionsPlanComplexe";
import { idOptionCorrecte, optionsRegion } from "./moteur6e/modeleRegionsPlanComplexe";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeRegionsPlanComplexe } from "./components6e/EtapeRegionsPlanComplexe";
import type { ModeEcranRegions } from "./components6e/EtapeRegionsPlanComplexe";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  BORD_FRAGMENTS,
  LIBELLE_PHASE,
  NATURE_COURTE,
  aideNiveau1,
  aideNiveau2,
  consigneEcran,
  consigneGenerale,
  groupesChamps,
  messageDiagnostic,
  optionsBord,
  optionsNature,
  reponseFragments,
  titresGroupes,
} from "./ui6e/formatRegionsPlanComplexe";
import type { FragmentConsigne } from "./ui6e/formatRegionsPlanComplexe";
import { figureFrontiereSvg, figuresOptions } from "./ui6e/figureRegionsPlanComplexe";
import { calculerRecapitulatifRegions, calculerSegmentsProgressionRegions } from "./ui6e/recapitulatifRegionsPlanComplexe";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen98` — « Régions du plan complexe » (6e, chapitre 5, section « Problèmes avancés »,
 * processus 2). Chaîne fixe de 4 écrans : nature de la frontière (choix fermé) → ses éléments
 * (champs) → bord inclus ou non (choix fermé) → la région parmi quatre figures (choix fermé). Une
 * intersection pose chaque question pour ses deux conditions. Patron de `App6gen95.tsx`. Le
 * `?code=` (QR code des feuilles) rejoue l'instance de
 * `generateurs6e/regionsPlanComplexe/exportEvaluation.ts` avec les MÊMES fonctions de génération.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionRegions {
  return demarrerSessionRegions(REGLAGES_DEMO, genererExerciceRegions);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionRegions {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionRegions(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceRegions, (id) => construireAvecVarianteId(id)));
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionRegions;
  revele: boolean;
}

function modeEcran(e: ExerciceRegions, phase: PhaseRegions): ModeEcranRegions {
  const titres = titresGroupes(e) ?? [null];
  if (phase === "nature") return { type: "choix", titres, options: optionsNature() };
  if (phase === "bord") return { type: "choix", titres, options: optionsBord() };
  if (phase === "region") return { type: "figures", figures: figuresOptions(e).map(({ option, svg }) => ({ id: option.id, svg })), idCorrect: idOptionCorrecte(e) };
  return { type: "champs", groupes: groupesChamps(e) };
}

function figureEcran(e: ExerciceRegions, phase: PhaseRegions): { svg: string; legende: string } | null {
  if (phase !== "bord") return null;
  return { svg: figureFrontiereSvg(e), legende: "Plan complexe : la frontière obtenue à l'étape précédente" };
}

function reponseAttendue(e: ExerciceRegions, phase: PhaseRegions): ReactNode {
  return <RenduFragments fragments={reponseFragments(e, phase)} />;
}

export function App6gen98() {
  const [etat, setEtat] = useState<EtatSessionRegions>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  function votreReponse(valeurs: string[]): ReactNode {
    if (phase === "nature") return valeurs.map((v) => NATURE_COURTE[v as keyof typeof NATURE_COURTE] ?? "?").join(" ; ");
    if (phase === "bord") {
      const fr = valeurs.flatMap((v, i): FragmentConsigne[] => [...(i > 0 ? [{ type: "texte", valeur: " ; " } as FragmentConsigne] : []), ...(BORD_FRAGMENTS[v as "inclus" | "exclu"] ?? [])]);
      return <RenduFragments fragments={fr} />;
    }
    if (phase === "region") {
      const i = optionsRegion(exercice).findIndex((o) => o.id === valeurs[0]);
      return `Figure ${i + 1}`;
    }
    return valeurs.join(" ; ");
  }

  function terminerEtape(nouvelEtat: EtatSessionRegions, valeurs: string[]) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    setHistorique((h) => [...h, { titre: LIBELLE_PHASE[phase], votreReponse: votreReponse(valeurs), correcte: !revele, reponseAttendue: revele ? reponseAttendue(exercice, phase) : undefined }]);
    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function reinitialiser(nouvelEtat: EtatSessionRegions) {
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
    reinitialiser(demarrerSessionRegions(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen98?: unknown }).__debug6gen98 = { exercice, phase, idCorrect: idOptionCorrecte(exercice) };
  }

  const choix = estPhaseChoix(phase);
  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        ...(choix ? { messageRevele: "Ce n'était pas le bon choix (une seule tentative sur un choix fermé)." } : {}),
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Régions du plan complexe</h1>
        <p className="app-subtitle">Chapitre 5 — Nombres complexes</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionRegions(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifRegions(etat)} />
        <EtapeRegionsPlanComplexe
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          consigneEcran={consigneEcran(exercice, phase)}
          figure={figureEcran(exercice, phase)}
          mode={modeEcran(exercice, phase)}
          aideNiveau1={aideNiveau1(exercice, phase)}
          aideNiveau2={aideNiveau2(exercice, phase)}
          tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
          tentativesMax={tentativesMaxPhase(etat)}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMaxPhase(phase)}
          onActiverAide={() => setEtat(activerAideSuivante(etat))}
          validation={validation}
          messageSaisie={(valeurs) => messageSaisieNonDecomptee(exercice, phase, valeurs)}
          diagnostic={(valeurs) => {
            const id = diagnosticEcran(exercice, phase, valeurs);
            return id === null ? null : messageDiagnostic(exercice, phase, id);
          }}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs)}
        />
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
