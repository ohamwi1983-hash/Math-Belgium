import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { InlineMath } from "./KatexAccessible";
import "katex/dist/katex.min.css";
import { normaliserLogDecimal } from "../../lib/notationLog";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../export/genererFeuilleExercices";
import { decouperLigneCalcul, estLignePiege } from "../export/corrigeTableau";
import { TexteInsistance } from "./TexteInsistance";
import { lire, texteParleDe, voixDisponible } from "../../lib/voixLecture";
import { phrasesDe } from "../../lib/phrasesPage";
import { BoutonEcouter } from "../../components/lecture/BoutonEcouter";
import { animationsReduites } from "../../lib/reglagesLecture";
import { ligneParLigneRetenue, retenirLigneParLigne } from "../../lib/corrigeLigneParLigne";

/**
 * Corrigé détaillé « comme au tableau » d'UNE étape, à l'écran d'un générateur : affiché sous la
 * réponse attendue quand l'élève a épuisé ses tentatives (`ValidationEcran.corrigeDetaille`).
 * Mêmes lignes que le corrigé papier (`correctionDetaillee` de l'adaptateur, filtré par
 * `lignesDeLEtape`) et même découpage des chaînes de calcul (`decouperLigneCalcul`) — jamais une
 * seconde source recalculée à part. Partagé par tous les niveaux.
 *
 * Mise en page étroite (téléphone) : étiquette au-dessus de son contenu ; chaîne de calcul alignée
 * sur « = » ; un bloc trop large est d'abord resserré (police réduite jusqu'à 85 %), puis défile
 * horizontalement s'il le faut encore (la page ne déborde jamais) ; la justification passe sous sa ligne.
 */

function Formule({ latex }: { latex: string }) {
  return <InlineMath math={normaliserLogDecimal(latex)} />;
}

function espacesInsecables(texte: string): string {
  return texte.replace(/ ([?!:;»])/g, " $1").replace(/« /g, "« ");
}

function Fragments({ fragments }: { fragments: FragmentConsigne[] }) {
  return (
    <>
      {fragments.map((f, i) => (f.type === "texte" ? <span key={i}><TexteInsistance texte={espacesInsecables(f.valeur)} debutDePhrase={i === 0} /></span> : <Formule key={i} latex={f.valeur} />))}
    </>
  );
}

/** Réduction maximale de la taille d'un bloc de calcul trop large (au-delà, il défile). */
const ECHELLE_MIN = 0.85;

/**
 * Bloc de calcul plus large que la place disponible (téléphone, membre de gauche long) : la taille
 * de police du bloc est réduite juste assez pour qu'il tienne, sans descendre sous `ECHELLE_MIN` ;
 * au-delà, le défilement horizontal reste le recours. Recalculé quand la largeur change.
 */
