-- ============================================================================
-- Seed: blog categories (4 roots + 3 sub) + 5 rich Arabic articles.
-- Idempotent — uses ON CONFLICT (slug) DO NOTHING for posts and categories.
-- Run AFTER 20260523000000_blog_extensions.sql.
-- ============================================================================

-- ── BLOG CATEGORIES ──────────────────────────────────────────────────────────
insert into public.blog_categories
  (slug, parent_id, name_ar, name_en, description_ar, description_en, image_url, is_visible, sort_order)
values
  ('development', null,
   'التطوير والبرمجة', 'Development',
   'مقالات تقنية عن بناء المواقع والتطبيقات وحلول البرمجة الحديثة.',
   'Technical articles on building websites, applications, and modern development.',
   'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
   true, 10),

  ('hosting-infra', null,
   'الاستضافة والبنية التحتية', 'Hosting & Infrastructure',
   'كل ما يخص الاستضافة، الخوادم، النطاقات، وإدارة البنية التحتية.',
   'Everything about hosting, servers, domains, and infrastructure management.',
   'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
   true, 20),

  ('marketing', null,
   'التسويق الرقمي', 'Digital Marketing',
   'خطط واستراتيجيات تسويقية وأدوات تساعدك على الوصول لعملائك المثاليين.',
   'Marketing strategies and tools to reach your ideal customers.',
   'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
   true, 30),

  ('ecommerce', null,
   'المتاجر الإلكترونية', 'E-commerce',
   'دروس وأفكار لبناء وإدارة متاجر إلكترونية ناجحة.',
   'Lessons and ideas for building and managing successful online stores.',
   'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80',
   true, 40),

  ('seo', (select id from public.blog_categories where slug = 'marketing'),
   'تحسين محركات البحث (SEO)', 'SEO',
   'تقنيات وممارسات لتظهر علامتك في النتائج الأولى لجوجل.',
   'Techniques and best practices to rank in Google search results.',
   'https://images.unsplash.com/photo-1599658880436-c61792e70672?auto=format&fit=crop&w=600&q=80',
   true, 10),

  ('competitor-analysis', (select id from public.blog_categories where slug = 'marketing'),
   'تحليل المنافسين', 'Competitor Analysis',
   'كيف تكشف ما يفعله منافسوك وتستفيد منه لتسبقهم.',
   'How to uncover what competitors do and use it to get ahead.',
   'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80',
   true, 20),

  ('platforms-comparison', (select id from public.blog_categories where slug = 'ecommerce'),
   'مقارنة المنصات', 'Platform Comparisons',
   'مقارنات معمقة بين منصات التجارة الإلكترونية المختلفة.',
   'In-depth comparisons of e-commerce platforms.',
   'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80',
   true, 10)
on conflict (slug) do nothing;

-- ── BLOG POSTS ───────────────────────────────────────────────────────────────

-- 1) كيفية إنشاء موقع إلكتروني متكامل ───────────────────────────────────────
insert into public.blog_posts
  (slug, title_ar, title_en, excerpt_ar, excerpt_en,
   content_ar, content_en,
   cover_image, status, published_at, is_featured,
   reading_time_minutes, tags, faqs, media,
   seo_title_ar, seo_title_en, seo_description_ar, seo_description_en,
   seo_keywords_ar, seo_keywords_en)
