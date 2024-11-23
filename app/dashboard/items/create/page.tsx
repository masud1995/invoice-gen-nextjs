import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import ItemForm from "@/app/ui/items/create-form";

const Page = async () => {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Items", href: "/dashboard/items" },
          {
            label: "Add new item",
            href: "/dashboard/items/create",
            active: true,
          },
        ]}
      />
      <ItemForm />
    </main>
  );
};

export default Page;
