import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceInequationLogarithmique } from "./generateurs6e/inequationsLogarithmiques";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionInequationLogarithmique,
  soumettreReponseACE,
  soumettreReponseAResoudre,
  soumettreReponseBCE,
  soumettreReponseBResoudre,
  soumettreReponseCCE,
  soumettreReponseCCombiner,
  soumettreReponseCComparer,
  soumettreReponseDCE,
  soumettreReponseDConvertirX,
  soumettreReponseDReecrire,
  soumettreReponseDResoudreY,
  soumettreReponseEReconnaitre,
  soumettreReponseFCE,
  soumettreReponseFConclure,
  soumettreReponseFSimplifier,
} from "./moteur6e/sessionInequationsLogarithmiques";
import type { EtatSessionInequationLogarithmique, PhaseInequationLogarithmique, ResultatExerciceInequationLogarithmique } from "./moteur6e/typesInequationsLogarithmiques";
import { EtapeChampSimpleIneqLog } from "./components6e/EtapeChampSimpleIneqLog";
import { EtapeChoixDeuxIneqLog } from "./components6e/EtapeChoixDeuxIneqLog";
import { EtapeDeuxCasIneqLog } from "./components6e/EtapeDeuxCasIneqLog";
import { EtapeIntervalleIneqLog } from "./components6e/EtapeIntervalleIneqLog";
import { ResultatPanelInequationLogarithmique } from "./components6e/ResultatPanelInequationLogarithmique";
import { ResumeSessionInequationLogarithmique } from "./components6e/ResumeSessionInequationLogarithmique";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1, aideNiveau2, consigneEcran, etatActuel, formatEnonceLatex } from "./ui6e/formatInequationsLogarithmiques";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionInequationLogarithmique {
  return demarrerSessionInequationLogarithmique(REGLAGES_DEMO, genererExerciceInequationLogarithmique);
}

type AideParPhase = Partial<Record<PhaseInequationLogarithmique, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceInequationLogarithmique;
  aideParPhase: AideParPhase;
}


export function App6gen15() {
  const [etat, setEtat] = useState<EtatSessionInequationLogarithmique>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionInequationLogarithmique) {
    // `niveauAide` capturé AVANT la transition de phase suivante (qui le remet à zéro) — voir
    // CLAUDE.md, pattern `terminerEtape`/`aideParPhase`. `revele` lu sur `nouvelEtat.derniereRevelee`
    // (jamais `etat.etapeCourante.revelee`, qui reste TOUJOURS `false` à cet instant).
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
    setEtat(demarrerSessionInequationLogarithmique(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const enonceLatex = formatEnonceLatex(exercice);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const aide1 = aideNiveau1(phase, exercice);
  const aide2 = aideNiveau2(phase, exercice);
  const consigne = consigneEcran(phase, exercice);
  const etatAct = etatActuel(phase, exercice);
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Résoudre une inéquation logarithmique</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <>
            {phase === "aCE" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseACE(etat, reponse))}
              />
            )}
            {phase === "aResoudre" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseAResoudre(etat, reponse))}
              />
            )}

            {phase === "bCE" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseBCE(etat, reponse))}
              />
            )}
            {phase === "bResoudre" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseBResoudre(etat, reponse))}
              />
            )}

            {phase === "cCE" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseCCE(etat, reponse))}
              />
            )}
            {phase === "cCombiner" && (
              <EtapeChampSimpleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : (x+1)*(x-3)  ou  (x+1)/(x-3)"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(texte) => terminerEtape(soumettreReponseCCombiner(etat, texte))}
              />
            )}
            {phase === "cComparer" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseCComparer(etat, reponse))}
              />
            )}

            {phase === "dCE" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseDCE(etat, reponse))}
              />
            )}
            {phase === "dReecrire" && (
              <EtapeChampSimpleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : y^2-y-2<0"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(texte) => terminerEtape(soumettreReponseDReecrire(etat, texte))}
              />
            )}
            {phase === "dResoudreY" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseDResoudreY(etat, reponse))}
              />
            )}
            {phase === "dConvertirX" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseDConvertirX(etat, reponse))}
              />
            )}

            {phase === "eReconnaitre" && (
              <EtapeChoixDeuxIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                optionGauche={{ id: "vide", label: "∅ — CE incompatible, aucune solution" }}
                optionDroite={{ id: "possible", label: "La CE est satisfiable" }}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(id) => terminerEtape(soumettreReponseEReconnaitre(etat, id === "vide"))}
              />
            )}

            {phase === "fCE" && (
              <EtapeIntervalleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseFCE(etat, reponse))}
              />
            )}
            {phase === "fSimplifier" && (
              <EtapeChampSimpleIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : (x-3)^2"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(texte) => terminerEtape(soumettreReponseFSimplifier(etat, texte))}
              />
            )}
            {phase === "fConclure" && (
              <EtapeDeuxCasIneqLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) => terminerEtape(soumettreReponseFConclure(etat, reponse))}
              />
            )}
          </>
        )}
        {dernierBilan && (
          <ResultatPanelInequationLogarithmique resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />
        )}
        {etat.terminee && !dernierBilan && <ResumeSessionInequationLogarithmique resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
