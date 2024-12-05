export interface Course {
  name: string;
  link: string;
  duration: string;
}

export interface Connection {
  title: string;
  company: string;
  reason: string;
}

export interface CommunityEvent {
  name: string;
  type: string;
  frequency: string;
}

export interface PlanData {
  weekly_hours: number;
  courses: Course[];
  connections: Connection[];
  events: CommunityEvent[];
}
export interface PlansResponse {
  plan_id: number;
  data: {
    achievable: PlanData;
    negotiated: PlanData;
    ambitious: PlanData;
  };
}

export interface NegotiatorResponse {
  response: string;
  completed?: boolean;
  plans?: PlansResponse;
}