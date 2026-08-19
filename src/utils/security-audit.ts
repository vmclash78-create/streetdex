import { type Database } from '../integrations/supabase/types';

type PublicTable = keyof Database['public']['Tables'];

const TABLES_WITH_RLS: PublicTable[] = [
  'coupons',
  'customers',
  'expenses',
  'hero_banners',
  'order_items',
  'orders',
  'products',
  'profiles',
  'sale_items',
  'sales',
  'shipments',
  'store_settings',
  'user_roles',
  'wishlist'
];

export const securityReport = {
  inventory: {
    attackVectors: [
      "Checkout Form (CheckoutView.tsx) - PII, Address",
      "Login Form (AuthPage.tsx) - Credentials",
      "Reset Password (ResetPassword.tsx) - Credentials",
      "Admin CRUD (Admin.tsx) - Products, Sales, Settings",
      "Image Upload (ImageUploadField.tsx) - Storage assets",
      "Order Tracking (TrackOrder.tsx) - Public order access via ID"
    ],
    supabaseTables: TABLES_WITH_RLS
  },
  audit: [
    {
      level: "CRITICAL",
      location: "src/components/store/CheckoutView.tsx",
      type: "Sensitive Data Storage",
      finding: "PII (Name, Phone, Address) stored in unencrypted localStorage.",
      fix: "Clear sensitive localStorage keys immediately after order completion (Verified: Line 365)."
    },
    {
      level: "HIGH",
      location: "src/pages/ResetPassword.tsx",
      type: "Broken Authentication",
      finding: "Branding 'duartt' hardcoded instead of dynamic store name.",
      fix: "Updated to use store_settings or dynamic logo (To be applied)."
    },
    {
      level: "MEDIUM",
      location: "src/integrations/supabase/client.ts",
      type: "Insecure Session Storage",
      finding: "Supabase session stored in localStorage (XSS risk).",
      observation: "Acceptable for SPA, but requires strict XSS prevention."
    },
    {
      level: "INFO",
      location: "src/components/ui/chart.tsx",
      type: "XSS Risk",
      finding: "Uses dangerouslySetInnerHTML for tooltips.",
      fix: "Verified: Input is internal charting data, not user-controlled strings."
    }
  ]
};
