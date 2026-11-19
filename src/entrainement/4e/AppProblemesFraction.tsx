import type { ExerciceProblemesFraction } from "./core/problemesFraction.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceProblemesFraction } from "./generateurs/problemesFraction";
import { correctionDetailleeProblemesFraction } from "./generateurs/problemesFraction/corrigeDetaille";
import { CONSIGNE_GENERALE, ecrans, recit } from "./ui/formatProblemesFraction";
import { AppTransfertSecondDegre } from "./components/AppTransfertSecondDegre";
import { espacesInsecables } from "./components/RenduFragments";

/**
 * gen119 — « Problèmes avec une fraction » (4e, chapitre 2, § 5 et § 7, processus 3 TRANSFÉRER).
 * Prix unitaire et quantité, aller-retour à deux vitesses, deux robinets (deux machines) : un
 * problème qui se traduit par une équation RATIONNELLE. Cinq écrans : poser l'équation (choix fermé,
 * une tentative), la CE, la résolution (équation du second degré obtenue + solutions), le rejet
 * (CE puis contexte, choix fermé) et la réponse à la question (grandeur demandée, avec son unité).
 * Coquille commune : `components/AppTransfertSecondDegre.tsx`.
 */

function blocDonnees(e: ExerciceProblemesFraction) {
  const r = recit(e);
  return (
    <>
      {r.phrases.map((t) => (
        <p key={t} style={{ margin: "6px 0" }}>
          {espacesInsecables(t)}
        </p>
      ))}
      <p style={{ margin: "8px 0 0", fontWeight: 600 }}>{espacesInsecables(r.question)}</p>
    </>
  );
}

export function AppProblemesFraction() {
  return (
    <AppTransfertSecondDegre<ExerciceProblemesFraction>
      titre="Problèmes avec une fraction"
      sousTitre="Chapitre 2 — Équations et inéquations du second degré"
      catalogue={CATALOGUE_VARIANTES}
      generer={genererExerciceProblemesFraction}
      construireAvecVariante={(id) => construireAvecVariante(id)}
      ecrans={ecrans}
      consigneGenerale={() => CONSIGNE_GENERALE}
      blocDonnees={blocDonnees}
      correction={correctionDetailleeProblemesFraction}
    />
  );
}
