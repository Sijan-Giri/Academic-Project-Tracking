import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Download, FileText, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await api.get(`/projects/${id}`);
      return res.data;
    },
  });

  if (isLoading) return <div className="p-8 text-white">Loading project details...</div>;
  if (!project) return <div className="p-8 text-white">Project not found.</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1a1d27] p-6 rounded-xl border border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{project.title}</h1>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-indigo-400 border-indigo-500/30 bg-indigo-500/10">
              {project.domain}
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              {project.status}
            </Badge>
          </div>
        </div>
        {project.githubUrl && (
          <Button variant="outline" className="border-white/10 hover:bg-white/5" asChild>
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" /> Repository
            </a>
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-[#1a1d27] border-white/10 w-full justify-start rounded-xl p-1 h-auto mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2.5 px-6 rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="milestones" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2.5 px-6 rounded-lg">Milestones</TabsTrigger>
          <TabsTrigger value="submissions" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2.5 px-6 rounded-lg">Submissions</TabsTrigger>
          <TabsTrigger value="evaluations" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-2.5 px-6 rounded-lg">Evaluations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-[#1a1d27] border-white/10 text-white">
              <CardHeader>
                <CardTitle>Abstract</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{project.abstract || 'No abstract provided.'}</p>
                {project.keywords && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {project.keywords.map((kw: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-[#0f1117] text-gray-300 hover:bg-white/10">{kw}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-[#1a1d27] border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Team Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="font-medium text-indigo-400 pb-2 border-b border-white/10">{project.team?.name}</div>
                  {project.team?.members?.map((m: any) => (
                    <div key={m.id} className="flex justify-between items-center">
                      <span>{m.user?.name}</span>
                      {m.role === 'LEADER' && <Badge variant="outline" className="text-xs border-indigo-500/50 text-indigo-300">Leader</Badge>}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-[#1a1d27] border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Guide Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {project.guide ? (
                    <div>
                      <p className="font-medium">{project.guide.name}</p>
                      <p className="text-sm text-gray-400">{project.guide.designation}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No guide assigned yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="mt-0">
          <Card className="bg-[#1a1d27] border-white/10 text-white">
            <CardHeader><CardTitle>Project Milestones</CardTitle></CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">Tracking progress through defined stages.</p>
              {/* Display milestones timeline/list here */}
              <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-lg">
                Milestones tracking feature is pending integration.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="mt-0">
          <Card className="bg-[#1a1d27] border-white/10 text-white">
            <CardHeader><CardTitle>Document Submissions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.submissions?.length ? project.submissions.map((sub: any) => (
                  <div key={sub.id} className="flex justify-between items-center p-4 bg-[#0f1117] rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-indigo-400" />
                      <div>
                        <p className="font-medium">{sub.title}</p>
                        <p className="text-xs text-gray-400">Submitted on {new Date(sub.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-white/10" asChild>
                      <a href={sub.fileUrl} target="_blank" rel="noreferrer"><Download className="w-4 h-4 mr-2"/> Download</a>
                    </Button>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-8">No submissions uploaded yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluations" className="mt-0">
          <Card className="bg-[#1a1d27] border-white/10 text-white">
            <CardHeader><CardTitle>Panel Evaluations</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-lg">
                No evaluation records found for this project.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
