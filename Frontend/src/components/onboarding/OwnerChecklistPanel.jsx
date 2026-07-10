import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { getChecklist, updateChecklist } from '../../api/user.api';
import { getErrorMessage, unwrapItem } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';

const checklistItems = [
  { key: 'sleepingArea', label: 'Set up a safe sleeping area', note: 'Create a quiet spot with a clean bed.' },
  { key: 'food', label: 'Buy age-appropriate food', note: 'Stock food that matches your pet’s age and size.' },
  { key: 'vetVisit', label: 'Schedule first vet visit', note: 'Book a health check and vaccinations early.' },
  { key: 'groomingTools', label: 'Purchase basic grooming tools', note: 'Keep a brush, nail clipper, and shampoo ready.' },
];

export default function OwnerChecklistPanel({ variant = 'compact' }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [checklist, setChecklist] = useState({
    sleepingArea: false,
    food: false,
    vetVisit: false,
    groomingTools: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await getChecklist();
        const checklistData = unwrapItem(response, 'checklist');
        setChecklist((previous) => ({ ...previous, ...(checklistData || {}) }));
      } catch (apiError) {
        addToast(getErrorMessage(apiError), 'danger');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [addToast]);

  const handleToggle = async (key) => {
    // Once checked, it stays checked — no unchecking allowed
    if (checklist[key]) return;

    const nextChecklist = { ...checklist, [key]: true };
    setChecklist(nextChecklist);
    setSavingKey(key);

    try {
      const response = await updateChecklist(nextChecklist);
      const checklistData = unwrapItem(response, 'checklist');
      if (checklistData) {
        setChecklist((previous) => ({ ...previous, ...checklistData }));
      }
    } catch (apiError) {
      setChecklist((previous) => ({ ...previous, [key]: false }));
      addToast(getErrorMessage(apiError), 'danger');
    } finally {
      setSavingKey(null);
    }
  };

  const completedCount = checklistItems.filter((item) => checklist[item.key]).length;
  const progressLabel = `${completedCount} ${t('checklist.of', 'of')} ${checklistItems.length} ${t('checklist.done', 'done')}`;

  return (
    <div className={variant === 'full' ? 'bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm h-full flex flex-col' : 'rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm h-full flex flex-col'}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-[#64748B]">{t('checklist.essentials', 'ESSENTIALS')}</div>
          <h2 className="mt-1 text-base font-semibold text-[#1E293B]" style={{ fontFamily: 'Literata, serif' }}>{t('checklist.title', 'New Owner Checklist')}</h2>
          <p className="mt-1 text-sm text-[#64748B]">{variant === 'full' ? t('checklist.descFull', 'Track the first four things every new pet parent should handle.') : t('checklist.descCompact', 'Make sure you have the basics covered for your new furry friend.')}</p>
        </div>
        <div className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#0046CE]">{loading ? t('common.loading', 'Loading') : progressLabel}</div>
      </div>

      <div className="mt-4 space-y-2">
        {checklistItems.slice(0, variant === 'compact' ? 2 : 4).map((item) => {
          const checked = Boolean(checklist[item.key]);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleToggle(item.key)}
              disabled={savingKey === item.key || checked}
              className={`flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition ${
                checked ? 'border-green-200 bg-green-50' : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
              } ${savingKey === item.key ? 'opacity-70' : ''}`}
            >
              {checked ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" /> : <Circle className="mt-0.5 h-4 w-4 text-[#CBD5E1]" />}
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-medium ${checked ? 'text-[#166534]' : 'text-[#1E293B]'}`}>{t(`checklist.${item.key}Label`, item.label)}</div>
                <div className="mt-0.5 text-xs text-[#64748B]">{t(`checklist.${item.key}Note`, item.note)}</div>
              </div>
              {savingKey === item.key ? <span className="text-[10px] font-semibold uppercase tracking-wide text-[#0046CE]">{t('checklist.saving', 'Saving')}</span> : null}
            </button>
          );
        })}
      </div>

      {variant === 'compact' && (
        <button
          type="button"
          onClick={() => navigate('/onboarding')}
          className="mt-5 text-sm font-medium text-[#0046CE] flex items-center gap-1 hover:gap-2 transition-all"
        >
          {t('checklist.viewFull', 'View Full Checklist')} <ArrowRight className="h-4 w-4" />
        </button>
      )}
      {variant === 'full' ? <p className="mt-4 text-xs text-[#64748B]">{t('checklist.progressSaved', 'Progress is saved to your account, so it will still be here after refresh.')}</p> : null}
    </div>
  );
}