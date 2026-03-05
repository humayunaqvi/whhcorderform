export interface RotationPeriod {
  id: string;
  label: string;
  start: string;
  end: string;
}

export interface RotationStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  registeredAt: string;
  month: string | null;
  periods: RotationPeriod[] | null;
  duration: number | null;
}

export interface AvailableMonth {
  key: string;
  label: string;
}
