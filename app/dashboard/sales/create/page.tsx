import Form from "@/app/ui/invoices/create-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers, fetchItems } from "@/app/lib/data";
import SalesForm from "@/app/ui/sales/create-form";

const Page = async () => {
  const items = await fetchItems();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Sales", href: "/dashboard/sales" },
          {
            label: "Create Sale",
            href: "/dashboard/sales/create",
            active: true,
          },
        ]}
      />
      <SalesForm items={items} />
    </main>
  );
};

export default Page;
