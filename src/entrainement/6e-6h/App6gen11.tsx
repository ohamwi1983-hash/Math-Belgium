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
import type {
  EtatSessionEtudeFonctionExponentielle,
  PhaseEtudeFonctionExponentielle,
  ResultatExerciceEtudeFonctionExponentielle,
} from "./moteur6e/typesEtudeFonctionExponentielle";
import { EtapeAsymptotesB } from "./components6e/EtapeAsymptotesB";
import { EtapeAsymptotesDeux } from "./components6e/EtapeAsymptotesDeux";
import { EtapeConcavite } from "./components6e/EtapeConcavite";
import { EtapeCroissance } from "./components6e/EtapeCroissance";
import { EtapeDomaineEtudeFonction } from "./components6e/EtapeDomaineEtudeFonction";
import { EtapeLimitesDeux } from "./components6e/EtapeLimitesDeux";
import { EtapeLimitesQuatre } from "./components6e/EtapeLimitesQuatre";
import { EtapeSelectionGraphiqueEtudeFonction } from "./components6e/EtapeSelectionGraphiqueEtudeFonction";
import { ResultatPanelEtudeFonctionExponentielle } from "./components6e/ResultatPanelEtudeFonctionExponentielle";
import { ResumeSessionEtudeFonctionExponentielle } from "./components6e/ResumeSessionEtudeFonctionExponentielle";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
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
  directionLabels,
  etatActuel,
  formatFonctionLatex,
} from "./ui6e/formatEtudeFonctionExponentielle";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionEtudeFonctionExponentielle {
  return demarrerSessionEtudeFonctionExponentielle(REGLAGES_DEMO, genererExerciceEtudeFonctionExponentielle);
}

type AideParPhase = Partial<Record<PhaseEtudeFonctionExponentielle, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceEtudeFonctionExponentielle;
  aideParPhase: AideParPhase;
}

export function App6gen11() {
  const [etat, setEtat] = useState<EtatSessionEtudeFonctionExponentielle>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionEtudeFonctionExponentielle) {
    // `niveauAide` capturé AVANT la transition de phase suivante (qui le remet à zéro) — voir
    // CLAUDE.md, pattern `terminerEtape`/`aideParPhase`. `revele` lu sur `nouvelEtat.derniereRevelee`
    // (jamais `etat.etapeCourante.revelee`, qui reste TOUJOURS `false` à cet instant — la révélation
    // n'est observable QUE dans l'état retourné par `soumettreReponseXxx`, voir sa doc dans
    // `moteur6e/typesEtudeFonctionExponentielle.ts`).
    const miseAJour = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereRevelee } };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], aideParPhase: miseAJour });
      setAideParPhase({});
    } else {
      setAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  function forcerVariante(id: string) {
    setDernierBilan(null);
    setAideParPhase({});
    setEtat(
      demarrerSessionEtudeFonctionExponentielle(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])),
    );
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Étudier une fonction exponentielle (synthèse)</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
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
                />
              )}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelEtudeFonctionExponentielle
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionEtudeFonctionExponentielle resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
