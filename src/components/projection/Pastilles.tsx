import { useEffect, useId, useRef, useState } from 'react'
import { hauteurAuDessus, useCompacte } from './useCompacte'
import { clePageBlanche } from '../../lib/projection/annotations'
import { ajouterRecente, couleurFluo, couleurStylo, lireRecentes, NUANCIER_FLUO, NUANCIER_STYLO, teinteDe } from '../../lib/projection/couleurs'
import type { CouleursRecentes } from '../../lib/projection/couleurs'
import { estVueDepart, vueDe, zoomer } from '../../lib/projection/vue'
import { MathInline } from '../Math'
import { COULEURS_FLUO, COULEURS_STYLO, EPAISSEURS, FONDS } from './BarreOutils'
import type { Epaisseur, OutilsLocaux } from './BarreOutils'
import type { MagasinAnnotations } from './magasinAnnotations'
import { Pictogramme } from './Pictogrammes'
import type { NomPictogramme } from './Pictogrammes'
import { PaletteTraceur } from './Traceur'
import { BoutonsGabaritColler, MenuGabarit } from './ObjetsPage'
import type { FondBlanc, Projection } from './useProjection'

/**
 * Palettes REPLIÉES du mode projection (décision du professeur du 27/11/2026, maquettes « pastilles », côté gauche) :
 * - pastille du dessin en bas à gauche (couleur, épaisseur, outil) ; la toucher ouvre la colonne étroite des couleurs,
 *   épaisseurs, gomme, annuler, tout effacer, nuancier ; elle se replie dès qu'on écrit sur la diapo, à Échap ou en
 *   re-touchant la pastille (`OutilsLocaux.palette`, LOCAL à chaque fenêtre) ;
 * - petite barre de l'écran blanc en haut à gauche (pages, nouvelle page, menu du fond, traceur, zoom du repère).
 */

type SetOutils = (f: (o: OutilsLocaux) => OutilsLocaux) => void

const NOMS_EPAISSEUR: Record<Epaisseur, string> = { fin: 'fin', moyen: 'moyen', epais: 'épais' }

function nomCouleur(c: string, liste: { valeur: string; nom: string }[]): string {
  return liste.find((x) => x.valeur.toLowerCase() === c.toLowerCase())?.nom.toLowerCase() ?? 'couleur choisie'
}

const NOMS_OUTIL: Record<OutilsLocaux['outil'], string> = { stylo: 'Stylo', fluo: 'Surligneur', gomme: 'Gomme', compas: 'Compas' }
const PICTO_OUTIL: Record<OutilsLocaux['outil'], NomPictogramme> = { stylo: 'crayon', fluo: 'surligneur', gomme: 'gomme', compas: 'compas' }

/** Pastille ronde (bas à gauche) : couleur et épaisseur courantes, pictogramme de l'outil ; ouvre / replie la colonne. */
export function PastilleDessin({ outils, setOutils, idColonne }: { outils: OutilsLocaux; setOutils: SetOutils; idColonne: string }) {
  const fluo = outils.outil === 'fluo'
  const couleur = fluo ? outils.fluo : outils.couleur
  const description =
    outils.outil === 'gomme'
      ? 'Gomme'
      : `${NOMS_OUTIL[outils.outil]} ${fluo ? nomCouleur(couleur, COULEURS_FLUO) : nomCouleur(couleur, COULEURS_STYLO)}${fluo ? '' : `, trait ${NOMS_EPAISSEUR[outils.epaisseur]}`}`
  return (
    <button
      type="button"
      className={`projection-pastille projection-interactif${outils.palette ? ' ouverte' : ''}`}
      aria-expanded={outils.palette}
      aria-controls={idColonne}
      aria-label={`${description} : ${outils.palette ? 'replier' : 'ouvrir'} la palette`}
      title={`${description} — couleurs, épaisseur, gomme (Échap : replier)`}
      onClick={(e) => {
        e.stopPropagation()
        setOutils((o) => ({ ...o, palette: !o.palette, nuancier: false, menuFond: false, traceur: o.palette ? o.traceur : false }))
      }}
    >
      <span className={`pastille-encre${fluo ? ' fluo' : ''}${outils.outil === 'gomme' ? ' gomme' : ''}`} style={{ ['--c' as string]: couleur }} aria-hidden="true">
        {outils.outil === 'gomme' && <Pictogramme nom="gomme" taille={20} />}
      </span>
      <span className="pastille-trait" style={{ ['--e' as string]: `${fluo ? 8 : EPAISSEURS[outils.epaisseur] + 1}px`, ['--c' as string]: outils.outil === 'gomme' ? '#8a97a1' : couleur }} aria-hidden="true" />
      <span className="pastille-outil" aria-hidden="true">
        <Pictogramme nom={PICTO_OUTIL[outils.outil]} taille={14} />
      </span>
    </button>
  )
}

