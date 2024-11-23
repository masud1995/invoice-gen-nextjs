"use client";

import { CustomerField, ItemField, SelectedItem } from "@/app/lib/definitions";
import Link from "next/link";
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Button from "../button";
import { createSale } from "@/app/lib/actions";
import { useActionState, useEffect, useState } from "react";
import { SalesFormState } from "@/app/lib/form-schema";

const SalesForm = ({ items }: { items: ItemField[] }) => {
  const initialState: SalesFormState = { errors: {}, message: null };

  const [state, formAction] = useActionState(createSale, initialState);

  const [subTotal, setSubTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [itemTotals, setItemTotals] = useState<{ [key: string]: number }>({});
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const updateSelectedItems = (itemId: string, qty: number, prc: number) => {
    const total = qty * prc;

    setSelectedItems((prev) => {
      if (qty <= 0) {
        return prev.filter((item) => item.itemId !== itemId);
      }

      const existingItem = prev.find((item) => item.itemId === itemId);
      if (existingItem) {
        return prev.map((item) =>
          item.itemId === itemId ? { ...item, quantity: qty, total } : item
        );
      }
      return [...prev, { itemId, quantity: qty, price: prc, total }];
    });
    // Update totals
    setItemTotals((prev) => ({
      ...prev,
      [itemId]: qty > 0 ? total : 0,
    }));
  };

  // Calculate subtotal and grand total whenever individual totals or discount changes
  useEffect(() => {
    const total = Object.values(itemTotals).reduce(
      (sum, curr) => sum + curr,
      0
    );
    setSubTotal(total);
    setGrandTotal(total - discount);
  }, [itemTotals, discount]);

  const handleSubmit = async (formData: FormData) => {
    // Add selected items to form data
    formData.append("items", JSON.stringify(selectedItems));
    formAction.bind(null, formData)();
  };

  return (
    <form action={handleSubmit}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Sales Date */}
        <div className="mb-4">
          <label htmlFor="salesDate" className="mb-2 block text-sm font-medium">
            Sales Date
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="salesDate"
                name="salesDate"
                type="date"
                placeholder="Enter Sales Date"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="salesDate-error"
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div id="salesDate-error" aria-live="polite" aria-atomic="true">
            {state.errors?.salesDate &&
              state.errors?.salesDate.map((error: string) => (
                <p className="mt-2 tex-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Sales Type */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">Sales Type</legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="customer"
                  name="type"
                  type="radio"
                  value="Customer"
                  defaultChecked={true}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="customer"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Customer
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="partner"
                  name="type"
                  type="radio"
                  value="Partner"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="partner"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Partner
                </label>
              </div>
            </div>
          </div>
          {state.errors?.type &&
            state.errors?.type.map((error) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </fieldset>

        <fieldset className="mt-6 mb-6">
          <legend className="mb-2 block text-sm font-medium">Items</legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <table className="w-full md:w-1/2">
              <thead className="rounded-lg text-left text-sm font-normal bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 font-medium sm:pl-6 w-5">
                    Item
                  </th>
                  <th scope="col" className="px-4 py-2 font-medium sm:pl-6 w-1">
                    Quantity
                  </th>
                  <th scope="col" className="px-4 py-2 font-medium sm:pl-6 w-1">
                    Price
                  </th>
                  <th scope="col" className="px-4 py-2 font-medium sm:pl-6 w-1">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const [quantity, setQuantity] = useState(0);
                  const [price, setPrice] = useState(item.price);

                  return (
                    <tr
                      key={item.id}
                      className="even:border-b odd:border-b even:border-slate-50 even:boder"
                    >
                      <td className="px-4 py-2 sm:pl-6">
                        {item.name}
                        <input type="hidden" name="itemId" value={item.id} />
                      </td>
                      <td className="px-4 py-2 sm:pl-6">
                        <input
                          type="number"
                          name="quantity"
                          onChange={(e) => {
                            const qty = Number(e.target.value);
                            setQuantity(qty);
                            updateSelectedItems(item.id.toString(), qty, price);
                          }}
                          className="peer block w-full rounded-md border border-gray-200 py-2 pl-2 text-sm outline-2 placeholder:text-gray-500"
                        />
                      </td>
                      <td className="px-4 py-2 sm:pl-6">
                        <input
                          type="number"
                          name="price"
                          defaultValue={item.price}
                          onChange={(e) => {
                            const prc = Number(e.target.value);
                            setPrice(prc);
                            updateSelectedItems(
                              item.id.toString(),
                              quantity,
                              prc
                            );
                          }}
                          className="peer block w-full rounded-md border border-gray-200 py-2 pl-2 text-sm outline-2 placeholder:text-gray-500"
                        />
                      </td>
                      <td className="px-4 py-2 sm:pl-6">
                        <input
                          type="number"
                          name="itemTotal"
                          value={itemTotals[item.id] || 0}
                          readOnly
                          className="peer block w-full rounded-md border border-gray-200 py-2 pl-2 text-sm outline-2 placeholder:text-gray-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </fieldset>

        {/* Sales Sub Total */}
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Sub Total
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="amount"
                name="amount"
                type="number"
                value={subTotal}
                readOnly
                placeholder="Enter Sales Sub Total"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="amount-error"
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div id="amout-error" aria-live="polite" aria-atomic="true">
            {state.errors?.amount &&
              state.errors?.amount.map((error: string) => (
                <p className="mt-2 tex-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Sales Discount */}
        <div className="mb-4">
          <label htmlFor="discount" className="mb-2 block text-sm font-medium">
            Discount
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="discount"
                name="discount"
                type="number"
                step="1"
                onChange={(e) => {
                  const disc = Number(e.target.value);
                  setDiscount(disc);
                }}
                placeholder="Enter Sales Discount"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="discount-error"
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div id="discount-error" aria-live="polite" aria-atomic="true">
            {state.errors?.discount &&
              state.errors?.discount.map((error: string) => (
                <p className="mt-2 tex-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Sales Total */}
        <div className="mb-4">
          <label htmlFor="total" className="mb-2 block text-sm font-medium">
            Grand Total
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="total"
                name="total"
                type="number"
                value={grandTotal}
                readOnly
                placeholder="Enter Sales Total"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="total-error"
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div id="total-error" aria-live="polite" aria-atomic="true">
            {state.errors?.total &&
              state.errors?.total.map((error: string) => (
                <p className="mt-2 tex-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {state?.message && (
          <p className="mt-2 text-sm text-red-500">{state?.message}</p>
        )}
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create Sale</Button>
      </div>
    </form>
  );
};

export default SalesForm;
