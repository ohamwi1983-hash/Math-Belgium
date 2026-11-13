import { useState } from "react";
import type { ExerciceGraphiqueContexte, QuestionGraphique, ReponseLectureGraphique, TypeQuestionGraphique } from "../core/graphiqueContexte.types";
import { TEXTES_CONTEXTES } from "../generateurs/graphiqueContexte/contextes";
import { NIVEAU_AIDE_MAX, verifierLecture } from "../moteur/sessionGraphiqueContexte";
import { CONSIGNE_TYPE, LIBELLE_TYPE, ORDRE_TYPES, TEXTE_AIDE_NIVEAU2, texteAideNiveau1 } from "../ui/formatGraphiqueContexte";
import { construireListe, etatListeInitiale } from "../ui/listeMorceaux";
import type { EtatListeMorceaux } from "../ui/listeMorceaux";
import { formatMessageErreur } from "../ui/messageErreur";
import { BoutonAide } from "./BoutonAide";
import { ListeMorceauxInput } from "./ListeMorceauxInput";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * gen70 — les deux écrans d'une question « graphique en contexte ». La question (langage courant)
 * est rappelée en tête de chaque écran ; le graphique reste dans l'en-tête (`EnTeteExercice`, voir
 * `AppGraphiqueContexte.tsx`). Les champs sont remis à zéro à chaque écran (clé de montage).
 */

function QuestionRappel({ numero, total, texte }: { numero: number; total: number; texte: string }) {
  return (
    <p className="prompt-text">
      <strong>
        Question {numero} sur {total} :
      </strong>{" "}
      {texte}
    </p>
  );
}

interface PropsType {
  numero: number;
  total: number;
  question: QuestionGraphique;
  texteQuestion: string;
  onValider: (type: TypeQuestionGraphique) => void;
  validation?: ValidationEtapeProps | null;
}

/** Écran 1 d'une question : la caractéristique demandée — choix fermé, une seule tentative. */
export function EtapeTypeGraphique({ numero, total, question, texteQuestion, onValider, validation }: PropsType) {
  const [choix, setChoix] = useState<TypeQuestionGraphique | null>(null);
  const fige = Boolean(validation);
  return (
    <div>
      <QuestionRappel numero={numero} total={total} texte={texteQuestion} />
      <p className="prompt-text">{CONSIGNE_TYPE}</p>
      <div className="options-grid">
        {ORDRE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            disabled={fige}
            className={`btn${choix === type ? " toggle-active" : ""}${fige && choix === type && type !== question.type ? " is-erronee" : ""}`}
            onClick={() => setChoix(type)}
          >
            {LIBELLE_TYPE[type]}
          </button>
        ))}
      </div>
      {!validation && (
        <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix && onValider(choix)}>
          Valider
        </button>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

function lireNombre(texte: string): number | null {
  const t = texte.trim().replace(/[−–]/g, "-").replace(",", ".");
  if (t === "" || t === "-" || t === "." || t === "-.") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Liste « 6 ; 18 » → [6, 18] ; `null` si une valeur est illisible. */
function lireListe(texte: string): number[] | null {
  const morceaux = texte.split(";").map((m) => m.trim()).filter((m) => m !== "");
  if (morceaux.length === 0) return null;
  const valeurs = morceaux.map(lireNombre);
  return valeurs.some((v) => v === null) ? null : (valeurs as number[]);
}

function filtrerListe(valeur: string): string {
  return valeur.replace(/[−–—]/g, "-");
}

interface ChampProps {
  id: string;
  label: string;
  unite: string;
  valeur: string;
  onChange: (v: string) => void;
  erronee: boolean;
  liste?: boolean;
}

/** Libellé au-dessus, champ + unité sur la ligne suivante : tient à 390 px même avec un libellé long
 * (« Nombre de personnes le plus grand »). */
function ChampNombre({ id, label, unite, valeur, onChange, erronee, liste }: ChampProps) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input
          id={id}
          className={`text-input${erronee ? " is-erronee" : ""}`}
          style={{ flex: 1, minWidth: 0 }}
          autoComplete="off"
          value={valeur}
          onChange={(e) => onChange(liste ? filtrerListe(e.target.value) : normaliserSigneMoins(e.target.value))}
        />
        {unite && <span style={{ flex: "none", fontWeight: 600 }}>{unite}</span>}
      </div>
    </div>
  );
}

