/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OverviewView } from './components/OverviewView';
import { MetricsExplorerView } from './components/MetricsExplorerView';
import { AlertsManagerView } from './components/AlertsManagerView';
import { LogsStreamView } from './components/LogsStreamView';
import { TracesWaterfallView } from './components/TracesWaterfallView';
import { TopologyView } from './components/TopologyView';
import { ChannelsView } from './components/ChannelsView';
import { StatusPageView } from './components/StatusPageView';
import { ArchitectureDocsView } from './components/ArchitectureDocsView';
import { CommandPalette } from './components/CommandPalette';
import { GitHubReadmeModal } from './components/GitHubReadmeModal';
import { Language } from './lib/i18n';
import { GITHUB_README_MARKDOWN } from './data/readmeContent';
import {
  AlertInstance,
  AlertRule,
  DistributedTrace,
  LogEntry,
  MetricSeries,
  NotificationChannel,
  ScenarioType,
  ServiceNode,
  SystemEngineStats,
} from './types/observability';
import {
  calculateGorillaCompression,
  generateInitialHistory,
  generateLogForScenario,
  generateSampleTrace,
  getNextMetricValue,
  INITIAL_ALERT_RULES,
  INITIAL_SERVICES,
} from './lib/engine';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [scenario, setScenario] = useState<ScenarioType>('normal');
  const [audioAlerts, setAudioAlerts] = useState<boolean>(true);
  const [language, setLanguage] = useState<Language>('en');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isReadmeModalOpen, setIsReadmeModalOpen] = useState<boolean>(false);

  // Core observability states
  const [metrics, setMetrics] = useState<Record<string, MetricSeries>>(() =>
    generateInitialHistory(28)
  );

  const [rules, setRules] = useState<AlertRule[]>(INITIAL_ALERT_RULES);
  const [alerts, setAlerts] = useState<AlertInstance[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [traces, setTraces] = useState<DistributedTrace[]>([]);
  const [services, setServices] = useState<ServiceNode[]>(INITIAL_SERVICES);

  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'ch-slack',
      name: 'Slack #ops-incidents',
      type: 'slack',
      destination: 'https://hooks.slack.com/services/T00/B00/X00',
      enabled: true,
      events: ['firing', 'resolved'],
    },
    {
      id: 'ch-telegram',
      name: 'Telegram SRE Alert Bot',
      type: 'telegram',
      destination: '@pulsecore_sre_bot (Chat ID: -10098412)',
      enabled: true,
      events: ['firing', 'resolved', 'acknowledged'],
    },
    {
      id: 'ch-pagerduty',
      name: 'PagerDuty Primary On-Call',
      type: 'pagerduty',
      destination: 'pd_events_v2_live_token_94108',
      enabled: true,
      events: ['firing'],
    },
    {
      id: 'ch-webhook',
      name: 'Internal NOC Webhook',
      type: 'webhook',
      destination: 'https://gateway.noc.internal/v1/incidents',
      enabled: true,
      events: ['firing', 'resolved'],
    },
  ]);

  const [engineStats, setEngineStats] = useState<SystemEngineStats>({
    ingestRateRps: 52400,
    activeSeriesCount: 184500,
    totalDataPoints: 2450000,
    rawBytes: 39200000,
    compressedBytes: 3356500,
    compressionRatio: 11.68,
    bytesPerSample: 1.37,
    queryLatencyP99Ms: 3.8,
    tsdbWriteAmplification: 1.04,
    goroutines: 420,
    memoryUsageMb: 418,
  });

  // Audio tone generator for critical alert chime
  const playAlertChime = () => {
    if (!audioAlerts) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880.0, audioCtx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  // Keyboard shortcut listener for Command Palette (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main real-time simulation tick (every 2.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      // 1. Update metric points
      setMetrics((prev) => {
        const next: Record<string, MetricSeries> = {};
        for (const [key, series] of Object.entries(prev)) {
          const currentVal = series.data[series.data.length - 1]?.value ?? 10;
          const nextVal = getNextMetricValue(key, scenario, currentVal);
          const updatedData = [
            ...series.data.slice(-29), // keep last 30 data points
            { timestamp: now, value: nextVal },
          ];
          next[key] = {
            ...series,
            data: updatedData,
          };
        }
        return next;
      });

      // 2. Generate contextual Log
      setLogs((prev) => [generateLogForScenario(scenario), ...prev.slice(0, 75)]);

      // 3. Generate Trace occasionally or when scenario changes
      if (Math.random() > 0.4) {
        setTraces((prev) => [generateSampleTrace(scenario), ...prev.slice(0, 15)]);
      }

      // 4. Update Engine Stats
      setEngineStats((prev) => {
        const points = prev.totalDataPoints + 1500;
        const comp = calculateGorillaCompression(points);
        return {
          ...prev,
          totalDataPoints: points,
          rawBytes: comp.rawBytes,
          compressedBytes: comp.compressedBytes,
          compressionRatio: comp.ratio,
          bytesPerSample: comp.bytesPerSample,
          ingestRateRps:
            scenario === 'ddos_spike'
              ? Math.floor(135000 + Math.random() * 15000)
              : Math.floor(52000 + Math.random() * 4000),
          queryLatencyP99Ms:
            scenario === 'ddos_spike' || scenario === 'db_exhaustion'
              ? +(4.8 + Math.random() * 2.2).toFixed(1)
              : +(3.2 + Math.random() * 0.9).toFixed(1),
        };
      });

      // 5. Evaluate Alert Rules & State Machine transitions
      setMetrics((currentMetrics) => {
        setAlerts((prevAlerts) => {
          let updatedAlerts = [...prevAlerts];

          rules.forEach((rule) => {
            if (!rule.enabled) return;

            const metricSeries = currentMetrics[rule.metricName];
            const latestVal = metricSeries?.data[metricSeries.data.length - 1]?.value ?? 0;
            const isBreached =
              rule.comparison === '>'
                ? latestVal > rule.threshold
                : latestVal < rule.threshold;

            const existingIndex = updatedAlerts.findIndex((a) => a.ruleId === rule.id);

            if (isBreached) {
              if (existingIndex === -1) {
                // Initial breach: Enter Pending state
                updatedAlerts.push({
                  id: `alert-${rule.id}-${now}`,
                  ruleId: rule.id,
                  ruleName: rule.name,
                  state: 'Pending',
                  severity: rule.severity,
                  currentValue: latestVal,
                  threshold: rule.threshold,
                  startedAt: now,
                  pendingSince: now,
                  service: rule.name.includes('Auth') ? 'auth-service' : 'database',
                  details: rule.description,
                });
              } else {
                const alertItem = updatedAlerts[existingIndex];
                alertItem.currentValue = latestVal;

                // If in Pending for more than 5 seconds in simulation, escalate to Firing
                if (alertItem.state === 'Pending' && alertItem.pendingSince && now - alertItem.pendingSince > 5000) {
                  alertItem.state = 'Firing';
                  playAlertChime();
                }
              }
            } else {
              // Condition recovered
              if (existingIndex !== -1) {
                const alertItem = updatedAlerts[existingIndex];
                if (alertItem.state === 'Firing' || alertItem.state === 'Pending') {
                  alertItem.state = 'Resolved';
                  alertItem.resolvedAt = now;
                  alertItem.currentValue = latestVal;
                }
              }
            }
          });

          return updatedAlerts;
        });

        return currentMetrics;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [scenario, rules, audioAlerts]);

  // Alert Actions
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              acknowledgedBy: 'ali.kheiri (On-Call SRE)',
              acknowledgedAt: Date.now(),
              notes: 'Restarting replica nodes & investigating latency logs.',
            }
          : a
      )
    );
  };

  const handleResolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              state: 'Resolved',
              resolvedAt: Date.now(),
            }
          : a
      )
    );
  };

  const handleSilenceAlert = (id: string, minutes: number) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              silencedUntil: Date.now() + minutes * 60 * 1000,
              notes: `Silenced for ${minutes} minutes.`,
            }
          : a
      )
    );
  };

  const handleToggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleAddRule = (newRule: AlertRule) => {
    setRules((prev) => [...prev, newRule]);
  };

  const handleToggleChannel = (channelId: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === channelId ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const activeAlertsCount = alerts.filter(
    (a) => a.state === 'Firing' || a.state === 'Pending'
  ).length;

  return (
    <div
      dir={language === 'fa' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col antialiased selection:bg-indigo-600 selection:text-white"
    >
      {/* Top Navbar */}
      <Navbar
        scenario={scenario}
        onSelectScenario={setScenario}
        audioAlerts={audioAlerts}
        onToggleAudio={() => setAudioAlerts(!audioAlerts)}
        activeAlertsCount={activeAlertsCount}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'en' ? 'fa' : 'en'))}
        onOpenReadmeModal={() => setIsReadmeModalOpen(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          activeAlertsCount={activeAlertsCount}
          language={language}
        />

        {/* Dynamic Tab Views */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#090D16] via-[#0A0E18] to-[#090D16]">
          {currentTab === 'overview' && (
            <OverviewView
              metrics={metrics}
              alerts={alerts}
              engineStats={engineStats}
              scenario={scenario}
              onSelectScenario={setScenario}
              onSelectTab={setCurrentTab}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onResolveAlert={handleResolveAlert}
              language={language}
            />
          )}

          {currentTab === 'metrics' && (
            <MetricsExplorerView
              metrics={metrics}
              engineStats={engineStats}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsManagerView
              alerts={alerts}
              rules={rules}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onResolveAlert={handleResolveAlert}
              onSilenceAlert={handleSilenceAlert}
              onToggleRule={handleToggleRule}
              onAddRule={handleAddRule}
            />
          )}

          {currentTab === 'logs' && (
            <LogsStreamView
              logs={logs}
              onClearLogs={() => setLogs([])}
              onSelectTab={setCurrentTab}
            />
          )}

          {currentTab === 'traces' && (
            <TracesWaterfallView traces={traces} />
          )}

          {currentTab === 'topology' && (
            <TopologyView services={services} />
          )}

          {currentTab === 'channels' && (
            <ChannelsView
              channels={channels}
              onToggleChannel={handleToggleChannel}
            />
          )}

          {currentTab === 'status' && <StatusPageView />}

          {currentTab === 'docs' && <ArchitectureDocsView />}
        </main>
      </div>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setCurrentTab}
        onSelectScenario={setScenario}
      />

      {/* GitHub Readme Modal */}
      <GitHubReadmeModal
        isOpen={isReadmeModalOpen}
        onClose={() => setIsReadmeModalOpen(false)}
        readmeContent={GITHUB_README_MARKDOWN}
      />
    </div>
  );
}

