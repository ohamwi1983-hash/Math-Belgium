import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { CatalogueVarianteEntree, EtapeCorrection, FragmentConsigne } from "../../export/genererFeuilleExercices";
import { genererAvecCode, lireCodeDepuisUrl } from "../../export/codeExercice";
import { lettreEtape, lignesDeLEtape } from "../../export/corrigeTableau";
import { CorrigeDetailleEcran } from "../../components/CorrigeDetailleEcran";
import { ProgressionPuces } from "../../components/ProgressionPuces";
import { FicheReponseEcran } from "../../components/FicheReponseEcran";
import { ValidationEcran } from "../../components/ValidationEcran";
import { ariaOptionChoixFerme, classeOptionChoixFerme } from "../ui/choixFige";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "../ui/historiqueProgression";
import type { AnneauEspace } from "../ui/figureEspaceLotH";
import type { Point2D } from "../ui/projectionCavaliere";
import { SelecteurVarianteDev } from "./SelecteurVarianteDev";
import { EnTeteExercice } from "./EnTeteExercice";
import { RenduFragments } from "./RenduFragments";
import { BoutonAide } from "./BoutonAide";
import { FigureCliquable } from "./EtapesPercee";

/**
 * Coquille des générateurs du lot H du 4e ch. 8 (gen133 « Lire un solide en perspective », gen134
 * « Intersection de deux plans par parallélisme ») : chaque appli fournit ses données — générateur,
 * catalogue, écrans (`EcranEspace[]`), figure SVG selon l'état, corrigé détaillé.
 *
 * Quatre sortes d'écrans, toujours la figure du solide au-dessus (hors de l'énoncé repliable) :
 * - `choix` : choix fermé, UNE tentative, jugé ✗ / ✓ et figé (`ui/choixFige.ts`), explication du
 *   choix faux ;
 * - `cases` : choix MULTIPLE à cases carrées, UNE tentative, juste si l'ensemble coché est exact ;
 *   une fois jugé, case cochée à tort ✗, bonne case (cochée ou oubliée) ✓ ;
 * - `lignes` : une ligne par élément (face, paire de droites), un verdict par ligne parmi les
 *   mêmes étiquettes, UNE tentative pour l'ensemble, chaque ligne jugée ✗ / ✓ ;
 * - `toucher` : toucher un point numéroté sur la figure (ou son bouton, accès clavier), TROIS
 *   tentatives, message ciblé à chaque essai faux, point essayé marqué en rouge.
 * Aides à deux niveaux, corrigé « comme au tableau » de l'étape quand la réponse est révélée, choix
 * vides à chaque nouvel exercice (clé de génération), aucun point affiché. `?code=` : première
 * instance tirée avec les MÊMES fonctions que l'adaptateur papier.
 */

export type Fragments = FragmentConsigne[];

interface BaseEcran {
  titre: string;
  consigne: Fragments;
  aides: Fragments[];
}

export interface CibleToucher {
  numero: number;
  pixel: Point2D;
  juste: boolean;
  /** Message d'un essai faux sur ce point. */
  message: Fragments;
}

export type EcranEspace =
  | (BaseEcran & { type: "choix"; options: Fragments[]; bonne: number; explications: (Fragments | null)[] })
  | (BaseEcran & { type: "cases"; options: Fragments[]; bonnes: number[]; colonnes: number; messageFaux: Fragments })
  | (BaseEcran & { type: "lignes"; lignes: Fragments[]; etiquettes: string[]; bonnes: number[]; messageFaux: Fragments })
  | (BaseEcran & { type: "toucher"; cibles: CibleToucher[] });

export interface ContexteFigure {
  ecran: number;
  clos: boolean;
  /** Ligne mise en avant sur la figure (écran `lignes`). */
  ligneActive: number | null;
  /** Anneaux numérotés de l'écran `toucher` (état compris). */
  anneaux: AnneauEspace[];
}

export interface PropsAppEspace<E> {
  titre: string;
  sousTitre: string;
  catalogue: CatalogueVarianteEntree[];
  generer: () => E;
  construireAvecVariante: (id: string) => E;
  ecrans: (e: E) => EcranEspace[];
  consigneGenerale: (e: E) => Fragments;
  figure: (e: E, ctx: ContexteFigure) => string;
  legende?: (e: E, ctx: ContexteFigure) => ReactNode;
  correction: (e: E) => EtapeCorrection[];
  idDebug?: string;
}

const TENTATIVES_TOUCHER = 3;

