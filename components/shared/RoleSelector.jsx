import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ROLES = [
  { value: 'admin', label: 'Admin', description: 'Full access to all features' },
  { value: 'manager', label: 'Manager', description: 'Create, read, update (no delete)' },
  { value: 'analyst', label: 'Analyst', description: 'Read-only with export' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

export default function RoleSelector({ value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((role) => (
          <SelectItem key={role.value} value={role.value}>
            <div className="flex flex-col">
              <span className="font-medium">{role.label}</span>
              <span className="text-xs text-gray-500">{role.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}