values
  ('how-to-build-complete-website',
   'كيفية إنشاء موقع إلكتروني متكامل: دليل شامل من الصفر للنشر',
   'How to Build a Complete Website: From Zero to Production',
   'دليل عملي خطوة بخطوة لبناء موقع إلكتروني احترافي يخدم أهدافك التجارية — من تحديد المتطلبات وحتى النشر والتسويق.',
   'A step-by-step practical guide to building a professional website that serves your business goals — from requirements to launch.',
   E'# كيفية إنشاء موقع إلكتروني متكامل\n\nبناء موقع إلكتروني ليس مجرد كتابة كود وتصميم صفحات — إنه عملية متكاملة تبدأ بفهم احتياجك التجاري وتنتهي بمنتج رقمي يحقق أهدافك. في هذا الدليل، نمر بكل مرحلة بالتفصيل.\n\n## 1. تحديد الهدف والمتطلبات\n\nقبل أي خط كود، اسأل نفسك:\n\n- **ما الغرض من الموقع؟** (تعريفي، متجر، حجوزات، تطبيق ويب، مدونة)\n- **من هو الجمهور المستهدف؟** (عمر، لغة، مستوى تقني، جهاز الاستخدام)\n- **ما هي الإجراءات الأساسية التي يجب أن يقوم بها الزائر؟** (الشراء، الاشتراك، التواصل، حجز موعد)\n- **ما الميزانية والمدة المتاحة؟**\n\n> نصيحة: اكتب 3-5 سيناريوهات استخدام واقعية. هذه السيناريوهات ستوجه كل قرار تصميمي وبرمجي لاحقاً.\n\n## 2. اختيار التقنية المناسبة\n\nالتقنية تختلف حسب نوع الموقع:\n\n| نوع الموقع | التقنية الموصى بها |\n| --- | --- |\n| موقع تعريفي بسيط | WordPress أو Webflow |\n| موقع شركة احترافي | Next.js + Tailwind CSS |\n| متجر إلكتروني | Shopify أو WooCommerce |\n| تطبيق ويب معقد | Next.js + Supabase / Firebase |\n| مدونة محتوى | Next.js + MDX أو Astro |\n\n### لماذا Next.js؟\n\n- **أداء عالي**: تحميل سريع جداً عبر تقنية SSG/SSR\n- **SEO ممتاز**: محركات البحث تقرأ المحتوى بسهولة\n- **مرونة**: يصلح للمواقع البسيطة والمعقدة\n- **دعم لغوي**: يدعم اللغة العربية وRTL بشكل أصلي\n\n## 3. تصميم تجربة المستخدم (UX)\n\nالخطأ الشائع: البدء بالتصميم البصري (UI) قبل تجربة المستخدم (UX). الترتيب الصحيح:\n\n1. **خرائط المستخدم (User Flows)**: ارسم كيف ينتقل الزائر من نقطة الدخول حتى الهدف.\n2. **Wireframes**: رسومات بسيطة بدون ألوان لتحديد بنية كل صفحة.\n3. **النموذج الأولي (Prototype)**: ربط الـ wireframes ببعضها في Figma لاختبار التدفق.\n4. **التصميم النهائي (UI)**: تطبيق نظام تصميم موحد بالألوان والخطوط والأيقونات.\n\n## 4. التطوير: Frontend و Backend\n\n### الواجهة الأمامية (Frontend)\n\n- اختر إطار عمل حديث (Next.js / React)\n- استخدم نظام تصميم (Tailwind CSS / shadcn/ui)\n- اعتمد مكونات قابلة لإعادة الاستخدام\n- اكتب الكود بطريقة منظمة وموثقة\n\n### الخلفية (Backend)\n\n- اختر قاعدة بيانات مناسبة (PostgreSQL لمعظم الحالات)\n- صمم الـ API بمعيار REST أو GraphQL\n- اهتم بالأمان (تشفير، صلاحيات، حماية من SQL Injection)\n- وثّق كل endpoint بـ OpenAPI/Swagger\n\n## 5. الاختبار قبل النشر\n\nلا تنشر موقعك قبل الاختبار على:\n\n- **متصفحات متعددة**: Chrome, Safari, Firefox, Edge\n- **أجهزة مختلفة**: موبايل، تابلت، ديسكتوب بأحجام متعددة\n- **سرعات إنترنت متفاوتة**: استخدم Chrome DevTools لمحاكاة 3G\n- **حالات الأخطاء**: ماذا يحدث لو فقد المستخدم الاتصال؟ لو ضغط بسرعة مزدوجة؟\n\n## 6. النشر (Deployment)\n\nأفضل خيارات الاستضافة في 2026:\n\n- **Vercel**: الأفضل لـ Next.js (نشر تلقائي من GitHub)\n- **Netlify**: ممتاز للمواقع الثابتة\n- **AWS / DigitalOcean**: للمشاريع الكبيرة التي تحتاج تحكماً كاملاً\n- **استضافة محلية**: cPanel على خوادم مصرية لتقليل زمن الاستجابة لجمهورك المحلي\n\n## 7. ما بعد النشر\n\nالموقع ليس مشروعاً ينتهي عند النشر. يحتاج:\n\n- **مراقبة مستمرة**: تتبع الأخطاء (Sentry)، الأداء (Google Analytics)، التحويلات\n- **تحديثات أمنية**: تحديث المكتبات شهرياً على الأقل\n- **نسخ احتياطي**: يومي على الأقل، مع تجربة استرجاع شهرية\n- **تحسين SEO مستمر**: مراقبة الترتيب، تحديث المحتوى، بناء روابط خلفية\n\n## خلاصة\n\nبناء موقع إلكتروني ناجح يتطلب تخطيطاً جيداً، اختيار تقنية مناسبة، تصميم تجربة مستخدم محكمة، تطوير نظيف، واختباراً شاملاً قبل النشر. لا تتسرع — استثمر الوقت في كل مرحلة وستحصل على نتيجة يفخر بها فريقك ويحبها جمهورك.',
   E'# How to Build a Complete Website\n\nBuilding a website is more than writing code — it is a full process from understanding business goals to launching a product that delivers results. This guide walks through every stage.\n\n## 1. Define goals and requirements\n\nBefore any line of code, ask:\n\n- What is the purpose? (brochure, store, booking, web app, blog)\n- Who is the audience? (age, language, technical level, device)\n- What core actions should visitors take?\n- What is the budget and timeline?\n\n## 2. Choose the right stack\n\n| Site type | Recommended stack |\n| --- | --- |\n| Simple brochure | WordPress or Webflow |\n| Corporate site | Next.js + Tailwind CSS |\n| Online store | Shopify or WooCommerce |\n| Complex web app | Next.js + Supabase / Firebase |\n| Content blog | Next.js + MDX or Astro |\n\n## 3. UX before UI\n\nStart with user flows, then wireframes, then interactive prototype, only then visual design.\n\n## 4. Development\n\nFrontend: modern framework + design system + reusable components. Backend: PostgreSQL + REST/GraphQL API + strong security + documented endpoints.\n\n## 5. Testing\n\nTest across browsers, devices, network speeds, and error states before launch.\n\n## 6. Deployment\n\nVercel for Next.js, Netlify for static, AWS/DO for large projects, local cPanel for regional audiences.\n\n## 7. Beyond launch\n\nMonitoring, security patches, daily backups, ongoing SEO. The site is never "done".',
   'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
   'published', now() - interval '30 days', true,
   12,
   array['تطوير المواقع','Next.js','UX','نشر','SEO']::text[],
   '[
     {"question_ar":"كم تكلفة بناء موقع إلكتروني متكامل؟","question_en":"How much does a complete website cost?","answer_ar":"التكلفة تختلف حسب التعقيد: موقع تعريفي بسيط (5,000-15,000 جنيه)، موقع شركة احترافي (15,000-50,000)، تطبيق ويب متقدم (50,000-200,000+).","answer_en":"It varies: brochure site ($300-1,000), pro corporate site ($1,000-3,000), advanced web app ($3,000-15,000+)."},
     {"question_ar":"كم تستغرق المدة لبناء موقع؟","question_en":"How long does it take?","answer_ar":"موقع تعريفي بسيط: 2-3 أسابيع. موقع شركة: 4-6 أسابيع. تطبيق ويب: 2-6 أشهر حسب التعقيد.","answer_en":"Simple brochure: 2-3 weeks. Corporate site: 4-6 weeks. Web app: 2-6 months depending on complexity."},
     {"question_ar":"هل أحتاج لمبرمج خاص بي بعد التسليم؟","question_en":"Do I need a developer after launch?","answer_ar":"للمواقع البسيطة: لا، عقد صيانة شهري يكفي. للتطبيقات المعقدة: نعم، تحتاج فريق تطوير مستمر.","answer_en":"For simple sites: no, monthly maintenance suffices. For complex apps: yes, you need ongoing development."},
     {"question_ar":"ما الفرق بين WordPress و Next.js؟","question_en":"WordPress vs Next.js?","answer_ar":"WordPress أسهل وأسرع للبدء لكن أبطأ أداءً وأقل مرونة. Next.js يحتاج مبرمجاً لكن يعطي أداءً أعلى وتجربة أفضل ومرونة كاملة.","answer_en":"WordPress is easier to start but slower and less flexible. Next.js needs a developer but delivers higher performance and full flexibility."}
   ]'::jsonb,
   '[
     {"type":"image","url":"https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80","caption_ar":"محرر الكود — حيث تبدأ القصة","caption_en":"The code editor — where the story begins"}
   ]'::jsonb,
   'دليل شامل لإنشاء موقع إلكتروني متكامل من الصفر',
   'Complete Guide: Build a Website from Zero to Launch',
   'تعلم خطوة بخطوة كيف تبني موقعاً احترافياً يخدم أهدافك التجارية — من تحديد المتطلبات وحتى النشر والصيانة.',
   'Step-by-step guide to building a professional website — from requirements to launch and maintenance.',
   'تطوير المواقع، Next.js، تصميم UX، استضافة، SEO، موقع متكامل',
   'web development, Next.js, UX design, hosting, SEO, complete website')
on conflict (slug) do nothing;

-- 2) خطوات استضافة موقع إلكتروني على cPanel ─────────────────────────────────
insert into public.blog_posts
  (slug, title_ar, title_en, excerpt_ar, excerpt_en,
   content_ar, content_en,
   cover_image, status, published_at, is_featured,
   reading_time_minutes, tags, faqs, media,
   seo_title_ar, seo_title_en, seo_description_ar, seo_description_en,
   seo_keywords_ar, seo_keywords_en)
