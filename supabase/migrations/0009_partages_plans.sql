-- =================================================================================================
-- Math-Belgium — coffre : partager une évaluation (un examen, une feuille) avec un collègue par un lien
-- =================================================================================================
--
-- À coller APRÈS 0008_evaluation_generateurs.sql (il ne dépend que de 0001 : profils, plans,
-- est_actif), dans l'éditeur SQL du projet Supabase (SQL Editor → New query → coller TOUT ce fichier
-- → Run). Idempotent : le relancer ne casse rien et ne perd aucune donnée (tables `create table if
-- not exists`, contraintes ajoutées seulement si absentes, fonctions `create or replace`). Aucune clé
-- secrète, aucun jeton, aucun mot de passe : rien à remplacer.
--
-- Résultat attendu : « Success. No rows returned ». Recharger /coffre : le bouton « Partager » d'un
-- enregistrement crée un lien https://math-belgium.vercel.app/partage/<jeton> (Supabase peut mettre
-- quelques secondes à voir les nouvelles tables). Tant que ce fichier n'est pas exécuté, le coffre
-- marche comme avant et « Partager » affiche « Applique la migration 0009 pour partager ».
--
-- Décisions du professeur (25/11/2026) :
--   - le lien ne s'ouvre que pour un professeur CONNECTÉ et actif (jamais `anon`) ;
--   - « Ajouter à mon coffre » fait une COPIE dans les plans du destinataire : aucune modification ne
--     remonte vers l'enregistrement d'origine, ni l'inverse ;
--   - contenu partagé = réglages du document (chapitres, lignes, variantes, points, options,
--     consignes, graines) ; le cartouche école / professeur du propriétaire est RETIRÉ (à la création
--     du partage et à l'ajout) : le destinataire imprime avec le sien ; rien sur les classes ni le
--     carnet (le plan n'en contient pas) ;
--   - le lien expire 30 jours après sa création ; « Arrêter le partage » le désactive tout de suite ;
--   - pas d'envoi direct par adresse (plus tard si besoin).
--
-- Contenu (AUCUNE donnée d'élève) :
--   partages_plans   un lien de partage : jeton (64 caractères hexadécimaux tirés par le serveur,
--                    244 bits aléatoires : impossible à deviner), propriétaire, enregistrement
--                    d'origine (plan_id, NULL s'il est supprimé ensuite), type, titre, résumé
--                    (petit objet affiché au destinataire), contenu (COPIE figée du PlanDocument au
--                    moment du partage, sans cartouche), créé le, expire le (+ 30 jours, imposé),
--                    révoqué, nombre d'ajouts (collègues DISTINCTS qui l'ont ajouté à leur coffre).
--   partages_ajouts  qui a ajouté quel partage (un collègue compte une fois) : lue par AUCUN client,
--                    seulement par les fonctions ci-dessous pour tenir le compteur.
--   RLS              le propriétaire voit et supprime SES partages (compte actif) ; il en crée
--                    (seules les colonnes plan_id, type, titre, resume, contenu sont écrites par le
--                    site : jeton, dates, révocation et compteur sont imposés par la base) ; il ne
--                    peut pas les modifier (arrêter = fonction `arreter_partage`). Personne d'autre
--                    ne lit la table : un collègue n'accède à un partage QUE par son jeton exact,
--                    via `lire_partage` / `ajouter_partage` (SECURITY DEFINER) — aucune liste,
--                    aucune recherche, donc aucune énumération possible. L'administrateur ne voit
--                    rien de plus qu'avant. `anon` n'a aucun droit (tables et fonctions).
--   limites          titre 1–200 caractères, résumé ≤ 4 Ko, contenu ≤ 2 Mo (comme `plans`),
--                    100 partages actifs au plus par professeur.
-- =================================================================================================

-- Clé (id, proprietaire) des plans : le partage ne peut viser qu'un enregistrement À SOI (clé
-- étrangère composée, comme les classes / écoles de 0002).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'plans_id_proprietaire_uniq' and conrelid = 'public.plans'::regclass) then
    alter table public.plans add constraint plans_id_proprietaire_uniq unique (id, proprietaire);
  end if;
end;
$$;

