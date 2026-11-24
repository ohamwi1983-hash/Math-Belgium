import { useState } from "react";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import type { AideTrig } from "../ui5e/aidesTrigonometrie";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceEtudeLocale } from "../core5e/etudeLocale.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import {
  consigneGeneraleEtudeLocale,
  consigneEcranEtudeLocale,
  formatTermesDonneesLatex,
  labelsChampsRacines,
  placeholdersChampsRacines,
  questionFinaleEtudeLocale,
} from "../ui5e/formatEtudeLocale";

interface Props {
  exercice: ExerciceEtudeLocale;
  phase: "resoudreFPrime" | "resoudreFSeconde";
  /** Ajoutée à la fin de la consigne d'écran si non nulle — voir CLAUDE.md, "Annonce de précision =
   * tolérance réellement vérifiée". */
  precisionAnnoncee: string | null;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponses: string[]) => void;
  /** Diagnostic PAR CHAMP — correct si la valeur saisie correspond à N'IMPORTE LAQUELLE des cibles
   * attendues (ensemble, ordre indifférent). */
  diagnostiquer?: (texte: string) => StatutVerification;
  /** Contrôle de FORME avant soumission (saisie illisible, arrondi d'une valeur rationnelle) :
   * renvoie le message à afficher, la tentative n'est PAS décomptée (audit 5e ch. 5, décision I). */
  controlerSaisie?: (reponses: string[]) => string | null;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
  /** Message ciblé sur l'erreur trahie par la dernière réponse fausse (lot B). */
  cible?: (valeurs: string[]) => FragmentConsigne[] | null;
  /** Aides à deux niveaux (niveau 2 posé pour l'instance). */
  aides: AideTrig[];
}

/** Écrans "resoudreFPrime"/"resoudreFSeconde" — choix initial "Aucun zéro"/"Au moins un zéro"
 * (`.options-grid` + `.btn.toggle-active`), puis pattern ADD-AS-NEEDED (`useState<string[]>([""])`,
 * bouton "+Ajouter un zéro") si "Au moins un zéro" — jamais un nombre de champs figé à la
 * génération, même patron que `EtapeRacinesTangente.tsx` (5gen28). Contrairement aux écrans
 * "extremums"/"inflexions" (nombre de champs TOUJOURS connu à l'avance, dérivé de racines déjà
 * classifiées) — ce générateur ne produit jamais 0 zéro réel pour f'/f'', mais le choix reste posé
 * explicitement à l'élève (jamais déduit implicitement du nombre de champs affichés). Liste révélée
 * portant `.contenu-conditionnel` (espacement bouton → contenu conditionnel, CLAUDE.md). */
export function EtapeZerosDeriveeEtudeLocale({
  exercice,
  phase,
  precisionAnnoncee,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
  controlerSaisie,
  cible,
  aides,
  validation,
}: Props) {
  const [choix, setChoix] = useState<"aucun" | "au_moins_un" | null>(null);
  const [valeurs, setValeurs] = useState<string[]>([""]);
  const [soumises, setSoumises] = useState<string[] | null>(null);
  const [avertissement, setAvertissement] = useState<string | null>(null);
  const apresEchec = tentativesUtilisees > 0;
  const complet = choix === "aucun" || (choix === "au_moins_un" && valeurs.length > 0 && valeurs.every((v) => v.trim() !== ""));
  const statuts = apresEchec && diagnostiquer && choix === "au_moins_un" && complet ? valeurs.map((v) => diagnostiquer(v)) : null;
  const labels = labelsChampsRacines(valeurs.length);
  const placeholders = placeholdersChampsRacines(valeurs.length);

  function choisir(nouveauChoix: "aucun" | "au_moins_un") {
    setChoix(nouveauChoix);
    if (nouveauChoix === "au_moins_un") setValeurs([""]);
  }
  function ajouter() {
    setValeurs((arr) => [...arr, ""]);
  }
  function retirer(i: number) {
    setValeurs((arr) => arr.filter((_, j) => j !== i));
  }
  function modifier(i: number, valeur: string) {
    setValeurs((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    const reponses = choix === "aucun" ? [] : valeurs;
    const message = controlerSaisie && reponses.length > 0 ? controlerSaisie(reponses) : null;
    setAvertissement(message);
    if (message) return;
    setSoumises(reponses);
    onValider(reponses);
  }

  const consigne = precisionAnnoncee ? `${consigneEcranEtudeLocale(phase)} ${precisionAnnoncee}` : consigneEcranEtudeLocale(phase);

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGeneraleEtudeLocale(exercice)}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            {formatTermesDonneesLatex(exercice).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        }
      />
      <QuestionFinale question={questionFinaleEtudeLocale(exercice)} />
      <p className="prompt-text">{consigne}</p>
      <div className="options-grid">
        <button type="button" className={choix === "aucun" ? "btn toggle-active" : "btn"} onClick={() => choisir("aucun")}>
          Aucun zéro
        </button>
        <button type="button" className={choix === "au_moins_un" ? "btn toggle-active" : "btn"} onClick={() => choisir("au_moins_un")}>
          Au moins un zéro
        </button>
      </div>
      {choix === "au_moins_un" && (
        <div className="contenu-conditionnel">
          {valeurs.map((v, i) => (
            <div key={i} className="field-row">
              <label className="field-label field-label-minuscule">
                <Katex expression={labels[i]} />
              </label>
              <input
                type="text"
                className={`text-input${statuts && statuts[i] !== "correct" ? " is-erronee" : ""}`}
                value={v}
                onChange={(e) => modifier(i, e.target.value)}
                placeholder={placeholders[i]}
              />
              {valeurs.length > 1 && (
                <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => retirer(i)}>
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn liste-morceaux-ajouter" onClick={ajouter}>
            + Ajouter un zéro
          </button>
        </div>
      )}
      <CalculatriceScientifique />
      <PiedEcranFonctions
        aides={aides}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={avertissement !== null}
        texteIllisible={avertissement ?? ""}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={soumises !== null && tentativesUtilisees > 0 && cible ? cible(soumises) : null}
        validation={validation}
      />
    </div>
  );
}
