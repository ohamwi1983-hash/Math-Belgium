import { useRef, useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { Quadrant } from "../core/cercleTrigonometrique.types";
import type { TermeTrig } from "../core/valeurExacte.types";
import { BoutonAide } from "./BoutonAide";
import { RenduFragments } from "./RenduFragments";
import { CercleQuadrantSelecteur } from "./CercleQuadrantSelecteur";
import { CercleTrigTrajetBase } from "./CercleTrigTrajetBase";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { calculerTrajetCercleTrig } from "../ui/cercleTrigTrajet";
import { calculerAidePremierQuadrant } from "../ui/cerclePremierQuadrantAide";
import { CENTRE_CERCLE_TRIG } from "../ui/cercleTrigGeometrie";
import { angleAssocie, angleReduit, quadrantDe } from "../moteur/modeleValeurExacte";
import { normaliserSaisieExacte } from "../moteur/verificationValeurExacte";

/**
 * Écrans de gen76 (« Valeur exacte sans calculatrice ») : angle à ramener dans [0° ; 360°[ (champ
 * libre), quadrant et signe (choix fermés — sélecteur de quadrant de gen14 réutilisé tel quel —,
 * UNE tentative), angle associé et valeur exacte (champs libres), calcul final (champ libre). Les
 * figures d'aide réutilisent le cercle de gen14 (`CercleTrigTrajetBase`, trajet de l'angle, point
 * symétrique du premier quadrant). Jamais de blocage de frappe (règle CLAUDE.md) ; aucun point.
 */

// ---------------------------------------------------------------------------------------------
// Commun : aides, alertes, champ de valeur exacte
// ---------------------------------------------------------------------------------------------

interface PropsAides {
  aides: FragmentConsigne[][];
  niveauAide: number;
  onActiverAide: () => void;
  /** Figure affichée sous l'aide de ce niveau (index 0 = première aide). */
  figures?: (ReactNode | null)[];
}

function BlocAides({ aides, niveauAide, onActiverAide, figures }: PropsAides) {
  return (
    <div>
      {aides.slice(0, niveauAide).map((aide, i) => (
        <div key={i} className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={aide} />
          </p>
          {figures?.[i] ?? null}
        </div>
      ))}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={aides.length} onActiverAide={onActiverAide} />
    </div>
  );
}

interface PropsRetour {
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Message de la dernière soumission sans tentative comptée (illisible, valeur approchée…). */
  messageSansTentative: string | null;
  /** Diagnostics de la dernière tentative fausse (une phrase par champ fautif). */
  diagnostics: string[];
}

function Retour({ tentativesUtilisees, tentativesMax, messageSansTentative, diagnostics }: PropsRetour) {
  if (messageSansTentative) {
    return (
      <p className="alert-error" role="alert">
        {messageSansTentative}
      </p>
    );
  }
  if (tentativesUtilisees === 0) return null;
  return (
    <div className="alert-error" role="alert">
      <div>
        <p style={{ margin: 0 }}>{`Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`}</p>
        {diagnostics.map((d, i) => (
          <p key={i} style={{ margin: "6px 0 0" }}>
            {d}
          </p>
        ))}
      </div>
    </div>
  );
}

function ChampAngle({ id, label, valeur, onChange, erronee, fige }: { id: string; label: ReactNode; valeur: string; onChange: (v: string) => void; erronee: boolean; fige: boolean }) {
  return (
    <div className="field">
      <label className="field-label field-label-minuscule" htmlFor={id}>
        {label}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          id={id}
          className={`text-input${erronee ? " is-erronee" : ""}`}
          style={{ flex: 1, minWidth: 0 }}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={valeur}
          disabled={fige}
          onChange={(ev) => onChange(normaliserSigneMoins(ev.target.value))}
        />
        <span aria-hidden="true" style={{ fontSize: "1.2em" }}>
          °
        </span>
      </div>
    </div>
  );
}

function ChampValeurExacte({ id, label, valeur, onChange, erronee, fige }: { id: string; label: ReactNode; valeur: string; onChange: (v: string) => void; erronee: boolean; fige: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  function insererRacine() {
    const champ = ref.current;
    const debut = champ?.selectionStart ?? valeur.length;
    const fin = champ?.selectionEnd ?? valeur.length;
    const nouveau = `${valeur.slice(0, debut)}rac(${valeur.slice(fin)}`;
    onChange(nouveau);
    requestAnimationFrame(() => {
      champ?.focus();
      champ?.setSelectionRange(debut + 4, debut + 4);
    });
  }
  return (
    <>
      <ApercuExpressionLatex texte={normaliserSaisieExacte(valeur)} />
      <div className="field">
        <label className="field-label field-label-minuscule" htmlFor={id}>
          {label}
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            id={id}
            ref={ref}
            className={`text-input${erronee ? " is-erronee" : ""}`}
            style={{ flex: 1, minWidth: 0 }}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="ex : −rac(2)/2"
            value={valeur}
            disabled={fige}
            onChange={(ev) => onChange(normaliserSigneMoins(ev.target.value))}
          />
          {!fige && (
            <button type="button" className="btn" style={{ minHeight: 44, minWidth: 52 }} onPointerDown={(ev) => ev.preventDefault()} onClick={insererRacine} aria-label="Insérer une racine carrée">
              √
            </button>
          )}
        </div>
        {!fige && (
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", margin: "6px 0 0" }}>
            Valeur exacte : fraction a/b, racine rac(…) (ou le bouton √), parenthèses.
          </p>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------------------------
// Figures d'aide (cercle de gen14)
// ---------------------------------------------------------------------------------------------

export function FigureReductionValeurExacte({ terme }: { terme: TermeTrig }) {
  return (
    <CercleTrigTrajetBase
      trajet={calculerTrajetCercleTrig(terme.angle, angleReduit(terme.angle))}
      labelAngleBrutTexte={`${terme.angle}°`.replace("-", "−")}
      ariaLabel={`Cercle trigonométrique montrant le trajet de l'angle ${terme.angle}°`}
    />
  );
}

/** Même construction que l'aide « Angle du premier quadrant » de gen14/gen15 : trajet de l'angle,
 * point symétrique dans le premier quadrant avec son arc « ? », pointillé pour une symétrie
 * orthogonale. */
export function FigureAngleAssocieValeurExacte({ terme }: { terme: TermeTrig }) {
  const reduit = angleReduit(terme.angle);
  const trajet = calculerTrajetCercleTrig(reduit, reduit);
  const aide = calculerAidePremierQuadrant(angleAssocie(terme), quadrantDe(terme), reduit);
  return (
    <CercleTrigTrajetBase trajet={trajet} labelAngleBrutTexte={`${reduit}°`} ariaLabel="Cercle trigonométrique montrant l'angle et son angle associé du premier quadrant">
      {aide.afficherLignePointillee && <line x1={trajet.pointFinal.x} y1={trajet.pointFinal.y} x2={aide.point.x} y2={aide.point.y} className="cercle-trig-ligne-pointillee" />}
      <line x1={CENTRE_CERCLE_TRIG.x} y1={CENTRE_CERCLE_TRIG.y} x2={aide.point.x} y2={aide.point.y} className="cercle-trig-rayon-question" />
      <circle cx={aide.point.x} cy={aide.point.y} r={5} className="cercle-trig-point-question" />
      {aide.arcAngleChemin && (
        <>
          <path d={aide.arcAngleChemin} className="cercle-trig-arc-question" />
          {aide.fleche && <polygon points={aide.fleche} className="cercle-trig-fleche-question" />}
          <text x={aide.labelQuestion.x} y={aide.labelQuestion.y} className="cercle-trig-label-question">
            ?
          </text>
        </>
      )}
    </CercleTrigTrajetBase>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran « réduction » — un angle
// ---------------------------------------------------------------------------------------------

interface PropsEcran extends PropsAides, PropsRetour {
  enTete: ReactNode;
  consigne: ReactNode;
  validation?: ValidationEtapeProps | null;
}

export function EtapeReductionValeurExacte({ enTete, consigne, erreur, onValider, validation, tentativesUtilisees, tentativesMax, messageSansTentative, diagnostics, ...aides }: PropsEcran & { erreur: boolean; onValider: (texte: string) => void }) {
  const [texte, setTexte] = useState("");
  const fige = !!validation;
  const complet = texte.trim() !== "";
  return (
    <div>
      {enTete}
      <p className="prompt-text">{consigne}</p>
      <ChampAngle id="ve-reduction" label="Angle dans [0° ; 360°[" valeur={texte} onChange={setTexte} erronee={!fige && erreur} fige={fige} />
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(texte)}>
            Valider
          </button>
          <Retour tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} messageSansTentative={messageSansTentative} diagnostics={diagnostics} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran « quadrant et signe » — choix fermés, une tentative
// ---------------------------------------------------------------------------------------------

export function EtapePlacementValeurExacte({
  enTete,
  consigne,
  fonctionLatex,
  onValider,
  validation,
  tentativesUtilisees,
  tentativesMax,
  messageSansTentative,
  diagnostics,
  ...aides
}: PropsEcran & { fonctionLatex: ReactNode; onValider: (quadrant: Quadrant, signe: 1 | -1) => void }) {
  const [quadrant, setQuadrant] = useState<Quadrant | null>(null);
  const [signe, setSigne] = useState<1 | -1 | null>(null);
  const fige = !!validation;
  const complet = quadrant !== null && signe !== null;
  return (
    <div>
      {enTete}
      <p className="prompt-text">{consigne}</p>
      <div style={{ pointerEvents: fige ? "none" : undefined }}>
        <CercleQuadrantSelecteur selection={quadrant} onSelectionner={setQuadrant} />
      </div>
      <p style={{ margin: "10px 0 6px" }}>Signe de {fonctionLatex} :</p>
      <div className="options-grid" style={{ marginTop: 0 }}>
        {([1, -1] as const).map((s) => (
          <button key={s} type="button" disabled={fige} aria-pressed={signe === s} className={`btn${signe === s ? " toggle-active" : ""}`} onClick={() => setSigne(s)}>
            {s === 1 ? "Positif (+)" : "Négatif (−)"}
          </button>
        ))}
      </div>
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(quadrant!, signe!)}>
            Valider
          </button>
          <Retour tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} messageSansTentative={messageSansTentative} diagnostics={diagnostics} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran « angle associé et valeur exacte »
// ---------------------------------------------------------------------------------------------

export function EtapeValeurTermeValeurExacte({
  enTete,
  consigne,
  labelValeur,
  erreurs,
  onValider,
  validation,
  tentativesUtilisees,
  tentativesMax,
  messageSansTentative,
  diagnostics,
  ...aides
}: PropsEcran & { labelValeur: ReactNode; erreurs: [boolean, boolean]; onValider: (angle: string, valeur: string) => void }) {
  const [angle, setAngle] = useState("");
  const [valeur, setValeur] = useState("");
  const fige = !!validation;
  const complet = angle.trim() !== "" && valeur.trim() !== "";
  return (
    <div>
      {enTete}
      <p className="prompt-text">{consigne}</p>
      <ChampAngle id="ve-angle-associe" label="Angle associé du premier quadrant" valeur={angle} onChange={setAngle} erronee={!fige && erreurs[0]} fige={fige} />
      <ChampValeurExacte id="ve-valeur-terme" label={labelValeur} valeur={valeur} onChange={setValeur} erronee={!fige && erreurs[1]} fige={fige} />
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(angle, valeur)}>
            Valider
          </button>
          <Retour tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} messageSansTentative={messageSansTentative} diagnostics={diagnostics} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Écran final — valeur exacte de l'expression
// ---------------------------------------------------------------------------------------------

export function EtapeFinaleValeurExacte({
  enTete,
  consigne,
  labelValeur,
  erreur,
  onValider,
  validation,
  tentativesUtilisees,
  tentativesMax,
  messageSansTentative,
  diagnostics,
  ...aides
}: PropsEcran & { labelValeur: ReactNode; erreur: boolean; onValider: (valeur: string) => void }) {
  const [valeur, setValeur] = useState("");
  const fige = !!validation;
  const complet = valeur.trim() !== "";
  return (
    <div>
      {enTete}
      <p className="prompt-text">{consigne}</p>
      <ChampValeurExacte id="ve-valeur-finale" label={labelValeur} valeur={valeur} onChange={setValeur} erronee={!fige && erreur} fige={fige} />
      {!validation && (
        <>
          <BlocAides {...aides} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(valeur)}>
            Valider
          </button>
          <Retour tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} messageSansTentative={messageSansTentative} diagnostics={diagnostics} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
