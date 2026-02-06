import Navbar from "@/components/Navbar";

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-6">{children}</main>
    </>
  );
}
