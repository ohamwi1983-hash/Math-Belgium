import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDomaineDeriveeLogarithme } from "./generateurs6e/domaineDeriveeLogarithme";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionDomaineDeriveeLogarithme,
  soumettreReponseADerivee,
  soumettreReponseBDerivee,
  soumettreReponseCAssemblage,
  soumettreReponseCFacteurs,
  soumettreReponseDAssemblage,
  soumettreReponseDND,
  soumettreReponseDomaine,
  soumettreReponseEDerivee,
  soumettreReponseESimplifier,
  soumettreReponseFDerivee,
  soumettreReponseGFPrimeSurF,
  soumettreReponseGIdentifier,
  soumettreReponseGIsoler,
} from "./moteur6e/sessionDomaineDeriveeLogarithme";
import type { EtatSessionDomaineDeriveeLogarithme, PhaseDomaineDeriveeLogarithme, ResultatExerciceDomaineDeriveeLogarithme } from "./moteur6e/typesDomaineDeriveeLogarithme";
import type { ReponseDeuxChamps } from "./moteur6e/verificationDomaineDeriveeLogarithme";
import {
  diagnostiquerADerivee,
  diagnostiquerBDerivee,
  diagnostiquerCAssemblage,
  diagnostiquerCFacteurs,
  diagnostiquerDAssemblage,
  diagnostiquerDND,
  diagnostiquerEDerivee,
  diagnostiquerESimplifier,
  diagnostiquerFDerivee,
  diagnostiquerGFPrimeSurF,
  diagnostiquerGIdentifier,
  diagnostiquerGIsoler,
} from "./moteur6e/verificationDomaineDeriveeLogarithme";
import { EtapeChampDomaineDeriveeLog } from "./components6e/EtapeChampDomaineDeriveeLog";
import { EtapeDeuxChampsDomaineDeriveeLog } from "./components6e/EtapeDeuxChampsDomaineDeriveeLog";
import { EtapeDomaineDomaineDeriveeLog } from "./components6e/EtapeDomaineDomaineDeriveeLog";
import { ResultatPanelDomaineDeriveeLogarithme } from "./components6e/ResultatPanelDomaineDeriveeLogarithme";
import { ResumeSessionDomaineDeriveeLogarithme } from "./components6e/ResumeSessionDomaineDeriveeLogarithme";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1, aideNiveau2, blocDonnees, consigneEcran, consigneGenerale, etatActuel, labelsDeuxChamps } from "./ui6e/formatDomaineDeriveeLogarithme";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionDomaineDeriveeLogarithme {
  return demarrerSessionDomaineDeriveeLogarithme(REGLAGES_DEMO, genererExerciceDomaineDeriveeLogarithme);
}

interface Bilan {
  resultat: ResultatExerciceDomaineDeriveeLogarithme;
}


const PHASES_DOMAINE = new Set<PhaseDomaineDeriveeLogarithme>(["aDomaine", "bDomaine", "cDomaine", "dDomaine", "eDomaine", "fDomaine"]);
const PHASES_DEUX_CHAMPS = new Set<PhaseDomaineDeriveeLogarithme>(["cFacteurs", "dND"]);

const PLACEHOLDERS: Partial<Record<PhaseDomaineDeriveeLogarithme, string>> = {
  aDerivee: "ex : (ln(2)*2^x)/(2^x*ln(3))",
  bDerivee: "ex : -x/((1-x^2)*ln(2))",
  cAssemblage: "ex : 3*ln(x)+(3*x)*(1/x)",
  dAssemblage: "ex : ((1/x)*(2*x)-ln(x)*2)/(2*x)^2",
  eSimplifier: "ex : 0.5*ln(x)",
  eDerivee: "ex : 1/(2*x)",
  fDerivee: "ex : 2/sqrt(1-(2*x)^2)",
  gIdentifier: "ex : x^x",
  gFPrimeSurF: "ex : ln(x)+1",
  gIsoler: "ex : x^x*(ln(x)+1)",
};

