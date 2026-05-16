-- ============================================================================
-- Seed default settings
-- ============================================================================

insert into public.settings (key, value) values
  ('site', jsonb_build_object(
    'name_ar', 'منصة الشركة',
    'name_en', 'Company Platform',
    'description_ar', 'منصة متكاملة لخدمات البرمجة والتصميم',
    'description_en', 'A complete platform for programming and design services',
    'logo_url', null,
    'favicon_url', null
  )),
  ('whatsapp', jsonb_build_object(
    'business_number', '201000000000',
    'show_floating_button', true,
    'default_message_ar', 'مرحباً، أرغب في الاستفسار عن خدماتكم.',
    'default_message_en', 'Hello, I would like to inquire about your services.'
  )),
  ('seo', jsonb_build_object(
    'default_title_ar', 'منصة الشركة - خدمات برمجة وتصميم',
    'default_title_en', 'Company Platform - Programming & Design Services',
    'default_description_ar', 'نقدم خدمات برمجة وتصميم احترافية',
    'default_description_en', 'We provide professional programming and design services',
    'og_image', null,
    'twitter_handle', null
  )),
  ('contact', jsonb_build_object(
    'email', 'info@example.com',
    'phone', '+20 100 000 0000',
    'address_ar', '',
    'address_en', '',
    'social', jsonb_build_object(
      'facebook', null,
      'instagram', null,
      'twitter', null,
      'linkedin', null,
      'youtube', null
    )
  )),
  ('payments', jsonb_build_object(
    'paymob_enabled', false,
    'offline_enabled', true,
    'currency', 'EGP',
    'currency_symbol_ar', 'ج.م',
    'currency_symbol_en', 'EGP'
  ))
on conflict (key) do nothing;
