"use server";

import { z } from "zod";

export const createInvoice = (formData: FormData) => {
  const rawFormData = {
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  };

  //   const rawFormData = Object.fromEntries(formData.entries());

  console.log(rawFormData);
};
