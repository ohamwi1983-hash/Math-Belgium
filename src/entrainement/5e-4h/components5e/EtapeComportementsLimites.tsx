import { useState } from "react";
import type { ExerciceLectureGraphiqueLimites } from "../core5e/lectureGraphiqueLimites.types";
import { listeComportements } from "../moteur5e/typesLectureGraphiqueLimites";
import { consigneGenerale, consignePhase, labelComportementLatex } from "../ui5e/formatLectureGraphiqueLimites";
import { Katex } from "../components/Katex";
import { LectureGraphiqueLimitesGraph } from "./LectureGraphiqueLimitesGraph";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { aidesLectureGraphique, cibleComportements } from "../ui5e/retoursLectureGraphiqueLimites";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { StatutVerification } from "../moteur/statutVerification";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceLectureGraphiqueLimites;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  diagnostiquer?: (textes: string[]) => StatutVerification[];
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "completerLimites" — un champ par comportement RÉELLEMENT visible sur le graphique (2 à 6
 * selon le tirage), chaque champ accepte une valeur finie OU ±∞ (« −∞ » typographique, ∞, inf…).
 * Pas d'aide : pure lecture graphique, rien à expliquer ou rappeler.
 *
 * Audit 5e ch. 4 : une écriture illisible ne consomme pas de tentative (message de syntaxe propre à
 * cet écran, jamais le message générique qui parle de « * ») ; après une tentative fausse, aucun champ
 * n'est marqué en rouge — un signe ±∞ se gagnerait sinon par élimination, champ par champ. */
export function EtapeComportementsLimites({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation }: Props) {
  const [soumises, setSoumises] = useState<string[] | null>(null);
  const slots = listeComportements(exercice);
  const [valeurs, setValeurs] = useState<string[]>(() => Array(slots.length).fill(""));
  const [illisibles, setIllisibles] = useState<boolean[] | null>(null);
  const complet = valeurs.every((v) => v.trim() !== "");

  function modifier(i: number, valeur: string) {
    setValeurs((arr) => arr.map((v, j) => (j === i ? valeur : v)));
    setIllisibles((arr) => (arr ? arr.map((x, j) => (j === i ? false : x)) : arr));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) {
      const statuts = diagnostiquer(valeurs);
      if (statuts.includes("parse_error")) {
        setIllisibles(statuts.map((s) => s === "parse_error"));
        return;
      }
    }
    setIllisibles(null);
    setSoumises(valeurs);
    onValider(valeurs);
  }

  return (
    <div>
      <EnTeteExercice consigneGenerale={consigneGenerale()} blocDonnees={<LectureGraphiqueLimitesGraph exercice={exercice} />} />
      <p className="prompt-text">{consignePhase("completerLimites")}</p>
      {slots.map((slot, i) => (
        <div key={i} className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor={`limite-${i}`}>
            <Katex expression={labelComportementLatex(exercice, slot.id)} block />
          </label>
          <input
            id={`limite-${i}`}
            type="text"
            className={`text-input${illisibles?.[i] ? " is-erronee" : ""}`}
            value={valeurs[i]}
            onChange={(e) => modifier(i, normaliserSigneMoins(e.target.value))}
            placeholder="ex : 7,5 ou −∞"
            disabled={!!validation}
            autoComplete="off"
          />
        </div>
      ))}
      <PiedEcranFonctions
        aides={aidesLectureGraphique(exercice, "completerLimites")}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={!!illisibles?.some(Boolean)}
        texteIllisible="Écriture non reconnue : tape un nombre (ex. 7,5), +∞ ou −∞ (ou « +inf », « −inf »). Cette saisie ne compte pas comme une tentative."
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={soumises && tentativesUtilisees > 0 ? cibleComportements(exercice, soumises) : null}
        validation={validation}
      />
    </div>
  );
}
