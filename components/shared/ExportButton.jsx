import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function ExportButton({ onClick, disabled, children }) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
    >
      <Download className="h-4 w-4 mr-2" />
      {children || 'Export'}
    </Button>
  );
}