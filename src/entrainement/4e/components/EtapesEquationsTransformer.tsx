import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { FonctionTrig } from "../core/equationsTransformer.types";
import { BoutonAide } from "./BoutonAide";
import { RenduFragments } from "./RenduFragments";
import { Katex } from "./Katex";
import { CercleTrigBase } from "./CercleTrigBase";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { calculerAideCandidats, calculerAideProjections, calculerAideQuadrants, phraseLocalisationSolutions } from "../ui/quelAngleAide";
import { CENTRE_CERCLE_TRIG, HAUTEUR_CERCLE_TRIG, RAYON_CERCLE_TRIG } from "../ui/cercleTrigGeometrie";

/**
 * Écrans de gen78 (« Équations trigonométriques à transformer »). Mêmes briques que gen18
 * (« Quel angle ? ») : choix « Pas de solution / Au moins une solution » (choix fermé, une seule
 * tentative), liste de solutions à compléter (« + Ajouter une solution »), et le cercle
 * trigonométrique de son aide (quadrants surlignés, candidats fléchés, projections). Champs libres :
 * jamais de blocage de frappe (seulement `normaliserSigneMoins`). Aucun point affiché.
 */

interface PropsCommuns {
  consigne: ReactNode;
  aides: FragmentConsigne[][];
  /** Dernier palier d'aide : le cercle trigonométrique (écran « solutions »). */
  cercle?: { fonction: FonctionTrig; solutions: number[] };
  niveauAide: number;
  onActiverAide: () => void;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Message d'erreur courant (tentative ratée, ou saisie illisible) — `null` sinon. */
  message: string | null;
  validation?: ValidationEtapeProps | null;
}

// ---------------------------------------------------------------------------------------------
// Briques
// ---------------------------------------------------------------------------------------------

/** Cercle de l'aide de gen18, réutilisé tel quel (quadrants, candidats, projections). */
function CercleAide({ fonction, solutions }: { fonction: FonctionTrig; solutions: number[] }) {
  const { cheminsQuadrants, rayonsAxes } = calculerAideQuadrants(solutions);
  const candidats = calculerAideCandidats(solutions);
  const projections = calculerAideProjections(fonction, solutions);
  const centre = CENTRE_CERCLE_TRIG;
  const xTangente = CENTRE_CERCLE_TRIG.x + RAYON_CERCLE_TRIG;
  return (
    <div className="triangle-quelconque-aide">
      <p>{phraseLocalisationSolutions(solutions)}</p>
      <CercleTrigBase ariaLabel="Cercle trigonométrique montrant les quadrants concernés, les points candidats et leurs projections">
        {fonction === "tan" && <line x1={xTangente} y1={0} x2={xTangente} y2={HAUTEUR_CERCLE_TRIG} className="cercle-trig-tangente" />}
        {cheminsQuadrants.map((chemin) => (
          <path key={chemin} d={chemin} className="quel-angle-quadrant-surligne" />
        ))}
        {rayonsAxes.map((rayon) => (
          <line key={`${rayon.x2}-${rayon.y2}`} x1={rayon.x1} y1={rayon.y1} x2={rayon.x2} y2={rayon.y2} className="quel-angle-axe-surligne" />
        ))}
        {candidats.map((candidat) => (
          <g key={`${candidat.point.x}-${candidat.point.y}`}>
            <path d={candidat.chemin} className="quel-angle-arc-candidat" />
            <polygon points={candidat.fleche} className="quel-angle-fleche-candidat" />
            <line x1={centre.x} y1={centre.y} x2={candidat.point.x} y2={candidat.point.y} className="quel-angle-rayon-candidat" />
            <circle cx={candidat.point.x} cy={candidat.point.y} r={5} className="quel-angle-point-candidat" />
          </g>
        ))}
        {projections.map((projection) => (
          <line
            key={`proj-${projection.point.x}-${projection.point.y}`}
            x1={projection.point.x}
            y1={projection.point.y}
            x2={projection.projection.x}
            y2={projection.projection.y}
            className="quel-angle-projection-candidat"
          />
        ))}
        {projections[0]?.visible && <circle cx={projections[0].projection.x} cy={projections[0].projection.y} r={4} className="quel-angle-point-projection" />}
      </CercleTrigBase>
    </div>
  );
}

function BlocAides({ aides, cercle, niveauAide, onActiverAide }: Pick<PropsCommuns, "aides" | "cercle" | "niveauAide" | "onActiverAide">) {
  const niveauMax = aides.length + (cercle ? 1 : 0);
  return (
    <div>
      {aides.slice(0, niveauAide).map((aide, i) => {
        // « phrase terminée par : » puis la formule : la formule passe sur sa propre ligne.
        const derniere = aide[aide.length - 1];
        const formuleSeule = derniere?.type === "latex" && aide.slice(0, -1).every((f) => f.type === "texte");
        return (
          <div key={i} className="triangle-quelconque-aide">
            <p>
              <RenduFragments fragments={formuleSeule ? aide.slice(0, -1) : aide} />
            </p>
            {formuleSeule && <Katex expression={derniere.valeur} block />}
          </div>
        );
      })}
      {cercle && niveauAide > aides.length && <CercleAide fonction={cercle.fonction} solutions={cercle.solutions} />}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauMax} onActiverAide={onActiverAide} />
    </div>
  );
}