function useAjusterLargeur() {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ajuster = () => {
      el.style.fontSize = "";
      const dispo = el.clientWidth;
      const besoin = el.scrollWidth;
      if (dispo > 0 && besoin > dispo + 1) {
        const echelle = Math.max(ECHELLE_MIN, Math.floor((dispo / besoin) * 1000) / 1000);
        el.style.fontSize = `${echelle * 100}%`;
      }
    };
    ajuster();
    if (typeof ResizeObserver === "undefined") return;
    let largeur = el.clientWidth;
    const obs = new ResizeObserver(() => {
      if (el.clientWidth !== largeur) {
        largeur = el.clientWidth;
        ajuster();
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  });
  return ref;
}

/** Lecture ligne par ligne : classe d'une unité (ligne) selon la ligne en cours (`null` = tout montré). */
type EtatLigne = (k: number) => string;
const TOUT_MONTRE: EtatLigne = () => "";

function Calcul({ lignes, debut, etat }: { lignes: LigneCalcul[]; debut: number; etat: EtatLigne }) {
  const ref = useAjusterLargeur();
  return (
    <div className="corrige-ecran-calcul-defile" ref={ref}>
      <div className="corrige-ecran-calcul">
        {lignes.map((l, i) => {
          const { gauche, droite } = decouperLigneCalcul(l.latex);
          const j = l.justification === undefined ? null : typeof l.justification === "string" ? [{ type: "texte" as const, valeur: l.justification }] : l.justification;
          const k = debut + i;
          const e = etat(k);
          return (
            <Fragment key={i}>
              {droite === null ? (
                <span className={`cc-s${e}`} data-ligne={k}>
                  <Formule latex={gauche} />
                </span>
              ) : (
                <>
                  <span className={`cc-g${e}`} data-ligne={k}>
                    {gauche ? <Formule latex={gauche} /> : null}
                  </span>
                  <span className={`cc-d${e}`} data-ligne={k}>
                    <Formule latex={`{}${droite}`} />
                  </span>
                </>
              )}
              {j ? (
                <span className={`cc-j${e}`} data-ligne={k}>
                  <Fragments fragments={j} />
                </span>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

/** Nombre de lignes de lecture d'une étape du corrigé : son texte (1) et chaque ligne de calcul, ou sa
 * figure seule (1). La figure d'une étape qui a autre chose apparaît avec sa dernière ligne. */
function lignesDeLEtapeCorrigee(e: EtapeCorrection): number {
  const n = (e.fragments.length > 0 ? 1 : 0) + (e.calcul?.length ?? 0);
  return n > 0 ? n : e.figureHtml ? 1 : 0;
}

/**
 * Corrigé « ligne par ligne » (côté élève, planche 10) : sur demande (« Lire ligne par ligne », petit
 * bouton dans l'en-tête du corrigé — par défaut, le corrigé complet comme avant), les lignes se révèlent
 * une à une : la ligne en cours entourée, les précédentes plus discrètes, les suivantes masquées SANS
 * changer la mise en page (`visibility: hidden` : rien ne saute sous le doigt). « Ligne suivante »,
 * « Tout montrer » (retour au corrigé complet) et « Écouter » (moteur de lecture à voix haute
 * `lib/voixLecture.ts`, ligne surlignée), dans une barre collée en bas de l'écran (au-dessus de la barre fixe) tant que le
 * corrigé est à l'écran : les lignes masquées gardent leur place, les boutons restent sous le pouce.
 * Une ligne = le texte d'une étape, une ligne de calcul, ou un piège. Le choix est RETENU sur l'appareil
 * (décision du professeur, 25/11/2026 ; `CLE_LIGNE_PAR_LIGNE`) : après « Lire ligne par ligne », les
 * corrigés suivants s'ouvrent directement à la ligne 1 ; « Tout montrer » touché AVANT la dernière ligne
 * revient au corrigé complet pour la suite (à la dernière ligne, c'est seulement la fin de la lecture).
 * Stockage : `lib/corrigeLigneParLigne.ts`.
 */
export function CorrigeDetailleEcran({ etapes, titre = "Corrigé détaillé de l'étape" }: { etapes: EtapeCorrection[]; titre?: string }) {
  const normalesInit = etapes.filter((e) => !estLignePiege(e));
  const totalInit = normalesInit.reduce((s, e) => s + lignesDeLEtapeCorrigee(e), 0) + (etapes.length - normalesInit.length);
  const [pas, setPas] = useState<number | null>(() => (totalInit > 1 && ligneParLigneRetenue() ? 1 : null));
  const racineRef = useRef<HTMLDivElement>(null);
  const suivanteRef = useRef<HTMLButtonElement>(null);
  const toutRef = useRef<HTMLButtonElement>(null);
  const [annonce, setAnnonce] = useState("");
  const normales = etapes.filter((e) => !estLignePiege(e));
  const pieges = etapes.filter(estLignePiege);
  const total = normales.reduce((s, e) => s + lignesDeLEtapeCorrigee(e), 0) + pieges.length;

  // Ligne en cours : ramenée dans la vue (au-dessus de la barre fixe du bas) et annoncée aux lecteurs d'écran.
  useEffect(() => {
    if (pas === null) return;
    const courante = racineRef.current?.querySelectorAll<HTMLElement>(`[data-ligne="${pas - 1}"]`);
    if (!courante || courante.length === 0) return;
    courante[courante.length - 1].scrollIntoView({ block: "nearest", behavior: animationsReduites() ? "auto" : "smooth" });
    setAnnonce(`Ligne ${pas} sur ${total} : ${[...courante].map(texteParleDe).join(" ")}`);
  }, [pas, total]);

  if (etapes.length === 0) return null;
  const etat: EtatLigne = pas === null ? TOUT_MONTRE : (k) => (k < pas - 1 ? " cp-passe" : k === pas - 1 ? " cp-courant" : " cp-futur");
  const etatEtiquette = (premiere: number) => (pas !== null && premiere > pas - 1 ? " cp-futur" : "");

  const ecouter = () => {
    if (pas === null) return;
    const courante = racineRef.current?.querySelectorAll(`[data-ligne="${pas - 1}"]`);
    if (!courante || courante.length === 0) return;
    // Moteur de lecture (`voixLecture.ts`) : la ligne est surlignée pendant qu'elle est dite.
    lire(phrasesDe([...courante]), { titre: `Ligne ${pas} sur ${total}`, source: "corrige-ligne" });
  };
  const suivante = () => {
    if (pas === null) return;
    const prochaine = pas + 1;
    setPas(prochaine);
    // Dernière ligne : « Ligne suivante » disparaît, le focus passe à « Tout montrer ».
    if (prochaine >= total) requestAnimationFrame(() => toutRef.current?.focus({ preventScroll: true }));
  };
  const commencer = () => {
    retenirLigneParLigne(true);
    setPas(1);
    requestAnimationFrame(() => suivanteRef.current?.focus({ preventScroll: true }));
  };

  let compteur = 0;
  return (
    <div className={`corrige-ecran${pas !== null ? " corrige-pas" : ""}`} ref={racineRef}>
      <div className="corrige-pas-tete">
        <p className="corrige-ecran-titre">{titre}</p>
        {total > 1 && pas === null && (
          <button type="button" className="corrige-pas-ouvrir no-export" onClick={commencer}>
            Lire ligne par ligne
          </button>
        )}
        {pas === null && (
          <BoutonEcouter
            className="ecouter-gen"
            libelle="Écouter le corrigé"
            libelleCourt="Écouter"
            titre="Corrigé"
            phrases={() => phrasesDe(racineRef.current, { exclure: ".corrige-pas-tete" })}
            zone={() => racineRef.current}
          />
        )}
      </div>
      {normales.map((e, i) => {
        const debut = compteur;
        const n = lignesDeLEtapeCorrigee(e);
        compteur += n;
        const texte = e.fragments.length > 0 ? debut : -1;
        const debutCalcul = debut + (e.fragments.length > 0 ? 1 : 0);
        const derniere = debut + Math.max(0, n - 1);
        const figureSeule = texte < 0 && !(e.calcul && e.calcul.length > 0);
        return (
          <div key={i} className={`corrige-ecran-ligne${e.type === "resultat" ? " corrige-ecran-resultat" : ""}`}>
            <span className={`corrige-ecran-lbl${etatEtiquette(debut)}`}>{e.label}</span>
            <div className="corrige-ecran-contenu">
              {e.fragments.length > 0 ? (
                <div className={`${e.type === "resultat" ? "corrige-ecran-cadre" : "corrige-ecran-texte"}${etat(texte)}`} data-ligne={texte}>
                  <Fragments fragments={e.fragments} />
                </div>
              ) : null}
              {e.calcul && e.calcul.length > 0 ? <Calcul lignes={e.calcul} debut={debutCalcul} etat={etat} /> : null}
              {e.figureHtml ? (
                <div
                  className={`corrige-ecran-figure${figureSeule ? etat(derniere) : etat(derniere).replace(" cp-courant", "")}`}
                  data-ligne={figureSeule ? derniere : undefined}
                  dangerouslySetInnerHTML={{ __html: e.figureHtml }}
                />
              ) : null}
            </div>
          </div>
        );
      })}
      {pieges.map((p, i) => {
        const k = compteur++;
        return (
          <div key={`p${i}`} className={`corrige-ecran-piege${etat(k)}`} data-ligne={k}>
            <span className="corrige-ecran-piege-lbl">Piège</span>
            <span>
              <Fragments fragments={p.fragments} />
            </span>
          </div>
        );
      })}
      {pas !== null && (
        <div className="corrige-pas-boutons no-export">
          <span className="corrige-pas-compte" aria-hidden="true">
            Ligne {pas} sur {total}
          </span>
          {pas < total && (
            <button type="button" className="btn corrige-pas-suivante" ref={suivanteRef} onClick={suivante}>
              Ligne suivante
            </button>
          )}
          <button
            type="button"
            className="btn corrige-pas-tout"
            ref={toutRef}
            onClick={() => {
              // Avant la dernière ligne : l'élève préfère le corrigé complet (retenu pour la suite).
              if (pas < total) retenirLigneParLigne(false);
              setPas(null);
            }}
          >
            Tout montrer
          </button>
          {voixDisponible() && (
            <button type="button" className="btn corrige-pas-ecouter" onClick={ecouter} aria-label={`Écouter la ligne ${pas}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 9v6h4l5 4V5L8 9z" />
                <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
              </svg>
              Écouter
            </button>
          )}
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {pas !== null ? annonce : ""}
      </p>
    </div>
  );
}
