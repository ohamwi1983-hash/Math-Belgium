import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { RenduFragments } from "../../4e/components/RenduFragments";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { AideTrig } from "../ui5e/aidesTrigonometrie";
import { PiedEcranFonctions } from "./PiedEcranFonctions";

/**
 * Écran de saisie générique du 5e ch. 4 (5gen20–5gen24, lots B–D — règles communes, modèle du 5e
 * ch. 1) : consigne en KaTeX, un ou plusieurs champs texte (frappe jamais bloquée, seul
 * `normaliserSigneMoins` est appliqué), aides à deux niveaux, puis le pied commun
 * (`PiedEcranFonctions`) : saisie illisible ou approchée → message, AUCUNE tentative (le moteur la
 * refuse aussi) ; contrôle de forme sans tentative ; message ciblé + « Incorrect — tentative n/3 ».
 */
export interface ChampSaisieLimites {
  label: string;
  placeholder?: string;
  /** Aperçu KaTeX de la saisie (expressions), précédé de ce libellé en texte simple. */
  apercu?: boolean;
  libelleApercu?: string;
}

interface Props {
  enTete: ReactNode;
  consigne: FragmentConsigne[];
  /** Formule affichée sous la consigne (mode display). */
  formule?: string;
  /** Contenu entre la consigne et les champs (figure, choix « aucun »…). */
  avantChamps?: ReactNode;
  champs: ChampSaisieLimites[];
  /** Valeur initiale des champs (rarement utile). */
  initiales?: string[];
  aides: AideTrig[];
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Texte du message d'illisible (déjà terminé par « … ne compte pas comme une tentative. »). */
  texteIllisible: (valeurs: string[]) => string;
  /** Vrai si la saisie doit être refusée sans tentative (illisible ou approchée). */
  illisible: (valeurs: string[]) => boolean;
  /** Message affiché sans consommer de tentative (forme à reprendre…), null sinon. */
  controleSansTentative?: (valeurs: string[]) => ReactNode | null;
  /** Message ciblé sur l'erreur trahie par la dernière réponse fausse. */
  cible?: (valeurs: string[]) => FragmentConsigne[] | null;
  /** Champs marqués « erronés » après une tentative (par défaut : aucun). */
  erronees?: (valeurs: string[]) => boolean[];
  /** Le champ i peut rester vide (ex. « aucun » choisi). */
  vide?: (valeurs: string[]) => boolean;
  onValider: (valeurs: string[]) => void;
  validation?: ValidationEtapeProps | null;
}

export function EcranSaisieLimites(props: Props) {
  const { enTete, consigne, formule, avantChamps, champs, aides, niveauAide, niveauAideMax, onActiverAide, tentativesUtilisees, tentativesMax, validation } = props;
  const [valeurs, setValeurs] = useState<string[]>(() => props.initiales ?? champs.map(() => ""));
  const [illisible, setIllisible] = useState(false);
  const [sansTentative, setSansTentative] = useState<ReactNode | null>(null);
  const [soumises, setSoumises] = useState<string[] | null>(null);
  const vide = props.vide ? props.vide(valeurs) : valeurs.some((v) => v.trim() === "");
  const montrer = tentativesUtilisees > 0 && soumises !== null;
  const erronees = montrer && props.erronees ? props.erronees(valeurs) : champs.map(() => false);

  function valider() {
    if (vide) return;
    if (props.illisible(valeurs)) {
      setIllisible(true);
      setSansTentative(null);
      return;
    }
    setIllisible(false);
    const message = props.controleSansTentative?.(valeurs) ?? null;
    setSansTentative(message);
    if (message) return;
    setSoumises(valeurs);
    props.onValider(valeurs);
  }

  return (
    <div>
      {enTete}
      <p className="prompt-text">
        <RenduFragments fragments={consigne} />
      </p>
      {formule && (
        <div className="equation-box">
          <Katex expression={formule} block />
        </div>
      )}
      {avantChamps}
      {champs.map((champ, i) => (
        <div key={i}>
          {champ.apercu && <ApercuExpressionLatex texte={valeurs[i]} label={champ.libelleApercu} />}
          <div className="field field-inline">
            <label className="field-label field-label-minuscule">
              <Katex expression={champ.label} />
            </label>
            <input
              type="text"
              className={`text-input${erronees[i] || (illisible && valeurs[i].trim() !== "") ? " is-erronee" : ""}`}
              value={valeurs[i]}
              placeholder={champ.placeholder}
              disabled={!!validation}
              autoComplete="off"
              onChange={(e) => {
                const v = normaliserSigneMoins(e.target.value);
                setValeurs((arr) => arr.map((x, j) => (j === i ? v : x)));
                setIllisible(false);
                setSansTentative(null);
              }}
            />
          </div>
        </div>
      ))}
      <PiedEcranFonctions
        aides={aides}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={vide}
        illisible={illisible}
        texteIllisible={props.texteIllisible(valeurs)}
        messageSansTentative={sansTentative}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={montrer && props.cible && soumises ? props.cible(soumises) : null}
        validation={validation}
      />
    </div>
  );
}

/** Écran à choix fermé (une seule tentative) : options en KaTeX, une ou plusieurs questions. */
interface PropsChoix<T extends string> {
  enTete: ReactNode;
  consigne: FragmentConsigne[];
  avantChoix?: ReactNode;
  questions: { label?: FragmentConsigne[]; options: { id: T; fragments: FragmentConsigne[] }[] }[];
  aides: AideTrig[];
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (choix: T[]) => void;
  validation?: ValidationEtapeProps | null;
}

export function EcranChoixLimites<T extends string>(props: PropsChoix<T>) {
  const { enTete, consigne, avantChoix, questions, aides, niveauAide, niveauAideMax, onActiverAide, tentativesUtilisees, tentativesMax, validation } = props;
  const [choix, setChoix] = useState<(T | null)[]>(() => questions.map(() => null));
  const complet = choix.every((c) => c !== null);
  return (
    <div>
      {enTete}
      <p className="prompt-text">
        <RenduFragments fragments={consigne} />
      </p>
      {avantChoix}
      {questions.map((q, i) => (
        <div key={i}>
          {q.label && (
            <p className="prompt-text">
              <RenduFragments fragments={q.label} />
            </p>
          )}
          <div className="options-grid">
            {q.options.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`btn${choix[i] === o.id ? " toggle-active" : ""}`}
                aria-pressed={choix[i] === o.id}
                disabled={!!validation}
                onClick={() => setChoix((arr) => arr.map((c, j) => (j === i ? o.id : c)))}
              >
                <RenduFragments fragments={o.fragments} />
              </button>
            ))}
          </div>
        </div>
      ))}
      <PiedEcranFonctions
        aides={aides}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={() => complet && props.onValider(choix as T[])}
        vide={!complet}
        illisible={false}
        texteIllisible=""
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        validation={validation}
      />
    </div>
  );
}
