import clsx from "clsx";
import { ClockIcon, CheckIcon } from "@heroicons/react/24/outline";

const UserStatus = ({ status }: { status: string }) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-1 text-xs",
        {
          "bg-gray-100 text-gray-500": status === "Inactive",
          "bg-green-500 text-white": status === "Active",
        }
      )}
    >
      {status === "Inactive" ? (
        <>
          Inactive
          <ClockIcon className="ml-1 w-4 text-gray-500" />
        </>
      ) : null}
      {status === "Active" ? (
        <>
          Active
          <CheckIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
    </span>
  );
};

export default UserStatus;
