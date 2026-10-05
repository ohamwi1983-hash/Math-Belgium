import { useEffect, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceGraphiquesCyclometriques } from "./generateurs6e/graphiquesCyclometriques/index";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionGraphiquesCyclometriques,
  soumettreReponseEcranUnique,
} from "./moteur6e/sessionGraphiquesCyclometriques";
import type { EtatSessionGraphiquesCyclometriques, ResultatExerciceGraphiquesCyclometriques } from "./moteur6e/typesGraphiquesCyclometriques";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { EtapeApparierGraphiqueCyclo } from "./components6e/EtapeApparierGraphiqueCyclo";
import { ResultatPanelGraphiquesCyclometriques } from "./components6e/ResultatPanelGraphiquesCyclometriques";
import { ResumeSessionGraphiquesCyclometriques } from "./components6e/ResumeSessionGraphiquesCyclometriques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { texteAideNiveau1, texteAideNiveau2 } from "./ui6e/formatGraphiquesCyclometriques";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionGraphiquesCyclometriques {
  return demarrerSessionGraphiquesCyclometriques(REGLAGES_DEMO, genererExerciceGraphiquesCyclometriques);
}

interface Bilan {
  resultat: ResultatExerciceGraphiquesCyclometriques;
  info: { niveauAide: number; revele: boolean };
}

/**
 * `6gen5` — REFONTE COMPLÈTE : un seul écran par tirage, toutes familles confondues (remplace
 * l'ancienne séquence "calcul (C-F) → sélection (A-F)" à 1 ou 2 écrans). Voir
 * `components6e/EtapeApparierGraphiqueCyclo.tsx` pour le détail de l'écran unique et
 * `moteur6e/sessionGraphiquesCyclometriques.ts` pour le moteur simplifié en conséquence (plus de
 * notion de phase).
 */
export function App6gen5() {
  const [etat, setEtat] = useState<EtatSessionGraphiquesCyclometriques>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  // Hook de debug pour la vérification Playwright (`?dev=1`) — expose l'exercice courant (dont
  // `proprietes`, la vérité terrain calculée par la Couche A) pour remplir les 7 sous-réponses avec
  // les vraies valeurs plutôt qu'à l'aveugle. Ne concerne jamais un élève en usage normal (lecture
  // seule, aucun effet sur la logique de session).
  useEffect(() => {
    (window as unknown as { __debug6gen5?: unknown }).__debug6gen5 = {
      exercice: etat.exerciceCourant,
      phase: etat.terminee ? "terminee" : dernierBilan ? "bilan" : "ecran",
    };
  }, [etat, dernierBilan]);

  function terminerEtape(nouvelEtat: EtatSessionGraphiquesCyclometriques) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({
        resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1],
        info: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereRevelee },
      });
    }
    setEtat(nouvelEtat);
  }

  function forcerVariante(id: string) {
    setDernierBilan(null);
    setEtat(
      demarrerSessionGraphiquesCyclometriques(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])),
    );
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Apparier graphiques et expressions de fonctions cyclométriques</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <EtapeApparierGraphiqueCyclo
              key={etat.indexExercice}
              exercice={exercice}
              aideNiveau1={texteAideNiveau1(exercice)}
              aideNiveau2={texteAideNiveau2(exercice)}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={etat.niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseEcranUnique(etat, reponse))}
            />
          )}
          {/* Les 6 propriétés justifiées peuvent porter une valeur irrationnelle (arctan/arcsin/arccos
            d'un argument quelconque, ordonnée, bornes de l'image famille D...) — TOUJOURS visible sur
            l'écran unique, jamais conditionnée par famille (contrairement à `necessiteCalculatrice`
            ailleurs sur ce chantier) puisque les 6 familles A-F peuvent chacune l'exiger. */}
          {enCoursDeSession && <CalculatriceScientifique />}
          {dernierBilan && (
            <ResultatPanelGraphiquesCyclometriques
              resultat={dernierBilan.resultat}
              info={dernierBilan.info}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionGraphiquesCyclometriques resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
