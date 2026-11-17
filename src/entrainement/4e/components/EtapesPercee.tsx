import type { MouseEvent, ReactNode } from "react";
import type { CandidatPointCommun } from "../core/positionsPlans.types";
import { BoutonAide } from "./BoutonAide";
import { espacesInsecables } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import type { Point2D } from "../ui/projectionCavaliere";
import { HAUTEUR_FIGURE, LARGEUR_FIGURE } from "../ui/figurePercee";

/**
 * Écrans de gen102 (« Point de percée par plan auxiliaire ») — trois choix fermés, UNE tentative
 * chacun (décision de l'utilisateur). La sélection est remontée dans l'appli (composants contrôlés)
 * pour que la figure la montre en direct : triangle du plan auxiliaire choisi, points et droites de
 * construction, point numéroté. Après validation, l'explication s'affiche avant « Écran suivant » ;
 * un mauvais choix reste marqué en rouge. Aucun point affiché.
 *
 * `FigureCliquable` : la figure SVG (chaîne) insérée telle quelle ; un toucher sélectionne la cible
 * la plus proche à moins de 26 unités du dessin (≈ 46 px de diamètre à 390 px de large) — un seul
 * gestionnaire sur le conteneur HTML, jamais sur les éléments SVG (Chromium ignore `touch-action`
 * sur le SVG, voir la convention des constructions interactives). Les boutons sous la figure restent
 * l'accès complet (clavier, lecteur d'écran).
 */

interface PropsAides {
  aides: string[];
  niveauAide: number;
  onActiverAide: () => void;
}

function BlocAidesTexte({ aides, niveauAide, onActiverAide }: PropsAides) {
  return (
    <div>
      {aides.slice(0, niveauAide).map((aide, i) => (
        <div key={i} className="triangle-quelconque-aide">
          <p>{espacesInsecables(aide)}</p>
        </div>
      ))}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={aides.length} onActiverAide={onActiverAide} />
    </div>
  );
}

function Explication({ lignes }: { lignes: string[] }) {
  return (
    <div className="triangle-quelconque-aide">
      {lignes.map((l, i) => (
        <p key={i} style={{ margin: i === 0 ? 0 : "6px 0 0" }}>
          {espacesInsecables(l)}
        </p>
      ))}
    </div>
  );
}

// --- Figure cliquable ------------------------------------------------------------------------------

export interface CibleFigure {
  cle: string;
  pixel: Point2D;
}

const RAYON_TOUCHER = 26;

export function FigureCliquable({ svg, cibles, onToucher, legende }: { svg: string; cibles: CibleFigure[]; onToucher: (cle: string) => void; legende?: ReactNode }) {
  function toucher(ev: MouseEvent<HTMLDivElement>) {
    if (cibles.length === 0) return;
    const el = ev.currentTarget.querySelector("svg");
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const x = ((ev.clientX - r.left) * LARGEUR_FIGURE) / r.width;
    const y = ((ev.clientY - r.top) * HAUTEUR_FIGURE) / r.height;
    let meilleure: CibleFigure | null = null;
    let dist = RAYON_TOUCHER;
    for (const c of cibles) {
      const d = Math.hypot(c.pixel.x - x, c.pixel.y - y);
      if (d < dist) {
        dist = d;
        meilleure = c;
      }
    }
    if (meilleure) onToucher(meilleure.cle);
  }
  return (
    <div>
      <div
        className="figure-percee"
        style={{ maxWidth: 460, margin: "8px auto 0", cursor: cibles.length ? "pointer" : "default", touchAction: "manipulation" }}
        onClick={toucher}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {legende}
    </div>
  );
}

// --- Écran 1 : plan auxiliaire ---------------------------------------------------------------------

const STYLE_OPTION = { textAlign: "left", justifyContent: "flex-start", whiteSpace: "normal", lineHeight: 1.5, padding: "10px 14px", minHeight: 44, height: "auto" } as const;

