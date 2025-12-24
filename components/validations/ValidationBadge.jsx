import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

export default function ValidationBadge({ severity }) {
  const config = {
    error: {
      variant: 'destructive',
      icon: AlertCircle,
      label: 'Error'
    },
    warning: {
      variant: 'warning',
      icon: AlertTriangle,
      label: 'Warning'
    },
    info: {
      variant: 'secondary',
      icon: Info,
      label: 'Info'
    }
  };

  const { variant, icon: Icon, label } = config[severity] || config.info;

  return (
    <Badge variant={variant} className="flex items-center gap-1 w-fit">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}