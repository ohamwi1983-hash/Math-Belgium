import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceDetectiveComplexes, IdDescriptionComplexes } from "./core6e/detectiveComplexes.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveComplexes } from "./generateurs6e/detectiveComplexes";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { NOMBRE_ECRANS, activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatDetectiveComplexes } from "./moteur6e/sessionDetectiveComplexes";
import { diagnostiquerCorrection, estResultatCopie, verifierDescription, verifierLigne, type StatutChampComplexes } from "./moteur6e/verificationDetectiveComplexes";
import { champsCorrection, descriptionCorrecte, indiceLigneFausse, nombreLignes } from "./moteur6e/modeleDetectiveComplexes";
import { CONSIGNE_GENERALE, TITRES_ECRANS, aideSaisie, aidesEcran, consignesEcrans, descriptionFragments, enonceExercice, lignesCopie, reponseFragments } from "./ui6e/formatDetectiveComplexes";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "../4e/ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { EnTeteExercice } from "./components6e/EnTeteExercice";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { expressionLibreVersLatex } from "./ui/formatExpressionLatex";
import { CopieEleve, EtapeDescriptionErreur, EtapeLigneFausse } from "../4e/components/EtapesDetectiveErreurs";
import { EtapeCorrectionDetectiveComplexes } from "./components6e/EtapeCorrectionDetectiveComplexes";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * 6gen99 — « Détective d'erreurs : nombres complexes » (6e, chapitre 5 « Nombres complexes »,
 * section `problemesavances`, processus 3 TRANSFÉRER), même mécanique que 5gen49 / 6gen88 /
 * 6gen84. La résolution d'un exercice du chapitre par un élève fictif (4 ou 5 lignes) contient UNE
 * ligne fausse ; la suite en découle. Trois écrans :
 * 1. quelle ligne est fausse ? (choix fermé, une tentative) ;
 * 2. quelle est l'erreur ? (4 descriptions, une tentative) ;
 * 3. le résultat corrigé (champs libres, valeurs exactes, 3 tentatives).
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceDetectiveComplexes {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceDetectiveComplexes();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDetectiveComplexes, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

/** Une saisie réécrite en LaTeX pour la fiche (jamais la notation clavier brute). */
function saisieLatex(texte: string): string {
  const s = texte
    .replace(/^[^=]*=/, "")
    .trim()
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/√\s*(\d+)/g, "rac($1)")
    .replace(/√\(/g, "rac(");
  try {
    return expressionLibreVersLatex(s).replace(/(\d)\.(\d)/g, "$1{,}$2");
  } catch {
    return "?";
  }
}

function saisiesEcrites(e: ExerciceDetectiveComplexes, textes: string[]): ReactNode {
  return (
    <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
      {champsCorrection(e).map((c, i) => (
        <li key={i}>
          <Katex expression={`${c.prefixe} ${saisieLatex(textes[i] ?? "")}`} />
        </li>
      ))}
    </ul>
  );
}

function reponseAttendue(e: ExerciceDetectiveComplexes, ecran: number): ReactNode {
  if (ecran === 0) return <p style={{ margin: 0 }}>{`Ligne ${indiceLigneFausse(e) + 1}`}</p>;
  const fragments = ecran === 1 ? descriptionFragments(descriptionCorrecte(e), e) : reponseFragments(e);
  return (
    <p style={{ margin: 0 }}>
      <RenduFragments fragments={fragments} />
    </p>
  );
}

export function App6gen99() {
  const [etat, setEtat] = useState<EtatDetectiveComplexes>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [statuts, setStatuts] = useState<StatutChampComplexes[] | null>(null);
  const [messageFaux, setMessageFaux] = useState<string | null>(null);
  const [nonCompte, setNonCompte] = useState<string | null>(null);

  const e = etat.exercice;
  const ecran = etat.ecran;

  function recommencer(exercice: ExerciceDetectiveComplexes) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setStatuts(null);
    setMessageFaux(null);
    setNonCompte(null);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode) {
    const resultat = soumettre(etat, correct);
    setNonCompte(null);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = reponseAttendue(e, ecran);
    setHistorique((h) => [...h, ecranClos(TITRES_ECRANS[ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: ecran === 0 ? "Ce n'était pas la ligne fausse." : ecran === 1 ? "Ce n'était pas la bonne explication." : undefined,
      derniere: ecran >= NOMBRE_ECRANS - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceDetectiveComplexes());
      return;
    }
    setEtat(ecranSuivant(etat));
    setStatuts(null);
    setMessageFaux(null);
    setEnAttente(null);
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen99?: unknown }).__debug6gen99 = { exercice: e, ecran };
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: enAttente.messageRevele,
      }
    : null;

  const consigne = <RenduFragments fragments={consignesEcrans(e)[ecran]!} />;
  const communs = { aides: aidesEcran(e, ecran), niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation };

  function ecranCourant(): ReactNode {
    if (ecran === 0) {
      return (
        <EtapeLigneFausse
          {...communs}
          consigne={consigne}
          nombreLignes={nombreLignes(e)}
          attendue={indiceLigneFausse(e)}
          onValider={(i) => conclure(verifierLigne(e, i), <p style={{ margin: 0 }}>{`Ligne ${i + 1}`}</p>)}
        />
      );
    }
    if (ecran === 1) {
      return (
        <EtapeDescriptionErreur<IdDescriptionComplexes>
          {...communs}
          consigne={consigne}
          options={e.options.map((id) => ({ id, fragments: descriptionFragments(id, e) }))}
          attendue={descriptionCorrecte(e)}
          onValider={(id) =>
            conclure(
              verifierDescription(e, id),
              <p style={{ margin: 0 }}>
                <RenduFragments fragments={descriptionFragments(id, e)} />
              </p>,
            )
          }
        />
      );
    }
    return (
      <EtapeCorrectionDetectiveComplexes
        {...communs}
        consigne={consigne}
        champs={champsCorrection(e)}
        aideSaisie={aideSaisie(e)}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(ecran)}
        statuts={statuts}
        messageFaux={messageFaux}
        nonCompte={nonCompte}
        onValider={(textes) => {
          const diagnostic = diagnostiquerCorrection(e, textes);
          if (diagnostic.nonCompte) {
            setNonCompte(diagnostic.nonCompte);
            return;
          }
          const correct = diagnostic.statuts.every((s) => s === "correct");
          setStatuts(diagnostic.statuts);
          const copiee = !correct && estResultatCopie(e, textes);
          setMessageFaux(
            !copiee
              ? null
              : e.variante === "racineProduit"
                ? "C'est la valeur que la copie donne à ce produit : écris chaque facteur avec i, puis multiplie."
                : `Ce sont les valeurs de la copie : reprends la résolution à partir de la ligne ${indiceLigneFausse(e) + 1}.`,
          );
          conclure(correct, saisiesEcrites(e, textes));
        }}
      />
    );
  }

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={enonceExercice(e)} />
      </p>
      <CopieEleve lignes={lignesCopie(e)} ligneSignalee={ecran >= 1 ? indiceLigneFausse(e) : null} />
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Détective d'erreurs : nombres complexes</h1>
        <p className="app-subtitle">Chapitre 5 — Nombres complexes</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={blocDonnees} />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
