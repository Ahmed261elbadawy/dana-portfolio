export type MediaKind = "image" | "upload_video" | "embed";
export type MediaProvider = "instagram" | "youtube" | "vimeo" | null;

export type ServiceType =
  | "campaign"
  | "strategy"
  | "content_creation"
  | "art_direction"
  | "social_media_management";

export type SiteSettings = {
  id: true;
  intro_paragraph: string;
  bio: string;
  services: string[];
  email: string;
  whatsapp: string;
  cv_url: string | null;
  photo_url: string | null;
  education_badge: string | null;
  credential_lines: string[];
  updated_at: string;
};

export type Brand = {
  id: string;
  slug: string;
  name: string;
  industry: string;
  logo_url: string | null;
  cover_image_url: string | null;
  services: ServiceType[];
  accent_color: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type CaseStudy = {
  id: string;
  brand_id: string;
  one_line_brief: string;
  challenge: string;
  approach: string;
  art_direction: string;
  deliverables: string[];
  hero_media_url: string | null;
  hero_media_kind: MediaKind | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Media = {
  id: string;
  case_study_id: string;
  kind: MediaKind;
  url: string;
  provider: MediaProvider;
  poster_url: string | null;
  alt_text: string;
  aspect_ratio: string;
  sort_order: number;
  created_at: string;
};

export type Metric = {
  id: string;
  case_study_id: string;
  label: string;
  value: string;
  note: string | null;
  sort_order: number;
  created_at: string;
};

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  services: ServiceType[];
  message: string | null;
  read: boolean;
  created_at: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string | null;
  brand: string | null;
  avatar_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type PageView = {
  id: string;
  session_id: string;
  path: string;
  created_at: string;
};

export type BrandLogo = {
  id: string;
  name: string;
  logo_url: string;
  category: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type Skill = {
  id: string;
  name: string;
  icon_url: string;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type Certificate = {
  id: string;
  title: string;
  issuer: string | null;
  image_url: string;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type WorkGalleryCategory = "grids" | "production" | "direction";

export type WorkGalleryItem = {
  id: string;
  category: WorkGalleryCategory;
  media_url: string;
  alt_text: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export interface Database {
  public: {
    Tables: {
      inquiries: {
        Row: Inquiry;
        Insert: Partial<Inquiry>;
        Update: Partial<Inquiry>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettings;
        Insert: Partial<SiteSettings>;
        Update: Partial<SiteSettings>;
        Relationships: [];
      };
      brands: {
        Row: Brand;
        Insert: Partial<Brand>;
        Update: Partial<Brand>;
        Relationships: [];
      };
      case_studies: {
        Row: CaseStudy;
        Insert: Partial<CaseStudy>;
        Update: Partial<CaseStudy>;
        Relationships: [];
      };
      media: {
        Row: Media;
        Insert: Partial<Media>;
        Update: Partial<Media>;
        Relationships: [];
      };
      metrics: {
        Row: Metric;
        Insert: Partial<Metric>;
        Update: Partial<Metric>;
        Relationships: [];
      };
      testimonials: {
        Row: Testimonial;
        Insert: Partial<Testimonial>;
        Update: Partial<Testimonial>;
        Relationships: [];
      };
      page_views: {
        Row: PageView;
        Insert: Partial<PageView>;
        Update: Partial<PageView>;
        Relationships: [];
      };
      brand_logos: {
        Row: BrandLogo;
        Insert: Partial<BrandLogo>;
        Update: Partial<BrandLogo>;
        Relationships: [];
      };
      skills: {
        Row: Skill;
        Insert: Partial<Skill>;
        Update: Partial<Skill>;
        Relationships: [];
      };
      certificates: {
        Row: Certificate;
        Insert: Partial<Certificate>;
        Update: Partial<Certificate>;
        Relationships: [];
      };
      work_gallery_items: {
        Row: WorkGalleryItem;
        Insert: Partial<WorkGalleryItem>;
        Update: Partial<WorkGalleryItem>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
