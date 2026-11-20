import type { ReactNode } from "react";
import type { ExerciceDetectiveTrig, IdDescriptionTrig } from "./core5e/detectiveTrig.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveTrig } from "./generateurs5e/detectiveTrig";
import { correctionDetailleeDetectiveTrig } from "./generateurs5e/detectiveTrig/corrigeDetaille";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { descriptionCorrecte, indiceLigneFausse, nombreLignes } from "./moteur5e/modeleDetectiveTrig";
import { diagnostiquerCorrection, verifierDescription, verifierLigne } from "./moteur5e/verificationDetectiveTrig";
import { TENTATIVES_CHAMP, TENTATIVES_CHOIX } from "./moteur5e/sessionEcransTrig";
import { CONSIGNE_GENERALE, TITRES_ECRANS, aideSaisie, aidesEcran, consignesEcrans, descriptionFragments, enonceExercice, lignesCopie, prefixeChamp, reponseFragments } from "./ui5e/formatDetectiveTrig";
import { CoqueTrig5e } from "./components5e/CoqueTrig5e";
import { EtapeChampsTrig5e, SaisieTrig } from "./components5e/EtapesTrig5e";
import { RenduFragments } from "../4e/components/RenduFragments";
import { CopieEleve, EtapeDescriptionErreur, EtapeLigneFausse } from "../4e/components/EtapesDetectiveErreurs";

/**
 * 5gen50 — « Détective d'erreurs : trigonométrie » (5e, chapitre 2, section `modeliser`, processus 3
 * TRANSFÉRER), même mécanique que 5gen49 / 6gen88 / gen81. La résolution d'un exercice du chapitre par
 * un élève fictif (4 ou 5 lignes) contient UNE ligne fausse ; la suite en découle. Trois écrans :
 * 1. quelle ligne est fausse ? (choix fermé, une tentative) ;
 * 2. quelle est l'erreur ? (4 descriptions, une tentative) ;
 * 3. le résultat final corrigé (champ libre, 3 tentatives ; aire exacte, abscisse d'un maximum à une
 *    période près, ou toutes les solutions de [0 ; 2π[).
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceDetectiveTrig {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceDetectiveTrig();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDetectiveTrig, construireAvecVariante);
}

function paragraphe(fragments: Parameters<typeof RenduFragments>[0]["fragments"]): ReactNode {
  return (
    <p style={{ margin: 0 }}>
      <RenduFragments fragments={fragments} />
    </p>
  );
}

export function App5gen50() {
  return (
    <CoqueTrig5e<ExerciceDetectiveTrig>
      titre="Détective d'erreurs : trigonométrie"
      sousTitre="Chapitre 2 — Trigonométrie"
      idDebug="__debug5gen50"
      catalogue={CATALOGUE_VARIANTES}
      exerciceInitial={exerciceInitial}
      genererLibre={genererExerciceDetectiveTrig}
      genererVariante={construireAvecVariante}
      nombreEcrans={() => 3}
      titreEcran={(_, i) => TITRES_ECRANS[i]!}
      tentativesMax={(_, i) => (i === 2 ? TENTATIVES_CHAMP : TENTATIVES_CHOIX)}
      reponseAttendue={(e, i) => (i === 0 ? <p style={{ margin: 0 }}>{`Ligne ${indiceLigneFausse(e) + 1}`}</p> : paragraphe(i === 1 ? descriptionFragments(descriptionCorrecte(e), e) : reponseFragments(e)))}
      messageRevele={(_, i) => (i === 0 ? "Ce n'était pas la ligne fausse." : "Ce n'était pas la bonne explication.")}
      corrige={correctionDetailleeDetectiveTrig}
      consigneGenerale={() => CONSIGNE_GENERALE}
      blocDonnees={(e, ecran) => (
        <>
          <p style={{ margin: "6px 0" }}>
            <RenduFragments fragments={enonceExercice(e)} />
          </p>
          <CopieEleve lignes={lignesCopie(e)} ligneSignalee={ecran >= 1 ? indiceLigneFausse(e) : null} />
        </>
      )}
      rendreEcran={({ e, ecran, niveauAide, onActiverAide, conclure, validation, tentativesUtilisees, tentativesMax }) => {
        const consigne = <RenduFragments fragments={consignesEcrans(e)[ecran]!} />;
        const aides = { aides: aidesEcran(e, ecran), niveauAide, onActiverAide, validation };
        if (ecran === 0)
          return (
            <EtapeLigneFausse
              {...aides}
              consigne={consigne}
              nombreLignes={nombreLignes(e)}
              attendue={indiceLigneFausse(e)}
              onValider={(i) => conclure(verifierLigne(e, i), <p style={{ margin: 0 }}>{`Ligne ${i + 1}`}</p>)}
            />
          );
        if (ecran === 1)
          return (
            <EtapeDescriptionErreur<IdDescriptionTrig>
              {...aides}
              consigne={consigne}
              options={e.options.map((id) => ({ id, fragments: descriptionFragments(id, e) }))}
              attendue={descriptionCorrecte(e)}
              onValider={(id) => conclure(verifierDescription(e, id), paragraphe(descriptionFragments(id, e)))}
            />
          );
        return (
          <EtapeChampsTrig5e
            consigne={consignesEcrans(e)[2]!}
            champs={[{ prefixe: prefixeChamp(e), suffixe: e.variante === "secteur" ? "cm²" : undefined, nom: "Résultat final corrigé" }]}
            raccourcis={[
              { libelle: "π", mode: "ajoute", texte: "π" },
              { libelle: "√", mode: "ajoute", texte: "√" },
              ...(e.variante === "equation" || e.variante === "produit" ? [{ libelle: ";", mode: "ajoute" as const, texte: " ; " }] : []),
            ]}
            aideSaisie={aideSaisie(e)}
            aides={aidesEcran(e, 2)}
            niveauAide={niveauAide}
            onActiverAide={onActiverAide}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            diagnostiquer={(v) => diagnostiquerCorrection(e, v[0]!)}
            onValider={(correct, v) => conclure(correct, <p style={{ margin: 0 }}><SaisieTrig texte={v[0]!} /></p>)}
            validation={validation}
            idChamp="detective-trig-champ"
          />
        );
      }}
    />
  );
}
