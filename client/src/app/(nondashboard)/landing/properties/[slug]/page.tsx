import { notFound } from "next/navigation";
import { PropertyDetailExperience } from "@/components/cinematic/PropertyDetailExperience";
import { propertyBySlug } from "@/three/data/properties";

type PropertyPageProps = {
  params: Promise<{ slug: string }>;
};

const PropertyPage = async ({ params }: PropertyPageProps) => {
  const { slug } = await params;
  const property = propertyBySlug[slug];

  if (!property) {
    notFound();
  }

  return <PropertyDetailExperience property={property} />;
};

export default PropertyPage;
