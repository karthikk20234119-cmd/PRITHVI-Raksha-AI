import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, Globe, Map, Cpu, Bell, Sliders,
  Server, Shield, Save, RotateCcw, CheckCircle, AlertCircle,
  Volume2, VolumeX, Eye, Moon, Sun, Layers, Radio, Activity,
  Zap, Database, RefreshCw, Smartphone, Laptop, LogOut, User
} from 'lucide-react';
import { t, getCurrentLanguage, setLanguage, Language, languages } from '../i18n/translations';
import { useAuth } from '../App';
import { getServerUrl } from '../services/api';

export interface AppSettings {
  language: Language;
  refreshIntervalSec: number;
  defaultRegion: string;
  themeDensity: 'comfortable' | 'compact';
  chartColorPalette: 'emerald' | 'cyan' | 'amber';
  mapStyle: 'dark' | 'satellite' | 'terrain';
  mapZoomLevel: number;
  autoCenterAlerts: boolean;
  clusterMarkers: boolean;
  showRoadLayers: boolean;
  aiSensitivity: 'standard' | 'high' | 'conservative';
  compoundRiskWeight: number; // 0.1 to 0.9
  autoDispatchAlerts: boolean;
  soundAlertsEnabled: boolean;
  desktopNotificationsEnabled: boolean;
  wsAutoReconnect: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  refreshIntervalSec: 30,
  defaultRegion: 'all',
  themeDensity: 'comfortable',
  chartColorPalette: 'emerald',
  mapStyle: 'dark',
  mapZoomLevel: 8,
  autoCenterAlerts: true,
  clusterMarkers: true,
  showRoadLayers: true,
  aiSensitivity: 'standard',
  compoundRiskWeight: 0.6,
  autoDispatchAlerts: true,
  soundAlertsEnabled: true,
  desktopNotificationsEnabled: false,
  wsAutoReconnect: true,
};

export function getStoredAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem('prithvi_raksha_app_settings');
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch { /* fallback */ }
  return DEFAULT_SETTINGS;
}