interface PropsLecture {
  numero: number;
  total: number;
  exercice: ExerciceGraphiqueContexte;
  question: QuestionGraphique;
  texteQuestion: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseLectureGraphique) => void;
  validation?: ValidationEtapeProps | null;
}

/** Écran 2 d'une question : la lecture (valeur avec unité, liste de valeurs ou intervalles). */
export function EtapeLectureGraphique({
  numero,
  total,
  exercice,
  question,
  texteQuestion,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  onActiverAide,
  onValider,
  validation,
}: PropsLecture) {
  const t = TEXTES_CONTEXTES[exercice.contexte];
  const [valeur, setValeur] = useState("");
  const [moment, setMoment] = useState("");
  const [liste, setListe] = useState<EtatListeMorceaux>(etatListeInitiale());

  let reponse: ReponseLectureGraphique | null = null;
  switch (question.type) {
    case "image":
    case "tendance": {
      const v = lireNombre(valeur);
      reponse = v === null ? null : question.type === "image" ? { type: "image", valeur: v } : { type: "tendance", valeur: v };
      break;
    }
    case "antecedent": {
      const v = lireListe(valeur);
      reponse = v === null ? null : { type: "antecedent", valeurs: v };
      break;
    }
    case "extremum": {
      const m = lireNombre(moment);
      const v = lireNombre(valeur);
      reponse = m === null || v === null ? null : { type: "extremum", moment: m, valeur: v };
      break;
    }
    case "inequation":
    case "variation": {
      const morceaux = construireListe(liste);
      reponse = morceaux === null ? null : question.type === "inequation" ? { type: "inequation", morceaux } : { type: "variation", morceaux };
      break;
    }
  }

  const apresEchec = tentativesUtilisees > 0 && !validation;
  const fausse = tentativesUtilisees > 0 && (reponse === null || !verifierLecture(question, reponse));
  const momentFaux = question.type === "extremum" && tentativesUtilisees > 0 && lireNombre(moment) !== question.x;
  const valeurFausse = question.type === "extremum" ? tentativesUtilisees > 0 && lireNombre(valeur) !== question.y : fausse;
  const idBase = `g70-${numero}`;

  return (
    <div>
      <QuestionRappel numero={numero} total={total} texte={texteQuestion} />
      <fieldset disabled={Boolean(validation)} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        {(question.type === "image" || question.type === "tendance") && (
          <ChampNombre id={`${idBase}-valeur`} label="Réponse" unite={t.uniteY} valeur={valeur} onChange={setValeur} erronee={valeurFausse} />
        )}
        {question.type === "antecedent" && (
          <>
            <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)" }}>
              S'il y a plusieurs valeurs, sépare-les par « ; ».
            </p>
            <ChampNombre id={`${idBase}-valeur`} label="Réponse" unite={t.uniteX} valeur={valeur} onChange={setValeur} erronee={valeurFausse} liste />
          </>
        )}
        {question.type === "extremum" && (
          <div>
            <ChampNombre id={`${idBase}-moment`} label={t.libelleMoment} unite={t.uniteX} valeur={moment} onChange={setMoment} erronee={momentFaux} />
            <ChampNombre
              id={`${idBase}-valeur`}
              label={t.libelleValeurExtremum(question.nature)}
              unite={t.uniteY}
              valeur={valeur}
              onChange={setValeur}
              erronee={valeurFausse}
            />
          </div>
        )}
        {(question.type === "inequation" || question.type === "variation") && (
          <>
            <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)" }}>
              Écris la réponse sous forme d'intervalle(s), en {t.uniteX} ; s'il y a plusieurs intervalles, utilise « + Ajouter un morceau ».
            </p>
            <ListeMorceauxInput etat={liste} onChange={setListe} />
          </>
        )}
      </fieldset>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideNiveau1(question)}</p>
          {niveauAide > 1 && <p>{TEXTE_AIDE_NIVEAU2}</p>}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={reponse === null} onClick={() => reponse && onValider(reponse)}>
            Valider
          </button>
          {apresEchec && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax)}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
