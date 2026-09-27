import React, { useState } from 'react';
import {
  Bell,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Mail,
  MessageSquare,
  Radio,
  Send,
  Shield,
  Smartphone,
  Webhook,
  Zap,
} from 'lucide-react';
import { NotificationChannel } from '../types/observability';

interface ChannelsViewProps {
  channels: NotificationChannel[];
  onToggleChannel: (id: string) => void;
}

export const ChannelsView: React.FC<ChannelsViewProps> = ({
  channels,
  onToggleChannel,
}) => {
  const [testPayloadModal, setTestPayloadModal] = useState<any | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const handleSendTest = (channel: NotificationChannel) => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setTestPayloadModal({
        channelName: channel.name,
        type: channel.type,
        destination: channel.destination,
        timestamp: new Date().toISOString(),
        payload: {
          event: 'alert.firing',
          severity: 'CRITICAL',
          incident_id: 'inc-99412',
          rule: 'نرخ خطای بحرانی ۵xx در سرویس احراز هویت',
          service: 'auth-service',
          value: '18.4%',
          threshold: '> 5.0%',
          runbook: 'https://wiki.internal/ops/auth-service-5xx',
          actions: [
            { label: 'Acknowledge (۳۰m)', callback_url: 'https://api.pulsecore/v1/alerts/inc-99412/ack' },
            { label: 'Silence ۲h', callback_url: 'https://api.pulsecore/v1/silence/quick' },
          ],
        },
      });
    }, 450);
  };

  const getChannelIcon = (type: NotificationChannel['type']) => {
    switch (type) {
      case 'slack':
        return <MessageSquare className="w-5 h-5 text-[#4A154B]" />;
      case 'telegram':
        return <Send className="w-5 h-5 text-[#229ED9]" />;
      case 'pagerduty':
        return <Smartphone className="w-5 h-5 text-[#00A651]" />;
      case 'webhook':
        return <Webhook className="w-5 h-5 text-indigo-400" />;
      case 'email':
        return <Mail className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-indigo-400" />
          <h1 className="text-lg font-bold text-slate-100">
            کانال‌های ارسال اعلان و هشدارهای فوری (Notification Channels & Escalation)
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          ارسال همزمان هشدارهای بحرانی به اسلک، تلگرام، PagerDuty و وب‌هوک اختصاصی با قابلیت پاسخ تعاملی (Interactive Ack)
        </p>
      </div>

      {/* Channel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800/80 space-y-4 hover:border-slate-700/80 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    {getChannelIcon(channel.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-100">{channel.name}</h3>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {channel.type}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleChannel(channel.id)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-all ${
                    channel.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {channel.enabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-400 break-all">
                {channel.destination}
              </div>

              <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                {channel.events.map((ev) => (
                  <span
                    key={ev}
                    className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                  >
                    event:{ev}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">
                Retry: Exponential Backoff (3x)
              </span>

              <button
                onClick={() => handleSendTest(channel)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/80 hover:bg-indigo-600 text-white flex items-center gap-1.5 transition-all shadow"
              >
                <Zap className="w-3.5 h-3.5" />
                ارسال تست زنده
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Escalation Policy Matrix Box */}
      <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800/80 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          ماتریس ارتقای خودکار هشدارها (Escalation Policy & On-Call Routing)
        </h3>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          اگر هشداری با سطح اهمیت <strong className="text-rose-400">CRITICAL</strong> ظرف مدت ۵ دقیقه توسط مهندس کشیک اول (Primary On-Call) تایید (Acknowledge) نشود، سیستم به صورت خودکار سانحه را به لایه دوم (Secondary Team Lead) و در نهایت به مدیر فنی (VP of Engineering) ارتقا می‌دهد.
        </p>
      </div>

      {/* Test Alert Modal */}
      {testPayloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0B0F19] border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  شبیه‌سازی کارت ارسالی به {testPayloadModal.channelName}
                </h3>
              </div>
              <button
                onClick={() => setTestPayloadModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Destination: {testPayloadModal.destination}</span>
                <span className="text-emerald-400">HTTP 200 OK</span>
              </div>

              <div className="p-3 rounded-lg bg-rose-500/10 border-l-4 border-rose-500 text-slate-200 space-y-1">
                <div className="font-bold text-rose-400 text-xs">
                  🔥 [CRITICAL ALERT] - {testPayloadModal.payload.rule}
                </div>
                <div className="text-[11px] text-slate-300">
                  Service: {testPayloadModal.payload.service} | Value: {testPayloadModal.payload.value} (Threshold: {testPayloadModal.payload.threshold})
                </div>
                <div className="text-[10px] text-slate-500 pt-1">
                  Runbook: {testPayloadModal.payload.runbook}
                </div>
              </div>

              <div className="pt-2 text-slate-400 text-[11px]">
                دکمه‌های تعاملی ارسال‌شده در کانال (Interactive Buttons):
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-slate-800 text-white rounded text-[11px] border border-slate-700">
                  Acknowledge (۳۰m)
                </button>
                <button className="px-3 py-1 bg-slate-800 text-white rounded text-[11px] border border-slate-700">
                  Silence ۲h
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setTestPayloadModal(null)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
