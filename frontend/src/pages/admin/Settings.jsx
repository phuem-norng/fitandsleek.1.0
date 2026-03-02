import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { useTheme } from "../../state/theme.jsx";
import { useLanguage } from "../../lib/i18n.jsx";

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { mode, primaryColor, setMode, setPrimaryColor, saveTheme, normalizeHexColor } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const accentColor = mode === "dark" ? "#FFFFFF" : primaryColor;
  const accentIsWhite = (accentColor || "").toUpperCase() === "#FFFFFF";
  const headerIconColor = accentIsWhite ? "#0b0b0f" : "#FFFFFF";

  // Form state
  const [form, setForm] = useState({
    site_name: "Fit&Sleek",
    site_description: "",
    contact_email: "",
    contact_phone: "",
    currency: "USD",
    tax_rate: "0",
    free_shipping_threshold: "0",
    social_facebook: "",
    social_instagram: "",
    social_twitter: "",
    font_en: "Inter",
    font_km: "Noto Sans Khmer",
    admin_theme_mode: "light",
    admin_primary_color: "#F58E27",
    privacy_content: "",
    terms_content: "",
  });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/settings");
      const grouped = res.data || {};
      
      // Convert to flat form object
      const flatForm = { ...form };
      Object.values(grouped).flat().forEach(s => {
        if (flatForm.hasOwnProperty(s.key)) {
          flatForm[s.key] = s.value;
        }
      });

      const loadedMode = flatForm.admin_theme_mode === "dark" ? "dark" : "light";
      const loadedColor = normalizeHexColor(flatForm.admin_primary_color || "#F58E27");
      setMode(loadedMode);
      setPrimaryColor(loadedColor);
      flatForm.admin_theme_mode = loadedMode;
      flatForm.admin_primary_color = loadedColor;

      setForm(flatForm);
      setSettings(grouped);
    } catch (e) {
      console.error("Failed to load settings", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSettings(); }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const normalizedThemeMode = mode === "dark" ? "dark" : "light";
      const normalizedThemeColor = normalizeHexColor(primaryColor || form.admin_primary_color || "#F58E27");
      const payloadForm = {
        ...form,
        admin_theme_mode: normalizedThemeMode,
        admin_primary_color: normalizedThemeColor,
      };

      // Convert form to settings array
      const settingsArray = Object.entries(payloadForm).map(([key, value]) => ({ key, value }));
      await api.put("/admin/settings/bulk", { settings: settingsArray });
      saveTheme(normalizedThemeMode, normalizedThemeColor);
      setForm(payloadForm);
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
      loadSettings();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setForm(s => ({ ...s, [key]: value }));
  };

  const handleThemeModeChange = (nextMode) => {
    const modeValue = nextMode === "dark" ? "dark" : "light";
    setMode(modeValue);
    handleChange("admin_theme_mode", modeValue);
  };

  const handleThemeColorChange = (nextColor) => {
    const colorValue = normalizeHexColor(nextColor || "#F58E27");
    setPrimaryColor(colorValue);
    handleChange("admin_primary_color", colorValue);
  };

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div
          className="w-14 h-14 border-4 rounded-full animate-spin"
          style={{
            borderColor: mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(var(--admin-primary-rgb),0.25)",
            borderTopColor: accentColor,
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-emerald-700 font-medium">{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 font-medium">{error}</span>
            <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: accentColor }}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: headerIconColor }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            {t('adminSettingsTitle') || 'Settings'}
          </h1>
          <p className="text-slate-500 text-lg">{t('adminSettingsSubtitle') || 'Configure your store settings and preferences'}</p>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: "var(--admin-primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0L16.95 7.05M7.05 16.95l-1.414 1.414" />
              </svg>
              {t('adminAppearance') || 'Appearance'}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('adminThemeMode') || 'Theme Mode'}</label>
                <select
                  value={mode}
                  onChange={(e) => handleThemeModeChange(e.target.value)}
                  className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 text-slate-700 dark:text-slate-100 outline-none"
                >
                  <option value="light">{t('adminLightMode') || 'Light Mode'}</option>
                  <option value="dark">{t('adminDarkMode') || 'Dark Mode'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('adminPrimaryColor') || 'Primary Color'}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => handleThemeColorChange(e.target.value)}
                    className="h-12 w-14 p-1 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => handleThemeColorChange(e.target.value)}
                    className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 text-slate-700 dark:text-slate-100 outline-none"
                    placeholder="#F58E27"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{t('adminPrimaryColorHint') || 'Admin accent color (default: #F58E27)'}</p>
              </div>
            </div>
          </div>

          {/* Localization */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 0c1.657 0 3 4.03 3 9s-1.343 9-3 9m0-18c-1.657 0-3 4.03-3 9s1.343 9 3 9m-9-9c0 1.657 4.03 3 9 3s9-1.343 9-3m-18 0c0-1.657 4.03-3 9-3s9 1.343 9 3" />
              </svg>
              {t("language") || "Language"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {t('languageScopeNote') || 'Applies across the admin and storefront. Change language from here only.'}
            </p>
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/60 shadow-inner p-1 backdrop-blur supports-[backdrop-filter]:bg-white/50">
              {[{ code: "en", label: t("english") || "English" }, { code: "km", label: t("khmer") || "Khmer" }].map((option) => {
                const active = language === option.code;
                return (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => setLanguage(option.code)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                      active
                        ? "bg-slate-900 text-white shadow"
                        : "text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    aria-pressed={active}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* General Settings */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              {t('adminGeneral') || 'General'}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('adminSiteName') || 'Site Name'}</label>
                <input
                  type="text"
                  value={form.site_name}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 text-slate-700 dark:text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('adminContactEmail') || 'Contact Email'}</label>
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 text-slate-700 dark:text-slate-100 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('adminSiteDescription') || 'Site Description'}</label>
                <textarea
                  value={form.site_description}
                  onChange={(e) => handleChange('site_description', e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-4 text-slate-700 dark:text-slate-100 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Commerce Settings */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              {t('adminCommerce') || 'Commerce'}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('adminCurrency') || 'Currency'}</label>
                <select
                  value={form.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 text-slate-700 dark:text-slate-100 outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="THB">THB (฿)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('adminTaxRate') || 'Tax Rate (%)'}</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.tax_rate}
                  onChange={(e) => handleChange('tax_rate', e.target.value)}
                  className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 text-slate-700 dark:text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('adminFreeShipping') || 'Free Shipping Threshold'}</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.free_shipping_threshold}
                  onChange={(e) => handleChange('free_shipping_threshold', e.target.value)}
                  className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 text-slate-700 dark:text-slate-100 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Typography Settings */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20h16M6 16h12M8 12h8M9 8h6M10 4h4" />
              </svg>
              {t('adminTypography') || 'Typography'}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('adminEnglishFont') || 'English Font'}</label>
                <input
                  list="font-en-options"
                  value={form.font_en}
                  onChange={(e) => handleChange('font_en', e.target.value)}
                  className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 text-slate-700 dark:text-slate-100 outline-none"
                  placeholder="Inter"
                />
                <datalist id="font-en-options">
                  <option value="Inter" />
                  <option value="Poppins" />
                  <option value="Roboto" />
                  <option value="Montserrat" />
                  <option value="System" />
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('adminKhmerFont') || 'Khmer Font'}</label>
                <input
                  list="font-km-options"
                  value={form.font_km}
                  onChange={(e) => handleChange('font_km', e.target.value)}
                  className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 text-slate-700 dark:text-slate-100 outline-none"
                  placeholder="Noto Sans Khmer"
                />
                <datalist id="font-km-options">
                  <option value="Noto Sans Khmer" />
                  <option value="Kantumruy Pro" />
                  <option value="Battambang" />
                  <option value="System" />
                </datalist>
              </div>
              <p className="text-xs text-slate-500 md:col-span-2">{t('adminFontTip') || 'Tip: Fonts must be loaded in the frontend. Use the provided options for best results.'}</p>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              {t('adminSocial') || 'Social Media'}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('adminFacebookUrl') || 'Facebook URL'}</label>
                <input
                  type="url"
                  value={form.social_facebook}
                  onChange={(e) => handleChange('social_facebook', e.target.value)}
                  className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 text-slate-700 dark:text-slate-100 outline-none"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('adminInstagramUrl') || 'Instagram URL'}</label>
                <input
                  type="url"
                  value={form.social_instagram}
                  onChange={(e) => handleChange('social_instagram', e.target.value)}
                  className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 text-slate-700 dark:text-slate-100 outline-none"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('adminTwitterUrl') || 'Twitter URL'}</label>
                <input
                  type="url"
                  value={form.social_twitter}
                  onChange={(e) => handleChange('social_twitter', e.target.value)}
                  className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 text-slate-700 dark:text-slate-100 outline-none"
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>
          </div>

          {/* Legal Pages */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('adminLegal') || 'Legal Pages'}
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('adminPrivacyContent') || 'Privacy Policy Content'}</label>
                <textarea
                  value={form.privacy_content}
                  onChange={(e) => handleChange('privacy_content', e.target.value)}
                  rows={8}
                  className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-4 text-slate-700 dark:text-slate-100 outline-none"
                  placeholder={t('adminPrivacyPlaceholder') || 'Enter privacy policy text...'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{t('adminTermsContent') || 'Terms & Conditions Content'}</label>
                <textarea
                  value={form.terms_content}
                  onChange={(e) => handleChange('terms_content', e.target.value)}
                  rows={8}
                  className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-4 text-slate-700 dark:text-slate-100 outline-none"
                  placeholder={t('adminTermsPlaceholder') || 'Enter terms and conditions text...'}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={save}
              disabled={saving}
              className={`h-12 px-8 rounded-xl font-semibold shadow-sm disabled:opacity-50 flex items-center gap-2 ${accentIsWhite ? "border border-slate-300" : "text-white"}`}
              style={{ backgroundColor: accentColor, color: accentIsWhite ? "#0b0b0f" : "#FFFFFF" }}
            >
              {saving ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t('adminSaving') || 'Saving...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('adminSaveSettings') || 'Save Settings'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

