-- ============================================================================
-- QUICK TEST: just the 7 root categories.
-- Paste this entire file into Supabase SQL Editor, click somewhere blank
-- to deselect any text, then press Ctrl+Enter (Cmd+Enter on Mac).
-- If this works, run the full 20260522000000_seed_catalog.sql the same way.
-- This file is safe to run multiple times (ON CONFLICT (slug) DO NOTHING).
-- ============================================================================

insert into public.categories
  (slug, parent_id, name_ar, name_en, description_ar, description_en, image_url, sort_order, is_visible)
values
  ('programming', null,
   'البرمجة والتطوير', 'Programming and Development',
   'حلول برمجية متكاملة تحول أفكارك إلى منتجات رقمية تعمل بكفاءة وأمان.',
   'End-to-end software solutions that turn your ideas into reliable digital products.',
   'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
   10, true),

  ('design', null,
   'التصميم', 'Design',
   'تصميم بصري يحكي قصة علامتك ويجذب جمهورك على كل المنصات.',
   'Visual design that tells your brand story and engages your audience.',
   'https://images.unsplash.com/photo-1561070791-2526d30994b8?auto=format&fit=crop&w=800&q=80',
   20, true),

  ('hosting', null,
   'الاستضافة والبنية التحتية', 'Hosting and Infrastructure',
   'بنية تحتية موثوقة وآمنة لاستضافة موقعك مع مراقبة على مدار الساعة.',
   'Reliable, secure infrastructure with round-the-clock monitoring.',
   'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
   30, true),

  ('social-media', null,
   'السوشيال ميديا', 'Social Media',
   'إدارة احترافية لحضورك على منصات التواصل مع تقارير عائد الاستثمار.',
   'Professional social-presence management with ROI reporting.',
   'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
   40, true),

  ('digital-marketing', null,
   'التسويق الرقمي', 'Digital Marketing',
   'حملات مبنية على البيانات تجلب لك عملاء حقيقيين لا مجرد أرقام.',
   'Data-driven campaigns that bring real customers, not just metrics.',
   'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
   50, true),

  ('support-training', null,
   'الدعم الفني والتدريب', 'Support and Training',
   'دعم فني سريع وتدريب عملي على الأنظمة لكي يستفيد فريقك من كل ميزة.',
   'Fast technical support and hands-on system training for your team.',
   'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
   60, true),

  ('testing-qa', null,
   'الاختبارات وضمان الجودة', 'Testing and QA',
   'نختبر منتجك قبل أن يختبره عملاؤك لنكشف العيوب قبل الإطلاق.',
   'We test your product before your customers do, catching issues before launch.',
   'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
   70, true)
on conflict (slug) do nothing;

-- Verify the inserts worked:
select slug, name_en from public.categories where parent_id is null order by sort_order;
