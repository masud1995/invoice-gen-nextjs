import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers } from "@/app/lib/data";
import UserForm from "@/app/ui/users/create-form";

const Page = async () => {
  const customers = await fetchCustomers();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Users", href: "/dashboard/users" },
          {
            label: "Add New User",
            href: "/dashboard/user/create",
            active: true,
          },
        ]}
      />
      <UserForm />
    </main>
  );
};

export default Page;
