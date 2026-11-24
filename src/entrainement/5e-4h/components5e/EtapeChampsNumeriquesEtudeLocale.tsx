import { useEffect, useState } from "react";
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
import { consigneGeneraleEtudeLocale, consigneEcranEtudeLocale, formatTermesDonneesLatex, questionFinaleEtudeLocale } from "../ui5e/formatEtudeLocale";

interface Props {
  exercice: ExerciceEtudeLocale;
  phase: "extremums" | "inflexions";
  labels: string[];
  placeholders: string[];
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

/** Écran générique "N champs numériques FIGÉS, vérifiés comme un ENSEMBLE" — réutilisé par
 * "extremums"/"inflexions" (nombre de champs TOUJOURS connu à l'avance, dérivé des racines déjà
 * classifiées à l'écran précédent — jamais add-as-needed ici). Les écrans "resoudreFPrime"/
 * "resoudreFSeconde" utilisent désormais `EtapeZerosDeriveeEtudeLocale` (choix "Aucun zéro"/"Au
 * moins un zéro" + add-as-needed, `prompt5gen29corrections.md`) — forme réellement différente,
 * jamais forcée dans la même abstraction (CLAUDE.md, "ne pas forcer une abstraction commune").
 */
export function EtapeChampsNumeriquesEtudeLocale({
  exercice,
  phase,
  labels,
  placeholders,
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
  const nb = labels.length;
  const [valeurs, setValeurs] = useState<string[]>(() => new Array(nb).fill(""));
  useEffect(() => {
    setValeurs(new Array(nb).fill(""));
  }, [nb]);
  const [soumises, setSoumises] = useState<string[] | null>(null);
  const [avertissement, setAvertissement] = useState<string | null>(null);
  const complet = valeurs.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? valeurs.map((v) => diagnostiquer(v)) : null;

  function modifier(i: number, valeur: string) {
    setValeurs((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    const message = controlerSaisie ? controlerSaisie(valeurs) : null;
    setAvertissement(message);
    if (message) return;
    setSoumises(valeurs);
    onValider(valeurs);
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
      {labels.map((label, i) => (
        <div key={i} className="field field-inline">
          <label className="field-label field-label-minuscule">
            <Katex expression={label} />
          </label>
          <input
            type="text"
            className={`text-input${statuts && statuts[i] !== "correct" ? " is-erronee" : ""}`}
            value={valeurs[i]}
            onChange={(e) => modifier(i, e.target.value)}
            placeholder={placeholders[i] ?? ""}
          />
        </div>
      ))}
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
