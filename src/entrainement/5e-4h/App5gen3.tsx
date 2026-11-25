import { useState, type ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import type { ComparateurSeuil, CompositionDirigee, ExerciceComposerFonctions, SensComposition } from "./core5e/composerFonctions.types";
import type { EnsembleReelGuide } from "./core5e/domaineDefinition.types";
import { CATALOGUE_COMBOS, CATALOGUE_SENS, construireAvecCombos, construireAvecComboSensTire, genererExerciceComposerFonctions } from "./generateurs5e/composerFonctions";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { correctionDetailleeComposerFonctions, lettrePhaseComposer } from "./generateurs5e/composerFonctions/corrigeDetaille";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lignesDeLEtape } from "../export/corrigeTableau";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  NIVEAU_AIDE_MAX_COMPOSER_FONCTIONS,
  activerAideSuivante,
  demarrerSessionComposerFonctions,
  soumettreReponseC1,
  soumettreReponseC2,
  soumettreReponseConditions,
  soumettreReponseDomaine,
  soumettreReponseFormule,
} from "./moteur5e/sessionComposerFonctions";
import type { EtatSessionComposerFonctions, PhaseComposerFonctions } from "./moteur5e/typesComposerFonctions";
import { diagnostiquerFormuleDirectionSimplifiee } from "./moteur5e/verificationComposerFonctions";
import { DonneesComposerFonctions } from "./components5e/DonneesComposerFonctions";
import { EtapeFormuleComposerFonctions } from "./components5e/EtapeFormuleComposerFonctions";
import { EtapeConditionsComposerFonctions } from "./components5e/EtapeConditionsComposerFonctions";
import { EtapeDomaineComposerFonctions } from "./components5e/EtapeDomaineComposerFonctions";
import { Katex } from "./components/Katex";
import { formatTermesEnsembleReelLatex } from "./ui5e/formatDomaineDefinition";
import {
  PLACEHOLDER_FORMULE,
  consigneC1,
  consigneC2,
  consigneConditions,
  consigneDomaine,
  consigneFormule,
  estPhaseFRondG,
  formatTermesConditionsLatex,
  latexAideC1Niveau2,
  latexAideC2Niveau2,
  latexAideConditionsNiveau2,
  latexAideDomaineNiveau2,
  latexAideFormuleNiveau2,
  libellePhaseComposerFonctions,
  texteAideC1Niveau1,
  texteAideC2Niveau1,
  texteAideConditionsNiveau1,
  texteAideDomaineNiveau1,
  texteAideFormuleNiveau1,
} from "./ui5e/formatComposerFonctions";
import { calculerRecapitulatifComposerFonctions } from "./ui5e/recapitulatifComposerFonctions";
import { cibleDomaineComposee, cibleEnsemble, cibleFormuleComposee } from "./ui5e/retoursFonctions1";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ecranClos, saisieEnLatex, segmentsDepuisHistorique, type EcranClos } from "../4e/ui/historiqueProgression";
import type { ReponseCondition } from "./moteur5e/verificationComposerFonctions";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionComposerFonctions {
  return demarrerSessionComposerFonctions(REGLAGES_DEMO, genererExerciceComposerFonctions);
}

/** `?code=` (QR code des feuilles) : rouvre EXACTEMENT l'instance imprimée — même catalogue et mêmes
 * fonctions de génération que l'adaptateur des feuilles (`composerFonctions/exportEvaluation.ts`). */
function sessionInitiale(): EtatSessionComposerFonctions {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionComposerFonctions(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_COMBOS, genererExerciceComposerFonctions, construireAvecComboSensTire));
}

/** D.1 — panneau dev "forcer une variante" : les 10 combinaisons de familles × 3 sous-variantes de
 * sens = 30 entrées (2 axes de tirage indépendants combinés en un seul catalogue plat, même
 * principe que gen57, 4e, pour un générateur à 2 axes). */
const OPTIONS_COMPOSITION = CATALOGUE_COMBOS.flatMap((combo) =>
  CATALOGUE_SENS.map((sens) => ({ id: `${combo.id}::${sens.id}`, label: `${combo.label} — ${sens.label}` })),
);

function directionDe(exercice: ExerciceComposerFonctions, phase: PhaseComposerFonctions): CompositionDirigee | null {
  return estPhaseFRondG(phase) ? exercice.fRondG : exercice.gRondF;
}

function directionCourante(etat: EtatSessionComposerFonctions): CompositionDirigee {
  const dir = directionDe(etat.exerciceCourant, etat.phase);
  if (dir === null) throw new Error("directionCourante : aucune composition disponible pour la phase courante");
  return dir;
}

