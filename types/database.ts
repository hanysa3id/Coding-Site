export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "customer" | "sales" | "staff" | "admin";

export type OrderStatus =
  | "pending_review"
  | "under_negotiation"
  | "awaiting_customer_approval"
  | "awaiting_payment"
  | "in_progress"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded";

export type MilestoneStatus = "pending" | "in_progress" | "done";

export type PaymentMethod =
  | "paymob"
  | "bank_transfer"
  | "cash"
  | "instapay"
  | "vodafone_cash";

export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

export type PostStatus = "draft" | "published";

// ============================================================================
// Row types (the shape returned by SELECT)
// ============================================================================

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  avatar_url: string | null;
  locale: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  parent_id: string | null;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  image_url: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  category_id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  short_description_ar: string | null;
  short_description_en: string | null;
  full_description_ar: string | null;
  full_description_en: string | null;
  estimated_price_min: number | null;
  estimated_price_max: number | null;
  currency: string;
  estimated_duration_days: number | null;
  cover_image: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  features_ar: string[];
  features_en: string[];
  deliverables_ar: string[];
  deliverables_en: string[];
  timeline_ar: TimelineStep[];
  timeline_en: TimelineStep[];
  seo_title_ar: string | null;
  seo_title_en: string | null;
  seo_description_ar: string | null;
  seo_description_en: string | null;
  seo_keywords: string | null;
  sort_order: number;
  is_visible: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type ServiceGalleryMedia = {
  id: string;
  service_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  media_type: "image" | "video";
};

export type ServiceGalleryItem = {
  id: string;
  service_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
};

export type ServiceStage = {
  id: string;
  service_id: string;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  sort_order: number;
};

export type ServiceFaq = {
  id: string;
  service_id: string;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  sort_order: number;
  created_at: string;
};

export type TeamMember = {
  id: string;
  name_ar: string;
  name_en: string;
  role_ar: string;
  role_en: string;
  bio_ar: string | null;
  bio_en: string | null;
  avatar_url: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type AboutSettings = {
  mission_ar: string;
  mission_en: string;
  vision_ar: string;
  vision_en: string;
  stats: { label_ar: string; label_en: string; value: string }[];
};

export type TimelineStep = {
  title: string;
  description?: string | null;
  date?: string | null;
};

export type PortfolioProject = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  client_name: string | null;
  delivery_date: string | null;
  cover_image: string | null;
  project_url: string | null;
  features_ar: string[];
  features_en: string[];
  problems_solved_ar: string[];
  problems_solved_en: string[];
  technologies: string[];
  timeline_ar: TimelineStep[];
  timeline_en: TimelineStep[];
  seo_title_ar: string | null;
  seo_title_en: string | null;
  seo_description_ar: string | null;
  seo_description_en: string | null;
  seo_keywords: string | null;
  is_featured: boolean;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PortfolioGalleryItem = {
  id: string;
  portfolio_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  media_type: "image" | "video";
};

export type OrderAttachment = {
  url: string;
  name: string;
  mime: string;
  size: number;
  /** "file" for general uploads, "audio" for recorded voice notes */
  kind: "file" | "audio";
};

export type PaymentInstallment = {
  label_ar: string;
  label_en: string;
  amount: number;
  due_date: string | null;
  paid: boolean;
};

export type Order = {
  id: string;
  order_number: string;
  customer_id: string;
  service_id: string;
  status: OrderStatus;
  estimated_price: number | null;
  final_price: number | null;
  currency: string;
  estimated_duration_days: number | null;
  final_duration_days: number | null;
  customer_message: string | null;
  customer_attachments: OrderAttachment[];
  admin_notes: string | null;
  sales_id: string | null;
  assigned_staff_id: string | null;
  payment_plan: PaymentInstallment[] | null;
  created_at: string;
  updated_at: string;
};

export type OrderStatusHistory = {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by: string | null;
  note: string | null;
  created_at: string;
};

export type OrderMilestone = {
  id: string;
  order_id: string;
  title_ar: string;
  title_en: string | null;
  description: string | null;
  status: MilestoneStatus;
  sort_order: number;
  completed_at: string | null;
  customer_approved_at: string | null;
  created_at: string;
};

export type OrderDeliverable = {
  id: string;
  order_id: string;
  file_url: string;
  file_name: string;
  file_type: string | null;
  description: string | null;
  uploaded_by: string | null;
  created_at: string;
};

export type OrderMessage = {
  id: string;
  order_id: string;
  sender_id: string;
  content: string | null;
  attachment_url: string | null;
  attachment_kind: "audio" | "image" | "file" | null;
  attachment_mime: string | null;
  attachment_size: number | null;
  attachment_name: string | null;
  is_read: boolean;
  created_at: string;
};

export type Payment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_id: string | null;
  paymob_order_id: string | null;
  receipt_url: string | null;
  verified_by: string | null;
  customer_note: string | null;
  admin_note: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BankAccount = {
  id: string;
  name_ar: string;
  name_en: string;
  bank_name: string;
  account_number: string | null;
  iban: string | null;
  account_holder: string | null;
  notes: string | null;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
};

export type Review = {
  id: string;
  order_id: string;
  customer_id: string;
  service_id: string;
  rating: number;
  comment: string | null;
  admin_reply: string | null;
  is_visible: boolean;
  created_at: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  excerpt_ar: string | null;
  excerpt_en: string | null;
  content_ar: string | null;
  content_en: string | null;
  cover_image: string | null;
  author_id: string | null;
  status: PostStatus;
  seo_title_ar: string | null;
  seo_title_en: string | null;
  seo_description_ar: string | null;
  seo_description_en: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogCategory = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  sort_order: number;
  created_at: string;
};

export type AppNotification = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export type Setting = {
  key: string;
  value: Json;
  updated_at: string;
};

// ============================================================================
// CMS PAGES (privacy, terms, refund-policy, etc.)
// ============================================================================
export type CmsPage = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  content_ar: string | null;
  content_en: string | null;
  status: PostStatus;
  show_in_footer: boolean;
  sort_order: number;
  is_system: boolean;
  seo_title_ar: string | null;
  seo_title_en: string | null;
  seo_description_ar: string | null;
  seo_description_en: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

// ============================================================================
// USER GROUPS
// ============================================================================
export type UserGroup = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  permissions: Record<string, Json>;
  color: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
};

