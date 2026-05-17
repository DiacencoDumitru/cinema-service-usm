import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { formatCountdown, useLockCountdown } from '../hooks/useLockCountdown';
import { useBookingDraftStore } from '../stores/bookingDraftStore';

export function LockCountdownBanner() {
  const { t } = useTranslation('booking');
  const lockExpiresAt = useBookingDraftStore((s) => s.lockExpiresAt);
  const clearSelection = useBookingDraftStore((s) => s.clearSelection);
  const setLockExpiresAt = useBookingDraftStore((s) => s.setLockExpiresAt);
  const secondsLeft = useLockCountdown(lockExpiresAt);
  const nav = useNavigate();
  const { screeningId: sid } = useParams();
  const screeningId = Number(sid);

  useEffect(() => {
    if (secondsLeft !== 0 || !lockExpiresAt) return;
    toast.error(t('lockExpired'));
    clearSelection();
    setLockExpiresAt(null);
    if (Number.isFinite(screeningId)) {
      nav(`/rezervare/${screeningId}`, { replace: true });
    }
  }, [secondsLeft, lockExpiresAt, clearSelection, setLockExpiresAt, nav, screeningId, t]);

  if (!lockExpiresAt || secondsLeft === null) return null;

  return (
    <div
      className={`rounded-lg border px-4 py-2 text-sm ${
        secondsLeft < 60
          ? 'border-amber-600 bg-amber-950/40 text-amber-200'
          : 'border-slate-700 bg-slate-900 text-slate-300'
      }`}
    >
      {t('lockCountdown', { time: formatCountdown(secondsLeft) })}
    </div>
  );
}
