'use client';

import { cn } from 'cn';
import { LiquidGlass } from '@/components/common/LiquidGlass';
import { MarqueeText } from '@/components/common/MarqueeText';
import { useMessageBox } from '@/hooks/useMessageBox';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Locale } from '@/i18n/config';
import { useWeatherTime } from '../../../hooks/useWeatherTime';
import { getTranslator } from '../../../i18n';
import type { WeatherAlert } from '../../../types';

const severityGradients: Record<WeatherAlert['severity'], string> = {
  minor: 'bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,119,255,0.6),transparent_70%)]',
  moderate: 'bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,214,0,0.6),transparent_70%)]',
  severe: 'bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,106,0,0.6),transparent_70%)]',
  extreme: 'bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,38,59,0.6),transparent_70%)]',
  unknown: 'bg-[radial-gradient(ellipse_at_bottom_right,rgba(148,163,184,0.35),transparent_70%)]',
};

const colorGradients: Record<Exclude<WeatherAlert['color'], 'unknown'>, string> = {
  white: 'bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.45),transparent_70%)]',
  gray: severityGradients.unknown,
  green: 'bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,230,118,0.6),transparent_70%)]',
  blue: severityGradients.minor,
  yellow: severityGradients.moderate,
  amber: 'bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,179,0,0.6),transparent_70%)]',
  orange: severityGradients.severe,
  red: severityGradients.extreme,
  purple: 'bg-[radial-gradient(ellipse_at_bottom_right,rgba(192,38,255,0.6),transparent_70%)]',
  black: 'bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,0,0,0.7),transparent_70%)]',
};

function timestamp(value: string | null) {
  const time = value ? Date.parse(value) : NaN;

  return Number.isFinite(time) ? time : null;
}

export function WeatherAlerts({ alerts, locale }: { alerts: WeatherAlert[]; locale: Locale }) {
  const t = getTranslator(locale);
  const now = useWeatherTime(alerts.length > 0);
  const messageBox = useMessageBox();
  const active = alerts.filter((alert) => {
    const start = timestamp(alert.effectiveAt);
    const deadlines = [timestamp(alert.expiresAt), timestamp(alert.endsAt)];

    return now === null || ((start === null || start <= now) && deadlines.every((end) => end === null || end > now));
  });
  const latest = active[0];
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' });

  function showAlerts() {
    void messageBox.alert({
      title: t('alerts'),
      confirm: null,
      size: { width: 640 },
      content: (
        <ScrollArea className="max-h-[calc(75dvh-6rem)] min-h-0 min-w-0 [&>[data-slot=scroll-area-viewport]]:max-h-[inherit]">
          <div className="flex min-w-0 flex-col gap-4 text-white">
            {active.length === 0 && <p className="text-sm text-white/70">{t('alertDetails.empty')}</p>}
            {active.map((alert) => (
              <article
                key={alert.id}
                className={cn(
                  'flex min-w-0 flex-col gap-4 rounded-2xl bg-white/5 p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]',
                  alert.color && alert.color !== 'unknown'
                    ? colorGradients[alert.color]
                    : severityGradients[alert.severity],
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="min-w-0 text-base font-semibold wrap-break-word">{alert.title}</h3>
                  <span className="shrink-0 pt-0.5 text-xs text-white/70">
                    {alert.color && alert.color !== 'unknown'
                      ? t(`alertDetails.color.${alert.color}`)
                      : t(`alertDetails.severity.${alert.severity}`)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
                  {alert.source && <span>{alert.source}</span>}
                  {timestamp(alert.issuedAt) !== null && (
                    <span>{t('alertDetails.issuedAt', { time: formatter.format(timestamp(alert.issuedAt)!) })}</span>
                  )}
                </div>
                {alert.description && (
                  <p className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap text-white/80">
                    {alert.description}
                  </p>
                )}
                {alert.instructions && alert.instructions !== alert.description && (
                  <p className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap text-white/80">
                    {alert.instructions}
                  </p>
                )}
              </article>
            ))}
          </div>
        </ScrollArea>
      ),
    });
  }

  if (!latest) {
    return null;
  }

  return (
    <button
      type="button"
      className="group/alert max-w-[75%] min-w-0 cursor-pointer rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      aria-label={t('alertDetails.open', { title: latest.title })}
      aria-haspopup="dialog"
      onClick={showAlerts}
    >
      <LiquidGlass variant="glass" className="min-w-0 rounded-xl" contentClassName="px-3 py-1.5 text-sm font-normal">
        <MarqueeText
          text={latest.title}
          animationClassName="group-hover/alert:animate-marquee group-focus-visible/alert:animate-marquee"
        />
      </LiquidGlass>
    </button>
  );
}
