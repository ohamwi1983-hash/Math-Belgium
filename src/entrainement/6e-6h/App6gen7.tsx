import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import {
  CATALOGUE_FAMILLES,
  construireAvecFamilleId,
  genererExerciceDomaineDeriveeExponentielle,
} from "./generateurs6e/domaineDeriveeExponentielles";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionDomaineDeriveeExponentielle,
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
} from "./moteur6e/sessionDomaineDeriveeExponentielles";
import type {
  EtatSessionDomaineDeriveeExponentielle,
  ResultatExerciceDomaineDeriveeExponentielle,
} from "./moteur6e/typesDomaineDeriveeExponentielles";
import { EtapeChampDomaineDerivee } from "./components6e/EtapeChampDomaineDerivee";
import { EtapeDeuxChampsDomaineDerivee } from "./components6e/EtapeDeuxChampsDomaineDerivee";
import { EtapeDomaineDomaineDerivee } from "./components6e/EtapeDomaineDomaineDerivee";
import { ResultatPanelDomaineDeriveeExponentielle } from "./components6e/ResultatPanelDomaineDeriveeExponentielle";
import { ResumeSessionDomaineDeriveeExponentielle } from "./components6e/ResumeSessionDomaineDeriveeExponentielle";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  aideNiveau1,
  aideNiveau2,
  consigneEcran,
  etatActuel as calculerEtatActuel,
  formatFonctionLatex,
  labelsDeuxChamps,
} from "./ui6e/formatDomaineDeriveeExponentielles";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionDomaineDeriveeExponentielle {
  return demarrerSessionDomaineDeriveeExponentielle(REGLAGES_DEMO, genererExerciceDomaineDeriveeExponentielle);
}

interface Bilan {
  resultat: ResultatExerciceDomaineDeriveeExponentielle;
}

export function App6gen7() {
  const [etat, setEtat] = useState<EtatSessionDomaineDeriveeExponentielle>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionDomaineDeriveeExponentielle) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1] });
    }
    setEtat(nouvelEtat);
  }

  function forcerVariante(id: string) {
    setDernierBilan(null);
    setEtat(
      demarrerSessionDomaineDeriveeExponentielle(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])),
    );
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const enonceLatex = formatFonctionLatex(exercice);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const aide1 = aideNiveau1(phase, exercice);
  const aide2 = aideNiveau2(phase, exercice);
  const consigne = consigneEcran(phase, exercice);
  const labels = labelsDeuxChamps(exercice);
  const etatActuelEcran = calculerEtatActuel(exercice, phase);

  // Panneau dev — expose l'exercice/la phase courants pour la vérification Playwright (même
  // principe que les autres générateurs 6e, ex. `App6gen23.tsx`).
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen7?: unknown }).__debug6gen7 = { exercice, phase };
  }

  const phasesDomaine = new Set(["aDomaine", "bDomaine", "cDomaine", "dDomaine", "eDomaine", "fDomaine"]);
  const phasesDeuxChamps = new Set(["cFacteurs", "dND"]);
  const phasesChampUnique = new Set(["aDerivee", "bDerivee", "cAssemblage", "dAssemblage", "eSimplifier", "eDerivee", "fDerivee"]);

  const PLACEHOLDERS: Record<string, string> = {
    aDerivee: "ex : 2*x*3^(x^2)*ln(3)",
    bDerivee: "ex : ln(2)*2^sqrt(x^2-4)*(x/sqrt(x^2-4))",
    cAssemblage: "ex : (3*x^2-4*x)*e^(x^3-2*x^2)*(1+x^3-2*x^2)",
    dAssemblage: "ex : (ln(2)*2^x*x-(2^x+1))/x^2",
    eSimplifier: "ex : 1-2^(-x)",
    eDerivee: "ex : ln(2)*2^(-x)",
    fDerivee: "ex : -sin(e^(x^2-2))*2*x*e^(x^2-2)",
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Domaine et dérivée de fonctions exponentielles</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              {phasesDomaine.has(phase) && (
                <EtapeDomaineDomaineDerivee
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatActuelEcran}
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

              {phasesDeuxChamps.has(phase) && (
                <EtapeDeuxChampsDomaineDerivee
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatActuelEcran}
                  labelA={labels.a}
                  labelB={labels.b}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) =>
                    terminerEtape(phase === "cFacteurs" ? soumettreReponseCFacteurs(etat, reponse) : soumettreReponseDND(etat, reponse))
                  }
                />
              )}

              {phasesChampUnique.has(phase) && (
                <EtapeChampDomaineDerivee
                  key={phase}
                  consigneEcran={consigne}
                  enonceLatex={enonceLatex}
                  etatActuel={etatActuelEcran}
                  placeholder={PLACEHOLDERS[phase] ?? "ex : 2*x*3^(x^2)*ln(3)"}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => {
                    if (phase === "aDerivee") return terminerEtape(soumettreReponseADerivee(etat, texte));
                    if (phase === "bDerivee") return terminerEtape(soumettreReponseBDerivee(etat, texte));
                    if (phase === "cAssemblage") return terminerEtape(soumettreReponseCAssemblage(etat, texte));
                    if (phase === "dAssemblage") return terminerEtape(soumettreReponseDAssemblage(etat, texte));
                    if (phase === "eSimplifier") return terminerEtape(soumettreReponseESimplifier(etat, texte));
                    if (phase === "eDerivee") return terminerEtape(soumettreReponseEDerivee(etat, texte));
                    return terminerEtape(soumettreReponseFDerivee(etat, texte));
                  }}
                />
              )}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelDomaineDeriveeExponentielle
              resultat={dernierBilan.resultat}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionDomaineDeriveeExponentielle resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
