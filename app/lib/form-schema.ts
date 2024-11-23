import { z } from "zod";

export const UserFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Name must be at least 1 character." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().min(1, { message: "Phone must be at least 1 character." }),
  password: z
    .string()
    .min(1, { message: "Password must be at least 1 character." }),
  role: z.enum(["ADMIN", "USER"], {
    invalid_type_error: "Please select a user role.",
  }),
  status: z.enum(["Active", "Inactive"], {
    invalid_type_error: "Please select a user status.",
  }),
  type: z.enum(["Employee", "Partner"], {
    invalid_type_error: "Please select a user type.",
  }),
});

export type UserFormState = {
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    password?: string[];
    role?: string[];
    status?: string[];
    type?: string[];
  };
  message?: string | null;
};

//ItemFormSchema

export const ItemFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Name must be at least 1 character." }),
  price: z.coerce
    .number()
    .gt(0, { message: "Please enter a price greater than 0." }),
  type: z.enum(["ForSale", "ForPurchase"], {
    invalid_type_error: "Please select an item type.",
  }),
});

export type ItemFormState = {
  errors?: {
    name?: string[];
    price?: string[];
    type?: string[];
  };
  message?: string | null;
};

export const SalesFormSchema = z.object({
  id: z.string(),
  salesDate: z.string(),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter a price greater than 0." }),
  discount: z.coerce.number().optional(),
  total: z.coerce
    .number()
    .gt(0, { message: "Please enter a total greater than 0." }),
  type: z.enum(["Customer", "Partner"], {
    invalid_type_error: "Please select a sales type.",
  }),
  items: z.array(
    z.object({
      itemId: z.string(),
      quantity: z
        .number()
        .gt(0, { message: "Please enter a quantity greater than 0." }),
      price: z
        .number()
        .gt(0, { message: "Please enter a price greater than 0." }),
      total: z
        .number()
        .gt(0, { message: "Please enter a total greater than 0." }),
    })
  ),
});

export type SalesFormState = {
  errors?: {
    salesDate?: string[];
    amount?: string[];
    discount?: string[];
    total?: string[];
    type?: string[];
    items?: string[];
  };
  message?: string | null;
};
