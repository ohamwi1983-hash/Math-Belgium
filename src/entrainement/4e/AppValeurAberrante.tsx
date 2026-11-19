import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceValeurAberrante } from "./core/valeurAberrante.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceValeurAberrante } from "./generateurs/valeurAberrante";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { correctionDetailleeValeurAberrante } from "./generateurs/valeurAberrante/corrigeDetaille";
import { activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatValeurAberrante } from "./moteur/sessionValeurAberrante";
import { diagnostiquerChamps, type StatutChamp } from "./moteur/verificationTransformationDonnees";
import {
  LIBELLES_INDICATEURS,
  NOMBRE_ECRANS,
  consigneGenerale,
  ecrans,
  explicationVerdict,
  listeTexte,
  recit,
  saisieSansUnite,
  texteJustification,
  titreListe,
  uniteApres,
  type EcranValeurAberrante,
} from "./ui/formatValeurAberrante";
import { figureNuageSvg } from "./ui/figureValeurAberrante";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeChampsTransformation } from "./components/EtapesTransformationDonnees";
import { EtapeVerdictAberrante } from "./components/EtapesValeurAberrante";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen110 — « Moyenne ou médiane ? La valeur aberrante » (4e, chapitre 4 « Statistique
 * descriptive », section « position », processus 3 TRANSFÉRER). Une série brute en contexte, avec
 * ou sans valeur extrême (le verdict est tiré au hasard, le récit ne le trahit pas). Trois écrans :
 * 1. moyenne et médiane de la série (champs, 3 tentatives) ;
 * 2. moyenne et médiane sans la plus grande valeur — la plus petite pour des notes (champs) ;
 * 3. l'indicateur le plus représentatif (moyenne / médiane / les deux se valent) ET sa justification
 *    (deux choix fermés, UNE tentative pour les deux), puis l'explication et le nuage de points.
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceValeurAberrante {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceValeurAberrante();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceValeurAberrante, construireAvecVariante);
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

function reponseAttendue(def: EcranValeurAberrante): ReactNode {
  return <RenduFragments fragments={def.reponse} />;
}

export function AppValeurAberrante() {
  const [etat, setEtat] = useState<EtatValeurAberrante>(() => demarrer(exerciceInitial()));
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

  function recommencer(exercice: ExerciceValeurAberrante) {
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
    setHistorique((h) => [...h, ecranClos(def.titre, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: def.type === "verdict" ? "Ce n'était pas le bon choix (indicateur ou justification)." : undefined,
      derniere: ecran >= NOMBRE_ECRANS - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceValeurAberrante());
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
        corrigeDetaille: <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeValeurAberrante(e), lettreEtape(ecran))} />,
      }
    : null;

  const communs = { niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation, aides: def.aides, consigne: def.consigne };

  function ecranCourant(): ReactNode {
    if (def.type === "verdict") {
      return (
        <EtapeVerdictAberrante
          {...communs}
          indicateurs={def.indicateurs}
          justifications={def.justifications}
          bonIndicateur={def.bonIndicateur}
          bonneJustification={def.bonneJustification}
          explication={explicationVerdict(e)}
          figure={figureNuageSvg(e)}
          onValider={(i, j) =>
            conclure(
              i === def.bonIndicateur && j === def.bonneJustification,
              <span>
                {LIBELLES_INDICATEURS[i]} — {texteJustification(e, j)}
              </span>,
            )
          }
        />
      );
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
          const diagnostic = diagnostiquerChamps(
            saisies.map((s) => saisieSansUnite(e, s)),
            def.champs,
          );
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
                  {uniteApres(e)}
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
      <p style={{ margin: "6px 0" }}>{recit(e)}</p>
      <p style={{ margin: "6px 0 0" }}>
        <strong>{titreListe(e)} :</strong> <span style={{ overflowWrap: "anywhere" }}>{listeTexte(e.valeurs)}</span>
      </p>
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">{"Moyenne ou médiane\u00a0? La valeur aberrante"}</h1>
        <p className="app-subtitle">Chapitre 4 — Statistique descriptive</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={consigneGenerale(e)} blocDonnees={blocDonnees} />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
