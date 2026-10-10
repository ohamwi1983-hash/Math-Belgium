import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceHyperboliques } from "./generateurs6e/hyperboliques";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionHyperboliques,
  soumettreReponseAParite,
  soumettreReponseBIsoler,
  soumettreReponseBValeurs,
  soumettreReponseCDerivee,
  soumettreReponseCDeriveeSeconde,
  soumettreReponseCRelation,
  soumettreReponseDLimites,
  soumettreReponseDReecriture,
} from "./moteur6e/sessionHyperboliques";
import type { EtatSessionHyperboliques, PhaseHyperboliques, ResultatExerciceHyperboliques } from "./moteur6e/typesHyperboliques";
import {
  diagnostiquerBIsoler,
  diagnostiquerCDerivee,
  diagnostiquerCDeriveeSeconde,
  diagnostiquerCRelation,
  diagnostiquerDReecriture,
} from "./moteur6e/verificationHyperboliques";
import { EtapeChampHyperboliques } from "./components6e/EtapeChampHyperboliques";
import { EtapeLimitesHyperboliquesD } from "./components6e/EtapeLimitesHyperboliquesD";
import { EtapeListeValeursHyperboliques } from "./components6e/EtapeListeValeursHyperboliques";
import { EtapeStatutPariteHyperboliques } from "./components6e/EtapeStatutPariteHyperboliques";
import { ResultatPanelHyperboliques } from "./components6e/ResultatPanelHyperboliques";
import { ResumeSessionHyperboliques } from "./components6e/ResumeSessionHyperboliques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { CONSIGNE_GENERALE, aideNiveau1, aideNiveau2, blocDonnees, consigneEcran, etatActuel } from "./ui6e/formatHyperboliques";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionHyperboliques {
  return demarrerSessionHyperboliques(REGLAGES_DEMO, genererExerciceHyperboliques);
}

interface Bilan {
  resultat: ResultatExerciceHyperboliques;
}


const PLACEHOLDERS: Partial<Record<PhaseHyperboliques, string>> = {
  bIsoler: "ex : sqrt(1+3^2)",
  cDerivee: "ex : 3*(2*ch(3*x)-sh(3*x))",
  cDeriveeSeconde: "ex : 9*(2*sh(3*x)-ch(3*x))",
  cRelation: "ex : 9",
  dReecriture: "ex : ((2+3)*exp(x)+(3-2)*exp(-x))/2",
};

export function App6gen19() {
  const [etat, setEtat] = useState<EtatSessionHyperboliques>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionHyperboliques) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1] });
    }
    setEtat(nouvelEtat);
  }

  function forcerVariante(id: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionHyperboliques(REGLAGES_DEMO, () => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0])));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const donnees = blocDonnees(exercice);
  const etatAct = etatActuel(exercice, phase);
  const consigne = consigneEcran(exercice, phase);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const aide1 = aideNiveau1(exercice, phase);
  const aide2 = aideNiveau2(exercice, phase);

  function diagnostiquerChampUnique(texte: string) {
    switch (phase) {
      case "bIsoler":
        return exercice.famille === "B" ? diagnostiquerBIsoler(exercice, texte) : "parse_error";
      case "cDerivee":
        return exercice.famille === "C" ? diagnostiquerCDerivee(exercice, texte) : "parse_error";
      case "cDeriveeSeconde":
        return exercice.famille === "C" ? diagnostiquerCDeriveeSeconde(exercice, texte) : "parse_error";
      case "cRelation":
        return exercice.famille === "C" ? diagnostiquerCRelation(exercice, texte) : "parse_error";
      case "dReecriture":
        return exercice.famille === "D" ? diagnostiquerDReecriture(exercice, texte) : "parse_error";
      default:
        return "parse_error" as const;
    }
  }

  function onValiderChampUnique(texte: string) {
    if (phase === "bIsoler") return terminerEtape(soumettreReponseBIsoler(etat, texte));
    if (phase === "cDerivee") return terminerEtape(soumettreReponseCDerivee(etat, texte));
    if (phase === "cDeriveeSeconde") return terminerEtape(soumettreReponseCDeriveeSeconde(etat, texte));
    if (phase === "cRelation") return terminerEtape(soumettreReponseCRelation(etat, texte));
    return terminerEtape(soumettreReponseDReecriture(etat, texte));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Sinus et cosinus hyperboliques (sh, ch)</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <>
            {phase === "aParite" && (
              <EtapeStatutPariteHyperboliques
                key={phase}
                consigneGenerale={CONSIGNE_GENERALE}
                blocDonnees={donnees}
                consigneEcran={consigne}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(choix) => terminerEtape(soumettreReponseAParite(etat, choix))}
              />
            )}

            {phase === "bValeurs" && (
              <EtapeListeValeursHyperboliques
                key={phase}
                consigneGenerale={CONSIGNE_GENERALE}
                blocDonnees={donnees}
                etatActuel={etatAct}
                consigneEcran={consigne}
                placeholder="ex : sqrt(8)"
                labelAjout="+ Ajouter une valeur"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(textes) => terminerEtape(soumettreReponseBValeurs(etat, textes))}
              />
            )}

            {phase === "dLimites" && (
              <EtapeLimitesHyperboliquesD
                key={phase}
                consigneGenerale={CONSIGNE_GENERALE}
                blocDonnees={donnees}
                etatActuel={etatAct}
                consigneEcran={consigne}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(reponse) => terminerEtape(soumettreReponseDLimites(etat, reponse))}
              />
            )}

            {phase !== "aParite" && phase !== "bValeurs" && phase !== "dLimites" && (
              <EtapeChampHyperboliques
                key={phase}
                consigneGenerale={CONSIGNE_GENERALE}
                blocDonnees={donnees}
                etatActuel={etatAct}
                consigneEcran={consigne}
                placeholder={PLACEHOLDERS[phase] ?? "ex : sh(x)+ch(x)"}
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
        {dernierBilan && <ResultatPanelHyperboliques resultat={dernierBilan.resultat} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionHyperboliques resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
