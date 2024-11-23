import Form from "@/app/ui/invoices/edit-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchUserById } from "@/app/lib/data";
import { notFound } from "next/navigation";
import EditUserForm from "@/app/ui/users/edit-form";

const Page = async ({ params }: { params: { id: string } }) => {
  const id = params.id;
  const [user] = await Promise.all([fetchUserById(id)]);

  if (!user) {
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
      <EditUserForm user={user} />
    </main>
  );
};

export default Page;
