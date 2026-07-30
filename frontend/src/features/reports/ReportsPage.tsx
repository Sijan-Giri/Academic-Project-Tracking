import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Download, FileText, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import { downloadReport } from '@/api/reports.api';

export default function ReportsPage() {
  const [format, setFormat] = useState('pdf');

  const handleDownload = async (reportType: string, params: any) => {
    try {
      await downloadReport(reportType, { ...params, format });
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  return (
    <div className="space-y-6 text-white min-h-screen p-6 bg-[#0f1117] max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600">
          Reports & Exports
        </h1>
        <p className="text-slate-400 mt-2">Generate and download reports for accreditation and compliance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl text-indigo-300">Department Summary</CardTitle>
            <CardDescription className="text-slate-400">Overview of project status, completion rate, and guide allocation per department.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select defaultValue="Fall2026">
                  <SelectTrigger className="bg-black/20 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1e1e2e] border-white/10"><SelectItem value="Fall2026">Fall 2026</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select defaultValue="ALL">
                  <SelectTrigger className="bg-black/20 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1e1e2e] border-white/10"><SelectItem value="ALL">All Departments</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="pt-4 mt-auto">
              <FormatSelector format={format} setFormat={setFormat} />
              <Button onClick={() => handleDownload('dept-summary', {})} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
                <Download className="w-4 h-4 mr-2" /> Download Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl text-indigo-300">Project Status Report</CardTitle>
            <CardDescription className="text-slate-400">Detailed list of all projects with their current status and progress.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select defaultValue="Fall2026">
                  <SelectTrigger className="bg-black/20 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1e1e2e] border-white/10"><SelectItem value="Fall2026">Fall 2026</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue="ALL">
                  <SelectTrigger className="bg-black/20 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1e1e2e] border-white/10"><SelectItem value="ALL">All Statuses</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="pt-4 mt-auto">
              <FormatSelector format={format} setFormat={setFormat} />
              <Button onClick={() => handleDownload('project-status', {})} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
                <Download className="w-4 h-4 mr-2" /> Download Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="bg-red-500/5 backdrop-blur-md border-red-500/20 flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <CardTitle className="text-xl text-red-400">Defaulters Report</CardTitle>
            </div>
            <CardDescription className="text-slate-400">List of projects with overdue milestones for immediate action.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select defaultValue="Fall2026">
                  <SelectTrigger className="bg-black/20 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1e1e2e] border-white/10"><SelectItem value="Fall2026">Fall 2026</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select defaultValue="ALL">
                  <SelectTrigger className="bg-black/20 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1e1e2e] border-white/10"><SelectItem value="ALL">All Departments</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="pt-4 mt-auto">
              <Button onClick={() => handleDownload('defaulters', { format: 'excel' })} className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white">
                <Download className="w-4 h-4 mr-2" /> Download Excel List
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl text-indigo-300">Evaluation Marks</CardTitle>
            <CardDescription className="text-slate-400">Marks per project per review stage with full criterion breakdown.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select defaultValue="Fall2026">
                  <SelectTrigger className="bg-black/20 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1e1e2e] border-white/10"><SelectItem value="Fall2026">Fall 2026</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Review Stage</Label>
                <Select defaultValue="ALL">
                  <SelectTrigger className="bg-black/20 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1e1e2e] border-white/10"><SelectItem value="ALL">All Stages</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="pt-4 mt-auto">
              <FormatSelector format={format} setFormat={setFormat} />
              <Button onClick={() => handleDownload('evaluations', {})} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
                <Download className="w-4 h-4 mr-2" /> Download Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 5 */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl text-slate-300">Audit Log Export</CardTitle>
            <CardDescription className="text-slate-400">Full system activity log for compliance and auditing purposes.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-end gap-4">
            <div className="space-y-2 flex-1">
              <Label>Date Range</Label>
              <Select defaultValue="LAST_30">
                <SelectTrigger className="bg-black/20 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1e1e2e] border-white/10">
                  <SelectItem value="LAST_7">Last 7 Days</SelectItem>
                  <SelectItem value="LAST_30">Last 30 Days</SelectItem>
                  <SelectItem value="THIS_SEMESTER">This Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleDownload('audit-log', { format: 'excel' })} className="w-full md:w-auto bg-slate-700 hover:bg-slate-600">
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Export to CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FormatSelector({ format, setFormat }: { format: string, setFormat: (v: string) => void }) {
  return (
    <RadioGroup value={format} onValueChange={setFormat} className="flex gap-4">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="pdf" id="pdf" className="border-indigo-400 text-indigo-500" />
        <Label htmlFor="pdf" className="flex items-center gap-1 cursor-pointer"><FileText className="w-4 h-4 text-red-400" /> PDF</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="excel" id="excel" className="border-indigo-400 text-indigo-500" />
        <Label htmlFor="excel" className="flex items-center gap-1 cursor-pointer"><FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Excel</Label>
      </div>
    </RadioGroup>
  );
}
