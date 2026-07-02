import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Flag,
  LogOut,
  MessageSquare,
  Package,
  Search,
  Shield,
  Stethoscope,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react';
import {
  approveProduct,
  approveVet,
  deactivateUser,
  getAllAdminVets,
  getAllOrders,
  getAllUsers,
  getAdminDashboard,
  getPendingArticles,
  getPendingProducts,
  getPendingVets,
  getReportedPosts,
  pinPost,
  publishArticle,
  reactivateUser,
  rejectArticle,
  rejectProduct,
  rejectVet,
  removePost,
} from '../../api/admin.api';
import { Badge, Button, Card, Input, Select, Skeleton, Textarea } from '../../components/ui';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatDate, getErrorMessage, getStatusTone, safeArray } from '../../utils/api';

// helpers
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL?.replace('/api', '')) || 'http://localhost:5050';
function imgSrc(path) { if (!path) return null; return path.startsWith('http') ? path : `${API_BASE}${path}`; }
function uid(item) { return item?._id || item?.id; }

// ReasonModal
function ReasonModal({ title, open, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');
  useEffect(() => { if (open) setReason(''); }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
            <h3 className="text-lg font-bold text-slate-950">{title}</h3>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>
        <p className="mb-3 text-sm text-neutral-500">Provide a reason. It will be saved to the record.</p>
        <Textarea rows={3} placeholder="e.g. License number could not be verified..." value={reason} onChange={(e) => setReason(e.target.value)} className="mb-4" />
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1 rounded-md py-2.5 shadow-none" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" className="flex-1 rounded-md py-2.5 shadow-none" loading={loading} onClick={() => onConfirm(reason)}>Confirm Rejection</Button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, color = 'primary' }) {
  const tones = {
    primary: {
      icon: 'bg-blue-50 text-blue-600 ring-blue-100',
      value: 'text-slate-950',
    },
    warning: {
      icon: 'bg-amber-50 text-amber-600 ring-amber-100',
      value: 'text-slate-950',
    },
    danger: {
      icon: 'bg-red-50 text-red-600 ring-red-100',
      value: 'text-slate-950',
    },
    success: {
      icon: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
      value: 'text-slate-950',
    },
    admin: {
      icon: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
      value: 'text-slate-950',
    },
    neutral: {
      icon: 'bg-slate-100 text-slate-600 ring-slate-200',
      value: 'text-slate-950',
    },
  };
  const tone = tones[color] || tones.primary;

  return (
    <Card className="flex min-h-[128px] items-start gap-4 rounded-xl border-slate-200 bg-white p-5 shadow-sm">
      <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${tone.icon}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className={`mt-1 text-4xl font-bold leading-none ${tone.value}`}>{value ?? '-'}</p>
        {sub && <p className="mt-2 text-xs text-slate-500">{sub}</p>}
      </div>
    </Card>
  );
}

function ChartPanel({ title, subtitle, children, className = '' }) {
  return (
    <Card className={`rounded-xl border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      {label && <p className="font-semibold text-slate-900">{label}</p>}
      {payload.map((item) => (
        <p key={item.dataKey || item.name} className="mt-1 text-slate-600">
          <span className="font-medium" style={{ color: item.color }}>{item.name || item.dataKey}</span>: {item.value}
        </p>
      ))}
    </div>
  );
}

function SectionSkeleton({ rows = 3 }) {
  return <div className="space-y-3">{Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>;
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 py-16 text-center">
      {Icon && <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400"><Icon className="h-6 w-6" /></span>}
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}

function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
      <span>Page {page} of {pages}</span>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" className="rounded-md px-2.5 py-2 shadow-none" disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
        <Button size="sm" variant="secondary" className="rounded-md px-2.5 py-2 shadow-none" disabled={page >= pages} onClick={() => onPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function DetailRow({ children, detail }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-start gap-3 p-4">{children}</div>
      {detail && (
        <>
          <button type="button" onClick={() => setOpen((v) => !v)} className="w-full border-t border-slate-100 bg-slate-50 px-4 py-2 text-left text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
            {open ? 'Hide details' : 'Show details'}
          </button>
          {open && <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">{detail}</div>}
        </>
      )}
    </div>
  );
}

// Overview Tab
function OverviewTab({ dashboard, loading }) {
  if (loading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>;
  const s = dashboard?.stats;
  const totalUsers = (s?.users?.petOwners ?? 0) + (s?.users?.vets ?? 0) + (s?.users?.admins ?? 0);
  const totalProducts = s?.products?.total ?? 0;
  const moderationData = [
    { name: 'Vets', value: dashboard?.pendingVetCount ?? 0, fill: '#f59e0b' },
    { name: 'Articles', value: dashboard?.pendingArticleCount ?? 0, fill: '#3b82f6' },
    { name: 'Products', value: dashboard?.pendingProductCount ?? 0, fill: '#8b5cf6' },
    { name: 'Reports', value: dashboard?.reportedPostCount ?? 0, fill: '#ef4444' },
  ];
  const userCompositionData = [
    { name: 'Owners', value: s?.users?.petOwners ?? 0, fill: '#2563eb' },
    { name: 'Vets', value: s?.users?.vets ?? 0, fill: '#10b981' },
    { name: 'Admins', value: s?.users?.admins ?? 0, fill: '#6366f1' },
  ].filter((item) => item.value > 0);
  const appointmentData = Object.entries(s?.appointments ?? {}).map(([status, count]) => ({
    name: status,
    value: count,
    fill: status?.toLowerCase?.().includes('cancel')
      ? '#ef4444'
      : status?.toLowerCase?.().includes('complete')
        ? '#10b981'
        : status?.toLowerCase?.().includes('confirm')
          ? '#6366f1'
          : '#2563eb',
  }));
  const orderData = Object.entries(s?.orders ?? {}).map(([status, count]) => ({
    name: status,
    value: count,
  }));
  const appointmentTone = (status) => {
    const normalized = status?.toLowerCase?.() || '';
    if (normalized.includes('cancel')) return 'danger';
    if (normalized.includes('complete')) return 'success';
    if (normalized.includes('confirm')) return 'admin';
    return 'primary';
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-600">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Moderation Queue
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={Shield}       label="Pending vets"         value={dashboard?.pendingVetCount ?? 0}       sub="Awaiting approval"                                                   color="warning" />
          <MetricCard icon={FileText}     label="Pending articles"     value={dashboard?.pendingArticleCount ?? 0}   sub="Awaiting publication"                                                color="warning" />
          <MetricCard icon={Package}      label="Pending products"     value={dashboard?.pendingProductCount ?? 0}   sub="Awaiting approval"                                                   color="warning" />
          <MetricCard icon={Flag}         label="Reported posts"       value={dashboard?.reportedPostCount ?? 0}     sub="Forum moderation needed"                                             color="danger"  />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartPanel title="Moderation Workload" subtitle="Pending queues by review type">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moderationData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" name="Pending" radius={[8, 8, 0, 0]}>
                  {moderationData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

        <ChartPanel title="User Composition" subtitle={`${totalUsers} total platform accounts`}>
          <div className="h-72">
            {userCompositionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={userCompositionData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
                    {userCompositionData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={Users} message="No user data available." />
            )}
          </div>
          <div className="mt-2 grid gap-2 text-xs text-slate-500">
            {userCompositionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />{item.name}</span>
                <span className="font-semibold text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        </ChartPanel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartPanel title="Appointments by Status" subtitle="Current appointment distribution">
          <div className="h-64">
            {appointmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" name="Appointments" radius={[8, 8, 0, 0]}>
                    {appointmentData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={Calendar} message="No appointment data available." />
            )}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {appointmentData.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-sm font-medium capitalize text-slate-700">{item.name}</span>
                </div>
                <span className="text-lg font-bold text-slate-950">{item.value}</span>
              </div>
            ))}
          </div>
        </ChartPanel>

        <ChartPanel title="Orders by Status" subtitle="Marketplace order distribution">
          <div className="h-64">
            {orderData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" name="Orders" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={ShoppingBag} message="No order data available." />
            )}
          </div>
        </ChartPanel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartPanel title="Quick Figures" subtitle="Core platform counts at a glance">
        <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard icon={Users} label="Total users" value={totalUsers} sub={`${s?.users?.petOwners ?? 0} owners / ${s?.users?.vets ?? 0} vets`} color="admin" />
            <MetricCard icon={Shield} label="Verified vets" value={s?.vets?.verified ?? 0} sub={`${s?.vets?.total ?? 0} total`} color="success" />
            <MetricCard icon={FileText} label="Published articles" value={s?.articles?.published ?? 0} sub="All time" color="success" />
            <MetricCard icon={ShoppingBag} label="Approved products" value={s?.products?.verified ?? 0} sub={`${totalProducts} total products`} color="admin" />
          </div>
        </ChartPanel>

        <ChartPanel title="Admin Focus" subtitle="Most important operational signals right now">
          <div className="space-y-3">
            {[
              { label: 'Highest queue', value: moderationData.reduce((top, item) => (item.value > top.value ? item : top), moderationData[0] || { name: '-', value: 0 }).name, color: 'text-slate-950' },
              { label: 'Queue pressure', value: `${moderationData.reduce((sum, item) => sum + item.value, 0)} items waiting`, color: 'text-slate-950' },
              { label: 'Verified rate', value: totalUsers > 0 ? `${Math.round(((s?.vets?.verified ?? 0) / totalUsers) * 100)}%` : '0%', color: 'text-slate-950' },
              { label: 'Active content', value: `${(s?.articles?.published ?? 0) + (s?.products?.verified ?? 0) + (s?.orders ? Object.values(s.orders).reduce((a, b) => a + b, 0) : 0)} live items`, color: 'text-slate-950' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</p>
                <p className={`mt-1 text-lg font-semibold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </ChartPanel>
      </div>
    </div>
  );
}

// Users Tab
function UsersTab() {
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [data, setData] = useState({ users: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const debRef = useRef(null);

  const fetchUsers = useCallback(async (params) => {
    setLoading(true);
    try {
      const res = await getAllUsers(params);
      const d = res?.data ?? res;
      setData({ users: safeArray(d?.users), total: d?.total ?? 0, page: d?.page ?? 1, pages: d?.pages ?? 1 });
    } catch (e) { addToast(getErrorMessage(e), 'danger'); }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => { setPage(1); fetchUsers({ search, role: role || undefined, page: 1 }); }, 350);
  }, [search, role]); // eslint-disable-line

  useEffect(() => { fetchUsers({ search, role: role || undefined, page }); }, [page]); // eslint-disable-line

  async function handleDeactivate(user) {
    if (!await confirm({ title: 'Deactivate user?', message: `${user.name} won't be able to log in.`, confirmText: 'Deactivate', variant: 'danger' })) return;
    setActionLoading(uid(user) + '-d');
    try { await deactivateUser(uid(user)); addToast('User deactivated', 'success'); fetchUsers({ search, role: role || undefined, page }); }
    catch (e) { addToast(getErrorMessage(e), 'danger'); }
    finally { setActionLoading(null); }
  }

  async function handleReactivate(user) {
    if (!await confirm({ title: 'Reactivate user?', message: `${user.name} will be able to log in again.`, confirmText: 'Reactivate', variant: 'primary' })) return;
    setActionLoading(uid(user) + '-r');
    try { await reactivateUser(uid(user)); addToast('User reactivated', 'success'); fetchUsers({ search, role: role || undefined, page }); }
    catch (e) { addToast(getErrorMessage(e), 'danger'); }
    finally { setActionLoading(null); }
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input placeholder="Search name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} />
        </div>
        <Select value={role} onChange={(e) => setRole(e.target.value)} className="w-40">
          <option value="">All roles</option>
          <option value="petOwner">Pet owners</option>
          <option value="vet">Vets</option>
          <option value="admin">Admins</option>
        </Select>
      </div>
      {loading ? <SectionSkeleton rows={5} /> : data.users.length === 0 ? (
        <EmptyState icon={Users} message="No users found." />
      ) : (
        <>
          <div className="space-y-2">
            {data.users.map((user) => (
              <div key={uid(user)} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3 hover:shadow-sm transition">
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-900 truncate">{user.name}</p>
                  <p className="text-xs text-neutral-500 truncate">{user.email} / <Badge variant={getStatusTone(user.role)}>{user.role}</Badge>{user.isActive === false && <Badge variant="danger" className="ml-1">Deactivated</Badge>}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {user.isActive !== false
                    ? <Button size="sm" variant="secondary" loading={actionLoading === uid(user) + '-d'} onClick={() => handleDeactivate(user)}>Deactivate</Button>
                    : <Button size="sm" loading={actionLoading === uid(user) + '-r'} onClick={() => handleReactivate(user)}>Reactivate</Button>}
                </div>
              </div>
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} onPage={setPage} />
        </>
      )}
    </Card>
  );
}

// Vets Tab
function VetsTab() {
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [pLoading, setPLoading] = useState(true);
  const [aLoading, setALoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [vetSearch, setVetSearch] = useState('');
  const debRef = useRef(null);

  const fetchPending = useCallback(async () => {
    setPLoading(true);
    try { const res = await getPendingVets(); const d = res?.data ?? res; setPending(safeArray(d?.items ?? d)); }
    catch (e) { addToast(getErrorMessage(e), 'danger'); }
    finally { setPLoading(false); }
  }, [addToast]);

  const fetchAll = useCallback(async (search) => {
    setALoading(true);
    try { const res = await getAllAdminVets(search ? { search } : {}); const d = res?.data ?? res; setAll(safeArray(d?.items ?? d)); }
    catch (e) { addToast(getErrorMessage(e), 'danger'); }
    finally { setALoading(false); }
  }, [addToast]);

  useEffect(() => { fetchPending(); fetchAll(''); }, [fetchPending, fetchAll]);

  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => fetchAll(vetSearch), 350);
  }, [vetSearch, fetchAll]);

  async function handleApprove(vet) {
    if (!await confirm({ title: 'Approve vet?', message: `Verify and approve ${vet.name}?`, confirmText: 'Approve', variant: 'primary' })) return;
    setActionLoading(uid(vet) + '-a');
    try { await approveVet(uid(vet)); addToast(`${vet.name} approved!`, 'success'); fetchPending(); fetchAll(vetSearch); }
    catch (e) { addToast(getErrorMessage(e), 'danger'); }
    finally { setActionLoading(null); }
  }

  async function handleRejectConfirm(reason) {
    if (!rejectModal) return;
    setRejectLoading(true);
    try { await rejectVet(uid(rejectModal.vet), reason); addToast('Vet rejected', 'success'); setRejectModal(null); fetchPending(); fetchAll(vetSearch); }
    catch (e) { addToast(getErrorMessage(e), 'danger'); }
    finally { setRejectLoading(false); }
  }

  const VetDetail = ({ vet }) => (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
      {[['License #', vet.licenseNumber], ['Experience', vet.yearsOfExperience ? `${vet.yearsOfExperience} yrs` : null], ['Fee', vet.consultationFee ? formatCurrency(vet.consultationFee) : null], ['Clinic', vet.clinicName], ['Location', vet.location], ['Specialization', vet.specialization], ['Phone', vet.phone], ['Joined', formatDate(vet.createdAt)]].filter(([, v]) => v).map(([label, val]) => (
        <div key={label}><dt className="font-semibold text-neutral-500">{label}</dt><dd className="text-neutral-800">{val}</dd></div>
      ))}
    </dl>
  );

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-display text-xl font-bold text-neutral-900">Pending Verification</h2>
          <Badge variant="warning">{pending.length}</Badge>
        </div>
        {pLoading ? <SectionSkeleton rows={3} /> : pending.length === 0 ? (
          <EmptyState icon={CheckCircle2} message="No pending vet verifications. All caught up." />
        ) : (
          <div className="space-y-3">
            {pending.map((vet) => (
              <DetailRow key={uid(vet)} detail={<VetDetail vet={vet} />}>
                <div className="flex flex-1 items-start justify-between gap-3">
                  <div><p className="font-semibold text-neutral-900">{vet.name}</p><p className="text-xs text-neutral-500">{vet.clinicName || vet.location || 'No clinic'} / {vet.specialization || 'General'}</p></div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" loading={actionLoading === uid(vet) + '-a'} onClick={() => handleApprove(vet)}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => setRejectModal({ vet })}>Reject</Button>
                  </div>
                </div>
              </DetailRow>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-neutral-900">All Vets</h2>
          <div className="w-64"><Input placeholder="Search vets..." value={vetSearch} onChange={(e) => setVetSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} /></div>
        </div>
        {aLoading ? <SectionSkeleton rows={4} /> : all.length === 0 ? <EmptyState icon={Shield} message="No vets found." /> : (
          <div className="space-y-2">
            {all.map((vet) => (
              <div key={uid(vet)} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 hover:shadow-sm transition">
                <div><p className="font-semibold text-neutral-900">{vet.name}</p><p className="text-xs text-neutral-500">{vet.clinicName || vet.location} / {vet.licenseNumber || 'No license'}</p></div>
                <Badge variant={vet.isVerified ? 'success' : 'warning'}>{vet.isVerified ? 'Verified' : 'Pending'}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ReasonModal title={`Reject ${rejectModal?.vet?.name}?`} open={!!rejectModal} onClose={() => setRejectModal(null)} onConfirm={handleRejectConfirm} loading={rejectLoading} />
    </div>
  );
}

// Articles Tab
function ArticlesTab() {
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try { const res = await getPendingArticles(); const d = res?.data ?? res; setArticles(safeArray(d?.items ?? d)); }
    catch (e) { addToast(getErrorMessage(e), 'danger'); }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  async function handlePublish(article) {
    if (!await confirm({ title: 'Publish article?', message: `"${article.title}" will be visible to all users.`, confirmText: 'Publish', variant: 'primary' })) return;
    setActionLoading(uid(article) + '-p');
    try { await publishArticle(uid(article)); addToast('Article published!', 'success'); fetchArticles(); }
    catch (e) { addToast(getErrorMessage(e), 'danger'); }
    finally { setActionLoading(null); }
  }

  async function handleRejectConfirm(reason) {
    if (!rejectModal) return;
    setRejectLoading(true);
    try { await rejectArticle(uid(rejectModal.article), reason); addToast('Article rejected', 'success'); setRejectModal(null); fetchArticles(); }
    catch (e) { addToast(getErrorMessage(e), 'danger'); }
    finally { setRejectLoading(false); }
  }

  const ArticleDetail = ({ article }) => (
    <div className="space-y-2 text-sm">
      {article.summary && <p className="text-neutral-600 leading-relaxed">{article.summary.slice(0, 300)}{article.summary.length > 300 ? '...' : ''}</p>}
      <div className="flex flex-wrap gap-2">{article.category && <Badge variant="neutral">{article.category}</Badge>}{safeArray(article.tags).map((t) => <Badge key={t} variant="neutral">#{t}</Badge>)}</div>
      <p className="text-neutral-400">Submitted: {formatDate(article.createdAt)}</p>
    </div>
  );

  return (
    <>
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-3"><h2 className="font-display text-xl font-bold text-neutral-900">Pending Articles</h2><Badge variant="warning">{articles.length}</Badge></div>
        {loading ? <SectionSkeleton rows={3} /> : articles.length === 0 ? (
          <EmptyState icon={FileText} message="No articles pending review." />
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <DetailRow key={uid(article)} detail={<ArticleDetail article={article} />}>
                <div className="flex flex-1 items-start justify-between gap-3">
                  <div className="min-w-0"><p className="font-semibold text-neutral-900 truncate">{article.title}</p><p className="text-xs text-neutral-500">by {article.author?.name || article.authorName || 'Unknown'}</p></div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" loading={actionLoading === uid(article) + '-p'} onClick={() => handlePublish(article)}>Publish</Button>
                    <Button size="sm" variant="danger" onClick={() => setRejectModal({ article })}>Reject</Button>
                  </div>
                </div>
              </DetailRow>
            ))}
          </div>
        )}
      </Card>
      <ReasonModal title={`Reject "${rejectModal?.article?.title}"?`} open={!!rejectModal} onClose={() => setRejectModal(null)} onConfirm={handleRejectConfirm} loading={rejectLoading} />
    </>
  );
}

// Products Tab
function ProductsTab() {
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try { const res = await getPendingProducts(); const d = res?.data ?? res; setProducts(safeArray(d?.items ?? d)); }
    catch (e) { addToast(getErrorMessage(e), 'danger'); }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function handleApprove(product) {
    if (!await confirm({ title: 'Approve product?', message: `"${product.name}" will appear in the marketplace.`, confirmText: 'Approve', variant: 'primary' })) return;
    setActionLoading(uid(product) + '-a');
    try { await approveProduct(uid(product)); addToast('Product approved!', 'success'); fetchProducts(); }
    catch (e) { addToast(getErrorMessage(e), 'danger'); }
    finally { setActionLoading(null); }
  }

  async function handleRejectConfirm(reason) {
    if (!rejectModal) return;
    setRejectLoading(true);
    try { await rejectProduct(uid(rejectModal.product), reason); addToast('Product rejected', 'success'); setRejectModal(null); fetchProducts(); }
    catch (e) { addToast(getErrorMessage(e), 'danger'); }
    finally { setRejectLoading(false); }
  }

  const ProductDetail = ({ product }) => (
    <div className="flex gap-4 text-sm">
      {product.images?.[0] && <img src={imgSrc(product.images[0])} alt={product.name} className="h-20 w-20 shrink-0 rounded-lg object-cover border border-neutral-200" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
      <div className="space-y-1.5 min-w-0">
        {product.description && <p className="text-neutral-600 leading-relaxed line-clamp-3">{product.description}</p>}
        <div className="flex flex-wrap gap-1.5">{product.category && <Badge variant="neutral">{product.category}</Badge>}{safeArray(product.petType).map((pt) => <Badge key={pt} variant="primary">{pt}</Badge>)}</div>
        <p className="text-neutral-400 text-xs">Seller: <span className="font-mono">{product.sellerId?.toString?.() || product.sellerId}</span></p>
        <p className="text-neutral-400">Stock: {product.stock} / {formatCurrency(product.price)}</p>
      </div>
    </div>
  );

  return (
    <>
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-3"><h2 className="font-display text-xl font-bold text-neutral-900">Pending Products</h2><Badge variant="warning">{products.length}</Badge></div>
        {loading ? <SectionSkeleton rows={3} /> : products.length === 0 ? (
          <EmptyState icon={Package} message="No products awaiting approval." />
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <DetailRow key={uid(product)} detail={<ProductDetail product={product} />}>
                <div className="flex flex-1 items-start justify-between gap-3">
                  <div className="min-w-0"><p className="font-semibold text-neutral-900 truncate">{product.name}</p><p className="text-xs text-neutral-500">{formatCurrency(product.price)} / {product.category}</p></div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" loading={actionLoading === uid(product) + '-a'} onClick={() => handleApprove(product)}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => setRejectModal({ product })}>Reject</Button>
                  </div>
                </div>
              </DetailRow>
            ))}
          </div>
        )}
      </Card>
      <ReasonModal title={`Reject "${rejectModal?.product?.name}"?`} open={!!rejectModal} onClose={() => setRejectModal(null)} onConfirm={handleRejectConfirm} loading={rejectLoading} />
    </>
  );
}

// Forum Tab
function ForumTab() {
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try { const res = await getReportedPosts(); const d = res?.data ?? res; setPosts(safeArray(d?.items ?? d)); }
    catch (e) { addToast(getErrorMessage(e), 'danger'); }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function handlePin(post) {
    setActionLoading(uid(post) + '-pin');
    try { await pinPost(uid(post)); addToast('Post pinned', 'success'); fetchPosts(); }
    catch (e) { addToast(getErrorMessage(e), 'danger'); }
    finally { setActionLoading(null); }
  }

  async function handleRemove(post) {
    if (!await confirm({ title: 'Remove post?', message: `"${post.title || 'This post'}" will be permanently deleted.`, confirmText: 'Remove', variant: 'danger' })) return;
    setActionLoading(uid(post) + '-remove');
    try { await removePost(uid(post)); addToast('Post removed', 'success'); fetchPosts(); }
    catch (e) { addToast(getErrorMessage(e), 'danger'); }
    finally { setActionLoading(null); }
  }

  const PostDetail = ({ post }) => (
    <div className="space-y-2 text-sm">
      {post.body && <p className="text-neutral-600 leading-relaxed">{post.body.slice(0, 300)}{post.body.length > 300 ? '...' : ''}</p>}
      <div className="flex flex-wrap gap-3 text-neutral-400">
        {post.reportCount != null && <span>🚩 {post.reportCount} report{post.reportCount !== 1 ? 's' : ''}</span>}
        {post.reportReason && <span>Reason: {post.reportReason}</span>}
        <span>Posted: {formatDate(post.createdAt)}</span>
      </div>
    </div>
  );

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-3"><h2 className="font-display text-xl font-bold text-neutral-900">Reported Forum Posts</h2><Badge variant="danger">{posts.length}</Badge></div>
      {loading ? <SectionSkeleton rows={3} /> : posts.length === 0 ? (
        <EmptyState icon={MessageSquare} message="No reported posts." />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <DetailRow key={uid(post)} detail={<PostDetail post={post} />}>
              <div className="flex flex-1 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-900 truncate">{post.title || 'Untitled post'}</p>
                  <p className="text-xs text-neutral-500">by {post.author?.name || 'Member'}{post.reportCount != null && <span className="ml-2 text-red-500">🚩 {post.reportCount}</span>}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="secondary" loading={actionLoading === uid(post) + '-pin'} onClick={() => handlePin(post)}>{post.isPinned ? 'Unpin' : 'Pin'}</Button>
                  <Button size="sm" variant="danger" loading={actionLoading === uid(post) + '-remove'} onClick={() => handleRemove(post)}>Remove</Button>
                </div>
              </div>
            </DetailRow>
          ))}
        </div>
      )}
    </Card>
  );
}

// Orders Tab
function OrdersTab() {
  const { addToast } = useToast();
  const [data, setData] = useState({ orders: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async (params) => {
    setLoading(true);
    try { const res = await getAllOrders(params); const d = res?.data ?? res; setData({ orders: safeArray(d?.orders), total: d?.total ?? 0, page: d?.page ?? 1, pages: d?.pages ?? 1 }); }
    catch (e) { addToast(getErrorMessage(e), 'danger'); }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { setPage(1); fetchOrders({ status: status || undefined, page: 1 }); }, [status]); // eslint-disable-line
  useEffect(() => { fetchOrders({ status: status || undefined, page }); }, [page]); // eslint-disable-line

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><h2 className="font-display text-xl font-bold text-neutral-900">Orders</h2><Badge variant="neutral">{data.total} total</Badge></div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>
      <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        Orders are view-only. Refund/dispute management requires new backend endpoints.
      </div>
      {loading ? <SectionSkeleton rows={5} /> : data.orders.length === 0 ? (
        <EmptyState icon={ShoppingBag} message="No orders found." />
      ) : (
        <>
          <div className="space-y-2">
            {data.orders.map((order) => (
              <div key={uid(order)} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3 hover:shadow-sm transition">
                <div>
                  <p className="font-semibold text-neutral-900">Order #{order.orderNumber || uid(order)?.slice(-6)}</p>
                  <p className="text-xs text-neutral-500">{formatDate(order.createdAt)} / {order.items?.length ?? 0} item(s) / {formatCurrency(order.totalAmount ?? order.total ?? 0)}</p>
                </div>
                <Badge variant={getStatusTone(order.status)}>{order.status || 'pending'}</Badge>
              </div>
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} onPage={setPage} />
        </>
      )}
    </Card>
  );
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'vets', label: 'Vets', icon: Stethoscope },
  { id: 'articles', label: 'Articles', icon: FileText },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'forum', label: 'Forum', icon: MessageSquare },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
];

function AdminTopBar({ user, onLogout }) {
  const initial = (user?.name || user?.email || 'Admin').trim().charAt(0).toUpperCase() || 'A';

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-slate-100 bg-white">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="PetSneha Logo" className="h-9 w-auto object-contain" />
          <span className="text-[22px] font-bold leading-none text-[#0046CE]" style={{ fontFamily: 'Literata, serif' }}>
            PetSneha
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700">
            {initial}
          </span>
          <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-red-200 hover:text-red-600">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

function AdminSidebar({ activeTab, onChange }) {
  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-slate-100 bg-white">
      <nav className="flex h-full flex-col gap-1 px-4 py-6" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`relative flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors ${
                active ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {active && <span className="absolute left-0 top-2 h-7 w-1 rounded-r-full bg-blue-600" />}
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default function AdminDashboardPage() {
  const { addToast } = useToast();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashLoading, setDashLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [visited, setVisited] = useState(new Set(['overview']));

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setVisited((prev) => new Set([...prev, tabId]));
  }

  function handleLogout() {
    const loginPath = logout();
    navigate(loginPath, { replace: true });
  }

  useEffect(() => {
    (async () => {
      setDashLoading(true);
      try { const res = await getAdminDashboard(); const d = res?.data ?? res; setDashboard(d); }
      catch (e) { addToast(getErrorMessage(e), 'danger'); }
      finally { setDashLoading(false); }
    })();
  }, [addToast]);


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminTopBar user={user} onLogout={handleLogout} />
      <AdminSidebar activeTab={activeTab} onChange={handleTabChange} />

      <main className="ml-64 pt-16">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-slate-950">Admin Panel</h1>
            <p className="mt-2 text-sm text-slate-500">Manage users, content, products, and platform health.</p>
          </div>

          <div>
            {activeTab === 'overview'  && <OverviewTab  dashboard={dashboard} loading={dashLoading} />}
            {activeTab === 'users'     && visited.has('users')     && <UsersTab />}
            {activeTab === 'vets'      && visited.has('vets')      && <VetsTab />}
            {activeTab === 'articles'  && visited.has('articles')  && <ArticlesTab />}
            {activeTab === 'products'  && visited.has('products')  && <ProductsTab />}
            {activeTab === 'forum'     && visited.has('forum')     && <ForumTab />}
            {activeTab === 'orders'    && visited.has('orders')    && <OrdersTab />}
          </div>
        </div>
      </main>
    </div>
  );
}
