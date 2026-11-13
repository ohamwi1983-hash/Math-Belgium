import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceDeuxPositions, ExerciceTexteTriangle, ExerciceTexteTriangleStandard, RoleElement } from "./core/texteTriangle.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTexteTriangle } from "./generateurs/texteTriangle";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranSuivant, soumettre, tentativesMax, typeEcran, type EtatTexteTriangle } from "./moteur/sessionTexteTriangle";
import { NOMBRE_ECRANS, type TypeEcran } from "./moteur/modeleTexteTriangle";
import {
  diagnostiquerCandidats,
  diagnostiquerConversions,
  diagnostiquerDistances,
  diagnostiquerInconnue,
  lireNombre,
  verifierOption,
  verifierRoles,
  type StatutChamp,
} from "./moteur/verificationTexteTriangle";
import { aidesEcran, consigneEcran, degres, entreeRecap, justificationLoi, libelleRole, loiAttendue, n, nomsDeuxPositions, optionsLoi, titresEcrans, uniteLatex } from "./ui/formatTexteTriangle";
import { construireFigureTexteTriangle, PALETTE_ECRAN } from "./ui/figureTexteTriangle";
import { ecranClos, nombreTexte, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import type { EntreeRecapitulatif } from "./ui/recapitulatif";
import { latex, texte } from "../export/fragmentsDocx";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { QuestionFinale } from "./components/QuestionFinale";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeChampsTexteTriangle, EtapeChoixTexteTriangle, EtapeRolesTexteTriangle, type ChampNumerique } from "./components/EtapesTexteTriangle";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen77 — « Du texte au triangle : problèmes en contexte » (4e, chapitre 5, section
 * « triangulation », processus 3 TRANSFÉRER). Pendant à UN SEUL triangle de gen58. Cinq écrans :
 * 1. identifier les éléments du triangle (donné / à convertir / cherché) — appariement, une tentative ;
 * 2. convertir les données du texte (caps, élévations, dépressions, relèvements) en angles intérieurs ;
 * 3. choisir la loi — choix fermé, une tentative ;
 * 4. calculer ;
 * 5. répondre avec l'unité et l'arrondi demandés — phrase-réponse, une tentative.
 * « Deux positions possibles » : configuration, loi, deux angles candidats, deux distances, position
 * retenue grâce à l'information supplémentaire. Aucun point affiché. `?code=` (QR code d'une
 * feuille) : première instance tirée avec les MÊMES fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceTexteTriangle {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceTexteTriangle();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceTexteTriangle, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

const ECRANS_CALCULATRICE = new Set<TypeEcran>(["calculer", "candidats", "distances"]);

function ListeRoles({ e, roles }: { e: ExerciceTexteTriangleStandard; roles: RoleElement[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
      {e.elements.map((el, i) => (
        <li key={i}>
          <Katex expression={el.latex} /> : {libelleRole(roles[i]!).toLowerCase()}
        </li>
      ))}
    </ul>
  );
}

function ListeLatex({ lignes }: { lignes: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
      {lignes.map((l, i) => (
        <li key={i}>
          <Katex expression={l} />
        </li>
      ))}
    </ul>
  );
}

function texteOptionCorrecte(options: { texte: string; correcte: boolean }[]): string {
  return options.find((o) => o.correcte)!.texte;
}

function reponseAttendue(e: ExerciceTexteTriangle, type: TypeEcran): ReactNode {
  switch (type) {
    case "identifier": {
      const s = e as ExerciceTexteTriangleStandard;
      return <ListeRoles e={s} roles={s.elements.map((el) => el.role)} />;
    }
    case "convertir":
      return <ListeLatex lignes={(e as ExerciceTexteTriangleStandard).conversions.map((c) => `${c.latex} = ${c.calculLatex} = ${degres(c.valeur)}`)} />;
    case "loi":
      return (
        <p style={{ margin: 0 }}>
          <RenduFragments fragments={justificationLoi(e)} />
        </p>
      );
    case "calculer": {
      const s = e as ExerciceTexteTriangleStandard;
      return <Katex expression={`${s.inconnue.latex} \\approx ${n(s.inconnue.valeur, Math.max(s.precision.decimales, 0) + 2)}${uniteLatex(s.unite)}`} />;
    }
    case "repondre":
    case "trancher":
      return <p style={{ margin: 0 }}>{texteOptionCorrecte(e.options)}</p>;
    case "configuration":
      return <p style={{ margin: 0 }}>{texteOptionCorrecte((e as ExerciceDeuxPositions).optionsConfiguration)}</p>;
    case "candidats": {
      const d = e as ExerciceDeuxPositions;
      const N = nomsDeuxPositions(d);
      return <ListeLatex lignes={[`${N.angleB1} \\approx ${degres(d.candidats[0])}`, `${N.angleB2} = 180^\\circ - ${N.angleB1} \\approx ${degres(d.candidats[1])}`]} />;
    }
    case "distances": {
      const d = e as ExerciceDeuxPositions;
      const N = nomsDeuxPositions(d);
      return <ListeLatex lignes={[`${N.PB1} \\approx ${n(d.distances[0])}\\text{ km}`, `${N.PB2} \\approx ${n(d.distances[1])}\\text{ km}`]} />;
    }
  }
}

function champsEcran(e: ExerciceTexteTriangle, type: TypeEcran): ChampNumerique[] {
  if (type === "convertir") return (e as ExerciceTexteTriangleStandard).conversions.map((c) => ({ libelle: [latex(c.latex)], unite: "°" }));
  if (type === "calculer") {
    const s = e as ExerciceTexteTriangleStandard;
    return [{ libelle: [latex(s.inconnue.latex)], unite: s.unite }];
  }
  const d = e as ExerciceDeuxPositions;
  const N = nomsDeuxPositions(d);
  if (type === "candidats")
    return [
      { libelle: [latex(N.angleB1), texte(" (position 1)")], unite: "°" },
      { libelle: [latex(N.angleB2), texte(" (position 2)")], unite: "°" },
    ];
  return [
    { libelle: [latex(N.PB1), texte(" (position 1)")], unite: "km" },
    { libelle: [latex(N.PB2), texte(" (position 2)")], unite: "km" },
  ];
}

function diagnostiquer(e: ExerciceTexteTriangle, type: TypeEcran, saisies: string[]): StatutChamp[] {
  if (type === "convertir") return diagnostiquerConversions(e as ExerciceTexteTriangleStandard, saisies);
  if (type === "calculer") return [diagnostiquerInconnue(e as ExerciceTexteTriangleStandard, saisies[0] ?? "")];
  if (type === "candidats") return diagnostiquerCandidats(e as ExerciceDeuxPositions, [saisies[0] ?? "", saisies[1] ?? ""]);
  return diagnostiquerDistances(e as ExerciceDeuxPositions, [saisies[0] ?? "", saisies[1] ?? ""]);
}

function saisiesLues(champs: ChampNumerique[], saisies: string[]): ReactNode {
  return (
    <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
      {champs.map((c, i) => (
        <li key={i}>
          <RenduFragments fragments={c.libelle} /> : {nombreTexte(lireNombre(saisies[i] ?? "") ?? 0)} {c.unite}
        </li>
      ))}
    </ul>
  );
}

export function AppTexteTriangle() {
  const [etat, setEtat] = useState<EtatTexteTriangle>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [recap, setRecap] = useState<EntreeRecapitulatif[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [statuts, setStatuts] = useState<StatutChamp[] | null>(null);
  const [erreurLecture, setErreurLecture] = useState(false);

  const e = etat.exercice;
  const type = typeEcran(etat);
  const titres = titresEcrans(e);

  function recommencer(exercice: ExerciceTexteTriangle) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setRecap([]);
    setFicheOuverteIndex(null);
    setStatuts(null);
    setErreurLecture(false);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode) {
    const resultat = soumettre(etat, correct);
    setErreurLecture(false);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = reponseAttendue(e, type);
    setHistorique((h) => [...h, ecranClos(titres[etat.ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    const entree = entreeRecap(e, type, resultat.revele);
    if (entree) setRecap((r) => [...r, entree]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: tentativesMax(type) === 1 ? "Ce n'était pas la bonne réponse." : undefined,
      derniere: etat.ecran >= NOMBRE_ECRANS - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceTexteTriangle());
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

  const consigne = <RenduFragments fragments={consigneEcran(e, type)} />;
  const communs = { niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation, aides: aidesEcran(e, type), consigne };

  function choixFerme(options: { texte: string; correcte: boolean }[]) {
    return (
      <EtapeChoixTexteTriangle
        {...communs}
        options={options.map((o) => [texte(o.texte)])}
        indexCorrect={options.findIndex((o) => o.correcte)}
        onValider={(i) => conclure(verifierOption(options, i), <p style={{ margin: 0 }}>{options[i]!.texte}</p>)}
      />
    );
  }

  function ecranCourant(): ReactNode {
    switch (type) {
      case "identifier": {
        const s = e as ExerciceTexteTriangleStandard;
        return <EtapeRolesTexteTriangle {...communs} elements={s.elements} onValider={(choix) => conclure(verifierRoles(s, choix), <ListeRoles e={s} roles={choix} />)} />;
      }
      case "loi": {
        const options = optionsLoi(e);
        const attendue = loiAttendue(e);
        return (
          <EtapeChoixTexteTriangle
            {...communs}
            options={options.map((o) => o.fragments)}
            indexCorrect={options.findIndex((o) => o.id === attendue)}
            onValider={(i) =>
              conclure(
                options[i]!.id === attendue,
                <p style={{ margin: 0 }}>
                  <RenduFragments fragments={options[i]!.fragments} />
                </p>,
              )
            }
          />
        );
      }
      case "repondre":
      case "trancher":
        return choixFerme(e.options);
      case "configuration":
        return choixFerme((e as ExerciceDeuxPositions).optionsConfiguration);
      default: {
        const champs = champsEcran(e, type);
        return (
          <EtapeChampsTexteTriangle
            {...communs}
            idBase={`texte-triangle-${type}`}
            champs={champs}
            tentativesUtilisees={etat.tentativesUtilisees}
            tentativesMax={tentativesMax(type)}
            statuts={statuts}
            erreurLecture={erreurLecture}
            onValider={(saisies) => {
              const diagnostic = diagnostiquer(e, type, saisies);
              if (diagnostic.includes("parse_error")) {
                setErreurLecture(true);
                return;
              }
              setStatuts(diagnostic);
              conclure(
                diagnostic.every((s) => s === "correct"),
                saisiesLues(champs, saisies),
              );
            }}
          />
        );
      }
    }
  }

  const figure = construireFigureTexteTriangle(e, { palette: PALETTE_ECRAN }).replace("<svg ", '<svg style="width:100%;height:auto;display:block;max-width:420px;margin:0 auto;border-radius:8px" ');
  const blocDonnees = (
    <>
      <QuestionFinale question={e.question} />
      <div style={{ marginTop: 12 }} dangerouslySetInnerHTML={{ __html: figure }} />
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Du texte au triangle : problèmes en contexte</h1>
        <p className="app-subtitle">Chapitre 5 — Cercle trigonométrique et triangles quelconques</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          {ECRANS_CALCULATRICE.has(type) && <CalculatriceScientifique />}
          <EnTeteExercice consigneGenerale={e.contexte} blocDonnees={blocDonnees} />
          <RecapitulatifPanel entrees={recap} />
          <Fragment key={`${generation}-${etat.ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
