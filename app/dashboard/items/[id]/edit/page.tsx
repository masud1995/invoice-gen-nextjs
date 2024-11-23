import Form from "@/app/ui/invoices/edit-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchItemById } from "@/app/lib/data";
import { notFound } from "next/navigation";
import EditUserForm from "@/app/ui/users/edit-form";
import EditItemForm from "@/app/ui/items/edit-form";

const Page = async ({ params }: { params: { id: string } }) => {
  const id = params.id;
  const [item] = await Promise.all([fetchItemById(id)]);

  if (!item) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Users", href: "/dashboard/users" },
          {
            label: "Edit User",
            href: `/dashboard/users/${id}/edit`,
            active: true,
          },
        ]}
      />
      <EditItemForm item={item} />
    </main>
  );
};

export default Page;
