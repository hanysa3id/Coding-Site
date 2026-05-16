-- ============================================================================
-- CMS Pages + User Groups + Extra Settings
-- Adds:
--   - cms_pages table (privacy/terms/refund/etc as DB-backed pages)
--   - user_groups + user_group_members (named groups for fine-grained access)
--   - default seed pages
--   - settings: telegram, orders_policy, business_hours; extended contact/social
-- ============================================================================

-- ============================================================================
-- CMS PAGES
-- ============================================================================
create table public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_ar text not null,
  title_en text not null,
  content_ar text,
  content_en text,
  status public.post_status not null default 'draft',
  show_in_footer boolean not null default false,
  sort_order int not null default 0,
  is_system boolean not null default false, -- system pages cannot be deleted
  seo_title_ar text,
  seo_title_en text,
  seo_description_ar text,
  seo_description_en text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cms_pages_slug_idx on public.cms_pages(slug);
create index cms_pages_status_idx on public.cms_pages(status);
create index cms_pages_show_in_footer_idx on public.cms_pages(show_in_footer);

create trigger cms_pages_touch_updated_at
  before update on public.cms_pages
  for each row execute function public.touch_updated_at();

alter table public.cms_pages enable row level security;

create policy "CMS pages: public read published"
  on public.cms_pages for select
  using (status = 'published' or public.is_admin());

create policy "CMS pages: admin write"
  on public.cms_pages for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- USER GROUPS (named collections of users with optional permissions json)