values
  ('host-website-on-cpanel',
   'خطوات استضافة موقع إلكتروني على cPanel: من الحجز حتى النشر',
   'Hosting Your Website on cPanel: From Account Setup to Launch',
   'دليل عملي مفصّل لاستضافة موقعك على cPanel — رفع الملفات، ربط النطاق، إعداد SSL، وقواعد البيانات، خطوة بخطوة بالصور.',
   'A practical step-by-step guide to hosting your site on cPanel — file upload, domain pointing, SSL, and database setup.',
   E'# خطوات استضافة موقع إلكتروني على cPanel\n\ncPanel هي اللوحة الأشهر لإدارة الاستضافة المشتركة. واجهتها بسيطة لكنها قوية، وتتيح لك إدارة كل شيء من رفع الملفات إلى قواعد البيانات. في هذا الدليل، سنمر بكل خطوة.\n\n## 1. حجز حساب استضافة\n\nاختر مقدم استضافة موثوق. عوامل مهمة:\n\n- **مكان الخادم**: اختر خادماً قريباً من جمهورك (مصر، السعودية، أوروبا حسب الحاجة)\n- **المساحة والباندويث**: للمواقع الصغيرة 10GB كافية، للمتاجر 30GB+\n- **دعم PHP و MySQL**: تأكد من الإصدارات الحديثة (PHP 8.2+، MySQL 8+)\n- **SSL مجاني**: شهادة Let''s Encrypt أساسية اليوم\n- **النسخ الاحتياطي**: يومي مع إمكانية الاسترجاع الذاتي\n\n## 2. الدخول لـ cPanel\n\nبعد التفعيل، ستستقبل بريداً يحوي:\n\n- **رابط cPanel**: عادةً `https://yourdomain.com:2083` أو `https://server.host.com/cpanel`\n- **اسم المستخدم وكلمة المرور**\n\nقم بتسجيل الدخول. ستظهر واجهة cPanel مقسمة لأقسام: الملفات، قواعد البيانات، النطاقات، البريد، الإحصائيات، الأمان.\n\n> نصيحة أمنية: غيّر كلمة المرور فوراً، وفعّل المصادقة الثنائية (2FA) من قسم Security.\n\n## 3. رفع ملفات الموقع\n\nهناك ثلاث طرق:\n\n### الطريقة 1: File Manager (الأسهل)\n\n1. افتح "File Manager" من قسم الملفات\n2. اذهب لمجلد `public_html`\n3. اضغط Upload وارفع ملفات موقعك\n4. لو رفعت ملف zip، اضغط عليه بزر الفأرة الأيمن واختر Extract\n\n### الطريقة 2: FTP (للملفات الكبيرة)\n\n1. أنشئ حساب FTP من قسم Files → FTP Accounts\n2. حمّل برنامج FileZilla\n3. اتصل بالخادم باستخدام بيانات FTP\n4. اسحب ملفاتك للمجلد `public_html`\n\n### الطريقة 3: Git (للمطورين)\n\nمن قسم Files → Git Version Control يمكنك ربط مستودع GitHub والنشر بأمر `git pull`.\n\n## 4. ربط النطاق (Domain)\n\nلو حجزت النطاق من نفس شركة الاستضافة، يكون مربوطاً تلقائياً. لو من مكان آخر:\n\n1. اذهب لإعدادات النطاق عند المسجّل (Namecheap, GoDaddy, ...)\n2. غيّر Name Servers إلى المقدمة من شركة الاستضافة:\n   - `ns1.yourhost.com`\n   - `ns2.yourhost.com`\n3. انتظر 24-48 ساعة للانتشار العالمي (DNS Propagation)\n\n## 5. تثبيت شهادة SSL\n\nSSL ضروري اليوم — Google يخفض ترتيب المواقع بدونها.\n\n1. اذهب لـ Security → SSL/TLS Status\n2. اضغط Run AutoSSL\n3. اختر النطاقات التي تريد تأمينها\n4. بعد دقائق، ستظهر علامة القفل الأخضر في المتصفح\n\nأو من Let''s Encrypt SSL إن كان متاحاً.\n\n## 6. إنشاء قاعدة بيانات\n\nلو موقعك يحتاج قاعدة بيانات (مثل WordPress أو Laravel):\n\n1. اذهب لـ Databases → MySQL Databases\n2. أنشئ قاعدة بيانات جديدة (مثلاً `mysite_db`)\n3. أنشئ مستخدماً للقاعدة (`mysite_user`) بكلمة مرور قوية\n4. اربط المستخدم بالقاعدة بصلاحيات `ALL PRIVILEGES`\n5. احفظ بيانات الاتصال في ملف إعدادات موقعك:\n   ```php\n   DB_HOST = "localhost";\n   DB_NAME = "mysite_db";\n   DB_USER = "mysite_user";\n   DB_PASS = "your-strong-password";\n   ```\n\n## 7. إعداد البريد الإلكتروني\n\nمن قسم Email → Email Accounts، أنشئ بريداً احترافياً (`info@yourdomain.com`):\n\n1. اختر النطاق\n2. حدد اسم البريد والمساحة المخصصة\n3. ضع كلمة مرور قوية\n\nيمكنك ربطه بـ Outlook أو Gmail باستخدام إعدادات IMAP/SMTP من قسم Email Configuration.\n\n## 8. اختبار الموقع\n\nقبل إعلان الإطلاق:\n\n- افتح الموقع في متصفح خفي (Incognito) لتجاوز الكاش\n- اختبر الصور والروابط والنماذج\n- جرّب الشراء أو التسجيل من البداية للنهاية\n- شغّل [PageSpeed Insights](https://pagespeed.web.dev/) لقياس الأداء\n\n## 9. إعداد النسخ الاحتياطي\n\n- اذهب لـ Files → Backup Wizard\n- اضغط Back Up\n- اختر Full Backup أو Home Directory\n- احتفظ بنسخة محلية لديك إضافة للنسخة على الخادم\n\nاجعلها عادة شهرية على الأقل.\n\n## أخطاء شائعة وحلولها\n\n| المشكلة | الحل |\n| --- | --- |\n| الموقع لا يظهر بعد ربط النطاق | انتظر 24-48 ساعة لانتشار DNS |\n| رسالة 403 Forbidden | تأكد أن الصلاحيات 755 للمجلدات و 644 للملفات |\n| خطأ في الاتصال بقاعدة البيانات | راجع بيانات الاتصال في ملف الإعدادات |\n| الموقع بطيء | ابحث عن Optimize Website في cPanel وفعّل ضغط Gzip |\n\n## خلاصة\n\ncPanel أداة ممتازة للمبتدئين والمحترفين. مع الخطوات أعلاه، يمكنك استضافة أي موقع HTML، WordPress، Laravel، أو حتى Node.js (مع وجود Node.js Selector). المفتاح هو الترتيب والاهتمام بالتفاصيل الأمنية.',
   E'# Hosting on cPanel: Step by Step\n\ncPanel is the most popular shared-hosting control panel. This guide covers every step.\n\n## 1. Pick a hosting account\n\nServer location, storage, PHP/MySQL versions, free SSL, and daily backups are the key criteria.\n\n## 2. Log in to cPanel\n\nUsually `https://yourdomain.com:2083`. Change password immediately and enable 2FA.\n\n## 3. Upload files\n\nThree options: File Manager (easiest), FTP via FileZilla (for big files), or Git Version Control (for developers).\n\n## 4. Point your domain\n\nUpdate name servers at your registrar to the ones provided by the host. DNS propagation takes 24-48 hours.\n\n## 5. Install SSL\n\nFrom Security → SSL/TLS Status, run AutoSSL. Within minutes you get the green padlock.\n\n## 6. Create a database\n\nMySQL Databases section: create database, create user, link them with full privileges, save credentials in your app config.\n\n## 7. Email setup\n\nCreate professional email at info@yourdomain.com, connect via IMAP/SMTP to Outlook or Gmail.\n\n## 8. Test before launch\n\nIncognito mode bypass cache, run PageSpeed Insights, test forms end-to-end.\n\n## 9. Backups\n\nBackup Wizard for Full Backup. Keep a local copy too. Monthly minimum.',
   'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
   'published', now() - interval '22 days', false,
   10,
   array['cPanel','استضافة','SSL','نطاقات','MySQL','نشر']::text[],
   '[
     {"question_ar":"هل cPanel آمن بشكل افتراضي؟","question_en":"Is cPanel secure by default?","answer_ar":"cPanel آمن نسبياً لكن يجب تفعيل 2FA، استخدام كلمات مرور قوية، وتحديث PHP والمكتبات بانتظام.","answer_en":"Reasonably secure, but enable 2FA, use strong passwords, and keep PHP and libraries updated."},
     {"question_ar":"كم تكلفة استضافة cPanel شهرياً؟","question_en":"How much does cPanel hosting cost monthly?","answer_ar":"الاستضافة المشتركة تبدأ من 100-200 جنيه شهرياً للمواقع الصغيرة، وتصل لـ 1000+ جنيه للمواقع الكبيرة على VPS مع cPanel.","answer_en":"Shared hosting starts at $5-15/month for small sites, up to $50+/month for VPS with cPanel."},
     {"question_ar":"هل يمكن تشغيل Next.js على cPanel؟","question_en":"Can I run Next.js on cPanel?","answer_ar":"نعم، إذا كان لدى المضيف Node.js Selector. لكن Vercel أو Netlify خيار أفضل وأبسط لتطبيقات Next.js.","answer_en":"Yes if the host offers Node.js Selector. But Vercel or Netlify are easier choices for Next.js."}
   ]'::jsonb,
   '[]'::jsonb,
   'استضافة موقع على cPanel: الدليل الكامل بالخطوات',
   'cPanel Hosting Guide: Complete Step-by-Step Tutorial',
   'تعلم رفع موقعك على cPanel، ربط النطاق، تركيب SSL، وإنشاء قاعدة البيانات بسهولة.',
   'Learn to upload your site to cPanel, point your domain, install SSL, and create databases easily.',
   'cPanel، استضافة، رفع موقع، SSL، نطاق، MySQL، استضافة مشتركة',
   'cPanel, hosting, file upload, SSL, domain pointing, MySQL, shared hosting')
