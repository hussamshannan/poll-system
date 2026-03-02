import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VoterInfoFormProps {
  name: string;
  phone: string;
  onChange: (field: "name" | "phone", value: string) => void;
  errors?: { name?: string; phone?: string };
  disabled?: boolean;
}

export function VoterInfoForm({
  name,
  phone,
  onChange,
  errors,
  disabled,
}: VoterInfoFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="voterName">Your Name</Label>
        <Input
          id="voterName"
          value={name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Enter your full name"
          disabled={disabled}
        />
        {errors?.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="voterPhone">Phone Number</Label>
        <Input
          id="voterPhone"
          type="tel"
          value={phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="+966501234567"
          dir="ltr"
          disabled={disabled}
        />
        {errors?.phone && (
          <p className="text-sm text-destructive">{errors.phone}</p>
        )}
      </div>
    </div>
  );
}
