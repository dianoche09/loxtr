import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mail, FileText, X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

type TabType = 'contact' | 'newsletter' | 'application';

interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
    message: string;
    page: string;
    created_at: string;
}

interface NewsletterSubscription {
    id: string;
    email: string;
    page: string;
    created_at: string;
}

interface ApplicationSubmission {
    id: string;
    name: string;
    email: string;
    company: string;
    phone?: string;
    country?: string;
    industry?: string;
    application_type: string;
    message?: string;
    page: string;
    created_at: string;
}

type Submission = ContactSubmission | NewsletterSubscription | ApplicationSubmission;

const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
    { key: 'contact', label: 'Contact Forms', icon: MessageSquare },
    { key: 'newsletter', label: 'Newsletter', icon: Mail },
    { key: 'application', label: 'Applications', icon: FileText },
];

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function SubmissionsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('contact');
    const [data, setData] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selected, setSelected] = useState<Submission | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/admin/submissions?type=${activeTab}&page=${page}&limit=20`);
            if (!response.ok) throw new Error('Failed to fetch');
            const result = await response.json();
            setData(result.data);
            setTotalPages(result.totalPages);
            setTotal(result.total);
        } catch (err: any) {
            console.error('Submissions fetch error:', err);
            setError('Failed to load. Supabase may be paused.');
        } finally {
            setLoading(false);
        }
    }, [activeTab, page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setPage(1);
        setSelected(null);
    }, [activeTab]);

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-100 p-1.5 shadow-sm w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all
                            ${activeTab === tab.key
                                ? 'bg-navy text-white shadow-md'
                                : 'text-slate-500 hover:text-navy hover:bg-slate-50'}`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
                <button
                    onClick={fetchData}
                    className="ml-2 p-2.5 text-slate-400 hover:text-navy rounded-lg hover:bg-slate-50 transition-colors"
                    title="Refresh"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Count */}
            <p className="text-sm text-slate-500">
                {total} total {activeTab === 'newsletter' ? 'subscribers' : 'submissions'}
            </p>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <RefreshCw size={24} className="animate-spin text-slate-400" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-slate-400">
                        No submissions yet
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    {activeTab === 'newsletter' ? (
                                        <>
                                            <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Email</th>
                                            <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Source</th>
                                            <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Name</th>
                                            <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Email</th>
                                            <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">
                                                {activeTab === 'application' ? 'Company' : 'Message'}
                                            </th>
                                            <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => setSelected(item)}
                                        className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                                    >
                                        {activeTab === 'newsletter' ? (
                                            <>
                                                <td className="p-4 text-sm font-medium text-navy">{(item as NewsletterSubscription).email}</td>
                                                <td className="p-4 text-sm text-slate-500">{item.page || '-'}</td>
                                                <td className="p-4 text-sm text-slate-400">{formatDate(item.created_at)}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-4 text-sm font-medium text-navy">{'name' in item ? item.name : '-'}</td>
                                                <td className="p-4 text-sm text-slate-500">{item.email}</td>
                                                <td className="p-4 text-sm text-slate-500 max-w-xs truncate">
                                                    {activeTab === 'application'
                                                        ? ('company' in item ? item.company : '-')
                                                        : ('message' in item ? (item.message as string)?.slice(0, 60) + ((item.message as string)?.length > 60 ? '...' : '') : '-')}
                                                </td>
                                                <td className="p-4 text-sm text-slate-400">{formatDate(item.created_at)}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-100">
                        <p className="text-sm text-slate-500">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelected(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-navy">
                                    {activeTab === 'newsletter' ? 'Subscriber' : activeTab === 'application' ? 'Application' : 'Contact'} Details
                                </h3>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <DetailRow label="Date" value={formatDate(selected.created_at)} />
                                {'email' in selected && <DetailRow label="Email" value={selected.email} />}
                                {'name' in selected && (selected as any).name && <DetailRow label="Name" value={(selected as any).name} />}
                                {'company' in selected && (selected as any).company && <DetailRow label="Company" value={(selected as any).company} />}
                                {'phone' in selected && (selected as any).phone && <DetailRow label="Phone" value={(selected as any).phone} />}
                                {'country' in selected && (selected as any).country && <DetailRow label="Country" value={(selected as any).country} />}
                                {'industry' in selected && (selected as any).industry && <DetailRow label="Industry" value={(selected as any).industry} />}
                                {'application_type' in selected && <DetailRow label="Type" value={(selected as ApplicationSubmission).application_type} />}
                                {'message' in selected && (selected as any).message && (
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Message</p>
                                        <p className="text-sm text-navy whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">
                                            {(selected as any).message}
                                        </p>
                                    </div>
                                )}
                                <DetailRow label="Source Page" value={selected.page || 'Unknown'} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-0.5">{label}</p>
            <p className="text-sm text-navy">{value}</p>
        </div>
    );
}
