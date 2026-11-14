import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceDetectiveIntegrales, IdDescriptionIntegrales } from "./core6e/detectiveIntegrales.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveIntegrales } from "./generateurs6e/detectiveIntegrales";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { NOMBRE_ECRANS, activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatDetectiveIntegrales } from "./moteur6e/sessionDetectiveIntegrales";
import { diagnostiquerCorrection, verifierDescription, verifierLigne, type StatutChamp } from "./moteur6e/verificationDetectiveIntegrales";
import { SCENARIOS, descriptionCorrecte, indiceLigneFausse, valeursAttendues } from "./moteur6e/modeleDetectiveIntegrales";
import { expressionLibreVersLatex } from "./ui/formatExpressionLatex";
import {
  CONSIGNE_GENERALE,
  TITRES_ECRANS,
  aideSaisie,
  aidesEcran,
  consignesEcrans,
  descriptionFragments,
  enonceExercice,
  libellesValeurs,
  lignesCopie,
  messagesARevoir,
  valeurFragments,
} from "./ui6e/formatDetectiveIntegrales";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "../4e/ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { EnTeteExercice } from "./components6e/EnTeteExercice";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { CopieEleve, EtapeDescriptionErreur, EtapeLigneFausse } from "../4e/components/EtapesDetectiveErreurs";
import { EtapeCorrectionDetectiveIntegrales } from "./components6e/EtapeCorrectionDetectiveIntegrales";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * 6gen84 — « Le détective d'erreurs : intégrales et primitives » (6e, chapitre 4, section
 * « problemes », processus 3 TRANSFÉRER), sur le modèle de gen81/gen91 (4e). La résolution d'un
 * exercice du chapitre par un élève fictif (3 à 5 lignes) contient UNE ligne fausse ; la suite en
 * découle. Trois écrans :
 * 1. quelle ligne est fausse ? (choix fermé, une tentative) ;
 * 2. quelle est l'erreur ? (4 descriptions, une tentative) ;
 * 3. corriger : bonne valeur de la ligne, puis résultat final (valeurs exactes, 3 tentatives).
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceDetectiveIntegrales {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceDetectiveIntegrales();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDetectiveIntegrales, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function reponseAttendue(e: ExerciceDetectiveIntegrales, ecran: number): ReactNode {
  if (ecran === 0) return <p style={{ margin: 0 }}>{`Ligne ${indiceLigneFausse(e) + 1}`}</p>;
  if (ecran === 1)
    return (
      <p style={{ margin: 0 }}>
        <RenduFragments fragments={descriptionFragments(descriptionCorrecte(e), e)} />
      </p>
    );
  return (
    <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
      {valeursAttendues(e).map((v, i) => (
        <li key={i}>
          <RenduFragments fragments={valeurFragments(v)} />
        </li>
      ))}
    </ul>
  );
}

/** Une saisie libre en LaTeX (fiche de l'écran 3) — jamais la notation clavier brute. */
function latexSaisie(texte: string): string {
  const s = texte.trim().replace(/(\d),(\d)/g, "$1.$2").replace(/√\s*(\d+)/g, "rac($1)").replace(/√\(/g, "rac(");
  try {
    return expressionLibreVersLatex(s).replace(/(\d)\.(\d)/g, "$1{,}$2");
  } catch {
    return "?";
  }
}

function saisieEcrite(e: ExerciceDetectiveIntegrales, textes: string[]): ReactNode {
  return (
    <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
      {valeursAttendues(e).map((v, i) => {
        const s = latexSaisie(textes[i] ?? "");
        if (v.genre === "fonction") return <li key={i}><Katex expression={`${v.quantite} = ${s}${v.avecC ? " + C" : ""}`} /></li>;
        return (
          <li key={i}>
            <RenduFragments fragments={v.prefixe.map((f) => (f.type === "texte" ? { ...f, valeur: `${f.valeur} ` } : f))} /> <Katex expression={s} />
            {v.unite ? ` ${v.unite}` : ""}
          </li>
        );
      })}
    </ul>
  );
}

export function App6gen84() {
  const [etat, setEtat] = useState<EtatDetectiveIntegrales>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [statuts, setStatuts] = useState<StatutChamp[] | null>(null);
  const [nonComptee, setNonComptee] = useState<"parse_error" | "approchee" | null>(null);

  const e = etat.exercice;
  const ecran = etat.ecran;

  function recommencer(exercice: ExerciceDetectiveIntegrales) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setStatuts(null);
    setNonComptee(null);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode) {
    const resultat = soumettre(etat, correct);
    setNonComptee(null);
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
      recommencer(genererExerciceDetectiveIntegrales());
      return;
    }
    setEtat(ecranSuivant(etat));
    setStatuts(null);
    setEnAttente(null);
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
          nombreLignes={SCENARIOS[e.scenario].nombreLignes}
          attendue={indiceLigneFausse(e)}
          onValider={(i) => conclure(verifierLigne(e, i), <p style={{ margin: 0 }}>{`Ligne ${i + 1}`}</p>)}
        />
      );
    }
    if (ecran === 1) {
      return (
        <EtapeDescriptionErreur<IdDescriptionIntegrales>
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
    const libelles = libellesValeurs(e);
    const messages = messagesARevoir(e);
    const valeurs = valeursAttendues(e).map((valeur, i) => ({ valeur, libelle: libelles[i]!, aRevoir: messages[i]! }));
    return (
      <EtapeCorrectionDetectiveIntegrales
        {...communs}
        consigne={consigne}
        valeurs={valeurs}
        aideSaisie={aideSaisie(e)}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(ecran)}
        statuts={statuts}
        nonComptee={nonComptee}
        onValider={(textes) => {
          const diagnostic = diagnostiquerCorrection(e, textes);
          if (diagnostic.includes("parse_error")) {
            setNonComptee("parse_error");
            return;
          }
          if (diagnostic.includes("approchee")) {
            setNonComptee("approchee");
            return;
          }
          setStatuts(diagnostic);
          conclure(
            diagnostic.every((s) => s === "correct"),
            saisieEcrite(e, textes),
          );
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
        <h1 className="app-title">Le détective d'erreurs : intégrales et primitives</h1>
        <p className="app-subtitle">Chapitre 4 — Intégrales et primitives</p>
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
