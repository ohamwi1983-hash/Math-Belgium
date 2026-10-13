import { useRef, useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import type { CompositionDirigee, ExerciceComposerFonctions, SensComposition } from "./core5e/composerFonctions.types";
import type { EnsembleReelGuide } from "./core5e/domaineDefinition.types";
import { CATALOGUE_COMBOS, CATALOGUE_SENS, construireAvecCombos, genererExerciceComposerFonctions } from "./generateurs5e/composerFonctions";
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
  texteAideC1Niveau1,
  texteAideC2Niveau1,
  texteAideConditionsNiveau1,
  texteAideDomaineNiveau1,
  texteAideFormuleNiveau1,
} from "./ui5e/formatComposerFonctions";
import { calculerRecapitulatifComposerFonctions } from "./ui5e/recapitulatifComposerFonctions";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionComposerFonctions {
  return demarrerSessionComposerFonctions(REGLAGES_DEMO, genererExerciceComposerFonctions);
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

/** Une puce par phase de la séquence RÉELLE de CET exercice (`etat.ordre`, dynamique — voir
 * `ordreComplet`, `moteur5e/typesComposerFonctions.ts`) : contrairement au gabarit 4e, aucun
 * `ORDRE_PHASES` fixe n'est possible ici (2 à 10 écrans selon `sens`/richesse de chaque direction),
 * même principe que `calculerSegmentsProgression` de `App5gen4.tsx` (questions dynamiques). */
function calculerSegmentsProgression(etat: EtatSessionComposerFonctions): EtatPuceProgression[] {
  return etat.ordre.map((phase, index) => {
    if (index === etat.indexPhase) return "courante";
    if (index > etat.indexPhase) return "a-venir";
    return etat.revelesPartiels[phase] ? "revele" : "correcte";
  });
}

export function App5gen3() {
  const [etat, setEtat] = useState<EtatSessionComposerFonctions>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionComposerFonctions) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: reveleDeLaTransition(etat, nouvelEtat) });
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
    const [comboId, sensId] = id.split("::") as [string, SensComposition];
    setEtat(demarrerSessionComposerFonctions(REGLAGES_DEMO, () => construireAvecCombos(comboId, sensId)));
  }

  const exercice = etat.exerciceCourant;
  const donnees = <DonneesComposerFonctions exercice={exercice} />;
  const recapitulatif = calculerRecapitulatifComposerFonctions(etat);
  const dir = directionCourante(etat);

  const premierePhaseRef = useRef(etat.phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = etat.phase;
  }
  const estPremierEcran = etat.phase === premierePhaseRef.current;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueComposerFonctions(exercice, etat.phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Composer f et g</h1>
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>
      <SelecteurVarianteDev options={OPTIONS_COMPOSITION} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={recapitulatif} />
          {etat.phase.startsWith("formule") && (
            <EtapeFormuleComposerFonctions
              key={etat.phase}
              consigne={consigneFormule(dir)}
              donnees={donnees}
              placeholder={PLACEHOLDER_FORMULE}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX_COMPOSER_FONCTIONS}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              texteAideNiveau1={texteAideFormuleNiveau1(dir)}
              latexAideNiveau2={etat.niveauAide >= 2 ? latexAideFormuleNiveau2(dir) : null}
              onValider={(texte) => terminerEtape(soumettreReponseFormule(etat, texte))}
              diagnostiquer={(texte) => diagnostiquerFormuleDirectionSimplifiee(dir, texte)}
              validation={validation}
              estPremierEcran={estPremierEcran}
            />
          )}
          {etat.phase.startsWith("conditions") && (
            <EtapeConditionsComposerFonctions
              key={etat.phase}
              dir={dir}
              consigne={consigneConditions(dir)}
              donnees={donnees}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX_COMPOSER_FONCTIONS}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              texteAideNiveau1={texteAideConditionsNiveau1(dir)}
              latexAideNiveau2={etat.niveauAide >= 2 ? latexAideConditionsNiveau2(dir) : null}
              onValider={(reponse) => terminerEtape(soumettreReponseConditions(etat, reponse))}
              validation={validation}
              estPremierEcran={estPremierEcran}
            />
          )}
          {etat.phase.startsWith("c1") && (
            <EtapeDomaineComposerFonctions
              key={etat.phase}
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
              latexAideNiveau2={etat.niveauAide >= 2 ? latexAideC1Niveau2(dir) : null}
              onValider={(reponse) => terminerEtape(soumettreReponseC1(etat, reponse))}
              validation={validation}
              estPremierEcran={estPremierEcran}
            />
          )}
          {etat.phase.startsWith("c2") && (
            <EtapeDomaineComposerFonctions
              key={etat.phase}
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
              latexAideNiveau2={etat.niveauAide >= 2 ? latexAideC2Niveau2(dir) : null}
              onValider={(reponse) => terminerEtape(soumettreReponseC2(etat, reponse))}
              validation={validation}
              estPremierEcran={estPremierEcran}
            />
          )}
          {etat.phase.startsWith("domaine") && (
            <EtapeDomaineComposerFonctions
              key={etat.phase}
              consigne={consigneDomaine(dir)}
              donnees={donnees}
              prefixApercu={`\\text{dom}(${estPhaseFRondG(etat.phase) ? "f\\circ g" : "g\\circ f"}) =`}
              attendu={dir.domaine}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX_COMPOSER_FONCTIONS}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              texteAideNiveau1={texteAideDomaineNiveau1(dir)}
              latexAideNiveau2={etat.niveauAide >= 2 ? latexAideDomaineNiveau2(dir) : null}
              onValider={(reponse) => terminerEtape(soumettreReponseDomaine(etat, reponse))}
              validation={validation}
              estPremierEcran={estPremierEcran}
            />
          )}
        </div>
      </main>
    </div>
  );
}
