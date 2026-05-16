-- ============================================================================
-- Add attachment metadata to order_messages so messages can carry an audio
-- voice note (or a file/image) alongside or instead of text.
--
-- attachment_url already exists; this migration adds the metadata needed to
-- render the right UI for each attachment kind (inline audio player vs.
-- download link), and relaxes the `content` NOT-NULL implicitly by allowing
-- empty strings when only an attachment is sent.
-- ============================================================================

alter table public.order_messages
  add column if not exists attachment_kind text,
  add column if not exists attachment_mime text,
  add column if not exists attachment_size int,
  add column if not exists attachment_name text;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'order_messages_attachment_kind_check'
  ) then
    alter table public.order_messages
      add constraint order_messages_attachment_kind_check
      check (attachment_kind is null or attachment_kind in ('audio', 'image', 'file'));
  end if;
end $$;

-- Allow empty content when the message is audio-only
alter table public.order_messages
  alter column content drop not null;

-- Ensure that a message has SOMETHING — either text or an attachment.
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'order_messages_payload_check'
  ) then
    alter table public.order_messages
      add constraint order_messages_payload_check
      check (
        (content is not null and length(trim(content)) > 0)
        or attachment_url is not null
      );
  end if;
end $$;
