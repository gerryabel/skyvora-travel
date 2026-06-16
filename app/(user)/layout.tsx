// app/(user)/layout.tsx
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
