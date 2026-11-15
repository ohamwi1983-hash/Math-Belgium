import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceValeurManquante } from "./core/valeurManquante.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceValeurManquante } from "./generateurs/valeurManquante";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatValeurManquante } from "./moteur/sessionValeurManquante";
import { diagnostiquerChamps, type StatutChamp } from "./moteur/verificationTransformationDonnees";
import { CONSIGNE_GENERALE, NOMBRE_ECRANS, TITRES_ECRANS, ecrans, recit, type Ecran } from "./ui/formatValeurManquante";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { RenduFragments, espacesInsecables } from "./components/RenduFragments";
import { EtapeChampsTransformation, EtapeChoixTransformation } from "./components/EtapesTransformationDonnees";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen109 — « Retrouver une valeur manquante » (4e, chapitre 4 « Statistique descriptive », section
 * « moyenne », processus 3 TRANSFÉRER). Une information statistique est connue (moyenne visée,
 * moyenne d'un tableau, médiane voulue, moyenne globale), une donnée manque. Trois écrans :
 * 1. poser l'équation (choix fermé, UNE tentative : les trois mauvaises équations sont les pièges
 *    classiques — moyenne des moyennes, coefficients oubliés, effectif total non mis à jour) ;
 * 2. la résoudre (champ libre, 3 tentatives, pièges reconnus) ;
 * 3. conclure dans le contexte (choix fermé : verdict possible / impossible, « au moins », effectif
 *    total, position de la moyenne globale…).
 * Les écrans (choix, champs, aides) et la vérification des champs sont ceux de gen108
 * (`EtapesTransformationDonnees.tsx`, `verificationTransformationDonnees.ts`), réutilisés tels quels.
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceValeurManquante {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceValeurManquante();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceValeurManquante, construireAvecVariante);
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

export function AppValeurManquante() {
  const [etat, setEtat] = useState<EtatValeurManquante>(() => demarrer(exerciceInitial()));
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

  function recommencer(exercice: ExerciceValeurManquante) {
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
      recommencer(genererExerciceValeurManquante());
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

  const r = recit(e);
  const blocDonnees = (
    <>
      {r.avant.map((t) => (
        <p key={t} style={{ margin: "6px 0" }}>
          {espacesInsecables(t)}
        </p>
      ))}
      {r.tableau && (
        <div className="tf-table-scroll">
          <table className="tf-table">
            <caption style={{ captionSide: "top", textAlign: "left", fontWeight: 600, paddingBottom: 4 }}>{r.tableau.legende}</caption>
            <thead>
              <tr>
                {r.tableau.entetes.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.tableau.lignes.map((l, i) => (
                <tr key={i}>
                  {l.map((x, j) => (
                    <td key={j} style={x === "?" ? { fontWeight: 700 } : undefined}>
                      {x}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {r.apres.map((t) => (
        <p key={t} style={{ margin: "6px 0" }}>
          {espacesInsecables(t)}
        </p>
      ))}
      <p style={{ margin: "8px 0 0", fontWeight: 600 }}>{espacesInsecables(r.question)}</p>
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Retrouver une valeur manquante</h1>
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
