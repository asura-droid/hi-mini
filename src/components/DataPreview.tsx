import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataPreviewProps {
  data: any[];
  title: string;
}

export const DataPreview = ({ data, title }: DataPreviewProps) => {
  const [previewText, setPreviewText] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const formatted = formatDataAsText(data);
    setPreviewText(formatted);
    copyToClipboard(formatted);
  }, [data]);

  const formatDataAsText = (data: any[]): string => {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const lines: string[] = [];

    lines.push(headers.join('\t'));
    lines.push('-'.repeat(headers.join('\t').length));

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return value !== null && value !== undefined ? String(value) : '';
      });
      lines.push(values.join('\t'));
    });

    return lines.join('\n');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Structured data has been copied automatically",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleManualCopy = () => {
    copyToClipboard(previewText);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPreviewText(e.target.value);
  };

  return (
    <Card className="glass-card p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>

      <Textarea
        value={previewText}
        onChange={handleTextChange}
        className="min-h-[300px] font-mono text-sm whitespace-pre resize-y"
        placeholder="Data preview will appear here..."
      />

      <div className="text-sm text-muted-foreground">
        <p>Rows: {data.length}</p>
        <p>Characters: {previewText.length}</p>
        <p>Lines: {previewText.split('\n').length}</p>
      </div>
    </Card>
  );
};
