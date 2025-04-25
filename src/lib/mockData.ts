interface Violation {
  id: string;
  text: string;
  start: number;
  end: number;
  length: number;
  type: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

interface Suggestions {
  [key: string]: string[];
}

const originalText = "Our proprietary investment algorithm is designed by top-tier analysts and uses cutting-edge machine learning. It guarantees consistent returns of up to 20% annually. We've helped hundreds of investors beat the market and build generational wealth. Contact us today to learn how we can make you our next success story.";

export const violations: Violation[] = [
  {
    id: "v1",
    text: "guarantees consistent returns of up to 20% annually",
    start: originalText.indexOf("guarantees consistent"),
    end: originalText.indexOf("annually.") + 8,
    length: "guarantees consistent returns of up to 20% annually".length,
    type: "Guaranteed Returns",
    message: "Avoid implying guaranteed or predictable returns.",
    severity: "high"
  },
  {
    id: "v2",
    text: "beat the market and build generational wealth",
    start: originalText.indexOf("beat the market"),
    end: originalText.indexOf("generational wealth.") + 19,
    length: "beat the market and build generational wealth".length,
    type: "Promissory Language",
    message: "Avoid promising outperformance or guaranteed success.",
    severity: "medium"
  },
  {
    id: "v3",
    text: "make you our next success story",
    start: originalText.indexOf("make you our next"),
    end: originalText.indexOf("success story.") + 13,
    length: "make you our next success story".length,
    type: "Testimonials",
    message: "Avoid vague success testimonials without disclosures.",
    severity: "low"
  }
] as const;

export const suggestions: Suggestions = {
  "v1": [
    "has historically delivered returns of up to 20% annually, though past performance is not indicative of future results",
    "aims to achieve strong annual returns, with some investors seeing gains as high as 20% in certain years",
    "leverages advanced modeling to pursue returns that, in past performance, have reached up to 20% annually"
  ],
  "v2": [
    "strive for long-term growth and financial resilience",
    "help investors pursue their financial goals with confidence",
    "support informed investing strategies aimed at building lasting value"
  ],
  "v3": [
    "discuss how our approach might align with your financial goals",
    "explore whether our strategy is a good fit for your needs",
    "see how our methodology could support your investment journey"
  ]
}; 