interface EtatEcran {
  choix: number | null;
  cases: number[];
  lignes: (number | null)[];
  toucher: number | null;
  essaisFaux: number[];
  ligneActive: number | null;
  niveauAide: number;
  clos: boolean;
  revele: boolean;
  message: Fragments | null;
}

function etatVide(def: EcranEspace | undefined): EtatEcran {
  return {
    choix: null,
    cases: [],
    lignes: def?.type === "lignes" ? def.lignes.map(() => null) : [],
    toucher: null,
    essaisFaux: [],
    ligneActive: def?.type === "lignes" ? 0 : null,
    niveauAide: 0,
    clos: false,
    revele: false,
    message: null,
  };
}

const separer = (morceaux: Fragments[], sep = " ; "): Fragments => morceaux.flatMap((m, i) => [...(i > 0 ? [{ type: "texte" as const, valeur: sep }] : []), ...m]);

function reponseAttendue(def: EcranEspace): Fragments {
  if (def.type === "choix") return def.options[def.bonne]!;
  if (def.type === "cases") return separer(def.bonnes.map((b) => def.options[b]!));
  if (def.type === "lignes") return separer(def.lignes.map((l, i) => [...l, { type: "texte" as const, valeur: ` : ${def.etiquettes[def.bonnes[i]!]}` }]));
  const juste = def.cibles.find((c) => c.juste)!;
  return [{ type: "texte", valeur: `Point ${juste.numero}` }];
}

function BlocAides({ aides, niveau, onActiver }: { aides: Fragments[]; niveau: number; onActiver: () => void }) {
  return (
    <div>
      {aides.slice(0, niveau).map((aide, i) => (
        <div key={i} className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={aide} />
          </p>
        </div>
      ))}
      <BoutonAide niveauAide={niveau} niveauAideMax={aides.length} onActiverAide={onActiver} />
    </div>
  );
}

const styleOption = { textAlign: "left" as const, justifyContent: "flex-start", whiteSpace: "normal" as const, lineHeight: 1.4, minHeight: 44 };

