-- =================================================================================================
-- Math-Belgium — agenda du carnet : événements, périodes du bulletin, seuil d'avertissement
-- =================================================================================================
--
-- À coller APRÈS 0005_repartition.sql (il suppose 0001 à 0004 déjà exécutés : écoles, classes,
-- réglages du carnet), dans l'éditeur SQL du projet Supabase (SQL Editor → New query → coller TOUT
-- ce fichier → Run). Idempotent : le relancer ne casse rien et ne perd aucune donnée (tables
-- `if not exists`, colonne `add column if not exists`, contraintes ajoutées seulement si absentes,
-- fonctions `create or replace`, politiques et déclencheurs supprimés puis recréés). Aucune clé
-- secrète, aucun jeton, aucun mot de passe : rien à remplacer.
--
-- Résultat attendu : « Success. No rows returned ». Recharger /carnet : le bouton « + Événement »,
-- l'onglet Réglages (périodes du bulletin) et les compteurs d'heures effectives apparaissent (Supabase
-- peut mettre quelques secondes à voir les nouvelles tables). Tant que ce fichier n'est pas exécuté,
-- le carnet marche comme avant et ces écrans affichent « Agenda pas encore activé ».
--
-- Contenu (AUCUNE donnée d'élève) :
--   evenements          sortie, voyage scolaire, journée pédagogique, conseil de classe, session
--              d'examens, interrogation, autre — d'une école DU professeur, du … au …, journée
--              entière ou de la n-ième à la m-ième heure (numéros de l'horaire de l'école), toutes
--              les classes de l'école ou certaines, « J'accompagne ». Interrogation : UNE classe
--              (colonne `classe_id`), UNE date, heure et chapitre facultatifs ; elle ne supprime
--              aucune heure (c'est une heure de cours).
--   evenements_classes  les classes « certaines » d'un événement (table de liaison).
--   periodes_bulletin   par école ET par année scolaire : la date de remise des points de chaque
--              période (P1 … Pn).
--   carnet_reglages     nouvelle colonne `seuil_avertissement` (jours de classe, 0–15, défaut 3).
--   RLS        partout : chaque professeur ne voit / modifie que SES lignes, compte actif (même
--              `est_actif()` que 0001) ; `anon` n'a aucun droit ; l'administrateur ne voit rien.
--   cohérence  clés étrangères COMPOSÉES (comme 0002 / 0003) : un événement ne vise qu'une école à
--              soi ; une interrogation, une classe à soi DE CETTE ÉCOLE ; une liaison, un événement
--              à soi et une classe à soi de la MÊME école que l'événement. Vérifié par Postgres
--              lui-même, sans rien révéler des lignes des autres.
--   suppression  supprimer une école supprime ses événements et ses périodes ; supprimer une classe
--              supprime ses interrogations et la retire des événements ; `supprimer_mon_compte()`
--              (0001) efface toujours tout (cascade sur le profil).
--
-- Pourquoi une table de liaison plutôt qu'un tableau `classes uuid[]` : un élément de tableau ne
-- peut pas porter de clé étrangère. Il faudrait un déclencheur pour vérifier que chaque classe est
-- bien à soi et dans la bonne école, et rien ne retirerait une classe supprimée du tableau. Avec la
-- liaison, c'est la clé étrangère composée (classe_id, ecole_id, proprietaire) qui le garantit, la
-- cascade retire la classe supprimée, et le RLS s'applique ligne par ligne comme partout ailleurs.
-- =================================================================================================

-- -------------------------------------------------------------------------------------------------
-- Tables
-- -------------------------------------------------------------------------------------------------

create table if not exists public.evenements (
  id              uuid primary key default gen_random_uuid(),
  proprietaire    uuid not null default auth.uid() references public.profils (id) on delete cascade,
  ecole_id        uuid not null,
  type            text not null check (type in ('sortie', 'voyage', 'journee_pedagogique', 'conseil_classe', 'session_examens', 'interrogation', 'autre')),
  -- Vide : le site affiche le nom du type (« Journée pédagogique »).
  intitule        text not null default '' check (char_length(intitule) <= 120),
  du              date not null,
  au              date not null,
  -- Vrai : toute la journée (heures NULL). Faux : de la `heure_debut`-ième à la `heure_fin`-ième
  -- heure de l'horaire de l'école (0 = heure zéro, comme 0004).
  journee_entiere boolean not null default true,
  heure_debut     smallint,
  heure_fin       smallint,
  -- Vrai : toutes les classes de l'école ; faux : celles de `evenements_classes`.
  toutes_classes  boolean not null default true,
  -- « J'accompagne » : les heures du professeur avec ses AUTRES classes pendant l'événement sont
  -- aussi supprimées.
  accompagne      boolean not null default false,
  -- Interrogation seulement : sa classe (une seule) et son chapitre facultatif (« niveau/chapitre »).
  classe_id       uuid,
  chapitre        text,
  cree_le         timestamptz not null default now(),
  modifie_le      timestamptz not null default now(),
  constraint evenements_id_ecole_proprietaire_uniq unique (id, ecole_id, proprietaire),
  constraint evenements_dates_ordonnees check (au >= du),
  constraint evenements_dates_raisonnables check (du between date '2000-01-01' and date '2100-12-31' and au - du <= 366),
  constraint evenements_heures_valides check (
    case
      when journee_entiere then heure_debut is null and heure_fin is null
      else heure_debut is not null and heure_fin is not null and heure_debut between 0 and 15 and heure_fin between 0 and 15 and heure_fin >= heure_debut
    end
  ),
  constraint evenements_interrogation check (
    case
      when type = 'interrogation' then classe_id is not null and du = au and not toutes_classes and not accompagne
      else classe_id is null and chapitre is null
    end
  ),
  constraint evenements_chapitre_valide check (chapitre is null or chapitre ~ '^[a-z0-9-]{1,20}/[a-z0-9-]{1,80}$'),
  -- L'école doit appartenir au MÊME professeur (clé composée) ; la supprimer supprime l'événement.
  constraint evenements_ecole_du_proprietaire foreign key (ecole_id, proprietaire)
    references public.ecoles (id, proprietaire) on delete cascade,
  -- Interrogation : la classe doit appartenir au MÊME professeur ET à CETTE école ; la supprimer
  -- supprime l'interrogation ; une classe qui change d'école emmène ses interrogations.
  constraint evenements_classe_de_l_ecole foreign key (classe_id, ecole_id, proprietaire)
    references public.classes (id, ecole_id, proprietaire) on delete cascade on update cascade
);
comment on table public.evenements is 'Agenda du carnet : événements d''une école d''un professeur (sorties, journées pédagogiques, interrogations…). Aucune donnée d''élève.';
create index if not exists evenements_proprietaire_idx on public.evenements (proprietaire, du);
create index if not exists evenements_ecole_idx on public.evenements (ecole_id, proprietaire);
create index if not exists evenements_classe_idx on public.evenements (classe_id, ecole_id, proprietaire) where classe_id is not null;

create table if not exists public.evenements_classes (
  evenement_id uuid not null,
  classe_id    uuid not null,
  ecole_id     uuid not null,
  proprietaire uuid not null default auth.uid() references public.profils (id) on delete cascade,
  cree_le      timestamptz not null default now(),
  -- Clé avec le propriétaire : viser l'événement d'un autre donne l'erreur de clé étrangère, jamais
  -- un doublon qui révélerait qu'une liaison existe.
  constraint evenements_classes_pkey primary key (evenement_id, classe_id, proprietaire),
  -- L'événement doit être à soi, de la MÊME école ; le supprimer supprime ses liaisons.
  constraint evenements_classes_evenement foreign key (evenement_id, ecole_id, proprietaire)
    references public.evenements (id, ecole_id, proprietaire) on delete cascade,
  -- La classe doit être à soi, de la MÊME école que l'événement ; la supprimer la retire.
  constraint evenements_classes_classe foreign key (classe_id, ecole_id, proprietaire)
    references public.classes (id, ecole_id, proprietaire) on delete cascade
);
comment on table public.evenements_classes is 'Agenda du carnet : classes concernées par un événement « certaines classes ».';
create index if not exists evenements_classes_classe_idx on public.evenements_classes (classe_id, ecole_id, proprietaire);
create index if not exists evenements_classes_evenement_idx on public.evenements_classes (evenement_id, ecole_id, proprietaire);

create table if not exists public.periodes_bulletin (
  id             uuid primary key default gen_random_uuid(),
  proprietaire   uuid not null default auth.uid() references public.profils (id) on delete cascade,
  ecole_id       uuid not null,
  -- « 2026-2027 ».
  annee_scolaire text not null,
  numero         smallint not null check (numero between 1 and 8),
  -- Date de remise des points de la période.
  remise         date not null,
  cree_le        timestamptz not null default now(),
  modifie_le     timestamptz not null default now(),
  -- Année « AAAA-AAAA » consécutive, et remise entre le 1er août et le 31 juillet de cette année
  -- (le `case` évite toute conversion d'un texte mal formé).
  constraint periodes_bulletin_annee_valide check (
    case
      when annee_scolaire !~ '^[0-9]{4}-[0-9]{4}$' then false
      when substr(annee_scolaire, 6, 4)::int <> substr(annee_scolaire, 1, 4)::int + 1 then false
      else remise between make_date(substr(annee_scolaire, 1, 4)::int, 8, 1) and make_date(substr(annee_scolaire, 6, 4)::int, 7, 31)
    end
  ),
  constraint periodes_bulletin_ecole_du_proprietaire foreign key (ecole_id, proprietaire)
    references public.ecoles (id, proprietaire) on delete cascade
);
comment on table public.periodes_bulletin is 'Agenda du carnet : date de remise des points de chaque période du bulletin, par école et par année scolaire.';
-- Une période n par (école, année) ; une seule période par date de remise.
create unique index if not exists periodes_bulletin_numero_unique on public.periodes_bulletin (proprietaire, ecole_id, annee_scolaire, numero);
create unique index if not exists periodes_bulletin_remise_unique on public.periodes_bulletin (proprietaire, ecole_id, remise);

-- Seuil d'avertissement « peu de temps pour corriger » (jours de classe avant la remise des points).
alter table public.carnet_reglages add column if not exists seuil_avertissement smallint not null default 3;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'carnet_reglages_seuil_valide' and conrelid = 'public.carnet_reglages'::regclass) then
    alter table public.carnet_reglages add constraint carnet_reglages_seuil_valide check (seuil_avertissement between 0 and 15);
  end if;
end;
$$;

drop trigger if exists evenements_modifie_le on public.evenements;
create trigger evenements_modifie_le before update on public.evenements
  for each row execute function public.toucher_modifie_le();
drop trigger if exists periodes_bulletin_modifie_le on public.periodes_bulletin;
create trigger periodes_bulletin_modifie_le before update on public.periodes_bulletin
  for each row execute function public.toucher_modifie_le();

-- -------------------------------------------------------------------------------------------------
-- Déclencheurs de cohérence (droits de l'appelant, SECURITY INVOKER : le RLS s'applique, ils ne
-- touchent que les lignes du professeur)
-- -------------------------------------------------------------------------------------------------

-- Une liaison n'a de sens que pour un événement « certaines classes » qui n'est pas une
-- interrogation (une interrogation porte sa classe elle-même).
create or replace function public.evenements_classes_coherence()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.evenements e
     where e.id = new.evenement_id and e.proprietaire = new.proprietaire
       and (e.toutes_classes or e.type = 'interrogation')
  ) then
    raise exception 'Cet événement concerne toutes les classes (ou est une interrogation) : pas de liaison de classe.'
      using errcode = '23514', constraint = 'evenements_classes_coherence';
  end if;
  return new;
end;
$$;

drop trigger if exists evenements_classes_coherence on public.evenements_classes;
create trigger evenements_classes_coherence before insert or update on public.evenements_classes
  for each row execute function public.evenements_classes_coherence();

-- Un événement qui change d'école, passe à « toutes les classes » ou devient une interrogation
-- perd ses liaisons (sinon la clé composée bloquerait le changement d'école).
create or replace function public.evenements_retirer_liaisons()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.ecole_id is distinct from old.ecole_id or new.toutes_classes or new.type = 'interrogation' then
    delete from public.evenements_classes l where l.evenement_id = old.id and l.proprietaire = old.proprietaire;
  end if;
  return new;
end;
$$;

drop trigger if exists evenements_retirer_liaisons on public.evenements;
create trigger evenements_retirer_liaisons before update on public.evenements
  for each row execute function public.evenements_retirer_liaisons();

-- Une classe qui change d'école quitte les événements de l'ancienne (ses interrogations la suivent
-- par la cascade de la clé `evenements_classe_de_l_ecole`).
create or replace function public.agenda_classe_change_ecole()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.ecole_id is distinct from old.ecole_id then
    delete from public.evenements_classes l where l.classe_id = old.id and l.ecole_id = old.ecole_id;
  end if;
  return new;
end;
$$;

drop trigger if exists classes_change_ecole_agenda on public.classes;
create trigger classes_change_ecole_agenda before update of ecole_id on public.classes
  for each row execute function public.agenda_classe_change_ecole();

-- -------------------------------------------------------------------------------------------------
-- Droits de base : rien pour `anon` ; `authenticated` peut agir, le RLS filtre les lignes.
-- -------------------------------------------------------------------------------------------------

revoke all on public.evenements, public.evenements_classes, public.periodes_bulletin from anon;
revoke all on public.evenements, public.evenements_classes, public.periodes_bulletin from authenticated;
grant select, insert, update, delete on public.evenements, public.evenements_classes, public.periodes_bulletin to authenticated;

revoke all on function public.evenements_classes_coherence() from public, anon;
revoke all on function public.evenements_retirer_liaisons() from public, anon;
revoke all on function public.agenda_classe_change_ecole() from public, anon;
grant execute on function public.evenements_classes_coherence() to authenticated;
grant execute on function public.evenements_retirer_liaisons() to authenticated;
grant execute on function public.agenda_classe_change_ecole() to authenticated;

-- -------------------------------------------------------------------------------------------------
-- Row Level Security : uniquement ses lignes, compte actif (comme `classes` et `seances`).
-- -------------------------------------------------------------------------------------------------

alter table public.evenements enable row level security;
alter table public.evenements_classes enable row level security;
alter table public.periodes_bulletin enable row level security;

drop policy if exists evenements_proprietaire on public.evenements;
create policy evenements_proprietaire on public.evenements for all to authenticated
  using (proprietaire = (select auth.uid()) and (select public.est_actif()))
  with check (proprietaire = (select auth.uid()) and (select public.est_actif()));

drop policy if exists evenements_classes_proprietaire on public.evenements_classes;
create policy evenements_classes_proprietaire on public.evenements_classes for all to authenticated
  using (proprietaire = (select auth.uid()) and (select public.est_actif()))
  with check (proprietaire = (select auth.uid()) and (select public.est_actif()));

drop policy if exists periodes_bulletin_proprietaire on public.periodes_bulletin;
create policy periodes_bulletin_proprietaire on public.periodes_bulletin for all to authenticated
  using (proprietaire = (select auth.uid()) and (select public.est_actif()))
  with check (proprietaire = (select auth.uid()) and (select public.est_actif()));

-- Supabase recharge son cache de schéma à chaque DDL ; on le demande quand même (sans effet ailleurs).
notify pgrst, 'reload schema';
