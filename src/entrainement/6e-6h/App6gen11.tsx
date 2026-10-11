import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEtudeFonctionExponentielle } from "./generateurs6e/etudeFonctionExponentielle";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionEtudeFonctionExponentielle,
  soumettreReponseAsymptotes,
  soumettreReponseConcavite,
  soumettreReponseCroissance,
  soumettreReponseDomaine,
  soumettreReponseGraphique,
  soumettreReponseLimites,
} from "./moteur6e/sessionEtudeFonctionExponentielle";
import type { EtatSessionEtudeFonctionExponentielle } from "./moteur6e/typesEtudeFonctionExponentielle";
import { EtapeAsymptotesB } from "./components6e/EtapeAsymptotesB";
import { EtapeAsymptotesDeux } from "./components6e/EtapeAsymptotesDeux";
import { EtapeConcavite } from "./components6e/EtapeConcavite";
import { EtapeCroissance } from "./components6e/EtapeCroissance";
import { EtapeDomaineEtudeFonction } from "./components6e/EtapeDomaineEtudeFonction";
import { EtapeLimitesDeux } from "./components6e/EtapeLimitesDeux";
import { EtapeLimitesQuatre } from "./components6e/EtapeLimitesQuatre";
import { EtapeSelectionGraphiqueEtudeFonction } from "./components6e/EtapeSelectionGraphiqueEtudeFonction";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import {
  aideAsymptotesBNiveau1,
  aideAsymptotesBNiveau2,
  aideAsymptotesNiveau1,
  aideAsymptotesNiveau2,
  aideConcaviteNiveau1,
  aideConcaviteNiveau2,
  aideCroissanceNiveau1,
  aideCroissanceNiveau2,
  aideDomaineNiveau1,
  aideDomaineNiveau2,
  aideGraphiqueNiveau1,
  aideGraphiqueNiveau2,
  aideLimitesNiveau1,
  aideLimitesNiveau2,
  consigneAsymptotes,
  consigneLimites,
  contenuRecapPhase,
  directionLabels,
  etatActuel,
  formatFonctionLatex,
} from "./ui6e/formatEtudeFonctionExponentielle";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionEtudeFonctionExponentielle {
  return demarrerSessionEtudeFonctionExponentielle(REGLAGES_DEMO, genererExerciceEtudeFonctionExponentielle);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEtudeFonctionExponentielle;
  revele: boolean;
}

export function App6gen11() {
  const [etat, setEtat] = useState<EtatSessionEtudeFonctionExponentielle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionEtudeFonctionExponentielle) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereRevelee });
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
    setEtat(
      demarrerSessionEtudeFonctionExponentielle(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])),
    );
  }

  const exercice = etat.exerciceCourant;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen3.tsx` et la plupart des générateurs 6e récents.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen11?: unknown }).__debug6gen11 = { exercice, phase: etat.phase };
  }

  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const enonceLatex = formatFonctionLatex(exercice);
  const onActiverAide = () => setEtat(activerAideSuivante(etat));
  // Inclut `indexExercice` dans la clé — la phase seule peut rester identique entre 2 exercices
  // consécutifs, ce qui empêcherait React de remonter le composant et laisserait la saisie/
  // sélection de l'exercice précédent persister visuellement (leçon retenue à de nombreuses
  // reprises sur ce chantier — voir CLAUDE.md, "5gen6/5gen7", "6gen8").
  const cle = `${etat.indexExercice}-${etat.phase}`;

  const contenuRecap = contenuRecapPhase(exercice, etat.phase);
  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: contenuRecap.latex !== null ? <Katex expression={contenuRecap.latex} /> : contenuRecap.texte,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Étudier une fonction exponentielle (synthèse)</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <div className="card-body">
          {etat.phase === "domaine" && (
                <EtapeDomaineEtudeFonction
                  key={cle}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aideDomaineNiveau1(exercice)}
                  aideNiveau2={aideDomaineNiveau2(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseDomaine(etat, reponse))}
                  validation={validation}
                />
              )}

              {etat.phase === "limites" && exercice.famille === "B" && (
                <EtapeLimitesQuatre
                  key={cle}
                  enonceLatex={enonceLatex}
                  consigneEcran={consigneLimites(exercice)}
                  labels={directionLabels(exercice)}
                  etatActuel={etatActuel(exercice, etat.phase)}
                  aideNiveau1={aideLimitesNiveau1(exercice)}
                  aideNiveau2={aideLimitesNiveau2(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseLimites(etat, reponse))}
                  validation={validation}
                />
              )}
              {etat.phase === "limites" && exercice.famille !== "B" && (
                <EtapeLimitesDeux
                  key={cle}
                  enonceLatex={enonceLatex}
                  consigneEcran={consigneLimites(exercice)}
                  labels={directionLabels(exercice)}
                  etatActuel={etatActuel(exercice, etat.phase)}
                  aideNiveau1={aideLimitesNiveau1(exercice)}
                  aideNiveau2={aideLimitesNiveau2(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseLimites(etat, reponse))}
                  validation={validation}
                />
              )}

              {etat.phase === "asymptotes" && exercice.famille === "B" && (
                <EtapeAsymptotesB
                  key={cle}
                  enonceLatex={enonceLatex}
                  p={exercice.p}
                  etatActuel={etatActuel(exercice, etat.phase)}
                  aideNiveau1={aideAsymptotesBNiveau1()}
                  aideNiveau2={aideAsymptotesBNiveau2(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseAsymptotes(etat, reponse))}
                  validation={validation}
                />
              )}
              {etat.phase === "asymptotes" && exercice.famille !== "B" && (
                <EtapeAsymptotesDeux
                  key={cle}
                  enonceLatex={enonceLatex}
                  consigneEcran={consigneAsymptotes(exercice)}
                  labels={directionLabels(exercice)}
                  etatActuel={etatActuel(exercice, etat.phase)}
                  aideNiveau1={aideAsymptotesNiveau1(exercice)}
                  aideNiveau2={aideAsymptotesNiveau2(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseAsymptotes(etat, reponse))}
                  validation={validation}
                />
              )}

              {etat.phase === "croissance" && (
                <EtapeCroissance
                  key={cle}
                  enonceLatex={enonceLatex}
                  etatActuel={etatActuel(exercice, etat.phase)}
                  aideNiveau1={aideCroissanceNiveau1(exercice)}
                  aideNiveau2={aideCroissanceNiveau2(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseCroissance(etat, reponse))}
                  validation={validation}
                />
              )}

              {etat.phase === "concavite" && (
                <EtapeConcavite
                  key={cle}
                  enonceLatex={enonceLatex}
                  etatActuel={etatActuel(exercice, etat.phase)}
                  aideNiveau1={aideConcaviteNiveau1(exercice)}
                  aideNiveau2={aideConcaviteNiveau2(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(reponse) => terminerEtape(soumettreReponseConcavite(etat, reponse))}
                  validation={validation}
                />
              )}

              {etat.phase === "graphique" && (
                <EtapeSelectionGraphiqueEtudeFonction
                  key={cle}
                  exercice={exercice}
                  etatActuel={etatActuel(exercice, etat.phase)}
                  aideNiveau1={aideGraphiqueNiveau1(exercice)}
                  aideNiveau2={aideGraphiqueNiveau2(exercice)}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={onActiverAide}
                  onValider={(index) => terminerEtape(soumettreReponseGraphique(etat, index))}
                  validation={validation}
                />
              )}
        </div>
      </main>
    </div>
  );
}
