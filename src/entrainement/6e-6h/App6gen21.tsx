import { useEffect, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEtudeFonctionLogarithme } from "./generateurs6e/etudeFonctionLogarithme";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionEtudeFonctionLogarithme,
  soumettreReponseAsymptotes,
  soumettreReponseComportementInfini,
  soumettreReponseConcavite,
  soumettreReponseCroissance,
  soumettreReponseDomaine,
  soumettreReponseGraphique,
  soumettreReponseLimites,
} from "./moteur6e/sessionEtudeFonctionLogarithme";
import type { EtatSessionEtudeFonctionLogarithme } from "./moteur6e/typesEtudeFonctionLogarithme";
import { EtapeAsymptotesMultiLog } from "./components6e/EtapeAsymptotesMultiLog";
import { EtapeComportementInfiniE } from "./components6e/EtapeComportementInfiniE";
import { EtapeConcaviteLog } from "./components6e/EtapeConcaviteLog";
import { EtapeCroissanceGrilleCLog } from "./components6e/EtapeCroissanceGrilleCLog";
import { EtapeCroissanceStandardLog } from "./components6e/EtapeCroissanceStandardLog";
import { EtapeDomaineEtudeFonctionLog } from "./components6e/EtapeDomaineEtudeFonctionLog";
import { EtapeLimitesMultiLog } from "./components6e/EtapeLimitesMultiLog";
import { EtapeSelectionGraphiqueEtudeFonctionLog } from "./components6e/EtapeSelectionGraphiqueEtudeFonctionLog";
import { ResultatPanelEtudeFonctionLogarithme } from "./components6e/ResultatPanelEtudeFonctionLogarithme";
import { ResumeSessionEtudeFonctionLogarithme } from "./components6e/ResumeSessionEtudeFonctionLogarithme";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  aideAsymptotesNiveau1,
  aideAsymptotesNiveau2,
  aideComportementInfiniNiveau1,
  aideComportementInfiniNiveau2,
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
  consigneCroissance,
  consigneDomaine,
  consigneLimites,
  directionLabelsAsymptotes,
  directionLabelsLimites,
  etatActuel,
  formatFonctionLatex,
} from "./ui6e/formatEtudeFonctionLogarithme";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionEtudeFonctionLogarithme {
  return demarrerSessionEtudeFonctionLogarithme(REGLAGES_DEMO, genererExerciceEtudeFonctionLogarithme);
}


/** `forcerPresence` de l'écran asymptotes, par famille (voir `core6e/etudeFonctionLogarithme.types.ts`
 * pour la justification : B et C ont toujours une asymptote dans chaque direction listée, A et D
 * laissent l'élève choisir). */
function forcerPresenceAsymptotes(famille: "A" | "B" | "C" | "D"): boolean[] {
  if (famille === "B") return [true];
  if (famille === "C") return [true, true];
  return [false, false];
}

export function App6gen21() {
  const [etat, setEtat] = useState<EtatSessionEtudeFonctionLogarithme>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<EtatSessionEtudeFonctionLogarithme["resultats"][number] | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionEtudeFonctionLogarithme) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan(nouvelEtat.resultats[nouvelEtat.resultats.length - 1]);
    }
    setEtat(nouvelEtat);
  }

  function forcerVariante(id: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionEtudeFonctionLogarithme(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const enonceLatex = formatFonctionLatex(exercice);
  const onActiverAide = () => setEtat(activerAideSuivante(etat));
  // Inclut `indexExercice` dans la clé — la phase seule peut rester identique entre 2 exercices
  // consécutifs, ce qui empêcherait React de remonter le composant (leçon retenue à de nombreuses
  // reprises sur ce chantier, voir CLAUDE.md).
  const cle = `${etat.indexExercice}-${etat.phase}`;

  // Hook de debug pour vérification Playwright — jamais destiné aux élèves, ne sert qu'à inspecter
  // l'exercice/la phase courants depuis un script externe (même principe que `?dev=1`).
  useEffect(() => {
    (window as unknown as { __debug6gen21?: unknown }).__debug6gen21 = { exercice, phase: etat.phase };
  }, [exercice, etat.phase]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Étudier une fonction (synthèse, logarithmes)</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <>
            {etat.phase === "domaine" && (
              <EtapeDomaineEtudeFonctionLog
                key={cle}
                enonceLatex={enonceLatex}
                consigneEcran={consigneDomaine(exercice)}
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

            {etat.phase === "limites" && exercice.famille !== "E" && (
              <EtapeLimitesMultiLog
                key={cle}
                enonceLatex={enonceLatex}
                consigneEcran={consigneLimites(exercice)}
                etatActuel={etatActuel("limites", exercice) ?? []}
                labels={directionLabelsLimites(exercice)}
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

            {etat.phase === "asymptotes" && exercice.famille !== "E" && (
              <EtapeAsymptotesMultiLog
                key={cle}
                enonceLatex={enonceLatex}
                consigneEcran={consigneAsymptotes(exercice)}
                etatActuel={etatActuel("asymptotes", exercice) ?? []}
                labels={directionLabelsAsymptotes(exercice)}
                forcerPresence={forcerPresenceAsymptotes(exercice.famille)}
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

            {etat.phase === "croissance" && exercice.famille === "C" && (
              <EtapeCroissanceGrilleCLog
                key={cle}
                enonceLatex={enonceLatex}
                consigneEcran={consigneCroissance(exercice)}
                etatActuel={etatActuel("croissance", exercice) ?? []}
                k={exercice.k}
                aideNiveau1={aideCroissanceNiveau1(exercice)}
                aideNiveau2={aideCroissanceNiveau2(exercice)}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseCroissance(etat, { type: "grilleC", reponse }))}
              />
            )}
            {etat.phase === "croissance" && (exercice.famille === "A" || exercice.famille === "B" || exercice.famille === "D") && (
              <EtapeCroissanceStandardLog
                key={cle}
                enonceLatex={enonceLatex}
                consigneEcran={consigneCroissance(exercice)}
                etatActuel={etatActuel("croissance", exercice) ?? []}
                aideNiveau1={aideCroissanceNiveau1(exercice)}
                aideNiveau2={aideCroissanceNiveau2(exercice)}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseCroissance(etat, { type: "standard", reponse }))}
              />
            )}

            {etat.phase === "concavite" && exercice.famille !== "E" && (
              <EtapeConcaviteLog
                key={cle}
                enonceLatex={enonceLatex}
                etatActuel={etatActuel("concavite", exercice) ?? []}
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

            {etat.phase === "graphique" && exercice.famille !== "E" && (
              <EtapeSelectionGraphiqueEtudeFonctionLog
                key={cle}
                exercice={exercice}
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

            {etat.phase === "comportementInfini" && exercice.famille === "E" && (
              <EtapeComportementInfiniE
                key={cle}
                enonceLatex={enonceLatex}
                etatActuel={etatActuel("comportementInfini", exercice) ?? []}
                aideNiveau1={aideComportementInfiniNiveau1()}
                aideNiveau2={aideComportementInfiniNiveau2(exercice)}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseComportementInfini(etat, reponse))}
              />
            )}
          </>
        )}
        {dernierBilan && <ResultatPanelEtudeFonctionLogarithme resultat={dernierBilan} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionEtudeFonctionLogarithme resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
