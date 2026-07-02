import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin — SegReClaim",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#F8F4EF]">
        <AdminSidebar />
        <div className="lg:pl-64 pt-14 lg:pt-0">
          <main className="p-4 md:p-8 max-w-6xl mx-auto">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