export function niveauAideMax(aides: FragmentConsigne[][], cercle: boolean): number {
  return aides.length + (cercle ? 1 : 0);
}

type Choix = "aucune" | "auMoinsUne";

function ChoixVerdict({ choix, onChoisir, fige, libelleOui }: { choix: Choix | null; onChoisir: (c: Choix) => void; fige: boolean; libelleOui: string }) {
  return (
    <div className="options-grid">
      <button type="button" disabled={fige} aria-pressed={choix === "aucune"} className={choix === "aucune" ? "btn toggle-active" : "btn"} onClick={() => onChoisir("aucune")}>
        Pas de solution
      </button>
      <button type="button" disabled={fige} aria-pressed={choix === "auMoinsUne"} className={choix === "auMoinsUne" ? "btn toggle-active" : "btn"} onClick={() => onChoisir("auMoinsUne")}>
        {libelleOui}
      </button>
    </div>
  );
}

/** Liste « add-as-needed » de gen18 : un champ par valeur, « + Ajouter », « × » pour retirer. */
function ListeValeurs({
  valeurs,
  onChange,
  fige,
  erronee,
  prefixeLatex,
  placeholder,
  libelleAjout,
  nomChamp,
}: {
  valeurs: string[];
  onChange: (v: string[]) => void;
  fige: boolean;
  erronee: boolean;
  prefixeLatex?: string;
  placeholder: (i: number) => string;
  libelleAjout: string;
  nomChamp: (i: number) => string;
}) {
  return (
    <div className="liste-morceaux contenu-conditionnel">
      {valeurs.map((valeur, index) => (
        <div key={index} className="liste-morceaux-ligne">
          {prefixeLatex && (
            <span style={{ whiteSpace: "nowrap" }}>
              <Katex expression={`${prefixeLatex} =`} />
            </span>
          )}
          <input
            className={`text-input${erronee ? " is-erronee" : ""}`}
            value={valeur}
            disabled={fige}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            onChange={(ev) => onChange(valeurs.map((v, i) => (i === index ? normaliserSigneMoins(ev.target.value) : v)))}
            placeholder={placeholder(index)}
            aria-label={nomChamp(index)}
          />
          {valeurs.length > 1 && !fige && (
            <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer : ${nomChamp(index)}`} onClick={() => onChange(valeurs.filter((_, i) => i !== index))}>
              ×
            </button>
          )}
        </div>
      ))}
      {!fige && (
        <button type="button" className="btn liste-morceaux-ajouter" onClick={() => onChange([...valeurs, ""])}>
          {libelleAjout}
        </button>
      )}
    </div>
  );
}

function PiedEcran({ complet, onValider, props }: { complet: boolean; onValider: () => void; props: PropsCommuns }) {
  const { validation, message } = props;
  return (
    <>
      {!validation && (
        <>
          <BlocAides aides={props.aides} cercle={props.cercle} niveauAide={props.niveauAide} onActiverAide={props.onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider()}>
            Valider
          </button>
          {message && (
            <p className="alert-error" role="alert">
              {message}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </>
  );
}

const AIDE_SAISIE_K = "Valeur exacte (1/2, √3/2 ou racine(3)/2) ou décimale au centième.";

// ---------------------------------------------------------------------------------------------
// Écran « équation(s) de base »
// ---------------------------------------------------------------------------------------------

interface PropsBases extends PropsCommuns {
  /** Fonctions des lignes fixes (affine : 1 ligne ; produit : 2 lignes, dans l'ordre des facteurs). */
  fonctions: FonctionTrig[];
  /** Carré : verdict « pas de solution » possible, et nombre de lignes libre. */
  carre: boolean;
  onValider: (aucune: boolean, valeurs: string[]) => void;
}

export function EtapeBases(props: PropsBases) {
  const { consigne, fonctions, carre, validation, tentativesUtilisees } = props;
  const [choix, setChoix] = useState<Choix | null>(carre ? null : "auMoinsUne");
  const [valeurs, setValeurs] = useState<string[]>(() => (carre ? [""] : fonctions.map(() => "")));
  const fige = !!validation;
  const complet = choix === "aucune" || (choix === "auMoinsUne" && valeurs.length > 0 && valeurs.every((v) => v.trim() !== ""));
  const nom = (f: FonctionTrig) => `\\${f}\\alpha`;
  return (
    <div>
      <p className="prompt-text">{consigne}</p>
      {carre && <ChoixVerdict choix={choix} fige={fige} onChoisir={(c) => { setChoix(c); setValeurs([""]); }} libelleOui="Au moins une équation de base" />}
      {choix === "auMoinsUne" &&
        (carre ? (
          <ListeValeurs
            valeurs={valeurs}
            onChange={setValeurs}
            fige={fige}
            erronee={tentativesUtilisees > 0 && !!props.message}
            prefixeLatex={nom(fonctions[0]!)}
            placeholder={(i) => `valeur ${i + 1}`}
            libelleAjout="+ Ajouter une équation de base"
            nomChamp={(i) => `Équation de base ${i + 1}`}
          />
        ) : (
          <div className="liste-morceaux contenu-conditionnel">
            {fonctions.map((f, i) => (
              <div key={i} className="liste-morceaux-ligne">
                <span style={{ whiteSpace: "nowrap" }}>
                  <Katex expression={`${nom(f)} =`} />
                </span>
                <input
                  className={`text-input${tentativesUtilisees > 0 && !!props.message ? " is-erronee" : ""}`}
                  value={valeurs[i]}
                  disabled={fige}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  placeholder="ex : -1/2"
                  aria-label={`Valeur de ${f} α${fonctions.length > 1 ? ` (équation ${i + 1})` : ""}`}
                  onChange={(ev) => setValeurs(valeurs.map((v, j) => (j === i ? normaliserSigneMoins(ev.target.value) : v)))}
                />
              </div>
            ))}
          </div>
        ))}
      {choix === "auMoinsUne" && !fige && <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>{AIDE_SAISIE_K}</p>}
      <PiedEcran complet={complet} props={props} onValider={() => props.onValider(choix === "aucune", valeurs)} />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran « angle de référence »
// ---------------------------------------------------------------------------------------------

interface PropsReference extends PropsCommuns {
  rappel: ReactNode;
  onValider: (aucune: boolean, valeur: string) => void;
}

export function EtapeReference(props: PropsReference) {
  const { consigne, rappel, validation, tentativesUtilisees } = props;
  const [choix, setChoix] = useState<Choix | null>(null);
  const [valeur, setValeur] = useState("");
  const fige = !!validation;
  const complet = choix === "aucune" || (choix === "auMoinsUne" && valeur.trim() !== "");
  return (
    <div>
      {rappel}
      <p className="prompt-text">{consigne}</p>
      <ChoixVerdict choix={choix} fige={fige} onChoisir={(c) => { setChoix(c); setValeur(""); }} libelleOui="Au moins une solution" />
      {choix === "auMoinsUne" && (
        <div className="liste-morceaux contenu-conditionnel">
          <div className="liste-morceaux-ligne">
            <span style={{ whiteSpace: "nowrap" }}>
              <Katex expression="\alpha_0 =" />
            </span>
            <input
              className={`text-input${tentativesUtilisees > 0 && !!props.message ? " is-erronee" : ""}`}
              value={valeur}
              disabled={fige}
              autoComplete="off"
              spellCheck={false}
              placeholder="angle (degrés)"
              aria-label="Angle de référence, en degrés"
              onChange={(ev) => setValeur(normaliserSigneMoins(ev.target.value))}
            />
            <span aria-hidden="true">°</span>
          </div>
        </div>
      )}
      <PiedEcran complet={complet} props={props} onValider={() => props.onValider(choix === "aucune", valeur)} />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écrans « solutions » (une base) et « ensemble des solutions »
// ---------------------------------------------------------------------------------------------

interface PropsListe extends PropsCommuns {
  rappel: ReactNode;
  onValider: (valeurs: string[]) => void;
}

export function EtapeListeSolutions(props: PropsListe) {
  const { consigne, rappel, validation, tentativesUtilisees } = props;
  const [valeurs, setValeurs] = useState<string[]>([""]);
  const fige = !!validation;
  const complet = valeurs.every((v) => v.trim() !== "");
  return (
    <div>
      {rappel}
      <p className="prompt-text">{consigne}</p>
      <ListeValeurs
        valeurs={valeurs}
        onChange={setValeurs}
        fige={fige}
        erronee={tentativesUtilisees > 0 && !!props.message}
        placeholder={(i) => `solution ${i + 1} (degrés)`}
        libelleAjout="+ Ajouter une solution"
        nomChamp={(i) => `Solution ${i + 1}`}
      />
      <PiedEcran complet={complet} props={props} onValider={() => props.onValider(valeurs)} />
    </div>
  );
}

/** Rappel affiché en tête d'un écran : l'équation de base et, s'il est connu, son angle de référence. */
export function RappelBase({ base, referenceLatex }: { base: string; referenceLatex?: string }) {
  return (
    <div className="equation-box">
      <Katex expression={base} block />
      {referenceLatex && <Katex expression={referenceLatex} block />}
    </div>
  );
}

