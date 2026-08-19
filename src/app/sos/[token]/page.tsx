import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function SosTokenRedirectPage({ params }: Props) {
  const { token } = await params;
  if (token) {
    redirect(`/badges/${encodeURIComponent(token)}`);
  }
  redirect("/sos");
}
