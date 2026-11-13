import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../export/genererFeuilleExercices";
import { latex, texte } from "../export/fragmentsDocx";
import type { ExerciceNatureQuadrilatere, NatureQuadrilatere } from "./core/natureQuadrilatere.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceNatureQuadrilatere } from "./generateurs/natureQuadrilatere";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { ECRAN_CONCLUSION, NOMBRE_ECRANS, activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatNatureQuadrilatere } from "./moteur/sessionNatureQuadrilatere";
import { natureDe } from "./moteur/modeleNatureQuadrilatere";
import {
  diagnostiquerCritere,
  diagnostiquerEcran1,
  diagnostiquerEcran2,
  lireValeur,
  paireCorrecte,
  paireIllisible,
  verifierNature,
  type DiagnosticPaire,
  type StatutNorme,
} from "./moteur/verificationNatureQuadrilatere";
import {
  LATEX_CRITERE_AB_BC,
  aidesEcran,
  consigneGenerale,
  consignesEcrans,
  donneesFragments,
  libelleNature,
  messageVerdict,
  nombreLatex,
  normeLatex,
  recapitulatifLatex,
  reponseEcran1Latex,
  reponseEcran2Latex,
  reponseEcran3Latex,
  titresEcrans,
  vecLatex,
} from "./ui/formatNatureQuadrilatere";
import { figureNatureQuadrilatereSvg } from "./ui/figureNatureQuadrilatere";
import { ecranClos, saisieEnLatex, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeChampsNatureQuadrilatere, EtapeConclusionNatureQuadrilatere, type SpecChamp } from "./components/EtapesNatureQuadrilatere";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen84 — « Nature d'un quadrilatère » (4e, chapitre 6 « Calcul vectoriel », section
 * `orthogonalite`, processus 2 APPLIQUER). Synthèse de gen26 (norme), gen20/21 (relation
 * vectorielle) et gen25 (orthogonalité). Toujours 4 écrans, quelle que soit la nature :
 * 1. parallélogramme ? composantes de AB et DC (variante « quatrième sommet » : AB puis D) ;
 * 2. composantes de BC, normes de AB et BC (deux côtés consécutifs) ;
 * 3. critère d'orthogonalité de AB et BC ;
 * 4. conclusion (choix fermé, une tentative), avec le récapitulatif des trois résultats.
 * Les écrans 2 et 3 se font même si ABCD n'est pas un parallélogramme : c'est l'écran 4 qui demande
 * de ne pas conclure « rectangle » ou « losange » sans parallélogramme. Aucun point affiché.
 * `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceNatureQuadrilatere {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceNatureQuadrilatere();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceNatureQuadrilatere, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

const PH_COMPOSANTE = "ex : −3";
const PH_NORME = "ex : rac(13)";

function lignesEcran(e: ExerciceNatureQuadrilatere, ecran: number): SpecChamp[][] {
  const paire = (id: string, nom: string): SpecChamp[] => [
    { id: `${id}x`, etiquette: `x_{${nom}} =`, placeholder: PH_COMPOSANTE },
    { id: `${id}y`, etiquette: `y_{${nom}} =`, placeholder: PH_COMPOSANTE },
  ];
  if (ecran === 0) return [paire("ab", "AB"), e.variante === "quatrieme" ? paire("d", "D") : paire("dc", "DC")];
  if (ecran === 1)
    return [
      paire("bc", "BC"),
      [
        { id: "nab", etiquette: `${normeLatex("AB")} =`, placeholder: PH_NORME },
        { id: "nbc", etiquette: `${normeLatex("BC")} =`, placeholder: PH_NORME },
      ],
    ];
  return [[{ id: "crit", etiquette: `${LATEX_CRITERE_AB_BC} =`, placeholder: PH_COMPOSANTE }]];
}

function indicationEcran(ecran: number): string {
  if (ecran === 1) return "Une norme se donne en valeur exacte : un entier, ou une racine écrite rac(13) ou √13 (simplifiée ou non).";
  return "Écris un nombre entier (ou une fraction comme 5/2).";
}

function aideUnicode(v: string): string {
  return v.trim() === "" ? "?" : v;
}

function valeurSaisieLatex(s: string): string {
  const v = lireValeur(s);
  return v === null ? "?" : nombreLatex(Math.round(v * 100) / 100);
}

function paireLatex(x: string, y: string): string {
  return `\\begin{pmatrix} ${valeurSaisieLatex(x)} \\\\ ${valeurSaisieLatex(y)} \\end{pmatrix}`;
}

interface Resultat {
  illisible: boolean;
  correct: boolean;
  champsFaux: Set<string>;
  messages: FragmentConsigne[][];
  votreReponse: ReactNode;
}

function fauxDePaire(d: DiagnosticPaire, id: string, faux: Set<string>) {
  if (d.x !== "correct") faux.add(`${id}x`);
  if (d.y !== "correct") faux.add(`${id}y`);
}

function messageNorme(statut: StatutNorme, nom: string): FragmentConsigne[] | null {
  if (statut === "carre") return [latex(normeLatex(nom)), texte(" : c'est le carré de la norme — n'oublie pas la racine carrée.")];
  if (statut === "approche") return [latex(normeLatex(nom)), texte(" : valeur approchée — donne la valeur exacte, avec une racine.")];
  return null;
}

function evaluerEcran(e: ExerciceNatureQuadrilatere, ecran: number, v: Record<string, string>): Resultat {
  const faux = new Set<string>();
  const messages: FragmentConsigne[][] = [];
  if (ecran === 0) {
    const quatrieme = e.variante === "quatrieme";
    const sec = quatrieme ? "d" : "dc";
    const d = diagnostiquerEcran1(e, { x: v.abx!, y: v.aby! }, { x: v[`${sec}x`]!, y: v[`${sec}y`]! });
    fauxDePaire(d.ab, "ab", faux);
    fauxDePaire(d.second, sec, faux);
    if (d.ab.erreur === "oppose") messages.push([texte("Tu as calculé "), latex(vecLatex("BA")), texte(" : pour "), latex(vecLatex("AB")), texte(", on soustrait les coordonnées de A (l'origine) à celles de B.")]);
    if (d.second.erreur === "oppose") messages.push([texte("Tu as calculé "), latex(vecLatex("CD")), texte(" : on compare "), latex(vecLatex("AB")), texte(" à "), latex(vecLatex("DC")), texte(", de D vers C (même sens de parcours que de A vers B).")]);
    if (d.second.erreur === "cd") messages.push([texte("Avec ce point, "), latex(`${vecLatex("AB")} = ${vecLatex("CD")}`), texte(" : c'est ABDC qui serait un parallélogramme. Pour ABCD, il faut "), latex(`${vecLatex("AB")} = ${vecLatex("DC")}`), texte(".")]);
    const votre = quatrieme
      ? `${vecLatex("AB")} = ${paireLatex(v.abx!, v.aby!)} \\quad D(${valeurSaisieLatex(v.dx!)}\\,;\\,${valeurSaisieLatex(v.dy!)})`
      : `${vecLatex("AB")} = ${paireLatex(v.abx!, v.aby!)} \\quad ${vecLatex("DC")} = ${paireLatex(v.dcx!, v.dcy!)}`;
    return {
      illisible: paireIllisible(d.ab) || paireIllisible(d.second),
      correct: paireCorrecte(d.ab) && paireCorrecte(d.second),
      champsFaux: faux,
      messages,
      votreReponse: <Katex expression={votre} />,
    };
  }
  if (ecran === 1) {
    const d = diagnostiquerEcran2(e, { x: v.bcx!, y: v.bcy! }, v.nab!, v.nbc!);
    fauxDePaire(d.bc, "bc", faux);
    if (d.normeAB !== "correct") faux.add("nab");
    if (d.normeBC !== "correct") faux.add("nbc");
    if (d.bc.erreur === "oppose") messages.push([texte("Tu as calculé "), latex(vecLatex("CB")), texte(" : on veut "), latex(vecLatex("BC")), texte(", de B vers C.")]);
    for (const m of [messageNorme(d.normeAB, "AB"), messageNorme(d.normeBC, "BC")]) if (m) messages.push(m);
    return {
      illisible: paireIllisible(d.bc) || d.normeAB === "parse_error" || d.normeBC === "parse_error",
      correct: paireCorrecte(d.bc) && d.normeAB === "correct" && d.normeBC === "correct",
      champsFaux: faux,
      messages,
      votreReponse: (
        <span>
          <Katex expression={`${vecLatex("BC")} = ${paireLatex(v.bcx!, v.bcy!)}`} /> ; <Katex expression={`${normeLatex("AB")} =`} /> {saisieEnLatex(aideUnicode(v.nab!))} ;{" "}
          <Katex expression={`${normeLatex("BC")} =`} /> {saisieEnLatex(aideUnicode(v.nbc!))}
        </span>
      ),
    };
  }
  const s = diagnostiquerCritere(e, v.crit!);
  if (s !== "correct") faux.add("crit");
  if (s === "signe") messages.push([texte("Le signe est contraire : vérifie que tu as pris "), latex(vecLatex("AB")), texte(" (de A vers B) et "), latex(vecLatex("BC")), texte(" (de B vers C).")]);
  return {
    illisible: s === "parse_error",
    correct: s === "correct",
    champsFaux: faux,
    messages,
    votreReponse: <Katex expression={`${LATEX_CRITERE_AB_BC} = ${valeurSaisieLatex(v.crit!)}`} />,
  };
}

function reponseAttendue(e: ExerciceNatureQuadrilatere, ecran: number): ReactNode {
  if (ecran === 0) return <Katex expression={reponseEcran1Latex(e)} />;
  if (ecran === 1) return <Katex expression={reponseEcran2Latex(e)} />;
  if (ecran === 2) return <Katex expression={reponseEcran3Latex(e)} />;
  return <span>{libelleNature(natureDe(e))}</span>;
}

export function AppNatureQuadrilatere() {
  const [etat, setEtat] = useState<EtatNatureQuadrilatere>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [champsFaux, setChampsFaux] = useState<Set<string> | null>(null);
  const [messages, setMessages] = useState<FragmentConsigne[][]>([]);
  const [erreurLecture, setErreurLecture] = useState(false);

  const e = etat.exercice;
  const ecran = etat.ecran;
  const titres = titresEcrans(e);

  function recommencer(exercice: ExerciceNatureQuadrilatere) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setChampsFaux(null);
    setMessages([]);
    setErreurLecture(false);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode, messageRevele?: string) {
    const resultat = soumettre(etat, correct);
    setErreurLecture(false);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = reponseAttendue(e, ecran);
    setHistorique((h) => [...h, ecranClos(titres[ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({ revele: resultat.revele, reponseAttendue: attendue, messageRevele, derniere: ecran >= NOMBRE_ECRANS - 1 });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceNatureQuadrilatere());
      return;
    }
    setEtat(ecranSuivant(etat));
    setChampsFaux(null);
    setMessages([]);
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
  const communs = { niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation, aides: aidesEcran(e, ecran) };

  function ecranCourant(): ReactNode {
    if (ecran === ECRAN_CONCLUSION) {
      return (
        <EtapeConclusionNatureQuadrilatere
          {...communs}
          consigne={consigne}
          recapitulatif={recapitulatifLatex(e)}
          attendu={natureDe(e)}
          onValider={(choix: NatureQuadrilatere) => conclure(verifierNature(e, choix), <span>{libelleNature(choix)}</span>, verifierNature(e, choix) ? undefined : messageVerdict(e, choix))}
        />
      );
    }
    return (
      <EtapeChampsNatureQuadrilatere
        {...communs}
        consigne={consigne}
        lignes={lignesEcran(e, ecran)}
        indication={indicationEcran(ecran)}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(ecran)}
        champsFaux={champsFaux}
        messages={messages}
        erreurLecture={erreurLecture}
        onValider={(valeurs) => {
          const r = evaluerEcran(e, ecran, valeurs);
          if (r.illisible) {
            setErreurLecture(true);
            return;
          }
          setChampsFaux(r.champsFaux);
          setMessages(r.messages);
          conclure(r.correct, r.votreReponse);
        }}
      />
    );
  }

  // Figure : D apparaît dès que l'écran du quatrième sommet est clos ; codages une fois l'exercice fini.
  const fini = !!enAttente?.derniere;
  const figure = fini ? figureNatureQuadrilatereSvg(e, "corrige") : figureNatureQuadrilatereSvg(e, "enonce", { masquerD: e.variante === "quatrieme" && ecran === 0 && !enAttente });

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={donneesFragments(e)} />
      </p>
      <div dangerouslySetInnerHTML={{ __html: figure }} />
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Nature d'un quadrilatère</h1>
        <p className="app-subtitle">Chapitre 6 — Calcul vectoriel</p>
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
