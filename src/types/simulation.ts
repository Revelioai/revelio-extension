export type Explanation = {
  images: string[];
  title: string;
  purpose: string;
  explanation: string;
  transfers: { token: string; from: string; to: string; amount: string }[];
};
