import { Fragment, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../export/genererFeuilleExercices";
import { latex, texte } from "../export/fragmentsDocx";
import type { ExerciceViserCible, OptionVecteur, VerdictDirect } from "./core/viserCible.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceViserCible } from "./generateurs/viserCible";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecransDe, ecranSuivant, soumettre, tentativesMax, typeEcran, type EtatViserCible, type TypeEcranViserCible } from "./moteur/sessionViserCible";
import {
  composantesInversees,
  diagnostiquerComposantes,
  diagnostiquerCondition,
  diagnostiquerParametre,
  diagnostiquerTest,
  verifierConclusionDirecte,
  verifierConclusionInverse,
  verifierVecteur,
  type ReponseTest,
} from "./moteur/verificationViserCible";
import { coefficientK, critere, solutionM, verdictDirect, verdictInverse } from "./moteur/modeleViserCible";
import {
  AC,
  LIBELLES_VECTEURS,
  OPTIONS_CONCLUSION_DIRECTE,
  OPTIONS_CONCLUSION_INVERSE,
  U,
  acLatex,
  aidesEcran,
  colonneLatex,
  conditionSubstitueeLatex,
  consigneEcran,
  consigneGenerale,
  critereSubstitueLatex,
  enonceFragments,
  kLatex,
  libelleConclusionDirecte,
  libelleConclusionInverse,
  nombreLatex,
  reponseAttendueFragments,
  titresEcrans,
  uResoluLatex,
  variablesEnLatex,
  type ChoixConclusionInverse,
} from "./ui/formatViserCible";
import { construireFigureViserCible } from "./ui/figureViserCible";
import type { EntreeRecapitulatif } from "./ui/recapitulatif";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { EtapeChoixViserCible, EtapeComposantesViserCible, EtapeSaisieViserCible, EtapeTestViserCible } from "./components/EtapesViserCible";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen89 — « Viser une cible : trajectoires rectilignes » (4e, chapitre 6 « Calcul vectoriel »,
 * section « colinearite », processus 3 TRANSFÉRER, exercice en contexte). Un objet part de A dans
 * la direction et le sens de u⃗ ; touche-t-il la cible C ? Écrans (sens direct) : 1. quel vecteur
 * comparer à u⃗ (choix fermé, une tentative) ; 2. composantes de AC⃗ ; 3. critère de colinéarité du
 * cours (celui de gen24), colinéaires ?, k tel que AC⃗ = k·u⃗ ; 4. conclure dans le contexte (touche
 * / passe à côté / bonne droite mais mauvais sens — choix fermé). Sens inverse (u⃗ à compléter par
 * m) : 1, 2, puis la condition (équation libre), la valeur de m, et la conclusion (k > 0 : m
 * convient ; k < 0 : aucune valeur ne convient). Aucun point affiché. `?code=` (QR code d'une
 * feuille) : première instance tirée avec les MÊMES fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceViserCible {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceViserCible();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceViserCible, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

const LECTURE_NOMBRE = "Valeur illisible : écris un nombre entier, décimal ou une fraction comme 5/2. Aucune tentative n'est comptée.";

function recapitulatif(e: ExerciceViserCible, historique: EcranClos[]): EntreeRecapitulatif[] {
  const types = ecransDe(e);
  const entrees: EntreeRecapitulatif[] = [];
  historique.forEach((h, i) => {
    const revele = !h.entree.correcte;
    switch (types[i]) {
      case "composantes":
        entrees.push({ libelle: "Composantes", valeur: acLatex(e), estLatex: true, revele });
        break;
      case "test":
        entrees.push({ libelle: "Critère", valeur: `${critereSubstitueLatex(e)} = ${nombreLatex(critere(e))}`, estLatex: true, revele });
        if (coefficientK(e)) entrees.push({ libelle: "Coefficient", valeur: `${AC} = ${kLatex(e)} \\cdot ${U}`, estLatex: true, revele });
        break;
      case "condition":
        entrees.push({ libelle: "Condition", valeur: conditionSubstitueeLatex(e), estLatex: true, revele });
        break;
      case "parametre":
        entrees.push({ libelle: "Valeur de m", valeur: `m = ${nombreLatex(solutionM(e))}, \\ ${uResoluLatex(e)}`, estLatex: true, revele });
        break;
      default:
        break;
    }
  });
  return entrees;
}

export function AppViserCible() {
  const [etat, setEtat] = useState<EtatViserCible>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [messageErreur, setMessageErreur] = useState<FragmentConsigne[] | null>(null);
  const [erreurLecture, setErreurLecture] = useState<string | null>(null);
  const [champsFaux, setChampsFaux] = useState<{ x: boolean; y: boolean; critere: boolean; k: boolean }>({ x: false, y: false, critere: false, k: false });

  const e = etat.exercice;
  const type: TypeEcranViserCible = typeEcran(etat);
  const total = ecransDe(e).length;
  const titres = titresEcrans(e);

  function reinitialiserMessages() {
    setMessageErreur(null);
    setErreurLecture(null);
    setChampsFaux({ x: false, y: false, critere: false, k: false });
  }

  function recommencer(exercice: ExerciceViserCible) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    reinitialiserMessages();
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode, options: { clore?: boolean; messageRevele?: string } = {}) {
    const resultat = soumettre(etat, correct, options.clore);
    setErreurLecture(null);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = <RenduFragments fragments={reponseAttendueFragments(e, type)} />;
    setHistorique((h) => [...h, ecranClos(titres[etat.ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: options.messageRevele ?? (tentativesMax(type) === 1 ? "Ce n'était pas le bon choix." : undefined),
      derniere: etat.ecran >= total - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceViserCible());
      return;
    }
    setEtat(ecranSuivant(etat));
    reinitialiserMessages();
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

  // Une fois le dernier écran clos, la figure montre la trajectoire prolongée (comme le corrigé).
  const fini = historique.length >= total;
  const figure = useMemo(() => construireFigureViserCible(e, { theme: "ecran", corrige: fini }), [e, fini]);

  const consigne = <RenduFragments fragments={consigneEcran(e, type)} />;
  const communs = { niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation, aides: aidesEcran(e, type) };
  const messages = { tentativesUtilisees: etat.tentativesUtilisees, tentativesMax: tentativesMax(type), messageErreur, erreurLecture };

  function ecranCourant(): ReactNode {
    switch (type) {
      case "vecteur":
        return (
          <EtapeChoixViserCible<OptionVecteur>
            {...communs}
            consigne={consigne}
            options={e.ordreVecteurs.map((o) => ({ id: o, contenu: <Katex expression={LIBELLES_VECTEURS[o]} /> }))}
            attendu="AC"
            onValider={(choix) => conclure(verifierVecteur(choix), <Katex expression={LIBELLES_VECTEURS[choix]} />)}
          />
        );
      case "composantes":
        return (
          <EtapeComposantesViserCible
            {...communs}
            {...messages}
            consigne={consigne}
            faux={{ x: champsFaux.x, y: champsFaux.y }}
            onValider={(tx, ty) => {
              const d = diagnostiquerComposantes(e, tx, ty);
              if (d.x === "parse_error" || d.y === "parse_error") {
                setErreurLecture(LECTURE_NOMBRE);
                return;
              }
              setChampsFaux({ ...champsFaux, x: d.x !== "correct", y: d.y !== "correct" });
              setMessageErreur(
                composantesInversees(e, tx, ty)
                  ? [texte("Tu as calculé les composantes de "), latex("\\vec{CA}"), texte(" : celles de "), latex(AC), texte(" s'obtiennent en faisant « C moins A ».")]
                  : [texte("Le champ en rouge est faux : extrémité moins origine, coordonnée par coordonnée.")],
              );
              conclure(d.x === "correct" && d.y === "correct", <Katex expression={`${AC}${colonneLatex(tx.trim(), ty.trim())}`} />);
            }}
          />
        );
      case "test":
        return (
          <EtapeTestViserCible
            {...communs}
            {...messages}
            consigne={consigne}
            faux={{ critere: champsFaux.critere, k: champsFaux.k }}
            onValider={(r: ReponseTest) => {
              const d = diagnostiquerTest(e, r);
              if (d.statut === "parse_error") {
                setErreurLecture(LECTURE_NOMBRE);
                return;
              }
              setChampsFaux({ ...champsFaux, critere: d.statut === "critere_faux", k: d.statut === "k_faux" });
              if (d.statut === "critere_faux") setMessageErreur([texte("Le critère est faux : vérifie les deux produits et les signes.")]);
              if (d.statut === "k_faux") {
                setMessageErreur(variablesEnLatex(
                  d.motif === "inverse"
                    ? [texte("Attention à l'ordre : on cherche "), latex("k"), texte(" tel que "), latex(`${AC} = k \\cdot ${U}`), texte(", pas "), latex(`${U} = k \\cdot ${AC}`), texte(".")]
                    : d.motif === "signe"
                      ? [texte("Le signe de k est faux : compare le signe d'une composante de "), latex(AC), texte(" et de la même composante de "), latex(U), texte(".")]
                      : [texte("k est faux : compare une composante de "), latex(AC), texte(" à la même composante de "), latex(U), texte(".")],
                ));
              }
              const saisie = (
                <span>
                  critère {r.critere.trim()} — {r.colineaires ? "colinéaires" : "non colinéaires"}
                  {r.colineaires ? `, k = ${r.k.trim()}` : ""}
                </span>
              );
              conclure(d.statut === "correct", saisie, d.statut === "conclusion_fausse" ? { clore: true, messageRevele: "Le critère était juste, mais pas la conclusion sur la colinéarité." } : {});
            }}
          />
        );
      case "condition":
        return (
          <EtapeSaisieViserCible
            {...communs}
            {...messages}
            consigne={consigne}
            libelle={<span>Condition :</span>}
            placeholder="ex : 2·5 − m·3 = 0"
            indication="Une équation avec le signe =, en m : nombres, m, +, −, · ou *, parenthèses."
            onValider={(t) => {
              const statut = diagnostiquerCondition(e, t);
              if (statut === "parse_error") {
                setErreurLecture("Équation illisible : utilise des nombres, m, +, −, · ou *, et des parenthèses. Aucune tentative n'est comptée.");
                return;
              }
              if (statut === "sans_egal") {
                setErreurLecture("Écris une équation, avec le signe = (par exemple « … = 0 »). Aucune tentative n'est comptée.");
                return;
              }
              setMessageErreur([texte("Ce n'est pas la condition de colinéarité : reprends le critère avec les composantes de "), latex(U), texte(" et de "), latex(AC), texte(".")]);
              conclure(statut === "correct", <span>{t.trim().replace(/-/g, "−").replace(/\*/g, "·")}</span>);
            }}
          />
        );
      case "parametre":
        return (
          <EtapeSaisieViserCible
            {...communs}
            {...messages}
            consigne={consigne}
            libelle={<Katex expression="m =" />}
            placeholder="ex : 5/2"
            indication="Un nombre entier, décimal ou une fraction comme 5/2."
            onValider={(t) => {
              const statut = diagnostiquerParametre(e, t);
              if (statut === "parse_error") {
                setErreurLecture(LECTURE_NOMBRE);
                return;
              }
              setMessageErreur([texte("Valeur fausse : remplace "), latex("m"), texte(" par ta valeur dans la condition, elle doit donner 0.")]);
              conclure(statut === "correct", <Katex expression={`m = ${t.trim()}`} />);
            }}
          />
        );
      case "conclusion":
        if (e.sens === "directe") {
          return (
            <EtapeChoixViserCible<VerdictDirect>
              {...communs}
              consigne={consigne}
              enColonne
              options={OPTIONS_CONCLUSION_DIRECTE.map((v) => ({ id: v, contenu: libelleConclusionDirecte(e, v) }))}
              attendu={verdictDirect(e)}
              onValider={(choix) => conclure(verifierConclusionDirecte(e, choix), <span>{libelleConclusionDirecte(e, choix)}</span>)}
            />
          );
        }
        return (
          <EtapeChoixViserCible<ChoixConclusionInverse>
            {...communs}
            consigne={consigne}
            enColonne
            options={OPTIONS_CONCLUSION_INVERSE.map((v) => ({ id: v, contenu: <RenduFragments fragments={libelleConclusionInverse(e, v)} /> }))}
            attendu={verdictInverse(e)}
            onValider={(choix) => conclure(verifierConclusionInverse(e, choix), <RenduFragments fragments={libelleConclusionInverse(e, choix)} />)}
          />
        );
    }
  }

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={enonceFragments(e)} />
      </p>
      <div className="viser-cible-figure" style={{ maxWidth: 440, margin: "10px auto 0" }} dangerouslySetInnerHTML={{ __html: figure }} />
      <p className="triangle-quelconque-legende" style={{ textAlign: "center", margin: "2px 0 0" }}>
        {fini ? "Trajectoire prolongée (pointillés) et vecteur AC." : e.sens === "directe" ? "Figure à l'échelle : la flèche représente u." : "Figure à l'échelle."}
      </p>
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Viser une cible : trajectoires rectilignes</h1>
        <p className="app-subtitle">Chapitre 6 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, total, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={<RenduFragments fragments={consigneGenerale(e)} />} blocDonnees={blocDonnees} />
          <RecapitulatifPanel entrees={recapitulatif(e, historique)} />
          <Fragment key={`${generation}-${etat.ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
