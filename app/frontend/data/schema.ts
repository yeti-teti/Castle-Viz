import { z } from "zod"

export const transactionSchema = z.object({
  transaction_id: z.string(),
  transaction_date: z.string(),
  expense_status: z.string(),
  payment_status: z.string(),
  merchant: z.string(),
  category: z.string(),
  amount: z.number(),
  currency: z.string(),
  lastEdited: z.string(),
  continent: z.string(),
  country: z.string(),
})

export type Transaction = z.infer<typeof transactionSchema>

export const categories = [
  "Office Supplies",
  "Rent",
  "Utilities",
  "Employee Salaries",
  "Marketing",
  "Travel",
  "Training & Development",
  "Consulting Fees",
  "Professional Services",
  "Insurance",
  "Technology & Software",
  "Internet",
  "Phone",
  "Legal Fees",
  "Accounting Services",
  "Subscriptions & Memberships",
  "Maintenance & Repairs",
  "Shipping & Delivery",
  "Inventory",
  "Advertising",
]

export const merchants = [
  "Adobe",
  "AliExpress",
  "Amazon",
  "Amazon Advertising",
  "American Airlines",
  "Apple",
  "Best Buy",
  "Delta Air Lines",
  "DoorDash",
  "Facebook Ads",
  "FedEx",
  "Google Ads",
  "Google G Suite",
  "Linkedin",
  "Lyft",
  "Microsoft",
  "Starbucks",
  "The Home Depot",
  "Twilio",
  "Uber",
  "Uber Eats",
  "Uber HQ",
  "United Airlines",
  "USPS",
  "Walmart",
]

export const expense_statuses = [
  {
    value: "approved",
    label: "Paid",
    variant: "success",
    weight: 0.9,
  },
  {
    value: "pending",
    label: "Pending",
    variant: "neutral",
    weight: 0.05,
  },
]

export const payment_statuses = [
  {
    value: "processing",
    label: "Processing",
    weight: 0.01,
  },
  {
    value: "cleared",
    label: "Cleared",
    weight: 0.99,
  },
]

export const currencies = [
  {
    value: "usd",
    label: "USD",
    weight: 0.85,
  },
  {
    value: "eur",
    label: "EUR",
    weight: 0.15,
  },
]