export function App6gen16() {
  const [etat, setEtat] = useState<EtatSessionDomaineDeriveeLogarithme>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionDomaineDeriveeLogarithme) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1] });
    }
    setEtat(nouvelEtat);
  }

  function forcerVariante(id: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionDomaineDeriveeLogarithme(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const consigneG = consigneGenerale(exercice);
  const donnees = blocDonnees(exercice);
  const etatAct = etatActuel(exercice, phase);
  const consigne = consigneEcran(exercice, phase);
  const labels = labelsDeuxChamps(exercice);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const aide1 = aideNiveau1(exercice, phase);
  const aide2 = aideNiveau2(exercice, phase);

  function diagnostiquerChampUnique(texte: string) {
    switch (phase) {
      case "aDerivee":
        return exercice.famille === "A" ? diagnostiquerADerivee(exercice, texte) : "parse_error";
      case "bDerivee":
        return exercice.famille === "B" ? diagnostiquerBDerivee(exercice, texte) : "parse_error";
      case "cAssemblage":
        return exercice.famille === "C" ? diagnostiquerCAssemblage(exercice, texte) : "parse_error";
      case "dAssemblage":
        return exercice.famille === "D" ? diagnostiquerDAssemblage(exercice, texte) : "parse_error";
      case "eSimplifier":
        return exercice.famille === "E" ? diagnostiquerESimplifier(exercice, texte) : "parse_error";
      case "eDerivee":
        return exercice.famille === "E" ? diagnostiquerEDerivee(exercice, texte) : "parse_error";
      case "fDerivee":
        return exercice.famille === "F" ? diagnostiquerFDerivee(exercice, texte) : "parse_error";
      case "gIdentifier":
        return exercice.famille === "G" ? diagnostiquerGIdentifier(exercice, texte) : "parse_error";
      case "gFPrimeSurF":
        return exercice.famille === "G" ? diagnostiquerGFPrimeSurF(exercice, texte) : "parse_error";
      case "gIsoler":
        return exercice.famille === "G" ? diagnostiquerGIsoler(exercice, texte) : "parse_error";
      default:
        return "parse_error" as const;
    }
  }

  function diagnostiquerDeuxChamps(reponse: ReponseDeuxChamps) {
    if (phase === "cFacteurs" && exercice.famille === "C") return diagnostiquerCFacteurs(exercice, reponse);
    if (phase === "dND" && exercice.famille === "D") return diagnostiquerDND(exercice, reponse);
    return "parse_error" as const;
  }

  function onValiderChampUnique(texte: string) {
    if (phase === "aDerivee") return terminerEtape(soumettreReponseADerivee(etat, texte));
    if (phase === "bDerivee") return terminerEtape(soumettreReponseBDerivee(etat, texte));
    if (phase === "cAssemblage") return terminerEtape(soumettreReponseCAssemblage(etat, texte));
    if (phase === "dAssemblage") return terminerEtape(soumettreReponseDAssemblage(etat, texte));
    if (phase === "eSimplifier") return terminerEtape(soumettreReponseESimplifier(etat, texte));
    if (phase === "eDerivee") return terminerEtape(soumettreReponseEDerivee(etat, texte));
    if (phase === "fDerivee") return terminerEtape(soumettreReponseFDerivee(etat, texte));
    if (phase === "gIdentifier") return terminerEtape(soumettreReponseGIdentifier(etat, texte));
    if (phase === "gFPrimeSurF") return terminerEtape(soumettreReponseGFPrimeSurF(etat, texte));
    return terminerEtape(soumettreReponseGIsoler(etat, texte));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Domaine, dérivée et dérivation logarithmique</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <>
            {PHASES_DOMAINE.has(phase) && (
              <EtapeDomaineDomaineDeriveeLog
                key={phase}
                consigneGenerale={consigneG}
                blocDonnees={donnees}
                consigneEcran={consigne}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(reponse) => terminerEtape(soumettreReponseDomaine(etat, reponse))}
              />
            )}

            {PHASES_DEUX_CHAMPS.has(phase) && (
              <EtapeDeuxChampsDomaineDeriveeLog
                key={phase}
                consigneGenerale={consigneG}
                blocDonnees={donnees}
                etatActuel={etatAct}
                consigneEcran={consigne}
                labelA={labels.a}
                labelB={labels.b}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(reponse) => terminerEtape(phase === "cFacteurs" ? soumettreReponseCFacteurs(etat, reponse) : soumettreReponseDND(etat, reponse))}
                diagnostiquer={diagnostiquerDeuxChamps}
              />
            )}

            {!PHASES_DOMAINE.has(phase) && !PHASES_DEUX_CHAMPS.has(phase) && (
              <EtapeChampDomaineDeriveeLog
                key={phase}
                consigneGenerale={consigneG}
                blocDonnees={donnees}
                etatActuel={etatAct}
                consigneEcran={consigne}
                placeholder={PLACEHOLDERS[phase] ?? "ex : ln(x)+1"}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={onValiderChampUnique}
                diagnostiquer={diagnostiquerChampUnique}
              />
            )}
          </>
        )}
        {dernierBilan && <ResultatPanelDomaineDeriveeLogarithme resultat={dernierBilan.resultat} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionDomaineDeriveeLogarithme resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