/** Dernières couleurs choisies au nuancier (mémorisées dans le navigateur, try/catch). */
function useRecentes(): [CouleursRecentes, (genre: 'stylo' | 'fluo', c: string) => void] {
  const [r, setR] = useState<CouleursRecentes>(() => lireRecentes())
  const ajouter = (genre: 'stylo' | 'fluo', c: string) => setR((x) => ajouterRecente(x, genre, c, (genre === 'stylo' ? COULEURS_STYLO : COULEURS_FLUO).map((k) => k.valeur)))
  return [r, ajouter]
}

/**
 * Colonne étroite le long du bord gauche (au-dessus de la pastille) : stylo (4 couleurs rapides + dernières couleurs du
 * nuancier), fluo (idem), 3 épaisseurs, gomme, annuler, tout effacer, « Nuancier ». Choisir une couleur garde la colonne
 * ouverte ; elle se replie au premier trait. Hauteur insuffisante (écran bas en paysage, vue du professeur) : deux
 * colonnes côte à côte (stylo + fluo | trait, gomme, annuler, effacer, nuancier), jamais de défilement.
 */
export function ColonneDessin({ outils, setOutils, id }: { outils: OutilsLocaux; setOutils: SetOutils; id: string }) {
  const [recentes, ajouterRecente] = useRecentes()
  const ref = useRef<HTMLDivElement>(null)
  const compacte = useCompacte(ref, hauteurAuDessus)
  // Nuancier en grand (à la place de la colonne) : la colonne est masquée le temps du choix.
  const [nuancierLarge, setNuancierLarge] = useState(false)
  const traitActif = outils.outil === 'stylo' || outils.outil === 'compas'
  const choisirStylo = (c: string) => setOutils((o) => ({ ...o, outil: o.outil === 'compas' ? 'compas' : 'stylo', couleur: c }))
  const choisirFluo = (c: string) => setOutils((o) => ({ ...o, outil: 'fluo', fluo: c }))
  const stylos = [...COULEURS_STYLO, ...recentes.stylo.map((c) => ({ valeur: c, nom: 'Couleur choisie' }))]
  const fluos = [...COULEURS_FLUO, ...recentes.fluo.map((c) => ({ valeur: c, nom: 'Couleur choisie' }))]
  return (
    <>
      <div
        ref={ref}
        id={id}
        className={`projection-colonne projection-interactif${compacte ? ' compacte' : ''}`}
        role="group"
        aria-label="Stylo, surligneur et gomme"
        hidden={outils.nuancier && nuancierLarge}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="colonne-groupe">
        <p className="colonne-nom" aria-hidden="true">
          {outils.outil === 'compas' ? 'Compas' : 'Stylo'}
        </p>
        <div className="colonne-grille">
          {stylos.map((c, i) => (
            <button
              key={`${c.valeur}-${i}`}
              type="button"
              className={`projection-couleur${traitActif && outils.couleur.toLowerCase() === c.valeur.toLowerCase() ? ' actif' : ''}${i >= COULEURS_STYLO.length ? ' recente' : ''}`}
              style={{ ['--c' as string]: c.valeur }}
              aria-label={`Stylo ${c.nom.toLowerCase()}${i >= COULEURS_STYLO.length ? ` (${c.valeur})` : ''}`}
              aria-pressed={traitActif && outils.couleur.toLowerCase() === c.valeur.toLowerCase()}
              title={i >= COULEURS_STYLO.length ? 'Couleur choisie au nuancier' : `Stylo ${c.nom.toLowerCase()} (S)`}
              onClick={() => choisirStylo(c.valeur)}
            />
          ))}
        </div>
        <p className="colonne-nom" aria-hidden="true">
          Fluo
        </p>
        <div className="colonne-grille">
          {fluos.map((c, i) => (
            <button
              key={`${c.valeur}-${i}`}
              type="button"
              className={`projection-fluo${outils.outil === 'fluo' && outils.fluo.toLowerCase() === c.valeur.toLowerCase() ? ' actif' : ''}`}
              style={{ ['--c' as string]: c.valeur }}
              aria-label={`Surligneur ${c.nom.toLowerCase()}${i >= COULEURS_FLUO.length ? ` (${c.valeur})` : ''}`}
              aria-pressed={outils.outil === 'fluo' && outils.fluo.toLowerCase() === c.valeur.toLowerCase()}
              title={i >= COULEURS_FLUO.length ? 'Couleur choisie au nuancier' : `Surligneur ${c.nom.toLowerCase()} (H)`}
              onClick={() => choisirFluo(c.valeur)}
            />
          ))}
        </div>
        </div>
        <div className="colonne-groupe">
        <p className="colonne-nom" aria-hidden="true">
          Trait
        </p>
        <div className="colonne-grille">
          {(Object.keys(EPAISSEURS) as Epaisseur[]).map((e) => (
            <button
              key={e}
              type="button"
              className={`projection-epaisseur${outils.epaisseur === e ? ' actif' : ''}`}
              style={{ ['--e' as string]: `${EPAISSEURS[e] + 1}px` }}
              aria-label={`Trait ${NOMS_EPAISSEUR[e]}`}
              aria-pressed={outils.epaisseur === e}
              title={`Trait ${NOMS_EPAISSEUR[e]}`}
              onClick={() => setOutils((o) => ({ ...o, epaisseur: e, outil: o.outil === 'fluo' || o.outil === 'gomme' ? 'stylo' : o.outil }))}
            >
              <span />
            </button>
          ))}
          <button
            type="button"
            className={`projection-outil${outils.outil === 'gomme' ? ' actif' : ''}`}
            aria-label="Gomme"
            aria-pressed={outils.outil === 'gomme'}
            title="Gomme"
            onClick={() => setOutils((o) => ({ ...o, outil: o.outil === 'gomme' ? 'stylo' : 'gomme' }))}
          >
            <Pictogramme nom="gomme" />
          </button>
          <button type="button" className="projection-outil" aria-label="Annuler le dernier trait" title="Annuler le dernier trait (Ctrl+Z)" onClick={() => window.dispatchEvent(new Event('projection:annuler'))}>
            <Pictogramme nom="annuler" />
          </button>
          <button type="button" className="projection-outil" aria-label="Tout effacer sur cette page" title="Tout effacer sur cette page" onClick={() => window.dispatchEvent(new Event('projection:effacer'))}>
            <Pictogramme nom="effacer" />
          </button>
        </div>
        <button
          type="button"
          className={`colonne-nuancier${outils.nuancier ? ' actif' : ''}`}
          aria-expanded={outils.nuancier}
          aria-controls={`${id}-nuancier`}
          title="Plus de couleurs : grille et réglage fin"
          onClick={() => setOutils((o) => ({ ...o, nuancier: !o.nuancier }))}
        >
          <Pictogramme nom="nuancier" taille={18} /> Nuancier
        </button>
        </div>
      </div>
      {outils.nuancier && (
        <Nuancier
          id={`${id}-nuancier`}
          outils={outils}
          choisir={(genre, c) => {
            ajouterRecente(genre, c)
            if (genre === 'stylo') choisirStylo(c)
            else choisirFluo(c)
          }}
          fermer={() => setOutils((o) => ({ ...o, nuancier: false }))}
          force={compacte}
          surLarge={setNuancierLarge}
        />
      )}
    </>
  )
}