on conflict (slug) do nothing;

-- 3) خطة تسويقية متكاملة ────────────────────────────────────────────────────
insert into public.blog_posts
  (slug, title_ar, title_en, excerpt_ar, excerpt_en,
   content_ar, content_en,
   cover_image, status, published_at, is_featured,
   reading_time_minutes, tags, faqs, media,
   seo_title_ar, seo_title_en, seo_description_ar, seo_description_en,
   seo_keywords_ar, seo_keywords_en)
values
  ('integrated-marketing-plan',
   'خطة تسويقية متكاملة: من تحليل السوق إلى قياس النتائج',
   'Building an Integrated Marketing Plan: From Market Analysis to Measuring Results',
   'كيف تبني خطة تسويق رقمية متكاملة تجمع SEO والإعلانات المدفوعة والمحتوى والبريد لتحقق نتائج قابلة للقياس بدلاً من تشتيت ميزانيتك.',
   'How to build an integrated digital marketing plan that combines SEO, paid ads, content, and email to deliver measurable results instead of wasting budget.',
   E'# خطة تسويقية متكاملة\n\nمعظم الشركات تتعامل مع التسويق كأنشطة منفصلة: إعلان فيسبوك هنا، SEO هناك، نشرة بريد متى تذكروا. النتيجة: ميزانية مهدورة ورسالة مشتتة. الخطة المتكاملة تربط كل القنوات برسالة واحدة وأهداف واضحة.\n\n## 1. تحليل الوضع الحالي (Situation Analysis)\n\nقبل أي تخطيط، اعرف أين تقف:\n\n### تحليل SWOT\n\n- **Strengths**: ما الذي تتفوق فيه؟ (جودة، سعر، خدمة عملاء، خبرة)\n- **Weaknesses**: أين تحتاج للتحسن؟\n- **Opportunities**: ما الفرص في السوق؟ (طلب متزايد، منافس ضعيف، تقنية جديدة)\n- **Threats**: ما المخاطر؟ (منافسين جدد، تغيرات تشريعية، اقتصاد)\n\n### تحليل الجمهور\n\nأنشئ Buyer Personas تفصيلية:\n\n- **الديموغرافيا**: عمر، جنس، موقع، دخل، تعليم\n- **السلوك**: ما يستخدم من منصات؟ متى يكون أكثر نشاطاً؟\n- **الاحتياجات**: ما المشكلة التي تحلّها له؟\n- **الاعتراضات**: لماذا قد يرفض الشراء؟\n\n## 2. تحديد الأهداف الذكية (SMART Goals)\n\nأهداف مبهمة تنتج نتائج مبهمة. استخدم نموذج SMART:\n\n- **S**pecific (محدد)\n- **M**easurable (قابل للقياس)\n- **A**chievable (قابل للتحقيق)\n- **R**elevant (ذو صلة بالعمل)\n- **T**ime-bound (مرتبط بزمن)\n\n**مثال خاطئ**: "زيادة المبيعات".\n**مثال صحيح**: "زيادة مبيعات المتجر الإلكتروني بنسبة 30% خلال 6 أشهر، من 100 طلب شهرياً إلى 130 طلباً، بتكلفة استحواذ لا تتجاوز 50 جنيهاً للعميل".\n\n## 3. اختيار المزيج التسويقي\n\nالقنوات الرئيسية وما يناسب كل واحدة:\n\n| القناة | الأنسب لـ | المدة لظهور النتائج |\n| --- | --- | --- |\n| **SEO** | بناء أساس طويل المدى | 6-12 شهر |\n| **Google Ads** | نتائج فورية لكلمات شراء | يوم 1 |\n| **Meta Ads** | الوصول والتوعية | يوم 1 |\n| **محتوى المدونة** | بناء سلطة وثقة | 3-6 أشهر |\n| **بريد إلكتروني** | الاحتفاظ بالعملاء | 1-2 أسبوع |\n| **شراكات Influencer** | الوصول الجماهيري السريع | 2-4 أسابيع |\n\n> القاعدة الذهبية: لا تضع كل الميزانية في قناة واحدة. توزيع 60/30/10 (قناة رئيسية / ثانية / تجارب) قاعدة جيدة للبدء.\n\n## 4. بناء الرسالة الموحدة\n\nمهما اختلفت القنوات، يجب أن تظل **القصة واحدة**:\n\n- **اقتراح القيمة الفريد (UVP)**: جملة واحدة تجيب "لماذا أشتري منك تحديداً؟"\n- **النبرة (Tone)**: رسمية أم مرحة؟ خبير أم صديق؟\n- **الكلمات المفتاحية للعلامة**: 5-7 كلمات تتكرر في كل المحتوى\n- **الهوية البصرية**: ألوان، خطوط، أيقونات متسقة في كل مكان\n\n## 5. خطة المحتوى\n\nالمحتوى وقود كل القنوات. لكل قناة شكلها:\n\n- **مدونة**: مقالات تعليمية طويلة (1500+ كلمة) — للـ SEO\n- **Instagram**: صور وReels قصيرة — للتفاعل\n- **LinkedIn**: مقالات قيادة فكرية — للـ B2B\n- **TikTok**: فيديوهات ترفيهية تعليمية — للجيل الجديد\n- **بريد إلكتروني**: نشرات قيمة + عروض حصرية\n\nتقويم محتوى شهري يحدد كل قطعة محتوى ومسؤولها وتاريخ نشرها.\n\n## 6. الميزانية والتخصيص\n\nتوزيع ميزانية شهرية كنموذج (لشركة ناشئة بميزانية 50,000 جنيه/شهر):\n\n- **40% (20,000)** — إعلانات مدفوعة (Meta + Google)\n- **20% (10,000)** — إنتاج محتوى (تصوير، مونتاج، كتابة)\n- **15% (7,500)** — SEO وبناء روابط\n- **10% (5,000)** — أدوات (Mailchimp, SEMrush, تصميم)\n- **10% (5,000)** — فريق إدارة\n- **5% (2,500)** — تجارب جديدة (TikTok ads, Influencers)\n\n## 7. التنفيذ والقياس\n\nأهم مؤشرات الأداء (KPIs) لكل قناة:\n\n- **SEO**: ترتيب الكلمات، الزيارات العضوية، معدل الارتداد\n- **Paid Ads**: CPC، CPA، CTR، ROAS\n- **Email**: معدل الفتح، النقر، الإلغاء\n- **Social**: التفاعل، الوصول، النمو\n- **العام**: عدد العملاء الجدد، LTV، CAC\n\n> القاعدة الحديدية: ما لا يُقاس لا يتحسن. أعد قراءة الأرقام كل أسبوع، وعدّل التكتيكات كل شهر.\n\n## 8. التحسين المستمر\n\nالخطة وثيقة حية. مراجعة شهرية تجيب:\n\n- ما الذي نجح فوق المتوقع؟ ضاعفه\n- ما الذي فشل؟ أوقفه أو حسّنه\n- ما الفرصة الجديدة؟ جرّبها بميزانية صغيرة\n\n## خلاصة\n\nالخطة المتكاملة ليست شعاراً تسويقياً — هي ضرورة. عدد القنوات يتزايد، انتباه العميل يتقلص، ومن لا يخطط بشكل متكامل يخسر معركة الانتباه. ابدأ بتحليل دقيق، ضع أهدافاً واضحة، وزّع الميزانية بحكمة، وقس كل شيء.',
   E'# Integrated Marketing Plan\n\nMost companies treat marketing as isolated activities. The result: wasted budget and a fragmented message. An integrated plan ties every channel to one message and clear goals.\n\n## 1. Situation analysis\n\nSWOT + audience analysis with detailed buyer personas.\n\n## 2. SMART goals\n\nSpecific, measurable, achievable, relevant, time-bound.\n\n## 3. Channel mix\n\nSEO for long-term, Google Ads for instant intent, Meta for awareness, content for authority, email for retention.\n\n## 4. Unified message\n\nOne UVP, consistent tone, brand keywords, visual identity across channels.\n\n## 5. Content plan\n\nBlog (long SEO articles), Instagram (Reels), LinkedIn (B2B thought leadership), TikTok (educational entertainment), email (newsletters).\n\n## 6. Budget allocation\n\nSample 40/20/15/10/10/5 split: paid / content / SEO / tools / team / experiments.\n\n## 7. Execute and measure\n\nKPIs per channel — SEO rankings, CPA/ROAS, open rates, engagement, new customers, LTV/CAC.\n\n## 8. Continuous optimization\n\nMonthly review: double what works, kill what does not, test new opportunities.',
   'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
   'published', now() - interval '14 days', true,
   14,
   array['تسويق','SEO','إعلانات','محتوى','بريد إلكتروني','استراتيجية']::text[],
   '[
     {"question_ar":"كم ميزانية تكفي للبدء؟","question_en":"What budget is enough to start?","answer_ar":"للشركات الصغيرة: 10,000-30,000 جنيه شهرياً للحملات الأساسية. للشركات المتوسطة: 50,000-150,000 جنيه. الأهم هو الاتساق وليس المبلغ.","answer_en":"For small businesses: $500-1,500/month. For mid-size: $2,500-7,500. Consistency matters more than amount."},
     {"question_ar":"متى أتوقع رؤية نتائج؟","question_en":"When can I expect results?","answer_ar":"الإعلانات المدفوعة: أيام. البريد: أسبوع. السوشيال: شهر. SEO: 6-12 شهر. الخطة المتكاملة تخلط القنوات السريعة والبطيئة لتغطي كل الأمدية.","answer_en":"Paid ads: days. Email: a week. Social: a month. SEO: 6-12 months. Integration mixes fast and slow channels."},
     {"question_ar":"هل أحتاج وكالة أم فريق داخلي؟","question_en":"Agency or in-house team?","answer_ar":"الوكالة أسرع وأرخص للبدء. الفريق الداخلي أفضل بعد سنة من النضج. كثيرون يجمعون بين الاثنين: وكالة للحملات + موظف داخلي للتنسيق.","answer_en":"Agency is faster and cheaper to start. In-house works better after a year of maturity. Many combine both."}
   ]'::jsonb,
   '[
     {"type":"image","url":"https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80","caption_ar":"لوحة بيانات الأداء — قلب الخطة المتكاملة","caption_en":"Performance dashboard — the heart of an integrated plan"}
   ]'::jsonb,
   'كيف تبني خطة تسويقية متكاملة تحقق نتائج فعلية',
   'How to Build an Integrated Marketing Plan That Drives Real Results',
   'دليل عملي لإنشاء استراتيجية تسويق رقمي متكاملة — تحليل، أهداف، قنوات، ميزانية، وقياس.',
   'A practical guide to building an integrated digital marketing strategy — analysis, goals, channels, budget, and measurement.',
   'خطة تسويق، تسويق رقمي، استراتيجية، SEO، إعلانات، محتوى، KPIs',
   'marketing plan, digital marketing, strategy, SEO, ads, content, KPIs')