function LigneDomaineTermes({ ensemble }: { ensemble: EnsembleReelGuide }) {
  const termes = formatTermesEnsembleReelLatex(ensemble);
  return (
    <span className="equation-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </span>
  );
}

/** Réponse réellement attendue de la phase qui vient de se clore — même dispatch par PRÉFIXE de
 * phase (formule/conditions/c1/c2/domaine) que l'ancien `ResultatPanelComposerFonctions.tsx`
 * (supprimé, remplacé par la validation inline), jamais par nom exact. */
function reponseAttendueComposerFonctions(exercice: ExerciceComposerFonctions, phase: PhaseComposerFonctions) {
  const dir = directionDe(exercice, phase);
  if (dir === null) return null;
  if (phase.startsWith("formule")) return <Katex expression={`(${estPhaseFRondG(phase) ? "f\\circ g" : "g\\circ f"})(x) = ${dir.latex}`} />;
  if (phase.startsWith("conditions")) {
    const termes = formatTermesConditionsLatex(dir);
    return (
      <span className="equation-box-termes">
        {termes.map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </span>
    );
  }
  if (phase.startsWith("c1")) return <LigneDomaineTermes ensemble={dir.interieure.domaine} />;
  if (phase.startsWith("c2")) return dir.domaineApresCarre !== null ? <LigneDomaineTermes ensemble={dir.domaineApresCarre} /> : null;
  return <LigneDomaineTermes ensemble={dir.domaine} />;
}

/** Révélation RÉELLE de la phase qui vient de se clore. Tant que l'exercice n'est pas terminé,
 * `revelesPartiels` (moteur) porte déjà la valeur pour `etat.phase` (juste écrite par `apresPhase`).
 * Mais à la clôture de l'exercice (`nouvelEtat.terminee`), `cloturerExerciceOuSuivant` ne recopie
 * PAS `revelesPartiels` dans l'état retourné (seul `resultats` reçoit l'entrée complète) — il faut
 * alors lire la révélation de CETTE phase dans le dernier `resultat.reveles` ajouté. */
function reveleDeLaTransition(etat: EtatSessionComposerFonctions, nouvelEtat: EtatSessionComposerFonctions): boolean {
  if (nouvelEtat.terminee) {
    const dernierResultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1];
    return dernierResultat.reveles[etat.phase] ?? false;
  }
  return nouvelEtat.revelesPartiels[etat.phase] ?? false;
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionComposerFonctions;
  revele: boolean;
}

/* Puces : une par phase de la séquence RÉELLE de CET exercice (`etat.ordre`, dynamique — 2 à 10
 * écrans selon `sens`/richesse de chaque direction), construites depuis l'historique des écrans
 * clos (`segmentsDepuisHistorique`) et cliquables (fiche en lecture seule, dernier écran compris). */

const LATEX_COMPARATEUR: Record<ComparateurSeuil, string> = { eq: "=", ne: "\\neq", ge: "\\geq", gt: ">", le: "\\leq", lt: "<" };

/** Conditions posées : comparateur choisi et seuil TEL QUE TAPÉ (jamais la valeur relue). */
function conditionsSaisiesAffichees(dir: CompositionDirigee, reponse: ReponseCondition[], seuils: string[]): ReactNode {
  return (
    <span className="equation-box-termes">
      {reponse.map((r, i) => (
        <span key={i}>
          <Katex expression={`${dir.nomInterieure}(x) ${LATEX_COMPARATEUR[r.comparateur]}`} /> {saisieEnLatex(seuils[i] ?? "")}
        </span>
      ))}
    </span>
  );
}