/**
 * Nuancier (à côté de la colonne) : stylo — 24 teintes foncées à moyennes lisibles sur la diapo claire + réglage fin
 * (teinte, clarté ; une couleur trop claire est assombrie) ; fluo — 12 pastels + réglage de la teinte. Une couleur prise
 * rejoint les couleurs rapides (3 dernières, mémorisées dans ce navigateur). Se ferme au premier trait. Hauteur
 * insuffisante (ou colonne compacte) : en GRAND, à la place de la colonne (grille de 8, réglage fin à droite).
 */
function Nuancier({
  id,
  outils,
  choisir,
  fermer,
  force,
  surLarge,
}: {
  id: string
  outils: OutilsLocaux
  choisir: (genre: 'stylo' | 'fluo', c: string) => void
  fermer: () => void
  force: boolean
  surLarge: (large: boolean) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const large = useCompacte(ref, hauteurAuDessus, force)
  useEffect(() => {
    surLarge(large)
    return () => surLarge(false)
  }, [large, surLarge])
  const [onglet, setOnglet] = useState<'stylo' | 'fluo'>(outils.outil === 'fluo' ? 'fluo' : 'stylo')
  const depart = teinteDe(onglet === 'fluo' ? outils.fluo : outils.couleur)
  const [teinte, setTeinte] = useState(depart.h)
  const [clarte, setClarte] = useState(Math.max(15, Math.min(50, depart.l)))
  const apercu = onglet === 'stylo' ? couleurStylo(teinte, clarte) : couleurFluo(teinte)
  const actuelle = (onglet === 'stylo' ? outils.couleur : outils.fluo).toLowerCase()
  const idTeinte = useId()
  const idClarte = useId()
  const grille = onglet === 'stylo' ? NUANCIER_STYLO : NUANCIER_FLUO
  return (
    <div ref={ref} id={id} className={`projection-nuancier projection-interactif${large ? ' large' : ''}`} role="dialog" aria-label="Nuancier" onClick={(e) => e.stopPropagation()}>
      <div className="nuancier-gauche">
      <div className="nuancier-tete">
        <div className="nuancier-onglets" role="radiogroup" aria-label="Couleurs du">
          {(
            [
              ['stylo', 'Stylo'],
              ['fluo', 'Fluo'],
            ] as const
          ).map(([v, l]) => (
            <button key={v} type="button" role="radio" aria-checked={onglet === v} className="projection-duree" onClick={() => setOnglet(v)}>
              {l}
            </button>
          ))}
        </div>
        <button type="button" className="projection-outil" aria-label="Fermer le nuancier" title="Fermer le nuancier" onClick={fermer}>
          <Pictogramme nom="fermer" />
        </button>
      </div>
      <div className={`nuancier-grille${onglet === 'fluo' ? ' fluo' : ''}`} role="group" aria-label={onglet === 'stylo' ? 'Teintes du stylo' : 'Teintes du surligneur'}>
        {grille.map((c) => (
          <button
            key={c}
            type="button"
            className={`nuancier-case${actuelle === c.toLowerCase() ? ' actif' : ''}`}
            style={{ ['--c' as string]: c }}
            aria-label={`${onglet === 'stylo' ? 'Stylo' : 'Surligneur'} ${c}`}
            aria-pressed={actuelle === c.toLowerCase()}
            onClick={() => choisir(onglet, c)}
          />
        ))}
      </div>
      </div>
      <div className="nuancier-droite">
      <p className="nuancier-titre">Réglage fin</p>
      <div className="nuancier-reglage">
        <label htmlFor={idTeinte}>Teinte</label>
        <input id={idTeinte} type="range" min={0} max={359} step={1} value={teinte} className={`nuancier-curseur teinte${onglet === 'fluo' ? ' fluo' : ''}`} onChange={(e) => setTeinte(Number(e.target.value))} />
        {onglet === 'stylo' && (
          <>
            <label htmlFor={idClarte}>Clarté</label>
            <input
              id={idClarte}
              type="range"
              min={15}
              max={50}
              step={1}
              value={clarte}
              className="nuancier-curseur clarte"
              style={{ ['--h' as string]: String(teinte) }}
              onChange={(e) => setClarte(Number(e.target.value))}
            />
          </>
        )}
      </div>
      <div className="nuancier-choix">
        <span className={`nuancier-apercu${onglet === 'fluo' ? ' fluo' : ''}`} style={{ ['--c' as string]: apercu }} aria-hidden="true" />
        <button type="button" className="projection-duree nuancier-prendre" onClick={() => choisir(onglet, apercu)}>
          Prendre cette couleur
        </button>
      </div>
      </div>
    </div>
  )
}

/**
 * Dessin : pastille (si un outil de dessin est actif) + colonne (si ouverte). Vue du professeur : mêmes composants,
 * posés sur la diapo projetée (`.prof-scene-zone`, positions du CSS).
 */
export function OutilsDessin({ outils, setOutils }: { outils: OutilsLocaux; setOutils: SetOutils }) {
  const id = useId().replace(/:/g, '')
  if (!outils.stylo) return null
  return (
    <>
      <PastilleDessin outils={outils} setOutils={setOutils} idColonne={`colonne-${id}`} />
      {outils.palette && <ColonneDessin outils={outils} setOutils={setOutils} id={`colonne-${id}`} />}
    </>
  )
}

const PICTO_FOND: Record<FondBlanc, NomPictogramme> = { uni: 'fond-uni', quadrille: 'fond-quadrille', repere: 'fond-repere' }

/**
 * Écran blanc : UNE petite barre en haut à gauche — ‹ n / N › · + (nouvelle page) · « fond ▾ » (uni, quadrillé,
 * repère, supprimer la page avec confirmation) · f(x) (repère : traceur) · −, +, recentrer (zoom du repère). Le
 * traceur se déplie dessous.
 */
export function OutilsBlanc({
  projection,
  annotations,
  outils,
  setOutils,
  visible = true,
}: {
  projection: Projection
  annotations: MagasinAnnotations
  outils: OutilsLocaux
  setOutils: SetOutils
  visible?: boolean
}) {
  const page = projection.pageBlanche()
  const liste = projection.pagesBlanches()
  const [confirmer, setConfirmer] = useState(false)
  const idMenu = useId()
  const idTraceur = useId()
  const idGabarit = useId()
  const menuRef = useRef<HTMLDivElement>(null)
  const boutonFond = useRef<HTMLButtonElement>(null)
  useEffect(() => setConfirmer(false), [page?.id, outils.menuFond])
  // Menu du fond : se ferme au clic ailleurs.
  useEffect(() => {
    if (!outils.menuFond) return
    const ailleurs = (e: PointerEvent) => {
      const t = e.target as Node
      if (menuRef.current?.contains(t) || boutonFond.current?.contains(t)) return
      setOutils((o) => ({ ...o, menuFond: false }))
    }
    window.addEventListener('pointerdown', ailleurs, true)
    return () => window.removeEventListener('pointerdown', ailleurs, true)
  }, [outils.menuFond, setOutils])
  if (!page) return null
  const rang = liste.findIndex((p) => p.id === page.id) + 1
  const repere = page.fond === 'repere'
  const zoom = (f: number) => projection.majPage({ vue: zoomer(vueDe(page), f) })
  const ouvert = outils.menuFond || (repere && outils.traceur) || !!outils.menuGabarit
  return (
    <div className={`projection-blanc-outils${visible || ouvert ? '' : ' masquee'}`} onClick={(e) => e.stopPropagation()}>
      <div className="projection-blanc-barre projection-interactif" role="toolbar" aria-label="Écran blanc : pages, fond, zoom">
        <button type="button" className="projection-outil" aria-label="Page blanche précédente" title="Page blanche précédente (Page préc.)" disabled={rang <= 1} onClick={() => projection.allerPage(-1)}>
          <Pictogramme nom="precedent" />
        </button>
        <span className="pages-compteur" aria-live="polite">
          <span className="sr-only">Page </span>
          {rang} / {liste.length}
        </span>
        <button type="button" className="projection-outil" aria-label="Page blanche suivante" title="Page blanche suivante (Page suiv.)" disabled={rang >= liste.length} onClick={() => projection.allerPage(1)}>
          <Pictogramme nom="suivant" />
        </button>
        <button type="button" className="projection-outil" aria-label="Nouvelle page" title="Nouvelle page : garder celle-ci et passer à une page vierge (même fond)" onClick={() => projection.nouvellePage()}>
          <Pictogramme nom="plus" />
        </button>
        <span className="projection-separateur" aria-hidden="true" />
        <button
          ref={boutonFond}
          type="button"
          className={`projection-outil blanc-fond${outils.menuFond ? ' actif' : ''}`}
          aria-haspopup="menu"
          aria-expanded={outils.menuFond}
          aria-controls={idMenu}
          aria-label={`Fond de la page : ${FONDS.find((f) => f.valeur === page.fond)?.nom.toLowerCase()}`}
          title="Fond de la page (uni, quadrillé, repère) · supprimer la page"
          onClick={() => setOutils((o) => ({ ...o, menuFond: !o.menuFond, traceur: false, palette: false, nuancier: false, menuGabarit: false }))}
        >
          <Pictogramme nom={PICTO_FOND[page.fond]} />
          <Pictogramme nom="chevron-bas" taille={16} />
        </button>
        <BoutonsGabaritColler projection={projection} annotations={annotations} page={page} outils={outils} setOutils={setOutils} idMenu={idGabarit} />
        {repere && (
          <>
            <button
              type="button"
              className={`projection-outil blanc-traceur${outils.traceur ? ' actif' : ''}`}
              aria-expanded={outils.traceur}
              aria-controls={idTraceur}
              aria-label="Traceur de fonctions"
              title={outils.traceur ? 'Replier le traceur de fonctions' : 'Tracer une fonction sur le repère (et la liste des courbes)'}
              onClick={() => setOutils((o) => ({ ...o, traceur: !o.traceur, menuFond: false, palette: false, nuancier: false, menuGabarit: false }))}
            >
              <MathInline tex="f(x)" />
            </button>
            <span className="projection-separateur" aria-hidden="true" />
            <button type="button" className="projection-outil" aria-label="Dézoomer" title="Dézoomer (molette, pincer à deux doigts)" onClick={() => zoom(1 / 1.5)}>
              <Pictogramme nom="moins" />
            </button>
            <button type="button" className="projection-outil" aria-label="Zoomer" title="Zoomer (molette, écarter deux doigts)" onClick={() => zoom(1.5)}>
              <Pictogramme nom="plus" />
            </button>
            <button
              type="button"
              className="projection-outil"
              aria-label="Recentrer : vue de départ"
              title="Recentrer : origine au centre, échelle de départ (glisser à deux doigts ou à la souris : déplacer)"
              disabled={estVueDepart(page)}
              onClick={() => projection.majPage({ vue: undefined })}
            >
              <Pictogramme nom="recentrer" />
            </button>
          </>
        )}
      </div>
      {outils.menuFond && (
        <div ref={menuRef} id={idMenu} className="projection-menu-fond projection-interactif" role="menu" aria-label="Fond de la page">
          {confirmer ? (
            <div className="menu-confirmer" role="alertdialog" aria-label={`Supprimer la page ${rang}`}>
              <p>Supprimer la page {rang} et ce qui y est écrit ?</p>
              <div>
                <button
                  type="button"
                  className="projection-duree projection-duree--stop"
                  autoFocus
                  onClick={() => {
                    const idPage = projection.supprimerPage()
                    if (idPage) annotations.oublierPage(clePageBlanche(idPage))
                    setOutils((o) => ({ ...o, menuFond: false }))
                  }}
                >
                  Supprimer
                </button>
                <button type="button" className="projection-duree" onClick={() => setConfirmer(false)}>
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <>
              {FONDS.map((f) => (
                <button
                  key={f.valeur}
                  type="button"
                  role="menuitemradio"
                  aria-checked={page.fond === f.valeur}
                  className="menu-fond-choix"
                  onClick={() => {
                    projection.choisirFond(f.valeur)
                    // Repère choisi : le traceur se déplie (premier usage évident), replié dès qu'une courbe est tracée.
                    setOutils((o) => ({ ...o, menuFond: false, traceur: f.valeur === 'repere' && page.fond !== 'repere' ? true : o.traceur }))
                  }}
                >
                  <Pictogramme nom={PICTO_FOND[f.valeur]} />
                  {f.nom}
                  {page.fond === f.valeur && <Pictogramme nom="coche" taille={18} />}
                </button>
              ))}
              <span className="menu-separateur" role="separator" />
              <button type="button" role="menuitem" className="menu-fond-choix menu-supprimer" onClick={() => setConfirmer(true)}>
                <Pictogramme nom="effacer" />
                Supprimer cette page…
              </button>
            </>
          )}
        </div>
      )}
      {outils.menuGabarit && <MenuGabarit id={idGabarit} projection={projection} annotations={annotations} page={page} setOutils={setOutils} />}
      {repere && outils.traceur && (
        <PaletteTraceur id={idTraceur} projection={projection} annotations={annotations} page={page} outils={outils} replier={() => setOutils((o) => ({ ...o, traceur: false }))} setOutils={setOutils} />
      )}
    </div>
  )
}
