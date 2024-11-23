"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";
import bcrypt from "bcrypt";
import { PrismaClient, Prisma } from "@prisma/client";
import {
  ItemFormSchema,
  ItemFormState,
  SalesFormSchema,
  SalesFormState,
  UserFormSchema,
  UserFormState,
} from "./form-schema";
import { SelectedItem } from "./definitions";

const prisma = new PrismaClient();

export const authenticate = async (
  prevState: string | undefined,
  formData: FormData
) => {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
};

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer.",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const CreateInvoie = FormSchema.omit({ id: true, date: true });

export const createInvoice = async (prevState: State, formData: FormData) => {
  const validatedFields = CreateInvoie.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  //If form validateion fails, return errors early. Otherwise, continue
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Faild to Create Invoice.",
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: "Database Error: Faild to Create Invoice",
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
};

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export const updateInvoice = async (
  id: string,
  prevState: State,
  formData: FormData
) => {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return {
      message: "Database Error: Faild to Update Invoice.",
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
};

export const deleteInvoice = async (id: number) => {
  // throw new Error("Faild to Delete Invoice");

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath("/dashboard/invoices");
    return { message: "Deleted Invoice" };
  } catch (error) {
    return { message: "Database Error: Faild to Delete Invoice" };
  }
};

const CreateUser = UserFormSchema.omit({ id: true });

export const createUser = async (
  prevState: UserFormState,
  formData: FormData
) => {
  const validatedFields = CreateUser.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    role: formData.get("role"),
    status: formData.get("status"),
    type: formData.get("type"),
  });

  //If form validateion fails, return errors early. Otherwise, continue
  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Faild to Create User.",
    };
  }

  // Prepare data for insertion into the database
  const { name, email, phone, password, role, status, type } =
    validatedFields.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        phone: phone,
        password: hashedPassword,
        role: role,
        status: status,
        type: type,
      },
    });
  } catch (error) {
    return {
      message: "Database Error: Faild to Create Invoice",
    };
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
};

// Use Zod to update the expected types
const UpdateUser = UserFormSchema.omit({ id: true }).extend({
  password: z.string().optional(),
});

export const updateUser = async (
  id: string,
  prevState: UserFormState,
  formData: FormData
) => {
  const validatedFields = UpdateUser.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password") || undefined,
    role: formData.get("role"),
    status: formData.get("status"),
    type: formData.get("type"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  // Prepare data for insertion into the database
  const { name, email, phone, password, role, status, type } =
    validatedFields.data;

  try {
    const updateData: any = {
      name,
      email,
      phone,
      role,
      status,
      type,
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updateUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: updateData,
    });
  } catch (error) {
    return {
      message: "Database Error: Faild to Update Invoice.",
    };
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
};
export const deleteUser = async (id: number) => {
  // throw new Error("Faild to Delete Invoice");

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath("/dashboard/invoices");
    return { message: "Deleted Invoice" };
  } catch (error) {
    return { message: "Database Error: Faild to Delete Invoice" };
  }
};

// Items Actions

const CreateItem = ItemFormSchema.omit({ id: true });

export const createItem = async (
  prevState: ItemFormState,
  formData: FormData
) => {
  const validatedFields = CreateItem.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    type: formData.get("type"),
  });

  //If form validateion fails, return errors early. Otherwise, continue
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Faild to Create Item.",
    };
  }

  // Prepare data for insertion into the database
  const { name, price, type } = validatedFields.data;

  try {
    const newItem = await prisma.items.create({
      data: {
        name: name,
        price: price,
        type: type,
      },
    });

    // return {
    //   message: "Item Created Successfully",
    // };
  } catch (error) {
    return {
      message: "Database Error: Faild to Create Item",
    };
  }

  revalidatePath("/dashboard/items");
  redirect("/dashboard/items");
};

// Use Zod to update the expected types
const UpdateItem = ItemFormSchema.omit({ id: true });

export const updateItem = async (
  id: string,
  prevState: ItemFormState,
  formData: FormData
) => {
  const validatedFields = UpdateItem.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    type: formData.get("type"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  // Prepare data for insertion into the database
  const { name, price, type } = validatedFields.data;

  try {
    const updateData: any = {
      name,
      price,
      type,
    };

    const updateItem = await prisma.items.update({
      where: {
        id: Number(id),
      },
      data: updateData,
    });
  } catch (error) {
    return {
      message: "Database Error: Faild to Update Item.",
    };
  }

  revalidatePath("/dashboard/items");
  redirect("/dashboard/items");
};

// Sales Actions

const CreateSale = SalesFormSchema.omit({ id: true }).extend({
  items: z.array(
    z.object({
      price: z.number(),
      total: z.number(),
      itemId: z.string(),
      quantity: z.number(),
    })
  ),
});

export const createSale = async (
  prevState: SalesFormState,
  formData: FormData
) => {
  const session = await auth();
  console.log("Session:", session); // Log session

  if (!session?.user?.id) {
    throw new Error("No user ID found in session");
  }

  const rawItems = formData.get("items");

  const validatedFields = CreateSale.safeParse({
    salesDate: formData.get("salesDate"),
    amount: formData.get("amount"),
    discount: formData.get("discount") || 0,
    total: formData.get("total"),
    status: "Completed",
    items: JSON.parse(formData.get("items") as string),
    type: formData.get("type"),
  });

  console.log("Validated fields:", validatedFields); // Log validation result

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Sale.",
    };
  }

  const { salesDate, amount, discount, total, items, type } =
    validatedFields.data;

  console.log("Processed data:", {
    salesDate,
    amount,
    discount,
    total,
    items,
    type,
  }); // Log processed data

  try {
    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sales.create({
        data: {
          salesDate: new Date(`${salesDate}T00:00:00Z`),
          amount: Number(amount),
          discount: Number(discount),
          total: Number(total),
          type: type,
          status: "Completed",
          addedBy: {
            connect: {
              id: Number(session!.user!.id),
            },
          },
        },
      });

      // create all sales items
      const salesItems = await tx.salesItems.createMany({
        data: items.map((item) => ({
          salesId: sale.id,
          productId: Number(item.itemId),
          price: Number(item.price),
          discount: 0,
          total: Number(item.total),
          quantity: Number(item.quantity),
        })),
      });

      return { sale, salesItems };
    });
  } catch (error) {
    console.error("Detailed Error:", error);
    return {
      message: "Database Error: Faild to Create Sale",
    };
  }

  revalidatePath("/dashboard/sales");
  redirect("/dashboard/sales");
};