create table if not exists public.partages_plans (
  id            uuid primary key default gen_random_uuid(),
  -- Deux UUID v4 (122 bits aléatoires chacun) sans tirets : 64 caractères hexadécimaux, sans extension.
  jeton         text not null unique default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  proprietaire  uuid not null default auth.uid() references public.profils (id) on delete cascade,
  plan_id       uuid,
  type          text not null,
  titre         text not null,
  resume        jsonb not null default '{}'::jsonb,
  contenu       jsonb not null,
  cree_le       timestamptz not null default now(),
  expire_le     timestamptz not null default (now() + interval '30 days'),
  revoque       boolean not null default false,
  revoque_le    timestamptz,
  nombre_ajouts integer not null default 0
);
comment on table public.partages_plans is 'Coffre : liens de partage d''un enregistrement (copie figée du PlanDocument, sans cartouche). Lus par un collègue seulement par leur jeton (lire_partage / ajouter_partage).';
create index if not exists partages_plans_proprietaire_idx on public.partages_plans (proprietaire, cree_le desc);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'partages_plans_jeton_format' and conrelid = 'public.partages_plans'::regclass) then
    alter table public.partages_plans add constraint partages_plans_jeton_format check (jeton ~ '^[0-9a-f]{64}$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'partages_plans_type_valide' and conrelid = 'public.partages_plans'::regclass) then
    alter table public.partages_plans add constraint partages_plans_type_valide check (type in ('exercice', 'evaluation', 'examen', 'remediation'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'partages_plans_titre_valide' and conrelid = 'public.partages_plans'::regclass) then
    alter table public.partages_plans add constraint partages_plans_titre_valide check (char_length(btrim(titre)) between 1 and 200);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'partages_plans_resume_valide' and conrelid = 'public.partages_plans'::regclass) then
    alter table public.partages_plans add constraint partages_plans_resume_valide check (jsonb_typeof(resume) = 'object' and octet_length(resume::text) <= 4000);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'partages_plans_contenu_valide' and conrelid = 'public.partages_plans'::regclass) then
    alter table public.partages_plans add constraint partages_plans_contenu_valide check (jsonb_typeof(contenu) = 'object' and octet_length(contenu::text) <= 2000000);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'partages_plans_ajouts_valide' and conrelid = 'public.partages_plans'::regclass) then
    alter table public.partages_plans add constraint partages_plans_ajouts_valide check (nombre_ajouts >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'partages_plans_dates_valides' and conrelid = 'public.partages_plans'::regclass) then
    alter table public.partages_plans add constraint partages_plans_dates_valides check (expire_le > cree_le and expire_le <= cree_le + interval '30 days' and (revoque_le is null or revoque));
  end if;
  -- Enregistrement d'origine : à soi, et sa suppression garde le partage (copie figée), lien à NULL.
  if not exists (select 1 from pg_constraint where conname = 'partages_plans_plan_du_proprietaire' and conrelid = 'public.partages_plans'::regclass) then
    alter table public.partages_plans add constraint partages_plans_plan_du_proprietaire
      foreign key (plan_id, proprietaire) references public.plans (id, proprietaire) on delete set null (plan_id);
  end if;
end;
$$;

create table if not exists public.partages_ajouts (
  partage_id   uuid not null references public.partages_plans (id) on delete cascade,
  destinataire uuid not null references public.profils (id) on delete cascade,
  ajoute_le    timestamptz not null default now(),
  primary key (partage_id, destinataire)
);
comment on table public.partages_ajouts is 'Collègues qui ont ajouté un partage à leur coffre (un collègue compte une fois). Aucun accès client : tenue par ajouter_partage.';