on conflict (slug) do nothing;

-- 4) تحليل المنافسين والكلمات المفتاحية ─────────────────────────────────────
insert into public.blog_posts
  (slug, title_ar, title_en, excerpt_ar, excerpt_en,
   content_ar, content_en,
   cover_image, status, published_at, is_featured,
   reading_time_minutes, tags, faqs, media,
   seo_title_ar, seo_title_en, seo_description_ar, seo_description_en,
   seo_keywords_ar, seo_keywords_en)
values
  ('competitor-keyword-analysis-guide',
   'تحليل المنافسين والكلمات المفتاحية: كيف تكشف استراتيجيتهم في 7 خطوات',
   'Competitor and Keyword Analysis: Uncover Their Strategy in 7 Steps',
   'دليل تطبيقي لتحليل منافسيك واكتشاف الكلمات المفتاحية التي تجلب لهم الزوار — بأدوات مجانية ومدفوعة، خطوة بخطوة.',
   'A hands-on guide to analyzing competitors and discovering the keywords driving their traffic — using free and paid tools.',
   E'# تحليل المنافسين والكلمات المفتاحية\n\nالكثير يبدأ التسويق الرقمي بحماس لكن دون فهم للمنافسة. النتيجة: تكرار أخطائهم بدلاً من السبق بمعرفة. في هذا الدليل، نمر بطريقة منهجية لتحليل أي منافس في 7 خطوات عملية.\n\n## الخطوة 1: تحديد المنافسين الحقيقيين\n\nلديك ثلاث فئات من المنافسين:\n\n### 1. منافسون مباشرون\n\nنفس الخدمة، نفس الجمهور، نفس السعر. مثلاً لو أنت متجر أحذية رياضية: متاجر أخرى تبيع نفس الماركات في نفس البلد.\n\n### 2. منافسون غير مباشرون\n\nيحلون نفس المشكلة بحل مختلف. مثلاً: متجر اشتراك شهري للأحذية، أو خدمة استئجار.\n\n### 3. منافسون على الكلمات\n\nليسوا منافسين تجاريين لكن يتربعون على نتائج البحث لكلماتك. مثلاً: مدونة تعليمية تظهر قبل متجرك في كلمة "أفضل أحذية رياضية".\n\n> **عملي**: ابحث في Google عن أهم 10 كلمات بيع لديك، وسجّل أول 5 نتائج لكل كلمة. النتائج هي قائمة منافسيك الحقيقية.\n\n## الخطوة 2: تحليل موقع المنافس\n\nاستخدم هذه الأدوات على موقع كل منافس:\n\n- **[Built With](https://builtwith.com)**: التقنيات المستخدمة (CMS، التحليل، الدفع، الإعلانات)\n- **[Wayback Machine](https://web.archive.org)**: كيف تطور موقعهم عبر السنوات\n- **PageSpeed Insights**: سرعة موقعهم — هل أبطأ منك؟ نقطة قوة لك\n\nاجمع:\n\n- المنصة (Shopify, WooCommerce, custom?)\n- وسائل الدفع المدعومة\n- بنية الموقع وعدد الصفحات\n- وجود مدونة وعدد المقالات\n- لغات الموقع\n\n## الخطوة 3: اكتشاف كلماتهم المفتاحية\n\nأدوات احترافية:\n\n- **[Ahrefs](https://ahrefs.com)**: الأقوى لتحليل الكلمات (مدفوع)\n- **[SEMrush](https://semrush.com)**: بديل ممتاز مع تجربة مجانية\n- **[Ubersuggest](https://neilpatel.com/ubersuggest/)**: مجاني محدود من Neil Patel\n- **[Google Keyword Planner](https://ads.google.com/home/tools/keyword-planner/)**: مجاني مع حساب Google Ads\n\n### في Ahrefs\n\n1. ألصق رابط المنافس في Site Explorer\n2. اضغط Organic Keywords\n3. ستظهر كل الكلمات التي يحقق منها زيارات، مع الترتيب وحجم البحث\n4. صدّر القائمة لـ Excel\n\n### النتيجة المتوقعة\n\nقائمة بـ 200-2000 كلمة، عمود لكل من:\n\n- الكلمة\n- ترتيب المنافس\n- حجم البحث الشهري\n- صعوبة الكلمة (KD)\n- الصفحة المرتبة\n\n## الخطوة 4: تحليل الفجوة (Gap Analysis)\n\nأهم تحليل: ما الكلمات التي يربح بها منافسوك ولا تظهر أنت فيها؟\n\nفي Ahrefs:\n\n1. Content Gap → أضف 3-5 منافسين + موقعك\n2. ستحصل على قائمة بكل الكلمات التي ترتب فيها هم ولا ترتب أنت\n3. رتّبها حسب حجم البحث والصعوبة\n4. ركّز على الكلمات بـ KD أقل من 30 وحجم بحث أكثر من 200\n\n**هذه قائمتك للبدء.**\n\n## الخطوة 5: تحليل المحتوى\n\nلكل كلمة فجوة، افتح الصفحة المنافسة وحلّل:\n\n- **الطول**: كم كلمة؟ المقالات الطويلة (2000+) عادةً تتفوق\n- **البنية**: كم عنواناً فرعياً؟ هل يستخدم جداول، قوائم، صور؟\n- **الوسائط**: فيديو؟ infographic؟ بودكاست؟\n- **الإجابة الأساسية**: ما السؤال الذي يجيبه؟ وهل إجابته شاملة؟\n\n> **مبدأ Skyscraper**: لا تكتفِ بنسخة مماثلة. اكتب نسخة **أفضل** بـ 30% — أعمق، أوضح، بأمثلة أكثر، بفيديو، بـ FAQ.\n\n## الخطوة 6: تحليل الإعلانات المدفوعة\n\nأدوات:\n\n- **Meta Ad Library**: كل إعلانات أي صفحة على Meta — مجاناً\n- **TikTok Ad Library**: نفس الفكرة لـ TikTok\n- **SpyFu / SEMrush**: إعلانات Google التاريخية\n\nاستخرج:\n\n- نوع الحملة (Awareness, Conversion, Retargeting)\n- نص الإعلان الرئيسي (Hook)\n- الإبداع البصري (صور أم فيديو؟ ستايل؟ ألوان؟)\n- الصفحة المهبط (Landing Page)\n\n## الخطوة 7: بناء خطة العمل\n\nبعد التحليل، اصنع خطة من 90 يوماً:\n\n### الشهر الأول: المحتوى\n\nاكتب 8-10 مقالات تستهدف أعلى 10 كلمات فجوة. كل مقال يطبق مبدأ Skyscraper.\n\n### الشهر الثاني: الروابط الخلفية\n\n- استخدم Backlink Profile في Ahrefs لمعرفة أين يحصل المنافسون على روابط\n- تواصل مع نفس المواقع (مدونات، مجلات، شركاء) بزاوية مختلفة\n- اكتب مقالات ضيف (Guest Posts) لمواقع الصناعة\n\n### الشهر الثالث: التحسين والقياس\n\n- راجع الترتيب لكل كلمة مستهدفة\n- حسّن الصفحات التي وصلت لـ Top 20 ولم تصل لـ Top 10\n- استكمل المقالات الناقصة\n- ابدأ تجربة إعلانات Google على الكلمات الأعلى تحويلاً\n\n## أخطاء شائعة\n\n| الخطأ | الصواب |\n| --- | --- |\n| التركيز على الكلمات عالية الحجم فقط | استهدف Long-tail (3-4 كلمات) لمنافسة أقل |\n| نسخ المحتوى بدون قيمة مضافة | طبّق Skyscraper — أعمق وأشمل |\n| إهمال الكلمات بقصد الشراء | كلمات مثل "أفضل" و"سعر" و"شراء" تحوّل أكثر |\n| تجاهل اللغة العربية | المنافسة على الكلمات العربية أقل بكثير من الإنجليزية |\n\n## خلاصة\n\nتحليل المنافسين ليس تجسساً — هو ذكاء سوقي. كل ميزانية تنفقها على إعلان دون تحليل أولاً، هي ميزانية تختبر فيها ما اختبره غيرك بالفعل. ابدأ بتحليل عميق، طبّق Content Gap، واستثمر في المحتوى طويل المدى. النتائج تأتي خلال 3-6 أشهر، لكنها دائمة.',
   E'# Competitor and Keyword Analysis\n\nMost marketing starts with enthusiasm but without understanding competition. This guide walks you through a systematic 7-step analysis.\n\n## Step 1: Identify real competitors\n\nDirect, indirect, and search competitors. Search your top 10 commercial keywords and note the top 5 results.\n\n## Step 2: Analyze their website\n\nBuiltWith for tech stack, Wayback Machine for history, PageSpeed Insights for performance.\n\n## Step 3: Discover their keywords\n\nAhrefs, SEMrush, Ubersuggest, or Google Keyword Planner. Export their full Organic Keywords list.\n\n## Step 4: Gap analysis\n\nContent Gap in Ahrefs: keywords they rank for but you do not. Filter by KD<30 and volume>200.\n\n## Step 5: Content analysis\n\nFor each gap keyword, study competitor pages: length, structure, media. Apply Skyscraper — make yours 30% better.\n\n## Step 6: Paid ads analysis\n\nMeta Ad Library, TikTok Ad Library, SpyFu/SEMrush for Google. Extract campaign type, hook, creative style, landing pages.\n\n## Step 7: Build the 90-day plan\n\nMonth 1: 8-10 Skyscraper articles. Month 2: backlinks via outreach and guest posts. Month 3: optimize and start Google Ads on top intent keywords.',
   'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80',
   'published', now() - interval '7 days', false,
   16,
   array['SEO','تحليل المنافسين','كلمات مفتاحية','Ahrefs','محتوى','استراتيجية']::text[],
   '[
     {"question_ar":"هل أحتاج لأدوات مدفوعة مثل Ahrefs؟","question_en":"Do I need paid tools like Ahrefs?","answer_ar":"للمشاريع الجادة: نعم. الأدوات المجانية محدودة جداً. اشترك في Ahrefs أو SEMrush لشهرين فقط، صدّر كل البيانات، ثم ألغِ الاشتراك.","answer_en":"For serious work: yes. Free tools are very limited. Subscribe to Ahrefs/SEMrush for 2 months, export everything, then cancel."},
     {"question_ar":"كم منافس يكفي للتحليل؟","question_en":"How many competitors should I analyze?","answer_ar":"5-7 منافسين كافيين. أكثر من ذلك يصبح غير منتج. اختر 3 مباشرين، 2 غير مباشرين، 2 على الكلمات.","answer_en":"5-7 competitors is enough. More becomes unproductive. Pick 3 direct, 2 indirect, 2 keyword-only."},
     {"question_ar":"هل المحتوى وحده يكفي للترتيب؟","question_en":"Is content alone enough to rank?","answer_ar":"المحتوى أهم عامل، لكن لا يكفي. تحتاج: SEO تقني سليم، روابط خلفية، تجربة مستخدم جيدة، وسرعة موقع.","answer_en":"Content is the top factor but not enough. You also need technical SEO, backlinks, good UX, and speed."}
   ]'::jsonb,
   '[]'::jsonb,
   'دليل تحليل المنافسين والكلمات المفتاحية في 7 خطوات',
   'Competitor and Keyword Analysis: A Practical 7-Step Guide',
   'تعلم كيف تحلل منافسيك وتكتشف الكلمات المفتاحية التي تجلب لهم الزوار — بأدوات احترافية وخطوات قابلة للتنفيذ.',
   'Learn how to analyze competitors and discover the keywords driving their traffic — with pro tools and actionable steps.',
   'تحليل منافسين، كلمات مفتاحية، SEO، Ahrefs، SEMrush، Content Gap، استراتيجية محتوى',
   'competitor analysis, keyword research, SEO, Ahrefs, SEMrush, content gap, content strategy')
