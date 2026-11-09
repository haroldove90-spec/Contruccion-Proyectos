import { ControlTipo1Store } from './controlTipo1';
import { ControlTipo4DStore } from './controlTipo4D';

export type ControlType = 'tipo1' | 'tipo3m';

export interface ControlledProject {
  id: string;
  code: string; // ej. P0-00, P0-01, P0-02
  name: string; // Nombre de la obra
  client: string; // Cliente
  billingCompany: string; // S.A. Facturadora
  controlType: ControlType; // 'tipo1' (6 submódulos) o 'tipo3m' (3 submódulos)
  status: 'en_captura' | 'conciliado' | 'finalizado';
  initialBudget: number;
  startDate: string;
  notes?: string;
}

export interface MultiProjectControlStore {
  projects: ControlledProject[];
  activeProjectId: string;
  tipo1DataByProject: Record<string, ControlTipo1Store>;
  tipo3mDataByProject: Record<string, ControlTipo4DStore>;
}