-- -------------------------------------------------------------------------------------------------
-- Création : valeurs imposées par la base (le site n'écrit que plan_id, type, titre, resume, contenu)
-- -------------------------------------------------------------------------------------------------

-- SECURITY INVOKER : ne lit que les partages du propriétaire (ses lignes, visibles par le RLS).
create or replace function public.partages_plans_avant_insertion()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- (un contenu qui n'est pas un objet est refusé par `partages_plans_contenu_valide`, juste après)
  if jsonb_typeof(new.contenu) = 'object' then
    new.contenu := new.contenu #- '{entete,cartouche}';
  end if;
  new.revoque := false;
  new.revoque_le := null;
  new.nombre_ajouts := 0;
  new.cree_le := now();
  new.expire_le := now() + interval '30 days';
  if (select count(*) from public.partages_plans p
       where p.proprietaire = new.proprietaire and not p.revoque and p.expire_le > now()) >= 100 then
    raise exception 'Trop de partages actifs (100 au plus) : arrête d''abord des partages dont tu n''as plus besoin.' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists partages_plans_avant_insertion on public.partages_plans;
create trigger partages_plans_avant_insertion before insert on public.partages_plans
  for each row execute function public.partages_plans_avant_insertion();

-- -------------------------------------------------------------------------------------------------
-- Fonctions du site
-- -------------------------------------------------------------------------------------------------

-- Lecture d'un partage par son jeton EXACT (professeur connecté et actif). `statut` :
--   'ok'       partage valable : titre, type, résumé, contenu, nom du professeur qui partage ;
--   'expire'   plus de 30 jours : rien d'autre n'est renvoyé que la date d'expiration ;
--   'revoque'  partage arrêté par son auteur (ou compte de l'auteur désactivé) ;
--   'inconnu'  aucun partage pour ce jeton (ou jeton mal formé).
-- `deja_ajoute` : le lecteur l'a déjà ajouté à son coffre ; `est_proprietaire` : c'est son partage.
create or replace function public.lire_partage(p_jeton text)
returns table (
  statut text, titre text, type text, resume jsonb, contenu jsonb, partage_par text,
  cree_le timestamptz, expire_le timestamptz, deja_ajoute boolean, est_proprietaire boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v public.partages_plans%rowtype;
  v_nom text;
  v_auteur_actif boolean;
begin
  if v_uid is null or not public.est_actif() then
    raise exception 'Réservé aux professeurs connectés.' using errcode = '42501';
  end if;
  if p_jeton is null or p_jeton !~ '^[0-9a-f]{64}$' then
    return query select 'inconnu'::text, null::text, null::text, null::jsonb, null::jsonb, null::text, null::timestamptz, null::timestamptz, false, false;
    return;
  end if;
  select * into v from public.partages_plans p where p.jeton = p_jeton;
  if not found then
    return query select 'inconnu'::text, null::text, null::text, null::jsonb, null::jsonb, null::text, null::timestamptz, null::timestamptz, false, false;
    return;
  end if;
  select pr.nom_affiche, pr.actif into v_nom, v_auteur_actif from public.profils pr where pr.id = v.proprietaire;
  if v.revoque or not coalesce(v_auteur_actif, false) then
    return query select 'revoque'::text, null::text, null::text, null::jsonb, null::jsonb, null::text, null::timestamptz, null::timestamptz, false, v.proprietaire = v_uid;
    return;
  end if;
  if v.expire_le <= now() then
    return query select 'expire'::text, null::text, null::text, null::jsonb, null::jsonb, null::text, null::timestamptz, v.expire_le, false, v.proprietaire = v_uid;
    return;
  end if;
  return query select 'ok'::text, v.titre, v.type, v.resume, v.contenu, v_nom, v.cree_le, v.expire_le,
    exists (select 1 from public.partages_ajouts a where a.partage_id = v.id and a.destinataire = v_uid),
    v.proprietaire = v_uid;
end;
$$;

-- « Ajouter à mon coffre » : COPIE dans les plans du lecteur, renvoie l'id du nouvel enregistrement.
--   p_mode 'memes'     mêmes exercices (mêmes graines : épreuve commune entre classes parallèles) —
--                      la copie figée du partage, telle quelle ;
--   p_mode 'nouveaux'  même structure, nouveau tirage : le site tire de nouvelles graines avec le
--                      pipeline du panneau et envoie le plan obtenu dans p_contenu (objet ≤ 2 Mo,
--                      cartouche retiré ici aussi). Le lecteur pourrait de toute façon enregistrer ce
--                      plan dans son coffre : rien n'est ouvert de plus.
-- Le compteur d'ajouts compte les collègues DISTINCTS (jamais le propriétaire lui-même).
create or replace function public.ajouter_partage(p_jeton text, p_mode text default 'memes', p_contenu jsonb default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v public.partages_plans%rowtype;
  v_auteur_actif boolean;
  v_contenu jsonb;
  v_id uuid;
  v_nouveau int;
begin
  if v_uid is null or not public.est_actif() then
    raise exception 'Réservé aux professeurs connectés.' using errcode = '42501';
  end if;
  if p_jeton is null or p_jeton !~ '^[0-9a-f]{64}$' then
    raise exception 'Lien de partage inconnu.' using errcode = 'P0002';
  end if;
  select * into v from public.partages_plans p where p.jeton = p_jeton for update;
  if not found then
    raise exception 'Lien de partage inconnu.' using errcode = 'P0002';
  end if;
  select pr.actif into v_auteur_actif from public.profils pr where pr.id = v.proprietaire;
  if v.revoque or not coalesce(v_auteur_actif, false) then
    raise exception 'Partage arrêté par son auteur.' using errcode = 'P0001';
  end if;
  if v.expire_le <= now() then
    raise exception 'Lien de partage expiré.' using errcode = 'P0001';
  end if;
  if p_mode = 'memes' then
    v_contenu := v.contenu;
  elsif p_mode = 'nouveaux' then
    if p_contenu is null or jsonb_typeof(p_contenu) <> 'object' or octet_length(p_contenu::text) > 2000000 then
      raise exception 'Plan tiré invalide.' using errcode = '22023';
    end if;
    v_contenu := p_contenu;
  else
    raise exception 'Mode d''ajout inconnu.' using errcode = '22023';
  end if;
  v_contenu := v_contenu #- '{entete,cartouche}';
  insert into public.plans (proprietaire, type, titre, contenu)
    values (v_uid, v.type, v.titre, v_contenu)
    returning id into v_id;
  if v.proprietaire <> v_uid then
    insert into public.partages_ajouts (partage_id, destinataire) values (v.id, v_uid)
      on conflict do nothing;
    get diagnostics v_nouveau = row_count;
    if v_nouveau > 0 then
      update public.partages_plans set nombre_ajouts = nombre_ajouts + 1 where id = v.id;
    end if;
  end if;
  return v_id;
end;
$$;

-- « Arrêter le partage » : le lien est refusé tout de suite (définitif ; partager à nouveau crée un
-- nouveau lien). Seulement ses propres partages, compte actif.
create or replace function public.arreter_partage(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.est_actif() then
    raise exception 'Réservé aux professeurs connectés.' using errcode = '42501';
  end if;
  update public.partages_plans set revoque = true, revoque_le = coalesce(revoque_le, now())
    where id = p_id and proprietaire = auth.uid();
  if not found then
    raise exception 'Partage introuvable.' using errcode = 'P0002';
  end if;
end;
$$;

-- -------------------------------------------------------------------------------------------------
-- Droits et RLS
-- -------------------------------------------------------------------------------------------------

-- Supabase accorde par défaut tout à anon / authenticated sur les nouvelles tables : on repart de rien.
revoke all on public.partages_plans, public.partages_ajouts from anon;
revoke all on public.partages_plans, public.partages_ajouts from authenticated;
grant select, delete on public.partages_plans to authenticated;
grant insert (plan_id, type, titre, resume, contenu) on public.partages_plans to authenticated;

alter table public.partages_plans enable row level security;
alter table public.partages_ajouts enable row level security;

drop policy if exists partages_plans_proprietaire_lecture on public.partages_plans;
create policy partages_plans_proprietaire_lecture on public.partages_plans for select to authenticated
  using (proprietaire = (select auth.uid()) and (select public.est_actif()));
drop policy if exists partages_plans_proprietaire_creation on public.partages_plans;
create policy partages_plans_proprietaire_creation on public.partages_plans for insert to authenticated
  with check (proprietaire = (select auth.uid()) and (select public.est_actif()));
drop policy if exists partages_plans_proprietaire_suppression on public.partages_plans;
create policy partages_plans_proprietaire_suppression on public.partages_plans for delete to authenticated
  using (proprietaire = (select auth.uid()) and (select public.est_actif()));
-- partages_ajouts : aucune politique, aucun droit → aucun client n'y lit ni n'y écrit.

revoke all on function public.partages_plans_avant_insertion() from public, anon;
grant execute on function public.partages_plans_avant_insertion() to authenticated;
revoke all on function public.lire_partage(text) from public, anon;
grant execute on function public.lire_partage(text) to authenticated;
revoke all on function public.ajouter_partage(text, text, jsonb) from public, anon;
grant execute on function public.ajouter_partage(text, text, jsonb) to authenticated;
revoke all on function public.arreter_partage(uuid) from public, anon;
grant execute on function public.arreter_partage(uuid) to authenticated;

-- Supabase recharge son cache de schéma à chaque DDL ; on le demande quand même (sans effet ailleurs).
notify pgrst, 'reload schema';
