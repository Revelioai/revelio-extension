export type SimulationExplanation = {
  title: string;
  purpose: string;
  explanation: string;
  transfers: {
    token: string;
    amount: string; // decimal number string (or hex ??)
    from: string;
    to: string;
  }[];
};
