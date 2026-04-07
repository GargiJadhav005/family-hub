import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Mail, Megaphone, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiCall } from '@/lib/api';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiCall('/admin/dashboard'),
  });

  const statCards = [
    { label: 'एकूण वापरकर्ते', value: stats?.totalUsers ?? '—', icon: Users, color: 'text-primary' },
    { label: 'शिक्षक', value: stats?.teachers ?? '—', icon: Users, color: 'text-success' },
    { label: 'विद्यार्थी', value: stats?.students ?? '—', icon: Users, color: 'text-warning' },
    { label: 'पालक', value: stats?.parents ?? '—', icon: Users, color: 'text-primary' },
    { label: 'नवीन प्रश्न', value: stats?.newEnquiries ?? '—', icon: HelpCircle, color: 'text-destructive' },
    { label: 'घोषणा', value: stats?.totalAnnouncements ?? '—', icon: Megaphone, color: 'text-success' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">व्यवस्थापक डॅशबोर्ड</h1>
        <p className="text-muted-foreground">वैनतेय प्राथमिक विद्या मंदिर — प्रणाली अवलोकन</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="stat-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${card.color} opacity-20`} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="portal-card p-6">
        <h2 className="text-lg font-semibold mb-4">व्यवस्थापन टूल्स</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button variant="outline" className="justify-start gap-2"><Users className="w-4 h-4" /> वापरकर्ते व्यवस्थापित करा</Button>
          <Button variant="outline" className="justify-start gap-2"><Megaphone className="w-4 h-4" /> घोषणा तयार करा</Button>
          <Button variant="outline" className="justify-start gap-2"><Mail className="w-4 h-4" /> प्रश्नांची उत्तरे द्या</Button>
        </div>
      </div>
    </div>
  );
}