export type UserGroupMember = {
  group_id: string;
  user_id: string;
  added_by: string | null;
  added_at: string;
};

// ============================================================================
// SETTINGS sub-types (typed views over Setting.value JSON)
// ============================================================================

export type TelegramEvent =
  | "new_order"
  | "order_status_changed"
  | "payment_received"
  | "payment_failed"
  | "new_review"
  | "new_message_from_customer"
  | "order_cancelled";

export type TelegramSettings = {
  enabled: boolean;
  bot_token: string;
  admin_chat_id: string;
  events: Record<TelegramEvent, boolean>;
  templates: Record<TelegramEvent, string>;
};

export type OrdersPolicySettings = {
  max_pending_per_customer: number;
  pending_statuses: OrderStatus[];
  require_phone_on_signup: boolean;
  auto_assign_sales: boolean;
};

export type BusinessHoursDay = {
  open: string;   // "HH:MM"
  close: string;  // "HH:MM"
  closed: boolean;
};

export type BusinessHoursSettings = {
  timezone: string;
  sunday: BusinessHoursDay;
  monday: BusinessHoursDay;
  tuesday: BusinessHoursDay;
  wednesday: BusinessHoursDay;
  thursday: BusinessHoursDay;
  friday: BusinessHoursDay;
  saturday: BusinessHoursDay;
};

export type SocialLinks = {
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  snapchat?: string | null;
  github?: string | null;
  behance?: string | null;
  dribbble?: string | null;
  telegram?: string | null;
};

export type ContactSettings = {
  email: string;
  phone: string;
  address_ar: string;
  address_en: string;
  address_link?: string;
  working_hours_note_ar?: string;
  working_hours_note_en?: string;
  social: SocialLinks;
};

// ============================================================================
// Supabase Database type
// We keep this loose (Insert/Update are partials) to avoid friction with
// server actions that build payloads from zod-validated input.
// ============================================================================

// Insert/Update use `any` to satisfy supabase-js's GenericTable constraint
// (Record<string, unknown>) without conflicts. Type safety on the input side
// is handled by zod schemas in `lib/validators/`. The Row type stays strict
// so SELECT results remain typed.
type Tbl<T> = {
  Row: T & { [key: string]: unknown };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Insert: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Update: any;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Tbl<Profile>;
      categories: Tbl<Category>;
      services: Tbl<Service>;
      service_gallery: Tbl<ServiceGalleryItem>;
      service_stages: Tbl<ServiceStage>;
      portfolio_projects: Tbl<PortfolioProject>;
      portfolio_gallery: Tbl<{
        id: string;
        portfolio_id: string;
        image_url: string;
        alt_text: string | null;
        sort_order: number;
      }>;
      portfolio_services: Tbl<{ portfolio_id: string; service_id: string }>;
      orders: Tbl<Order>;
      order_status_history: Tbl<OrderStatusHistory>;
      order_milestones: Tbl<OrderMilestone>;
      order_deliverables: Tbl<OrderDeliverable>;
      order_messages: Tbl<OrderMessage>;
      payments: Tbl<Payment>;
      bank_accounts: Tbl<BankAccount>;
      reviews: Tbl<Review>;
      blog_posts: Tbl<BlogPost>;
      blog_categories: Tbl<BlogCategory>;
      blog_post_categories: Tbl<{ post_id: string; category_id: string }>;
      notifications: Tbl<AppNotification>;
      settings: Tbl<Setting>;
      cms_pages: Tbl<CmsPage>;
      user_groups: Tbl<UserGroup>;
      user_group_members: Tbl<UserGroupMember>;
      service_faqs: Tbl<ServiceFaq>;
      team_members: Tbl<TeamMember>;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      milestone_status: MilestoneStatus;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      post_status: PostStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
