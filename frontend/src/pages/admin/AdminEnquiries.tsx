import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, CheckCircle2, MessageSquare, Clock, Eye, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { apiCall } from '@/lib/api';
import { toast } from 'sonner';

type Enquiry = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'read' | 'responded';
  priority: 'low' | 'medium' | 'high';
  response?: string | null;
  respondedAt?: string | null;
  createdAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  new: 'नवीन',
  read: 'वाचले',
  responded: 'उत्तर दिले',
};

const PRIORITY_LABEL: Record<string, string> = {
  low: 'कमी',
  medium: 'मध्यम',
  high: 'उच्च',
};

export default function AdminEnquiries() {
  const qc = useQueryClient();
  const [viewEnquiry, setViewEnquiry] = useState<Enquiry | null>(null);
  const [respondEnquiry, setRespondEnquiry] = useState<Enquiry | null>(null);
  const [responseText, setResponseText] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-enquiries'],
    queryFn: () => apiCall('/admin/enquiries'),
  });

  const enquiries: Enquiry[] = data?.enquiries ?? [];

  const markReadMut = useMutation({
    mutationFn: (id: string) =>
      apiCall(`/admin/enquiries/${id}/mark-read`, { method: 'PATCH' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-enquiries'] });
      toast.success('वाचले म्हणून चिन्हांकित');
    },
    onError: () => toast.error('अद्यतन अयशस्वी'),
  });

  const respondMut = useMutation({
    mutationFn: ({ id, response }: { id: string; response: string }) => {
      if (!response.trim()) {
        throw new Error('उत्तर रिक्त असू शकत नाही');
      }
      return apiCall(`/admin/enquiries/${id}/respond`, {
        method: 'PATCH',
        body: JSON.stringify({ response }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-enquiries'] });
      toast.success('उत्तर पाठवले!');
      setRespondEnquiry(null);
      setResponseText('');
    },
    onError: () => toast.error('उत्तर पाठवणे अयशस्वी'),
  });

  if (isLoading) return <div className="text-center py-8">लोड होत आहे...</div>;
  if (error) return <div className="text-center py-8 text-destructive">चौकशी लोड करता आले नाही</div>;

  const newCount = enquiries.filter((e) => e.status === 'new').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">प्रवेश चौकशी</h1>
          <p className="text-sm text-muted-foreground">
            {newCount > 0 ? `${newCount} नवीन चौकशी आहेत` : 'सर्व चौकशी वाचल्या आहेत'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">एकूण: {enquiries.length}</span>
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewEnquiry} onOpenChange={(o) => !o && setViewEnquiry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>चौकशी तपशील</DialogTitle>
          </DialogHeader>
          {viewEnquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">नाव</p>
                  <p className="font-medium">{viewEnquiry.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">फोन</p>
                  <p className="font-medium">{viewEnquiry.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">ईमेल</p>
                  <p className="font-medium">{viewEnquiry.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">संदेश</p>
                  <p className="leading-relaxed border border-border rounded-lg p-3 bg-secondary/30">
                    {viewEnquiry.message}
                  </p>
                </div>
                {viewEnquiry.response && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">दिलेले उत्तर</p>
                    <p className="leading-relaxed border border-success/40 rounded-lg p-3 bg-success/5 text-success">
                      {viewEnquiry.response}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-xs">तारीख</p>
                  <p className="font-medium">
                    {new Date(viewEnquiry.createdAt).toLocaleDateString('mr-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {viewEnquiry && viewEnquiry.status !== 'responded' && (
              <Button
                onClick={() => {
                  setRespondEnquiry(viewEnquiry);
                  setViewEnquiry(null);
                }}
              >
                <Send className="w-4 h-4 mr-1" /> उत्तर द्या
              </Button>
            )}
            <Button variant="outline" onClick={() => setViewEnquiry(null)}>
              बंद करा
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Respond Dialog */}
      <Dialog open={!!respondEnquiry} onOpenChange={(o) => { if (!o) { setRespondEnquiry(null); setResponseText(''); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>उत्तर द्या — {respondEnquiry?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-secondary/50 text-sm">
              <p className="text-muted-foreground text-xs mb-1">त्यांचा संदेश</p>
              <p>{respondEnquiry?.message}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">आपले उत्तर</label>
              <Textarea
                rows={4}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="पालकांना उत्तर लिहा..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRespondEnquiry(null); setResponseText(''); }}>
              रद्द
            </Button>
            <Button
              onClick={() => respondEnquiry && respondMut.mutate({ id: respondEnquiry._id, response: responseText })}
              disabled={!responseText.trim() || respondMut.isPending}
            >
              <Send className="w-4 h-4 mr-1" /> पाठवा
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* List */}
      <div className="portal-card overflow-x-auto">
        {isLoading && (
          <div className="p-8 text-center text-muted-foreground">लोड होत आहे…</div>
        )}
        {!isLoading && enquiries.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>अद्याप कोणतीही चौकशी नाही</p>
          </div>
        )}
        {!isLoading && enquiries.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left p-3">नाव</th>
                <th className="text-left p-3">फोन</th>
                <th className="text-left p-3">संदेश</th>
                <th className="text-left p-3">प्राधान्य</th>
                <th className="text-left p-3">स्थिती</th>
                <th className="text-left p-3">तारीख</th>
                <th className="text-right p-3 w-32">कृती</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => (
                <tr
                  key={e._id}
                  className={`border-b border-border/50 ${e.status === 'new' ? 'bg-primary/5' : ''}`}
                >
                  <td className="p-3 font-medium">
                    {e.status === 'new' && (
                      <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2" />
                    )}
                    {e.name}
                  </td>
                  <td className="p-3 text-muted-foreground">{e.phone}</td>
                  <td className="p-3 text-muted-foreground max-w-[200px]">
                    <span className="line-clamp-1">{e.message}</span>
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={e.priority === 'high' ? 'destructive' : e.priority === 'medium' ? 'secondary' : 'outline'}
                    >
                      {PRIORITY_LABEL[e.priority]}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        e.status === 'responded'
                          ? 'bg-success/10 text-success'
                          : e.status === 'read'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {STATUS_LABEL[e.status]}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">
                    {new Date(e.createdAt).toLocaleDateString('mr-IN')}
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="पहा"
                      onClick={() => {
                        setViewEnquiry(e);
                        if (e.status === 'new') markReadMut.mutate(e._id);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {e.status !== 'responded' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary"
                        title="उत्तर द्या"
                        onClick={() => {
                          setRespondEnquiry(e);
                          setResponseText('');
                          if (e.status === 'new') markReadMut.mutate(e._id);
                        }}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    )}
                    {e.status === 'responded' && (
                      <CheckCircle2 className="w-4 h-4 text-success inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