export function App5gen3() {
  const [etat, setEtat] = useState<EtatSessionComposerFonctions>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Incrémenté à chaque « Générer » (variante forcée) et à chaque nouvel exercice : il entre dans la
   * `key` des écrans, pour que les champs soient toujours vidés, même si la phase reste la même. */
  const [generation, setGeneration] = useState(0);
  /** Écrans clos de l'exercice en cours (puces cliquables → fiche en lecture seule). */
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function viderHistorique() {
    setHistorique([]);
    setFicheOuverteIndex(null);
  }

  function terminerEtape(nouvelEtat: EtatSessionComposerFonctions, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = reveleDeLaTransition(etat, nouvelEtat);
      setHistorique((h) => [
        ...h,
        ecranClos(libellePhaseComposerFonctions(etat.phase), votreReponse, revele, etat.niveauAide > 0, reponseAttendueComposerFonctions(exercice, etat.phase), corrigeDetailleEcranCourant()),
      ]);
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setGeneration((n) => n + 1);
      viderHistorique();
    }
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    viderHistorique();
    const [comboId, sensId] = id.split("::") as [string, SensComposition];
    setGeneration((n) => n + 1);
    setEtat(demarrerSessionComposerFonctions(REGLAGES_DEMO, () => construireAvecCombos(comboId, sensId)));
  }

  const exercice = etat.exerciceCourant;
  const donnees = <DonneesComposerFonctions exercice={exercice} />;
  const recapitulatif = calculerRecapitulatifComposerFonctions(etat);
  const dir = directionCourante(etat);

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeComposerFonctions(exercice), lettrePhaseComposer(exercice, etat.phase))} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueComposerFonctions(exercice, etat.phase),
        corrigeDetaille: corrigeDetailleEcranCourant(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Composer f et g</h1>
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, etat.ordre.length, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev options={OPTIONS_COMPOSITION} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={recapitulatif} />
          {etat.phase.startsWith("formule") && (
            <EtapeFormuleComposerFonctions
              key={`${generation}-${etat.phase}`}
              consigne={consigneFormule(dir)}
              donnees={donnees}
              placeholder={PLACEHOLDER_FORMULE}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX_COMPOSER_FONCTIONS}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              texteAideNiveau1={texteAideFormuleNiveau1(dir)}
              latexAideNiveau2={latexAideFormuleNiveau2(dir)}
              onValider={(texte) => terminerEtape(soumettreReponseFormule(etat, texte), <><Katex expression={`(${estPhaseFRondG(etat.phase) ? "f\\circ g" : "g\\circ f"})(x) =`} /> {saisieEnLatex(texte)}</>)}
              diagnostiquer={(texte) => diagnostiquerFormuleDirectionSimplifiee(dir, texte)}
              cible={(texte) => cibleFormuleComposee(dir, dir === exercice.fRondG ? exercice.gRondF : exercice.fRondG, texte)}
              validation={validation}
            />
          )}
          {etat.phase.startsWith("conditions") && (
            <EtapeConditionsComposerFonctions
              key={`${generation}-${etat.phase}`}
              dir={dir}
              consigne={consigneConditions(dir)}
              donnees={donnees}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX_COMPOSER_FONCTIONS}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              texteAideNiveau1={texteAideConditionsNiveau1(dir)}
              latexAideNiveau2={latexAideConditionsNiveau2(dir)}
              onValider={(reponse, seuils) => terminerEtape(soumettreReponseConditions(etat, reponse), conditionsSaisiesAffichees(dir, reponse, seuils))}
              validation={validation}
            />
          )}
          {etat.phase.startsWith("c1") && (
            <EtapeDomaineComposerFonctions
              key={`${generation}-${etat.phase}`}
              consigne={consigneC1(dir)}
              donnees={donnees}
              prefixApercu="x\in"
              attendu={dir.interieure.domaine}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX_COMPOSER_FONCTIONS}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              texteAideNiveau1={texteAideC1Niveau1(dir)}
              latexAideNiveau2={latexAideC1Niveau2(dir)}
              onValider={(reponse) => terminerEtape(soumettreReponseC1(etat, reponse), <LigneDomaineTermes ensemble={reponse} />)}
              cible={(saisi) => cibleEnsemble(saisi, dir.interieure.domaine)}
              validation={validation}
            />
          )}
          {etat.phase.startsWith("c2") && (
            <EtapeDomaineComposerFonctions
              key={`${generation}-${etat.phase}`}
              consigne={consigneC2(dir)}
              donnees={donnees}
              prefixApercu="x\in"
              attendu={dir.domaineApresCarre ?? undefined}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX_COMPOSER_FONCTIONS}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              texteAideNiveau1={texteAideC2Niveau1(dir)}
              latexAideNiveau2={latexAideC2Niveau2(dir)}
              onValider={(reponse) => terminerEtape(soumettreReponseC2(etat, reponse), <LigneDomaineTermes ensemble={reponse} />)}
              cible={(saisi) => (dir.domaineApresCarre ? cibleEnsemble(saisi, dir.domaineApresCarre) : null)}
              validation={validation}
            />
          )}
          {etat.phase.startsWith("domaine") && (
            <EtapeDomaineComposerFonctions
              key={`${generation}-${etat.phase}`}
              consigne={consigneDomaine(dir)}
              donnees={donnees}
              prefixApercu={`\\operatorname{dom}(${estPhaseFRondG(etat.phase) ? "f\\circ g" : "g\\circ f"}) =`}
              attendu={dir.domaine}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX_COMPOSER_FONCTIONS}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              texteAideNiveau1={texteAideDomaineNiveau1(dir)}
              latexAideNiveau2={latexAideDomaineNiveau2(dir)}
              onValider={(reponse) => terminerEtape(soumettreReponseDomaine(etat, reponse), <LigneDomaineTermes ensemble={reponse} />)}
              cible={(saisi) => cibleDomaineComposee(dir, saisi)}
              validation={validation}
            />
          )}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