export function AppEspaceLotH<E>(props: PropsAppEspace<E>) {
  const { titre, sousTitre, catalogue, generer, construireAvecVariante } = props;
  const [exercice, setExercice] = useState<E>(() => {
    const code = lireCodeDepuisUrl();
    return code ? genererAvecCode(code, catalogue, generer, construireAvecVariante) : generer();
  });
  const [ecran, setEcran] = useState(0);
  const [etat, setEtat] = useState<EtatEcran>(() => etatVide(undefined));
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [generation, setGeneration] = useState(0);

  const e = exercice;
  const tous = props.ecrans(e);
  const def = tous[ecran]!;
  // État initial dépendant de l'écran (lignes) : complété au premier rendu de l'écran.
  const et: EtatEcran = def.type === "lignes" && etat.lignes.length !== def.lignes.length ? { ...etat, lignes: def.lignes.map(() => null), ligneActive: etat.ligneActive ?? 0 } : etat;

  function recommencer(ex: E) {
    setExercice(ex);
    setEcran(0);
    setEtat(etatVide(props.ecrans(ex)[0]));
    setHistorique([]);
    setFicheOuverteIndex(null);
    setGeneration((g) => g + 1);
  }

  function clore(juste: boolean, votreReponse: Fragments, message: Fragments | null, maj: Partial<EtatEcran> = {}) {
    const attendue = <RenduFragments fragments={reponseAttendue(def)} />;
    setHistorique((h) => [...h, ecranClos(def.titre, <RenduFragments fragments={votreReponse} />, !juste, et.niveauAide > 0, attendue)]);
    setEtat({ ...et, ...maj, clos: true, revele: !juste, message });
  }

  function suivant() {
    if (ecran >= tous.length - 1) {
      recommencer(generer());
      return;
    }
    setEcran(ecran + 1);
    setEtat(etatVide(tous[ecran + 1]));
  }

  if (props.idDebug && (import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1")) {
    (window as unknown as Record<string, unknown>)[props.idDebug] = { exercice: e, ecran };
  }

  // --- Figure ------------------------------------------------------------------------------------
  const anneaux: AnneauEspace[] =
    def.type === "toucher"
      ? def.cibles.map((c) => ({
          numero: c.numero,
          pixel: c.pixel,
          selectionne: !et.clos && et.toucher === c.numero,
          etat: et.clos && c.juste ? "juste" : et.essaisFaux.includes(c.numero) ? "faux" : null,
        }))
      : [];
  const ctx: ContexteFigure = { ecran, clos: et.clos, ligneActive: et.ligneActive, anneaux };
  const svg = props.figure(e, ctx);
  const ciblesActives = def.type === "toucher" && !et.clos ? def.cibles.filter((c) => !et.essaisFaux.includes(c.numero)).map((c) => ({ cle: String(c.numero), pixel: c.pixel })) : [];

  // --- Validation ---------------------------------------------------------------------------------
  function valider() {
    if (def.type === "choix") {
      if (et.choix === null) return;
      const juste = et.choix === def.bonne;
      clore(juste, def.options[et.choix]!, juste ? null : (def.explications[et.choix] ?? [{ type: "texte", valeur: "Ce n'était pas le bon choix." }]));
    } else if (def.type === "cases") {
      const juste = et.cases.length === def.bonnes.length && et.cases.every((c) => def.bonnes.includes(c));
      clore(juste, et.cases.length ? separer(et.cases.map((c) => def.options[c]!)) : [{ type: "texte", valeur: "aucune case cochée" }], juste ? null : def.messageFaux);
    } else if (def.type === "lignes") {
      if (et.lignes.some((l) => l === null)) return;
      const juste = et.lignes.every((l, i) => l === def.bonnes[i]);
      clore(juste, separer(def.lignes.map((l, i) => [...l, { type: "texte" as const, valeur: ` : ${def.etiquettes[et.lignes[i]!]}` }])), juste ? null : def.messageFaux);
    } else {
      if (et.toucher === null) return;
      const cible = def.cibles.find((c) => c.numero === et.toucher)!;
      if (cible.juste) {
        clore(true, [{ type: "texte", valeur: `Point ${cible.numero}` }], null, { toucher: null });
        return;
      }
      const essais = [...et.essaisFaux, cible.numero];
      if (essais.length >= TENTATIVES_TOUCHER) {
        clore(false, [{ type: "texte", valeur: `Point ${cible.numero}` }], cible.message, { essaisFaux: essais, toucher: null });
        return;
      }
      setEtat({ ...et, essaisFaux: essais, toucher: null, message: cible.message });
    }
  }

  const corrigeEtape = lignesDeLEtape(props.correction(e), lettreEtape(ecran));
  const messageRevele = et.message ? (
    <span>
      <RenduFragments fragments={et.message} />
    </span>
  ) : undefined;

  function ecranCourant(): ReactNode {
    const fige = et.clos;
    let corps: ReactNode;
    let pret = false;
    if (def.type === "choix") {
      pret = et.choix !== null;
      const etatOptions = { selection: et.choix, choisie: fige ? et.choix : null, bonne: def.bonne };
      corps = (
        <div className="options-grid" style={{ gridTemplateColumns: "1fr", margin: "12px 0" }} role="radiogroup">
          {def.options.map((o, i) => (
            <button key={i} type="button" role="radio" aria-checked={et.choix === i} aria-label={ariaOptionChoixFerme(i, etatOptions)} disabled={fige} className={classeOptionChoixFerme(i, etatOptions)} style={styleOption} onClick={() => setEtat({ ...et, choix: i })}>
              <span>
                <RenduFragments fragments={o} />
              </span>
            </button>
          ))}
        </div>
      );
    } else if (def.type === "cases") {
      pret = true;
      corps = (
        <div className="options-grid options-multiples" style={{ gridTemplateColumns: `repeat(${def.colonnes}, minmax(0, 1fr))`, margin: "12px 0", gap: 8 }} role="group">
          {def.options.map((o, i) => {
            const coche = et.cases.includes(i);
            const classe = !fige ? (coche ? "btn toggle-active" : "btn") : def.bonnes.includes(i) ? "btn is-juste" : coche ? "btn is-faux" : "btn";
            const aria = fige ? (def.bonnes.includes(i) ? (coche ? "cochée, juste" : "à cocher") : coche ? "cochée à tort" : undefined) : undefined;
            return (
              <button
                key={i}
                type="button"
                role="checkbox"
                aria-checked={coche}
                aria-label={aria}
                disabled={fige}
                className={classe}
                style={{ ...styleOption, minHeight: 44, paddingLeft: 10, paddingRight: 8 }}
                onClick={() => setEtat({ ...et, cases: coche ? et.cases.filter((c) => c !== i) : [...et.cases, i].sort((a, b) => a - b) })}
              >
                <span>
                  <RenduFragments fragments={o} />
                </span>
              </button>
            );
          })}
        </div>
      );
    } else if (def.type === "lignes") {
      pret = et.lignes.every((l) => l !== null);
      corps = (
        <div style={{ display: "grid", gap: 10, margin: "12px 0" }}>
          {def.lignes.map((l, i) => {
            const etatOptions = { selection: et.lignes[i] ?? null, choisie: fige ? (et.lignes[i] ?? null) : null, bonne: def.bonnes[i]! };
            const active = et.ligneActive === i;
            return (
              <div
                key={i}
                role="radiogroup"
                aria-label={`Ligne ${i + 1}`}
                style={{ border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`, borderRadius: 10, padding: "8px 10px" }}
                onFocusCapture={() => et.ligneActive !== i && setEtat({ ...et, ligneActive: i })}
                onPointerDown={() => et.ligneActive !== i && setEtat({ ...et, ligneActive: i })}
              >
                <p style={{ margin: "0 0 6px", fontWeight: 600 }}>
                  <RenduFragments fragments={l} />
                </p>
                <div className="options-grid-compact" style={{ gridTemplateColumns: `repeat(${def.etiquettes.length}, minmax(0, 1fr))`, gap: 6 }}>
                  {def.etiquettes.map((etiquette, k) => (
                    <button
                      key={k}
                      type="button"
                      role="radio"
                      aria-checked={et.lignes[i] === k}
                      aria-label={ariaOptionChoixFerme(k, etatOptions) ? `${etiquette}, ${ariaOptionChoixFerme(k, etatOptions)}` : undefined}
                      disabled={fige}
                      className={classeOptionChoixFerme(k, etatOptions)}
                      style={{ minHeight: 44, padding: "6px 6px", fontSize: "0.92em", gap: 6, justifyContent: "flex-start", whiteSpace: "normal", lineHeight: 1.25, textAlign: "left" }}
                      onClick={() => setEtat({ ...et, ligneActive: i, lignes: et.lignes.map((x, j) => (j === i ? k : x)) })}
                    >
                      {etiquette}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    } else {
      pret = et.toucher !== null;
      corps = (
        <>
          <p style={{ margin: "8px 0 4px", fontSize: "0.92em" }}>Touche un point numéroté sur la figure, ou choisis-le ici :</p>
          <div className="options-grid" style={{ gridTemplateColumns: `repeat(${Math.min(def.cibles.length, 3)}, minmax(0, 1fr))`, margin: "6px 0 12px", gap: 8 }} role="radiogroup">
            {[...def.cibles]
              .sort((a, b) => a.numero - b.numero)
              .map((c) => {
                const essaye = et.essaisFaux.includes(c.numero);
                const classe = fige ? (c.juste ? "btn is-juste" : essaye ? "btn is-faux" : "btn") : essaye ? "btn is-faux" : et.toucher === c.numero ? "btn toggle-active" : "btn";
                return (
                  <button key={c.numero} type="button" role="radio" aria-checked={et.toucher === c.numero} disabled={fige || essaye} className={classe} style={{ minHeight: 44 }} onClick={() => setEtat({ ...et, toucher: c.numero })}>
                    Point {c.numero}
                  </button>
                );
              })}
          </div>
          {!fige && et.essaisFaux.length > 0 && et.message && (
            <p className="alert-error" role="alert">
              <span>
                <RenduFragments fragments={et.message} /> Incorrect — tentative {et.essaisFaux.length}/{TENTATIVES_TOUCHER}, réessaie.
              </span>
            </p>
          )}
        </>
      );
    }
    return (
      <div>
        <p className="prompt-text">
          <RenduFragments fragments={def.consigne} />
        </p>
        {corps}
        {!fige && (
          <>
            <BlocAides aides={def.aides} niveau={et.niveauAide} onActiver={() => setEtat({ ...et, niveauAide: Math.min(def.aides.length, et.niveauAide + 1) })} />
            <button type="button" className="btn btn-primary" disabled={!pret} onClick={valider}>
              Valider
            </button>
          </>
        )}
        {fige && (
          <ValidationEcran
            revele={et.revele}
            reponseAttendue={<RenduFragments fragments={reponseAttendue(def)} />}
            labelSuivant={ecran >= tous.length - 1 ? "Nouvel exercice" : "Écran suivant"}
            onSuivant={suivant}
            messageRevele={messageRevele}
            corrigeDetaille={<CorrigeDetailleEcran etapes={corrigeEtape} />}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">{titre}</h1>
        <p className="app-subtitle">{sousTitre}</p>
        <SelecteurVarianteDev options={catalogue} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, tous.length, !et.clos)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={<RenduFragments fragments={props.consigneGenerale(e)} />} blocDonnees={null} />
          <div style={{ margin: "6px auto 4px", maxWidth: 440 }}>
            <FigureCliquable svg={svg} cibles={ciblesActives} onToucher={(cle) => setEtat({ ...et, toucher: Number(cle) })} legende={props.legende?.(e, ctx)} />
          </div>
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