export default function Settings() {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(getStoredAppSettings());
  const [activeSection, setActiveSection] = useState<'general' | 'appearance' | 'map' | 'ai' | 'notifications' | 'system' | 'account'>('general');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [serverInput, setServerInput] = useState(getServerUrl());
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('prithvi_raksha_app_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('prithvi_raksha_app_settings', JSON.stringify(settings));
    if (settings.language !== getCurrentLanguage()) {
      setLanguage(settings.language);
      window.location.reload();
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('prithvi_raksha_app_settings', JSON.stringify(DEFAULT_SETTINGS));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const testBackendConnection = async () => {
    setPingStatus('testing');
    const start = performance.now();
    try {
      const isLoadedFromServer = window.location.port === '8000' || window.location.port === '';
      const defaultUrl = isLoadedFromServer ? '/api' : '/api';
      const targetUrl = serverInput ? `http://${serverInput}/api/health` : `${defaultUrl}/health`;
      const res = await fetch(targetUrl, { signal: AbortSignal.timeout(3000) });
      const elapsed = Math.round(performance.now() - start);
      if (res.ok) {
        setPingStatus('success');
        setPingLatency(elapsed);
      } else {
        setPingStatus('failed');
      }
    } catch {
      setPingStatus('failed');
    }
  };

  const saveBackendUrl = () => {
    let url = serverInput.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (url && !url.includes(':')) url += ':8000';
    localStorage.setItem('geoshield_server_url', url);
    setServerInput(url);
    handleSave();
  };

  const sections = [
    { id: 'general', label: 'General & Localization', icon: Globe },
    { id: 'appearance', label: 'Appearance & UI', icon: Sliders },
    { id: 'map', label: 'GIS & Map Preferences', icon: Map },
    { id: 'ai', label: 'AI Risk Thresholds', icon: Cpu },
    { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
    { id: 'system', label: 'System Telemetry & Server', icon: Server },
    { id: 'account', label: 'Account & Session', icon: User },
  ] as const;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="glass rounded-2xl p-6 border border-dark-700/80 bg-gradient-to-r from-dark-900/90 via-dark-900/70 to-dark-950/90 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 flex items-center justify-center text-green-400 shadow-lg shadow-green-600/10">
            <SettingsIcon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">PRITHVI-Raksha AI Settings</h1>
              <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-semibold">
                v2.0 LIVE
              </span>
            </div>
            <p className="text-dark-400 text-xs sm:text-sm mt-0.5">
              Configure system preferences, GIS basemaps, AI ensemble parameters, and server telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleReset}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-dark-800/80 border border-dark-700 text-dark-300 text-xs font-medium hover:text-white hover:bg-dark-700 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xs font-semibold transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saveSuccess ? 'Saved!' : 'Save Settings'}
          </button>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-red-600/15 border border-red-600/30 text-red-400 text-xs font-semibold hover:bg-red-600/25 transition-all shadow-lg shadow-red-600/10 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Save Success Alert Banner */}
      {saveSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center justify-between text-green-400 text-xs font-medium animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Settings saved successfully. Changes applied to active session.</span>
          </div>
        </div>
      )}

      {/* Main Settings Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-1 glass rounded-2xl p-3 border border-dark-700/80 h-fit">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-green-600/15 text-green-400 border border-green-600/30 shadow-md shadow-green-600/10'
                    : 'text-dark-300 hover:bg-dark-800/60 hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-green-400' : 'text-dark-400'}`} />
                <span className="truncate">{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className="lg:col-span-3 glass rounded-2xl p-6 border border-dark-700/80 space-y-6">
          {/* 1. GENERAL SETTINGS */}
          {activeSection === 'general' && (
            <div className="space-y-6">
              <div className="border-b border-dark-700/60 pb-3">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-green-400" />
                  General & Localization
                </h2>
                <p className="text-dark-400 text-xs mt-0.5">Manage language translations and platform telemetry refresh frequencies.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-dark-300">System Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value as Language)}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white text-xs focus:outline-none focus:border-green-600/50"
                  >
                    {Object.entries(languages).map(([code, { name, flag }]) => (
                      <option key={code} value={code}>
                        {flag} {name} ({code.toUpperCase()})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-dark-500">Applies across all early warnings, alert reports, and dashboards.</p>
                </div>

                {/* Refresh Rate */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-dark-300">Telemetry Refresh Rate</label>
                  <select
                    value={settings.refreshIntervalSec}
                    onChange={(e) => updateSetting('refreshIntervalSec', Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white text-xs focus:outline-none focus:border-green-600/50"
                  >
                    <option value={10}>10 Seconds (High Speed)</option>
                    <option value={30}>30 Seconds (Default)</option>
                    <option value={60}>60 Seconds (Standard)</option>
                    <option value={300}>5 Minutes (Eco Mode)</option>
                  </select>
                  <p className="text-[10px] text-dark-500">Frequency for querying station sensors and weather APIs.</p>
                </div>

                {/* Default Region Focus */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-medium text-dark-300">Primary Region Focus</label>
                  <select
                    value={settings.defaultRegion}
                    onChange={(e) => updateSetting('defaultRegion', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white text-xs focus:outline-none focus:border-green-600/50"
                  >
                    <option value="all">All North Eastern Region (8 States - 20 Stations)</option>
                    <option value="Sikkim">Sikkim (Gangtok, Mangan, Namchi)</option>
                    <option value="Meghalaya">Meghalaya (Cherrapunji, Shillong, Tura)</option>
                    <option value="Assam">Assam (Guwahati, Silchar, Haflong)</option>
                    <option value="Manipur">Manipur (Imphal, Ukhrul, Churachandpur)</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh (Itanagar, Tawang, Pasighat)</option>
                    <option value="Nagaland">Nagaland (Kohima, Mokokchung, Tuensang)</option>
                    <option value="Mizoram">Mizoram (Aizawl, Lunglei, Champhai)</option>
                    <option value="Tripura">Tripura (Agartala, Dharmanagar)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 2. APPEARANCE SETTINGS */}
          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <div className="border-b border-dark-700/60 pb-3">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-green-400" />
                  Appearance & Interface Density
                </h2>
                <p className="text-dark-400 text-xs mt-0.5">Customize visual layouts, display density, and telemetry chart palettes.</p>
              </div>

              <div className="space-y-6">
                {/* Density Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-dark-300">Interface Display Density</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => updateSetting('themeDensity', 'comfortable')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        settings.themeDensity === 'comfortable'
                          ? 'bg-green-600/15 border-green-600/40 text-white'
                          : 'bg-dark-800/40 border-dark-700 text-dark-400 hover:text-dark-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-medium text-xs text-white mb-1">
                        <Laptop className="w-4 h-4 text-green-400" />
                        Comfortable (Default)
                      </div>
                      <p className="text-[10px] text-dark-400">Balanced padding, larger typography, optimal for desktop monitoring screens.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateSetting('themeDensity', 'compact')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        settings.themeDensity === 'compact'
                          ? 'bg-green-600/15 border-green-600/40 text-white'
                          : 'bg-dark-800/40 border-dark-700 text-dark-400 hover:text-dark-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-medium text-xs text-white mb-1">
                        <Smartphone className="w-4 h-4 text-green-400" />
                        Compact
                      </div>
                      <p className="text-[10px] text-dark-400">Maximizes data density for multi-monitor command dashboards and mobile field view.</p>
                    </button>
                  </div>
                </div>

                {/* Chart Color Palette */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-dark-300">Telemetry Chart Palette</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'emerald', name: 'Emerald Command', color: 'bg-emerald-500' },
                      { id: 'cyan', name: 'Cyber Cyan', color: 'bg-cyan-500' },
                      { id: 'amber', name: 'Amber Hazard', color: 'bg-amber-500' },
                    ].map((palette) => (
                      <button
                        key={palette.id}
                        type="button"
                        onClick={() => updateSetting('chartColorPalette', palette.id as any)}
                        className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                          settings.chartColorPalette === palette.id
                            ? 'bg-green-600/15 border-green-600/40 text-white'
                            : 'bg-dark-800/40 border-dark-700 text-dark-400 hover:text-dark-200'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full ${palette.color}`} />
                        <span className="text-xs font-medium">{palette.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. GIS & MAP PREFERENCES */}
          {activeSection === 'map' && (
            <div className="space-y-6">
              <div className="border-b border-dark-700/60 pb-3">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Map className="w-4 h-4 text-green-400" />
                  GIS & Map Preferences
                </h2>
                <p className="text-dark-400 text-xs mt-0.5">Configure default Leaflet basemap layers, zoom level, and spatial marker settings.</p>
              </div>

              <div className="space-y-6">
                {/* Default Map Style */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-dark-300">Default GIS Tile Layer</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'dark', title: 'Dark Canvas', desc: 'High contrast for risk markers' },
                      { id: 'satellite', title: 'Satellite Hybrid', desc: 'Real-time land cover & NDVI' },
                      { id: 'terrain', title: 'Topographic Terrain', desc: 'Contour & elevation focus' },
                    ].map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => updateSetting('mapStyle', style.id as any)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          settings.mapStyle === style.id
                            ? 'bg-green-600/15 border-green-600/40 text-white'
                            : 'bg-dark-800/40 border-dark-700 text-dark-400 hover:text-dark-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-medium text-xs text-white mb-1">
                          <Layers className="w-3.5 h-3.5 text-green-400" />
                          {style.title}
                        </div>
                        <p className="text-[10px] text-dark-400">{style.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-dark-800/40 border border-dark-700 cursor-pointer">
                    <div>
                      <p className="text-xs font-medium text-white">Auto-Center on Critical Alerts</p>
                      <p className="text-[10px] text-dark-400">Automatically pan GIS map view when a critical alert triggers.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoCenterAlerts}
                      onChange={(e) => updateSetting('autoCenterAlerts', e.target.checked)}
                      className="w-4 h-4 accent-green-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-dark-800/40 border border-dark-700 cursor-pointer">
                    <div>
                      <p className="text-xs font-medium text-white">Enable Station Marker Clustering</p>
                      <p className="text-[10px] text-dark-400">Group close IoT stations when zoomed out to prevent map clutter.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.clusterMarkers}
                      onChange={(e) => updateSetting('clusterMarkers', e.target.checked)}
                      className="w-4 h-4 accent-green-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-dark-800/40 border border-dark-700 cursor-pointer">
                    <div>
                      <p className="text-xs font-medium text-white">Show Road Blockage Overlay</p>
                      <p className="text-[10px] text-dark-400">Display major NER highway routes and active landslide road blockage indicators.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showRoadLayers}
                      onChange={(e) => updateSetting('showRoadLayers', e.target.checked)}
                      className="w-4 h-4 accent-green-500 rounded"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 4. AI & RISK THRESHOLDS */}
          {activeSection === 'ai' && (
            <div className="space-y-6">
              <div className="border-b border-dark-700/60 pb-3">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-green-400" />
                  AI Ensemble & Risk Thresholds
                </h2>
                <p className="text-dark-400 text-xs mt-0.5">Tune Random Forest + XGBoost prediction sensitivity and compound flood-landslide weights.</p>
              </div>

              <div className="space-y-6">
                {/* Model Sensitivity */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-dark-300">Model Prediction Sensitivity</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'conservative', title: 'Conservative', desc: 'Fewer false alarms, higher threshold' },
                      { id: 'standard', title: 'Standard (Balanced)', desc: 'Optimal trade-off (95.3% accuracy)' },
                      { id: 'high', title: 'High Sensitivity', desc: 'Early warning priority for heavy rainfall' },
                    ].map((sens) => (
                      <button
                        key={sens.id}
                        type="button"
                        onClick={() => updateSetting('aiSensitivity', sens.id as any)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          settings.aiSensitivity === sens.id
                            ? 'bg-green-600/15 border-green-600/40 text-white'
                            : 'bg-dark-800/40 border-dark-700 text-dark-400 hover:text-dark-200'
                        }`}
                      >
                        <p className="text-xs font-medium text-white mb-1">{sens.title}</p>
                        <p className="text-[10px] text-dark-400">{sens.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compound Risk Weight Slider */}
                <div className="space-y-3 bg-dark-800/40 border border-dark-700 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-white">Compound Risk Ratio (Flood vs. Landslide)</p>
                      <p className="text-[10px] text-dark-400">Adjust contribution ratio for combined hazard assessment.</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono font-bold">
                      {Math.round((1 - settings.compoundRiskWeight) * 100)}% Flood / {Math.round(settings.compoundRiskWeight * 100)}% Landslide
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="0.8"
                    step="0.05"
                    value={settings.compoundRiskWeight}
                    onChange={(e) => updateSetting('compoundRiskWeight', Number(e.target.value))}
                    className="w-full accent-green-500 h-1.5 bg-dark-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div className="border-b border-dark-700/60 pb-3">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-green-400" />
                  Notifications & Early Warning Broadcast
                </h2>
                <p className="text-dark-400 text-xs mt-0.5">Manage audio cues, browser alerts, and WebSocket real-time event feeds.</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-xl bg-dark-800/40 border border-dark-700 cursor-pointer">
                  <div className="flex items-center gap-3">
                    {settings.soundAlertsEnabled ? (
                      <Volume2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-dark-500" />
                    )}
                    <div>
                      <p className="text-xs font-medium text-white">Audio Siren on Critical Landslide Risk</p>
                      <p className="text-[10px] text-dark-400">Play immediate audio warning tone when risk score exceeds 85/100.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundAlertsEnabled}
                    onChange={(e) => updateSetting('soundAlertsEnabled', e.target.checked)}
                    className="w-4 h-4 accent-green-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl bg-dark-800/40 border border-dark-700 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-xs font-medium text-white">Desktop Push Notifications</p>
                      <p className="text-[10px] text-dark-400">Send system tray notifications for district evacuation alerts.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.desktopNotificationsEnabled}
                    onChange={(e) => updateSetting('desktopNotificationsEnabled', e.target.checked)}
                    className="w-4 h-4 accent-green-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl bg-dark-800/40 border border-dark-700 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Radio className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-xs font-medium text-white">WebSocket Auto-Reconnect</p>
                      <p className="text-[10px] text-dark-400">Automatically re-establish live alert stream if network drops.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.wsAutoReconnect}
                    onChange={(e) => updateSetting('wsAutoReconnect', e.target.checked)}
                    className="w-4 h-4 accent-green-500 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* 6. SYSTEM TELEMETRY & SERVER */}
          {activeSection === 'system' && (
            <div className="space-y-6">
              <div className="border-b border-dark-700/60 pb-3">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-green-400" />
                  System & Server Telemetry
                </h2>
                <p className="text-dark-400 text-xs mt-0.5">Backend API connection configuration, latency testing, and active user session.</p>
              </div>

              {/* Server Endpoint Config */}
              <div className="p-4 rounded-xl bg-dark-800/40 border border-dark-700 space-y-4">
                <label className="text-xs font-medium text-white block">Backend Server Address</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={serverInput}
                    onChange={(e) => setServerInput(e.target.value)}
                    placeholder="localhost:8000 or 192.168.1.100:8000"
                    className="flex-1 px-3 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white text-xs font-mono placeholder-dark-500 focus:outline-none focus:border-green-600/50"
                  />
                  <button
                    type="button"
                    onClick={saveBackendUrl}
                    className="px-4 py-2.5 rounded-xl bg-green-600/20 text-green-400 border border-green-600/30 text-xs font-medium hover:bg-green-600/30"
                  >
                    Save Host
                  </button>
                  <button
                    type="button"
                    onClick={testBackendConnection}
                    className="px-4 py-2.5 rounded-xl bg-dark-800 text-dark-300 border border-dark-700 text-xs font-medium hover:text-white hover:bg-dark-700 flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${pingStatus === 'testing' ? 'animate-spin' : ''}`} />
                    Test Ping
                  </button>
                </div>

                {pingStatus !== 'idle' && (
                  <div className="text-xs flex items-center gap-2 pt-1">
                    {pingStatus === 'testing' && (
                      <span className="text-amber-400 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 animate-pulse" /> Testing connection latency...
                      </span>
                    )}
                    {pingStatus === 'success' && (
                      <span className="text-green-400 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Connected! Server response time: {pingLatency} ms
                      </span>
                    )}
                    {pingStatus === 'failed' && (
                      <span className="text-red-400 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> Unable to reach backend API. Ensure server is running on port 8000.
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. ACCOUNT & SESSION */}
          {activeSection === 'account' && (
            <div className="space-y-6">
              <div className="border-b border-dark-700/60 pb-3">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-green-400" />
                  Account & Session Management
                </h2>
                <p className="text-dark-400 text-xs mt-0.5">View active user credentials and terminate monitoring session.</p>
              </div>

              {user ? (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-dark-800/40 border border-dark-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/10">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{user.name}</h3>
                        <p className="text-xs text-dark-400">Assigned Role: <span className="text-green-400 font-medium">{user.role}</span></p>
                        <p className="text-[10px] text-dark-500 mt-1">PRITHVI-Raksha AI Telemetry Access Granted</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono font-semibold">
                      SESSION ACTIVE
                    </span>
                  </div>

                  <div className="p-6 rounded-2xl bg-red-600/5 border border-red-600/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Terminate Session</h4>
                      <p className="text-xs text-dark-300">Log out of PRITHVI-Raksha AI and return to the authentication login screen.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLogoutConfirm(true)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 flex-shrink-0"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout Account
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-dark-800/40 border border-dark-700 text-dark-400 text-xs">
                  No active user session detected.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CONFIRMATION LOGOUT MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass rounded-2xl p-6 max-w-md w-full border border-red-500/30 shadow-2xl bg-dark-900/95 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Logout</h3>
                <p className="text-xs text-dark-400">PRITHVI-Raksha AI Session Management</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-dark-200">
              Are you sure you want to logout?
            </p>
            <p className="text-[11px] text-dark-400 bg-dark-800/60 border border-dark-700 p-2.5 rounded-lg">
              Logging out will clear your session JWT token and return you to the login screen.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-dark-300 text-xs font-medium hover:text-white hover:bg-dark-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-lg shadow-red-600/20 transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
