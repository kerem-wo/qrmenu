import { redirect } from "next/navigation";

export default function BoltAddProductRedirect() {
  redirect("/admin/products/new");
}

