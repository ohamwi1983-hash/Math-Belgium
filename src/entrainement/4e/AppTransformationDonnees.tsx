import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceTransformationDonnees } from "./core/transformationDonnees.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTransformationDonnees } from "./generateurs/transformationDonnees";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatTransformationDonnees } from "./moteur/sessionTransformationDonnees";
import { diagnostiquerChamps, type StatutChamp } from "./moteur/verificationTransformationDonnees";
import { CONSIGNE_GENERALE, NOMBRE_ECRANS, TITRES_ECRANS, ecrans, lignesIndicateurs, populationTexte, transformationTexte, type Ecran } from "./ui/formatTransformationDonnees";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeChampsTransformation, EtapeChoixTransformation } from "./components/EtapesTransformationDonnees";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen108 — « Effet d'une transformation des données » (4e, chapitre 4 « Statistique descriptive »,
 * sections « moyenne » / « dispersion », processus 3 TRANSFÉRER). Les indicateurs d'une série sont
 * donnés ; chaque valeur subit une même transformation décrite avec les mots du contexte (prime,
 * hausse en %, changement d'unité, °C → °F, points manquants…). Quatre écrans :
 * 1. écrire la transformation sous la forme y = a·x + b (a et b) ;
 * 2. nouvelle moyenne et nouvelle médiane (a·x + b) ;
 * 3. nouvelle étendue, variance et écart-type (|a|·…, a²·…, la constante ne change rien) ;
 * 4. choisir la phrase qui décrit correctement l'effet de la transformation (choix fermé).
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceTransformationDonnees {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceTransformationDonnees();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceTransformationDonnees, construireAvecVariante);
}

/** Saisie de l'élève pour la fiche de l'écran : virgule décimale, « − » typographique. */
function saisieLue(s: string): string {
  return s.trim().replace(/-/g, "−").replace(/(\d)\.(\d)/g, "$1,$2");
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function reponseAttendue(def: Ecran): ReactNode {
  if (def.type === "choix") return <RenduFragments fragments={def.options[def.bonne]!} />;
  return <RenduFragments fragments={def.reponse} />;
}

export function AppTransformationDonnees() {
  const [etat, setEtat] = useState<EtatTransformationDonnees>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [statuts, setStatuts] = useState<StatutChamp[] | null>(null);
  const [nonComptee, setNonComptee] = useState<"lecture" | "arrondi" | null>(null);

  const e = etat.exercice;
  const ecran = etat.ecran;
  const def = ecrans(e)[ecran]!;

  function recommencer(exercice: ExerciceTransformationDonnees) {
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
    const attendue = reponseAttendue(def);
    setHistorique((h) => [...h, ecranClos(TITRES_ECRANS[ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: def.type === "choix" ? def.messageFaux : undefined,
      derniere: ecran >= NOMBRE_ECRANS - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceTransformationDonnees());
      return;
    }
    setEtat(ecranSuivant(etat));
    setStatuts(null);
    setNonComptee(null);
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

  const communs = { niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation, aides: def.aides, consigne: def.consigne };

  function ecranCourant(): ReactNode {
    if (def.type === "choix") {
      return <EtapeChoixTransformation {...communs} options={def.options} bonne={def.bonne} onValider={(i) => conclure(i === def.bonne, <RenduFragments fragments={def.options[i]!} />)} />;
    }
    return (
      <EtapeChampsTransformation
        {...communs}
        champs={def.champs}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(e, ecran)}
        statuts={statuts}
        nonComptee={nonComptee}
        onValider={(saisies) => {
          const diagnostic = diagnostiquerChamps(saisies, def.champs);
          if (diagnostic.some((s) => s.etat === "parse_error")) {
            setNonComptee("lecture");
            return;
          }
          if (!diagnostic.some((s) => s.etat === "faux" || s.etat === "piege") && diagnostic.some((s) => s.etat === "arrondi")) {
            setStatuts(diagnostic);
            setNonComptee("arrondi");
            return;
          }
          setStatuts(diagnostic);
          conclure(
            diagnostic.every((s) => s.etat === "correct"),
            <span>
              {def.champs.map((c, i) => (
                <span key={c.id} style={{ marginRight: 14, display: "inline-block" }}>
                  <RenduFragments fragments={c.libelle} /> {saisieLue(saisies[i]!)}
                  {c.unite ? ` ${c.unite}` : ""}
                </span>
              ))}
            </span>,
          );
        }}
      />
    );
  }

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>{populationTexte(e)}</p>
      <div className="tf-table-scroll">
        <table className="tf-table">
          <caption style={{ captionSide: "top", textAlign: "left", fontWeight: 600, paddingBottom: 4 }}>Série de départ</caption>
          <tbody>
            {lignesIndicateurs(e).map((l) => (
              <tr key={l.libelleTexte}>
                <th style={{ textAlign: "left" }}>
                  <RenduFragments fragments={l.libelle} />
                </th>
                <td>{l.valeur}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ margin: "8px 0 0", fontWeight: 600 }}>{transformationTexte(e)}</p>
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Effet d'une transformation des données</h1>
        <p className="app-subtitle">Chapitre 4 — Statistique descriptive</p>
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