interface PropsPlan extends PropsAides {
  consigne: string;
  options: { texte: string; valide: boolean }[];
  choix: number | null;
  onChoisir: (i: number) => void;
  explication: string[] | null;
  onValider: () => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapePlanAuxiliaire({ consigne, options, choix, onChoisir, explication, onValider, validation, ...aides }: PropsPlan) {
  const fige = !!validation;
  return (
    <div>
      <p className="prompt-text">{espacesInsecables(consigne)}</p>
      <div style={{ display: "grid", gap: 10, margin: "12px 0" }} role="group" aria-label="Plans proposés">
        {options.map((o, i) => {
          const choisi = choix === i;
          const faux = fige && choisi && !o.valide;
          return (
            <button
              key={i}
              type="button"
              disabled={fige}
              aria-pressed={choisi}
              className={`btn${choisi ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              style={STYLE_OPTION}
              onClick={() => onChoisir(i)}
            >
              <span>{espacesInsecables(o.texte)}</span>
            </button>
          );
        })}
      </div>
      {!validation && (
        <>
          <BlocAidesTexte {...aides} />
          <button type="button" className="btn btn-primary" disabled={choix === null} onClick={onValider}>
            Valider
          </button>
        </>
      )}
      {validation && explication && (
        <>
          <Explication lignes={explication} />
          <ValidationEcran {...validation} />
        </>
      )}
    </div>
  );
}

// --- Écran 2 : deux points communs -----------------------------------------------------------------

interface PropsPoints extends PropsAides {
  consigne: string;
  candidats: CandidatPointCommun[];
  selection: number[];
  onBasculer: (i: number) => void;
  estCommun: (i: number) => boolean;
  explication: string[] | null;
  onValider: () => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapePointsCommunsPercee({ consigne, candidats, selection, onBasculer, estCommun, explication, onValider, validation, ...aides }: PropsPoints) {
  const fige = !!validation;
  const nommes = candidats.map((c, i) => ({ c, i })).filter(({ c }) => !c.construction);
  const construits = candidats.map((c, i) => ({ c, i })).filter(({ c }) => c.construction);

  function groupe(titre: string, liste: { c: CandidatPointCommun; i: number }[]) {
    return (
      <div style={{ marginTop: "0.75rem" }}>
        <p className="field-label field-label-minuscule">{titre}</p>
        <div className="options-grid-compact" role="group" aria-label={titre}>
          {liste.map(({ c, i }) => {
            const actif = selection.includes(i);
            const faux = fige && actif && !estCommun(i);
            return (
              <button
                key={c.cle}
                type="button"
                disabled={fige}
                aria-pressed={actif}
                className={`btn${actif ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
                style={{ minHeight: 44, whiteSpace: "nowrap" }}
                onClick={() => onBasculer(i)}
              >
                {c.libelle}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="prompt-text">{espacesInsecables(consigne)}</p>
      {groupe("Points nommés", nommes)}
      {construits.length > 0 && groupe("Points de rencontre de deux droites", construits)}
      {!validation && (
        <div style={{ marginTop: 12 }}>
          <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
            Sélectionne exactement deux points ({selection.length}/2).
          </p>
          <BlocAidesTexte {...aides} />
          <button type="button" className="btn btn-primary" disabled={selection.length !== 2} onClick={onValider}>
            Valider
          </button>
        </div>
      )}
      {validation && explication && (
        <>
          <Explication lignes={explication} />
          <ValidationEcran {...validation} />
        </>
      )}
    </div>
  );
}

// --- Écran 3 : point de percée ---------------------------------------------------------------------

interface PropsNumero extends PropsAides {
  consigne: string;
  numeros: number[];
  juste: number;
  selection: number | null;
  onChoisir: (n: number) => void;
  explication: string[] | null;
  onValider: () => void;
  validation?: ValidationEtapeProps | null;
  apresValidation?: ReactNode;
}

export function EtapePointPercee({ consigne, numeros, juste, selection, onChoisir, explication, onValider, validation, apresValidation, ...aides }: PropsNumero) {
  const fige = !!validation;
  return (
    <div>
      <p className="prompt-text">{espacesInsecables(consigne)}</p>
      <div className="options-grid-compact" role="group" aria-label="Points numérotés" style={{ marginTop: 12 }}>
        {numeros.map((n) => {
          const actif = selection === n;
          const faux = fige && actif && n !== juste;
          return (
            <button
              key={n}
              type="button"
              disabled={fige}
              aria-pressed={actif}
              className={`btn${actif ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              style={{ minHeight: 44, minWidth: 64 }}
              onClick={() => onChoisir(n)}
            >
              Point {n}
            </button>
          );
        })}
      </div>
      {!validation && (
        <div style={{ marginTop: 12 }}>
          <BlocAidesTexte {...aides} />
          <button type="button" className="btn btn-primary" disabled={selection === null} onClick={onValider}>
            Valider
          </button>
        </div>
      )}
      {validation && explication && (
        <>
          <Explication lignes={explication} />
          {apresValidation}
          <ValidationEcran {...validation} />
        </>
      )}
    </div>
  );
}