on conflict (slug) do nothing;

-- 5) مزايا المتاجر الإلكترونية المختلفة ─────────────────────────────────────
insert into public.blog_posts
  (slug, title_ar, title_en, excerpt_ar, excerpt_en,
   content_ar, content_en,
   cover_image, status, published_at, is_featured,
   reading_time_minutes, tags, faqs, media,
   seo_title_ar, seo_title_en, seo_description_ar, seo_description_en,
   seo_keywords_ar, seo_keywords_en)
values
  ('ecommerce-platforms-comparison',
   'مزايا المتاجر الإلكترونية المختلفة: Shopify، WooCommerce، Salla، أم متجر مخصص؟',
   'E-commerce Platforms Compared: Shopify, WooCommerce, Salla, or Custom?',
   'مقارنة شاملة بين أشهر منصات التجارة الإلكترونية لتختار الأنسب لمشروعك — بالأسعار والمزايا والقيود والمنافسة.',
   'A comprehensive comparison of the top e-commerce platforms to help you pick the right one — with pricing, features, limitations, and trade-offs.',
   E'# مزايا المتاجر الإلكترونية المختلفة\n\nقرار اختيار منصة المتجر هو أحد أهم القرارات في رحلتك التجارية الإلكترونية. اختيار خاطئ يعني خسارة شهور من العمل ومئات الآلاف من الجنيهات. في هذه المقارنة، نمر بـ 4 منصات رئيسية ونحدد الأنسب لكل سيناريو.\n\n## نظرة سريعة على المقارنة\n\n| الميزة | Shopify | WooCommerce | Salla | متجر مخصص |\n| --- | --- | --- | --- | --- |\n| **سهولة البدء** | ★★★★★ | ★★★ | ★★★★★ | ★ |\n| **التخصيص** | ★★★ | ★★★★★ | ★★ | ★★★★★ |\n| **التكلفة الشهرية** | 29-2000$ | 0-200$ | 0-1000 ريال | 5000+ جنيه |\n| **سهولة الصيانة** | ★★★★★ | ★★ | ★★★★★ | ★★★ |\n| **دعم اللغة العربية** | ★★★ | ★★★★ | ★★★★★ | ★★★★★ |\n| **مناسب لـ** | الشركات المتوسطة | المرونة المطلقة | السوق الخليجي | متطلبات فريدة |\n\n## 1. Shopify — السهولة في مقابل التكلفة\n\n### المزايا\n\n- **بدء سريع جداً**: متجر يعمل في ساعتين بدون مبرمج\n- **استضافة وأمان مشمولان**: لا تقلق بشأن الخوادم\n- **متجر تطبيقات ضخم**: 8000+ تطبيق لكل احتياج\n- **بوابات دفع عالمية**: Stripe, PayPal, Apple Pay\n- **استقرار وأداء عالٍ**: تحميل سريع ومضمون\n- **مناسب للنمو**: من 100 طلب يومياً إلى 100,000\n\n### القيود\n\n- **رسوم على كل معاملة**: 0.5-2% إضافة لرسوم بوابة الدفع (إلا مع Shopify Payments)\n- **تخصيص محدود**: لو احتجت ميزة غير موجودة، صعب التطوير\n- **التكلفة الشهرية تتراكم**: تطبيقات إضافية + خطة Plus = 2000$+ شهرياً\n- **اللغة العربية**: تعمل لكن الـ RTL يحتاج تعديلات قالب\n\n### مناسب لـ\n\nمشاريع تريد البدء بسرعة، تبيع منتجات قياسية (ملابس، إكسسوارات، إلكترونيات)، وتفضل دفع أكثر مقابل الراحة.\n\n## 2. WooCommerce — المرونة الكاملة\n\n### المزايا\n\n- **مفتوح المصدر ومجاني**: التطبيق نفسه بدون رسوم\n- **مرونة لا حدود لها**: 50,000+ إضافة + تخصيص كامل بـ PHP\n- **يعمل على WordPress**: استفد من قوة WP في المحتوى والـ SEO\n- **لا رسوم معاملات**: ادفع فقط لبوابات الدفع\n- **دعم RTL ممتاز**: WordPress يدعم العربية بشكل ممتاز\n- **مجتمع ضخم**: حلول لكل مشكلة بتقريباً\n\n### القيود\n\n- **تحتاج لخبرة تقنية**: استضافة، تحديثات، نسخ احتياطي\n- **الإضافات مدفوعة في الغالب**: 50-300$ للإضافة الواحدة\n- **الأداء يعتمد على الاستضافة**: بطء محتمل لو الاستضافة سيئة\n- **مسؤوليتك أمنياً**: تحديثات شهرية أو ضحية لاختراق\n\n### مناسب لـ\n\nمشاريع تحتاج تخصيصاً معقداً، شركات لديها فريق تقني، أو متاجر لها متطلبات فريدة لا تجدها في المنصات الجاهزة.\n\n## 3. Salla — الأمثل للسوق الخليجي\n\n### المزايا\n\n- **مصمم للسوق العربي**: واجهة عربية كاملة، RTL أصلي\n- **بوابات دفع محلية**: مدى، STC Pay، Apple Pay\n- **شركات شحن محلية مدمجة**: SMSA, Aramex, J&T\n- **دعم ضرائب القيمة المضافة**: VAT للسعودية والإمارات\n- **تطبيق جوال خاص بمتجرك**: مشمول في الخطط الأعلى\n- **دعم فني بالعربية**: 24/7\n\n### القيود\n\n- **محدود جغرافياً**: مصمم أساساً للخليج\n- **تخصيص محدود**: مثل Shopify\n- **تكلفة شهرية**: تبدأ من 99 ريال (24 دولار) للخطة الأساسية\n- **سوق التطبيقات صغير نسبياً**: مقارنةً بـ Shopify\n\n### مناسب لـ\n\nالتجار في السعودية، الإمارات، الكويت، البحرين، عمان، قطر. سهولة لا توازى للسوق الخليجي.\n\n## 4. المتجر المخصص — الحل الفريد\n\n### المزايا\n\n- **تخصيص 100%**: اعمل أي شيء بأي طريقة\n- **لا رسوم منصة**: ادفع فقط لاستضافتك وبوابات الدفع\n- **تكامل عميق**: مع ERP، CRM، نظام محاسبة، WhatsApp\n- **أداء قابل للتحسين**: تحكم كامل في الكود\n- **ملكية كاملة**: لا تعتمد على منصة قد ترفع أسعارها\n- **يصلح لنماذج أعمال غير تقليدية**: مزاد، اشتراك، عمولة، B2B\n\n### القيود\n\n- **تكلفة بدء عالية**: 30,000-200,000 جنيه للتطوير الأولي\n- **مدة تطوير طويلة**: 2-6 أشهر\n- **صيانة دائمة**: تحتاج فريق تقني أو عقد صيانة شهري\n- **مخاطر تقنية**: تأخيرات، أخطاء، أعطال\n\n### مناسب لـ\n\nالمتاجر بمتطلبات فريدة (نموذج عمل خاص)، الشركات الكبيرة (1M+ طلب سنوياً)، أو الذين يريدون أصلاً تجارياً قابلاً للبيع لاحقاً.\n\n## كيف تختار؟\n\nاسأل نفسك 4 أسئلة:\n\n### 1. ما حجم مشروعك؟\n\n- **<100 طلب شهرياً**: Salla أو Shopify Basic\n- **100-1000 طلب**: Shopify أو WooCommerce\n- **1000-10,000 طلب**: Shopify Advanced أو WooCommerce محسّن\n- **10,000+ طلب**: Shopify Plus أو متجر مخصص\n\n### 2. ما خبرتك التقنية؟\n\n- **صفر**: Salla أو Shopify\n- **مبتدئ**: Shopify مع وكالة\n- **متوسط**: WooCommerce\n- **متقدم**: متجر مخصص\n\n### 3. ما جمهورك؟\n\n- **خليجي**: Salla\n- **مصري/عربي عام**: WooCommerce أو متجر مخصص\n- **عالمي**: Shopify\n\n### 4. ما ميزانيتك الشهرية؟\n\n- **<500 جنيه**: WooCommerce على استضافة رخيصة\n- **500-3000 جنيه**: Salla أو Shopify Basic\n- **3000-15,000 جنيه**: Shopify Advanced أو WooCommerce احترافي\n- **15,000+ جنيه**: متجر مخصص أو Shopify Plus\n\n## خلاصة\n\nلا توجد منصة أفضل من غيرها — يوجد فقط منصة أنسب لك. ابدأ بسؤال: ماذا أريد أن أكون بعد سنتين؟ ثم اختر المنصة التي تأخذك هناك. وتذكّر: التحويل بين المنصات ممكن لاحقاً لكنه مؤلم — اختر بعناية من البداية.',
   E'# E-commerce Platforms Compared\n\nPicking the right platform is one of the most consequential decisions in your e-commerce journey. We compare 4 major options for different scenarios.\n\n## Shopify\n\nFastest to launch, beautiful storefront, huge app ecosystem, but ongoing fees and limited customization. Best for: standard-product businesses prioritizing speed.\n\n## WooCommerce\n\nFully open source, unlimited customization, no platform fees. Needs technical know-how. Best for: complex requirements with a tech team.\n\n## Salla\n\nPurpose-built for GCC markets. Native Arabic, local payment gateways (Mada, STC Pay), Aramex/SMSA shipping integrations, VAT support. Best for: merchants in Saudi/UAE/Kuwait.\n\n## Custom Build\n\n100% tailored, deep integration with ERP/CRM/WhatsApp, no platform fees, but high upfront cost and ongoing maintenance. Best for: unique business models or 10K+ orders/month.\n\n## How to choose\n\nFour questions: size of business, technical skill, audience location, monthly budget. There is no "best" platform — only the right one for your specific situation.',
   'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80',
   'published', now() - interval '2 days', true,
   15,
   array['تجارة إلكترونية','Shopify','WooCommerce','Salla','مقارنة منصات']::text[],
   '[
     {"question_ar":"هل يمكن النقل من منصة لأخرى لاحقاً؟","question_en":"Can I migrate between platforms later?","answer_ar":"نعم لكنه مؤلم. تحتاج لنقل المنتجات، العملاء، الطلبات، روابط SEO. كل منصة لها أدوات استيراد لكن لا واحدة كاملة. خطط جيداً من البداية.","answer_en":"Yes but painful. You will migrate products, customers, orders, and SEO URLs. Each platform has import tools but none are complete. Plan well upfront."},
     {"question_ar":"هل Shopify أفضل من WooCommerce دائماً؟","question_en":"Is Shopify always better than WooCommerce?","answer_ar":"لا. Shopify أسهل لكن أقل مرونة وأغلى على المدى البعيد. WooCommerce أقوى لكنه أصعب. كل منهما يناسب حالات مختلفة.","answer_en":"No. Shopify is easier but less flexible and more expensive long-term. WooCommerce is more powerful but harder. Each fits different cases."},
     {"question_ar":"كم تكلف بدء متجر إلكتروني فعلياً؟","question_en":"What does it really cost to start?","answer_ar":"على Shopify: 5,000-15,000 جنيه للتصميم + 1,400-7,000 شهرياً. على Salla: 5,000-12,000 + 200-2,000 شهرياً. متجر مخصص: 30,000-150,000 + صيانة شهرية.","answer_en":"Shopify: $300-900 setup + $30-300/month. Salla: similar range. Custom: $1,500-7,500 setup + monthly maintenance."},
     {"question_ar":"ما المنصة الأفضل في مصر تحديداً؟","question_en":"What works best in Egypt specifically?","answer_ar":"WooCommerce هو الأشهر بسبب التكلفة المنخفضة والمرونة، خاصة مع تكامل بوابات الدفع المحلية مثل PayMob و Fawry. Shopify يصبح أفضل لو تستهدف الأسواق العالمية أيضاً.","answer_en":"WooCommerce is most popular due to low cost and flexibility, especially with PayMob/Fawry integration. Shopify becomes better if you also target international markets."}
   ]'::jsonb,
   '[
     {"type":"image","url":"https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80","caption_ar":"اختيار المنصة الصحيحة قرار حاسم لمستقبل متجرك","caption_en":"Choosing the right platform is a defining decision for your store"}
   ]'::jsonb,
   'مقارنة منصات المتاجر الإلكترونية: أيها يناسب مشروعك؟',
   'E-commerce Platform Comparison: Shopify vs WooCommerce vs Salla vs Custom',
   'مقارنة تفصيلية بين Shopify و WooCommerce و Salla والمتجر المخصص لتختار الأنسب لمشروعك.',
   'Detailed comparison between Shopify, WooCommerce, Salla, and custom builds to pick the best fit for your project.',
   'متاجر إلكترونية، Shopify، WooCommerce، Salla، متجر مخصص، مقارنة، تجارة إلكترونية',
   'e-commerce platforms, Shopify, WooCommerce, Salla, custom store, comparison, online stores')
on conflict (slug) do nothing;

-- ── POST → CATEGORY MAPPING ─────────────────────────────────────────────────
insert into public.blog_post_categories (post_id, category_id)
select p.id, c.id from public.blog_posts p, public.blog_categories c
where (p.slug, c.slug) in (
  ('how-to-build-complete-website', 'development'),
  ('host-website-on-cpanel', 'hosting-infra'),
  ('integrated-marketing-plan', 'marketing'),
  ('competitor-keyword-analysis-guide', 'marketing'),
  ('competitor-keyword-analysis-guide', 'seo'),
  ('competitor-keyword-analysis-guide', 'competitor-analysis'),
  ('ecommerce-platforms-comparison', 'ecommerce'),
  ('ecommerce-platforms-comparison', 'platforms-comparison')
)
on conflict do nothing;
