import { ProcessedLead } from '../entities/ProcessedLead';

export class LeadProcessedEvent {
  constructor(
    public readonly processedLead: ProcessedLead,
    public readonly timestamp: Date = new Date()
  ) {}
}

export class LeadsProcessingCompletedEvent {
  constructor(
    public readonly totalLeads: number,
    public readonly missingLeads: number,
    public readonly timestamp: Date = new Date()
  ) {}
}
