import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Mail, Megaphone, HelpCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiCall } from '@/lib/api';

interface DashboardStats {
  totalUsers: number;
  teachers: number;
  students: number;
  parents: number;
  newEnquiries: number;
  totalAnnouncements: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiCall('/admin/dashboard') as Promise<DashboardStats>,
  });

  const statCards = [
    {
      label: 'एकूण वापरकर्ते',
      value: stats?.totalUsers ?? '—',
      icon: Users,
      color: 'text-blue-500',
      subtext: 'वर्ण पद्धति',
    },
    {
      label: 'शिक्षक',
      value: stats?.teachers ?? '—',
      icon: Users,
      color: 'text-green-500',
      subtext: 'सक्रिय शिक्षक',
    },
    {
      label: 'विद्यार्थी',
      value: stats?.students ?? '—',
      icon: Users,
      color: 'text-purple-500',
      subtext: 'नोंदणी केलेले',
    },
    {
      label: 'पालक',
      value: stats?.parents ?? '—',
      icon: Users,
      color: 'text-orange-500',
      subtext: 'जोडलेले खाते',
    },
    {
      label: 'नवीन प्रश्न',
      value: stats?.newEnquiries ?? '—',
      icon: HelpCircle,
      color: 'text-red-500',
      subtext: 'असाधारण',
    },
    {
      label: 'घोषणाएं',
      value: stats?.totalAnnouncements ?? '—',
      icon: Megaphone,
      color: 'text-indigo-500',
      subtext: 'सक्रिय',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">व्यवस्थापक डॅशबोर्ड</h1>
        <p className="text-muted-foreground">
          आपल्या स्कूलचे प्रणाली अवलोकन पहा
        </p>
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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg border border-border/60 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${card.color}`}>
                      {card.value}
                    </p>
                  </div>
                  <Icon className={`w-8 h-8 ${card.color} opacity-20`} />
                </div>
                <p className="text-xs text-muted-foreground">{card.subtext}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-lg border border-border/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">व्यवस्थापन टूलस</h2>
            <p className="text-sm text-muted-foreground">वापरकर्ते, घोषणाएं आणि अधिक प्रबंधित करा</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button variant="outline" className="justify-start gap-2">
            <Users className="w-4 h-4" />
            वापरकर्ते व्यवस्थापित करा
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <Megaphone className="w-4 h-4" />
            घोषणाएं तयार करा
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <Mail className="w-4 h-4" />
            प्रश्नांची उत्तरे द्या
          </Button>
        </div>
      </div>
    </div>
  );
}
