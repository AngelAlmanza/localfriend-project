import { ServiceCategoriesService } from "@/src/service-categories/services/ServiceCategoriesService";
import { EntityStatus } from "@/src/shared/constants/EntityStatus";
import { createClient } from "@/src/shared/lib/supabase/server";
import { ServiceForm } from "@/src/workers-listings/components/services/ServiceForm";
import { ServicesService } from "@/src/workers-listings/services/ServicesService";
import { notFound } from "next/navigation";

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({
  params,
}: EditServicePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [serviceResult, categoriesResult] = await Promise.all([
    ServicesService.getServiceById(id, supabase),
    ServiceCategoriesService.getServiceCategories(supabase),
  ]);

  if (serviceResult.left) {
    notFound();
  }

  const service = serviceResult.right!;

  if (service.status === EntityStatus.HIDDEN_HARD) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
          <p className="font-medium">
            This service was deactivated by an administrator and cannot be
            edited.
          </p>
        </div>
      </div>
    );
  }

  if (categoriesResult.left) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive">
          <p className="font-medium">{categoriesResult.left.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6">
      <ServiceForm
        service={service}
        categories={categoriesResult.right ?? []}
      />
    </div>
  );
}
