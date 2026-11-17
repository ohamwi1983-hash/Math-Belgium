import type { ReactNode } from "react";
import { BoutonAide } from "./BoutonAide";
import { espacesInsecables } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { formatMessageErreur } from "../ui/messageErreur";
import { libelleArete } from "../ui/formatCavaliere";

/**
 * Écrans de gen104 (« Dessiner en perspective cavalière »).
 * - `EtapePlacement` (écrans 1 et 2) : la figure interactive, le choix du point actif (un bouton
 *   par sommet à placer : UNE poignée à la fois), la mesure lue comme à la règle et à l'équerre,
 *   3 tentatives (placement libre, comme un champ ouvert), message ciblé par sommet après un échec.
 * - `EtapeAretes` (écran 3) : la figure (un toucher bascule une arête), un bouton par arête (accès
 *   complet au clavier et au lecteur d'écran), UNE tentative (choix fermé), puis l'explication.
 * Aucun point affiché.
 */

interface PropsAides {
  aides: string[];
  niveauAide: number;
  onActiverAide: () => void;
}

function BlocAides({ aides, niveauAide, onActiverAide, actif }: PropsAides & { actif: boolean }) {
  return (
    <div>
      {aides.slice(0, niveauAide).map((aide, i) => (
        <div key={i} className="triangle-quelconque-aide">
          <p>{espacesInsecables(aide)}</p>
        </div>
      ))}
      {actif && <BoutonAide niveauAide={niveauAide} niveauAideMax={aides.length} onActiverAide={onActiverAide} />}
    </div>
  );
}

function Lignes({ lignes }: { lignes: string[] }) {
  return (
    <>
      {lignes.map((l, i) => (
        <p key={i} style={{ margin: i === 0 ? 0 : "6px 0 0" }}>
          {espacesInsecables(l)}
        </p>
      ))}
    </>
  );
}

// --- Écrans 1 et 2 : placer des sommets ---------------------------------------------------------------

interface PropsPlacement extends PropsAides {
  consigne: string;
  figure: ReactNode;
  /** Sommets à placer à cet écran (un bouton par sommet s'il y en a plusieurs). */
  noms: string[];
  /** Sommets déjà validés (verrouillés) parmi `noms`. */
  verrouilles: string[];
  actif: string | null;
  onChoisirActif: (nom: string) => void;
  /** Sommets déjà posés au moins une fois. */
  poses: string[];
  mesure: string | null;
  tentativesUtilisees: number;
  tentativesMax: number;
  messages: string[] | null;
  onValider: () => void;
  bilan: string | null;
  validation?: ValidationEtapeProps | null;
}

export function EtapePlacement({ consigne, figure, noms, verrouilles, actif, onChoisirActif, poses, mesure, tentativesUtilisees, tentativesMax, messages, onValider, bilan, validation, ...aides }: PropsPlacement) {
  const clos = !!validation;
  const restants = noms.filter((n) => !verrouilles.includes(n));
  const complet = restants.every((n) => poses.includes(n));
  return (
    <div>
      <p className="prompt-text">{espacesInsecables(consigne)}</p>
      {!clos && restants.length > 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", margin: "10px 0 0" }} role="group" aria-label="Sommet à placer">
          {restants.map((n) => (
            <button key={n} type="button" className={`btn${actif === n ? " toggle-active" : ""}`} aria-pressed={actif === n} style={{ minWidth: 64, minHeight: 44 }} onClick={() => onChoisirActif(n)}>
              {n}
              {poses.includes(n) ? " ✓" : ""}
            </button>
          ))}
        </div>
      )}
      {figure}
      {!clos && (
        <p style={{ margin: "0 0 10px", textAlign: "center", fontVariantNumeric: "tabular-nums", minHeight: "1.5em" }} aria-live="polite">
          {mesure ? espacesInsecables(mesure) : actif ? `Touche le quadrillage pour poser ${actif}.` : ""}
        </p>
      )}
      <BlocAides {...aides} actif={!clos} />
      {!clos && (
        <>
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={onValider}>
            Valider
          </button>
          {tentativesUtilisees > 0 && (
            <div className="alert-error" role="alert">
              <div>
                {messages && <Lignes lignes={messages} />}
                <p style={{ margin: messages ? "6px 0 0" : 0 }}>{formatMessageErreur(tentativesUtilisees, tentativesMax)}</p>
              </div>
            </div>
          )}
        </>
      )}
      {clos && validation && (
        <>
          {bilan && (
            <div className="triangle-quelconque-aide">
              <Lignes lignes={[bilan]} />
            </div>
          )}
          <ValidationEcran {...validation} />
        </>
      )}
    </div>
  );
}

// --- Écran 3 : arêtes cachées ---------------------------------------------------------------------------

interface PropsAretes extends PropsAides {
  consigne: string;
  figure: ReactNode;
  aretes: string[];
  pointillees: ReadonlySet<string>;
  onBasculer: (cle: string) => void;
  fausses: ReadonlySet<string> | null;
  explication: string[] | null;
  onValider: () => void;
  validation?: ValidationEtapeProps | null;
}

export function EtapeAretes({ consigne, figure, aretes, pointillees, onBasculer, fausses, explication, onValider, validation, ...aides }: PropsAretes) {
  const clos = !!validation;
  return (
    <div>
      <p className="prompt-text">{espacesInsecables(consigne)}</p>
      {figure}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", margin: "6px 0 12px" }} role="group" aria-label="Arêtes : appuyer pour basculer entre trait plein et pointillés">
        {aretes.map((cle) => {
          const pointille = pointillees.has(cle);
          const faux = fausses?.has(cle) ?? false;
          return (
            <button
              key={cle}
              type="button"
              disabled={clos}
              aria-pressed={pointille}
              className={`btn${pointille ? " toggle-active" : ""}${faux ? " is-erronee" : ""}`}
              style={{ minWidth: 58, minHeight: 44, borderStyle: pointille ? "dashed" : "solid" }}
              onClick={() => onBasculer(cle)}
            >
              {libelleArete(cle)}
            </button>
          );
        })}
      </div>
      <BlocAides {...aides} actif={!clos} />
      {!clos && (
        <button type="button" className="btn btn-primary" onClick={onValider}>
          Valider
        </button>
      )}
      {clos && validation && (
        <>
          {explication && (
            <div className="triangle-quelconque-aide">
              <Lignes lignes={explication} />
            </div>
          )}
          <ValidationEcran {...validation} />
        </>
      )}
    </div>
  );
}