-- Examples: VIP customers, Beta testers, Partners, Internal QA
-- ============================================================================
create table public.user_groups (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text not null,
  name_en text not null,
  description_ar text,
  description_en text,
  -- Free-form permissions object — readable by app code that decides what each
  -- key means. E.g. { "can_skip_review": true, "discount_percent": 10 }
  permissions jsonb not null default '{}'::jsonb,
  color text, -- optional UI color tag (hex)
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_groups_slug_idx on public.user_groups(slug);

create trigger user_groups_touch_updated_at
  before update on public.user_groups
  for each row execute function public.touch_updated_at();

alter table public.user_groups enable row level security;

create policy "User groups: admin read"
  on public.user_groups for select
  using (public.is_admin() or public.is_staff());

create policy "User groups: admin write"
  on public.user_groups for all
  using (public.is_admin()) with check (public.is_admin());

-- Junction: user ↔ group
create table public.user_group_members (
  group_id uuid not null references public.user_groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  added_by uuid references public.profiles(id) on delete set null,
  added_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index user_group_members_user_idx on public.user_group_members(user_id);

alter table public.user_group_members enable row level security;

create policy "User group members: staff read; user reads own"
  on public.user_group_members for select
  using (public.is_staff() or user_id = auth.uid());

create policy "User group members: admin write"
  on public.user_group_members for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- SEED: default CMS pages (privacy, terms, refund-policy, about-us, faq)
-- Marked is_system=true so they can't be deleted from the UI (only edited).
-- ============================================================================

insert into public.cms_pages
  (slug, title_ar, title_en, content_ar, content_en, status, show_in_footer, sort_order, is_system, published_at)
values
  (
    'privacy',
    'سياسة الخصوصية',
    'Privacy Policy',
    E'# سياسة الخصوصية\n\nنحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات التي تشاركها معنا.\n\n## المعلومات التي نجمعها\n\n- المعلومات الشخصية: الاسم، البريد الإلكتروني، رقم الهاتف.\n- معلومات الطلبات والمدفوعات.\n- بيانات الاستخدام والتفاعل مع الموقع.\n\n## كيف نستخدم بياناتك\n\n- لتقديم الخدمات والرد على استفساراتك.\n- لتحسين تجربة الاستخدام.\n- لإرسال إشعارات وتحديثات متعلقة بطلباتك.\n\n## مشاركة البيانات\n\nلا نشارك بياناتك مع أي طرف ثالث إلا بموافقتك أو لتنفيذ خدمات الموقع (مثل بوابات الدفع).\n\n## حقوقك\n\nيحق لك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها في أي وقت.\n\n## التواصل\n\nلأي استفسار حول هذه السياسة، تواصل معنا عبر صفحة "اتصل بنا".',
    E'# Privacy Policy\n\nWe respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard the information you share with us.\n\n## Information We Collect\n\n- Personal information: name, email, phone number.\n- Order and payment information.\n- Usage data and site interactions.\n\n## How We Use Your Data\n\n- To provide services and respond to inquiries.\n- To improve your experience.\n- To send notifications and updates related to your orders.\n\n## Sharing Data\n\nWe do not share your data with any third party except with your consent or to fulfil site services (e.g. payment gateways).\n\n## Your Rights\n\nYou may request access, correction, or deletion of your data at any time.\n\n## Contact\n\nFor questions about this policy, reach us via the Contact page.',
    'published',
    true,
    10,
    true,
    now()
  ),
  (
    'terms',
    'شروط الاستخدام',
    'Terms of Service',
    E'# شروط الاستخدام\n\nباستخدام هذا الموقع فإنك توافق على الالتزام بالشروط التالية.\n\n## الخدمات\n\nنوفر خدمات برمجية وتصميمية بناءً على الطلبات المقدمة عبر الموقع. التفاصيل الكاملة لكل خدمة تظهر في صفحة الخدمة قبل تقديم الطلب.\n\n## الطلبات والدفع\n\n- يجب على العميل تقديم معلومات دقيقة عند الطلب.\n- يتم تأكيد السعر النهائي والمدة بعد التفاوض.\n- الدفع يكون عبر الطرق المتاحة في الموقع.\n\n## الإلغاء والاسترداد\n\nيمكن إلغاء الطلب قبل بدء التنفيذ. تفاصيل الاسترداد موضحة في "سياسة الاسترداد".\n\n## الملكية الفكرية\n\nجميع المحتويات والتصاميم المنتجة تُعتبر ملكاً للعميل بعد سداد كامل المستحقات.\n\n## تعديل الشروط\n\nنحتفظ بحق تعديل هذه الشروط في أي وقت، وسيتم إخطار المستخدمين بأي تغييرات جوهرية.',
    E'# Terms of Service\n\nBy using this site you agree to the following terms.\n\n## Services\n\nWe provide programming and design services based on requests submitted via the site. Full details of each service appear on its page before you place an order.\n\n## Orders & Payment\n\n- Customers must provide accurate information when ordering.\n- The final price and timeline are confirmed after negotiation.\n- Payment is made via the methods available on the site.\n\n## Cancellation & Refunds\n\nOrders may be cancelled before execution begins. Refund details are in the Refund Policy.\n\n## Intellectual Property\n\nAll content and designs produced become the customer''s property after full payment is received.\n\n## Modifications\n\nWe reserve the right to modify these terms at any time, with notice of any material changes.',
    'published',
    true,
    20,
    true,
    now()
  ),
  (
    'refund-policy',
    'سياسة الاسترداد',
    'Refund Policy',
    E'# سياسة الاسترداد\n\n## متى يحق لك الاسترداد؟\n\n- إذا لم يتم بدء العمل على الطلب بعد.\n- إذا فشل فريقنا في تسليم الخدمة وفق المتفق عليه.\n- في حالة عدم تحقق المخرجات المتفق عليها وعدم القدرة على الإصلاح خلال مدة معقولة.\n\n## متى لا يحق الاسترداد؟\n\n- بعد البدء الفعلي في تنفيذ الطلب يتم احتساب نسبة العمل المنجز.\n- لا يتم استرداد قيمة الخدمات الاستشارية أو التحليلية المنجزة.\n\n## آلية الاسترداد\n\n- يُقدّم العميل طلب الاسترداد عبر صفحة الطلب أو بريد الدعم.\n- تتم المراجعة خلال 3-5 أيام عمل.\n- يُعاد المبلغ بنفس وسيلة الدفع الأصلية.',
    E'# Refund Policy\n\n## When can you request a refund?\n\n- If work on the order has not yet started.\n- If our team fails to deliver the service as agreed.\n- If the agreed outcomes are not met and cannot be remedied within a reasonable time.\n\n## When refunds do not apply\n\n- After work has actually begun, a percentage based on completed work is deducted.\n- Completed consulting or analytical services are non-refundable.\n\n## How to claim a refund\n\n- Submit a refund request via the order page or support email.\n- Review takes 3–5 business days.\n- Refunds are returned via the original payment method.',
    'published',
    true,
    30,
    true,
    now()
  ),
  (
    'about-us',
    'من نحن',
    'About Us',
    E'# من نحن\n\nنحن فريق متخصص في تقديم حلول برمجية وتصميمية احترافية للشركات والأفراد.\n\n## رسالتنا\n\nتمكين عملائنا من تحقيق أهدافهم الرقمية من خلال منتجات وحلول عالية الجودة.\n\n## رؤيتنا\n\nأن نكون الخيار الأول للشركات الناشئة والمتوسطة في المنطقة العربية في مجال البرمجة والتصميم.\n\n## قيمنا\n\n- الجودة قبل السرعة.\n- الشفافية الكاملة مع العميل.\n- الاستمرارية في التعلم والتطور.',
    E'# About Us\n\nWe are a team specialized in delivering professional programming and design solutions for businesses and individuals.\n\n## Mission\n\nTo enable our customers to achieve their digital goals through high-quality products and solutions.\n\n## Vision\n\nTo be the first choice for startups and SMEs across the Arab region in programming and design.\n\n## Values\n\n- Quality before speed.\n- Full transparency with the client.\n- Continuous learning and growth.',
    'published',
    true,
    40,
    true,
    now()
  ),
  (
    'faq',
    'الأسئلة الشائعة',
    'FAQ',
    E'# الأسئلة الشائعة\n\n## كم يستغرق تنفيذ المشروع؟\n\nيختلف وقت التنفيذ حسب نوع الخدمة وحجم المشروع، ويتم تحديد المدة الدقيقة في مرحلة التفاوض.\n\n## ما هي طرق الدفع المتاحة؟\n\nنقبل الدفع عبر بوابات الدفع الإلكتروني، التحويل البنكي، فودافون كاش، وإنستاباي.\n\n## هل يمكنني تعديل الطلب بعد تقديمه؟\n\nنعم، يمكنك التواصل مع فريقنا لمناقشة أي تعديلات قبل البداية أو خلال مراحل التنفيذ المتفق عليها.\n\n## هل تقدّمون دعمًا بعد التسليم؟\n\nنعم، نقدم فترة دعم مجانية بعد التسليم تختلف مدتها حسب نوع الخدمة.\n\n## كيف يمكنني تتبع تقدم العمل؟\n\nمن خلال صفحة الطلب في حسابك يمكنك رؤية المراحل والتحديثات والملفات المرفوعة لحظياً.',
    E'# Frequently Asked Questions\n\n## How long does a project take?\n\nIt depends on the service type and project size. The exact timeline is set during the negotiation phase.\n\n## What payment methods do you accept?\n\nWe accept online payment gateways, bank transfer, Vodafone Cash, and InstaPay.\n\n## Can I modify my order after submitting it?\n\nYes — contact our team to discuss changes before work starts or during agreed milestones.\n\n## Do you provide post-delivery support?\n\nYes, we offer a free support window after delivery; its duration varies by service.\n\n## How can I track progress?\n\nFrom the order page in your account you can see milestones, updates, and uploaded files in real time.',
    'published',
    true,
    50,
    true,
    now()
  )
on conflict (slug) do nothing;

-- ============================================================================
-- SEED: extra settings (telegram, orders_policy, business_hours)
-- ============================================================================
insert into public.settings (key, value) values
  ('telegram', jsonb_build_object(
    'enabled', false,
    'bot_token', '',
    'admin_chat_id', '',
    'events', jsonb_build_object(
      'new_order', true,
      'order_status_changed', false,
      'payment_received', true,
      'payment_failed', true,
      'new_review', true,
      'new_message_from_customer', false,
      'order_cancelled', true
    ),
    'templates', jsonb_build_object(
      'new_order', E'🆕 *طلب جديد*\n\nرقم الطلب: `{order_number}`\nالعميل: {customer_name}\nالخدمة: {service_name}\nالسعر التقديري: {estimated_price} {currency}\n\n[فتح الطلب]({order_url})',
      'order_status_changed', E'🔄 *تحديث حالة الطلب*\n\n`{order_number}`\nالحالة الجديدة: *{new_status}*\nالعميل: {customer_name}',
      'payment_received', E'💰 *دفعة جديدة*\n\nرقم الطلب: `{order_number}`\nالمبلغ: *{amount} {currency}*\nالعميل: {customer_name}\nطريقة الدفع: {method}',
      'payment_failed', E'❌ *فشل دفع*\n\nرقم الطلب: `{order_number}`\nالعميل: {customer_name}\nسبب الفشل: {reason}',
      'new_review', E'⭐ *تقييم جديد*\n\nرقم الطلب: `{order_number}`\nالعميل: {customer_name}\nالتقييم: {rating}/5\n\n{comment}',
      'new_message_from_customer', E'💬 *رسالة جديدة من عميل*\n\nرقم الطلب: `{order_number}`\nالعميل: {customer_name}\n\n{preview}',
      'order_cancelled', E'🚫 *تم إلغاء طلب*\n\nرقم الطلب: `{order_number}`\nالعميل: {customer_name}'
    )
  )),
  ('orders_policy', jsonb_build_object(
    'max_pending_per_customer', 3,
    'pending_statuses', jsonb_build_array('pending_review', 'under_negotiation'),
    'require_phone_on_signup', false,
    'auto_assign_sales', false
  )),
  ('business_hours', jsonb_build_object(
    'timezone', 'Africa/Cairo',
    'sunday',    jsonb_build_object('open', '09:00', 'close', '18:00', 'closed', false),
    'monday',    jsonb_build_object('open', '09:00', 'close', '18:00', 'closed', false),
    'tuesday',   jsonb_build_object('open', '09:00', 'close', '18:00', 'closed', false),
    'wednesday', jsonb_build_object('open', '09:00', 'close', '18:00', 'closed', false),
    'thursday',  jsonb_build_object('open', '09:00', 'close', '18:00', 'closed', false),
    'friday',    jsonb_build_object('open', '00:00', 'close', '00:00', 'closed', true),
    'saturday',  jsonb_build_object('open', '09:00', 'close', '14:00', 'closed', false)
  ))
on conflict (key) do nothing;

-- Extend `contact` setting with extra social channels + map link
update public.settings
set value = value
  || jsonb_build_object(
       'address_link', coalesce(value->>'address_link', ''),
       'working_hours_note_ar', coalesce(value->>'working_hours_note_ar', ''),
       'working_hours_note_en', coalesce(value->>'working_hours_note_en', '')
     )
  || jsonb_build_object(
       'social', coalesce(value->'social', '{}'::jsonb)
         || jsonb_build_object(
              'tiktok', coalesce(value->'social'->>'tiktok', ''),
              'snapchat', coalesce(value->'social'->>'snapchat', ''),
              'github', coalesce(value->'social'->>'github', ''),
              'behance', coalesce(value->'social'->>'behance', ''),
              'dribbble', coalesce(value->'social'->>'dribbble', ''),
              'telegram', coalesce(value->'social'->>'telegram', '')
            )
     )
where key = 'contact';

-- ============================================================================
-- Seed: a couple of default user groups
-- ============================================================================
insert into public.user_groups (slug, name_ar, name_en, description_ar, description_en, color, is_system, permissions)
values
  ('vip',      'عملاء VIP',       'VIP Customers', 'عملاء مميزون يحصلون على أولوية في التنفيذ',  'Priority customers with faster turnaround', '#fbbf24', true,  jsonb_build_object('priority', true, 'discount_percent', 10)),
  ('beta',     'مختبرو النسخة التجريبية', 'Beta Testers',  'يرون الميزات قبل إطلاقها', 'See features before public release',   '#8b5cf6', false, jsonb_build_object('beta_features', true)),
  ('partners', 'شركاء',            'Partners',      'شركاء تجاريون',                  'Business partners',                     '#10b981', false, jsonb_build_object('partner', true))
on conflict (slug) do nothing;
