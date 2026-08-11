import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FileText, FileSpreadsheet } from 'lucide-react';

export function FormatSelector({ format, setFormat }: { format: string; setFormat: (v: string) => void }) {
  return (
    <RadioGroup value={format} onValueChange={setFormat} className="flex gap-4">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="pdf" id="pdf" className="border-indigo-500 text-indigo-600" />
        <Label htmlFor="pdf" className="flex items-center gap-1 cursor-pointer">
          <FileText className="w-4 h-4 text-danger" /> PDF
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="excel" id="excel" className="border-indigo-500 text-indigo-600" />
        <Label htmlFor="excel" className="flex items-center gap-1 cursor-pointer">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Excel
        </Label>
      </div>
    </RadioGroup>
  );
}
